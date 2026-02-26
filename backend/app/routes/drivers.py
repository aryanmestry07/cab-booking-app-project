from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Driver

router = APIRouter()

# ✅ DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 🚗 Create Driver
@router.post("/create")
def create_driver(name: str, db: Session = Depends(get_db)):
    driver = Driver(name=name)

    db.add(driver)
    db.commit()
    db.refresh(driver)

    return {
        "driver_id": driver.id,
        "name": driver.name,
        "is_available": driver.is_available
    }

# 🟢🔴 Toggle Availability
@router.patch("/{driver_id}/availability")
def toggle_availability(driver_id: str, is_available: bool, db: Session = Depends(get_db)):

    driver = db.query(Driver).filter(Driver.id == driver_id).first()

    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    driver.is_available = is_available
    db.commit()

    return {
        "driver_id": driver.id,
        "is_available": driver.is_available
    }