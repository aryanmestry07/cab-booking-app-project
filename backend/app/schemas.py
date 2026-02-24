from pydantic import BaseModel
from typing import List

class RideRequest(BaseModel):
    rider_id: str
    pickup: List[float]
    drop: List[float]