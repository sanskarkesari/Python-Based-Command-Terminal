from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import json
import os
from datetime import datetime
import asyncio
import random
from system_monitor import system_monitor

app = FastAPI(title="TerminalX Backend", version="1.0.0")

# Get environment variables
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Configure CORS for Render deployment
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://localhost:3000",
    "https://127.0.0.1:3000",
]

# Add frontend URL if provided
if FRONTEND_URL:
    allowed_origins.append(FRONTEND_URL)

# Add your specific Vercel domain
allowed_origins.extend([
    "https://python-based-command-terminal-dusky.vercel.app",
    "https://python-based-command-terminal.vercel.app",
    "https://terminalx.vercel.app"
])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Data models
class CommandRequest(BaseModel):
    command: str
    current_path: str

class CommandResponse(BaseModel):
    output: str
    current_path: str
    success: bool
    error: Optional[str] = None

class SystemInfo(BaseModel):
    cpu_percent: float
    memory_percent: float
    memory_used: str
    memory_total: str
    disk_usage: str
    uptime: str
    processes: List[Dict[str, Any]]

# Global state
current_directory = os.path.expanduser("~")
file_system = {}

def simulate_file_system():
    """Initialize a simulated file system"""
    global file_system
    file_system = {
        "home": {
            "user": {
                "documents": {
                    "project1": {"type": "directory"},
                    "project2": {"type": "directory"},
                    "readme.txt": {"type": "file", "content": "Welcome to the terminal!"}
                },
                "downloads": {
                    "file1.pdf": {"type": "file", "content": "PDF content here"},
                    "image.jpg": {"type": "file", "content": "Image data"}
                },
                "desktop": {
                    "shortcut": {"type": "file", "content": "Shortcut to app"}
                }
            }
        },
        "etc": {
            "config": {"type": "file", "content": "System configuration"},
            "hosts": {"type": "file", "content": "127.0.0.1 localhost"}
        },
        "var": {
            "log": {
                "system.log": {"type": "file", "content": "System log entries..."}
            }
        }
    }

def get_directory_contents(path: str) -> List[Dict[str, str]]:
    """Get contents of a directory in the simulated file system"""
    if path == "/" or path == "":
        return [{"name": "home", "type": "directory"}, {"name": "etc", "type": "directory"}, {"name": "var", "type": "directory"}]
    
    parts = [p for p in path.split("/") if p]
    current = file_system
    
    for part in parts:
        if part in current and isinstance(current[part], dict) and current[part].get("type") != "file":
            current = current[part]
        else:
            return []
    
    contents = []
    for name, item in current.items():
        if isinstance(item, dict):
            if item.get("type") == "file":
                contents.append({"name": name, "type": "file"})
            else:
                contents.append({"name": name, "type": "directory"})
    
    return contents

def execute_command(command: str, current_path: str) -> CommandResponse:
    """Execute a terminal command and return the response"""
    global current_directory
    
    if current_path:
        current_directory = current_path
    
    parts = command.strip().split()
    if not parts:
        return CommandResponse(output="", current_path=current_directory, success=True)
    
    cmd = parts[0].lower()
    args = parts[1:] if len(parts) > 1 else []
    
    try:
        if cmd == "ls":
            if args and args[0] == "-la":
                contents = get_directory_contents(current_directory)
                if not contents:
                    output = f"ls: cannot access '{current_directory}': No such file or directory"
                else:
                    output = "total 0\n"
                    for item in contents:
                        permissions = "drwxr-xr-x" if item["type"] == "directory" else "-rw-r--r--"
                        size = "4096" if item["type"] == "directory" else "1024"
                        date = "Dec 25 12:00"
                        name = item["name"]
                        output += f"{permissions} 1 user user {size} {date} {name}\n"
            else:
                contents = get_directory_contents(current_directory)
                if not contents:
                    output = f"ls: cannot access '{current_directory}': No such file or directory"
                else:
                    output = " ".join([item["name"] for item in contents])
            return CommandResponse(output=output, current_path=current_directory, success=True)
        
        elif cmd == "pwd":
            return CommandResponse(output=current_directory, current_path=current_directory, success=True)
        
        elif cmd == "cd":
            if not args:
                current_directory = "/"
            elif args[0] == "..":
                if current_directory != "/":
                    current_directory = "/".join(current_directory.rstrip("/").split("/")[:-1]) or "/"
            elif args[0].startswith("/"):
                current_directory = args[0]
            else:
                new_path = f"{current_directory.rstrip('/')}/{args[0]}"
                contents = get_directory_contents(new_path)
                if contents is not None:
                    current_directory = new_path
                else:
                    return CommandResponse(
                        output=f"cd: {args[0]}: No such file or directory",
                        current_path=current_directory,
                        success=False
                    )
            return CommandResponse(output="", current_path=current_directory, success=True)
        
        elif cmd == "mkdir":
            if not args:
                return CommandResponse(output="mkdir: missing operand", current_path=current_directory, success=False)
            # In a real implementation, you'd create the directory
            return CommandResponse(output=f"Created directory '{args[0]}'", current_path=current_directory, success=True)
        
        elif cmd == "touch":
            if not args:
                return CommandResponse(output="touch: missing file operand", current_path=current_directory, success=False)
            # In a real implementation, you'd create the file
            return CommandResponse(output=f"Created file '{args[0]}'", current_path=current_directory, success=True)
        
        elif cmd == "cat":
            if not args:
                return CommandResponse(output="cat: missing file operand", current_path=current_directory, success=False)
            
            file_path = f"{current_directory.rstrip('/')}/{args[0]}"
            parts = [p for p in file_path.lstrip("/").split("/") if p]
            current = file_system
            
            for part in parts:
                if part in current and isinstance(current[part], dict):
                    current = current[part]
                else:
                    return CommandResponse(
                        output=f"cat: {args[0]}: No such file or directory",
                        current_path=current_directory,
                        success=False
                    )
            
            if current.get("type") == "file":
                return CommandResponse(output=current.get("content", ""), current_path=current_directory, success=True)
            else:
                return CommandResponse(
                    output=f"cat: {args[0]}: Is a directory",
                    current_path=current_directory,
                    success=False
                )
        
        elif cmd == "echo":
            message = " ".join(args)
            return CommandResponse(output=message, current_path=current_directory, success=True)
        
        elif cmd == "rm":
            if not args:
                return CommandResponse(output="rm: missing operand", current_path=current_directory, success=False)
            return CommandResponse(output=f"Removed '{args[0]}'", current_path=current_directory, success=True)
        
        elif cmd == "clear":
            return CommandResponse(output="\033[2J\033[H", current_path=current_directory, success=True)
        
        elif cmd == "help":
            help_text = """
Available commands:
  ls, ls -la    - List directory contents
  pwd           - Print working directory
  cd <dir>      - Change directory
  mkdir <dir>   - Create directory
  touch <file>  - Create file
  cat <file>    - Display file contents
  echo <text>   - Display text
  rm <file>     - Remove file
  clear         - Clear screen
  help          - Show this help
  top           - Show system processes
  htop          - Show system processes (enhanced)
  free          - Show memory usage
  df            - Show disk usage
  uptime        - Show system uptime
  ps            - Show running processes
  iostat        - Show I/O statistics
  vmstat        - Show virtual memory statistics
  backend status - Check backend connection
  backend connect - Connect to backend
  backend on    - Enable backend mode
  backend off   - Disable backend mode
            """
            return CommandResponse(output=help_text.strip(), current_path=current_directory, success=True)
        
        else:
            return CommandResponse(
                output=f"Command not found: {cmd}. Type 'help' for available commands.",
                current_path=current_directory,
                success=False
            )
    
    except Exception as e:
        return CommandResponse(
            output=f"Error executing command: {str(e)}",
            current_path=current_directory,
            success=False,
            error=str(e)
        )

@app.get("/")
async def root():
    return {"message": "TerminalX Backend API", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/command", response_model=CommandResponse)
async def execute_terminal_command(request: CommandRequest):
    """Execute a terminal command"""
    return execute_command(request.command, request.current_path)

@app.get("/api/system")
async def get_system_info():
    """Get system monitoring information"""
    try:
        cpu_percent = system_monitor.get_cpu_percent()
        memory_info = system_monitor.get_memory_info()
        disk_info = system_monitor.get_disk_usage()
        uptime_info = system_monitor.get_uptime()
        processes = system_monitor.get_top_processes()
        
        return SystemInfo(
            cpu_percent=cpu_percent,
            memory_percent=memory_info["percent"],
            memory_used=memory_info["used"],
            memory_total=memory_info["total"],
            disk_usage=disk_info,
            uptime=uptime_info,
            processes=processes
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting system info: {str(e)}")

@app.get("/api/processes")
async def get_processes():
    """Get detailed process information"""
    try:
        processes = system_monitor.get_detailed_processes()
        return {"processes": processes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting processes: {str(e)}")

@app.get("/api/memory")
async def get_memory_info():
    """Get memory information"""
    try:
        memory_info = system_monitor.get_memory_info()
        return memory_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting memory info: {str(e)}")

@app.get("/api/cpu")
async def get_cpu_info():
    """Get CPU information"""
    try:
        cpu_info = system_monitor.get_cpu_info()
        return cpu_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting CPU info: {str(e)}")

@app.get("/api/disk")
async def get_disk_info():
    """Get disk information"""
    try:
        disk_info = system_monitor.get_disk_usage()
        return {"disk_usage": disk_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting disk info: {str(e)}")

@app.get("/api/network")
async def get_network_info():
    """Get network information"""
    try:
        network_info = system_monitor.get_network_info()
        return network_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting network info: {str(e)}")

if __name__ == "__main__":
    simulate_file_system()
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT, debug=DEBUG)
