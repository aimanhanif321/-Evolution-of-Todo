# src/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging
from src.database import create_db_and_tables
from sqlalchemy import text
from src.database import engine
from fastapi.responses import JSONResponse

from dotenv import load_dotenv
import os

# Load .env file from backend folder
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")



# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import routers and dependencies
from .api import auth_router, task_router
from .dependencies.auth_dependencies import get_current_user

# Initialize FastAPI app
app = FastAPI(
    title="Taskora API",
    description="REST API for Taskora Todo Web Application",
    version="1.0.0"
)


# @app.on_event("startup")
# def startup():
#     with engine.connect() as conn:
#         result = conn.execute(text("SELECT 1")).all()
#         print("✅ NEON DB CONNECTED:", result)

#     create_db_and_tables()
# Startup event
@app.on_event("startup")
async def startup():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).all()
            print("✅ NEON DB CONNECTED:", result)
        # Optional: create tables, but wrap in try/except
        try:
            create_db_and_tables()
        except Exception as e:
            print("⚠ Tables creation skipped:", e)
    except Exception as e:
        print("❌ DB Connection Failed:", e)

# --- Exception handler ---
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# --- CORS middleware ---
origins = [
    "http://localhost:3000",
     " https://evolution-of-todo-blond.vercel.app"  # frontend dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # use the list
    allow_credentials=True,
    allow_methods=["*"],      # all methods allowed
    allow_headers=["*"],      # all headers allowed
)

# --- Include routers ---
app.include_router(auth_router.router, prefix="/api/auth", tags=["Authentication"])

app.include_router(task_router.router, prefix="/api", tags=["Tasks"])

# --- Simple endpoints ---
@app.get("/")
def read_root():
    return {"message": "Welcome to Taskora API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
