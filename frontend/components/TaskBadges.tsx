import React from 'react';
import { TaskStatus, TaskPriority } from '../types/task';
import { Circle, Clock, CheckCircle2, AlertOctagon, AlertTriangle, ArrowDown } from 'lucide-react';

export function StatusBadge({ status }: { status: TaskStatus }) {
  const configs: Record<
    TaskStatus,
    { bg: string; text: string; border: string; dot: string; label: string; icon: any }
  > = {
    TODO: {
      bg: 'bg-slate-500/10 dark:bg-slate-400/10',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700/60',
      dot: 'bg-slate-400',
      label: 'To Do',
      icon: Circle,
    },
    IN_PROGRESS: {
      bg: 'bg-blue-500/10 dark:bg-blue-400/10',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800/60',
      dot: 'bg-blue-500 animate-pulse',
      label: 'In Progress',
      icon: Clock,
    },
    DONE: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      dot: 'bg-emerald-500',
      label: 'Done',
      icon: CheckCircle2,
    },
  };

  const current = configs[status] || configs.TODO;
  const IconComponent = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-xs transition-transform duration-150 hover:scale-105 select-none ${current.bg} ${current.text} ${current.border}`}
    >
      <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{current.label}</span>
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const configs: Record<
    TaskPriority,
    { bg: string; text: string; border: string; label: string; icon: any }
  > = {
    LOW: {
      bg: 'bg-slate-100 dark:bg-slate-800/80',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-700/60',
      label: 'Low',
      icon: ArrowDown,
    },
    MEDIUM: {
      bg: 'bg-amber-500/10 dark:bg-amber-400/10',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/60',
      label: 'Medium',
      icon: AlertTriangle,
    },
    HIGH: {
      bg: 'bg-rose-500/10 dark:bg-rose-400/10',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-800/60',
      label: 'High',
      icon: AlertOctagon,
    },
  };

  const current = configs[priority] || configs.MEDIUM;
  const IconComponent = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide border uppercase shadow-xs transition-transform duration-150 hover:scale-105 select-none ${current.bg} ${current.text} ${current.border}`}
    >
      <IconComponent className="w-3 h-3 flex-shrink-0" />
      <span>{current.label}</span>
    </span>
  );
}
