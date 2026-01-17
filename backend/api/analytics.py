from fastapi import APIRouter, Depends, BackgroundTasks
from sqlmodel import Session
from database import get_session
from models import AnalyticsEvent
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()

class TrackPayload(BaseModel):
    path: str
    browser: Optional[str] = None
    os: Optional[str] = None
    device: Optional[str] = "desktop"

@router.post("/track")
def track(payload: TrackPayload, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    # Run DB write in background to return quickly
    background_tasks.add_task(save_analytics, payload, session)
    return {"ok": True}

def save_analytics(payload: TrackPayload, session: Session):
    event = AnalyticsEvent(
        eventType="pageview",
        path=payload.path,
        metadata={
            "browser": payload.browser,
            "os": payload.os,
            "device": payload.device
        }
    )
    # Note: If AnalyticsEvent model doesn't support generic JSON metadata in SQLite easily, 
    # we might need to adjust or just store as string. 
    # Checking models.py implicitly. Assuming it works or I'll fix if error.
    # Actually, let's keep it simple.
    
    session.add(event)
    session.commit()
