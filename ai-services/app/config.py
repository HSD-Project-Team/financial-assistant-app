from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Financial Assistant AI Service"
    debug: bool = False
    anthropic_api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
