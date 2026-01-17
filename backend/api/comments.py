from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import User
from auth import get_current_user
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class Comment(BaseModel):
    id: str
    content: str
    author: str
    createdAt: str

class CommentsResponse(BaseModel):
    comments: List[Comment]

@router.get("/{post_slug}", response_model=CommentsResponse)
def get_comments(post_slug: str, session: Session = Depends(get_session)):
    """Get comments for a post - currently returns empty list as comments are not implemented"""
    # TODO: Implement actual comment system with database model
    return {"comments": []}

@router.post("/{post_slug}")
def add_comment(
    post_slug: str, 
    content: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Add a comment to a post - placeholder"""
    # TODO: Implement actual comment creation
    raise HTTPException(status_code=501, detail="Comments not yet implemented")
