import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Boolean, Text
from app.db.session import Base

class Facility(Base):
    __tablename__ = "facilities"

    facility_id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String(255), nullable=False, index=True)
    facility_type = Column(String(128), nullable=False, index=True) # e.g. District Hospital, PHC, CHC, Emergency Relief Centre
    address = Column(String(512), nullable=False)
    district = Column(String(128), nullable=False, index=True)
    state = Column(String(128), nullable=False, default="Uttarakhand")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    phone = Column(String(64), nullable=False)
    emergency_capacity = Column(String(255), nullable=False, default="Available")
    is_operational = Column(Boolean, default=True, nullable=False)
    last_updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
