"""
文件上传 API
支持多类型文件上传，图片自动转 WebP 压缩
"""

from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from PIL import Image
import shutil
import os
import io
from uuid import uuid4
from auth import get_current_user
from models import User

router = APIRouter()

# ============== 配置 ==============
UPLOAD_BASE_DIR = os.getenv("UPLOAD_DIR", "static/uploads")

# 文件类型配置: {MIME前缀或扩展名: (子目录, 最大大小MB)}
FILE_TYPE_CONFIG = {
    # 图片类型
    "image/": ("images", 10),
    # 数据文件
    ".csv": ("data", 50),
    ".xlsx": ("data", 50),
    ".xls": ("data", 50),
    ".json": ("data", 50),
    ".parquet": ("data", 50),
    # 文档
    ".pdf": ("docs", 20),
    ".md": ("docs", 20),
    ".txt": ("docs", 20),
}

# WebP 压缩质量 (1-100)
WEBP_QUALITY = 85

# 不转换的图片格式
NO_CONVERT_FORMATS = {"gif", "webp", "svg"}


def get_file_config(content_type: str, filename: str) -> tuple[str, int] | None:
    """根据文件类型获取配置 (子目录, 最大大小MB)"""
    # 先检查 MIME 类型前缀
    for prefix, config in FILE_TYPE_CONFIG.items():
        if prefix.endswith("/") and content_type.startswith(prefix):
            return config
    
    # 再检查文件扩展名
    ext = os.path.splitext(filename)[1].lower()
    if ext in FILE_TYPE_CONFIG:
        return FILE_TYPE_CONFIG[ext]
    
    return None


def convert_to_webp(file_bytes: bytes) -> tuple[bytes, str]:
    """
    将图片转换为 WebP 格式
    返回: (转换后的字节, 新扩展名)
    """
    try:
        img = Image.open(io.BytesIO(file_bytes))
        
        # 如果是 RGBA 模式（如 PNG 透明图），保持透明度
        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
            # 保留透明通道
            pass
        elif img.mode != "RGB":
            img = img.convert("RGB")
        
        output = io.BytesIO()
        img.save(output, format="WEBP", quality=WEBP_QUALITY, method=6)
        return output.getvalue(), ".webp"
    except Exception:
        # 转换失败，返回原始数据
        return file_bytes, None


@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    通用文件上传接口
    
    支持类型:
    - 图片: jpg, png, gif, webp (jpg/png 自动转 webp)
    - 数据: csv, xlsx, xls, json, parquet
    - 文档: pdf, md, txt
    """
    # 获取文件配置
    config = get_file_config(file.content_type, file.filename)
    if not config:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型: {file.content_type}"
        )
    
    subdir, max_size_mb = config
    
    # 读取文件内容
    file_bytes = await file.read()
    file_size_mb = len(file_bytes) / (1024 * 1024)
    
    # 检查文件大小
    if file_size_mb > max_size_mb:
        raise HTTPException(
            status_code=413,
            detail=f"文件过大: {file_size_mb:.1f}MB，最大允许 {max_size_mb}MB"
        )
    
    # 处理文件名和扩展名
    original_ext = os.path.splitext(file.filename)[1].lower()
    
    # 图片处理：自动转 WebP
    if subdir == "images" and original_ext.lstrip(".") not in NO_CONVERT_FORMATS:
        converted_bytes, new_ext = convert_to_webp(file_bytes)
        if new_ext:
            file_bytes = converted_bytes
            final_ext = new_ext
        else:
            final_ext = original_ext
    else:
        final_ext = original_ext
    
    # 生成唯一文件名
    filename = f"{uuid4()}{final_ext}"
    
    # 确保目录存在
    upload_dir = os.path.join(UPLOAD_BASE_DIR, subdir)
    os.makedirs(upload_dir, exist_ok=True)
    
    # 保存文件
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)
    
    # 返回相对路径
    relative_url = f"/static/uploads/{subdir}/{filename}"
    
    return {
        "url": relative_url,
        "filename": filename,
        "original_name": file.filename,
        "size_mb": round(len(file_bytes) / (1024 * 1024), 2),
        "type": subdir
    }
