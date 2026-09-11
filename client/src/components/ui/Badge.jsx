import React from 'react';

export const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variantClasses = {
    primary: 'bg-brand-500 text-white',
    secondary: 'bg-slate-700/60 text-slate-200',
    outline: 'border border-brand-400/30 text-brand-300',
    success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    danger: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold text-xs rounded-full px-2 py-0.5 ${variantClasses[variant] || variantClasses.primary} ${className}`}
    >
      {children}
    </span>
  );
};

export const Skeleton = ({ className = '', rounded = 'rounded-md' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-700/30 dark:bg-slate-800/60 ${rounded} ${className}`}
    />
  );
};
