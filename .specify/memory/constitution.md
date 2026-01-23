<!-- SYNC IMPACT REPORT
Version change: 1.0.0 -> 2.0.0 (MAJOR: Cloud-Native Platform Transformation)
Modified principles:
  - "PROJECT IDENTITY" -> Updated to Phase IV Cloud-Native AI Platform
  - "PROJECT GOAL" -> Expanded to include Kubernetes orchestration
  - "TECHNOLOGY STACK" -> Extended with containerization and K8s tooling
  - "DEVELOPMENT PHILOSOPHY" -> Enhanced with AI-driven DevOps principles
Added sections:
  - Section 15: CLOUD-NATIVE ARCHITECTURE
  - Section 16: CONTAINERIZATION WITH DOCKER & GORDON
  - Section 17: KUBERNETES ORCHESTRATION
  - Section 18: HELM CHARTS AS INFRASTRUCTURE SPECS
  - Section 19: AI-DRIVEN KUBERNETES OPERATIONS
  - Section 20: SPEC-DRIVEN INFRASTRUCTURE
  - Section 21: AI AGENTS IN DEVOPS
  - Section 22: PHASE IV SUCCESS CRITERIA
  - Section 23: GOVERNANCE & VERSIONING
Removed sections: None (all previous sections preserved and extended)
Templates requiring updates:
  - plan-template.md: Add infrastructure planning sections
  - tasks-template.md: Add K8s deployment task categories
  - spec-template.md: Add infrastructure spec sections
Follow-up TODOs: None
-->

# PROJECT CONSTITUTION — TASKORA
## Phase IV: Cloud-Native AI Platform

**Constitution Version:** 2.0.0
**Ratification Date:** 2025-01-15
**Last Amended:** 2026-01-22
**Classification:** Production Cloud Platform

---

## PREAMBLE

This Constitution establishes the governance framework for **Taskora** as it transforms from a web application into a fully cloud-native, AI-operated platform. Phase IV represents the culmination of modern software engineering: containerized microservices orchestrated by Kubernetes, defined entirely through declarative specifications, and operated by AI agents.

This document serves as the supreme authority for all development, deployment, and operational decisions.

---

## PART I: FOUNDATIONAL PRINCIPLES

### 1. PROJECT IDENTITY (UPDATED)

| Attribute | Value |
|-----------|-------|
| Application Name | **Taskora** |
| Tagline | *Organize. Focus. Finish.* |
| Current Phase | **Phase IV — Cloud-Native AI Platform** |
| Platform Type | AI-Operated Kubernetes Platform |
| Deployment Model | Local Kubernetes (Minikube) with Production Parity |

**Phase Evolution:**
- Phase I: Console-based Todo application (COMPLETE)
- Phase II: Full-stack web application (COMPLETE)
- Phase III: AI Chatbot Integration with Cohere (COMPLETE)
- Phase IV: Cloud-Native Kubernetes Deployment (CURRENT)

**Critical Declaration:**
Phase IV transforms Taskora from a deployed web application into a **cloud-native AI-operated platform**. This is NOT merely containerization—it is a fundamental architectural evolution where:
- Infrastructure is defined as code (Helm Charts)
- Deployments are managed by AI agents (kubectl-ai, Kagent)
- Containers are built with AI assistance (Gordon)
- The entire system follows Spec-Driven Infrastructure principles

---

### 2. PROJECT VISION & OBJECTIVES

**Vision Statement:**
To demonstrate that modern cloud platforms can be fully specified, containerized, and operated by AI agents—transforming DevOps from imperative commands to declarative specifications.

**Phase IV Objectives:**

| # | Objective | Success Metric |
|---|-----------|----------------|
| 1 | Containerize all services | 100% services in Docker containers |
| 2 | Deploy to local Kubernetes | All pods running in Minikube |
| 3 | Define infrastructure as specs | Complete Helm charts for all components |
| 4 | Enable AI-driven operations | kubectl-ai and Kagent operational |
| 5 | Achieve production parity | Local environment mirrors production |
| 6 | Zero-touch deployments | Full deployment via AI agents |

---

### 3. DEVELOPMENT PHILOSOPHY (ENHANCED)

**Core Tenets:**

1. **Specification Supremacy**: All infrastructure, deployments, and configurations MUST be derived from specifications. No ad-hoc commands.

2. **AI-First Operations**: Human operators define WHAT; AI agents determine HOW. Direct kubectl commands are permitted only for debugging.

3. **Declarative Everything**: Imperative scripts are prohibited. All system state MUST be expressible as declarative YAML/Helm templates.

4. **Immutable Infrastructure**: Containers are never modified in place. All changes require new image builds and redeployments.

5. **GitOps Principles**: The Git repository is the single source of truth for both application code AND infrastructure state.

**Agentic DevOps Workflow:**
```
1. Define requirement in specification
2. AI agent generates Helm chart / Kubernetes manifest
3. AI agent validates against cluster state
4. AI agent applies changes via kubectl-ai or Kagent
5. AI agent monitors deployment health
6. AI agent reports status and handles rollback if needed
```

---

## PART II: TECHNOLOGY STACK

### 4. APPLICATION STACK (PRESERVED)

**Frontend:**
- Framework: Next.js 16+ (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Icons: Lucide React
- Authentication: JWT-based (via Backend)

**Backend:**
- Framework: FastAPI
- Language: Python 3.11+
- ORM: SQLModel
- AI Integration: Cohere API v2
- API Style: REST with JSON responses

**Database:**
- PostgreSQL (containerized)
- Persistent Volume Claims for data durability

---

### 5. CLOUD-NATIVE STACK (PHASE IV)

**Containerization Layer:**

| Tool | Purpose | Role |
|------|---------|------|
| Docker Desktop | Container runtime | Build and run containers locally |
| Gordon | AI-assisted containerization | Generate optimized Dockerfiles |
| Docker Compose | Local development | Multi-container orchestration for dev |

**Kubernetes Layer:**

| Tool | Purpose | Role |
|------|---------|------|
| Minikube | Local K8s cluster | Production-parity local environment |
| kubectl | Cluster CLI | Direct cluster interaction |
| kubectl-ai | AI-powered kubectl | Natural language K8s operations |
| Kagent | Kubernetes AI agent | Autonomous cluster management |

**Infrastructure-as-Code Layer:**

| Tool | Purpose | Role |
|------|---------|------|
| Helm | Package manager | Define system as charts |
| Helm Charts | Infrastructure specs | Declarative service definitions |
| Values files | Configuration | Environment-specific settings |

---

## PART III: CLOUD-NATIVE ARCHITECTURE

### 6. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                     MINIKUBE CLUSTER                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    INGRESS CONTROLLER                     │  │
│  │                 (nginx-ingress / traefik)                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         │                    │                    │             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │  FRONTEND   │     │   BACKEND   │     │  MCP SERVER │       │
│  │   SERVICE   │     │   SERVICE   │     │   SERVICE   │       │
│  │  (Next.js)  │     │  (FastAPI)  │     │   (Tools)   │       │
│  │             │     │             │     │             │       │
│  │ Replicas: 2 │     │ Replicas: 3 │     │ Replicas: 2 │       │
│  └─────────────┘     └──────┬──────┘     └─────────────┘       │
│                             │                                   │
│                             ▼                                   │
│                    ┌─────────────────┐                         │
│                    │   POSTGRESQL    │                         │
│                    │   STATEFULSET   │                         │
│                    │                 │                         │
│                    │  PVC: 10Gi     │                         │
│                    └─────────────────┘                         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              CONFIGMAPS & SECRETS                         │  │
│  │  - app-config    - db-credentials    - cohere-api-key    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   AI OPERATORS    │
                    │  kubectl-ai       │
                    │  Kagent           │
                    │  Gordon           │
                    └───────────────────┘
```

---

### 7. SERVICE DEFINITIONS

**Frontend Service:**
```yaml
Name: taskora-frontend
Type: Deployment
Replicas: 2
Port: 3000
Image: taskora/frontend:latest
Resources:
  requests: { cpu: 100m, memory: 128Mi }
  limits: { cpu: 500m, memory: 512Mi }
Health:
  livenessProbe: /api/health
  readinessProbe: /api/ready
```

**Backend Service:**
```yaml
Name: taskora-backend
Type: Deployment
Replicas: 3
Port: 8000
Image: taskora/backend:latest
Resources:
  requests: { cpu: 200m, memory: 256Mi }
  limits: { cpu: 1000m, memory: 1Gi }
Health:
  livenessProbe: /health
  readinessProbe: /ready
Environment:
  - DATABASE_URL (from Secret)
  - COHERE_API_KEY (from Secret)
  - BETTER_AUTH_SECRET (from Secret)
```

**Database Service:**
```yaml
Name: taskora-db
Type: StatefulSet
Replicas: 1
Port: 5432
Image: postgres:15-alpine
Storage: 10Gi PersistentVolumeClaim
```

---

## PART IV: CONTAINERIZATION

### 8. DOCKER & GORDON GOVERNANCE

**Containerization Principles:**

1. **AI-Assisted Dockerfile Generation**: Gordon MUST be used to generate initial Dockerfiles. Manual Dockerfile creation is discouraged.

2. **Multi-Stage Builds**: All production images MUST use multi-stage builds to minimize image size.

3. **Non-Root Execution**: All containers MUST run as non-root users.

4. **Layer Optimization**: Gordon MUST optimize layer ordering for cache efficiency.

**Gordon Usage Protocol:**
```bash
# Generate optimized Dockerfile
gordon dockerfile generate --app frontend --framework nextjs

# Analyze existing Dockerfile
gordon analyze ./Dockerfile --suggest-improvements

# Build with AI optimization
gordon build --optimize --target production
```

**Required Dockerfile Standards:**

| Requirement | Enforcement |
|-------------|-------------|
| Base image pinned to specific version | MANDATORY |
| Multi-stage build | MANDATORY for production |
| Non-root USER directive | MANDATORY |
| HEALTHCHECK instruction | MANDATORY |
| .dockerignore present | MANDATORY |
| No secrets in image layers | MANDATORY |

---

### 9. CONTAINER REGISTRY

**Local Development:**
- Images built and stored in Minikube's Docker daemon
- Command: `eval $(minikube docker-env)`

**Image Naming Convention:**
```
taskora/<service>:<version>
taskora/<service>:latest

Examples:
  taskora/frontend:1.0.0
  taskora/backend:1.0.0
  taskora/mcp-server:1.0.0
```

---

## PART V: KUBERNETES ORCHESTRATION

### 10. MINIKUBE CONFIGURATION

**Cluster Requirements:**

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPUs | 4 | 6 |
| Memory | 8GB | 12GB |
| Disk | 40GB | 60GB |
| Driver | docker | docker |

**Required Addons:**
```bash
minikube addons enable ingress
minikube addons enable metrics-server
minikube addons enable dashboard
minikube addons enable storage-provisioner
```

**Cluster Initialization:**
```bash
minikube start \
  --cpus=4 \
  --memory=8192 \
  --disk-size=40g \
  --driver=docker \
  --kubernetes-version=v1.28.0
```

---

### 11. HELM CHARTS AS INFRASTRUCTURE SPECIFICATIONS

**Chart Structure:**
```
helm/
└── taskora/
    ├── Chart.yaml              # Chart metadata
    ├── values.yaml             # Default configuration
    ├── values-dev.yaml         # Development overrides
    ├── values-prod.yaml        # Production overrides
    └── templates/
        ├── _helpers.tpl        # Template helpers
        ├── frontend/
        │   ├── deployment.yaml
        │   ├── service.yaml
        │   └── hpa.yaml
        ├── backend/
        │   ├── deployment.yaml
        │   ├── service.yaml
        │   └── hpa.yaml
        ├── database/
        │   ├── statefulset.yaml
        │   ├── service.yaml
        │   └── pvc.yaml
        ├── ingress.yaml
        ├── configmap.yaml
        └── secrets.yaml
```

**Helm Chart Principles:**

1. **Charts ARE Specifications**: Helm charts serve as the declarative specification for all infrastructure. They are NOT just deployment scripts.

2. **Values as Configuration**: All environment-specific settings MUST be in values files, never hardcoded in templates.

3. **Template Reusability**: Common patterns MUST be abstracted into `_helpers.tpl`.

4. **Validation**: All charts MUST pass `helm lint` and `helm template` validation.

**Chart Versioning:**
- Chart version follows SemVer
- App version tracks application release
- Both versions MUST be updated on changes

---

### 12. AI-DRIVEN KUBERNETES OPERATIONS

**kubectl-ai Integration:**

kubectl-ai enables natural language interaction with the Kubernetes cluster:

```bash
# Natural language queries
kubectl-ai "show me all pods that are not running"
kubectl-ai "scale the backend deployment to 5 replicas"
kubectl-ai "what's consuming the most memory in the cluster"

# Deployment operations
kubectl-ai "deploy the latest frontend image"
kubectl-ai "rollback the backend to the previous version"

# Troubleshooting
kubectl-ai "why is the backend pod crashing"
kubectl-ai "show me the logs from pods with errors"
```

**Kagent Autonomous Operations:**

Kagent operates as a fully autonomous Kubernetes agent:

| Capability | Description |
|------------|-------------|
| Health Monitoring | Continuously monitors pod health |
| Auto-Scaling | Adjusts replicas based on load |
| Self-Healing | Restarts failed containers |
| Resource Optimization | Right-sizes resource requests |
| Anomaly Detection | Identifies unusual cluster behavior |
| Incident Response | Automated remediation actions |

**Kagent Configuration:**
```yaml
apiVersion: kagent.io/v1
kind: AgentPolicy
metadata:
  name: taskora-operator
spec:
  watchNamespace: taskora
  capabilities:
    - healthMonitoring
    - autoScaling
    - selfHealing
    - resourceOptimization
  escalation:
    alertThreshold: warning
    notifyChannel: slack
  autonomy:
    level: supervised  # supervised | autonomous
    approvalRequired:
      - deleteDeployment
      - scaleToZero
```

---

## PART VI: SPEC-DRIVEN INFRASTRUCTURE

### 13. INFRASTRUCTURE SPECIFICATION PROTOCOL

**Principle:** Infrastructure follows the same Spec-Driven Development methodology as application code.

**Specification Hierarchy:**
```
specs/
├── infrastructure/
│   ├── cluster.spec.md         # Cluster requirements
│   ├── networking.spec.md      # Ingress, services, DNS
│   ├── storage.spec.md         # PVCs, storage classes
│   └── security.spec.md        # RBAC, secrets, policies
├── deployment/
│   ├── frontend.deploy.md      # Frontend deployment spec
│   ├── backend.deploy.md       # Backend deployment spec
│   └── database.deploy.md      # Database deployment spec
└── operations/
    ├── scaling.ops.md          # Scaling policies
    ├── monitoring.ops.md       # Observability requirements
    └── disaster-recovery.md    # Backup and recovery
```

**Spec-to-Manifest Flow:**
```
1. Write infrastructure specification (Markdown)
2. AI agent interprets specification
3. AI agent generates Helm values / K8s manifests
4. Human reviews generated artifacts
5. AI agent applies to cluster
6. AI agent validates deployment matches spec
```

---

### 14. CONFIGURATION MANAGEMENT

**ConfigMaps:**
```yaml
# Non-sensitive application configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: taskora-config
data:
  API_BASE_URL: "http://taskora-backend:8000"
  LOG_LEVEL: "info"
  ENABLE_METRICS: "true"
```

**Secrets Management:**
```yaml
# Sensitive data - MUST be base64 encoded
# In production, use external secrets operator
apiVersion: v1
kind: Secret
metadata:
  name: taskora-secrets
type: Opaque
data:
  DATABASE_URL: <base64>
  COHERE_API_KEY: <base64>
  BETTER_AUTH_SECRET: <base64>
```

**Secret Handling Rules:**
1. NEVER commit plaintext secrets to Git
2. Use `kubectl create secret` or sealed-secrets
3. Reference secrets via environment variables
4. Rotate secrets on compromise

---

## PART VII: AI AGENTS IN DEVOPS

### 15. AI AGENT GOVERNANCE

**Agent Hierarchy:**

| Agent | Domain | Authority Level |
|-------|--------|-----------------|
| Gordon | Containerization | Advisory + Execution |
| kubectl-ai | Cluster Operations | Supervised Execution |
| Kagent | Autonomous Operations | Policy-Bounded Autonomy |
| Spec-Master | Specification Compliance | Validation Authority |

**Agent Interaction Protocol:**

1. **Gordon** generates Dockerfiles and optimizes images
2. **kubectl-ai** receives natural language deployment commands
3. **Kagent** monitors cluster and performs autonomous operations
4. **Spec-Master** validates all changes against specifications

**Human Oversight Requirements:**

| Operation | Approval Required |
|-----------|-------------------|
| Create namespace | No |
| Deploy new version | No (if tests pass) |
| Scale up | No |
| Scale down to zero | YES |
| Delete deployment | YES |
| Modify secrets | YES |
| Change resource limits | No (within bounds) |
| Rollback | No |

---

### 16. OBSERVABILITY & MONITORING

**Required Metrics:**
- Pod CPU/Memory utilization
- Request latency (p50, p95, p99)
- Error rates by endpoint
- Database connection pool status
- Container restart counts

**Logging Standards:**
- Structured JSON logging
- Correlation IDs across services
- Log levels: DEBUG, INFO, WARN, ERROR
- Centralized via stdout/stderr

**Health Endpoints:**
```
Frontend:
  - GET /api/health → 200 OK
  - GET /api/ready  → 200 OK (when ready to serve)

Backend:
  - GET /health → 200 OK
  - GET /ready  → 200 OK (DB connected)
```

---

## PART VIII: GOVERNANCE

### 17. SUCCESS CRITERIA FOR PHASE IV

**Mandatory Achievements:**

| # | Criterion | Validation Method |
|---|-----------|-------------------|
| 1 | All services containerized | `docker images` shows all images |
| 2 | Minikube cluster operational | `kubectl get nodes` returns Ready |
| 3 | Helm charts complete | `helm lint` passes for all charts |
| 4 | All pods running | `kubectl get pods` shows Running |
| 5 | Ingress configured | Application accessible via minikube IP |
| 6 | kubectl-ai operational | Natural language commands execute |
| 7 | Kagent deployed | Agent pods running and monitoring |
| 8 | Gordon integrated | AI-generated Dockerfiles in use |
| 9 | Zero manual kubectl for deploys | All deployments via AI agents |
| 10 | Documentation complete | README covers all setup steps |

**Quality Gates:**
- All containers pass security scan
- Resource limits defined for all deployments
- Health checks passing for all services
- No hardcoded secrets in images or manifests
- Helm charts follow best practices

---

### 18. AMENDMENT PROCEDURE

**Constitution Versioning:**
- MAJOR: Architectural changes, principle removals
- MINOR: New sections, expanded guidance
- PATCH: Clarifications, typo fixes

**Amendment Process:**
1. Propose change via specification document
2. Review impact on dependent systems
3. Update constitution with new version
4. Update all affected templates
5. Commit with message: `docs: amend constitution to vX.Y.Z`

---

### 19. COMPLIANCE REVIEW

**Weekly Review Checklist:**
- [ ] All deployments match Helm chart specifications
- [ ] No manual cluster modifications outside GitOps
- [ ] AI agent logs reviewed for anomalies
- [ ] Resource utilization within defined limits
- [ ] Security scan results clean

---

## APPENDIX A: COMMAND REFERENCE

**Minikube Operations:**
```bash
minikube start          # Start cluster
minikube stop           # Stop cluster
minikube delete         # Delete cluster
minikube dashboard      # Open K8s dashboard
minikube tunnel         # Expose LoadBalancer services
```

**Helm Operations:**
```bash
helm install taskora ./helm/taskora           # Install
helm upgrade taskora ./helm/taskora           # Upgrade
helm rollback taskora 1                       # Rollback
helm uninstall taskora                        # Uninstall
helm lint ./helm/taskora                      # Validate
```

**kubectl-ai Examples:**
```bash
kubectl-ai "deploy taskora to the cluster"
kubectl-ai "show pod status for backend"
kubectl-ai "increase backend replicas to 5"
kubectl-ai "show recent errors in logs"
```

---

## APPENDIX B: FILE STRUCTURE

```
evolution-of-todos/
├── .specify/                    # Spec-Kit configuration
├── frontend/                    # Next.js application
│   └── Dockerfile              # Generated by Gordon
├── backend/                     # FastAPI application
│   └── Dockerfile              # Generated by Gordon
├── helm/                        # Helm charts
│   └── taskora/                # Main application chart
├── k8s/                         # Raw Kubernetes manifests (if needed)
├── docker-compose.yml          # Local development
├── docker-compose.prod.yml     # Production-like local
└── README.md                   # Setup documentation
```

---

==================================================
END OF CONSTITUTION — PHASE IV
==================================================

*This constitution establishes Taskora as a production-grade, AI-operated cloud platform. All development, deployment, and operational activities MUST comply with this document.*
