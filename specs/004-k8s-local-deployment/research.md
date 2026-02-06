# Research: Phase IV — Local Kubernetes Deployment

**Feature**: 001-k8s-local-deployment
**Date**: 2026-01-22
**Status**: Complete

---

## 1. Dockerfile Best Practices for Next.js

### Decision: Multi-stage build with standalone output

### Rationale
Next.js 16 supports standalone output mode which creates a minimal production deployment. Combined with multi-stage builds, this achieves the smallest possible image size.

### Research Findings

**Recommended Approach:**
```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

**Key Optimizations:**
- Alpine base image (~50MB vs ~350MB for debian)
- Three-stage build separates deps, build, and runtime
- Standalone output mode reduces bundle size
- Non-root user (nextjs:nodejs)
- HEALTHCHECK instruction for Kubernetes probes

**next.config.ts requirement:**
```typescript
output: 'standalone'
```

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Single-stage build | Image size 800MB+, includes dev dependencies |
| Nginx static serving | Loses SSR capabilities, API routes won't work |
| Distroless base | No shell for debugging, wget unavailable for health checks |

---

## 2. Dockerfile Best Practices for FastAPI/Uvicorn

### Decision: Multi-stage build with slim Python image

### Rationale
Python applications benefit from multi-stage builds to separate dependency installation from runtime. Slim images reduce attack surface and size.

### Research Findings

**Recommended Approach:**
```dockerfile
# Stage 1: Build dependencies
FROM python:3.11-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Production
FROM python:3.11-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 1001 appgroup \
    && useradd --system --uid 1001 --gid appgroup appuser

COPY --from=builder /root/.local /home/appuser/.local
COPY ./src ./src
COPY ./alembic ./alembic
COPY ./alembic.ini .

ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

USER appuser
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Key Optimizations:**
- Two-stage build (builder + runner)
- Slim base reduces image size by ~400MB vs full Python
- Build dependencies only in builder stage
- Non-root user (appuser:appgroup)
- HEALTHCHECK using curl to /health endpoint
- PYTHONUNBUFFERED for proper log streaming

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Full python:3.11 image | 900MB+ image size |
| Alpine Python | Compilation issues with psycopg2, musl libc incompatibilities |
| Poetry for deps | Added complexity for minimal benefit in Docker context |

---

## 3. Helm Chart Structure Patterns

### Decision: Umbrella chart with subcharts pattern

### Rationale
Single chart with organized template directories provides atomic deployment while maintaining clear separation between services.

### Research Findings

**Recommended Structure:**
```
helm/taskora/
├── Chart.yaml              # Chart metadata
├── values.yaml             # Default values
├── values-dev.yaml         # Development overrides
├── values-prod.yaml        # Production overrides
├── templates/
│   ├── NOTES.txt           # Post-install instructions
│   ├── _helpers.tpl        # Template helpers
│   ├── namespace.yaml      # Namespace creation
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── hpa.yaml        # Optional HPA
│   ├── backend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── hpa.yaml
│   ├── database/
│   │   ├── statefulset.yaml
│   │   ├── service.yaml
│   │   └── pvc.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   └── ingress.yaml
└── .helmignore
```

**Chart.yaml template:**
```yaml
apiVersion: v2
name: taskora
description: Cloud-Native AI Todo Platform
type: application
version: 1.0.0
appVersion: "4.0.0"
keywords:
  - todo
  - ai
  - kubernetes
maintainers:
  - name: Taskora Team
```

**Helper functions (_helpers.tpl):**
```yaml
{{- define "taskora.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "taskora.labels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "taskora.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
```

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Separate charts per service | Coordination complexity for local development |
| Kustomize overlays | Less mature tooling, no native templating |
| Raw kubectl manifests | No templating, no release management |

---

## 4. Minikube Ingress Configuration

### Decision: NGINX Ingress Controller with path-based routing

### Rationale
Minikube's built-in NGINX ingress addon provides the simplest path to external access with path-based routing for multiple services.

### Research Findings

**Setup Commands:**
```bash
# Enable ingress addon
minikube addons enable ingress

# Verify ingress controller is running
kubectl get pods -n ingress-nginx

# Get Minikube IP
minikube ip
```

**Ingress Resource:**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: taskora-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
spec:
  ingressClassName: nginx
  rules:
    - host: taskora.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: taskora-frontend
                port:
                  number: 3000
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: taskora-backend
                port:
                  number: 8000
```

**Local DNS Setup (Windows):**
```
# Add to C:\Windows\System32\drivers\etc\hosts
<minikube-ip> taskora.local
```

**Access Methods:**
1. `minikube tunnel` - Creates LoadBalancer access
2. `minikube service <name> --url` - Port forwarding
3. NodePort services - Direct node access

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Traefik Ingress | Additional installation required |
| Ambassador | Overkill for local development |
| Port forwarding only | No ingress testing, doesn't match production |

---

## 5. kubectl-ai Installation and Configuration

### Decision: Install via Homebrew/binary with OpenAI/Cohere backend

### Rationale
kubectl-ai provides natural language interface to Kubernetes, aligning with AI-First Operations principle from constitution.

### Research Findings

**Installation:**
```bash
# macOS/Linux via Homebrew
brew install sozercan/tap/kubectl-ai

# Windows via Scoop
scoop bucket add kubectl-ai https://github.com/sozercan/scoop-bucket.git
scoop install kubectl-ai

# Or download binary from GitHub releases
# https://github.com/sozercan/kubectl-ai/releases
```

**Configuration:**
```bash
# Set OpenAI API key (or other supported LLM)
export OPENAI_API_KEY="your-api-key"

# Or use local LLM via Ollama
export KUBECTL_AI_BACKEND=ollama
export OLLAMA_HOST=http://localhost:11434
```

**Usage Examples:**
```bash
# Query cluster state
kubectl-ai "list all pods that are not running"
kubectl-ai "show me the logs from the backend pod"

# Perform operations
kubectl-ai "scale the backend deployment to 3 replicas"
kubectl-ai "restart all pods in the taskora namespace"

# Troubleshooting
kubectl-ai "why is the database pod failing"
kubectl-ai "show me events for the frontend deployment"
```

**Best Practices:**
- Review generated commands before execution
- Use `--dry-run` flag for verification
- Set appropriate rate limits for LLM calls

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| k9s | Not AI-powered, requires manual navigation |
| Lens | GUI-based, not scriptable |
| Plain kubectl | Requires memorizing complex syntax |

---

## 6. Gordon CLI for Dockerfile Generation

### Decision: Use Gordon for initial Dockerfile generation with manual review

### Rationale
Gordon (Docker AI Agent) can generate optimized Dockerfiles following best practices, reducing manual effort while maintaining quality.

### Research Findings

**Installation:**
```bash
# Gordon is part of Docker Desktop AI features
# Enable in Docker Desktop Settings > Features > AI

# Or install standalone CLI
docker run -it --rm docker/gordon:latest
```

**Usage Commands:**
```bash
# Generate Dockerfile for a project
gordon dockerfile generate --path ./frontend --framework nextjs

# Analyze existing Dockerfile
gordon analyze ./backend/Dockerfile

# Suggest improvements
gordon optimize ./Dockerfile --target production

# Build with AI assistance
gordon build --context ./frontend --tag taskora/frontend:latest
```

**Integration Workflow:**
1. Run Gordon to generate initial Dockerfile
2. Review and validate generated file
3. Test build locally
4. Commit to version control
5. Use Gordon analyze for ongoing improvements

**Gordon Capabilities:**
- Multi-stage build generation
- Layer optimization suggestions
- Security scanning recommendations
- Base image selection guidance
- Build cache optimization

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Manual Dockerfile writing | More time-consuming, may miss optimizations |
| Dockerfile linters only | Don't generate, only validate existing |
| AI code assistants (generic) | Less Docker-specific knowledge |

---

## 7. Kagent Deployment Requirements

### Decision: Deploy Kagent as namespace-scoped operator

### Rationale
Kagent provides autonomous Kubernetes management capabilities, implementing the AI-First Operations principle with appropriate human oversight.

### Research Findings

**Installation:**
```bash
# Install Kagent CRDs
kubectl apply -f https://github.com/kagent-dev/kagent/releases/latest/download/kagent-crds.yaml

# Deploy Kagent operator
kubectl apply -f https://github.com/kagent-dev/kagent/releases/latest/download/kagent-operator.yaml

# Or via Helm
helm repo add kagent https://kagent-dev.github.io/charts
helm install kagent kagent/kagent --namespace kagent-system --create-namespace
```

**AgentPolicy Configuration:**
```yaml
apiVersion: kagent.io/v1alpha1
kind: AgentPolicy
metadata:
  name: taskora-agent
  namespace: taskora
spec:
  # Watch only taskora namespace
  scope:
    namespaces:
      - taskora

  # Enabled capabilities
  capabilities:
    - name: healthMonitoring
      enabled: true
    - name: autoRestart
      enabled: true
      config:
        maxRestarts: 3
        cooldownPeriod: 60s
    - name: resourceMonitoring
      enabled: true
    - name: logAnalysis
      enabled: true

  # Autonomy level
  autonomy:
    level: supervised  # supervised | autonomous
    requireApproval:
      - deleteDeployment
      - scaleToZero
      - modifySecrets

  # Alerting
  alerting:
    enabled: true
    channels:
      - type: slack
        webhook: ${SLACK_WEBHOOK_URL}
```

**Kagent Capabilities:**
| Capability | Description | Default |
|------------|-------------|---------|
| healthMonitoring | Watch pod health status | Enabled |
| autoRestart | Restart failed containers | Enabled |
| autoScale | Adjust replicas based on metrics | Disabled (requires HPA) |
| resourceOptimization | Right-size resource requests | Disabled |
| logAnalysis | Detect errors in logs | Enabled |
| anomalyDetection | Identify unusual patterns | Enabled |

**Security Considerations:**
- RBAC should limit Kagent to specific namespaces
- Approval workflows for destructive operations
- Audit logging for all agent actions

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Manual monitoring | Doesn't satisfy AI-First Operations principle |
| Prometheus + Alertmanager only | No autonomous remediation |
| Custom operators | Significant development effort |

---

## 8. PostgreSQL in Kubernetes

### Decision: StatefulSet with PersistentVolumeClaim

### Rationale
Local PostgreSQL deployment enables testing of the complete stack including data persistence, matching production topology.

### Research Findings

**StatefulSet Configuration:**
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: taskora-db
spec:
  serviceName: taskora-db
  replicas: 1
  selector:
    matchLabels:
      app: taskora-db
  template:
    metadata:
      labels:
        app: taskora-db
    spec:
      containers:
        - name: postgres
          image: postgres:15-alpine
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_DB
              value: taskora
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: taskora-db-credentials
                  key: username
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: taskora-db-credentials
                  key: password
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
          livenessProbe:
            exec:
              command: ["pg_isready", "-U", "postgres"]
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            exec:
              command: ["pg_isready", "-U", "postgres"]
            initialDelaySeconds: 5
            periodSeconds: 5
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
```

**PVC for Minikube:**
```yaml
# Minikube provides default storage class
storageClassName: standard
```

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| External Neon DB | Doesn't test persistence layer |
| Helm PostgreSQL chart | Added complexity for single-node setup |
| SQLite | Not production-representative |

---

## Summary of Decisions

| Topic | Decision | Confidence |
|-------|----------|------------|
| Frontend Dockerfile | Multi-stage with standalone output | High |
| Backend Dockerfile | Multi-stage with slim Python | High |
| Helm Structure | Umbrella chart pattern | High |
| Ingress | NGINX via Minikube addon | High |
| kubectl-ai | Install via package manager | Medium |
| Gordon | Use for initial Dockerfile generation | Medium |
| Kagent | Deploy as namespace-scoped operator | Medium |
| Database | StatefulSet with PVC | High |

---

## References

1. Next.js Dockerfile Examples: https://github.com/vercel/next.js/tree/canary/examples/with-docker
2. FastAPI Docker Guide: https://fastapi.tiangolo.com/deployment/docker/
3. Helm Best Practices: https://helm.sh/docs/chart_best_practices/
4. Minikube Ingress: https://kubernetes.io/docs/tasks/access-application-cluster/ingress-minikube/
5. kubectl-ai GitHub: https://github.com/sozercan/kubectl-ai
6. Gordon Documentation: https://docs.docker.com/gordon/
7. Kagent Documentation: https://kagent.dev/docs
