from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import get_session
from models import SiteConfig

router = APIRouter()

@router.get("/", response_model=SiteConfig)
def get_site_config(session: Session = Depends(get_session)):
    config = session.exec(select(SiteConfig)).first()
    if not config:
        config = SiteConfig(
            ownerName="Garry",
            avatarInitial="G",
            avatarGradient="from-blue-600 to-indigo-600"
        )
        session.add(config)
        session.commit()
        session.refresh(config)
    return config

from auth import get_current_user
from models import User

@router.put("/", response_model=SiteConfig)
def update_site_config(
    site_config: SiteConfig, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # There should only be one config usually
    config = session.exec(select(SiteConfig)).first()
    if not config:
        config = SiteConfig()
        session.add(config)
    
    config.ownerName = site_config.ownerName
    config.avatarInitial = site_config.avatarInitial
    config.avatarGradient = site_config.avatarGradient
    config.avatarImage = site_config.avatarImage
    config.siteTitle = site_config.siteTitle
    config.availableCategories = site_config.availableCategories
    config.updatedAt = site_config.updatedAt # Or updated automatically
    
    session.add(config)
    session.commit()
    session.refresh(config)
    return config
