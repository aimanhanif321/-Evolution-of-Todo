"""Phase VI: Advanced Todo Features

Revision ID: 002_phase_vi_features
Revises: 001_add_chat_tables
Create Date: 2026-01-30

This migration adds the database schema for Phase VI advanced todo features:
- Task priority levels (low/medium/high/urgent)
- Due dates and reminders
- Recurring tasks
- Tags with many-to-many relationship
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = '002_phase_vi_features'
down_revision = '001_add_chat_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add Phase VI features: priority, due dates, reminders, recurring tasks, tags"""

    # Add new columns to tasks table
    op.add_column('tasks', sa.Column('priority', sa.String(10), nullable=False, server_default='medium'))
    op.add_column('tasks', sa.Column('due_date', sa.DateTime(timezone=True), nullable=True))
    op.add_column('tasks', sa.Column('reminder_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('tasks', sa.Column('reminder_sent', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('tasks', sa.Column('is_recurring', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('tasks', sa.Column('recurrence_rule', sa.String(20), nullable=True))
    op.add_column('tasks', sa.Column('recurrence_interval', sa.Integer(), nullable=True))
    op.add_column('tasks', sa.Column('parent_task_id', sa.Integer(), sa.ForeignKey('tasks.id'), nullable=True))

    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('color', sa.String(7), nullable=False, server_default='#6366F1'),
        sa.Column('user_id', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # Create task_tags junction table
    op.create_table(
        'task_tags',
        sa.Column('task_id', sa.Integer(), sa.ForeignKey('tasks.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('tag_id', sa.Integer(), sa.ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True),
    )

    # Create indexes for performance
    op.create_index('idx_tasks_user_priority', 'tasks', ['user_id', 'priority'])
    op.create_index('idx_tasks_user_due_date', 'tasks', ['user_id', 'due_date'])
    op.create_index('idx_tasks_reminder', 'tasks', ['reminder_at'],
                    postgresql_where=sa.text('reminder_sent = false'))
    op.create_index('idx_tasks_parent', 'tasks', ['parent_task_id'])
    op.create_index('idx_tags_user', 'tags', ['user_id'])
    op.create_index('idx_tags_user_name', 'tags', ['user_id', 'name'])


def downgrade() -> None:
    """Remove Phase VI features"""

    # Drop indexes
    op.drop_index('idx_tags_user_name', table_name='tags')
    op.drop_index('idx_tags_user', table_name='tags')
    op.drop_index('idx_tasks_parent', table_name='tasks')
    op.drop_index('idx_tasks_reminder', table_name='tasks')
    op.drop_index('idx_tasks_user_due_date', table_name='tasks')
    op.drop_index('idx_tasks_user_priority', table_name='tasks')

    # Drop tables
    op.drop_table('task_tags')
    op.drop_table('tags')

    # Remove columns from tasks
    op.drop_column('tasks', 'parent_task_id')
    op.drop_column('tasks', 'recurrence_interval')
    op.drop_column('tasks', 'recurrence_rule')
    op.drop_column('tasks', 'is_recurring')
    op.drop_column('tasks', 'reminder_sent')
    op.drop_column('tasks', 'reminder_at')
    op.drop_column('tasks', 'due_date')
    op.drop_column('tasks', 'priority')
