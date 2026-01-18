from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from models import User
from auth import get_current_user, get_password_hash
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class UserCreate(BaseModel):
    email: str
    password: str
    fullName: str  # 创建时必须提供 fullName

class UserRead(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    fullName: Optional[str] = None
    avatar: Optional[str] = None
    
class UserProfileUpdate(BaseModel):
    fullName: Optional[str] = None
    avatar: Optional[str] = None

# 默认头像 URL
DEFAULT_AVATAR = "/static/default-avatar.svg"

@router.get("/", response_model=List[UserRead])
async def read_users(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    users = session.exec(select(User)).all()
    return users

@router.get("/me", response_model=UserRead)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """获取当前登录用户的资料"""
    return current_user

@router.put("/me", response_model=UserRead)
async def update_current_user_profile(
    profile: UserProfileUpdate, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    """更新当前登录用户的资料 (头像, 昵称)"""
    if profile.fullName is not None:
        current_user.fullName = profile.fullName
    if profile.avatar is not None:
        current_user.avatar = profile.avatar
    
    current_user.updatedAt = datetime.utcnow()
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

@router.post("/", response_model=UserRead)
async def create_user(user: UserCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    existing_user = session.exec(select(User).where(User.email == user.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email, 
        password=hashed_password, 
        name=user.fullName,  # 向后兼容
        fullName=user.fullName,
        avatar=None  # 使用默认头像
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

@router.delete("/{user_id}")
async def delete_user(user_id: str, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    session.delete(user)
    session.commit()
    return {"ok": True}

