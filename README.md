# Freightpilot

Freightpilot is a full-stack trip management and FMCSA compliance platform for commercial drivers and fleet operators. The system automates trip planning, Hours-of-Service (HOS) calculations, DOT log generation, and dashboard insights across Django REST back-end APIs and a React front-end.

## Repository Layout

```
freightpilot/
├── backend/   # Django + DRF project (config/) and core app
└── frontend/  # React + Vite + Tailwind client
```

## Prerequisites
- Python 3.12+
- Node.js 22.12+ (minimum 20.19; latest LTS recommended to satisfy Vite/Eslint engine warnings)
- npm 10+
- PostgreSQL 14+ (for production; SQLite works locally without env vars)

## Backend Setup
1. Create environment file:
   ```bash
   cd backend
   copy .env.example .env  # or use cp on Unix
   ```
2. Adjust secrets + database credentials inside `.env`.
3. Create virtual environment & install dependencies:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows (source .venv/bin/activate for Unix)
   pip install -r requirements.txt
   ```
4. Apply migrations & run dev server:
   ```bash
   python manage.py migrate
   python manage.py runserver 0.0.0.0:8000
   ```
5. Health endpoint: `GET http://localhost:8000/api/v1/health/`

### Auth Endpoints (Phase 1)
- `POST /api/v1/auth/register/` – create driver/admin account (fields: email, full_name, password, role, CDL/profile info)
- `POST /api/v1/auth/login/` – obtain JWT access & refresh tokens (SimpleJWT)
- `POST /api/v1/auth/refresh/` – refresh access token
- `GET/PATCH /api/v1/auth/profile/` – fetch or update current user profile

> **Note:** The system now uses a custom user model (`accounts.User`) that authenticates via unique email addresses. Create superusers with `python manage.py createsuperuser --email admin@example.com`.

### Trip Planner Endpoints (Phase 2 groundwork)
- `GET /api/v1/trips/` – list trips for the authenticated driver (admins see all)
- `POST /api/v1/trips/` – create a trip with required metadata; automatically runs the placeholder HOS planner and stores duty segments
- `POST /api/v1/trips/{id}/regenerate_schedule/` – rerun the schedule engine for an existing trip

Data models introduced:
- `Vehicle` – truck/trailer metadata + fuel efficiency bound to a driver
- `Trip` – captures inputs like locations, duty clocks, driver type, and stores generated schedule snapshots
- `DutyStatus` – segments representing Off Duty/Sleeper/Driving/On Duty blocks
- `LogSheet` – placeholder for future DOT log exports

### Backend Tech Highlights
- JWT auth via `djangorestframework-simplejwt`
- API versioning + schema served at `/api/schema/` with Swagger/Redoc helpers
- CORS configured for localhost front-end origins
- Environment-driven Postgres/SQLite selection

## Frontend Setup
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. (Optional) Install exact Node version required by tooling if warnings occur.
3. Start dev server:
   ```bash
   npm run dev -- --host
   ```
4. Build for production:
   ```bash
   npm run build
   npm run preview
   ```

### Frontend Tech Highlights
- React 18 + Vite + TypeScript
- Tailwind CSS with custom palette/typography
- React Router + React Query foundational providers

## Running Tests
- Backend (pytest/django): _pending setup in future phase_
- Frontend (Vitest/Testing Library): _pending setup_

## Environment Variables
Key variables are documented in `backend/.env.example`. Frontend uses Vite’s `import.meta.env` pattern (none required yet).

## Next Steps
- Phase 1: Authentication & user management APIs/UI
- Add automated CI pipelines (GitHub Actions) for lint/test on both stacks
- Expand documentation with API contracts and deployment workflows
