import { Agent, AgentStatus } from '@/lib/types';
import { Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: AgentStatus) => void;
}

export function AgentCard({ agent, onDelete, onStatusChange }: AgentCardProps) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const statusLabels = {
    online: 'Online',
    offline: 'Offline',
    busy: 'Busy',
    error: 'Error',
  };

  const timeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatUptime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${statusColors[agent.status]}`} />
          <div>
            <h3 className="font-semibold text-gray-900">{agent.name}</h3>
            <p className="text-sm text-gray-600">{agent.role}</p>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(agent.id)}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            ×
          </button>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={16} />
          <span>Last active: {timeAgo(agent.lastActive)}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <CheckCircle size={16} />
          <span>Tasks completed: {agent.tasksCompleted}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Activity size={16} />
          <span>Uptime: {formatUptime(agent.uptime)}</span>
        </div>
      </div>

      {onStatusChange && (
        <div className="mt-4 pt-4 border-t">
          <select
            value={agent.status}
            onChange={(e) => onStatusChange(agent.id, e.target.value as AgentStatus)}
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
