from ...schemas import BuildingInfo

def merge_building_info(existing: BuildingInfo, candidate: BuildingInfo) -> BuildingInfo:
    data = existing.model_dump()
    for key, value in candidate.model_dump().items():
        if value not in (None, [], {}):
            current = data.get(key)
            if current in (None, [], {}):
                data[key] = value
    return BuildingInfo(**data)
