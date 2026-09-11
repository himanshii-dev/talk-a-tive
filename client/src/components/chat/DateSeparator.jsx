import React from 'react';

export const formatDateSeparator = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  // Reset hours to compare calendar days
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - target) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export const DateSeparator = ({ date }) => {
  return (
    <div className="flex items-center justify-center my-4 select-none">
      <div className="h-[1px] bg-slate-800 flex-1 max-w-[120px]" />
      <span className="mx-3 text-[11px] font-semibold text-slate-400 bg-slate-900/80 border border-slate-800/80 px-3 py-0.5 rounded-full backdrop-blur-sm">
        {formatDateSeparator(date)}
      </span>
      <div className="h-[1px] bg-slate-800 flex-1 max-w-[120px]" />
    </div>
  );
};

export const SystemMessage = ({ content, timestamp }) => {
  return (
    <div className="flex items-center justify-center my-2 text-center select-none px-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/40 text-slate-400 text-xs font-medium">
        <span>{content}</span>
        {timestamp && (
          <span className="text-[10px] text-slate-500">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
};
