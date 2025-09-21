from fastapi import FastAPI, Depends, HTTPException, status, Response, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from .config import settings
from .db import SessionLocal
from .models import User
from .schemas import RegisterIn, LoginIn, TokenOut
from .security import hash_password, verify_password, create_access_token, create_refresh_token
from .init_db import init_db

app = FastAPI(title="Suma API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


# DB session dependency

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


REFRESH_COOKIE_NAME = "suma_refresh"
# 開發環境 secure=False；上線請改為 True 並使用 HTTPS
COOKIE_PARAMS = dict(httponly=True, samesite="lax", secure=False, path="/")


@app.post("/auth/register", response_model=TokenOut)
def register(body: RegisterIn, response: Response, db: Session = Depends(get_db)):
    existed = db.query(User).filter(User.email == body.email).first()
    if existed:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=body.email, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    access = create_access_token(user.id)
    refresh = create_refresh_token(user.id)
    response.set_cookie(REFRESH_COOKIE_NAME, refresh, **COOKIE_PARAMS)
    return TokenOut(access_token=access)


@app.post("/auth/login", response_model=TokenOut)
def login(body: LoginIn, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access = create_access_token(user.id)
    refresh = create_refresh_token(user.id)
    response.set_cookie(REFRESH_COOKIE_NAME, refresh, **COOKIE_PARAMS)
    return TokenOut(access_token=access)


@app.post("/auth/refresh", response_model=TokenOut)
def refresh_token(request: Request, response: Response):
    token = request.cookies.get(REFRESH_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        sub = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    access = create_access_token(sub)
    new_refresh = create_refresh_token(sub)
    response.set_cookie(REFRESH_COOKIE_NAME, new_refresh, **COOKIE_PARAMS)
    return TokenOut(access_token=access)


@app.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie(REFRESH_COOKIE_NAME, path="/")
    return {"ok": True}


@app.get("/me")
def me(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"user_id": payload["sub"]}
