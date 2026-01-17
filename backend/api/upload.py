from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
import shutil
import os
from uuid import uuid4
from auth import get_current_user
from models import User

router = APIRouter()

UPLOAD_DIR = "static/uploads"

@router.post("/")
async def upload_file(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Generate unique filename
    ext = file.filename.split(".")[-1]
    filename = f"{uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Return relative path, usually matched by static mount
    return {"url": f"/static/uploads/{filename}"}

# Correct return: Just path, frontend can prepend domain if needed, or we return full if we know domain
# For simplicity, returning relative to "API root" usually works if we serve static.
# But Next.js (port 3000) needs to know where it is.
# Let's return the full URL assuming localhost:8000 for local, but in prod it depends.
# Better: return /static/uploads/filename
