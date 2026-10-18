import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Text, Integer, Boolean
from app.db.session import Base

class RoadSegment(Base):
    __tablename__ = "road_segments"

    road_id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    road_name = Column(String(128), nullable=False) # e.g. "Road B", "Road C", "Road D", "Bridge 1"
    status = Column(String(32), nullable=False) # "OPEN", "RISKY", "BLOCKED"
    hazard_details = Column(String(255), nullable=True) # e.g. "Water 0.3 m", "Bridge 1 blocked, water 0.8 m"
    travel_time = Column(String(64), nullable=True) # e.g. "About 1 h 20 min"
    destination = Column(String(128), default="Town hospital", nullable=True)
    distance_km = Column(Float, default=9.0, nullable=True)
    last_reported_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    reported_by = Column(String(128), default="Citizen Reporter", nullable=True)

class TransportOption(Base):
    __tablename__ = "transport_options"

    option_id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    transport_type = Column(String(64), nullable=False) # "Boat", "Walk", "Truck or tractor", "Ambulance (4x4)"
    badge = Column(String(64), nullable=False) # "Best option", "! Risky", "x Blocked", "! Waiting"
    status = Column(String(32), nullable=False) # "OPEN", "RISKY", "BLOCKED", "WAITING"
    description = Column(Text, nullable=False) # e.g. "2 boats at the ghat, 8 seats. About 1 h 20 min."
    is_available = Column(Boolean, default=True, nullable=False)

class TransportRequest(Base):
    __tablename__ = "transport_requests"

    request_id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    transport_type = Column(String(64), nullable=False) # "Boat", "Ambulance"
    pickup_location = Column(String(255), nullable=False)
    destination = Column(String(255), default="Town hospital", nullable=True)
    people_count = Column(Integer, default=1, nullable=False)
    urgency = Column(String(32), default="Urgent", nullable=False)
    status = Column(String(32), default="REQUESTED", nullable=False) # "REQUESTED", "DISPATCHED", "COMPLETED"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
