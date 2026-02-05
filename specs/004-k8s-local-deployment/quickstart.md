# Quickstart Guide: Phase IV — Local Kubernetes Deployment

**Feature**: 001-k8s-local-deployment
**Date**: 2026-01-22
**Estimated Setup Time**: 30-45 minutes

---

## Prerequisites

Before starting, ensure you have the following installed:

| Tool | Minimum Version | Installation |
|------|-----------------|--------------|
| Docker Desktop | 4.25+ | [docker.com/products/docker-desktop](https://docker.com/products/docker-desktop) |
| Minikube | 1.32+ | `choco install minikube` (Windows) / `brew install minikube` (macOS) |
| Helm | 3.13+ | `choco install kubernetes-helm` / `brew install helm` |
| kubectl | 1.28+ | Bundled with Docker Desktop |
| kubectl-ai | Latest | `brew install sozercan/tap/kubectl-ai` |

**System Requirements:**
- CPU: 4+ cores (6 recommended)
- RAM: 8GB+ (12GB recommended)
- Disk: 40GB+ free space
- OS: Windows 10/11, macOS 12+, or Linux

---

## Step 1: Start Minikube Cluster

```bash
# Start Minikube with recommended resources
minikube start \
  --cpus=4 \
  --memory=8192 \
  --disk-size=40g \
  --driver=docker \
  --kubernetes-version=v1.28.0

# Verify cluster is running
kubectl cluster-info

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server
minikube addons enable dashboard
minikube addons enable storage-provisioner

# Verify addons
minikube addons list | grep enabled
```

**Expected Output:**
```
Kubernetes control plane is running at https://192.168.49.2:8443
CoreDNS is running at https://192.168.49.2:8443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

---

## Step 2: Configure Docker for Minikube

```bash
# Point Docker CLI to Minikube's Docker daemon
# Windows (PowerShell)
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# macOS/Linux
eval $(minikube docker-env)

# Verify connection
docker images
```

This allows building images directly into Minikube without pushing to a registry.

---

## Step 3: Build Container Images

### Frontend (Next.js)

```bash
# Navigate to frontend directory
cd frontend

# Build the image
docker build -t taskora/frontend:latest .

# Verify image
docker images | grep taskora/frontend
```

**Expected:** Image size < 500MB

### Backend (FastAPI)

```bash
# Navigate to backend directory
cd ../backend

# Build the image
docker build -t taskora/backend:latest .

# Verify image
docker images | grep taskora/backend
```

**Expected:** Image size < 1GB

---

## Step 4: Create Namespace and Secrets

```bash
# Create namespace
kubectl create namespace taskora

# Create database credentials secret
kubectl create secret generic taskora-db-credentials \
  --namespace taskora \
  --from-literal=username=taskora \
  --from-literal=password=your-secure-password-here

# Create application secrets
kubectl create secret generic taskora-secrets \
  --namespace taskora \
  --from-literal=DATABASE_URL="postgresql://taskora:your-secure-password-here@taskora-db:5432/taskora" \
  --from-literal=COHERE_API_KEY="your-cohere-api-key" \
  --from-literal=BETTER_AUTH_SECRET="your-jwt-secret-key" \
  --from-literal=GEMINI_API_KEY="your-gemini-api-key"

# Verify secrets
kubectl get secrets -n taskora
```

---

## Step 5: Deploy with Helm

```bash
# Navigate to repository root
cd /path/to/evolution-of-todos

# Lint chart (optional but recommended)
helm lint ./helm/taskora

# Install Taskora
helm install taskora ./helm/taskora \
  --namespace taskora \
  --values ./helm/taskora/values.yaml

# Watch deployment progress
kubectl get pods -n taskora -w
```

**Expected Output (after ~2-3 minutes):**
```
NAME                                READY   STATUS    RESTARTS   AGE
taskora-backend-xxx-yyy             1/1     Running   0          2m
taskora-backend-xxx-zzz             1/1     Running   0          2m
taskora-backend-xxx-www             1/1     Running   0          2m
taskora-db-0                        1/1     Running   0          2m
taskora-frontend-xxx-aaa            1/1     Running   0          2m
taskora-frontend-xxx-bbb            1/1     Running   0          2m
```

---

## Step 6: Configure Local DNS

### Windows

1. Open Notepad as Administrator
2. Open file: `C:\Windows\System32\drivers\etc\hosts`
3. Add the following line:
   ```
   <minikube-ip> taskora.local
   ```
   Replace `<minikube-ip>` with output from `minikube ip`

### macOS/Linux

```bash
# Get Minikube IP
MINIKUBE_IP=$(minikube ip)

# Add to /etc/hosts (requires sudo)
echo "$MINIKUBE_IP taskora.local" | sudo tee -a /etc/hosts
```

---

## Step 7: Access the Application

### Option A: Via Ingress (recommended)

```bash
# Verify ingress is configured
kubectl get ingress -n taskora

# Open in browser
open http://taskora.local  # macOS
start http://taskora.local  # Windows
```

### Option B: Via Minikube Tunnel

```bash
# Start tunnel (keep running in separate terminal)
minikube tunnel

# Access via localhost
open http://localhost:3000
```

### Option C: Via Port Forward

```bash
# Forward frontend
kubectl port-forward svc/taskora-frontend 3000:3000 -n taskora &

# Forward backend (for API testing)
kubectl port-forward svc/taskora-backend 8000:8000 -n taskora &

# Access
open http://localhost:3000
```

---

## Step 8: Verify Deployment

Run these commands to verify everything is working:

```bash
# Check all pods are running
kubectl get pods -n taskora

# Check services
kubectl get svc -n taskora

# Check ingress
kubectl get ingress -n taskora

# Check Helm release
helm status taskora -n taskora

# View application logs
kubectl logs -l app=taskora-backend -n taskora --tail=50

# Test backend health
kubectl exec -it deploy/taskora-backend -n taskora -- curl localhost:8000/health

# Test database connectivity
kubectl exec -it taskora-db-0 -n taskora -- pg_isready -U taskora
```

---

## Step 9: Run Database Migrations

```bash
# Run Alembic migrations
kubectl exec -it deploy/taskora-backend -n taskora -- \
  alembic upgrade head

# Verify database tables
kubectl exec -it taskora-db-0 -n taskora -- \
  psql -U taskora -d taskora -c "\dt"
```

---

## Step 10: Test AI Operations (Optional)

### kubectl-ai

```bash
# Set up kubectl-ai (requires OpenAI API key)
export OPENAI_API_KEY="your-openai-api-key"

# Natural language queries
kubectl-ai "show me all pods in taskora namespace"
kubectl-ai "what's the status of the backend deployment"
kubectl-ai "show me recent logs from pods with errors"
```

### Gordon (Docker AI)

```bash
# Analyze Dockerfiles
docker run --rm -v $(pwd)/frontend:/app docker/gordon analyze /app/Dockerfile

# Suggest optimizations
docker run --rm -v $(pwd)/backend:/app docker/gordon optimize /app/Dockerfile
```

---

## Common Operations

### Scale Deployments

```bash
# Scale backend to 5 replicas
kubectl scale deployment taskora-backend --replicas=5 -n taskora

# Or via Helm upgrade
helm upgrade taskora ./helm/taskora \
  --namespace taskora \
  --set backend.replicaCount=5
```

### View Logs

```bash
# Frontend logs
kubectl logs -l app=taskora-frontend -n taskora -f

# Backend logs
kubectl logs -l app=taskora-backend -n taskora -f

# Database logs
kubectl logs taskora-db-0 -n taskora -f
```

### Access Database

```bash
# PostgreSQL shell
kubectl exec -it taskora-db-0 -n taskora -- psql -U taskora -d taskora
```

### Restart Deployments

```bash
# Restart frontend
kubectl rollout restart deployment taskora-frontend -n taskora

# Restart backend
kubectl rollout restart deployment taskora-backend -n taskora
```

---

## Upgrade Application

```bash
# Rebuild images with new tag
docker build -t taskora/frontend:v1.1.0 ./frontend
docker build -t taskora/backend:v1.1.0 ./backend

# Upgrade Helm release
helm upgrade taskora ./helm/taskora \
  --namespace taskora \
  --set frontend.image.tag=v1.1.0 \
  --set backend.image.tag=v1.1.0

# Watch rollout
kubectl rollout status deployment/taskora-frontend -n taskora
kubectl rollout status deployment/taskora-backend -n taskora
```

---

## Rollback

```bash
# Rollback Helm release to previous revision
helm rollback taskora 1 -n taskora

# Or rollback specific deployment
kubectl rollout undo deployment/taskora-backend -n taskora
```

---

## Cleanup

```bash
# Uninstall Helm release
helm uninstall taskora -n taskora

# Delete namespace (removes all resources)
kubectl delete namespace taskora

# Stop Minikube
minikube stop

# Delete Minikube cluster (optional)
minikube delete
```

---

## Troubleshooting

### Pods Not Starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n taskora

# Check logs
kubectl logs <pod-name> -n taskora --previous
```

### Database Connection Issues

```bash
# Verify database is running
kubectl get pods -l app=taskora-db -n taskora

# Test connection from backend
kubectl exec -it deploy/taskora-backend -n taskora -- \
  python -c "from src.database import engine; print(engine.connect())"
```

### Ingress Not Working

```bash
# Verify ingress controller
kubectl get pods -n ingress-nginx

# Check ingress events
kubectl describe ingress taskora-ingress -n taskora

# Verify Minikube IP is correct in /etc/hosts
ping taskora.local
```

### Out of Memory

```bash
# Check resource usage
kubectl top pods -n taskora

# Increase Minikube memory
minikube stop
minikube config set memory 12288
minikube start
```

---

## Success Checklist

- [ ] Minikube cluster running (`kubectl get nodes`)
- [ ] All pods in Running state (`kubectl get pods -n taskora`)
- [ ] Services accessible (`kubectl get svc -n taskora`)
- [ ] Ingress configured (`kubectl get ingress -n taskora`)
- [ ] Application loads in browser (`http://taskora.local`)
- [ ] Can create/view tasks
- [ ] Database persists data after pod restart
- [ ] Health checks passing (`/health`, `/api/health`)

---

## Next Steps

1. **Enable Kagent** for autonomous monitoring:
   ```bash
   helm upgrade taskora ./helm/taskora --set kagent.enabled=true
   ```

2. **Configure kubectl-ai** for natural language operations

3. **Set up Horizontal Pod Autoscaler** for production-like scaling

4. **Enable TLS** with cert-manager for HTTPS support

---

## References

- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl-ai GitHub](https://github.com/sozercan/kubectl-ai)
