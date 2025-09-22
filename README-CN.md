# Suma

一個現代化的全棧課程與任務管理網頁應用，前端採用 Next.js，後端採用 FastAPI，具備安全的用戶認證與資料管理。

## 目錄
- [專案簡介](#專案簡介)
- [功能特色](#功能特色)
- [技術棧](#技術棧)
- [安裝教學](#安裝教學)
  - [前端](#前端)
  - [後端](#後端)
- [使用說明](#使用說明)
- [目錄結構](#目錄結構)
- [貢獻方式](#貢獻方式)


## 專案簡介
Suma 旨在協助用戶高效管理課程與任務，提供簡潔易用的介面與安全的資料處理。

## 功能特色
- 用戶註冊與登入（JWT 驗證）
- 課程與任務管理
- 響應式 UI，採用 Radix UI 元件
- FastAPI + SQLite 後端，安全可靠
- 完整 API 端點，支援用戶與認證管理

## 技術棧
### 前端
- Next.js
- React
- Radix UI
- Tailwind CSS/PostCSS
- TypeScript

### 後端
- FastAPI
- SQLite（預設，可切換至 Postgres）
- SQLAlchemy
- JWT（python-jose）
- Passlib（bcrypt）
- Pydantic

## 安裝教學
### 前端
1. 安裝依賴：
   ```cmd
   pnpm install
   ```
2. 啟動開發伺服器：
   ```cmd
   pnpm dev
   ```
   預設運行於 http://localhost:3000

### 後端
1. 進入 backend 資料夾：
   ```cmd
   cd backend
   ```
2. 建立並啟用虛擬環境：
   ```cmd
   python -m venv .venv
   .venv\Scripts\activate
   ```
3. 安裝依賴：
   ```cmd
   pip install -r requirements.txt
   ```
4. （可選）設定環境變數：
   - 複製 `.env.example` 為 `.env` 並編輯。
   - 預設資料庫為 SQLite，若需使用 Postgres，請修改 `DATABASE_URL`。
5. 啟動後端伺服器：
   ```cmd
   uvicorn app.main:app --reload --port 8000
   ```
   Swagger API 文件：http://localhost:8000/docs

## 使用說明
- 註冊並登入後即可管理課程與任務。
- 主要 API 端點：
  - `POST /auth/register` — 註冊新用戶
  - `POST /auth/login` — 用戶登入
  - `POST /auth/refresh` — 刷新存取令牌
  - `POST /auth/logout` — 用戶登出
  - `GET /users/me` — 取得當前用戶資訊

## 目錄結構
```
Suma/
├── app/                # Next.js 前端
├── backend/            # FastAPI 後端
├── components/         # React 元件
├── hooks/              # 自訂 Hook
├── lib/                # 工具函式
├── public/             # 靜態資源
├── styles/             # 全域樣式
├── package.json        # 前端依賴
├── backend/requirements.txt # 後端依賴
```

## 貢獻方式
歡迎任何形式的貢獻！請提交 issue 或 pull request。

