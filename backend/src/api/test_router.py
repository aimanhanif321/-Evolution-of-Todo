# src/api/test_router.py
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from src.models.task import Task
from src.database import get_session

router = APIRouter()

@router.get("/test-tasks")
def test_tasks(session: Session = Depends(get_session)):
    tasks = session.exec(select(Task)).all()
    return tasks
