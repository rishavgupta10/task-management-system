'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../../lib/api';
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
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Toast } from '../../components/Toast';
import { Plus, CheckSquare } from 'lucide-react';

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
  const debouncedSearch = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [currentPage, setCurrentPage] = useState(1);

  // Async UI status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                TaskFlow
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Production Task Management
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all shadow-indigo-100 hover:shadow-indigo-200 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Filters and Search Bar */}
        <TaskFilters
          search={searchInput}
          onSearchChange={setSearchInput}
          status={statusFilter}
          onStatusChange={setStatusFilter}
          priority={priorityFilter}
          onPriorityChange={setPriorityFilter}
          onReset={handleClearFilters}
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
