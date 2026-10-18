'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../lib/api';
import {
  Task,
  PaginationMeta,
  TaskStatus,
  TaskPriority,
  CreateTaskPayload,
} from '../../types/task';
import { useDebounce } from '../../hooks/useDebounce';
import { TaskList } from '../../components/TaskList';
import { TaskFilters } from '../../components/TaskFilters';
import { Pagination } from '../../components/Pagination';
import { TaskModal } from '../../components/TaskModal';
import { TaskDetailModal } from '../../components/TaskDetailModal';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Toast } from '../../components/Toast';
import {
  Plus,
  CheckSquare,
  ListTodo,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export default function TasksPage() {
  // State for list and metadata
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Filters and search state
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const isDebouncing = searchInput !== debouncedSearch;
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [currentPage, setCurrentPage] = useState(1);

  // Async UI status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [taskToView, setTaskToView] = useState<Task | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Reset page to 1 whenever search, status, or priority changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, priorityFilter]);

  // Fetch tasks callback
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTasks({
        search: debouncedSearch,
        status: statusFilter,
        priority: priorityFilter,
        page: currentPage,
        limit: 10,
      });
      setTasks(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks from server.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, priorityFilter, currentPage]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Calculate quick metrics for current view
  const metrics = useMemo(() => {
    const todo = tasks.filter((t) => t.status === 'TODO').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const done = tasks.filter((t) => t.status === 'DONE').length;
    return { todo, inProgress, done, total: meta.total };
  }, [tasks, meta.total]);

  // Create / Update task handler
  const handleSaveTask = async (data: CreateTaskPayload) => {
    if (taskToEdit) {
      await api.updateTask(taskToEdit.id, data);
      showToast('success', 'Task updated successfully!');
    } else {
      await api.createTask(data);
      showToast('success', 'Task created successfully!');
    }
    fetchTasks();
  };

  // Delete task handler
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      setDeleteLoading(true);
      await api.deleteTask(taskToDelete.id);
      showToast('success', 'Task deleted successfully!');
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      fetchTasks();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete task.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setStatusFilter('');
    setPriorityFilter('');
  };

  const hasActiveFilters = Boolean(searchInput || statusFilter || priorityFilter);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                  TaskFlow
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                  Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Production Task Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Metric Cards Banner */}
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
            onClick={() => setStatusFilter(statusFilter === 'TODO' ? '' : 'TODO')}
            className={`p-4 rounded-2xl border shadow-xs flex items-center gap-3.5 cursor-pointer transition-all ${
              statusFilter === 'TODO'
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
            onClick={() => setStatusFilter(statusFilter === 'IN_PROGRESS' ? '' : 'IN_PROGRESS')}
            className={`p-4 rounded-2xl border shadow-xs flex items-center gap-3.5 cursor-pointer transition-all ${
              statusFilter === 'IN_PROGRESS'
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
            onClick={() => setStatusFilter(statusFilter === 'DONE' ? '' : 'DONE')}
            className={`p-4 rounded-2xl border shadow-xs flex items-center gap-3.5 cursor-pointer transition-all ${
              statusFilter === 'DONE'
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

        {/* Filters and Search Bar */}
        <TaskFilters
          search={searchInput}
          onSearchChange={setSearchInput}
          status={statusFilter}
          onStatusChange={setStatusFilter}
          priority={priorityFilter}
          onPriorityChange={setPriorityFilter}
          onReset={handleClearFilters}
          isDebouncing={isDebouncing}
        />

        {/* Dynamic Display: Loading, Error, Empty, or Table */}
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchTasks} />
        ) : tasks.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
            onOpenCreate={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
          />
        ) : (
          <div className="space-y-4">
            <TaskList
              tasks={tasks}
              onView={(task) => {
                setTaskToView(task);
                setIsDetailModalOpen(true);
              }}
              onEdit={(task) => {
                setTaskToEdit(task);
                setIsTaskModalOpen(true);
              }}
              onDelete={(task) => {
                setTaskToDelete(task);
                setIsDeleteModalOpen(true);
              }}
            />

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <Pagination
                meta={meta}
                onPageChange={(p) => setCurrentPage(p)}
              />
            )}
          </div>
        )}
      </main>

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSubmit={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      {/* Task Full Detail View Modal */}
      <TaskDetailModal
        task={taskToView}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setTaskToView(null);
        }}
        onEdit={(task) => {
          setTaskToEdit(task);
          setIsTaskModalOpen(true);
        }}
        onDelete={(task) => {
          setTaskToDelete(task);
          setIsDeleteModalOpen(true);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDeleteTask}
        taskTitle={taskToDelete?.title || ''}
        loading={deleteLoading}
      />

      {/* Toast Feedback */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
