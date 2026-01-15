"""
Chat Service - Conversation and Message Management

Handles business logic for chat conversations including:
- Creating and retrieving conversations
- Storing and retrieving messages
- Orchestrating AI responses
"""

import os
import logging
from typing import Optional, List
from datetime import datetime

from sqlmodel import Session, select, func

from ..database import engine
from ..models.conversation import Conversation
from ..models.message import Message
from .agent_service import generate_response

# Configure logging
logger = logging.getLogger(__name__)

# Default max conversation history from env or fallback
MAX_CONVERSATION_HISTORY = int(os.getenv("MAX_CONVERSATION_HISTORY", "20"))


# ============================================================================
# Conversation Management
# ============================================================================

async def get_or_create_conversation(
    user_id: str,
    conversation_id: Optional[int] = None
) -> Conversation:
    """
    Get existing conversation or create a new one.

    Args:
        user_id: The user's ID
        conversation_id: Optional existing conversation ID

    Returns:
        Conversation object

    Raises:
        ValueError: If conversation_id doesn't exist or belong to user
    """
    with Session(engine) as session:
        if conversation_id:
            # Try to get existing conversation
            conversation = session.get(Conversation, conversation_id)

            if not conversation:
                raise ValueError(f"Conversation {conversation_id} not found")

            if conversation.user_id != user_id:
                raise ValueError("Access denied to this conversation")

            return conversation

        # Create new conversation
        conversation = Conversation(
            user_id=user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(conversation)
        session.commit()
        session.refresh(conversation)

        logger.info(f"Created new conversation {conversation.id} for user {user_id}")
        return conversation


async def get_conversation_messages(
    conversation_id: int,
    limit: int = MAX_CONVERSATION_HISTORY
) -> List[dict]:
    """
    Get recent messages from a conversation.

    Args:
        conversation_id: The conversation ID
        limit: Maximum number of messages to retrieve

    Returns:
        List of message dicts with role, content, tool_calls
    """
    with Session(engine) as session:
        # Get most recent messages
        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        messages = session.exec(statement).all()

        # Reverse to get chronological order
        messages = list(reversed(messages))

        return [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "tool_calls": msg.get_tool_calls(),
                "created_at": msg.created_at.isoformat() if msg.created_at else None
            }
            for msg in messages
        ]


# ============================================================================
# Message Storage
# ============================================================================

async def store_user_message(
    conversation_id: int,
    user_id: str,
    content: str
) -> Message:
    """
    Store a user message in the database.

    Args:
        conversation_id: The conversation ID
        user_id: The user's ID
        content: Message content

    Returns:
        Created Message object
    """
    with Session(engine) as session:
        message = Message(
            conversation_id=conversation_id,
            user_id=user_id,
            role="user",
            content=content,
            created_at=datetime.utcnow()
        )
        session.add(message)
        session.commit()
        session.refresh(message)

        logger.debug(f"Stored user message {message.id} in conversation {conversation_id}")
        return message


async def store_assistant_message(
    conversation_id: int,
    user_id: str,
    content: str,
    tool_calls: Optional[List[dict]] = None
) -> Message:
    """
    Store an assistant message in the database.

    Args:
        conversation_id: The conversation ID
        user_id: The user's ID
        content: Message content
        tool_calls: Optional list of tool call results

    Returns:
        Created Message object
    """
    with Session(engine) as session:
        message = Message(
            conversation_id=conversation_id,
            user_id=user_id,
            role="assistant",
            content=content,
            created_at=datetime.utcnow()
        )

        if tool_calls:
            message.set_tool_calls(tool_calls)

        session.add(message)
        session.commit()
        session.refresh(message)

        logger.debug(f"Stored assistant message {message.id} in conversation {conversation_id}")
        return message


async def update_conversation_timestamp(conversation_id: int) -> None:
    """
    Update the conversation's updated_at timestamp.

    Args:
        conversation_id: The conversation ID
    """
    with Session(engine) as session:
        conversation = session.get(Conversation, conversation_id)
        if conversation:
            conversation.updated_at = datetime.utcnow()
            session.add(conversation)
            session.commit()


# ============================================================================
# Main Chat Orchestration
# ============================================================================

async def process_chat_message(
    user_id: str,
    conversation_id: Optional[int],
    message: str
) -> tuple[int, str, List[dict]]:
    """
    Process a chat message - the main orchestrator function.

    This function:
    1. Gets or creates a conversation
    2. Loads conversation history
    3. Stores the user message
    4. Generates AI response
    5. Stores the assistant response
    6. Returns the result

    Args:
        user_id: The user's ID
        conversation_id: Optional existing conversation ID
        message: User's message content

    Returns:
        Tuple of (conversation_id, response_text, tool_calls)
    """
    # Step 1: Get or create conversation
    conversation = await get_or_create_conversation(user_id, conversation_id)
    conv_id = conversation.id

    # Step 2: Load conversation history
    history = await get_conversation_messages(conv_id)

    # Step 3: Store user message
    await store_user_message(conv_id, user_id, message)

    # Step 4: Generate AI response
    response_text, tool_calls = await generate_response(user_id, history, message)

    # Step 5: Store assistant response
    await store_assistant_message(conv_id, user_id, response_text, tool_calls)

    # Step 6: Update conversation timestamp
    await update_conversation_timestamp(conv_id)

    logger.info(f"Processed message in conversation {conv_id}: {len(tool_calls)} tool calls")

    return conv_id, response_text, tool_calls


# ============================================================================
# Conversation Retrieval
# ============================================================================

async def get_user_conversations(
    user_id: str,
    limit: int = 20,
    offset: int = 0
) -> tuple[List[dict], int]:
    """
    Get user's conversations with message counts.

    Args:
        user_id: The user's ID
        limit: Maximum conversations to return
        offset: Pagination offset

    Returns:
        Tuple of (conversations_list, total_count)
    """
    with Session(engine) as session:
        # Get total count
        count_statement = (
            select(func.count(Conversation.id))
            .where(Conversation.user_id == user_id)
        )
        total = session.exec(count_statement).one()

        # Get conversations with message counts
        statement = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .offset(offset)
            .limit(limit)
        )
        conversations = session.exec(statement).all()

        result = []
        for conv in conversations:
            # Get message count for this conversation
            msg_count_stmt = (
                select(func.count(Message.id))
                .where(Message.conversation_id == conv.id)
            )
            msg_count = session.exec(msg_count_stmt).one()

            # Get last message preview
            last_msg_stmt = (
                select(Message)
                .where(Message.conversation_id == conv.id)
                .order_by(Message.created_at.desc())
                .limit(1)
            )
            last_msg = session.exec(last_msg_stmt).first()
            last_message_preview = None
            if last_msg:
                last_message_preview = last_msg.content[:100] + "..." if len(last_msg.content) > 100 else last_msg.content

            result.append({
                "id": conv.id,
                "created_at": conv.created_at,
                "updated_at": conv.updated_at,
                "message_count": msg_count,
                "last_message": last_message_preview
            })

        return result, total


async def get_conversation_with_messages(
    user_id: str,
    conversation_id: int,
    limit: int = 50
) -> tuple[dict, List[dict], bool]:
    """
    Get a conversation with its messages.

    Args:
        user_id: The user's ID
        conversation_id: The conversation ID
        limit: Maximum messages to return

    Returns:
        Tuple of (conversation_dict, messages_list, has_more)

    Raises:
        ValueError: If conversation not found or access denied
    """
    with Session(engine) as session:
        # Validate conversation ownership
        conversation = session.get(Conversation, conversation_id)

        if not conversation:
            raise ValueError(f"Conversation {conversation_id} not found")

        if conversation.user_id != user_id:
            raise ValueError("Access denied to this conversation")

        # Get messages
        messages = await get_conversation_messages(conversation_id, limit + 1)

        # Check if there are more messages
        has_more = len(messages) > limit
        if has_more:
            messages = messages[-limit:]  # Get last 'limit' messages

        conv_dict = {
            "id": conversation.id,
            "user_id": conversation.user_id,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at
        }

        return conv_dict, messages, has_more


# ============================================================================
# Conversation Deletion
# ============================================================================

async def delete_conversation(user_id: str, conversation_id: int) -> int:
    """
    Delete a conversation and all its messages.

    Args:
        user_id: The user's ID
        conversation_id: The conversation ID

    Returns:
        Number of messages deleted

    Raises:
        ValueError: If conversation not found or access denied
    """
    with Session(engine) as session:
        # Validate conversation ownership
        conversation = session.get(Conversation, conversation_id)

        if not conversation:
            raise ValueError(f"Conversation {conversation_id} not found")

        if conversation.user_id != user_id:
            raise ValueError("Access denied to this conversation")

        # Count messages before deletion
        msg_count_stmt = (
            select(func.count(Message.id))
            .where(Message.conversation_id == conversation_id)
        )
        messages_deleted = session.exec(msg_count_stmt).one()

        # Delete messages first (cascade should handle this, but explicit is safer)
        delete_msgs_stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
        )
        messages = session.exec(delete_msgs_stmt).all()
        for msg in messages:
            session.delete(msg)

        # Delete conversation
        session.delete(conversation)
        session.commit()

        logger.info(f"Deleted conversation {conversation_id} with {messages_deleted} messages")
        return messages_deleted
