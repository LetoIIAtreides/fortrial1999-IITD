import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, Base, engine
from app.models.user import User
from app.models.facility import Facility
from app.models.report import Report, EmergencyType, UrgencyLevel, SyncStatus, VerificationStatus
from app.models.audit import VerificationAuditLog
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

        # 2. Healthcare Facilities (Disaster & Flood Prone Himalayan Region)
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
                    "name": "Joshimath Community Health Centre",
                    "facility_type": "Community Health Centre (CHC)",
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
                    "facility_id": "fac-004",
                    "name": "Rudraprayag District Combined Hospital",
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
                    "facility_id": "fac-005",
                    "name": "Guptkashi Primary Health Centre",
                    "facility_type": "Primary Health Centre (PHC)",
                    "address": "Kedarnath Highway, Guptkashi",
                    "district": "Rudraprayag",
                    "state": "Uttarakhand",
                    "latitude": 30.5231,
                    "longitude": 79.0768,
                    "phone": "+91-1364-267111",
                    "emergency_capacity": "Basic (Triage & First Aid Only)",
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

        # 3. Seed initial reports
        if db.query(Report).count() == 0:
            now = datetime.now(timezone.utc)
            reports_data = [
                {
                    "report_id": "rep-demo-001",
                    "emergency_type": EmergencyType.PREGNANCY.value,
                    "urgency": UrgencyLevel.HIGH.value,
                    "created_at": now - timedelta(hours=2),
                    "latitude": 30.5210,
                    "longitude": 79.5601,
                    "location_name": "Near Joshimath Helipad, Ward 3",
                    "description": "Patient in 38th week, severe labour pains started after flash flood cut off road access.",
                    "sync_status": SyncStatus.RECEIVED_BY_SERVER.value,
                    "verification_status": VerificationStatus.UNVERIFIED.value
                },
                {
                    "report_id": "rep-demo-002",
                    "emergency_type": EmergencyType.BLEEDING.value,
                    "urgency": UrgencyLevel.HIGH.value,
                    "created_at": now - timedelta(hours=4),
                    "latitude": 30.4150,
                    "longitude": 79.3210,
                    "location_name": "Gopeshwar Bypass, landslide zone",
                    "description": "Deep laceration on right leg due to rockfall debris, bleeding uncontrolled with cloth.",
                    "sync_status": SyncStatus.RECEIVED_BY_SERVER.value,
                    "verification_status": VerificationStatus.VERIFIED.value,
                    "verified_at": now - timedelta(hours=3, minutes=30),
                    "verified_by": "responder_ravi",
                    "verification_notes": "SDRF team dispatched with trauma kit. ETA 20 mins."
                },
                {
                    "report_id": "rep-demo-003",
                    "emergency_type": EmergencyType.MEDICINE_NEEDED.value,
                    "urgency": UrgencyLevel.MEDIUM.value,
                    "created_at": now - timedelta(hours=6),
                    "latitude": 30.2820,
                    "longitude": 78.9800,
                    "location_name": "Rudraprayag riverside colony",
                    "description": "Insulin vials washed away in river surge; diabetic elder without medication for 24h.",
                    "sync_status": SyncStatus.RECEIVED_BY_SERVER.value,
                    "verification_status": VerificationStatus.UNVERIFIED.value
                },
                {
                    "report_id": "rep-demo-004",
                    "emergency_type": EmergencyType.INJURY.value,
                    "urgency": UrgencyLevel.MEDIUM.value,
                    "created_at": now - timedelta(hours=8),
                    "latitude": 30.2550,
                    "longitude": 79.2150,
                    "location_name": "Karnaprayag market area",
                    "description": "Suspected arm fracture after slipping on muddy slope while evacuating.",
                    "sync_status": SyncStatus.RECEIVED_BY_SERVER.value,
                    "verification_status": VerificationStatus.RESOLVED.value,
                    "verified_at": now - timedelta(hours=5),
                    "verified_by": "responder_anita",
                    "verification_notes": "Patient safely transferred to Karnaprayag Sub-District Hospital, splint applied."
                },
                {
                    "report_id": "rep-demo-005",
                    "emergency_type": EmergencyType.FEVER.value,
                    "urgency": UrgencyLevel.LOW.value,
                    "created_at": now - timedelta(hours=10),
                    "latitude": 30.5200,
                    "longitude": 79.0740,
                    "location_name": "Guptkashi relief camp tent 12",
                    "description": "Child running 101F fever for 2 days with mild cough. Paracetamol supply needed.",
                    "sync_status": SyncStatus.RECEIVED_BY_SERVER.value,
                    "verification_status": VerificationStatus.UNVERIFIED.value
                }
            ]
            for r in reports_data:
                rep = Report(
                    report_id=r["report_id"],
                    emergency_type=r["emergency_type"],
                    urgency=r["urgency"],
                    created_at=r["created_at"],
                    latitude=r["latitude"],
                    longitude=r["longitude"],
                    location_name=r["location_name"],
                    description=r["description"],
                    sync_status=r["sync_status"],
                    verification_status=r["verification_status"],
                    verified_at=r.get("verified_at"),
                    verified_by=r.get("verified_by"),
                    verification_notes=r.get("verification_notes"),
                    last_synced_at=now
                )
                db.add(rep)
                
                # Add audit log for verified/resolved ones
                if r["verification_status"] in [VerificationStatus.VERIFIED.value, VerificationStatus.RESOLVED.value]:
                    audit = VerificationAuditLog(
                        report_id=r["report_id"],
                        responder_id=responder_ravi.user_id if r["verified_by"] == "responder_ravi" else responder_anita.user_id,
                        responder_username=r["verified_by"],
                        previous_status=VerificationStatus.UNVERIFIED.value,
                        new_status=r["verification_status"],
                        notes=r.get("verification_notes"),
                        timestamp=r.get("verified_at") or now
                    )
                    db.add(audit)
                    
            db.commit()
            
        print("Database seeding completed successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
