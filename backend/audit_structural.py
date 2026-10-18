"""Audit: Trace structural_system through the entire recommendation pipeline."""
import sqlite3
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 1. Check what structural system data exists in the DB
base_dir = os.path.dirname(os.path.abspath(__file__))
conn = sqlite3.connect(os.path.join(base_dir, "data", "materials.db"))
conn.row_factory = sqlite3.Row

print("=" * 80)
print("1. DATABASE SCHEMA: Style_Compatibility column values")
print("=" * 80)
rows = conn.execute("SELECT DISTINCT Style_Compatibility FROM materials").fetchall()
for r in rows:
    print(f"  {r['Style_Compatibility']}")

print("\n" + "=" * 80)
print("2. Does any material have 'Timber' or 'Steel' or 'RC' in Style_Compatibility?")
print("=" * 80)
for keyword in ["timber", "steel", "rc", "concrete", "reinforced"]:
    count = conn.execute(
        f"SELECT COUNT(*) as c FROM materials WHERE LOWER(Style_Compatibility) LIKE '%{keyword}%'"
    ).fetchone()["c"]
    print(f"  '{keyword}' found in Style_Compatibility: {count} materials")

print("\n" + "=" * 80)
print("3. STRUCTURAL category materials")
print("=" * 80)
struct_mats = conn.execute(
    "SELECT Name, Category, Style_Compatibility FROM materials WHERE Category = 'Structural'"
).fetchall()
if struct_mats:
    for m in struct_mats:
        print(f"  [{m['Category']}] {m['Name']}")
        print(f"    Style_Compatibility: {m['Style_Compatibility']}")
else:
    print("  No materials with Category = 'Structural'")

print("\n" + "=" * 80)
print("4. ALL CATEGORIES in the DB")
print("=" * 80)
cats = conn.execute("SELECT DISTINCT Category FROM materials").fetchall()
for c in cats:
    count = conn.execute(f"SELECT COUNT(*) as cnt FROM materials WHERE Category = ?", (c['Category'],)).fetchone()['cnt']
    print(f"  {c['Category']}: {count} materials")

print("\n" + "=" * 80)
print("5. FOUNDATION materials (structural-relevant)")
print("=" * 80)
found_mats = conn.execute(
    "SELECT Name, Category, Style_Compatibility FROM materials WHERE Category IN ('Foundation', 'Structural', 'Concrete')"
).fetchall()
for m in found_mats:
    print(f"  [{m['Category']}] {m['Name']}")
    print(f"    Style_Compatibility: {m['Style_Compatibility']}")

print("\n" + "=" * 80)
print("6. Check if structural_system is passed to constraint_engine")
print("=" * 80)
with open(os.path.join(base_dir, "engines", "constraint_engine.py"), "r") as f:
    content = f.read()
    if "structural_system" in content:
        lines = content.split("\n")
        for i, line in enumerate(lines):
            if "structural_system" in line.lower():
                print(f"  Line {i+1}: {line.strip()}")
    else:
        print("  'structural_system' NOT FOUND in constraint_engine.py")

print("\n" + "=" * 80)
print("7. Check if structural_system is passed from mcdm_engine to constraint_engine")
print("=" * 80)
with open(os.path.join(base_dir, "mcdm_engine.py"), "r") as f:
    content = f.read()
    lines = content.split("\n")
    for i, line in enumerate(lines):
        if "evaluate_constraints" in line or "structural_system" in line.lower() or "blueprint" in line.lower():
            print(f"  Line {i+1}: {line.strip()}")

print("\n" + "=" * 80)
print("8. Check recommendation_engine: how materials list is built")
print("=" * 80)
with open(os.path.join(base_dir, "recommendation_engine.py"), "r") as f:
    content = f.read()
    lines = content.split("\n")
    for i, line in enumerate(lines):
        if any(kw in line.lower() for kw in ["filter_by_structural", "load_materials", "get_materials", "fetch_material", "self.materials", "materials ="]):
            if not line.strip().startswith("#") and not line.strip().startswith('"'):
                print(f"  Line {i+1}: {line.strip()}")

conn.close()
