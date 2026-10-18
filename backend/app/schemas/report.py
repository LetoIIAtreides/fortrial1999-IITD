from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

ALLOWED_EMERGENCY_TYPES = [
    "Pregnancy",
    "Diabetes",
    "Bleeding",
    "Fever",
    "Injury",
    "Medicine needed",
    "Insulin",
    "Medicines",
    "First aid",
    "Clean water",
    "Food",
    "Blankets",
    "Oxygen",
    "Transport"
]

ALLOWED_URGENCY_LEVELS = [
    "Low",
    "Medium",
    "High",
    "Critical",
    "Urgent",
    "Can wait"
]

class ReportBase(BaseModel):
    emergency_type: str = Field(..., description="Emergency or need/offer category")
    urgency: str = Field(..., description="User reported urgency level")
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, description="Latitude if available")
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, description="Longitude if available")
    location_name: Optional[str] = Field(None, max_length=255, description="Manual or descriptive location")
    description: Optional[str] = Field(None, max_length=1000, description="Optional notes")
    report_type: Optional[str] = Field("NEED", description="'NEED' (Red Circle) or 'OFFER' (Green Square)")
    ward: Optional[str] = Field("Ward 4", description="Ward or sector name")
    people_affected: Optional[int] = Field(1, ge=0, le=1000, description="People affected count")
    evidence_type: Optional[str] = Field("none", description="'photo', 'voice', or 'none'")
    evidence_url: Optional[str] = Field(None, description="Image data, voice transcript, or URL")
    water_depth: Optional[str] = Field(None, description="Estimated water depth e.g. '~1.2 m'")
    trust_score: Optional[int] = Field(78, description="AI-assisted genuine trust score 0-100")
    ai_check_status: Optional[str] = Field("Likely genuine", description="AI status check badge")
    device_fingerprint: Optional[str] = Field("device-4F2", description="Device identifier preview")
    flagged_reason: Optional[str] = Field(None, description="Reason if flagged by automated checks")
    nearby_match: Optional[str] = Field(None, description="Nearest resource match message")
    assigned_to: Optional[str] = Field(None, description="Responder assigned")
    action_status: Optional[str] = Field("OPEN", description="Incident action status")

    @field_validator("emergency_type")
    @classmethod
    def validate_emergency_type(cls, v: str) -> str:
        # Check if single or multi-category
        matched = next((cat for cat in ALLOWED_EMERGENCY_TYPES if cat.lower() == v.lower()), None)
        if matched:
            return matched
        # Allow multi-category or custom category safely
        return v

    @field_validator("urgency")
    @classmethod
    def validate_urgency(cls, v: str) -> str:
        for lvl in ALLOWED_URGENCY_LEVELS:
            if v.lower().startswith(lvl.lower()):
                return lvl
        # Default fallback
        return "Urgent"

class ReportCreate(ReportBase):
    report_id: Optional[str] = Field(None, description="Client-generated unique UUID to ensure idempotence")
    created_at: Optional[datetime] = Field(None, description="Client creation timestamp")

class ReportVerificationUpdate(BaseModel):
    verification_status: str = Field(..., description="New verification status: VERIFIED, REJECTED, RESOLVED, FLAGGED")
    notes: Optional[str] = Field(None, max_length=1000, description="Responder action notes")
    assigned_to: Optional[str] = Field(None, description="Responder username/unit to assign")

    @field_validator("verification_status")
    @classmethod
    def validate_verification_status(cls, v: str) -> str:
        allowed = ["VERIFIED", "REJECTED", "RESOLVED", "UNVERIFIED", "FLAGGED"]
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
    status: str
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

# Road and Transport Schemas
class RoadReportCreate(BaseModel):
    road_name: str
    status: str # "OPEN", "RISKY", "BLOCKED"
    hazard_details: Optional[str] = None
    reported_by: Optional[str] = "Citizen Reporter"

class RoadResponse(BaseModel):
    road_id: str
    road_name: str
    status: str
    hazard_details: Optional[str] = None
    travel_time: Optional[str] = None
    destination: Optional[str] = None
    distance_km: Optional[float] = None
    last_reported_at: datetime
    reported_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class TransportOptionResponse(BaseModel):
    option_id: str
    transport_type: str
    badge: str
    status: str
    description: str
    is_available: bool

    model_config = ConfigDict(from_attributes=True)

class TransportRequestCreate(BaseModel):
    transport_type: str
    pickup_location: str
    destination: Optional[str] = "Town hospital"
    people_count: int = 1
    urgency: Optional[str] = "Urgent"
    notes: Optional[str] = None

class TransportRequestResponse(BaseModel):
    request_id: str
    transport_type: str
    pickup_location: str
    destination: Optional[str] = None
    people_count: int
    urgency: str
    status: str
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DashboardSummaryResponse(BaseModel):
    open_requests: int
    needs_count: int
    offers_count: int
    verified_count: int
    unverified_count: int
    resolved_count: int
    flagged_count: int
    affected_area_km2: float
    impact_zone: str
    sample_note: str
