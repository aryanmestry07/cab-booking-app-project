from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
import uuid
from pydantic import BaseModel

from app.database import get_db
from app.models import Driver, User
from app.auth import get_current_user

router = APIRouter()


# =====================================================
# 🚗 Create Driver Profile
# =====================================================
@router.post("/create")
def create_driver(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "driver":
        raise HTTPException(
            status_code=403,
            detail="Only users with driver role can create driver profile"
        )

    existing = db.query(Driver).filter(
        Driver.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Driver profile already exists"
        )

    driver = Driver(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=current_user.username,
        is_available=True,
        lat=None,
        lon=None
    )

    db.add(driver)
    db.commit()
    db.refresh(driver)

    return {
        "driver_id": str(driver.id),
        "name": driver.name,
        "is_available": driver.is_available
    }


# =====================================================
# 🟢 Toggle Driver Availability
# =====================================================
class AvailabilityUpdate(BaseModel):
    is_available: bool


@router.patch("/{driver_id}/availability")
def toggle_availability(
    driver_id: UUID,
    data: AvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "driver":
        raise HTTPException(status_code=403, detail="Not authorized")

    driver = db.query(Driver).filter(
        Driver.id == str(driver_id),
        Driver.user_id == current_user.id
    ).first()

    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    driver.is_available = data.is_available

    db.commit()
    db.refresh(driver)

    return {
        "driver_id": str(driver.id),
        "is_available": driver.is_available
    }


# =====================================================
# 📋 Get All Drivers
# =====================================================
@router.get("/")
def get_all_drivers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role not in ["driver", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")

    drivers = db.query(Driver).all()

    return [
        {
            "driver_id": str(driver.id),
            "name": driver.name,
            "is_available": driver.is_available,
            "lat": driver.lat,
            "lon": driver.lon
        }
        for driver in drivers
    ]


# =====================================================
# 📍 Update Driver Location
# =====================================================
class DriverLocation(BaseModel):
    lat: float
    lon: float


@router.post("/location")
def update_driver_location(
    data: DriverLocation,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "driver":
        raise HTTPException(
            status_code=403,
            detail="Only drivers can update location"
        )

    driver = db.query(Driver).filter(
        Driver.user_id == current_user.id
    ).first()

    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver profile not found. Create driver profile first."
        )

    driver.lat = data.lat
    driver.lon = data.lon

    db.commit()

    return {
        "message": "Driver location updated successfully",
        "lat": driver.lat,
        "lon": driver.lon
    }


# =====================================================
# 🚕 Get Driver Location
# =====================================================
@router.get("/{driver_id}/location")
def get_driver_location(
    driver_id: UUID,
    db: Session = Depends(get_db)
):

    driver = db.query(Driver).filter(
        Driver.id == str(driver_id)
    ).first()

    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver not found"
        )

    return {
        "driver_id": str(driver.id),
        "lat": driver.lat,
        "lon": driver.lon
    }