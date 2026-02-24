from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Ride
from app.schemas import RideRequest

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/request")
def request_ride(data: RideRequest, db: Session = Depends(get_db)):

    ride = Ride(
        rider_id=data.rider_id,
        fare_estimate=0,  # temp placeholder
        status="requested"
    )

    db.add(ride)
    db.commit()
    db.refresh(ride)

    return {
        "ride_id": str(ride.id),
        "pickup": data.pickup,
        "drop": data.drop,
        "status": ride.status
    }