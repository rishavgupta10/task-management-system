'use client';

import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/6"></div>
        <div className="h-4 bg-slate-200 rounded w-1/6"></div>
      </div>
      <div className="divide-y divide-slate-100 p-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="py-4 px-4 flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded w-3/5"></div>
              <div className="h-3 bg-slate-100 rounded w-2/5"></div>
            </div>
            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
            <div className="h-6 bg-slate-200 rounded w-16"></div>
            <div className="h-8 bg-slate-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
