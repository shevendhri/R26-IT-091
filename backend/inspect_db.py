import sqlite3

def inspect(db_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"\n=== {db_path} ===")
        print("Tables:", tables)
        for t in tables:
            cursor.execute(f"PRAGMA table_info({t})")
            cols = cursor.fetchall()
            cursor.execute(f"SELECT COUNT(*) FROM {t}")
            count = cursor.fetchone()[0]
            print(f"\n  Table: {t} ({count} rows)")
            for col in cols:
                print(f"    col: {col[1]} ({col[2]})")
        conn.close()
    except Exception as e:
        print(f"Error inspecting {db_path}: {e}")

inspect("database.db")
inspect("materials.db")
