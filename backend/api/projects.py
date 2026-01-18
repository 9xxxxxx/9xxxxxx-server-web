from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Project

router = APIRouter()

@router.get("/", response_model=List[Project])
def get_projects(
    session: Session = Depends(get_session),
    include_login_required: bool = False,  # 管理员请求时传 True
    include_unpublished: bool = False      # 新增参数: 是否包含未发布项目
):
    query = select(Project).order_by(Project.createdAt.desc())

    # 权限过滤
    if not include_unpublished:
        query = query.where(Project.published == True)
    
    # 默认只返回公开内容 (除非请求包含登录可见)
    if not include_login_required:
        query = query.where(Project.visibility == "public")
    
    return session.exec(query).all()

@router.get("/{slug}", response_model=Project)
def get_project(slug: str, session: Session = Depends(get_session)):
    project = session.exec(select(Project).where(Project.slug == slug)).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.get("/id/{id}", response_model=Project)
def get_project_by_id(id: str, session: Session = Depends(get_session)):
    project = session.get(Project, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.get("/{slug}/related", response_model=List[Project])
def get_related_projects(slug: str, session: Session = Depends(get_session)):
    current = session.exec(select(Project).where(Project.slug == slug)).first()
    if not current or not current.category:
        return []
    
    query = select(Project).where(
        Project.published == True,
        Project.category == current.category,
        Project.slug != slug
    ).limit(3)
    
    return session.exec(query).all()

# --- Admin / CRUD ---
from auth import get_current_user
from models import User, ProjectCreate, ProjectUpdate

@router.post("/", response_model=Project)
def create_project(project_in: ProjectCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    project_data = project_in.model_dump()
    project_data["authorId"] = current_user.id
    project = Project(**project_data)
    session.add(project)
    session.commit()
    session.refresh(project)
    return project

@router.put("/{id}", response_model=Project)
def update_project(id: str, project_in: ProjectUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    project = session.get(Project, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    data_dict = project_in.model_dump(exclude_unset=True)
    for key, value in data_dict.items():
        setattr(project, key, value)
            
    session.add(project)
    session.commit()
    session.refresh(project)
    return project

@router.delete("/{id}")
def delete_project(id: str, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    project = session.get(Project, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    session.delete(project)
    session.commit()
    return {"ok": True}
