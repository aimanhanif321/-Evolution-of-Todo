# Troubleshooting Guide

This guide covers common issues and solutions for the Taskora application.

## Quick Diagnostics

Run these commands first to understand the system state:

```bash
# Check all pods status
kubectl get pods -n taskora

# Check pod events for errors
kubectl describe pods -n taskora

# Check Dapr system status
dapr status -k
```

## Common Issues

### 1. Pods Not Starting

#### Symptom
Pods stuck in `Pending`, `CrashLoopBackOff`, or `ImagePullBackOff`.

#### Diagnosis
```bash
# Check pod events
kubectl describe pod <pod-name> -n taskora

# Check resource availability
kubectl describe nodes | grep -A 5 "Allocated resources"
```

#### Solutions

**ImagePullBackOff:**
```bash
# Check if image exists
docker pull ghcr.io/<repo>/backend:latest

# Verify image pull secrets
kubectl get secrets -n taskora

# If using private registry, create pull secret
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=$GITHUB_USER \
  --docker-password=$GITHUB_TOKEN \
  -n taskora
```

**CrashLoopBackOff:**
```bash
# Check application logs
kubectl logs <pod-name> -n taskora -c backend --previous

# Common causes:
# 1. Missing environment variables
# 2. Database connection failure
# 3. Port already in use
```

**Pending (resources):**
```bash
# Check if cluster has enough resources
kubectl top nodes

# Scale down if needed, or add nodes
doctl kubernetes cluster node-pool update taskora-cluster worker-pool --count 4
```

---

### 2. Database Connection Failures

#### Symptom
Backend pods failing with database connection errors.

#### Diagnosis
```bash
# Check backend logs
kubectl logs -l app.kubernetes.io/name=taskora-backend -n taskora | grep -i database

# Verify secret exists
kubectl get secret taskora-secrets -n taskora -o yaml

# Test database connectivity
kubectl run pg-test --rm -it --image=postgres:15-alpine -n taskora -- \
  psql "postgresql://user:pass@host:25060/db?sslmode=require"
```

#### Solutions

**Incorrect DATABASE_URL:**
```bash
# Decode and check the secret
kubectl get secret taskora-secrets -n taskora -o jsonpath='{.data.DATABASE_URL}' | base64 -d

# Update if needed
kubectl create secret generic taskora-secrets -n taskora \
  --from-literal=DATABASE_URL='correct-url' \
  --dry-run=client -o yaml | kubectl apply -f -
```

**Firewall blocking connection:**
- Add DOKS cluster IP range to DO database trusted sources
- Check if using VPC peering correctly

---

### 3. Dapr Sidecar Not Injected

#### Symptom
Pod running but no `daprd` container visible.

#### Diagnosis
```bash
# Check pod annotations
kubectl get pod <pod-name> -n taskora -o yaml | grep dapr.io

# Check sidecar injector logs
kubectl logs -n dapr-system -l app=dapr-sidecar-injector
```

#### Solutions

**Missing annotations:**
```bash
# Verify deployment has annotations
kubectl get deployment taskora-backend -n taskora -o yaml | grep -A 10 annotations
```

**Injector not running:**
```bash
# Restart Dapr components
kubectl rollout restart deployment -n dapr-system

# Or reinstall Dapr
dapr uninstall -k
dapr init -k --wait
```

---

### 4. Events Not Publishing

#### Symptom
Task operations work but no events appear in Kafka topics.

#### Diagnosis
```bash
# Check backend Dapr sidecar logs
kubectl logs -l app.kubernetes.io/name=taskora-backend -n taskora -c daprd | grep -i pubsub

# Check Redpanda is running
kubectl get pods -n taskora | grep redpanda

# Check pubsub component
kubectl describe component taskora-pubsub -n taskora
```

#### Solutions

**Redpanda not ready:**
```bash
# Check Redpanda logs
kubectl logs -n taskora -l app.kubernetes.io/name=taskora-redpanda

# Restart Redpanda
kubectl rollout restart statefulset taskora-redpanda -n taskora
```

**Wrong broker address:**
```bash
# Verify pubsub component broker address matches Redpanda service
kubectl get svc -n taskora | grep redpanda
# Should be: taskora-redpanda.taskora.svc.cluster.local:9092
```

**DAPR_ENABLED=false:**
```bash
# Check environment variable
kubectl exec deploy/taskora-backend -n taskora -- env | grep DAPR
```

---

### 5. Frontend Cannot Reach Backend

#### Symptom
API calls failing with network errors.

#### Diagnosis
```bash
# Test from frontend pod
kubectl exec deploy/taskora-frontend -n taskora -- curl http://taskora-backend:8000/health

# Check service exists
kubectl get svc -n taskora

# Check endpoints
kubectl get endpoints -n taskora
```

#### Solutions

**Service not found:**
```bash
# Verify service exists
kubectl get svc taskora-backend -n taskora

# Check service selector matches pod labels
kubectl get pods -n taskora -l app.kubernetes.io/name=taskora-backend --show-labels
```

**CORS errors:**
```bash
# Check backend CORS configuration
kubectl logs -l app.kubernetes.io/name=taskora-backend -n taskora | grep CORS

# Verify frontend URL is in allowed origins
```

---

### 6. SSL/TLS Certificate Issues

#### Symptom
HTTPS not working, certificate errors in browser.

#### Diagnosis
```bash
# Check certificate status
kubectl get certificate -n taskora

# Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager

# Check ClusterIssuer
kubectl describe clusterissuer letsencrypt-prod
```

#### Solutions

**Certificate not issued:**
```bash
# Check challenge status
kubectl get challenges -n taskora

# Common issues:
# 1. DNS not pointing to load balancer
# 2. HTTP-01 challenge blocked by firewall
# 3. Rate limiting by Let's Encrypt
```

**DNS not configured:**
```bash
# Get load balancer IP
kubectl get svc -n ingress-nginx

# Update DNS A record to point to this IP
```

---

### 7. High Latency / Timeouts

#### Symptom
Requests taking too long or timing out.

#### Diagnosis
```bash
# Check pod resource usage
kubectl top pods -n taskora

# Check for restart loops
kubectl get pods -n taskora --watch

# Check Dapr circuit breaker state
kubectl logs -l app.kubernetes.io/name=taskora-backend -n taskora -c daprd | grep circuit
```

#### Solutions

**Resource exhaustion:**
```bash
# Increase resource limits
kubectl edit deployment taskora-backend -n taskora
# Increase CPU/memory limits
```

**Database slow queries:**
```bash
# Check PostgreSQL slow query log in DO console
# Add indexes if needed
```

**Circuit breaker tripped:**
```bash
# Check resiliency policy
kubectl get resiliency -n taskora -o yaml

# Wait for timeout period or restart pods
kubectl rollout restart deployment taskora-backend -n taskora
```

---

### 8. Helm Deployment Failures

#### Symptom
`helm upgrade` fails with errors.

#### Diagnosis
```bash
# Check Helm release status
helm status taskora -n taskora

# Check Helm history
helm history taskora -n taskora

# Validate chart
helm lint ./helm/taskora
```

#### Solutions

**Template errors:**
```bash
# Render templates locally
helm template taskora ./helm/taskora -f ./helm/taskora/values-prod.yaml

# Check for YAML syntax errors
```

**Failed hooks:**
```bash
# Check migration job
kubectl get jobs -n taskora
kubectl logs job/taskora-migrate -n taskora
```

**Rollback to previous version:**
```bash
helm rollback taskora <revision> -n taskora
```

---

## Useful Commands Reference

### Pod Operations
```bash
# Get pod logs
kubectl logs <pod> -n taskora -c backend -f

# Get previous crash logs
kubectl logs <pod> -n taskora -c backend --previous

# Execute into pod
kubectl exec -it <pod> -n taskora -c backend -- /bin/bash

# Port forward for local debugging
kubectl port-forward svc/taskora-backend 8000:8000 -n taskora
```

### Dapr Operations
```bash
# Check Dapr status
dapr status -k

# View Dapr dashboard
dapr dashboard -k -p 9999

# Check components
kubectl get components.dapr.io -n taskora

# Check subscriptions
kubectl get subscriptions.dapr.io -n taskora
```

### Helm Operations
```bash
# Upgrade with debug
helm upgrade taskora ./helm/taskora -n taskora -f values-prod.yaml --debug

# Dry run
helm upgrade taskora ./helm/taskora -n taskora --dry-run

# Get values
helm get values taskora -n taskora

# Uninstall
helm uninstall taskora -n taskora
```

## Getting Help

If you're still stuck:

1. Check the [Dapr Debugging Guide](dapr-debugging.md)
2. Review the [Architecture Document](architecture.md)
3. Open an issue on GitHub with:
   - Error messages
   - Pod logs
   - `kubectl describe` output
   - Helm release status
