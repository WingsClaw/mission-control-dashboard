import 'server-only';

import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  AgentStatus,
  OpenClawAssignmentOption,
  OpenClawAgentSnapshot,
  OpenClawBoardMutation,
  OpenClawConfigSummary,
  OpenClawDocumentDetail,
  OpenClawIdentity,
  OpenClawFileSummary,
  OpenClawKanbanBoard,
  OpenClawKanbanLane,
  OpenClawKanbanTask,
  OpenClawOperatingPrinciple,
  OpenClawSchedulerJob,
  OpenClawSnapshot,
  OpenClawTaskSummary,
  OpenClawTeamMember,
  OpenClawUserProfile,
  OpenClawWorkspaceModel,
  Task,
} from '@/lib/types';

type JsonObject = Record<string, unknown>;

interface OpenClawRuntime {
  available: boolean;
  openClawHome: string | null;
  workspaceDir: string | null;
  config: OpenClawConfigSummary | null;
  rawConfig: JsonObject | null;
}

interface OpenClawSessionEntry {
  updatedAt?: number;
  modelProvider?: string;
  model?: string;
  contextTokens?: number;
  skillsSnapshot?: {
    resolvedSkills?: unknown[];
    skills?: unknown[];
  };
  systemPromptReport?: {
    injectedWorkspaceFiles?: Array<{
      missing?: boolean;
    }>;
  };
}

const KANBAN_LANES: OpenClawKanbanBoard['lanes'] = [
  {
    id: 'backlog',
    title: 'Backlog',
    description: 'Tasks discovered but not actively being worked yet.',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    description: 'Active implementation or execution work.',
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Awaiting human approval or verification.',
  },
  {
    id: 'done',
    title: 'Done',
    description: 'Completed tasks with the final state recorded.',
  },
];

const DEFAULT_BOARD: OpenClawKanbanBoard = {
  version: 1,
  updatedAt: new Date().toISOString(),
  lanes: KANBAN_LANES,
  tasks: [],
};

const DEFAULT_IDENTITY: OpenClawIdentity = {
  name: 'OpenClaw',
  creature: null,
  vibe: null,
  emoji: null,
};

const DEFAULT_USER: OpenClawUserProfile = {
  name: 'Operator',
  callName: 'Operator',
  timezone: null,
  notes: null,
};

const KANBAN_FILE_NAME = 'kanban.json';

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function titleCase(value: string) {
  return value
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function defaultProgressForLane(lane: OpenClawKanbanLane) {
  switch (lane) {
    case 'done':
      return 100;
    case 'review':
      return 85;
    case 'in_progress':
      return 40;
    default:
      return 0;
  }
}

function laneFromUnknown(value: unknown): OpenClawKanbanLane {
  if (value === 'backlog' || value === 'in_progress' || value === 'review' || value === 'done') {
    return value;
  }

  if (typeof value === 'string') {
    if (/done|complete|completed|closed/i.test(value)) {
      return 'done';
    }

    if (/review/i.test(value)) {
      return 'review';
    }

    if (/progress|active|doing|running/i.test(value)) {
      return 'in_progress';
    }
  }

  return 'backlog';
}

function parseNamedFields(content: string) {
  const fields: Record<string, string> = {};

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^-\s+\*\*(.+?):\*\*\s*(.*)$/);

    if (!match) {
      continue;
    }

    fields[match[1].trim().toLowerCase()] = match[2].trim();
  }

  return fields;
}

function extractSection(content: string, heading: string) {
  const lines = content.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => line.trim().toLowerCase() === heading.toLowerCase());

  if (startIndex === -1) {
    return '';
  }

  const collected: string[] = [];

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const currentLine = lines[index];

    if (index > startIndex + 1 && currentLine.trim().startsWith('## ')) {
      break;
    }

    collected.push(currentLine);
  }

  return collected.join('\n').trim();
}

function getDocumentTitle(fileName: string, content: string) {
  const heading = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith('# '));

  if (heading) {
    return heading.replace(/^#\s+/, '').trim();
  }

  return titleCase(fileName.replace(/\.md$/i, ''));
}

function getDocumentExcerpt(content: string) {
  const line = content
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .find((entry) => entry && !entry.startsWith('#'));

  return line ? normalizeWhitespace(line).slice(0, 220) : 'No summary available yet.';
}

function summarizeConfig(config: JsonObject | null): OpenClawConfigSummary | null {
  if (!config) {
    return null;
  }

  const agents = (config.agents as JsonObject | undefined)?.defaults as JsonObject | undefined;
  const gateway = config.gateway as JsonObject | undefined;
  const subagents = agents?.subagents as JsonObject | undefined;
  const model = agents?.model as JsonObject | undefined;
  const meta = config.meta as JsonObject | undefined;

  return {
    workspaceDir: typeof agents?.workspace === 'string' ? agents.workspace : null,
    primaryModel: typeof model?.primary === 'string' ? model.primary : null,
    maxConcurrent: typeof agents?.maxConcurrent === 'number' ? agents.maxConcurrent : null,
    subagentConcurrency:
      typeof subagents?.maxConcurrent === 'number' ? subagents.maxConcurrent : null,
    gatewayConfigured: Boolean(gateway),
    gatewayMode: typeof gateway?.mode === 'string' ? gateway.mode : null,
    gatewayBind: typeof gateway?.bind === 'string' ? gateway.bind : null,
    gatewayPort: typeof gateway?.port === 'number' ? gateway.port : null,
    lastTouchedAt: typeof meta?.lastTouchedAt === 'string' ? meta.lastTouchedAt : null,
  };
}

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDirectory(targetPath: string) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function readJsonFile<T>(filePath: string) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function writeJsonFile(filePath: string, value: unknown) {
  await ensureDirectory(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function readTextFile(filePath: string) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

async function toFileSummary(filePath: string, relativePath: string): Promise<OpenClawFileSummary | null> {
  try {
    const stats = await fs.stat(filePath);

    return {
      name: path.basename(filePath),
      relativePath: relativePath.split(path.sep).join('/'),
      updatedAt: stats.mtime.toISOString(),
    };
  } catch {
    return null;
  }
}

function parseIdentity(content: string | null): OpenClawIdentity {
  if (!content) {
    return DEFAULT_IDENTITY;
  }

  const fields = parseNamedFields(content);

  return {
    name: fields.name || DEFAULT_IDENTITY.name,
    creature: fields.creature || null,
    vibe: fields.vibe || null,
    emoji: fields.emoji || null,
  };
}

function parseUser(content: string | null): OpenClawUserProfile {
  if (!content) {
    return DEFAULT_USER;
  }

  const fields = parseNamedFields(content);

  return {
    name: fields.name || DEFAULT_USER.name,
    callName: fields['what to call them'] || fields.name || DEFAULT_USER.callName,
    timezone: fields.timezone || null,
    notes: fields.notes || null,
  };
}

function buildOperatingPrinciples(content: string | null) {
  if (!content) {
    return [] as OpenClawOperatingPrinciple[];
  }

  const section = extractSection(content, '## Core Truths');

  if (!section) {
    return [] as OpenClawOperatingPrinciple[];
  }

  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('**') && line.includes('**'))
    .map((line, index) => {
      const titleMatch = line.match(/^\*\*(.+?)\*\*\.?\s*(.*)$/);

      if (!titleMatch) {
        return null;
      }

      return {
        title: titleMatch[1].trim(),
        body: titleMatch[2].trim() || 'Recorded principle from SOUL.md.',
        source: `soul-${index + 1}`,
      } satisfies OpenClawOperatingPrinciple;
    })
    .filter((principle): principle is OpenClawOperatingPrinciple => principle !== null);
}

function normalizeBoardTask(rawTask: unknown, index: number): OpenClawKanbanTask | null {
  if (!rawTask || typeof rawTask !== 'object') {
    return null;
  }

  const task = rawTask as JsonObject;
  const title = cleanText(task.title || task.name);

  if (!title) {
    return null;
  }

  const lane = laneFromUnknown(task.lane ?? task.columnId ?? task.status ?? task.state);
  const createdAt = cleanText(task.createdAt) || new Date().toISOString();
  const updatedAt = cleanText(task.updatedAt) || createdAt;
  const explicitProgress = typeof task.progress === 'number' ? task.progress : defaultProgressForLane(lane);
  const progress = lane === 'done' ? 100 : clampProgress(explicitProgress);
  const priority = cleanText(task.priority).toLowerCase();

  return {
    id: cleanText(task.id) || `task-${Date.now()}-${index}`,
    title,
    description: cleanText(task.description),
    project: cleanText(task.project || task.epic || task.group) || null,
    lane,
    priority:
      priority === 'critical' || priority === 'high' || priority === 'low' || priority === 'medium'
        ? priority
        : 'medium',
    assignedTo: cleanText(task.assignedTo) || null,
    createdAt,
    updatedAt,
    progress,
  };
}

function normalizeBoard(payload: unknown): OpenClawKanbanBoard {
  if (!payload || typeof payload !== 'object') {
    return { ...DEFAULT_BOARD, lanes: KANBAN_LANES };
  }

  const rawBoard = payload as JsonObject;
  const tasks = Array.isArray(rawBoard.tasks)
    ? rawBoard.tasks
        .map((task, index) => normalizeBoardTask(task, index))
        .filter((task): task is OpenClawKanbanTask => task !== null)
        .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    : [];

  return {
    version: typeof rawBoard.version === 'number' ? rawBoard.version : 1,
    updatedAt: cleanText(rawBoard.updatedAt) || new Date().toISOString(),
    lanes: KANBAN_LANES,
    tasks,
  };
}

async function getOpenClawRuntime(): Promise<OpenClawRuntime> {
  const openClawHome = process.env.OPENCLAW_HOME?.trim() || path.join(os.homedir(), '.openclaw');

  if (!(await pathExists(openClawHome))) {
    return {
      available: false,
      openClawHome: null,
      workspaceDir: null,
      config: null,
      rawConfig: null,
    };
  }

  const rawConfig = await readJsonFile<JsonObject>(path.join(openClawHome, 'openclaw.json'));
  const config = summarizeConfig(rawConfig);
  const workspaceDir = config?.workspaceDir ?? path.join(openClawHome, 'workspace');

  return {
    available: true,
    openClawHome,
    workspaceDir,
    config,
    rawConfig,
  };
}

async function ensureKanbanBoard(workspaceDir: string) {
  const boardPath = path.join(workspaceDir, KANBAN_FILE_NAME);
  const rawBoard = await readJsonFile<unknown>(boardPath);

  if (rawBoard) {
    return {
      board: normalizeBoard(rawBoard),
      created: false,
      boardPath,
    };
  }

  await ensureDirectory(workspaceDir);
  await writeJsonFile(boardPath, DEFAULT_BOARD);

  return {
    board: { ...DEFAULT_BOARD, lanes: KANBAN_LANES },
    created: true,
    boardPath,
  };
}

function buildTaskSummaryFromBoard(board: OpenClawKanbanBoard): OpenClawTaskSummary {
  const completed = board.tasks.filter((task) => task.lane === 'done').length;

  return {
    source: 'kanban',
    total: board.tasks.length,
    completed,
    pending: Math.max(0, board.tasks.length - completed),
    fileName: KANBAN_FILE_NAME,
  };
}

async function getMarkdownDocuments(dirPath: string, prefix = '') {
  if (!(await pathExists(dirPath))) {
    return [] as OpenClawDocumentDetail[];
  }

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const documents = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
      .map(async (entry) => {
        const absolutePath = path.join(dirPath, entry.name);
        const relativePath = path.join(prefix, entry.name).split(path.sep).join('/');
        const content = (await readTextFile(absolutePath)) ?? '';
        const summary = await toFileSummary(absolutePath, relativePath);

        if (!summary) {
          return null;
        }

        return {
          ...summary,
          title: getDocumentTitle(entry.name, content),
          excerpt: getDocumentExcerpt(content),
          content,
        } satisfies OpenClawDocumentDetail;
      }),
  );

  return documents
    .filter((document): document is OpenClawDocumentDetail => document !== null)
    .sort((left, right) => new Date(right.updatedAt ?? 0).getTime() - new Date(left.updatedAt ?? 0).getTime());
}

async function getSchedulerJobs(openClawHome: string) {
  const payload = await readJsonFile<{ jobs?: unknown[] }>(path.join(openClawHome, 'cron', 'jobs.json'));

  if (!Array.isArray(payload?.jobs)) {
    return [] as OpenClawSchedulerJob[];
  }

  return payload.jobs.map((job, index) => {
    const record = (job && typeof job === 'object' ? job : {}) as JsonObject;
    const deliveryContext = (record.deliveryContext as JsonObject | undefined) ?? undefined;

    return {
      id: cleanText(record.id) || cleanText(record.name) || `cron-${index + 1}`,
      name: cleanText(record.name) || `Scheduled job ${index + 1}`,
      schedule: cleanText(record.schedule || record.cron || record.expression) || null,
      enabled: typeof record.enabled === 'boolean' ? record.enabled : true,
      prompt: cleanText(record.prompt || record.message) || null,
      timezone: cleanText(record.timezone) || null,
      nextRunAt: cleanText(record.nextRunAt) || null,
      target: cleanText(deliveryContext?.channel || deliveryContext?.surface || record.target) || null,
    } satisfies OpenClawSchedulerJob;
  });
}

async function getCommandActivity(openClawHome: string) {
  const logPath = path.join(openClawHome, 'logs', 'commands.log');
  const content = await readTextFile(logPath);

  if (!content) {
    return [];
  }

  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-12)
    .reverse()
    .flatMap((line, index) => {
      try {
        const parsed = JSON.parse(line) as JsonObject;
        const timestamp = typeof parsed.timestamp === 'string' ? parsed.timestamp : null;
        const action = typeof parsed.action === 'string' ? parsed.action : 'event';

        if (!timestamp) {
          return [];
        }

        return [
          {
            id: `${timestamp}-${action}-${index}`,
            timestamp,
            action,
            sessionKey: typeof parsed.sessionKey === 'string' ? parsed.sessionKey : null,
            senderId: typeof parsed.senderId === 'string' ? parsed.senderId : null,
            source: typeof parsed.source === 'string' ? parsed.source : null,
          },
        ];
      } catch {
        return [];
      }
    });
}

function heartbeatHasInstructions(content: string | null) {
  if (!content) {
    return false;
  }

  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .some((line) => !line.startsWith('#'));
}

function deriveAgentStatus(lastUpdatedAt: string | null, activeTaskCount: number): AgentStatus {
  if (!lastUpdatedAt) {
    return 'offline';
  }

  const minutes = Math.floor((Date.now() - new Date(lastUpdatedAt).getTime()) / 60000);

  if (minutes > 240) {
    return 'offline';
  }

  if (activeTaskCount > 0) {
    return 'busy';
  }

  return 'online';
}

async function getAgentSnapshots(openClawHome: string, identityName: string, board: OpenClawKanbanBoard) {
  const agentsDir = path.join(openClawHome, 'agents');

  if (!(await pathExists(agentsDir))) {
    return [] as OpenClawAgentSnapshot[];
  }

  const entries = await fs.readdir(agentsDir, { withFileTypes: true });
  const agentSnapshots = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const sessionsPath = path.join(agentsDir, entry.name, 'sessions', 'sessions.json');
        const sessions = (await readJsonFile<Record<string, OpenClawSessionEntry>>(sessionsPath)) ?? {};
        const sessionEntries = Object.values(sessions).sort(
          (left, right) => (right.updatedAt ?? 0) - (left.updatedAt ?? 0),
        );
        const latestSession = sessionEntries[0];
        const lastUpdatedAt = latestSession?.updatedAt ? new Date(latestSession.updatedAt).toISOString() : null;
        const activeTaskCount = board.tasks.filter(
          (task) => task.assignedTo === entry.name && task.lane !== 'done',
        ).length;
        const completedTaskCount = board.tasks.filter(
          (task) => task.assignedTo === entry.name && task.lane === 'done',
        ).length;

        return {
          id: entry.name,
          name: entry.name === 'main' ? identityName : titleCase(entry.name),
          role: entry.name === 'main' ? 'Primary Assistant' : 'OpenClaw Specialist',
          status: deriveAgentStatus(lastUpdatedAt, activeTaskCount),
          sessionCount: sessionEntries.length,
          lastUpdatedAt,
          model:
            latestSession?.modelProvider && latestSession?.model
              ? `${latestSession.modelProvider}/${latestSession.model}`
              : latestSession?.model ?? null,
          contextTokens:
            typeof latestSession?.contextTokens === 'number' ? latestSession.contextTokens : null,
          skillCount: Array.isArray(latestSession?.skillsSnapshot?.resolvedSkills)
            ? latestSession.skillsSnapshot.resolvedSkills.length
            : Array.isArray(latestSession?.skillsSnapshot?.skills)
              ? latestSession.skillsSnapshot.skills.length
              : 0,
          workspaceFileCount: Array.isArray(latestSession?.systemPromptReport?.injectedWorkspaceFiles)
            ? latestSession.systemPromptReport.injectedWorkspaceFiles.filter((file) => !file?.missing)
                .length
            : 0,
          activeTaskCount,
          completedTaskCount,
        } satisfies OpenClawAgentSnapshot;
      }),
  );

  return agentSnapshots.sort(
    (left, right) => new Date(right.lastUpdatedAt ?? 0).getTime() - new Date(left.lastUpdatedAt ?? 0).getTime(),
  );
}

function buildAssignmentOptions(
  agents: OpenClawAgentSnapshot[],
  user: OpenClawUserProfile,
): OpenClawAssignmentOption[] {
  return [
    {
      id: 'human',
      label: `${user.callName} (Human)`,
      kind: 'human' as const,
    },
    ...agents.map(
      (agent) =>
        ({
          id: agent.id,
          label: `${agent.name} (${agent.role})`,
          kind: 'agent' as const,
        }) satisfies OpenClawAssignmentOption,
    ),
  ];
}

function buildTeamMembers(
  agents: OpenClawAgentSnapshot[],
  identity: OpenClawIdentity,
  user: OpenClawUserProfile,
  workspaceDir: string,
) {
  const members: OpenClawTeamMember[] = [
    {
      id: 'human',
      name: user.callName,
      type: 'human',
      role: 'Human Operator',
      location: user.timezone ?? 'Timezone not set',
      status: 'Active owner',
      detail: user.notes ? `Context: ${user.notes}` : 'Primary owner of this OpenClaw workspace.',
    },
    {
      id: 'assistant-main',
      name: identity.name,
      type: 'assistant',
      role: 'Mission Control Lead',
      location: workspaceDir,
      status: 'Primary runtime',
      detail: identity.vibe ? `${identity.vibe}.` : 'Primary OpenClaw identity loaded from workspace files.',
    },
  ];

  for (const agent of agents) {
    members.push({
      id: `agent-${agent.id}`,
      name: agent.name,
      type: 'agent',
      role: agent.role,
      location: agent.model ?? 'Model unavailable',
      status: titleCase(agent.status),
      detail: `${agent.sessionCount} sessions, ${agent.activeTaskCount} active tasks, ${agent.completedTaskCount} completed tasks.`,
    });
  }

  return members;
}

function buildWarnings(
  runtime: OpenClawRuntime,
  boardCreated: boolean,
  board: OpenClawKanbanBoard,
  schedulerJobs: OpenClawSchedulerJob[],
  heartbeatContent: string | null,
  agents: OpenClawAgentSnapshot[],
) {
  const warnings: string[] = [];

  if (!runtime.config) {
    warnings.push('OpenClaw config could not be read, so some runtime fields are unavailable.');
  }

  if (boardCreated) {
    warnings.push('A starter kanban.json file was created in your OpenClaw workspace so Mission Control now has a real writable task surface.');
  }

  if (board.tasks.length === 0) {
    warnings.push('The kanban board is live, but it does not contain tasks yet. Create work from the Tasks screen and it will persist into the OpenClaw workspace.');
  }

  if (schedulerJobs.length === 0) {
    warnings.push('No cron jobs are currently registered. The Calendar screen will stay empty until OpenClaw schedules work.');
  }

  if (heartbeatContent && !heartbeatHasInstructions(heartbeatContent)) {
    warnings.push('HEARTBEAT.md exists, but it currently contains comments only and no active periodic checklist.');
  }

  if (agents.length === 0) {
    warnings.push('No agent session indexes were found under the OpenClaw home directory.');
  }

  return warnings;
}

export function toUiTask(boardTask: OpenClawKanbanTask): Task {
  const status =
    boardTask.lane === 'done'
      ? 'completed'
      : boardTask.lane === 'backlog'
        ? 'pending'
        : 'in_progress';

  return {
    id: boardTask.id,
    title: boardTask.title,
    description: boardTask.description,
    status,
    priority: boardTask.priority,
    assignedTo: boardTask.assignedTo,
    createdAt: boardTask.createdAt,
    updatedAt: boardTask.updatedAt,
    progress: boardTask.progress,
  };
}

export async function getOpenClawWorkspaceModel(): Promise<OpenClawWorkspaceModel> {
  const runtime = await getOpenClawRuntime();

  if (!runtime.available || !runtime.openClawHome || !runtime.workspaceDir) {
    return {
      available: false,
      openClawHome: null,
      workspaceDir: null,
      config: null,
      identity: DEFAULT_IDENTITY,
      user: DEFAULT_USER,
      agents: [],
      assignmentOptions: [{ id: 'human', label: 'Operator (Human)', kind: 'human' }],
      board: { ...DEFAULT_BOARD, lanes: KANBAN_LANES },
      taskSummary: {
        source: 'none',
        total: 0,
        completed: 0,
        pending: 0,
        fileName: null,
      },
      activity: [],
      docs: [],
      memoryEntries: [],
      schedulerJobs: [],
      heartbeatContent: null,
      heartbeatFilePresent: false,
      heartbeatHasInstructions: false,
      operatingPrinciples: [],
      teamMembers: [],
      warnings: ['OpenClaw home was not found. Set OPENCLAW_HOME if your installation lives elsewhere.'],
    };
  }

  const identityContent = await readTextFile(path.join(runtime.workspaceDir, 'IDENTITY.md'));
  const userContent = await readTextFile(path.join(runtime.workspaceDir, 'USER.md'));
  const soulContent = await readTextFile(path.join(runtime.workspaceDir, 'SOUL.md'));
  const heartbeatPath = path.join(runtime.workspaceDir, 'HEARTBEAT.md');
  const heartbeatContent = await readTextFile(heartbeatPath);
  const identity = parseIdentity(identityContent);
  const user = parseUser(userContent);
  const operatingPrinciples = buildOperatingPrinciples(soulContent);
  const { board, created } = await ensureKanbanBoard(runtime.workspaceDir);
  const [agents, activity, docs, memoryEntries, schedulerJobs] = await Promise.all([
    getAgentSnapshots(runtime.openClawHome, identity.name, board),
    getCommandActivity(runtime.openClawHome),
    getMarkdownDocuments(runtime.workspaceDir),
    getMarkdownDocuments(path.join(runtime.workspaceDir, 'memory'), 'memory'),
    getSchedulerJobs(runtime.openClawHome),
  ]);
  const taskSummary = buildTaskSummaryFromBoard(board);
  const warnings = buildWarnings(runtime, created, board, schedulerJobs, heartbeatContent, agents);
  const assignmentOptions = buildAssignmentOptions(agents, user);
  const teamMembers = buildTeamMembers(agents, identity, user, runtime.workspaceDir);

  return {
    available: true,
    openClawHome: runtime.openClawHome,
    workspaceDir: runtime.workspaceDir,
    config: runtime.config,
    identity,
    user,
    agents,
    assignmentOptions,
    board,
    taskSummary,
    activity,
    docs,
    memoryEntries,
    schedulerJobs,
    heartbeatContent,
    heartbeatFilePresent: await pathExists(heartbeatPath),
    heartbeatHasInstructions: heartbeatHasInstructions(heartbeatContent),
    operatingPrinciples,
    teamMembers,
    warnings,
  };
}

export async function getOpenClawSnapshot(): Promise<OpenClawSnapshot> {
  const model = await getOpenClawWorkspaceModel();

  return {
    available: model.available,
    openClawHome: model.openClawHome,
    config: model.config,
    agents: model.agents,
    activity: model.activity.slice(0, 12),
    docs: model.docs.map(({ name, relativePath, updatedAt }) => ({ name, relativePath, updatedAt })),
    memoryFiles: model.memoryEntries.map(({ name, relativePath, updatedAt }) => ({ name, relativePath, updatedAt })),
    cronJobsCount: model.schedulerJobs.length,
    taskSummary: model.taskSummary,
    heartbeatFilePresent: model.heartbeatFilePresent,
    heartbeatHasInstructions: model.heartbeatHasInstructions,
    warnings: model.warnings,
  };
}

export async function mutateOpenClawBoard(mutation: OpenClawBoardMutation) {
  const runtime = await getOpenClawRuntime();

  if (!runtime.available || !runtime.workspaceDir) {
    throw new Error('OpenClaw home was not found.');
  }

  const { board, boardPath } = await ensureKanbanBoard(runtime.workspaceDir);
  const now = new Date().toISOString();

  switch (mutation.type) {
    case 'createTask': {
      const title = cleanText(mutation.task.title);

      if (!title) {
        throw new Error('Task title is required.');
      }

      const lane = laneFromUnknown(mutation.task.lane);
      const nextTask: OpenClawKanbanTask = {
        id: `task-${Date.now()}`,
        title,
        description: cleanText(mutation.task.description),
        project: cleanText(mutation.task.project) || null,
        lane,
        priority: mutation.task.priority,
        assignedTo: cleanText(mutation.task.assignedTo) || null,
        createdAt: now,
        updatedAt: now,
        progress: lane === 'done' ? 100 : defaultProgressForLane(lane),
      };

      const nextBoard: OpenClawKanbanBoard = {
        ...board,
        updatedAt: now,
        tasks: [nextTask, ...board.tasks],
      };

      await writeJsonFile(boardPath, nextBoard);
      return nextBoard;
    }

    case 'updateTask': {
      let taskFound = false;
      const nextBoard: OpenClawKanbanBoard = {
        ...board,
        updatedAt: now,
        tasks: board.tasks.map((task) => {
          if (task.id !== mutation.taskId) {
            return task;
          }

          taskFound = true;

          const lane = mutation.updates.lane ? laneFromUnknown(mutation.updates.lane) : task.lane;
          const nextProgress =
            typeof mutation.updates.progress === 'number'
              ? clampProgress(mutation.updates.progress)
              : lane === 'done'
                ? 100
                : task.progress;

          return {
            ...task,
            title: cleanText(mutation.updates.title) || task.title,
            description:
              mutation.updates.description !== undefined
                ? cleanText(mutation.updates.description)
                : task.description,
            project:
              mutation.updates.project !== undefined
                ? cleanText(mutation.updates.project) || null
                : task.project,
            lane,
            priority: mutation.updates.priority ?? task.priority,
            assignedTo:
              mutation.updates.assignedTo !== undefined
                ? cleanText(mutation.updates.assignedTo) || null
                : task.assignedTo,
            progress: lane === 'done' ? 100 : nextProgress,
            updatedAt: now,
          } satisfies OpenClawKanbanTask;
        }),
      };

      if (!taskFound) {
        throw new Error('Task not found.');
      }

      await writeJsonFile(boardPath, nextBoard);
      return nextBoard;
    }

    case 'deleteTask': {
      const nextTasks = board.tasks.filter((task) => task.id !== mutation.taskId);

      if (nextTasks.length === board.tasks.length) {
        throw new Error('Task not found.');
      }

      const nextBoard: OpenClawKanbanBoard = {
        ...board,
        updatedAt: now,
        tasks: nextTasks,
      };

      await writeJsonFile(boardPath, nextBoard);
      return nextBoard;
    }
  }
}