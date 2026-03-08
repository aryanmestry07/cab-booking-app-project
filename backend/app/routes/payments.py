from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
import stripe

from app.database import get_db
from app.models import Ride
from app.auth import get_current_user

router = APIRouter()

# Stripe secret key
stripe.api_key = "sk_test_your_secret_key"


# ---------------- Create Payment ----------------
@router.post("/create-payment/{ride_id}")
def create_payment(
    ride_id: UUID,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):

    ride = db.query(Ride).filter(Ride.id == str(ride_id)).first()

    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    payment_intent = stripe.PaymentIntent.create(
        amount=int(ride.fare_estimate * 100),  # rupees → paise
        currency="inr",
        metadata={"ride_id": str(ride_id)}
    )

    return {
        "client_secret": payment_intent.client_secret,
        "amount": ride.fare_estimate
    }


# ---------------- Confirm Payment ----------------
@router.post("/pay/{ride_id}")
def confirm_payment(
    ride_id: UUID,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):

    ride = db.query(Ride).filter(Ride.id == str(ride_id)).first()

    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    ride.payment_status = "paid"

    db.commit()

    return {
        "message": "Payment successful",
        "ride_id": str(ride_id)
    }