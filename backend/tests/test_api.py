import pytest
from fastapi.testclient import TestClient
import uuid
from main import app
from app.db.session import SessionLocal
from app.models.report import Report, VerificationStatus

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
    res = client.get("/reports?category=Pregnancy&page=1&page_size=10")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) >= 1

def test_get_report_by_id():
    # Use existing seeded report
    res = client.get("/reports/rep-demo-001")
    assert res.status_code == 200
    assert res.json()["report_id"] == "rep-demo-001"
    
    # Non-existing report -> 404
    res_404 = client.get("/reports/rep-non-existing-999")
    assert res_404.status_code == 404

def test_facilities_endpoint():
    res = client.get("/facilities")
    assert res.status_code == 200
    facilities = res.json()
    assert len(facilities) >= 1
    first = facilities[0]
    assert "name" in first
    assert "emergency_capacity" in first
    assert "latitude" in first
    assert "longitude" in first

def test_responder_auth_and_verification():
    # 1. Unauthenticated verification attempt must fail (401)
    unauth_res = client.patch(
        "/reports/rep-demo-001/verification",
        json={"verification_status": "VERIFIED", "notes": "Dispatched emergency team"}
    )
    assert unauth_res.status_code == 401
    
    # 2. Login as authorized responder
    login_res = client.post(
        "/auth/login",
        json={"username": "responder_ravi", "password": "Responder@12345"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Authenticated verification -> 200 OK
    verify_res = client.patch(
        "/reports/rep-demo-001/verification",
        json={"verification_status": "VERIFIED", "notes": "SDRF medical rescue dispatched via ropeway"},
        headers=headers
    )
    assert verify_res.status_code == 200
    updated_data = verify_res.json()
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
