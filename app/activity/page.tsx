'use client';

import { useState } from 'react';
import { useActivityLog } from '@/lib/hooks/useActivityLog';
import { Navbar } from '@/components/Navbar';
import { Trash2, User, CheckSquare, Cpu, Filter } from 'lucide-react';

export default function ActivityPage() {
  const { activities, clearActivities, addActivity } = useActivityLog();

  const [filter, setFilter] = useState<'all' | 'agent_update' | 'task_update' | 'system'>('all');

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.type === filter);

  const activityIcons = {
    agent_update: { icon: User, color: 'bg-blue-500', bgColor: 'bg-blue-50' },
    task_update: { icon: CheckSquare, color: 'bg-green-500', bgColor: 'bg-green-50' },
    system: { icon: Cpu, color: 'bg-gray-500', bgColor: 'bg-gray-50' },
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

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all activity logs?')) {
      clearActivities();
      addActivity('system', 'Activity log cleared by user');
    }
  };

  const filterLabels = {
    all: 'All',
    agent_update: 'Agent Updates',
    task_update: 'Task Updates',
    system: 'System',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Log</h1>
          <p className="text-gray-600">Track all system events and changes</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(filterLabels) as Array<keyof typeof filterLabels>).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filterLabels[type]}
              </button>
            ))}
          </div>

          {/* Clear All Button */}
          <div className="ml-auto">
            <button
              onClick={handleClearAll}
              disabled={activities.length === 0}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Trash2 size={18} />
              Clear All
            </button>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'All', count: activities.length, color: 'bg-gray-500' },
            { label: 'Agent Updates', count: activities.filter(a => a.type === 'agent_update').length, color: 'bg-blue-500' },
            { label: 'Task Updates', count: activities.filter(a => a.type === 'task_update').length, color: 'bg-green-500' },
            { label: 'System', count: activities.filter(a => a.type === 'system').length, color: 'bg-gray-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                <span className="text-sm text-gray-600">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Activity Timeline */}
        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Filter className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No activities yet</h3>
            <p className="text-gray-600">
              {filter !== 'all'
                ? `No ${filterLabels[filter]} activities recorded.`
                : 'Start interacting with agents and tasks to see activity here.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y">
              {filteredActivities.map((activity, index) => {
                const config = activityIcons[activity.type];
                const Icon = config.icon;

                return (
                  <div
                    key={activity.id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${index === 0 ? 'rounded-t-lg' : ''} ${
                      index === filteredActivities.length - 1 ? 'rounded-b-lg' : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                        <Icon size={20} className={config.color.replace('bg-', 'text-')} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">{activity.message}</p>
                            <p className="text-sm text-gray-500 mt-1">{timeAgo(activity.timestamp)}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${config.bgColor} ${config.color.replace('bg-', 'text-')}`}>
                            {activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>

                        {/* Metadata */}
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <details className="mt-3">
                            <summary className="text-sm text-blue-500 hover:text-blue-600 cursor-pointer font-medium">
                              View Details
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 rounded p-3 overflow-x-auto">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
