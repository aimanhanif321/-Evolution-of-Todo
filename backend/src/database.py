# src/database.py
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
import os

# Check environment variable FIRST (Docker sets this directly)
# Only load .env if DATABASE_URL not already set (for local dev without Docker)
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))
    DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Check your .env file or environment variables.")

engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
    pool_recycle=300,  # Recycle connections every 5 min (good for Neon)
    connect_args={"connect_timeout": 10}  # 10 second connection timeout
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