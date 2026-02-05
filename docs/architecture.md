# Taskora Architecture Overview

This document describes the system architecture for Taskora Phase V - Cloud-Native Deployment.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    INTERNET                                          │
└─────────────────────────────────────────┬───────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         DigitalOcean Load Balancer                                   │
│                         (TLS Termination via cert-manager)                           │
└─────────────────────────────────────────┬───────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              NGINX Ingress Controller                                │
│                              (Path-based routing)                                    │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────────────────┐ │
│  │  /api/* → Backend Service    │  │  /* → Frontend Service                       │ │
│  └──────────────────────────────┘  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────┬───────────────────────────────────────────┘
                                          │
┌─────────────────────────────────────────┴───────────────────────────────────────────┐
│                            DOKS Cluster (taskora namespace)                          │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │                              Dapr Control Plane                                  │ │
│  │  ┌─────────────┐ ┌─────────────────┐ ┌────────────────┐ ┌────────────────────┐  │ │
│  │  │  Operator   │ │ Sidecar Injector│ │   Placement    │ │   Sentry (mTLS)    │  │ │
│  │  └─────────────┘ └─────────────────┘ └────────────────┘ └────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
│  ┌───────────────────────────┐         ┌───────────────────────────┐                │
│  │      Frontend Pod         │         │      Backend Pod          │                │
│  │  ┌─────────────────────┐  │         │  ┌─────────────────────┐  │                │
│  │  │   Next.js Container │  │         │  │   FastAPI Container │  │                │
│  │  │   (Port 3000)       │  │         │  │   (Port 8000)       │  │                │
│  │  └─────────────────────┘  │         │  └─────────────────────┘  │                │
│  │  ┌─────────────────────┐  │  Dapr   │  ┌─────────────────────┐  │                │
│  │  │   Dapr Sidecar      │◄─┼─────────┼─►│   Dapr Sidecar      │  │                │
│  │  │   (Port 3501)       │  │ Service │  │   (Port 3500)       │  │                │
│  │  └─────────────────────┘  │  Invoke │  └─────────────────────┘  │                │
│  └───────────────────────────┘         └─────────────┬─────────────┘                │
│                                                      │                               │
│                                                      │ Pub/Sub                       │
│                                                      ▼                               │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                            Redpanda StatefulSet                                │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                     Kafka-compatible Message Broker                      │  │  │
│  │  │  Topics: task-events, user-events, chat-events                          │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  │  Persistent Volume: 10Gi                                                      │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    DigitalOcean Managed PostgreSQL                                   │
│                    (External to cluster, TLS connection)                             │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Overview

### Frontend (Next.js)

| Aspect | Details |
|--------|---------|
| Framework | Next.js 16+ with App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Replicas | 2 (production) |
| Resources | 100m-500m CPU, 128Mi-512Mi memory |
| Dapr App ID | `taskora-frontend` |

**Key Features:**
- Server-side rendering for SEO
- Client-side state management
- Responsive design
- Optional Dapr service invocation

### Backend (FastAPI)

| Aspect | Details |
|--------|---------|
| Framework | FastAPI with SQLModel ORM |
| Language | Python 3.11+ |
| Replicas | 2 (production) |
| Resources | 200m-500m CPU, 256Mi-512Mi memory |
| Dapr App ID | `taskora-backend` |

**Key Features:**
- RESTful API endpoints
- JWT authentication
- AI chatbot integration (Gemini/Cohere)
- Event publishing to Kafka
- Health and readiness probes

### Database (PostgreSQL)

| Aspect | Details |
|--------|---------|
| Provider | DigitalOcean Managed Database |
| Version | PostgreSQL 15 |
| Connection | TLS-encrypted |
| Backups | Automated daily |

### Event Streaming (Redpanda)

| Aspect | Details |
|--------|---------|
| Technology | Redpanda (Kafka-compatible) |
| Resources | 500m-1000m CPU, 1Gi-2Gi memory |
| Storage | 10Gi persistent volume |
| Topics | task-events, user-events, chat-events |

**Why Redpanda over Kafka:**
- No ZooKeeper dependency
- Lower memory footprint
- Single binary deployment
- Full Kafka API compatibility

### Dapr Components

#### Pub/Sub (taskora-pubsub)
```yaml
type: pubsub.kafka
brokers: redpanda.taskora.svc.cluster.local:9092
```

#### State Store (taskora-statestore)
```yaml
type: state.postgresql
connectionString: <from secret>
```

#### Resiliency Policies
- **Retry**: 3 attempts with 1s constant delay
- **Circuit Breaker**: Trip after 5 failures, 30s timeout
- **Timeout**: 30s default, 60s for pub/sub

## Data Flow

### Task Creation Flow

```
1. User creates task in UI
   │
   ▼
2. Frontend sends POST /api/tasks
   │
   ▼
3. Backend validates and saves to PostgreSQL
   │
   ▼
4. Backend publishes task.created event to Kafka
   │
   ▼
5. Event consumers process (future: notifications, analytics)
```

### AI Chat Flow

```
1. User sends message in chat UI
   │
   ▼
2. Frontend sends POST /api/chat
   │
   ▼
3. Backend sends to Gemini/Cohere API
   │
   ▼
4. Backend publishes chat.message_sent event
   │
   ▼
5. AI response returned to user
   │
   ▼
6. Backend publishes chat.response_received event
```

## Network Security

### mTLS (Mutual TLS)

Dapr automatically provides mTLS between all services:
- Certificates managed by Dapr Sentry
- Automatic rotation
- No application code changes required

### Network Policies

```yaml
# Backend can only receive from:
# - Frontend (Dapr service invocation)
# - Ingress controller

# Backend can only connect to:
# - PostgreSQL (external)
# - Redpanda (pub/sub)
```

### Secrets Management

Secrets are stored in Kubernetes Secrets:
- `DATABASE_URL`
- `COHERE_API_KEY`
- `GEMINI_API_KEY`
- `BETTER_AUTH_SECRET`

## Scaling Strategy

### Horizontal Pod Autoscaler (Future)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: taskora-backend
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: taskora-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

### Current Resource Allocation

| Service | Min Replicas | Max Replicas | CPU Request | Memory Request |
|---------|--------------|--------------|-------------|----------------|
| Frontend | 2 | - | 100m | 128Mi |
| Backend | 2 | - | 200m | 256Mi |
| Redpanda | 1 | - | 500m | 1Gi |

**Total Cluster Capacity:** 3x s-2vcpu-4gb = 6 vCPU, 12GB RAM

## Observability

### Metrics

- Dapr metrics exposed on port 9090
- Application metrics at `/metrics` endpoint
- Prometheus-compatible format

### Logging

- Structured JSON logging
- Log levels: DEBUG, INFO, WARNING, ERROR
- Dapr sidecar logs for service mesh debugging

### Tracing (Future)

- OpenTelemetry integration ready
- Dapr provides automatic trace propagation

## Deployment Strategy

### Rolling Updates

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

**Benefits:**
- Zero-downtime deployments
- Automatic rollback on failure
- Health check validation before traffic

### Database Migrations

Migrations run as a pre-deploy Helm hook:
```yaml
annotations:
  helm.sh/hook: pre-install,pre-upgrade
  helm.sh/hook-weight: "-5"
```

## Disaster Recovery

### Backup Strategy

| Component | Backup Method | Retention |
|-----------|---------------|-----------|
| PostgreSQL | DO automated backups | 7 days |
| Redpanda | Topic retention policies | 7-30 days |
| Secrets | Helm release history | 10 revisions |

### Recovery Procedures

1. **Database corruption**: Restore from DO backup point
2. **Cluster failure**: Recreate cluster, restore from Helm charts
3. **Event loss**: Replay from Kafka retention window
