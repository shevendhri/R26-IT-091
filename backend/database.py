import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "materials.db")

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    return sqlite3.connect(DB_PATH)

def ensure_table():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Drop and recreate to ensure clean schema with all new columns
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='materials'")
    table_exists = cur.fetchone()
    if table_exists:
        cur.execute("PRAGMA table_info(materials)")
        columns = [row[1] for row in cur.fetchall()]
        # Re-seed if new columns are missing
        if "Style_Compatibility" not in columns or "Recyclability_Rating" not in columns:
            print("[DB] Dropping outdated materials table for schema upgrade (adding Style_Compatibility, Recyclability_Rating, etc.)...")
            cur.execute("DROP TABLE IF EXISTS materials")
            conn.commit()
        else:
            # Check if we have enough materials (62+)
            cur.execute("SELECT COUNT(*) FROM materials")
            count = cur.fetchone()[0]
            if count < 62:
                print(f"[DB] Only {count} materials found. Re-seeding with expanded 62 material database...")
                cur.execute("DELETE FROM materials")
                conn.commit()
                # Reset count so that later seeding logic runs
                count = 0

    cur.execute("""
        CREATE TABLE IF NOT EXISTS materials (
            Material_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT,
            Category TEXT,
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
            Description TEXT,
            Local_Availability TEXT,
            Supplier_Density TEXT,
            Style_Compatibility TEXT,
            Recyclability_Rating INTEGER,
            Thermal_Performance_Rating INTEGER,
            Climate_Risk_Score INTEGER
        )
    """)
    conn.commit()

    cur.execute("SELECT COUNT(*) FROM materials")
    if cur.fetchone()[0] == 0:
        print("[DB] Seeding expanded 60+ material database...")
        # Schema:
        # (Name, Category, Thermal_Rating, Moisture_Resistance, Corrosion_Resistance,
        #  Structural_Capacity, Sustainability_Rating, Maintenance_Level, Embodied_Carbon,
        #  Suitable_Climates, Budget_Level, Building_Sectors, Floor_Count_Range, Service_Life,
        #  Description, Local_Availability, Supplier_Density, Style_Compatibility,
        #  Recyclability_Rating, Thermal_Performance_Rating, Climate_Risk_Score)

        materials = [

        # ═══════════════════════════════════════════════════
        # FOUNDATION (5 materials)
        # ═══════════════════════════════════════════════════
        ("Gr. 25 Standard Concrete Foundation",
         "Foundation", 40, 65, 45, 75, 55, 20, 0.45,
         "wet,dry,intermediate,highland",
         "mid", "residential,commercial,hotel,school,apartment", "1-2,3-5", 50,
         "Standard M25 structural concrete for pad and strip foundations in low-rise buildings. Suitable for non-aggressive soils under moderate load.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Traditional Sri Lankan,Colonial,Minimalist,Tropical",
         40, 40, 60),

        ("Gr. 30 Marine-Grade Concrete Foundation",
         "Foundation", 45, 98, 98, 88, 48, 15, 0.68,
         "coastal,extreme coastal",
         "high", "residential,commercial,hotel,industrial,apartment,school", "1-2,3-5,6+", 100,
         "Sulphate-resistant dense-mix M30 concrete with silica fume and corrosion inhibitors. Mandatory for coastal and saline-soil foundations to resist chloride-induced corrosion.",
         "High", "Western: High, Southern: High, Northern: Medium, Eastern: Medium",
         "Modern,Contemporary,Tropical,Minimalist",
         35, 45, 98),

        ("Eco-Concrete Foundation (30% Recycled Aggregate)",
         "Foundation", 42, 65, 50, 72, 90, 20, 0.30,
         "dry,wet,intermediate,highland",
         "mid", "residential,commercial,apartment,school", "1-2,3-5", 50,
         "Sustainable M25-equivalent concrete using 30% recycled crushed aggregate and fly-ash blended cement. Reduces embodied carbon by 35% vs standard mix.",
         "Medium", "Western: High, Southern: Medium, Central: Low",
         "Modern,Contemporary,Minimalist",
         85, 40, 60),

        ("Raft Foundation Assembly (RC Heavy)",
         "Foundation", 35, 92, 85, 98, 42, 12, 0.80,
         "wet,coastal,dry,intermediate",
         "high", "commercial,hotel,apartment,industrial", "3-5,6+", 120,
         "Heavily reinforced raft slab system distributing loads across full footprint. Ideal for soft ground conditions, high-occupancy buildings, and seismically active zones.",
         "Medium", "Western: High, Southern: Medium, Central: Low",
         "Modern,Contemporary",
         30, 35, 85),

        ("Lime-Pozzolan Natural Foundation",
         "Foundation", 50, 60, 40, 60, 92, 25, 0.12,
         "dry,intermediate,highland",
         "mid", "residential", "1-2", 80,
         "Traditional hydraulic lime and volcanic pozzolan foundation mortar. Near-zero embodied carbon with good load transfer for low-rise residential in non-aggressive soil conditions.",
         "Low", "Central: Low, North Central: Medium",
         "Traditional Sri Lankan,Colonial",
         90, 50, 45),

        # ═══════════════════════════════════════════════════
        # CONCRETE MIXES (4 materials)
        # ═══════════════════════════════════════════════════
        ("Gr. 25 Standard Structural Concrete",
         "Concrete", 40, 65, 50, 80, 52, 25, 0.45,
         "wet,dry,intermediate,highland",
         "low,mid", "residential,commercial,hotel,apartment,school,industrial", "1-2,3-5", 60,
         "Standard M25 ready-mix concrete for columns, beams, and suspended slabs. Meets SLS 614 requirements for structural elements in non-aggressive environments.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Traditional Sri Lankan,Colonial,Minimalist,Tropical",
         40, 40, 60),

        ("Gr. 30 Marine-Grade Concrete Mix",
         "Concrete", 45, 98, 98, 90, 46, 15, 0.68,
         "coastal,extreme coastal",
         "mid,high", "residential,commercial,hotel,industrial,apartment", "1-2,3-5,6+", 100,
         "High-durability dense M30 concrete with 5% silica fume, maximum w/c ratio 0.40, and corrosion inhibitors. Required for all structural elements within 1km of the coast.",
         "High", "Western: High, Southern: High, Northern: Medium, Eastern: Medium",
         "Modern,Contemporary,Tropical,Minimalist",
         35, 45, 98),

        ("Eco-Concrete (Recycled Aggregate + Fly-Ash)",
         "Concrete", 42, 65, 48, 75, 92, 22, 0.28,
         "dry,wet,intermediate,highland",
         "mid", "residential,commercial,apartment,school", "1-2,3-5", 50,
         "Low-carbon structural concrete incorporating 30% recycled coarse aggregate and 20% fly-ash cement replacement. Reduces embodied carbon by 38% vs conventional M25.",
         "Medium", "Western: High, Southern: Medium, Central: Low",
         "Modern,Contemporary,Minimalist",
         88, 40, 60),

        ("Self-Compacting Concrete (SCC)",
         "Concrete", 45, 80, 75, 85, 50, 15, 0.55,
         "wet,dry,coastal,intermediate",
         "high", "commercial,hotel,apartment", "3-5,6+", 65,
         "High-flow self-compacting concrete for congested reinforcement zones. Eliminates vibration requirement and ensures dense, void-free structural elements.",
         "Medium", "Western: High",
         "Modern,Contemporary",
         40, 45, 75),

        # ═══════════════════════════════════════════════════
        # STRUCTURAL REBAR (5 materials)
        # ═══════════════════════════════════════════════════
        ("Epoxy-Coated Rebar (ASTM A775)",
         "Structural", 10, 98, 100, 98, 42, 8, 0.88,
         "coastal,extreme coastal",
         "high", "residential,commercial,hotel,industrial,apartment,school", "1-2,3-5,6+", 120,
         "Fusion-bonded epoxy-coated high-yield deformed reinforcement bar. Essential for marine and coastal structures where chloride-induced corrosion is the primary durability threat.",
         "Medium", "Western: High, Southern: Medium, Eastern: Low",
         "Modern,Contemporary,Tropical,Minimalist",
         25, 10, 98),

        ("TMT High-Yield Rebar (SLS 375)",
         "Structural", 10, 68, 42, 92, 55, 28, 0.55,
         "dry,wet,intermediate,highland",
         "mid,high", "residential,commercial,hotel,apartment,school", "1-2,3-5,6+", 65,
         "Thermo-mechanically treated Fe500D high-yield deformed steel bars per SLS 375. Standard reinforcement for inland and non-coastal structural concrete frames.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Traditional Sri Lankan,Minimalist,Tropical",
         35, 10, 55),

        ("Galvanized Steel Rebar (Hot-Dip)",
         "Structural", 10, 85, 85, 90, 50, 15, 0.75,
         "coastal,wet,extreme coastal",
         "high", "residential,commercial,hotel,apartment", "1-2,3-5", 80,
         "Hot-dip galvanized deformed reinforcement bar with 85μm zinc coating. Good corrosion resistance for moderately aggressive marine environments without full epoxy specification.",
         "Low", "Western: Medium, Southern: Low",
         "Modern,Contemporary,Tropical",
         50, 10, 80),

        ("Stainless Steel Rebar (Grade 316L)",
         "Structural", 10, 100, 100, 95, 35, 5, 1.25,
         "coastal,extreme coastal",
         "high", "commercial,hotel,industrial", "3-5,6+", 150,
         "Grade 316L austenitic stainless steel reinforcement for extreme chloride exposure. Premium specification for bridge decks, marine infrastructure, and critical coastal structures.",
         "Low", "Western: Low",
         "Modern,Contemporary,Minimalist",
         65, 10, 100),

        ("GFRP Rebar (Glass Fibre Reinforced Polymer)",
         "Structural", 10, 100, 100, 80, 80, 5, 0.55,
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
         "Walling", 88, 68, 48, 68, 85, 18, 0.22,
         "highland,intermediate,dry,wet",
         "mid,high", "residential,hotel,school", "1-2", 80,
         "Traditional machine-cut high-density clay bricks with excellent thermal mass. Natural breathable material ideal for highland and intermediate zones where thermal comfort is critical.",
         "High", "Western: High, Southern: High, North Western: High",
         "Traditional Sri Lankan,Colonial,Tropical",
         75, 88, 50),

        ("AAC Eco-Block G4 (Autoclaved Aerated Concrete)",
         "Walling", 98, 55, 42, 48, 88, 28, 0.15,
         "dry,intermediate,highland",
         "mid", "residential,commercial,apartment,hotel,school", "1-2,3-5", 50,
         "Factory-made lightweight aerated concrete block with R-value 3× better than standard brick. Reduces structural dead load by 60% and provides superior thermal insulation.",
         "Medium", "Western: High, Southern: Medium, Central: Low",
         "Modern,Contemporary,Minimalist",
         50, 98, 40),

        ("High-Density Cement Block",
         "Walling", 48, 78, 58, 58, 46, 48, 0.38,
         "dry,wet,intermediate",
         "low,mid", "residential,commercial,apartment,hotel,school,industrial", "1-2,3-5", 40,
         "Standard solid or hollow dense aggregate concrete block. Workhorse walling unit for general construction with adequate structural performance and high local availability.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Minimalist,Tropical",
         40, 48, 55),

        ("CSEB Compressed Stabilized Earth Block",
         "Walling", 92, 58, 48, 62, 98, 22, 0.08,
         "dry,intermediate,highland",
         "mid", "residential,school", "1-2", 60,
         "Manually or machine-pressed stabilized soil blocks with 5-8% cement. Lowest embodied carbon walling material, excellent thermal mass, carbon-negative lifecycle when using unfired soil.",
         "Medium", "Southern: Medium, North Central: Medium, Uva: Low",
         "Traditional Sri Lankan,Tropical",
         92, 92, 40),

        ("Hollow Clay Block (Perforated)",
         "Walling", 75, 62, 50, 55, 78, 20, 0.18,
         "wet,intermediate,highland,dry",
         "mid", "residential,commercial,hotel,apartment,school", "1-2,3-5", 65,
         "Extruded hollow clay partition block with vertical perforations. Better thermal performance than solid brick due to air cavities, while maintaining traditional clay aesthetics.",
         "Medium", "Western: High, Southern: High",
         "Traditional Sri Lankan,Colonial,Tropical",
         70, 78, 48),

        ("Fly-Ash Composite Block",
         "Walling", 55, 72, 55, 60, 80, 25, 0.20,
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
         "Roofing", 45, 98, 98, 15, 65, 8, 0.48,
         "coastal,extreme coastal,wet",
         "mid,high", "residential,commercial,hotel,industrial,apartment", "1-2,3-5", 45,
         "Anodized aluminium roofing sheet with 0.55mm gauge for severe salt-air and coastal environments. Corrosion-proof with reflective finish reducing solar heat gain.",
         "High", "Western: High, Southern: High, Northern: High",
         "Modern,Contemporary,Tropical",
         75, 45, 95),

        ("Portuguese Clay Tile (Unglazed Terracotta)",
         "Roofing", 92, 88, 95, 10, 85, 18, 0.18,
         "highland,intermediate,wet",
         "mid,high", "residential,hotel,school", "1-2", 65,
         "Traditional half-round terracotta roofing tiles with natural breathability. Excellent thermal mass and moisture management. Heritage aesthetic for highland and intermediate zones.",
         "High", "Western: High, Southern: High, North Western: High",
         "Traditional Sri Lankan,Colonial,Tropical",
         82, 92, 45),

        ("Insulated Sandwich Roof Panel (PU Core)",
         "Roofing", 95, 85, 72, 20, 52, 22, 0.58,
         "dry,intermediate,industrial",
         "mid,high", "commercial,hotel,industrial", "1-2,3-5", 35,
         "Factory-assembled rigid polyurethane core sandwich panel with steel face sheets. High thermal insulation and fast installation for commercial spans.",
         "High", "Western: High, Gampaha: High",
         "Modern,Contemporary",
         40, 95, 65),

        ("Standard Cement Tile (Concrete Interlocking)",
         "Roofing", 55, 88, 78, 10, 42, 32, 0.45,
         "wet,dry,intermediate",
         "low,mid", "residential,school,apartment", "1-2", 40,
         "Concrete interlocking roof tiles with standard weather seal. Economical and widely available. Suited for pitched roofs in non-coastal areas.",
         "High", "All Provinces: High",
         "Traditional Sri Lankan,Colonial",
         38, 55, 55),

        ("Zinc-Aluminium Corrugated Sheet (55% Al-Zn)",
         "Roofing", 42, 95, 92, 12, 60, 10, 0.42,
         "coastal,wet,intermediate,dry",
         "mid", "residential,commercial,apartment,industrial", "1-2,3-5", 50,
         "55% aluminium-zinc alloy coated corrugated roofing sheet (Zincalume equivalent). Superior corrosion resistance in tropical and coastal climates vs plain galvanized steel.",
         "High", "Western: High, Southern: High, Northern: High",
         "Modern,Contemporary,Tropical",
         60, 42, 85),

        ("Green Intensive Roof System (Growing Medium)",
         "Roofing", 98, 95, 90, 15, 98, 28, 0.10,
         "wet,intermediate",
         "high", "commercial,hotel,apartment", "3-5,6+", 50,
         "Engineered soil + drainage + waterproof membrane green roof. Maximum stormwater management, urban heat island mitigation, and biodiversity gain. Premium sustainable specification.",
         "Low", "Western: Medium",
         "Modern,Contemporary,Minimalist",
         95, 98, 70),

        ("Polycarbonate Translucent Roofing",
         "Roofing", 55, 92, 80, 8, 55, 20, 0.55,
         "wet,dry,intermediate",
         "mid", "commercial,hotel,school", "1-2,3-5", 20,
         "Multi-wall polycarbonate sheets for natural-light roofing of atriums, corridors, and covered walkways. UV stabilized with anti-drip coating.",
         "Medium", "Western: High, Southern: Medium",
         "Modern,Contemporary",
         45, 55, 60),

        ("Recycled Rubber Flat Roof Membrane",
         "Roofing", 40, 98, 80, 8, 75, 15, 0.30,
         "wet,coastal,intermediate",
         "mid", "residential,commercial,apartment", "1-2,3-5", 35,
         "EPDM-equivalent flat roof membrane made from recycled automotive rubber. High flexibility, UV resistant, and produced from waste streams for sustainability points.",
         "Low", "Western: Medium",
         "Modern,Contemporary,Minimalist",
         85, 40, 72),

        # ═══════════════════════════════════════════════════
        # WINDOWS (6 materials)
        # ═══════════════════════════════════════════════════
        ("uPVC Multi-Chamber Window System",
         "Windows", 95, 98, 100, 15, 82, 8, 0.28,
         "coastal,highland,wet,extreme coastal,intermediate",
         "high", "residential,commercial,hotel,apartment,school", "1-2,3-5,6+", 45,
         "Multi-chamber uPVC profile with double-glazed low-E unit. Highest thermal insulation and zero corrosion risk. Ideal for coastal salinity, highland cold, and humid zones.",
         "High", "Western: High, Southern: Medium, Central: Medium",
         "Modern,Contemporary,Minimalist",
         42, 95, 90),

        ("Casement Aluminium Window (Powder-Coated)",
         "Windows", 60, 92, 92, 15, 55, 15, 0.45,
         "coastal,wet,intermediate,dry,extreme coastal",
         "mid,high", "residential,commercial,hotel,apartment,school", "1-2,3-5,6+", 40,
         "Powder-coated aluminium casement window with thermal break. Good corrosion resistance for coastal zones with modern aesthetic. Cost-effective alternative to uPVC.",
         "High", "Western: High, Southern: High, Northern: Medium",
         "Modern,Contemporary,Tropical",
         50, 60, 82),

        ("Timber Louvre Window (Treated Hardwood)",
         "Windows", 80, 62, 55, 10, 75, 42, 0.25,
         "highland,intermediate,dry",
         "mid", "residential,hotel,school", "1-2", 40,
         "Adjustable hardwood louvre window promoting natural cross-ventilation. Traditional Sri Lankan architectural element with excellent passive cooling. Not recommended for coastal zones.",
         "Medium", "Western: High, Central: Medium",
         "Traditional Sri Lankan,Colonial,Tropical",
         70, 82, 38),

        ("Commercial Double-Glazed Unit (DGU Low-E)",
         "Windows", 92, 92, 88, 20, 72, 18, 0.58,
         "coastal,urban,wet,intermediate",
         "high", "commercial,hotel,apartment", "3-5,6+", 40,
         "Low-emissivity double-glazed unit with argon fill for commercial curtain wall and window systems. Superior solar control and thermal performance for air-conditioned spaces.",
         "High", "Western: High",
         "Modern,Contemporary,Minimalist",
         38, 92, 80),

        ("Fixed Aluminium Framed Glass Panel",
         "Windows", 55, 92, 90, 10, 50, 10, 0.42,
         "coastal,wet,dry,intermediate",
         "mid", "residential,commercial,hotel", "1-2,3-5", 35,
         "Fixed vision glazing panel in aluminium frame. Low maintenance, high light transmission for façade apertures where ventilation is not required.",
         "High", "Western: High, Southern: High",
         "Modern,Contemporary,Minimalist,Tropical",
         45, 55, 78),

        ("Sliding Aluminium Window (Impact-Resistant)",
         "Windows", 65, 95, 95, 12, 52, 12, 0.40,
         "coastal,extreme coastal,wet",
         "mid", "residential,commercial,hotel,apartment", "1-2,3-5", 38,
         "Marine-grade anodized aluminium sliding window with impact-resistant glazing. Specified for cyclone-prone coastal zones with tested wind load resistance.",
         "Medium", "Western: High, Southern: Medium, Northern: Medium",
         "Modern,Contemporary,Tropical",
         48, 65, 92),

        # ═══════════════════════════════════════════════════
        # DOORS (7 materials)
        # ═══════════════════════════════════════════════════
        ("Solid Teak Timber Door (Premium)",
         "Doors", 48, 82, 82, 42, 75, 42, 0.22,
         "wet,dry,highland,intermediate",
         "high", "residential,commercial,hotel,school", "1-2,3-5,6+", 80,
         "Hand-crafted solid Burma or Sri Lankan teak door panel with mortise and tenon joinery. Superior durability in non-coastal zones with premium aesthetic for traditional and colonial styles.",
         "High", "Western: High, Southern: High, Central: Medium",
         "Traditional Sri Lankan,Colonial,Tropical",
         65, 48, 42),

        ("Aluminium Profile Glass Door (Heavy-Duty)",
         "Doors", 52, 95, 95, 48, 52, 22, 0.58,
         "coastal,wet,intermediate,extreme coastal,dry",
         "mid,high", "residential,commercial,hotel,apartment,industrial", "1-2,3-5,6+", 50,
         "Heavy-duty powder-coated aluminium profile door with full-height glazed panel. Excellent for coastal salinity resistance with contemporary aesthetic.",
         "High", "Western: High, Southern: Medium",
         "Modern,Contemporary,Minimalist",
         52, 52, 88),

        ("FRP Fiberglass Reinforced Door",
         "Doors", 42, 98, 100, 42, 65, 12, 0.48,
         "coastal,wet,extreme coastal",
         "high", "residential,commercial,hotel,apartment,industrial", "1-2,3-5,6+", 60,
         "Glass fibre reinforced polymer door leaf. Completely immune to marine corrosion, moisture, salt spray, and biological attack. Premium specification for aggressive coastal environments.",
         "Medium", "Western: High, Southern: Medium, Eastern: Low",
         "Modern,Contemporary,Tropical",
         55, 42, 98),

        ("Standard Hollow-Core Flush Door (HDF Faced)",
         "Doors", 32, 42, 32, 28, 42, 48, 0.38,
         "dry,intermediate",
         "low,mid", "residential,commercial,apartment,school", "1-2,3-5", 20,
         "Hollow-core internal flush door with HDF facing and timber frame. Cost-effective interior partition door for dry and intermediate climate zones only.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Minimalist",
         30, 32, 28),

        ("Steel Security Door (Powder-Coated)",
         "Doors", 35, 75, 70, 85, 40, 25, 0.72,
         "dry,intermediate,wet",
         "mid", "residential,commercial,apartment,school", "1-2,3-5,6+", 40,
         "Heavy-gauge steel security door with multi-point locking and powder-coat finish. High structural resistance for entrance and security-sensitive openings.",
         "High", "All Provinces: High",
         "Modern,Contemporary",
         40, 35, 55),

        ("Timber Louvre Door (Ventilated Hardwood)",
         "Doors", 75, 65, 58, 30, 72, 38, 0.20,
         "highland,intermediate,dry,wet",
         "mid", "residential,hotel,school", "1-2", 45,
         "Hardwood slatted louvre door promoting passive ventilation while maintaining privacy. Traditional Sri Lankan architectural element unsuited for direct coastal exposure.",
         "Medium", "Western: High, Central: High, Southern: Medium",
         "Traditional Sri Lankan,Colonial,Tropical",
         68, 78, 38),

        ("UPVC Sliding Door (Weather-Sealed)",
         "Doors", 88, 98, 100, 20, 80, 10, 0.32,
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
         "Flooring", 58, 92, 78, 52, 75, 12, 0.22,
         "wet,dry,intermediate,highland",
         "mid,high", "residential,commercial,hotel,apartment,school", "1-2,3-5", 65,
         "Seamless monolithic terrazzo floor with marble chip aggregate and white cement matrix. Timeless durability with near-zero maintenance when sealed correctly. Traditional Sri Lankan aesthetic.",
         "High", "All Provinces: High",
         "Traditional Sri Lankan,Colonial,Tropical,Contemporary",
         72, 58, 58),

        ("Porcelain GVT Slab (Full-Body Vitrified)",
         "Flooring", 48, 95, 88, 48, 65, 8, 0.42,
         "wet,coastal,intermediate,dry",
         "high", "residential,commercial,hotel,apartment", "1-2,3-5", 45,
         "Large-format full-body vitrified porcelain tile with digital-print finish. Stain-resistant, scratch-proof surface with high design flexibility for contemporary interiors.",
         "High", "Western: High, Southern: High",
         "Modern,Contemporary,Minimalist",
         40, 48, 68),

        ("Standard Ceramic Floor Tile",
         "Flooring", 38, 90, 85, 45, 42, 18, 0.35,
         "wet,dry,intermediate",
         "low,mid", "residential,commercial,apartment,school", "1-2,3-5,6+", 25,
         "Standard glazed ceramic floor tile in 300×300mm and 400×400mm format. Economical, widely available, adequate for general residential and commercial applications.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Minimalist,Tropical,Traditional Sri Lankan",
         38, 38, 55),

        ("Timber Strip Flooring (Treated Hardwood)",
         "Flooring", 88, 55, 52, 40, 72, 45, 0.28,
         "highland,intermediate,dry",
         "mid,high", "residential,hotel", "1-2", 40,
         "Kiln-dried and treated hardwood strip flooring. Excellent thermal comfort in highland zones. Must be protected from moisture — not suitable for coastal or wet zones.",
         "Medium", "Western: High, Central: Medium",
         "Traditional Sri Lankan,Colonial,Tropical,Contemporary",
         68, 88, 38),

        ("Rubber Flooring (Recycled Automotive)",
         "Flooring", 55, 98, 88, 48, 80, 8, 0.28,
         "wet,coastal,intermediate",
         "mid", "commercial,industrial,school", "1-2,3-5,6+", 30,
         "Recycled automotive rubber tile for wet-area, gym, laboratory, and commercial utility floors. Non-slip, shock-absorbent, and fully recyclable end-of-life.",
         "Medium", "Western: High, Southern: Medium",
         "Modern,Contemporary",
         92, 55, 68),

        ("Micro-Cement Screed Flooring",
         "Flooring", 42, 82, 72, 58, 60, 22, 0.35,
         "wet,dry,intermediate,coastal",
         "mid,high", "residential,commercial,hotel,apartment", "1-2,3-5", 20,
         "Thin-layer (3mm) polymer-modified cementitious topping applied over structural slab. Seamless minimalist finish with good moisture and scratch resistance when sealed.",
         "Medium", "Western: High, Southern: Medium",
         "Modern,Contemporary,Minimalist",
         45, 42, 65),

        ("Recycled Composite Decking (WPC)",
         "Flooring", 48, 98, 100, 42, 90, 8, 0.22,
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
         "Ceiling", 68, 62, 72, 10, 95, 18, 0.05,
         "dry,highland,intermediate",
         "mid,high", "residential,commercial,hotel,school", "1-2,3-5", 25,
         "Rapidly renewable compressed bamboo fibre acoustic ceiling panel. Carbon-negative material with warm natural aesthetic for sustainable interiors in dry and highland climates.",
         "Medium", "Western: High, Southern: Medium, Central: Low",
         "Traditional Sri Lankan,Colonial,Tropical,Contemporary",
         98, 68, 35),

        ("Standard Gypsum Board Ceiling (Suspended)",
         "Ceiling", 48, 38, 32, 5, 46, 38, 0.38,
         "dry,intermediate",
         "low,mid", "residential,commercial,hotel,apartment,school", "1-2,3-5,6+", 15,
         "Standard 12.5mm gypsum plasterboard suspended on lightweight steel grid. Not suitable for humid or coastal zones — highly susceptible to moisture damage and sagging.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Minimalist",
         35, 48, 28),

        ("PVC Laminated Ceiling Panel (Moisture-Proof)",
         "Ceiling", 42, 98, 82, 5, 28, 8, 0.58,
         "wet,coastal,extreme coastal,intermediate",
         "low,mid", "residential,commercial,apartment", "1-2,3-5", 20,
         "100% moisture-proof PVC interlocking ceiling panel. Ideal for bathrooms, coastal buildings, and high-humidity areas where gypsum would fail within months.",
         "High", "Western: High, Southern: High, Northern: Medium",
         "Modern,Contemporary,Tropical",
         30, 42, 85),

        ("Calcium Silicate Board Ceiling",
         "Ceiling", 75, 92, 85, 8, 62, 12, 0.28,
         "wet,coastal,extreme coastal,highland,intermediate",
         "mid", "residential,commercial,hotel,apartment,school,industrial", "1-2,3-5,6+", 30,
         "Fire-resistant calcium silicate ceiling board. Immune to moisture, termites, and rot. Excellent performance in humid, coastal, and highland climates as gypsum replacement.",
         "Medium", "Western: High, Southern: Medium",
         "Modern,Contemporary,Minimalist,Tropical",
         55, 75, 88),

        ("Suspended Metal Tile Ceiling (Aluminium)",
         "Ceiling", 45, 95, 92, 8, 58, 10, 0.45,
         "coastal,wet,intermediate,dry",
         "mid,high", "commercial,hotel,apartment", "1-2,3-5,6+", 40,
         "Powder-coated aluminium lay-in ceiling tile in 600×600mm format. Demountable for services access, moisture-resistant, and durable in air-conditioned commercial environments.",
         "High", "Western: High, Southern: Medium",
         "Modern,Contemporary,Minimalist",
         65, 45, 80),

        ("Acoustic Mineral Fibre Suspended Tile",
         "Ceiling", 55, 52, 48, 5, 50, 25, 0.32,
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
         "Waterproofing", 10, 100, 95, 15, 58, 5, 0.05,
         "wet,coastal,extreme coastal,intermediate",
         "mid,high", "residential,commercial,hotel,industrial,apartment,school", "1-2,3-5,6+", 60,
         "Deep-penetrating crystalline chemical waterproofing slurry applied to concrete surfaces. Reacts with hydrating cement to form insoluble crystals that permanently seal pores and micro-cracks.",
         "High", "Western: High, Southern: High, Central: High",
         "Modern,Contemporary,Traditional Sri Lankan,Colonial,Minimalist,Tropical",
         48, 10, 88),

        ("Liquid Polyurethane Membrane (Seamless)",
         "Waterproofing", 15, 95, 88, 10, 42, 12, 0.58,
         "wet,coastal,intermediate",
         "mid,high", "residential,commercial,hotel,apartment", "1-2,3-5", 25,
         "Cold-applied liquid polyurethane elastomeric waterproofing membrane. Highly flexible, accommodates structural movement and crack bridging up to 2mm. Suitable for roofs and wet areas.",
         "High", "Western: High, Southern: Medium",
         "Modern,Contemporary,Minimalist",
         35, 15, 80),

        ("Bituminous Modified Membrane (Torch-Applied)",
         "Waterproofing", 20, 92, 82, 12, 38, 18, 0.45,
         "wet,coastal,dry,intermediate",
         "mid", "residential,commercial,industrial,apartment", "1-2,3-5", 20,
         "SBS-modified bitumen torch-applied membrane for flat roofs and underground structures. Robust waterproofing with good puncture resistance but higher maintenance than crystalline systems.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Traditional Sri Lankan",
         30, 20, 75),

        ("HDPE Sheet Waterproofing Barrier",
         "Waterproofing", 10, 100, 100, 10, 65, 8, 0.38,
         "wet,coastal,extreme coastal,highland",
         "high", "commercial,industrial,hotel,apartment", "1-2,3-5,6+", 50,
         "High-density polyethylene sheet membrane for basement and buried structure waterproofing. Factory-manufactured consistency with heat-welded seams for zero-leak guarantee.",
         "Medium", "Western: High, Southern: Low",
         "Modern,Contemporary,Minimalist",
         55, 10, 92),

        ("Bentonite Clay Waterproofing Panel",
         "Waterproofing", 12, 98, 88, 8, 85, 5, 0.08,
         "wet,highland,intermediate",
         "mid,high", "commercial,hotel,apartment", "3-5,6+", 40,
         "Natural sodium bentonite clay geotextile panel for below-grade waterproofing. Self-healing on hydration. Eco-friendly, low embodied carbon, no solvents or chemical cure required.",
         "Low", "Western: Low",
         "Modern,Contemporary,Minimalist",
         80, 12, 78),

        # ═══════════════════════════════════════════════════
        # FINISHING / PAINT (3 materials)
        # ═══════════════════════════════════════════════════
        ("Advanced Nano-Exterior Paint",
         "Finishing", 10, 95, 90, 5, 65, 15, 0.25,
         "coastal,wet,dry,extreme coastal,highland,intermediate",
         "mid,high", "residential,commercial,industrial,hotel,apartment,school", "1-2,3-5,6+", 12,
         "Self-cleaning, high-UV resistant protective paint coating with advanced nano-particles for exterior walls.",
         "High", "Western: High, Southern: Medium",
         "Modern,Contemporary,Minimalist,Tropical",
         30, 15, 80),

        ("Eco-Friendly Low VOC Emulsion",
         "Finishing", 10, 55, 40, 5, 95, 15, 0.12,
         "dry,wet,intermediate,highland",
         "low,mid", "residential,school", "1-2,3-5", 15,
         "Ultra-low VOC indoor air quality focused water-based paint emulsion for walls.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Minimalist,Traditional Sri Lankan,Tropical,Colonial",
         85, 15, 40),

        ("Standard Exterior Emulsion",
         "Finishing", 10, 40, 35, 5, 40, 25, 0.25,
         "dry,wet,intermediate",
         "low", "residential,commercial,industrial", "1-2,3-5,6+", 8,
         "Basic weather-resistant acrylic emulsion paint for external wall surfaces.",
         "High", "All Provinces: High",
         "Modern,Contemporary,Traditional Sri Lankan,Colonial",
         40, 10, 55),

        ]  # end materials list

        cur.executemany("""
            INSERT INTO materials (
                Name, Category, Thermal_Rating, Moisture_Resistance,
                Corrosion_Resistance, Structural_Capacity, Sustainability_Rating,
                Maintenance_Level, Embodied_Carbon, Suitable_Climates, Budget_Level,
                Building_Sectors, Floor_Count_Range, Service_Life, Description,
                Local_Availability, Supplier_Density, Style_Compatibility,
                Recyclability_Rating, Thermal_Performance_Rating, Climate_Risk_Score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, materials)

        conn.commit()
        cur.execute("SELECT COUNT(*) FROM materials")
        print(f"[DB] Seeded {cur.fetchone()[0]} materials successfully.")

    conn.close()


def get_all_materials():
    ensure_table()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM materials")
    rows = cur.fetchall()
    conn.close()
    return rows


def format_material(row):
    r = dict(row)
    name = r.get("Name", "")
    category = r.get("Category", "")
    
    # Pre-coded rate mapping to ensure cost scoring works seamlessly
    rate_map = {
        "standard concrete foundation": 34500.0,
        "marine-grade concrete foundation": 48000.0,
        "eco-concrete foundation": 38000.0,
        "raft foundation": 85000.0,
        "lime-pozzolan natural foundation": 29000.0,
        "standard structural concrete": 32500.0,
        "marine-grade concrete mix": 45000.0,
        "eco-concrete": 35000.0,
        "self-compacting concrete": 42000.0,
        "epoxy-coated rebar": 545000.0,
        "tmt high-yield rebar": 395000.0,
        "galvanized steel rebar": 425000.0,
        "stainless steel rebar": 780000.0,
        "gfrp rebar": 490000.0,
        "wire-cut clay brick": 3100.0,
        "aac eco-block": 4500.0,
        "high-density cement block": 2650.0,
        "cseb compressed stabilized earth block": 3800.0,
        "hollow clay block": 3400.0,
        "fly-ash composite block": 2900.0,
        "marine-grade aluminium": 7800.0,
        "portuguese clay tile": 6900.0,
        "insulated sandwich roof panel": 9500.0,
        "standard cement tile": 3800.0,
        "zinc-aluminium corrugated": 5200.0,
        "green intensive roof": 24000.0,
        "polycarbonate translucent": 4500.0,
        "recycled rubber flat roof": 6200.0,
        "upvc multi-chamber window": 72000.0,
        "casement aluminium window": 48000.0,
        "timber louvre window": 35000.0,
        "commercial double-glazed": 95000.0,
        "fixed aluminium framed": 28000.0,
        "sliding aluminium window": 42000.0,
        "solid teak timber door": 120000.0,
        "aluminium profile glass door": 85000.0,
        "frp fiberglass reinforced door": 98000.0,
        "standard hollow-core flush door": 22000.0,
        "steel security door": 65000.0,
        "timber louvre door": 45000.0,
        "upvc sliding door": 78000.0,
        "polished terrazzo": 7200.0,
        "porcelain gvt slab": 9800.0,
        "standard ceramic floor": 4200.0,
        "timber strip flooring": 11000.0,
        "rubber flooring": 8500.0,
        "micro-cement screed": 5500.0,
        "recycled composite decking": 14500.0,
        "bamboo-fibre acoustic ceiling": 4200.0,
        "standard gypsum board ceiling": 2850.0,
        "pvc laminated ceiling": 3100.0,
        "calcium silicate board ceiling": 3600.0,
        "suspended metal tile ceiling": 6500.0,
        "acoustic mineral fibre": 4800.0,
        "crystalline slurry": 3800.0,
        "liquid polyurethane membrane": 4500.0,
        "bituminous modified membrane": 4000.0,
        "hdpe sheet waterproofing": 5800.0,
        "bentonite clay waterproofing": 7200.0,
        "advanced nano-exterior paint": 2100.0,
        "eco-friendly low voc emulsion": 1650.0,
        "standard exterior emulsion": 1250.0
    }
    
    rate = 0.0
    name_lower = name.lower()
    for key, val in rate_map.items():
        if key in name_lower:
            rate = val
            break
            
    if rate == 0.0:
        cat_lower = category.lower()
        if "structural" in cat_lower:
            rate = 395000.0
        elif "foundation" in cat_lower:
            rate = 35000.0
        elif "wall" in cat_lower:
            rate = 3500.0
        elif "roof" in cat_lower:
            rate = 6500.0
        elif "floor" in cat_lower:
            rate = 5000.0
        elif "window" in cat_lower or "door" in cat_lower or "opening" in cat_lower:
            rate = 45000.0
        elif "ceiling" in cat_lower:
            rate = 3000.0
        elif "waterproof" in cat_lower:
            rate = 4000.0
        else:
            rate = 2000.0

    return {
        "Material_ID": r["Material_ID"],
        "Name": r["Name"],
        "Category": r["Category"],
        "Rate_LKR": rate,
        "Thermal_Rating": r["Thermal_Rating"],
        "Moisture_Resistance": r["Moisture_Resistance"],
        "Corrosion_Resistance": r["Corrosion_Resistance"],
        "Structural_Capacity": r["Structural_Capacity"],
        "Sustainability_Rating": r["Sustainability_Rating"],
        "Maintenance_Level": r["Maintenance_Level"],
        "Embodied_Carbon": r["Embodied_Carbon"],
        "Suitable_Climates": r["Suitable_Climates"],
        "Building_Sectors": r["Building_Sectors"],
        "Floor_Count_Range": r["Floor_Count_Range"],
        "Service_Life": r["Service_Life"],
        "Description": r["Description"],
        "Local_Availability": r["Local_Availability"],
        "Supplier_Density": r["Supplier_Density"],
        "Style_Compatibility": r.get("Style_Compatibility", "Modern,Contemporary"),
        "Recyclability_Rating": r["Recyclability_Rating"],
        "Thermal_Performance_Rating": r["Thermal_Performance_Rating"],
        "Climate_Risk_Score": r["Climate_Risk_Score"],
    }




def get_material_by_id(material_id: int):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM materials WHERE Material_ID = ?", (material_id,))
    row = cur.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None
