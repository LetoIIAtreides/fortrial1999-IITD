from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.facility import Facility
from app.schemas.facility import FacilityResponse

router = APIRouter(prefix="/facilities", tags=["Healthcare Facilities"])

@router.get("", response_model=List[FacilityResponse])
def get_facilities(
    district: Optional[str] = Query(None, description="Filter by district"),
    facility_type: Optional[str] = Query(None, description="Filter by facility type"),
    operational_only: bool = Query(True, description="Filter only currently operational facilities"),
    db: Session = Depends(get_db)
):
    query = db.query(Facility)
    if operational_only:
        query = query.filter(Facility.is_operational == True)
    if district:
        query = query.filter(Facility.district.ilike(f"%{district}%"))
    if facility_type:
        query = query.filter(Facility.facility_type.ilike(f"%{facility_type}%"))
        
    return query.all()
