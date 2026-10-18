import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import get_db
from app.models.road import RoadSegment, TransportOption, TransportRequest
from app.schemas.report import (
    RoadResponse,
    RoadReportCreate,
    TransportOptionResponse,
    TransportRequestCreate,
    TransportRequestResponse,
)

router = APIRouter(tags=["Roads & Transport"])

@router.get("/roads", response_model=List[RoadResponse])
def get_roads(db: Session = Depends(get_db)):
    roads = db.query(RoadSegment).order_by(RoadSegment.road_name).all()
    return roads

@router.post("/roads/report", response_model=RoadResponse)
def report_road_status(payload: RoadReportCreate, db: Session = Depends(get_db)):
    # Check if road segment exists, update or create
    road = db.query(RoadSegment).filter(RoadSegment.road_name.ilike(payload.road_name)).first()
    now = datetime.now(timezone.utc)
    if road:
        road.status = payload.status.upper()
        if payload.hazard_details:
            road.hazard_details = payload.hazard_details
        road.last_reported_at = now
        road.reported_by = payload.reported_by
    else:
        road = RoadSegment(
            road_id=str(uuid.uuid4()),
            road_name=payload.road_name,
            status=payload.status.upper(),
            hazard_details=payload.hazard_details,
            last_reported_at=now,
            reported_by=payload.reported_by
        )
        db.add(road)
    db.commit()
    db.refresh(road)
    return road

@router.get("/transport/options", response_model=List[TransportOptionResponse])
def get_transport_options(db: Session = Depends(get_db)):
    options = db.query(TransportOption).all()
    return options

@router.post("/transport/request", response_model=TransportRequestResponse, status_code=status.HTTP_201_CREATED)
def create_transport_request(payload: TransportRequestCreate, db: Session = Depends(get_db)):
    new_request = TransportRequest(
        request_id=f"trans-{int(datetime.now(timezone.utc).timestamp())}",
        transport_type=payload.transport_type,
        pickup_location=payload.pickup_location,
        destination=payload.destination or "Town hospital",
        people_count=payload.people_count,
        urgency=payload.urgency or "Urgent",
        notes=payload.notes,
        status="REQUESTED",
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

@router.get("/transport/requests", response_model=List[TransportRequestResponse])
def get_transport_requests(db: Session = Depends(get_db)):
    return db.query(TransportRequest).order_by(desc(TransportRequest.created_at)).all()
