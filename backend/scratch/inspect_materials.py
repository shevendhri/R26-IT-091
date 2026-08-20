import sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('data/materials.db')
cur = conn.cursor()

cur.execute("""SELECT Material_ID, Name, Category, Suitable_Climates, Budget_Level, 
               Building_Sectors, Floor_Count_Range, Local_Availability, 
               Structural_Capacity, Service_Life, Embodied_Carbon,
               Moisture_Resistance, Corrosion_Resistance, Maintenance_Level
               FROM materials ORDER BY Category, Name""")
rows = cur.fetchall()
cols = [d[0] for d in cur.description]

profiles = {}
for r in rows:
    d = dict(zip(cols, r))
    name = d['Name']
    
    climates = [c.strip() for c in (d['Suitable_Climates'] or '').split(',') if c.strip()]
    budgets = [b.strip() for b in (d['Budget_Level'] or '').split(',') if b.strip()]
    budget_map = {'low': 'Economy', 'mid': 'Balanced', 'high': 'Premium'}
    budget_tier = budget_map.get(budgets[0], 'Balanced') if budgets else 'Balanced'
    floors = [f.strip() for f in (d['Floor_Count_Range'] or '').split(',') if f.strip()]
    avail = d['Local_Availability'] or 'Medium'
    struct_cap = d['Structural_Capacity'] or 0
    sls = struct_cap >= 40 or d['Category'] not in ['Foundation', 'Structural', 'Walling', 'Concrete']
    
    systems = []
    if '6+' in floors:
        systems.append('RC Frame')
    if '3-5' in floors:
        systems.append('RC Frame')
    if '1-2' in floors:
        systems.extend(['RC Frame', 'Load Bearing'])
    systems = list(set(systems)) or ['RC Frame']
    
    pref_map = {'Very High': 5, 'High': 4, 'Medium': 3, 'Low': 2, 'Very Low': 1}
    stars = pref_map.get(avail, 3)
    
    maint_lvl = d.get('Maintenance_Level') or 50
    profiles[name] = {
        'category': d['Category'],
        'sls_compliant': sls,
        'structural_systems': systems,
        'climate': climates,
        'budget': budget_tier,
        'availability': avail,
        'local_preference_stars': stars,
        'eco_score': d.get('Embodied_Carbon', 0.35),
        'maintenance': 'Low' if maint_lvl < 20 else ('Medium' if maint_lvl < 40 else 'High'),
        'service_life': d['Service_Life'] or 30,
        'floor_range': floors,
        'structural_capacity': struct_cap,
        'moisture_resistance': d.get('Moisture_Resistance', 50),
        'corrosion_resistance': d.get('Corrosion_Resistance', 50),
        'compatible_with': []
    }

# Write to config
with open('config/material_profiles.json', 'w', encoding='utf-8') as f:
    json.dump(profiles, f, indent=2, ensure_ascii=False)
print(f"Written {len(profiles)} material profiles to config/material_profiles.json")

conn.close()
