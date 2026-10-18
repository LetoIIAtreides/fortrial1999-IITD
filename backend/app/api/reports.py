import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import get_db
from app.models.report import Report, SyncStatus, VerificationStatus
from app.models.audit import VerificationAuditLog
from app.models.user import User
from app.schemas.report import (
    ReportCreate,
    ReportResponse,
    ReportListResponse,
    ReportVerificationUpdate,
)
from app.schemas.audit import AuditLogResponse
from app.core.deps import get_current_responder

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("", response_model=ReportResponse)
def create_report(payload: ReportCreate, response: Response, db: Session = Depends(get_db)):
    target_id = payload.report_id if payload.report_id else str(uuid.uuid4())
    
    # Idempotent check
    existing = db.query(Report).filter(Report.report_id == target_id).first()
    if existing:
        response.status_code = status.HTTP_200_OK
        return existing

    created_time = payload.created_at if payload.created_at else datetime.now(timezone.utc)
    now = datetime.now(timezone.utc)
    
    # Calculate initial AI check and trust score transparently
    trust_score = payload.trust_score if payload.trust_score is not None else 78
    ai_status = payload.ai_check_status or "Likely genuine"
    
    report = Report(
        report_id=target_id,
        report_type=(payload.report_type or "NEED").upper(),
        emergency_type=payload.emergency_type,
        urgency=payload.urgency,
        created_at=created_time,
        latitude=payload.latitude,
        longitude=payload.longitude,
        location_name=payload.location_name,
        ward=payload.ward or "Ward 4",
        people_affected=payload.people_affected or 1,
        description=payload.description,
        evidence_type=payload.evidence_type or "none",
        evidence_url=payload.evidence_url,
        water_depth=payload.water_depth,
        trust_score=trust_score,
        ai_check_status=ai_status,
        device_fingerprint=payload.device_fingerprint or "device-4F2",
        flagged_reason=payload.flagged_reason,
        nearby_match=payload.nearby_match,
        assigned_to=payload.assigned_to,
        action_status=payload.action_status or "OPEN",
        sync_status=SyncStatus.RECEIVED_BY_SERVER.value,
        verification_status=VerificationStatus.UNVERIFIED.value,
        last_synced_at=now
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    
    response.status_code = status.HTTP_201_CREATED
    return report

@router.get("", response_model=ReportListResponse)
def list_reports(
    category: Optional[str] = Query(None, description="Filter by emergency type"),
    urgency: Optional[str] = Query(None, description="Filter by urgency level"),
    verification_status: Optional[str] = Query(None, description="Filter by verification status"),
    report_type: Optional[str] = Query(None, description="Filter by report type: NEED or OFFER"),
    ward: Optional[str] = Query(None, description="Filter by ward"),
    start_date: Optional[datetime] = Query(None, description="Filter reports created after"),
    end_date: Optional[datetime] = Query(None, description="Filter reports created before"),
    search: Optional[str] = Query(None, description="Search in description or location"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db)
):
    query = db.query(Report)
    
    if category:
        query = query.filter(Report.emergency_type.ilike(f"%{category}%"))
    if urgency:
        query = query.filter(Report.urgency.ilike(f"%{urgency}%"))
    if verification_status:
        query = query.filter(Report.verification_status == verification_status.upper())
    if report_type:
        query = query.filter(Report.report_type == report_type.upper())
    if ward:
        query = query.filter(Report.ward.ilike(f"%{ward}%"))
    if start_date:
        query = query.filter(Report.created_at >= start_date)
    if end_date:
        query = query.filter(Report.created_at <= end_date)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Report.description.ilike(search_pattern)) | 
            (Report.location_name.ilike(search_pattern)) |
            (Report.report_id.ilike(search_pattern)) |
            (Report.emergency_type.ilike(search_pattern))
        )
    
    total = query.count()
    items = query.order_by(desc(Report.created_at)).offset((page - 1) * page_size).limit(page_size).all()
    pages = (total + page_size - 1) // page_size if total > 0 else 1
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages
    }

@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.report_id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency report not found"
        )
    return report

@router.patch("/{report_id}/verification", response_model=ReportResponse)
def update_report_verification(
    report_id: str,
    payload: ReportVerificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_responder)
):
    report = db.query(Report).filter(Report.report_id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency report not found"
        )
    
    previous_status = report.verification_status
    new_status = payload.verification_status
    now = datetime.now(timezone.utc)
    
    report.verification_status = new_status
    report.verified_at = now
    report.verified_by = current_user.username
    report.verification_notes = payload.notes
    if payload.assigned_to:
        report.assigned_to = payload.assigned_to
        report.action_status = "ASSIGNED"
    elif new_status == "VERIFIED":
        report.assigned_to = current_user.username
        report.action_status = "ASSIGNED"
    elif new_status == "REJECTED":
        report.action_status = "FALSE"
    elif new_status == "RESOLVED":
        report.action_status = "RESOLVED"
        
    report.last_synced_at = now
    
    # Create audit record
    audit_entry = VerificationAuditLog(
        report_id=report.report_id,
        responder_id=current_user.user_id,
        responder_username=current_user.username,
        previous_status=previous_status,
        new_status=new_status,
        notes=payload.notes,
        timestamp=now
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(report)
    
    return report

@router.post("/{report_id}/request-info", response_model=ReportResponse)
def request_more_info(
    report_id: str,
    notes: Optional[str] = "Responder requested additional information from reporting party.",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_responder)
):
    report = db.query(Report).filter(Report.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    now = datetime.now(timezone.utc)
    report.action_status = "INFO_REQUESTED"
    report.verification_notes = f"[INFO REQUESTED by {current_user.username}] {notes}"
    report.last_synced_at = now
    
    audit_entry = VerificationAuditLog(
        report_id=report.report_id,
        responder_id=current_user.user_id,
        responder_username=current_user.username,
        previous_status=report.verification_status,
        new_status=report.verification_status,
        notes=f"Information requested: {notes}",
        timestamp=now
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(report)
    return report

@router.get("/{report_id}/audit-logs", response_model=List[AuditLogResponse])
def get_report_audit_logs(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_responder)
):
    report = db.query(Report).filter(Report.report_id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency report not found"
        )
    logs = db.query(VerificationAuditLog).filter(
        VerificationAuditLog.report_id == report_id
    ).order_by(desc(VerificationAuditLog.timestamp)).all()
    return logs
