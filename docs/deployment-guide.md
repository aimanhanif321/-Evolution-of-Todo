# Deployment Guide: Phase V - Taskora Cloud Deployment

**Version**: 5.0.0
**Date**: 2026-02-04
**Target**: DigitalOcean Kubernetes Service (DOKS)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Overview](#infrastructure-overview)
3. [Initial Setup](#initial-setup)
4. [Deployment Steps](#deployment-steps)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Required Tools

| Tool | Version | Installation |
|------|---------|--------------|
| doctl | 1.100+ | `brew install doctl` / `choco install doctl` |
| kubectl | 1.28+ | `brew install kubectl` / `choco install kubernetes-cli` |
| helm | 3.13+ | `brew install helm` / `choco install kubernetes-helm` |
| dapr CLI | 1.13+ | [dapr.io/getting-started](https://docs.dapr.io/getting-started/install-dapr-cli/) |

### Cloud Accounts

- **DigitalOcean**: Account with API token (scopes: read/write for Kubernetes)
- **GitHub**: Repository access with Actions enabled

### GitHub Secrets Required

See [github-secrets.md](./github-secrets.md) for the complete list of required secrets.

---

## Infrastructure Overview

### Architecture

```
                    ┌─────────────────────────────────────┐
                    │         NGINX Ingress               │
                    │    (TLS via cert-manager)           │
                    └─────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
            ┌───────────────┐               ┌───────────────┐
            │   Frontend    │               │   Backend     │
            │   (Next.js)   │               │   (FastAPI)   │
            │   + Dapr      │               │   + Dapr      │
            └───────────────┘               └───────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
            ┌───────────────┐               ┌───────────────┐
            │   Redpanda    │               │   PostgreSQL  │
            │   (Kafka)     │               │   (Managed)   │
            └───────────────┘               └───────────────┘
```

### Components

| Component | Type | Replicas | Description |
|-----------|------|----------|-------------|
| Frontend | Deployment | 2 | Next.js UI with Dapr sidecar |
| Backend | Deployment | 2 | FastAPI with Dapr sidecar |
| Redpanda | StatefulSet | 1 | Kafka-compatible event broker |
| PostgreSQL | External | N/A | DigitalOcean Managed Database |

### Dapr Components

| Component | Type | Purpose |
|-----------|------|---------|
| taskora-pubsub | pubsub.kafka | Event streaming via Redpanda |
| taskora-statestore | state.postgresql | State persistence |
| taskora-secrets | secretstores.kubernetes | Kubernetes secrets access |

---

## Initial Setup

### 1. Create DOKS Cluster

```bash
# Option A: Use the provided script
./scripts/create-cluster.sh

# Option B: Manual creation
doctl kubernetes cluster create taskora-cluster \
  --region nyc1 \
  --node-pool "name=worker-pool;size=s-2vcpu-4gb;count=3" \
  --version 1.28.2-do.0 \
  --wait

# Save kubeconfig
doctl kubernetes cluster kubeconfig save taskora-cluster
```

### 2. Install Dapr

```bash
# Initialize Dapr on the cluster
dapr init -k --wait

# Verify installation
dapr status -k
```

### 3. Create Namespace and Secrets

```bash
# Create namespace
kubectl create namespace taskora

# Create secrets (replace with actual values)
kubectl create secret generic taskora-secrets \
  -n taskora \
  --from-literal=DATABASE_URL="postgresql://user:pass@host:5432/taskora" \
  --from-literal=COHERE_API_KEY="your-cohere-key" \
  --from-literal=BETTER_AUTH_SECRET="your-auth-secret-32-chars"
```

### 4. Apply Dapr Components

```bash
# Apply production Dapr components
kubectl apply -f dapr/components/ -n taskora
```

---

## Deployment Steps

### Manual Deployment

```bash
# Deploy with Helm
helm upgrade --install taskora ./helm/taskora \
  -n taskora \
  -f ./helm/taskora/values-prod.yaml \
  --wait \
  --timeout 10m

# Verify pods
kubectl get pods -n taskora

# Check ingress
kubectl get ingress -n taskora
```

### Automated Deployment (CI/CD)

Deployment is automated via GitHub Actions:

1. **Push to main** triggers build workflow
2. **Build success** triggers deploy workflow
3. Helm upgrade runs automatically
4. **Failure** triggers automatic rollback

---

## CI/CD Pipeline

### Workflows

| Workflow | Trigger | Description |
|----------|---------|-------------|
| CI | PR, Push to main | Lint, test, build check |
| Build | Push to main, tags | Build and push Docker images |
| Deploy | Build success | Deploy to DOKS via Helm |

### Pipeline Flow

```
PR opened → CI runs (lint, test)
    ↓
Merge to main → Build images → Push to GHCR
    ↓
Build success → Deploy to DOKS → Verify health
    ↓
Failure → Auto-rollback to previous release
```

---

## Verification

### Health Checks

```bash
# Check all pods are running
kubectl get pods -n taskora -l app.kubernetes.io/instance=taskora

# Check Dapr sidecars
kubectl get pods -n taskora -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].name}{"\n"}{end}'

# Test health endpoint
curl https://api.taskora.app/health

# Test readiness
curl https://api.taskora.app/ready
```

### Dapr Verification

```bash
# Check Dapr status
dapr status -k

# View Dapr dashboard (local port forward)
dapr dashboard -k -p 9999

# Check pub/sub component
kubectl get component taskora-pubsub -n taskora -o yaml
```

### Application Verification

```bash
# Create a test task via API
curl -X POST https://api.taskora.app/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task", "priority": "high"}'

# List tasks
curl https://api.taskora.app/api/tasks
```

---

## Troubleshooting

### Common Issues

#### Pods Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n taskora

# Check logs
kubectl logs <pod-name> -n taskora

# Check Dapr sidecar logs
kubectl logs <pod-name> -c daprd -n taskora
```

#### Dapr Component Errors

```bash
# List components
kubectl get components -n taskora

# Describe component
kubectl describe component taskora-pubsub -n taskora
```

#### Database Connection Issues

```bash
# Check secret exists
kubectl get secret taskora-secrets -n taskora

# Verify DATABASE_URL (base64 decoded)
kubectl get secret taskora-secrets -n taskora -o jsonpath='{.data.DATABASE_URL}' | base64 -d
```

### Logs

```bash
# Backend logs
kubectl logs -l app.kubernetes.io/name=taskora-backend -n taskora -f

# Frontend logs
kubectl logs -l app.kubernetes.io/name=taskora-frontend -n taskora -f

# All Dapr sidecar logs
kubectl logs -l dapr.io/app-id -n taskora -c daprd -f
```

---

## Rollback Procedures

### Automatic Rollback

The deploy workflow automatically rolls back on failure:

```yaml
rollback:
  if: failure()
  steps:
    - run: helm rollback taskora -n taskora --wait
```

### Manual Rollback

```bash
# List releases
helm history taskora -n taskora

# Rollback to previous release
helm rollback taskora -n taskora

# Rollback to specific revision
helm rollback taskora 3 -n taskora
```

### Emergency Recovery

```bash
# Delete and redeploy
helm uninstall taskora -n taskora
helm install taskora ./helm/taskora -n taskora -f ./helm/taskora/values-prod.yaml

# Or restart deployments
kubectl rollout restart deployment/taskora-backend -n taskora
kubectl rollout restart deployment/taskora-frontend -n taskora
```

---

## Success Criteria

| Criterion | Target | Verification |
|-----------|--------|--------------|
| Deploy time | < 5 min | `time helm upgrade` |
| Pod health | All Ready | `kubectl get pods` |
| TLS | Valid cert | Browser or curl |
| Health endpoint | 200 OK | `curl /health` |
| Dapr sidecars | Injected | Pod container count |

---

## Related Documentation

- [Architecture Overview](./architecture.md)
- [GitHub Secrets Setup](./github-secrets.md)
- [Dapr Debugging Guide](./dapr-debugging.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [Local Development](./local-dev.md)
