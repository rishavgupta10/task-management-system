'use client';

import React from 'react';
import { Task } from '../types/task';
import { StatusBadge, PriorityBadge } from './TaskBadges';
import { Pencil, Trash2, Calendar } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskList({ tasks, onEdit, onDelete }: TaskListProps) {
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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Title & Description</th>
              <th className="py-3.5 px-4 w-32">Status</th>
              <th className="py-3.5 px-4 w-28">Priority</th>
              <th className="py-3.5 px-4 w-36 hidden md:table-cell">Created</th>
              <th className="py-3.5 px-4 sm:px-6 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="py-4 px-4 sm:px-6">
                  <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-slate-500 text-xs mt-1 line-clamp-2 max-w-xl">
                      {task.description}
                    </div>
                  )}
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <StatusBadge status={task.status} />
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-500 hidden md:table-cell">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(task.createdAt)}
                  </span>
                </td>
                <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                  <div className="inline-flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(task)}
                      title="Edit task"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(task)}
                      title="Delete task"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
