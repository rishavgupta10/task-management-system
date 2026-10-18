'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { api } from '../lib/api';
import { Task, PaginationMeta, TaskStatus, TaskPriority, CreateTaskPayload } from '../types/task';
import { useDebounce } from './useDebounce';

export function useTasks() {
  // Tasks and metadata state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Filter and search state
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const isDebouncing = searchInput !== debouncedSearch;

  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [currentPage, setCurrentPage] = useState(1);

  // Status flags
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, priorityFilter]);

  // Fetch tasks callback
  const fetchTasks = useCallback(async () => {
    try {
      setIsFetching(true);
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
      setIsFetching(false);
      setInitialLoading(false);
    }
  }, [debouncedSearch, statusFilter, priorityFilter, currentPage]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Derived metrics
  const metrics = useMemo(() => {
    const todo = tasks.filter((t) => t.status === 'TODO').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const done = tasks.filter((t) => t.status === 'DONE').length;
    return { todo, inProgress, done, total: meta.total };
  }, [tasks, meta.total]);

  // Create / Update task
  const saveTask = useCallback(
    async (taskToEdit: Task | null, payload: CreateTaskPayload) => {
      if (taskToEdit) {
        await api.updateTask(taskToEdit.id, {
          ...payload,
          expectedUpdatedAt: taskToEdit.updatedAt,
        });
      } else {
        await api.createTask(payload);
      }
      await fetchTasks();
    },
    [fetchTasks]
  );

  // Delete task
  const deleteTask = useCallback(
    async (taskId: string) => {
      await api.deleteTask(taskId);
      await fetchTasks();
    },
    [fetchTasks]
  );

  const clearFilters = useCallback(() => {
    setSearchInput('');
    setStatusFilter('');
    setPriorityFilter('');
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = Boolean(searchInput || statusFilter || priorityFilter);

  return {
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
  };
}
