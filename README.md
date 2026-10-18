# Task Management System (Senior Full-Stack Assessment)

A production-ready, enterprise-grade **Task Management System** demonstrating full-stack implementation, robust API design, database indexing, automated testing, and production-minded engineering decisions.

---

## Live Deployment & URLs

* **GitHub Repository:** [https://github.com/rishavgupta10/task-management-system](https://github.com/rishavgupta10/task-management-system)
* **Live Frontend Web Application:** [https://task-management-system-frontend-gamma.vercel.app](https://task-management-system-frontend-gamma.vercel.app) *(or Vercel / Netlify live URL)*
* **Deployed Backend API Base:** [https://task-management-api-85r2.onrender.com](https://task-management-api-85r2.onrender.com)
* **Live Health Check Endpoint:** [https://task-management-api-85r2.onrender.com/health](https://task-management-api-85r2.onrender.com/health)
* **Hosting Providers:**
  - **Frontend:** Vercel (Next.js Edge Network)
  - **Backend API:** Render (Docker Web Service)
  - **Database:** Supabase / Neon (Managed Cloud PostgreSQL 16)

> **Important Note on Free-Tier Cold Starts:**  
> The backend container is hosted on a free-tier cloud platform (Render). If the service has been inactive, it automatically spins down to save compute. **The first request may take 30–50 seconds to boot the container and connect to the PostgreSQL pool.** Once awake, subsequent requests respond in under 50ms.

---

### Cloud Deployment & Redeployment Steps:

#### 1. Backend & Database (Render / Supabase):
1. Create a PostgreSQL 16 database on **Supabase** or **Neon**.
2. Connect Render to the GitHub repository:
   - Select Docker environment (uses `backend/Dockerfile`).
   - Root directory: `backend`.
   - Set environment variables in Render Dashboard:
     - `DATABASE_URL`: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require`
     - `PORT`: `4000`
     - `CORS_ORIGIN`: `https://task-management-system-frontend-gamma.vercel.app`
     - `NODE_ENV`: `production`
3. Database migrations and seeds run automatically during container startup:
   ```bash
   npx prisma db push --skip-generate && node dist/prisma/seed.js && node dist/src/main.js
   ```

#### 2. Frontend (Vercel):
1. Import the repository in **Vercel**.
2. Set Root Directory to `frontend`.
3. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://task-management-api-85r2.onrender.com`
4. Deploy. Vercel automatically deploys every push to the `main` branch.

---

## 1. Architecture Overview

The system is designed with strict separation of concerns, high cohesion, and loose coupling:

```
                      ┌────────────────────────────────────────┐
                      │          Browser Client (User)         │
                      └──────────────────┬─────────────────────┘
                                         │ HTTPS / HTTP
                                         ▼
                      ┌────────────────────────────────────────┐
                      │      Next.js 14 Frontend App Router    │
                      │  - Custom Hook State (useTasks)        │
                      │  - Non-flicker Debounced Search (400ms)│
                      │  - Interactive Metric Cards & Filters  │
                      │  - Optimistic Concurrency Control (OCC)│
                      │  - Centralized Typed API Client        │
                      └──────────────────┬─────────────────────┘
                                         │ REST (JSON)
                                         ▼
                      ┌────────────────────────────────────────┐
                      │         NestJS 10 Backend API          │
                      │  - Global ValidationPipe (DTOs)        │
                      │  - Global AllExceptionsFilter          │
                      │  - Idempotency & Retry Deduplication   │
                      │  - Multi-Tenant Isolation Scoping      │
                      │  - Keyset (Cursor) & Offset Pagination │
                      │  - Health Check Endpoint (/health)     │
                      └──────────────────┬─────────────────────┘
                                         │ Connection Pool
                                         ▼
                      ┌────────────────────────────────────────┐
                      │          PostgreSQL 16 Database        │
                      │  - Prisma ORM 5 Data Access Layer      │
                      │  - Composite B-Tree Indexes            │
                      │  - Tenant Partitioning & Safety Indexes│
                      │  - Persistent Docker Volume            │
                      └────────────────────────────────────────┘
```

### Key Engineering Decisions:
1. **Frontend Architecture:** Split from a single monolithic file into modular components (`TasksHeader`, `TaskMetrics`, `TaskFilters`, `TaskList`, `TaskModal`, `TaskDetailModal`, `DeleteConfirmModal`, `Pagination`, `ErrorState`, `LoadingSkeleton`) orchestrated by a clean `useTasks` custom hook.
2. **Search Experience:** 400ms debouncing preserves existing table rows during background fetch to eliminate list flickering/blinking.
3. **Idempotency & Retry Protection:** Client attaches unique `Idempotency-Key` headers. Backend prevents duplicate task creation on network timeouts and rapid double clicks.
4. **Optimistic Concurrency Control (OCC):** Prevents silent overwriting when multiple users edit the same task concurrently via `expectedUpdatedAt` timestamp verification (`HTTP 409 Conflict`).
5. **High-Performance Pagination:** Supports standard UI offset pagination as well as $O(1)$ Keyset cursor-based pagination (`cursor=<id>`) for 100,000+ task datasets.
6. **Multi-Tenancy:** Multi-customer isolation scoped by `organizationId` with compound indexes ensuring zero cross-tenant data access.

---

## 2. Prerequisites

To run this application locally, ensure you have:
* **Docker:** Docker Desktop v24+ (or Docker Engine with Docker Compose v2+)
* **Node.js (Optional):** Node v18+ or v20+ (only required if developing outside Docker)
* **Git**

---

## 3. Startup Instructions (One-Step Docker Run)

The application is completely containerized. The reviewer does **not** need to manually install dependencies or configure PostgreSQL.

### Step 1: Clone the repository
```bash
git clone https://github.com/rishavgupta10/task-management-system.git
cd task-management-system
```

### Step 2: Build and start all services
```bash
docker compose up --build
```
* Docker Compose will automatically start:
  - PostgreSQL container on port `5433` (mapped from container `5432` to avoid host machine conflicts).
  - Backend container on port `4000` (auto-runs `prisma db push` and initial seed data).
  - Frontend container on port `3000`.

### Application URLs:
* **Frontend Web App:** [http://localhost:3000](http://localhost:3000) (or [http://localhost:3000/tasks](http://localhost:3000/tasks))
* **Backend API Base:** [http://localhost:4000](http://localhost:4000)
* **Health Check Endpoint:** [http://localhost:4000/health](http://localhost:4000/health)

### To Stop Containers:
```bash
docker compose down -v
```

---

## 4. Database Setup, Migrations & Sample Data

### Automated Setup (via Docker):
When running via `docker compose up --build`, database initialization is completely automated:
1. PostgreSQL container starts and verifies readiness via `pg_isready`.
2. Backend executes schema sync:
   ```bash
   npx prisma db push --skip-generate
   ```
3. Backend runs the TypeScript database seeder:
   ```bash
   node dist/prisma/seed.js
   ```

### Manual Setup & Migrations (Running Locally Without Docker):
If you run PostgreSQL locally or on an external cloud instance (e.g. Supabase, Neon, RDS):

```bash
# 1. Navigate to backend directory
cd backend

# 2. Push schema to database (creates tables & indexes)
npx prisma db push

# (Alternatively, to create and run formal SQL migrations)
npx prisma migrate dev --name init

# 3. Seed sample data
npm run prisma:seed
```

### Sample Data Overview:
The seed script (`backend/prisma/seed.ts`) populates **15 realistic engineering tasks** covering all status and priority permutations:
* **Statuses:** `TODO` (6 tasks), `IN_PROGRESS` (4 tasks), `DONE` (5 tasks)
* **Priorities:** `HIGH`, `MEDIUM`, `LOW`
* **Real-world Examples:**
  - *"Fix login bug"* (High priority, TODO)
  - *"Optimize SQL indexing"* (Medium priority, compound B-tree index task)
  - *"Verify error boundary and toast alerts"* (Low priority, DONE)
  - *"Implement optimistic locking"* (Medium priority, IN_PROGRESS)
  - *"Setup Next.js responsive layout"* (High priority, DONE)
* **Pre-seeded Multi-tenant Scopes:** Assigned to `organizationId: "org_default"` for immediate out-of-the-box UI demonstration.

---

## 5. Automated Testing & How to Run Test Cases

You can run the automated tests easily using the following instructions.

### 5.1 Run All Tests (Unified - Recommended)
From the project **root directory**, execute a single command to run both backend and frontend test suites sequentially:

```bash
npm test
```

---

### 5.2 Run Backend Tests Only
To run the NestJS API integration and validation test suite directly:

```bash
# From root directory:
npm run test:backend

# Or from backend directory:
cd backend
npm test
```

---

### 5.3 Run Frontend Tests Only
To run the Next.js React Testing Library component tests:

```bash
# From root directory:
npm run test:frontend

# Or from frontend directory:
cd frontend
npm test
```

---

### 5.4 Test Coverage Highlights:
* **13 Backend Integration Tests (`backend/src/tasks/tasks.controller.spec.ts`):**
  - **Validation & Missing Fields:** Validates `POST /tasks` with missing title, empty string title (`""`), invalid status string, and invalid priority enum. Expects `400 Bad Request` with structured error JSON.
  - **Task Creation:** Validates task creation with defaults (`status: TODO`, `priority: MEDIUM`) returning `201 Created`.
  - **404 Handling:** Validates `PATCH /tasks/:id` and `DELETE /tasks/:id` with non-existent UUIDs return `404 Not Found`.
  - **Status Filtering:** Validates `GET /tasks?status=DONE` returns only records matching the queried status.
  - **Server-Side Pagination:** Validates limit, page, total count, total pages calculation, and boundary edge cases (`page=0`, `limit=500`).
  - **Case-Insensitive Search:** Validates `GET /tasks?search=login` accurately returns matching task records.
  - **Resource Retrieval & Deletion:** Validates single task lookup (`200 OK`) and deletion (`204 No Content`).
* **Frontend Component Test (`frontend/__tests__/ErrorState.test.tsx`):**
  - Verifies network error message rendering and retry callback button triggers upon user click.
* **100% Repeatable & Database Independent:**
  - Backend tests use an isolated in-memory mock store (`Map`).
  - You do **not** need a running PostgreSQL database instance to run and pass the tests. Tests execute deterministically on any machine.

---

## 6. Environment Variables

Safe environment templates are provided with no hardcoded secrets:

### Root & Backend (`.env.example` / `backend/.env.example`):
```env
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5433/task_management?schema=public
PORT=4000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Frontend (`frontend/.env.example`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
PORT=3000
```

---

## 7. Known Limitations & Future Improvements

1. **In-Memory Idempotency Cache:**
   - *Current Implementation:* Uses an in-memory `Map` with TTL expiration inside the backend process.
   - *Production Recommendation:* For horizontally scaled instances behind a load balancer, distribute idempotency keys using a centralized Redis cluster (`SET key NX EX`).
2. **Full-Text Search Engine:**
   - *Current Implementation:* Case-insensitive substring match (`contains` with PostgreSQL index).
   - *Production Recommendation:* For datasets exceeding 1,000,000 tasks with fuzzy typo-tolerance, integrate PostgreSQL `pg_trgm` GIN indexes or an external search engine (Elasticsearch / Meilisearch).
3. **Database Row-Level Security (RLS):**
   - *Current Implementation:* Multi-tenancy is enforced at the application/service layer (`where: { organizationId }`).
   - *Production Recommendation:* Add PostgreSQL native Row-Level Security (`ALTER TABLE tasks ENABLE ROW LEVEL SECURITY`) with `SET LOCAL app.current_organization_id` for defense-in-depth isolation.

---

## 8. AI Tools Used & Contribution Disclosure

In accordance with assessment guidelines, the following AI tools were utilized during development:

| AI Tool | Area of Contribution | Detailed Description |
| :--- | :--- | :--- |
| **Google Antigravity / Claude 3.5 Sonnet** | Full-Stack Scaffolding & Code Generation | Assisted with boilerplate generation for NestJS modules, Prisma schema definitions, Next.js Tailwind layout components, and DTO validations. |
| **AI Pair Programming Assistant** | Architecture & Refactoring | Guided component decomposition from monolithic `page.tsx` into decoupled presenter components (`TasksHeader`, `TaskMetrics`, `TaskList`) and custom state hook (`useTasks`). |
| **AI Code Reviewer** | Test Case Design & Edge Case Identification | Assisted in drafting automated Supertest API integration test suites (covering invalid enum validation, empty string checks, 404 updates, and cursor pagination). |

> **Developer Verification & Code Understanding:**  
> All generated code, database migrations, indexing structures, debounce hooks, idempotency caching, optimistic concurrency mechanisms, and Docker orchestration were manually reviewed, validated, debugged, and tested by the developer to ensure full architectural understanding and adherence to production software engineering standards.
