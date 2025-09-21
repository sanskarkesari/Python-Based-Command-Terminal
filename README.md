# TerminalX - Web Terminal with Real System Monitoring

A modern web-based terminal application with real system monitoring capabilities.

## 🚀 Features

- **Real System Monitoring**: CPU, memory, processes, disk usage with actual system data
- **Interactive Terminal**: Full terminal experience with command history and auto-completion
- **Natural Language Commands**: Convert natural language to terminal commands
- **Backend Integration**: Automatic backend detection with graceful fallback
- **Cross-Platform**: Works on Linux, Windows, and macOS

## 📁 Project Structure

```
python terminal/
├── app/                    # Next.js Frontend
│   ├── globals.css        # Global styles
│   ├── layout.jsx         # Root layout
│   └── page.js            # Main terminal component
├── backend/               # Python FastAPI Backend
│   ├── main.py           # Main FastAPI application
│   ├── system_monitor.py # System monitoring with psutil
│   ├── config.py         # Configuration settings
│   ├── run.py            # Server startup script
│   ├── requirements.txt  # Python dependencies
│   ├── Dockerfile        # Docker configuration
│   ├── docker-compose.yml # Docker Compose setup
│   └── README.md         # Backend documentation
├── .env.local            # Environment configuration
└── README.md             # This file
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Git

### 1. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Start the Application

```bash
# Terminal 1: Start Backend
cd backend
source venv/bin/activate
python run.py

# Terminal 2: Start Frontend
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🎯 Available Commands

### System Monitoring Commands (Real Data)
- `top` - Real-time process viewer
- `htop` - Enhanced process viewer with bars
- `free` - Memory usage information
- `df` - Disk space usage
- `uptime` - System uptime and load
- `ps` - Process list
- `iostat` - I/O statistics
- `vmstat` - Virtual memory statistics

### Traditional Commands
- `help` - Show available commands
- `ls` - List directory contents
- `cd [dir]` - Change directory
- `mkdir [dir]` - Create directory
- `touch [file]` - Create file
- `cat [file]` - Display file content
- `echo [text]` - Display text
- `pwd` - Print working directory
- `clear` - Clear terminal
- `rm [file]` - Remove file

### Backend Management
- `backend` - Show backend status
- `backend status` - Check connection
- `backend connect` - Reconnect to backend
- `backend on/off` - Toggle backend mode

### Natural Language Commands
- "create a folder named X" → `mkdir X`
- "make a file named X" → `touch X`
- "delete file X" → `rm X`
- "show me the contents of X" → `cat X`

## 🔧 Configuration

### Environment Variables
Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEV_MODE=true
```

### Backend Configuration
Edit `backend/config.py` for:
- Server host and port
- CORS origins
- File system limits
- Process simulation settings

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Configure build settings
3. Deploy automatically

### Backend (Railway/Heroku)
1. Create `Procfile`: `web: python run.py`
2. Set environment variables
3. Deploy using Git

### Docker
```bash
cd backend
docker build -t terminalx-backend .
docker run -p 8000:8000 terminalx-backend
```

## 🎨 Features

- **Real-time System Data**: Live CPU, memory, and process monitoring
- **Visual Status Indicators**: Backend connection status
- **Auto-completion**: Tab completion for commands and files
- **Command History**: Navigate with arrow keys
- **Responsive Design**: Works on desktop and mobile
- **Error Handling**: Graceful fallback to local simulation

## 🔍 System Monitoring

The application provides real system monitoring using the `psutil` library:

- **CPU Information**: Cores, usage, frequency, load average
- **Memory Information**: Total, used, free, swap usage
- **Process Information**: Real system processes with PID, CPU%, memory%
- **Disk Information**: Space usage, I/O statistics
- **Network Information**: Bytes sent/received, connections
- **System Information**: Platform, hostname, uptime, architecture

## 🛠️ Development

### Frontend Development
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Start production server
npm run lint   # Run linting
```

### Backend Development
```bash
cd backend
source venv/bin/activate
python run.py  # Start development server
```

### API Testing
```bash
curl http://localhost:8000/api/health
curl -X POST "http://localhost:8000/api/command" \
  -H "Content-Type: application/json" \
  -d '{"command": "free", "current_path": "home/user", "file_system": {}}'
```

## 📚 Technology Stack

### Frontend
- **Next.js 15.3.4** - React framework
- **React 19** - UI library
- **Tailwind CSS 4** - Styling
- **DaisyUI 5.0.43** - Component library
- **Framer Motion 12.23.16** - Animations

### Backend
- **FastAPI 0.104.1** - Web framework
- **Uvicorn 0.24.0** - ASGI server
- **Pydantic 2.5.0** - Data validation
- **psutil 5.9.6** - System monitoring
- **Python 3.11+** - Programming language

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

- **Issues**: Report bugs and request features on GitHub
- **Documentation**: Check the `/docs` endpoint for API documentation
- **Health Check**: Use `/api/health` to verify backend status

---

**Happy Terminal-ing! 🖥️✨**
