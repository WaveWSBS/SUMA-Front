# Suma

一套以 Next.js 14、FastAPI 與 SQLite 為核心的現代化學習管理工作區。

> 需要英文版說明？請參考 [`README.md`](README.md)。

## 專案簡介
Suma 將學生與教師的使用情境整合至單一儀表板，提供精緻的 React 介面與具備認證能力的 Python 後端。當前版本內建豐富的 UI 範例、可擴充的 API 基礎，以及 JWT 工作流程，協助團隊專注於實際業務邏輯。

## 功能亮點
- 學生與教師儀表板涵蓋行事曆、任務檢視與 AI 輔助工具，預載寫實樣本資料，可隨時換成真實 API。
- FastAPI 後端提供短時效的 JWT access token 與存於 HttpOnly Cookie 的輪換式 refresh token。
- 採用 Radix UI、Tailwind CSS 與 shadcn 風格元件的共用設計系統，方便快速迭代介面。
- Monorepo 結構同時包含核心應用與獨立的 Vite 登陸頁，滿足行銷展示需求。

## 專案結構
```
Suma-Front/
├── app/                  # Next.js App Router 頁面與路由
├── components/           # 可重用的 UI 元件
├── hooks/, lib/, styles/ # 前端工具函式與樣式
├── backend/              # FastAPI 應用程式
├── public/               # Next.js 提供的靜態資源
├── suma-landing/         # 獨立的行銷頁（Vite + React）
└── README*.md            # 專案說明文件（英文與中文）
```

## 先決條件
- Node.js 18.18 以上（Next.js 14 要求）
- `pnpm` 8 以上（若尚未安裝，可執行 `npm install -g pnpm`）
- Python 3.11 以上與 `pip`（後端）
- （選用）`npm` 9 以上，用於 Vite 登陸頁

## 快速開始

### 1. 啟動 FastAPI 後端
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # 記得依需求調整設定
uvicorn app.main:app --reload --port 8000
```
預設設定會在 `backend/` 目錄建立本地 SQLite 資料庫（`suma.db`）。若要改用 Postgres 等資料庫，請更新 `.env` 中的 `DATABASE_URL`。

### 2. 執行 Next.js 應用
於專案根目錄：

```bash
pnpm install
pnpm dev
```

預設開發伺服器位於 http://localhost:3000，並依 `next.config.mjs` 的設定將 `/api/*` 請求代理到後端。

### 3.（選用）啟動行銷登陸頁
```bash
cd suma-landing
npm install
npm run dev
```
此專案與主應用獨立，預設服務位於 http://localhost:5173。

## 環境變數設定

### Next.js（`.env.local`）
| 變數 | 預設值 | 說明 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:8000` | 前端 `fetch` 請求所使用的 API 基底網址。 |
| `BACKEND_URL` | 預設承接 `NEXT_PUBLIC_API_URL` | `next.config.mjs` 於開發時代理 `/api/*` 的目標 URL。 |

需要覆寫預設值時，請手動建立 `.env.local`。

### FastAPI（`backend/.env`）
| 變數 | 預設值 | 說明 |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///./suma.db` | SQLAlchemy 連線字串。 |
| `JWT_SECRET` | — | 用於簽署 Token 的長且隨機的密鑰。 |
| `CORS_ORIGINS` | `http://localhost:3000` | 允許的前端來源，可用逗號分隔。 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | Access token 逾期時間（分鐘）。 |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token 逾期時間（天）。 |

## API 狀態
目前後端僅提供認證相關端點（`/auth/register`、`/auth/login`、`/auth/refresh`、`/auth/logout`、`/me`）。前端儀表板先以寫實樣本資料呈現，未來可透過替換頁面中的 `fetch` 呼叫或新增 Next.js Route Handler 來串接實際 API。

## 常用腳本
- `pnpm dev` — 啟動 Next.js 開發伺服器。
- `pnpm build && pnpm start` — 建置並啟動生產版。
- `pnpm lint` — 執行 Next.js 內建 Lint。
- `uvicorn app.main:app --reload --port 8000` — 啟動 FastAPI 本地服務。
- `npm run dev`（位於 `suma-landing/`）— 開發行銷登陸頁。

## 貢獻方式
歡迎提交 issue 或 pull request。請提供清楚的重現步驟、同步更新相關文件，並盡量將前端與後端的修改拆分至不同提交，以方便審閱。
