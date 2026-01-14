# src/database.py
from sqlmodel import SQLModel, create_engine, Session
import os

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session


# from sqlmodel import create_engine, Session
# from .models.user import User
# from .models.task import Task
# from typing import Generator
# import os
# from dotenv import load_dotenv

# # Load environment variables
# load_dotenv()

# # Get database URL from environment
# DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./taskora.db")

# # # Create engine
# # engine = create_engine(DATABASE_URL, echo=True)

# # def create_db_and_tables():
# #     """Create database tables"""
# #     from sqlmodel import SQLModel
# #     SQLModel.metadata.create_all(engine)

# # def get_session() -> Generator[Session, None, None]:
# #     """Get database session"""
# #     with Session(engine) as session:
# #         yield session