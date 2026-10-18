import requests
import time
import subprocess
import sys
import os

BASE_URL = "http://localhost:8000"

def run_e2e_test():
    print("=== STARTING MED-LINK END-TO-END VERIFICATION TEST ===")
    
    # 1. Health check
    print("\n1. Testing Backend Health Endpoint...")
    res = requests.get(f"{BASE_URL}/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    health_data = res.json()
    print(f"   [PASS] Health Status: {health_data['status']}, Database: {health_data['database']}")
    
    # 2. Healthcare facilities
    print("\n2. Testing Healthcare Facilities Endpoint...")
    res = requests.get(f"{BASE_URL}/facilities")
    assert res.status_code == 200
    facilities = res.json()
    assert len(facilities) >= 1
    print(f"   [PASS] Retrieved {len(facilities)} regional healthcare facilities. Sample: {facilities[0]['name']}")
    
    # 3. Mobile report submission
    test_report_id = f"e2e-mobile-test-{int(time.time())}"
    print(f"\n3. Submitting Mobile Report (ID: {test_report_id})...")
    payload = {
        "report_id": test_report_id,
        "emergency_type": "Pregnancy",
        "urgency": "High",
        "latitude": 30.5564,
        "longitude": 79.5662,
        "location_name": "Joshimath Ward 4 Relief Tent",
        "description": "Patient in 39th week, labor pains started during heavy rains."
    }
    res = requests.post(f"{BASE_URL}/reports", json=payload)
    assert res.status_code in [200, 201], f"Expected 200/201, got {res.status_code}"
    rep = res.json()
    assert rep["report_id"] == test_report_id
    assert rep["verification_status"] == "UNVERIFIED"
    assert rep["sync_status"] == "RECEIVED_BY_SERVER"
    print(f"   [PASS] Server acknowledged receipt. Status: {rep['sync_status']}, Verification: {rep['verification_status']}")
    
    # 4. Idempotence Check
    print("\n4. Testing Idempotence (Re-submitting duplicate report_id)...")
    res_dup = requests.post(f"{BASE_URL}/reports", json=payload)
    assert res_dup.status_code == 200, f"Expected 200 for idempotent re-submission, got {res_dup.status_code}"
    assert res_dup.json()["report_id"] == test_report_id
    print("   [PASS] Idempotent submission confirmed: duplicate record was not created.")
    
    # 5. Security & RBAC: Unauthenticated verification must fail
    print("\n5. Testing Security: Unauthenticated verification attempt...")
    unauth_res = requests.patch(
        f"{BASE_URL}/reports/{test_report_id}/verification",
        json={"verification_status": "VERIFIED", "notes": "Hacker attempt"}
    )
    assert unauth_res.status_code == 401, f"Expected 401 Unauthorized, got {unauth_res.status_code}"
    print("   [PASS] Protected responder endpoint rejected unauthenticated request with 401 Unauthorized.")
    
    # 6. Responder Login
    print("\n6. Logging in as Authorized Responder (responder_ravi)...")
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "username": "responder_ravi",
        "password": "Responder@12345"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    user_info = login_res.json()["user"]
    print(f"   [PASS] Authenticated as {user_info['full_name']} (Role: {user_info['role']})")
    
    # 7. Authorized Verification
    print(f"\n7. Performing Authorized Verification on {test_report_id}...")
    headers = {"Authorization": f"Bearer {token}"}
    verify_res = requests.patch(
        f"{BASE_URL}/reports/{test_report_id}/verification",
        json={
            "verification_status": "VERIFIED",
            "notes": "SDRF High Altitude Medical Rescue team dispatched with obstetric kit."
        },
        headers=headers
    )
    assert verify_res.status_code == 200
    updated_rep = verify_res.json()
    assert updated_rep["verification_status"] == "VERIFIED"
    assert updated_rep["verified_by"] == "responder_ravi"
    print(f"   [PASS] Incident verified by {updated_rep['verified_by']}. Status is now {updated_rep['verification_status']}.")
    
    # 8. Verification Audit Log Check
    print("\n8. Checking Audit Log Trail...")
    audit_res = requests.get(f"{BASE_URL}/reports/{test_report_id}/audit-logs", headers=headers)
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) >= 1
    assert logs[0]["responder_username"] == "responder_ravi"
    assert logs[0]["previous_status"] == "UNVERIFIED"
    assert logs[0]["new_status"] == "VERIFIED"
    print(f"   [PASS] Immutable audit log entry found: {logs[0]['responder_username']} changed status from {logs[0]['previous_status']} to {logs[0]['new_status']} at {logs[0]['timestamp']}")
    
    # 9. Mobile Client Pulls Verification Status
    print("\n9. Testing Mobile Status Pull (/sync/pull)...")
    pull_res = requests.get(f"{BASE_URL}/sync/pull?report_ids={test_report_id}")
    assert pull_res.status_code == 200
    pull_data = pull_res.json()
    assert len(pull_data["reports"]) == 1
    assert pull_data["reports"][0]["verification_status"] == "VERIFIED"
    print(f"   [PASS] Mobile app successfully pulled confirmed verification: {pull_data['reports'][0]['verification_status']}")
    
    print("\n=== ALL END-TO-END SYSTEM INTEGRATION TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_e2e_test()
