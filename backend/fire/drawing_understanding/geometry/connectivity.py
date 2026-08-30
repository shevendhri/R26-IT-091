from .primitives import GraphEdge, GraphNode

def build_unknown_connectivity_graph(rooms: list, doors: list, stairs: list) -> dict:
    nodes: list[GraphNode] = []
    for index, room in enumerate(rooms):
        nodes.append(GraphNode(id=f"room-{index+1}", type="ROOM", label=room.label, floor=room.floor))
    for index, door in enumerate(doors):
        nodes.append(GraphNode(id=f"door-{index+1}", type="DOOR", label=door.mark, floor=door.floor))
    for index, stair in enumerate(stairs):
        nodes.append(GraphNode(id=f"stair-{index+1}", type="STAIR", label=stair.label, floor=stair.floor))
    return {
        "nodes": [node.model_dump() for node in nodes],
        "edges": [],
        "status": "UNKNOWN",
        "warnings": ["Connectivity graph was not inferred because reliable traversable geometry was unavailable."],
    }

def graph_to_dict(nodes: list[GraphNode], edges: list[GraphEdge]) -> dict:
    return {"nodes": [n.model_dump() for n in nodes], "edges": [e.model_dump() for e in edges], "status": "CONFIRMED" if edges else "UNKNOWN"}
