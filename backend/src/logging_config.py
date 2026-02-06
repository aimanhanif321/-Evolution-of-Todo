"""Structured logging configuration for Taskora backend.

Provides JSON-formatted logging for production environments with
proper log levels, request context, and correlation IDs.
"""

import logging
import sys
import os
import json
from datetime import datetime
from typing import Any
import uuid
from contextvars import ContextVar

# Context variable for request ID (set per request)
request_id_var: ContextVar[str] = ContextVar("request_id", default="")
user_id_var: ContextVar[str] = ContextVar("user_id", default="")


class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging."""

    def format(self, record: logging.LogRecord) -> str:
        log_data: dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add request context if available
        request_id = request_id_var.get()
        if request_id:
            log_data["request_id"] = request_id

        user_id = user_id_var.get()
        if user_id:
            log_data["user_id"] = user_id

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Add extra fields
        if hasattr(record, "extra_data"):
            log_data["extra"] = record.extra_data

        return json.dumps(log_data)


class DevFormatter(logging.Formatter):
    """Human-readable formatter for development."""

    COLORS = {
        "DEBUG": "\033[36m",  # Cyan
        "INFO": "\033[32m",   # Green
        "WARNING": "\033[33m",  # Yellow
        "ERROR": "\033[31m",  # Red
        "CRITICAL": "\033[35m",  # Magenta
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        color = self.COLORS.get(record.levelname, "")
        reset = self.RESET

        # Get request context
        request_id = request_id_var.get()
        user_id = user_id_var.get()
        context = ""
        if request_id:
            context += f" [req:{request_id[:8]}]"
        if user_id:
            context += f" [user:{user_id}]"

        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        return f"{color}{timestamp} {record.levelname:8}{reset}{context} {record.name}: {record.getMessage()}"


def setup_logging() -> None:
    """Configure logging based on environment."""
    env = os.getenv("APP_ENV", "development")
    log_level_str = os.getenv("LOG_LEVEL", "INFO" if env == "production" else "DEBUG")
    log_level = getattr(logging, log_level_str.upper(), logging.INFO)

    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Create console handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)

    # Use JSON formatter in production, dev formatter otherwise
    if env == "production":
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(DevFormatter())

    root_logger.addHandler(handler)

    # Set specific log levels for noisy libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a logger with the given name."""
    return logging.getLogger(name)


def set_request_context(request_id: str | None = None, user_id: str | None = None) -> str:
    """Set request context for logging. Returns the request_id."""
    req_id = request_id or str(uuid.uuid4())
    request_id_var.set(req_id)
    if user_id:
        user_id_var.set(user_id)
    return req_id


def clear_request_context() -> None:
    """Clear request context after request completes."""
    request_id_var.set("")
    user_id_var.set("")
