from fastapi import APIRouter, Depends
from sqlmodel import Session, select, or_
from database import get_session
from models import Post, Project
from typing import List, Literal
from pydantic import BaseModel

router = APIRouter()

class SearchResult(BaseModel):
    type: Literal["Blog", "Project"]
    title: str
    description: str
    url: str
    category: str

@router.get("/", response_model=List[SearchResult])
def search(q: str = "", session: Session = Depends(get_session)):
    if not q:
        return []
    
    results = []
    normalized_q = q.lower()
    
    # Search Posts
    posts = session.exec(select(Post).where(Post.published == True)).all()
    for post in posts:
        if normalized_q in post.title.lower() or normalized_q in post.description.lower():
            results.append(SearchResult(
                type="Blog",
                title=post.title,
                description=post.description,
                url=f"/blog/{post.slug}",
                category=post.category or "Uncategorized"
            ))
            
    # Search Projects
    projects = session.exec(select(Project).where(Project.published == True)).all()
    for project in projects:
         if normalized_q in project.title.lower() or normalized_q in project.description.lower():
            results.append(SearchResult(
                type="Project",
                title=project.title,
                description=project.description,
                url=f"/projects/{project.slug}",
                category=project.category or "Uncategorized"
            ))
            
    return results[:20]  # Limit results
