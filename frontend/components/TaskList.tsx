'use client';

import React from 'react';
import { Task } from '../types/task';
import { StatusBadge, PriorityBadge } from './TaskBadges';
import { Pencil, Trash2, Calendar, Eye, ArrowRight } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskList({ tasks, onView, onEdit, onDelete }: TaskListProps) {
  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-4 sm:px-6">Task</th>
              <th className="py-4 px-4 w-36">Status</th>
              <th className="py-4 px-4 w-32">Priority</th>
              <th className="py-4 px-4 w-36 hidden md:table-cell">Created</th>
              <th className="py-4 px-4 sm:px-6 w-36 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm text-slate-700 dark:text-slate-300">
            {tasks.map((task) => (
              <tr
                key={task.id}
                onClick={() => onView(task)}
                className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
              >
                <td className="py-4 px-4 sm:px-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                        <span className="truncate">{task.title}</span>
                      </div>
                      {task.description && (
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-1 max-w-xl">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <StatusBadge status={task.status} />
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 hidden md:table-cell font-mono">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    {formatDate(task.createdAt)}
                  </span>
                </td>
                <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                  <div
                    className="inline-flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onView(task)}
                      title="View task details"
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(task)}
                      title="Edit task"
                      className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(task)}
                      title="Delete task"
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
