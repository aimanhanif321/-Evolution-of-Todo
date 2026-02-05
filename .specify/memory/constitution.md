<!-- SYNC IMPACT REPORT
Version change: 5.0.0 -> 5.1.0 (MINOR: Added Project Governance AI Principles)
Modified principles:
  - None renamed
Added sections:
  - Part X: PROJECT GOVERNANCE AI (Sections 30-35)
    - Section 30: GOVERNANCE HIERARCHY
    - Section 31: UNDERSTANDING-FIRST PRINCIPLE
    - Section 32: DEDUPLICATION ENFORCEMENT
    - Section 33: DEPENDENCY SEQUENCING
    - Section 34: GAP ANALYSIS PROTOCOL
    - Section 35: PHASE ALIGNMENT RULES
Removed sections: None
Templates requiring updates:
  - plan-template.md: ✅ Already generic - no update needed
  - tasks-template.md: ✅ Already generic - no update needed
  - spec-template.md: ✅ Already generic - no update needed
Follow-up TODOs:
  - Validate existing tasks.md files against deduplication rules
  - Run gap analysis on Phase V/VI/VII artifacts
-->

# PROJECT CONSTITUTION — TASKORA
## Phase VII: Cloud-Native Microservices Architecture

**Constitution Version:** 5.1.0
**Ratification Date:** 2025-01-15
**Last Amended:** 2026-02-04
**Classification:** Production Cloud Platform with Event-Driven Microservices

---

## PREAMBLE

This Constitution establishes the governance framework for **Taskora** as an **AI-powered task management platform** built on **cloud-native microservices architecture**. The system leverages event-driven design with Kafka, distributed application runtime via Dapr, and Kubernetes orchestration for horizontal scalability, fault tolerance, and observability.

This document serves as the supreme authority for all development, deployment, and operational decisions.

---

## PART I: FOUNDATIONAL PRINCIPLES

### 1. PROJECT IDENTITY (UPDATED)

| Attribute | Value |
|-----------|-------|
| Application Name | **Taskora** |
| Tagline | *Organize. Focus. Finish.* |
| Current Phase | **Phase VII — Cloud-Native Microservices** |
| Platform Type | AI-Powered Task Management on Event-Driven Microservices |
| Deployment Model | Kubernetes (DOKS Production / Minikube Local) |

**Phase Evolution:**
- Phase I: Console-based Todo application (COMPLETE)
- Phase II: Full-stack web application (COMPLETE)
- Phase III: AI Chatbot Integration with Cohere (COMPLETE)
- Phase IV: Cloud-Native Kubernetes Deployment (COMPLETE)
- Phase V: Production Cloud-Native Microservices (COMPLETE)
- Phase VI: Advanced Todo Features (COMPLETE)
- Phase VII: Cloud-Native Microservices Architecture (CURRENT)
- Phase VIII: AI-Enhanced Smart Features (PLANNED)

**Critical Declaration:**
Phase VII establishes Taskora as a **fully cloud-native microservices platform** with:
- Event-driven architecture using Kafka for loose coupling
- Dapr runtime for service mesh, pub/sub, state, bindings, and secrets
- Horizontal scalability via Kubernetes auto-scaling
- Comprehensive observability (metrics, logging, tracing)
- Fault tolerance with circuit breakers and retries
- Local development parity using Minikube

---

### 2. PROJECT VISION & OBJECTIVES

**Vision Statement:**
To build a highly scalable, resilient, and observable AI-powered task management system using cloud-native principles that runs consistently from local development to production.

**Phase VII Core Goals:**

| # | Goal | Description |
|---|------|-------------|
| 1 | Loose Coupling | Services communicate via events, not direct calls where possible |
| 2 | Horizontal Scalability | All components scale independently via Kubernetes HPA |
| 3 | Observability | Full visibility into system behavior (metrics, logs, traces) |
| 4 | Fault Tolerance | Graceful degradation, circuit breakers, automatic retries |
| 5 | Cloud-Native Design | Kubernetes-native even when running locally on Minikube |

**Goal Statement:**
> "My AI-powered task management system runs on cloud-native microservices with full Dapr capabilities: Pub/Sub, State Management, Service Invocation, Bindings, and Secrets Management."

---

### 3. DEVELOPMENT PHILOSOPHY (ENHANCED)

**Core Tenets:**

1. **Cloud-Native First**: Design for Kubernetes from the start. No local-only patterns.

2. **Event-Driven by Default**: Publish events for all state changes. Consumers decide what to act on.

3. **Dapr as Infrastructure**: Use Dapr building blocks instead of direct SDK integrations. This enables portability across cloud providers.

4. **Local-Prod Parity**: Minikube + Dapr locally MUST behave identically to DOKS production.

5. **Graceful Degradation**: System MUST remain functional when non-critical components fail.

6. **Observability as Code**: Metrics, logging, and tracing are first-class requirements, not afterthoughts.

---

## PART II: HIGH-LEVEL ARCHITECTURE

### 4. ARCHITECTURE DIAGRAM (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              KUBERNETES CLUSTER                                  │
│                        (Minikube Local / DOKS Production)                       │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                           INGRESS CONTROLLER                               │  │
│  │                        (NGINX + TLS Termination)                          │  │
│  └─────────────────────────────────┬─────────────────────────────────────────┘  │
│                                    │                                            │
│  ┌─────────────────────────────────┼─────────────────────────────────────────┐  │
│  │                                 │                                         │  │
│  │    ┌────────────────────┐       │      ┌────────────────────┐            │  │
│  │    │   FRONTEND POD     │       │      │   BACKEND POD      │            │  │
│  │    │ ┌────────────────┐ │       │      │ ┌────────────────┐ │            │  │
│  │    │ │   Next.js      │ │       │      │ │   FastAPI      │ │            │  │
│  │    │ │   App          │ │◄──────┼─────►│ │   App          │ │            │  │
│  │    │ └───────┬────────┘ │       │      │ └───────┬────────┘ │            │  │
│  │    │         │          │       │      │         │          │            │  │
│  │    │ ┌───────▼────────┐ │       │      │ ┌───────▼────────┐ │            │  │
│  │    │ │ DAPR SIDECAR   │ │◄──────┼─────►│ │ DAPR SIDECAR   │ │            │  │
│  │    │ │ (daprd)        │ │  Service     │ │ (daprd)        │ │            │  │
│  │    │ └────────────────┘ │  Invocation  │ └───────┬────────┘ │            │  │
│  │    └────────────────────┘             │         │          │            │  │
│  │                                       └─────────┼──────────┘            │  │
│  │                                                 │                       │  │
│  │  ┌──────────────────────────────────────────────┼─────────────────────┐ │  │
│  │  │                    DAPR CONTROL PLANE        │                     │ │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐   │                     │ │  │
│  │  │  │ Placement│  │ Operator │  │ Sentry   │   │                     │ │  │
│  │  │  │ Service  │  │          │  │ (mTLS)   │   │                     │ │  │
│  │  │  └──────────┘  └──────────┘  └──────────┘   │                     │ │  │
│  │  └────────────────────────────────────────────┼─────────────────────┘ │  │
│  │                                               │                       │  │
│  └───────────────────────────────────────────────┼───────────────────────┘  │
│                                                  │                          │
│  ┌───────────────────────────────────────────────┼───────────────────────┐  │
│  │                     DATA & MESSAGING LAYER    │                       │  │
│  │                                               │                       │  │
│  │  ┌─────────────────┐  ┌──────────────────┐   │   ┌─────────────────┐ │  │
│  │  │   POSTGRESQL    │  │    REDPANDA      │◄──┘   │     REDIS       │ │  │
│  │  │   (Primary DB)  │  │    (Kafka)       │       │   (State Store) │ │  │
│  │  │                 │  │                  │       │                 │ │  │
│  │  │  - Tasks        │  │  - task-events   │       │  - Session      │ │  │
│  │  │  - Users        │  │  - user-events   │       │  - Cache        │ │  │
│  │  │  - Tags         │  │  - chat-events   │       │  - Locks        │ │  │
│  │  └─────────────────┘  └──────────────────┘       └─────────────────┘ │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     SECRETS STORE                                      │  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │   KUBERNETES SECRETS  (or HashiCorp Vault in production)        │  │  │
│  │  │   - DATABASE_URL                                                 │  │  │
│  │  │   - COHERE_API_KEY                                               │  │  │
│  │  │   - BETTER_AUTH_SECRET                                           │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

                                    │
                                    │ HTTPS
                                    │
                            ┌───────▼───────┐
                            │   BROWSER     │
                            │   (Client)    │
                            └───────────────┘
```

---

### 5. DAPR CAPABILITIES MATRIX

**Required Dapr Building Blocks:**

| Capability | Building Block | Component | Purpose |
|------------|---------------|-----------|---------|
| **Pub/Sub** | `pubsub.kafka` | Redpanda | Event streaming for task, user, chat events |
| **State Management** | `state.redis` | Redis | Session storage, caching, distributed locks |
| **Service Invocation** | Built-in | Dapr Sidecar | Secure service-to-service calls with retries |
| **Bindings (Input)** | `bindings.cron` | Dapr Cron | Scheduled jobs (reminders, recurring tasks) |
| **Bindings (Output)** | `bindings.http` | HTTP | External API calls (Cohere AI, webhooks) |
| **Secrets Management** | `secretstores.kubernetes` | K8s Secrets | Secure credential storage |

**Dapr Component Configuration:**

```yaml
# Pub/Sub Component (pubsub.yaml)
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "redpanda:9092"
    - name: consumerGroup
      value: "taskora"
    - name: authRequired
      value: "false"

# State Store Component (statestore.yaml)
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
    - name: redisHost
      value: "redis:6379"
    - name: redisPassword
      secretKeyRef:
        name: redis-password
        key: password

# Cron Binding for Reminders (cron-binding.yaml)
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: reminder-cron
spec:
  type: bindings.cron
  version: v1
  metadata:
    - name: schedule
      value: "@every 1m"  # Check for due reminders every minute

# Secrets Component (secrets.yaml)
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kubernetes-secrets
spec:
  type: secretstores.kubernetes
  version: v1
```

---

### 6. COMPONENT RESPONSIBILITIES

| Component | Responsibility | Scaling Strategy |
|-----------|---------------|------------------|
| **Frontend (Next.js)** | UI rendering, client-side state, API calls via Dapr | Horizontal (stateless) |
| **Backend (FastAPI)** | Business logic, DB operations, event publishing | Horizontal (stateless) |
| **Dapr Sidecar** | Service discovery, pub/sub, state, secrets, retries | 1:1 with app pod |
| **PostgreSQL** | Primary data persistence (tasks, users, tags) | Vertical / Read replicas |
| **Redpanda (Kafka)** | Event streaming, async communication | Horizontal (partitions) |
| **Redis** | State store, caching, session, distributed locks | Horizontal (cluster mode) |
| **Dapr Control Plane** | Service mesh management, mTLS, placement | HA deployment |

---

### 7. SERVICE COMMUNICATION PATTERNS

**Pattern 1: Synchronous Request-Response (Service Invocation)**

```
┌──────────┐     HTTP/gRPC      ┌───────────────┐     HTTP/gRPC      ┌──────────┐
│ Frontend │ ──────────────────►│ Dapr Sidecar  │ ──────────────────►│ Backend  │
│          │◄────────────────── │ (mTLS, retry) │◄────────────────── │          │
└──────────┘     Response       └───────────────┘     Response       └──────────┘
```

**Use Cases:**
- Get task list
- Create/update task
- User authentication
- AI chat requests

**Pattern 2: Asynchronous Event-Driven (Pub/Sub)**

```
┌──────────┐                    ┌───────────────┐                    ┌──────────┐
│ Backend  │ ───publish────────►│   Redpanda    │ ───subscribe──────►│ Consumer │
│          │  "task.created"    │   (Kafka)     │                    │ Service  │
└──────────┘                    └───────────────┘                    └──────────┘
```

**Event Topics:**

| Topic | Events | Publishers | Subscribers |
|-------|--------|------------|-------------|
| `task-events` | created, updated, deleted, completed, recurred | Backend | Analytics, Notifications |
| `user-events` | registered, logged_in, logged_out | Backend | Analytics, Audit |
| `chat-events` | message_sent, response_received | Backend | Analytics, AI Training |
| `reminder-events` | reminder_triggered | Cron Binding | Notification Service |

**Pattern 3: Scheduled Jobs (Cron Bindings)**

```
┌──────────────┐     Trigger      ┌───────────────┐
│ Dapr Cron    │ ────────────────►│ Backend       │
│ (every 1min) │                  │ /reminders    │
└──────────────┘                  └───────┬───────┘
                                          │
                                          │ Publish
                                          ▼
                                  ┌───────────────┐
                                  │  Redpanda     │
                                  │ (reminder-    │
                                  │  events)      │
                                  └───────────────┘
```

---

### 8. DATA FLOW ARCHITECTURE

**Task Creation Flow:**

```
1. User submits task form
         │
         ▼
2. Frontend calls Backend via Dapr Service Invocation
         │
         ▼
3. Backend validates request
         │
         ▼
4. Backend persists task to PostgreSQL
         │
         ▼
5. Backend publishes "task.created" event to Kafka
         │
         ▼
6. Backend returns task to Frontend
         │
         ▼
7. Event consumers (analytics, notifications) process event asynchronously
```

**Reminder Notification Flow:**

```
1. Dapr Cron triggers /api/reminders endpoint every minute
         │
         ▼
2. Backend queries tasks with reminder_at <= NOW and NOT sent
         │
         ▼
3. For each due reminder:
   - Publish "task.reminder" event
   - Mark reminder as sent in DB
         │
         ▼
4. Notification service (future) subscribes and sends browser push
```

---

## PART III: FAULT TOLERANCE & RESILIENCE

### 9. RESILIENCE PATTERNS

**Circuit Breaker (via Dapr Resiliency):**

```yaml
# resiliency.yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: taskora-resiliency
spec:
  policies:
    retries:
      default:
        policy: constant
        maxRetries: 3
        duration: 1s
    circuitBreakers:
      default:
        maxRequests: 1
        interval: 10s
        timeout: 30s
        trip: consecutiveFailures >= 5
  targets:
    apps:
      taskora-backend:
        retry: default
        circuitBreaker: default
```

**Graceful Degradation Matrix:**

| Component Failure | System Behavior | User Impact |
|-------------------|-----------------|-------------|
| Redis (state store) down | Fallback to DB for sessions | Slight latency increase |
| Redpanda (Kafka) down | Task CRUD works, events queued | No real-time updates |
| Backend pod crash | Kubernetes restarts, retry succeeds | Brief delay (<10s) |
| PostgreSQL down | All writes fail | Error message, retry prompt |
| Dapr sidecar crash | Direct HTTP falls back | Degraded (no retries/mTLS) |

---

### 10. OBSERVABILITY ARCHITECTURE

**Three Pillars:**

| Pillar | Technology | Data Collected |
|--------|------------|----------------|
| **Metrics** | Prometheus + Grafana | Request rate, latency, errors, pod resources |
| **Logging** | Structured JSON → Loki | Request logs, error traces, business events |
| **Tracing** | Zipkin / Jaeger | Distributed request tracing across services |

**Dapr Observability Integration:**

```yaml
# Dapr configuration for observability
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: taskora-config
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "http://zipkin:9411/api/v2/spans"
  metrics:
    enabled: true
  logging:
    apiLogging:
      enabled: true
```

**Health Check Endpoints:**

| Endpoint | Purpose | Check |
|----------|---------|-------|
| `GET /health` | Liveness | App is running |
| `GET /ready` | Readiness | DB connected, dependencies up |
| `GET /metrics` | Prometheus | Application metrics |

---

## PART IV: SECRETS MANAGEMENT

### 11. SECRETS ARCHITECTURE

**Secret Categories:**

| Category | Secrets | Storage |
|----------|---------|---------|
| Database | `DATABASE_URL` | Kubernetes Secret |
| AI Services | `COHERE_API_KEY`, `GEMINI_API_KEY` | Kubernetes Secret |
| Authentication | `BETTER_AUTH_SECRET`, `JWT_SECRET` | Kubernetes Secret |
| Infrastructure | `REDIS_PASSWORD` | Kubernetes Secret |

**Dapr Secrets Access Pattern:**

```python
# Backend retrieves secrets via Dapr
from dapr.clients import DaprClient

async def get_database_url():
    with DaprClient() as d:
        secret = d.get_secret(
            store_name="kubernetes-secrets",
            key="DATABASE_URL"
        )
        return secret.secret["DATABASE_URL"]
```

**Secret Injection (Pod Spec):**

```yaml
# Secrets injected as environment variables
env:
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: taskora-secrets
        key: DATABASE_URL
```

---

## PART V: LOCAL DEVELOPMENT WITH MINIKUBE

### 12. MINIKUBE SETUP

**Prerequisites:**
- Minikube v1.32+
- Docker Desktop or Hyperkit
- kubectl
- Helm 3
- Dapr CLI

**Local Cluster Setup:**

```bash
# Start Minikube with sufficient resources
minikube start \
  --cpus 4 \
  --memory 8192 \
  --driver docker \
  --kubernetes-version v1.28.0

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server
minikube addons enable dashboard

# Install Dapr
dapr init -k --wait

# Apply Dapr components
kubectl apply -f dapr/components-local/

# Deploy application
helm upgrade --install taskora ./helm/taskora \
  -n taskora --create-namespace \
  -f ./helm/taskora/values-local.yaml

# Access application
minikube tunnel  # In separate terminal
# Application available at http://localhost
```

**Local vs Production Differences:**

| Aspect | Local (Minikube) | Production (DOKS) |
|--------|------------------|-------------------|
| Kubernetes | Minikube (single node) | DOKS (3+ nodes) |
| Ingress | Minikube Ingress | NGINX + cert-manager |
| TLS | Self-signed or none | Let's Encrypt |
| Database | PostgreSQL in-cluster | DO Managed Database |
| Secrets | Local K8s secrets | External Secrets Operator |
| Replicas | 1 per service | 2-3 per service |

---

## PART VI: TECHNOLOGY STACK (PRESERVED)

### 13. APPLICATION STACK

**Frontend:**
- Framework: Next.js 16+ (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Icons: Lucide React
- State: React Query + Zustand
- Notifications: Web Push API

**Backend:**
- Framework: FastAPI
- Language: Python 3.11+
- ORM: SQLModel
- AI Integration: Cohere API v2
- Async: asyncio + httpx
- Validation: Pydantic v2

**Infrastructure:**
- Container Runtime: Docker
- Orchestration: Kubernetes
- Service Mesh: Dapr 1.13+
- Event Streaming: Redpanda (Kafka-compatible)
- Cache/State: Redis 7+
- Database: PostgreSQL 15

---

## PART VII: PRESERVED SECTIONS

### 14-26. PHASE VI FEATURES (COMPLETE)

All Phase VI features (Priorities, Tags, Search, Filter, Sort, Due Dates, Recurring Tasks, Reminders) are preserved and continue to function within the cloud-native architecture. See previous constitution version for detailed specifications.

---

## PART VIII: GOVERNANCE

### 27. AMENDMENT PROCEDURE

**Constitution Versioning:**
- MAJOR: Architectural changes, new infrastructure components, deployment model changes
- MINOR: New feature sections, expanded guidance
- PATCH: Clarifications, typo fixes

**Amendment Process:**
1. Propose change via specification document
2. Review impact on dependent systems
3. Update constitution with new version
4. Update all affected templates
5. Commit with message: `docs: amend constitution to vX.Y.Z`

---

### 28. COMPLIANCE REVIEW

**Weekly Review Checklist:**
- [ ] All services communicate via Dapr sidecars
- [ ] Events published for all state changes
- [ ] Graceful degradation tested
- [ ] Observability endpoints functional
- [ ] Secrets not hardcoded
- [ ] Local Minikube setup mirrors production

---

## PART IX: SUCCESS CRITERIA

### 29. PHASE VII SUCCESS CRITERIA

| # | Criterion | Validation Method |
|---|-----------|-------------------|
| 1 | All Dapr capabilities functional | Test pub/sub, state, invocation, bindings, secrets |
| 2 | Local Minikube matches production | Deploy same Helm chart to both |
| 3 | Circuit breakers working | Inject failure, observe graceful degradation |
| 4 | Events flow through Kafka | Verify events in Redpanda console |
| 5 | Secrets retrieved via Dapr | No plaintext secrets in code/configs |
| 6 | Cron bindings trigger | Reminders checked every minute |
| 7 | Observability complete | Metrics, logs, traces visible |
| 8 | Horizontal scaling works | HPA scales on CPU/memory |

---

## PART X: PROJECT GOVERNANCE AI

### 30. GOVERNANCE HIERARCHY

**Document Hierarchy (Supreme to Implementation):**

```
┌─────────────────────────────────────────────────────────────┐
│                    CONSTITUTION                              │
│           (Supreme Authority - This Document)                │
│    Defines: Principles, Architecture, Non-Negotiables       │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    SPECIFICATIONS                            │
│               (specs/###-feature/spec.md)                   │
│    Defines: User Stories, Requirements, Success Criteria    │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                         PLANS                                │
│               (specs/###-feature/plan.md)                   │
│    Defines: Technical Approach, Structure, Dependencies     │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                         TASKS                                │
│               (specs/###-feature/tasks.md)                  │
│    Defines: Ordered Work Items, Parallel Opportunities      │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION                            │
│                   (Source Code Files)                       │
│    Output: Working Software Matching Specifications         │
└─────────────────────────────────────────────────────────────┘
```

**Hierarchy Rules:**
1. Lower-level documents MUST NOT contradict higher-level documents
2. Implementation MUST satisfy all tasks
3. Tasks MUST trace to plan and specification
4. Specifications MUST comply with constitution principles

---

### 31. UNDERSTANDING-FIRST PRINCIPLE

**Non-Negotiable Rule:**
> Before taking ANY action, the AI MUST fully understand the existing state by reading all relevant documents.

**Understanding Protocol:**

| Step | Action | Validation |
|------|--------|------------|
| 1 | Read Constitution | Identify applicable principles |
| 2 | Read Feature Specification | Extract user stories and requirements |
| 3 | Read Implementation Plan | Understand technical approach and structure |
| 4 | Read Existing Tasks | Identify completed, in-progress, and pending work |
| 5 | Read Related Source Code | Understand current implementation state |

**Understanding Checkpoints:**
- [ ] All governing documents have been read
- [ ] Applicable principles have been identified
- [ ] Current state is fully understood
- [ ] Dependencies are mapped
- [ ] Potential conflicts are identified

**Violations:**
- Creating tasks without reading specifications = VIOLATION
- Implementing features without understanding plan = VIOLATION
- Assuming document content without reading = VIOLATION

---

### 32. DEDUPLICATION ENFORCEMENT

**Non-Negotiable Rule:**
> No duplicate tasks, specifications, or implementations shall exist. Overlapping items MUST be merged.

**Deduplication Protocol:**

```
BEFORE Creating Any Artifact:
1. Search existing artifacts for similar content
2. Compare functionality, not just names
3. If overlap > 30%, MERGE instead of CREATE
4. If exact duplicate, REJECT creation
```

**Deduplication Checks:**

| Artifact Type | Check Method | Merge Strategy |
|---------------|--------------|----------------|
| Tasks | Compare descriptions and affected files | Combine into single task with all requirements |
| Specifications | Compare user stories and requirements | Consolidate overlapping stories |
| Components | Compare functionality and interfaces | Single component with combined features |
| Tests | Compare test scenarios | Unified test covering all scenarios |

**Merge Template:**
```markdown
## Merged Task: [Combined Title]
**Original Tasks:** T001, T015, T042 (merged due to overlap)
**Combined Scope:** [All functionality from merged tasks]
**Affected Files:** [Union of all files]
```

---

### 33. DEPENDENCY SEQUENCING

**Non-Negotiable Rule:**
> Tasks MUST be sequenced by dependencies. Blocked tasks MUST NOT execute before blockers complete.

**Dependency Types:**

| Type | Symbol | Description |
|------|--------|-------------|
| Hard Dependency | `→` | Task B cannot start until Task A completes |
| Soft Dependency | `⟶` | Task B benefits from Task A but can proceed |
| Parallel | `∥` | Tasks have no dependency, can run simultaneously |
| Conflict | `✗` | Tasks modify same files, cannot run in parallel |

**Sequencing Algorithm:**

```
1. Build dependency graph from task definitions
2. Identify all hard dependencies
3. Topological sort to determine execution order
4. Group independent tasks for parallel execution
5. Flag conflicting parallel tasks

Execution Order:
Phase 1 (Setup)      →  No dependencies
Phase 2 (Foundation) →  Depends on Phase 1
Phase 3+ (Features)  →  Depends on Phase 2, parallel within phase
Phase N (Polish)     →  Depends on all feature phases
```

**Phase Alignment (Per User Request):**

| Phase | Name | Dependencies |
|-------|------|--------------|
| Phase A | Advanced Features | Foundation complete |
| Phase B | Local Deployment | Phase A components ready |
| Phase C | Cloud Deployment | Phase B validated locally |

---

### 34. GAP ANALYSIS PROTOCOL

**Non-Negotiable Rule:**
> If a required step, feature, or component is missing from documentation, a new task MUST be created with explicit justification.

**Gap Detection Checklist:**

- [ ] All user stories have corresponding tasks
- [ ] All tasks have corresponding implementations
- [ ] All implementations have corresponding tests (if required)
- [ ] All dependencies are explicitly declared
- [ ] All environment configurations are documented
- [ ] All deployment steps are specified

**Gap Creation Template:**
```markdown
## Gap Task: [Title]
**Gap Type:** [Missing Feature | Missing Documentation | Missing Test | Missing Configuration]
**Discovery Method:** [How the gap was identified]
**Justification:** [Why this is required]
**Specification Reference:** [Which requirement this fulfills]
**Dependencies:** [What must exist before this gap is filled]
**Priority:** [P1/P2/P3 based on blocking impact]
```

**Gap Categories:**

| Category | Examples | Priority Default |
|----------|----------|------------------|
| Blocking | Missing DB schema for feature | P1 |
| Functional | Missing validation for user input | P2 |
| Quality | Missing error handling | P2 |
| Documentation | Missing API docs | P3 |
| Testing | Missing integration test | P3 |

---

### 35. PHASE ALIGNMENT RULES

**Phase V Specific Rules (Production Cloud-Native Microservices):**

Based on Phase V requirements (DOKS + Dapr + Kafka), the following alignment rules apply:

**Phase V Architecture Compliance:**

| Requirement | Validation | Status |
|-------------|------------|--------|
| DigitalOcean Kubernetes (DOKS) | Cluster provisioned, Helm charts deploy | ✅ COMPLETE |
| Dapr for Microservices | Sidecars inject, pub/sub works | ✅ COMPLETE |
| Kafka/Redpanda Events | Topics created, events flow | ✅ COMPLETE |
| GitHub Actions CI/CD | Workflows trigger on push/PR | ✅ COMPLETE |
| Local Development Parity | Docker Compose mirrors prod | ✅ COMPLETE |

**Phase Cross-Reference Table:**

| Phase | Key Deliverables | Constitution Section |
|-------|------------------|---------------------|
| Phase V | DOKS, Dapr, Kafka, CI/CD | Parts II-V |
| Phase VI | Priority, Tags, Search, Filter, Sort, Due Dates, Recurring, Reminders | Part VII (Section 14-26) |
| Phase VII | Full Dapr Capabilities, Minikube Parity, Observability | Parts II-V (enhanced) |

**Task Alignment Validation:**

Before marking any task complete:
1. Verify task output matches specification
2. Verify implementation follows plan structure
3. Verify no constitution principles violated
4. Verify no duplicate functionality introduced
5. Document any deviations with justification

---

## PART XI: EXECUTION RULES

### 36. AI AGENT OPERATING RULES

**Before Any Execution:**
```
1. READ constitution (this document)
2. READ feature specification
3. READ implementation plan
4. READ existing tasks
5. IDENTIFY current state
6. VALIDATE no conflicts
7. PROCEED only if all checks pass
```

**During Execution:**
```
1. EXECUTE one task at a time (unless parallel-safe)
2. VALIDATE output matches expectation
3. UPDATE task status immediately
4. LOG any deviations or issues
5. STOP if blocking error encountered
```

**After Execution:**
```
1. VERIFY all acceptance criteria met
2. UPDATE task status to complete
3. DOCUMENT any gaps discovered
4. CREATE follow-up tasks if needed
5. REPORT summary to user
```

---

## PART XII: KAFKA TOPIC ARCHITECTURE (PHASE V)

### 37. KAFKA/REDPANDA TOPICS

**Topic Naming Convention:** `{domain}-events`

**Defined Topics:**

| Topic | Partitions | Retention | Events |
|-------|------------|-----------|--------|
| `task-events` | 3 | 7 days | created, updated, deleted, completed, recurred, reminder |
| `user-events` | 2 | 30 days | registered, logged_in, logged_out, profile_updated |
| `chat-events` | 2 | 7 days | message_sent, response_received, conversation_started |
| `system-events` | 1 | 1 day | health_check, deployment, error |

**Event Schema (CloudEvents Format):**

```json
{
  "specversion": "1.0",
  "type": "task.created",
  "source": "/api/tasks",
  "id": "uuid-v4",
  "time": "2026-02-04T12:00:00Z",
  "datacontenttype": "application/json",
  "data": {
    "taskId": "123",
    "title": "Example Task",
    "userId": "456"
  }
}
```

**Consumer Groups:**

| Group | Topics Subscribed | Purpose |
|-------|-------------------|---------|
| `taskora-analytics` | all | Metrics and reporting |
| `taskora-notifications` | task-events, reminder-events | Push notifications |
| `taskora-audit` | all | Compliance logging |

---

==================================================
END OF CONSTITUTION — PHASE VII v5.1.0
==================================================

*This constitution establishes Taskora as a cloud-native microservices platform with complete Dapr capabilities: Pub/Sub (Kafka), State Management (Redis), Service Invocation, Bindings (Cron), and Secrets Management. All development MUST comply with this document. The Project Governance AI principles ensure task deduplication, dependency sequencing, and gap analysis for all project actions.*
