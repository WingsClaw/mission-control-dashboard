# Mission Control Dashboard

A mission-control UI for a real local OpenClaw workspace. Built with Next.js 14, TypeScript, and TailwindCSS.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)

## ✨ Features

- **Live OpenClaw Integration**: Reads the real OpenClaw home, workspace docs, command log, scheduler, and session indexes on the server
- **Writable Mission Board**: Tasks are stored in the OpenClaw workspace `kanban.json` file instead of browser localStorage
- **Activity Timeline**: The activity screen is sourced from the real `commands.log`
- **Projects Surface**: Group live tasks into real workstreams and track progress by project
- **Calendar And Heartbeat**: Inspect `cron/jobs.json` and `HEARTBEAT.md` from the workspace
- **Docs, Memory, Team, And Office Views**: Search workspace markdown, inspect memory notes, view team topology, and visualize agent focus
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface built with TailwindCSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Language**: TypeScript 5.4
- **Styling**: TailwindCSS 3.4
- **Icons**: Lucide React
- **Runtime Data Layer**: Server components + server-only OpenClaw filesystem reader
- **Task Mutations**: Next.js route handlers over the OpenClaw board file
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

5. **Point the app at OpenClaw**:
The dashboard auto-detects the default local OpenClaw installation. If your OpenClaw home lives elsewhere, set `OPENCLAW_HOME` before starting the app.

## 🚀 Usage

### Dashboard Overview
- View the real OpenClaw runtime at a glance
- Monitor active agents discovered from session indexes
- Check recent work from the shared mission board
- Scan the recent command timeline and workspace warnings

### Managing Agents
1. Go to the **Agents** page
2. Review the roster discovered from OpenClaw session indexes
3. Inspect model/runtime details, task counts, and recent activity per agent
4. Use the screen as a live operational directory instead of a local editor

### Managing Tasks
1. Go to the **Tasks** page
2. Create tasks directly on the live board
3. Assign them to human or agent owners
4. Move work between lanes, update progress, change priority, or delete tasks
5. All changes are persisted to the OpenClaw workspace `kanban.json`

### Projects
1. Go to the **Projects** page
2. Review live project groupings derived from the shared board
3. Assign a project name to tasks from the board to turn ad-hoc work into trackable workstreams
4. Use the page to see project completion, ownership, and related document density

### Activity Log
1. Go to the **Activity** page
2. Review the command stream recorded in the real OpenClaw log
3. Filter the timeline by source category
4. Use it as the audit trail for what the runtime actually did

### Calendar, Docs, Memory, Team, And Office
1. Use **Calendar** to inspect cron jobs and heartbeat instructions
2. Use **Docs** to search markdown files in the OpenClaw workspace root
3. Use **Memory** to search daily notes from the workspace memory folder
4. Use **Team** to inspect the current human, assistant, and agent topology
5. Use **Office** for a live visualization layer grounded in real board and agent data

## 📁 Project Structure

```
mission-control-dashboard/
├── app/
│   ├── calendar/
│   │   └── page.tsx          # Scheduler and heartbeat view
│   ├── projects/
│   │   └── page.tsx          # Live project portfolio view
│   ├── docs/
│   │   └── page.tsx          # Workspace document library
│   ├── memory/
│   │   └── page.tsx          # Workspace memory library
│   ├── team/
│   │   └── page.tsx          # Org and operating-principles view
│   ├── office/
│   │   └── page.tsx          # Visual office map
│   ├── agents/
│   │   └── page.tsx          # Live OpenClaw agent directory
│   ├── tasks/
│   │   └── page.tsx          # Writable OpenClaw board
│   ├── activity/
│   │   └── page.tsx          # Command timeline page
│   ├── api/openclaw/
│   │   ├── board/route.ts    # Board mutation API
│   │   └── snapshot/route.ts # Safe snapshot API
│   ├── live/
│   │   └── page.tsx          # Raw live system view
│   ├── page.tsx              # Main mission-control dashboard
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── OpenClawTaskBoard.tsx         # Live board UI
│   ├── OpenClawAgentsDirectory.tsx   # Live agent directory UI
│   ├── OpenClawActivityTimeline.tsx  # Live activity UI
│   ├── OpenClawDocumentLibrary.tsx   # Reusable docs and memory UI
│   ├── OpenClawOfficeMap.tsx         # Live office visualization
│   ├── StatCard.tsx          # Stats card component
│   └── Navbar.tsx            # Navigation bar
├── lib/
│   ├── server/
│   │   └── openclaw.ts        # Server-only OpenClaw reader and board mutator
│   ├── hooks/                 # Legacy local hooks kept for reference
│   └── types.ts              # TypeScript types
├── package.json
└── README.md
```

## 🔌 Legacy Hooks

The local hooks in `lib/hooks` are still present, but the main routes no longer depend on them. The live app now reads from the server-only OpenClaw model in `lib/server/openclaw.ts`.

## API Routes

### `GET /api/openclaw/snapshot`
Returns a sanitized summary of the live OpenClaw workspace.

### `GET /api/openclaw/board`
Returns the live kanban board and assignment options.

### `POST /api/openclaw/board`
Applies a board mutation to the OpenClaw workspace `kanban.json` file.

## Available Hook Examples

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
