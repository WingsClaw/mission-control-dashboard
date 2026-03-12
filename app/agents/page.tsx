'use client';

import { useState } from 'react';
import { useAgents } from '@/lib/hooks/useAgents';
import { useActivityLog } from '@/lib/hooks/useActivityLog';
import { AgentCard } from '@/components/AgentCard';
import { Navbar } from '@/components/Navbar';
import { Plus, Search } from 'lucide-react';
import { AgentStatus } from '@/lib/types';

export default function AgentsPage() {
  const { agents, addAgent, updateAgentStatus, deleteAgent } = useAgents();
  const { addActivity } = useActivityLog();

  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateAgent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newAgent = {
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      status: formData.get('status') as AgentStatus,
    };

    const createdAgent = addAgent(newAgent);
    addActivity('agent_update', `Agent "${newAgent.name}" created with role "${newAgent.role}"`, {
      agentId: createdAgent.id,
    });
    setShowModal(false);
    e.currentTarget.reset();
  };

  const handleDeleteAgent = (id: string) => {
    const agent = agents.find(a => a.id === id);
    if (confirm(`Are you sure you want to delete agent "${agent?.name}"?`)) {
      deleteAgent(id);
      addActivity('agent_update', `Agent "${agent?.name}" deleted`, { agentId: id });
    }
  };

  const handleStatusChange = (id: string, status: AgentStatus) => {
    const agent = agents.find(a => a.id === id);
    if (agent && agent.status !== status) {
      updateAgentStatus(id, status);
      addActivity('agent_update', `Agent "${agent.name}" status changed to "${status}"`, {
        agentId: id,
        oldStatus: agent.status,
        newStatus: status,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agents</h1>
          <p className="text-gray-600">Manage and monitor your automation agents</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-md"
          >
            <Plus size={20} />
            Add New Agent
          </button>
        </div>

        {/* Agents Grid */}
        {filteredAgents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No agents found' : 'No agents yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'No agents match your search criteria.'
                : 'Get started by creating your first agent.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create Your First Agent
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteAgent}
              />
            ))}
          </div>
        )}

        {/* Add Agent Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Add New Agent</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateAgent} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Agent Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="e.g., Philip, CodeReview, Testing"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="role"
                      name="role"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Automation Specialist">Automation Specialist</option>
                      <option value="Code Reviewer">Code Reviewer</option>
                      <option value="DevOps Engineer">DevOps Engineer</option>
                      <option value="QA Specialist">QA Specialist</option>
                      <option value="Documentation Writer">Documentation Writer</option>
                      <option value="Frontend Developer">Frontend Developer</option>
                      <option value="Backend Developer">Backend Developer</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Initial Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="status"
                      name="status"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="online">🟢 Online</option>
                      <option value="busy">🟡 Busy</option>
                      <option value="offline">⚫ Offline</option>
                      <option value="error">🔴 Error</option>
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
                      Add Agent
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
