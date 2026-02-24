from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Ride
from app.schemas import RideRequest
from app.models import Ride


router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



@router.post("/request")
def request_ride(data: RideRequest, db: Session = Depends(get_db)):

    driver = db.query(Driver).filter(Driver.is_available == True).first()

    if not driver:
        return {"message": "No drivers available ❌"}

    ride = Ride(
        rider_id=data.rider_id,
        fare_estimate=120,  # temp static
        status="confirmed",
        driver_id=driver.id
    )

    driver.is_available = False  # driver now busy

    db.add(ride)
    db.commit()
    db.refresh(ride)

    return {
        "ride_id": str(ride.id),
        "status": ride.status,
        "driver": {
            "id": str(driver.id),
            "name": driver.name
        }
    }