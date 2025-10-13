# Suma

A modern learning management workspace built with Next.js 14, FastAPI, and SQLite for rapid prototyping.

> Looking for the Chinese documentation? Head to [`README-CN.md`](README-CN.md).

## Overview
Suma brings student and teacher experiences together in a single dashboard, pairing a polished React interface with an authentication-ready Python backend. The current build ships with rich UI mocks, an extensible API layer, and plumbing for JWT sessions so teams can focus on domain logic.

## Highlights
- Student and teacher dashboards with calendars, task views, and an AI helper that run on realistic sample data and can be wired to live endpoints.
- FastAPI backend that issues short-lived JWT access tokens plus rotating refresh tokens stored in HttpOnly cookies.
- Shared design system powered by Radix UI, Tailwind CSS, and shadcn-inspired components, ready for rapid UI iteration.
- Monorepo layout that includes the core app and an optional Vite-powered landing page for marketing use.

## Repository Layout
```
Suma-Front/
├── app/                  # Next.js App Router pages and routes
├── components/           # Reusable UI primitives and feature components
├── hooks/, lib/, styles/ # Frontend utilities and styling helpers
├── backend/              # FastAPI application
├── public/               # Static assets served by Next.js
├── suma-landing/         # Standalone marketing site (Vite + React)
└── README*.md            # Project documentation (EN + 中文)
```

## Prerequisites
- Node.js 18.18+ (Next.js 14 requirement)
- `pnpm` 8+ for the main application (install with `npm install -g pnpm` if needed)
- Python 3.11+ and `pip` for the backend
- (Optional) `npm` 9+ if you plan to work on the Vite landing page

## Getting Started

### 1. Boot the FastAPI backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # update values before committing
uvicorn app.main:app --reload --port 8000
```
The default configuration writes a local SQLite database (`suma.db`) to the `backend/` directory. Update `DATABASE_URL` in `.env` to point at Postgres or another engine when you're ready.

### 2. Run the Next.js application
From the repository root:

```bash
pnpm install
pnpm dev
```

By default the app starts on http://localhost:3000 and proxies any `/api/*` requests to the backend URL defined in `next.config.mjs` (see the environment section below).

### 3. (Optional) Launch the marketing site
```bash
cd suma-landing
npm install
npm run dev
```
The landing page is independent from the main app and serves from http://localhost:5173.

## Environment Configuration

### Next.js (`.env.local`)
| Variable | Default | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:8000` | Base URL used by client-side fetch calls. |
| `BACKEND_URL` | Inherits `NEXT_PUBLIC_API_URL` | Used by `next.config.mjs` to proxy `/api/*` requests during development. |

Create `.env.local` if you need to override the defaults.

### FastAPI (`backend/.env`)
| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///./suma.db` | SQLAlchemy connection string. |
| `JWT_SECRET` | — | Long random secret for signing tokens. |
| `CORS_ORIGINS` | `http://localhost:3000` | Whitelisted frontend origins (comma-separated). |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | Access token lifespan in minutes. |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token lifespan in days. |

## API Status
The backend currently ships with authentication endpoints (`/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/me`). Dashboard views in the frontend consume realistic mock data; wire them up to new endpoints by replacing the fetch calls in the respective pages or adding Next.js route handlers.

## Useful Scripts
- `pnpm dev` — run the Next.js development server.
- `pnpm build && pnpm start` — build and serve the production bundle.
- `pnpm lint` — run Next.js lint checks.
- `uvicorn app.main:app --reload --port 8000` — serve the FastAPI backend locally.
- `npm run dev` inside `suma-landing/` — develop the marketing site.

## Contributing
Issues and pull requests are welcome. Please include clear reproduction steps, update documentation when behaviour changes, and keep frontend and backend changes scoped in separate commits whenever possible.
