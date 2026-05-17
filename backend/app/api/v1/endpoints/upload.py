"""文件上传与解析端点"""
from fastapi import APIRouter, File, UploadFile, HTTPException
from pathlib import Path
import shutil
import tempfile

from app.parser import parse_pdf, parse_images
import uuid
import os

router = APIRouter()

# 持久化目录用于存储上传的文件和解析结果
# 使用项目根目录下的 uploads 文件夹
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# 文件扩展名检查
ALLOWED_PDF_EXTENSIONS = {".pdf"}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def get_file_extension(filename: str) -> str:
    """获取文件扩展名（小写）"""
    return Path(filename).suffix.lower()


def is_pdf_file(filename: str, content_type: str) -> bool:
    """检查是否为 PDF 文件"""
    ext = get_file_extension(filename)
    return ext in ALLOWED_PDF_EXTENSIONS or content_type == "application/pdf"


def is_image_file(filename: str, content_type: str) -> bool:
    """检查是否为图片文件"""
    ext = get_file_extension(filename)
    image_types = ["image/jpeg", "image/png", "image/webp"]
    return ext in ALLOWED_IMAGE_EXTENSIONS or content_type in image_types


def convert_paths_to_urls(result: dict, upload_id: str) -> dict:
    """
    将解析结果中的绝对路径转换为相对 URL

    Args:
        result: 解析结果字典
        upload_id: 上传文件的唯一 ID

    Returns:
        转换后的结果字典
    """
    if "pages" in result and isinstance(result["pages"], list):
        for page in result["pages"]:
            # 转换截图路径
            if "screenshot_path" in page and page["screenshot_path"]:
                # 提取文件名
                filename = Path(page["screenshot_path"]).name
                # 转换为 URL
                page["screenshot_path"] = f"/uploads/{upload_id}/{filename}"

    return result


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    上传 PDF 或图片文件进行解析

    Args:
        file: 上传的文件（支持 PDF、JPG、PNG）

    Returns:
        解析结果 JSON
    """
    try:
        # 验证文件类型
        if not is_pdf_file(file.filename, file.content_type) and not is_image_file(file.filename, file.content_type):
            raise HTTPException(status_code=400, detail="不支持的文件类型，仅支持 PDF 和图片格式")

        # 创建唯一的持久化目录
        upload_id = str(uuid.uuid4())
        upload_dir = UPLOAD_DIR / upload_id
        upload_dir.mkdir(parents=True, exist_ok=True)

        # 保存上传的文件
        file_path = upload_dir / file.filename
        file_content = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)

        # 根据文件类型进行解析
        if is_pdf_file(file.filename, file.content_type):
            result = parse_pdf(str(file_path), str(upload_dir))
        else:
            # 图片文件
            result = parse_images([str(file_path)], str(upload_dir))

        # 将绝对路径转换为相对 URL
        result = convert_paths_to_urls(result, upload_id)

        # 返回解析结果
        return result

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"解析失败: {str(e)}")


@router.post("/upload/multiple")
async def upload_multiple_files(files: list[UploadFile] = File(...)):
    """
    批量上传图片文件进行解析

    Args:
        files: 多个图片文件

    Returns:
        解析结果 JSON
    """
    try:
        if not files:
            raise HTTPException(status_code=400, detail="请至少上传一个文件")

        # 验证所有文件类型
        for f in files:
            if not is_image_file(f.filename, f.content_type):
                raise HTTPException(status_code=400, detail=f"不支持的文件类型: {f.filename}")

        # 创建唯一的持久化目录
        upload_id = str(uuid.uuid4())
        upload_dir = UPLOAD_DIR / upload_id
        upload_dir.mkdir(parents=True, exist_ok=True)
        file_paths = []

        # 保存所有上传的文件
        for file in files:
            file_path = upload_dir / file.filename
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            file_paths.append(str(file_path))

        # 解析图片
        result = parse_images(file_paths, str(upload_dir))

        # 将绝对路径转换为相对 URL
        result = convert_paths_to_urls(result, upload_id)

        return result

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"解析失败: {str(e)}")
