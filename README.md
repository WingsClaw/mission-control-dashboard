# Mission Control Dashboard 🚀

A real-time dashboard for monitoring and managing AI automation agents, tasks, and projects. Built with Next.js 14, TypeScript, and TailwindCSS.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)

## ✨ Features

- **Agent Management**: Add, edit, delete, and monitor automation agents
- **Task Tracking**: Create tasks, assign to agents, track progress, and manage priorities
- **Real-time Metrics**: Dashboard with live statistics on agents, tasks, and system performance
- **Activity Log**: Track all system events and changes in a timeline view
- **Local Storage Persistence**: All data persists in browser localStorage - no database needed
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface built with TailwindCSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Language**: TypeScript 5.4
- **Styling**: TailwindCSS 3.4
- **Icons**: Lucide React
- **State Management**: React Hooks + localStorage
- **Runtime**: Node.js 22+

## 📦 Installation

1. **Clone or navigate to the project directory**:
```bash
cd mission-control-dashboard
```

2. **Install dependencies**:
```bash
npm install
```

3. **Run the development server**:
```bash
npm run dev
```

4. **Open in browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Usage

### Dashboard Overview
- View all system metrics at a glance
- Monitor active agents and their status
- Check recent tasks and their progress
- Track system uptime and performance

### Managing Agents
1. Go to the **Agents** page
2. Click **Add New Agent** to create an agent
3. Fill in the form:
   - Agent Name (e.g., "Philip", "CodeReview")
   - Role (e.g., "Automation Specialist", "DevOps Engineer")
   - Initial Status (Online, Busy, Offline, Error)
4. Click **Add Agent** to create
5. Manage agents from the dashboard:
   - Change status via dropdown
   - Delete with confirmation

### Managing Tasks
1. Go to the **Tasks** page
2. Click **Create New Task** to add a task
3. Fill in the form:
   - Title (required)
   - Description (optional)
   - Priority (Critical, High, Medium, Low)
   - Assign to (select an agent)
4. Click **Create Task**
5. Manage tasks:
   - Filter by status (All, Pending, In Progress, Completed, Failed)
   - Search tasks by title or description
   - Update status via dropdown
   - Update progress with quick buttons (0%, 25%, 50%, 75%, 100%)
   - Delete tasks

### Activity Log
1. Go to the **Activity** page
2. View timeline of all events:
   - Agent updates (create, delete, status changes)
   - Task updates (create, delete, status changes)
   - System events (clear logs, etc.)
3. Filter by activity type
4. Expand entries to view metadata
5. Clear all logs with one click

## 📁 Project Structure

```
mission-control-dashboard/
├── app/
│   ├── agents/
│   │   └── page.tsx          # Agents management page
│   ├── tasks/
│   │   └── page.tsx          # Tasks management page
│   ├── activity/
│   │   └── page.tsx          # Activity log page
│   ├── page.tsx              # Main dashboard
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── AgentCard.tsx         # Agent card component
│   ├── TaskCard.tsx          # Task card component
│   ├── StatCard.tsx          # Stats card component
│   └── Navbar.tsx            # Navigation bar
├── lib/
│   ├── hooks/
│   │   ├── useLocalStorage.ts      # localStorage hook
│   │   ├── useAgents.ts           # Agents management hook
│   │   ├── useTasks.ts            # Tasks management hook
│   │   ├── useActivityLog.ts      # Activity log hook
│   │   └── useMetrics.ts          # Metrics calculation hook
│   └── types.ts              # TypeScript types
├── package.json
└── README.md
```

## 🔌 Available Hooks

### `useLocalStorage<T>(key: string, initialValue: T)`
A custom hook for managing localStorage state.

```typescript
const [value, setValue] = useLocalStorage('my-key', initialValue);
```

### `useAgents()`
Manages agents data.

```typescript
const {
  agents,
  addAgent,
  updateAgent,
  deleteAgent,
  updateAgentStatus,
  getAgentById,
} = useAgents();
```

### `useTasks()`
Manages tasks data.

```typescript
const {
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
} = useTasks();
```

### `useActivityLog()`
Manages activity log.

```typescript
const {
  activities,
  addActivity,
  clearActivities,
  getRecentActivities,
} = useActivityLog();
```

### `useMetrics(agents, tasks)`
Calculates dashboard metrics.

```typescript
const { metrics, calculateMetrics } = useMetrics(agents, tasks);

// Returns:
// - totalAgents
// - onlineAgents
// - totalTasks
// - completedTasks
// - pendingTasks
// - failedTasks
// - avgTaskCompletionTime
// - systemUptime
```

## 🎨 Components

### `StatCard`
Displays a statistic with icon and optional trend.

```typescript
<StatCard
  title="Total Agents"
  value={42}
  change={12}
  trend="up"
  icon={<Users />}
/>
```

### `AgentCard`
Displays agent information with status controls.

```typescript
<AgentCard
  agent={agent}
  onStatusChange={(id, status) => updateAgentStatus(id, status)}
  onDelete={(id) => deleteAgent(id)}
/>
```

### `TaskCard`
Displays task information with progress tracking.

```typescript
<TaskCard
  task={task}
  agentName={agent?.name}
  onStatusChange={(id, status) => updateTaskStatus(id, status)}
  onProgressChange={(id, progress) => updateTaskProgress(id, progress)}
  onDelete={(id) => deleteTask(id)}
/>
```

### `Navbar`
Navigation bar with responsive mobile menu.

```typescript
<Navbar />
```

## 📊 Data Schema

### Agent
```typescript
{
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  role: string;
  lastActive: string (ISO 8601);
  tasksCompleted: number;
  uptime: number; // minutes
}
```

### Task
```typescript
{
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string | null; // agent ID
  createdAt: string (ISO 8601);
  updatedAt: string (ISO 8601);
  progress: number; // 0-100
}
```

### Activity
```typescript
{
  id: string;
  type: 'agent_update' | 'task_update' | 'system';
  message: string;
  timestamp: string (ISO 8601);
  metadata?: Record<string, any>;
}
```

## 🎯 Development

### Build for Production
```bash
npm run build
```

### Run Production Build
```bash
npm run start
```

### Lint Code
```bash
npm run lint
```

## 💾 Data Persistence

All data is stored in the browser's localStorage under the following keys:
- `mission-agents` - Agents data
- `mission-tasks` - Tasks data
- `mission-activities` - Activity log
- `mission-system-start` - System start time

**Note**: Clearing browser data will reset all stored data.

## 🚧 Future Enhancements

- [ ] Multi-user support with authentication
- [ ] Real-time collaboration between users
- [ ] Export/import data
- [ ] Dark mode
- [ ] More analytics and charts
- [ ] Agent health monitoring
- [ ] Task dependencies
- [ ] Calendar view for tasks
- [ ] Email notifications
- [ ] Custom fields and tags

## 📝 License

This project is open source and available under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Recharts](https://recharts.org/) (for future charts)

---

**Mission Control Dashboard** - Your command center for AI automation. 🚀
