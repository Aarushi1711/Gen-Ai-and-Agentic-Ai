from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
 
    groq_api_key: str = ""
    tavily_api_key: str = ""
    firebase_credentials_json: str = ""
 

    class Config:
        env_file = ".env"

settings = Settings()