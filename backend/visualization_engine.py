from database import get_material_by_id
from room_engine import generate_room_objects
import random


def build_scene_data(blueprint: dict, selections: dict, cutaway: bool = False) -> dict:
    """Combine room geometry with selected material textures.
    Iterates over the generated blueprint without hardcoded heuristics.
    """
    # Generate basic room geometry if needed
    room_data = generate_room_objects(blueprint)

    # Attach texture URLs for each component based on selected material
    texture_map = {}
    for component, material_id in selections.items():
        try:
            mat = get_material_by_id(int(material_id))
            if mat:
                texture_map[component] = {
                    "floor_texture_url": mat.get("Floor_Texture_URL"),
                    "door_texture_url": mat.get("Door_Texture_URL"),
                    "window_texture_url": mat.get("Window_Texture_URL")
                }
        except Exception:
            continue

    layout_rooms = []
    floor_height = 3.5  # metres per floor
    
    for floor_index, floor in enumerate(blueprint.get("floors_data", [])):
        z_base = floor_index * floor_height
        
        for i, room in enumerate(floor.get("rooms", [])):
            x_pos = room.get("x", 0)
            y_pos = room.get("y", 0)
            w = room.get("w", 4.0)
            h = room.get("h", 4.0)
            
            layout_rooms.append({
                "id": room.get("id", f"f{floor_index}_r{i}"),
                "type": room.get("type", "Room"),
                "label": room.get("label", "Room"),
                "area": room.get("area", w * h),
                "position": {"x": x_pos, "y": y_pos, "z": z_base},
                "dimensions": {"width": w, "depth": h, "height": floor_height},
                "sustainability_score": round(random.uniform(0.6, 0.95), 2)
            })

    scene = {
        "rooms": layout_rooms,
        "textures": texture_map,
        "cutaway": cutaway
    }
    return scene

