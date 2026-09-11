import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { Avatar } from '../ui/Avatar';
import { ChatList } from '../chat/ChatList';
import {
  MessageSquare,
  Search,
  MessageSquarePlus,
  Users,
  Bell,
  Settings,
  Sun,
  Moon,
  Sparkles,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';

export const Sidebar = ({
  onOpenNewChat,
  onOpenNewGroup,
  onOpenProfile,
  onOpenSettings,
  onOpenNotifications,
  onOpenGlobalSearch,
  onLogout,
}) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { unreadCount } = useNotification();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('amoled');
    else if (theme === 'amoled') setTheme('light');
    else if (theme === 'light') setTheme('focus');
    else setTheme('dark');
  };

  return (
    <aside className="w-80 sm:w-88 md:w-80 lg:w-88 h-full flex flex-col border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-xl z-20 flex-shrink-0 select-none">
      {/* Top Header */}
      <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-glow">
            <MessageSquare className="w-4 h-4 fill-white/20" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white font-display">
            Talk<span className="text-indigo-400">-a-</span>tive
          </span>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1">
          {/* New Chat */}
          <button
            onClick={onOpenNewChat}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Start new conversation"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>

          {/* New Group */}
          <button
            onClick={onOpenNewGroup}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Create new group"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={onOpenNotifications}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Global Search Button (Ctrl+K) */}
      <div className="px-3 pt-3">
        <button
          onClick={onOpenGlobalSearch}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-slate-300 transition-colors shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search users or messages...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Chats Stream Container */}
      <div className="flex-1 overflow-hidden">
        <ChatList
          onOpenNewChat={onOpenNewChat}
          onOpenNewGroup={onOpenNewGroup}
        />
      </div>

      {/* Bottom Profile & Settings Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 relative">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer min-w-0 p-1 rounded-xl hover:bg-slate-900/80 transition-colors flex-1 mr-2"
            onClick={onOpenProfile}
          >
            <Avatar
              src={user?.avatar}
              name={user?.name}
              size="sm"
              isOnline={true}
              showStatus={true}
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {user?.name || 'User'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                @{user?.username || 'user'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Theme Cycle Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={`Current Theme: ${theme.toUpperCase()} (Click to change)`}
            >
              {theme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : theme === 'amoled' ? (
                <Sparkles className="w-4 h-4 text-purple-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>

            {/* Settings Modal Trigger */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
