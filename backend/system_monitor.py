"""
System Monitoring Integration for TerminalX
Provides real system monitoring data for CPU, memory, and processes
"""

import psutil
import platform
import time
from datetime import datetime
from typing import Dict, List, Any, Optional
import subprocess
import json

class SystemMonitor:
    """Real system monitoring using psutil and system commands"""
    
    def __init__(self):
        self.system_info = self._get_system_info()
    
    def _get_system_info(self) -> Dict[str, Any]:
        """Get basic system information"""
        return {
            'platform': platform.system(),
            'platform_release': platform.release(),
            'platform_version': platform.version(),
            'architecture': platform.machine(),
            'hostname': platform.node(),
            'processor': platform.processor(),
            'python_version': platform.python_version()
        }
    
    def get_cpu_info(self) -> Dict[str, Any]:
        """Get detailed CPU information"""
        try:
            cpu_count = psutil.cpu_count()
            cpu_count_logical = psutil.cpu_count(logical=True)
            cpu_freq = psutil.cpu_freq()
            cpu_percent = psutil.cpu_percent(interval=1, percpu=True)
            cpu_percent_avg = psutil.cpu_percent(interval=1)
            
            return {
                'cpu_count_physical': cpu_count,
                'cpu_count_logical': cpu_count_logical,
                'cpu_frequency': {
                    'current': round(cpu_freq.current, 2) if cpu_freq else 0,
                    'min': round(cpu_freq.min, 2) if cpu_freq else 0,
                    'max': round(cpu_freq.max, 2) if cpu_freq else 0
                },
                'cpu_percent_per_core': [round(x, 1) for x in cpu_percent],
                'cpu_percent_average': round(cpu_percent_avg, 1),
                'cpu_times': psutil.cpu_times()._asdict(),
                'load_average': psutil.getloadavg() if hasattr(psutil, 'getloadavg') else [0, 0, 0]
            }
        except Exception as e:
            return {'error': f'Failed to get CPU info: {str(e)}'}
    
    def get_memory_info(self) -> Dict[str, Any]:
        """Get detailed memory information"""
        try:
            memory = psutil.virtual_memory()
            swap = psutil.swap_memory()
            
            return {
                'virtual_memory': {
                    'total': memory.total,
                    'available': memory.available,
                    'used': memory.used,
                    'free': memory.free,
                    'percent': round(memory.percent, 1),
                    'cached': getattr(memory, 'cached', 0),
                    'buffers': getattr(memory, 'buffers', 0)
                },
                'swap_memory': {
                    'total': swap.total,
                    'used': swap.used,
                    'free': swap.free,
                    'percent': round(swap.percent, 1)
                }
            }
        except Exception as e:
            return {'error': f'Failed to get memory info: {str(e)}'}
    
    def get_disk_info(self) -> Dict[str, Any]:
        """Get disk usage information"""
        try:
            disk_usage = psutil.disk_usage('/')
            disk_io = psutil.disk_io_counters()
            
            return {
                'disk_usage': {
                    'total': disk_usage.total,
                    'used': disk_usage.used,
                    'free': disk_usage.free,
                    'percent': round((disk_usage.used / disk_usage.total) * 100, 1)
                },
                'disk_io': {
                    'read_count': disk_io.read_count if disk_io else 0,
                    'write_count': disk_io.write_count if disk_io else 0,
                    'read_bytes': disk_io.read_bytes if disk_io else 0,
                    'write_bytes': disk_io.write_bytes if disk_io else 0
                }
            }
        except Exception as e:
            return {'error': f'Failed to get disk info: {str(e)}'}
    
    def get_network_info(self) -> Dict[str, Any]:
        """Get network information"""
        try:
            net_io = psutil.net_io_counters()
            net_connections = len(psutil.net_connections())
            
            return {
                'network_io': {
                    'bytes_sent': net_io.bytes_sent,
                    'bytes_recv': net_io.bytes_recv,
                    'packets_sent': net_io.packets_sent,
                    'packets_recv': net_io.packets_recv
                },
                'active_connections': net_connections
            }
        except Exception as e:
            return {'error': f'Failed to get network info: {str(e)}'}
    
    def get_processes(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get real system processes"""
        try:
            processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'username', 'status', 'create_time']):
                try:
                    proc_info = proc.info
                    processes.append({
                        'pid': proc_info['pid'],
                        'name': proc_info['name'],
                        'cpu_percent': round(proc_info['cpu_percent'] or 0, 1),
                        'memory_percent': round(proc_info['memory_percent'] or 0, 1),
                        'username': proc_info['username'] or 'unknown',
                        'status': proc_info['status'],
                        'create_time': datetime.fromtimestamp(proc_info['create_time']).strftime('%H:%M:%S')
                    })
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    continue
            
            # Sort by CPU usage
            processes.sort(key=lambda x: x['cpu_percent'], reverse=True)
            return processes[:limit]
        except Exception as e:
            return [{'error': f'Failed to get processes: {str(e)}'}]
    
    def get_system_uptime(self) -> Dict[str, Any]:
        """Get system uptime"""
        try:
            boot_time = psutil.boot_time()
            uptime_seconds = time.time() - boot_time
            
            days = int(uptime_seconds // 86400)
            hours = int((uptime_seconds % 86400) // 3600)
            minutes = int((uptime_seconds % 3600) // 60)
            
            return {
                'uptime_seconds': uptime_seconds,
                'uptime_formatted': f"{days}d {hours}h {minutes}m",
                'boot_time': datetime.fromtimestamp(boot_time).strftime('%Y-%m-%d %H:%M:%S')
            }
        except Exception as e:
            return {'error': f'Failed to get uptime: {str(e)}'}
    
    def get_top_processes(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top processes by CPU and memory usage"""
        try:
            processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'username', 'cmdline']):
                try:
                    proc_info = proc.info
                    cmdline = ' '.join(proc_info['cmdline']) if proc_info['cmdline'] else proc_info['name']
                    processes.append({
                        'pid': proc_info['pid'],
                        'name': proc_info['name'],
                        'cpu_percent': round(proc_info['cpu_percent'] or 0, 1),
                        'memory_percent': round(proc_info['memory_percent'] or 0, 1),
                        'username': proc_info['username'] or 'unknown',
                        'command': cmdline[:50] + '...' if len(cmdline) > 50 else cmdline
                    })
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    continue
            
            # Sort by CPU usage
            processes.sort(key=lambda x: x['cpu_percent'], reverse=True)
            return processes[:limit]
        except Exception as e:
            return [{'error': f'Failed to get top processes: {str(e)}'}]
    
    def get_system_summary(self) -> Dict[str, Any]:
        """Get complete system summary"""
        return {
            'timestamp': datetime.now().isoformat(),
            'system_info': self.system_info,
            'cpu': self.get_cpu_info(),
            'memory': self.get_memory_info(),
            'disk': self.get_disk_info(),
            'network': self.get_network_info(),
            'uptime': self.get_system_uptime(),
            'top_processes': self.get_top_processes(5)
        }
    
    def format_bytes(self, bytes_value: int) -> str:
        """Format bytes to human readable format"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes_value < 1024.0:
                return f"{bytes_value:.1f}{unit}"
            bytes_value /= 1024.0
        return f"{bytes_value:.1f}PB"
    
    def format_percent_bar(self, percent: float, width: int = 20) -> str:
        """Create a visual progress bar"""
        filled = int(width * percent / 100)
        bar = '█' * filled + '░' * (width - filled)
        return f"[{bar}] {percent:.1f}%"

# Global system monitor instance
system_monitor = SystemMonitor()
