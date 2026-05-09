import sqlite3
import os

DB_PATH = "backend/data/materials.db"

def dump_mats():
    if not os.path.exists(DB_PATH):
        print(f"Error: {DB_PATH} not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM materials")
    rows = cur.fetchall()
    
    print(f"Total materials: {len(rows)}")
    for row in rows:
        print(f"ID: {row['id']}, Name: {row['Name']}, Cat: {row['Category']}, Rate: {row['Rate_LKR']}")
    
    conn.close()

if __name__ == "__main__":
    dump_mats()
