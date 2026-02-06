# Data Model: Phase IV — Local Kubernetes Deployment

**Feature**: 001-k8s-local-deployment
**Date**: 2026-01-22
**Status**: Complete

---

## Overview

This document defines the Kubernetes resource data models for the Taskora cloud-native deployment. Each resource type follows Kubernetes API specifications and aligns with the Helm chart structure.

---

## 1. Namespace

**Purpose**: Isolate Taskora resources from other cluster workloads.

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: taskora
  labels:
    app.kubernetes.io/name: taskora
    app.kubernetes.io/managed-by: helm
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Namespace identifier: `taskora` |
| labels | map | Yes | Standard Kubernetes labels |

---

## 2. Deployments

### 2.1 Frontend Deployment

**Purpose**: Run Next.js frontend application pods.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: taskora-frontend
  namespace: taskora
  labels:
    app: taskora-frontend
    component: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: taskora-frontend
  template:
    metadata:
      labels:
        app: taskora-frontend
        component: frontend
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
        - name: frontend
          image: taskora/frontend:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
              name: http
              protocol: TCP
          env:
            - name: NEXT_PUBLIC_API_URL
              valueFrom:
                configMapKeyRef:
                  name: taskora-config
                  key: API_BASE_URL
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| replicas | int | 2 | Number of frontend pods |
| image | string | taskora/frontend:latest | Container image |
| cpu.requests | string | 100m | Minimum CPU |
| cpu.limits | string | 500m | Maximum CPU |
| memory.requests | string | 128Mi | Minimum memory |
| memory.limits | string | 512Mi | Maximum memory |
| containerPort | int | 3000 | HTTP port |

### 2.2 Backend Deployment

**Purpose**: Run FastAPI backend application pods.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: taskora-backend
  namespace: taskora
  labels:
    app: taskora-backend
    component: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: taskora-backend
  template:
    metadata:
      labels:
        app: taskora-backend
        component: backend
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
        - name: backend
          image: taskora/backend:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8000
              name: http
              protocol: TCP
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: taskora-secrets
                  key: DATABASE_URL
            - name: COHERE_API_KEY
              valueFrom:
                secretKeyRef:
                  name: taskora-secrets
                  key: COHERE_API_KEY
            - name: BETTER_AUTH_SECRET
              valueFrom:
                secretKeyRef:
                  name: taskora-secrets
                  key: BETTER_AUTH_SECRET
            - name: APP_ENV
              valueFrom:
                configMapKeyRef:
                  name: taskora-config
                  key: APP_ENV
          resources:
            requests:
              cpu: 200m
              memory: 256Mi
            limits:
              cpu: 1000m
              memory: 1Gi
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| replicas | int | 3 | Number of backend pods |
| image | string | taskora/backend:latest | Container image |
| cpu.requests | string | 200m | Minimum CPU |
| cpu.limits | string | 1000m | Maximum CPU |
| memory.requests | string | 256Mi | Minimum memory |
| memory.limits | string | 1Gi | Maximum memory |
| containerPort | int | 8000 | HTTP port |

---

## 3. StatefulSet (Database)

**Purpose**: Run PostgreSQL with persistent storage.

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: taskora-db
  namespace: taskora
  labels:
    app: taskora-db
    component: database
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
        component: database
    spec:
      containers:
        - name: postgres
          image: postgres:15-alpine
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 5432
              name: postgres
              protocol: TCP
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
            - name: PGDATA
              value: /var/lib/postgresql/data/pgdata
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
          livenessProbe:
            exec:
              command:
                - pg_isready
                - -U
                - postgres
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            exec:
              command:
                - pg_isready
                - -U
                - postgres
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes:
          - ReadWriteOnce
        storageClassName: standard
        resources:
          requests:
            storage: 10Gi
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| replicas | int | 1 | Single database instance |
| image | string | postgres:15-alpine | PostgreSQL image |
| storage | string | 10Gi | PVC storage size |
| storageClassName | string | standard | Minikube default |
| POSTGRES_DB | string | taskora | Database name |

---

## 4. Services

### 4.1 Frontend Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: taskora-frontend
  namespace: taskora
  labels:
    app: taskora-frontend
spec:
  type: ClusterIP
  selector:
    app: taskora-frontend
  ports:
    - name: http
      port: 3000
      targetPort: 3000
      protocol: TCP
```

### 4.2 Backend Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: taskora-backend
  namespace: taskora
  labels:
    app: taskora-backend
spec:
  type: ClusterIP
  selector:
    app: taskora-backend
  ports:
    - name: http
      port: 8000
      targetPort: 8000
      protocol: TCP
```

### 4.3 Database Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: taskora-db
  namespace: taskora
  labels:
    app: taskora-db
spec:
  type: ClusterIP
  clusterIP: None  # Headless service for StatefulSet
  selector:
    app: taskora-db
  ports:
    - name: postgres
      port: 5432
      targetPort: 5432
      protocol: TCP
```

| Service | Type | Port | Target |
|---------|------|------|--------|
| taskora-frontend | ClusterIP | 3000 | Frontend pods |
| taskora-backend | ClusterIP | 8000 | Backend pods |
| taskora-db | Headless | 5432 | Database pod |

---

## 5. ConfigMap

**Purpose**: Store non-sensitive configuration.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: taskora-config
  namespace: taskora
  labels:
    app: taskora
data:
  API_BASE_URL: "http://taskora-backend:8000"
  APP_ENV: "production"
  LOG_LEVEL: "info"
  ENABLE_METRICS: "true"
  MAX_CONVERSATION_HISTORY: "20"
  CHAT_RATE_LIMIT: "30"
```

| Key | Type | Description |
|-----|------|-------------|
| API_BASE_URL | string | Internal backend URL |
| APP_ENV | string | Environment name |
| LOG_LEVEL | string | Logging verbosity |
| ENABLE_METRICS | string | Metrics collection flag |
| MAX_CONVERSATION_HISTORY | string | Chat history limit |
| CHAT_RATE_LIMIT | string | Rate limit per minute |

---

## 6. Secrets

### 6.1 Application Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: taskora-secrets
  namespace: taskora
  labels:
    app: taskora
type: Opaque
stringData:
  DATABASE_URL: "postgresql://taskora:password@taskora-db:5432/taskora"
  COHERE_API_KEY: "your-cohere-api-key"
  BETTER_AUTH_SECRET: "your-jwt-secret-key"
  GEMINI_API_KEY: "your-gemini-api-key"
```

### 6.2 Database Credentials

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: taskora-db-credentials
  namespace: taskora
  labels:
    app: taskora-db
type: Opaque
stringData:
  username: "taskora"
  password: "your-secure-password"
```

| Secret | Keys | Description |
|--------|------|-------------|
| taskora-secrets | DATABASE_URL, COHERE_API_KEY, BETTER_AUTH_SECRET, GEMINI_API_KEY | App credentials |
| taskora-db-credentials | username, password | Database auth |

**Security Notes:**
- In production, use external secrets operators
- Never commit plaintext secrets to Git
- Use Helm's `--set` flag or values files for injection

---

## 7. Ingress

**Purpose**: External HTTP access to services.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: taskora-ingress
  namespace: taskora
  labels:
    app: taskora
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
spec:
  ingressClassName: nginx
  rules:
    - host: taskora.local
      http:
        paths:
          - path: /api(/|$)(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: taskora-backend
                port:
                  number: 8000
          - path: /(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: taskora-frontend
                port:
                  number: 3000
```

| Field | Value | Description |
|-------|-------|-------------|
| host | taskora.local | Local DNS entry |
| ingressClassName | nginx | Minikube addon |
| /api/* | taskora-backend:8000 | API routes |
| /* | taskora-frontend:3000 | Frontend routes |

---

## 8. PersistentVolumeClaim

**Purpose**: Persistent storage for database data.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: taskora-db-data
  namespace: taskora
  labels:
    app: taskora-db
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 10Gi
```

| Field | Value | Description |
|-------|-------|-------------|
| accessModes | ReadWriteOnce | Single node access |
| storageClassName | standard | Minikube provisioner |
| storage | 10Gi | Initial allocation |

---

## 9. Resource Summary

| Resource Type | Count | Names |
|--------------|-------|-------|
| Namespace | 1 | taskora |
| Deployment | 2 | taskora-frontend, taskora-backend |
| StatefulSet | 1 | taskora-db |
| Service | 3 | taskora-frontend, taskora-backend, taskora-db |
| ConfigMap | 1 | taskora-config |
| Secret | 2 | taskora-secrets, taskora-db-credentials |
| Ingress | 1 | taskora-ingress |
| PVC | 1 | taskora-db-data (via volumeClaimTemplates) |

---

## 10. Resource Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAMESPACE: taskora                        │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   CONFIGMAP  │    │    SECRETS   │    │    SECRETS   │       │
│  │ taskora-config│    │taskora-secrets│   │taskora-db-creds│     │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
│         │                   │                    │               │
│         └─────────┬─────────┴────────────────────┘               │
│                   │ mounted into                                 │
│                   ▼                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      DEPLOYMENTS                          │   │
│  │  ┌─────────────────┐          ┌─────────────────┐        │   │
│  │  │ taskora-frontend │          │ taskora-backend  │        │   │
│  │  │   replicas: 2    │          │   replicas: 3    │        │   │
│  │  └────────┬────────┘          └────────┬────────┘        │   │
│  └───────────┼───────────────────────────┼──────────────────┘   │
│              │                           │                       │
│              ▼                           ▼                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                       SERVICES                            │   │
│  │  ┌─────────────────┐          ┌─────────────────┐        │   │
│  │  │ taskora-frontend │          │ taskora-backend  │        │   │
│  │  │   port: 3000     │          │   port: 8000     │        │   │
│  │  └────────┬────────┘          └────────┬────────┘        │   │
│  └───────────┼───────────────────────────┼──────────────────┘   │
│              │                           │                       │
│              └─────────────┬─────────────┘                       │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                        INGRESS                            │   │
│  │                   taskora-ingress                         │   │
│  │              host: taskora.local                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      STATEFULSET                          │   │
│  │  ┌─────────────────┐                                     │   │
│  │  │   taskora-db    │◀──── PVC: 10Gi                      │   │
│  │  │   replicas: 1   │                                     │   │
│  │  └────────┬────────┘                                     │   │
│  │           │                                              │   │
│  │           ▼                                              │   │
│  │  ┌─────────────────┐                                     │   │
│  │  │  taskora-db svc │ (headless)                          │   │
│  │  │   port: 5432    │                                     │   │
│  │  └─────────────────┘                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. Validation Rules

| Resource | Validation | Error If |
|----------|------------|----------|
| Deployment | replicas >= 1 | replicas < 1 |
| Deployment | resources.requests defined | Missing requests |
| Deployment | health probes defined | Missing probes |
| Service | selector matches deployment | Orphaned service |
| Secret | All required keys present | Missing keys |
| Ingress | Valid host pattern | Invalid DNS |
| PVC | storage >= 1Gi | Insufficient storage |
