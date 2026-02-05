"""Reminder service for querying and managing task reminders."""

from datetime import datetime
from sqlmodel import Session, and_

from ..models.task import Task


def get_pending_reminders(
    session: Session,
    user_id: str,
    before: datetime | None = None
) -> list[Task]:
    """
    Get tasks with pending reminders (reminder_at <= before and not sent).

    Args:
        session: Database session
        user_id: The user ID to filter reminders for
        before: Get reminders due before this time (default: now)

    Returns:
        List of tasks with pending reminders
    """
    check_time = before or datetime.utcnow()

    query = session.query(Task).filter(
        and_(
            Task.user_id == user_id,
            Task.reminder_at != None,
            Task.reminder_at <= check_time,
            Task.reminder_sent == False,
            Task.completed == False
        )
    )

    return query.all()


def mark_reminder_sent(session: Session, task_id: int, user_id: str) -> Task | None:
    """
    Mark a task's reminder as sent.

    Args:
        session: Database session
        task_id: Task ID to update
        user_id: User ID for authorization

    Returns:
        Updated task or None if not found
    """
    task = session.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id
    ).first()

    if not task:
        return None

    task.reminder_sent = True
    session.add(task)
    session.commit()
    session.refresh(task)

    return task


def clear_reminder(session: Session, task_id: int, user_id: str) -> Task | None:
    """
    Clear a task's reminder.

    Args:
        session: Database session
        task_id: Task ID to update
        user_id: User ID for authorization

    Returns:
        Updated task or None if not found
    """
    task = session.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id
    ).first()

    if not task:
        return None

    task.reminder_at = None
    task.reminder_sent = False
    session.add(task)
    session.commit()
    session.refresh(task)

    return task


def set_reminder(
    session: Session,
    task_id: int,
    user_id: str,
    reminder_at: datetime
) -> Task | None:
    """
    Set or update a task's reminder.

    Args:
        session: Database session
        task_id: Task ID to update
        user_id: User ID for authorization
        reminder_at: When to trigger the reminder

    Returns:
        Updated task or None if not found
    """
    task = session.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id
    ).first()

    if not task:
        return None

    task.reminder_at = reminder_at
    task.reminder_sent = False  # Reset sent status when updating reminder
    session.add(task)
    session.commit()
    session.refresh(task)

    return task
