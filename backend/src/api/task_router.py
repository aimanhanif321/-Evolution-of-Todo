
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from sqlmodel import Session, select
from ..models.task import Task, TaskCreate, TaskRead, TaskUpdate
from ..database import get_session
from ..services.task_service import (
    create_task, get_tasks, get_task, update_task, delete_task, toggle_task_completion
)
from ..dependencies.auth_dependencies import get_current_user

router = APIRouter()

# -------------------------------
# 1️⃣ Simple route to get all tasks for logged-in user
# -------------------------------
@router.get("/tasks", response_model=List[TaskRead])
async def get_my_tasks(
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all tasks for the current logged-in user"""
    tasks = session.exec(select(Task).where(Task.user_id == current_user_id)).all()
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
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    db_task = create_task(session, task_data, current_user_id)
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
    task = get_task(session, task_id, current_user_id)
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
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    updated_task = update_task(session, task_id, task_data, current_user_id)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task

# -------------------------------
# 5️⃣ Delete a task
# -------------------------------
@router.delete("/tasks/{task_id}")
async def delete_task_endpoint(
    task_id: int,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    success = delete_task(session, task_id, current_user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

# -------------------------------
# 6️⃣ Toggle completion status
# -------------------------------
@router.patch("/tasks/{task_id}/complete", response_model=TaskRead)
async def toggle_task_completion_endpoint(
    task_id: int,
    task_data: TaskUpdate,  # should include task_data.completed
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    updated_task = toggle_task_completion(
        session, task_id, task_data.completed, current_user_id
    )
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task


