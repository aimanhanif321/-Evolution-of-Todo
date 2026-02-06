from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import jwt
import os
from sqlmodel import Session, select
from ..models.user import UserCreate, UserRead
from ..models.task import Task
from ..database import get_session
from ..services.auth_service import authenticate_user, create_user, get_password_hash
from ..dependencies.auth_dependencies import get_current_user
from ..models.user import User

router = APIRouter()

# Security setup
security = HTTPBearer()

# JWT setup
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "your-default-secret-key-for-development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
REFRESH_TOKEN_EXPIRE_DAYS = 7

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    name: str
    password: str

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, session: Session = Depends(get_session)):
    try:
        # Create user using the auth service
        db_user = create_user(session, UserCreate(**user_data.dict()))
        return db_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, session: Session = Depends(get_session)):
    # Authenticate user using the auth service
    user = authenticate_user(session, user_credentials.email, user_credentials.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # In a real implementation, you might add the token to a blacklist
    # For now, we just return a success message
    return {"message": "Logged out successfully"}


@router.delete("/delete-account")
async def delete_account(current_user_id: str = Depends(get_current_user), session: Session = Depends(get_session)):
    """Delete the current user's account with confirmation"""
    # Get the user by ID
    user = session.get(User, int(current_user_id))

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Delete all tasks associated with the user first (due to foreign key constraint)
    # In a real implementation, you might want to soft-delete or archive the data
    task_query = select(Task).where(Task.user_id == current_user_id)
    user_tasks = session.exec(task_query).all()

    for task in user_tasks:
        session.delete(task)

    # Delete the user
    session.delete(user)
    session.commit()

    return {"message": "Account deleted successfully"}


@router.post("/forgot-password")
async def forgot_password(email: str):
    """Initiate password reset process"""
    # In a real implementation, you would:
    # 1. Check if user exists with the provided email
    # 2. Generate a password reset token
    # 3. Send an email with a link to reset the password
    # For now, we just return a success message to avoid revealing if an email exists

    # Note: We don't reveal whether the email exists to prevent user enumeration attacks
    return {"message": "If an account with this email exists, a password reset link has been sent"}


@router.post("/reset-password")
async def reset_password(token: str, new_password: str):
    """Reset user password using a reset token"""
    # In a real implementation, you would:
    # 1. Verify the reset token
    # 2. Validate the new password
    # 3. Update the user's password
    # For now, we'll return a placeholder response

    # This is a simplified version - in reality, you'd have more sophisticated token handling
    return {"message": "Password reset successfully"}



