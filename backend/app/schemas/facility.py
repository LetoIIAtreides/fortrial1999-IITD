from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class FacilityBase(BaseModel):
    name: str
    facility_type: str
    address: str
    district: str
    state: str = "Uttarakhand"
    latitude: float
    longitude: float
    phone: str
    emergency_capacity: str = "Available"
    is_operational: bool = True

class FacilityResponse(FacilityBase):
    facility_id: str
    last_updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
