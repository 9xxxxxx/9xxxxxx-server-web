from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from database import get_session
from models import Post, Project, AnalyticsEvent

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(session: Session = Depends(get_session)):
    posts_count = session.exec(select(func.count(Post.id))).one()
    projects_count = session.exec(select(func.count(Project.id))).one()
    # Mocking visits for now or implement if needed
    visits_count = session.exec(select(func.count(AnalyticsEvent.id))).one()
    
    return {
        "postsCount": posts_count,
        "projectsCount": projects_count,
        "visitsCount": visits_count
    }
