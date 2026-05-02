"""
database.py — SQLite database layer (replaces MongoDB)
Uses the existing materials.db file located in the backend folder.
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "materials.db")


def get_connection():
    """Returns a SQLite connection with row_factory for dict-like access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def ensure_table():
    """Creates the materials table if it doesn't exist, then seeds it."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS materials (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            Mat_ID      TEXT,
            Element     TEXT,
            Name        TEXT    NOT NULL,
            Category    TEXT    NOT NULL,
            Unit        TEXT,
            Rate_LKR    REAL    DEFAULT 0.0,
            Strength_N_mm2 REAL DEFAULT 0.0,
            Ductility   REAL    DEFAULT 0.0,
            Embodied_Carbon REAL DEFAULT 0.0,
            Fire_Rating REAL DEFAULT 0.0,
            Service_Life INTEGER DEFAULT 0
        )
    """)
    conn.commit()

    # Seed only if table is empty
    cur.execute("SELECT COUNT(*) FROM materials")
    count = cur.fetchone()[0]
    if count == 0:
        seed_materials = [
            ("Gr. 20 Concrete",        "Structural", 35000.00 * 1.05, 20.0,  1.5, 0.15),
            ("Gr. 25 Concrete",        "Structural", 38000.00 * 1.05, 25.0,  1.5, 0.18),
            ("Gr. 30 Concrete",        "Structural", 42000.00 * 1.05, 30.0,  1.6, 0.21),
            ("Timber (Teak)",          "Structural", 120000.00 * 1.10, 15.0, 3.0, 0.05),
            ("Timber (Jak)",           "Structural", 85000.00 * 1.10,  12.0, 2.8, 0.04),
            ("Steel (High Yield)",     "Structural", 380000.00 * 1.02, 460.0,5.0, 1.85),
            ("Steel (Mild)",           "Structural", 310000.00 * 1.02, 250.0,4.5, 1.70),
            ("8' Solid Blocks SLS 855","Walls",      4500.00,          5.0,  1.1, 0.12),
            ("4' Brick (Clay)",        "Walls",      3500.00,          4.0,  1.0, 0.22),
            ("AAC Block (Lightweight)","Walls",      5800.00,          4.5,  1.2, 0.09),
            ("Fly Ash Brick",          "Walls",      3200.00,          5.5,  1.1, 0.08),
            ("Fiber Cement Board",     "Finishing",  12000.00,         3.0,  2.0, 0.30),
            ("Gypsum Board",           "Finishing",  8500.00,          1.5,  1.5, 0.28),
        ]
        cur.executemany(
            "INSERT INTO materials (Name, Category, Rate_LKR, Strength_N_mm2, Ductility, Embodied_Carbon) VALUES (?,?,?,?,?,?)",
            seed_materials
        )
        conn.commit()
        print("[DB] Seeded " + str(len(seed_materials)) + " materials into SQLite.")
    conn.close()


def get_all_materials():
    """Fetches all materials as a list of dicts."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM materials")
    rows = cur.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def format_material(row: dict) -> dict:
    """Normalises a SQLite row dict into the flat format the API/frontend expects."""
    return {
        "id":              row["id"],
        "Mat_ID":          row.get("Mat_ID", ""),
        "Element":         row.get("Element", ""),
        "Name":            row.get("Name", ""),
        "Category":        row.get("Category", ""),
        "Unit":            row.get("Unit", "m³"),
        "Rate_LKR":        float(row.get("Rate_LKR", 0.0)),
        "Strength_N_mm2":  float(row.get("Strength_N_mm2", 0.0)),
        "Ductility":       float(row.get("Ductility", 0.0)),
        "Embodied_Carbon": float(row.get("Embodied_Carbon", 0.0)),
        "Fire_Rating":     float(row.get("Fire_Rating", 0.0)),
        "Service_Life":    int(row.get("Service_Life", 50)),
    }
