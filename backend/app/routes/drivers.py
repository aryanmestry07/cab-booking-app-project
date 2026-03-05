from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
import uuid

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


# ---------------- 🚗 Create Driver Profile ----------------
@router.post("/create")
def create_driver(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "driver":
        raise HTTPException(status_code=403, detail="Only drivers can create profile")

    existing = db.query(Driver).filter(
        Driver.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Driver profile already exists")

    driver = Driver(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=current_user.username,
        is_available=True
    )

    db.add(driver)
    db.commit()
    db.refresh(driver)

    return {
        "driver_id": str(driver.id),
        "user_id": str(driver.user_id),
        "name": driver.name,
        "is_available": driver.is_available
    }


# ---------------- 🟢 Toggle Availability ----------------
@router.patch("/{driver_id}/availability")
def toggle_availability(
    driver_id: UUID,
    is_available: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "driver":
        raise HTTPException(status_code=403)

    driver = db.query(Driver).filter(
        Driver.id == driver_id,
        Driver.user_id == current_user.id
    ).first()

    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    driver.is_available = is_available
    db.commit()
    db.refresh(driver)

    return {
        "driver_id": str(driver.id),
        "is_available": driver.is_available
    }


# ---------------- 📋 Get All Drivers ----------------
@router.get("/")
def get_all_drivers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    drivers = db.query(Driver).all()

    return [
        {
            "driver_id": str(driver.id),
            "user_id": str(driver.user_id),
            "name": driver.name,
            "is_available": driver.is_available
        }
        for driver in drivers
    ]