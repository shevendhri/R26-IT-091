import sqlite3

DB = r"C:\Users\ASUS\Desktop\Material specification\backend\data\materials.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()

# Get all material IDs
cur.execute("SELECT Material_ID, Name FROM materials")
mats = cur.fetchall()
print(f"Materials: {len(mats)} entries, IDs range from {mats[0][0]} to {mats[-1][0]}")

# Get building compatibility
cur.execute("SELECT DISTINCT material_id FROM MaterialBuildingCompatibility")
compat_ids = set(r[0] for r in cur.fetchall())
mat_ids = set(r[0] for r in mats)

missing_compat = mat_ids - compat_ids
extra_compat = compat_ids - mat_ids
print(f"\nMaterials WITHOUT building compatibility: {len(missing_compat)}")
if missing_compat:
    for mid in sorted(missing_compat):
        cur.execute("SELECT Name FROM materials WHERE Material_ID = ?", (mid,))
        name = cur.fetchone()
        print(f"  ID={mid}: {name[0] if name else 'UNKNOWN'}")

# Get climate compatibility
cur.execute("SELECT DISTINCT material_id FROM MaterialClimateCompatibility")
climate_ids = set(r[0] for r in cur.fetchall())
missing_climate = mat_ids - climate_ids
print(f"\nMaterials WITHOUT climate compatibility: {len(missing_climate)}")
if missing_climate:
    for mid in sorted(missing_climate):
        cur.execute("SELECT Name FROM materials WHERE Material_ID = ?", (mid,))
        name = cur.fetchone()
        print(f"  ID={mid}: {name[0] if name else 'UNKNOWN'}")

# Check what building types exist
cur.execute("SELECT DISTINCT building_type FROM MaterialBuildingCompatibility ORDER BY building_type")
print(f"\nBuilding types in DB: {[r[0] for r in cur.fetchall()]}")

# Check what climate zones exist
cur.execute("SELECT DISTINCT climate_zone FROM MaterialClimateCompatibility ORDER BY climate_zone")
print(f"\nClimate zones in DB: {[r[0] for r in cur.fetchall()]}")

# Sample: what's compatible with "healthcare" or "hospital"?
cur.execute("SELECT * FROM MaterialBuildingCompatibility WHERE building_type LIKE '%hospital%' OR building_type LIKE '%healthcare%'")
print(f"\nHealthcare/Hospital compat entries: {cur.fetchall()}")

# Sample: what climate zones match "moderate coastal humid"?
cur.execute("SELECT * FROM MaterialClimateCompatibility WHERE climate_zone LIKE '%coastal%' LIMIT 10")
print(f"\nCoastal climate compat entries: {cur.fetchall()}")

# Check other new tables
for t in ['StructuralSystemRequirements', 'BuildingRequirements', 'EngineeringCriteriaWeights']:
    cur.execute(f"SELECT COUNT(*) FROM {t}")
    count = cur.fetchone()[0]
    cur.execute(f"PRAGMA table_info({t})")
    cols = [r[1] for r in cur.fetchall()]
    print(f"\n{t}: {count} rows, columns: {cols}")
    if count > 0:
        cur.execute(f"SELECT * FROM {t} LIMIT 3")
        print(f"  Sample: {cur.fetchall()}")

conn.close()
