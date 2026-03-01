from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RideRequest(BaseModel):
    fare_estimate: float


class RideResponse(BaseModel):
    ride_id: str
    rider_id: str
    status: str
    fare_estimate: float
    driver_id: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]