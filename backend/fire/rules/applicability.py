import re
from dataclasses import asdict
from typing import Any
from ..schemas import ProjectSchema
from .regulatory_data import ONE_WAY_TRAVEL_DISTANCE_NOTE, PURPOSE_GROUP_CATALOG, PURPOSE_GROUP_ALIASES, TRAVEL_DISTANCE_LIMITS

def get_path(project: ProjectSchema,path: str|None) -> Any:
    if path is None:return None
    value: Any=project
    for part in path.split("."):
        value=getattr(value,part,None) if not isinstance(value,dict) else value.get(part)
    return value

def is_applicable(project: ProjectSchema,path: str|None) -> bool|None:
    if path is None:return True
    value=get_path(project,path)
    return None if value is None else bool(value)

def normalize_use_text(value: str | None) -> str:
    return re.sub(r"\s+"," ",(value or "").strip().lower())

def classify_purpose_groups(*texts: str | None) -> dict:
    text=normalize_use_text(" ".join(x for x in texts if x))
    if not text:
        return {"status":"UNKNOWN","purpose_group":None,"purpose_groups":[],"reason":"No building-use evidence is available.","source":"Table 2","source_pages":[17]}
    if any(marker in text for marker in ("mixed use","mixed-use","mixed development","multi purpose","multiple occupancy")):
        matches=_matching_purpose_groups(text)
        return {"status":"AMBIGUOUS","purpose_group":None,"purpose_groups":matches,"reason":"Input indicates mixed or multiple uses; a single purpose group cannot be assigned safely.","source":"Table 2","source_pages":[17]}
    matches=_matching_purpose_groups(text)
    if len(matches)==1:
        code=matches[0]["code"]
        group=PURPOSE_GROUP_CATALOG[code]
        return {"status":"CONFIRMED","purpose_group":code,"purpose_groups":matches,"reason":f"Building-use evidence matches ICTAD Table 2: {group.title}.","source":"Table 2","source_pages":list(group.source_pages)}
    if len(matches)>1:
        return {"status":"AMBIGUOUS","purpose_group":None,"purpose_groups":matches,"reason":"Building-use evidence matches multiple ICTAD Table 2 purpose groups.","source":"Table 2","source_pages":[17]}
    return {"status":"UNKNOWN","purpose_group":None,"purpose_groups":[],"reason":"No unambiguous ICTAD Table 2 purpose-group term matched the building-use evidence.","source":"Table 2","source_pages":[17]}

def _matching_purpose_groups(text: str) -> list[dict]:
    matches=[]
    for term,code in PURPOSE_GROUP_ALIASES.items():
        if re.search(rf"\b{re.escape(term)}s?\b",text):
            group=PURPOSE_GROUP_CATALOG[code]
            if any(excluded in text for excluded in group.excluded_uses):
                continue
            record=asdict(group)
            record["source_pages"]=list(group.source_pages)
            if not any(existing["code"]==code for existing in matches):
                matches.append(record)
    return matches

def purpose_group_for_project(project: ProjectSchema) -> dict:
    info=project.building_info
    if info.purpose_group:
        code=str(info.purpose_group)
        group=PURPOSE_GROUP_CATALOG.get(code)
        if group:
            record=asdict(group); record["source_pages"]=list(group.source_pages)
            return {"status":"CONFIRMED","purpose_group":code,"purpose_groups":[record],"reason":"Purpose group was supplied in normalized evidence and matched ICTAD Table 2.","source":"Table 2","source_pages":list(group.source_pages)}
        return {"status":"AMBIGUOUS","purpose_group":None,"purpose_groups":[],"reason":"Supplied purpose group is not recognized in the codified ICTAD Table 2 catalog.","source":"Table 2","source_pages":[17]}
    room_labels=[room.label for room in project.rooms if room.label]
    return classify_purpose_groups(info.building_use_text,info.building_type,info.project_title,*room_labels)

def travel_distance_category(purpose_group: str | None, building_use_text: str | None = None) -> dict:
    if not purpose_group:
        return {"status":"UNRESOLVED","key":None,"reason":"Purpose group is unknown."}
    if purpose_group in {"1(b)","1(c)"}:
        return {"status":"RESOLVED","key":"detached_residential","reason":"Purpose Group 1 dwelling category maps to Table 5 detached residential row."}
    text=normalize_use_text(building_use_text)
    if "high hazard" in text:
        return {"status":"RESOLVED","key":"high_hazard","reason":"Building-use evidence explicitly indicates high hazard occupancy."}
    if "hospital" in text:
        return {"status":"RESOLVED","key":"hospital","reason":"Hospital use selects the Table 5 hospitals row."}
    if "school" in text or "educational" in text:
        return {"status":"RESOLVED","key":"school","reason":"School/educational use selects the Table 5 schools row."}
    if purpose_group=="2(a)":
        return {"status":"UNRESOLVED","key":None,"reason":"Purpose Group 2(a) contains multiple Table 5 rows; specific institutional use is required."}
    for key,limit in TRAVEL_DISTANCE_LIMITS.items():
        if purpose_group in limit.purpose_groups:
            return {"status":"RESOLVED","key":key,"reason":f"Purpose group {purpose_group} maps to Table 5 row: {limit.occupancy}."}
    return {"status":"UNRESOLVED","key":None,"reason":"Purpose group is not mapped to a codified Table 5 row."}

def select_travel_distance_limit(purpose_group: str | None, escape_arrangement: str | None, sprinklered: bool | None, building_use_text: str | None = None) -> dict:
    if not purpose_group:
        return {"status":"UNRESOLVED","limit_m":None,"reason":"Purpose group is unknown.","source":"Table 5","source_pages":[30]}
    if not escape_arrangement:
        return {"status":"UNRESOLVED","limit_m":None,"reason":"Escape arrangement is unknown.","source":"Table 5","source_pages":[30]}
    if sprinklered is None:
        return {"status":"UNRESOLVED","limit_m":None,"reason":"Sprinkler condition is unknown.","source":"Table 5","source_pages":[30]}
    arrangement=normalize_use_text(escape_arrangement).replace("-","_")
    category=travel_distance_category(purpose_group,building_use_text)
    if category["status"]!="RESOLVED":
        return {"status":"UNRESOLVED","limit_m":None,"reason":category["reason"],"source":"Table 5","source_pages":[30]}
    if arrangement in {"one_way","single_escape","one escape"}:
        if purpose_group.startswith("1"):
            return {"status":"NOT_APPLICABLE","limit_m":None,"reason":"Table 5 one-way note excludes Purpose Group I buildings.","source":ONE_WAY_TRAVEL_DISTANCE_NOTE["source"],"source_pages":ONE_WAY_TRAVEL_DISTANCE_NOTE["source_pages"]}
        limit=ONE_WAY_TRAVEL_DISTANCE_NOTE["one_way_sprinklered_m" if sprinklered else "one_way_unsprinklered_m"]
        return {"status":"RESOLVED","limit_m":limit,"basis":ONE_WAY_TRAVEL_DISTANCE_NOTE["note"],"source":ONE_WAY_TRAVEL_DISTANCE_NOTE["source"],"source_pages":ONE_WAY_TRAVEL_DISTANCE_NOTE["source_pages"],"category":category["key"],"sprinklered":sprinklered,"escape_arrangement":"one_way"}
    if arrangement in {"two_way","alternative","two escape","two_escape"}:
        row=TRAVEL_DISTANCE_LIMITS[category["key"]]
        limit=row.two_way_sprinklered_m if sprinklered else row.two_way_unsprinklered_m
        if limit is None:
            return {"status":"NOT_APPLICABLE","limit_m":None,"reason":"Table 5 marks this row as no requirement.","source":row.source,"source_pages":list(row.source_pages),"category":row.key}
        return {"status":"RESOLVED","limit_m":limit,"basis":f"{row.occupancy}, {'sprinklered' if sprinklered else 'unsprinklered'}, two independent escape routes.","source":row.source,"source_pages":list(row.source_pages),"category":row.key,"sprinklered":sprinklered,"escape_arrangement":"two_way"}
    return {"status":"UNRESOLVED","limit_m":None,"reason":"Escape arrangement must be one_way or two_way.","source":"Table 5","source_pages":[30]}
