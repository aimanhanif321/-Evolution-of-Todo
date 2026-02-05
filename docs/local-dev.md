# Local Development Guide

This guide covers setting up and running Taskora locally with full parity to the production environment.

## Quick Start

```bash
# Lightweight mode (no Dapr/Redpanda)
./scripts/local-dev.sh

# Full stack with Dapr + Redpanda (recommended for event testing)
./scripts/local-dev.sh --with-dapr

# Stop services
./scripts/local-dev.sh --stop

# Clean up (stop + remove volumes)
./scripts/local-dev.sh --clean
```

## Local vs Production Comparison

| Component | Local | Production |
|-----------|-------|------------|
| **Orchestration** | Docker Compose | Kubernetes (DOKS) |
| **Backend** | FastAPI (hot-reload) | FastAPI (Gunicorn) |
| **Frontend** | Next.js (dev server) | Next.js (production build) |
| **Database** | Neon PostgreSQL (remote) | DigitalOcean Managed PostgreSQL |
| **Event Streaming** | Redpanda (single node) | Redpanda (3-node cluster) |
| **State Store** | Redis (single) | Redis (HA) |
| **Service Mesh** | Dapr sidecars | Dapr sidecars |
| **TLS** | None (HTTP) | Let's Encrypt (HTTPS) |
| **Ingress** | Direct port mapping | NGINX Ingress Controller |
| **Secrets** | Environment variables | Kubernetes Secrets |

### Key Differences

1. **Single-node vs HA**: Local uses single instances; production uses replicated services
2. **TLS**: Local uses HTTP; production enforces HTTPS
3. **Resource limits**: Local has relaxed limits; production has strict constraints
4. **Persistence**: Local uses Docker volumes; production uses cloud-managed storage

## Architecture

### Lightweight Mode (without Dapr)

```
┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │
│  :3000      │     │   :8000     │
└─────────────┘     └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Redis     │
                    │   :6379     │
                    └─────────────┘
```

Best for:
- Quick frontend/backend development
- When event streaming is not needed
- Lower resource usage

### Full Stack Mode (with Dapr)

```
┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │
│  :3000      │     │   :8000     │
└──────┬──────┘     └──────┬──────┘
       │                   │
┌──────▼──────┐     ┌──────▼──────┐
│ Dapr Sidecar│     │ Dapr Sidecar│
│   :3501     │     │   :3500     │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └─────────┬─────────┘
                 │
          ┌──────▼──────┐
          │  Redpanda   │
          │  :9092      │
          └──────┬──────┘
                 │
          ┌──────▼──────┐
          │   Console   │
          │   :8080     │
          └─────────────┘
```

Best for:
- Testing event-driven features
- Verifying Dapr integration
- Production parity testing

## Services and Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Next.js development server |
| Backend | 8000 | FastAPI with hot-reload |
| Backend API Docs | 8000/docs | Swagger UI |
| Redis | 6379 | State store and caching |
| Redpanda | 9092 | Kafka-compatible broker |
| Redpanda Console | 8080 | Web UI for topic management |
| Redpanda Admin | 8082 | HTTP API for Redpanda |
| Dapr (Backend) | 3500 | Backend Dapr HTTP API |
| Dapr (Frontend) | 3501 | Frontend Dapr HTTP API |
| Dapr Placement | 50006 | Actor placement service |

## Environment Variables

### Backend (.env file in backend/)

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require

# Application
APP_ENV=development
DEBUG=true

# Dapr (optional)
DAPR_HTTP_PORT=3500
DAPR_GRPC_PORT=50001
```

### Frontend

```env
# API endpoint
NEXT_PUBLIC_API_URL=http://localhost:8000

# Environment
NODE_ENV=development
```

## Dapr Components (Local)

Local Dapr components are in `dapr/components-local/`:

| Component | Type | Description |
|-----------|------|-------------|
| `pubsub.yaml` | pubsub.kafka | Connects to local Redpanda |
| `statestore.yaml` | state.postgresql | Uses local database |
| `resiliency.yaml` | Resiliency | Retry and circuit breaker policies |
| `secrets.yaml` | secretstores.local.env | Uses environment variables |
| `reminder-cron.yaml` | bindings.cron | Triggers reminder checks every 1m |
| `recurrence-cron.yaml` | bindings.cron | Triggers recurrence checks every 1m |
| `topics.yaml` | Topic definitions | Matches production topics |

## Testing Event Flow

### Automated Test

```bash
./scripts/test-local-events.sh
```

This script:
1. Creates a test task
2. Verifies Redpanda receives the event
3. Tests SSE endpoint connectivity
4. Validates task updates and completions
5. Checks Dapr sidecar health

### Manual Testing

1. **Start the full stack**:
   ```bash
   ./scripts/local-dev.sh --with-dapr
   ```

2. **Open Redpanda Console**: http://localhost:8080
   - Navigate to Topics > task-events

3. **Create a task via API**:
   ```bash
   curl -X POST http://localhost:8000/api/tasks \
     -H "Content-Type: application/json" \
     -d '{"title": "Test Task", "description": "Testing events"}'
   ```

4. **Verify in Redpanda Console**:
   - Check task-events topic for new message

5. **Test SSE in browser**:
   - Open http://localhost:8000/api/events/stream
   - Create/update tasks and watch for events

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker compose logs backend

# Common issues:
# - DATABASE_URL not set in backend/.env
# - Port 8000 already in use
```

### Dapr sidecar won't connect

```bash
# Check Dapr logs
docker compose -f docker-compose.yml -f docker-compose.dapr.yml logs backend-dapr

# Common issues:
# - Redpanda not ready (wait a few seconds)
# - Component YAML syntax error
```

### Redpanda won't start

```bash
# Check Redpanda logs
docker compose -f docker-compose.yml -f docker-compose.dapr.yml logs redpanda

# Common issues:
# - Insufficient memory (needs 512MB minimum)
# - Port 9092 already in use
```

### Events not flowing

1. Check Dapr sidecar logs for pub/sub errors
2. Verify Redpanda is healthy:
   ```bash
   docker exec taskora-redpanda rpk cluster health
   ```
3. Check topic exists:
   ```bash
   docker exec taskora-redpanda rpk topic list
   ```

### SSE not working

1. Check browser supports EventSource
2. Verify CORS headers in backend
3. Test directly with curl:
   ```bash
   curl -N -H "Accept: text/event-stream" http://localhost:8000/api/events/stream
   ```

## Resource Requirements

### Lightweight Mode
- CPU: 2 cores
- RAM: 2 GB
- Disk: 1 GB

### Full Stack Mode
- CPU: 4 cores
- RAM: 4 GB
- Disk: 2 GB

## Common Commands

```bash
# View all logs
docker compose -f docker-compose.yml -f docker-compose.dapr.yml logs -f

# View specific service logs
docker compose logs backend -f
docker compose logs frontend -f

# Restart a service
docker compose restart backend

# Rebuild after code changes (usually not needed with hot-reload)
docker compose up -d --build backend

# Check container status
docker compose ps

# Execute command in container
docker exec -it taskora-backend bash
docker exec -it taskora-redpanda rpk topic list

# Check Redpanda topics
docker exec taskora-redpanda rpk topic list
docker exec taskora-redpanda rpk topic consume task-events --num 10
```

## Development Workflow

### Frontend Development

1. Start lightweight stack: `./scripts/local-dev.sh`
2. Make changes to `frontend/src/`
3. Changes auto-reload in browser

### Backend Development

1. Start lightweight stack: `./scripts/local-dev.sh`
2. Make changes to `backend/src/`
3. Server auto-reloads (uvicorn --reload)

### Event-Driven Development

1. Start full stack: `./scripts/local-dev.sh --with-dapr`
2. Open Redpanda Console: http://localhost:8080
3. Make changes and verify events flow

### Testing Production Parity

1. Start full stack: `./scripts/local-dev.sh --with-dapr`
2. Run event flow tests: `./scripts/test-local-events.sh`
3. Verify all tests pass before pushing to production

## Next Steps

- [Architecture Overview](./architecture.md)
- [Dapr Debugging Guide](./dapr-debugging.md)
- [Production Deployment](./deployment-guide.md)
- [Troubleshooting](./troubleshooting.md)
