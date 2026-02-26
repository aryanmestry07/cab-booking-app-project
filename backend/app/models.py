from sqlalchemy import Column, String, Float, Boolean, ForeignKey
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
    rider_id = Column(String)
    status = Column(String, default="requested")
    fare_estimate = Column(Float)

    driver_id = Column(
        String,
        ForeignKey("drivers.id"),
        nullable=True
    )