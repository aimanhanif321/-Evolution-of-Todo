"""
Cohere Integration Test

Tests the Cohere Chat API v2 with native tool calling.
Run with: python cohere_test.py
"""

import os
import asyncio
import logging
from pprint import pprint

# Setup logging to see what's happening
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Make sure your backend package is discoverable
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "src")))

from services.agent_service import generate_response_with_retry


async def test_add_task():
    """Test: add task buy milk"""
    print("\n" + "="*60)
    print("TEST 1: Add Task")
    print("="*60)

    user_id = "test_user"
    messages = []
    user_message = "add task buy milk"

    print(f"\nInput: {user_message}")

    final_text, tool_calls = await generate_response_with_retry(user_id, messages, user_message)

    print(f"\n--- AI Response ---")
    print(final_text)

    print(f"\n--- Tool Calls ---")
    if tool_calls:
        for tc in tool_calls:
            print(f"  Tool: {tc['tool']}")
            print(f"  Params: {tc['params']}")
            print(f"  Result: {tc.get('result', 'N/A')}")
    else:
        print("  No tools called")

    return tool_calls


async def test_list_tasks():
    """Test: list tasks"""
    print("\n" + "="*60)
    print("TEST 2: List Tasks")
    print("="*60)

    user_id = "test_user"
    messages = []
    user_message = "list tasks"

    print(f"\nInput: {user_message}")

    final_text, tool_calls = await generate_response_with_retry(user_id, messages, user_message)

    print(f"\n--- AI Response ---")
    print(final_text)

    print(f"\n--- Tool Calls ---")
    if tool_calls:
        for tc in tool_calls:
            print(f"  Tool: {tc['tool']}")
            print(f"  Params: {tc['params']}")
            print(f"  Result: {tc.get('result', 'N/A')}")
    else:
        print("  No tools called")

    return tool_calls


async def test_complete_task():
    """Test: complete task 1"""
    print("\n" + "="*60)
    print("TEST 3: Complete Task")
    print("="*60)

    user_id = "test_user"
    messages = []
    user_message = "complete task 1"

    print(f"\nInput: {user_message}")

    final_text, tool_calls = await generate_response_with_retry(user_id, messages, user_message)

    print(f"\n--- AI Response ---")
    print(final_text)

    print(f"\n--- Tool Calls ---")
    if tool_calls:
        for tc in tool_calls:
            print(f"  Tool: {tc['tool']}")
            print(f"  Params: {tc['params']}")
            print(f"  Result: {tc.get('result', 'N/A')}")
    else:
        print("  No tools called")

    return tool_calls


async def test_casual_chat():
    """Test: casual conversation (no tool needed)"""
    print("\n" + "="*60)
    print("TEST 4: Casual Chat (No Tool)")
    print("="*60)

    user_id = "test_user"
    messages = []
    user_message = "Hello! How are you today?"

    print(f"\nInput: {user_message}")

    final_text, tool_calls = await generate_response_with_retry(user_id, messages, user_message)

    print(f"\n--- AI Response ---")
    print(final_text)

    print(f"\n--- Tool Calls ---")
    if tool_calls:
        for tc in tool_calls:
            print(f"  Tool: {tc['tool']}")
            print(f"  Params: {tc['params']}")
    else:
        print("  No tools called (expected for casual chat)")

    return tool_calls


async def run_all_tests():
    """Run all tests in sequence"""
    print("\n" + "#"*60)
    print("# COHERE INTEGRATION TEST SUITE")
    print("#"*60)

    # Test 1: Add task
    add_result = await test_add_task()

    # Test 2: List tasks
    list_result = await test_list_tasks()

    # Test 3: Complete task
    complete_result = await test_complete_task()

    # Test 4: Casual chat
    chat_result = await test_casual_chat()

    # Summary
    print("\n" + "#"*60)
    print("# TEST SUMMARY")
    print("#"*60)
    print(f"\n  Add Task:     {'PASS - Tool called' if add_result else 'FAIL - No tool'}")
    print(f"  List Tasks:   {'PASS - Tool called' if list_result else 'FAIL - No tool'}")
    print(f"  Complete:     {'PASS - Tool called' if complete_result else 'FAIL - No tool'}")
    print(f"  Casual Chat:  {'PASS - No tool (correct)' if not chat_result else 'WARN - Tool called'}")

    print("\n" + "#"*60)


if __name__ == "__main__":
    # Check for API key
    COHERE_API_KEY = os.getenv("COHERE_API_KEY")
    if not COHERE_API_KEY:
        print("ERROR: Set COHERE_API_KEY environment variable first")
        print("  Windows:  set COHERE_API_KEY=your-key-here")
        print("  Linux:    export COHERE_API_KEY=your-key-here")
        sys.exit(1)

    print(f"Using API key: {COHERE_API_KEY[:10]}...")

    # Run tests
    asyncio.run(run_all_tests())
