# evolution-of-todos Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-30

## Phase VI Status: COMPLETE

All 79 tasks for the 004-advanced-todo-features feature have been implemented:

| Phase | Description | Tasks | Status |
|-------|-------------|-------|--------|
| 1 | Setup | 4/4 | Complete |
| 2 | Foundational | 10/10 | Complete |
| 3 | US1: Priority Management | 6/6 | Complete |
| 4 | US2: Tag Organization | 9/9 | Complete |
| 5 | US3: Search Tasks | 6/6 | Complete |
| 6 | US4: Filter Tasks | 7/7 | Complete |
| 7 | US5: Sort Tasks | 5/5 | Complete |
| 8 | US6: Due Dates | 7/7 | Complete |
| 9 | US7: Recurring Tasks | 8/8 | Complete |
| 10 | US8: Reminders | 10/10 | Complete |
| 11 | Polish | 7/7 | Complete |

### Phase VI Features Summary

- **Priority Management**: 4-level priority (Low/Medium/High/Urgent) with color-coded badges
- **Tag Organization**: Custom tags with colors, multi-tag assignment, filtering
- **Search**: Full-text search across titles and descriptions with 300ms debounce
- **Filter**: Multi-criteria filtering (status, priority, tags, overdue, date range)
- **Sort**: Sort by created date, due date, priority, or title (asc/desc)
- **Due Dates**: DateTime picker with quick-select, relative time display, overdue indicators
- **Recurring Tasks**: Daily/Weekly/Monthly/Custom patterns, auto-regeneration on completion
- **Reminders**: Browser notifications with in-app fallback, 60-second polling

---

## Phase V Status: COMPLETE (005-advanced-cloud-deployment)

All 49 tasks for the 005-advanced-cloud-deployment feature have been implemented:

| Phase | Description | Tasks | Status |
|-------|-------------|-------|--------|
| 1 | Setup & Gap Validation | 4/4 | Complete |
| 2 | Dapr Cron Bindings | 4/4 | Complete |
| 3 | US1: Production Deploy | 10/10 | Complete |
| 4 | US2: Event-Driven Updates | 7/7 | Complete |
| 5 | US5: Local Dev Parity | 6/6 | Complete |
| 6 | US6: CI/CD Pipeline | 6/6 | Complete |
| 7 | US7: Observability | 6/6 | Complete |
| 8 | Polish & Documentation | 6/6 | Complete |

### Phase V Features Summary

- **Production Deployment**: DOKS cluster setup, Helm charts, TLS with cert-manager
- **Event Streaming**: Redpanda (Kafka-compatible), Dapr pub/sub, SSE real-time sync
- **Service Mesh**: Dapr sidecars, state store, secrets management, cron bindings
- **CI/CD Pipeline**: GitHub Actions (CI, Build, Deploy, Staging, Rollback)
- **Local Dev Parity**: Docker Compose with Dapr overlay, local Redpanda/Redis
- **Observability**: Health endpoints, structured logging, metrics, Dapr dashboard
- **Database**: Neon DB (serverless PostgreSQL) support

---

## Previous Phase V (003-doks-dapr-kafka): COMPLETE

All 69 tasks for the 003-doks-dapr-kafka feature were implemented:

| Phase | Description | Tasks | Status |
|-------|-------------|-------|--------|
| 1 | Setup | 4/4 | Complete |
| 2 | Foundational | 10/10 | Complete |
| 3 | US1: Production Access | 12/12 | Complete |
| 4 | US2: CI/CD Pipeline | 10/10 | Complete |
| 5 | US5: Local Dev Parity | 8/8 | Complete |
| 6 | US3: Event Streaming | 10/10 | Complete |
| 7 | US4: Service Mesh | 8/8 | Complete |
| 8 | Polish | 7/7 | Complete |

## Active Technologies
- Python 3.11+ (Backend), TypeScript (Frontend) + FastAPI, SQLModel, Next.js 16+, Tailwind CSS, Lucide React (004-advanced-todo-features)
- PostgreSQL 15 (existing), Alembic migrations (004-advanced-todo-features)
- Python 3.11+ (Backend), TypeScript 5.x (Frontend) + FastAPI, SQLModel, Dapr SDK (Backend); Next.js 16+, Tailwind CSS, React Query (Frontend) (005-advanced-cloud-deployment)
- PostgreSQL 15 (primary), Redis 7+ (state/cache), Redpanda (events) (005-advanced-cloud-deployment)

- **Backend**: Python 3.11+, FastAPI, SQLModel, Dapr SDK
- **Frontend**: TypeScript, Next.js 16+, Tailwind CSS
- **Database**: PostgreSQL 15 (DigitalOcean Managed)
- **Event Streaming**: Redpanda (Kafka-compatible)
- **Service Mesh**: Dapr 1.13+
- **Orchestration**: Kubernetes (DOKS)
- **CI/CD**: GitHub Actions

## Project Structure

```text
backend/
├── src/
│   ├── api/              # FastAPI routes
│   ├── models/           # SQLModel entities
│   ├── services/         # Business logic
│   └── dapr/             # Dapr client and event publishers
├── tests/
└── Dockerfile

frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities (API client, Dapr)
│   └── services/         # API clients
└── Dockerfile

helm/taskora/
├── Chart.yaml
├── values.yaml
├── values-prod.yaml
└── templates/
    ├── backend-deployment.yaml
    ├── frontend-deployment.yaml
    ├── ingress.yaml
    ├── redpanda.yaml
    └── dapr/

dapr/
├── components/           # Production Dapr components
└── components-local/     # Local development components

.github/workflows/
├── ci.yml                # Lint and test on PR
├── build.yml             # Docker image builds
└── deploy-prod.yml       # Production deployment

docs/
├── architecture.md
├── dapr-debugging.md
├── github-secrets.md
└── troubleshooting.md
```

## Commands

### Local Development

```bash
# Start without Dapr (lighter)
docker-compose up

# Start with Dapr (for event testing)
docker-compose -f docker-compose.yml -f docker-compose.dapr.yml up

# Backend only
cd backend && uvicorn src.main:app --reload

# Frontend only
cd frontend && npm run dev
```

### Production Deployment

```bash
# Create DOKS cluster
./scripts/create-cluster.sh

# Deploy with Helm
helm upgrade --install taskora ./helm/taskora -n taskora -f ./helm/taskora/values-prod.yaml
```

### Debugging

```bash
# Check Dapr status
dapr status -k

# View Dapr dashboard
dapr dashboard -k -p 9999

# Check pod logs
kubectl logs -l app.kubernetes.io/name=taskora-backend -n taskora -f
```

## Code Style

- **Python**: Follow PEP 8, use Ruff for linting
- **TypeScript**: ESLint + Prettier
- **YAML**: 2-space indentation
- **General**: Follow existing patterns in the codebase

## Key Design Decisions

1. **Dapr for microservices**: Provides service invocation, pub/sub, and resiliency without code changes
2. **Redpanda over Kafka**: Lower resource footprint, no ZooKeeper required
3. **Event-driven architecture**: Task, user, and chat events published for extensibility
4. **Graceful degradation**: Application works without Dapr sidecar (local dev)
5. **Zero-downtime deployments**: RollingUpdate strategy with health checks

## Recent Changes (004-advanced-todo-features)

- Added Priority enum with color-coded PriorityBadge component
- Created Tag model with CRUD API and TagBadge/TagInput components
- Implemented full-text search with ILIKE and debounced SearchInput
- Built FilterPanel with status/priority/tag/overdue filters and URL persistence
- Added SortDropdown with 4 sort options and custom priority ordering
- Created DateTimePicker with quick-select and DueDateBadge with relative time
- Implemented recurring tasks with calculate_next_due_date and auto-regeneration
- Added reminders with ReminderSelector, useNotifications hook, and NotificationBell
- Published Dapr events: task.created, task.updated, task.completed, task.recurred, task.reminder

## Previous Changes (003-doks-dapr-kafka)

- Added Dapr integration for service mesh and pub/sub
- Created GitHub Actions CI/CD pipeline
- Added Redpanda for event streaming
- Created comprehensive debugging and troubleshooting docs
- Implemented observability endpoints (/health, /ready, /metrics)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
