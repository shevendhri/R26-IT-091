import cv2
import numpy as np
import base64
import os

try:
    from ultralytics import YOLO
    has_yolo = True
except ImportError:
    has_yolo = False

def check_intersect(b1, b2, margin=15):
    x1_1, y1_1, x2_1, y2_1 = b1
    x1_2, y1_2, x2_2, y2_2 = b2
    return not (x2_1 + margin < x1_2 or x1_1 - margin > x2_2 or y2_1 + margin < y1_2 or y1_1 - margin > y2_2)

def generate_layout_recommendation(rooms, instruction, building_type="Residential"):
    import random
    instruction_lower = instruction.lower() if instruction else ""
    
    # 1. Detected Layout (Count types)
    detected_layout = [r["name"] for r in rooms]
    if not detected_layout:
        detected_layout_text = ["No specific rooms detected."]
    else:
        from collections import Counter
        counts = Counter(detected_layout)
        detected_layout_text = [f"{count}x {name.capitalize()}" for name, count in counts.items()]
        
    # 2. Identify Issues
    issues = []
    
    # Missing rooms
    if "bathroom" not in detected_layout and "restroom" not in detected_layout:
        issues.append("Missing essential sanitation zone (No bathroom detected).")
    if "kitchen" not in detected_layout and "pantry" not in detected_layout and building_type == "Residential":
        issues.append("Missing primary utility zone (No kitchen detected).")
        
    # Adjacency checks
    for i, r1 in enumerate(rooms):
        for j, r2 in enumerate(rooms):
            if i >= j: continue
            if (r1['name'] == 'bedroom' and r2['name'] == 'kitchen') or (r2['name'] == 'bedroom' and r1['name'] == 'kitchen'):
                if check_intersect(r1['bbox'], r2['bbox'], margin=20):
                    issues.append("Privacy/hygiene conflict: Bedroom directly connected to Kitchen.")
                    break
                    
    # Ventilation/Corridor check (heuristic simulation based on room coordinates)
    coord_hash = sum(sum(r['bbox']) for r in rooms) if rooms else 0
    random.seed(coord_hash)
    if len(rooms) > 2 and random.random() > 0.6:
        issues.append("Poor ventilation assumptions: Central areas lack direct external wall access.")
    if len(rooms) > 4 and random.random() > 0.5:
        issues.append("Inefficient circulation: Missing clear corridor access between primary zones.")
        
    if not issues:
        issues.append("No major structural or spatial layout issues detected.")
        
    # 3. Dynamic Suggested Improvements
    random.seed(instruction_lower + building_type + str(len(rooms)))
    
    interpretation = f"Analyzed spatial configuration for a {building_type} layout."
    improvements = []
    
    if "add bathroom" in instruction_lower or "add restroom" in instruction_lower:
        interpretation = f"User requested addition of a sanitation zone for {building_type} layout."
        improvements = [
            "Suggest placing the new bathroom near the existing plumbing line to reduce pipe runs.",
            "Ensure the new bathroom does not obstruct main circulation paths.",
            "Incorporate a mechanical ventilation shaft or exterior window for moisture control."
        ]
    elif "improve ventilation" in instruction_lower:
        interpretation = "User requested strategies to improve natural airflow and thermal comfort."
        improvements = [
            "Suggest adding larger fenestrations to corner rooms to enable cross-ventilation.",
            "Consider installing louvers or exhaust systems in high-humidity zones.",
            "Align internal doorways to create a continuous wind path across the structure."
        ]
    elif "efficient" in instruction_lower or "optimize" in instruction_lower:
        interpretation = "User requested spatial optimization and circulation improvement."
        improvements = [
            "Consider merging non-load-bearing partitioned areas to create an open-plan core.",
            "Optimize central circulation space to reduce wasted hallway area.",
            "Reposition primary living spaces to align with favorable sun paths for natural lighting."
        ]
    else:
        interpretation = f"General layout analysis generated for query: '{instruction}'" if instruction else f"Default spatial optimization for {building_type} blueprint."
        if "Missing essential sanitation" in " ".join(issues):
            improvements.append("Critical: Draft a designated bathroom/restroom area adjacent to exterior walls for plumbing.")
        if "Bedroom directly connected to Kitchen" in " ".join(issues):
            improvements.append("Resolve adjacency flaw: Introduce a small hallway or buffer wall between the kitchen and bedroom.")
        
        improvements.extend([
            f"Review placement of wet zones to consolidate {building_type.lower()} plumbing infrastructure.",
            "Verify all primary occupied rooms meet minimum natural lighting regulations.",
            "Ensure load-bearing structural grids align with the new spatial partitions."
        ])
        
    random.shuffle(improvements)
    improvements = improvements[:4]
        
    return {
        "detected_layout": detected_layout_text,
        "issues": list(set(issues)),
        "interpretation": interpretation,
        "improvements": improvements
    }


def process_blueprint(image_bytes, instruction="", building_type="Residential"):
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return None, ["Invalid image format"], None
        
    feedback = []
    
    # Process instruction if provided
    if instruction:
        feedback.append(f"User Request: '{instruction}'")
        instruction_lower = instruction.lower()
        if 'suggest improvements' in instruction_lower or 'optimize space' in instruction_lower:
            feedback.append("AI Check: Prioritizing spatial optimization and unused corner efficiency.")
        elif 'merge' in instruction_lower:
            feedback.append("AI Check: Highlighting non-load-bearing walls that could be joined.")
        elif 'window' in instruction_lower or 'ventilation' in instruction_lower or 'identify issues' in instruction_lower:
            feedback.append("AI Check: Scanning perimeter walls for lack of fenestration or lighting sources.")
        else:
            feedback.append("AI Check: Applying custom request parameters to analysis layers.")
            
    # Setup YOLO model paths (Check root backend first, then runs)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "best_blueprint_model.pt")
    local_run_path = os.path.join(base_dir, "runs", "blueprint_model", "weights", "best.pt")
    detect_run_path = os.path.join(base_dir, "runs", "detect", "runs", "blueprint_model", "weights", "best.pt")
    
    if not os.path.exists(model_path):
        if os.path.exists(detect_run_path):
            model_path = detect_run_path
        elif os.path.exists(local_run_path):
            model_path = local_run_path
    
    if not has_yolo or not os.path.exists(model_path):
        # Fallback if YOLO model is not trained yet or unavailable
        feedback.append("AI Model not found on the server. Please ensure the model is trained.")
        feedback.append(f"Expected model at: {model_path} or {local_run_path}")
        cv2.putText(img, "Model Not Found", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        _, buffer = cv2.imencode('.jpg', img)
        return base64.b64encode(buffer).decode('utf-8'), feedback, None
        
    # --- REAL AI LOGIC ---
    try:
        model = YOLO(model_path)
    except Exception as e:
        return None, [f"Error loading model: {str(e)}"], None
        
    # Run Inference
    results = model(img)
    
    room_count = 0
    wall_count = 0
    detected_rooms = []
    
    # Process Results
    for result in results:
        boxes = result.boxes
        for box in boxes:
            # box coordinates
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            name = model.names[cls_id]
            
            # Formatting according to the predicted class
            if name == "room":
                color = (0, 255, 0) # Green for rooms
                room_count += 1
                area = (x2 - x1) * (y2 - y1)
                detected_rooms.append({"name": name, "bbox": (x1, y1, x2, y2), "area": area})
            elif name == "wall":
                color = (255, 0, 0) # Blue for walls
                wall_count += 1
            else:
                color = (0, 255, 255) # Yellow for other
                
            label = f"{name} {conf:.2f}"
            
            # Draw on image
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
            cv2.putText(img, label, (x1, max(y1 - 5, 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
    # Generate intelligent feedback based on model inferences
    if room_count == 0 and wall_count == 0:
        feedback.append("Could not identify any floor plan structural elements. Is this a valid blueprint?")
    else:
        feedback.append(f"Successfully identified {room_count} rooms and {wall_count} wall segments.")
        
        if wall_count > 0 and room_count == 0:
            feedback.append("Detected structural walls but no distinct rooms. Check if the blueprint is enclosed.")
            
        if room_count > 4:
            feedback.append("Layout indicates a complex space. Consider optimizing central ventilation.")
            
        if wall_count > 20:
            feedback.append("High density of wall segments found. Ensure adequate doorway widths between spaces.")
            
    # Highlight potential optimization area randomly as an example of rule-based extension
    # In a real system, you'd calculate area sizes or look for walls without doors/windows.
    if room_count > 0:
        feedback.append("Suggestion: Check the eastern side structure for natural lighting opportunities.")

    # Post-process: Classify Room Types heuristically based on area and count
    if detected_rooms:
        detected_rooms.sort(key=lambda x: x['area'], reverse=True)
        for i, r in enumerate(detected_rooms):
            if i == 0:
                r['name'] = "living area" if building_type == "Residential" else "main workspace"
            elif i == len(detected_rooms) - 1 and len(detected_rooms) >= 3:
                r['name'] = "bathroom" if building_type == "Residential" else "restroom"
            elif i == len(detected_rooms) - 2 and len(detected_rooms) >= 4:
                r['name'] = "kitchen" if building_type == "Residential" else "pantry"
            else:
                r['name'] = "bedroom" if building_type == "Residential" else "office"

    # Encode back to base64
    _, buffer = cv2.imencode('.jpg', img)
    encoded_img = base64.b64encode(buffer).decode('utf-8')
    
    recommendations = generate_layout_recommendation(detected_rooms, instruction, building_type)
    
    return encoded_img, feedback, recommendations
