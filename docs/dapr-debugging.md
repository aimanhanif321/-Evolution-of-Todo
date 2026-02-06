# Dapr Debugging Guide

This document provides commands and techniques for debugging Dapr-related issues in the Taskora application.

## Prerequisites

- `kubectl` configured to access your cluster
- `dapr` CLI installed (`dapr init -k` already run on cluster)
- Access to the `taskora` namespace

## Quick Status Check

### Check Dapr System Status

```bash
# Verify Dapr is running on the cluster
dapr status -k

# Check Dapr components in taskora namespace
kubectl get components.dapr.io -n taskora

# Check Dapr subscriptions
kubectl get subscriptions.dapr.io -n taskora
```

### Check Application Status

```bash
# List all pods with Dapr sidecars
kubectl get pods -n taskora -l dapr.io/enabled=true

# Check if sidecars are injected
kubectl get pods -n taskora -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].name}{"\n"}{end}'
```

## Viewing Logs

### Application Logs

```bash
# Backend application logs
kubectl logs -n taskora -l app.kubernetes.io/name=taskora-backend -c backend -f

# Frontend application logs
kubectl logs -n taskora -l app.kubernetes.io/name=taskora-frontend -c frontend -f
```

### Dapr Sidecar Logs

```bash
# Backend Dapr sidecar logs
kubectl logs -n taskora -l app.kubernetes.io/name=taskora-backend -c daprd -f

# Frontend Dapr sidecar logs
kubectl logs -n taskora -l app.kubernetes.io/name=taskora-frontend -c daprd -f

# Filter for errors only
kubectl logs -n taskora -l app.kubernetes.io/name=taskora-backend -c daprd | grep -i error
```

### Dapr System Logs

```bash
# Dapr operator logs
kubectl logs -n dapr-system -l app=dapr-operator -f

# Dapr sidecar injector logs
kubectl logs -n dapr-system -l app=dapr-sidecar-injector -f

# Dapr placement logs (for actors)
kubectl logs -n dapr-system -l app=dapr-placement-server -f
```

## Pub/Sub Debugging

### Check Redpanda/Kafka Topics

```bash
# Port-forward to Redpanda
kubectl port-forward -n taskora svc/taskora-redpanda 9092:9092 &

# List topics (using rpk or kafka-topics)
rpk topic list

# Consume from a topic (replace with actual topic name)
rpk topic consume task-events --offset oldest

# Check topic metadata
rpk topic describe task-events
```

### Test Event Publishing

```bash
# Publish a test event via Dapr sidecar API
kubectl exec -n taskora deploy/taskora-backend -c daprd -- \
  curl -X POST http://localhost:3500/v1.0/publish/taskora-pubsub/task-events \
    -H "Content-Type: application/json" \
    -d '{"event_type": "test", "message": "debug test"}'
```

## Service Invocation Debugging

### Test Service-to-Service Calls

```bash
# Invoke backend health from frontend's Dapr sidecar
kubectl exec -n taskora deploy/taskora-frontend -c daprd -- \
  curl http://localhost:3500/v1.0/invoke/taskora-backend/method/health

# Check service invocation metrics
kubectl exec -n taskora deploy/taskora-backend -c daprd -- \
  curl http://localhost:9090/metrics | grep dapr_http
```

### Check mTLS Status

```bash
# Verify mTLS is enabled
dapr mtls -k

# Export mTLS certificates (for debugging)
dapr mtls export -o ./certs -k
```

## Resiliency Debugging

### Check Circuit Breaker State

```bash
# View resiliency configuration
kubectl get resiliency.dapr.io -n taskora -o yaml

# Check sidecar for circuit breaker state (in logs)
kubectl logs -n taskora -l app.kubernetes.io/name=taskora-backend -c daprd | grep -i "circuit"
```

### Simulate Failures

```bash
# Temporarily scale down backend to trigger circuit breaker
kubectl scale deployment taskora-backend -n taskora --replicas=0

# Watch frontend logs for retry/circuit breaker behavior
kubectl logs -n taskora -l app.kubernetes.io/name=taskora-frontend -c daprd -f

# Scale back up
kubectl scale deployment taskora-backend -n taskora --replicas=2
```

## Dapr Dashboard

### Port Forward to Dashboard

```bash
# If dashboard is deployed
kubectl port-forward -n taskora svc/taskora-dapr-dashboard 8080:8080

# Open in browser
# http://localhost:8080
```

### Alternative: Use Dapr CLI Dashboard

```bash
# Start Dapr dashboard (connects to cluster)
dapr dashboard -k -p 9999

# Open http://localhost:9999
```

## Common Issues and Solutions

### Issue: Sidecar not injected

**Symptoms:** Pod running but no `daprd` container

**Solution:**
```bash
# Check if namespace has Dapr injection enabled
kubectl get namespace taskora -o yaml | grep dapr

# Verify pod annotations
kubectl get pod <pod-name> -n taskora -o yaml | grep dapr.io

# Restart sidecar injector if needed
kubectl rollout restart deployment dapr-sidecar-injector -n dapr-system
```

### Issue: Pub/Sub not working

**Symptoms:** Events not published, no messages in topic

**Solution:**
```bash
# Check pubsub component status
kubectl describe component taskora-pubsub -n taskora

# Verify Redpanda is running
kubectl get pods -n taskora | grep redpanda

# Check component binding in sidecar
kubectl logs -n taskora -l app.kubernetes.io/name=taskora-backend -c daprd | grep "pubsub"
```

### Issue: Service invocation failing

**Symptoms:** 500 errors when calling between services

**Solution:**
```bash
# Check if target service is discoverable
kubectl exec -n taskora deploy/taskora-frontend -c daprd -- \
  curl http://localhost:3500/v1.0/healthz

# Verify app-id matches
kubectl get pods -n taskora -o jsonpath='{range .items[*]}{.metadata.annotations.dapr\.io/app-id}{"\n"}{end}'
```

### Issue: High latency

**Symptoms:** Requests taking longer than expected

**Solution:**
```bash
# Check sidecar resource usage
kubectl top pods -n taskora --containers

# Review timeout configurations
kubectl get resiliency.dapr.io -n taskora -o yaml

# Check for retry storms in logs
kubectl logs -n taskora -l app.kubernetes.io/name=taskora-backend -c daprd | grep -i retry
```

## Performance Monitoring

### Metrics Endpoints

```bash
# Scrape Dapr metrics
kubectl exec -n taskora deploy/taskora-backend -c daprd -- \
  curl http://localhost:9090/metrics

# Key metrics to watch:
# - dapr_http_server_request_count
# - dapr_http_server_latency_bucket
# - dapr_component_pubsub_count
# - dapr_resiliency_count
```

### Enable Debug Logging

```bash
# Patch deployment to enable debug logs
kubectl patch deployment taskora-backend -n taskora --type='json' -p='[
  {"op": "replace", "path": "/spec/template/metadata/annotations/dapr.io~1log-level", "value": "debug"}
]'

# Rollback to info level
kubectl patch deployment taskora-backend -n taskora --type='json' -p='[
  {"op": "replace", "path": "/spec/template/metadata/annotations/dapr.io~1log-level", "value": "info"}
]'
```

## Useful Aliases

Add these to your shell profile for quick debugging:

```bash
alias dapr-logs='kubectl logs -n taskora -l app.kubernetes.io/name=taskora-backend -c daprd -f'
alias dapr-status='dapr status -k && kubectl get pods -n taskora'
alias dapr-events='rpk topic consume task-events --offset oldest'
alias dapr-dash='kubectl port-forward -n taskora svc/taskora-dapr-dashboard 8080:8080'
```
