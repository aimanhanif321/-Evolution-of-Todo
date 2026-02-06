# Monitoring Guide: Taskora Observability

**Version**: 1.0.0
**Date**: 2026-02-05
**Phase**: VII - Observability

---

## Table of Contents

1. [Health Endpoints](#health-endpoints)
2. [Metrics](#metrics)
3. [Structured Logging](#structured-logging)
4. [Dapr Dashboard](#dapr-dashboard)
5. [Prometheus Integration](#prometheus-integration)
6. [Grafana Dashboards](#grafana-dashboards)
7. [Alerting](#alerting)
8. [Troubleshooting](#troubleshooting)

---

## Health Endpoints

Taskora exposes three health-related endpoints for Kubernetes probes and monitoring:

### Liveness Probe: `/health`

Indicates if the service is running. Used by Kubernetes to determine if the pod should be restarted.

```bash
# Local
curl http://localhost:8000/health

# Production (via kubectl)
kubectl exec -n taskora deployment/taskora-backend -- curl -s http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "taskora-backend"
}
```

### Readiness Probe: `/ready`

Indicates if the service can accept traffic. Checks database connectivity.

```bash
curl http://localhost:8000/ready
```

**Response (healthy):**
```json
{
  "status": "ready",
  "database": "connected"
}
```

**Response (unhealthy - 503):**
```json
{
  "status": "not_ready",
  "database": "disconnected"
}
```

### Metrics Endpoint: `/metrics`

Provides application metrics for monitoring dashboards.

```bash
curl http://localhost:8000/metrics
```

**Response:**
```json
{
  "service": "taskora-backend",
  "version": "1.0.0",
  "status": "running",
  "components": {
    "database": "connected",
    "dapr_sidecar": "healthy"
  },
  "environment": "production"
}
```

---

## Metrics

### Key Metrics to Monitor

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| Request latency (P95) | 95th percentile response time | > 500ms |
| Error rate | Percentage of 5xx responses | > 1% |
| Request rate | Requests per second | Baseline + 200% |
| Database connections | Active DB connections | > 80% pool |
| Memory usage | Container memory | > 80% limit |
| CPU usage | Container CPU | > 70% limit |

### Prometheus Metrics (Optional)

To add full Prometheus metrics, install the instrumentator:

```bash
pip install prometheus-fastapi-instrumentator
```

Add to `main.py`:

```python
from prometheus_fastapi_instrumentator import Instrumentator

# After app creation
Instrumentator().instrument(app).expose(app, endpoint="/metrics/prometheus")
```

This exposes metrics in Prometheus format at `/metrics/prometheus`.

---

## Structured Logging

Taskora uses structured JSON logging in production for better log aggregation.

### Log Format (Production)

```json
{
  "timestamp": "2026-02-05T10:30:00.000Z",
  "level": "INFO",
  "logger": "src.api.task_router",
  "message": "Task created successfully",
  "module": "task_router",
  "function": "create_task",
  "line": 45,
  "request_id": "abc123-def456",
  "user_id": "user_789",
  "extra": {
    "task_id": "task_001",
    "title": "New Task"
  }
}
```

### Log Levels

| Level | Usage | Production |
|-------|-------|------------|
| DEBUG | Detailed debugging info | Disabled |
| INFO | General operational messages | Enabled |
| WARNING | Unexpected but handled situations | Enabled |
| ERROR | Error conditions | Enabled |
| CRITICAL | System failures | Enabled |

### Configuration

Set log level via environment variable:

```bash
# Development (verbose)
LOG_LEVEL=DEBUG

# Production (standard)
LOG_LEVEL=INFO

# Production (minimal)
LOG_LEVEL=WARNING
```

### Viewing Logs

```bash
# Local (Docker)
docker-compose logs -f backend

# Kubernetes
kubectl logs -n taskora -l app.kubernetes.io/name=taskora-backend -f

# With JSON parsing (jq)
kubectl logs -n taskora deployment/taskora-backend -f | jq .

# Filter by level
kubectl logs -n taskora deployment/taskora-backend -f | jq 'select(.level == "ERROR")'
```

---

## Dapr Dashboard

Dapr provides a built-in dashboard for monitoring components, applications, and configurations.

### Local Access

```bash
# Start Dapr dashboard
dapr dashboard

# Opens http://localhost:8080
```

### Kubernetes Access

```bash
# Port-forward to local machine
dapr dashboard -k -p 9999

# Opens http://localhost:9999
```

Or manually:

```bash
kubectl port-forward svc/dapr-dashboard -n dapr-system 9999:8080
```

### Dashboard Panels

| Panel | Description |
|-------|-------------|
| **Applications** | List of Dapr-enabled apps with health status |
| **Components** | Configured Dapr components (pubsub, statestore, etc.) |
| **Configurations** | Dapr configuration resources |
| **Control Plane** | Dapr system services status |

### Key Things to Check

1. **Applications Tab**:
   - `taskora-backend` should show "Running"
   - `taskora-frontend` should show "Running"
   - Check sidecar injection status

2. **Components Tab**:
   - `taskora-pubsub` - Kafka/Redpanda connection
   - `taskora-statestore` - PostgreSQL/Redis state
   - `taskora-secrets` - Kubernetes secrets
   - `reminder-cron` - Cron binding status
   - `recurrence-cron` - Cron binding status

3. **Control Plane Tab**:
   - All Dapr system pods should be healthy
   - Check `dapr-operator`, `dapr-sidecar-injector`, `dapr-placement`

### Dapr CLI Commands

```bash
# Check Dapr status
dapr status -k

# List components
kubectl get components -n taskora

# Describe a component
kubectl describe component taskora-pubsub -n taskora

# Check Dapr sidecar logs
kubectl logs -n taskora deployment/taskora-backend -c daprd -f
```

---

## Prometheus Integration

### Scrape Configuration

Add to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'taskora-backend'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names: ['taskora']
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app_kubernetes_io_name]
        action: keep
        regex: taskora-backend
      - source_labels: [__meta_kubernetes_pod_container_port_number]
        action: keep
        regex: '8000'
    metrics_path: /metrics
```

### ServiceMonitor (Prometheus Operator)

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: taskora-backend
  namespace: taskora
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: taskora-backend
  endpoints:
    - port: http
      path: /metrics
      interval: 30s
```

---

## Grafana Dashboards

### Recommended Dashboards

1. **Application Overview**
   - Request rate, error rate, latency percentiles
   - Active users, task operations per minute

2. **Infrastructure**
   - Pod CPU/memory usage
   - Database connections
   - Redis memory usage

3. **Dapr**
   - Pub/sub message rates
   - State store operations
   - Sidecar health

### Sample Queries

```promql
# Request rate
rate(http_requests_total{app="taskora-backend"}[5m])

# Error rate
rate(http_requests_total{app="taskora-backend", status=~"5.."}[5m])
/ rate(http_requests_total{app="taskora-backend"}[5m])

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{app="taskora-backend"}[5m]))
```

---

## Alerting

### Recommended Alerts

| Alert | Condition | Severity |
|-------|-----------|----------|
| High Error Rate | Error rate > 5% for 5m | Critical |
| High Latency | P95 > 1s for 5m | Warning |
| Pod Restart | Restart count > 3 in 10m | Warning |
| Database Down | `/ready` returns 503 for 1m | Critical |
| Dapr Sidecar Down | Sidecar not healthy for 2m | Critical |

### AlertManager Rules Example

```yaml
groups:
  - name: taskora
    rules:
      - alert: TaskoraHighErrorRate
        expr: |
          rate(http_requests_total{app="taskora-backend", status=~"5.."}[5m])
          / rate(http_requests_total{app="taskora-backend"}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate in Taskora backend"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: TaskoraDatabaseDown
        expr: probe_success{job="taskora-ready"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Taskora database connection lost"
```

---

## Troubleshooting

### Common Issues

#### 1. Health Check Failing

```bash
# Check pod status
kubectl get pods -n taskora

# Check logs for errors
kubectl logs -n taskora deployment/taskora-backend --tail=100

# Exec into pod and test
kubectl exec -n taskora deployment/taskora-backend -- curl -v http://localhost:8000/health
```

#### 2. Database Connection Issues

```bash
# Check readiness endpoint
kubectl exec -n taskora deployment/taskora-backend -- curl http://localhost:8000/ready

# Verify DATABASE_URL secret
kubectl get secret taskora-secrets -n taskora -o jsonpath='{.data.DATABASE_URL}' | base64 -d

# Test from pod
kubectl exec -n taskora deployment/taskora-backend -- python -c "
from sqlalchemy import create_engine, text
import os
engine = create_engine(os.environ['DATABASE_URL'])
with engine.connect() as conn:
    print(conn.execute(text('SELECT 1')).fetchone())
"
```

#### 3. Dapr Sidecar Not Injected

```bash
# Check pod annotations
kubectl get pod -n taskora -l app.kubernetes.io/name=taskora-backend -o yaml | grep -A5 annotations

# Should have:
# dapr.io/enabled: "true"
# dapr.io/app-id: "taskora-backend"

# Check Dapr injector logs
kubectl logs -n dapr-system -l app=dapr-sidecar-injector
```

#### 4. Events Not Flowing

```bash
# Check Redpanda topics
kubectl exec -n taskora deployment/redpanda -- rpk topic list

# Check Dapr pubsub component
kubectl describe component taskora-pubsub -n taskora

# Check Dapr sidecar logs for pubsub errors
kubectl logs -n taskora deployment/taskora-backend -c daprd | grep -i pubsub
```

---

## Related Documentation

- [Deployment Guide](./deployment-guide.md)
- [Dapr Debugging](./dapr-debugging.md)
- [Troubleshooting](./troubleshooting.md)
- [Local Development](./local-dev.md)
