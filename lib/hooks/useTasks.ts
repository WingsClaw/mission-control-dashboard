import { useLocalStorage } from './useLocalStorage';
import { Task } from '../types';

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-001',
    title: 'Fix Fabric.js import errors',
    description: 'Update all Fabric.js imports to v5.3.0 compatible syntax',
    status: 'completed',
    priority: 'critical',
    assignedTo: 'agent-001',
    createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60000).toISOString(), // 1 hour ago
    progress: 100,
  },
  {
    id: 'task-002',
    title: 'Deploy whiteboard to Vercel',
    description: 'Configure Vercel project and deploy the whiteboard application',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'agent-003',
    createdAt: new Date(Date.now() - 3 * 60 * 60000).toISOString(), // 3 hours ago
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 min ago
    progress: 75,
  },
  {
    id: 'task-003',
    title: 'Write E2E tests for dashboard',
    description: 'Create comprehensive Playwright test suite for mission control dashboard',
    status: 'pending',
    priority: 'medium',
    assignedTo: 'agent-004',
    createdAt: new Date(Date.now() - 1 * 60 * 60000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60000).toISOString(),
    progress: 0,
  },
  {
    id: 'task-004',
    title: 'Review Supabase integration code',
    description: 'Perform code review on database integration and RLS policies',
    status: 'in_progress',
    priority: 'medium',
    assignedTo: 'agent-002',
    createdAt: new Date(Date.now() - 4 * 60 * 60000).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 45 * 60000).toISOString(), // 45 min ago
    progress: 60,
  },
  {
    id: 'task-005',
    title: 'Implement user authentication',
    description: 'Add login and registration flow with Supabase Auth',
    status: 'pending',
    priority: 'low',
    assignedTo: null,
    createdAt: new Date(Date.now() - 5 * 60 * 60000).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
    progress: 0,
  },
];

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('mission-tasks', INITIAL_TASKS);

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
    };
    setTasks((currentTasks) => [...currentTasks, newTask]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task,
      ),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
  };

  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== id) {
          return task;
        }

        const progress =
          status === 'completed' ? 100 : status === 'pending' ? 0 : task.progress;

        return {
          ...task,
          status,
          progress,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  };

  const updateTaskProgress = (id: string, progress: number) => {
    const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending';

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              progress: Math.min(100, Math.max(0, progress)),
              status,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
  };

  const assignTask = (taskId: string, agentId: string | null) => {
    updateTask(taskId, { assignedTo: agentId });
  };

  const getTasksByAgent = (agentId: string) => tasks.filter(task => task.assignedTo === agentId);

  const getTasksByStatus = (status: Task['status']) => tasks.filter(task => task.status === status);

  const getTasksByPriority = (priority: Task['priority']) => tasks.filter(task => task.priority === priority);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskProgress,
    assignTask,
    getTasksByAgent,
    getTasksByStatus,
    getTasksByPriority,
  };
}
