# # src/services/task_service.py
# from sqlmodel import Session
# from src.models.task import Task, TaskCreate, TaskUpdate
# from datetime import datetime

# def create_task(db: Session, task_data: TaskCreate, user_id: str) -> Task:
#     db_task = Task(
#         title=task_data.title,
#         description=task_data.description,
#         completed=task_data.completed,
#         user_id=user_id,  # Assign logged-in user_id manually
#         created_at=datetime.utcnow(),
#         updated_at=datetime.utcnow()
#     )
#     db.add(db_task)
#     db.commit()
#     db.refresh(db_task)
#     return db_task

# def get_tasks(db: Session, user_id: str):
#     return db.query(Task).filter(Task.user_id == user_id).all()

# def get_task(db: Session, task_id: int, user_id: str):
#     return db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()

# def update_task(db: Session, task_id: int, user_id: str, task_data: TaskUpdate):
#     task = get_task(db, task_id, user_id)
#     if not task:
#         return None

#     if task_data.title is not None:
#         task.title = task_data.title
#     if task_data.description is not None:
#         task.description = task_data.description
#     if task_data.completed is not None:
#         task.completed = task_data.completed

#     task.updated_at = datetime.utcnow()
#     db.add(task)
#     db.commit()
#     db.refresh(task)
#     return task

# def delete_task(db: Session, task_id: int, user_id: str):
#     task = get_task(db, task_id, user_id)
#     if not task:
#         return False

#     db.delete(task)
#     db.commit()
#     return True
# src/services/task_service.py
from sqlmodel import Session, or_, and_
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from ..models.task import Task, TaskCreate, TaskUpdate, Priority, RecurrenceRule
from ..models.tag import TaskTag
from .tag_service import set_task_tags, get_task_tags

# -------------------------------
# Create a task
# -------------------------------
def create_task(session: Session, task_data: TaskCreate, user_id: str) -> Task:
    # Extract tag_ids before creating task (not a Task field)
    tag_ids = task_data.tag_ids if hasattr(task_data, 'tag_ids') else []
    task_dict = task_data.dict(exclude={'tag_ids'})

    db_task = Task(**task_dict, user_id=user_id)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)

    # Set tags for the task
    if tag_ids:
        set_task_tags(session, db_task.id, tag_ids, user_id)
        session.refresh(db_task)

    # Load tags into the task object for response
    db_task.tags = get_task_tags(session, db_task.id)
    return db_task

# -------------------------------
# Get all tasks
# -------------------------------
def get_tasks(session: Session, user_id: str, completed: bool | None = None):
    query = session.query(Task).filter(Task.user_id == user_id)
    if completed is not None:
        query = query.filter(Task.completed == completed)
    return query.all()

# -------------------------------
# Get single task
# -------------------------------
def get_task(session: Session, task_id: int, user_id: str, load_tags: bool = False):
    task = session.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
    if task and load_tags:
        task.tags = get_task_tags(session, task_id)
    return task

# -------------------------------
# Update task
# -------------------------------
def update_task(session: Session, task_id: int, task_data: TaskUpdate, user_id: str):
    task = get_task(session, task_id, user_id)
    if not task:
        return None

    # Handle tag_ids separately
    update_dict = task_data.dict(exclude_unset=True)
    tag_ids = update_dict.pop('tag_ids', None)

    # Update task fields
    for key, value in update_dict.items():
        setattr(task, key, value)

    session.add(task)
    session.commit()
    session.refresh(task)

    # Update tags if tag_ids was provided
    if tag_ids is not None:
        set_task_tags(session, task_id, tag_ids, user_id)
        session.refresh(task)

    # Load tags into the task object for response
    task.tags = get_task_tags(session, task_id)
    return task

# -------------------------------
# Delete task
# -------------------------------
def delete_task(session: Session, task_id: int, user_id: str) -> bool:
    task = get_task(session, task_id, user_id)
    if not task:
        return False
    session.delete(task)
    session.commit()
    return True

# -------------------------------
# ✅ Toggle task completion
# -------------------------------
def toggle_task_completion(session: Session, task_id: int, completed: bool, user_id: str):
    task = get_task(session, task_id, user_id)
    if not task:
        return None
    task.completed = completed
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


# -------------------------------
# 🔍 Search tasks by title or description
# -------------------------------
def search_tasks(session: Session, user_id: str, search_term: str) -> list[Task]:
    """
    Search tasks by title or description using case-insensitive ILIKE.
    Returns tasks where either the title or description contains the search term.
    """
    search_pattern = f"%{search_term}%"
    query = session.query(Task).filter(
        Task.user_id == user_id,
        or_(
            Task.title.ilike(search_pattern),
            Task.description.ilike(search_pattern)
        )
    )
    return query.all()


# -------------------------------
# 🔍 Filter tasks with multiple criteria
# -------------------------------
def filter_tasks(
    session: Session,
    user_id: str,
    search: str | None = None,
    completed: bool | None = None,
    priority_list: list[str] | None = None,
    tag_ids: list[int] | None = None,
    due_before: datetime | None = None,
    due_after: datetime | None = None,
    overdue: bool | None = None
) -> list[Task]:
    """
    Filter tasks with multiple criteria using SQLAlchemy query building.
    All filters are optional and combined with AND logic.
    """
    query = session.query(Task).filter(Task.user_id == user_id)

    # Search filter (title or description)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Task.title.ilike(search_pattern),
                Task.description.ilike(search_pattern)
            )
        )

    # Status filter (completed/pending)
    if completed is not None:
        query = query.filter(Task.completed == completed)

    # Priority filter (multiple values allowed)
    if priority_list:
        valid_priorities = [p for p in priority_list if p in [e.value for e in Priority]]
        if valid_priorities:
            query = query.filter(Task.priority.in_(valid_priorities))

    # Tag filter (tasks must have at least one of the specified tags)
    if tag_ids:
        query = query.join(TaskTag, Task.id == TaskTag.task_id).filter(
            TaskTag.tag_id.in_(tag_ids)
        ).distinct()

    # Due date filters
    if due_before:
        query = query.filter(Task.due_date <= due_before)

    if due_after:
        query = query.filter(Task.due_date >= due_after)

    # Overdue filter (due_date < now and not completed)
    if overdue:
        query = query.filter(
            and_(
                Task.due_date < datetime.utcnow(),
                Task.completed == False
            )
        )

    return query.all()


# -------------------------------
# 🔀 Sort tasks by various criteria
# -------------------------------
# Priority order: urgent(0) > high(1) > medium(2) > low(3)
PRIORITY_ORDER = {
    Priority.urgent: 0,
    Priority.high: 1,
    Priority.medium: 2,
    Priority.low: 3,
}


def sort_tasks(
    tasks: list[Task],
    sort_by: str,
    order: str = "desc"
) -> list[Task]:
    """
    Sort tasks by the specified field.
    Supported fields: created_at, due_date, priority, title
    Priority uses custom order: urgent > high > medium > low
    """
    reverse = order.lower() == "desc"

    if sort_by == "created_at":
        return sorted(tasks, key=lambda t: t.created_at or datetime.min, reverse=reverse)

    elif sort_by == "due_date":
        # Tasks without due_date go to the end
        def due_date_key(t):
            if t.due_date is None:
                return datetime.max if not reverse else datetime.min
            return t.due_date
        return sorted(tasks, key=due_date_key, reverse=reverse)

    elif sort_by == "priority":
        # Use custom priority order (lower = higher priority)
        def priority_key(t):
            return PRIORITY_ORDER.get(t.priority, 2)  # Default to medium
        # For priority, "desc" means highest priority first (urgent, high, medium, low)
        # So we reverse the natural order when desc
        return sorted(tasks, key=priority_key, reverse=not reverse)

    elif sort_by == "title":
        return sorted(tasks, key=lambda t: (t.title or "").lower(), reverse=reverse)

    # Default: return unsorted
    return tasks


# -------------------------------
# 🔄 Calculate next due date for recurring tasks
# -------------------------------
def calculate_next_due_date(
    current_due_date: datetime | None,
    recurrence_rule: RecurrenceRule,
    recurrence_interval: int | None = None
) -> datetime:
    """
    Calculate the next due date based on the recurrence rule.

    Args:
        current_due_date: The current due date (or now if None)
        recurrence_rule: The recurrence pattern (daily, weekly, monthly, custom)
        recurrence_interval: Custom interval in days (for custom rule)

    Returns:
        The next due date
    """
    base_date = current_due_date or datetime.utcnow()

    if recurrence_rule == RecurrenceRule.daily:
        return base_date + timedelta(days=1)

    elif recurrence_rule == RecurrenceRule.weekly:
        return base_date + timedelta(weeks=1)

    elif recurrence_rule == RecurrenceRule.monthly:
        return base_date + relativedelta(months=1)

    elif recurrence_rule == RecurrenceRule.custom:
        # Use custom interval (default to 1 day if not specified)
        days = recurrence_interval or 1
        return base_date + timedelta(days=days)

    # Fallback: 1 day
    return base_date + timedelta(days=1)


# -------------------------------
# 🔄 Create recurring task instance
# -------------------------------
def create_recurring_instance(
    session: Session,
    completed_task: Task,
    user_id: str
) -> Task | None:
    """
    Create a new task instance when a recurring task is completed.
    Preserves all properties except completion status and calculates next due date.

    Args:
        session: Database session
        completed_task: The task that was just completed
        user_id: The user ID

    Returns:
        The newly created recurring task instance, or None if not a recurring task
    """
    if not completed_task.is_recurring or not completed_task.recurrence_rule:
        return None

    # Calculate next due date
    next_due_date = calculate_next_due_date(
        completed_task.due_date,
        completed_task.recurrence_rule,
        completed_task.recurrence_interval
    )

    # Create new task instance
    new_task = Task(
        title=completed_task.title,
        description=completed_task.description,
        completed=False,
        priority=completed_task.priority,
        due_date=next_due_date,
        reminder_at=None,  # Clear reminder for new instance
        reminder_sent=False,
        is_recurring=True,
        recurrence_rule=completed_task.recurrence_rule,
        recurrence_interval=completed_task.recurrence_interval,
        parent_task_id=completed_task.id,  # Link to original task
        user_id=user_id,
    )

    session.add(new_task)
    session.commit()
    session.refresh(new_task)

    # Copy tags from completed task
    original_tags = get_task_tags(session, completed_task.id)
    if original_tags:
        tag_ids = [tag.id for tag in original_tags]
        set_task_tags(session, new_task.id, tag_ids, user_id)
        session.refresh(new_task)

    # Load tags for response
    new_task.tags = get_task_tags(session, new_task.id)

    return new_task


# -------------------------------
# 🔄 Complete task with recurring logic
# -------------------------------
def complete_task_with_recurrence(
    session: Session,
    task_id: int,
    completed: bool,
    user_id: str
) -> tuple[Task | None, Task | None]:
    """
    Toggle task completion and create new instance if recurring.

    Args:
        session: Database session
        task_id: Task ID to complete
        completed: New completion status
        user_id: User ID

    Returns:
        Tuple of (completed_task, new_recurring_task or None)
    """
    task = get_task(session, task_id, user_id)
    if not task:
        return None, None

    # Update completion status
    task.completed = completed
    session.add(task)
    session.commit()
    session.refresh(task)

    # Load tags for completed task
    task.tags = get_task_tags(session, task_id)

    # Create new recurring instance if completing a recurring task
    new_task = None
    if completed and task.is_recurring and task.recurrence_rule:
        new_task = create_recurring_instance(session, task, user_id)

    return task, new_task
