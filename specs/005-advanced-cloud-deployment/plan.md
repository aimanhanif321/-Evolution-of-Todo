# Implementation Plan: Phase V - Advanced Cloud Deployment

**Branch**: `005-advanced-cloud-deployment` | **Date**: 2026-02-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-advanced-cloud-deployment/spec.md`

## Summary

Phase V establishes Taskora as a production-ready, event-driven cloud platform.

**Already Complete:**
- ✅ Phase A: Advanced Features (Priorities, Tags, Search, Filter, Sort, Due Dates, Recurring, Reminders)
- ✅ Phase B: Local Deployment (Docker Compose on Docker Desktop)

**Remaining Work:**
- 🎯 Phase C: Cloud Deployment (DOKS + Dapr + Redpanda + CI/CD)

## Technical Context

**Language/Version**: Python 3.11+ (Backend), TypeScript 5.x (Frontend)
**Primary Dependencies**: FastAPI, SQLModel, Dapr SDK (Backend); Next.js 16+, Tailwind CSS, React Query (Frontend)
**Storage**: PostgreSQL 15 (primary), Redis 7+ (state/cache), Redpanda (events)
**Testing**: pytest (backend), manual E2E validation
**Target Platform**: Kubernetes (DOKS production, Minikube/Docker Compose local)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: P95 < 500ms, 1000 concurrent users, real-time sync < 2s
**Constraints**: 99.9% uptime, zero data loss during pod failures
**Scale/Scope**: Single tenant, web-only, multi-cloud (DOKS primary, GKE/AKS optional)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status |
|-----------|-------------|--------|
| Cloud-Native First | Design for Kubernetes from start | ✅ PASS |
| Event-Driven by Default | Publish events for all state changes | ✅ PASS |
| Dapr as Infrastructure | Use Dapr building blocks, not direct SDKs | ✅ PASS |
| Local-Prod Parity | Minikube + Dapr must match DOKS | ✅ PASS |
| Graceful Degradation | System functional when non-critical fails | ✅ PASS |
| Observability as Code | Metrics, logging, tracing first-class | ✅ PASS |
| Deduplication | No duplicate tasks/components | ✅ PASS |
| Dependency Sequencing | Tasks ordered by dependencies | ✅ PASS |

**Gate Status**: ALL GATES PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/005-advanced-cloud-deployment/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
├── checklists/          # Quality validation
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/              # FastAPI routes (tasks, tags, auth, reminders)
│   ├── models/           # SQLModel entities (Task, Tag, User, Reminder)
│   ├── services/         # Business logic (task_service, reminder_service, tag_service)
│   └── dapr/             # Dapr client and event publishers
├── alembic/              # Database migrations
├── Dockerfile
└── requirements.txt

frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components (TaskCard, FilterPanel, etc.)
│   ├── lib/              # Utilities (api.ts, dapr.ts, utils.ts)
│   ├── hooks/            # Custom hooks (useNotifications, useDebounce)
│   └── types/            # TypeScript type definitions
├── Dockerfile
└── package.json

helm/taskora/
├── Chart.yaml
├── values.yaml           # Default values
├── values-prod.yaml      # Production overrides
├── values-local.yaml     # Local development overrides
└── templates/
    ├── backend-deployment.yaml
    ├── frontend-deployment.yaml
    ├── ingress.yaml
    ├── redpanda.yaml
    └── dapr/              # Dapr component templates

dapr/
├── components/           # Production Dapr components
└── components-local/     # Local development components

.github/workflows/
├── ci.yml                # Lint and test on PR
├── build.yml             # Docker image builds
└── deploy-prod.yml       # Production deployment

docker-compose.yml        # Local development without Dapr
docker-compose.dapr.yml   # Local development with Dapr overlay
```

**Structure Decision**: Web application structure with separate backend (Python/FastAPI) and frontend (TypeScript/Next.js). Infrastructure as code via Helm charts and Dapr components.

## Complexity Tracking

No constitution violations requiring justification. The architecture follows all established principles.

---

## Phase 0: Research

### Research Topics

Based on the technical context and specification, the following research was conducted:

#### 1. Dapr Integration Patterns

**Decision**: Use Dapr Python SDK for pub/sub, state, and secrets with graceful fallback when sidecar unavailable.

**Rationale**: Dapr SDK provides type-safe clients and handles connection management. Graceful degradation allows local development without full Dapr setup.

**Alternatives Considered**:
- Direct HTTP to Dapr sidecar: More verbose, error-prone
- Kafka SDK directly: Breaks Dapr abstraction, loses portability

#### 2. Event Schema Design

**Decision**: CloudEvents v1.0 specification for all events.

**Rationale**: Industry standard, Dapr native support, extensible, includes required metadata (type, source, time).

**Alternatives Considered**:
- Custom schema: Not interoperable
- Avro/Protobuf: Over-engineering for current scale

#### 3. Real-Time Sync Architecture

**Decision**: Server-Sent Events (SSE) for real-time updates, with polling fallback.

**Rationale**: SSE is simpler than WebSockets for one-way server-to-client updates, natively supported by browsers, works through most proxies.

**Alternatives Considered**:
- WebSockets: More complex, bidirectional not needed
- Long polling: Less efficient, higher latency

#### 4. Recurring Task Engine

**Decision**: Dapr cron binding triggers backend endpoint every minute; backend checks for completed recurring tasks and generates new instances.

**Rationale**: Leverages Dapr infrastructure, no separate service needed, naturally scales with backend replicas.

**Alternatives Considered**:
- Separate cron service: Over-engineering
- Database triggers: Not portable, limited flexibility

#### 5. Multi-Cloud Deployment Strategy

**Decision**: Primary deployment to DOKS; Helm charts parameterized for GKE/AKS compatibility.

**Rationale**: DOKS is cost-effective for initial deployment; Helm abstraction enables future multi-cloud.

**Alternatives Considered**:
- Terraform: Adds complexity, not needed yet
- Cloud-specific tools: Vendor lock-in

---

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions.

**Core Entities:**

| Entity | Description | Key Fields |
|--------|-------------|------------|
| Task | Core work item | id, title, description, status, priority, due_date, recurrence_pattern, reminder_at, user_id, created_at, updated_at |
| Tag | User-defined label | id, name, color, user_id |
| TaskTag | Many-to-many junction | task_id, tag_id |
| User | Application user | id, email, name, created_at |
| AuditLog | Event history | id, event_type, entity_type, entity_id, data, timestamp |

**Event Entities:**

| Event Type | Topic | Payload |
|------------|-------|---------|
| task.created | task-events | CloudEvent with task data |
| task.updated | task-events | CloudEvent with task data |
| task.completed | task-events | CloudEvent with task data |
| task.deleted | task-events | CloudEvent with task_id |
| task.recurred | task-events | CloudEvent with old_id, new_task |
| task.reminder | reminder-events | CloudEvent with task_id, user_id |

### API Contracts

See [contracts/](./contracts/) directory for OpenAPI specifications.

**Endpoint Summary:**

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/tasks | List tasks with filters |
| POST | /api/tasks | Create task |
| GET | /api/tasks/{id} | Get task by ID |
| PUT | /api/tasks/{id} | Update task |
| DELETE | /api/tasks/{id} | Delete task |
| POST | /api/tasks/{id}/complete | Mark complete |
| GET | /api/tags | List user tags |
| POST | /api/tags | Create tag |
| DELETE | /api/tags/{id} | Delete tag |
| POST | /api/reminders/check | Cron-triggered reminder check |
| GET | /api/events/stream | SSE event stream |
| GET | /health | Liveness check |
| GET | /ready | Readiness check |
| GET | /metrics | Prometheus metrics |

### Infrastructure Contracts

**Dapr Components:**

| Component | Type | Purpose |
|-----------|------|---------|
| pubsub | pubsub.kafka | Event streaming |
| statestore | state.redis | Session/cache |
| kubernetes-secrets | secretstores.kubernetes | Secrets |
| reminder-cron | bindings.cron | 1-minute scheduler |
| recurrence-cron | bindings.cron | 1-minute scheduler |

**Helm Values Schema:**

| Key | Type | Description |
|-----|------|-------------|
| backend.replicas | int | Backend pod count |
| frontend.replicas | int | Frontend pod count |
| backend.image | string | Backend image |
| frontend.image | string | Frontend image |
| ingress.host | string | Domain name |
| ingress.tls.enabled | bool | TLS toggle |
| database.external | bool | Use managed DB |
| dapr.enabled | bool | Enable Dapr sidecars |

---

## Implementation Phases

### Phase A: Advanced Features (Application Layer) ✅ COMPLETE

**Status**: Already implemented in Phase VI (004-advanced-todo-features)

| Feature | Status |
|---------|--------|
| Priorities | ✅ Priority enum, PriorityBadge, sort |
| Tags | ✅ Tag model, CRUD API, TagInput, TagBadge, filter |
| Search | ✅ ILIKE query, SearchInput with debounce |
| Filter | ✅ Multi-criteria query, FilterPanel |
| Sort | ✅ ORDER BY dynamic, SortDropdown |
| Due Dates | ✅ due_date field, DateTimePicker, DueDateBadge |
| Recurring | ✅ recurrence_pattern, calculate_next, RecurrenceSelector |
| Reminders | ✅ reminder_at, check endpoint, ReminderSelector, NotificationBell |

---

### Phase B: Local Deployment (Docker Compose) ✅ COMPLETE

**Status**: Already deployed on Docker Desktop via docker-compose

| Component | Status |
|-----------|--------|
| Backend | ✅ Running in container |
| Frontend | ✅ Running in container |
| PostgreSQL | ✅ Running in container |
| Application | ✅ Accessible on localhost |

---

### Phase C: Cloud Deployment (DOKS + CI/CD) 🎯 CURRENT FOCUS

**Objective**: Production deployment with automated pipelines.

| Workflow | Trigger | Steps |
|----------|---------|-------|
| CI | Pull Request | Lint, test, report |
| Build | Push to main | Build images, push to registry |
| Deploy | Build success | Helm upgrade, health check |
| Rollback | Manual | Helm rollback |

**DOKS Architecture:**
- 3-node cluster (2vCPU, 4GB each)
- NGINX Ingress with cert-manager
- DigitalOcean Managed PostgreSQL
- In-cluster Redpanda and Redis
- Dapr 1.13+ with mTLS

---

## Success Validation

| Criterion | Test Method |
|-----------|-------------|
| SC-001: Deploy < 5 min | Time helm upgrade |
| SC-002: Sync < 2s | Multi-tab test |
| SC-003: Recurring < 1 min | Complete recurring, time new |
| SC-004: Reminder < 60s | Set future reminder, time notification |
| SC-005: Local < 3 min | Time docker-compose up |
| SC-006: CI/CD < 10 min | Time full pipeline |
| SC-007: 99.9% uptime | Monitor over 7 days |
| SC-008: 1000 users | Load test |
| SC-009: P95 < 500ms | Performance test |
| SC-010: Zero data loss | Kill pods, verify data |

---

## Next Steps

1. Run `/sp.tasks` to generate task list for **Phase C only** (Cloud Deployment)
2. Tasks will cover:
   - DOKS cluster provisioning
   - Dapr installation on Kubernetes
   - Redpanda deployment
   - Helm chart deployment
   - GitHub Actions CI/CD pipelines
   - TLS/Ingress configuration
3. Validate production deployment
4. Run success validation tests
