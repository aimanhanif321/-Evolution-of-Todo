"""Add conversations and messages tables for Phase III chatbot

Revision ID: 001_add_chat_tables
Revises:
Create Date: 2026-01-15

This migration adds the database tables required for the AI chatbot feature:
- conversations: Stores chat sessions between users and the AI
- messages: Stores individual messages within conversations
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = '001_add_chat_tables'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create conversations and messages tables with indexes"""

    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=False),
    )

    # Create indexes for conversations
    op.create_index('idx_conversations_user_id', 'conversations', ['user_id'])
    op.create_index('idx_conversations_updated_at', 'conversations',
                    [sa.text('updated_at DESC')])

    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('conversation_id', sa.Integer(),
                  sa.ForeignKey('conversations.id', ondelete='CASCADE'),
                  nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('tool_calls', sa.Text(), nullable=True),  # JSON stored as text
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=False),
        # Check constraint for role
        sa.CheckConstraint("role IN ('user', 'assistant')", name='ck_messages_role'),
    )

    # Create indexes for messages
    op.create_index('idx_messages_conversation_id', 'messages', ['conversation_id'])
    op.create_index('idx_messages_user_id', 'messages', ['user_id'])
    op.create_index('idx_messages_created_at', 'messages', ['created_at'])


def downgrade() -> None:
    """Drop messages and conversations tables"""
    # Drop indexes first
    op.drop_index('idx_messages_created_at', table_name='messages')
    op.drop_index('idx_messages_user_id', table_name='messages')
    op.drop_index('idx_messages_conversation_id', table_name='messages')

    # Drop messages table
    op.drop_table('messages')

    # Drop conversations indexes
    op.drop_index('idx_conversations_updated_at', table_name='conversations')
    op.drop_index('idx_conversations_user_id', table_name='conversations')

    # Drop conversations table
    op.drop_table('conversations')
