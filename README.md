# Suma

> 本說明僅供參考，請以 README-CN.md（中文版說明文件）為準。

A full-stack web application for course and task management, featuring a modern Next.js frontend and a secure FastAPI backend.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)


## Overview
Suma is designed to help users manage courses and tasks efficiently. It provides authentication, a user-friendly interface, and secure data handling.

## Features
- User registration and login (JWT-based authentication)
- Course and task management
- Responsive UI with Radix UI components
- Secure backend with FastAPI and SQLite
- API endpoints for authentication and user management

## Technologies Used
### Frontend
- Next.js
- React
- Radix UI
- Tailwind CSS/PostCSS
- TypeScript

### Backend
- FastAPI
- SQLite (default, can switch to Postgres)
- SQLAlchemy
- JWT (python-jose)
- Passlib (bcrypt)
- Pydantic

## Setup Instructions
### Frontend
1. Install dependencies:
   ```cmd
   pnpm install
   ```
2. Start the development server:
   ```cmd
   pnpm dev
   ```
   The app will run at http://localhost:3000

### Backend
1. Navigate to the backend folder:
   ```cmd
   cd backend
   ```
2. Create and activate a virtual environment:
   ```cmd
   python -m venv .venv
   .venv\Scripts\activate
   ```
3. Install dependencies:
   ```cmd
   pip install -r requirements.txt
   ```
4. (Optional) Configure environment variables:
   - Copy `.env.example` to `.env` and edit as needed.
   - Default database is SQLite. To use Postgres, update `DATABASE_URL`.
5. Start the backend server:
   ```cmd
   uvicorn app.main:app --reload --port 8000
   ```
   Access Swagger docs at http://localhost:8000/docs

## Usage
- Register and log in to access course and task features.
- Use the provided UI to manage your courses and tasks.
- Backend API endpoints:
  - `POST /auth/register` — Register a new user
  - `POST /auth/login` — Log in
  - `POST /auth/refresh` — Refresh access token
  - `POST /auth/logout` — Log out
  - `GET /users/me` — Get current user info

## Folder Structure
```
Suma/
├── app/                # Next.js frontend
├── backend/            # FastAPI backend
├── components/         # Shared React components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── public/             # Static assets
├── styles/             # Global styles
├── package.json        # Frontend dependencies
├── backend/requirements.txt # Backend dependencies
```

## Contributing
Contributions are welcome! Please open issues or submit pull requests for improvements or bug fixes.
