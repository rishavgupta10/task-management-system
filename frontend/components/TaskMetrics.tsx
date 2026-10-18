'use client';

import React from 'react';
import { TaskStatus } from '../types/task';
import { TrendingUp, ListTodo, Clock, CheckCircle2 } from 'lucide-react';

interface TaskMetricsProps {
  metrics: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  };
  currentStatus: TaskStatus | '';
  onStatusClick: (status: TaskStatus) => void;
}

export function TaskMetrics({ metrics, currentStatus, onStatusClick }: TaskMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total Tasks
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {metrics.total}
          </span>
        </div>
      </div>

      <div
        onClick={() => onStatusClick('TODO')}
        className={`p-4 rounded-2xl border shadow-xs flex items-center gap-3.5 cursor-pointer transition-all ${
          currentStatus === 'TODO'
            ? 'bg-slate-100 dark:bg-slate-800 border-slate-400'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
          <ListTodo className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            To Do
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {metrics.todo}
          </span>
        </div>
      </div>

      <div
        onClick={() => onStatusClick('IN_PROGRESS')}
        className={`p-4 rounded-2xl border shadow-xs flex items-center gap-3.5 cursor-pointer transition-all ${
          currentStatus === 'IN_PROGRESS'
            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-blue-200'
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            In Progress
          </span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {metrics.inProgress}
          </span>
        </div>
      </div>

      <div
        onClick={() => onStatusClick('DONE')}
        className={`p-4 rounded-2xl border shadow-xs flex items-center gap-3.5 cursor-pointer transition-all ${
          currentStatus === 'DONE'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-200'
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Completed
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {metrics.done}
          </span>
        </div>
      </div>
    </div>
  );
}
