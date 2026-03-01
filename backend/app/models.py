from sqlalchemy import Column, String, Float, Boolean, ForeignKey, DateTime
from datetime import datetime
import uuid
from app.database import Base


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    is_available = Column(Boolean, default=True)
    lat = Column(Float)
    lon = Column(Float)


class Ride(Base):
    __tablename__ = "rides"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    rider_id = Column(String, ForeignKey("users.id"))
    driver_id = Column(String, ForeignKey("drivers.id"), nullable=True)

    status = Column(String, default="requested")
    fare_estimate = Column(Float)

    # ✅ NEW FIELDS (Day 6)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    username = Column(String, unique=True)
    password = Column(String)
    role = Column(String)