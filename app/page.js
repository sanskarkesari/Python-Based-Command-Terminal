"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Folder, FileText, Server, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

// Backend API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

  // show me the contents of {name} -> cat {name}
  match = trimmedCommand.match(/^show me the contents of (.+)/i);
  if (match && match[1]) {
    const translated = `cat ${match[1]}`;
    console.log(`NL Parser: Matched 'show contents'. Original: "${command}", Translated: "${translated}"`);
    return translated;
  }

  // No match, return original command
  return command;
};

export default function TerminalPage() {
  const [fileSystem, setFileSystem] = useState(initialFileSystem);
  const [history, setHistory] = useState([]);
  const [currentPath, setCurrentPath] = useState('home/user');
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isTopRunning, setIsTopRunning] = useState(false);
  const [processes, setProcesses] = useState([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [useBackend, setUseBackend] = useState(true);

  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // Check backend connection on component mount
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
      setBackendStatus('disconnected');
      console.log('❌ Backend connection failed:', error.message);
    }
  };

  // Helper function to get a node by path from a given file system
  const getNodeByPath = (path, fs = fileSystem) => {
    const parts = path.split('/').filter(Boolean);
    let currentNode = fs;
    for (const part of parts) {
      if (currentNode && currentNode.type === 'directory' && currentNode.children && currentNode.children[part]) {
        currentNode = currentNode.children[part];
      } else if (currentNode && typeof currentNode === 'object' && !currentNode.type && currentNode[part]) { // Handle root
        currentNode = currentNode[part];
      } else {
        return null; // Path not found
      }
    }
    return currentNode;
  };

  // Effect to scroll to bottom on history change
  useEffect(() => {
    if (terminalRef.current && !isTopRunning) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
    console.log("History updated, scrolled to bottom if not in 'top' view.");
  }, [history, isTopRunning]);

  // Effect for initial welcome message and input focus
  useEffect(() => {
    const welcomeNode = getNodeByPath('home/user/welcome.txt');
    if (welcomeNode && welcomeNode.type === 'file') {
      let welcomeMessage = welcomeNode.content;
      if (isBackendConnected) {
        welcomeMessage += '\n\n🔗 Backend connected - Real system monitoring available!';
        welcomeMessage += '\nTry: top, htop, free, df, uptime, ps, iostat, vmstat';
      } else {
        welcomeMessage += '\n\n⚠️  Backend disconnected - Using local simulation only';
        welcomeMessage += '\nStart backend: cd backend && python run.py';
      }
      setHistory([{ type: 'output', content: welcomeMessage }]);
    }
    inputRef.current?.focus();
    console.log("Component mounted, welcome message displayed.");
  }, [isBackendConnected]);

  // Effect for process simulation when 'top' is running (fallback for local mode)
  useEffect(() => {
    let intervalId = null;

    const generateProcesses = () => {
      const commands = ['/bin/bash', 'code', 'chrome', 'node', 'docker', 'figma_agent', 'spotify', 'slack', 'kernel_task'];
      const users = ['root', 'user', 'system', 'windowserver'];
      const newProcesses = Array.from({ length: Math.floor(Math.random() * 6) + 5 }, (_, i) => ({
        pid: Math.floor(Math.random() * 90000) + 10000,
        user: users[Math.floor(Math.random() * users.length)],
        cpu: (Math.random() * 25).toFixed(1),
        mem: (Math.random() * 5).toFixed(1),
        command: commands[Math.floor(Math.random() * commands.length)],
      }));
      setProcesses(newProcesses);
      console.log("Generated new processes for 'top' command (local simulation).");
    };

    if (isTopRunning && !useBackend) {
      console.log("'top' command is running. Starting local process simulation.");
      generateProcesses(); // Run once immediately to populate
      intervalId = setInterval(generateProcesses, 2500);
    }

    // Cleanup function to stop the interval
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log("Stopped 'top' command simulation.");
      }
    };
  }, [isTopRunning, useBackend]);

  // Call backend API for command execution
  const executeBackendCommand = async (command, currentPath, fileSystem) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: command,
          current_path: currentPath,
          file_system: fileSystem
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Backend API error:', error);
      throw error;
    }
  };

  // Get real-time processes from backend
  const getBackendProcesses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/processes`);
      if (response.ok) {
        const data = await response.json();
        return data.processes || [];
      }
    } catch (error) {
      console.error('Error fetching processes:', error);
    }
    return [];
  };

  const processCommand = async (originalCommand) => {
    let command = parseNaturalLanguage(originalCommand);
    const [cmd, ...args] = command.trim().split(/\s+/);
    const newHistory = [...history, { type: 'input', command: originalCommand, path: currentPath }];
    console.log(`Processing command: '${cmd}' with args:`, args);

    // If backend is connected and we want to use it, try backend first
    if (isBackendConnected && useBackend) {
      try {
        const result = await executeBackendCommand(command, currentPath, fileSystem);
        
        if (result.success) {
          // Update file system if changed
          if (result.new_file_system) {
            setFileSystem(result.new_file_system);
          }
          
          // Update current path if changed
          if (result.new_path !== undefined) {
            setCurrentPath(result.new_path);
          }
          
          // Handle special commands
          if (cmd === 'top' || cmd === 'htop') {
            setIsTopRunning(true);
            setHistory([]);
            console.log(`Switched to '${cmd}' view with real system data.`);
          } else {
            setIsTopRunning(false);
            setHistory([...newHistory, { type: 'output', content: result.output }]);
          }
          
          return;
        } else {
          // Backend returned an error, show it
          setIsTopRunning(false);
          setHistory([...newHistory, { type: 'output', content: result.output || result.error || 'Unknown error' }]);
          return;
        }
      } catch (error) {
        console.error('Backend command failed, falling back to local:', error);
        // Fall through to local processing
      }
    }

    // Local command processing (fallback)
    console.log('Using local command processing');
    switch (cmd) {
      case 'help':
        setIsTopRunning(false);
        handleHelp(newHistory);
        break;
      case 'ls':
        setIsTopRunning(false);
        handleLs(args, newHistory);
        break;
      case 'cd':
        setIsTopRunning(false);
        handleCd(args, newHistory);
        break;
      case 'mkdir':
        setIsTopRunning(false);
        handleMkdir(args, newHistory);
        break;
      case 'touch':
        setIsTopRunning(false);
        handleTouch(args, newHistory);
        break;
      case 'cat':
        setIsTopRunning(false);
        handleCat(args, newHistory);
        break;
      case 'echo':
        setIsTopRunning(false);
        handleEcho(args, newHistory);
        break;
      case 'pwd':
        setIsTopRunning(false);
        handlePwd(newHistory);
        break;
      case 'clear':
        setIsTopRunning(false);
        handleClear();
        break;
      case 'top':
        setIsTopRunning(true);
        setHistory([]);
        console.log("Switched to 'top' view (local simulation).");
        break;
      case 'backend':
        handleBackendCommand(args, newHistory);
        break;
      case '':
        setIsTopRunning(false);
        setHistory(newHistory);
        break;
      default:
        setIsTopRunning(false);
        setHistory([...newHistory, { type: 'output', content: `command not found: ${cmd}` }]);
        break;
    }
  };

  const handleBackendCommand = (args, currentHistory) => {
    if (args.length === 0) {
      const status = isBackendConnected ? 'connected' : 'disconnected';
      const message = `Backend Status: ${status}\nAPI URL: ${API_BASE_URL}\nUse Backend: ${useBackend ? 'yes' : 'no'}`;
      setHistory([...currentHistory, { type: 'output', content: message }]);
      return;
    }

    const subcommand = args[0];
    switch (subcommand) {
      case 'status':
        const status = isBackendConnected ? 'connected' : 'disconnected';
        setHistory([...currentHistory, { type: 'output', content: `Backend Status: ${status}` }]);
        break;
      case 'connect':
        checkBackendConnection();
        setHistory([...currentHistory, { type: 'output', content: 'Checking backend connection...' }]);
        break;
      case 'on':
        setUseBackend(true);
        setHistory([...currentHistory, { type: 'output', content: 'Backend mode enabled' }]);
        break;
      case 'off':
        setUseBackend(false);
        setHistory([...currentHistory, { type: 'output', content: 'Local mode enabled' }]);
        break;
      default:
        setHistory([...currentHistory, { type: 'output', content: 'Usage: backend [status|connect|on|off]' }]);
    }
  };

  const handleHelp = (currentHistory) => {
    const commands = {
      'help': 'Show this help message.',
      'ls': 'List directory contents.',
      'cd [dir]': 'Change the current directory. Use ".." for parent.',
      'mkdir [dir]': 'Create a new directory.',
      'touch [file]': 'Create a new empty file.',
      'cat [file]': 'Display file content.',
      'echo [text]': 'Display a line of text.',
      'pwd': 'Print name of current/working directory.',
      'clear': 'Clear the terminal screen.',
      'top': 'Display processor activity (real system data if backend connected).',
      'htop': 'Enhanced process viewer with bars (real system data if backend connected).',
      'free': 'Display memory usage (real system data if backend connected).',
      'df': 'Display disk space usage (real system data if backend connected).',
      'uptime': 'Show system uptime and load (real system data if backend connected).',
      'ps': 'Show running processes (real system data if backend connected).',
      'iostat': 'Show I/O statistics (real system data if backend connected).',
      'vmstat': 'Show virtual memory statistics (real system data if backend connected).',
      'backend': 'Backend management commands (status, connect, on, off).',
    };
    
    const helpContent = (
      <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-1">
        {Object.entries(commands).map(([cmd, desc]) => (
          <React.Fragment key={cmd}>
            <span className="text-info">{cmd}</span>
            <span>{desc}</span>
          </React.Fragment>
        ))}
      </div>
    );
    setHistory([...currentHistory, { type: 'output', content: helpContent }]);
  };

  const handleLs = (args, currentHistory) => {
    const path = args[0] || currentPath;
    const node = getNodeByPath(path);
    if (node && node.type === 'directory') {
      const content = Object.keys(node.children).length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {Object.entries(node.children).map(([name, child]) => (
            <div key={name} className="flex items-center gap-2">
              {child.type === 'directory' ? <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" /> : <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              <span className={child.type === 'directory' ? 'text-blue-400' : ''}>{name}</span>
            </div>
          ))}
        </div>
      ) : null;
      setHistory([...currentHistory, { type: 'output', content }]);
    } else {
      setHistory([...currentHistory, { type: 'output', content: `ls: cannot access '${path}': No such file or directory` }]);
    }
  };

  const handleCd = (args, currentHistory) => {
    const target = args[0] || 'home/user';
    
    let newPath;
    if (target === '..') {
      const parts = currentPath.split('/').filter(Boolean);
      parts.pop();
      newPath = parts.join('/');
    } else if (target.startsWith('/')) {
      newPath = target.substring(1);
    } else if (target === '~' || target === '') {
      newPath = 'home/user';
    } else {
      newPath = currentPath ? `${currentPath}/${target}` : target;
    }
    
    newPath = newPath.replace(/\/$/, '');

    const node = getNodeByPath(newPath);
    if (node && node.type === 'directory') {
      setCurrentPath(newPath);
      setHistory(currentHistory);
      console.log("Path changed to:", newPath);
    } else {
      setHistory([...currentHistory, { type: 'output', content: `cd: no such file or directory: ${target}` }]);
    }
  };

  const handleMkdir = (args, currentHistory) => {
    const dirName = args[0];
    if (!dirName) {
      setHistory([...currentHistory, { type: 'output', content: 'mkdir: missing operand' }]);
      return;
    }

    const newFs = JSON.parse(JSON.stringify(fileSystem));
    const parentNode = getNodeByPath(currentPath, newFs);

    if (parentNode.children[dirName]) {
      setHistory([...currentHistory, { type: 'output', content: `mkdir: cannot create directory '${dirName}': File exists` }]);
    } else {
      parentNode.children[dirName] = { type: 'directory', children: {} };
      setFileSystem(newFs);
      setHistory(currentHistory);
      console.log(`Directory '${dirName}' created at '${currentPath}'`);
    }
  };

  const handleTouch = (args, currentHistory) => {
    const fileName = args[0];
    if (!fileName) {
      setHistory([...currentHistory, { type: 'output', content: 'touch: missing file operand' }]);
      return;
    }

    const newFs = JSON.parse(JSON.stringify(fileSystem));
    const parentNode = getNodeByPath(currentPath, newFs);

    if (parentNode.children[fileName]) {
      setHistory(currentHistory); // In a real system, touch updates timestamps. Here we do nothing if it exists.
    } else {
      parentNode.children[fileName] = { type: 'file', content: '' };
      setFileSystem(newFs);
      setHistory(currentHistory);
      console.log(`File '${fileName}' created at '${currentPath}'`);
    }
  };

  const handleCat = (args, currentHistory) => {
    const fileName = args[0];
    if (!fileName) {
      setHistory([...currentHistory, { type: 'output', content: 'cat: missing file operand' }]);
      return;
    }

    const path = fileName.includes('/') ? fileName : `${currentPath}/${fileName}`;
    const node = getNodeByPath(path);

    if (node && node.type === 'file') {
      setHistory([...currentHistory, { type: 'output', content: <pre className="whitespace-pre-wrap">{node.content || '(empty file)'}</pre> }]);
    } else if (node && node.type === 'directory') {
      setHistory([...currentHistory, { type: 'output', content: `cat: ${fileName}: Is a directory` }]);
    } else {
      setHistory([...currentHistory, { type: 'output', content: `cat: ${fileName}: No such file or directory` }]);
    }
  };

  const handleEcho = (args, currentHistory) => {
    const content = args.join(' ');
    setHistory([...currentHistory, { type: 'output', content }]);
  };

  const handlePwd = (currentHistory) => {
    setHistory([...currentHistory, { type: 'output', content: `/${currentPath}` }]);
  };

  const handleClear = () => {
    setHistory([]);
    console.log("Terminal cleared.");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
        console.log(`Navigating history up. Index: ${newIndex}, Command: ${commandHistory[newIndex]}`);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        if (historyIndex < commandHistory.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
          console.log(`Navigating history down. Index: ${newIndex}, Command: ${commandHistory[newIndex]}`);
        } else {
          setHistoryIndex(-1);
          setInput('');
          console.log("Navigated past last command, clearing input.");
        }
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) {
        setCommandHistory(prev => [...prev, input.trim()]);
        console.log(`Command '${input.trim()}' added to history. New history length: ${commandHistory.length + 1}`);
      }
      processCommand(input);
      setHistoryIndex(-1);
      setInput('');
    } else if (e.key === 'Tab') {
        e.preventDefault();
        const currentInput = input.trim();
        if (!currentInput) return;

        const commands = ['help', 'ls', 'cd', 'mkdir', 'touch', 'cat', 'echo', 'pwd', 'clear', 'top', 'htop', 'free', 'df', 'uptime', 'ps', 'iostat', 'vmstat', 'backend'];
        
        const currentNode = getNodeByPath(currentPath, fileSystem);
        const children = currentNode && currentNode.type === 'directory' ? Object.keys(currentNode.children) : [];

        const allSuggestions = [...commands, ...children];
        const matches = allSuggestions.filter(s => s.startsWith(currentInput));

        if (matches.length === 1) {
            const match = matches[0];
            const node = currentNode?.children?.[match];
            const completedValue = node && node.type === 'directory' ? `${match}/` : match;
            setInput(completedValue);
            console.log(`Auto-completed to: ${completedValue}`);
        } else if (matches.length > 1) {
            const newHistory = [...history, { type: 'output', content: matches.join('  ') }];
            setHistory(newHistory);
            console.log(`Multiple suggestions found: ${matches.join(', ')}`);
        }
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  // Real-time process updates for top/htop commands
  useEffect(() => {
    let intervalId = null;

    if (isTopRunning && isBackendConnected && useBackend) {
      const updateProcesses = async () => {
        try {
          const realProcesses = await getBackendProcesses();
          if (realProcesses.length > 0) {
            setProcesses(realProcesses);
          }
        } catch (error) {
          console.error('Error updating processes:', error);
        }
      };

      updateProcesses(); // Initial load
      intervalId = setInterval(updateProcesses, 2000); // Update every 2 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTopRunning, isBackendConnected, useBackend]);

  return (
    <div
      className="h-screen bg-base-300 text-base-content font-mono p-2 sm:p-4 overflow-hidden"
      onClick={handleContainerClick}
    >
      {/* Backend Status Indicator */}
      <div className="absolute top-2 right-2 z-10">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
          isBackendConnected 
            ? 'bg-success text-success-content' 
            : 'bg-warning text-warning-content'
        }`}>
          {isBackendConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span>{isBackendConnected ? 'Backend Connected' : 'Backend Offline'}</span>
        </div>
      </div>

      <div ref={terminalRef} className="mockup-code h-full overflow-y-auto text-sm sm:text-base">
        {isTopRunning ? (
          <div>
            <pre className="text-success">top - {new Date().toLocaleTimeString()} | Tasks: {processes.length} running | {isBackendConnected && useBackend ? 'Real System Data' : 'Simulated Data'} | Press any key to quit.</pre>
            <pre className="font-bold text-base-content/80">
              {'PID'.padStart(8)} {'USER'.padEnd(10)} {'%CPU'.padStart(6)} {'%MEM'.padStart(6)} {'COMMAND'.padEnd(20)}
            </pre>
            {processes.map((p) => (
              <pre key={p.pid} className="whitespace-pre">
                {String(p.pid).padStart(8)} {p.user.padEnd(10)} {p.cpu.padStart(6)} {p.mem.padStart(6)} {p.command.padEnd(20)}
              </pre>
            ))}
          </div>
        ) : (
          history.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {item.type === 'input' ? (
                <pre data-prefix="$" className="text-success">
                  <span className="text-info">~/{item.path}</span>
                  <span className="text-base-content/70"> {item.command}</span>
                </pre>
              ) : (
                <pre data-prefix=">" className="text-warning whitespace-pre-wrap">{item.content}</pre>
              )}
            </motion.div>
          ))
        )}
        <div className="flex items-center">
          <pre data-prefix="$" className="text-success flex-shrink-0">
            <span className="text-info">~/{currentPath}</span>
          </pre>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none w-full text-inherit pl-2"
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
