'use client';

import { useState } from 'react';

export default function HomePage() {
  const [projects] = useState([
    { id: 1, name: 'Real-Time Whiteboard', status: 'active' },
    { id: 2, name: 'Mission Control Dashboard', status: 'in_progress' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mission Control Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Projects Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Projects</h2>
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm text-gray-600">
                      Status: {project.status}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : project.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Agents Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Agents</h2>
            <div className="text-gray-600">
              <p>No active agents yet.</p>
              <p className="text-sm mt-2">
                Agents will be displayed here when connected.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-500 text-white p-6 rounded-lg">
          <p className="font-semibold mb-2">
            🚧 Dashboard Under Development
          </p>
          <p className="text-sm">
            Mission Control Dashboard is being built. Check back soon for updates!
          </p>
        </div>
      </div>
    </div>
  );
}
