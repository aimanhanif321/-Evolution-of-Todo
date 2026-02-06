
from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks, Query
from typing import List, Optional, Literal
from datetime import datetime
from sqlmodel import Session, select
from ..models.task import Task, TaskCreate, TaskRead, TaskUpdate, Priority
from ..database import get_session
from ..services.task_service import (
    create_task, get_tasks, get_task, update_task, delete_task, toggle_task_completion,
    search_tasks, filter_tasks, sort_tasks, complete_task_with_recurrence
)
from ..services.tag_service import get_task_tags
from ..services.reminder_service import get_pending_reminders, mark_reminder_sent, set_reminder, clear_reminder
from ..dependencies.auth_dependencies import get_current_user
from ..dapr.task_events import (
    emit_task_created,
    emit_task_updated,
    emit_task_deleted,
    emit_task_completed,
    emit_task_recurred,
    emit_task_reminder,
)

router = APIRouter()


# ===============================
# IMPORTANT: Static routes MUST come BEFORE parameterized routes
# /tasks/reminders must be defined BEFORE /tasks/{task_id}
# ===============================


# -------------------------------
# 7️⃣ Get pending reminders for polling (MOVED FIRST - static route)
# -------------------------------
@router.get("/tasks/reminders")
async def get_reminders_endpoint(
    before: Optional[datetime] = Query(None, description="Get reminders due before this time (default: now)"),
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get tasks with pending reminders (reminder_at <= before and not sent).
    Used by frontend for polling notifications.
    """
    reminders = get_pending_reminders(session, current_user_id, before)
    # Return minimal data for notifications
    return [
        {
            "id": task.id,
            "title": task.title,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "reminder_at": task.reminder_at.isoformat() if task.reminder_at else None,
        }
        for task in reminders
    ]


# -------------------------------
# 1️⃣ Get all tasks with search and filters
# -------------------------------
@router.get("/tasks", response_model=List[TaskRead])
async def get_my_tasks(
    search: Optional[str] = Query(None, description="Search term to filter tasks by title or description"),
    status: Optional[str] = Query(None, description="Filter by status: 'pending' or 'completed'"),
    priority: Optional[str] = Query(None, description="Filter by priority (comma-separated): low,medium,high,urgent"),
    tags: Optional[str] = Query(None, description="Filter by tag IDs (comma-separated)"),
    due_before: Optional[datetime] = Query(None, description="Filter tasks due before this date"),
    due_after: Optional[datetime] = Query(None, description="Filter tasks due after this date"),
    overdue: Optional[bool] = Query(None, description="Filter overdue tasks (due_date < now and not completed)"),
    sort_by: Optional[str] = Query(None, description="Sort by: created_at, due_date, priority, title"),
    order: Optional[str] = Query("desc", description="Sort order: asc or desc"),
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all tasks for the current logged-in user with optional search, filters, and sorting"""
    # Parse filter parameters
    priority_list = [p.strip() for p in priority.split(",")] if priority else None
    tag_ids = [int(t.strip()) for t in tags.split(",") if t.strip().isdigit()] if tags else None

    # Convert status to completed boolean
    completed = None
    if status == "completed":
        completed = True
    elif status == "pending":
        completed = False

    # Use filter_tasks if any filters are provided
    has_filters = any([search, status, priority, tags, due_before, due_after, overdue])

    if has_filters:
        tasks = filter_tasks(
            session=session,
            user_id=current_user_id,
            search=search.strip() if search else None,
            completed=completed,
            priority_list=priority_list,
            tag_ids=tag_ids,
            due_before=due_before,
            due_after=due_after,
            overdue=overdue
        )
    else:
        tasks = session.exec(select(Task).where(Task.user_id == current_user_id)).all()

    # Apply sorting
    if sort_by:
        tasks = sort_tasks(list(tasks), sort_by, order or "desc")

    # Load tags for each task
    for task in tasks:
        task.tags = get_task_tags(session, task.id)
    return tasks

# -------------------------------
# 2️⃣ Create a new task
# -------------------------------
# @router.post("/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
# async def create_task_endpoint(
#     task_data: TaskCreate,
#     current_user_id: str = Depends(get_current_user),
#     session: Session = Depends(get_session)
# ):
#     db_task = create_task(session, task_data, current_user_id)
#     return db_task
@router.post("/tasks", response_model=TaskRead, status_code=201)
async def create_task_endpoint(
    task_data: TaskCreate,
    background_tasks: BackgroundTasks,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    db_task = create_task(session, task_data, current_user_id)
    # Emit task created event with priority (non-blocking)
    background_tasks.add_task(
        emit_task_created,
        user_id=current_user_id,
        task_id=db_task.id,
        task_data={
            "title": db_task.title,
            "description": db_task.description,
            "priority": db_task.priority.value if db_task.priority else "medium",
            "due_date": db_task.due_date.isoformat() if db_task.due_date else None,
            "is_recurring": db_task.is_recurring,
            "recurrence_rule": db_task.recurrence_rule.value if db_task.recurrence_rule else None,
        }
    )
    return db_task

# -------------------------------
# 3️⃣ Get a single task by ID
# -------------------------------
@router.get("/tasks/{task_id}", response_model=TaskRead)
async def get_task_endpoint(
    task_id: int,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    task = get_task(session, task_id, current_user_id, load_tags=True)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

# -------------------------------
# 4️⃣ Update a task
# -------------------------------
@router.put("/tasks/{task_id}", response_model=TaskRead)
async def update_task_endpoint(
    task_id: int,
    task_data: TaskUpdate,
    background_tasks: BackgroundTasks,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    updated_task = update_task(session, task_id, task_data, current_user_id)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    # Emit task updated event with priority (non-blocking)
    background_tasks.add_task(
        emit_task_updated,
        user_id=current_user_id,
        task_id=task_id,
        task_data={
            "title": updated_task.title,
            "description": updated_task.description,
            "completed": updated_task.completed,
            "priority": updated_task.priority.value if updated_task.priority else "medium",
            "due_date": updated_task.due_date.isoformat() if updated_task.due_date else None,
        }
    )
    return updated_task

# -------------------------------
# 5️⃣ Delete a task
# -------------------------------
@router.delete("/tasks/{task_id}")
async def delete_task_endpoint(
    task_id: int,
    background_tasks: BackgroundTasks,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    success = delete_task(session, task_id, current_user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    # Emit task deleted event (non-blocking)
    background_tasks.add_task(
        emit_task_deleted,
        user_id=current_user_id,
        task_id=task_id
    )
    return {"message": "Task deleted successfully"}

# -------------------------------
# 6️⃣ Toggle completion status (with recurring task support)
# -------------------------------
@router.patch("/tasks/{task_id}/complete")
async def toggle_task_completion_endpoint(
    task_id: int,
    task_data: TaskUpdate,  # should include task_data.completed
    background_tasks: BackgroundTasks,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Toggle task completion status.
    For recurring tasks, completing the task creates a new instance with next due date.
    Returns: { completed_task: TaskRead, next_task?: TaskRead }
    """
    completed_task, next_task = complete_task_with_recurrence(
        session, task_id, task_data.completed, current_user_id
    )
    if not completed_task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Emit task completion event (non-blocking)
    background_tasks.add_task(
        emit_task_completed,
        user_id=current_user_id,
        task_id=task_id,
        completed=completed_task.completed
    )

    # If a new recurring task was created, emit recurred event
    if next_task:
        background_tasks.add_task(
            emit_task_recurred,
            user_id=current_user_id,
            original_task_id=task_id,
            new_task_id=next_task.id,
            next_due_date=next_task.due_date.isoformat() if next_task.due_date else None
        )
        # Return both completed task and new task
        return {
            "completed_task": completed_task,
            "next_task": next_task
        }

    # Return just the completed task (as TaskRead)
    return completed_task


# -------------------------------
# 8️⃣ Update task reminder
# -------------------------------
@router.patch("/tasks/{task_id}/reminder", response_model=TaskRead)
async def update_reminder_endpoint(
    task_id: int,
    reminder_data: dict,
    background_tasks: BackgroundTasks,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update or clear a task's reminder.
    Pass { "reminder_at": null } to clear the reminder.
    """
    reminder_at = reminder_data.get("reminder_at")

    if reminder_at is None:
        task = clear_reminder(session, task_id, current_user_id)
    else:
        # Parse datetime string if needed
        if isinstance(reminder_at, str):
            reminder_at = datetime.fromisoformat(reminder_at.replace("Z", "+00:00"))
        task = set_reminder(session, task_id, current_user_id, reminder_at)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Load tags for response
    task.tags = get_task_tags(session, task_id)
    return task


# -------------------------------
# 9️⃣ Mark reminder as sent (internal endpoint for notification service)
# -------------------------------
@router.post("/tasks/{task_id}/reminder/sent")
async def mark_reminder_sent_endpoint(
    task_id: int,
    background_tasks: BackgroundTasks,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Mark a task's reminder as sent. Called after showing notification.
    Emits task.reminder Dapr event.
    """
    task = mark_reminder_sent(session, task_id, current_user_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Emit reminder event (non-blocking)
    background_tasks.add_task(
        emit_task_reminder,
        user_id=current_user_id,
        task_id=task_id,
        title=task.title,
        due_date=task.due_date.isoformat() if task.due_date else None
    )

    return {"message": "Reminder marked as sent"}


