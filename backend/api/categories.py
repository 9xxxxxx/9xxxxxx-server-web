from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session, select
from database import get_session
from models import Post, Project, SiteConfig, User
from auth import get_current_user
from typing import List

router = APIRouter()

@router.get("/", response_model=List[str])
def get_all_categories(session: Session = Depends(get_session)):
    """Get all unique categories from posts and projects"""
    # Get from SiteConfig first
    config = session.exec(select(SiteConfig)).first()
    if config and config.availableCategories:
        return config.availableCategories
    
    # Fallback: collect from existing posts/projects
    post_categories = session.exec(select(Post.category).distinct()).all()
    project_categories = session.exec(select(Project.category).distinct()).all()
    
    categories = set()
    for cat in post_categories:
        if cat:
            categories.add(cat)
    for cat in project_categories:
        if cat:
            categories.add(cat)
    
    return sorted(list(categories))

@router.post("/", response_model=List[str])
def add_category(
    category: str = Body(..., embed=False),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Add a new category to the global list"""
    if not category or not category.strip():
        raise HTTPException(status_code=400, detail="Category name cannot be empty")
    
    category = category.strip()
    
    # Get or create SiteConfig
    config = session.exec(select(SiteConfig)).first()
    if not config:
        config = SiteConfig()
        session.add(config)
    
    # Add category if not exists
    if category not in config.availableCategories:
        config.availableCategories.append(category)
        session.add(config)
        session.commit()
        session.refresh(config)
    
    return config.availableCategories

@router.delete("/{category_name}", response_model=List[str])
def delete_category(
    category_name: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Remove a category from the global list"""
    config = session.exec(select(SiteConfig)).first()
    if not config:
        raise HTTPException(status_code=404, detail="Site config not found")
    
    if category_name in config.availableCategories:
        config.availableCategories.remove(category_name)
        session.add(config)
        session.commit()
        session.refresh(config)
    
    return config.availableCategories
