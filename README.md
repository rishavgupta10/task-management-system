# Task Management System (Senior Full-Stack Assessment)

A production-minded, responsive full-stack **Task Management System** built with **Next.js, React, NestJS, TypeScript, PostgreSQL, Prisma ORM, and Docker Compose**.

---

## Live Links & Repository

- **Repository URL:** [https://github.com/rishavgupta10/task-management-system](https://github.com/rishavgupta10/task-management-system)
- **Live Frontend URL:** `https://task-management-frontend-rishav.vercel.app` *(or custom domain)*
- **Deployed API Base URL:** `https://task-management-backend-api.onrender.com`
- **Health Check Endpoint:** `https://task-management-backend-api.onrender.com/health`

> **Note on Free-Tier Cold Starts:**  
> The backend is hosted on a container cloud platform (e.g. Render). Free-tier instances spin down automatically after periods of inactivity. If the service is cold, the initial request may experience a 30–50 second delay while the container boots and connects to the PostgreSQL database. Subsequent requests will be near-instantaneous.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │          Browser Client (User)         │
                      └──────────────────┬─────────────────────┘
                                         │ HTTPS
                                         ▼
                      ┌────────────────────────────────────────┐
                      │          Next.js 14 Frontend           │
                      │  - App Router (/tasks)                 │
                      │  - Reusable React components           │
                      │  - Tailwind CSS Glassmorphism & UI     │
                      │  - Centralized Typed API Client        │
                      └──────────────────┬─────────────────────┘
                                         │ REST (JSON)
                                         ▼
                      ┌────────────────────────────────────────┐
                      │           NestJS Backend API           │
                      │  - ValidationPipe (class-validator)    │
                      │  - Global AllExceptionsFilter          │
                      │  - TasksService / TasksController      │
                      │  - HealthModule (/health)              │
                      │  - Prisma Client & ORM                 │
                      └──────────────────┬─────────────────────┘
                                         │ TCP (Connection Pool)
                                         ▼
                      ┌────────────────────────────────────────┐
                      │          PostgreSQL Database           │
                      │  - B-Tree Composite & Single Indexes   │
                      │  - Persistent Docker Volume            │
                      └────────────────────────────────────────┘
```

---

## Project Structure

```text
task-managment/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema, enums & composite indexes
│   │   └── seed.ts              # Idempotent seed data (15 records)
│   ├── src/
│   │   ├── common/
│   │   │   └── filters/         # Global AllExceptionsFilter for consistent error JSON
│   │   ├── health/              # Deployment health check endpoint (/health)
│   │   ├── prisma/              # PrismaService & PrismaModule
│   │   ├── tasks/
│   │   │   ├── dto/             # CreateTaskDto, UpdateTaskDto, QueryTasksDto
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.service.ts
│   │   │   ├── tasks.module.ts
│   │   │   └── tasks.controller.spec.ts  # Automated API integration tests
│   │   ├── app.module.ts
│   │   └── main.ts              # Bootstrap, global pipes, CORS configuration
│   ├── .env.example             # Safe placeholder environment variables
│   ├── Dockerfile               # Multi-stage production Docker build
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── tasks/page.tsx       # Main task management dashboard
│   │   ├── layout.tsx           # Responsive layout with metadata
│   │   ├── globals.css          # Tailwind CSS styling and theme
│   │   └── page.tsx             # Redirects root / to /tasks
│   ├── components/
│   │   ├── TaskList.tsx         # Responsive table of tasks
│   │   ├── TaskFilters.tsx      # Debounced search & dropdown filters
│   │   ├── TaskModal.tsx        # Modal for Create and Edit operations
│   │   ├── DeleteConfirmModal.tsx # Delete confirmation dialog
│   │   ├── TaskBadges.tsx       # Status & Priority badge chips
│   │   ├── Pagination.tsx       # Pagination navigation controls
│   │   ├── LoadingSkeleton.tsx  # Shimmer skeleton loader
│   │   ├── EmptyState.tsx       # Empty and no-results states
│   │   ├── ErrorState.tsx       # Error state card with retry button
│   │   └── Toast.tsx            # Non-blocking feedback alert
│   ├── hooks/
│   │   └── useDebounce.ts       # 300ms debounce hook for search queries
│   ├── lib/
│   │   └── api.ts               # Centralized typed HTTP client with error mapping
│   ├── types/
│   │   └── task.ts              # TypeScript interfaces and enum types
│   ├── __tests__/               # Frontend component tests (ErrorState, etc.)
│   ├── .env.example             # Safe frontend placeholder environment variables
│   ├── Dockerfile               # Optimized multi-stage Next.js Docker build
│   └── package.json
│
├── docker-compose.yml           # Multi-service orchestration (Postgres, Backend, Frontend)
├── .env.example                 # Root environment template
├── .gitignore
└── package.json                 # Monorepo test & script runners
```

---

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, NestJS 10, TypeScript, Express, class-validator, class-transformer
- **Database:** PostgreSQL 16, Prisma ORM 5
- **Testing:** Jest, Supertest, React Testing Library
- **DevOps & Containers:** Docker, Docker Compose, Multi-stage builds

---

## Prerequisites

- **Docker:** Docker Desktop v24+ (or Docker Engine with Docker Compose v2+)
- **Node.js:** Node v18+ or v20+ (only required if running outside Docker)
- **Git**

---

## Local Setup & Docker Run (Recommended)

To run the complete application in an isolated, multi-container environment with automatic database migrations and initial seed data:

```bash
# 1. Clone the repository
git clone https://github.com/rishavgupta10/task-management-system.git
cd task-management-system

# 2. Build and start containers in the background
docker compose up --build
```

### Local Application URLs:
- **Frontend UI:** `http://localhost:3000` (or `http://localhost:3000/tasks`)
- **Backend API:** `http://localhost:4000`
- **Health Check:** `http://localhost:4000/health`
- **PostgreSQL Database:** `localhost:5433` (mapped from container `5432` to avoid host conflicts)

To stop the containers and tear down resources:
```bash
docker compose down -v
```

---

## Environment Variables

Separate `.env.example` templates are provided in both root, `backend/`, and `frontend/`:

### Backend (`backend/.env.example`):
```env
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/task_management?schema=public
PORT=4000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Frontend (`frontend/.env.example`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
PORT=3000
```

> **Security Note:** Real passwords, private tokens, and connection strings are strictly omitted from source control and Git history. Production deployments configure credentials via host environment secret managers.

---

## Automated Testing

One single command from the project root runs the automated test suites:

```bash
npm test
```

### Test Coverage Highlights:
- **Test 1 — Validation & Missing Fields:** Validates `POST /tasks` with missing title, empty title, invalid status string, and invalid priority enum. Expects HTTP `400 Bad Request` with structured error messages.
- **Test 2 — 404 on Missing Record:** Validates `PATCH /tasks/:id` and `DELETE /tasks/:id` with non-existent UUIDs return HTTP `404 Not Found`.
- **Test 3 — Status Filtering:** Validates `GET /tasks?status=DONE` returns only records matching the queried status.
- **Test 4 — Server-Side Pagination:** Tests page limit, current page, total count, total pages calculation, and boundary edge cases (`page=0`, `limit=500`).
- **Test 5 — Case-Insensitive Search:** Tests `GET /tasks?search=login` accurately returns matching task records.
- **Test 6 — Frontend Error Handling:** Tests frontend `ErrorState` rendering and verification that clicking the **Retry** action triggers a refetch callback.

Tests run against an isolated in-memory or mock environment, ensuring **repeatability without depending on a developer's local database state**.

---

## REST API Specification

### 1. `POST /tasks`
Create a new task.
- **Request Body:**
  ```json
  {
    "title": "Fix login bug",
    "description": "Handle refresh token renewal failures",
    "status": "TODO",
    "priority": "HIGH"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "id": "e3b0c442-98fc-1c14-9afb-4c72005f9441",
    "title": "Fix login bug",
    "description": "Handle refresh token renewal failures",
    "status": "TODO",
    "priority": "HIGH",
    "createdAt": "2026-10-18T10:00:00.000Z",
    "updatedAt": "2026-10-18T10:00:00.000Z"
  }
  ```

### 2. `GET /tasks`
Fetch paginated, filtered, and searched tasks sorted by `createdAt DESC`.
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 10, max: 100)
  - `search` (string, searches title case-insensitively)
  - `status` (`TODO`, `IN_PROGRESS`, `DONE`)
  - `priority` (`LOW`, `MEDIUM`, `HIGH`)
- **Response:** `200 OK`
  ```json
  {
    "data": [...],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
  ```

### 3. `GET /tasks/:id`
Fetch a single task by ID.
- **Response:** `200 OK` or `404 Not Found`

### 4. `PATCH /tasks/:id`
Update an existing task (partial updates supported).
- **Request Body:**
  ```json
  {
    "status": "DONE"
  }
  ```
- **Response:** `200 OK` or `404 Not Found`

### 5. `DELETE /tasks/:id`
Delete a task by ID.
- **Response:** `204 No Content` or `404 Not Found`

### 6. `GET /health`
System health status and current ISO timestamp.
- **Response:** `200 OK`
  ```json
  {
    "status": "ok",
    "timestamp": "2026-10-18T10:00:00.000Z"
  }
  ```

---

## Consistent Error Structure

All HTTP error responses return a uniform schema:

```json
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "Title is required and cannot be empty"
}
```

---

## Production Engineering Scenarios

### 1. Duplicate Create Requests / Idempotency
- **Problem:** Unreliable mobile connections or network retries can send multiple `POST /tasks` requests, causing duplicate tasks.
- **Solution:** 
  1. The client generates a unique UUID `Idempotency-Key` header with each submission.
  2. A Redis or database table stores `(idempotency_key, request_hash, response_status, response_body, expires_at)`.
  3. When an incoming request matches an existing in-flight or completed key, the cached result is returned without executing duplicate inserts.

### 2. Large Datasets (100,000+ Tasks)
- **Problem:** Querying and rendering 100k tasks causes severe memory overhead and sluggish response times.
- **Solution:**
  1. **Database Indexes:** Compound B-Tree indexes on `(status, priority, createdAt DESC)` and single indexes on `status`, `priority`, and `createdAt`.
  2. **Full-Text / Trigram Search:** For 100k+ records in PostgreSQL, replace simple `ILIKE` with `pg_trgm` GIN indexes (`CREATE INDEX idx_tasks_title_trgm ON tasks USING gin (title gin_trgm_ops);`) or PostgreSQL native tsvector full-text search.
  3. **Cursor-based Pagination:** For deep pagination, keyset/cursor pagination (`WHERE (createdAt, id) < ($lastCreatedAt, $lastId) ORDER BY createdAt DESC, id DESC LIMIT 20`) avoids expensive `OFFSET` scanning across large table partitions.

### 3. Concurrent Updates & Optimistic Locking
- **Problem:** User A and User B open the same task. User A marks it `IN_PROGRESS`. User B marks it `DONE` without User A's changes, overwriting state silently.
- **Solution:**
  - Add a `@version` column (integer) or use `updatedAt` in an optimistic locking check:
    ```sql
    UPDATE tasks 
    SET title = $1, status = $2, version = version + 1 
    WHERE id = $3 AND version = $currentVersion;
    ```
  - If 0 rows are updated, throw HTTP `409 Conflict` and prompt the client to view the latest modifications before overriding.

### 4. Production Debugging Checklist (HTTP 500 Errors)
1. **Health & Process Status:** Check `GET /health` and container health checks via `docker compose ps`.
2. **Centralized Application Logs:** Inspect backend structured logs (stdout/Winston/Datadog) filtered by request correlation ID.
3. **Database Connectivity & Connection Pools:** Check if PostgreSQL connection pool limits were exhausted (`max_connections`) or if Prisma threw P1001 (can't reach database server).
4. **Recent Migrations:** Verify all Prisma schema migrations executed cleanly (`prisma migrate status`).
5. **Environment Configuration:** Confirm required variables (`DATABASE_URL`, `PORT`, `CORS_ORIGIN`) are properly injected in the runtime environment.
6. **System Resources:** Check memory exhaustion (OOM kills) or CPU spikes via container monitoring metrics.

### 5. Multi-Tenancy Architecture
- **Tenant Isolation:** Add an `organizationId` column to all tables.
- **Auth Scoping:** The JWT / session payload identifies `tenantId = req.user.organizationId`.
- **Query Interceptors:** NestJS middleware or Prisma extensions automatically enforce tenant scoping on every data operation:
  ```typescript
  prisma.$extends({
    query: {
      task: {
        async findMany({ args, query }) {
          args.where = { ...args.where, organizationId: currentTenantId };
          return query(args);
        },
      },
    },
  });
  ```
- **Composite Indexing:** Add `@@index([organizationId, createdAt])` and `@@index([organizationId, status])` for fast indexed reads strictly partitioned by tenant.

---

## Known Limitations

- **Authentication:** In accordance with the assessment requirements, user authentication (JWT/OAuth) is omitted to prioritize full-stack CRUD, database persistence, and Docker testing.
- **Single-Tenant Database:** While the multi-tenancy schema architecture is documented, the implementation uses a single tenant schema.
- **Trigram Search Extension:** Standard PostgreSQL case-insensitive query is used; `pg_trgm` extension is recommended when scaling past 100,000 tasks.

---

## AI Tools Used

AI development tools were utilized during development for:
- Structuring automated Supertest integration cases and edge test coverage.
- Formulating production scalability checklists and database indexing strategies.
- Validating multi-stage Docker build caching and orchestration best practices.

*All generated code and architecture designs were reviewed, tested, and verified for production readiness.*
