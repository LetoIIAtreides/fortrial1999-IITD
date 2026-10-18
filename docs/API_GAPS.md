# AAROGYA LINK — API & Architecture Gap Analysis

## 1. Implemented Endpoints
All core API endpoints required for this online emergency coordination phase were implemented directly in the FastAPI backend:
- `GET /health`: Connectivity and database health check with engine verification.
- `POST /reports`: Idempotent submission using client-generated UUIDs (`report_id`).
- `GET /reports`: List all reports with filtering by category, urgency, status, and search.
- `GET /reports/{id}`: Single report details and audit trail.
- `GET /resources`: Needs and offers query with bounding box and category filtering.
- `POST /resources`: Post a community need or offer with expiry time.
- `GET /roads`: Query road segments with flood/block status.
- `POST /roads/report`: Community road hazard submission.
- `GET /facilities`: Directory of hospitals, CHCs, and PHCs with geolocation and emergency capacity.
- `GET /alerts`: Regional disaster alerts and warnings.
- `GET /impact`: GeoJSON polygon probability bands (High, Medium, Low).
- `GET /responder/queue`: Prioritized emergency triage queue for authorized responders.
- `POST /responder/reports/{id}/decision`: Human-in-the-loop responder decision (verify, assign, or request info).

## 2. Authentication & Role-Gating
- **Implemented Guard**: JWT authentication via `POST /auth/login` (`responder_ravi`). The responder console route `/responder` is protected by client-side authentication guards and backend bearer token validation.
- **Identified Gap**: Multi-tenant RBAC (e.g. state coordinator vs. district dispatcher vs. field paramedic permissions) is currently unified under standard responder role permissions. Granular field-level redaction (revealing victim contact numbers only to assigned paramedics) is handled via UI-level reveal controls with audit logging.

## 3. Offline Relay Compatibility
- In accordance with the prompt guidelines, no Bluetooth, Nearby Connections, or fake simulation was added in this phase.
- Report submission is abstracted through local storage (`storage.ts`) with idempotent server transition (`SAVED_LOCAL` -> `RECEIVED_BY_SERVER`). This ensures seamless pluggability of a future mesh relay transport without modifying UI components.
