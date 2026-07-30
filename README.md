<p align="center">
  <img src="https://img.shields.io/badge/Status-In%20Development-brightgreen" alt="Status" />
</p>

<h1 align="center">Safe Haven</h1>
<h3 align="center">Recovery Support Platform for Kenya</h3>

<p align="center">
  A private, supportive recovery platform — quiet, honest, and never further than one tap away.
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react" alt="React" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite" alt="Vite" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" /></a>
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white" alt="Python" /></a>
  <a href="https://flask.palletsprojects.com/"><img src="https://img.shields.io/badge/Flask-2.x-000000?logo=flask&logoColor=white" alt="Flask" /></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  <a href="https://swagger.io/"><img src="https://img.shields.io/badge/Docs-Swagger%2FOpenAPI-85EA2D?logo=swagger&logoColor=black" alt="Swagger" /></a>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Environment Variables](#environment-variables)
- [Authentication Flow](#authentication-flow)
- [API Documentation (Swagger)](#api-documentation-swagger)
- [Logging](#logging)
- [Error Handling](#error-handling)
- [Database Migrations](#database-migrations)
- [Testing](#testing)
- [Seed Data](#seed-data)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [Support](#support)
- [Acknowledgments](#acknowledgments)

---

## Overview

**Safe Haven** is a private, anonymous recovery support platform built specifically for the Kenyan context. It gives individuals in addiction recovery a single, trustworthy place to track daily progress, connect with peer support, access verified treatment resources, journal privately, and reach crisis support in one tap — with M-Pesa-powered giving to help sustain the platform.

**Mission:** *To ensure no one in Kenya has to recover alone.*

The project is split into two independently deployable services that share a single product vision:

| Service | Description | Deployed On |
|---|---|---|
| **Frontend** | React + Vite single-page application | [Vercel](https://vercel.com/) |
| **Backend** | Flask REST API | [Render](https://render.com/) |

## Features

### Landing & Marketing
- Hero section with animated breathing exercise visualization
- Feature highlights and value-proposition stat band
- "Why we built this" origin story section
- Fully responsive across devices

### Authentication
- Email/password registration and login
- Google OAuth via Firebase
- Password reset flow
- Anonymous display names for privacy
- Session management with automatic token refresh

### Dashboard
- Daily check-in status at a glance
- Recovery streak tracking with a visual progress ring
- 14-day mood trend chart
- Upcoming group sessions
- Earned milestone badges
- Quick actions for check-in and journaling
- Motivational quotes

### Daily Check-In
- Mood selection (1–5 scale, emoji-based)
- Craving level tracking
- Sobriety status toggle
- Optional freeform notes
- Automatic streak updates

### Milestones
- Recovery day counter
- Milestone badges at 7, 30, 90, 180, 365, 730, and 1000 days
- Visual progress indicators and motivational messaging

### Support Groups
**Community groups** (within Safe Haven)
- Create and join groups
- Real-time-style messaging
- Category filters, public/private options

**External groups** (curated directories)
- Kenya-based fellowships (AA Kenya, NA Kenya)
- Global online fellowships
- Secular and evidence-based alternatives

### Private Journal
- Fully private entries with mood tagging
- Custom tags for organization
- Search and filter
- Edit/delete support
- Animated welcome experience

### Resources
**Treatment center map**
- Interactive map with 80+ centers across Kenya
- Search by name, county, or facility type
- Location-based "centers near me" sorting
- Google Maps directions, call, and website links

**Recovery reading library**
- Curated topics: alcohol, drugs, mental health, and more
- Links to established sources including Mayo Clinic, WHO, and NAMI

**Video library**
- TED Talks, NIDA explainers, guided meditations
- Kenyan and Swahili-language content

### Crisis Support
- 24/7 emergency hotlines, one tap to call NACADA (1192)
- Categorized support: substance use, mental health, family, youth
- Grounding breathing exercise
- WhatsApp integration with Befrienders Kenya

### Donations (M-Pesa Integration)
- STK Push payment flow via Safaricom Daraja
- One-time and monthly giving
- Preset amounts (KES 10–5,000) or custom entry
- Anonymous giving option
- Manual Paybill fallback

### Profile
- Anonymous display name and recovery start date management
- Personal recovery goals
- Email management and sign out

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| [React 18](https://reactjs.org/) | UI library |
| [Vite](https://vitejs.dev/) | Build tool |
| [React Router v6](https://reactrouter.com/) | Routing |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [Lucide React](https://lucide.dev/) | Icons |
| [Recharts](https://recharts.org/) | Charts |
| [React Leaflet](https://react-leaflet.js.org/) | Maps |
| [Axios](https://axios-http.com/) | HTTP client |

### Backend

| Concern | Choice |
|---|---|
| Web framework | [Flask 2.x](https://flask.palletsprojects.com/) with [Flask-RESTful](https://flask-restful.readthedocs.io/) for resource-oriented endpoints |
| Database | [PostgreSQL](https://www.postgresql.org/) (local) / [Supabase Postgres](https://supabase.com/docs/guides/database) (remote) via [SQLAlchemy ORM](https://www.sqlalchemy.org/) |
| Authentication | JWT, with [Firebase Authentication](https://firebase.google.com/docs/auth) as the identity provider |
| API documentation | [Swagger / OpenAPI](https://swagger.io/) via [Flasgger](https://github.com/flasgger/flasgger) |
| Logging | [Structlog](https://www.structlog.org/) — structured JSON logs |
| Migrations | [Flask-Migrate](https://flask-migrate.readthedocs.io/) (Alembic) |
| CORS | [Flask-CORS](https://flask-cors.readthedocs.io/) |
| Payments | [Safaricom M-Pesa Daraja API](https://developer.safaricom.co.ke/) |
| Validation | [Marshmallow](https://marshmallow.readthedocs.io/) schemas |
| Dependency management | [Pipenv](https://pipenv.pypa.io/) (`Pipfile` / `Pipfile.lock`) |

### Shared / Cross-Cutting

| Concern | Choice |
|---|---|
| Identity provider | [Firebase Auth](https://firebase.google.com/docs/auth) (email/password + Google OAuth) |
| Payments | Safaricom M-Pesa Daraja (STK Push) |
| Version control | [Git](https://git-scm.com/) |
| Frontend tooling | [ESLint](https://eslint.org/), [Prettier](https://prettier.io/) |

## Architecture

The backend follows a **modular monolith** pattern: each domain (auth, check-ins, groups, donations, journal, etc.) owns its own `routes.py`, `services.py`, and `models.py`, and is registered as an independent Flask [Blueprint](https://flask.palletsprojects.com/en/stable/blueprints/) in the application factory (`app/__init__.py`). Shared concerns — auth decorators, error handling, request logging, token utilities — live under `app/core` and `app/middleware`, keeping domain modules thin and focused on business logic.

**Blueprints vs. Flask-RESTful.** Every module is a Flask Blueprint. Only `checkins` additionally uses Flask-RESTful `Resource` classes, because it exposes multiple HTTP verbs (`GET`, `POST`) on the same resource shape — exactly the case Flask-RESTful is built for. Other modules don't share that shape:

| Blueprint | Why plain Blueprint routes are used instead |
|---|---|
| `auth` | Five distinct POST actions (`register`, `login`, `refresh`, `firebase`, `logout`), not multiple verbs on one resource. |
| `videos`, `milestones`, `library`, `dashboard`, `crisis` | Each is a single `GET /` — a `Resource` class would be more boilerplate than the plain function it replaces. |
| `resources` | `GET /` and `GET /counties` are two independent static lookups, not shared CRUD on one URL. |

**Rule of thumb:** if a blueprint has ≥2 HTTP methods on the *same* URL path, Flask-RESTful earns its keep. If every route is its own unique URL/action, plain Blueprint functions stay simpler and more readable.

The frontend mirrors this modularity with a **feature-based folder structure** — each domain (dashboard, journal, groups, donations, etc.) is a self-contained feature package, with shared UI primitives, hooks, and API clients factored out separately.

## Repository Structure

```
safe-haven/
├── frontend/
│   └── src/
│       ├── api/
│       │   ├── client.js              # Axios instance, interceptors, auth helpers
│       │   └── endpoints.js           # URL constants + API function calls
│       ├── assets/
│       │   └── logo.jpeg
│       ├── features/                  # Feature-based organization
│       │   ├── auth/                  # Login/Register/Forgot/Reset views
│       │   ├── check-in/              # Daily mood/craving/sobriety check-in
│       │   ├── crisis/                # Crisis support resources
│       │   ├── dashboard/             # User dashboard with stats and chart
│       │   ├── donations/             # M-Pesa STK Push donation flow
│       │   ├── groups/                # Groups, chat, external directories
│       │   ├── journal/               # Private journal with entries
│       │   ├── milestones/            # Recovery milestone tracking
│       │   ├── onboarding/            # Post-registration welcome flow
│       │   ├── profile/               # User profile settings
│       │   └── resources/             # Treatment map + reading + video library
│       ├── landing/                   # Marketing / public site
│       │   ├── LandingPage.jsx
│       │   └── components/            # Hero, Features, HowItWorks, CTA, etc.
│       ├── shared/                    # Reusable components & hooks
│       │   ├── components/            # ui.jsx, Navbar, Footer, Layout
│       │   └── hooks/                 # useAuth.js
│       ├── styles/
│       │   └── theme.js
│       ├── firebase.js                # Firebase configuration
│       ├── App.jsx                    # Router, AuthContext, route guards
│       ├── main.jsx                   # Application entry point
│       └── index.css
│
└── backend/
    ├── .github/                       # CI/CD workflows
    ├── app/
    │   ├── auth/                      # Authentication module
    │   ├── checkins/                  # Daily check-in module (Flask-RESTful)
    │   ├── config/                    # Environment-based configuration
    │   ├── core/                      # Decorators, exceptions, JWT, Firebase setup
    │   ├── library/                   # Reading library
    │   ├── middleware/                # Request logging, global error handling
    │   ├── milestones/                # Recovery milestone tracking
    │   ├── models/                    # Abstract BaseModel
    │   ├── resources/                 # Treatment/resource directory
    │   ├── schemas/                   # Shared Marshmallow schemas
    │   ├── users/                     # User profile management
    │   ├── videos/                    # Video library
    │   ├── extensions.py              # Flask extension initialization
    │   └── __init__.py                # Application factory
    ├── crisis/                        # Crisis support module (public)
    ├── dashboard/                     # Dashboard aggregation
    ├── donations/                     # M-Pesa donation processing
    ├── groups/                        # Community support groups
    ├── journal/                       # Personal journal entries
    ├── logs/
    │   └── app.log                    # JSON-formatted structured logs
    ├── migrations/                    # Alembic database migrations
    ├── scripts/                       # Utility / maintenance scripts
    ├── secrets/                       # Firebase service account — gitignored
    ├── seed/
    │   ├── seed_crisis.py
    │   ├── seed_library.py
    │   └── seed_resources.py
    ├── .env.example                   # Environment variable template
    ├── Pipfile                        # Pipenv dependency manifest
    ├── Pipfile.lock                   # Pinned dependency versions
    ├── run.py                         # Development server entry point
    └── wsgi.py                        # Production WSGI entry point
```

> Every backend module — wherever it sits in the tree — follows the same internal shape: `routes.py`, `services.py`, `models.py`, and (where needed) `schemas.py`.

## API Reference

| Module | Base Path | Summary |
|---|---|---|
| Authentication | `/api/auth` | Register, login, Firebase login, token refresh, logout |
| Check-ins | `/api/checkins` | Daily mood/craving tracking, streaks, aggregate stats |
| Users | `/api/users` | Profile read/update (username, sobriety start, goals) |
| Milestones | `/api/milestones` | Auto-calculated recovery milestones |
| Resources | `/api/resources` | Treatment center directory, filterable by county/type |
| Videos | `/api/videos` | Curated recovery-education video library |
| Library | `/api/library` | Recovery-education reading library |
| Donations | `/api/donations` | M-Pesa Daraja STK push, callbacks, status polling |
| Journal | `/api/journal` | Personal journal CRUD, tags, mood |
| Groups | `/api/groups` | Community groups, membership, messaging |
| Crisis | `/api/crisis` | Public emergency lines and support hotlines |
| Dashboard | `/api/dashboard` | Aggregated summary across check-ins, milestones, groups |

<details>
<summary><strong>Expand full endpoint list</strong></summary>

**Authentication**
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/firebase` | Firebase token exchange |
| POST | `/api/auth/refresh` | Token refresh |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/forgot-password` | Password reset request |
| POST | `/api/auth/reset-password` | Reset password with token |

**Users**
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me/profile` | Update profile |
| PUT | `/api/users/me/sobriety-start` | Set recovery start date |

**Check-ins**
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/checkins` | Create daily check-in |
| GET | `/api/checkins` | List all check-ins |
| GET | `/api/checkins/today` | Get today's check-in |

**Dashboard**
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard` | Aggregate dashboard data |

**Milestones**
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/milestones` | List earned milestones |

**Groups**
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/groups` | List all groups |
| GET | `/api/groups/mine` | List user's groups |
| GET | `/api/groups/categories` | List categories |
| POST | `/api/groups` | Create group |
| POST | `/api/groups/:id/join` | Join group |
| POST | `/api/groups/:id/leave` | Leave group |
| DELETE | `/api/groups/:id` | Delete group |
| GET | `/api/groups/:id/messages` | List messages |
| POST | `/api/groups/:id/messages` | Send message |
| PATCH | `/api/groups/:id/messages/:msgId` | Edit message |
| DELETE | `/api/groups/:id/messages/:msgId` | Delete message |

**Journal**
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/journal` | List entries |
| POST | `/api/journal` | Create entry |
| PUT | `/api/journal/:id` | Update entry |
| DELETE | `/api/journal/:id` | Delete entry |

**Resources**
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/resources` | List resources (with filters) |

**Crisis**
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/crisis` | List crisis resources |

**Donations**
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/donations/mpesa/stk-push` | Initiate M-Pesa payment |
| GET | `/api/donations/mpesa/status/:checkoutRequestId` | Check payment status |
| POST | `/api/donations/mpesa/callback` | Safaricom Daraja callback (server-to-server) |

</details>

Full request/response contracts for every endpoint are documented and testable in [Swagger UI](#api-documentation-swagger).

## Database Schema

PostgreSQL, accessed through SQLAlchemy. Core entities:

- **users** — UUID PK, email/username, `firebase_uid`, `sobriety_start`, `goals`
- **checkins** — mood (1–5), craving_level (1–5), sober_today, unique per `(user_id, date)`
- **milestones** — `days`, `achieved_at`, unique per `(user_id, days)`
- **video_topics / videos**, **library_topics / library_readings** — topic → item, position-ordered
- **resources** — treatment centers with county/region/type, lat/lng for mapping
- **groups / group_memberships / group_messages** — categories, meeting schedule (Africa/Nairobi default), edit/delete permissions
- **journal_entries** — title, content, mood, `tags` (Postgres ARRAY)
- **donations** — amount, phone, M-Pesa `checkout_request_id`, `mpesa_receipt_number`, status
- **crisis_emergency_lines / crisis_categories / crisis_hotlines** — public support directory

Full column-level detail can be generated via `flask db history` or inspected directly in the SQLAlchemy models under `app/`, `donations/`, `groups/`, and `journal/`.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18.0+ and npm v9.0+
- [Python 3.9+](https://www.python.org/downloads/)
- [Pipenv](https://pipenv.pypa.io/en/latest/installation.html) — `pip install --user pipenv`
- [PostgreSQL 14+](https://www.postgresql.org/download/) (local) or a [Supabase](https://supabase.com/) project (remote)
- A [Firebase](https://console.firebase.google.com/) project with a service account
- [Safaricom M-Pesa Daraja](https://developer.safaricom.co.ke/) sandbox credentials
- [Git](https://git-scm.com/)

### Frontend Setup

```bash
# 1. Clone
git clone https://github.com/your-org/safe-haven.git
cd safe-haven/frontend

# 2. Install dependencies
npm install

# 3. Environment variables
cp .env.example .env    # then edit .env — see below

# 4. Run
npm run dev
```

The app starts at `http://localhost:5173`.

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

### Backend Setup

Dependencies are managed with **Pipenv** (`Pipfile` / `Pipfile.lock`) — there is no `requirements.txt`.

```bash
# 1. Navigate to the backend
cd safe-haven/backend

# 2. Install dependencies + create the virtual environment
pipenv install --dev

# Optional: keep the .venv inside the project folder
export PIPENV_VENV_IN_PROJECT=1

# 3. Activate the environment
pipenv shell

# 4. Environment variables
cp .env.example .env    # then edit .env — see below

# 5. Database
flask db upgrade

# 6. Seed data
python seed/seed_resources.py
python seed/seed_crisis.py
python seed/seed_library.py

# 7. Run
python run.py
```

The API starts at `http://localhost:5000` with debug mode enabled.

To add a new dependency later: `pipenv install <package>` (or `pipenv install --dev <package>` for a dev-only tool). Commit both `Pipfile` and `Pipfile.lock` so the environment stays reproducible.

## Environment Variables

### Frontend (`frontend/.env`)

```env
# Backend API URL
VITE_API_URL=http://localhost:5000

# Firebase configuration (from the Firebase Console)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Backend (`backend/.env`)

```bash
# Flask
SECRET_KEY=your-secret-key
FLASK_ENV=development
FLASK_DEBUG=True

# Database (local)
DATABASE_URL=postgresql://postgres:password@localhost:5432/safehaven

# OR Supabase (remote)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_DB_URL=postgresql://postgres:password@db.supabase.co:5432/postgres

# JWT
JWT_SECRET_KEY=your-jwt-secret

# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/firebase-adminsdk.json

# M-Pesa (Safaricom Daraja)
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_PASSKEY=your-passkey
MPESA_SHORTCODE=your-shortcode
MPESA_ENVIRONMENT=sandbox   # or production
MPESA_CALLBACK_URL=https://your-domain.com/api/donations/mpesa/callback

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
```

> **Security note:** never commit `.env` files, service-account JSON files, or any real secret values to version control. Both are already covered by `.gitignore` in each service — keep it that way, and rotate any credential immediately if it is ever exposed (e.g. pasted into a chat, a public repo, or a log).

## Authentication Flow

1. **Email/password login** — `POST /api/auth/login` → returns `access_token` in the body, sets an HTTP-only `refresh_token` cookie.
2. **Firebase login** — `POST /api/auth/firebase` with a Firebase ID token; creates the user on first sign-in via the [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup). Same response shape as email login.
3. **Token refresh** — `POST /api/auth/refresh` reads the `refresh_token` cookie automatically and returns a new `access_token`. The frontend handles this transparently via Axios interceptors.
4. **Protected access** — send `Authorization: Bearer <access_token>`; backend routes use the `@login_required` decorator.

Passwords are hashed with bcrypt, with automatic migration of legacy Werkzeug hashes on login. Password policy: 8+ characters, upper, lower, digit, and special character.

## API Documentation (Swagger)

The full API is documented with [Swagger / OpenAPI](https://swagger.io/) through [Flasgger](https://github.com/flasgger/flasgger), generated directly from route docstrings — the docs stay in sync with the code by construction.

1. Start the server: `python run.py`
2. Open **`http://localhost:5000/apidocs/`**
3. Endpoints are grouped by tag (Auth, Check-ins, Milestones, Resources, Donations, Groups, Journal, Crisis, …)
4. Expand any endpoint → **Try it out** → fill parameters/body → **Execute** to call the live backend
5. For protected routes , first execute `POST /api/auth/login` to get an `access_token`, then click **Authorize** at the top and paste the raw token — no `Bearer` prefix needed. All subsequent secured calls in that session send it automatically.

If a section looks incomplete (missing endpoints, wrong tag grouping), confirm the module's `routes.py` has properly annotated docstrings (`---`-delimited Swagger blocks) and that its Blueprint is registered in `app/__init__.py`.

## Logging

Structured logging via [Structlog](https://www.structlog.org/), with two simultaneous outputs:

- **Console** (development) — human-readable, colorized, with sensitive-field redaction (passwords, tokens) and per-request duration.
- **File** (`logs/app.log`, production) — one JSON object per log line, ready for an ELK-style aggregator. Every request carries a `request_id` UUID end-to-end.

```json
{
  "event": "user_logged_in",
  "user_id": "abc123",
  "email": "user@example.com",
  "level": "info",
  "timestamp": "2025-01-15T10:30:00Z",
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

Request start/end events, response status, and duration are logged automatically by `app/middleware/logging.py`; request bodies are logged at `DEBUG` with sensitive fields redacted.

## Error Handling

Every error response follows one consistent shape:

```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Mood must be between 1 and 5",
  "details": {}
}
```

Custom exceptions (`app/core/exceptions.py`), each mapped to a status code:

| Exception | Status |
|---|---|
| `ValidationError` | 400 |
| `UnauthorizedError` | 401 |
| `ForbiddenError` | 403 |
| `NotFoundError` | 404 |
| `ConflictError` | 409 |

A global handler (`app/middleware/error_handler.py`) catches every `AppError` subclass, formats 404/405 consistently, and logs unexpected exceptions with a full traceback before returning a generic 500.

## Database Migrations

Managed with [Flask-Migrate](https://flask-migrate.readthedocs.io/) (Alembic):

```bash
flask db migrate -m "Description of changes"   # create migration
flask db upgrade                                # apply
flask db downgrade                              # rollback
flask db history                                # view history
```

## Testing

```bash
pytest                        # run all tests
pytest --cov=app tests/       # with coverage
pytest tests/test_auth.py     # a specific module
```

## Seed Data

```bash
python seed/seed_resources.py   # treatment centers / support resources
python seed/seed_crisis.py      # emergency lines, categories, hotlines
python seed/seed_library.py     # library topics and readings
```

Sample resource record:

```json
{
  "name": "Nairobi Wellness Center",
  "type": "rehab",
  "county": "Nairobi",
  "region": "Nairobi CBD",
  "address": "123 Kenyatta Ave, Nairobi",
  "phone": "0712345678",
  "website": "https://example.com",
  "lat": -1.286389,
  "lng": 36.817223
}
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| Swagger UI loads but endpoints missing | Confirm route docstrings use proper `---`-delimited Swagger annotations, and that the blueprint is registered in `app/__init__.py`. For `checkins`, verify `method_decorators` on the Flask-RESTful `Resource`. |
| Auth fails after redirect | Ensure `app.url_map.strict_slashes = False`; keep trailing-slash usage consistent between frontend and backend. |
| Firebase login → 401 | Check `FIREBASE_SERVICE_ACCOUNT_PATH`, Firebase project settings, and token validity/expiry. |
| Database connection errors | Verify `DATABASE_URL` (local) or `SUPABASE_DB_URL` (remote, needs SSL); confirm Postgres is running and the user has permissions. |
| M-Pesa STK push fails | Verify Daraja credentials, that `MPESA_CALLBACK_URL` is publicly reachable and points at the deployed backend (not a local tunnel), phone format is `254XXXXXXXXX`, and sandbox config is correct. |
| Dashboard returns 404 | Confirm the dashboard blueprint is registered and called with a trailing slash (`/api/dashboard/`); ensure the request is authenticated. |
| Group messages not showing | Confirm the requesting user is a group member and the group has messages. |
| Donation status check fails | Confirm `checkout_request_id` is valid and the M-Pesa callback has been processed and committed. |

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | [Vercel](https://vercel.com/) | Auto-deploys from `main`; set `VITE_*` env vars in Vercel's Environment settings. |
| Backend | [Render](https://render.com/) | Auto-deploys from `main`; set all backend env vars in Render's Environment tab. Use Render **Secret Files** for the Firebase service-account JSON rather than a filesystem path checked into the repo. |
| Database | [Supabase Postgres](https://supabase.com/) | Managed Postgres; connection requires SSL. |

`MPESA_CALLBACK_URL` and `FIREBASE_SERVICE_ACCOUNT_PATH` must point at production-appropriate values in Render (the deployed backend's own public URL and Render's secret-file mount path, respectively) — not local development values like `ngrok` tunnels or local filesystem paths.

## Contributing

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add your feature description"
   ```
5. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Open a Pull Request

### Commit Convention

| Prefix | Meaning |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation updates |
| `style:` | Code style (formatting, missing semicolons, etc.) |
| `refactor:` | Code refactoring |
| `perf:` | Performance improvements |
| `test:` | Adding or updating tests |
| `chore:` | Maintenance tasks |

### Code Style

- **Frontend:** follow ESLint rules, format with Prettier, keep components focused and small.
- **Backend:** follow [PEP 8](https://peps.python.org/pep-0008/), use type hints, docstring every function, include Swagger annotations on new routes.
- Write tests for new functionality on both sides.
- Keep secrets out of version control — `.env` files and the `secrets/` folder are gitignored and must never be committed.

## Contributors

Safe Haven is designed, built, and maintained by:

| Name | Role |
|---|---|
| **Brian Edward** | Team Lead |
| **Lyndsey Isoe** | Contributor |
| **Jadyn Wanja** | Contributor |

We're grateful to everyone who has contributed time, code, and care to this project. Want to join the team? See [Contributing](#contributing) above.



## Support

### Crisis Support
- **NACADA National Helpline:** [1192](tel:1192) (24/7, free)
- **Befrienders Kenya WhatsApp:** [+254 722 178 177](https://wa.me/254722178177)

### Community
- **Website:** [safehaven.ke]( https://safe-haven-wheat.vercel.app/ )
- **Email:** [support@safehaven.ke](mailto:support@safehaven.ke)


## Acknowledgments

- [NACADA](https://nacada.go.ke/) — National Authority for the Campaign Against Alcohol and Drug Abuse
- [Befrienders Kenya](https://wa.me/254722178177) — Mental health support
- [Childline Kenya](https://childlinekenya.co.ke/) — Child helpline services
- All recovery organizations included in the resources directory

---

<p align="center"><sub>Built in Kenya. Supporting recovery, one day at a time.</sub></p>