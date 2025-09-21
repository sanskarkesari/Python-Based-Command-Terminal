"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Folder, FileText, Server, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

// Backend API configuration - remove trailing slash to prevent double slashes
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

// Initial file system structure
const initialFileSystem = {
  'home': {
    type: 'directory',
    children: {
      'user': {
        type: 'directory',
        children: {
          'welcome.txt': { type: 'file', content: 'Welcome to TerminalX with Real System Monitoring! Type `help` to see available commands.' },
          'projects': { type: 'directory', children: {} }
        }
      }
    }
  }
};

// Natural Language Parser
const parseNaturalLanguage = (command) => {
  const trimmedCommand = command.trim();
  let match;

  // create a folder named {name} -> mkdir {name}
  match = trimmedCommand.match(/^create a folder named (.+)/i);
  if (match && match[1]) {
    const translated = `mkdir ${match[1]}`;
    console.log(`NL Parser: Matched 'create folder'. Original: "${command}", Translated: "${translated}"`);
    return translated;
  }

  // make a file named {name} -> touch {name}
  match = trimmedCommand.match(/^make a file named (.+)/i);
  if (match && match[1]) {
    const translated = `touch ${match[1]}`;
    console.log(`NL Parser: Matched 'make file'. Original: "${command}", Translated: "${translated}"`);
    return translated;
  }

  // delete file {name} -> rm {name}
  match = trimmedCommand.match(/^delete file (.+)/i);
  if (match && match[1]) {
    const translated = `rm ${match[1]}`;
    console.log(`NL Parser: Matched 'delete file'. Original: "${command}", Translated: "${translated}"`);
    return translated;
  }

  // show files -> ls
  match = trimmedCommand.match(/^show files/i);
  if (match) {
    const translated = `ls`;
    console.log(`NL Parser: Matched 'show files'. Original: "${command}", Translated: "${translated}"`);
    return translated;
  }

  // list files -> ls
  match = trimmedCommand.match(/^list files/i);
  if (match) {
    const translated = `ls`;
    console.log(`NL Parser: Matched 'list files'. Original: "${command}", Translated: "${translated}"`);
    return translated;
  }

  // where am i -> pwd
  match = trimmedCommand.match(/^where am i/i);
  if (match) {
    const translated = `pwd`;
    console.log(`NL Parser: Matched 'where am i'. Original: "${command}", Translated: "${translated}"`);
    return translated;
  }

  // go to folder {name} -> cd {name}
  match = trimmedCommand.match(/^go to folder (.+)/i);
  if (match && match[1]) {
    const translated = `cd ${match[1]}`;
    console.log(`NL Parser: Matched 'go to folder'. Original: "${command}", Translated: "${translated}"`);
    return translated;
  }

  // open file {name} -> cat {name}
  match = trimmedCommand.match(/^open file (.+)/i);
  if (match && match[1]) {
    const translated = `cat ${match[1]}`;
    console.log(`NL Parser: Matched 'open file'. Original: "${command}", Translated: "${translated}"`);
    return translated;
  }

  // read file {name} -> cat {name}
  match = trimmedCommand.match(/^read file (.+)/i);
  if (match && match[1]) {
    const translated = `cat ${match[1]}`;
    console.log(`NL Parser: Matched 'read file'. Original: "${command}", Translated: "${translated}"`);
    return translated;
  }

  // clear screen -> clear
  match = trimmedCommand.match(/^clear screen/i);
  if (match) {
    const translated = `clear`;
    console.log(`NL Parser: Matched 'clear screen'. Original: "${command}", Translated: "${translated}"`);
    return translated;
  }

  // show system info -> top
  match = trimmedCommand.match(/^show system info/i);
  if (match) {
    const translated = `top`;
    console.log(`NL Parser: Matched 'show system info'. Original: "${command}", Translated: "${translated}"`);
    return translated;
  }

  // show memory usage -> free
  match = trimmedCommand.match(/^show memory usage/i);
  if (match) {
    const translated = `free`;
    console.log(`NL Parser: Matched 'show memory usage'. Original: "${command}", Translated: "${translated}"`);
    return translated;
  }

  // show disk usage -> df
  match = trimmedCommand.match(/^show disk usage/i);
  if (match) {
    const translated = `df`;
    console.log(`NL Parser: Matched 'show disk usage'. Original: "${command}", Translated: "${translated}"`);
    return translated;
  }

  // show uptime -> uptime
  match = trimmedCommand.match(/^show uptime/i);
  if (match) {
    const translated = `uptime`;
    console.log(`NL Parser: Matched 'show uptime'. Original: "${command}", Translated: "${translated}"`);
    return translated;
  }

  // show processes -> ps
  match = trimmedCommand.match(/^show processes/i);
  if (match) {
    const translated = `ps`;
    console.log(`NL Parser: Matched 'show processes'. Original: "${command}", Translated: "${translated}"`);
    return translated;
  }

  // No match found, return original command
  return command;
};

export default function Terminal() {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([]);
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [fileSystem, setFileSystem] = useState(initialFileSystem);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const terminalRef = useRef(null);

  useEffect(() => {
    checkBackendConnection();
  }, []);

  // Check if backend is available
  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        setIsBackendConnected(true);
        setBackendStatus('connected');
        console.log('✅ Backend connected successfully');
      } else {
        setIsBackendConnected(false);
        setBackendStatus('error');
        console.log('❌ Backend health check failed');
      }
    } catch (error) {
      setIsBackendConnected(false);
      setBackendStatus('error');
      console.log('❌ Backend connection failed:', error.message);
    }
  };

  // Execute command via backend API
  const executeBackendCommand = async (cmd, path) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: cmd,
          current_path: path
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Backend command error:', error);
      throw error;
    }
  };

  // Get system monitoring data from backend
  const getSystemData = async (command) => {
    try {
      let endpoint = '';
      switch (command) {
        case 'top':
        case 'htop':
          endpoint = '/api/system';
          break;
        case 'free':
          endpoint = '/api/memory';
          break;
        case 'df':
          endpoint = '/api/disk';
          break;
        case 'uptime':
          endpoint = '/api/system';
          break;
        case 'ps':
          endpoint = '/api/processes';
          break;
        case 'iostat':
        case 'vmstat':
          endpoint = '/api/system';
          break;
        default:
          return null;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('System data error:', error);
      throw error;
    }
  };

  // Simulate system monitoring commands locally
  const simulateSystemCommand = (command) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString();
    
    switch (command) {
      case 'top':
      case 'htop':
        return `top - ${timestamp}
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1234 user      20   0   12345   6789   1234 S   5.2   2.1   0:01.23 node
 5678 user      20   0    9876   5432   2109 S   3.1   1.7   0:00.87 python
 9012 user      20   0    7654   3210   1098 S   1.8   1.0   0:00.45 chrome
 3456 user      20   0    5432   2109    987 S   0.9   0.6   0:00.23 firefox`;

      case 'free':
        return `              total        used        free      shared  buff/cache   available
Mem:        8192000     4567890     1234567      234567      2389543     3456789
Swap:       2097152      123456     1973696`;

      case 'df':
        return `Filesystem     1K-blocks     Used Available Use% Mounted on
/dev/sda1      52428800  12345678  40083122  24% /
/dev/sda2     104857600  45678901  59178699  44% /home
tmpfs           4096000      1234   4094766   1% /tmp`;

      case 'uptime':
        const uptime = Math.floor(Math.random() * 86400) + 3600; // 1-24 hours
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        return ` ${timestamp} up ${hours}:${minutes.toString().padStart(2, '0')},  2 users,  load average: 0.15, 0.12, 0.08`;

      case 'ps':
        return `  PID TTY          TIME CMD
 1234 pts/0    00:00:01 bash
 5678 pts/0    00:00:00 node
 9012 pts/0    00:00:00 python
 3456 pts/0    00:00:00 chrome`;

      case 'iostat':
        return `Linux 5.4.0-42-generic (hostname)    ${now.toDateString()}

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           5.23    0.00    2.15    0.45    0.00   92.17

Device             tps    kB_read/s    kB_wrtn/s    kB_read    kB_wrtn
sda               1.23        45.67        23.45    1234567     654321
sdb               0.12         2.34         1.23      23456      12345`;

      case 'vmstat':
        return `procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 1  0  12345 1234567 234567 4567890   0    0    12    34  123  456  5  2 92  1  0`;

      default:
        return `Command '${command}' not found in simulation mode.`;
    }
  };

  // Execute command
  const executeCommand = async (cmd) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    // Parse natural language commands
    const parsedCommand = parseNaturalLanguage(trimmedCmd);
    console.log(`Executing command: "${parsedCommand}" (original: "${trimmedCmd}")`);

    // Handle backend management commands
    if (parsedCommand === 'backend status') {
      const status = isBackendConnected ? 'Online' : 'Offline';
      const statusIcon = isBackendConnected ? '🟢' : '🔴';
      addToHistory(parsedCommand, `${statusIcon} Backend Status: ${status}\nAPI URL: ${API_BASE_URL}\nStatus: ${backendStatus}`);
      return;
    }

    if (parsedCommand === 'backend connect') {
      await checkBackendConnection();
      const status = isBackendConnected ? 'Connected' : 'Failed to connect';
      addToHistory(parsedCommand, `Backend connection: ${status}`);
      return;
    }

    if (parsedCommand === 'backend on') {
      setIsBackendConnected(true);
      setBackendStatus('connected');
      addToHistory(parsedCommand, 'Backend mode enabled');
      return;
    }

    if (parsedCommand === 'backend off') {
      setIsBackendConnected(false);
      setBackendStatus('offline');
      addToHistory(parsedCommand, 'Backend mode disabled');
      return;
    }

    let output = '';
    let newPath = currentPath;
    let success = true;

    try {
      // Try backend first if connected
      if (isBackendConnected) {
        try {
          // Check if it's a system monitoring command
          if (['top', 'htop', 'free', 'df', 'uptime', 'ps', 'iostat', 'vmstat'].includes(parsedCommand)) {
            const systemData = await getSystemData(parsedCommand);
            
            if (systemData) {
              // Format system data based on command
              switch (parsedCommand) {
                case 'top':
                case 'htop':
                  output = `top - ${new Date().toLocaleTimeString()}
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND`;
                  systemData.processes.slice(0, 10).forEach(proc => {
                    output += `\n${proc.pid.toString().padStart(5)} ${proc.name.padEnd(8)} ${proc.cpu_percent.toFixed(1).padStart(6)} ${proc.memory_percent.toFixed(1).padStart(6)} ${proc.command}`;
                  });
                  break;
                case 'free':
                  output = `              total        used        free      shared  buff/cache   available
Mem:        ${systemData.memory_total} ${systemData.memory_used} ${systemData.memory_total}      234567      2389543     ${systemData.memory_total}`;
                  break;
                case 'df':
                  output = `Filesystem     1K-blocks     Used Available Use% Mounted on
/dev/sda1      ${systemData.disk_usage}`;
                  break;
                case 'uptime':
                  output = ` ${new Date().toLocaleTimeString()} up ${systemData.uptime},  2 users,  load average: 0.15, 0.12, 0.08`;
                  break;
                case 'ps':
                  output = `  PID TTY          TIME CMD`;
                  systemData.processes.slice(0, 10).forEach(proc => {
                    output += `\n${proc.pid.toString().padStart(5)} pts/0    00:00:01 ${proc.name}`;
                  });
                  break;
                case 'iostat':
                case 'vmstat':
                  output = `System monitoring data from backend:\nCPU: ${systemData.cpu_percent}%\nMemory: ${systemData.memory_percent}%\nUptime: ${systemData.uptime}`;
                  break;
              }
            } else {
              throw new Error('No system data received');
            }
          } else {
            // Regular terminal command
            const result = await executeBackendCommand(parsedCommand, currentPath);
            output = result.output;
            newPath = result.current_path;
            success = result.success;
          }
        } catch (backendError) {
          console.log('Backend command failed, falling back to local simulation:', backendError.message);
          // Fall back to local simulation
          if (['top', 'htop', 'free', 'df', 'uptime', 'ps', 'iostat', 'vmstat'].includes(parsedCommand)) {
            output = simulateSystemCommand(parsedCommand);
          } else {
            output = await simulateCommand(parsedCommand);
            newPath = currentPath; // Local simulation doesn't change path
          }
        }
      } else {
        // Backend not connected, use local simulation
        if (['top', 'htop', 'free', 'df', 'uptime', 'ps', 'iostat', 'vmstat'].includes(parsedCommand)) {
          output = simulateSystemCommand(parsedCommand);
        } else {
          output = await simulateCommand(parsedCommand);
          newPath = currentPath; // Local simulation doesn't change path
        }
      }
    } catch (error) {
      output = `Error: ${error.message}`;
      success = false;
    }

    addToHistory(parsedCommand, output);
    setCurrentPath(newPath);
  };

  // Add to history
  const addToHistory = (cmd, output) => {
    setHistory(prev => [...prev, { command: cmd, output, timestamp: new Date() }]);
  };

  // Simulate command execution (local fallback)
  const simulateCommand = async (cmd) => {
    const parts = cmd.split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
      case 'ls':
        if (args.includes('-la')) {
          return `total 0
drwxr-xr-x 2 user user 4096 Dec 25 12:00 .
drwxr-xr-x 3 user user 4096 Dec 25 12:00 ..
-rw-r--r-- 1 user user   50 Dec 25 12:00 welcome.txt
drwxr-xr-x 2 user user 4096 Dec 25 12:00 projects`;
        }
        return 'welcome.txt projects';

      case 'pwd':
        return currentPath;

      case 'cd':
        if (args.length === 0) {
          return 'Changed to home directory';
        }
        const targetPath = args[0];
        if (targetPath === '..') {
          return 'Changed to parent directory';
        } else if (targetPath === '/') {
          return 'Changed to root directory';
        } else {
          return `Changed to directory: ${targetPath}`;
        }

      case 'mkdir':
        if (args.length === 0) {
          return 'mkdir: missing operand';
        }
        return `Created directory: ${args[0]}`;

      case 'touch':
        if (args.length === 0) {
          return 'touch: missing file operand';
        }
        return `Created file: ${args[0]}`;

      case 'cat':
        if (args.length === 0) {
          return 'cat: missing file operand';
        }
        if (args[0] === 'welcome.txt') {
          return 'Welcome to TerminalX with Real System Monitoring! Type `help` to see available commands.';
        }
        return `cat: ${args[0]}: No such file or directory`;

      case 'echo':
        return args.join(' ');

      case 'rm':
        if (args.length === 0) {
          return 'rm: missing operand';
        }
        return `Removed: ${args[0]}`;

      case 'clear':
        return '\033[2J\033[H';

      case 'help':
        return `Available commands:
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

Natural Language Commands:
  create a folder named <name>
  make a file named <name>
  delete file <name>
  show files / list files
  where am i
  go to folder <name>
  open file <name> / read file <name>
  clear screen
  show system info
  show memory usage
  show disk usage
  show uptime
  show processes`;

      default:
        return `Command not found: ${command}. Type 'help' for available commands.`;
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      executeCommand(command);
      setCommand('');
    }
  };

  // Scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 font-mono">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Server className="w-5 h-5" />
          <span className="text-lg font-bold">TerminalX</span>
          <span className="text-sm text-gray-400">- Web Terminal with System Monitoring</span>
        </div>
        <div className="flex items-center space-x-2">
          {isBackendConnected ? (
            <div className="flex items-center space-x-1 text-green-400">
              <Wifi className="w-4 h-4" />
              <span className="text-sm">Backend Online</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-red-400">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm">Backend Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Terminal */}
      <div 
        ref={terminalRef}
        className="h-screen overflow-y-auto p-4 space-y-2"
      >
        {/* Welcome message */}
        <div className="text-green-400">
          <div className="text-2xl font-bold mb-2">Welcome to TerminalX! 🚀</div>
          <div className="text-sm text-gray-400 mb-4">
            A modern web terminal with real system monitoring capabilities.
          </div>
          <div className="text-sm text-gray-400 mb-4">
            Backend Status: {isBackendConnected ? '🟢 Connected' : '🔴 Offline'} | 
            API: {API_BASE_URL}
          </div>
        </div>

        {/* Command history */}
        {history.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">$</span>
              <span className="text-white">{item.command}</span>
            </div>
            <div className="text-gray-300 whitespace-pre-wrap ml-4">
              {item.output}
            </div>
          </motion.div>
        ))}

        {/* Current command input */}
        <div className="flex items-center space-x-2">
          <span className="text-blue-400">$</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-transparent text-white flex-1 outline-none"
            placeholder="Type a command or try 'help'..."
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
