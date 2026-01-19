from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from database import get_session
from models import Post, Project
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class LikeRequest(BaseModel):
    postId: Optional[str] = None
    projectId: Optional[str] = None

@router.post("/")
async def toggle_like(request: LikeRequest, session: Session = Depends(get_session)):
    if request.postId:
        item = session.get(Post, request.postId)
        if not item:
            raise HTTPException(status_code=404, detail="Post not found")
    elif request.projectId:
        item = session.get(Project, request.projectId)
        if not item:
            raise HTTPException(status_code=404, detail="Project not found")
    else:
        raise HTTPException(status_code=400, detail="Either postId or projectId must be provided")

    # Creating a simple increment logic. 
    # Note: Real-world apps might track user-specific likes to prevent duplicates, 
    # but based on the current simple requirements and lack of user-like-tracking table, 
    # we just increment the counter.
    item.likes += 1
    session.add(item)
    session.commit()
    session.refresh(item)
    
    return {"likes": item.likes}
