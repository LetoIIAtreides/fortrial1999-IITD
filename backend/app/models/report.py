import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Text, Enum
import enum
from app.db.session import Base

class EmergencyType(str, enum.Enum):
    PREGNANCY = "Pregnancy"
    DIABETES = "Diabetes"
    BLEEDING = "Bleeding"
    FEVER = "Fever"
    INJURY = "Injury"
    MEDICINE_NEEDED = "Medicine needed"

class UrgencyLevel(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class SyncStatus(str, enum.Enum):
    LOCAL_PENDING = "LOCAL_PENDING"
    SYNCING = "SYNCING"
    RECEIVED_BY_SERVER = "RECEIVED_BY_SERVER"
    SYNC_FAILED = "SYNC_FAILED"

class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "UNVERIFIED"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    RESOLVED = "RESOLVED"

class Report(Base):
    __tablename__ = "reports"

    report_id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    emergency_type = Column(String(64), nullable=False, index=True)
    urgency = Column(String(32), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    
    # Location details (coarse protection can be applied in public views)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String(255), nullable=True)
    
    # User notes/description
    description = Column(Text, nullable=True)
    
    # Synchronization & Verification
    sync_status = Column(String(32), default=SyncStatus.RECEIVED_BY_SERVER.value, nullable=False)
    verification_status = Column(String(32), default=VerificationStatus.UNVERIFIED.value, nullable=False, index=True)
    
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by = Column(String(128), nullable=True)
    verification_notes = Column(Text, nullable=True)
    last_synced_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
