"""
Chat API Router - Phase III AI Chatbot

Endpoints (mounted at /api prefix in main.py):
- POST /{user_id}/chat - Send chat message
- GET /{user_id}/conversations - List conversations
- GET /{user_id}/conversations/{conversation_id}/messages - Get messages
- DELETE /{user_id}/conversations/{conversation_id} - Delete conversation
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional

from ..dependencies.auth_dependencies import get_current_user
from ..services.chat_service import (
    process_chat_message,
    get_user_conversations,
    get_conversation_with_messages,
    delete_conversation,
)
from .schemas.chat_schemas import (
    ChatRequest,
    ChatResponse,
    ToolCallResult,
    ConversationListResponse,
    ConversationSummary,
    MessagesListResponse,
    MessageResponse,
    DeleteConversationResponse,
    ErrorResponse,
)
from .schemas.chat_schemas import ToolCallResult


router = APIRouter()


# ============================================================================
# POST /{user_id}/chat - Send chat message (T072-T078)
# ============================================================================

@router.post(
    "/{user_id}/chat",
    response_model=ChatResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        500: {"model": ErrorResponse, "description": "Server error"},
    }
)
async def send_chat_message(
    user_id: str,
    request: ChatRequest,
    current_user_id: str = Depends(get_current_user)
):
    """
    Send a chat message and get AI response.

    - Creates new conversation if conversation_id not provided
    - Processes message through Gemini AI
    - Executes any MCP tool calls
    - Returns AI response with tool call results
    """
    # T074: Validate user_id matches JWT token
    if user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "FORBIDDEN",
                "message": "You don't have access to this resource"
            }
        )

    # T075: Message validation (handled by Pydantic, but add explicit check)
    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail={
                "code": "MESSAGE_REQUIRED",
                "message": "Please enter a message"
            }
        )

    if len(request.message) > 2000:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "MESSAGE_TOO_LONG",
                "message": "Message is too long (max 2000 characters)"
            }
        )

    try:
        # T076: Call chat service and return response
        conversation_id, response_text, tool_calls = await process_chat_message(
            user_id=user_id,
            conversation_id=request.conversation_id,
            message=request.message.strip()
        )

        # Convert tool calls to response format
        tool_call_results = [
            ToolCallResult(
                tool=tc["tool"],
                params=tc["params"],
                result=tc.get("result")
            )
            for tc in tool_calls
        ]

        return ChatResponse(
            conversation_id=conversation_id,
            response=response_text,
            tool_calls=tool_call_results
        )

    except ValueError as e:
        # T077: Handle validation errors
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "CONVERSATION_NOT_FOUND",
                    "message": "Conversation not found"
                }
            )
        elif "access denied" in error_msg.lower():
            raise HTTPException(
                status_code=403,
                detail={
                    "code": "FORBIDDEN",
                    "message": "You don't have access to this conversation"
                }
            )
        else:
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "BAD_REQUEST",
                    "message": error_msg
                }
            )

    except Exception as e:
        # T078: Handle AI/tool errors with user-friendly messages
        raise HTTPException(
            status_code=500,
            detail={
                "code": "AI_ERROR",
                "message": "I'm having trouble thinking right now. Please try again"
            }
        )


# ============================================================================
# GET /{user_id}/conversations - List conversations (T079-T080)
# ============================================================================

@router.get(
    "/{user_id}/conversations",
    response_model=ConversationListResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
    }
)
async def list_conversations(
    user_id: str,
    limit: int = Query(default=20, ge=1, le=100, description="Max conversations to return"),
    offset: int = Query(default=0, ge=0, description="Pagination offset"),
    current_user_id: str = Depends(get_current_user)
):
    """
    List user's conversations with message counts.

    - Returns paginated list of conversations
    - Includes message count and last message preview
    - Ordered by most recent activity
    """
    # Validate user access
    if user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "FORBIDDEN",
                "message": "You don't have access to this resource"
            }
        )

    conversations, total = await get_user_conversations(
        user_id=user_id,
        limit=limit,
        offset=offset
    )

    return ConversationListResponse(
        conversations=[
            ConversationSummary(
                id=conv["id"],
                created_at=conv["created_at"],
                updated_at=conv["updated_at"],
                message_count=conv["message_count"],
                last_message=conv["last_message"]
            )
            for conv in conversations
        ],
        total=total,
        limit=limit,
        offset=offset
    )


# ============================================================================
# GET /{user_id}/conversations/{conversation_id}/messages (T081)
# ============================================================================

@router.get(
    "/{user_id}/conversations/{conversation_id}/messages",
    response_model=MessagesListResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Not found"},
    }
)
async def get_conversation_messages(
    user_id: str,
    conversation_id: int,
    limit: int = Query(default=50, ge=1, le=200, description="Max messages to return"),
    current_user_id: str = Depends(get_current_user)
):
    """
    Get messages for a specific conversation.

    - Returns messages in chronological order
    - Includes tool call metadata for assistant messages
    - Indicates if more messages exist
    """
    # Validate user access
    if user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "FORBIDDEN",
                "message": "You don't have access to this resource"
            }
        )

    try:
        _, messages, has_more = await get_conversation_with_messages(
            user_id=user_id,
            conversation_id=conversation_id,
            limit=limit
        )

        return MessagesListResponse(
            messages=[
                MessageResponse(
                    id=msg["id"],
                    role=msg["role"],
                    content=msg["content"],
                    tool_calls=[
                        ToolCallResult(
                            tool=tc["tool"],
                            params=tc["params"],
                            result=tc.get("result")
                        )
                        for tc in (msg["tool_calls"] or [])
                    ] if msg["tool_calls"] else None,
                    created_at=msg["created_at"]
                )
                for msg in messages
            ],
            conversation_id=conversation_id,
            has_more=has_more
        )

    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "CONVERSATION_NOT_FOUND",
                    "message": "Conversation not found"
                }
            )
        elif "access denied" in error_msg.lower():
            raise HTTPException(
                status_code=403,
                detail={
                    "code": "FORBIDDEN",
                    "message": "You don't have access to this conversation"
                }
            )
        raise


# ============================================================================
# DELETE /{user_id}/conversations/{conversation_id} (T128-T130)
# ============================================================================

@router.delete(
    "/{user_id}/conversations/{conversation_id}",
    response_model=DeleteConversationResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Not found"},
    }
)
async def delete_conversation_endpoint(
    user_id: str,
    conversation_id: int,
    current_user_id: str = Depends(get_current_user)
):
    """
    Delete a conversation and all its messages.

    - Cascades delete to all messages
    - Returns count of deleted messages
    """
    # Validate user access
    if user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "FORBIDDEN",
                "message": "You don't have access to this resource"
            }
        )

    try:
        messages_deleted = await delete_conversation(
            user_id=user_id,
            conversation_id=conversation_id
        )

        return DeleteConversationResponse(
            success=True,
            conversation_id=conversation_id,
            messages_deleted=messages_deleted
        )

    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(
                status_code=404,
                detail={
                    "code": "CONVERSATION_NOT_FOUND",
                    "message": "Conversation not found"
                }
            )
        elif "access denied" in error_msg.lower():
            raise HTTPException(
                status_code=403,
                detail={
                    "code": "FORBIDDEN",
                    "message": "You don't have access to this conversation"
                }
            )
        raise
