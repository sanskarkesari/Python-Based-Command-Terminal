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

# Add common Vercel domains
allowed_origins.extend([
    "https://*.vercel.app",
    "https://*.netlify.app",
    "https://*.render.com"
])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class CommandRequest(BaseModel):
    command: str
    current_path: str
    file_system: Dict[str, Any]

class CommandResponse(BaseModel):
    success: bool
    output: Any
    new_path: Optional[str] = None
    new_file_system: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class FileSystemNode(BaseModel):
    type: str  # 'file' or 'directory'
    content: Optional[str] = None
    children: Optional[Dict[str, 'FileSystemNode']] = None

# Global state for process simulation
processes = []
is_top_running = False

# Natural Language Parser
def parse_natural_language(command: str) -> str:
    """Parse natural language commands into terminal commands"""
    command = command.strip()
    
    # create a folder named {name} -> mkdir {name}
    if command.lower().startswith("create a folder named "):
        name = command[22:].strip()
        return f"mkdir {name}"
    
    # make a file named {name} -> touch {name}
    if command.lower().startswith("make a file named "):
        name = command[18:].strip()
        return f"touch {name}"
    
    # delete file {name} -> rm {name}
    if command.lower().startswith("delete file "):
        name = command[11:].strip()
        return f"rm {name}"
    
    # show me the contents of {name} -> cat {name}
    if command.lower().startswith("show me the contents of "):
        name = command[24:].strip()
        return f"cat {name}"
    
    return command

def get_node_by_path(path: str, file_system: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Get a node by path from the file system"""
    if not path or path == "/":
        return file_system
    
    parts = path.split('/')
    if parts[0] == '':
        parts = parts[1:]  # Remove empty first part for absolute paths
    
    current_node = file_system
    for part in parts:
        if part == '':
            continue
        if current_node and current_node.get('type') == 'directory' and current_node.get('children'):
            current_node = current_node['children'].get(part)
        elif current_node and isinstance(current_node, dict) and not current_node.get('type'):
            # Handle root level
            current_node = current_node.get(part)
        else:
            return None
    
    return current_node

def generate_processes():
    """Generate simulated process data for 'top' command"""
    global processes
    commands = ['/bin/bash', 'code', 'chrome', 'node', 'docker', 'figma_agent', 'spotify', 'slack', 'kernel_task']
    users = ['root', 'user', 'system', 'windowserver']
    
    processes = []
    for i in range(random.randint(5, 10)):
        process = {
            'pid': random.randint(10000, 99999),
            'user': random.choice(users),
            'cpu': round(random.uniform(0, 25), 1),
            'mem': round(random.uniform(0, 5), 1),
            'command': random.choice(commands)
        }
        processes.append(process)

@app.get("/")
async def root():
    return {
        "message": "TerminalX Backend API", 
        "version": "1.0.0",
        "status": "running",
        "environment": "production" if not DEBUG else "development",
        "frontend_url": FRONTEND_URL
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint for Render"""
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "environment": "production" if not DEBUG else "development",
        "host": HOST,
        "port": PORT
    }

@app.post("/api/command", response_model=CommandResponse)
async def execute_command(request: CommandRequest):
    """Execute a terminal command"""
    global is_top_running
    
    try:
        # Parse natural language if needed
        command = parse_natural_language(request.command)
        parts = command.strip().split()
        
        if not parts:
            return CommandResponse(success=True, output="", new_path=request.current_path, new_file_system=request.file_system)
        
        cmd = parts[0]
        args = parts[1:] if len(parts) > 1 else []
        
        # Handle different commands
        if cmd == "help":
            is_top_running = False
            return handle_help()
        elif cmd == "ls":
            is_top_running = False
            return handle_ls(args, request.current_path, request.file_system)
        elif cmd == "cd":
            is_top_running = False
            return handle_cd(args, request.current_path, request.file_system)
        elif cmd == "mkdir":
            is_top_running = False
            return handle_mkdir(args, request.current_path, request.file_system)
        elif cmd == "touch":
            is_top_running = False
            return handle_touch(args, request.current_path, request.file_system)
        elif cmd == "cat":
            is_top_running = False
            return handle_cat(args, request.current_path, request.file_system)
        elif cmd == "echo":
            is_top_running = False
            return handle_echo(args)
        elif cmd == "pwd":
            is_top_running = False
            return handle_pwd(request.current_path)
        elif cmd == "clear":
            is_top_running = False
            return handle_clear()
        elif cmd == "top":
            is_top_running = True
            return handle_top()
        elif cmd == "htop":
            is_top_running = True
            return handle_htop()
        elif cmd == "free":
            is_top_running = False
            return handle_free()
        elif cmd == "df":
            is_top_running = False
            return handle_df()
        elif cmd == "uptime":
            is_top_running = False
            return handle_uptime()
        elif cmd == "ps":
            is_top_running = False
            return handle_ps(args)
        elif cmd == "iostat":
            is_top_running = False
            return handle_iostat()
        elif cmd == "vmstat":
            is_top_running = False
            return handle_vmstat()
        elif cmd == "rm":
            is_top_running = False
            return handle_rm(args, request.current_path, request.file_system)
        else:
            is_top_running = False
            return CommandResponse(
                success=False, 
                output=f"command not found: {cmd}",
                new_path=request.current_path,
                new_file_system=request.file_system
            )
    
    except Exception as e:
        return CommandResponse(
            success=False,
            output=f"Error executing command: {str(e)}",
            new_path=request.current_path,
            new_file_system=request.file_system
        )

def handle_help():
    """Handle help command"""
    commands = {
        'help': 'Show this help message.',
        'ls': 'List directory contents.',
        'cd [dir]': 'Change the current directory. Use ".." for parent.',
        'mkdir [dir]': 'Create a new directory.',
        'touch [file]': 'Create a new empty file.',
        'cat [file]': 'Display file content.',
        'echo [text]': 'Display a line of text.',
        'pwd': 'Print name of current/working directory.',
        'clear': 'Clear the terminal screen.',
        'top': 'Display processor activity (real system data).',
        'htop': 'Enhanced process viewer with bars (real system data).',
        'free': 'Display memory usage (real system data).',
        'df': 'Display disk space usage (real system data).',
        'uptime': 'Show system uptime and load (real system data).',
        'ps': 'Show running processes (real system data).',
        'iostat': 'Show I/O statistics (real system data).',
        'vmstat': 'Show virtual memory statistics (real system data).',
        'rm [file]': 'Remove a file or directory.'
    }
    
    help_output = []
    for cmd, desc in commands.items():
        help_output.append(f"{cmd:<15} {desc}")
    
    return CommandResponse(success=True, output="\n".join(help_output))

def handle_ls(args, current_path, file_system):
    """Handle ls command"""
    target_path = args[0] if args else current_path
    node = get_node_by_path(target_path, file_system)
    
    if node and node.get('type') == 'directory':
        children = node.get('children', {})
        if children:
            output = []
            for name, child in children.items():
                if child.get('type') == 'directory':
                    output.append(f"📁 {name}")
                else:
                    output.append(f"📄 {name}")
            return CommandResponse(success=True, output="\n".join(output))
        else:
            return CommandResponse(success=True, output="")
    else:
        return CommandResponse(
            success=False,
            output=f"ls: cannot access '{target_path}': No such file or directory"
        )

def handle_cd(args, current_path, file_system):
    """Handle cd command"""
    target = args[0] if args else "home/user"
    
    if target == "..":
        parts = current_path.split('/')
        if len(parts) > 1:
            new_path = '/'.join(parts[:-1])
        else:
            new_path = ""
    elif target.startswith('/'):
        new_path = target[1:]  # Remove leading slash
    elif target in ['~', '']:
        new_path = "home/user"
    else:
        if current_path:
            new_path = f"{current_path}/{target}"
        else:
            new_path = target
    
    # Clean up path
    new_path = new_path.strip('/')
    
    # Check if path exists
    node = get_node_by_path(new_path, file_system)
    if node and node.get('type') == 'directory':
        return CommandResponse(success=True, output="", new_path=new_path)
    else:
        return CommandResponse(
            success=False,
            output=f"cd: no such file or directory: {target}"
        )

def handle_mkdir(args, current_path, file_system):
    """Handle mkdir command"""
    if not args:
        return CommandResponse(success=False, output="mkdir: missing operand")
    
    dir_name = args[0]
    new_file_system = json.loads(json.dumps(file_system))  # Deep copy
    parent_node = get_node_by_path(current_path, new_file_system)
    
    if not parent_node or parent_node.get('type') != 'directory':
        return CommandResponse(success=False, output="mkdir: cannot create directory: Invalid path")
    
    if parent_node['children'].get(dir_name):
        return CommandResponse(
            success=False,
            output=f"mkdir: cannot create directory '{dir_name}': File exists"
        )
    
    parent_node['children'][dir_name] = {
        'type': 'directory',
        'children': {}
    }
    
    return CommandResponse(
        success=True,
        output="",
        new_file_system=new_file_system
    )

def handle_touch(args, current_path, file_system):
    """Handle touch command"""
    if not args:
        return CommandResponse(success=False, output="touch: missing file operand")
    
    file_name = args[0]
    new_file_system = json.loads(json.dumps(file_system))  # Deep copy
    parent_node = get_node_by_path(current_path, new_file_system)
    
    if not parent_node or parent_node.get('type') != 'directory':
        return CommandResponse(success=False, output="touch: cannot create file: Invalid path")
    
    if not parent_node['children'].get(file_name):
        parent_node['children'][file_name] = {
            'type': 'file',
            'content': ''
        }
    
    return CommandResponse(
        success=True,
        output="",
        new_file_system=new_file_system
    )

def handle_cat(args, current_path, file_system):
    """Handle cat command"""
    if not args:
        return CommandResponse(success=False, output="cat: missing file operand")
    
    file_name = args[0]
    file_path = file_name if '/' in file_name else f"{current_path}/{file_name}"
    node = get_node_by_path(file_path, file_system)
    
    if node and node.get('type') == 'file':
        content = node.get('content', '')
        return CommandResponse(success=True, output=content if content else "(empty file)")
    elif node and node.get('type') == 'directory':
        return CommandResponse(success=False, output=f"cat: {file_name}: Is a directory")
    else:
        return CommandResponse(success=False, output=f"cat: {file_name}: No such file or directory")

def handle_echo(args):
    """Handle echo command"""
    return CommandResponse(success=True, output=" ".join(args))

def handle_pwd(current_path):
    """Handle pwd command"""
    return CommandResponse(success=True, output=f"/{current_path}")

def handle_clear():
    """Handle clear command"""
    return CommandResponse(success=True, output="")

def handle_top():
    """Handle top command with real system data"""
    try:
        real_processes = system_monitor.get_top_processes(15)
        uptime_info = system_monitor.get_system_uptime()
        cpu_info = system_monitor.get_cpu_info()
        memory_info = system_monitor.get_memory_info()
        
        output = f"top - {datetime.now().strftime('%H:%M:%S')} up {uptime_info.get('uptime_formatted', 'unknown')}, load average: {cpu_info.get('load_average', [0,0,0])[0]:.2f}\n"
        output += f"Tasks: {len(real_processes)} total, 1 running, {len(real_processes)-1} sleeping, 0 stopped, 0 zombie\n"
        output += f"Cpu(s): {cpu_info.get('cpu_percent_average', 0):.1f}%us, 0.0%sy, 0.0%ni, {100-cpu_info.get('cpu_percent_average', 0):.1f}%id, 0.0%wa, 0.0%hi, 0.0%si, 0.0%st\n"
        
        mem = memory_info.get('virtual_memory', {})
        output += f"Mem: {system_monitor.format_bytes(mem.get('total', 0))} total, {system_monitor.format_bytes(mem.get('used', 0))} used, {system_monitor.format_bytes(mem.get('free', 0))} free, {mem.get('percent', 0):.1f}% used\n"
        
        swap = memory_info.get('swap_memory', {})
        output += f"Swap: {system_monitor.format_bytes(swap.get('total', 0))} total, {system_monitor.format_bytes(swap.get('used', 0))} used, {system_monitor.format_bytes(swap.get('free', 0))} free, {swap.get('percent', 0):.1f}% used\n\n"
        
        output += f"{'PID':<8} {'USER':<10} {'%CPU':<6} {'%MEM':<6} {'COMMAND':<20}\n"
        
        for proc in real_processes:
            output += f"{proc['pid']:<8} {proc['username']:<10} {proc['cpu_percent']:<6} {proc['memory_percent']:<6} {proc['command'][:20]:<20}\n"
        
        return CommandResponse(success=True, output=output)
    except Exception as e:
        return CommandResponse(success=False, output=f"Error getting system info: {str(e)}")

def handle_htop():
    """Handle htop command with enhanced real system data"""
    try:
        real_processes = system_monitor.get_top_processes(20)
        cpu_info = system_monitor.get_cpu_info()
        memory_info = system_monitor.get_memory_info()
        
        # CPU bars for each core
        output = f"htop - {datetime.now().strftime('%H:%M:%S')}\n"
        output += f"CPU: {system_monitor.format_percent_bar(cpu_info.get('cpu_percent_average', 0))}\n"
        
        # Memory bars
        mem = memory_info.get('virtual_memory', {})
        output += f"Mem: {system_monitor.format_percent_bar(mem.get('percent', 0))} {system_monitor.format_bytes(mem.get('used', 0))}/{system_monitor.format_bytes(mem.get('total', 0))}\n"
        
        swap = memory_info.get('swap_memory', {})
        output += f"Swp: {system_monitor.format_percent_bar(swap.get('percent', 0))} {system_monitor.format_bytes(swap.get('used', 0))}/{system_monitor.format_bytes(swap.get('total', 0))}\n\n"
        
        output += f"{'PID':<8} {'USER':<10} {'%CPU':<6} {'%MEM':<6} {'COMMAND':<30}\n"
        
        for proc in real_processes:
            output += f"{proc['pid']:<8} {proc['username']:<10} {proc['cpu_percent']:<6} {proc['memory_percent']:<6} {proc['command'][:30]:<30}\n"
        
        return CommandResponse(success=True, output=output)
    except Exception as e:
        return CommandResponse(success=False, output=f"Error getting system info: {str(e)}")

def handle_free():
    """Handle free command - show memory usage"""
    try:
        memory_info = system_monitor.get_memory_info()
        mem = memory_info.get('virtual_memory', {})
        swap = memory_info.get('swap_memory', {})
        
        output = f"{'':<12} {'total':<12} {'used':<12} {'free':<12} {'shared':<12} {'buff/cache':<12} {'available':<12}\n"
        output += f"{'Mem:':<12} {system_monitor.format_bytes(mem.get('total', 0)):<12} {system_monitor.format_bytes(mem.get('used', 0)):<12} {system_monitor.format_bytes(mem.get('free', 0)):<12} {'0B':<12} {system_monitor.format_bytes(mem.get('cached', 0) + mem.get('buffers', 0)):<12} {system_monitor.format_bytes(mem.get('available', 0)):<12}\n"
        output += f"{'Swap:':<12} {system_monitor.format_bytes(swap.get('total', 0)):<12} {system_monitor.format_bytes(swap.get('used', 0)):<12} {system_monitor.format_bytes(swap.get('free', 0)):<12} {'0B':<12} {'0B':<12} {'0B':<12}\n"
        
        return CommandResponse(success=True, output=output)
    except Exception as e:
        return CommandResponse(success=False, output=f"Error getting memory info: {str(e)}")

def handle_df():
    """Handle df command - show disk usage"""
    try:
        disk_info = system_monitor.get_disk_info()
        disk_usage = disk_info.get('disk_usage', {})
        
        output = f"{'Filesystem':<20} {'1K-blocks':<12} {'Used':<12} {'Available':<12} {'Use%':<8} {'Mounted on':<12}\n"
        output += f"{'/dev/root':<20} {disk_usage.get('total', 0)//1024:<12} {disk_usage.get('used', 0)//1024:<12} {disk_usage.get('free', 0)//1024:<12} {disk_usage.get('percent', 0):<8} {'/':<12}\n"
        
        return CommandResponse(success=True, output=output)
    except Exception as e:
        return CommandResponse(success=False, output=f"Error getting disk info: {str(e)}")

def handle_uptime():
    """Handle uptime command"""
    try:
        uptime_info = system_monitor.get_system_uptime()
        cpu_info = system_monitor.get_cpu_info()
        load_avg = cpu_info.get('load_average', [0, 0, 0])
        
        output = f" {datetime.now().strftime('%H:%M:%S')} up {uptime_info.get('uptime_formatted', 'unknown')}, 1 user, load average: {load_avg[0]:.2f}, {load_avg[1]:.2f}, {load_avg[2]:.2f}\n"
        
        return CommandResponse(success=True, output=output)
    except Exception as e:
        return CommandResponse(success=False, output=f"Error getting uptime info: {str(e)}")

def handle_ps(args):
    """Handle ps command - show processes"""
    try:
        real_processes = system_monitor.get_processes(50)
        
        output = f"{'PID':<8} {'USER':<10} {'%CPU':<6} {'%MEM':<6} {'STAT':<6} {'START':<8} {'COMMAND':<30}\n"
        
        for proc in real_processes:
            output += f"{proc['pid']:<8} {proc['username']:<10} {proc['cpu_percent']:<6} {proc['memory_percent']:<6} {proc['status']:<6} {proc['create_time']:<8} {proc['name'][:30]:<30}\n"
        
        return CommandResponse(success=True, output=output)
    except Exception as e:
        return CommandResponse(success=False, output=f"Error getting process info: {str(e)}")

def handle_iostat():
    """Handle iostat command - show I/O statistics"""
    try:
        disk_info = system_monitor.get_disk_info()
        disk_io = disk_info.get('disk_io', {})
        
        output = f"Linux {system_monitor.system_info.get('hostname', 'unknown')} {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} {system_monitor.system_info.get('architecture', 'unknown')} ({system_monitor.system_info.get('processor', 'unknown')})\n\n"
        output += f"{'Device':<10} {'tps':<8} {'kB_read/s':<12} {'kB_wrtn/s':<12} {'kB_read':<12} {'kB_wrtn':<12}\n"
        output += f"{'sda':<10} {'0.00':<8} {'0.00':<12} {'0.00':<12} {disk_io.get('read_bytes', 0)//1024:<12} {disk_io.get('write_bytes', 0)//1024:<12}\n"
        
        return CommandResponse(success=True, output=output)
    except Exception as e:
        return CommandResponse(success=False, output=f"Error getting I/O info: {str(e)}")

def handle_vmstat():
    """Handle vmstat command - show virtual memory statistics"""
    try:
        memory_info = system_monitor.get_memory_info()
        cpu_info = system_monitor.get_cpu_info()
        
        mem = memory_info.get('virtual_memory', {})
        cpu_times = cpu_info.get('cpu_times', {})
        
        output = f"procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----\n"
        output += f" r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st\n"
        output += f" 0  0   {mem.get('free', 0)//1024//1024:>6} {mem.get('free', 0)//1024//1024:>6} {mem.get('buffers', 0)//1024//1024:>6} {mem.get('cached', 0)//1024//1024:>6}   0    0     0     0   10    5 {cpu_times.get('user', 0):.1f} {cpu_times.get('system', 0):.1f} {cpu_times.get('idle', 0):.1f}  0.0  0.0\n"
        
        return CommandResponse(success=True, output=output)
    except Exception as e:
        return CommandResponse(success=False, output=f"Error getting VM stats: {str(e)}")

def handle_rm(args, current_path, file_system):
    """Handle rm command"""
    if not args:
        return CommandResponse(success=False, output="rm: missing operand")
    
    file_name = args[0]
    new_file_system = json.loads(json.dumps(file_system))  # Deep copy
    parent_node = get_node_by_path(current_path, new_file_system)
    
    if not parent_node or parent_node.get('type') != 'directory':
        return CommandResponse(success=False, output="rm: cannot remove: Invalid path")
    
    if not parent_node['children'].get(file_name):
        return CommandResponse(success=False, output=f"rm: cannot remove '{file_name}': No such file or directory")
    
    del parent_node['children'][file_name]
    
    return CommandResponse(
        success=True,
        output="",
        new_file_system=new_file_system
    )

@app.get("/api/processes")
async def get_processes():
    """Get current process list for top command"""
    if is_top_running:
        try:
            real_processes = system_monitor.get_top_processes(15)
            return {"processes": real_processes, "is_running": is_top_running, "real_data": True}
        except:
            generate_processes()
    return {"processes": processes, "is_running": is_top_running, "real_data": False}

@app.get("/api/system")
async def get_system_info():
    """Get complete system information"""
    try:
        return system_monitor.get_system_summary()
    except Exception as e:
        return {"error": f"Failed to get system info: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Starting TerminalX Backend v1.0.0")
    print(f"📡 Server will be available at: http://{HOST}:{PORT}")
    print(f"📚 API Documentation: http://{HOST}:{PORT}/docs")
    print(f"🔧 Debug mode: {'ON' if DEBUG else 'OFF'}")
    print(f"🌐 Frontend URL: {FRONTEND_URL}")
    
    uvicorn.run(app, host=HOST, port=PORT)
