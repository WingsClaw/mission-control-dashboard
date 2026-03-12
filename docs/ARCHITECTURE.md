# Mission Control Dashboard - Architecture

## 📋 Table of Contents
- [System Overview](#system-overview)
- [Directory Structure](#directory-structure)
- [Component Hierarchy](#component-hierarchy)
- [Data Flow](#data-flow)
- [State Management](#state-management)
- [Design Patterns](#design-patterns)

---

## 🎯 System Overview

Mission Control Dashboard is a **single-page application** built with **Next.js 14 App Router**. The application manages AI automation agents and tasks with **client-side state management** and **localStorage persistence**.

### Core Principles

1. **Client-First**: All logic runs in the browser
2. **Persistent Data**: localStorage for data survival
3. **Real-Time Updates**: Immediate UI updates on state changes
4. **Modular Design**: Reusable components and hooks
5. **Type Safety**: Full TypeScript coverage

### Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Next.js 14 (App Router) + TypeScript + TailwindCSS     │
│  - Pages: /, /agents, /tasks, /activity                │
│  - Components: Reusable UI elements                     │
│  - Hooks: Business logic & state management             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                           │
├─────────────────────────────────────────────────────────────┤
│  React Hooks + localStorage                             │
│  - useAgents: Agent CRUD operations                    │
│  - useTasks: Task CRUD operations                      │
│  - useActivityLog: Activity tracking                  │
│  - useMetrics: Statistics calculation                    │
│  - useLocalStorage: Generic storage hook               │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    Storage Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Browser localStorage                                   │
│  - mission-agents: Agent data                         │
│  - mission-tasks: Task data                           │
│  - mission-activities: Activity log                    │
│  - mission-system-start: System timestamp              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
mission-control-dashboard/
│
├── app/                          # Next.js App Router pages
│   ├── agents/                   # Agents management page
│   │   └── page.tsx             # +Create, Read, Update, Delete agents
│   ├── tasks/                    # Tasks management page
│   │   └── page.tsx             # +CRUD tasks, filters, search
│   ├── activity/                 # Activity log page
│   │   └── page.tsx             # Timeline view, filter, clear
│   ├── layout.tsx                # Root layout wrapper
│   ├── page.tsx                 # Main dashboard (home)
│   └── globals.css              # Global Tailwind styles
│
├── components/                   # Reusable React components
│   ├── Navbar.tsx                # Navigation bar
│   ├── StatCard.tsx             # Metric display card
│   ├── AgentCard.tsx            # Agent information card
│   └── TaskCard.tsx             # Task information card
│
├── lib/                         # Core business logic
│   ├── hooks/                   # Custom React hooks
│   │   ├── useLocalStorage.ts   # Generic localStorage hook
│   │   ├── useAgents.ts        # Agent management logic
│   │   ├── useTasks.ts         # Task management logic
│   │   ├── useActivityLog.ts   # Activity tracking logic
│   │   └── useMetrics.ts      # Metrics calculation logic
│   └── types.ts                # TypeScript type definitions
│
├── docs/                        # Documentation
│   ├── FEATURES.md              # Feature documentation
│   └── ARCHITECTURE.md         # This file
│
├── package.json                 # Dependencies and scripts
└── README.md                   # Project documentation
```

---

## 🌳 Component Hierarchy

### Page-Level Components

```
app/layout.tsx (Root)
└── Body
    └── Page Components
        ├── app/page.tsx (Dashboard)
        ├── app/agents/page.tsx (Agents Management)
        ├── app/tasks/page.tsx (Tasks Management)
        └── app/activity/page.tsx (Activity Log)
```

### Dashboard (app/page.tsx)

```
Dashboard
├── Navbar
│   ├── Logo + Title
│   └── Nav Links (Desktop + Mobile)
├── Metrics Section
│   └── StatCard × 8
│       ├── Total Agents
│       ├── Online Agents
│       ├── Total Tasks
│       ├── Completed Tasks
│       ├── Pending Tasks
│       ├── Failed Tasks
│       ├── Avg Completion Time
│       └── System Uptime
├── Agents Section
│   └── AgentCard × N (grid)
└── Tasks Section
    └── TaskCard × N (grid)
```

### Agents Page (app/agents/page.tsx)

```
AgentsPage
├── Navbar
├── Controls
│   ├── Search Input
│   └── Add New Agent Button
├── AgentCard × N (grid)
│   ├── Agent Info
│   ├── Status Dropdown
│   └── Delete Button
└── Add Agent Modal
    ├── Form (Name, Role, Status)
    └── Action Buttons (Cancel, Add Agent)
```

### Tasks Page (app/tasks/page.tsx)

```
TasksPage
├── Navbar
├── Stats Cards (All, Pending, In Progress, Completed, Failed)
├── Controls
│   ├── Search Input
│   ├── Filter Buttons
│   └── Create New Task Button
├── TaskCard × N (grid)
│   ├── Priority Badge
│   ├── Status Badge
│   ├── Task Details
│   ├── Progress Bar + Quick Buttons
│   ├── Status Dropdown
│   └── Delete Button
└── Create Task Modal
    ├── Form (Title, Description, Priority, Assign To)
    └── Action Buttons (Cancel, Create Task)
```

### Activity Page (app/activity/page.tsx)

```
ActivityPage
├── Navbar
├── Controls
│   ├── Filter Buttons (All, Agent, Task, System)
│   └── Clear All Button
├── Stats Cards (All, Agent Updates, Task Updates, System)
└── Activity Timeline
    └── Activity Entry × N
        ├── Icon (Agent/Task/System)
        ├── Message
        ├── Timestamp
        ├── Type Badge
        └── Metadata (expandable)
```

---

## 🔄 Data Flow

### Agent Management Flow

```
User Action: Add Agent
    ↓
app/agents/page.tsx: handleCreateAgent()
    ↓
useAgents(): addAgent(newAgent)
    ↓
useLocalStorage(): setValue('mission-agents', agents)
    ↓
localStorage.setItem('mission-agents', JSON.stringify(agents))
    ↓
Component re-renders with new agent
    ↓
useActivityLog(): addActivity('agent_update', message)
    ↓
Activity page updates (if viewing)
```

### Task Status Update Flow

```
User Action: Change Task Status
    ↓
app/tasks/page.tsx: handleStatusChange(taskId, status)
    ↓
useTasks(): updateTaskStatus(id, status)
    ↓
useTasks(): updateTask(id, { status, updatedAt })
    ↓
useLocalStorage(): setValue('mission-tasks', tasks)
    ↓
localStorage.setItem('mission-tasks', JSON.stringify(tasks))
    ↓
Component re-renders with updated task
    ↓
useActivityLog(): addActivity('task_update', message)
    ↓
Activity page updates (if viewing)
```

### Metrics Calculation Flow

```
Dashboard Page Loads
    ↓
useMetrics(agents, tasks) called
    ↓
calculateMetrics() runs
    ↓
    ├─ Count agents: agents.length
    ├─ Count online agents: agents.filter(a => a.status === 'online' || 'busy')
    ├─ Count tasks by status
    ├─ Calculate avg completion time from completed tasks
    └─ Calculate system uptime
    ↓
Return metrics object
    ↓
StatCard components render with metrics
```

---

## 🎛️ State Management

### Architecture Pattern: Custom Hooks + localStorage

The application uses **React custom hooks** to encapsulate state and business logic, combined with **localStorage** for persistence.

### Hook Responsibilities

| Hook | State Managed | Operations |
|------|---------------|------------|
| `useLocalStorage` | Generic key-value pairs | get, set, parse, stringify |
| `useAgents` | Array of Agent objects | add, update, delete, get by ID, update status |
| `useTasks` | Array of Task objects | add, update, delete, get by agent/status/priority, assign, update status/progress |
| `useActivityLog` | Array of Activity objects | add, clear, get recent |
| `useMetrics` | Computed metrics object | calculate from agents/tasks |

### Data Synchronization

All state updates follow this pattern:

```typescript
// 1. User triggers action
function handleAction() {
  // 2. Call hook method
  hook.updateSomething(id, newValue);

  // 3. Hook updates state (triggers re-render)
  // 4. Hook persists to localStorage
  // 5. Hook logs activity
}
```

### State Updates are Immutable

```typescript
// ✅ Correct: Create new array/object
setAgents([...agents, newAgent]);
setTasks(tasks.map(t => t.id === id ? {...t, updates} : t));

// ❌ Incorrect: Mutate directly
agents.push(newAgent);
task.status = 'completed';
```

### Component Re-rendering

- Only components using a hook re-render when that hook's state changes
- Example: Updating a task triggers re-render of Tasks page and Dashboard page
- Activity page re-renders on any activity log update

---

## 🏗️ Design Patterns

### 1. Custom Hook Pattern

Encapsulates business logic and state management in reusable hooks.

**Example:**
```typescript
// lib/hooks/useAgents.ts
export function useAgents() {
  const [agents, setAgents] = useLocalStorage<Agent[]>('mission-agents', INITIAL_AGENTS);

  const addAgent = (agent: Omit<Agent, 'id'>) => {
    const newAgent = { ...agent, id: generateId() };
    setAgents([...agents, newAgent]);
    return newAgent;
  };

  return { agents, addAgent, ... };
}
```

### 2. Component Composition

UI built from small, focused components.

**Example:**
```typescript
<StatCard title="Total Agents" value={agents.length} icon={<Users />} />
<AgentCard agent={agent} onStatusChange={...} />
<TaskCard task={task} agentName={agentName} onStatusChange={...} />
```

### 3. Props Interface Pattern

TypeScript interfaces define component contracts.

**Example:**
```typescript
interface AgentCardProps {
  agent: Agent;
  onStatusChange: (id: string, status: AgentStatus) => void;
  onDelete: (id: string) => void;
}
```

### 4. Controlled Components

Form inputs controlled by React state.

**Example:**
```typescript
<input
  type="text"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

### 5. Derived State

Metrics computed from primary state, not stored separately.

**Example:**
```typescript
// ❌ Don't do this
const [completedTasks, setCompletedTasks] = useState(0);

// ✅ Do this
const completedTasks = tasks.filter(t => t.status === 'completed').length;
```

### 6. Event Handler Propagation

Actions passed down through component tree.

**Example:**
```
Dashboard
  └─ AgentCard
      └─ <button onClick={() => onDelete(agent.id)}>
```

### 7. Modal Pattern

Modal state managed in parent, rendered conditionally.

**Example:**
```typescript
const [showModal, setShowModal] = useState(false);

{showModal && (
  <div className="fixed inset-0 ...">
    <div className="bg-white ...">
      <form onSubmit={handleCreate}>
        ...
      </form>
    </div>
  </div>
)}
```

### 8. Filter Pattern

Filter state drives displayed items.

**Example:**
```typescript
const filteredAgents = agents.filter(agent =>
  agent.name.toLowerCase().includes(searchQuery.toLowerCase())
);
```

### 9. Sort Pattern

Sorted arrays computed with `useMemo`.

**Example:**
```typescript
const sortedTasks = useMemo(() =>
  [...tasks].sort((a, b) => {
    // Sort by priority, then status, then timestamp
  }),
  [tasks]
);
```

### 10. Activity Logging Pattern

All mutations trigger activity log entry.

**Example:**
```typescript
const updateAgent = (id: string, updates: Partial<Agent>) => {
  setAgents(agents.map(a => a.id === id ? {...a, ...updates} : a));
  addActivity('agent_update', `Agent updated`, { agentId: id, updates });
};
```

---

## 🎨 UI/UX Patterns

### Responsive Design

```typescript
// Mobile-first with Tailwind
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Loading States

```typescript
if (loading) return <Spinner />;
if (error) return <Error />;
return <Content />;
```

### Empty States

```typescript
if (agents.length === 0) {
  return <EmptyState message="No agents yet" action={...} />;
}
```

### Confirmations

```typescript
const handleDelete = (id: string) => {
  if (confirm('Are you sure?')) {
    deleteItem(id);
  }
};
```

### Feedback

```typescript
// Visual feedback
<div className="transition-shadow hover:shadow-lg">

// Status indicators
<div className="w-3 h-3 rounded-full bg-green-500">
```

---

## 🔒 Data Validation

### Type Safety

All data structures use TypeScript interfaces.

```typescript
interface Agent {
  id: string;
  name: string;
  status: AgentStatus; // Union type
  role: string;
  lastActive: string; // ISO 8601
  tasksCompleted: number;
  uptime: number;
}
```

### Required Fields

Form validation with HTML `required` attribute.

```typescript
<input type="text" name="name" required />
```

### Status Constraints

Union types prevent invalid values.

```typescript
type AgentStatus = 'online' | 'offline' | 'busy' | 'error';
```

---

## 📊 Performance Considerations

### Memoization

Expensive computations wrapped in `useMemo`.

```typescript
const sortedTasks = useMemo(() => [...tasks].sort(...), [tasks]);
```

### Debouncing

Search could be debounced (not implemented but recommended).

```typescript
const debouncedSearch = useDebounce(searchQuery, 300);
```

### Lazy Loading

Routes are code-split by Next.js automatically.

### localStorage Efficiency

Read once on mount, write on changes.

---

## 🚀 Deployment Architecture

### Local Development

```
Browser → Next.js Dev Server (port 3000)
    ↓
localStorage (Browser)
```

### Production Build

```
Browser → Static Files (Vercel/Netlify/any hosting)
    ↓
localStorage (Browser)
```

### No Backend Required

The application is **completely client-side** and can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting

---

## 🔄 Future Architecture Enhancements

### Potential Backend Integration

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend                              │
└─────────────────────────────────────────────────────────────┘
                         ↓ API
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Next.js API)          │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL/MongoDB)          │
└─────────────────────────────────────────────────────────────┘
```

### Real-time Updates (Optional)

```
WebSocket/Server-Sent Events
    ↓
Live updates across multiple clients
```

---

## 📝 Summary

Mission Control Dashboard follows a **clean, modular architecture**:

- **Component-based**: Reusable UI elements
- **Hook-driven**: Logic encapsulated in custom hooks
- **Type-safe**: Full TypeScript coverage
- **Persistent**: localStorage for data survival
- **Performant**: Efficient re-renders and memoization
- **Scalable**: Easy to extend with new features

The architecture prioritizes **developer experience** (clear patterns, good organization) and **user experience** (fast, responsive, intuitive).

---

**Mission Control Dashboard** - Complete architecture documentation. 🚀
