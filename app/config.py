from pydantic_settings import BaseSettings 
from pydantic import ConfigDict

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRY_MINUTES: int = 30
    DATABASE_URL:str
    model_config = ConfigDict(env_file="../.env")

settings = Settings()