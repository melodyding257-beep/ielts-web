"""文件上传与解析端点"""
from fastapi import APIRouter, File, UploadFile, HTTPException
from pathlib import Path
import shutil
import tempfile

from app.parser import parse_pdf, parse_images

router = APIRouter()

# 临时目录用于存储上传的文件和解析结果
UPLOAD_DIR = Path(tempfile.gettempdir()) / "ielts_uploads"
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
        # 验证文件类型（同时检查扩展名和 content_type）
        if not is_pdf_file(file.filename, file.content_type) and not is_image_file(file.filename, file.content_type):
            raise HTTPException(status_code=400, detail="不支持的文件类型，仅支持 PDF 和图片格式")
        
        # 创建临时目录
        with tempfile.TemporaryDirectory(dir=str(UPLOAD_DIR)) as temp_dir:
            temp_dir_path = Path(temp_dir)
            
            # 保存上传的文件
            file_path = temp_dir_path / file.filename
            file_content = await file.read()
            buffer = open(file_path, "wb")
            buffer.write(file_content)
            buffer.flush()
            buffer.close()
            
            # 根据文件类型进行解析
            if is_pdf_file(file.filename, file.content_type):
                result = parse_pdf(str(file_path), str(temp_dir_path))
            else:
                # 图片文件
                result = parse_images([str(file_path)], str(temp_dir_path))
            
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
        
        # 创建临时目录
        with tempfile.TemporaryDirectory(dir=str(UPLOAD_DIR)) as temp_dir:
            temp_dir_path = Path(temp_dir)
            file_paths = []
            
            # 保存所有上传的文件
            for file in files:
                file_path = temp_dir_path / file.filename
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                file_paths.append(str(file_path))
            
            # 解析图片
            result = parse_images(file_paths, str(temp_dir_path))
            return result
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"解析失败: {str(e)}")
