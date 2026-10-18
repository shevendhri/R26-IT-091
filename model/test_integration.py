"""Run with backend/.venv-training/Scripts/python.exe model/test_integration.py."""
import io
import json
from pathlib import Path
from unittest.mock import patch
from collections import Counter
from PIL import Image
from fastapi.testclient import TestClient
import main
import detector

client = TestClient(main.app)
assert client.post('/predict',files={'image':('bad.png',b'not an image','image/png')}).status_code == 422
sample = next((Path(__file__).resolve().parents[1]/'backend/datasets/blueprints_clean_v2/test/images').glob('*.png'))
r = client.post('/predict',files={'image':(sample.name,sample.read_bytes(),'image/png')})
assert r.status_code == 200, r.text
result = r.json()
assert result['analysis_source']=='yolo' and result['detections']
counts=Counter(b['cls'] for b in result['detections'])
assert all(result['counts'][name]==counts[name] for name in detector.NAMES)
assert len(result['rooms']) == counts['room']
assert result['compliance'] is None and result['approval_checklist']==[]
assert all(r['area_sqft'] is None for r in result['rooms'])
assert result['overlay'].startswith('data:image/jpeg;base64,')
with patch('main._yolo_predict',return_value=(dict.fromkeys(detector.NAMES,0),[])):
 empty=client.post('/predict',files={'image':(sample.name,sample.read_bytes(),'image/png')}).json()
 assert empty['counts']['room']==0 and empty['rooms']==[] and empty['overlay']
with patch('main._yolo_predict',side_effect=RuntimeError('missing checkpoint')):
 assert client.post('/predict',files={'image':(sample.name,sample.read_bytes(),'image/png')}).status_code==503
print(json.dumps({'sample':sample.name,'counts':result['counts'],'checks':'real checkpoint, counts, empty detections, bad upload, model failure passed'}))
