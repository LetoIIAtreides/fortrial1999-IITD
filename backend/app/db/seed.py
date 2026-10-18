import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, Base, engine
from app.models.user import User
from app.models.facility import Facility
from app.models.report import Report, EmergencyType, UrgencyLevel, SyncStatus, VerificationStatus
from app.models.audit import VerificationAuditLog
from app.models.road import RoadSegment, TransportOption, TransportRequest
from app.core.security import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # 1. Users & Responders
        if not db.query(User).filter(User.username == "admin").first():
            admin_user = User(
                user_id=str(uuid.uuid4()),
                username="admin",
                email="admin@aarogyalink.org",
                hashed_password=get_password_hash("Admin@12345"),
                role="admin",
                full_name="Dr. Sanjeev Sharma (Chief Medical Officer)",
                badge_number="DIR-HEALTH-01",
                is_active=True
            )
            db.add(admin_user)
        
        responder_ravi = db.query(User).filter(User.username == "responder_ravi").first()
        if not responder_ravi:
            responder_ravi = User(
                user_id=str(uuid.uuid4()),
                username="responder_ravi",
                email="ravi.kumar@sdrf.gov.in",
                hashed_password=get_password_hash("Responder@12345"),
                role="responder",
                full_name="Ravi Kumar (Disaster Medical First Responder)",
                badge_number="SDRF-MED-108",
                is_active=True
            )
            db.add(responder_ravi)
            
        responder_anita = db.query(User).filter(User.username == "responder_anita").first()
        if not responder_anita:
            responder_anita = User(
                user_id=str(uuid.uuid4()),
                username="responder_anita",
                email="anita.joshi@redcross.org",
                hashed_password=get_password_hash("Responder@12345"),
                role="responder",
                full_name="Anita Joshi (Community Health Officer)",
                badge_number="CHO-CHAMOLI-04",
                is_active=True
            )
            db.add(responder_anita)

        db.commit()

        # 2. Healthcare Facilities
        if db.query(Facility).count() == 0:
            facilities_data = [
                {
                    "facility_id": "fac-001",
                    "name": "District Hospital Gopeshwar",
                    "facility_type": "District Hospital",
                    "address": "Hospital Road, Gopeshwar, Chamoli",
                    "district": "Chamoli",
                    "state": "Uttarakhand",
                    "latitude": 30.4182,
                    "longitude": 79.3242,
                    "phone": "+91-1372-252244",
                    "emergency_capacity": "High (Trauma & Surgical Care Operational)",
                    "is_operational": True
                },
                {
                    "facility_id": "fac-002",
                    "name": "Joshimath Community Health Centre (CHC)",
                    "facility_type": "Community Health Centre",
                    "address": "Main Badrinath Marg, Joshimath",
                    "district": "Chamoli",
                    "state": "Uttarakhand",
                    "latitude": 30.5564,
                    "longitude": 79.5662,
                    "phone": "+91-1372-222120",
                    "emergency_capacity": "Moderate (Oxygen & Emergency Stabilization)",
                    "is_operational": True
                },
                {
                    "facility_id": "fac-003",
                    "name": "Town Hospital Relief Station",
                    "facility_type": "Field Hospital",
                    "address": "NH-58 Bypass, Near Town Ghat",
                    "district": "Chamoli",
                    "state": "Uttarakhand",
                    "latitude": 30.5650,
                    "longitude": 79.5750,
                    "phone": "+91-1372-222180",
                    "emergency_capacity": "Active (Emergency Triage & Maternity)",
                    "is_operational": True
                },
                {
                    "facility_id": "fac-004",
                    "name": "Karnaprayag Sub-District Hospital",
                    "facility_type": "Sub-District Hospital",
                    "address": "NH-58 Junction, Karnaprayag",
                    "district": "Chamoli",
                    "state": "Uttarakhand",
                    "latitude": 30.2588,
                    "longitude": 79.2173,
                    "phone": "+91-1363-244222",
                    "emergency_capacity": "Available (Blood Bank & Emergency Unit)",
                    "is_operational": True
                },
                {
                    "facility_id": "fac-005",
                    "name": "Rudraprayag Combined Hospital",
                    "facility_type": "District Hospital",
                    "address": "Belni, Rudraprayag",
                    "district": "Rudraprayag",
                    "state": "Uttarakhand",
                    "latitude": 30.2854,
                    "longitude": 78.9811,
                    "phone": "+91-1364-233301",
                    "emergency_capacity": "High (Disaster Ward Ready)",
                    "is_operational": True
                },
                {
                    "facility_id": "fac-006",
                    "name": "AIIMS Rishikesh Emergency & Trauma Centre",
                    "facility_type": "Apex Trauma Centre",
                    "address": "Virbhadra Road, Rishikesh",
                    "district": "Dehradun",
                    "state": "Uttarakhand",
                    "latitude": 30.0758,
                    "longitude": 78.2882,
                    "phone": "+91-135-2462929",
                    "emergency_capacity": "Max Capacity (Level 1 Trauma & Air Ambulance)",
                    "is_operational": True
                }
            ]
            for f in facilities_data:
                facility = Facility(
                    facility_id=f["facility_id"],
                    name=f["name"],
                    facility_type=f["facility_type"],
                    address=f["address"],
                    district=f["district"],
                    state=f["state"],
                    latitude=f["latitude"],
                    longitude=f["longitude"],
                    phone=f["phone"],
                    emergency_capacity=f["emergency_capacity"],
                    is_operational=f["is_operational"],
                    last_updated_at=datetime.now(timezone.utc)
                )
                db.add(facility)
            db.commit()

        # 3. Road Segments
        if db.query(RoadSegment).count() == 0:
            now = datetime.now(timezone.utc)
            roads_data = [
                {
                    "road_name": "Road B",
                    "status": "OPEN",
                    "hazard_details": "River road clear, passable for light vehicles & foot.",
                    "travel_time": "About 40 min",
                    "destination": "Camp A & Ghat",
                    "distance_km": 4.5,
                    "last_reported_at": now - timedelta(minutes=15)
                },
                {
                    "road_name": "Road C",
                    "status": "RISKY",
                    "hazard_details": "Road C has water 0.3 m. Avoid at night.",
                    "travel_time": "About 2 h 10 min",
                    "destination": "Town hospital",
                    "distance_km": 9.0,
                    "last_reported_at": now - timedelta(minutes=35)
                },
                {
                    "road_name": "Road D",
                    "status": "BLOCKED",
                    "hazard_details": "Landslide rockfall debris blocking roadway completely.",
                    "travel_time": "Impassable",
                    "destination": "Upper Ridge",
                    "distance_km": 6.2,
                    "last_reported_at": now - timedelta(hours=1)
                },
                {
                    "road_name": "Bridge 1",
                    "status": "BLOCKED",
                    "hazard_details": "Bridge 1 blocked, water 0.8 m. 3 reports, 20 min ago.",
                    "travel_time": "Impassable",
                    "destination": "Town hospital connector",
                    "distance_km": 2.1,
                    "last_reported_at": now - timedelta(minutes=20)
                }
            ]
            for r in roads_data:
                db.add(RoadSegment(
                    road_id=str(uuid.uuid4()),
                    road_name=r["road_name"],
                    status=r["status"],
                    hazard_details=r["hazard_details"],
                    travel_time=r["travel_time"],
                    destination=r["destination"],
                    distance_km=r["distance_km"],
                    last_reported_at=r["last_reported_at"],
                    reported_by="District Observer"
                ))
            db.commit()

        # 4. Transport Options
        if db.query(TransportOption).count() == 0:
            options_data = [
                {
                    "transport_type": "Boat",
                    "badge": "Best option",
                    "status": "OPEN",
                    "description": "2 boats at the ghat, 8 seats. About 1 h 20 min.",
                    "is_available": True
                },
                {
                    "transport_type": "Walk",
                    "badge": "! Risky",
                    "status": "RISKY",
                    "description": "Road C has water 0.3 m. About 2 h 10 min. Avoid at night.",
                    "is_available": True
                },
                {
                    "transport_type": "Truck or tractor",
                    "badge": "x Blocked",
                    "status": "BLOCKED",
                    "description": "Bridge 1 blocked, water 0.8 m. 3 reports, 20 min ago.",
                    "is_available": False
                },
                {
                    "transport_type": "Ambulance (4x4)",
                    "badge": "! Waiting",
                    "status": "WAITING",
                    "description": "Waiting at Camp A. Can go once Road C is open.",
                    "is_available": True
                }
            ]
            for opt in options_data:
                db.add(TransportOption(
                    option_id=str(uuid.uuid4()),
                    transport_type=opt["transport_type"],
                    badge=opt["badge"],
                    status=opt["status"],
                    description=opt["description"],
                    is_available=opt["is_available"]
                ))
            db.commit()

        # 5. Reports (Needs and Offers)
        if db.query(Report).count() == 0:
            now = datetime.now(timezone.utc)
            reports_data = [
                {
                    "report_id": "rep-demo-001",
                    "report_type": "NEED",
                    "emergency_type": "Insulin",
                    "urgency": "Urgent",
                    "created_at": now - timedelta(minutes=12),
                    "latitude": 30.5570,
                    "longitude": 79.5670,
                    "location_name": "Ward 4 · 3 reports within 200 m · 1 live photo",
                    "ward": "Ward 4",
                    "people_affected": 3,
                    "description": "Diabetic patient stranded due to flood surge. Needs rapid insulin supply. Water level rising around doorstep.",
                    "evidence_type": "photo",
                    "water_depth": "~1.2 m",
                    "trust_score": 78,
                    "ai_check_status": "Likely genuine",
                    "device_fingerprint": "device ending 4F2",
                    "nearby_match": "Camp A has insulin (low stock), 1.1 km away",
                    "sync_status": SyncStatus.RECEIVED_BY_SERVER.value,
                    "verification_status": VerificationStatus.UNVERIFIED.value
                },
                {
                    "report_id": "rep-demo-002",
                    "report_type": "NEED",
                    "emergency_type": "Pregnancy",
                    "urgency": "Critical",
                    "created_at": now - timedelta(minutes=25),
                    "latitude": 30.5540,
                    "longitude": 79.5680,
                    "location_name": "Ward 4 · field worker report",
                    "ward": "Ward 4",
                    "people_affected": 1,
                    "description": "Woman in labor 39th week, water broken. Medical escort required immediately.",
                    "trust_score": 95,
                    "ai_check_status": "Verified by CHO Anita",
                    "device_fingerprint": "device-CHO-88",
                    "nearby_match": "Town Hospital has available delivery kit",
                    "sync_status": SyncStatus.RECEIVED_BY_SERVER.value,
                    "verification_status": VerificationStatus.VERIFIED.value,
                    "verified_at": now - timedelta(minutes=20),
                    "verified_by": "responder_ravi",
                    "verification_notes": "SDRF team dispatched with paramedic. ETA 15 mins."
                },
                {
                    "report_id": "rep-demo-003",
                    "report_type": "NEED",
                    "emergency_type": "Medicines",
                    "urgency": "Urgent",
                    "created_at": now - timedelta(minutes=40),
                    "latitude": 30.5600,
                    "longitude": 79.5620,
                    "location_name": "Ward 3 · 1 report, no photo",
                    "ward": "Ward 3",
                    "people_affected": 1,
                    "description": "Hypertension medication urgently needed for elderly resident.",
                    "trust_score": 46,
                    "ai_check_status": "Needs review",
                    "device_fingerprint": "device-9A1",
                    "sync_status": SyncStatus.RECEIVED_BY_SERVER.value,
                    "verification_status": VerificationStatus.UNVERIFIED.value
                },
                {
                    "report_id": "rep-demo-004",
                    "report_type": "NEED",
                    "emergency_type": "Food",
                    "urgency": "Medium",
                    "created_at": now - timedelta(hours=1),
                    "latitude": 30.5480,
                    "longitude": 79.5750,
                    "location_name": "Outside impact zone · repeated device",
                    "ward": "Ward 3",
                    "people_affected": 200,
                    "description": "Requesting 200 food packets at private residence outside affected sector.",
                    "trust_score": 14,
                    "ai_check_status": "Likely false",
                    "device_fingerprint": "device-7C3",
                    "flagged_reason": "Outside impact zone · repeated device report",
                    "sync_status": SyncStatus.RECEIVED_BY_SERVER.value,
                    "verification_status": VerificationStatus.FLAGGED.value
                },
                {
                    "report_id": "rep-demo-005",
                    "report_type": "OFFER",
                    "emergency_type": "Insulin",
                    "urgency": "Low",
                    "created_at": now - timedelta(minutes=50),
                    "latitude": 30.5620,
                    "longitude": 79.5710,
                    "location_name": "Camp A: insulin low",
                    "ward": "Ward 5",
                    "people_affected": 0,
                    "description": "Red Cross relief stock has 12 vials of regular insulin available at dispensary tent.",
                    "trust_score": 98,
                    "ai_check_status": "Camp Verified Stock",
                    "sync_status": SyncStatus.RECEIVED_BY_SERVER.value,
                    "verification_status": VerificationStatus.VERIFIED.value,
                    "verified_at": now - timedelta(minutes=45),
                    "verified_by": "responder_anita",
                    "verification_notes": "Stock counted and stored in cold box."
                },
                {
                    "report_id": "rep-demo-006",
                    "report_type": "OFFER",
                    "emergency_type": "Transport",
                    "urgency": "Low",
                    "created_at": now - timedelta(hours=1, minutes=10),
                    "latitude": 30.5630,
                    "longitude": 79.5650,
                    "location_name": "Ambulance 1",
                    "ward": "Ward 5",
                    "people_affected": 0,
                    "description": "4x4 Emergency Ambulance stationed at Camp A with oxygen.",
                    "trust_score": 95,
                    "ai_check_status": "Emergency Vehicle Ready",
                    "sync_status": SyncStatus.RECEIVED_BY_SERVER.value,
                    "verification_status": VerificationStatus.VERIFIED.value
                },
                {
                    "report_id": "rep-demo-007",
                    "report_type": "OFFER",
                    "emergency_type": "Clean water",
                    "urgency": "Low",
                    "created_at": now - timedelta(hours=1, minutes=30),
                    "latitude": 30.5590,
                    "longitude": 79.5610,
                    "location_name": "Water 200 L",
                    "ward": "Ward 4",
                    "people_affected": 0,
                    "description": "Packaged bottled water 200 Litres at local community depot.",
                    "trust_score": 75,
                    "ai_check_status": "Community Offer",
                    "sync_status": SyncStatus.RECEIVED_BY_SERVER.value,
                    "verification_status": VerificationStatus.UNVERIFIED.value
                },
                {
                    "report_id": "rep-demo-008",
                    "report_type": "NEED",
                    "emergency_type": "First aid",
                    "urgency": "Urgent",
                    "created_at": now - timedelta(hours=2),
                    "latitude": 30.5520,
                    "longitude": 79.5620,
                    "location_name": "Ward 4 South Colony",
                    "ward": "Ward 4",
                    "people_affected": 2,
                    "description": "Fracture and deep cuts after wall collapse. Need bandages and antiseptics.",
                    "trust_score": 70,
                    "ai_check_status": "Pending verification",
                    "sync_status": SyncStatus.RECEIVED_BY_SERVER.value,
                    "verification_status": VerificationStatus.UNVERIFIED.value
                }
            ]
            for r in reports_data:
                rep = Report(
                    report_id=r["report_id"],
                    report_type=r.get("report_type", "NEED"),
                    emergency_type=r["emergency_type"],
                    urgency=r["urgency"],
                    created_at=r["created_at"],
                    latitude=r["latitude"],
                    longitude=r["longitude"],
                    location_name=r["location_name"],
                    ward=r.get("ward", "Ward 4"),
                    people_affected=r.get("people_affected", 1),
                    description=r.get("description"),
                    evidence_type=r.get("evidence_type", "none"),
                    water_depth=r.get("water_depth"),
                    trust_score=r.get("trust_score", 75),
                    ai_check_status=r.get("ai_check_status", "Likely genuine"),
                    device_fingerprint=r.get("device_fingerprint", "device-4F2"),
                    flagged_reason=r.get("flagged_reason"),
                    nearby_match=r.get("nearby_match"),
                    sync_status=r["sync_status"],
                    verification_status=r["verification_status"],
                    verified_at=r.get("verified_at"),
                    verified_by=r.get("verified_by"),
                    verification_notes=r.get("verification_notes"),
                    last_synced_at=now
                )
                db.add(rep)
            db.commit()

    finally:
        db.close()
