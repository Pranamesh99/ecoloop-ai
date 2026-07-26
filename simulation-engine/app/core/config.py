from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "EcoLoop AI"
    API_V1_STR: str = "/api/v1"
    SIMULATION_UPDATE_INTERVAL_SEC: float = 1.0
    
    class Config:
        case_sensitive = True

settings = Settings()
