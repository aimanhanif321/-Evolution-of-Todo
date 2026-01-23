# Kubernetes Deployment Guide for Taskora

This guide covers deploying Taskora to a local Kubernetes cluster using Minikube.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Minikube](https://minikube.sigs.k8s.io/docs/start/) installed
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
- [Helm](https://helm.sh/docs/intro/install/) v3.x installed

## Quick Start

### 1. Start Minikube

```bash
# Run the setup script
./k8s/minikube-setup.sh

# Or manually:
minikube start --driver=docker --cpus=4 --memory=8192
minikube addons enable ingress
```

### 2. Configure Docker Environment

Point your shell to Minikube's Docker daemon:

```bash
# Linux/macOS
eval $(minikube docker-env)

# Windows PowerShell
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Windows CMD
@FOR /f "tokens=*" %i IN ('minikube -p minikube docker-env --shell cmd') DO @%i
```

### 3. Build Container Images

```bash
# Build frontend image
docker build -t taskora/frontend:latest ./frontend

# Build backend image
docker build -t taskora/backend:latest ./backend
```

### 4. Create Namespace and Secrets

```bash
# Create namespace
kubectl create namespace taskora

# Create database credentials secret
kubectl create secret generic taskora-db-credentials \
  --from-literal=password=your-secure-password \
  -n taskora

# Create application secrets
kubectl create secret generic taskora-secrets \
  --from-literal=DATABASE_URL=postgresql://taskora:your-secure-password@taskora-database:5432/taskora \
  --from-literal=COHERE_API_KEY=your-cohere-api-key \
  --from-literal=BETTER_AUTH_SECRET=your-auth-secret \
  --from-literal=GEMINI_API_KEY=your-gemini-api-key \
  -n taskora
```

### 5. Deploy with Helm

```bash
# Development deployment
helm install taskora ./helm/taskora -n taskora -f ./helm/taskora/values-dev.yaml

# Production deployment
helm install taskora ./helm/taskora -n taskora -f ./helm/taskora/values-prod.yaml
```

### 6. Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n taskora

# Expected output (all should show Running):
# NAME                                  READY   STATUS    RESTARTS   AGE
# taskora-frontend-xxx                  1/1     Running   0          1m
# taskora-backend-xxx                   1/1     Running   0          1m
# taskora-database-0                    1/1     Running   0          1m
```

### 7. Access the Application

```bash
# Get Minikube IP
minikube ip

# Add to /etc/hosts (Linux/macOS) or C:\Windows\System32\drivers\etc\hosts (Windows)
# <minikube-ip> taskora.local

# Or use Minikube tunnel
minikube tunnel
```

Then visit: http://taskora.local

## Useful Commands

### Viewing Logs

```bash
# Frontend logs
kubectl logs -l app.kubernetes.io/component=frontend -n taskora -f

# Backend logs
kubectl logs -l app.kubernetes.io/component=backend -n taskora -f

# Database logs
kubectl logs -l app.kubernetes.io/component=database -n taskora -f
```

### Scaling

```bash
# Scale backend replicas
kubectl scale deployment taskora-backend --replicas=5 -n taskora
```

### Helm Operations

```bash
# Upgrade deployment
helm upgrade taskora ./helm/taskora -n taskora -f ./helm/taskora/values-dev.yaml

# View release status
helm status taskora -n taskora

# Uninstall
helm uninstall taskora -n taskora
```

### Port Forwarding (Alternative to Ingress)

```bash
# Frontend
kubectl port-forward svc/taskora-frontend 3000:3000 -n taskora

# Backend API
kubectl port-forward svc/taskora-backend 8000:8000 -n taskora

# Database (for debugging)
kubectl port-forward svc/taskora-database 5432:5432 -n taskora
```

## PVC Verification Procedure

To verify that data persists across pod restarts:

### 1. Check PVC Status

```bash
kubectl get pvc -n taskora
# Should show Bound status for database PVC
```

### 2. Create Test Data

```bash
# Connect to database
kubectl exec -it taskora-database-0 -n taskora -- psql -U taskora -d taskora

# Create test data
INSERT INTO users (email, name) VALUES ('test@example.com', 'Test User');
SELECT * FROM users;
\q
```

### 3. Delete Pod and Verify

```bash
# Delete the database pod
kubectl delete pod taskora-database-0 -n taskora

# Wait for pod to restart
kubectl get pods -n taskora -w

# Verify data persists
kubectl exec -it taskora-database-0 -n taskora -- psql -U taskora -d taskora -c "SELECT * FROM users;"
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n taskora

# Check resource constraints
kubectl top pods -n taskora
```

### Database Connection Issues

```bash
# Verify database is ready
kubectl exec -it taskora-database-0 -n taskora -- pg_isready -U taskora

# Check database logs
kubectl logs taskora-database-0 -n taskora
```

### Ingress Not Working

```bash
# Verify ingress controller is running
kubectl get pods -n ingress-nginx

# Check ingress resource
kubectl describe ingress taskora -n taskora
```

## AI Tools Integration (Optional)

### Gordon - AI-Assisted Dockerfile Generation

```bash
# Install Gordon (Docker Desktop extension)
# https://www.docker.com/products/ai-tools/

# Analyze Dockerfiles
docker ai analyze frontend/Dockerfile
docker ai analyze backend/Dockerfile
```

### kubectl-ai - Natural Language Kubernetes Operations

```bash
# Install kubectl-ai
# https://github.com/sozercan/kubectl-ai

# Example queries
kubectl-ai "show me all pods that are not running"
kubectl-ai "scale the backend deployment to 5 replicas"
kubectl-ai "show me recent errors in the logs"
```

### Kagent - Autonomous Cluster Management

Kagent is enabled via Helm values when `kagent.enabled: true`. It provides:
- Automatic health monitoring
- Self-healing pod restarts
- Resource monitoring and alerts
- Log analysis for anomaly detection

## Environment Files

| File | Purpose |
|------|---------|
| `helm/taskora/values.yaml` | Default values |
| `helm/taskora/values-dev.yaml` | Development overrides |
| `helm/taskora/values-prod.yaml` | Production settings |
