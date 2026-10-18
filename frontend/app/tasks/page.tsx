'use client';

import React, { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { Task, CreateTaskPayload } from '../../types/task';
import { TasksHeader } from '../../components/TasksHeader';
import { TaskMetrics } from '../../components/TaskMetrics';
import { TaskFilters } from '../../components/TaskFilters';
import { TaskList } from '../../components/TaskList';
import { Pagination } from '../../components/Pagination';
import { TaskModal } from '../../components/TaskModal';
import { TaskDetailModal } from '../../components/TaskDetailModal';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Toast } from '../../components/Toast';

export default function TasksPage() {
  const {
    tasks,
    meta,
    metrics,
    searchInput,
    setSearchInput,
    isDebouncing,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    currentPage,
    setCurrentPage,
    initialLoading,
    isFetching,
    error,
    hasActiveFilters,
    fetchTasks,
    saveTask,
    deleteTask,
    clearFilters,
  } = useTasks();

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

  // Create / Update task handler
  const handleSaveTask = async (data: CreateTaskPayload) => {
    try {
      await saveTask(taskToEdit, data);
      showToast('success', taskToEdit ? 'Task updated successfully!' : 'Task created successfully!');
      setIsTaskModalOpen(false);
      setTaskToEdit(null);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save task.');
      throw err;
    }
  };

  // Delete task handler
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      setDeleteLoading(true);
      await deleteTask(taskToDelete.id);
      showToast('success', 'Task deleted successfully!');
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete task.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleMetricClick = (status: typeof statusFilter) => {
    setStatusFilter(statusFilter === status ? '' : status);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      {/* Toast Feedback Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <TasksHeader
        onOpenCreate={() => {
          setTaskToEdit(null);
          setIsTaskModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Metric Cards Banner */}
        <TaskMetrics
          metrics={metrics}
          currentStatus={statusFilter}
          onStatusClick={handleMetricClick}
        />

        {/* Filters and Search Bar */}
        <TaskFilters
          search={searchInput}
          onSearchChange={setSearchInput}
          status={statusFilter}
          onStatusChange={setStatusFilter}
          priority={priorityFilter}
          onPriorityChange={setPriorityFilter}
          onReset={clearFilters}
          isDebouncing={isDebouncing}
        />

        {/* Dynamic Display: Loading, Error, Empty, or Table */}
        {initialLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchTasks} />
        ) : tasks.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            onOpenCreate={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
          />
        ) : (
          <div className={`space-y-4 transition-opacity duration-200 ${isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
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

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSubmit={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      {/* Task Read-Only Detail View Modal */}
      <TaskDetailModal
        task={taskToView}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setTaskToView(null);
        }}
        onEdit={(task) => {
          setIsDetailModalOpen(false);
          setTaskToEdit(task);
          setIsTaskModalOpen(true);
        }}
        onDelete={(task) => {
          setIsDetailModalOpen(false);
          setTaskToDelete(task);
          setIsDeleteModalOpen(true);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        taskTitle={taskToDelete?.title || ''}
        loading={deleteLoading}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDeleteTask}
      />
    </div>
  );
}
