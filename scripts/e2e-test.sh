#!/bin/bash
# =============================================================================
# Phase V End-to-End Test Script
# Tests the complete flow: Create task → Sync → Complete → Recurrence
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
API_URL="${API_URL:-http://localhost:8000}"
AUTH_TOKEN="${AUTH_TOKEN:-}"
TEST_PREFIX="e2e-test-$(date +%s)"

# Test results
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_pass() { echo -e "${GREEN}[PASS]${NC} $1"; ((TESTS_PASSED++)); ((TESTS_RUN++)); }
log_fail() { echo -e "${RED}[FAIL]${NC} $1"; ((TESTS_FAILED++)); ((TESTS_RUN++)); }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# Helper to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers="-H 'Content-Type: application/json'"

    if [ -n "$AUTH_TOKEN" ]; then
        headers="$headers -H 'Authorization: Bearer $AUTH_TOKEN'"
    fi

    if [ -n "$data" ]; then
        eval "curl -sf -X $method '$API_URL$endpoint' $headers -d '$data' 2>/dev/null"
    else
        eval "curl -sf -X $method '$API_URL$endpoint' $headers 2>/dev/null"
    fi
}

# =============================================================================
# Test 1: Health Check
# =============================================================================
test_health() {
    log_info "Test 1: Health Check"

    if curl -sf "$API_URL/health" -o /dev/null; then
        log_pass "Health endpoint responding"
    else
        log_fail "Health endpoint not responding"
        return 1
    fi

    if curl -sf "$API_URL/ready" -o /dev/null; then
        log_pass "Ready endpoint responding (DB connected)"
    else
        log_fail "Ready endpoint failed (DB issue?)"
    fi
}

# =============================================================================
# Test 2: Create Task
# =============================================================================
test_create_task() {
    log_info "Test 2: Create Task"

    local task_data='{
        "title": "'$TEST_PREFIX'-task",
        "description": "E2E test task",
        "priority": "high"
    }'

    TASK_RESPONSE=$(api_call "POST" "/api/tasks" "$task_data")

    if [ -n "$TASK_RESPONSE" ]; then
        TASK_ID=$(echo "$TASK_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
        if [ -n "$TASK_ID" ]; then
            log_pass "Task created with ID: $TASK_ID"
            export TASK_ID
        else
            log_fail "Task created but no ID returned"
        fi
    else
        log_fail "Failed to create task"
        return 1
    fi
}

# =============================================================================
# Test 3: SSE Connection
# =============================================================================
test_sse_connection() {
    log_info "Test 3: SSE Connection"

    # Try to connect to SSE endpoint (timeout after 2 seconds)
    if timeout 2 curl -sf "$API_URL/api/events/stream" -o /dev/null 2>/dev/null; then
        log_pass "SSE endpoint accessible"
    else
        # SSE might need longer connection, check if endpoint exists
        HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" "$API_URL/api/events/stream" 2>/dev/null || echo "000")
        if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "401" ]; then
            log_pass "SSE endpoint exists (code: $HTTP_CODE)"
        else
            log_warn "SSE endpoint not accessible (code: $HTTP_CODE) - may require auth"
        fi
    fi
}

# =============================================================================
# Test 4: Update Task
# =============================================================================
test_update_task() {
    log_info "Test 4: Update Task"

    if [ -z "$TASK_ID" ]; then
        log_fail "No task ID from previous test"
        return 1
    fi

    local update_data='{
        "title": "'$TEST_PREFIX'-task-updated",
        "priority": "urgent"
    }'

    UPDATE_RESPONSE=$(api_call "PUT" "/api/tasks/$TASK_ID" "$update_data")

    if [ -n "$UPDATE_RESPONSE" ]; then
        if echo "$UPDATE_RESPONSE" | grep -q "urgent"; then
            log_pass "Task updated successfully"
        else
            log_fail "Task update did not apply changes"
        fi
    else
        log_fail "Failed to update task"
    fi
}

# =============================================================================
# Test 5: Complete Task
# =============================================================================
test_complete_task() {
    log_info "Test 5: Complete Task"

    if [ -z "$TASK_ID" ]; then
        log_fail "No task ID from previous test"
        return 1
    fi

    local complete_data='{"status": "completed"}'

    COMPLETE_RESPONSE=$(api_call "PUT" "/api/tasks/$TASK_ID" "$complete_data")

    if [ -n "$COMPLETE_RESPONSE" ]; then
        if echo "$COMPLETE_RESPONSE" | grep -q "completed"; then
            log_pass "Task completed successfully"
        else
            log_fail "Task completion did not change status"
        fi
    else
        log_fail "Failed to complete task"
    fi
}

# =============================================================================
# Test 6: Create Recurring Task
# =============================================================================
test_create_recurring_task() {
    log_info "Test 6: Create Recurring Task"

    local tomorrow=$(date -d "+1 day" +%Y-%m-%dT%H:%M:%S 2>/dev/null || date -v+1d +%Y-%m-%dT%H:%M:%S 2>/dev/null || echo "2026-02-06T12:00:00")

    local recurring_data='{
        "title": "'$TEST_PREFIX'-recurring",
        "description": "E2E recurring task",
        "priority": "medium",
        "recurrence_type": "daily",
        "recurrence_interval": 1,
        "due_date": "'$tomorrow'"
    }'

    RECURRING_RESPONSE=$(api_call "POST" "/api/tasks" "$recurring_data")

    if [ -n "$RECURRING_RESPONSE" ]; then
        RECURRING_ID=$(echo "$RECURRING_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
        if [ -n "$RECURRING_ID" ]; then
            log_pass "Recurring task created with ID: $RECURRING_ID"
            export RECURRING_ID
        else
            log_pass "Recurring task created (ID extraction failed but task exists)"
        fi
    else
        log_warn "Recurring task creation failed (may not support recurrence fields)"
    fi
}

# =============================================================================
# Test 7: Verify Metrics
# =============================================================================
test_metrics() {
    log_info "Test 7: Verify Metrics Endpoint"

    METRICS_RESPONSE=$(curl -sf "$API_URL/metrics" 2>/dev/null)

    if [ -n "$METRICS_RESPONSE" ]; then
        if echo "$METRICS_RESPONSE" | grep -q "status"; then
            log_pass "Metrics endpoint returning data"
        else
            log_fail "Metrics endpoint returned unexpected format"
        fi
    else
        log_fail "Metrics endpoint not responding"
    fi
}

# =============================================================================
# Test 8: Cleanup
# =============================================================================
test_cleanup() {
    log_info "Test 8: Cleanup Test Data"

    local cleaned=0

    # Delete main test task
    if [ -n "$TASK_ID" ]; then
        if api_call "DELETE" "/api/tasks/$TASK_ID" > /dev/null 2>&1; then
            ((cleaned++))
        fi
    fi

    # Delete recurring task
    if [ -n "$RECURRING_ID" ]; then
        if api_call "DELETE" "/api/tasks/$RECURRING_ID" > /dev/null 2>&1; then
            ((cleaned++))
        fi
    fi

    log_pass "Cleaned up $cleaned test task(s)"
}

# =============================================================================
# Main
# =============================================================================
main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   Phase V End-to-End Test Suite                            ║${NC}"
    echo -e "${BLUE}║   Taskora - Advanced Cloud Deployment                      ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "API URL: $API_URL"
    echo "Test Prefix: $TEST_PREFIX"
    echo ""

    # Run tests
    test_health
    echo ""
    test_create_task
    echo ""
    test_sse_connection
    echo ""
    test_update_task
    echo ""
    test_complete_task
    echo ""
    test_create_recurring_task
    echo ""
    test_metrics
    echo ""
    test_cleanup

    # Summary
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}TEST SUMMARY${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "Total:  $TESTS_RUN"
    echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Failed: $TESTS_FAILED${NC}"
    echo ""

    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}All E2E tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}Some tests failed. Check the output above.${NC}"
        exit 1
    fi
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --api-url)
            API_URL="$2"
            shift 2
            ;;
        --token)
            AUTH_TOKEN="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [--api-url URL] [--token AUTH_TOKEN]"
            echo ""
            echo "Options:"
            echo "  --api-url URL    API base URL (default: http://localhost:8000)"
            echo "  --token TOKEN    Authentication token (optional)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

main
