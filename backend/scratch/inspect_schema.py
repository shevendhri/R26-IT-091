import sqlite3, json

DB = r"C:\Users\ASUS\Desktop\Material specification\backend\data\materials.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()

# List all tables
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cur.fetchall()]
print("TABLES:", tables)

# Materials columns
cur.execute("PRAGMA table_info(materials)")
cols = [r[1] for r in cur.fetchall()]
print("MATERIALS COLUMNS:", cols)

# Material count
cur.execute("SELECT COUNT(*) FROM materials")
print("MATERIAL COUNT:", cur.fetchone()[0])

# Check compatibility tables
for t in tables:
    if "compat" in t.lower() or "Compat" in t:
        cur.execute(f"PRAGMA table_info({t})")
        print(f"\n{t} COLUMNS:", [r[1] for r in cur.fetchall()])
        cur.execute(f"SELECT COUNT(*) FROM {t}")
        print(f"{t} ROW COUNT:", cur.fetchone()[0])
        cur.execute(f"SELECT * FROM {t} LIMIT 5")
        print(f"{t} SAMPLE:", cur.fetchall())

# Check if Fire_Rating exists  
if "Fire_Rating" in cols:
    print("\nFire_Rating EXISTS in schema")
else:
    print("\nFire_Rating MISSING from schema")

# Sample a few materials
conn.row_factory = sqlite3.Row
cur2 = conn.cursor()
cur2.execute("SELECT * FROM materials LIMIT 3")
for r in cur2.fetchall():
    print("\nMATERIAL:", dict(r))

conn.close()
