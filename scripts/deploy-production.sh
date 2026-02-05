#!/bin/bash
# Deploy Taskora to production DOKS cluster
# Orchestrates the full deployment pipeline

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
NAMESPACE="${NAMESPACE:-taskora}"
RELEASE_NAME="${RELEASE_NAME:-taskora}"
VALUES_FILE="${VALUES_FILE:-$PROJECT_ROOT/helm/taskora/values-prod.yaml}"
HELM_CHART="${HELM_CHART:-$PROJECT_ROOT/helm/taskora}"
TIMEOUT="${TIMEOUT:-300s}"

echo "================================================"
echo "Taskora Production Deployment"
echo "================================================"
echo "  Namespace: $NAMESPACE"
echo "  Release Name: $RELEASE_NAME"
echo "  Values File: $VALUES_FILE"
echo "  Helm Chart: $HELM_CHART"
echo "  Timeout: $TIMEOUT"
echo "================================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    if [ "$2" = "OK" ]; then
        echo -e "  $1: ${GREEN}$2${NC}"
    elif [ "$2" = "FAILED" ] || [ "$2" = "ERROR" ]; then
        echo -e "  $1: ${RED}$2${NC}"
    else
        echo -e "  $1: ${YELLOW}$2${NC}"
    fi
}

# Check prerequisites
check_prerequisites() {
    echo ""
    echo "[1/6] Checking prerequisites..."

    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_status "kubectl" "NOT FOUND"
        echo "  Install: https://kubernetes.io/docs/tasks/tools/"
        exit 1
    fi
    print_status "kubectl" "OK"

    # Check helm
    if ! command -v helm &> /dev/null; then
        print_status "helm" "NOT FOUND"
        echo "  Install: https://helm.sh/docs/intro/install/"
        exit 1
    fi
    print_status "helm" "OK"

    # Check cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        print_status "Cluster connection" "FAILED"
        echo "  Ensure kubeconfig is configured"
        exit 1
    fi
    print_status "Cluster connection" "OK"

    # Check Dapr
    if kubectl get namespace dapr-system &> /dev/null; then
        print_status "Dapr" "OK"
    else
        print_status "Dapr" "NOT INSTALLED"
        echo "  Run: ./scripts/install-dapr.sh"
        exit 1
    fi

    # Check values file
    if [ ! -f "$VALUES_FILE" ]; then
        print_status "Values file" "NOT FOUND"
        echo "  Expected: $VALUES_FILE"
        exit 1
    fi
    print_status "Values file" "OK"

    # Check Helm chart
    if [ ! -d "$HELM_CHART" ]; then
        print_status "Helm chart" "NOT FOUND"
        echo "  Expected: $HELM_CHART"
        exit 1
    fi
    print_status "Helm chart" "OK"
}

# Ensure namespace exists
ensure_namespace() {
    echo ""
    echo "[2/6] Ensuring namespace exists..."

    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    print_status "Namespace '$NAMESPACE'" "OK"
}

# Check secrets
check_secrets() {
    echo ""
    echo "[3/6] Checking required secrets..."

    if kubectl get secret taskora-secrets -n $NAMESPACE &> /dev/null; then
        print_status "taskora-secrets" "OK"
    else
        print_status "taskora-secrets" "NOT FOUND"
        echo ""
        echo "  Create the secrets:"
        echo "    kubectl create secret generic taskora-secrets -n $NAMESPACE \\"
        echo "      --from-literal=DATABASE_URL='postgresql://...' \\"
        echo "      --from-literal=COHERE_API_KEY='...' \\"
        echo "      --from-literal=BETTER_AUTH_SECRET='...'"
        echo ""
        read -p "  Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Apply Dapr components
apply_dapr_components() {
    echo ""
    echo "[4/6] Applying Dapr components..."

    COMPONENTS_DIR="$PROJECT_ROOT/dapr/components"

    if [ -d "$COMPONENTS_DIR" ]; then
        for file in "$COMPONENTS_DIR"/*.yaml; do
            if [ -f "$file" ]; then
                FILENAME=$(basename "$file")
                kubectl apply -f "$file" -n $NAMESPACE 2>/dev/null && \
                    print_status "$FILENAME" "OK" || \
                    print_status "$FILENAME" "FAILED"
            fi
        done
    else
        print_status "Components directory" "NOT FOUND"
        echo "  Skipping Dapr components"
    fi
}

# Deploy with Helm
deploy_helm() {
    echo ""
    echo "[5/6] Deploying with Helm..."

    echo "  Running: helm upgrade --install $RELEASE_NAME $HELM_CHART -n $NAMESPACE -f $VALUES_FILE --wait --timeout $TIMEOUT"

    helm upgrade --install $RELEASE_NAME $HELM_CHART \
        --namespace $NAMESPACE \
        --values $VALUES_FILE \
        --wait \
        --timeout $TIMEOUT \
        --atomic

    print_status "Helm deployment" "OK"
}

# Verify deployment
verify_deployment() {
    echo ""
    echo "[6/6] Verifying deployment..."

    echo ""
    echo "  Pods:"
    kubectl get pods -n $NAMESPACE -o wide

    echo ""
    echo "  Services:"
    kubectl get svc -n $NAMESPACE

    echo ""
    echo "  Ingress:"
    kubectl get ingress -n $NAMESPACE

    echo ""
    echo "  Helm Release:"
    helm list -n $NAMESPACE

    # Check pod status
    READY_PODS=$(kubectl get pods -n $NAMESPACE --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l)
    TOTAL_PODS=$(kubectl get pods -n $NAMESPACE --no-headers 2>/dev/null | wc -l)

    echo ""
    if [ "$READY_PODS" -eq "$TOTAL_PODS" ] && [ "$TOTAL_PODS" -gt 0 ]; then
        print_status "Pod Status" "OK ($READY_PODS/$TOTAL_PODS running)"
    else
        print_status "Pod Status" "WARNING ($READY_PODS/$TOTAL_PODS running)"
    fi
}

# Print summary
print_summary() {
    echo ""
    echo "================================================"
    echo "Deployment Summary"
    echo "================================================"

    # Get ingress host
    INGRESS_HOST=$(kubectl get ingress -n $NAMESPACE -o jsonpath='{.items[0].spec.rules[0].host}' 2>/dev/null || echo "N/A")
    INGRESS_IP=$(kubectl get ingress -n $NAMESPACE -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")

    echo ""
    echo "  Release: $RELEASE_NAME"
    echo "  Namespace: $NAMESPACE"
    echo "  Host: $INGRESS_HOST"
    echo "  IP: $INGRESS_IP"
    echo ""
    echo "  Access URLs:"
    echo "    Frontend: https://$INGRESS_HOST/"
    echo "    API: https://$INGRESS_HOST/api"
    echo "    Health: https://$INGRESS_HOST/health"
    echo ""
    echo "================================================"
    echo "Post-Deployment Verification:"
    echo "================================================"
    echo ""
    echo "  Run health checks:"
    echo "    ./scripts/verify-health.sh"
    echo ""
    echo "  View logs:"
    echo "    kubectl logs -l app.kubernetes.io/name=taskora-backend -n $NAMESPACE -f"
    echo ""
    echo "  Dapr dashboard:"
    echo "    dapr dashboard -k -p 9999"
    echo ""
    echo "================================================"
}

# Main execution
main() {
    START_TIME=$(date +%s)

    check_prerequisites
    ensure_namespace
    check_secrets
    apply_dapr_components
    deploy_helm
    verify_deployment
    print_summary

    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))

    echo ""
    echo "Deployment completed in ${DURATION}s"
    echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -f|--values)
            VALUES_FILE="$2"
            shift 2
            ;;
        -r|--release)
            RELEASE_NAME="$2"
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
            echo "  -n, --namespace NAME    Target namespace (default: taskora)"
            echo "  -f, --values FILE       Values file path"
            echo "  -r, --release NAME      Helm release name (default: taskora)"
            echo "  -t, --timeout DURATION  Helm timeout (default: 300s)"
            echo "  -h, --help              Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

main
