# src/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from src.database import create_db_and_tables
from sqlalchemy import text
from src.database import engine
from fastapi.responses import JSONResponse

# Load .env file from backend folder (one level up from src/)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")

# Setup structured logging (must be called before other imports that use logging)
from src.logging_config import setup_logging, get_logger
setup_logging()
logger = get_logger(__name__)

# Import routers and dependencies
from .api import auth_router, task_router, chat_router, tag_router, events_router
from .dependencies.auth_dependencies import get_current_user

# Initialize FastAPI app
app = FastAPI(
    title="Taskora API",
    description="REST API for Taskora Todo Web Application",
    version="1.0.0"
)


@app.on_event("startup")
def startup():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1")).all()
        print("✅ NEON DB CONNECTED:", result)

    create_db_and_tables()


# --- Exception handler with CORS headers ---
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    origin = request.headers.get("origin", "")
    headers = {}
    if origin in ["http://localhost:3000", "https://evolution-of-todo-blond.vercel.app"]:
        headers = {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        }
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers=headers
    )

# --- CORS middleware ---
origins = [
    "http://localhost:3000",
    "https://evolution-of-todo-blond.vercel.app"  # frontend dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # use the list
    allow_credentials=True,
    allow_methods=["*"],      # all methods allowed
    allow_headers=["*"],      # all headers allowed
)

# Add request logging middleware (Phase VII: Observability)
from src.middleware import RequestLoggingMiddleware
app.add_middleware(RequestLoggingMiddleware)

# --- Include routers ---
app.include_router(auth_router.router, prefix="/api/auth", tags=["Authentication"])

app.include_router(task_router.router, prefix="/api", tags=["Tasks"])

# Phase VI: Tag router
app.include_router(tag_router.router, prefix="/api", tags=["Tags"])

# Phase III: Chat router
app.include_router(chat_router.router, prefix="/api", tags=["Chat"])

# Phase V: Events router (SSE and Dapr subscriptions)
app.include_router(events_router.router, prefix="/api", tags=["Events"])

# --- Simple endpoints ---
@app.get("/")
def read_root():
    return {"message": "Welcome to Taskora API"}

@app.get("/health")
async def health_check():
    """Liveness probe - indicates the service is running."""
    return {"status": "healthy", "service": "taskora-backend"}


@app.get("/ready")
async def readiness_check():
    """Readiness probe - indicates the service can accept traffic."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "database": "disconnected"},
        )


@app.get("/metrics")
async def metrics_endpoint():
    """Observability metrics endpoint for monitoring.

    Returns basic application metrics. For full Prometheus metrics,
    consider adding prometheus-fastapi-instrumentator.
    """
    from src.dapr.client import is_dapr_healthy

    dapr_status = "healthy" if is_dapr_healthy() else "unavailable"

    # Check database connection
    db_status = "connected"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"

    return {
        "service": "taskora-backend",
        "version": app.version,
        "status": "running",
        "components": {
            "database": db_status,
            "dapr_sidecar": dapr_status,
        },
        "environment": os.getenv("APP_ENV", "development"),
    }