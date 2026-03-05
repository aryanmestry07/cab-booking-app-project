from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy import func

from app.database import SessionLocal
from app.models import Ride, Driver, User, RideStatus
from app.auth import get_current_user

router = APIRouter()


# ---------------- DB Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- Request Schema ----------------
class RideRequest(BaseModel):
    fare_estimate: float


# =====================================================
# 🚖 REQUEST RIDE
# =====================================================
@router.post("/request")
def request_ride(
    data: RideRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "rider":
        raise HTTPException(status_code=403, detail="Only riders can request rides")

    # Prevent multiple active rides
    existing_ride = db.query(Ride).filter(
        Ride.rider_id == current_user.id,
        Ride.status.in_([
            RideStatus.requested,
            RideStatus.assigned,
            RideStatus.ongoing
        ])
    ).first()

    if existing_ride:
        raise HTTPException(status_code=400, detail="You already have an active ride")

    # Find available driver
    driver = db.query(Driver).filter(Driver.is_available == True).first()

    if not driver:
        raise HTTPException(status_code=404, detail="No drivers available")

    ride = Ride(
        rider_id=current_user.id,
        driver_id=driver.id,
        fare_estimate=data.fare_estimate,
        status=RideStatus.assigned
    )

    driver.is_available = False

    db.add(ride)
    db.commit()
    db.refresh(ride)

    return {
        "id": str(ride.id),
        "status": ride.status.value,
        "driver_assigned": driver.name
    }


# =====================================================
# 🚗 GET AVAILABLE RIDES (FOR DRIVERS)
# =====================================================
@router.get("/available")
def get_available_rides(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "driver":
        raise HTTPException(status_code=403, detail="Only drivers can view rides")

    rides = db.query(Ride).filter(
        Ride.status == RideStatus.assigned
    ).all()

    return [
        {
            "id": str(ride.id),
            "rider_id": ride.rider_id,
            "fare_estimate": ride.fare_estimate,
            "status": ride.status.value,
            "created_at": ride.created_at
        }
        for ride in rides
    ]


# =====================================================
# 🚕 ACCEPT RIDE
# =====================================================
@router.post("/accept/{ride_id}")
def accept_ride(
    ride_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "driver":
        raise HTTPException(status_code=403, detail="Only drivers can accept rides")

    ride = db.query(Ride).filter(Ride.id == ride_id).first()

    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    if ride.status != RideStatus.assigned:
        raise HTTPException(status_code=400, detail="Ride already taken")

    ride.driver_id = current_user.id
    ride.status = RideStatus.ongoing

    db.commit()
    db.refresh(ride)

    return {
        "message": "Ride accepted",
        "id": str(ride.id),
        "status": ride.status.value
    }


# =====================================================
# ✅ COMPLETE RIDE
# =====================================================
@router.post("/complete/{ride_id}")
def complete_ride(
    ride_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "driver":
        raise HTTPException(status_code=403, detail="Only drivers can complete rides")

    ride = db.query(Ride).filter(Ride.id == ride_id).first()

    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    if ride.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only complete your ride")

    ride.status = RideStatus.completed
    ride.completed_at = datetime.utcnow()

    driver = db.query(Driver).filter(
        Driver.name == current_user.username
    ).first()

    if driver:
        driver.is_available = True

    db.commit()
    db.refresh(ride)

    return {
        "message": "Ride completed",
        "id": str(ride.id),
        "status": ride.status.value,
        "completed_at": ride.completed_at
    }


# =====================================================
# 📜 GET MY RIDES
# =====================================================
@router.get("/my-rides")
def get_my_rides(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role == "rider":
        rides = db.query(Ride).filter(
            Ride.rider_id == current_user.id
        ).all()
    else:
        rides = db.query(Ride).filter(
            Ride.driver_id == current_user.id
        ).all()

    return [
        {
            "id": str(ride.id),
            "status": ride.status.value,
            "fare_estimate": ride.fare_estimate,
            "driver_id": ride.driver_id,
            "created_at": ride.created_at,
            "completed_at": ride.completed_at,
        }
        for ride in rides
    ]


# =====================================================
# 💰 DRIVER EARNINGS
# =====================================================
@router.get("/driver/earnings")
def driver_earnings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "driver":
        raise HTTPException(status_code=403)

    total_completed = db.query(func.count(Ride.id)).filter(
        Ride.driver_id == current_user.id,
        Ride.status == RideStatus.completed
    ).scalar()

    total_earnings = db.query(func.sum(Ride.fare_estimate)).filter(
        Ride.driver_id == current_user.id,
        Ride.status == RideStatus.completed
    ).scalar() or 0

    return {
        "total_completed_rides": total_completed,
        "total_earnings": total_earnings
    }