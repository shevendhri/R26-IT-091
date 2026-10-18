from pydantic import BaseModel, Field

class GraphNode(BaseModel):
    id: str
    type: str
    label: str | None = None
    floor: str | None = None

class GraphEdge(BaseModel):
    source: str
    target: str
    relation: str
    confidence: float = Field(ge=0, le=1)
