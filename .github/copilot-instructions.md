This repository contains a monorepo-style Express + React application. The goal of these instructions is to help an AI coding agent be immediately productive when making small-to-medium code changes.

High level architecture
- Backend: `backend/` — Express 5 server (entry: `backend/server.js`) using Mongoose models in `backend/models/`. API routes live in `backend/route/` and call controllers in `backend/controllers/`.
- Frontend: `frontend/` — Create React App; proxy configured to `http://localhost:5000` in `frontend/package.json` for local dev.

How to run locally (dev)
- Backend: cd into `backend/` and run `npm install` then `npm run dev` (uses `nodemon server.js`). Server requires a MongoDB connection string in `MONGO_URI` and an optional `JWT_SECRET`.
  - Key files: `backend/server.js` (creates upload folders, sets CORS origin to `http://localhost:3000`, mounts routes at `/api/*`).
- Frontend: cd into `frontend/` and run `npm install` then `npm start`. The frontend reads API base URLs from `REACT_APP_API_BASE` or `REACT_APP_API_URL` (defaults to `http://localhost:5000` / `http://localhost:5000/api`).

Important environment variables (searchable via `process.env` in the codebase)
- MONGO_URI — required by `backend/server.js` to start
- JWT_SECRET — used by controllers (e.g., `backend/controllers/authController.js`); fallback secret is present in code but supply a strong secret in env.
- REACT_APP_API_BASE or REACT_APP_API_URL — frontend API base; many frontend service modules use these.

Project-specific conventions & patterns
- Routes → Controllers: every file in `backend/route/*.js` wires endpoints to controller functions exported from `backend/controllers/*.js`. Example: `route/authRoutes.js` → `controllers/authController.js`.
- Models: Mongoose schemas live in `backend/models/` and are exported as default (e.g., `UserModel.js`). Many controllers call `Model.findOne()` / `Model.findById()` directly (no repository layer).
- File uploads: `backend/server.js` creates and serves `uploads/` and exposes `Content-Disposition` in CORS so frontend can download files. Look at `helpers/pdfGenerator.js` and `controllers/receiptController.js` for examples.
- Error handling: a simple global error handler is registered in `backend/server.js` — controllers throw errors or call `res.status(...).json(...)`. Preserve existing error shapes when returning errors from new endpoints.

Integration points & external dependencies
- Database: MongoDB via `mongoose` — connection is required at startup.
- Authentication: JWT tokens (signed with `JWT_SECRET`) and stored client-side in `localStorage` under `rg_auth` (see `frontend/src/services/api.js` which injects `Authorization: Bearer <token>`).
- Email: `nodemailer` is used (check `backend/controllers/*` where used).
- File upload: `multer` is used for multipart file handling; uploaded files are placed under `backend/uploads/` and served statically.

Developer patterns to follow when editing code
- Keep route signatures stable. Add new routes under `backend/route/` and export default the router.
- Prefer using existing controllers and model patterns — controllers are small, request-centric functions (example: `loginUser` in `authController.js`).
- When adding endpoints that return files, ensure `Content-Disposition` is set and that `backend/server.js` serves the `uploads/` path.
- Frontend: use `API_BASE` / `REACT_APP_API_BASE` from `frontend/src/services/api.js` for fetches so local dev proxy and env overrides work.

Quick examples (copy-paste friendly)
- Start backend (PowerShell):
```powershell
cd backend; npm install; $env:MONGO_URI='your-mongo-uri'; npm run dev
```
- Start frontend (PowerShell):
```powershell
cd frontend; npm install; npm start
```

Where to look for common tasks
- Add auth-protected route: `backend/route/*` → `backend/controllers/*` → check `middleware/authMiddleware.js` for auth helper (if present) and how tokens are consumed.
- Add a new model: follow `backend/models/UserModel.js` naming and export pattern (use `mongoose.models.Name || mongoose.model(...)`).
- File upload handling: search `middleware` and `route` for usages of multer (e.g., `backend/middleware/docUpload.js`).

Limitations & things not in this doc
- This file documents only conventions discoverable from source files. It does not include deployment secrets or CI/CD steps (none were found in the repo). If you need deployment steps or additional developer scripts, ask and I will inspect further or propose a small `Makefile` / `scripts` addition.

If something in these instructions is unclear or you'd like me to expand any section (examples for adding a route, middleware usage, or a starter PR template), tell me which part and I'll iterate.
