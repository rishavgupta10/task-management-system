import React from 'react';
import { TaskStatus, TaskPriority } from '../types/task';

export function StatusBadge({ status }: { status: TaskStatus }) {
  const styles: Record<TaskStatus, { bg: string; dot: string; label: string }> = {
    TODO: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
      label: 'To Do',
    },
    IN_PROGRESS: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500 animate-pulse',
      label: 'In Progress',
    },
    DONE: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Done',
    },
  };

  const current = styles[status] || styles.TODO;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const styles: Record<TaskPriority, { bg: string; label: string }> = {
    LOW: {
      bg: 'bg-gray-100 text-gray-700 border-gray-200',
      label: 'Low',
    },
    MEDIUM: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Medium',
    },
    HIGH: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      label: 'High',
    },
  };

  const current = styles[priority] || styles.MEDIUM;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${current.bg}`}
    >
      {current.label}
    </span>
  );
}
