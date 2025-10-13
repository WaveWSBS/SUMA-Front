# ΣUMA Landing Page

Standalone marketing site for the ΣUMA AI-contextualised LMS, built with React 18, Vite 5, and Tailwind CSS.

## Overview
This package is independent from the main Next.js application. Use it as a dedicated marketing microsite, or copy sections into another frontend to showcase ΣUMA’s feature set.

## Prerequisites
- Node.js 18.18+
- npm 9+ (bundled with recent Node releases)

## Quick Start
```bash
npm install
npm run dev
```
The development server runs on http://localhost:5173 with hot module replacement enabled.

## Available Scripts
- `npm run dev` — start the Vite development server.
- `npm run build` — generate the production bundle in `dist/`.
- `npm run preview` — preview the production build locally.

## Project Structure
```
suma-landing/
├── src/
│   ├── App.tsx         # Landing page layout and sections
│   ├── components/     # Add reusable marketing components here
│   └── styles.css      # Tailwind directives and custom styling
├── tailwind.config.ts  # Tailwind theme configuration
├── vite.config.ts      # Vite + React plugin setup
└── index.html          # Root HTML shell
```

## Styling & Content Notes
- Tailwind CSS is configured via `src/styles.css`; extend utilities or themes inside `tailwind.config.ts`.
- Icons are sourced from `lucide-react`. Import only what you need to keep bundles lean.
- Update hero copy, CTAs, and imagery inside `src/App.tsx`. Split sections into dedicated components as the page grows.

## Deployment
1. Run `npm run build`.
2. Serve the generated `dist/` directory with your preferred static host (Vercel, Netlify, Nginx, etc.).
3. When co-hosting with the main Next.js app, you can proxy requests to the built assets or copy the bundle into that app’s static directory.
