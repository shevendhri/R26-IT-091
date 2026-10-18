import json
import csv
from pathlib import Path

from .config import (
    CSV_RESULTS,
    TRACE_JSON,
    VERIFICATION_REPORT_MD,
    HYBRID_WEIGHT_ENGINEERING,
    HYBRID_WEIGHT_ML,
)

def _load_csv_rows():
    rows = []
    with open(CSV_RESULTS, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows

def _load_trace():
    with open(TRACE_JSON, 'r', encoding='utf-8') as f:
        return json.load(f)

def _write_report(content: str):
    Path(VERIFICATION_REPORT_MD).write_text(content, encoding='utf-8')

def _check_engineering_score(row):
    eng_score = float(row.get('engineering_score', 0))
    try:
        breakdown = json.loads(row.get('criterion_breakdown', '{}'))
    except Exception:
        breakdown = {}
    total = sum(float(v) for v in breakdown.values()) if isinstance(breakdown, dict) else 0.0
    return abs(eng_score - total) < 1e-3, f"Engineering score {eng_score} vs sum(breakdown) {total}"

def _check_hybrid_weighting(trace_entry):
    response = trace_entry.get('response', {})
    eng = float(response.get('engineering_score', 0))
    ml = float(response.get('ml_score', 0))
    hybrid = float(response.get('hybrid_score', 0))
    expected = HYBRID_WEIGHT_ENGINEERING * eng + HYBRID_WEIGHT_ML * ml
    return abs(hybrid - expected) < 1e-3, f"Hybrid {hybrid} vs expected {expected} (weights {HYBRID_WEIGHT_ENGINEERING}, {HYBRID_WEIGHT_ML})"

def _check_confidence_bounds(row):
    keys = [
        'engineering_confidence',
        'prediction_confidence',
        'climate_confidence',
    ]
    issues = []
    ok = True
    for k in keys:
        val = float(row.get(k, 0))
        if not (0 <= val <= 100):
            ok = False
            issues.append(f"{k}={val} out of range 0-100")
    return ok, '; '.join(issues)

def _check_no_null_fields(row):
    required = [
        'engineering_score', 'ml_score', 'hybrid_score',
        'engineering_confidence', 'prediction_confidence', 'climate_confidence',
    ]
    missing = [k for k in required if row.get(k) in (None, '', [])]
    return len(missing) == 0, f"Missing fields: {', '.join(missing)}" if missing else ''

def _check_audit_log(trace_entry):
    response = trace_entry.get('response', {})
    audit = response.get('audit', [])
    return isinstance(audit, list), f"Audit field type: {type(audit)}"

def _check_trace_vs_csv(trace, csv_rows):
    csv_by_id = {int(r['scenario_id']): r for r in csv_rows}
    mismatches = []
    for entry in trace:
        sid = entry.get('scenario_id')
        if sid not in csv_by_id:
            mismatches.append(f"Scenario {sid} missing in CSV")
            continue
        csv_row = csv_by_id[sid]
        for key in ['engineering_score', 'ml_score', 'hybrid_score']:
            csv_val = float(csv_row.get(key, 0))
            resp_val = float(entry.get('response', {}).get(key, 0))
            if abs(csv_val - resp_val) > 1e-3:
                mismatches.append(f"Scenario {sid} {key} CSV={csv_val} API={resp_val}")
    return len(mismatches) == 0, '; '.join(mismatches)

def _check_duplicate_ids(trace):
    ids = [e.get('scenario_id') for e in trace]
    dup = set([i for i in ids if ids.count(i) > 1])
    return len(dup) == 0, f"Duplicate IDs: {', '.join(map(str, dup))}" if dup else ''

def run_verification():
    rows = _load_csv_rows()
    trace = _load_trace()
    total = len(rows)
    passed = 0
    details = []
    for row in rows:
        sid = row.get('scenario_id')
        checks = []
        ok, msg = _check_engineering_score(row)
        checks.append((ok, f"EngScoreCheck: {msg}"))
        ok, msg = _check_confidence_bounds(row)
        checks.append((ok, f"ConfidenceBounds: {msg}"))
        ok, msg = _check_no_null_fields(row)
        checks.append((ok, f"NullFields: {msg}"))
        trace_entry = next((e for e in trace if e.get('scenario_id') == int(sid)), None)
        if trace_entry:
            ok, msg = _check_hybrid_weighting(trace_entry)
            checks.append((ok, f"HybridWeight: {msg}"))
            ok, msg = _check_audit_log(trace_entry)
            checks.append((ok, f"AuditLog: {msg}"))
        else:
            checks.append((False, f"Missing trace entry for scenario {sid}"))
        scenario_pass = all(c[0] for c in checks)
        if scenario_pass:
            passed += 1
        else:
            details.append({
                'scenario_id': sid,
                'issues': [c[1] for c in checks if not c[0]]
            })
    ok, msg = _check_trace_vs_csv(trace, rows)
    cross_pass = ok
    ok_dup, msg_dup = _check_duplicate_ids(trace)
    report_lines = [
        "# Verification Report",
        f"Total scenarios: {total}",
        f"Passed scenarios: {passed}",
        f"Pass rate: {passed/total*100:.2f}%",
        "---",
        "| Rule | Passed | Total | Rate |",
        "|------|-------:|------:|-----:|",
    ]
    def add_rule(name, ok_count, total_count):
        rate = ok_count/total_count*100 if total_count else 0
        report_lines.append(f"| {name} | {ok_count} | {total_count} | {rate:.1f}% |")

    eng_pass = sum(1 for row in rows if _check_engineering_score(row)[0])
    add_rule("Engineering Score", eng_pass, total)
    hybrid_pass = sum(1 for row in rows if (e := next((te for te in trace if te.get('scenario_id') == int(row.get('scenario_id'))), None)) and _check_hybrid_weighting(e)[0])
    add_rule("Hybrid Formula", hybrid_pass, total)
    conf_pass = sum(1 for row in rows if _check_confidence_bounds(row)[0])
    add_rule("Confidence Bounds", conf_pass, total)
    null_pass = sum(1 for row in rows if _check_no_null_fields(row)[0])
    add_rule("Missing Fields", null_pass, total)
    dup_ok = 1 if ok_dup else 0
    add_rule("Duplicate IDs", dup_ok, 1)
    audit_ok = sum(1 for entry in trace if _check_audit_log(entry)[0])
    add_rule("Audit Log", audit_ok, len(trace))
    cross_ok = 1 if cross_pass else 0
    add_rule("Trace ↔ CSV", cross_ok, 1)
    api_fields = ['engineering_score','ml_score','hybrid_score','engineering_confidence','prediction_confidence','climate_confidence','criterion_breakdown','constraints_passed','selected_material']
    api_ok = all(all(field in row for field in api_fields) for row in rows)
    add_rule("API ↔ CSV fields", int(api_ok), 1)

    if details:
        report_lines.append("\n## Scenario Issues")
        for d in details:
            report_lines.append(f"- Scenario {d['scenario_id']}: ")
            for issue in d['issues']:
                report_lines.append(f"  - {issue}")
    else:
        report_lines.append("All scenarios passed all checks.")
    _write_report('\n'.join(report_lines))
    print(f"[verification] Report written to {VERIFICATION_REPORT_MD}")

if __name__ == '__main__':
    run_verification()
