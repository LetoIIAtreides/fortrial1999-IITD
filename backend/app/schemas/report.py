from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime

ALLOWED_EMERGENCY_TYPES = [
    "Pregnancy",
    "Diabetes",
    "Bleeding",
    "Fever",
    "Injury",
    "Medicine needed"
]

ALLOWED_URGENCY_LEVELS = [
    "Low",
    "Medium",
    "High"
]

class ReportBase(BaseModel):
    emergency_type: str = Field(..., description="Emergency category")
    urgency: str = Field(..., description="User reported urgency level")
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, description="Latitude if available")
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, description="Longitude if available")
    location_name: Optional[str] = Field(None, max_length=255, description="Manual or descriptive location")
    description: Optional[str] = Field(None, max_length=1000, description="Optional notes")

    @field_validator("emergency_type")
    @classmethod
    def validate_emergency_type(cls, v: str) -> str:
        matched = next((cat for cat in ALLOWED_EMERGENCY_TYPES if cat.lower() == v.lower()), None)
        if not matched:
            raise ValueError(f"Invalid emergency type. Must be one of: {', '.join(ALLOWED_EMERGENCY_TYPES)}")
        return matched

    @field_validator("urgency")
    @classmethod
    def validate_urgency(cls, v: str) -> str:
        for lvl in ALLOWED_URGENCY_LEVELS:
            if v.lower().startswith(lvl.lower()):
                return lvl
        raise ValueError(f"Invalid urgency. Must be one of: {', '.join(ALLOWED_URGENCY_LEVELS)}")

class ReportCreate(ReportBase):
    report_id: Optional[str] = Field(None, description="Client-generated unique UUID to ensure idempotence")
    created_at: Optional[datetime] = Field(None, description="Client creation timestamp")

class ReportVerificationUpdate(BaseModel):
    verification_status: str = Field(..., description="New verification status: VERIFIED, REJECTED, or RESOLVED")
    notes: Optional[str] = Field(None, max_length=1000, description="Responder action notes")

    @field_validator("verification_status")
    @classmethod
    def validate_verification_status(cls, v: str) -> str:
        allowed = ["VERIFIED", "REJECTED", "RESOLVED", "UNVERIFIED"]
        val_upper = v.upper()
        if val_upper not in allowed:
            raise ValueError(f"Invalid verification status. Must be one of: {', '.join(allowed)}")
        return val_upper

class ReportResponse(ReportBase):
    report_id: str
    created_at: datetime
    sync_status: str
    verification_status: str
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None
    verification_notes: Optional[str] = None
    last_synced_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ReportListResponse(BaseModel):
    items: List[ReportResponse]
    total: int
    page: int
    page_size: int
    pages: int

class SyncPushItemResult(BaseModel):
    report_id: str
    status: str # "created" or "already_exists"
    sync_status: str
    verification_status: str

class SyncPushRequest(BaseModel):
    reports: List[ReportCreate]

class SyncPushResponse(BaseModel):
    processed: int
    results: List[SyncPushItemResult]

class SyncPullResponse(BaseModel):
    reports: List[ReportResponse]
    server_time: datetime
