from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from database import get_session
from models import Post, User

router = APIRouter()

@router.get("/", response_model=List[Post])
def get_posts(
    session: Session = Depends(get_session),
    category: Optional[str] = None,
    tag: Optional[str] = None,
    published_only: bool = True,
    include_login_required: bool = False  # 管理员请求时传 True
):
    query = select(Post).order_by(Post.createdAt.desc())
    if published_only:
        query = query.where(Post.published == True)
    
    # 权限过滤: 默认只返回公开内容
    if not include_login_required:
        query = query.where(Post.visibility == "public")
    
    if category and category != "All":
        query = query.where(Post.category == category)
    
    # Tag filtering (simple JSON contains check if possible, or python side filtering)
    # SQLite has limited JSON support in old versions, but modern sqlite supports json_each
    # For now, let's fetch and filter in python if simple, OR use a text search if we stored as comma separated.
    # Since we defined sa_column=Column(JSON), we assume we get a list.
    
    results = session.exec(query).all()
    
    # Filter by tag in python if needed (easier for compatibility)
    if tag:
        results = [p for p in results if tag in p.tags]
        
    return results

@router.get("/categories", response_model=List[str])
def get_categories(session: Session = Depends(get_session)):
    query = select(Post.category).where(Post.published == True).distinct()
    return session.exec(query).all()

@router.get("/tags", response_model=List[str])
def get_tags(session: Session = Depends(get_session)):
    query = select(Post.tags).where(Post.published == True)
    posts = session.exec(query).all()
    unique_tags = set()
    for tags in posts:
        for tag in tags:
            unique_tags.add(tag)
    return sorted(list(unique_tags))

@router.get("/{slug}", response_model=Post)
def get_post(slug: str, session: Session = Depends(get_session)):
    post = session.exec(select(Post).where(Post.slug == slug)).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.get("/id/{id}", response_model=Post)
def get_post_by_id(id: str, session: Session = Depends(get_session)):
    post = session.get(Post, id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.get("/{slug}/related", response_model=List[Post])
def get_related_posts(slug: str, limit: int = 3, session: Session = Depends(get_session)):
    current_post = session.exec(select(Post).where(Post.slug == slug)).first()
    if not current_post:
        return []
    
    # Simple Python-side logic for related posts (tag overlap)
    # Provide a way to exclude current post
    all_posts = session.exec(select(Post).where(Post.published == True).where(Post.slug != slug)).all()
    
    scored_posts = []
    current_tags = set(current_post.tags)
    
    for p in all_posts:
        score = len(current_tags.intersection(set(p.tags)))
        scored_posts.append((score, p))
        
    scored_posts.sort(key=lambda x: x[0], reverse=True)
    return [p for score, p in scored_posts[:limit]]

# --- Admin / CRUD Operations ---
from auth import get_current_user

from models import PostCreate, PostUpdate

@router.post("/", response_model=Post)
def create_post(post_in: PostCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    post = Post.from_orm(post_in)
    post.authorId = current_user.id
    session.add(post)
    session.commit()
    session.refresh(post)
    return post

@router.put("/{id}", response_model=Post)
def update_post(id: str, post_in: PostUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    post = session.get(Post, id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Update fields
    post_data_dict = post_in.dict(exclude_unset=True)
    for key, value in post_data_dict.items():
        setattr(post, key, value)
            
    session.add(post)
    session.commit()
    session.refresh(post)
    return post

@router.delete("/{id}")
def delete_post(id: str, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    post = session.get(Post, id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    session.delete(post)
    session.commit()
    return {"ok": True}
