# Suma FastAPI Backend

A lightweight authentication service that powers the Suma dashboards. It ships with password registration/login, rotating refresh tokens, and an SQLite database that can be swapped for any SQLAlchemy-compatible engine.

> 想了解整體專案？請參考根目錄的 [`README.md`](../README.md) 或 [`README-CN.md`](../README-CN.md)。

## Requirements
- Python 3.11+
- `pip` and `virtualenv` (or your preferred environment manager)
- SQLite works out of the box; alternative databases require their respective drivers

## Quick Start
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # remember to set JWT_SECRET before deploying
uvicorn app.main:app --reload --port 8000
```
The `startup` hook (`init_db`) automatically creates the database and tables when they are missing. Visit http://localhost:8000/docs for interactive Swagger documentation.

## Environment Variables
| Name | Required | Default | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | No | `sqlite:///./suma.db` | SQLAlchemy connection string. Point this to Postgres/MySQL/etc. when needed. |
| `JWT_SECRET` | Yes | — | Long, random string for signing both access and refresh tokens. |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Comma-separated list of allowed origins. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `15` | Access token lifespan. Keep this short in production. |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | `7` | Refresh token lifespan stored in the HttpOnly cookie. |

## Authentication Flow
1. `POST /auth/register` hashes the submitted password with bcrypt, stores the user, returns an access token, and sets a refresh token cookie.
2. `POST /auth/login` performs the same flow for existing users.
3. `POST /auth/refresh` validates the HttpOnly cookie, rotates the refresh token, and issues a new access token.
4. `POST /auth/logout` clears the refresh token cookie.
5. `GET /me` expects a `Bearer` access token and returns the authenticated `user_id`.

Refresh tokens are stored in the `suma_refresh` cookie (`HttpOnly`, `SameSite=lax`, `secure=False` for development). Switch `secure=True` before deploying behind HTTPS.

## API Reference
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | — | Create a user with email/password and return tokens. |
| `POST` | `/auth/login` | — | Authenticate an existing user. |
| `POST` | `/auth/refresh` | Refresh cookie | Rotate the refresh token and issue a new access token. |
| `POST` | `/auth/logout` | Refresh cookie | Delete the refresh token cookie. |
| `GET` | `/me` | Access token | Return `{ "user_id": <int> }`. |

Extend the service by adding routers under `app/` and including them in `app.main`. The frontend currently calls additional routes (e.g. `/courses`, `/tasks`) that you can implement following the same pattern.

## Project Structure
```
backend/
├── app/
│   ├── config.py      # Settings management with Pydantic
│   ├── db.py          # SQLAlchemy engine and session handling
│   ├── init_db.py     # Table creation helper
│   ├── main.py        # FastAPI application and routes
│   ├── models.py      # SQLAlchemy models (User)
│   ├── schemas.py     # Pydantic request/response models
│   └── security.py    # Password hashing & JWT helpers
├── requirements.txt
└── .env.example
```

## Development Tips
- Use `uvicorn app.main:app --reload --port 8000` for a hot-reloading development server.
- Keep `DATABASE_URL=sqlite:///./suma.db` for local prototyping; the SQLite file lives beside the backend code.
- Add new dependencies manually to `requirements.txt` after verifying they are needed (avoid dumping `pip freeze` output).
- Consider introducing `pytest` + `httpx` for API tests as you expand the surface area.

## Deployment Notes
- Ensure `COOKIE_PARAMS["secure"] = True` (see `app/main.py`) before serving traffic over HTTPS.
- Provide a strong, secret `JWT_SECRET` and rotate it safely when required.
- When switching to Postgres/MySQL, install the appropriate driver (e.g., `pip install psycopg[binary]`) and update `DATABASE_URL`.
- Behind a reverse proxy, run `uvicorn` with the `standard` extras (`pip install "uvicorn[standard]"`) and enable proxy headers.

## License
MIT
