# Tax Project Engagement Tracker

A web application for managing tax-project engagement activity. This repository contains separate React/Vite and Express/TypeScript npm projects. It includes a dashboard, user and project management, and activity-history workflows backed by persistent NeDB storage.

## Technology

- Frontend: React, TypeScript, Vite, Material UI
- Backend: Node.js, Express, TypeScript
- Persistence: `@seald-io/nedb`
- Code quality: ESLint and Prettier

## Prerequisites

- Node.js 20.19+, 22.13+, or 24+
- npm

## Installation

Install dependencies independently in each application:

```powershell
cd server
npm install
Copy-Item .env.example .env

cd ..\client
npm install
Copy-Item .env.example .env
```

Edit either `.env` file if the default local ports or origins differ.

## Development

Run each app in its own terminal from the repository root.

Backend:

```powershell
cd server
npm run dev
```

Frontend:

```powershell
cd client
npm run dev
```

The Vite development server prints its local URL (normally `http://localhost:5173`). The backend listens on `http://localhost:3001` by default. Check backend startup at [http://localhost:3001/api/health](http://localhost:3001/api/health).

## Docker deployment

The root `Dockerfile` builds the frontend and backend in separate stages, then runs the production API and serves the frontend from the same container. Docker and Docker Compose are not required for local development.

Build the image from the repository root:

```powershell
docker build -t tax-engagement-tracker .
```

Run it with persistent database storage:

```powershell
docker run -d `
  --name tax-engagement-tracker `
  --restart unless-stopped `
  -p 3001:3001 `
  -v tax-engagement-data:/data `
  tax-engagement-tracker
```

Open [http://localhost:3001](http://localhost:3001). The API health check is at [http://localhost:3001/api/health](http://localhost:3001/api/health). The image includes a Docker health check, runs as the non-root `node` user, and stores NeDB files in `/data`; keep the named volume or another persistent volume attached to preserve records across container replacement.

For deployments requiring a separate frontend/API origin, configure `CLIENT_ORIGIN` and the client build-time `VITE_API_URL` accordingly, then rebuild the image. Authentication and authorization are not part of this starter, so do not expose it publicly with sensitive project data until those controls and a security review are in place.

## Configuration and data

- `server/.env.example` documents `PORT`, `HOST`, `CLIENT_ORIGIN`, and `DATA_DIR`.
- `client/.env.example` uses the same-origin `/api` path; Vite proxies it to `VITE_API_PROXY_TARGET` (default `http://127.0.0.1:3001`) during development. For a deployed frontend, set `VITE_API_URL` to the backend API URL.
- Persistent NeDB files are created under `server/data/` by default. Set `DATA_DIR` to use another directory.
- The server loads all three datastores and creates the required indexes before it starts accepting HTTP requests. Startup fails explicitly if loading or index creation fails.

## Available scripts

Run these scripts from the respective project directory:

| Script                 | `client`                      | `server`                    |
| ---------------------- | ----------------------------- | --------------------------- |
| `npm run dev`          | Start Vite                    | Start API with watch/reload |
| `npm run build`        | Type-check and build frontend | Compile TypeScript          |
| `npm start`            | —                             | Start compiled API          |
| `npm test`             | Run client tests              | Run API integration tests   |
| `npm run lint`         | Lint frontend                 | Lint backend                |
| `npm run format`       | Format project files          | Format project files        |
| `npm run format:check` | Check formatting              | Check formatting            |

## API

- `GET /api/health` — returns `{ "status": "ok" }` when the server is available.
- Users: `GET /api/users`, `GET /api/users/:id`, `POST /api/users`, `PUT /api/users/:id`, `PATCH /api/users/:id/status`
- Projects: `GET /api/projects`, `GET /api/projects/:id`, `POST /api/projects`, `PUT /api/projects/:id`
- Activities: `GET /api/activities`, `GET /api/activities/:id`, `POST /api/activities`
- Activity filters: `userId`, `projectId`, `activityType`, `startDate`, `endDate`, `page`, `pageSize`, `sortBy`, and `sortDirection`. Results use `{ data, total, page, pageSize }`.
- `GET /api/dashboard/summary` — total users/projects/activities, active projects, and activity counts by type.

Activity records are append-only: no update or delete endpoints are provided.

### Registering an activity with an HTTP call

Send `POST /api/activities` with a JSON body. The examples use the default development address `http://127.0.0.1:3001` (use your own host and port for Docker or other deployments).

| Field          | Required | Description                                                                          |
| -------------- | -------- | ------------------------------------------------------------------------------------ |
| `userId`       | One of\* | `_id` of an existing user (from `GET /api/users`).                                   |
| `userEmail`    | One of\* | Email of an existing user (case-insensitive).                                        |
| `activityType` | Yes      | `LOGIN`, `LOGOUT`, `MEETING`, `DOCUMENT_SUBMISSION`, or `DATA_CHANGE`.               |
| `description`  | Yes      | Text describing the activity.                                                        |
| `projectId`    | No       | `_id` of an existing project (from `GET /api/projects`).                             |
| `timestamp`    | No       | ISO 8601 date/time. Defaults to the current time; always stored and returned in UTC. |
| `metadata`     | No       | JSON object with additional details.                                                 |

\* Provide `userId`, `userEmail`, or both. If both are sent they must belong to the same user, otherwise `400 Bad Request` is returned. The stored activity always contains the resolved `userId`.

curl (Linux/macOS/Git Bash):

```bash
curl -X POST http://127.0.0.1:3001/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "<user _id>",
    "projectId": "<project _id>",
    "activityType": "MEETING",
    "description": "Quarterly review meeting",
    "timestamp": "2026-02-03T09:30:00-05:00",
    "metadata": { "durationMinutes": 45 }
  }'
```

PowerShell:

```powershell
$body = @{
  userEmail    = 'avery@example.test'
  activityType = 'DOCUMENT_SUBMISSION'
  description  = 'Submitted supporting documents'
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3001/api/activities `
  -ContentType 'application/json' -Body $body
```

Omit `timestamp` to record the activity at the current time. A successful call returns `201 Created` with the stored activity, including its generated `_id`. Invalid payloads or unknown user/project references return `400 Bad Request` with an error message.
