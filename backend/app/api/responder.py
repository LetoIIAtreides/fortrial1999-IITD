from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import get_db
from app.models.report import Report, VerificationStatus
from app.models.audit import VerificationAuditLog
from app.models.user import User
from app.schemas.report import ReportResponse
from app.core.deps import get_current_responder

router = APIRouter(prefix="/responder", tags=["Responder Console"])

class DecisionPayload(BaseModel):
    decision: str # "VERIFY_AND_ASSIGN", "ASK_MORE_INFO", "COULD_NOT_VERIFY", "RESOLVED"
    assigned_to: Optional[str] = None
    reason: Optional[str] = None
    notes: Optional[str] = None

@router.get("/queue", response_model=List[ReportResponse])
def get_responder_queue(
    status_filter: Optional[str] = Query(None, description="UNVERIFIED, VERIFIED, FLAGGED, etc."),
    category: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Report)
    if status_filter:
        query = query.filter(Report.verification_status == status_filter.upper())
    if category:
        query = query.filter(Report.emergency_type.ilike(f"%{category}%"))
    if ward:
        query = query.filter(Report.ward.ilike(f"%{ward}%"))
        
    # Sort by urgency (Critical/High first), then trust score descending
    reports = query.all()
    urgency_order = {"CRITICAL": 0, "HIGH": 1, "URGENT": 2, "MEDIUM": 3, "LOW": 4, "CAN WAIT": 5}
    return sorted(reports, key=lambda r: (urgency_order.get((r.urgency or "").upper(), 99), -(r.trust_score or 0)))

@router.post("/reports/{report_id}/decision", response_model=ReportResponse)
def make_responder_decision(
    report_id: str,
    payload: DecisionPayload,
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    now = datetime.now(timezone.utc)
    prev_status = report.verification_status
    decision = payload.decision.upper()
    
    if decision in ["VERIFY_AND_ASSIGN", "VERIFIED"]:
        report.verification_status = VerificationStatus.VERIFIED.value
        report.assigned_to = payload.assigned_to or "District Quick Response Team (QRT)"
        report.action_status = "ASSIGNED"
        report.verified_at = now
        report.verified_by = "District Responder"
        report.verification_notes = payload.notes or f"Verified & assigned to {report.assigned_to}"
    elif decision in ["ASK_MORE_INFO", "MORE_INFO"]:
        report.action_status = "INFO_REQUESTED"
        report.verification_notes = f"[INFO REQUESTED] {payload.reason or payload.notes or 'Please provide landmark details'}"
    elif decision in ["COULD_NOT_VERIFY"]:
        if not payload.reason:
            raise HTTPException(status_code=400, detail="A reason is required when a report could not be verified.")
        report.verification_status = VerificationStatus.FLAGGED.value
        report.flagged_reason = payload.reason
        report.verification_notes = f"[COULD NOT VERIFY] {payload.reason}"
    elif decision in ["RESOLVED"]:
        report.verification_status = VerificationStatus.RESOLVED.value
        report.action_status = "RESOLVED"
        report.verification_notes = payload.notes or "Resolved on site."

    report.last_synced_at = now

    audit = VerificationAuditLog(
        report_id=report.report_id,
        responder_id="resp-system",
        responder_username="District Responder",
        previous_status=prev_status,
        new_status=report.verification_status,
        notes=payload.notes or payload.reason or decision,
        timestamp=now
    )
    db.add(audit)
    db.commit()
    db.refresh(report)
    return report
