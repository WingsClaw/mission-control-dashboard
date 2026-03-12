'use client';

import { useState, useMemo } from 'react';
import { useTasks } from '@/lib/hooks/useTasks';
import { useAgents } from '@/lib/hooks/useAgents';
import { TaskCard } from '@/components/TaskCard';
import { TaskStatus, Task } from '@/lib/types';
import { Plus, Filter, Search } from 'lucide-react';

export default function TasksPage() {
  const { tasks, addTask, deleteTask, updateTaskStatus, updateTaskProgress } = useTasks();
  const { agents } = useAgents();

  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const statusOrder = { pending: 0, in_progress: 1, completed: 2, failed: 3 };

  const sortedTasks = useMemo(() => {
    let filtered = filter === 'all' ? [...tasks] : tasks.filter(t => t.status === filter);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => {
      // First sort by priority
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // Then sort by status
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      // Finally sort by updatedAt (newest first)
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [tasks, filter, searchQuery]);

  const filteredTaskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(id);
    }
  };

  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newTask = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as Task['priority'],
      assignedTo: (formData.get('assignedTo') as string) || null,
      status: 'pending' as Task['status'],
    };

    addTask(newTask);
    setShowModal(false);
    e.currentTarget.reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
          <p className="text-gray-600">Manage and track all your mission tasks</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'All', count: filteredTaskCounts.all, color: 'bg-gray-500' },
            { label: 'Pending', count: filteredTaskCounts.pending, color: 'bg-yellow-500' },
            { label: 'In Progress', count: filteredTaskCounts.in_progress, color: 'bg-blue-500' },
            { label: 'Completed', count: filteredTaskCounts.completed, color: 'bg-green-500' },
            { label: 'Failed', count: filteredTaskCounts.failed, color: 'bg-red-500' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow ${
                filter === stat.label.toLowerCase().replace(' ', '_') ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() =>
                setFilter(stat.label.toLowerCase().replace(' ', '_') as TaskStatus | 'all')
              }
            >
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'in_progress', 'completed', 'failed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center gap-2 shadow-md"
          >
            <Plus size={20} />
            Create New Task
          </button>
        </div>

        {/* Tasks Grid */}
        {sortedTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Filter className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'No tasks match your search criteria.'
                : filter !== 'all'
                ? `No ${filter.replace('_', ' ')} tasks yet.`
                : 'Get started by creating your first task.'}
            </p>
            {!searchQuery && filter === 'all' && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create Your First Task
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedTasks.map((task) => {
              const agent = agents.find(a => a.id === task.assignedTo);
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  agentName={agent?.name}
                  onDelete={handleDelete}
                  onStatusChange={updateTaskStatus}
                  onProgressChange={updateTaskProgress}
                />
              );
            })}
          </div>
        )}

        {/* Create Task Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      placeholder="Enter task title..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      placeholder="Enter task description..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="critical">🔴 Critical</option>
                      <option value="high">🟠 High</option>
                      <option value="medium" selected>🟡 Medium</option>
                      <option value="low">🟢 Low</option>
                    </select>
                  </div>

                  {/* Assign to */}
                  <div>
                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
                      Assign to
                    </label>
                    <select
                      id="assignedTo"
                      name="assignedTo"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Unassigned</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name} ({agent.role}) - {agent.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                    >
                      Create Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
