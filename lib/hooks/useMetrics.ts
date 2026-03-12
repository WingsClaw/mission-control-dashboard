import { Agent, Task, DashboardMetrics } from '../types';
import { useLocalStorage } from './useLocalStorage';

const SYSTEM_START_TIME = Date.now();

export function useMetrics(agents: Agent[], tasks: Task[]) {
  const [systemStartTime] = useLocalStorage('mission-system-start', SYSTEM_START_TIME);

  const calculateMetrics = (): DashboardMetrics => {
    const totalAgents = agents.length;
    const onlineAgents = agents.filter(a => a.status === 'online' || a.status === 'busy').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const failedTasks = tasks.filter(t => t.status === 'failed').length;

    // Calculate average task completion time (simulated)
    const completedTasksWithTime = tasks.filter(t => t.status === 'completed');
    let avgTaskCompletionTime = 0;
    if (completedTasksWithTime.length > 0) {
      const totalTime = completedTasksWithTime.reduce((sum, task) => {
        const created = new Date(task.createdAt).getTime();
        const updated = new Date(task.updatedAt).getTime();
        return sum + (updated - created);
      }, 0);
      avgTaskCompletionTime = Math.round(totalTime / completedTasksWithTime.length / 60000); // Convert to minutes
    }

    // System uptime in minutes
    const systemUptime = Math.round((Date.now() - systemStartTime) / 60000);

    return {
      totalAgents,
      onlineAgents,
      totalTasks,
      completedTasks,
      pendingTasks,
      failedTasks,
      avgTaskCompletionTime,
      systemUptime,
    };
  };

  const metrics = calculateMetrics();

  return { metrics, calculateMetrics };
}
