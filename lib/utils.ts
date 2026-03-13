import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestamp));
}

export function formatDuration(minutes: number) {
  const safeMinutes = Math.max(0, Math.round(minutes));

  if (safeMinutes < 60) {
    return `${safeMinutes}m`;
  }

  const hours = Math.floor(safeMinutes / 60);
  const remainder = safeMinutes % 60;

  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
}

export function formatDateTime(timestamp: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export function titleCaseLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}