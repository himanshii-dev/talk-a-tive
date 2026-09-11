import React, { useState, useMemo } from 'react';
import { ChatListItem } from './ChatListItem';
import { Skeleton } from '../ui/Skeleton';
import { useChat } from '../../context/ChatContext';
import { Search, MessageSquarePlus, Users, Sparkles } from 'lucide-react';

export const ChatList = ({ onOpenNewChat, onOpenNewGroup }) => {
  const { chats, selectedChat, selectChat, loadingChats, typingUsers } = useChat();
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'unread' | 'groups'
  const [searchFilter, setSearchFilter] = useState('');

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      // Tab filter
      if (filterTab === 'unread' && (!chat.unreadCount || chat.unreadCount === 0)) {
        return false;
      }
      if (filterTab === 'groups' && !chat.isGroupChat) {
        return false;
      }

      // Keyword filter
      if (!searchFilter.trim()) return true;

      const q = searchFilter.toLowerCase();
      if (chat.isGroupChat) {
        return chat.groupName?.toLowerCase().includes(q);
      }
      return chat.participants?.some((p) =>
        p.name?.toLowerCase().includes(q) || p.username?.toLowerCase().includes(q)
      );
    });
  }, [chats, filterTab, searchFilter]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search Filter in list */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter conversations..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-2.5">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterTab('unread')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              filterTab === 'unread'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Unread
            {chats.some((c) => c.unreadCount > 0) && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
          <button
            onClick={() => setFilterTab('groups')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'groups'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Chat List Stream */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loadingChats ? (
          <div className="space-y-3 p-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="w-28 h-3.5" />
                  <Skeleton className="w-40 h-2.5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">
              {filterTab === 'unread'
                ? "You're all caught up"
                : filterTab === 'groups'
                ? 'No groups found'
                : searchFilter
                ? 'No matches found'
                : 'Start your first conversation'}
            </h4>
            <p className="text-xs text-slate-400 max-w-[200px] mb-4">
              {filterTab === 'unread'
                ? 'No unread messages right now.'
                : 'Connect with friends or create a new team group.'}
            </p>
            {filterTab !== 'unread' && !searchFilter && (
              <div className="flex gap-2">
                <button
                  onClick={onOpenNewChat}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-colors"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  New Chat
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatListItem
              key={chat._id}
              chat={chat}
              isSelected={selectedChat?._id === chat._id}
              onClick={() => selectChat(chat)}
              typingUsers={typingUsers}
            />
          ))
        )}
      </div>
    </div>
  );
};
