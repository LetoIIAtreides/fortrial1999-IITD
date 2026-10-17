import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import get_db
from app.models.report import Report, SyncStatus, VerificationStatus
from app.schemas.report import (
    SyncPushRequest,
    SyncPushResponse,
    SyncPushItemResult,
    SyncPullResponse,
    ReportResponse
)

router = APIRouter(prefix="/sync", tags=["Synchronization"])

@router.post("/push", response_model=SyncPushResponse)
def sync_push(payload: SyncPushRequest, db: Session = Depends(get_db)):
    results: List[SyncPushItemResult] = []
    now = datetime.now(timezone.utc)
    
    for item in payload.reports:
        target_id = item.report_id if item.report_id else str(uuid.uuid4())
        existing = db.query(Report).filter(Report.report_id == target_id).first()
        
        if existing:
            # Already exists - idempotent acknowledgement
            results.append(SyncPushItemResult(
                report_id=existing.report_id,
                status="already_exists",
                sync_status=existing.sync_status,
                verification_status=existing.verification_status
            ))
        else:
            created_time = item.created_at if item.created_at else now
            new_report = Report(
                report_id=target_id,
                emergency_type=item.emergency_type,
                urgency=item.urgency,
                created_at=created_time,
                latitude=item.latitude,
                longitude=item.longitude,
                location_name=item.location_name,
                description=item.description,
                sync_status=SyncStatus.RECEIVED_BY_SERVER.value,
                verification_status=VerificationStatus.UNVERIFIED.value,
                last_synced_at=now
            )
            db.add(new_report)
            db.commit()
            db.refresh(new_report)
            
            results.append(SyncPushItemResult(
                report_id=new_report.report_id,
                status="created",
                sync_status=new_report.sync_status,
                verification_status=new_report.verification_status
            ))
            
    return SyncPushResponse(
        processed=len(results),
        results=results
    )

@router.get("/pull", response_model=SyncPullResponse)
def sync_pull(
    report_ids: Optional[str] = Query(None, description="Comma-separated list of report IDs to check"),
    since: Optional[datetime] = Query(None, description="ISO timestamp to fetch updates since"),
    db: Session = Depends(get_db)
):
    query = db.query(Report)
    
    if report_ids:
        id_list = [rid.strip() for rid in report_ids.split(",") if rid.strip()]
        if id_list:
            query = query.filter(Report.report_id.in_(id_list))
    elif since:
        query = query.filter(Report.last_synced_at >= since)
    else:
        # If neither provided, return the most recent 50 reports
        query = query.order_by(desc(Report.created_at)).limit(50)
        
    reports = query.all()
    return SyncPullResponse(
        reports=reports,
        server_time=datetime.now(timezone.utc)
    )
