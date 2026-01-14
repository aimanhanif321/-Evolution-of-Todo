
from sqlmodel import SQLModel, Field, Column, DateTime, String
from datetime import datetime
from typing import Optional

class TaskBase(SQLModel):
    title: str
    description: Optional[str] = None
    completed: bool = False

class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: str = Field(sa_column=Column(String, nullable=False))

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=datetime.utcnow
    )

    updated_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=datetime.utcnow
    )

class TaskCreate(TaskBase):
    pass  # ❌ frontend se user_id NAHI ayega

class TaskRead(TaskBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None


# from sqlmodel import SQLModel, Field, Column, DateTime
# from datetime import datetime
# from typing import Optional

# class TaskBase(SQLModel):
#     title: str = Field(nullable=False)
#     description: Optional[str] = Field(default=None)
#     completed: bool = Field(default=False)
#     user_id: str = Field(nullable=False)  # Using string for user_id as per spec

# class Task(TaskBase, table=True):
#     __tablename__ = "tasks"

#     id: Optional[int] = Field(default=None, primary_key=True)
#     created_at: datetime = Field(sa_column=Column(DateTime(timezone=True)), default=datetime.utcnow)
#     updated_at: datetime = Field(sa_column=Column(DateTime(timezone=True)), default=datetime.utcnow, nullable=False)

# class TaskCreate(TaskBase):
#     title: str
#     description: Optional[str] = None
#     completed: bool = False

# class TaskRead(TaskBase):
#     id: int
#     created_at: datetime
#     updated_at: datetime

# class TaskUpdate(SQLModel):
#     title: Optional[str] = None
#     description: Optional[str] = None
#     completed: Optional[bool] = None