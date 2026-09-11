import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../ui/Avatar';
import { FileAttachmentCard, ImageAttachmentCard } from './FileAttachmentCard';
import { ReactionPicker } from './ReactionPicker';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../../context/ToastContext';
import {
  Check,
  CheckCheck,
  Smile,
  Reply,
  Copy,
  Edit2,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';

const linkify = (text) => {
  if (!text) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80 transition-opacity break-all font-medium text-brand-300"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

export const MessageBubble = ({ message, isGroup, onScrollToReply }) => {
  const { user } = useAuth();
  const { setReplyingTo, setEditingMessage, deleteMessage, toggleReaction } = useChat();
  const toast = useToast();

  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const isSelf = message.sender?._id?.toString() === user?._id?.toString();
  const isDeleted = message.deleted;

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      toast.success('Message copied');
    }
    setShowMenu(false);
  };

  const handleEdit = () => {
    setEditingMessage(message);
    setShowMenu(false);
  };

  const handleDelete = () => {
    deleteMessage(message._id);
    toast.info('Message deleted');
    setShowMenu(false);
  };

  const handleReply = () => {
    setReplyingTo(message);
    setShowMenu(false);
  };

  const handleSelectReaction = (emoji) => {
    toggleReaction(message._id, emoji);
    setShowReactions(false);
  };

  // Group reactions by emoji
  const reactionCounts = (message.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = acc[r.emoji] || { count: 0, hasUser: false };
    acc[r.emoji].count += 1;
    if (r.user?._id?.toString() === user?._id?.toString() || r.user?.toString() === user?._id?.toString()) {
      acc[r.emoji].hasUser = true;
    }
    return acc;
  }, {});

  const renderStatus = () => {
    if (!isSelf || isDeleted) return null;

    const isRead = message.readBy && message.readBy.length > 1;
    const isDelivered = message.deliveredTo && message.deliveredTo.length > 1;

    if (isRead) {
      return <CheckCheck className="w-3.5 h-3.5 text-brand-300 flex-shrink-0" title="Read" />;
    }
    if (isDelivered) {
      return <CheckCheck className="w-3.5 h-3.5 text-indigo-200 flex-shrink-0" title="Delivered" />;
    }
    return <Check className="w-3.5 h-3.5 text-indigo-200 flex-shrink-0" title="Sent" />;
  };

  return (
    <motion.div
      id={`msg-${message._id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative flex gap-2.5 my-1 px-4 ${
        isSelf ? 'flex-row-reverse' : 'flex-row'
      }`}
      onMouseLeave={() => {
        setShowMenu(false);
        setShowReactions(false);
      }}
    >
      {/* Sender Avatar for group other messages */}
      {!isSelf && isGroup && (
        <Avatar
          src={message.sender?.avatar}
          name={message.sender?.name}
          size="sm"
          className="mt-1 flex-shrink-0"
        />
      )}

      {/* Bubble Container */}
      <div className={`relative max-w-[82%] sm:max-w-[70%] flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
        {/* Sender Name in group */}
        {!isSelf && isGroup && (
          <span className="text-[11px] font-semibold text-brand-400 mb-0.5 ml-1 select-none">
            {message.sender?.name}
          </span>
        )}

        {/* Message Bubble Card */}
        <div
          className={`relative rounded-2xl px-4 py-2.5 shadow-sm text-sm break-words ${
            isSelf
              ? 'bg-indigo-600 text-white rounded-tr-sm'
              : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-sm'
          } ${isDeleted ? 'opacity-70 italic' : ''}`}
        >
          {/* Reply Reference Quote Preview */}
          {message.replyTo && (
            <div
              onClick={() => onScrollToReply && onScrollToReply(message.replyTo._id)}
              className={`cursor-pointer rounded-lg p-2 mb-2 text-xs border-l-2 select-none transition-opacity hover:opacity-90 ${
                isSelf
                  ? 'bg-indigo-700/80 border-white text-indigo-100'
                  : 'bg-slate-900/60 border-brand-400 text-slate-300'
              }`}
            >
              <div className="font-semibold text-[11px] mb-0.5">
                {message.replyTo.sender?.name || 'User'}
              </div>
              <p className="truncate text-[11px]">
                {message.replyTo.deleted
                  ? 'This message was deleted'
                  : message.replyTo.content || 'Attachment'}
              </p>
            </div>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && !isDeleted && (
            <div className="mb-2 space-y-2">
              {message.attachments.map((att, idx) =>
                att.fileType?.startsWith('image/') ? (
                  <ImageAttachmentCard key={idx} attachment={att} />
                ) : (
                  <FileAttachmentCard key={idx} attachment={att} isSelf={isSelf} />
                )
              )}
            </div>
          )}

          {/* Message Content */}
          <div className="leading-relaxed">
            {isDeleted ? (
              <span className="italic text-slate-300">This message was deleted</span>
            ) : (
              <span>{linkify(message.content)}</span>
            )}
            {message.edited && !isDeleted && (
              <span className="ml-1 text-[10px] text-slate-400 select-none">
                (edited)
              </span>
            )}
          </div>

          {/* Timestamp and Delivery Receipts */}
          <div
            className={`flex items-center gap-1 justify-end mt-1 text-[10px] select-none ${
              isSelf ? 'text-indigo-200' : 'text-slate-400'
            }`}
          >
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {renderStatus()}
          </div>
        </div>

        {/* Reaction Badges below bubble */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 z-10">
            {Object.entries(reactionCounts).map(([emoji, data]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => toggleReaction(message._id, emoji)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border shadow-sm transition-transform active:scale-95 ${
                  data.hasUser
                    ? 'bg-indigo-600/30 border-indigo-500 text-white'
                    : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{emoji}</span>
                <span className="text-[10px] font-semibold">{data.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hover Actions Toolbar */}
      {!isDeleted && (
        <div
          className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 shadow-lg backdrop-blur-md z-20 ${
            isSelf ? 'right-2 -top-4' : 'left-2 -top-4'
          }`}
        >
          {/* Reaction Button */}
          <div className="relative">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Add reaction"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
              {showReactions && (
                <div className="absolute bottom-8 left-0 z-30">
                  <ReactionPicker
                    onSelect={handleSelectReaction}
                    onClose={() => setShowReactions(false)}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Reply Button */}
          <button
            onClick={handleReply}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reply"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Copy text"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Edit Button (Own only) */}
          {isSelf && (
            <button
              onClick={handleEdit}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Edit message"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete Button (Own only) */}
          {isSelf && (
            <button
              onClick={handleDelete}
              className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors"
              title="Delete message"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
