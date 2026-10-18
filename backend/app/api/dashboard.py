from collections import defaultdict
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_responder
from app.db.session import get_db
from app.models.facility import Facility
from app.models.report import Report, VerificationStatus
from app.models.user import User
from app.schemas.report import DashboardSummaryResponse, HeatmapResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# ~390 m cells. Coarse enough to avoid publishing exact personal GPS.
HEATMAP_GRID_DEGREES = 0.0035
HEATMAP_GRID_METERS = 390

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_responder),
):
    del current_user
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
        "affected_area_km2": 0.0,
        "impact_zone": "Unknown",
        "sample_note": "Affected area and impact zone are not calculated from current reports."
    }


def _quantize(value: float, step: float = HEATMAP_GRID_DEGREES) -> float:
    return round(round(value / step) * step, 6)


def _people_count(report: Report) -> int:
    raw = report.people_affected
    if raw is None:
        return 1
    try:
        return max(int(raw), 0)
    except (TypeError, ValueError):
        return 1


def _rescuer_units(report: Report) -> int:
    """One offer counts as at least one supply/rescue unit even if people_affected is 0."""
    return max(_people_count(report), 1)


def _recommend(top_category: Optional[str], gap: int, victim_people: int, rescuer_units: int) -> str:
    if victim_people == 0 and rescuer_units > 0:
        return "Rescue or supply capacity is present. Keep this cell as a staging point."
    if gap <= 0:
        return "Reported offers currently cover reported needs in this cell. Recheck after the next sync."
    category = (top_category or "general supplies").lower()
    return (
        f"Priority gap: about {gap} people still unmatched. "
        f"Send {category} and related medical supplies first."
    )


@router.get("/heatmap", response_model=HeatmapResponse)
def get_supply_heatmap(
    category: Optional[str] = Query(None, description="Filter by emergency or supply category"),
    urgency: Optional[str] = Query(None, description="Filter by urgency"),
    hide_flagged: bool = Query(False, description="Exclude flagged reports from the map"),
    include_resolved: bool = Query(False, description="Include resolved reports"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_responder),
):
    del current_user  # authorization is the purpose of the dependency
    query = db.query(Report)
    if category:
        query = query.filter(Report.emergency_type.ilike(f"%{category}%"))
    if urgency:
        query = query.filter(Report.urgency.ilike(f"%{urgency}%"))
    if hide_flagged:
        query = query.filter(Report.verification_status != VerificationStatus.FLAGGED.value)
    if not include_resolved:
        query = query.filter(Report.verification_status != VerificationStatus.RESOLVED.value)

    reports = query.all()
    located = [
        r for r in reports
        if r.latitude is not None and r.longitude is not None
    ]
    unlocated = len(reports) - len(located)

    cells: dict[tuple[float, float], dict] = {}
    for report in located:
        key = (_quantize(float(report.latitude)), _quantize(float(report.longitude)))
        cell = cells.get(key)
        if cell is None:
            cell = {
                "victim_people": 0,
                "victim_reports": 0,
                "rescuer_units": 0,
                "rescuer_reports": 0,
                "flagged_reports": 0,
                "categories": defaultdict(lambda: {
                    "victim_people": 0,
                    "victim_reports": 0,
                    "rescuer_units": 0,
                    "rescuer_reports": 0,
                }),
            }
            cells[key] = cell

        cat = report.emergency_type or "Unspecified"
        is_need = (report.report_type or "NEED").upper() != "OFFER"
        if is_need:
            people = max(_people_count(report), 1)
            cell["victim_people"] += people
            cell["victim_reports"] += 1
            cell["categories"][cat]["victim_people"] += people
            cell["categories"][cat]["victim_reports"] += 1
        else:
            units = _rescuer_units(report)
            cell["rescuer_units"] += units
            cell["rescuer_reports"] += 1
            cell["categories"][cat]["rescuer_units"] += units
            cell["categories"][cat]["rescuer_reports"] += 1

        if report.verification_status == VerificationStatus.FLAGGED.value or report.flagged_reason:
            cell["flagged_reports"] += 1

    heatmap_cells = []
    victim_total = 0
    rescuer_total = 0
    for (lat, lng), cell in cells.items():
        categories = []
        for cat_name, split in cell["categories"].items():
            gap = max(split["victim_people"] - split["rescuer_units"], 0)
            categories.append({
                "category": cat_name,
                "victim_people": split["victim_people"],
                "victim_reports": split["victim_reports"],
                "rescuer_units": split["rescuer_units"],
                "rescuer_reports": split["rescuer_reports"],
                "supply_gap": gap,
            })
        categories.sort(
            key=lambda item: (item["supply_gap"], item["victim_people"]),
            reverse=True,
        )
        top_category = categories[0]["category"] if categories else None
        # Offers for one category must not hide an unmet need in another.
        supply_gap = sum(item["supply_gap"] for item in categories)
        victim_total += cell["victim_people"]
        rescuer_total += cell["rescuer_units"]
        heatmap_cells.append({
            "cell_id": f"{lat:.4f},{lng:.4f}",
            "latitude": lat,
            "longitude": lng,
            "victim_people": cell["victim_people"],
            "victim_reports": cell["victim_reports"],
            "rescuer_units": cell["rescuer_units"],
            "rescuer_reports": cell["rescuer_reports"],
            "supply_gap": supply_gap,
            "flagged_reports": cell["flagged_reports"],
            "top_category": top_category,
            "categories": categories,
            "recommended_action": _recommend(
                top_category,
                supply_gap,
                cell["victim_people"],
                cell["rescuer_units"],
            ),
        })

    heatmap_cells.sort(key=lambda item: (item["supply_gap"], item["victim_people"]), reverse=True)

    facilities = db.query(Facility).filter(Facility.is_operational == True).all()  # noqa: E712
    contains_demo = any(
        (r.report_id or "").startswith("rep-demo-") for r in located
    )

    return {
        "cells": heatmap_cells,
        "facilities": [
            {
                "facility_id": f.facility_id,
                "name": f.name,
                "facility_type": f.facility_type,
                "latitude": f.latitude,
                "longitude": f.longitude,
                "is_operational": f.is_operational,
            }
            for f in facilities
        ],
        "reports_with_location": len(located),
        "unlocated_reports": unlocated,
        "victim_people_total": victim_total,
        "rescuer_units_total": rescuer_total,
        "grid_size_meters": HEATMAP_GRID_METERS,
        "last_updated": datetime.now(timezone.utc),
        "privacy_note": (
            "Points are grouped into about 390 m cells. Exact personal coordinates "
            "are not shown on this map."
        ),
        "sample_note": "Includes seeded demonstration reports until replaced by live field data.",
        "contains_demo_data": contains_demo,
    }
