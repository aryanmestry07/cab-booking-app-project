from sqlalchemy import Column, String, Float, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    is_available = Column(Boolean, default=True)
    lat = Column(Float)
    lon = Column(Float)


class Ride(Base):
    __tablename__ = "rides"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rider_id = Column(String)
    status = Column(String, default="requested")
    fare_estimate = Column(Float)

    driver_id = Column(
        UUID(as_uuid=True),
        ForeignKey("drivers.id"),
        nullable=True
    )