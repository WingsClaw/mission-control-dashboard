# OpenClaw Integration

This dashboard started as a local mock board. It now uses a thin-layer OpenClaw integration instead of introducing a second database.

## Recommended Data Sources

- Config summary: OpenClaw home config file, sanitized on the server only.
- Agent activity: agent session indexes under the local OpenClaw home.
- Mission feed: commands.log.
- Scheduler: cron/jobs.json.
- Workspace docs: markdown files in the OpenClaw workspace root.
- Memory: markdown files in the OpenClaw workspace memory folder.
- Tasks: prefer kanban.json or TASKS.md when they exist.

## What Was Added Here

- A server-only OpenClaw reader in lib/server/openclaw.ts.
- A safe JSON route at app/api/openclaw/snapshot/route.ts.
- A writable board route at app/api/openclaw/board/route.ts.
- Real page integrations for dashboard, agents, tasks, activity, calendar, docs, memory, team, and office.
- Real page integrations for dashboard, agents, tasks, projects, activity, calendar, docs, memory, team, and office.
- A live system screen at app/live/page.tsx for raw runtime inspection.

## Current Data Model

- Config summary: sanitized on the server only.
- Agents: derived from OpenClaw session indexes.
- Activity: sourced from commands.log.
- Scheduler: sourced from cron/jobs.json.
- Heartbeat: sourced from HEARTBEAT.md.
- Documents: loaded from workspace markdown files.
- Memory: loaded from workspace memory markdown files.
- Tasks: read from and written to workspace kanban.json.

## Task Source Of Truth

Mission Control writes task changes into the OpenClaw workspace `kanban.json` file. That keeps the board explicit, inspectable, and local to the workspace instead of inventing a separate app database.

## Pages Using Live Data

- /
- /agents
- /tasks
- /projects
- /activity
- /calendar
- /docs
- /memory
- /team
- /office
- /live

## Important Safety Rule

Never expose the raw OpenClaw config to the browser. It can contain tokens, bot credentials, and other secrets.