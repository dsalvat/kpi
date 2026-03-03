from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_ENV: str = "development"
    SECRET_KEY: str = "canvia_aquesta_clau_en_produccio"
    N8N_WEBHOOK_TOKEN: str = "token_secret_per_autenticar_ingest_des_de_n8n"

    DATABASE_URL: str = "postgresql+asyncpg://kpi_user:password@postgres:5432/kpi_db"
    REDIS_URL: str = "redis://redis:6379/0"

    N8N_API_URL: str = ""
    N8N_API_KEY: str = ""

    HOURLY_RATE_TECHNICAL: float = 45.0
    HOURLY_RATE_ADMIN: float = 35.0
    HOURLY_RATE_OPERATOR: float = 22.0

    # JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
