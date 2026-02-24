from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Ride

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/request")
def request_ride(rider_id: str, fare_estimate: float, db: Session = Depends(get_db)):
    ride = Ride(rider_id=rider_id, fare_estimate=fare_estimate)
    db.add(ride)
    db.commit()
    db.refresh(ride)

    return {"ride_id": ride.id, "status": ride.status}