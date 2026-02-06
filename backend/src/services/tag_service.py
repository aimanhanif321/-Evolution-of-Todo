"""Tag service for Phase VI - Tag CRUD operations"""

from sqlmodel import Session, select
from ..models.tag import Tag, TagCreate, TagUpdate, TaskTag


# -------------------------------
# Create a tag
# -------------------------------
def create_tag(session: Session, tag_data: TagCreate, user_id: str) -> Tag:
    """Create a new tag for a user"""
    db_tag = Tag(**tag_data.dict(), user_id=user_id)
    session.add(db_tag)
    session.commit()
    session.refresh(db_tag)
    return db_tag


# -------------------------------
# Get all tags for a user
# -------------------------------
def get_tags(session: Session, user_id: str) -> list[Tag]:
    """Get all tags for a user, ordered by name"""
    statement = select(Tag).where(Tag.user_id == user_id).order_by(Tag.name)
    return list(session.exec(statement).all())


# -------------------------------
# Get single tag
# -------------------------------
def get_tag(session: Session, tag_id: int, user_id: str) -> Tag | None:
    """Get a single tag by ID, ensuring user ownership"""
    statement = select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id)
    return session.exec(statement).first()


# -------------------------------
# Update tag
# -------------------------------
def update_tag(session: Session, tag_id: int, tag_data: TagUpdate, user_id: str) -> Tag | None:
    """Update a tag's name or color"""
    tag = get_tag(session, tag_id, user_id)
    if not tag:
        return None

    for key, value in tag_data.dict(exclude_unset=True).items():
        setattr(tag, key, value)

    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag


# -------------------------------
# Delete tag
# -------------------------------
def delete_tag(session: Session, tag_id: int, user_id: str) -> bool:
    """Delete a tag - TaskTag entries cascade automatically"""
    tag = get_tag(session, tag_id, user_id)
    if not tag:
        return False

    session.delete(tag)
    session.commit()
    return True


# -------------------------------
# Get tags by IDs (for task associations)
# -------------------------------
def get_tags_by_ids(session: Session, tag_ids: list[int], user_id: str) -> list[Tag]:
    """Get multiple tags by their IDs, ensuring user ownership"""
    if not tag_ids:
        return []
    statement = select(Tag).where(Tag.id.in_(tag_ids), Tag.user_id == user_id)
    return list(session.exec(statement).all())


# -------------------------------
# Associate tags with a task
# -------------------------------
def set_task_tags(session: Session, task_id: int, tag_ids: list[int], user_id: str) -> None:
    """Set the tags for a task (replaces existing associations)"""
    # Remove existing task-tag associations
    existing = session.exec(select(TaskTag).where(TaskTag.task_id == task_id)).all()
    for tt in existing:
        session.delete(tt)

    # Add new associations (only for tags owned by the user)
    valid_tags = get_tags_by_ids(session, tag_ids, user_id)
    for tag in valid_tags:
        task_tag = TaskTag(task_id=task_id, tag_id=tag.id)
        session.add(task_tag)

    session.commit()


# -------------------------------
# Get tags for a task
# -------------------------------
def get_task_tags(session: Session, task_id: int) -> list[Tag]:
    """Get all tags associated with a task"""
    statement = (
        select(Tag)
        .join(TaskTag, Tag.id == TaskTag.tag_id)
        .where(TaskTag.task_id == task_id)
    )
    return list(session.exec(statement).all())
