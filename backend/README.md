# TerminalX Backend

A FastAPI-based backend server for the TerminalX web terminal application.

## Features

- **Terminal Command Processing**: Handles all terminal commands (ls, cd, mkdir, touch, cat, echo, pwd, clear, top, rm)
- **Natural Language Processing**: Converts natural language commands to terminal commands
- **File System Simulation**: Virtual file system with directories and files
- **Process Simulation**: Simulates system processes for the `top` command
- **CORS Support**: Configured for frontend communication
- **RESTful API**: Clean API endpoints for all operations

## API Endpoints

### Core Endpoints

- `POST /api/command` - Execute terminal commands
- `GET /api/processes` - Get current process list (for top command)
- `GET /api/health` - Health check endpoint
- `GET /` - API information

### Command Support

The backend supports the following commands:

- `help` - Show available commands
- `ls [path]` - List directory contents
- `cd [directory]` - Change directory
- `mkdir [name]` - Create directory
- `touch [name]` - Create file
- `cat [file]` - Display file contents
- `echo [text]` - Display text
- `pwd` - Print working directory
- `clear` - Clear terminal
- `top` - Show process activity
- `rm [file]` - Remove file

### Natural Language Commands

- "create a folder named [name]" → `mkdir [name]`
- "make a file named [name]" → `touch [name]`
- "delete file [name]" → `rm [name]`
- "show me the contents of [file]" → `cat [file]`

## Installation

1. **Install Python Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Server**:
   ```bash
   python run.py
   ```
   
   Or directly:
   ```bash
   python main.py
   ```

3. **Access the API**:
   - Server: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/api/health

## Configuration

Edit `config.py` to modify:
- Server host and port
- CORS origins
- File system limits
- Process simulation settings

## API Usage

### Execute Command

```bash
curl -X POST "http://localhost:8000/api/command" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "ls",
    "current_path": "home/user",
    "file_system": {...}
  }'
```

### Response Format

```json
{
  "success": true,
  "output": "command output",
  "new_path": "home/user/projects",
  "new_file_system": {...},
  "error": null
}
```

## Development

The backend is built with:
- **FastAPI**: Modern, fast web framework
- **Pydantic**: Data validation and serialization
- **Uvicorn**: ASGI server
- **Python 3.8+**: Required Python version

## File Structure

```
backend/
├── main.py          # Main FastAPI application
├── config.py        # Configuration settings
├── run.py           # Server startup script
├── requirements.txt # Python dependencies
└── README.md        # This file
```

## Integration with Frontend

The backend is designed to work seamlessly with the Next.js frontend:

1. Frontend sends commands via POST to `/api/command`
2. Backend processes commands and returns results
3. Frontend updates UI based on response
4. File system state is maintained on both ends

## Error Handling

The API includes comprehensive error handling:
- Invalid commands return appropriate error messages
- File system operations validate paths and permissions
- Natural language parsing handles edge cases
- All responses include success/error status
