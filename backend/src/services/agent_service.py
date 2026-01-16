"""
Agent Service - Cohere AI Integration (Chat API v2)

Uses Cohere's Chat API with NATIVE tool calling.
No more prompt engineering for JSON - tools are called directly by the API.
"""

import os
import logging
import asyncio
import json
from typing import List, Any, Optional
from datetime import datetime

import cohere
from cohere import ToolCallV2, ToolCallV2Function

from ..mcp.tools import TOOLS, execute_tool

# Configure logging
logger = logging.getLogger(__name__)
MAX_RETRIES = 3
BASE_DELAY = 1.0

# ============================================================================#
# Configuration
# ============================================================================#

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
if not COHERE_API_KEY:
    raise RuntimeError("COHERE_API_KEY environment variable is not set")

# Use ClientV2 for the v2 API with native tool calling
co_client = cohere.ClientV2(COHERE_API_KEY)

# Model to use - command-r-plus is best for tool calling, command-r is faster
COHERE_MODEL = "command-r-plus-08-2024"

# ============================================================================#
# System Prompt (Preamble)
# ============================================================================#

SYSTEM_PROMPT = """You are Taskora AI, a helpful task management assistant.

Your job is to help users manage their tasks using the available tools.

RULES:
1. When a user wants to add, list, complete, delete, or update tasks - USE THE TOOLS.
2. For "add task X" -> use add_task with title="X"
3. For "list tasks" or "show tasks" -> use list_tasks
4. For "complete task N" or "mark N as done" -> use complete_task with task_id=N
5. For "delete task N" or "remove task N" -> use delete_task with task_id=N
6. For "update task N to X" -> use update_task with task_id=N and new title
7. After executing a tool, summarize what you did in a friendly way.
8. For non-task questions, respond naturally and helpfully.

Be concise, friendly, and always confirm when you've completed an action."""

# ============================================================================#
# Convert Tool Schemas to Cohere Format
# ============================================================================#

def get_cohere_tools() -> List[cohere.ToolV2]:
    """
    Convert our tool schemas to Cohere's ToolV2 format.
    """
    cohere_tools = []
    for tool in TOOLS:
        cohere_tool = cohere.ToolV2(
            type="function",
            function=cohere.ToolV2Function(
                name=tool["name"],
                description=tool["description"],
                parameters=tool["parameters"]
            )
        )
        cohere_tools.append(cohere_tool)
    return cohere_tools


# ============================================================================#
# Build Conversation History for Cohere
# ============================================================================#

def build_chat_history(messages: List[dict]) -> List[dict]:
    """
    Convert message history to Cohere chat format.
    """
    chat_history = []
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")

        if role == "user":
            chat_history.append({"role": "user", "content": content})
        elif role in ("assistant", "model"):
            chat_history.append({"role": "assistant", "content": content})

    return chat_history


# ============================================================================#
# Execute Tool Calls from Cohere Response
# ============================================================================#

async def execute_cohere_tool_calls(
    tool_calls: List[ToolCallV2],
    user_id: str
) -> tuple[List[dict], List[dict]]:
    """
    Execute tool calls returned by Cohere and format results.

    Returns:
        Tuple of (tool_result_messages, tool_calls_for_api_response)
    """
    tool_result_messages = []
    tool_calls_response = []

    for tc in tool_calls:
        tool_name = tc.function.name
        tool_call_id = tc.id

        # Parse arguments - Cohere returns them as a JSON string
        try:
            params = json.loads(tc.function.arguments) if tc.function.arguments else {}
        except json.JSONDecodeError:
            params = {}

        logger.info(f"Executing tool: {tool_name} with params: {params}")

        try:
            # Execute the tool
            result = await execute_tool(tool_name, user_id, params)
            result_str = json.dumps(result)

            # Format for Cohere v2 - each tool result is a separate message
            # with role="tool" and tool_call_id matching the call
            tool_result_messages.append({
                "role": "tool",
                "tool_call_id": tool_call_id,
                "content": result_str
            })

            # Format for our API response
            tool_calls_response.append({
                "tool": tool_name,
                "params": params,
                "result": result,
                "executed_at": datetime.utcnow().isoformat()
            })

        except Exception as e:
            error_msg = str(e)
            logger.error(f"Tool execution error: {error_msg}")

            tool_result_messages.append({
                "role": "tool",
                "tool_call_id": tool_call_id,
                "content": json.dumps({"error": error_msg})
            })

            tool_calls_response.append({
                "tool": tool_name,
                "params": params,
                "result": {"error": error_msg},
                "executed_at": datetime.utcnow().isoformat()
            })

    return tool_result_messages, tool_calls_response


# ============================================================================#
# Main Agent Response Function
# ============================================================================#

async def generate_response(
    user_id: str,
    messages: List[dict],
    user_message: str
) -> tuple[str, List[dict]]:
    """
    Generate AI response using Cohere Chat API with tool calling.
    """
    try:
        # Build chat history
        chat_history = build_chat_history(messages)

        # Add current user message
        chat_history.append({"role": "user", "content": user_message})

        # Get tools in Cohere format
        tools = get_cohere_tools()

        logger.info(f"Sending to Cohere: {user_message[:50]}...")

        # Call Cohere Chat API v2
        response = co_client.chat(
            model=COHERE_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                *chat_history
            ],
            tools=tools
        )

        logger.info(f"Cohere response finish_reason: {response.finish_reason}")

        all_tool_calls = []

        # Check if the model wants to call tools
        if response.message and response.message.tool_calls:
            logger.info(f"Tool calls requested: {len(response.message.tool_calls)}")

            # Execute all tool calls
            tool_result_messages, tool_calls_response = await execute_cohere_tool_calls(
                response.message.tool_calls,
                user_id
            )
            all_tool_calls.extend(tool_calls_response)

            # Build the assistant message with tool_calls
            # Cohere v2 requires tool_calls in the assistant message as a list of dicts
            assistant_tool_calls = []
            for tc in response.message.tool_calls:
                assistant_tool_calls.append({
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments or "{}"
                    }
                })

            # Build the full message history including tool calls and results
            messages_with_tools = [
                {"role": "system", "content": SYSTEM_PROMPT},
                *chat_history,
                {"role": "assistant", "tool_calls": assistant_tool_calls},
                *tool_result_messages  # Each tool result is a separate message
            ]

            # Get final response after tool execution
            final_response = co_client.chat(
                model=COHERE_MODEL,
                messages=messages_with_tools,
                tools=tools
            )

            # Extract text response
            if final_response.message and final_response.message.content:
                final_text = final_response.message.content[0].text
            else:
                # Generate a default response based on tool results
                final_text = format_tool_results_message(tool_calls_response)

            return final_text, all_tool_calls

        # No tool calls - just return the text response
        if response.message and response.message.content:
            text_response = response.message.content[0].text
        else:
            text_response = "I'm here to help with your tasks. What would you like to do?"

        return text_response, []

    except cohere.errors.UnauthorizedError:
        logger.error("Cohere API: Invalid API key")
        raise RuntimeError("Invalid Cohere API key. Please check your COHERE_API_KEY.")

    except cohere.errors.TooManyRequestsError:
        logger.error("Cohere API: Rate limit exceeded")
        raise RuntimeError("Rate limit exceeded. Please try again later.")

    except Exception as e:
        import traceback
        error_msg = f"{type(e).__name__}: {e}"
        logger.error(f"Error generating response: {error_msg}")
        logger.error(f"Traceback:\n{traceback.format_exc()}")
        raise


def format_tool_results_message(tool_calls: List[dict]) -> str:
    """Format a friendly message from tool execution results."""
    if not tool_calls:
        return "Done!"

    messages = []
    for tc in tool_calls:
        tool = tc["tool"]
        result = tc.get("result", {})

        if tool == "add_task":
            title = result.get("title", "your task")
            messages.append(f"Added task: \"{title}\"")
        elif tool == "list_tasks":
            count = result.get("count", 0)
            if count == 0:
                messages.append("You have no tasks.")
            else:
                tasks = result.get("tasks", [])
                task_list = []
                for t in tasks:
                    status = "✓" if t.get("completed") else "○"
                    task_list.append(f"{status} [{t['task_id']}] {t['title']}")
                messages.append(f"Your tasks ({count}):\n" + "\n".join(task_list))
        elif tool == "complete_task":
            title = result.get("title", f"Task {tc['params'].get('task_id')}")
            messages.append(f"Completed: \"{title}\"")
        elif tool == "delete_task":
            title = result.get("title", f"Task {tc['params'].get('task_id')}")
            messages.append(f"Deleted: \"{title}\"")
        elif tool == "update_task":
            title = result.get("title", f"Task {tc['params'].get('task_id')}")
            messages.append(f"Updated task to: \"{title}\"")

    return " | ".join(messages) if len(messages) > 1 else messages[0] if messages else "Done!"


# ============================================================================#
# Retry Logic
# ============================================================================#

async def generate_response_with_retry(
    user_id: str,
    messages: List[dict],
    user_message: str,
    max_retries: int = MAX_RETRIES
) -> tuple[str, List[dict]]:
    """
    Generate response with exponential backoff retry.
    """
    last_error = None

    for attempt in range(max_retries):
        try:
            return await generate_response(user_id, messages, user_message)
        except RuntimeError as e:
            # Don't retry auth errors
            error_msg = str(e)
            if "Invalid Cohere API key" in error_msg:
                return f"Configuration error: {error_msg}", []
            raise
        except Exception as e:
            last_error = e
            logger.warning(f"Attempt {attempt + 1}/{max_retries} failed: {e}")

            if attempt < max_retries - 1:
                delay = BASE_DELAY * (2 ** attempt)
                await asyncio.sleep(delay)

    logger.error(f"All {max_retries} retries failed: {last_error}")
    return "I'm having trouble processing your request right now. Please try again.", []
