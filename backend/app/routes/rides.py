from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy import func

from app.database import SessionLocal
from app.models import Ride, Driver, User, RideStatus
from app.auth import get_current_user
from app.websocket_manager import manager

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
    pickup_lat: float
    pickup_lng: float
    dest_lat: float
    dest_lng: float
    distance: float
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

    ride = Ride(
        rider_id=current_user.id,
        pickup_lat=data.pickup_lat,
        pickup_lng=data.pickup_lng,
        dest_lat=data.dest_lat,
        dest_lng=data.dest_lng,
        distance=data.distance,
        fare_estimate=data.fare_estimate,
        status=RideStatus.requested
    )

    db.add(ride)
    db.commit()
    db.refresh(ride)

    return {
        "id": str(ride.id),
        "status": ride.status.value
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
        raise HTTPException(status_code=403)

    driver = db.query(Driver).filter(
        Driver.user_id == current_user.id
    ).first()

    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver profile not found"
        )

    rides = db.query(Ride).filter(
        Ride.status == RideStatus.requested
    ).order_by(Ride.created_at.desc()).all()

    return [
        {
            "id": str(ride.id),
            "rider_id": ride.rider_id,
            "rider_name": ride.rider.username if ride.rider else None,
            "pickup_lat": ride.pickup_lat,
            "pickup_lng": ride.pickup_lng,
            "dest_lat": ride.dest_lat,
            "dest_lng": ride.dest_lng,
            "distance": ride.distance,
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
async def accept_ride(
    ride_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "driver":
        raise HTTPException(status_code=403)

    ride = db.query(Ride).filter(Ride.id == ride_id).first()

    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    if ride.status != RideStatus.requested:
        raise HTTPException(status_code=400, detail="Ride already taken")

    driver = db.query(Driver).filter(
        Driver.user_id == current_user.id
    ).first()

    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")

    ride.driver_id = driver.id
    ride.status = RideStatus.ongoing
    driver.is_available = False

    db.commit()
    db.refresh(ride)

    await manager.send_update(
        ride.rider_id,
        {
            "type": "ride_update",
            "status": "ongoing",
            "ride_id": str(ride.id)
        }
    )

    return {
        "message": "Ride accepted",
        "id": str(ride.id),
        "status": ride.status.value
    }


# =====================================================
# ✅ COMPLETE RIDE
# =====================================================
@router.post("/complete/{ride_id}")
async def complete_ride(
    ride_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "driver":
        raise HTTPException(status_code=403)

    ride = db.query(Ride).filter(Ride.id == ride_id).first()

    if not ride:
        raise HTTPException(status_code=404)

    driver = db.query(Driver).filter(
        Driver.user_id == current_user.id
    ).first()

    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")

    if ride.driver_id != driver.id:
        raise HTTPException(status_code=403)

    ride.status = RideStatus.completed
    ride.completed_at = datetime.utcnow()

    driver.is_available = True

    db.commit()
    db.refresh(ride)

    await manager.send_update(
        ride.rider_id,
        {
            "type": "ride_update",
            "status": "completed",
            "ride_id": str(ride.id)
        }
    )

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
        driver = db.query(Driver).filter(
            Driver.user_id == current_user.id
        ).first()

        if not driver:
            raise HTTPException(
                status_code=404,
                detail="Driver profile not found"
            )

        rides = db.query(Ride).filter(
            Ride.driver_id == driver.id
        ).all()

    return [
        {
            "id": str(ride.id),
            "rider_name": ride.rider.username if ride.rider else None,
            "pickup_lat": ride.pickup_lat,
            "pickup_lng": ride.pickup_lng,
            "dest_lat": ride.dest_lat,
            "dest_lng": ride.dest_lng,
            "distance": ride.distance,
            "fare_estimate": ride.fare_estimate,
            "status": ride.status.value,
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

    driver = db.query(Driver).filter(
        Driver.user_id == current_user.id
    ).first()

    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver profile not found"
        )

    total_completed = db.query(func.count(Ride.id)).filter(
        Ride.driver_id == driver.id,
        Ride.status == RideStatus.completed
    ).scalar()

    total_earnings = db.query(func.sum(Ride.fare_estimate)).filter(
        Ride.driver_id == driver.id,
        Ride.status == RideStatus.completed
    ).scalar() or 0

    return {
        "total_completed_rides": total_completed,
        "total_earnings": total_earnings
    }


# =====================================================
# 📍 UPDATE DRIVER LOCATION
# =====================================================
class DriverLocation(BaseModel):
    lat: float
    lon: float


@router.post("/driver/location")
def update_driver_location(
    data: DriverLocation,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "driver":
        raise HTTPException(status_code=403)

    driver = db.query(Driver).filter(
        Driver.user_id == current_user.id
    ).first()

    if not driver:
        raise HTTPException(status_code=404, detail="Driver profile not found")

    driver.lat = data.lat
    driver.lon = data.lon

    db.commit()

    return {"message": "Location updated"}


# =====================================================
# 🚕 GET DRIVER LOCATION
# =====================================================
@router.get("/driver/location/{ride_id}")
def get_driver_location(
    ride_id: str,
    db: Session = Depends(get_db)
):

    ride = db.query(Ride).filter(Ride.id == ride_id).first()

    if not ride:
        raise HTTPException(status_code=404)

    driver = db.query(Driver).filter(
        Driver.id == ride.driver_id
    ).first()

    if not driver:
        raise HTTPException(status_code=404)

    return {
        "lat": driver.lat,
        "lon": driver.lon
    }


# =====================================================
# ❌ CANCEL RIDE
# =====================================================
@router.post("/cancel/{ride_id}")
def cancel_ride(
    ride_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    ride = db.query(Ride).filter(
        Ride.id == ride_id,
        Ride.rider_id == current_user.id
    ).first()

    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    if ride.status == RideStatus.completed:
        raise HTTPException(status_code=400, detail="Ride already completed")

    ride.status = RideStatus.cancelled

    db.commit()

    return {"message": "Ride cancelled successfully"}