'use client';

import { useAgents } from '@/lib/hooks/useAgents';
import { useTasks } from '@/lib/hooks/useTasks';
import { useMetrics } from '@/lib/hooks/useMetrics';
import { useActivityLog } from '@/lib/hooks/useActivityLog';
import { StatCard } from '@/components/StatCard';
import { AgentCard } from '@/components/AgentCard';
import { TaskCard } from '@/components/TaskCard';
import { Navbar } from '@/components/Navbar';
import { Users, CheckSquare, AlertTriangle, Clock, TrendingUp, Zap, Activity } from 'lucide-react';

export default function HomePage() {
  const { agents, updateAgentStatus, deleteAgent } = useAgents();
  const { tasks, deleteTask, updateTaskStatus, updateTaskProgress } = useTasks();
  const { metrics } = useMetrics(agents, tasks);
  const { activities, addActivity } = useActivityLog();

  // Get recent tasks (last 5)
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  // Get online agents
  const onlineAgents = agents.filter(a => a.status === 'online' || a.status === 'busy');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mission Control Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your automation agents and tasks</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Agents"
            value={metrics.totalAgents}
            icon={<Users size={24} />}
            trend="neutral"
          />
          <StatCard
            title="Online Agents"
            value={metrics.onlineAgents}
            icon={<Activity size={24} />}
            trend="up"
          />
          <StatCard
            title="Total Tasks"
            value={metrics.totalTasks}
            icon={<CheckSquare size={24} />}
            trend="neutral"
          />
          <StatCard
            title="Completed Tasks"
            value={metrics.completedTasks}
            icon={<CheckSquare size={24} />}
            trend="up"
          />
          <StatCard
            title="Pending Tasks"
            value={metrics.pendingTasks}
            icon={<Clock size={24} />}
            trend="neutral"
          />
          <StatCard
            title="Failed Tasks"
            value={metrics.failedTasks}
            icon={<AlertTriangle size={24} />}
            trend="down"
          />
          <StatCard
            title="Avg Completion Time"
            value={`${metrics.avgTaskCompletionTime}m`}
            icon={<TrendingUp size={24} />}
            trend="neutral"
          />
          <StatCard
            title="System Uptime"
            value={`${metrics.systemUptime}m`}
            icon={<Zap size={24} />}
            trend="up"
          />
        </div>

        {/* Agents Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Active Agents</h2>
            <span className="text-sm text-gray-600">{onlineAgents.length} online</span>
          </div>

          {agents.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No agents yet</h3>
              <p className="text-gray-600">Add your first agent from the Agents page</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onStatusChange={updateAgentStatus}
                  onDelete={deleteAgent}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Recent Tasks</h2>
            <a href="/tasks" className="text-blue-500 hover:text-blue-600 text-sm font-medium">
              View all tasks →
            </a>
          </div>

          {recentTasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <CheckSquare className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks yet</h3>
              <p className="text-gray-600">Create your first task from the Tasks page</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentTasks.map((task) => {
                const agent = agents.find(a => a.id === task.assignedTo);
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    agentName={agent?.name}
                    onDelete={deleteTask}
                    onStatusChange={updateTaskStatus}
                    onProgressChange={updateTaskProgress}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
