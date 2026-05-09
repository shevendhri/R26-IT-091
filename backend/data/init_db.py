"""
init_db.py — Reinitialise and re-seed the SQLite materials database from CSV.
Run this any time you want to wipe and reload the data:
    python init_db.py
"""
import csv
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import get_connection, ensure_table

def init_database():
    conn = get_connection()
    cur  = conn.cursor()

    print("Dropping and recreating materials table for schema update...")
    cur.execute("DROP TABLE IF EXISTS materials")
    conn.commit()
    conn.close()

    ensure_table()
    conn = get_connection()
    cur  = conn.cursor()

    print("Clearing existing SQLite data...")
    cur.execute("DELETE FROM materials")
    conn.commit()

    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "EcoBuild_Complete_Database.csv")
    
    if not os.path.exists(csv_path):
        print(f"[Error] CSV not found at {csv_path}")
        return

    print(f"Seeding SQLite from {csv_path}...")
    
    materials_to_insert = []
    try:
        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader) # Skip header
            
            for row in reader:
                if not row or len(row) < 16:
                    continue
                
                mat_id = row[0]
                element = row[1]
                name = row[2]
                category = row[3]
                unit = row[5]
                try:
                    # BSR Rate: Prefer row[7] (LKR/m3 equiv.) but fall back to row[6] (LKR / Unit)
                    rate = 0.0
                    if len(row) > 7 and row[7].strip():
                        rate = float(row[7])
                    elif len(row) > 6 and row[6].strip():
                        rate = float(row[6])
                    # Compressive Strength at index 8
                    strength = float(row[8]) if row[8] else 0.0
                    # Tensile Strength at index 9 (used as proxy for Ductility)
                    ductility = float(row[9]) if row[9] else 0.0
                    # Fire Rating at index 12
                    fire = float(row[12]) if row[12] else 0.0
                    # Embodied Carbon at index 14
                    carbon = float(row[14]) if row[14] else 0.0
                    
                    # --- ENGINEERING CORRECTION LAYER ---
                    name_cat = (name + " " + category).lower()

                    # CSV concrete carbon values (0.13–0.26 kgCO2e/kg) are correct as-is.
                    # NO scaling applied — multiplying would inflate to 130–260 and
                    # destroy MCDM scoring by triggering the >10.0 carbon hard penalty.

                    # Aluminium Carbon: Primary Al is ~16–20 kgCO2e/kg.
                    # CSV value may understate; correct to engineering standard.
                    if "alumini" in name_cat and carbon < 5.0:
                        carbon = 18.5  # kgCO2e/kg — primary aluminium (IAI 2023)

                    # Timber Lifecycle: Cap untreated timber at 25 yrs in humid climates.
                    life = int(row[15]) if row[15] else 50
                    if "timber" in name_cat and "treated" not in name_cat:
                        life = min(life, 25)
                    # -------------------------------------------
                except ValueError:
                    continue # Skip invalid rows
                
                materials_to_insert.append((mat_id, element, name, category, unit, rate, strength, ductility, carbon, fire, life))
    except Exception as e:
        print(f"[Error] Reading CSV: {e}")
        return

    cur.executemany(
        """INSERT INTO materials
           (Mat_ID, Element, Name, Category, Unit, Rate_LKR, Strength_N_mm2, Ductility, Embodied_Carbon, Fire_Rating, Service_Life)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        materials_to_insert,
    )
    conn.commit()

    cur.execute("SELECT COUNT(*) FROM materials")
    count = cur.fetchone()[0]
    conn.close()
    print(f"[OK] Database re-seeded from CSV! Total materials: {count}")

if __name__ == "__main__":
    init_database()
