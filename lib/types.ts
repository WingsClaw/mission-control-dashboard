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
  metadata?: Record<string, unknown>;
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

export type OpenClawTaskSource = 'none' | 'kanban' | 'markdown';
export type OpenClawKanbanLane = 'backlog' | 'in_progress' | 'review' | 'done';

export interface OpenClawConfigSummary {
  workspaceDir: string | null;
  primaryModel: string | null;
  maxConcurrent: number | null;
  subagentConcurrency: number | null;
  gatewayConfigured: boolean;
  gatewayMode: string | null;
  gatewayBind: string | null;
  gatewayPort: number | null;
  lastTouchedAt: string | null;
}

export interface OpenClawAgentSnapshot {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  sessionCount: number;
  lastUpdatedAt: string | null;
  model: string | null;
  contextTokens: number | null;
  skillCount: number;
  workspaceFileCount: number;
  activeTaskCount: number;
  completedTaskCount: number;
}

export interface OpenClawCommandEvent {
  id: string;
  timestamp: string;
  action: string;
  sessionKey: string | null;
  senderId: string | null;
  source: string | null;
}

export interface OpenClawFileSummary {
  name: string;
  relativePath: string;
  updatedAt: string | null;
}

export interface OpenClawDocumentDetail extends OpenClawFileSummary {
  title: string;
  excerpt: string;
  content: string;
}

export interface OpenClawSchedulerJob {
  id: string;
  name: string;
  schedule: string | null;
  enabled: boolean;
  prompt: string | null;
  timezone: string | null;
  nextRunAt: string | null;
  target: string | null;
}

export interface OpenClawIdentity {
  name: string;
  creature: string | null;
  vibe: string | null;
  emoji: string | null;
}

export interface OpenClawUserProfile {
  name: string;
  callName: string;
  timezone: string | null;
  notes: string | null;
}

export interface OpenClawOperatingPrinciple {
  title: string;
  body: string;
  source: string;
}

export interface OpenClawTeamMember {
  id: string;
  name: string;
  type: 'human' | 'assistant' | 'agent';
  role: string;
  location: string;
  status: string;
  detail: string;
}

export interface OpenClawAssignmentOption {
  id: string;
  label: string;
  kind: 'human' | 'agent';
}

export interface OpenClawKanbanLaneDefinition {
  id: OpenClawKanbanLane;
  title: string;
  description: string;
}

export interface OpenClawKanbanTask {
  id: string;
  title: string;
  description: string;
  project: string | null;
  lane: OpenClawKanbanLane;
  priority: Task['priority'];
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  progress: number;
}

export interface OpenClawKanbanBoard {
  version: number;
  updatedAt: string;
  lanes: OpenClawKanbanLaneDefinition[];
  tasks: OpenClawKanbanTask[];
}

export type OpenClawBoardMutation =
  | {
      type: 'createTask';
      task: Pick<OpenClawKanbanTask, 'title' | 'description' | 'project' | 'lane' | 'priority' | 'assignedTo'>;
    }
  | {
      type: 'updateTask';
      taskId: string;
      updates: Partial<Pick<OpenClawKanbanTask, 'title' | 'description' | 'project' | 'lane' | 'priority' | 'assignedTo' | 'progress'>>;
    }
  | {
      type: 'deleteTask';
      taskId: string;
    };

export interface OpenClawTaskSummary {
  source: OpenClawTaskSource;
  total: number;
  completed: number;
  pending: number;
  fileName: string | null;
}

export interface OpenClawSnapshot {
  available: boolean;
  openClawHome: string | null;
  config: OpenClawConfigSummary | null;
  agents: OpenClawAgentSnapshot[];
  activity: OpenClawCommandEvent[];
  docs: OpenClawFileSummary[];
  memoryFiles: OpenClawFileSummary[];
  cronJobsCount: number;
  taskSummary: OpenClawTaskSummary;
  heartbeatFilePresent: boolean;
  heartbeatHasInstructions: boolean;
  warnings: string[];
}

export interface OpenClawWorkspaceModel {
  available: boolean;
  openClawHome: string | null;
  workspaceDir: string | null;
  config: OpenClawConfigSummary | null;
  identity: OpenClawIdentity;
  user: OpenClawUserProfile;
  agents: OpenClawAgentSnapshot[];
  assignmentOptions: OpenClawAssignmentOption[];
  board: OpenClawKanbanBoard;
  taskSummary: OpenClawTaskSummary;
  activity: OpenClawCommandEvent[];
  docs: OpenClawDocumentDetail[];
  memoryEntries: OpenClawDocumentDetail[];
  schedulerJobs: OpenClawSchedulerJob[];
  heartbeatContent: string | null;
  heartbeatFilePresent: boolean;
  heartbeatHasInstructions: boolean;
  operatingPrinciples: OpenClawOperatingPrinciple[];
  teamMembers: OpenClawTeamMember[];
  warnings: string[];
}
