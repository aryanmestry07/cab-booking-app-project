from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

from app.database import SessionLocal
from app.models import Ride, Driver, User
from app.auth import get_current_user

router = APIRouter()


# ---------------- DB Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- Pydantic Schema ----------------
class RideRequest(BaseModel):
    fare_estimate: float


# ---------------- 🚖 Request Ride (RIDER ONLY) ----------------
@router.post("/request")
def request_ride(
    data: RideRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "rider":
        raise HTTPException(status_code=403, detail="Only riders can request rides")

    driver = db.query(Driver).filter(Driver.is_available == True).first()

    if not driver:
        raise HTTPException(status_code=404, detail="No drivers available")

    ride = Ride(
        rider_id=current_user.id,   # ✅ FIXED
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


# ---------------- 🚕 Accept Ride (DRIVER ONLY) ----------------
@router.post("/accept/{ride_id}")
def accept_ride(
    ride_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "driver":
        raise HTTPException(status_code=403, detail="Only drivers can accept rides")

    # ✅ Prevent driver from accepting multiple rides
    existing_ride = db.query(Ride).filter(
        Ride.driver_id == current_user.id,
        Ride.status == "ongoing"
    ).first()

    if existing_ride:
        raise HTTPException(
            status_code=400,
            detail="You already have an active ride"
        )

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


# ---------------- ✅ Complete Ride (DRIVER ONLY) ----------------
@router.post("/complete/{ride_id}")
def complete_ride(
    ride_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "driver":
        raise HTTPException(status_code=403, detail="Only drivers can complete rides")

    ride = db.query(Ride).filter(Ride.id == ride_id).first()

    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    if ride.status != "ongoing":
        raise HTTPException(status_code=400, detail="Ride cannot be completed")

    ride.status = "completed"
    ride.completed_at = datetime.utcnow()   # ✅ Timestamp added

    driver = db.query(Driver).filter(Driver.id == ride.driver_id).first()
    if driver:
        driver.is_available = True

    db.commit()
    db.refresh(ride)

    return {
        "message": "Ride completed",
        "ride_id": str(ride.id),
        "status": ride.status,
        "completed_at": ride.completed_at
    }


# ---------------- ❌ Cancel Ride ----------------
@router.put("/cancel/{ride_id}")
def cancel_ride(
    ride_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    ride = db.query(Ride).filter(Ride.id == ride_id).first()

    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    if ride.status == "completed":
        raise HTTPException(status_code=400, detail="Cannot cancel completed ride")

    ride.status = "cancelled"

    driver = db.query(Driver).filter(Driver.id == ride.driver_id).first()
    if driver:
        driver.is_available = True

    db.commit()

    return {"message": "Ride cancelled successfully"}


# ---------------- 🚘 Driver Current Ride ----------------
@router.get("/driver/current")
def get_current_driver_ride(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "driver":
        raise HTTPException(status_code=403, detail="Only drivers can view this")

    ride = db.query(Ride).filter(
        Ride.driver_id == current_user.id,
        Ride.status == "ongoing"
    ).first()

    if not ride:
        return {"message": "No active ride"}

    return {
        "ride_id": str(ride.id),
        "rider_id": ride.rider_id,
        "status": ride.status,
        "fare_estimate": ride.fare_estimate,
        "created_at": ride.created_at
    }

# ---------------- 📜 Get My Rides ----------------
@router.get("/my-rides")
def get_my_rides(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role == "rider":
        rides = db.query(Ride).filter(
            Ride.rider_id == current_user.id
        ).all()

    elif current_user.role == "driver":
        rides = db.query(Ride).filter(
            Ride.driver_id == current_user.id
        ).all()

    else:
        rides = []

    return [
        {
            "ride_id": str(ride.id),
            "rider_id": ride.rider_id,
            "status": ride.status,
            "fare_estimate": ride.fare_estimate,
            "driver_id": ride.driver_id,
            "created_at": ride.created_at,
            "completed_at": ride.completed_at,
        }
        for ride in rides
    ]