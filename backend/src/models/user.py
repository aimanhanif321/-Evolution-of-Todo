from sqlmodel import SQLModel, Field, Column, DateTime
from datetime import datetime
from typing import Optional

class UserBase(SQLModel):
    email: str = Field(unique=True, nullable=False)
    name: str = Field(nullable=False)

class User(UserBase, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True)),
        default_factory=datetime.utcnow
    )

    hashed_password: str = Field(nullable=False)

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    created_at: datetime

class UserUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[str] = None
