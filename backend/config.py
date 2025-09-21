import os
from typing import List

class Settings:
    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "TerminalX Backend"
    VERSION: str = "1.0.0"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # File System Settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_EXTENSIONS: List[str] = [".txt", ".md", ".py", ".js", ".json", ".css", ".html"]
    
    # Process Simulation Settings
    PROCESS_UPDATE_INTERVAL: int = 2500  # milliseconds
    MAX_PROCESSES: int = 15
    MIN_PROCESSES: int = 5

settings = Settings()
