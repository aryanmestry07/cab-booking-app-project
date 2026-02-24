from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Driver

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/create")
def create_driver(name: str, db: Session = Depends(get_db)):
    driver = Driver(name=name)
    db.add(driver)
    db.commit()
    db.refresh(driver)

    return {"driver_id": str(driver.id), "name": driver.name}

@router.patch("/{driver_id}/availability")
def toggle_availability(driver_id: str, is_available: bool, db: Session = Depends(get_db)):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()

    if not driver:
        return {"error": "Driver not found"}

    driver.is_available = is_available
    db.commit()

    return {"driver_id": driver_id, "is_available": driver.is_available}