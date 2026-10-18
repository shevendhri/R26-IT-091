import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "materials.db")

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def ensure_table():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='materials'")
    table_exists = cur.fetchone()
    if table_exists:
        cur.execute("PRAGMA table_info(materials)")
        columns = [row[1] for row in cur.fetchall()]
        # Re-seed if new columns are missing or legacy Openings component exists
        if "Component" not in columns or "Unit" not in columns or "Unit_Rate" not in columns or "Standard_Reference" not in columns:
            print("[DB] Upgrading materials table schema with Component, Unit, Unit_Rate, and Standard_Reference...")
            cur.execute("DROP TABLE IF EXISTS materials")
            conn.commit()
        else:
            cur.execute("SELECT COUNT(*) FROM materials WHERE Component = 'Openings'")
            if cur.fetchone()[0] > 0:
                print("[DB] Re-seeding materials table with exact canonical Component values...")
                cur.execute("DROP TABLE IF EXISTS materials")
                conn.commit()


    cur.execute("""
        CREATE TABLE IF NOT EXISTS recommendation_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            project_info TEXT NOT NULL,
            recommendation TEXT NOT NULL
        )
    """)
    conn.commit()


    cur.execute("SELECT COUNT(*) FROM materials")
    if cur.fetchone()[0] == 0:
        print("[DB] Seeding expanded 62-material database with strict component eligibility...")

        # Schema:
        # (Name, Component, Application, Category, Unit, Unit_Rate, Rate_Basis, Data_Source, Data_Quality, Standard_Reference,
        #  Thermal_Rating, Moisture_Resistance, Corrosion_Resistance, Structural_Capacity, Sustainability_Rating,
        #  Maintenance_Level, Embodied_Carbon, Suitable_Climates, Budget_Level, Building_Sectors, Floor_Count_Range,
        #  Service_Life, Description, Local_Availability, Supplier_Density, Style_Compatibility,
        #  Recyclability_Rating, Thermal_Performance_Rating, Climate_Risk_Score)

        materials = [

        # ═══════════════════════════════════════════════════
        # FOUNDATION (5 materials)
        # ═══════════════════════════════════════════════════
        ("Gr. 25 Standard Concrete Foundation",
         "Foundation", "Pad and strip footings for low-to-mid rise buildings", "Foundation",
         "m³", 34500.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 614 / BS 8110 ref",
         40, 65, 45, 75, 55, 20, 0.45,
         "wet,dry,intermediate,highland",
         "mid", "residential,commercial,hotel,school,apartment", "1-2,3-5", 50,
         "Standard M25 structural concrete for pad and strip foundations in low-rise buildings. Suitable for non-aggressive soils under moderate load.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Traditional Sri Lankan,Colonial,Minimalist,Tropical",
         40, 40, 60),

        ("Gr. 30 Marine-Grade Concrete Foundation",
         "Foundation", "Substructure in saline/coastal marine environment", "Foundation",
         "m³", 48000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 614 Marine Exposure / BS 6349",
         45, 98, 98, 88, 48, 15, 0.68,
         "coastal,extreme coastal",
         "high", "residential,commercial,hotel,industrial,apartment,school", "1-2,3-5,6+", 100,
         "Sulphate-resistant dense-mix M30 concrete with silica fume and corrosion inhibitors. Mandatory for coastal and saline-soil foundations to resist chloride-induced corrosion.",
         "High", "Western: High, Southern: High, Northern: Medium, Eastern: Medium",
         "Modern,Contemporary,Tropical,Minimalist",
         35, 45, 98),

        ("Eco-Concrete Foundation (30% Recycled Aggregate)",
         "Foundation", "Sustainable substructure footings & grade slabs", "Foundation",
         "m³", 38000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 614 Blended / GREENSL Tier-1",
         42, 65, 50, 72, 90, 20, 0.30,
         "dry,wet,intermediate,highland",
         "mid", "residential,commercial,apartment,school", "1-2,3-5", 50,
         "Sustainable M25-equivalent concrete using 30% recycled crushed aggregate and fly-ash blended cement. Reduces embodied carbon by 35% vs standard mix.",
         "Medium", "Western: High, Southern: Medium, Central: Low",
         "Modern,Contemporary,Minimalist",
         85, 40, 60),

        ("Raft Foundation Assembly (RC Heavy)",
         "Foundation", "Full-footprint mat/raft foundation for soft soils or heavy load", "Foundation",
         "m³", 85000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "BS 8004 / SLS 614 ref",
         35, 92, 85, 98, 42, 12, 0.80,
         "wet,coastal,dry,intermediate",
         "high", "commercial,hotel,apartment,industrial", "3-5,6+", 120,
         "Heavily reinforced raft slab system distributing loads across full footprint. Ideal for soft ground conditions, high-occupancy buildings, and multi-storey structures.",
         "Medium", "Western: High, Southern: Medium, Central: Low",
         "Modern,Contemporary",
         30, 35, 85),

        ("Lime-Pozzolan Natural Foundation",
         "Foundation", "Low-carbon heritage foundation for light low-rise buildings", "Foundation",
         "m³", 29000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "Traditional / GreenSL Heritage Guidelines",
         50, 60, 40, 60, 92, 25, 0.12,
         "dry,intermediate,highland",
         "mid", "residential", "1-2", 80,
         "Traditional hydraulic lime and volcanic pozzolan foundation mortar. Near-zero embodied carbon with good load transfer for low-rise residential in non-aggressive soil conditions.",
         "Low", "Central: Low, North Central: Medium",
         "Traditional Sri Lankan,Colonial",
         90, 50, 45),

        # ═══════════════════════════════════════════════════
        # STRUCTURAL / CONCRETE & REBAR (9 materials)
        # ═══════════════════════════════════════════════════
        ("Gr. 25 Standard Structural Concrete",
         "Structural Frame", "Columns, beams, and suspended structural slabs", "Structural Frame",
         "m³", 32500.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 614 / BS 8110 ref",
         40, 65, 50, 80, 52, 25, 0.45,
         "wet,dry,intermediate,highland",
         "low,mid", "residential,commercial,hotel,apartment,school,industrial", "1-2,3-5", 60,
         "Standard M25 ready-mix concrete for columns, beams, and suspended slabs. Meets structural load guidelines for non-aggressive environments.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Traditional Sri Lankan,Colonial,Minimalist,Tropical",
         40, 40, 60),

        ("Gr. 30 Marine-Grade Concrete Mix",
         "Structural Frame", "Columns, beams & coastal superstructure within 1km coast", "Structural Frame",
         "m³", 45000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 614 Marine / BS 6349",
         45, 98, 98, 90, 46, 15, 0.68,
         "coastal,extreme coastal",
         "mid,high", "residential,commercial,hotel,industrial,apartment", "1-2,3-5,6+", 100,
         "High-durability dense M30 concrete with 5% silica fume, maximum w/c ratio 0.40, and corrosion inhibitors. Recommended for superstructure elements in coastal zones.",
         "High", "Western: High, Southern: High, Northern: Medium, Eastern: Medium",
         "Modern,Contemporary,Tropical,Minimalist",
         35, 45, 98),

        ("Eco-Concrete (Recycled Aggregate + Fly-Ash)",
         "Structural Frame", "Low-carbon frame columns, beams and slabs", "Structural Frame",
         "m³", 35000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 614 Blended / GREENSL Tier-1",
         42, 65, 48, 75, 92, 22, 0.28,
         "dry,wet,intermediate,highland",
         "mid", "residential,commercial,apartment,school", "1-2,3-5", 50,
         "Low-carbon structural concrete incorporating 30% recycled coarse aggregate and 20% fly-ash cement replacement. Reduces embodied carbon by 38% vs conventional M25.",
         "Medium", "Western: High, Southern: Medium, Central: Low",
         "Modern,Contemporary,Minimalist",
         88, 40, 60),

        ("Self-Compacting Concrete (SCC)",
         "Structural Frame", "Heavily congested column-beam junctions & architectural concrete", "Structural Frame",
         "m³", 42000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 614 Special Mix",
         45, 80, 75, 85, 50, 15, 0.55,
         "wet,dry,coastal,intermediate",
         "high", "commercial,hotel,apartment", "3-5,6+", 65,
         "High-flow self-compacting concrete for congested reinforcement zones. Eliminates vibration requirement and ensures dense, void-free structural elements.",
         "Medium", "Western: High",
         "Modern,Contemporary",
         40, 45, 75),

        ("Epoxy-Coated Rebar (ASTM A775)",
         "Reinforcement", "Reinforcement steel for coastal/saline environments", "Reinforcement",
         "ton", 545000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "ASTM A775 / SLS 375 ref",
         10, 98, 100, 98, 42, 8, 0.88,
         "coastal,extreme coastal",
         "high", "residential,commercial,hotel,industrial,apartment,school", "1-2,3-5,6+", 120,
         "Fusion-bonded epoxy-coated high-yield deformed reinforcement bar. Recommended for marine and coastal structures where chloride-induced corrosion is the primary threat.",
         "Medium", "Western: High, Southern: Medium, Eastern: Low",
         "Modern,Contemporary,Tropical,Minimalist",
         25, 10, 98),

        ("TMT High-Yield Rebar (SLS 375)",
         "Reinforcement", "Standard reinforcement steel for inland concrete framing", "Reinforcement",
         "ton", 395000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 375 Grade RB500",
         10, 68, 42, 92, 55, 28, 0.55,
         "dry,wet,intermediate,highland",
         "mid,high", "residential,commercial,hotel,apartment,school", "1-2,3-5,6+", 65,
         "Thermo-mechanically treated Fe500D high-yield deformed steel bars per SLS 375. Standard reinforcement for inland and non-coastal structural concrete frames.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Traditional Sri Lankan,Minimalist,Tropical",
         35, 10, 55),

        ("Galvanized Steel Rebar (Hot-Dip)",
         "Reinforcement", "Corrosion-resistant reinforcement for moderate coastal zones", "Reinforcement",
         "ton", 425000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "ISO 1461 / SLS 375 ref",
         10, 85, 85, 90, 50, 15, 0.75,
         "coastal,wet,extreme coastal",
         "high", "residential,commercial,hotel,apartment", "1-2,3-5", 80,
         "Hot-dip galvanized deformed reinforcement bar with 85μm zinc coating. Good corrosion resistance for moderately aggressive marine environments.",
         "Low", "Western: Medium, Southern: Low",
         "Modern,Contemporary,Tropical",
         50, 10, 80),

        ("Stainless Steel Rebar (Grade 316L)",
         "Reinforcement", "Ultra-durability reinforcement for critical marine infrastructure", "Reinforcement",
         "ton", 780000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "BS 6744 / ASTM A955",
         10, 100, 100, 95, 35, 5, 1.25,
         "coastal,extreme coastal",
         "high", "commercial,hotel,industrial", "3-5,6+", 150,
         "Grade 316L austenitic stainless steel reinforcement for extreme chloride exposure. Premium specification for long-life critical coastal structures.",
         "Low", "Western: Low",
         "Modern,Contemporary,Minimalist",
         65, 10, 100),

        ("GFRP Rebar (Glass Fibre Reinforced Polymer)",
         "Reinforcement", "Non-metallic non-corrosive reinforcement for saline concrete", "Reinforcement",
         "ton", 490000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "ACI 440.1R / CSA S806",
         10, 100, 100, 80, 80, 5, 0.55,
         "coastal,extreme coastal,wet",
         "high", "residential,commercial,apartment", "1-2,3-5", 100,
         "Non-corrosive glass fibre reinforced polymer rebar. Zero corrosion risk in marine environments. Lighter than steel, ideal for aggressive exposure conditions.",
         "Low", "Western: Low",
         "Modern,Contemporary,Minimalist",
         60, 10, 98),

        # ═══════════════════════════════════════════════════
        # WALLING (6 materials)
        # ═══════════════════════════════════════════════════
        ("Wire-Cut Clay Brick (Premium Grade)",
         "Walling", "External load-bearing and partition walls", "Walling",
         "m²", 3100.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 39 / BS 3921 ref",
         88, 68, 48, 68, 85, 18, 0.22,
         "highland,intermediate,dry,wet",
         "mid,high", "residential,hotel,school", "1-2", 80,
         "Traditional machine-cut high-density clay bricks with excellent thermal mass. Natural breathable material ideal for highland and intermediate zones where thermal comfort is critical.",
         "High", "Western: High, Southern: High, North Western: High",
         "Traditional Sri Lankan,Colonial,Tropical",
         75, 88, 50),

        ("AAC Eco-Block G4 (Autoclaved Aerated Concrete)",
         "Walling", "Lightweight exterior and interior partition walls", "Walling",
         "m²", 4500.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 1344 / EN 771-4",
         98, 55, 42, 48, 88, 28, 0.15,
         "dry,intermediate,highland",
         "mid", "residential,commercial,apartment,hotel,school", "1-2,3-5", 50,
         "Factory-made lightweight aerated concrete block with R-value 3× better than standard brick. Reduces structural dead load by 60% and provides superior thermal insulation.",
         "Medium", "Western: High, Southern: Medium, Central: Low",
         "Modern,Contemporary,Minimalist",
         50, 98, 40),

        ("High-Density Cement Block",
         "Walling", "Standard masonry external and boundary walls", "Walling",
         "m²", 2650.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 855 / BS 6073 ref",
         48, 78, 58, 58, 46, 48, 0.38,
         "dry,wet,intermediate",
         "low,mid", "residential,commercial,apartment,hotel,school,industrial", "1-2,3-5", 40,
         "Standard solid or hollow dense aggregate concrete block. Workhorse walling unit for general construction with adequate structural performance and high local availability.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Minimalist,Tropical",
         40, 48, 55),

        ("CSEB Compressed Stabilized Earth Block",
         "Walling", "Eco-friendly thermal external and internal walls", "Walling",
         "m²", 3800.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 1382 / ARS 680",
         92, 58, 48, 62, 98, 22, 0.08,
         "dry,intermediate,highland",
         "mid", "residential,school", "1-2", 60,
         "Manually or machine-pressed stabilized soil blocks with 5-8% cement. Lowest embodied carbon walling material, excellent thermal mass, carbon-negative lifecycle when using unfired soil.",
         "Medium", "Southern: Medium, North Central: Medium, Uva: Low",
         "Traditional Sri Lankan,Tropical",
         92, 92, 40),

        ("Hollow Clay Block (Perforated)",
         "Walling", "Thermally insulated external partition masonry", "Walling",
         "m²", 3400.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 39 / EN 771-1",
         75, 62, 50, 55, 78, 20, 0.18,
         "wet,intermediate,highland,dry",
         "mid", "residential,commercial,hotel,apartment,school", "1-2,3-5", 65,
         "Extruded hollow clay partition block with vertical perforations. Better thermal performance than solid brick due to air cavities, while maintaining traditional clay aesthetics.",
         "Medium", "Western: High, Southern: High",
         "Traditional Sri Lankan,Colonial,Tropical",
         70, 78, 48),

        ("Fly-Ash Composite Block",
         "Walling", "Resource-efficient masonry wall units", "Walling",
         "m²", 2900.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "IS 12894 / SLS Ref",
         55, 72, 55, 60, 80, 25, 0.20,
         "dry,wet,intermediate",
         "mid", "residential,commercial,apartment,school", "1-2,3-5", 50,
         "Class C fly-ash based masonry block utilizing industrial waste aggregate. 30% lower carbon than cement block with comparable strength and high recycled content.",
         "Medium", "Western: High, Southern: Medium",
         "Modern,Contemporary,Minimalist",
         80, 55, 55),

        # ═══════════════════════════════════════════════════
        # ROOFING (8 materials)
        # ═══════════════════════════════════════════════════
        ("Marine-Grade Aluminium Roofing (0.55mm)",
         "Roofing", "Corrosion-resistant pitched roof covering in marine zones", "Roofing",
         "m²", 7800.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 1024 / BS EN 508",
         45, 98, 98, 15, 65, 8, 0.48,
         "coastal,extreme coastal,wet",
         "mid,high", "residential,commercial,hotel,industrial,apartment", "1-2,3-5", 45,
         "Anodized aluminium roofing sheet with 0.55mm gauge for severe salt-air and coastal environments. Corrosion-proof with reflective finish reducing solar heat gain.",
         "High", "Western: High, Southern: High, Northern: High",
         "Modern,Contemporary,Tropical",
         75, 45, 95),

        ("Portuguese Clay Tile (Unglazed Terracotta)",
         "Roofing", "Pitched roof covering with natural thermal breathability", "Roofing",
         "m²", 6900.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 2 / EN 1304",
         92, 88, 95, 10, 85, 18, 0.18,
         "highland,intermediate,wet",
         "mid,high", "residential,hotel,school", "1-2", 65,
         "Traditional half-round terracotta roofing tiles with natural breathability. Excellent thermal mass and moisture management. Heritage aesthetic for highland and intermediate zones.",
         "High", "Western: High, Southern: High, North Western: High",
         "Traditional Sri Lankan,Colonial,Tropical",
         82, 92, 45),

        ("Insulated Sandwich Roof Panel (PU Core)",
         "Roofing", "High thermal insulation composite roof panels", "Roofing",
         "m²", 9500.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "EN 14509 / ISO 9001 ref",
         95, 85, 72, 20, 52, 22, 0.58,
         "dry,intermediate,industrial",
         "mid,high", "commercial,hotel,industrial", "1-2,3-5", 35,
         "Factory-assembled rigid polyurethane core sandwich panel with steel face sheets. High thermal insulation and fast installation for commercial spans.",
         "High", "Western: High, Gampaha: High",
         "Modern,Contemporary",
         40, 95, 65),

        ("Standard Cement Tile (Concrete Interlocking)",
         "Roofing", "Interlocking concrete tile for general pitched roofs", "Roofing",
         "m²", 3800.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 400 / BS EN 490",
         55, 88, 78, 10, 42, 32, 0.45,
         "wet,dry,intermediate",
         "low,mid", "residential,school,apartment", "1-2", 40,
         "Concrete interlocking roof tiles with standard weather seal. Economical and widely available. Suited for pitched roofs in non-coastal areas.",
         "High", "All Provinces: High",
         "Traditional Sri Lankan,Colonial",
         38, 55, 55),

        ("Zinc-Aluminium Corrugated Sheet (55% Al-Zn)",
         "Roofing", "Lightweight metal roofing with aluminium-zinc corrosion barrier", "Roofing",
         "m²", 5200.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 1188 / AS 1397",
         42, 95, 92, 12, 60, 10, 0.42,
         "coastal,wet,intermediate,dry",
         "mid", "residential,commercial,apartment,industrial", "1-2,3-5", 50,
         "55% aluminium-zinc alloy coated corrugated roofing sheet (Zincalume equivalent). Superior corrosion resistance in tropical and coastal climates vs plain galvanized steel.",
         "High", "Western: High, Southern: High, Northern: High",
         "Modern,Contemporary,Tropical",
         60, 42, 85),

        ("Green Intensive Roof System (Growing Medium)",
         "Roofing", "Vegetated living flat roof for stormwater & urban cooling", "Roofing",
         "m²", 24000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "FLL Green Roof Guidelines",
         98, 95, 90, 15, 98, 28, 0.10,
         "wet,intermediate",
         "high", "commercial,hotel,apartment", "3-5,6+", 50,
         "Engineered soil + drainage + waterproof membrane green roof. Maximum stormwater management, urban heat island mitigation, and biodiversity gain. Premium sustainable specification.",
         "Low", "Western: Medium",
         "Modern,Contemporary,Minimalist",
         95, 98, 70),

        ("Polycarbonate Translucent Roofing",
         "Roofing", "Daylight canopy and atrium translucent roof panels", "Roofing",
         "m²", 4500.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "EN 16153 / ASTM D3841",
         55, 92, 80, 8, 55, 20, 0.55,
         "wet,dry,intermediate",
         "mid", "commercial,hotel,school", "1-2,3-5", 20,
         "Multi-wall polycarbonate sheets for natural-light roofing of atriums, corridors, and covered walkways. UV stabilized with anti-drip coating.",
         "Medium", "Western: High, Southern: Medium",
         "Modern,Contemporary",
         45, 55, 60),

        ("Recycled Rubber Flat Roof Membrane",
         "Roofing", "Elastomeric flat roof waterproofing membrane from recycled scrap", "Roofing",
         "m²", 6200.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "ASTM D4637 / ISO 14021",
         40, 98, 80, 8, 75, 15, 0.30,
         "wet,coastal,intermediate",
         "mid", "residential,commercial,apartment", "1-2,3-5", 35,
         "EPDM-equivalent flat roof membrane made from recycled automotive rubber. High flexibility, UV resistant, and produced from waste streams for sustainability points.",
         "Low", "Western: Medium",
         "Modern,Contemporary,Minimalist",
         85, 40, 72),

        # ═══════════════════════════════════════════════════
        # OPENINGS / WINDOWS (6 materials)
        # ═══════════════════════════════════════════════════
        ("uPVC Multi-Chamber Window System",
         "Windows", "High thermal insulation and saline corrosion-proof windows", "Windows",
         "m²", 72000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "BS EN 12608 / SLS Ref",
         95, 98, 100, 15, 82, 8, 0.28,
         "coastal,highland,wet,extreme coastal,intermediate",
         "high", "residential,commercial,hotel,apartment,school", "1-2,3-5,6+", 45,
         "Multi-chamber uPVC profile with double-glazed low-E unit. Highest thermal insulation and zero corrosion risk. Ideal for coastal salinity, highland cold, and humid zones.",
         "High", "Western: High, Southern: Medium, Central: Medium",
         "Modern,Contemporary,Minimalist",
         42, 95, 90),

        ("Casement Aluminium Window (Powder-Coated)",
         "Windows", "Weather-resistant operable window frames with thermal break", "Windows",
         "m²", 48000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 1410 / BS 4873",
         60, 92, 92, 15, 55, 15, 0.45,
         "coastal,wet,intermediate,dry,extreme coastal",
         "mid,high", "residential,commercial,hotel,apartment,school", "1-2,3-5,6+", 40,
         "Powder-coated aluminium casement window with thermal break. Good corrosion resistance for coastal zones with modern aesthetic. Cost-effective alternative to uPVC.",
         "High", "Western: High, Southern: High, Northern: Medium",
         "Modern,Contemporary,Tropical",
         50, 60, 82),

        ("Timber Louvre Window (Treated Hardwood)",
         "Windows", "Passive natural cross-ventilation adjustable louvre apertures", "Windows",
         "m²", 35000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "Traditional / SLS 263 ref",
         80, 62, 55, 10, 75, 42, 0.25,
         "highland,intermediate,dry",
         "mid", "residential,hotel,school", "1-2", 40,
         "Adjustable hardwood louvre window promoting natural cross-ventilation. Traditional Sri Lankan architectural element with excellent passive cooling. Not recommended for coastal zones.",
         "Medium", "Western: High, Central: Medium",
         "Traditional Sri Lankan,Colonial,Tropical",
         70, 82, 38),

        ("Commercial Double-Glazed Unit (DGU Low-E)",
         "Windows", "Solar control acoustic curtain wall and vision glass", "Windows",
         "m²", 95000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "EN 1279 / ASTM E2190",
         92, 92, 88, 20, 72, 18, 0.58,
         "coastal,urban,wet,intermediate",
         "high", "commercial,hotel,apartment", "3-5,6+", 40,
         "Low-emissivity double-glazed unit with argon fill for commercial curtain wall and window systems. Superior solar control and thermal performance for air-conditioned spaces.",
         "High", "Western: High",
         "Modern,Contemporary,Minimalist",
         38, 92, 80),

        ("Fixed Aluminium Framed Glass Panel",
         "Windows", "Non-operable daylight vision apertures and façade panels", "Windows",
         "m²", 28000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 1410 / BS 6262",
         55, 92, 90, 10, 50, 10, 0.42,
         "coastal,wet,dry,intermediate",
         "mid", "residential,commercial,hotel", "1-2,3-5", 35,
         "Fixed vision glazing panel in aluminium frame. Low maintenance, high light transmission for façade apertures where ventilation is not required.",
         "High", "Western: High, Southern: High",
         "Modern,Contemporary,Minimalist,Tropical",
         45, 55, 78),

        ("Sliding Aluminium Window (Impact-Resistant)",
         "Windows", "Wind-load certified sliding windows for multi-storey & coastal", "Windows",
         "m²", 42000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 1410 / ASTM E1886",
         65, 95, 95, 12, 52, 12, 0.40,
         "coastal,extreme coastal,wet",
         "mid", "residential,commercial,hotel,apartment", "1-2,3-5", 38,
         "Marine-grade anodized aluminium sliding window with impact-resistant glazing. Specified for cyclone-prone coastal zones with tested wind load resistance.",
         "Medium", "Western: High, Southern: Medium, Northern: Medium",
         "Modern,Contemporary,Tropical",
         48, 65, 92),

        # ═══════════════════════════════════════════════════
        # OPENINGS / DOORS (7 materials)
        # ═══════════════════════════════════════════════════
        ("Solid Teak Timber Door (Premium)",
         "Doors", "Primary entrance and high-traffic interior hardwood door leaf", "Doors",
         "units", 120000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 263 / BS 4787",
         48, 82, 82, 42, 75, 42, 0.22,
         "wet,dry,highland,intermediate",
         "high", "residential,commercial,hotel,school", "1-2,3-5,6+", 80,
         "Hand-crafted solid Burma or Sri Lankan teak door panel with mortise and tenon joinery. Superior durability in non-coastal zones with premium aesthetic for traditional and colonial styles.",
         "High", "Western: High, Southern: High, Central: Medium",
         "Traditional Sri Lankan,Colonial,Tropical",
         65, 48, 42),

        ("Aluminium Profile Glass Door (Heavy-Duty)",
         "Doors", "Commercial entrance & weather-resistant glazed sliding door", "Doors",
         "units", 85000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 1410 / BS EN 14351",
         52, 95, 95, 48, 52, 22, 0.58,
         "coastal,wet,intermediate,extreme coastal,dry",
         "mid,high", "residential,commercial,hotel,apartment,industrial", "1-2,3-5,6+", 50,
         "Heavy-duty powder-coated aluminium profile door with full-height glazed panel. Excellent for coastal salinity resistance with contemporary aesthetic.",
         "High", "Western: High, Southern: Medium",
         "Modern,Contemporary,Minimalist",
         52, 52, 88),

        ("FRP Fiberglass Reinforced Door",
         "Doors", "100% moisture-proof and chemical-resistant door leaf for wet/coastal areas", "Doors",
         "units", 98000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "ASTM D4024 / BS EN 14351",
         42, 98, 100, 42, 65, 12, 0.48,
         "coastal,wet,extreme coastal",
         "high", "residential,commercial,hotel,apartment,industrial", "1-2,3-5,6+", 60,
         "Glass fibre reinforced polymer door leaf. Completely immune to marine corrosion, moisture, salt spray, and biological attack. Premium specification for aggressive coastal environments.",
         "Medium", "Western: High, Southern: Medium, Eastern: Low",
         "Modern,Contemporary,Tropical",
         55, 42, 98),

        ("Standard Hollow-Core Flush Door (HDF Faced)",
         "Doors", "Interior bedroom and office dry partition door leaf", "Doors",
         "units", 22000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 263 / BS 4787 Part 1",
         32, 42, 32, 28, 42, 48, 0.38,
         "dry,intermediate",
         "low,mid", "residential,commercial,apartment,school", "1-2,3-5", 20,
         "Hollow-core internal flush door with HDF facing and timber frame. Cost-effective interior partition door for dry and intermediate climate zones only.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Minimalist",
         30, 32, 28),

        ("Steel Security Door (Powder-Coated)",
         "Doors", "High-security external and utility entrance door", "Doors",
         "units", 65000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "BS EN 1627 / SLS Ref",
         35, 75, 70, 85, 40, 25, 0.72,
         "dry,intermediate,wet",
         "mid", "residential,commercial,apartment,school", "1-2,3-5,6+", 40,
         "Heavy-gauge steel security door with multi-point locking and powder-coat finish. High structural resistance for entrance and security-sensitive openings.",
         "High", "All Provinces: High",
         "Modern,Contemporary",
         40, 35, 55),

        ("Timber Louvre Door (Ventilated Hardwood)",
         "Doors", "Passive airflow internal and veranda hardwood louvre door", "Doors",
         "units", 45000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "Traditional / SLS 263",
         75, 65, 58, 30, 72, 38, 0.20,
         "highland,intermediate,dry,wet",
         "mid", "residential,hotel,school", "1-2", 45,
         "Hardwood slatted louvre door promoting passive ventilation while maintaining privacy. Traditional Sri Lankan architectural element unsuited for direct coastal exposure.",
         "Medium", "Western: High, Central: High, Southern: Medium",
         "Traditional Sri Lankan,Colonial,Tropical",
         68, 78, 38),

        ("UPVC Sliding Door (Weather-Sealed)",
         "Doors", "Thermal and acoustic weather-sealed patio and balcony sliding door", "Doors",
         "units", 78000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "BS EN 12608 / PAS 24",
         88, 98, 100, 20, 80, 10, 0.32,
         "coastal,wet,highland,extreme coastal",
         "high", "residential,commercial,hotel,apartment", "1-2,3-5", 40,
         "Multi-chamber uPVC sliding door system with double-glazed panel and weather-sealed track. Zero corrosion, excellent thermal performance for coastal and highland climates.",
         "Medium", "Western: High, Southern: Medium",
         "Modern,Contemporary,Minimalist",
         42, 88, 90),

        # ═══════════════════════════════════════════════════
        # FLOORING (7 materials)
        # ═══════════════════════════════════════════════════
        ("Polished Terrazzo Flooring (Marble Aggregate)",
         "Flooring", "High-durability seamless indoor flooring", "Flooring",
         "m²", 7200.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 844 / BS 8204-6",
         58, 92, 78, 52, 75, 12, 0.22,
         "wet,dry,intermediate,highland",
         "mid,high", "residential,commercial,hotel,apartment,school", "1-2,3-5", 65,
         "Seamless monolithic terrazzo floor with marble chip aggregate and white cement matrix. Timeless durability with near-zero maintenance when sealed correctly. Traditional Sri Lankan aesthetic.",
         "High", "All Provinces: High",
         "Traditional Sri Lankan,Colonial,Tropical,Contemporary",
         72, 58, 58),

        ("Porcelain GVT Slab (Full-Body Vitrified)",
         "Flooring", "High-traffic stain-resistant commercial & residential floor tile", "Flooring",
         "m²", 9800.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "ISO 13006 Group BIa / SLS 1181",
         48, 95, 88, 48, 65, 8, 0.42,
         "wet,coastal,intermediate,dry",
         "high", "residential,commercial,hotel,apartment", "1-2,3-5", 45,
         "Large-format full-body vitrified porcelain tile with digital-print finish. Stain-resistant, scratch-proof surface with high design flexibility for contemporary interiors.",
         "High", "Western: High, Southern: High",
         "Modern,Contemporary,Minimalist",
         40, 48, 68),

        ("Standard Ceramic Floor Tile",
         "Flooring", "General residential floor tiling", "Flooring",
         "m²", 4200.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 1181 / ISO 13006 Group BIIa",
         38, 90, 85, 45, 42, 18, 0.35,
         "wet,dry,intermediate",
         "low,mid", "residential,commercial,apartment,school", "1-2,3-5,6+", 25,
         "Standard glazed ceramic floor tile in 300×300mm and 400×400mm format. Economical, widely available, adequate for general residential and commercial applications.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Minimalist,Tropical,Traditional Sri Lankan",
         38, 38, 55),

        ("Timber Strip Flooring (Treated Hardwood)",
         "Flooring", "Highland/dry zone internal decorative hardwood floor", "Flooring",
         "m²", 11000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "BS 8201 / SLS Timber Ref",
         88, 55, 52, 40, 72, 45, 0.28,
         "highland,intermediate,dry",
         "mid,high", "residential,hotel", "1-2", 40,
         "Kiln-dried and treated hardwood strip flooring. Excellent thermal comfort in highland zones. Must be protected from moisture — not suitable for coastal or wet zones.",
         "Medium", "Western: High, Central: Medium",
         "Traditional Sri Lankan,Colonial,Tropical,Contemporary",
         68, 88, 38),

        ("Rubber Flooring (Recycled Automotive)",
         "Flooring", "Shock-absorbent utility, gym and laboratory resilient flooring", "Flooring",
         "m²", 8500.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "ASTM F1344 / ISO 14021",
         55, 98, 88, 48, 80, 8, 0.28,
         "wet,coastal,intermediate",
         "mid", "commercial,industrial,school", "1-2,3-5,6+", 30,
         "Recycled automotive rubber tile for wet-area, gym, laboratory, and commercial utility floors. Non-slip, shock-absorbent, and fully recyclable end-of-life.",
         "Medium", "Western: High, Southern: Medium",
         "Modern,Contemporary",
         92, 55, 68),

        ("Micro-Cement Screed Flooring",
         "Flooring", "Seamless polymer-modified architectural floor screed", "Flooring",
         "m²", 5500.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "BS EN 13813 / EN 1504",
         42, 82, 72, 58, 60, 22, 0.35,
         "wet,dry,intermediate,coastal",
         "mid,high", "residential,commercial,hotel,apartment", "1-2,3-5", 20,
         "Thin-layer (3mm) polymer-modified cementitious topping applied over structural slab. Seamless minimalist finish with good moisture and scratch resistance when sealed.",
         "Medium", "Western: High, Southern: Medium",
         "Modern,Contemporary,Minimalist",
         45, 42, 65),

        ("Recycled Composite Decking (WPC)",
         "Flooring", "Outdoor balcony, terrace and veranda decking boards", "Flooring",
         "m²", 14500.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "ASTM D7032 / ISO 14021",
         48, 98, 100, 42, 90, 8, 0.22,
         "coastal,wet,extreme coastal",
         "high", "residential,commercial,hotel", "1-2", 30,
         "Wood-plastic composite outdoor decking board manufactured from 95% recycled materials. Completely impervious to moisture and marine corrosion for balconies, terraces, and walkways.",
         "Medium", "Western: High, Southern: Medium",
         "Modern,Contemporary,Tropical",
         92, 48, 90),

        # ═══════════════════════════════════════════════════
        # CEILING (6 materials)
        # ═══════════════════════════════════════════════════
        ("Bamboo-Fibre Acoustic Ceiling Panel",
         "Ceiling", "Sustainable acoustic interior ceiling panels", "Ceiling",
         "m²", 4200.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "ISO 11654 / GREENSL Tier-1",
         68, 62, 72, 10, 95, 18, 0.05,
         "dry,highland,intermediate",
         "mid,high", "residential,commercial,hotel,school", "1-2,3-5", 25,
         "Rapidly renewable compressed bamboo fibre acoustic ceiling panel. Carbon-negative material with warm natural aesthetic for sustainable interiors in dry and highland climates.",
         "Medium", "Western: High, Southern: Medium, Central: Low",
         "Traditional Sri Lankan,Colonial,Tropical,Contemporary",
         98, 68, 35),

        ("Standard Gypsum Board Ceiling (Suspended)",
         "Ceiling", "Dry indoor suspended false ceiling grid", "Ceiling",
         "m²", 2850.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 521 / ASTM C1396",
         48, 38, 32, 5, 46, 38, 0.38,
         "dry,intermediate",
         "low,mid", "residential,commercial,hotel,apartment,school", "1-2,3-5,6+", 15,
         "Standard 12.5mm gypsum plasterboard suspended on lightweight steel grid. Not suitable for humid or coastal zones — highly susceptible to moisture damage and sagging.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Minimalist",
         35, 48, 28),

        ("PVC Laminated Ceiling Panel (Moisture-Proof)",
         "Ceiling", "100% moisture-resistant bathroom and coastal ceiling panels", "Ceiling",
         "m²", 3100.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "BS EN 13245-2",
         42, 98, 82, 5, 28, 8, 0.58,
         "wet,coastal,extreme coastal,intermediate",
         "low,mid", "residential,commercial,apartment", "1-2,3-5", 20,
         "100% moisture-proof PVC interlocking ceiling panel. Ideal for bathrooms, coastal buildings, and high-humidity areas where gypsum would fail within months.",
         "High", "Western: High, Southern: High, Northern: Medium",
         "Modern,Contemporary,Tropical",
         30, 42, 85),

        ("Calcium Silicate Board Ceiling",
         "Ceiling", "Fire-resistant moisture-proof commercial and residential ceiling", "Ceiling",
         "m²", 3600.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "BS 476 Part 4 / ASTM C1186",
         75, 92, 85, 8, 62, 12, 0.28,
         "wet,coastal,extreme coastal,highland,intermediate",
         "mid", "residential,commercial,hotel,apartment,school,industrial", "1-2,3-5,6+", 30,
         "Fire-resistant calcium silicate ceiling board. Immune to moisture, termites, and rot. Excellent performance in humid, coastal, and highland climates as gypsum replacement.",
         "Medium", "Western: High, Southern: Medium",
         "Modern,Contemporary,Minimalist,Tropical",
         55, 75, 88),

        ("Suspended Metal Tile Ceiling (Aluminium)",
         "Ceiling", "Demountable services ceiling for commercial & high-salinity zones", "Ceiling",
         "m²", 6500.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "BS EN 13964 / SLS Ref",
         45, 95, 92, 8, 58, 10, 0.45,
         "coastal,wet,intermediate,dry",
         "mid,high", "commercial,hotel,apartment", "1-2,3-5,6+", 40,
         "Powder-coated aluminium lay-in ceiling tile in 600×600mm format. Demountable for services access, moisture-resistant, and durable in air-conditioned commercial environments.",
         "High", "Western: High, Southern: Medium",
         "Modern,Contemporary,Minimalist",
         65, 45, 80),

        ("Acoustic Mineral Fibre Suspended Tile",
         "Ceiling", "Acoustic absorption ceiling for offices and classrooms", "Ceiling",
         "m²", 4800.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "ASTM E1264 / EN 13964",
         55, 52, 48, 5, 50, 25, 0.32,
         "dry,intermediate",
         "mid", "commercial,hotel,school,apartment", "1-2,3-5,6+", 20,
         "Mineral wool acoustic ceiling tile for office and school environments requiring sound absorption and low reverberation. Not recommended for high-humidity or coastal zones.",
         "Medium", "Western: High",
         "Modern,Contemporary",
         40, 55, 32),

        # ═══════════════════════════════════════════════════
        # WATERPROOFING (5 materials)
        # ═══════════════════════════════════════════════════
        ("Crystalline Slurry Waterproofing (Penetrating)",
         "Waterproofing", "Deep-penetrating integral concrete waterproofing for wet areas & basements", "Waterproofing",
         "m²", 3800.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "ACI 212.3R / BS EN 1504-2",
         10, 100, 95, 15, 58, 5, 0.05,
         "wet,coastal,extreme coastal,intermediate",
         "mid,high", "residential,commercial,hotel,industrial,apartment,school", "1-2,3-5,6+", 60,
         "Deep-penetrating crystalline chemical waterproofing slurry applied to concrete surfaces. Reacts with hydrating cement to form insoluble crystals that permanently seal pores and micro-cracks.",
         "High", "Western: High, Southern: High, Central: High",
         "Modern,Contemporary,Traditional Sri Lankan,Colonial,Minimalist,Tropical",
         48, 10, 88),

        ("Liquid Polyurethane Membrane (Seamless)",
         "Waterproofing", "Flexible crack-bridging membrane for flat roofs and bathrooms", "Waterproofing",
         "m²", 4500.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "ASTM C836 / ETAG 005",
         15, 95, 88, 10, 42, 12, 0.58,
         "wet,coastal,intermediate",
         "mid,high", "residential,commercial,hotel,apartment", "1-2,3-5", 25,
         "Cold-applied liquid polyurethane elastomeric waterproofing membrane. Highly flexible, accommodates structural movement and crack bridging up to 2mm. Suitable for roofs and wet areas.",
         "High", "Western: High, Southern: Medium",
         "Modern,Contemporary,Minimalist",
         35, 15, 80),

        ("Bituminous Modified Membrane (Torch-Applied)",
         "Waterproofing", "Heavy-duty torch-applied barrier for underground structures & podium slabs", "Waterproofing",
         "m²", 4000.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "BS EN 13707 / ASTM D6163",
         20, 92, 82, 12, 38, 18, 0.45,
         "wet,coastal,dry,intermediate",
         "mid", "residential,commercial,industrial,apartment", "1-2,3-5", 20,
         "SBS-modified bitumen torch-applied membrane for flat roofs and underground structures. Robust waterproofing with good puncture resistance.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Traditional Sri Lankan",
         30, 20, 75),

        ("HDPE Sheet Waterproofing Barrier",
         "Waterproofing", "Pre-applied basement and foundation tanking membrane", "Waterproofing",
         "m²", 5800.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "ASTM D5385 / BS 8102 Type A",
         10, 100, 100, 10, 65, 8, 0.38,
         "wet,coastal,extreme coastal,highland",
         "high", "commercial,industrial,hotel,apartment", "1-2,3-5,6+", 50,
         "High-density polyethylene sheet membrane for basement and buried structure waterproofing. Factory-manufactured consistency with heat-welded seams.",
         "Medium", "Western: High, Southern: Low",
         "Modern,Contemporary,Minimalist",
         55, 10, 92),

        ("Bentonite Clay Waterproofing Panel",
         "Waterproofing", "Self-healing below-grade geotextile waterproofing barrier", "Waterproofing",
         "m²", 7200.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "BS 8102 / ASTM D5887",
         12, 98, 88, 8, 85, 5, 0.08,
         "wet,highland,intermediate",
         "mid,high", "commercial,hotel,apartment", "3-5,6+", 40,
         "Natural sodium bentonite clay geotextile panel for below-grade waterproofing. Self-healing on hydration. Eco-friendly, low embodied carbon, no solvents required.",
         "Low", "Western: Low",
         "Modern,Contemporary,Minimalist",
         80, 12, 78),

        # ═══════════════════════════════════════════════════
        # FINISHING / PAINT (3 materials)
        # ═══════════════════════════════════════════════════
        ("Advanced Nano-Exterior Paint",
         "Finishes", "Self-cleaning weather and UV-resistant exterior wall coating", "Finishes",
         "m²", 2100.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 557 / ASTM D6904",
         10, 95, 90, 5, 65, 15, 0.25,
         "coastal,wet,dry,extreme coastal,highland,intermediate",
         "mid,high", "residential,commercial,industrial,hotel,apartment,school", "1-2,3-5,6+", 12,
         "Self-cleaning, high-UV resistant protective paint coating with advanced nano-particles for exterior walls.",
         "High", "Western: High, Southern: Medium",
         "Modern,Contemporary,Minimalist,Tropical",
         30, 15, 80),

        ("Eco-Friendly Low VOC Emulsion",
         "Finishes", "Indoor air quality focused low-emission wall paint", "Finishes",
         "m²", 1650.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 557 / GREENSL Tier-1",
         10, 55, 40, 5, 95, 15, 0.12,
         "dry,wet,intermediate,highland",
         "low,mid", "residential,school", "1-2,3-5", 15,
         "Ultra-low VOC indoor air quality focused water-based paint emulsion for walls.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Minimalist,Traditional Sri Lankan,Tropical,Colonial",
         85, 15, 40),

        ("Standard Exterior Emulsion",
         "Finishes", "Economical weather-resistant exterior acrylic paint", "Finishes",
         "m²", 1250.0, "Preliminary illustrative unit rate (Colombo baseline)", "GreenConstructAI Baseline", "Prototype / illustrative data", "SLS 557 Standard",
         10, 40, 35, 5, 40, 25, 0.25,
         "dry,wet,intermediate",
         "low", "residential,commercial,industrial", "1-2,3-5,6+", 8,
         "Basic weather-resistant acrylic emulsion paint for external wall surfaces.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Traditional Sri Lankan,Colonial",
         40, 10, 55),

        ]  # end materials list

        cur.executemany("""
            INSERT INTO materials (
                Name, Component, Application, Category, Unit, Unit_Rate, Rate_Basis, Data_Source, Data_Quality, Standard_Reference,
                Thermal_Rating, Moisture_Resistance, Corrosion_Resistance, Structural_Capacity, Sustainability_Rating,
                Maintenance_Level, Embodied_Carbon, Suitable_Climates, Budget_Level, Building_Sectors, Floor_Count_Range,
                Service_Life, Description, Local_Availability, Supplier_Density, Style_Compatibility,
                Recyclability_Rating, Thermal_Performance_Rating, Climate_Risk_Score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, materials)

        conn.commit()
        cur.execute("SELECT COUNT(*) FROM materials")
        print(f"[DB] Seeded {cur.fetchone()[0]} materials successfully.")

    conn.close()


def get_all_materials():
    ensure_table()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM materials")
    rows = cur.fetchall()
    conn.close()
    return rows


CANONICAL_COMPONENTS = {
    "Foundation",
    "Structural Frame",
    "Reinforcement",
    "Walling",
    "Roofing",
    "Windows",
    "Doors",
    "Flooring",
    "Ceiling",
    "Finishes",
    "Waterproofing"
}


def normalize_canonical_component(category: str, name: str = "") -> str:
    cat_lc = (category or "").lower().strip()
    name_lc = (name or "").lower().strip()

    # Exact canonical component name matches on category
    if cat_lc in ("waterproofing", "waterproof") or "waterproof" in name_lc or "crystalline slurry" in name_lc or "bentonite" in name_lc:
        return "Waterproofing"

    if "door" in name_lc and "window" not in name_lc:
        return "Doors"
    if any(k in name_lc for k in ("window", "glazing", "double-glazed", "double glazed", "dgu", "louvre window", "glass panel", "casement")) and "door" not in name_lc:
        return "Windows"

    if cat_lc in ("foundation",):
        return "Foundation"
    elif cat_lc in ("structural frame", "concrete") or (cat_lc == "structural" and ("concrete" in name_lc or "mix" in name_lc or "scc" in name_lc)):
        return "Structural Frame"
    elif cat_lc in ("reinforcement", "rebar") or (cat_lc == "structural" and ("rebar" in name_lc or "steel" in name_lc or "gfrp" in name_lc or "ton" in name_lc)):
        return "Reinforcement"
    elif cat_lc in ("walling", "walls", "wall") or ("brick" in name_lc or "block" in name_lc or "cseb" in name_lc):
        return "Walling"
    elif cat_lc in ("roofing", "roof") or ("roof" in name_lc or "corrugated" in name_lc or "shingle" in name_lc or ("tile" in name_lc and "floor" not in name_lc and "ceiling" not in name_lc and "terrazzo" not in name_lc and "ceramic" not in name_lc and "porcelain" not in name_lc)):
        return "Roofing"
    elif cat_lc in ("windows", "window"):
        if "door" in name_lc:
            return "Doors"
        return "Windows"
    elif cat_lc in ("doors", "door"):
        if any(k in name_lc for k in ("window", "glazing", "double-glazed", "double glazed", "dgu", "louvre window", "glass panel", "casement")) and "door" not in name_lc:
            return "Windows"
        return "Doors"
    elif cat_lc in ("openings", "opening"):
        return "Doors" if "door" in name_lc else "Windows"
    elif cat_lc in ("flooring", "floor") or ("tile" in name_lc and "roof" not in name_lc and "ceiling" not in name_lc) or "terrazzo" in name_lc or "screed" in name_lc:
        return "Flooring"
    elif cat_lc in ("ceiling", "ceilings") or "gypsum" in name_lc:
        return "Ceiling"
    elif cat_lc in ("finishing", "finishes", "paint") or "paint" in name_lc or "emulsion" in name_lc:
        return "Finishes"
    elif "rebar" in name_lc or "steel" in name_lc:
        return "Reinforcement"
    elif "concrete" in name_lc:
        return "Structural Frame"
    return "Unknown"


def validate_canonical_component(material: dict, requested_component: str) -> bool:
    """Strict single canonical component validation function (TASK 1).

    For every recommendation:
    - The material's canonical component must exactly match the recommendation slot.
    - Windows must only return materials categorized as Windows.
    - Doors must only return materials categorized as Doors.
    - Flooring must only return Flooring materials.
    - Roofing must only return Roofing materials.
    - Walling must only return Walling materials.
    - Foundation must only return Foundation materials.
    - Structural Frame must only return Structural Frame materials.
    - Reinforcement must only return Reinforcement materials.
    - Ceiling must only return Ceiling materials.
    - Finishes must only return Finishes materials.
    - Waterproofing must only return Waterproofing materials.

    Specifically:
    - A material containing 'Door' must NEVER be classified as Windows.
    - A material containing 'Window', 'Glazing', 'DGU', 'Glass Panel', 'Casement',
      or explicit window metadata must NEVER be classified as Doors.
    """
    if not material or not isinstance(material, dict):
        return False
    name = material.get("Name") or material.get("name", "")
    if not name:
        return False
    name_lc = name.lower().strip()
    raw_comp = material.get("Component") or material.get("component") or material.get("Category") or material.get("category", "")
    canonical = normalize_canonical_component(raw_comp, name)

    # Normalize requested slot
    req_canonical = normalize_canonical_component(requested_component, requested_component)

    if canonical not in CANONICAL_COMPONENTS or req_canonical not in CANONICAL_COMPONENTS:
        return False

    if canonical != req_canonical:
        return False

    # Strict anti-contamination rules
    if req_canonical == "Windows":
        if "door" in name_lc:
            return False
    elif req_canonical == "Doors":
        if any(k in name_lc for k in ("window", "glazing", "double-glazed", "double glazed", "dgu", "glass panel", "casement")) and "door" not in name_lc:
            return False
    elif req_canonical == "Roofing":
        if "waterproof" in name_lc or "waterproof" in (raw_comp or "").lower() or "bentonite" in name_lc or "crystalline" in name_lc:
            return False
    elif req_canonical == "Waterproofing":
        if ("roof" in name_lc and "waterproof" not in name_lc) or ("roof" in (raw_comp or "").lower() and "waterproof" not in (raw_comp or "").lower()):
            return False

    return True


def format_material(row):
    r = dict(row)
    name = r.get("Name", "")
    category = r.get("Category", "")
    component = normalize_canonical_component(r.get("Component") or category, name)
    r["Component"] = component
    # Keep Category aligned with Component if Component is canonical
    if r.get("Category") in ("Openings", "Structural", "Concrete", "Finishing") or not r.get("Category"):
        r["Category"] = component
    unit = r.get("Unit") or "m²"
    unit_rate = float(r.get("Unit_Rate") or 0.0)
    rate_basis = r.get("Rate_Basis") or "Rate unavailable / not included in baseline"
    data_quality = r.get("Data_Quality") or "Prototype / illustrative data"
    standard_ref = r.get("Standard_Reference") or "SLS-Referenced Rule Check"
    application = r.get("Application") or f"{component} application"

    # Derive engineering properties
    structural_cap = int(r.get("Structural_Capacity") or 50)
    moisture_res   = int(r.get("Moisture_Resistance") or 50)
    corrosion_res  = int(r.get("Corrosion_Resistance") or 50)
    service_life   = int(r.get("Service_Life") or 30)
    category_lc    = category.lower()
    name_lc        = name.lower()

    # Durability_Rating: composite of structural capacity + service life + moisture resistance
    durability_score = (structural_cap * 0.50) + (min(service_life, 100) * 0.30) + (moisture_res * 0.20)
    if durability_score >= 70:
        durability_rating = "High"
    elif durability_score >= 45:
        durability_rating = "Medium"
    else:
        durability_rating = "Low"

    # Fire_Resistance: engineering-based derivation from category + material type
    if category_lc in ("foundation", "concrete"):
        fire_resistance = 95
    elif category_lc == "structural":
        if "stainless" in name_lc or "epoxy" in name_lc or "gfrp" in name_lc:
            fire_resistance = 80
        else:
            fire_resistance = 85
    elif category_lc == "walling":
        if "clay" in name_lc or "brick" in name_lc:
            fire_resistance = 90
        elif "aac" in name_lc or "cement" in name_lc or "fly-ash" in name_lc or "cseb" in name_lc:
            fire_resistance = 85
        else:
            fire_resistance = 75
    elif category_lc == "roofing":
        if "clay" in name_lc or "concrete" in name_lc or "cement" in name_lc:
            fire_resistance = 80
        elif "aluminium" in name_lc or "zinc" in name_lc:
            fire_resistance = 70
        elif "polycarbonate" in name_lc:
            fire_resistance = 20
        elif "rubber" in name_lc or "bituminous" in name_lc or "pu core" in name_lc or "insulated" in name_lc:
            fire_resistance = 30
        elif "green" in name_lc:
            fire_resistance = 75
        else:
            fire_resistance = 55
    elif category_lc in ("windows", "doors") or component in ("Windows", "Doors", "Openings"):
        if "aluminium" in name_lc or "steel" in name_lc or "frp" in name_lc:
            fire_resistance = 65
        elif "upvc" in name_lc or "pvc" in name_lc:
            fire_resistance = 35
        elif "teak" in name_lc or "timber" in name_lc or "louvre" in name_lc:
            fire_resistance = 40
        else:
            fire_resistance = 55
    elif category_lc == "flooring":
        if "terrazzo" in name_lc or "porcelain" in name_lc or "ceramic" in name_lc or "micro-cement" in name_lc:
            fire_resistance = 90
        elif "timber" in name_lc:
            fire_resistance = 35
        elif "rubber" in name_lc or "wpc" in name_lc or "composite" in name_lc:
            fire_resistance = 40
        else:
            fire_resistance = 60
    elif category_lc == "ceiling":
        if "calcium silicate" in name_lc:
            fire_resistance = 90
        elif "gypsum" in name_lc:
            fire_resistance = 75
        elif "aluminium" in name_lc or "metal" in name_lc:
            fire_resistance = 70
        elif "pvc" in name_lc:
            fire_resistance = 25
        elif "bamboo" in name_lc:
            fire_resistance = 35
        else:
            fire_resistance = 55
    elif category_lc == "waterproofing":
        if "crystalline" in name_lc or "hdpe" in name_lc or "bentonite" in name_lc:
            fire_resistance = 60
        elif "bituminous" in name_lc:
            fire_resistance = 30
        else:
            fire_resistance = 45
    elif category_lc in ("finishing", "paint"):
        if "nano" in name_lc or "exterior" in name_lc:
            fire_resistance = 50
        else:
            fire_resistance = 45
    else:
        fire_resistance = 55

    return {
        "Material_ID": r["Material_ID"],
        "Name": r["Name"],
        "Component": component,
        "Application": application,
        "Category": category,
        "Unit": unit,
        "Unit_Rate": unit_rate,
        "Rate_LKR": unit_rate,
        "Rate_Basis": rate_basis,
        "Data_Source": r.get("Data_Source") or "GreenConstructAI Baseline",
        "Data_Quality": data_quality,
        "Standard_Reference": standard_ref,
        "Thermal_Rating": int(r.get("Thermal_Rating") or 50),
        "Moisture_Resistance": int(r.get("Moisture_Resistance") or 50),
        "Corrosion_Resistance": int(r.get("Corrosion_Resistance") or 50),
        "Structural_Capacity": int(r.get("Structural_Capacity") or 50),
        "Sustainability_Rating": int(r.get("Sustainability_Rating") or 50),
        "Maintenance_Level": int(r.get("Maintenance_Level") or 50),
        "Embodied_Carbon": float(r.get("Embodied_Carbon") or 0.5),
        "Suitable_Climates": r.get("Suitable_Climates") or "intermediate",
        "Building_Sectors": r.get("Building_Sectors") or "residential,commercial",
        "Floor_Count_Range": r.get("Floor_Count_Range") or "1-2",
        "Service_Life": int(r.get("Service_Life") or 30),
        "Description": r.get("Description") or "",
        "Local_Availability": r.get("Local_Availability") or "Medium",
        "Supplier_Density": r.get("Supplier_Density") or "Western: High",
        "Style_Compatibility": r.get("Style_Compatibility") or "Modern,Contemporary",
        "Recyclability_Rating": int(r.get("Recyclability_Rating") or 50),
        "Thermal_Performance_Rating": int(r.get("Thermal_Performance_Rating") or 50),
        "Climate_Risk_Score": int(r.get("Climate_Risk_Score") or 50),
        "Durability_Rating": durability_rating,
        "Fire_Resistance": fire_resistance,
    }


def insert_history(created_at: str, project_info: str, recommendation: str) -> int:
    """Insert a recommendation snapshot and return its new id."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO recommendation_history (created_at, project_info, recommendation) VALUES (?, ?, ?)",
        (created_at, project_info, recommendation)
    )
    conn.commit()
    row_id = cur.lastrowid
    conn.close()
    return row_id

def get_all_history() -> list[dict]:
    """Return all history entries ordered newest first."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM recommendation_history ORDER BY created_at DESC")
    rows = cur.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_history_by_id(entry_id: int) -> dict | None:
    """Return a single history entry or None if not found."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM recommendation_history WHERE id = ?", (entry_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None

def delete_history(entry_id: int) -> bool:
    """Delete a history entry; returns True if a row was deleted."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM recommendation_history WHERE id = ?", (entry_id,))
    conn.commit()
    deleted = cur.rowcount > 0
    conn.close()
    return deleted
