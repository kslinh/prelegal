import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Prelegal API"
    debug: bool = bool(os.getenv("DEBUG", False))
    database_url: str = os.getenv("DATABASE_URL", "sqlite:////app/data/prelegal.db")
    openrouter_api_key: str = os.getenv("OPENROUTER_API_KEY", "")
    secret_key: str = os.getenv("SECRET_KEY", "")
    algorithm: str = "HS256"
    access_token_expire_hours: int = 24
    remember_me_expire_days: int = 30

    class Config:
        env_file = ".env"

settings = Settings()

# Validate required settings
if not settings.secret_key:
    if not settings.debug:
        raise RuntimeError("SECRET_KEY environment variable is required for production")
    # Use a development default only in debug mode
    settings.secret_key = "dev-key-do-not-use-in-production"
