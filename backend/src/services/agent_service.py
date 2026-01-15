"""
Agent Service - Gemini AI Integration

Handles communication with the Gemini AI model for natural language
task management. Implements tool calling for MCP operations.
"""

import os
import logging
from typing import Optional, List, Any
from datetime import datetime

import google.generativeai as genai
from google.generativeai.types import FunctionDeclaration, Tool

from ..mcp.tools import TOOLS, execute_tool

# Configure logging
logger = logging.getLogger(__name__)


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
- "Delete task 3" -> First use list_tasks to get IDs, then delete_task
- "What's pending?" -> Use list_tasks with status "pending"

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

        # Map our roles to Gemini roles
        gemini_role = "user" if role == "user" else "model"

        history.append({
            "role": gemini_role,
            "parts": [content]
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

    except Exception as e:
        logger.error(f"Error generating response: {e}")
        # Return user-friendly error message
        return (
            "I'm having trouble processing your request right now. "
            "Please try again in a moment.",
            []
        )
