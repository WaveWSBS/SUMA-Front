# Suma FastAPI 後端

一個最小可用（但考慮了基本安全）的密碼登錄後端，使用 FastAPI + SQLite + JWT（訪問令牌）+ 旋轉的刷新令牌（HttpOnly Cookie）。

- 資料庫：預設使用 SQLite，零配置；可透過環境變數切換 Postgres 等。
- 認證流程：email + password 登錄 → 返回 access_token（短效）並在 Cookie 中設置 refresh_token（長效）。
- 端點：註冊、登錄、刷新、登出、獲取當前用戶（受保護）。
- CORS：預設允許 http://localhost:3000（Next.js 開發預設）。

---

## 快速開始

1) 安裝依賴（建議使用虛擬環境）

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
```

2) 配置環境變數（可選）

複製 `.env.example` 為 `.env`，按需要修改：

```
# SQLite 預設即可使用，無需修改
# 切到 Postgres 範例：postgresql://user:pass@localhost:5432/suma
DATABASE_URL=sqlite:///./suma.db
JWT_SECRET=change-me-please-to-a-long-random-string
CORS_ORIGINS=http://localhost:3000
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
```

3) 啟動服務

```bash
uvicorn app.main:app --reload --port 8000
```

服務啟動後，打開 Swagger: http://localhost:8000/docs

---

## API 端點

- POST /auth/register
  - 請求：{ email, password }
  - 回應：{ access_token, token_type }
  - 效果：在 Cookie 設置 refresh token

- POST /auth/login
  - 請求：{ email, password }
  - 回應：{ access_token, token_type }
  - 效果：在 Cookie 設置 refresh token

- POST /auth/refresh
  - 請求：無（依賴瀏覽器自帶的 refresh token Cookie）
  - 回應：{ access_token, token_type }
  - 效果：旋轉 refresh token（更新 Cookie）

- POST /auth/logout
  - 請求：無
  - 回應：{ ok: true }
  - 效果：刪除 refresh token Cookie

- GET /me （受保護）
  - Header：Authorization: Bearer <access_token>
  - 回應：{ user_id }

### cURL 範例
```bash
# 註冊（首次）
curl -i -X POST http://localhost:8000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"Passw0rd!"}'

# 登錄（取得新的 access_token 和 refresh cookie）
curl -i -X POST http://localhost:8000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"Passw0rd!"}'

# 使用 access_token 訪問受保護接口
curl -s http://localhost:8000/me \
  -H 'Authorization: Bearer <ACCESS_TOKEN_FROM_RESPONSE>'
```

---

## 與 Next.js 前端對接

在 Next.js 前端新增環境變數（.env.local）：

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

在 `app/login/page.tsx` 的提交處理器中，呼叫 FastAPI：

```ts
const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // 讓瀏覽器保存 refresh cookie
  body: JSON.stringify({ email, password }),
})
const data = await res.json() // { access_token }
sessionStorage.setItem('access_token', data.access_token)
```

之後呼叫受保護 API 時在前端附帶 Bearer Token：

```ts
const token = sessionStorage.getItem('access_token')
const me = await fetch(process.env.NEXT_PUBLIC_API_URL + '/me', {
  headers: { Authorization: `Bearer ${token}` },
})
```

> 註：生產環境更安全的做法是由 Next.js 服務端保存 httpOnly Cookie 並代理到 FastAPI，避免在瀏覽器暴露 access token。這裡以最小可用為先。

---

## 我需要資料庫嗎？

- 是的，密碼登錄通常需要資料庫來保存使用者（至少包含 email 與經過雜湊的密碼）。
- 為了快速上手，這個專案預設使用 SQLite（單一檔案 `suma.db`），不需要任何安裝。
- 若未來要上線或多人使用，建議切換到 Postgres/MySQL，僅需修改 `DATABASE_URL` 即可。

---

## 專案結構

```
backend/
  ├─ app/
  │  ├─ __init__.py
  │  ├─ config.py           # 設定與環境變數
  │  ├─ db.py               # SQLAlchemy 初始化
  │  ├─ models.py           # 資料庫模型（User）
  │  ├─ schemas.py          # Pydantic 模型
  │  ├─ security.py         # 密碼雜湊與 JWT
  │  ├─ init_db.py          # 建表
  │  └─ main.py             # FastAPI 入口與路由
  ├─ requirements.txt
  └─ .env.example
```

---

## 安全建議（簡要）
- 在生產環境將 Cookie `secure=True`（僅 HTTPS 傳輸）。
- 設定強且足夠長度的 `JWT_SECRET`。
- 為登錄/刷新端點做節流或風險控制。
- 在資料庫層面限制嘗試次數與異常行為監控。
- 實作忘記密碼、信箱驗證等流程再上線。

---

## 授權
MIT