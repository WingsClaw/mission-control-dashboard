'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Gauge, Loader2, Plus, Search, Trash2, UserRound } from 'lucide-react';

import { Modal } from '@/components/Modal';
import {
  OpenClawAssignmentOption,
  OpenClawBoardMutation,
  OpenClawKanbanBoard,
  OpenClawKanbanLane,
  OpenClawKanbanTask,
} from '@/lib/types';
import { cn, formatRelativeTime, titleCaseLabel } from '@/lib/utils';

interface OpenClawTaskBoardProps {
  initialBoard: OpenClawKanbanBoard;
  assignmentOptions: OpenClawAssignmentOption[];
}

interface BoardTaskCardProps {
  task: OpenClawKanbanTask;
  assigneeLabel: string;
  saving: boolean;
  onDelete: (taskId: string) => Promise<void>;
  onUpdate: (
    taskId: string,
    updates: Partial<Pick<OpenClawKanbanTask, 'project' | 'lane' | 'priority' | 'assignedTo' | 'progress'>>,
  ) => Promise<void>;
  assignmentOptions: OpenClawAssignmentOption[];
}

function priorityClasses(priority: OpenClawKanbanTask['priority']) {
  return {
    low: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    medium: 'border-sky-200 bg-sky-50 text-sky-800',
    high: 'border-amber-200 bg-amber-50 text-amber-800',
    critical: 'border-rose-200 bg-rose-50 text-rose-800',
  }[priority];
}

function laneClasses(lane: OpenClawKanbanLane) {
  return {
    backlog: 'border-slate-200 bg-slate-100 text-slate-700',
    in_progress: 'border-sky-200 bg-sky-50 text-sky-800',
    review: 'border-amber-200 bg-amber-50 text-amber-800',
    done: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  }[lane];
}

function BoardTaskCard({
  task,
  assigneeLabel,
  saving,
  onDelete,
  onUpdate,
  assignmentOptions,
}: BoardTaskCardProps) {
  const [draftProject, setDraftProject] = useState(task.project ?? '');

  useEffect(() => {
    setDraftProject(task.project ?? '');
  }, [task.project]);

  return (
    <article className={cn('surface-panel overflow-hidden p-5 transition', saving && 'opacity-60')}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('status-chip border', priorityClasses(task.priority))}>
              {titleCaseLabel(task.priority)}
            </span>
            <span className={cn('status-chip border', laneClasses(task.lane))}>{titleCaseLabel(task.lane)}</span>
          </div>

          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-950">{task.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {task.description || 'No description provided for this task yet.'}
            </p>
            {task.project ? <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{task.project}</p> : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void onDelete(task.id)}
          disabled={saving}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 rounded-[22px] border border-slate-200/80 bg-slate-50/90 p-4">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          <span className="inline-flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Progress
          </span>
          <span>{task.progress}%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-slate-950 transition-all" style={{ width: `${task.progress}%` }} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[0, 25, 50, 75, 100].map((progress) => (
            <button
              key={progress}
              type="button"
              onClick={() => void onUpdate(task.id, { progress, lane: progress === 100 ? 'done' : task.lane })}
              disabled={saving}
              className={cn(
                'inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed',
                task.progress === progress
                  ? 'bg-slate-950 text-white shadow-[0_14px_28px_-20px_rgba(15,23,42,0.85)]'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950',
              )}
            >
              {progress}%
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-slate-200/70 pt-4 lg:grid-cols-4">
        <label className="block lg:col-span-4">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Project</span>
          <input
            type="text"
            value={draftProject}
            onChange={(event) => setDraftProject(event.target.value)}
            onBlur={() => {
              if ((task.project ?? '') !== draftProject) {
                void onUpdate(task.id, { project: draftProject });
              }
            }}
            disabled={saving}
            placeholder="General Operations"
            className="field-input rounded-xl py-2.5 disabled:cursor-not-allowed"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Lane</span>
          <select
            value={task.lane}
            onChange={(event) => void onUpdate(task.id, { lane: event.target.value as OpenClawKanbanLane })}
            disabled={saving}
            className="field-input rounded-xl py-2.5 disabled:cursor-not-allowed"
          >
            <option value="backlog">Backlog</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Priority</span>
          <select
            value={task.priority}
            onChange={(event) =>
              void onUpdate(task.id, { priority: event.target.value as OpenClawKanbanTask['priority'] })
            }
            disabled={saving}
            className="field-input rounded-xl py-2.5 disabled:cursor-not-allowed"
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Assignee</span>
          <select
            value={task.assignedTo ?? ''}
            onChange={(event) => void onUpdate(task.id, { assignedTo: event.target.value || null })}
            disabled={saving}
            className="field-input rounded-xl py-2.5 disabled:cursor-not-allowed"
          >
            <option value="">Unassigned</option>
            {assignmentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
        <UserRound className="h-4 w-4 text-slate-400" />
        <span>{assigneeLabel}</span>
        <span className="text-slate-300">·</span>
        <span>Updated {formatRelativeTime(task.updatedAt)}</span>
      </div>
    </article>
  );
}

export function OpenClawTaskBoard({ initialBoard, assignmentOptions }: OpenClawTaskBoardProps) {
  const [board, setBoard] = useState(initialBoard);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const assignmentMap = useMemo(
    () =>
      Object.fromEntries(
        assignmentOptions.map((option) => [option.id, option.label]),
      ) as Record<string, string>,
    [assignmentOptions],
  );

  const filteredTasks = useMemo(() => {
    const query = searchQuery.toLowerCase();

    if (!query) {
      return board.tasks;
    }

    return board.tasks.filter((task) => {
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        (assignmentMap[task.assignedTo ?? ''] ?? '').toLowerCase().includes(query)
      );
    });
  }, [assignmentMap, board.tasks, searchQuery]);

  const tasksByLane = useMemo(
    () =>
      Object.fromEntries(
        board.lanes.map((lane) => [
          lane.id,
          filteredTasks
            .filter((task) => task.lane === lane.id)
            .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()),
        ]),
      ) as Record<OpenClawKanbanLane, OpenClawKanbanTask[]>,
    [board.lanes, filteredTasks],
  );

  async function applyMutation(mutation: OpenClawBoardMutation) {
    const response = await fetch('/api/openclaw/board', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mutation),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(payload?.message || 'Unable to update the live task board.');
    }

    const payload = (await response.json()) as { board: OpenClawKanbanBoard };
    setBoard(payload.board);
  }

  async function handleUpdate(
    taskId: string,
    updates: Partial<Pick<OpenClawKanbanTask, 'project' | 'lane' | 'priority' | 'assignedTo' | 'progress'>>,
  ) {
    setSavingTaskId(taskId);
    setErrorMessage(null);

    try {
      await applyMutation({
        type: 'updateTask',
        taskId,
        updates,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update the task.');
    } finally {
      setSavingTaskId(null);
    }
  }

  async function handleDelete(taskId: string) {
    setSavingTaskId(taskId);
    setErrorMessage(null);

    try {
      await applyMutation({
        type: 'deleteTask',
        taskId,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to delete the task.');
    } finally {
      setSavingTaskId(null);
    }
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get('title') ?? '').trim();

    if (!title) {
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);

    try {
      await applyMutation({
        type: 'createTask',
        task: {
          title,
          description: String(formData.get('description') ?? '').trim(),
          project: String(formData.get('project') ?? '').trim() || null,
          lane: formData.get('lane') as OpenClawKanbanLane,
          priority: formData.get('priority') as OpenClawKanbanTask['priority'],
          assignedTo: String(formData.get('assignedTo') ?? '').trim() || null,
        },
      });

      setShowModal(false);
      event.currentTarget.reset();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create the task.');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <>
      <section className="glass-panel p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by task title, description, or assignee"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="field-input pl-11"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              {board.lanes.map((lane) => (
                <div key={lane.id} className="rounded-2xl border border-slate-200/80 bg-white/85 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{lane.title}</p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">{tasksByLane[lane.id].length}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{lane.description}</p>
                </div>
              ))}
            </div>
          </div>

          <button type="button" onClick={() => setShowModal(true)} className="action-button-primary gap-2 self-start xl:self-auto">
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">
            {errorMessage}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {board.lanes.map((lane) => (
          <div key={lane.id} className="glass-panel p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{lane.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{lane.description}</p>
              </div>
              <span className="status-chip border border-slate-200 bg-white text-slate-700">{tasksByLane[lane.id].length}</span>
            </div>

            <div className="space-y-4">
              {tasksByLane[lane.id].length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-slate-300 bg-white/70 px-4 py-8 text-center text-sm leading-6 text-slate-500">
                  No tasks in {lane.title.toLowerCase()}.
                </div>
              ) : (
                tasksByLane[lane.id].map((task) => (
                  <BoardTaskCard
                    key={task.id}
                    task={task}
                    assigneeLabel={assignmentMap[task.assignedTo ?? ''] ?? 'Unassigned'}
                    saving={savingTaskId === task.id || isCreating}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                    assignmentOptions={assignmentOptions}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </section>

      <Modal
        open={showModal}
        title="Create a live task"
        description="This writes directly into the OpenClaw workspace kanban.json file, so the board becomes the real source of truth for Mission Control."
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={handleCreateTask} className="space-y-5">
          <div>
            <label htmlFor="title" className="field-label">
              Title
            </label>
            <input type="text" id="title" name="title" required placeholder="Enter the mission task title" className="field-input" />
          </div>

          <div>
            <label htmlFor="description" className="field-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Capture enough context so the assignee can act without another ping."
              className="field-input resize-y"
            />
          </div>

          <div>
            <label htmlFor="project" className="field-label">
              Project
            </label>
            <input
              type="text"
              id="project"
              name="project"
              placeholder="e.g. Mission Control, Content Ops, Client Work"
              className="field-input"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="lane" className="field-label">
                Lane
              </label>
              <select id="lane" name="lane" defaultValue="backlog" className="field-input">
                <option value="backlog">Backlog</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="field-label">
                Priority
              </label>
              <select id="priority" name="priority" defaultValue="medium" className="field-input">
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label htmlFor="assignedTo" className="field-label">
                Assign To
              </label>
              <select id="assignedTo" name="assignedTo" className="field-input">
                <option value="">Unassigned</option>
                {assignmentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200/70 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setShowModal(false)} className="action-button" disabled={isCreating}>
              Cancel
            </button>
            <button type="submit" className="action-button-primary gap-2" disabled={isCreating}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create Task
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}