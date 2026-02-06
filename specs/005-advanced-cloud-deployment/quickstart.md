# Quickstart: Phase V - Advanced Cloud Deployment

**Feature**: 005-advanced-cloud-deployment
**Date**: 2026-02-04

This guide covers how to run Taskora locally and deploy to production.

---

## Prerequisites

### Required Software

| Software | Version | Installation |
|----------|---------|--------------|
| Docker Desktop | 24+ | [docker.com](https://docker.com) |
| kubectl | 1.28+ | `brew install kubectl` / `choco install kubernetes-cli` |
| Helm | 3.x | `brew install helm` / `choco install kubernetes-helm` |
| Dapr CLI | 1.13+ | [dapr.io](https://docs.dapr.io/getting-started/install-dapr-cli/) |

### Optional (for local Kubernetes)

| Software | Version | Installation |
|----------|---------|--------------|
| Minikube | 1.32+ | `brew install minikube` / `choco install minikube` |

### Cloud Accounts (for production)

- DigitalOcean account with API token
- GitHub account for Actions and Container Registry

---

## Local Development

### Option 1: Docker Compose (Recommended for Development)

**Without Dapr (lighter, faster startup):**

```bash
# Clone and enter repository
cd evolution-of-todos

# Start all services
docker-compose up

# Access application
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# Docs:     http://localhost:8000/docs
```

**With Dapr (full production parity):**

```bash
# Start with Dapr overlay
docker-compose -f docker-compose.yml -f docker-compose.dapr.yml up

# Events will flow through Redpanda
# Reminders will be checked via cron binding
```

### Option 2: Minikube (Kubernetes locally)

```bash
# Start Minikube with sufficient resources
minikube start \
  --cpus 4 \
  --memory 8192 \
  --driver docker \
  --kubernetes-version v1.28.0

# Enable addons
minikube addons enable ingress
minikube addons enable metrics-server

# Install Dapr
dapr init -k --wait

# Apply local Dapr components
kubectl apply -f dapr/components-local/

# Deploy application
helm upgrade --install taskora ./helm/taskora \
  -n taskora --create-namespace \
  -f ./helm/taskora/values-local.yaml

# Start tunnel (in separate terminal)
minikube tunnel

# Access application at http://localhost
```

### Development Workflow

```bash
# Backend development (hot reload)
cd backend
pip install -r requirements.txt
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Frontend development (hot reload)
cd frontend
npm install
npm run dev
```

---

## Production Deployment

### 1. Configure Secrets

Create GitHub repository secrets:

| Secret | Description |
|--------|-------------|
| `DIGITALOCEAN_ACCESS_TOKEN` | DO API token |
| `DOCKERHUB_USERNAME` | Docker Hub username (or use GHCR) |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `DATABASE_URL` | PostgreSQL connection string |
| `COHERE_API_KEY` | Cohere API key |
| `BETTER_AUTH_SECRET` | Auth secret (random 32 chars) |

### 2. Create DOKS Cluster

```bash
# Using doctl CLI
doctl kubernetes cluster create taskora-prod \
  --region nyc1 \
  --node-pool "name=worker;size=s-2vcpu-4gb;count=3"

# Or via DigitalOcean Console
```

### 3. Install Dapr on Cluster

```bash
# Initialize Dapr in Kubernetes
dapr init -k --wait

# Verify installation
dapr status -k
```

### 4. Deploy with Helm

```bash
# Add secrets to Kubernetes
kubectl create namespace taskora
kubectl create secret generic taskora-secrets \
  -n taskora \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=COHERE_API_KEY="$COHERE_API_KEY" \
  --from-literal=BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET"

# Apply Dapr components
kubectl apply -f dapr/components/ -n taskora

# Deploy application
helm upgrade --install taskora ./helm/taskora \
  -n taskora \
  -f ./helm/taskora/values-prod.yaml \
  --set ingress.host=taskora.yourdomain.com
```

### 5. CI/CD (Automated)

After initial setup, deployments are automated:

1. **Pull Request** → CI runs tests and linting
2. **Merge to main** → Build images, push to registry
3. **Build success** → Deploy to production cluster

---

## Verification

### Local Verification

```bash
# Check services
docker-compose ps

# Test API
curl http://localhost:8000/health
curl http://localhost:8000/ready

# Create a task
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task", "priority": "high"}'
```

### Production Verification

```bash
# Check pods
kubectl get pods -n taskora

# Check Dapr status
dapr status -k

# View logs
kubectl logs -l app.kubernetes.io/name=taskora-backend -n taskora -f

# Test health
curl https://api.taskora.yourdomain.com/health
```

---

## Troubleshooting

### Docker Compose Issues

```bash
# View logs
docker-compose logs -f backend

# Rebuild images
docker-compose build --no-cache

# Reset everything
docker-compose down -v
docker-compose up --build
```

### Kubernetes Issues

```bash
# Describe failing pod
kubectl describe pod <pod-name> -n taskora

# Check Dapr sidecar logs
kubectl logs <pod-name> -c daprd -n taskora

# Check Dapr components
kubectl get components -n taskora

# Restart deployment
kubectl rollout restart deployment taskora-backend -n taskora
```

### Dapr Issues

```bash
# Check Dapr dashboard
dapr dashboard -k -p 9999

# Verify pub/sub
dapr publish --pubsub pubsub --topic task-events --data '{"test": true}'

# Check state store
dapr invoke --app-id taskora-backend --method health
```

---

## Environment Variables

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `COHERE_API_KEY` | Yes | Cohere API key |
| `REDIS_URL` | No | Redis URL (default: redis://redis:6379) |
| `DAPR_HTTP_PORT` | No | Dapr sidecar port (auto-detected) |
| `LOG_LEVEL` | No | Logging level (default: INFO) |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |
| `NEXT_PUBLIC_WS_URL` | No | WebSocket URL for real-time |

---

## Success Criteria Validation

| Criterion | Command |
|-----------|---------|
| Deploy < 5 min | `time helm upgrade --install ...` |
| Sync < 2s | Open two tabs, create task, observe sync |
| Recurring < 1 min | Complete recurring task, wait for new instance |
| Reminder < 60s | Set reminder 1 min ahead, verify notification |
| Local < 3 min | `time docker-compose up` |

---

## Validation Scripts

### Success Criteria Validation

```bash
# Validate all 10 success criteria
./scripts/validate-success-criteria.sh

# With custom API URL
API_URL=https://api.taskora.app ./scripts/validate-success-criteria.sh
```

### E2E Test

```bash
# Run full end-to-end test suite
./scripts/e2e-test.sh

# Against production
./scripts/e2e-test.sh --api-url https://api.taskora.app --token $AUTH_TOKEN
```

---

## Phase V Complete

All 49 tasks have been implemented across 8 phases:

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Setup & Gap Validation | ✅ Complete |
| 2 | Dapr Cron Bindings | ✅ Complete |
| 3 | US1: Production Deploy | ✅ Complete |
| 4 | US2: Event-Driven Updates | ✅ Complete |
| 5 | US5: Local Dev Parity | ✅ Complete |
| 6 | US6: CI/CD Pipeline | ✅ Complete |
| 7 | US7: Observability | ✅ Complete |
| 8 | Polish & Documentation | ✅ Complete |

### Key Deliverables

- **Production**: DOKS cluster, Helm charts, TLS, auto-scaling
- **Events**: Redpanda, Dapr pub/sub, SSE real-time sync
- **CI/CD**: GitHub Actions (ci, build, deploy, staging, rollback)
- **Observability**: Health endpoints, structured logging, metrics
- **Documentation**: Deployment guide, monitoring guide, ADRs
