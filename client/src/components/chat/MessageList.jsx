import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { MessageBubble } from './MessageBubble';
import { DateSeparator, SystemMessage } from './DateSeparator';
import { TypingIndicator } from './TypingIndicator';
import { Skeleton } from '../ui/Skeleton';
import { ArrowDown, Loader2, Sparkles } from 'lucide-react';

const isDifferentDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return (
    date1.getFullYear() !== date2.getFullYear() ||
    date1.getMonth() !== date2.getMonth() ||
    date1.getDate() !== date2.getDate()
  );
};

export const MessageList = () => {
  const {
    messages,
    loadingMessages,
    loadingOlder,
    hasMore,
    loadOlderMessages,
    selectedChat,
    typingUsers,
  } = useChat();

  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const previousScrollHeightRef = useRef(0);
  const shouldPreserveScrollRef = useRef(false);

  // Scroll to bottom on initial load or new message sent
  useEffect(() => {
    if (!shouldPreserveScrollRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, loadingMessages]);

  // Preserve scroll height when loading older messages upward
  useLayoutEffect(() => {
    if (shouldPreserveScrollRef.current && containerRef.current) {
      const container = containerRef.current;
      const heightDifference = container.scrollHeight - previousScrollHeightRef.current;
      container.scrollTop += heightDifference;
      shouldPreserveScrollRef.current = false;
    }
  }, [messages]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // Show scroll to bottom button if user scrolled up
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 300);

    // Infinite scroll upward: load older messages
    if (scrollTop < 40 && hasMore && !loadingOlder && !loadingMessages) {
      previousScrollHeightRef.current = scrollHeight;
      shouldPreserveScrollRef.current = true;
      loadOlderMessages();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToReply = (replyId) => {
    const el = document.getElementById(`msg-${replyId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-brand-400');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-brand-400');
      }, 1500);
    }
  };

  return (
    <div className="relative flex-1 overflow-hidden flex flex-col">
      {/* Scrollable Message Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-1 sm:px-3 py-4 space-y-1"
      >
        {/* Loading Older Indicator */}
        {loadingOlder && (
          <div className="flex items-center justify-center py-2 text-xs text-slate-400 gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
            <span>Loading older messages...</span>
          </div>
        )}

        {/* Initial Loading Skeletons */}
        {loadingMessages ? (
          <div className="space-y-4 p-4">
            <div className="flex gap-2.5">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-48 h-10 rounded-2xl" />
            </div>
            <div className="flex flex-row-reverse gap-2.5">
              <Skeleton className="w-56 h-12 rounded-2xl" />
            </div>
            <div className="flex gap-2.5">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-64 h-14 rounded-2xl" />
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* Empty Chat State */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>
            <h4 className="text-base font-semibold text-white mb-1 font-display">
              Say hello 👋
            </h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              This is the beginning of your conversation. Send a message, share photos or documents!
            </p>
          </div>
        ) : (
          /* Render Messages Stream with Date Separators */
          messages.map((msg, index) => {
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showDateSeparator =
              index === 0 || isDifferentDay(prevMsg?.createdAt, msg.createdAt);

            return (
              <React.Fragment key={msg._id || index}>
                {showDateSeparator && <DateSeparator date={msg.createdAt} />}

                {msg.messageType === 'system' ? (
                  <SystemMessage content={msg.content} timestamp={msg.createdAt} />
                ) : (
                  <MessageBubble
                    message={msg}
                    isGroup={selectedChat?.isGroupChat}
                    onScrollToReply={handleScrollToReply}
                  />
                )}
              </React.Fragment>
            );
          })
        )}

        {/* Typing indicator at bottom of messages */}
        <TypingIndicator typingUsers={typingUsers} />

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll-to-Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 p-2.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-200 shadow-xl backdrop-blur-md hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
