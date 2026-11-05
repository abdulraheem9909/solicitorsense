# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

SolicitorSense frontend: a chat UI for an AI legal assistant (UK law). Next.js 15 App Router + React 19, plain JavaScript (no TypeScript), MUI v7 with Emotion for styling. The backend API lives in a separate repo (`SolicitorSenseAPI`) and is not part of this codebase.

## Commands

```bash
npm run dev     # dev server (Turbopack) on http://localhost:3000
npm run build   # static export to ./out
npm run lint    # next lint (eslint.config.mjs extends next/core-web-vitals)
./deploy.sh     # build, zip out/, scp to EC2, copy into SolicitorSenseAPI/public, pm2 restart
npm test                                   # Jest + React Testing Library (jsdom)
npx jest src/lib/__tests__/helper.test.js  # single file
npx jest -t "New Chat"                     # single test by name
```

Tests live in `__tests__/` folders next to the code. `jest.setup.js` mocks `next/navigation` (assert redirects via the global `mockRouter`) and clears `localStorage` before each test. Component/hook tests mock `@/lib/axiosConfig` rather than the network.

Env vars (in `.env.local`, gitignored): `NEXT_PUBLIC_API_BASE_URL` (axios baseURL; must include the backend's `/api` prefix, e.g. `http://host:4000/api`), `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

## Architecture

**Static export, client-only.** `next.config.mjs` sets `output: 'export'`, `trailingSlash: true`, and unoptimized images. The built `out/` is served as static files by the Express backend on EC2. Consequently: no API routes, no server components that fetch data, no middleware, no dynamic routes without `generateStaticParams`. Every page/component is `"use client"`.

**Rendering gate.** `src/app/layout.js` only mounts `AuthProvider` (and therefore all page content) after `useHasMounted()` returns true, to avoid hydration mismatches from `localStorage` reads. Metadata (title/description) is set imperatively in a `useEffect` rather than via the `metadata` export because the layout is a client component.

**Auth.** `src/context/AuthContext.js` holds `user` (includes `token`) and `sessionId`, both persisted to `localStorage`. `loginContext`/`logoutContext` also perform the redirect to `/chat` / `/login`. Route guarding is client-side via `components/auth/ProtectedRoute.js` and `PublicRoutes.js` wrappers; `/` just redirects based on `user`. Google login (`components/common/GoogleLoginButton.js`) is currently commented out in `AuthForm.js` because the live deployment has no proper domain.

**API access.** Always use `HTTP_REQUEST` from `src/lib/axiosConfig.js` — its request interceptor reads `localStorage.user.token` and adds the `Bearer` header. Endpoints used: `POST /auth/login`, `POST /auth/signup`, `POST /chat` (multipart: `msg`, `sessionId`, `documents[]`), `GET /chat?sessionId=`, `GET /chat/list`.

**Component pattern.** Each feature folder under `src/components/` pairs a view with a `useX.js` hook that owns all state and API calls (`chat/index.js` + `useChat.js`, `sidebar/sidebar.js` + `useSidebar.js`, `auth/AuthForm.js` + `useAuth.js`). Note `components/auth/useAuth.js` is a form hook distinct from `useAuth` in `context/AuthContext.js` (it imports the latter as `useAuthContext`).

**Chat flow.** `useChat` optimistically appends a Human message, posts FormData to `/chat`, then replaces the optimistic entry with `response.data.userMessage` and `response.data.aiMessage` (server DB objects — the UI renders the DB schema directly, e.g. `type`, `msg`, `hasDocuments`, `documentResults`). A new session's id comes back as `response.data.sessionId` and is stored in AuthContext; the sidebar refetches `/chat/list` whenever `sessionId` changes. Uploads are restricted client-side to pdf/doc/docx/txt. AI responses are rendered with `react-markdown`.

**Theming.** MUI theme in `src/lib/theme.js`; Poppins via `next/font/google`. `src/lib/helper.js` contains small shared UI bits (e.g. `TypingIndicator`, `getInitials`). Path alias `@/*` → `src/*`.
