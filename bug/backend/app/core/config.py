from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "IELTS Web API"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    # Data paths
    ielts_data_dir: str = "D:/ielts_data"

    class Config:
        env_file = ".env"


settings = Settings()
