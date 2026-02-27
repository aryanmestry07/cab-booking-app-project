from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from uuid import UUID

from app.database import SessionLocal
from app.models import Ride, Driver

router = APIRouter()

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Schema 
class RideRequest(BaseModel):
    rider_id: str
    fare_estimate: float

#  Request Ride 
@router.post("/request")
def request_ride(data: RideRequest, db: Session = Depends(get_db)):

    driver = db.query(Driver).filter(Driver.is_available == True).first()

    if not driver:
        raise HTTPException(status_code=404, detail="No drivers available")

    ride = Ride(
        rider_id=data.rider_id,
        fare_estimate=data.fare_estimate,
        driver_id=driver.id,
        status="assigned"
    )

    driver.is_available = False

    db.add(ride)
    db.commit()
    db.refresh(ride)

    return {
        "ride_id": str(ride.id),
        "status": ride.status,
        "driver_assigned": driver.name
    }

#  Accept Ride 
@router.post("/accept/{ride_id}")
def accept_ride(ride_id: UUID, db: Session = Depends(get_db)):

    ride = db.query(Ride).filter(Ride.id == ride_id).first()

    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    if ride.status != "assigned":
        raise HTTPException(status_code=400, detail="Ride cannot be accepted")

    ride.status = "ongoing"

    db.commit()
    db.refresh(ride)

    return {
        "message": "Ride accepted",
        "ride_id": str(ride.id),
        "status": ride.status
    }

# ---------------- ✅ Complete Ride ----------------
@router.post("/complete/{ride_id}")
def complete_ride(ride_id: UUID, db: Session = Depends(get_db)):

    ride = db.query(Ride).filter(Ride.id == ride_id).first()

    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    if ride.status != "ongoing":
        raise HTTPException(status_code=400, detail="Ride cannot be completed")

    ride.status = "completed"

    driver = db.query(Driver).filter(Driver.id == ride.driver_id).first()
    if driver:
        driver.is_available = True

    db.commit()
    db.refresh(ride)

    return {
        "message": "Ride completed",
        "ride_id": str(ride.id),
        "status": ride.status
    }


# ---------------- 📜 Get All Rides ----------------
@router.get("/")
def get_all_rides(db: Session = Depends(get_db)):
    rides = db.query(Ride).all()

    return [
        {
            "ride_id": str(ride.id),
            "rider_id": ride.rider_id,
            "status": ride.status,
            "fare_estimate": ride.fare_estimate,
            "driver_id": ride.driver_id
        }
        for ride in rides
    ]