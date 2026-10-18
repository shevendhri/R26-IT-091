import os, sys
sys.path.append(r"C:/Users/ASUS/Desktop/Material specification")
from backend.database import get_all_materials, format_material
rows = get_all_materials()
print('Rows count:', len(rows))
if rows:
    first = rows[0]
    print('First row type:', type(first))
    try:
        d = dict(first)
        print('Converted dict keys:', list(d.keys())[:5])
    except Exception as e:
        print('dict conversion error:', e)
    print('Access by name test:')
    try:
        print('Material_ID via name:', first['Material_ID'])
    except Exception as e:
        print('Name access error:', e)
    print('Access by index test:')
    try:
        print('First element (index 0):', first[0])
    except Exception as e:
        print('Index access error:', e)
