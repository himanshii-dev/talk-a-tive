import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-md' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-700/30 dark:bg-slate-800/60 ${rounded} ${className}`}
    />
  );
};
