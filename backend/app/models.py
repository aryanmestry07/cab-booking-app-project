from sqlalchemy import Column, String, Float, Boolean, ForeignKey, DateTime, Enum, Index, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.database import Base


# ---------------- 🚦 Ride Status Enum ----------------
class RideStatus(enum.Enum):
    requested = "requested"
    assigned = "assigned"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"


# ---------------- 👤 User Model ----------------
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)

    # Rider rides
    rides = relationship(
        "Ride",
        back_populates="rider",
        cascade="all, delete"
    )

    # Driver profile
    driver_profile = relationship(
        "Driver",
        back_populates="user",
        uselist=False,
        cascade="all, delete"
    )


# ---------------- 🚗 Driver Model ----------------
class Driver(Base):
    __tablename__ = "drivers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    user_id = Column(String, ForeignKey("users.id"), unique=True, index=True)

    name = Column(String, nullable=False)

    is_available = Column(Boolean, default=True, index=True)

    # 📍 Driver GPS location
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)

    user = relationship("User", back_populates="driver_profile")

    rides = relationship(
        "Ride",
        back_populates="driver",
        cascade="all, delete"
    )


# ---------------- 🚖 Ride Model ----------------
class Ride(Base):
    __tablename__ = "rides"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    rider_id = Column(String, ForeignKey("users.id"), index=True)

    driver_id = Column(String, ForeignKey("drivers.id"), nullable=True, index=True)

    status = Column(
        Enum(RideStatus),
        default=RideStatus.requested,
        index=True
    )

    # 📍 Pickup Location
    pickup_lat = Column(Float, nullable=False)
    pickup_lng = Column(Float, nullable=False)

    # 📍 Destination Location
    dest_lat = Column(Float, nullable=False)
    dest_lng = Column(Float, nullable=False)

    # 📏 Distance (KM)
    distance = Column(Float, nullable=False)

    # 💰 Fare Estimate
    fare_estimate = Column(Float, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    completed_at = Column(DateTime, nullable=True)

    payment_status = Column(String, default="pending")

    # Relationships
    rider = relationship("User", back_populates="rides")

    driver = relationship("Driver", back_populates="rides")


# ---------------- 📈 Performance Index ----------------
Index("idx_ride_status_driver", Ride.status, Ride.driver_id)


# ---------------- ⭐ Rating Model ----------------
class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)

    ride_id = Column(String, ForeignKey("rides.id"))

    rider_id = Column(String, ForeignKey("users.id"))

    driver_id = Column(String, ForeignKey("users.id"))

    rating = Column(Integer)

    comment = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)