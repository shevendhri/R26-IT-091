import sqlite3
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(base_dir, "data", "materials.db")

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

# 1. Add column if it doesn't exist
try:
    conn.execute("ALTER TABLE materials ADD COLUMN Structural_System_Compatibility TEXT DEFAULT 'All'")
    print("Added Structural_System_Compatibility column.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("Column already exists.")
    else:
        raise e

# 2. Fetch all materials and apply correct structural system logic
rows = conn.execute("SELECT Material_ID, Name, Category FROM materials").fetchall()

updates = []
for r in rows:
    mat_id = r["Material_ID"]
    name = r["Name"]
    category = r["Category"]
    
    # By default, everything is 'All'
    compat = "All"
    
    # Non-structural categories are fine with all
    if category in ("Foundation", "Structural", "Concrete"):
        # Specific mappings based on the plan
        name_lower = name.lower()
        
        if "rebar" in name_lower:
            if "gfrp" in name_lower:
                compat = "RC Frame, Timber Frame"
            else:
                compat = "RC Frame"
        elif "foundation" in name_lower:
            if "lime" in name_lower or "pozzolan" in name_lower:
                compat = "Timber Frame, Load-Bearing Masonry"
            elif "eco" in name_lower:
                compat = "RC Frame, Timber Frame, Steel Frame"
            elif "raft" in name_lower:
                compat = "RC Frame"
            elif "gr. 25" in name_lower:
                compat = "RC Frame, Load-Bearing Masonry"
            elif "gr. 30" in name_lower:
                compat = "RC Frame"
            else:
                compat = "RC Frame"
        elif "concrete" in name_lower:
            # Concrete mixes
            if "eco" in name_lower:
                compat = "RC Frame, Steel Frame"
            else:
                compat = "RC Frame"
        else:
            compat = "RC Frame"
            
    updates.append((compat, mat_id))

# 3. Apply updates
conn.executemany("UPDATE materials SET Structural_System_Compatibility = ? WHERE Material_ID = ?", updates)
conn.commit()

# Verify
res = conn.execute("SELECT Name, Structural_System_Compatibility FROM materials WHERE Category IN ('Foundation', 'Structural', 'Concrete')").fetchall()
for r in res:
    print(f"[{r['Structural_System_Compatibility']}] {r['Name']}")

conn.close()
print("Database update complete.")
