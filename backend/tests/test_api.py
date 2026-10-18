import pytest
from fastapi.testclient import TestClient
import uuid
from main import app
from app.db.session import engine, Base
from app.db.seed import seed_database
from app.models.report import Report, VerificationStatus

# Ensure tables and seed exist
Base.metadata.create_all(bind=engine)
seed_database()

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

def test_create_report_and_idempotence():
    test_id = f"test-rep-{uuid.uuid4()}"
    payload = {
        "report_id": test_id,
        "emergency_type": "Pregnancy",
        "urgency": "High",
        "latitude": 30.55,
        "longitude": 79.56,
        "location_name": "Joshimath Test Ward",
        "description": "Patient in acute distress, transport cut off"
    }
    
    # 1. First submission -> 201 Created
    res1 = client.post("/reports", json=payload)
    assert res1.status_code == 201
    data1 = res1.json()
    assert data1["report_id"] == test_id
    assert data1["emergency_type"] == "Pregnancy"
    assert data1["urgency"] == "High"
    assert data1["sync_status"] == "RECEIVED_BY_SERVER"
    assert data1["verification_status"] == "UNVERIFIED"
    
    # 2. Duplicate submission with same report_id -> 200 OK without duplicate creation
    res2 = client.post("/reports", json=payload)
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["report_id"] == test_id

def test_list_and_filter_reports():
    res = client.get("/reports?page=1&page_size=10")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1

def test_get_report_by_id():
    res = client.get("/reports/rep-demo-001")
    assert res.status_code == 200
    data = res.json()
    assert data["report_id"] == "rep-demo-001"

def test_facilities_endpoint():
    res = client.get("/facilities")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    # Check that hospital has required fields
    hosp = data[0]
    assert "facility_id" in hosp
    assert "name" in hosp
    assert "phone" in hosp
    assert "is_operational" in hosp

def test_responder_auth_and_verification():
    # 1. Unauthorized attempt must be rejected
    unauth_res = client.patch(
        "/reports/rep-demo-001/verification",
        json={"verification_status": "VERIFIED", "notes": "No auth token"}
    )
    assert unauth_res.status_code == 401

    # 2. Login as responder
    login_res = client.post(
        "/auth/login",
        json={"username": "responder_ravi", "password": "Responder@12345"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Perform verified update
    update_res = client.patch(
        "/reports/rep-demo-001/verification",
        json={"verification_status": "VERIFIED", "notes": "Verified by SDRF team"},
        headers=headers
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["verification_status"] == "VERIFIED"
    assert updated_data["verified_by"] == "responder_ravi"
    
    # 4. Check audit log
    audit_res = client.get("/reports/rep-demo-001/audit-logs", headers=headers)
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) >= 1
    assert logs[0]["responder_username"] == "responder_ravi"
    assert logs[0]["new_status"] == "VERIFIED"

def test_sync_push_and_pull():
    rep_id = f"batch-sync-{uuid.uuid4()}"
    push_payload = {
        "reports": [
            {
                "report_id": rep_id,
                "emergency_type": "Injury",
                "urgency": "Medium",
                "location_name": "Helipad Road",
                "description": "Fell on trail during landslide warning"
            }
        ]
    }
    
    # Push batch
    push_res = client.post("/sync/push", json=push_payload)
    assert push_res.status_code == 200
    push_data = push_res.json()
    assert push_data["processed"] == 1
    assert push_data["results"][0]["status"] == "created"
    assert push_data["results"][0]["sync_status"] == "RECEIVED_BY_SERVER"
    
    # Pull status
    pull_res = client.get(f"/sync/pull?report_ids={rep_id}")
    assert pull_res.status_code == 200
    pull_data = pull_res.json()
    assert len(pull_data["reports"]) == 1
    assert pull_data["reports"][0]["report_id"] == rep_id

def test_roads_and_transport():
    # 1. Get roads
    roads_res = client.get("/roads")
    assert roads_res.status_code == 200
    roads = roads_res.json()
    assert len(roads) >= 1
    assert any(r["road_name"] == "Road B" for r in roads)

    # 2. Report road status
    rep_res = client.post("/roads/report", json={
        "road_name": "Road C",
        "status": "RISKY",
        "hazard_details": "Water depth 0.35m at culvert",
        "reported_by": "Volunteer Anil"
    })
    assert rep_res.status_code == 200
    assert rep_res.json()["status"] == "RISKY"

    # 3. Transport options
    opt_res = client.get("/transport/options")
    assert opt_res.status_code == 200
    opts = opt_res.json()
    assert len(opts) >= 1
    assert any(o["transport_type"] == "Boat" for o in opts)

    # 4. Request boat transport
    req_res = client.post("/transport/request", json={
        "transport_type": "Boat",
        "pickup_location": "Ghat Landing Ward 4",
        "destination": "Town hospital",
        "people_count": 2,
        "urgency": "Urgent",
        "notes": "Elderly patient with low insulin"
    })
    assert req_res.status_code == 201
    assert req_res.json()["transport_type"] == "Boat"
    assert req_res.json()["status"] == "REQUESTED"

def test_dashboard_summary():
    res = client.get("/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "open_requests" in data
    assert "needs_count" in data
    assert "offers_count" in data
    assert "verified_count" in data
    assert data["affected_area_km2"] == 2.4

def test_resources_and_offers():
    # 1. Post a resource offer
    res_id = f"test-offer-{uuid.uuid4()}"
    offer_payload = {
        "report_id": res_id,
        "report_type": "OFFER",
        "emergency_type": "Clean water",
        "urgency": "Medium",
        "latitude": 30.556,
        "longitude": 79.567,
        "location_name": "Camp A relief station",
        "description": "50L potable water available for distribution"
    }
    create_res = client.post("/resources", json=offer_payload)
    assert create_res.status_code == 201
    assert create_res.json()["report_id"] == res_id
    assert create_res.json()["report_type"] == "OFFER"

    # 2. Query resources
    list_res = client.get("/resources?kind=OFFER")
    assert list_res.status_code == 200
    assert any(r["report_id"] == res_id for r in list_res.json())

def test_impact_and_alerts():
    # 1. Impact GeoJSON
    imp_res = client.get("/impact")
    assert imp_res.status_code == 200
    imp_data = imp_res.json()
    assert imp_data["type"] == "FeatureCollection"
    assert imp_data["is_estimate"] is True
    assert len(imp_data["features"]) >= 1

    # 2. Area alerts
    alert_res = client.get("/alerts")
    assert alert_res.status_code == 200
    alerts = alert_res.json()
    assert len(alerts) >= 1
    assert alerts[0]["is_estimate"] is True

def test_transport_endpoint():
    res = client.get("/transport")
    assert res.status_code == 200
    assert len(res.json()) >= 1

def test_responder_queue_and_decision():
    # 1. Get queue
    q_res = client.get("/responder/queue")
    assert q_res.status_code == 200
    assert isinstance(q_res.json(), list)

    # 2. Decision on report
    rep = q_res.json()[0]
    rep_id = rep["report_id"]
    dec_res = client.post(f"/responder/reports/{rep_id}/decision", json={
        "decision": "VERIFY_AND_ASSIGN",
        "assigned_to": "SDRF Team Bravo",
        "notes": "Verified via radio check"
    })
    assert dec_res.status_code == 200
    assert dec_res.json()["verification_status"] == "VERIFIED"
    assert dec_res.json()["assigned_to"] == "SDRF Team Bravo"

