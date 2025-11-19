# Suma FastAPI Backend

A lightweight authentication service that powers the Suma dashboards. It now bundles the AI Comment / assignment analysis stack from `SUMABackend`, exposing PDF analysis + RAG endpoints alongside password registration/login, rotating refresh tokens, and an SQLite database (swap for any SQLAlchemy-compatible engine when needed).

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
| `OPENAI_API_KEY` | Yes (for AI) | — | Passed to the OpenAI SDK + LangChain integrations. |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Override to switch the model used for structured analyses. |
| `RAG_TEXTBOOK_DIR` | No | `<repo>/SUMABackend/RAG_textbook` | Folder containing the source PDFs used to build the vectorstore. |
| `RAG_PERSIST_DIR` | No | `<RAG_TEXTBOOK_DIR>/chroma_db` | Where the Chroma DB is cached. |
| `RAG_QUIZ_DIR` | No | `<RAG_TEXTBOOK_DIR>` | Directory scanned for quiz/midterm/final PDFs to estimate topic coverage. |

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
| `POST` | `/ai/analyze` | — | Upload a PDF, trigger AI-driven assignment analysis, and cache the response. |
| `GET` | `/ai/analysis/{task_id}` | — | Fetch a cached AI comment/analysis by task id. |
| `GET` | `/ai/analyses` | — | List all cached analyses (newest first). |
| `POST` | `/ai/rag/build-vectorstore` | — | Build/refresh the Chroma vectorstore from textbook PDFs. |
| `POST` | `/ai/rag/query` | — | Ask the RAG system a question about the loaded textbooks. |
| `POST` | `/ai/rag/search` | — | Retrieve K chunks similar to the provided query. |
| `POST` | `/ai/rag/analyze-quiz` | — | Upload a quiz PDF/text and get coverage information. |
| `POST` | `/ai/rag/check-high-occurrence` | — | Check whether an assignment appears frequently relative to quizzes/exams. |

Extend the service by adding routers under `app/` and including them in `app.main`. The frontend currently calls additional routes (e.g. `/courses`, `/tasks`) that you can implement following the same pattern.

### AI & RAG endpoints in action
1. Frontend posts a PDF to `/ai/analyze` (optional `task_id`). If the task was analyzed before, the cached analysis returns immediately; otherwise the backend calls OpenAI, tags the assignment, runs textbook/quiz retrieval, saves the result to `assignment_analyses`, and responds with the AI comment payload.
2. `/ai/analysis/{task_id}` or `/ai/analyses` read from the same cache so teacher/student dashboards can prefetch AI Comments at page-load with zero manual clicks.
3. `/ai/rag/*` mirrors the original SUMABackend endpoints for vector-store maintenance, ad-hoc textbook QA, quiz coverage estimation, and “high occurrence in tests” checks—ideal for background jobs or admin tooling.

## Project Structure
```
backend/
├── app/
│   ├── ai/               # OpenAI + RAG helpers
│   ├── config.py      # Settings management with Pydantic
│   ├── db.py          # SQLAlchemy engine and session handling
│   ├── deps.py        # Shared FastAPI dependencies
│   ├── init_db.py     # Table creation helper
│   ├── main.py        # FastAPI application and routes
│   ├── models.py      # SQLAlchemy models (User + assignment analyses)
│   ├── routes_ai.py   # `/ai/...` router (assignment analyzer + RAG)
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
