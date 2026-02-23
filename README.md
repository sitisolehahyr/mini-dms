# Mini Document Management System (DMS)

Fullstack take-home app built locally with:
- Backend: FastAPI + SQLAlchemy + Alembic + PostgreSQL + JWT
- Frontend: React + Vite + TypeScript
- File storage: local disk (`backend/storage`)

## 1) Project Structure

```text
mini-dms/
  backend/
    app/
      api/v1/routes/
      core/
      models/
      repositories/
      schemas/
      services/
      utils/
    alembic/
    scripts/
    tests/
    storage/
  frontend/
    src/
      api/
      components/
      contexts/
      layouts/
      pages/
      routes/
      types/
      utils/
  docker-compose.yml
```

## 2) API Endpoints

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Documents
- `GET /api/v1/documents` (pagination + search + filter)
- `POST /api/v1/documents/upload`
- `GET /api/v1/documents/{document_id}`
- `GET /api/v1/documents/{document_id}/download` (JWT-protected)
- `POST /api/v1/documents/{document_id}/replace-request`
- `POST /api/v1/documents/{document_id}/delete-request`

### Permission Requests (admin)
- `GET /api/v1/permission-requests`
- `POST /api/v1/permission-requests/{request_id}/review`

### Notifications
- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/{notification_id}/read`
- `PATCH /api/v1/notifications/read-all`

## 3) Local Run Instructions

## Prerequisites
- Docker + Docker Compose
- Python 3.11
- Node.js 18+

## Start Postgres
```bash
cd /Users/ensonex/mini-dms
docker compose up -d postgres
```

## Backend Setup
```bash
cd /Users/ensonex/mini-dms/backend
cp .env.example .env
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python scripts/seed_admin.py
uvicorn app.main:app --reload --port 8000
```

Default seeded admin:
- email: `admin@example.com`
- password: `Admin123!`

## Frontend Setup
```bash
cd /Users/ensonex/mini-dms/frontend
cp .env.example .env
npm install
npm run dev
```

Frontend URL:
- `http://localhost:5173`

Backend URL:
- `http://localhost:8000`

## 4) Tests

Run backend tests:
```bash
cd /Users/ensonex/mini-dms/backend
source .venv/bin/activate
python -m pytest -q
```

Included key test coverage:
- auth register/login/me
- document listing with pagination + search + filter
- replace/delete request flow
- admin approve/reject flow

## 5) Notes on Workflow & Safety

- Replace/delete request sets document status to `PENDING_REPLACE` or `PENDING_DELETE`, and locks via `locked_by_request_id`.
- Admin review runs with row-level locking (`FOR UPDATE`) for request + document.
- Version conflict protection via `expected_version` checks to avoid stale updates.
- Replace approval promotes pending file to active storage and bumps version atomically in DB transaction.
- Delete approval removes the document transactionally and then cleans file on disk.

## 6) System Design Answers

### How to handle large file uploads?
- Use chunked/multipart upload directly to object storage (S3/GCS) via pre-signed URLs.
- Keep FastAPI as control plane (issue upload session + verify checksum), not data plane.
- Add background workers for virus scan, OCR, metadata extraction.

### How to avoid lost updates when replacing documents?
- Require client to send `expected_version`.
- Reject with conflict when DB version differs.
- Use row lock on approval (`SELECT ... FOR UPDATE`) so only one reviewer mutation applies.

### How to design notifications for scalability?
- Keep notification write model in DB table as source of truth.
- Use outbox/event table and async consumers (Kafka/SQS/RabbitMQ) for fan-out (email/push/websocket).
- Partition notifications by user/time and add cursor-based pagination for high volume.

### How to secure file access?
- No public static file URLs for private docs.
- JWT-authenticated download endpoint + authorization checks (owner/admin).
- Validate path traversal, store opaque file IDs, and audit every file access.

### How to structure services for microservice migration?
- Keep domain services (`auth`, `document`, `permission`, `notification`) with repository interfaces.
- Use DTO contracts at API boundary and avoid framework leakage into domain logic.
- Introduce async events (document_requested/reviewed) so modules can split into services later with minimal rewrites.
