from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
from sqlmodel import SQLModel
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load .env
load_dotenv()  

# Get DATABASE_URL from .env (fallback to default if not found)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "DATABASE_URL=postgresql://postgres:aiman@localhost:5432/taskora_db"
)

# Add src folder to Python path
sys.path.append(str(Path(__file__).parent.parent / "src"))

# Import your models
from src.models.user import User
from src.models.task import Task

# Alembic config object
config = context.config

# Configure Python logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Target metadata for autogenerate
target_metadata = SQLModel.metadata

# Set SQLAlchemy URL for Alembic
config.set_main_option("sqlalchemy.url", DATABASE_URL)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
