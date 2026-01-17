from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_db_and_tables
from fastapi.staticfiles import StaticFiles
from api import posts, projects, site, stats, auth, upload, search, analytics, categories, comments
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

# Mount static files
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS is important for local dev if ports differ, and for client-side fetches
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://115.191.9.139",      # Production Frontend (Nginx/Default)
    "http://115.191.9.139:3000", # Production Frontend (Direct Port)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(posts.router, prefix="/api/posts", tags=["posts"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(site.router, prefix="/api/site-config", tags=["site"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
app.include_router(comments.router, prefix="/api/comments", tags=["comments"])

@app.get("/")
def read_root():
    return {"message": "API is running"}
