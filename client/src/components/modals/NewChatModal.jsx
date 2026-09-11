import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { userService } from '../../services/userService';
import { chatService } from '../../services/chatService';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { Search, Loader2, MessageSquare, UserPlus } from 'lucide-react';

export const NewChatModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { selectChat, fetchChats } = useChat();
  const { isUserOnline } = useSocket();
  const toast = useToast();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await userService.searchUsers(query);
        if (res.success) {
          setResults(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleStartChat = async (user) => {
    try {
      setLoading(true);
      const chatRes = await chatService.accessChat(user._id);
      if (chatRes.success && chatRes.data) {
        await fetchChats();
        selectChat(chatRes.data);
        toast.success(`Chat started with ${user.name}`);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start New Conversation"
      description="Search users by name, username, or email."
    >
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a username or name..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            autoFocus
          />
        </div>

        {/* Results Stream */}
        <div className="min-h-[160px] max-h-64 overflow-y-auto space-y-1.5">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-slate-400 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
              <span>Searching users...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-xs text-center">
              <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
              <span>{query ? 'No matching users found' : 'Type above to search for people'}</span>
            </div>
          ) : (
            results.map((target) => (
              <div
                key={target._id}
                onClick={() => handleStartChat(target)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={target.avatar}
                    name={target.name}
                    size="md"
                    isOnline={isUserOnline(target._id)}
                    showStatus={true}
                  />
                  <div>
                    <h5 className="text-sm font-semibold text-white leading-tight">
                      {target.name}
                    </h5>
                    <p className="text-xs text-slate-400">@{target.username}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Chat
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
