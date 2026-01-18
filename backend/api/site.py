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
        print("[Resend] Error: RESEND_API_KEY not configured")
        return {"success": False, "error": "Email service not configured"}
    
    # 注意: onboarding@resend.dev 只能发送到 Resend 账户验证过的邮箱
    # 如需发送到任意邮箱,需要验证自己的域名
    recipient_email = os.getenv("CONTACT_EMAIL", "huangqiannb@gmail.com")
    
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
                    "to": [recipient_email],
                    "subject": f"[Portfolio] {msg.subject}",
                    "reply_to": msg.email,
                    "html": f"""
                        <h2>新留言来自: {msg.name}</h2>
                        <p><strong>邮箱:</strong> {msg.email}</p>
                        <p><strong>主题:</strong> {msg.subject}</p>
                        <hr/>
                        <p>{msg.message}</p>
                    """
                }
            )
            
            if response.status_code == 200:
                print(f"[Resend] Email sent successfully to {recipient_email}")
                return {"success": True}
            else:
                print(f"[Resend] Error {response.status_code}: {response.text}")
                return {"success": False, "error": f"Failed to send email: {response.status_code}"}
                
        except Exception as e:
            print(f"[Resend] Exception: {str(e)}")
            return {"success": False, "error": str(e)}
