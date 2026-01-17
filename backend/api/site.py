from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import get_session
from models import SiteConfig

from pydantic import BaseModel, EmailStr
import httpx
import os

router = APIRouter()

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

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

@router.post("/contact")
async def send_contact_email(msg: ContactMessage):
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        return {"success": False, "error": "Email service not configured"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": "Portfolio Contact <onboarding@resend.dev>",
                    "to": ["huangqiannb@gmail.com"],
                    "subject": f"[Portfolio] {msg.subject}",
                    "reply_to": msg.email,
                    "text": f"Name: {msg.name}\nEmail: {msg.email}\n\nMessage:\n{msg.message}"
                }
            )
            
            if response.status_code != 200:
                print(f"Resend error: {response.text}")
                return {"success": False, "error": "Failed to send email"}
                
            return {"success": True}
        except Exception as e:
            print(f"Contact email exception: {str(e)}")
            return {"success": False, "error": str(e)}
