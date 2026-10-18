import csv, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import get_all_materials, format_material

csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "GreenConstructAI_ML_Dataset.csv")

with open(csv_path, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print("Total CSV rows:", len(rows))
unique_names = sorted(set(r['material_name'] for r in rows))
print(f"Unique material names in CSV ({len(unique_names)}):")
for n in unique_names:
    print(f"  - {n}")

# CSV category distribution
from collections import Counter
cat_counts = Counter(r['category'] for r in rows)
print("\nCSV category distribution:")
for cat, cnt in sorted(cat_counts.items()):
    print(f"  {cat}: {cnt} rows")

print()
print("=== DB Materials ===")
all_rows = get_all_materials()
mats = [format_material(r) for r in all_rows]
print(f"Total DB materials: {len(mats)}")
for m in mats:
    mid = m["Material_ID"]
    cat = m["Category"]
    name = m["Name"]
    print(f"  ID={mid}  Cat={cat:20s}  Name={name}")

print()
print("=== Output Group Mapping ===")
OUTPUT_GROUPS = {
    0: ["Foundation", "Concrete", "Structural"],
    1: ["Walling", "Finishing"],
    2: ["Roofing"],
    3: ["Windows", "Doors"],
    4: ["Flooring", "Ceiling", "Waterproofing"],
}
for gidx, cats in OUTPUT_GROUPS.items():
    ids = [m["Material_ID"] for m in mats if m["Category"] in cats]
    print(f"  Group {gidx} ({cats}): IDs = {sorted(ids)}")
