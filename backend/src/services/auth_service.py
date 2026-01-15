from sqlmodel import Session, select
from typing import Optional
from ..models.user import User, UserCreate
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import os
import hashlib

def _normalize_password(password: str) -> str:
    """
    Normalize password to fixed length to avoid bcrypt 72-byte limit
    """
    return hashlib.sha256(password.encode("utf-8")).hexdigest()
# Security setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT setup
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "your-default-secret-key-for-development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

def verify_password(plain_password: str, hashed_password: str) -> bool:
    normalized = _normalize_password(plain_password)
    return pwd_context.verify(normalized, hashed_password)


def get_password_hash(password: str) -> str:
    normalized = _normalize_password(password)
    return pwd_context.hash(normalized)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(session: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user by email and password"""
    user = session.exec(select(User).where(User.email == email)).first()

    if not user or not verify_password(password, user.hashed_password):
        return None

    return user

def create_user(session: Session, user_create: UserCreate) -> User:
    """Create a new user with hashed password"""
    # Check if user already exists
    existing_user = session.exec(select(User).where(User.email == user_create.email)).first()
    if existing_user:
        raise ValueError("Email already registered")

    # Hash the password
    hashed_password = get_password_hash(user_create.password)

    # Create the user
    db_user = User(
        email=user_create.email,
        name=user_create.name,
        hashed_password=hashed_password
    )

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return db_user

def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return session.exec(select(User).where(User.email == email)).first()

def get_user_by_id(session: Session, user_id: int) -> Optional[User]:
    """Get user by ID"""
    return session.get(User, user_id)