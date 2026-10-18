'use client';

import React from 'react';
import { ClipboardList, Plus } from 'lucide-react';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onOpenCreate: () => void;
}

export function EmptyState({
  hasFilters,
  onClearFilters,
  onOpenCreate,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
      <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
        <ClipboardList className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">
        {hasFilters ? 'No matching tasks found' : 'No tasks yet'}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
        {hasFilters
          ? 'Try adjusting your search criteria or filter options to find what you are looking for.'
          : 'Get started by creating your very first task to track progress efficiently.'}
      </p>

      {hasFilters ? (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Clear all filters
        </button>
      ) : (
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      )}
    </div>
  );
}
