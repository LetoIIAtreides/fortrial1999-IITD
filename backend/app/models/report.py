import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Text, Integer, Boolean
import enum
from app.db.session import Base

class EmergencyType(str, enum.Enum):
    PREGNANCY = "Pregnancy"
    DIABETES = "Diabetes"
    BLEEDING = "Bleeding"
    FEVER = "Fever"
    INJURY = "Injury"
    MEDICINE_NEEDED = "Medicine needed"
    INSULIN = "Insulin"
    MEDICINES = "Medicines"
    FIRST_AID = "First aid"
    CLEAN_WATER = "Clean water"
    FOOD = "Food"
    BLANKETS = "Blankets"
    OXYGEN = "Oxygen"
    TRANSPORT = "Transport"

class UrgencyLevel(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"
    URGENT = "Urgent"
    CAN_WAIT = "Can wait"

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
    FLAGGED = "FLAGGED"

class Report(Base):
    __tablename__ = "reports"

    report_id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    report_type = Column(String(32), default="NEED", nullable=False, index=True) # "NEED" (Red Circle) or "OFFER" (Green Square)
    emergency_type = Column(String(64), nullable=False, index=True)
    urgency = Column(String(32), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    
    # Location details
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String(255), nullable=True)
    ward = Column(String(64), default="Ward 4", nullable=True)
    
    # Community & Evidence details
    people_affected = Column(Integer, default=1, nullable=True)
    description = Column(Text, nullable=True)
    evidence_type = Column(String(32), default="none", nullable=True) # "photo", "voice", "none"
    evidence_url = Column(Text, nullable=True)
    water_depth = Column(String(32), nullable=True) # e.g. "~1.2 m"
    
    # AI-assisted trust and review data (transparently labeled)
    trust_score = Column(Integer, default=78, nullable=True)
    ai_check_status = Column(String(128), default="Likely genuine", nullable=True)
    device_fingerprint = Column(String(64), default="device-4F2", nullable=True)
    flagged_reason = Column(String(255), nullable=True)
    nearby_match = Column(String(255), nullable=True)
    
    # Synchronization & Verification
    sync_status = Column(String(32), default=SyncStatus.RECEIVED_BY_SERVER.value, nullable=False)
    verification_status = Column(String(32), default=VerificationStatus.UNVERIFIED.value, nullable=False, index=True)
    
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by = Column(String(128), nullable=True)
    verification_notes = Column(Text, nullable=True)
    assigned_to = Column(String(128), nullable=True)
    action_status = Column(String(32), default="OPEN", nullable=True)
    last_synced_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
