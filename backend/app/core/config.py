from pydantic_settings import BaseSettings
from pathlib import Path
import os


class Settings(BaseSettings):
    app_name: str = "IELTS Web API"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    # Data paths - 默认使用项目目录下的 data 文件夹，可通过环境变量覆盖
    ielts_data_dir: str = os.getenv("IELTS_DATA_DIR", str(Path(__file__).parent.parent.parent.parent / "data"))

    class Config:
        env_file = ".env"


settings = Settings()
