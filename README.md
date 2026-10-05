# College Election Voting System (Node.js · Express · MongoDB · React)

## How the integrity rules are enforced
| Requirement | Where |
|---|---|
| One vote per student per election category | Unique compound index `{student, election}` on `Vote` (DB-level; race-condition safe). Duplicate → `409` |
| Votes can't be altered/resubmitted | No update/delete routes + Mongoose hooks on `Vote` block every update/delete/replace op |
| Voting window | `castVote` checks server time against `startTime`/`endTime` → `403` outside window |
| Only registered students vote | JWT `protect` + `authorize('student')` |
| Admin-only setup & results | `authorize('admin')` on create election, add candidate, results |
| Candidate belongs to election | `Candidate.findOne({_id, election})` check before saving vote |
| Admin accounts | Public `/auth/register` always creates `student`; admin created via `npm run seed:admin` |

> One `Election` document = one election category (President, Secretary, …), so "once per category" = unique `student + election`.

## API (base `/api`)
| Method | Route | Access |
|---|---|---|
| POST | `/auth/register`, `/auth/login` | public |
| GET | `/auth/me` | logged in |
| POST | `/elections` (title, startTime, endTime, optional `candidates[]`) | admin |
| POST | `/elections/:id/candidates` (before start only) | admin |
| GET | `/elections`, `/elections/:id` | logged in (shows `status`, `hasVoted`) |
| POST | `/elections/:id/vote` `{candidateId}` | student |
| GET | `/elections/:id/results` | admin |

## Run locally
```bash
cd backend && npm install
# edit .env (MONGO_URI from Atlas, JWT_SECRET)
npm run seed:admin && npm run dev

cd ../frontend && npm install && npm run dev      # http://localhost:5173
```
Import `backend/Election_API.postman_collection.json` into Postman/Thunder Client: login as admin → create election → login/register as student → vote → vote again (409).

## Deployment
**Backend (Render/Railway):** root dir `backend`, build `npm install`, start `npm start`. Env vars: `MONGO_URI` (Atlas; allow 0.0.0.0/0 in Network Access), `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (your Vercel URL), `PORT` (provided by host). Run `npm run seed:admin` once (Render shell or locally against the Atlas URI).
**Frontend (Vercel/Netlify):** root dir `frontend`, build `npm run build`, output `dist`. Env var `VITE_API_URL=https://<your-backend>/api`.
