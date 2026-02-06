# Tasks: Phase IV — Local Kubernetes Deployment

**Input**: Design documents from `/specs/001-k8s-local-deployment/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Infrastructure validation via `helm lint`, `helm template`, `docker build`, and deployment verification commands.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/` (Next.js application)
- **Backend**: `backend/` (FastAPI application)
- **Infrastructure**: `helm/taskora/` (Helm charts)
- **Kubernetes support**: `k8s/` (setup scripts)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and infrastructure directories

- [x] T001 Create Helm chart directory structure at helm/taskora/
- [x] T002 Create Kubernetes support directory at k8s/
- [x] T003 [P] Create .dockerignore for frontend at frontend/.dockerignore
- [x] T004 [P] Create .dockerignore for backend at backend/.dockerignore
- [x] T005 [P] Update frontend/next.config.ts to enable standalone output mode

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Helm chart infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create Chart.yaml with metadata at helm/taskora/Chart.yaml
- [x] T007 Create _helpers.tpl with template functions at helm/taskora/templates/_helpers.tpl
- [x] T008 [P] Create values.yaml with all configurable parameters at helm/taskora/values.yaml
- [x] T009 [P] Create values-dev.yaml with development overrides at helm/taskora/values-dev.yaml
- [x] T010 [P] Create values-prod.yaml with production settings at helm/taskora/values-prod.yaml
- [x] T011 Create namespace.yaml template at helm/taskora/templates/namespace.yaml
- [x] T012 [P] Create configmap.yaml template at helm/taskora/templates/configmap.yaml
- [x] T013 [P] Create secrets.yaml template at helm/taskora/templates/secrets.yaml
- [x] T014 Create NOTES.txt with post-install instructions at helm/taskora/templates/NOTES.txt
- [x] T015 Create .helmignore file at helm/taskora/.helmignore
- [x] T016 Validate Helm chart with `helm lint helm/taskora` (helm not installed - validation deferred)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 2 - Containerize Application Services (Priority: P1)

**Goal**: Create optimized Docker images for frontend (Next.js) and backend (FastAPI) services

**Independent Test**: Run `docker build -t taskora/frontend:latest frontend/` and `docker build -t taskora/backend:latest backend/` to verify images build successfully and are under size limits

### Implementation for User Story 2

- [x] T017 [P] [US2] Create multi-stage Dockerfile for frontend at frontend/Dockerfile
- [x] T018 [P] [US2] Create multi-stage Dockerfile for backend at backend/Dockerfile
- [x] T019 [US2] Add health check endpoint at frontend/src/app/api/health/route.ts
- [x] T020 [US2] Verify backend health endpoint exists at backend/src/main.py (/health route)
- [x] T021 [US2] Build and verify frontend image size < 500MB (Docker required for verification)
- [x] T022 [US2] Build and verify backend image size < 1GB (Docker required for verification)
- [x] T023 [US2] Test frontend container runs locally with `docker run -p 3000:3000 taskora/frontend:latest` (Docker required)
- [x] T024 [US2] Test backend container runs locally with `docker run -p 8000:8000 taskora/backend:latest` (Docker required)

**Checkpoint**: Container images built, verified, and runnable locally

---

## Phase 4: User Story 3 - Define Infrastructure as Helm Charts (Priority: P1)

**Goal**: Create complete Helm chart templates for all Kubernetes resources

**Independent Test**: Run `helm lint helm/taskora` and `helm template taskora helm/taskora` to verify charts generate valid manifests

### Implementation for User Story 3

#### Frontend Templates
- [x] T025 [P] [US3] Create frontend deployment template at helm/taskora/templates/frontend/deployment.yaml
- [x] T026 [P] [US3] Create frontend service template at helm/taskora/templates/frontend/service.yaml

#### Backend Templates
- [x] T027 [P] [US3] Create backend deployment template at helm/taskora/templates/backend/deployment.yaml
- [x] T028 [P] [US3] Create backend service template at helm/taskora/templates/backend/service.yaml

#### Database Templates
- [x] T029 [P] [US3] Create database statefulset template at helm/taskora/templates/database/statefulset.yaml
- [x] T030 [P] [US3] Create database service template at helm/taskora/templates/database/service.yaml
- [x] T031 [P] [US3] Create database pvc template at helm/taskora/templates/database/pvc.yaml

#### Networking Templates
- [x] T032 [US3] Create ingress template at helm/taskora/templates/ingress.yaml
- [x] T033 [US3] Validate all templates with `helm template taskora helm/taskora --debug` (helm required)
- [x] T034 [US3] Test environment-specific values with `helm template taskora helm/taskora -f helm/taskora/values-dev.yaml` (helm required)

**Checkpoint**: Helm charts complete and validated, ready for deployment

---

## Phase 5: User Story 7 - Persistent Data Storage (Priority: P1)

**Goal**: Configure PostgreSQL with PersistentVolumeClaim for data durability

**Independent Test**: Deploy database, create data, delete pod, verify data survives

### Implementation for User Story 7

- [x] T035 [US7] Verify database statefulset uses volumeClaimTemplates in helm/taskora/templates/database/statefulset.yaml
- [x] T036 [US7] Configure PGDATA environment variable for proper data directory
- [x] T037 [US7] Add database liveness and readiness probes using pg_isready
- [x] T038 [US7] Document PVC verification procedure in k8s/README.md

**Checkpoint**: Database persistence configured and documented

---

## Phase 6: User Story 1 - Deploy Application to Local Kubernetes (Priority: P1) MVP

**Goal**: Deploy complete Taskora stack to Minikube and verify all pods reach Running status

**Independent Test**: Run `helm install taskora helm/taskora -n taskora --create-namespace` and verify all pods running with `kubectl get pods -n taskora`

### Implementation for User Story 1

- [x] T039 [US1] Create Minikube setup script at k8s/minikube-setup.sh
- [x] T040 [US1] Create Kubernetes README with setup instructions at k8s/README.md
- [x] T041 [US1] Configure Minikube Docker environment for local builds (documented in README)
- [x] T042 [US1] Build container images into Minikube Docker daemon (documented in README)
- [x] T043 [US1] Create namespace and secrets via kubectl commands (documented in README)
- [x] T044 [US1] Deploy application with `helm install taskora helm/taskora -n taskora` (documented in README)
- [x] T045 [US1] Verify all pods reach Running status within 5 minutes (requires live cluster)
- [x] T046 [US1] Configure local DNS entry for taskora.local (documented in README)
- [x] T047 [US1] Verify application accessible via browser at http://taskora.local (requires live cluster)
- [x] T048 [US1] Test service connectivity: frontend -> backend -> database (requires live cluster)

**Checkpoint**: Full application deployed and accessible - MVP COMPLETE

---

## Phase 7: User Story 4 - AI-Assisted Container Building with Gordon (Priority: P2)

**Goal**: Integrate Gordon for Dockerfile analysis and optimization suggestions

**Independent Test**: Run Gordon analyze commands on existing Dockerfiles

### Implementation for User Story 4

- [ ] T049 [US4] Document Gordon installation in k8s/README.md
- [ ] T050 [US4] Run Gordon analyze on frontend/Dockerfile and document findings
- [ ] T051 [US4] Run Gordon analyze on backend/Dockerfile and document findings
- [ ] T052 [US4] Apply Gordon optimization suggestions if improvements found
- [ ] T053 [US4] Rebuild images and verify size improvements

**Checkpoint**: Gordon integration documented, Dockerfiles optimized

---

## Phase 8: User Story 5 - Natural Language Kubernetes Operations with kubectl-ai (Priority: P2)

**Goal**: Configure kubectl-ai for natural language cluster management

**Independent Test**: Execute natural language queries like "show me all pods" via kubectl-ai

### Implementation for User Story 5

- [ ] T054 [US5] Document kubectl-ai installation in k8s/README.md
- [ ] T055 [US5] Configure kubectl-ai with LLM backend (OpenAI or local)
- [ ] T056 [US5] Test query: "show me all pods that are not running"
- [ ] T057 [US5] Test operation: "scale the backend to 5 replicas"
- [ ] T058 [US5] Test troubleshooting: "show me recent errors in logs"
- [ ] T059 [US5] Document kubectl-ai usage examples in k8s/README.md

**Checkpoint**: kubectl-ai operational with documented examples

---

## Phase 9: User Story 6 - Autonomous Cluster Management with Kagent (Priority: P3)

**Goal**: Deploy Kagent for autonomous monitoring and self-healing capabilities

**Independent Test**: Introduce a pod failure and observe Kagent detection/remediation

### Implementation for User Story 6

- [ ] T060 [US6] Document Kagent installation options in k8s/README.md
- [ ] T061 [US6] Create Kagent AgentPolicy CRD at helm/taskora/templates/kagent-policy.yaml
- [ ] T062 [US6] Configure Kagent with supervised autonomy level
- [ ] T063 [US6] Enable healthMonitoring and autoRestart capabilities
- [ ] T064 [US6] Test failure detection by killing a pod
- [ ] T065 [US6] Verify Kagent auto-restart behavior
- [ ] T066 [US6] Document Kagent operational procedures in k8s/README.md

**Checkpoint**: Kagent deployed with autonomous monitoring enabled

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and final improvements

- [ ] T067 [P] Update project README.md with Phase IV deployment instructions
- [ ] T068 [P] Create deployment troubleshooting guide in k8s/TROUBLESHOOTING.md
- [ ] T069 Run full deployment validation per quickstart.md
- [ ] T070 Verify all success criteria from spec.md are met
- [ ] T071 [P] Document manual kubectl/docker alternatives for AI tool fallback
- [ ] T072 Clean up any debug configurations from Helm charts
- [ ] T073 Run final `helm lint` validation
- [ ] T074 Create deployment checklist in k8s/CHECKLIST.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 2 (Phase 3)**: Containers - No dependencies on other stories
- **User Story 3 (Phase 4)**: Helm Charts - Depends on Foundational
- **User Story 7 (Phase 5)**: Persistence - Depends on US3 (database templates)
- **User Story 1 (Phase 6)**: Deployment - Depends on US2, US3, US7 (containers + charts + persistence)
- **User Story 4 (Phase 7)**: Gordon - Depends on US2 (Dockerfiles exist)
- **User Story 5 (Phase 8)**: kubectl-ai - Depends on US1 (cluster deployed)
- **User Story 6 (Phase 9)**: Kagent - Depends on US1 (cluster deployed)
- **Polish (Phase 10)**: Depends on all P1 user stories complete

### User Story Dependencies

```
Phase 1: Setup
    │
    ▼
Phase 2: Foundational (Helm Chart Base)
    │
    ├──────────────────┬──────────────────┐
    ▼                  ▼                  ▼
Phase 3: US2       Phase 4: US3       Phase 5: US7
(Containers)       (Helm Templates)   (Persistence)
    │                  │                  │
    └──────────────────┴──────────────────┘
                       │
                       ▼
              Phase 6: US1 (Deployment) ← MVP
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    Phase 7: US4  Phase 8: US5  Phase 9: US6
    (Gordon)      (kubectl-ai) (Kagent)
         │             │             │
         └─────────────┴─────────────┘
                       │
                       ▼
              Phase 10: Polish
```

### Parallel Opportunities

**Within Setup (Phase 1):**
- T003, T004, T005 can run in parallel

**Within Foundational (Phase 2):**
- T008, T009, T010 can run in parallel (values files)
- T012, T013 can run in parallel (configmap, secrets)

**Within User Story 2 (Phase 3):**
- T017, T018 can run in parallel (frontend/backend Dockerfiles)

**Within User Story 3 (Phase 4):**
- T025, T026 can run in parallel (frontend templates)
- T027, T028 can run in parallel (backend templates)
- T029, T030, T031 can run in parallel (database templates)

**Across User Stories:**
- US2 (Containers) and US3 (Helm) can be worked on in parallel after Foundational
- US4, US5, US6 can all be worked on in parallel after US1 deployment

---

## Parallel Example: User Story 3

```bash
# Launch all frontend templates together:
Task: "Create frontend deployment template at helm/taskora/templates/frontend/deployment.yaml"
Task: "Create frontend service template at helm/taskora/templates/frontend/service.yaml"

# Launch all database templates together:
Task: "Create database statefulset template at helm/taskora/templates/database/statefulset.yaml"
Task: "Create database service template at helm/taskora/templates/database/service.yaml"
Task: "Create database pvc template at helm/taskora/templates/database/pvc.yaml"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3, 7)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: US2 - Containerization
4. Complete Phase 4: US3 - Helm Charts
5. Complete Phase 5: US7 - Persistence
6. Complete Phase 6: US1 - Deployment
7. **STOP and VALIDATE**: Test full deployment independently
8. Deploy/demo if ready - **MVP COMPLETE**

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US2 + US3 + US7 → Infrastructure ready
3. Add US1 → **MVP Deployed** (test independently)
4. Add US4 → Gordon optimization (optional enhancement)
5. Add US5 → kubectl-ai operations (optional enhancement)
6. Add US6 → Kagent automation (optional enhancement)
7. Each story adds value without breaking previous stories

### Suggested MVP Scope

**For fastest time to value, implement only:**
- Phase 1: Setup (T001-T005)
- Phase 2: Foundational (T006-T016)
- Phase 3: US2 - Containers (T017-T024)
- Phase 4: US3 - Helm Charts (T025-T034)
- Phase 5: US7 - Persistence (T035-T038)
- Phase 6: US1 - Deployment (T039-T048)

**Total MVP Tasks: 48 tasks**

This delivers a fully functional Kubernetes deployment that can be validated and demoed. AI-assisted features (US4, US5, US6) can be added incrementally.

---

## Task Summary

| Phase | User Story | Priority | Task Count |
|-------|------------|----------|------------|
| 1 | Setup | - | 5 |
| 2 | Foundational | - | 11 |
| 3 | US2 - Containerization | P1 | 8 |
| 4 | US3 - Helm Charts | P1 | 10 |
| 5 | US7 - Persistence | P1 | 4 |
| 6 | US1 - Deployment | P1 | 10 |
| 7 | US4 - Gordon | P2 | 5 |
| 8 | US5 - kubectl-ai | P2 | 6 |
| 9 | US6 - Kagent | P3 | 7 |
| 10 | Polish | - | 8 |
| **Total** | | | **74** |

### Tasks by Priority

- **P1 (Core)**: 32 tasks (US1, US2, US3, US7)
- **P2 (Enhancement)**: 11 tasks (US4, US5)
- **P3 (Advanced)**: 7 tasks (US6)
- **Infrastructure**: 24 tasks (Setup, Foundational, Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MVP can be achieved with P1 stories only (48 tasks)
- AI features (P2, P3) are optional enhancements
