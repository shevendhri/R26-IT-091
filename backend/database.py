import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "materials.db")

def ensure_table(force_reinit=False):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    if force_reinit:
        cur.execute("DROP TABLE IF EXISTS materials")
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS materials (
            Material_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT,
            Category TEXT,
            Rate_LKR REAL,
            Thermal_Rating INTEGER,
            Moisture_Resistance INTEGER,
            Corrosion_Resistance INTEGER,
            Structural_Capacity INTEGER,
            Sustainability_Rating INTEGER,
            Maintenance_Level INTEGER,
            Embodied_Carbon REAL,
            Suitable_Climates TEXT,
            Budget_Level TEXT,
            Building_Sectors TEXT,
            Floor_Count_Range TEXT,
            Service_Life INTEGER,
            Description TEXT
        )
    """)
    
    # Only seed if table is empty
    cur.execute("SELECT COUNT(*) FROM materials")
    if cur.fetchone()[0] == 0:
        materials = [
        # ── FOUNDATION ──
        ("Gr. 25 Standard Concrete", "Foundation", 34500.0, 40, 60, 40, 75, 55, 30, 0.45, "wet,dry", "low,mid", "residential,commercial", "1-2,3-5", 50, "Standard structural concrete for low-rise foundations."),
        ("Gr. 30 Marine-Grade Concrete", "Foundation", 48000.0, 45, 98, 98, 85, 45, 20, 0.65, "coastal", "mid,high", "residential,commercial,industrial", "1-2,3-5,6+", 100, "Sulphate-resistant concrete for high-salinity zones."),
        ("Raft Foundation Assembly (Heavy)", "Foundation", 85000.0, 30, 90, 80, 95, 40, 15, 0.75, "wet,dry,coastal", "high", "commercial,industrial", "6+", 120, "Integrated raft system for high-occupancy structural loads."),
        
        # ── STRUCTURAL ──
        ("Epoxy-Coated Rebar (ASTM)", "Structural", 545000.0, 10, 98, 100, 98, 40, 10, 0.85, "coastal", "high", "residential,commercial,industrial", "1-2,3-5,6+", 120, "Corrosion-proof reinforcement for marine environments."),
        ("TMT High-Yield Rebar (SLS 375)", "Structural", 395000.0, 10, 65, 40, 92, 55, 30, 0.55, "dry,wet,highland", "mid,high", "residential,commercial", "1-2,3-5,6+", 65, "Standard structural reinforcement for urban projects."),
        ("Industrial Steel Portal Haunch", "Structural", 425000.0, 10, 75, 70, 95, 35, 40, 0.95, "dry,industrial", "mid,high", "industrial", "1-2", 45, "Long-span portal frame haunch for warehouse construction."),
        
        # ── WALLING ──
        ("Wire-Cut Clay Brick (Premium)", "Walling", 3100.0, 85, 65, 45, 65, 85, 20, 0.25, "highland,wet,dry", "mid,high", "residential", "1-2", 80, "High-thermal mass traditional load-bearing walling."),
        ("AAC Eco-Block (G4)", "Walling", 4500.0, 98, 55, 40, 45, 90, 30, 0.15, "dry,highland", "mid", "residential,commercial", "1-2,3-5", 50, "Superior thermal insulation with ultra-low dead-load."),
        ("High-Density Cement Block", "Walling", 2650.0, 45, 75, 55, 55, 45, 50, 0.35, "dry,wet", "low,mid", "residential,commercial,industrial", "1-2,3-5", 40, "Load-bearing utility blocks for industrial/commercial partitioning."),
        ("Curtain Wall Spandrel (Insulated)", "Walling", 85000.0, 90, 95, 90, 20, 70, 30, 0.75, "urban,commercial", "high", "commercial", "6+", 35, "High-performance glazing system for commercial high-rises."),

        # ── ROOFING ──
        ("Marine-Grade Aluminium (0.47mm)", "Roofing", 7800.0, 45, 98, 98, 15, 65, 10, 0.45, "coastal", "mid,high", "residential,commercial,industrial", "1-2,3-5", 45, "Salt-air proof roofing for severe coastal zones."),
        ("Portuguese Clay Tiles (Unglazed)", "Roofing", 6900.0, 92, 85, 95, 10, 85, 20, 0.18, "highland,wet", "mid,high", "residential", "1-2", 65, "Classic thermal performance with natural ventilation."),
        ("Insulated Sandwich Roof Panel", "Roofing", 9500.0, 95, 80, 70, 20, 50, 25, 0.55, "dry,industrial", "mid,high", "industrial,commercial", "1-2,3-5", 35, "High-R value roofing for climate-controlled industrial space."),

        # ── FLOORING ──
        ("Heavy-Duty Industrial Epoxy", "Flooring", 12500.0, 20, 98, 90, 85, 40, 15, 0.65, "industrial,wet", "mid,high", "industrial", "1-2", 25, "Chemical-resistant, dust-proof floor for process zones."),
        ("Polished Terrazzo (Traditional)", "Flooring", 7200.0, 55, 88, 75, 50, 75, 15, 0.22, "dry,wet", "mid,high", "residential,commercial", "1-2,3-5", 65, "Seamless high-durability traditional flooring."),
        ("Porcelain GVT Slab (Premium)", "Flooring", 9800.0, 45, 95, 85, 45, 65, 10, 0.40, "urban,coastal", "high", "residential,commercial", "1-2,3-5", 45, "Stain-resistant luxury floor for high-traffic lobbies."),

        # ── OPENINGS ──
        ("uPVC Multi-Chamber Window", "Openings", 72000.0, 95, 98, 100, 15, 85, 10, 0.28, "coastal,highland", "high", "residential,commercial", "1-2,3-5,6+", 45, "Maximum energy efficiency; chloride-resistant frame."),
        ("Commercial Grade Glazing (DGU)", "Openings", 95000.0, 92, 90, 85, 20, 75, 20, 0.55, "urban,commercial", "high", "commercial", "3-5,6+", 40, "Double-glazed unit with low-E coating for peak heat reduction."),
        ("Industrial Sectional Door", "Openings", 185000.0, 50, 80, 70, 60, 45, 30, 0.70, "industrial", "mid,high", "industrial", "1-2", 25, "High-speed insulated door for industrial logistics."),

        # ── WATERPROOFING ──
        ("Crystalline Slurry (Deep)", "Waterproofing", 3800.0, 10, 100, 95, 15, 55, 5, 0.05, "wet,coastal", "mid,high", "residential,commercial,industrial", "1-2,3-5,6+", 60, "Growth-penetrating seal for structural slabs."),
        ("Liquid Polyurethane Membrane", "Waterproofing", 4500.0, 15, 95, 90, 10, 40, 15, 0.55, "wet,coastal", "high", "residential,commercial", "1-2,3-5", 25, "Highly flexible membrane for thermal-movement zones."),

        # ── FINISHING ──
        ("Advanced Nano-Exterior Paint", "Finishing", 2100.0, 95, 90, 85, 10, 65, 15, 0.25, "coastal,wet,dry", "mid,high", "residential,commercial,industrial", "1-2,3-5,6+", 12, "Self-cleaning, high-UV resistant protective coating."),
        ("Eco-Friendly Low VOC Emulsion", "Finishing", 1650.0, 55, 60, 40, 10, 95, 15, 0.12, "residential,urban", "low,mid", "residential", "1-2,3-5", 15, "Indoor air quality focused domestic finish."),
        
        # ── ECO-SPECIALS (High Sustainability) ──
        ("Stabilized Earth Block (CSEB)", "Walling", 3800.0, 92, 55, 45, 60, 98, 25, 0.08, "dry,highland", "mid,high", "residential", "1-2", 60, "Ultra-low embodied carbon traditional block with excellent thermal mass."),
        ("Recycled Composite Decking", "Flooring", 14500.0, 45, 98, 100, 40, 92, 10, 0.22, "coastal,wet", "high", "residential,commercial", "1-2", 30, "Zero-maintenance sustainable decking from recycled polymers."),
        ("Bamboo-Fiber Ceiling Panel", "Ceiling", 4200.0, 65, 60, 70, 10, 95, 20, 0.05, "dry,highland", "mid,high", "residential,commercial", "1-2,3-5", 25, "Rapidly renewable resource material with peak eco-rating."),
        ("Standard Gypsum Ceiling Board", "Ceiling", 2850.0, 45, 40, 30, 5, 45, 40, 0.35, "dry,urban", "low,mid", "residential,commercial", "1-2,3-5,6+", 15, "Standard suspended ceiling system for internal dry zones."),
        ("PVC Laminated Ceiling Panel", "Ceiling", 3100.0, 40, 95, 80, 5, 25, 10, 0.55, "wet,coastal", "low,mid", "residential", "1-2,3-5", 20, "Moisture-proof ceiling solution for humid environments."),
        ("Hemp-Fiber Thermal Batt", "Roofing", 5500.0, 98, 40, 60, 10, 99, 30, 0.02, "highland,dry", "mid,high", "residential,commercial", "1-2,3-5,6+", 40, "Carbon-negative insulation with superior R-value."),
        ("Standard Cement Tile", "Roofing", 3800.0, 55, 85, 75, 10, 40, 35, 0.45, "wet,dry", "low,mid", "residential", "1-2", 40, "Economical roofing tile with moderate thermal performance."),
        ("Standard Ceramic Floor Tile", "Flooring", 4200.0, 35, 90, 85, 45, 40, 20, 0.35, "wet,dry", "low,mid", "residential,commercial", "1-2,3-5,6+", 25, "Standard glazed ceramic tiles for domestic and commercial use."),
        ("Standard Exterior Emulsion", "Finishing", 1250.0, 40, 75, 65, 5, 40, 45, 0.25, "wet,dry", "low", "residential,commercial,industrial", "1-2,3-5,6+", 8, "Basic weather-resistant paint for external wall surfaces."),
        ]
        
        cur.executemany("""
            INSERT INTO materials (
                Name, Category, Rate_LKR, Thermal_Rating, Moisture_Resistance, 
                Corrosion_Resistance, Structural_Capacity, Sustainability_Rating, 
                Maintenance_Level, Embodied_Carbon, Suitable_Climates, Budget_Level, 
                Building_Sectors, Floor_Count_Range, Service_Life, Description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, materials)
        
        conn.commit()
    conn.close()

def get_all_materials():
    ensure_table() # Auto-init
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM materials")
    rows = cur.fetchall()
    conn.close()
    return rows

def format_material(row):
    return {
        "Material_ID": row["Material_ID"],
        "Name": row["Name"],
        "Category": row["Category"],
        "Rate_LKR": row["Rate_LKR"],
        "Thermal_Rating": row["Thermal_Rating"],
        "Moisture_Resistance": row["Moisture_Resistance"],
        "Corrosion_Resistance": row["Corrosion_Resistance"],
        "Structural_Capacity": row["Structural_Capacity"],
        "Sustainability_Rating": row["Sustainability_Rating"],
        "Maintenance_Level": row["Maintenance_Level"],
        "Embodied_Carbon": row["Embodied_Carbon"],
        "Suitable_Climates": row["Suitable_Climates"],
        "Budget_Level": row["Budget_Level"],
        "Building_Sectors": row["Building_Sectors"],
        "Floor_Count_Range": row["Floor_Count_Range"],
        "Service_Life": row["Service_Life"],
        "Description": row["Description"]
    }
