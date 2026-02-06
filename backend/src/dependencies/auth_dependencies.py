from fastapi import HTTPException, status, Depends, Query, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
from datetime import datetime
from typing import Optional

# JWT setup
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "your-default-secret-key-for-development")
ALGORITHM = "HS256"

security = HTTPBearer(auto_error=False)


def decode_jwt_token(token: str) -> str:
    """Decode and validate a JWT token, returning the user_id."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        # Check if token is expired
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            raise credentials_exception

        return user_id

    except jwt.exceptions.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise credentials_exception


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> str:
    """
    Get current user from JWT token (Bearer header)
    Returns the user_id extracted from the token
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return decode_jwt_token(credentials.credentials)


async def get_current_user_sse(
    request: Request,
    token: Optional[str] = Query(None, description="JWT token for SSE authentication"),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> str:
    """
    Get current user for SSE endpoints.

    Supports authentication via:
    1. Query parameter `token` (for EventSource which doesn't support headers)
    2. Bearer token in Authorization header (standard method)
    """
    # Try query parameter first (for SSE/EventSource)
    if token:
        return decode_jwt_token(token)

    # Fall back to Authorization header
    if credentials:
        return decode_jwt_token(credentials.credentials)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated. Provide token via query parameter or Authorization header.",
        headers={"WWW-Authenticate": "Bearer"},
    )