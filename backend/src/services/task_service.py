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
from sqlmodel import Session
from ..models.task import Task, TaskCreate, TaskUpdate

# -------------------------------
# Create a task
# -------------------------------
def create_task(session: Session, task_data: TaskCreate, user_id: str) -> Task:
    db_task = Task(**task_data.dict(), user_id=user_id)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
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
def get_task(session: Session, task_id: int, user_id: str):
    return session.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()

# -------------------------------
# Update task
# -------------------------------
def update_task(session: Session, task_id: int, task_data: TaskUpdate, user_id: str):
    task = get_task(session, task_id, user_id)
    if not task:
        return None
    for key, value in task_data.dict(exclude_unset=True).items():
        setattr(task, key, value)
    session.add(task)
    session.commit()
    session.refresh(task)
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
