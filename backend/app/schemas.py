from pydantic import BaseModel

class RideRequest(BaseModel):
    rider_id: str
    fare_estimate: float