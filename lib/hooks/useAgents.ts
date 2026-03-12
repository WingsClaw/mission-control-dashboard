import { useLocalStorage } from './useLocalStorage';
import { Agent } from '../types';

const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-001',
    name: 'Philip',
    status: 'online',
    role: 'Automation Specialist',
    lastActive: new Date().toISOString(),
    tasksCompleted: 142,
    uptime: 245, // minutes
  },
  {
    id: 'agent-002',
    name: 'CodeReview',
    status: 'online',
    role: 'Code Reviewer',
    lastActive: new Date().toISOString(),
    tasksCompleted: 89,
    uptime: 180,
  },
  {
    id: 'agent-003',
    name: 'DevOps',
    status: 'busy',
    role: 'Deployment Manager',
    lastActive: new Date(Date.now() - 5 * 60000).toISOString(), // 5 min ago
    tasksCompleted: 67,
    uptime: 320,
  },
  {
    id: 'agent-004',
    name: 'Testing',
    status: 'offline',
    role: 'QA Specialist',
    lastActive: new Date(Date.now() - 30 * 60000).toISOString(), // 30 min ago
    tasksCompleted: 203,
    uptime: 156,
  },
];

export function useAgents() {
  const [agents, setAgents] = useLocalStorage<Agent[]>('mission-agents', INITIAL_AGENTS);

  const addAgent = (agent: Omit<Agent, 'id' | 'lastActive' | 'tasksCompleted' | 'uptime'>) => {
    const newAgent: Agent = {
      ...agent,
      id: `agent-${Date.now()}`,
      lastActive: new Date().toISOString(),
      tasksCompleted: 0,
      uptime: 0,
    };
    setAgents([...agents, newAgent]);
    return newAgent;
  };

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    setAgents(agents.map(agent =>
      agent.id === id ? { ...agent, ...updates, lastActive: new Date().toISOString() } : agent
    ));
  };

  const deleteAgent = (id: string) => {
    setAgents(agents.filter(agent => agent.id !== id));
  };

  const updateAgentStatus = (id: string, status: Agent['status']) => {
    updateAgent(id, { status });
  };

  const getAgentById = (id: string) => agents.find(agent => agent.id === id);

  return {
    agents,
    addAgent,
    updateAgent,
    deleteAgent,
    updateAgentStatus,
    getAgentById,
  };
}
