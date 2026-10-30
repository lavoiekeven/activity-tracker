
# GitHub Copilot Instructions
# Project: Tax Project Engagement Tracker

## 1. Project Overview

Build a simple web application to manage user profiles
and track engagements and activities in tax-related projects.

Core requirements:
- Register and manage users.
- Record user activities.
- Track meetings, document submissions, login/logout
  and data changes.
- Filter activities by date, type and user.
- Persist data using NeDB.

Keep the application simple, maintainable and easy to run.

## 2. Technology Stack

### Frontend
- React
- TypeScript
- Material UI
- React Hooks
- Vite

### Backend
- Node.js
- Express.js
- TypeScript
- REST API
- NeDB for persistence

### Development and Testing
- npm
- Jest or Vitest
- Supertest for API integration tests
- ESLint
- Prettier

## 3. Architecture

Use a simple layered architecture.

Backend structure:

server/
  src/
    config/
    controllers/
    services/
    repositories/
    models/
    routes/
    middleware/
    validators/
    utils/
    app.ts
    server.ts
  data/
  tests/
  package.json
  tsconfig.json

Frontend structure:

client/
  src/
    api/
    components/
    features/
      users/
      activities/
      projects/
      dashboard/
    hooks/
    layouts/
    types/
    utils/
    App.tsx
    main.tsx
  package.json
  tsconfig.json

Keep responsibilities separated:

- Routes: HTTP endpoint definitions.
- Controllers: HTTP request and response handling.
- Services: Business logic.
- Repositories: Data access.
- Models: Domain types and interfaces.
- Middleware: Error handling and request processing.
- Validators: Request validation.

Controllers must remain thin.
Business logic belongs in services.

Avoid unnecessary abstractions.

## 4. Coding Standards

### TypeScript
- Enable strict mode.
- Avoid using any.
- Define explicit interfaces and types.
- Use async/await.
- Handle errors consistently.
- Use meaningful names.
- Avoid duplicated code.
- Prefer small, focused functions.

### Express
- Use Express Router.
- Use centralized error handling middleware.
- Validate request parameters and bodies.
- Return appropriate HTTP status codes.
- Use asynchronous error handling.
- Do not put business logic inside routes.

### React
- Use functional components and hooks.
- Use TypeScript strict mode.
- Use reusable UI components.
- Keep components focused.
- Separate API calls from UI logic.
- Handle loading, empty and error states.
- Avoid unnecessary state management libraries.

## 5. Domain Models

### User

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

Email addresses must be unique.

### Project

interface Project {
  _id: string;
  name: string;
  description?: string;
  status: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

### Activity

interface Activity {
  _id: string;
  userId: string;
  projectId?: string;
  activityType: ActivityType;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

ActivityType must support:

- LOGIN
- LOGOUT
- MEETING
- DOCUMENT_SUBMISSION
- DATA_CHANGE

All timestamps must be stored in UTC using ISO 8601.

Activities must be immutable audit records.

Do not implement activity update or delete endpoints.

## 6. Database and Persistence

Use NeDB as the file-based database.

Use a maintained NeDB-compatible implementation,
such as @seald-io/nedb.

Create separate persistent datastores for:

- users
- projects
- activities

Store database files in server/data/.

Requirements:

- Enable persistent storage.
- Create unique indexes for user email.
- Create indexes for activity userId.
- Create indexes for activity projectId.
- Create indexes for activity timestamp.
- Create indexes for activity activityType.
- Handle database errors properly.
- Initialize datastores before accepting requests.
- Never expose database file paths through the API.
- Do not access NeDB directly from controllers.
- Use repository classes for database operations.

Use NeDB document identifiers (_id).

Do not introduce SQLite, PostgreSQL or MongoDB.

## 7. API Design

Base path: /api

### Users

GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
PATCH  /api/users/:id/status

### Projects

GET    /api/projects
GET    /api/projects/:id
POST   /api/projects
PUT    /api/projects/:id

### Activities

GET    /api/activities
GET    /api/activities/:id
POST   /api/activities

Activity filtering must support:

- userId
- projectId
- activityType
- startDate
- endDate
- page
- pageSize
- sortBy
- sortDirection

Filtering, sorting and pagination must happen
on the server.

Use consistent JSON response structures.

Use appropriate HTTP status codes:

- 200 OK
- 201 Created
- 204 No Content
- 400 Bad Request
- 404 Not Found
- 409 Conflict
- 500 Internal Server Error

Validate all request parameters and payloads.

## 8. Activity Tracking Rules

Activities are historical audit records.

- Every activity must reference an existing user.
- Project association is optional.
- Validate activity types.
- Store timestamps in UTC.
- Do not allow activity updates.
- Do not allow activity deletion.
- Validate user and project references server-side.

Login/logout events can be simulated.

A complete authentication system is not required
unless explicitly requested.

## 9. Frontend Requirements

Build a professional administrative interface.

### Dashboard
- Total users.
- Total activities.
- Recent activity history.
- Activity statistics.

### User Management
- List users.
- Search users.
- Create user.
- Edit user.
- Activate/deactivate user.
- View user details.

### Activity History
- Display activity records.
- Filter by date range.
- Filter by user.
- Filter by activity type.
- Filter by project.
- Sorting and pagination.

Use Material UI.

Provide responsive layouts, form validation,
loading indicators, empty states and error handling.

## 10. Testing

Backend:
- Unit tests for services.
- Repository tests.
- API integration tests using Supertest.
- Test user creation and duplicate emails.
- Test activity creation.
- Test invalid references.
- Test date filtering.
- Test activity type filtering.
- Test pagination and sorting.
- Test immutable activity records.

Frontend:
- Component tests.
- Form validation tests.
- Activity filtering tests.
- Loading and error state tests.

Use isolated temporary database files for tests.

## 11. Security and Data Integrity

- Validate all inputs.
- Never trust client-provided identifiers.
- Prevent unauthorized activity modification.
- Do not expose internal exceptions.
- Do not log sensitive tax information.
- Never commit secrets.
- Configure CORS appropriately.
- Protect historical activity records.
- Never use real taxpayer data in test fixtures.

Do not claim production readiness without proper
authentication, authorization, backup and security review.

## 12. Development Workflow

Before implementing a feature:

1. Inspect the existing repository.
2. Understand existing conventions.
3. Identify affected files.
4. Propose a concise implementation plan.
5. Implement incrementally.

After implementation:

1. Run backend tests.
2. Run frontend tests.
3. Build both applications.
4. Fix errors and regressions.
5. Summarize modifications.

Do not rewrite unrelated code.

Do not add dependencies without justification.

Do not implement multiple unrelated features
in one task.

## 13. Documentation

Maintain README.md containing:

- Project overview.
- Technology stack.
- Prerequisites.
- Installation instructions.
- Development startup instructions.
- Database storage location.
- API endpoint documentation.
- Testing instructions.

## 14. Copilot Behavior

Act as a senior full-stack developer.

Prioritize:
1. Correctness.
2. Simplicity.
3. Maintainability.
4. Testability.
5. Clear documentation.

Analyze before implementing.

Explain important technical decisions.

Implement requested features rather than merely
providing suggestions.

Never claim that a feature works unless it has
been implemented and validated.

The developer retains final control over
architectural decisions.
