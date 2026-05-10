import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw
import io
import base64
from collections import Counter

def count_from_svg(svg_content: bytes):
    # Parse from bytes instead of file path to support UploadFile
    root = ET.fromstring(svg_content)
    
    # Strip namespaces
    for elem in root.iter():
        if '}' in elem.tag:
            elem.tag = elem.tag.split('}', 1)[1]
            
    counts = Counter()
    room_names = []
    
    for g in root.iter('g'):
        label = (g.get('class', '') + ' ' + g.get('id', '')).lower().strip()
        if label.startswith('space ') and 'outdoor' not in label:
            counts['room'] += 1
            for t in g.iter('text'):
                if t.text and len(t.text.strip()) > 1:
                    room_names.append(t.text.strip())
                    break
        elif label.startswith('wall'):
            counts['wall'] += 1
        elif label.startswith('door'):
            counts['door'] += 1
        elif label.startswith('window'):
            counts['window'] += 1
            
    return dict(counts), room_names

def draw_overlay(svg_content: bytes, png_content: bytes):
    img = Image.open(io.BytesIO(png_content)).convert('RGB')
    root = ET.fromstring(svg_content)
    
    # Strip namespaces
    for elem in root.iter():
        if '}' in elem.tag:
            elem.tag = elem.tag.split('}', 1)[1]
            
    svg_w = float(root.get('width', img.width))
    svg_h = float(root.get('height', img.height))
    img_w, img_h = img.size
    sx, sy = img_w / svg_w, img_h / svg_h
    
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    style = {
        'space ':  ((255, 220, 80, 60),  (220, 160, 0)),
        'wall':    ((220, 30, 30, 130),  (180, 0, 0)),
        'door':    ((30, 200, 30, 160),  (0, 140, 0)),
        'window':  ((30, 120, 255, 160), (0, 80, 200)),
    }
    
    for g in root.iter('g'):
        label = (g.get('class', '') + ' ' + g.get('id', '')).lower().strip()
        matched = None
        for key in style:
            if label.startswith(key) and ('outdoor' not in label or key != 'space '):
                matched = key
                break
        if not matched:
            continue
            
        fill, outline = style[matched]
        for elem in g.iter():
            if elem.tag in ('polygon', 'polyline'):
                pts_str = elem.get('points', '')
                try:
                    pts = [(float(p.split(',')[0]) * sx,
                            float(p.split(',')[1]) * sy)
                           for p in pts_str.strip().split() if ',' in p]
                    if len(pts) >= 2:
                        draw.polygon(pts, fill=fill, outline=outline)
                except:
                    pass
                    
    combined = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
    
    # Convert to base64
    buffered = io.BytesIO()
    combined.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')
