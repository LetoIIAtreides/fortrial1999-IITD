from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class AuditLogResponse(BaseModel):
    log_id: str
    report_id: str
    responder_id: str
    responder_username: str
    previous_status: str
    new_status: str
    notes: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
