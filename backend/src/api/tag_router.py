"""Tag API endpoints for Phase VI"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from sqlmodel import Session
from ..models.tag import Tag, TagCreate, TagRead, TagUpdate
from ..database import get_session
from ..services.tag_service import (
    create_tag,
    get_tags,
    get_tag,
    update_tag,
    delete_tag,
)
from ..dependencies.auth_dependencies import get_current_user

router = APIRouter()


# -------------------------------
# 1️⃣ Get all tags for logged-in user
# -------------------------------
@router.get("/tags", response_model=List[TagRead])
async def get_my_tags(
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all tags for the current logged-in user"""
    return get_tags(session, current_user_id)


# -------------------------------
# 2️⃣ Create a new tag
# -------------------------------
@router.post("/tags", response_model=TagRead, status_code=status.HTTP_201_CREATED)
async def create_tag_endpoint(
    tag_data: TagCreate,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new tag for the current user"""
    # Check for duplicate tag name
    existing_tags = get_tags(session, current_user_id)
    if any(t.name.lower() == tag_data.name.lower() for t in existing_tags):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag name already exists for this user"
        )
    return create_tag(session, tag_data, current_user_id)


# -------------------------------
# 3️⃣ Get a single tag by ID
# -------------------------------
@router.get("/tags/{tag_id}", response_model=TagRead)
async def get_tag_endpoint(
    tag_id: int,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get a single tag by ID"""
    tag = get_tag(session, tag_id, current_user_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


# -------------------------------
# 4️⃣ Update a tag
# -------------------------------
@router.put("/tags/{tag_id}", response_model=TagRead)
async def update_tag_endpoint(
    tag_id: int,
    tag_data: TagUpdate,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a tag's name or color"""
    # Check for duplicate tag name if name is being updated
    if tag_data.name:
        existing_tags = get_tags(session, current_user_id)
        if any(t.name.lower() == tag_data.name.lower() and t.id != tag_id for t in existing_tags):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tag name already exists for this user"
            )

    updated_tag = update_tag(session, tag_id, tag_data, current_user_id)
    if not updated_tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return updated_tag


# -------------------------------
# 5️⃣ Delete a tag
# -------------------------------
@router.delete("/tags/{tag_id}")
async def delete_tag_endpoint(
    tag_id: int,
    current_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a tag - also removes from all associated tasks"""
    success = delete_tag(session, tag_id, current_user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tag not found")
    return {"message": "Tag deleted successfully"}
