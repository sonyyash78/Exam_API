import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="glass rounded-2xl p-6 border border-slate-800/80 animate-pulse">
      <div className="h-48 bg-slate-800/50 rounded-xl mb-4"></div>
      <div className="h-6 bg-slate-800/50 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-slate-800/50 rounded w-1/2 mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-800/50 rounded w-1/4"></div>
        <div className="h-8 bg-slate-800/50 rounded w-1/3"></div>
      </div>
    </div>
  );
};

export const QuestionSkeleton = () => {
  return (
    <div className="glass rounded-2xl p-6 border border-slate-800/80 animate-pulse space-y-4">
      <div className="flex justify-between">
        <div className="h-4 bg-slate-800/50 rounded w-1/6"></div>
        <div className="h-4 bg-slate-800/50 rounded w-1/12"></div>
      </div>
      <div className="h-8 bg-slate-800/50 rounded w-full"></div>
      <div className="h-8 bg-slate-800/50 rounded w-5/6"></div>
      <div className="space-y-2 pt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-slate-800/30 rounded-xl border border-slate-800/50 w-full"></div>
        ))}
      </div>
    </div>
  );
};

export const TableSkeleton = () => {
  return (
    <div className="glass rounded-2xl p-6 border border-slate-800/80 animate-pulse space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-slate-800/50 rounded w-1/4"></div>
        <div className="h-10 bg-slate-800/50 rounded w-1/6"></div>
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex justify-between items-center h-12 bg-slate-800/30 rounded-xl px-4">
          <div className="h-4 bg-slate-800/50 rounded w-1/3"></div>
          <div className="h-4 bg-slate-800/50 rounded w-1/6"></div>
          <div className="h-4 bg-slate-800/50 rounded w-12"></div>
        </div>
      ))}
    </div>
  );
};
