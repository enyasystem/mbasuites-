import React from 'react';

export default function SiteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-5xl p-6">
        <div className="animate-pulse">
          <div className="h-64 md:h-80 lg:h-96 bg-slate-200 rounded-lg overflow-hidden shadow" />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-20 bg-slate-200 rounded" />
            </div>
            <div className="space-y-3">
              <div className="h-6 bg-slate-200 rounded w-2/3" />
              <div className="h-20 bg-slate-200 rounded" />
            </div>
            <div className="space-y-3">
              <div className="h-6 bg-slate-200 rounded w-1/2" />
              <div className="h-20 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-40 bg-slate-200 rounded" />
            <div className="h-40 bg-slate-200 rounded" />
            <div className="h-40 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
