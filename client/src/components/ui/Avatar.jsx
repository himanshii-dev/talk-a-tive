import React from 'react';

const COLORS = [
  'bg-indigo-600',
  'bg-violet-600',
  'bg-blue-600',
  'bg-emerald-600',
  'bg-rose-600',
  'bg-amber-600',
  'bg-cyan-600',
  'bg-fuchsia-600',
];

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getColorClass = (seed) => {
  if (!seed) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
};

export const Avatar = ({
  src,
  name,
  size = 'md',
  isOnline = false,
  showStatus = false,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-24 h-24 text-2xl',
  };

  const statusSizeClasses = {
    xs: 'w-1.5 h-1.5 ring-1',
    sm: 'w-2 h-2 ring-1',
    md: 'w-2.5 h-2.5 ring-2',
    lg: 'w-3 h-3 ring-2',
    xl: 'w-4 h-4 ring-2',
    '2xl': 'w-5 h-5 ring-2',
  };

  const colorClass = getColorClass(name);
  const initials = getInitials(name);

  return (
    <div className={`relative inline-flex flex-shrink-0 select-none ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover ring-1 ring-white/10 shadow-sm`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}

      <div
        className={`${sizeClasses[size] || sizeClasses.md} ${colorClass} ${
          src ? 'hidden' : 'flex'
        } items-center justify-center rounded-full text-white font-semibold ring-1 ring-white/10 shadow-sm`}
      >
        {initials}
      </div>

      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ${
            statusSizeClasses[size] || statusSizeClasses.md
          } ring-slate-900 ${
            isOnline ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};
