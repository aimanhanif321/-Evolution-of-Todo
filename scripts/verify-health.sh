#!/bin/bash
# Verify health of Taskora deployment
# Checks pods, endpoints, and Dapr sidecars

set -e

NAMESPACE="${NAMESPACE:-taskora}"
TIMEOUT="${TIMEOUT:-30}"

echo "================================================"
echo "Taskora Health Verification"
echo "================================================"
echo "  Namespace: $NAMESPACE"
echo "  Timeout: ${TIMEOUT}s"
echo "================================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

check_pass() {
    echo -e "  ${GREEN}[PASS]${NC} $1"
    PASS_COUNT=$((PASS_COUNT + 1))
}

check_fail() {
    echo -e "  ${RED}[FAIL]${NC} $1"
    FAIL_COUNT=$((FAIL_COUNT + 1))
}

check_warn() {
    echo -e "  ${YELLOW}[WARN]${NC} $1"
    WARN_COUNT=$((WARN_COUNT + 1))
}

# Check cluster connectivity
check_cluster() {
    echo ""
    echo "[1/7] Checking cluster connectivity..."

    if kubectl cluster-info &> /dev/null; then
        check_pass "Cluster is reachable"
    else
        check_fail "Cannot connect to cluster"
        exit 1
    fi
}

# Check namespace
check_namespace() {
    echo ""
    echo "[2/7] Checking namespace..."

    if kubectl get namespace $NAMESPACE &> /dev/null; then
        check_pass "Namespace '$NAMESPACE' exists"
    else
        check_fail "Namespace '$NAMESPACE' not found"
        exit 1
    fi
}

# Check pod status
check_pods() {
    echo ""
    echo "[3/7] Checking pod status..."

    # Get all pods in namespace
    PODS=$(kubectl get pods -n $NAMESPACE --no-headers 2>/dev/null)

    if [ -z "$PODS" ]; then
        check_fail "No pods found in namespace"
        return
    fi

    # Check each pod
    while IFS= read -r line; do
        POD_NAME=$(echo "$line" | awk '{print $1}')
        POD_STATUS=$(echo "$line" | awk '{print $3}')
        POD_READY=$(echo "$line" | awk '{print $2}')

        case $POD_STATUS in
            Running)
                READY_COUNT=$(echo "$POD_READY" | cut -d'/' -f1)
                TOTAL_COUNT=$(echo "$POD_READY" | cut -d'/' -f2)
                if [ "$READY_COUNT" = "$TOTAL_COUNT" ]; then
                    check_pass "$POD_NAME - Running ($POD_READY)"
                else
                    check_warn "$POD_NAME - Running but not fully ready ($POD_READY)"
                fi
                ;;
            Completed)
                check_pass "$POD_NAME - Completed (Job)"
                ;;
            Pending)
                check_warn "$POD_NAME - Pending"
                ;;
            *)
                check_fail "$POD_NAME - $POD_STATUS"
                ;;
        esac
    done <<< "$PODS"
}

# Check Dapr sidecars
check_dapr_sidecars() {
    echo ""
    echo "[4/7] Checking Dapr sidecars..."

    # Check if Dapr is installed
    if ! kubectl get namespace dapr-system &> /dev/null; then
        check_warn "Dapr not installed - skipping sidecar check"
        return
    fi

    # Check Dapr system pods
    DAPR_PODS=$(kubectl get pods -n dapr-system --no-headers 2>/dev/null | wc -l)
    if [ "$DAPR_PODS" -gt 0 ]; then
        check_pass "Dapr system pods running ($DAPR_PODS pods)"
    else
        check_fail "No Dapr system pods found"
    fi

    # Check for daprd sidecar in application pods
    APP_PODS=$(kubectl get pods -n $NAMESPACE -l "app.kubernetes.io/component in (backend,frontend)" --no-headers 2>/dev/null || true)

    if [ -n "$APP_PODS" ]; then
        while IFS= read -r line; do
            POD_NAME=$(echo "$line" | awk '{print $1}')
            CONTAINERS=$(kubectl get pod "$POD_NAME" -n $NAMESPACE -o jsonpath='{.spec.containers[*].name}' 2>/dev/null)

            if echo "$CONTAINERS" | grep -q "daprd"; then
                check_pass "$POD_NAME has Dapr sidecar"
            else
                check_warn "$POD_NAME - No Dapr sidecar (may be expected)"
            fi
        done <<< "$APP_PODS"
    fi
}

# Check services
check_services() {
    echo ""
    echo "[5/7] Checking services..."

    # Expected services
    EXPECTED_SERVICES=("backend" "frontend")

    for SVC in "${EXPECTED_SERVICES[@]}"; do
        SVC_NAME="taskora-$SVC"
        if kubectl get svc -n $NAMESPACE | grep -q "$SVC_NAME"; then
            ENDPOINTS=$(kubectl get endpoints "$SVC_NAME" -n $NAMESPACE -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null)
            if [ -n "$ENDPOINTS" ]; then
                check_pass "Service $SVC_NAME has endpoints"
            else
                check_warn "Service $SVC_NAME exists but has no endpoints"
            fi
        else
            check_fail "Service $SVC_NAME not found"
        fi
    done
}

# Check health endpoints
check_health_endpoints() {
    echo ""
    echo "[6/7] Checking health endpoints..."

    # Get a backend pod for port-forward
    BACKEND_POD=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/component=backend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)

    if [ -z "$BACKEND_POD" ]; then
        check_warn "No backend pod found - skipping endpoint checks"
        return
    fi

    # Test endpoints via kubectl exec
    echo "  Testing endpoints via $BACKEND_POD..."

    # Health endpoint
    HEALTH_RESPONSE=$(kubectl exec "$BACKEND_POD" -n $NAMESPACE -c taskora-backend -- curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null || echo "000")
    if [ "$HEALTH_RESPONSE" = "200" ]; then
        check_pass "/health endpoint returns 200"
    else
        check_fail "/health endpoint returned $HEALTH_RESPONSE"
    fi

    # Ready endpoint
    READY_RESPONSE=$(kubectl exec "$BACKEND_POD" -n $NAMESPACE -c taskora-backend -- curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ready 2>/dev/null || echo "000")
    if [ "$READY_RESPONSE" = "200" ]; then
        check_pass "/ready endpoint returns 200"
    else
        check_warn "/ready endpoint returned $READY_RESPONSE"
    fi

    # Metrics endpoint
    METRICS_RESPONSE=$(kubectl exec "$BACKEND_POD" -n $NAMESPACE -c taskora-backend -- curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/metrics 2>/dev/null || echo "000")
    if [ "$METRICS_RESPONSE" = "200" ]; then
        check_pass "/metrics endpoint returns 200"
    else
        check_warn "/metrics endpoint returned $METRICS_RESPONSE"
    fi
}

# Check ingress
check_ingress() {
    echo ""
    echo "[7/7] Checking ingress..."

    INGRESS=$(kubectl get ingress -n $NAMESPACE --no-headers 2>/dev/null)

    if [ -z "$INGRESS" ]; then
        check_warn "No ingress found"
        return
    fi

    INGRESS_NAME=$(echo "$INGRESS" | awk '{print $1}')
    INGRESS_HOST=$(kubectl get ingress "$INGRESS_NAME" -n $NAMESPACE -o jsonpath='{.spec.rules[0].host}' 2>/dev/null)
    INGRESS_IP=$(kubectl get ingress "$INGRESS_NAME" -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)

    if [ -n "$INGRESS_IP" ]; then
        check_pass "Ingress has LoadBalancer IP: $INGRESS_IP"
    else
        check_warn "Ingress IP not yet assigned"
    fi

    if [ -n "$INGRESS_HOST" ]; then
        check_pass "Ingress host configured: $INGRESS_HOST"
    else
        check_warn "Ingress host not configured"
    fi

    # Check TLS
    TLS_SECRET=$(kubectl get ingress "$INGRESS_NAME" -n $NAMESPACE -o jsonpath='{.spec.tls[0].secretName}' 2>/dev/null)
    if [ -n "$TLS_SECRET" ]; then
        if kubectl get secret "$TLS_SECRET" -n $NAMESPACE &> /dev/null; then
            check_pass "TLS certificate secret exists: $TLS_SECRET"
        else
            check_warn "TLS secret $TLS_SECRET not found (cert-manager may still be provisioning)"
        fi
    else
        check_warn "TLS not configured"
    fi
}

# Print summary
print_summary() {
    echo ""
    echo "================================================"
    echo "Health Check Summary"
    echo "================================================"
    echo ""
    echo -e "  ${GREEN}Passed:${NC}  $PASS_COUNT"
    echo -e "  ${YELLOW}Warnings:${NC} $WARN_COUNT"
    echo -e "  ${RED}Failed:${NC}  $FAIL_COUNT"
    echo ""

    TOTAL=$((PASS_COUNT + WARN_COUNT + FAIL_COUNT))
    PASS_PERCENT=$((PASS_COUNT * 100 / TOTAL))

    if [ "$FAIL_COUNT" -eq 0 ]; then
        if [ "$WARN_COUNT" -eq 0 ]; then
            echo -e "  Status: ${GREEN}HEALTHY${NC} (100%)"
            echo ""
            echo "================================================"
            return 0
        else
            echo -e "  Status: ${YELLOW}HEALTHY WITH WARNINGS${NC} ($PASS_PERCENT% passed)"
            echo ""
            echo "================================================"
            return 0
        fi
    else
        echo -e "  Status: ${RED}UNHEALTHY${NC} ($FAIL_COUNT failures)"
        echo ""
        echo "Troubleshooting commands:"
        echo "  kubectl describe pods -n $NAMESPACE"
        echo "  kubectl logs -l app.kubernetes.io/name=taskora-backend -n $NAMESPACE"
        echo "  kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp'"
        echo ""
        echo "================================================"
        return 1
    fi
}

# Main execution
main() {
    check_cluster
    check_namespace
    check_pods
    check_dapr_sidecars
    check_services
    check_health_endpoints
    check_ingress
    print_summary
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -n, --namespace NAME  Target namespace (default: taskora)"
            echo "  -t, --timeout SECS    Request timeout (default: 30)"
            echo "  -h, --help            Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

main
