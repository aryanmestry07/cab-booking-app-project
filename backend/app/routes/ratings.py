from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Rating, Ride
from app.schemas import RatingCreate
from app.auth import get_current_user

router = APIRouter(tags=["Ratings"])  # ✅ removed prefix


# ⭐ Rate Driver
@router.post("/rate")
def rate_driver(
    rating: RatingCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    # Check ride exists
    ride = db.query(Ride).filter(Ride.id == rating.ride_id).first()

    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    # Prevent rating cancelled rides
    if ride.status != "completed":
        raise HTTPException(status_code=400, detail="Ride not completed")

    # Prevent multiple ratings
    existing = db.query(Rating).filter(Rating.ride_id == rating.ride_id).first()

    if existing:
        raise HTTPException(status_code=400, detail="Ride already rated")

    # Validate rating
    if rating.rating < 1 or rating.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    new_rating = Rating(
        ride_id=rating.ride_id,
        rider_id=user.id,
        driver_id=ride.driver_id,
        rating=rating.rating,
        comment=rating.comment
    )

    db.add(new_rating)
    db.commit()

    return {"message": "Rating submitted successfully ⭐"}


# ⭐ Get Driver Average Rating
@router.get("/driver/{driver_id}")
def driver_rating(driver_id: int, db: Session = Depends(get_db)):

    ratings = db.query(Rating).filter(Rating.driver_id == driver_id).all()

    if not ratings:
        return {"rating": 0, "total_reviews": 0}

    avg = sum(r.rating for r in ratings) / len(ratings)

    return {
        "rating": round(avg, 2),
        "total_reviews": len(ratings)
    }