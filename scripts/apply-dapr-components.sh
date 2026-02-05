#!/bin/bash
# Apply Dapr components to Kubernetes cluster
# Requires: kubectl configured with cluster context

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPONENTS_DIR="${COMPONENTS_DIR:-$PROJECT_ROOT/dapr/components}"
NAMESPACE="${NAMESPACE:-taskora}"

echo "================================================"
echo "Dapr Components Application Script"
echo "================================================"
echo "  Components Directory: $COMPONENTS_DIR"
echo "  Target Namespace: $NAMESPACE"
echo "================================================"

# Check prerequisites
check_prerequisites() {
    echo ""
    echo "[1/4] Checking prerequisites..."

    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        echo "ERROR: kubectl is not installed"
        exit 1
    fi
    echo "  kubectl: OK"

    # Check cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        echo "ERROR: Cannot connect to Kubernetes cluster"
        exit 1
    fi
    echo "  Cluster: Connected"

    # Check components directory exists
    if [ ! -d "$COMPONENTS_DIR" ]; then
        echo "ERROR: Components directory not found: $COMPONENTS_DIR"
        exit 1
    fi
    echo "  Components directory: Found"

    # Check for YAML files
    YAML_COUNT=$(ls -1 "$COMPONENTS_DIR"/*.yaml 2>/dev/null | wc -l)
    if [ "$YAML_COUNT" -eq 0 ]; then
        echo "ERROR: No YAML files found in $COMPONENTS_DIR"
        exit 1
    fi
    echo "  YAML files found: $YAML_COUNT"
}

# Ensure namespace exists
ensure_namespace() {
    echo ""
    echo "[2/4] Ensuring namespace exists..."

    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    echo "  Namespace '$NAMESPACE': Ready"
}

# Apply all Dapr components
apply_components() {
    echo ""
    echo "[3/4] Applying Dapr components..."

    APPLIED=0
    FAILED=0

    for COMPONENT_FILE in "$COMPONENTS_DIR"/*.yaml; do
        FILENAME=$(basename "$COMPONENT_FILE")
        echo "  Applying: $FILENAME"

        if kubectl apply -f "$COMPONENT_FILE" -n $NAMESPACE; then
            APPLIED=$((APPLIED + 1))
        else
            echo "    WARNING: Failed to apply $FILENAME"
            FAILED=$((FAILED + 1))
        fi
    done

    echo ""
    echo "  Applied: $APPLIED components"
    if [ "$FAILED" -gt 0 ]; then
        echo "  Failed: $FAILED components"
    fi
}

# Verify components
verify_components() {
    echo ""
    echo "[4/4] Verifying Dapr components..."

    # Wait a moment for components to be recognized
    sleep 2

    echo ""
    echo "  Dapr Components in namespace '$NAMESPACE':"
    kubectl get components.dapr.io -n $NAMESPACE 2>/dev/null || echo "  No components found (may need Dapr to be installed first)"

    echo ""
    echo "  Component Details:"
    for COMPONENT_FILE in "$COMPONENTS_DIR"/*.yaml; do
        FILENAME=$(basename "$COMPONENT_FILE")
        COMPONENT_NAME=$(grep -m1 "^  name:" "$COMPONENT_FILE" | awk '{print $2}' | tr -d '"')
        COMPONENT_TYPE=$(grep -m1 "^  type:" "$COMPONENT_FILE" | awk '{print $2}' | tr -d '"')

        if [ -n "$COMPONENT_NAME" ]; then
            STATUS=$(kubectl get components.dapr.io "$COMPONENT_NAME" -n $NAMESPACE -o jsonpath='{.metadata.name}' 2>/dev/null || echo "not found")
            if [ "$STATUS" = "$COMPONENT_NAME" ]; then
                echo "    $COMPONENT_NAME ($COMPONENT_TYPE): OK"
            else
                echo "    $COMPONENT_NAME ($COMPONENT_TYPE): PENDING"
            fi
        fi
    done
}

# Print summary
print_summary() {
    echo ""
    echo "================================================"
    echo "Components Applied Successfully"
    echo "================================================"
    echo ""
    echo "  Applied components from: $COMPONENTS_DIR"
    echo ""
    echo "  Verification commands:"
    echo "    kubectl get components.dapr.io -n $NAMESPACE"
    echo "    dapr components -k -n $NAMESPACE"
    echo ""
    echo "  Next steps:"
    echo "    1. Deploy application: ./scripts/deploy-production.sh"
    echo "    2. Verify health: ./scripts/verify-health.sh"
    echo "================================================"
}

# Main execution
main() {
    check_prerequisites
    ensure_namespace
    apply_components
    verify_components
    print_summary
}

main "$@"
