from sqlalchemy import Column, String, Float, Boolean, ForeignKey, DateTime, Enum, Index
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

    rides = relationship("Ride", back_populates="rider")


# ---------------- 🚗 Driver Model ----------------
class Driver(Base):
    __tablename__ = "drivers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    user_id = Column(String, ForeignKey("users.id"), unique=True, index=True)

    name = Column(String, nullable=False)
    is_available = Column(Boolean, default=True, index=True)

    lat = Column(Float)
    lon = Column(Float)

    rides = relationship("Ride", back_populates="driver")

# ---------------- 🚖 Ride Model ----------------
class Ride(Base):
    __tablename__ = "rides"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    rider_id = Column(String, ForeignKey("users.id"), index=True)
    driver_id = Column(String, ForeignKey("drivers.id"), nullable=True, index=True)

    status = Column(Enum(RideStatus), default=RideStatus.requested, index=True)
    fare_estimate = Column(Float, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime, nullable=True)

    rider = relationship("User", back_populates="rides")
    driver = relationship("Driver", back_populates="rides")


# ---------------- 📈 Composite Index (Performance) ----------------
Index("idx_ride_status_driver", Ride.status, Ride.driver_id)