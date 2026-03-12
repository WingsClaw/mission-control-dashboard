import { Task, TaskStatus } from '@/lib/types';
import { Clock, User, Trash2, ChevronRight } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  agentName?: string;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  onProgressChange?: (id: string, progress: number) => void;
}

export function TaskCard({ task, agentName, onDelete, onStatusChange, onProgressChange }: TaskCardProps) {
  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    pending: 'border-l-gray-300',
    in_progress: 'border-l-blue-500',
    completed: 'border-l-green-500',
    failed: 'border-l-red-500',
  };

  const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    failed: 'Failed',
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

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${statusColors[task.status]} hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            <span className="text-xs text-gray-500">{statusLabels[task.status]}</span>
          </div>
          <h3 className="font-semibold text-gray-900">{task.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            className="text-gray-400 hover:text-red-600 transition-colors ml-4"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {onProgressChange && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                task.status === 'completed' ? 'bg-green-500' :
                task.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
          {task.status !== 'completed' && (
            <div className="flex gap-2 mt-2">
              {[0, 25, 50, 75, 100].map((p) => (
                <button
                  key={p}
                  onClick={() => onProgressChange(task.id, p)}
                  className={`px-2 py-1 text-xs rounded ${
                    task.progress === p ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  } hover:bg-blue-100`}
                >
                  {p}%
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t text-sm">
        <div className="flex items-center gap-4 text-gray-600">
          {agentName && (
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{agentName}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{timeAgo(task.updatedAt)}</span>
          </div>
        </div>

        {onStatusChange && (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
            className="px-2 py-1 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
