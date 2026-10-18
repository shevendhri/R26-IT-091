import requests
import os

url = 'http://127.0.0.1:8010/predict'
img_path = os.path.join('backend','validation_dataset','images','scenario_001_floorplan.png')
if not os.path.exists(img_path):
    print('Image not found:', img_path)
    raise SystemExit(1)

with open(img_path, 'rb') as f:
    files = {'image': ('scenario_001_floorplan.png', f, 'image/png')}
    try:
        r = requests.post(url, files=files, timeout=120)
    except Exception as e:
        print('Request failed:', e)
        raise

print('Status:', r.status_code)
try:
    data = r.json()
    import json
    print(json.dumps(data, indent=2)[:1000])
    # save overlay if present
    overlay = data.get('overlay')
    if overlay and overlay.startswith('data:image'):
        import base64
        header, b64 = overlay.split(',', 1)
        ext = 'jpg' if 'jpeg' in header or 'jpg' in header else 'png'
        out = f'tools/overlay_result.{ext}'
        with open(out, 'wb') as o:
            o.write(base64.b64decode(b64))
        print('Saved overlay to', out)
except ValueError:
    print('Non-JSON response:')
    print(r.text[:2000])
