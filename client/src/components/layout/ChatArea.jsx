import React from 'react';
import { useChat } from '../../context/ChatContext';
import { ChatHeader } from '../chat/ChatHeader';
import { ConversationSearch } from '../chat/ConversationSearch';
import { MessageList } from '../chat/MessageList';
import { MessageComposer } from '../chat/MessageComposer';
import { MessageSquare, MessageSquarePlus, Users, Sparkles } from 'lucide-react';

export const ChatArea = ({ onBackMobile, onOpenNewChat, onOpenNewGroup }) => {
  const { selectedChat } = useChat();

  if (!selectedChat) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center text-center p-6 bg-slate-950/20 select-none">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-glow mb-4 animate-pulse-subtle">
          <MessageSquare className="w-8 h-8 fill-white/20" />
        </div>
        <h3 className="text-2xl font-bold text-white font-display mb-1">
          Talk<span className="text-indigo-400">-a-</span>tive
        </h3>
        <p className="text-sm font-medium text-indigo-300 mb-1">
          Your conversations start here.
        </p>
        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
          Select a conversation from the sidebar, search for contacts, or create a group to start chatting in real time.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewChat}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all active:scale-95"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Start New Chat
          </button>
          <button
            onClick={onOpenNewGroup}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all active:scale-95"
          >
            <Users className="w-4 h-4" />
            Create Group
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden bg-app transition-colors duration-200">
      <ChatHeader onBackMobile={onBackMobile} />
      <ConversationSearch />
      <MessageList />
      <MessageComposer />
    </div>
  );
};
