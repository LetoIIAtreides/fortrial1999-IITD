import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import get_db
from app.models.report import Report, SyncStatus, VerificationStatus
from app.schemas.report import ReportResponse, ReportCreate

router = APIRouter(tags=["Resources"])

@router.get("/resources", response_model=List[ReportResponse])
def get_resources(
    kind: Optional[str] = Query(None, description="NEED or OFFER"),
    item: Optional[str] = Query(None, description="Item type"),
    bbox: Optional[str] = Query(None, description="min_lng,min_lat,max_lng,max_lat"),
    status: Optional[str] = Query(None, description="Filter by action_status: OPEN, FULFILLED, WITHDRAWN"),
    db: Session = Depends(get_db)
):
    query = db.query(Report)
    if kind:
        query = query.filter(Report.report_type == kind.upper())
    else:
        query = query.filter(Report.report_type.in_(["NEED", "OFFER"]))
        
    if item:
        query = query.filter(Report.emergency_type.ilike(f"%{item}%"))
    if status:
        query = query.filter(Report.action_status == status.upper())
        
    if bbox:
        try:
            parts = [float(p.strip()) for p in bbox.split(",")]
            if len(parts) == 4:
                min_lng, min_lat, max_lng, max_lat = parts
                query = query.filter(
                    Report.latitude >= min_lat,
                    Report.latitude <= max_lat,
                    Report.longitude >= min_lng,
                    Report.longitude <= max_lng
                )
        except Exception:
            pass

    return query.order_by(desc(Report.created_at)).all()

@router.post("/resources", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_resource(payload: ReportCreate, db: Session = Depends(get_db)):
    target_id = payload.report_id if payload.report_id else f"res-{uuid.uuid4()}"
    existing = db.query(Report).filter(Report.report_id == target_id).first()
    if existing:
        return existing

    now = datetime.now(timezone.utc)
    report = Report(
        report_id=target_id,
        report_type=(payload.report_type or "NEED").upper(),
        emergency_type=payload.emergency_type,
        urgency=payload.urgency or "Medium",
        created_at=now,
        latitude=payload.latitude,
        longitude=payload.longitude,
        location_name=payload.location_name,
        ward=payload.ward or "Ward 4",
        people_affected=payload.people_affected or 1,
        description=payload.description,
        evidence_type=payload.evidence_type or "none",
        evidence_url=payload.evidence_url,
        trust_score=80 if payload.report_type == "OFFER" else 75,
        ai_check_status="Community Post",
        device_fingerprint=payload.device_fingerprint or "web-client",
        sync_status=SyncStatus.RECEIVED_BY_SERVER.value,
        verification_status=VerificationStatus.UNVERIFIED.value,
        action_status="OPEN",
        last_synced_at=now
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
