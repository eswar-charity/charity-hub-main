from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str
    supabase_jwt_secret: str
    cloudinary_cloud_name: str
    cloudinary_api_key: str
    cloudinary_api_secret: str
    cloudinary_upload_preset: str
    stripe_secret_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None
    app_env: str = "development"
    cors_origins: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
