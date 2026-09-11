import React from 'react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Image, FileText, CheckCheck, Check } from 'lucide-react';

const formatTimestamp = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffInHours < 48 && date.getDate() === now.getDate() - 1) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const ChatListItem = ({ chat, isSelected, onClick, typingUsers = [] }) => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();

  // Determine chat name, avatar, and online status
  let displayName = '';
  let avatarUrl = '';
  let isOnline = false;

  if (chat.isGroupChat) {
    displayName = chat.groupName;
    avatarUrl = chat.groupAvatar;
  } else {
    const otherUser = chat.participants?.find(
      (p) => p._id.toString() !== user?._id.toString()
    );
    displayName = otherUser?.name || 'User';
    avatarUrl = otherUser?.avatar;
    isOnline = otherUser ? isUserOnline(otherUser._id) : false;
  }

  const isTyping = typingUsers.length > 0;
  const latest = chat.latestMessage;

  const renderPreview = () => {
    if (isTyping) {
      return (
        <span className="text-brand-400 font-medium italic flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          {typingUsers[0]?.userName || 'Someone'} is typing...
        </span>
      );
    }

    if (!latest) {
      return <span className="text-slate-500 italic">No messages yet</span>;
    }

    if (latest.deleted) {
      return <span className="text-slate-500 italic">Message was deleted</span>;
    }

    if (latest.messageType === 'system') {
      return <span className="text-slate-400 italic">{latest.content}</span>;
    }

    if (latest.messageType === 'image' || (latest.attachments && latest.attachments[0]?.fileType?.startsWith('image/'))) {
      return (
        <span className="flex items-center gap-1 text-slate-300">
          <Image className="w-3.5 h-3.5 text-slate-400" />
          Photo
        </span>
      );
    }

    if (latest.messageType === 'file' || (latest.attachments && latest.attachments.length > 0)) {
      return (
        <span className="flex items-center gap-1 text-slate-300">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          {latest.attachments[0]?.fileName || 'File'}
        </span>
      );
    }

    return latest.content || '';
  };

  const isSelf = latest?.sender?._id?.toString() === user?._id?.toString();

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 select-none ${
        isSelected
          ? 'bg-indigo-600/15 border border-indigo-500/30 text-white shadow-sm'
          : 'hover:bg-slate-800/50 text-slate-300 border border-transparent'
      }`}
    >
      <Avatar
        src={avatarUrl}
        name={displayName}
        size="md"
        isOnline={isOnline}
        showStatus={!chat.isGroupChat}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <h4
            className={`text-sm truncate font-semibold ${
              isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
            }`}
          >
            {displayName}
          </h4>
          <span className="text-[11px] text-slate-400 font-medium flex-shrink-0">
            {formatTimestamp(latest?.createdAt || chat.updatedAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-slate-400 truncate flex items-center gap-1">
            {isSelf && !isTyping && !latest?.deleted && (
              latest?.readBy?.length > 1 ? (
                <CheckCheck className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
              ) : latest?.deliveredTo?.length > 1 ? (
                <CheckCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              ) : (
                <Check className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              )
            )}
            <span className="truncate">{renderPreview()}</span>
          </div>

          {chat.unreadCount > 0 && !isSelected && (
            <Badge variant="primary" className="flex-shrink-0 shadow-glow">
              {chat.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
