import React from 'react';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { ArrowLeft, Search, Info, Users, MoreVertical } from 'lucide-react';

const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return 'Offline';
  const date = new Date(lastSeen);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffMinutes < 1) return 'Active just now';
  if (diffMinutes < 60) return `Last seen ${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Last seen ${diffHours}h ago`;
  return `Last seen ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
};

export const ChatHeader = ({ onBackMobile }) => {
  const { user } = useAuth();
  const { selectedChat, isDetailsOpen, setIsDetailsOpen, isSearchingChat, setIsSearchingChat } = useChat();
  const { isUserOnline } = useSocket();

  if (!selectedChat) return null;

  let displayName = '';
  let avatarUrl = '';
  let isOnline = false;
  let statusSubtitle = '';

  if (selectedChat.isGroupChat) {
    displayName = selectedChat.groupName;
    avatarUrl = selectedChat.groupAvatar;
    const memberCount = selectedChat.participants?.length || 0;
    statusSubtitle = `${memberCount} members`;
  } else {
    const otherUser = selectedChat.participants?.find(
      (p) => p._id.toString() !== user?._id.toString()
    );
    displayName = otherUser?.name || 'User';
    avatarUrl = otherUser?.avatar;
    isOnline = otherUser ? isUserOnline(otherUser._id) : false;
    statusSubtitle = isOnline ? 'Online' : formatLastSeen(otherUser?.lastSeen);
  }

  return (
    <div className="h-16 px-4 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md flex items-center justify-between z-10 select-none">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Back Button */}
        <button
          onClick={onBackMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div
          className="flex items-center gap-3 cursor-pointer min-w-0"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
        >
          <Avatar
            src={avatarUrl}
            name={displayName}
            size="md"
            isOnline={isOnline}
            showStatus={!selectedChat.isGroupChat}
          />

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate font-display">
              {displayName}
            </h3>
            <p
              className={`text-xs truncate font-medium flex items-center gap-1.5 ${
                isOnline ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {isOnline && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              {statusSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setIsSearchingChat(!isSearchingChat)}
          className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors ${
            isSearchingChat ? 'bg-indigo-600/20 text-indigo-300' : ''
          }`}
          title="Search in conversation"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors ${
            isDetailsOpen ? 'bg-indigo-600/20 text-indigo-300' : ''
          }`}
          title="Conversation details"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
