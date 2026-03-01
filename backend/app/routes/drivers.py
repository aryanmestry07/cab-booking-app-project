from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import SessionLocal
from app.models import Driver, User
from app.auth import get_current_user

router = APIRouter()


# ---------------- DB Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- 🚗 Create Driver (DRIVER ROLE ONLY) ----------------
@router.post("/create")
def create_driver(
    name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "driver":
        raise HTTPException(status_code=403, detail="Only drivers can create driver profile")

    # Prevent duplicate profile
    existing = db.query(Driver).filter(
        Driver.name == current_user.username
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Driver profile already exists")

    driver = Driver(
        name=current_user.username
    )

    db.add(driver)
    db.commit()
    db.refresh(driver)

    return {
        "driver_id": str(driver.id),
        "name": driver.name,
        "is_available": driver.is_available
    }


# ---------------- 🟢🔴 Toggle Availability (OWNER ONLY) ----------------
@router.patch("/{driver_id}/availability")
def toggle_availability(
    driver_id: UUID,
    is_available: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "driver":
        raise HTTPException(status_code=403, detail="Only drivers can update availability")

    driver = db.query(Driver).filter(Driver.id == driver_id).first()

    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    # Optional: ensure driver owns this profile
    if driver.name != current_user.username:
        raise HTTPException(status_code=403, detail="You can only update your own profile")

    driver.is_available = is_available
    db.commit()
    db.refresh(driver)

    return {
        "driver_id": str(driver.id),
        "is_available": driver.is_available
    }


# ---------------- 📋 Get All Drivers (AUTH REQUIRED) ----------------
@router.get("/")
def get_all_drivers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    drivers = db.query(Driver).all()

    return [
        {
            "driver_id": str(driver.id),
            "name": driver.name,
            "is_available": driver.is_available
        }
        for driver in drivers
    ]