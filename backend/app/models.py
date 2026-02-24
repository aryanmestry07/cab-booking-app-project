from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base

class Ride(Base):
    __tablename__ = "rides"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rider_id = Column(String)
    status = Column(String, default="requested")
    fare_estimate = Column(Float)