from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.report import Report, VerificationStatus
from app.schemas.report import DashboardSummaryResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    reports = db.query(Report).all()
    open_requests = [r for r in reports if r.verification_status != VerificationStatus.RESOLVED.value]
    needs = [r for r in reports if r.report_type == "NEED"]
    offers = [r for r in reports if r.report_type == "OFFER"]
    verified = [r for r in reports if r.verification_status == VerificationStatus.VERIFIED.value]
    unverified = [r for r in reports if r.verification_status == VerificationStatus.UNVERIFIED.value]
    resolved = [r for r in reports if r.verification_status == VerificationStatus.RESOLVED.value]
    flagged = [r for r in reports if r.verification_status == VerificationStatus.FLAGGED.value or r.flagged_reason]

    return {
        "open_requests": len(open_requests),
        "needs_count": len(needs),
        "offers_count": len(offers),
        "verified_count": len(verified),
        "unverified_count": len(unverified),
        "resolved_count": len(resolved),
        "flagged_count": len(flagged),
        "affected_area_km2": 2.4,
        "impact_zone": "High",
        "sample_note": "AI estimate. Sample data."
    }
