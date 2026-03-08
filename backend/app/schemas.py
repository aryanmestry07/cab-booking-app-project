from pydantic import BaseModel, Field
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



class RatingCreate(BaseModel):
    ride_id: int
    rating: int = Field(..., ge=1, le=5)  # rating must be 1–5
    comment: Optional[str] = None