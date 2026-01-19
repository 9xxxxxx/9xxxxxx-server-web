from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from database import get_session
from models import Comment as CommentModel, Post, Project, User
from auth import get_current_user
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Pydantic 模型
class CommentCreate(BaseModel):
    content: str
    guestName: str = "Guest"

class CommentResponse(BaseModel):
    id: str
    content: str
    guestName: str
    createdAt: datetime
    postId: Optional[str] = None
    projectId: Optional[str] = None

class CommentsListResponse(BaseModel):
    comments: List[CommentResponse]
    total: int

# ========== 公开 API ==========

@router.get("/post/{slug}", response_model=CommentsListResponse)
def get_comments_for_post(slug: str, session: Session = Depends(get_session)):
    """获取文章的留言列表 (公开)"""
    post = session.exec(select(Post).where(Post.slug == slug)).first()
    if not post:
        # Try finding by ID
        post = session.get(Post, slug)
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comments = session.exec(
        select(CommentModel)
        .where(CommentModel.postId == post.id)
        .order_by(CommentModel.createdAt.desc())
    ).all()
    
    return {
        "comments": [CommentResponse(**c.model_dump()) for c in comments],
        "total": len(comments)
    }

@router.post("/post/{slug}", response_model=CommentResponse)
def add_comment_to_post(slug: str, comment: CommentCreate, session: Session = Depends(get_session)):
    """为文章添加留言 (公开, 无需登录)"""
    post = session.exec(select(Post).where(Post.slug == slug)).first()
    if not post:
        post = session.get(Post, slug)

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    new_comment = CommentModel(
        content=comment.content,
        guestName=comment.guestName,
        postId=post.id
    )
    session.add(new_comment)
    session.commit()
    session.refresh(new_comment)
    return CommentResponse(**new_comment.model_dump())

@router.get("/project/{slug}", response_model=CommentsListResponse)
def get_comments_for_project(slug: str, session: Session = Depends(get_session)):
    """获取项目的留言列表 (公开)"""
    project = session.exec(select(Project).where(Project.slug == slug)).first()
    if not project:
        project = session.get(Project, slug)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    comments = session.exec(
        select(CommentModel)
        .where(CommentModel.projectId == project.id)
        .order_by(CommentModel.createdAt.desc())
    ).all()
    
    return {
        "comments": [CommentResponse(**c.model_dump()) for c in comments],
        "total": len(comments)
    }

@router.post("/project/{slug}", response_model=CommentResponse)
def add_comment_to_project(slug: str, comment: CommentCreate, session: Session = Depends(get_session)):
    """为项目添加留言 (公开, 无需登录)"""
    project = session.exec(select(Project).where(Project.slug == slug)).first()
    if not project:
        project = session.get(Project, slug)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    new_comment = CommentModel(
        content=comment.content,
        guestName=comment.guestName,
        projectId=project.id
    )
    session.add(new_comment)
    session.commit()
    session.refresh(new_comment)
    return CommentResponse(**new_comment.model_dump())

# ========== 管理员 API ==========

@router.get("/", response_model=CommentsListResponse)
def list_all_comments(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """获取所有留言 (管理员)"""
    total = len(session.exec(select(CommentModel)).all())
    comments = session.exec(
        select(CommentModel)
        .order_by(CommentModel.createdAt.desc())
        .offset(skip)
        .limit(limit)
    ).all()
    
    return {
        "comments": [CommentResponse(**c.model_dump()) for c in comments],
        "total": total
    }

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """删除留言 (管理员)"""
    comment = session.get(CommentModel, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    session.delete(comment)
    session.commit()
    return {"success": True, "message": "Comment deleted"}
