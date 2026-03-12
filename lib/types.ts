// Types for Mission Control Dashboard

export type AgentStatus = 'online' | 'offline' | 'busy' | 'error';

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  role: string;
  lastActive: string;
  tasksCompleted: number;
  uptime: number; // in minutes
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string | null; // agent ID
  createdAt: string;
  updatedAt: string;
  progress: number; // 0-100
}

export interface Activity {
  id: string;
  type: 'agent_update' | 'task_update' | 'system';
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DashboardMetrics {
  totalAgents: number;
  onlineAgents: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  failedTasks: number;
  avgTaskCompletionTime: number; // in minutes
  systemUptime: number; // in minutes
}
