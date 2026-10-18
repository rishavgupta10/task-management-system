'use client';

import React from 'react';
import { Task } from '../types/task';
import { StatusBadge, PriorityBadge } from './TaskBadges';
import { X, Calendar, Clock, Hash, CheckSquare, Pencil, Trash2 } from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: TaskDetailModalProps) {
  if (!isOpen || !task) return null;

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" />
                Task Details
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate max-w-[280px] sm:max-w-sm">
                {task.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {task.title}
            </h3>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">
                Status
              </span>
              <StatusBadge status={task.status} />
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
            <div>
              <span className="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">
                Priority
              </span>
              <PriorityBadge priority={task.priority} />
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Description
            </h4>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[90px]">
              {task.description ? (
                task.description
              ) : (
                <span className="italic text-slate-400 dark:text-slate-500">
                  No description provided for this task.
                </span>
              )}
            </div>
          </div>

          {/* Metadata timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>Created: {formatDate(task.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>Last updated: {formatDate(task.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              onClose();
              onDelete(task);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all active:scale-95"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
