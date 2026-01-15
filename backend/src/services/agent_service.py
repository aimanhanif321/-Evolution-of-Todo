"""
Agent Service - Gemini AI Integration

Handles communication with the Gemini AI model for natural language
task management. Implements tool calling for MCP operations.
"""

import os
import logging
import asyncio
from typing import Optional, List, Any
from datetime import datetime

import google.generativeai as genai
from google.generativeai.types import FunctionDeclaration, Tool
from google.api_core import exceptions as google_exceptions

from ..mcp.tools import TOOLS, execute_tool

# Configure logging
logger = logging.getLogger(__name__)

# Retry configuration (T155)
MAX_RETRIES = 3
BASE_DELAY = 1.0  # seconds


# ============================================================================
# Configuration
# ============================================================================

def configure_gemini() -> None:
    """Configure Gemini API with API key from environment."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable is not set")
    genai.configure(api_key=api_key)


# ============================================================================
# System Prompt
# ============================================================================

SYSTEM_PROMPT = """You are Taskora AI, a helpful task management assistant. You help users manage their todo list through natural conversation.

CAPABILITIES:
- Add new tasks (add_task)
- List tasks with optional filtering (list_tasks)
- Mark tasks as complete (complete_task)
- Delete tasks (delete_task)
- Update task details (update_task)

RULES:
1. Always be friendly and conversational
2. Confirm every action you take
3. If a user's request is ambiguous, ask for clarification
4. When referencing tasks by number or position (like "the first one", "task 3"), first call list_tasks to get current task IDs
5. Never make up task IDs - always verify they exist using list_tasks first
6. Handle errors gracefully with helpful suggestions
7. Keep responses concise but informative

RESPONSE FORMAT:
- Use natural language, not technical jargon
- Include relevant task details in responses
- Offer helpful follow-up suggestions when appropriate

EXAMPLES:
- "Add a task to buy groceries" -> Use add_task with title "buy groceries"
- "Show my tasks" -> Use list_tasks with status "all"
- "Mark the first task as done" -> First use list_tasks, then complete_task with the first task's ID
- "Complete task 3" -> First use list_tasks to get IDs, then complete_task
- "Done with the grocery task" -> First use list_tasks to find the task, then complete_task
- "I finished buying groceries" -> First use list_tasks to find the matching task, then complete_task
- "Check off the meeting task" -> First use list_tasks to find "meeting", then complete_task
- "Delete task 3" -> First use list_tasks to get IDs, then delete_task
- "What's pending?" -> Use list_tasks with status "pending"

COMPLETION PHRASES TO RECOGNIZE:
- "mark as done", "mark it done", "mark complete", "mark as complete"
- "complete", "finish", "done with", "finished"
- "check off", "tick off", "cross off"
- When user says "it" or "that task", refer to the most recently mentioned task

DELETION PHRASES TO RECOGNIZE:
- "delete", "remove", "get rid of", "trash"
- "clear", "cancel", "drop"
- When deleting multiple tasks (e.g., "delete all completed tasks"), confirm with the user before proceeding
- IMPORTANT: Never delete tasks without user confirmation if the request is ambiguous

UPDATE/EDIT PHRASES TO RECOGNIZE:
- "update", "edit", "change", "modify", "rename"
- "set the title to", "change title to", "rename to"
- "set description to", "add description", "change description"
- When user wants to update a task, ask which field (title or description) if not clear
- First use list_tasks to find the task, then update_task with the changes

MULTI-TURN CONTEXT HANDLING:
- Remember the task list from the most recent list_tasks call in this conversation
- When user says "the first one", "the second one", etc., use the task order from the last list_tasks result
- When user says "it", "that task", or "this one", refer to the most recently mentioned or acted-upon task
- If user gives a number like "task 1" or "number 1", first call list_tasks to verify the correct task ID
- Use conversation context to understand which task the user is referring to
- If the reference is ambiguous, politely ask for clarification with the current task list

Always be helpful and make task management feel effortless!"""


# ============================================================================
# Model Setup
# ============================================================================

def get_gemini_model() -> genai.GenerativeModel:
    """
    Create and return a configured Gemini model with tools.

    Returns:
        Configured GenerativeModel instance
    """
    # Convert tool schemas to Gemini FunctionDeclaration format
    function_declarations = []
    for tool_schema in TOOLS:
        func_decl = FunctionDeclaration(
            name=tool_schema["name"],
            description=tool_schema["description"],
            parameters=tool_schema["parameters"]
        )
        function_declarations.append(func_decl)

    # Create tools object
    tools = Tool(function_declarations=function_declarations)

    # Create model with tools and system instruction
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        tools=[tools],
        system_instruction=SYSTEM_PROMPT
    )

    return model


# ============================================================================
# Message History Building
# ============================================================================

def build_message_history(messages: List[dict]) -> List[dict]:
    """
    Convert stored messages to Gemini conversation format.

    Args:
        messages: List of message dicts with role, content, tool_calls

    Returns:
        List of messages in Gemini format
    """
    history = []

    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        tool_calls = msg.get("tool_calls")

        # Map our roles to Gemini roles
        gemini_role = "user" if role == "user" else "model"

        # Include tool_calls context for assistant messages (T146)
        # This helps the AI understand what actions were taken previously
        parts = [content]
        if tool_calls and gemini_role == "model":
            tool_context = []
            for tc in tool_calls:
                tool_name = tc.get("tool", "unknown")
                result = tc.get("result", {})
                # Include relevant task info from tool results
                if tool_name == "list_tasks" and "tasks" in result:
                    tasks = result["tasks"]
                    if tasks:
                        task_list = ", ".join([f"#{t.get('task_id', '?')}: {t.get('title', 'Untitled')}" for t in tasks[:10]])
                        tool_context.append(f"[Listed tasks: {task_list}]")
                elif tool_name in ["add_task", "complete_task", "delete_task", "update_task"]:
                    task_id = result.get("task_id")
                    title = result.get("title")
                    status = result.get("status")
                    if task_id and title:
                        tool_context.append(f"[{tool_name}: #{task_id} '{title}' - {status}]")
            if tool_context:
                parts.append("\n".join(tool_context))

        history.append({
            "role": gemini_role,
            "parts": parts
        })

    return history


# ============================================================================
# Tool Call Processing
# ============================================================================

async def process_tool_calls(
    response: Any,
    user_id: str
) -> tuple[List[dict], str]:
    """
    Process tool calls from Gemini response.

    Args:
        response: Gemini response object
        user_id: User ID for tool execution

    Returns:
        Tuple of (tool_calls_results, final_text_response)
    """
    tool_calls_results = []
    final_response = ""

    # Check if response has candidates
    if not response.candidates:
        return tool_calls_results, "I'm having trouble processing that. Could you try again?"

    candidate = response.candidates[0]

    # Process each part of the response
    for part in candidate.content.parts:
        # Check for text response
        if hasattr(part, 'text') and part.text:
            final_response = part.text

        # Check for function call
        if hasattr(part, 'function_call') and part.function_call:
            func_call = part.function_call
            tool_name = func_call.name
            params = dict(func_call.args) if func_call.args else {}

            logger.info(f"Executing tool: {tool_name} with params: {params}")

            try:
                # Execute the tool
                result = await execute_tool(tool_name, user_id, params)

                tool_calls_results.append({
                    "tool": tool_name,
                    "params": params,
                    "result": result,
                    "executed_at": datetime.utcnow().isoformat()
                })

                logger.info(f"Tool {tool_name} executed successfully: {result}")

            except ValueError as e:
                logger.warning(f"Tool {tool_name} failed: {e}")
                tool_calls_results.append({
                    "tool": tool_name,
                    "params": params,
                    "result": {"error": str(e)},
                    "executed_at": datetime.utcnow().isoformat()
                })

            except Exception as e:
                logger.error(f"Unexpected error in tool {tool_name}: {e}")
                tool_calls_results.append({
                    "tool": tool_name,
                    "params": params,
                    "result": {"error": "An unexpected error occurred"},
                    "executed_at": datetime.utcnow().isoformat()
                })

    return tool_calls_results, final_response


# ============================================================================
# Main Agent Function
# ============================================================================

async def generate_response(
    user_id: str,
    messages: List[dict],
    user_message: str
) -> tuple[str, List[dict]]:
    """
    Generate AI response for user message.

    Args:
        user_id: User ID for tool execution
        messages: Conversation history
        user_message: Current user message

    Returns:
        Tuple of (response_text, tool_calls)
    """
    try:
        # Ensure Gemini is configured
        configure_gemini()

        # Get model
        model = get_gemini_model()

        # Build history from past messages
        history = build_message_history(messages)

        # Start or continue chat
        chat = model.start_chat(history=history)

        # Send user message and get response
        response = chat.send_message(user_message)

        # Process any tool calls
        tool_calls, text_response = await process_tool_calls(response, user_id)

        # If we have tool calls but no text response, generate a follow-up
        if tool_calls and not text_response:
            # Get the tool results summary
            tool_summaries = []
            for tc in tool_calls:
                result = tc.get("result", {})
                if "error" in result:
                    tool_summaries.append(f"Error: {result['error']}")
                else:
                    status = result.get("status", "done")
                    title = result.get("title", "task")
                    tool_summaries.append(f"{tc['tool']}: {status} - {title}")

            # Generate natural response based on tool results
            follow_up = chat.send_message(
                f"The tools returned these results: {tool_summaries}. "
                "Please provide a natural, friendly response to the user about what was done."
            )

            if follow_up.candidates:
                for part in follow_up.candidates[0].content.parts:
                    if hasattr(part, 'text') and part.text:
                        text_response = part.text
                        break

        # Fallback response if still empty
        if not text_response:
            text_response = "I've completed your request!"

        return text_response, tool_calls

    except google_exceptions.DeadlineExceeded as e:
        # T153: Handle Gemini API timeout
        logger.error(f"Gemini API timeout: {e}")
        return (
            "I'm taking too long to think. Please try a simpler request or try again.",
            []
        )

    except google_exceptions.ResourceExhausted as e:
        # T154: Handle rate limit (429)
        logger.warning(f"Gemini API rate limited: {e}")
        return (
            "I'm getting too many requests right now. Please wait a moment and try again.",
            []
        )

    except google_exceptions.ServiceUnavailable as e:
        # T155: Transient error - could retry
        logger.warning(f"Gemini API unavailable: {e}")
        return (
            "The AI service is temporarily unavailable. Please try again in a moment.",
            []
        )

    except Exception as e:
        logger.error(f"Error generating response: {e}")
        # Return user-friendly error message
        return (
            "I'm having trouble processing your request right now. "
            "Please try again in a moment.",
            []
        )


async def generate_response_with_retry(
    user_id: str,
    messages: List[dict],
    user_message: str,
    max_retries: int = MAX_RETRIES
) -> tuple[str, List[dict]]:
    """
    Generate AI response with retry logic for transient errors (T155).

    Uses exponential backoff for retries on rate limits and service unavailability.
    """
    last_error = None

    for attempt in range(max_retries):
        try:
            return await generate_response(user_id, messages, user_message)
        except google_exceptions.ResourceExhausted as e:
            # Rate limited - wait and retry
            last_error = e
            delay = BASE_DELAY * (2 ** attempt)
            logger.warning(f"Rate limited, retrying in {delay}s (attempt {attempt + 1}/{max_retries})")
            await asyncio.sleep(delay)
        except google_exceptions.ServiceUnavailable as e:
            # Service unavailable - wait and retry
            last_error = e
            delay = BASE_DELAY * (2 ** attempt)
            logger.warning(f"Service unavailable, retrying in {delay}s (attempt {attempt + 1}/{max_retries})")
            await asyncio.sleep(delay)
        except Exception as e:
            # Non-retryable error
            logger.error(f"Non-retryable error: {e}")
            raise

    # All retries exhausted
    logger.error(f"All {max_retries} retries failed: {last_error}")
    return (
        "I'm experiencing issues right now. Please try again later.",
        []
    )
