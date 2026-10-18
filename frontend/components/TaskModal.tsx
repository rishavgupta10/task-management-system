'use client';

import React, { useState, useEffect } from 'react';
import { Task, CreateTaskPayload, TaskStatus, TaskPriority } from '../types/task';
import { X, Loader2, Sparkles, AlertCircle, AlignLeft, Flag, CheckCircle } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskPayload) => Promise<void>;
  taskToEdit?: Task | null;
}

export function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  taskToEdit,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
    } else {
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setPriority('MEDIUM');
    }
    setValidationError('');
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setValidationError('Title is required and cannot be empty.');
      return;
    }

    if (title.length > 200) {
      setValidationError('Title cannot exceed 200 characters.');
      return;
    }

    try {
      setLoading(true);
      setValidationError('');
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
      });
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save task.');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions: { value: TaskStatus; label: string; desc: string }[] = [
    { value: 'TODO', label: 'To Do', desc: 'Ready to be picked up' },
    { value: 'IN_PROGRESS', label: 'In Progress', desc: 'Currently being worked on' },
    { value: 'DONE', label: 'Done', desc: 'Completed and verified' },
  ];

  const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'LOW', label: 'Low', color: 'border-slate-300 dark:border-slate-600' },
    { value: 'MEDIUM', label: 'Medium', color: 'border-amber-400 dark:border-amber-600' },
    { value: 'HIGH', label: 'High', color: 'border-rose-500 dark:border-rose-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {taskToEdit ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {taskToEdit ? 'Update task properties and progress' : 'Fill in the information below to add a new task'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {validationError && (
            <div className="flex items-start gap-3 p-3.5 text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <span className={`text-xs ${title.length > 200 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                {title.length}/200
              </span>
            </div>
            <input
              type="text"
              required
              disabled={loading}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement user authentication & JWT refresh"
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-xs"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Description <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
            </div>
            <textarea
              rows={3}
              disabled={loading}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key context, requirements, or acceptance criteria..."
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-xs resize-none"
            />
          </div>

          {/* Status Selection Buttons */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Status
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {statusOptions.map((opt) => {
                const isSelected = status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <span className="text-xs font-bold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Flag className="w-3.5 h-3.5 text-slate-400" />
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Priority
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {priorityOptions.map((opt) => {
                const isSelected = priority === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all uppercase tracking-wider ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-95 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
