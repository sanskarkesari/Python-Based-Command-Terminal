#!/usr/bin/env python3
"""
TerminalX Backend Server
A FastAPI backend for the TerminalX web application
"""

import uvicorn
from main import app
from config import settings

if __name__ == "__main__":
    print(f"�� Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    print(f"📡 Server will be available at: http://{settings.HOST}:{settings.PORT}")
    print(f"📚 API Documentation: http://{settings.HOST}:{settings.PORT}/docs")
    print(f"🔧 Debug mode: {'ON' if settings.DEBUG else 'OFF'}")
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info" if settings.DEBUG else "warning"
    )
