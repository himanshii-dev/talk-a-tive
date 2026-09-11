import React from 'react';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { useNotification } from '../../context/NotificationContext';
import { useChat } from '../../context/ChatContext';
import { Bell, CheckCheck, Trash2, Sparkles } from 'lucide-react';

export const NotificationDrawerModal = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotification();
  const { chats, selectChat } = useChat();

  const handleNotificationClick = (notif) => {
    markAsRead(notif._id);
    if (notif.chat) {
      const targetChatId = notif.chat._id || notif.chat;
      const foundChat = chats.find((c) => c._id === targetChatId);
      if (foundChat) {
        selectChat(foundChat);
      }
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notifications"
      description={`You have ${unreadCount} unread ${unreadCount === 1 ? 'alert' : 'alerts'}.`}
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={notifications.length === 0}
            className="flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-medium disabled:opacity-40"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 font-medium disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear all
          </button>
        </div>

        {/* Stream */}
        <div className="max-h-72 overflow-y-auto space-y-1.5">
          {notifications.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
              <Bell className="w-8 h-8 opacity-40 mb-2 text-slate-400" />
              <span>You're all caught up!</span>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  !n.isRead
                    ? 'bg-indigo-600/10 border-indigo-500/30 hover:bg-indigo-600/15'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80'
                }`}
              >
                <Avatar
                  src={n.sender?.avatar}
                  name={n.sender?.name || 'Alert'}
                  size="sm"
                  className="mt-0.5"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-200 leading-snug">
                    {n.content}
                  </p>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {new Date(n.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
