import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { userService } from '../../services/userService';
import { chatService } from '../../services/chatService';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { Search, Loader2, MessageSquare, ArrowRight, User } from 'lucide-react';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { chats, selectChat, fetchChats } = useChat();
  const { isUserOnline } = useSocket();
  const toast = useToast();

  useEffect(() => {
    if (!query.trim()) {
      setUserResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await userService.searchUsers(query);
        if (res.success) {
          setUserResults(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectUser = async (targetUser) => {
    try {
      setLoading(true);
      const res = await chatService.accessChat(targetUser._id);
      if (res.success && res.data) {
        await fetchChats();
        selectChat(res.data);
        onClose();
      }
    } catch (err) {
      toast.error('Could not access chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExistingChat = (chat) => {
    selectChat(chat);
    onClose();
  };

  // Filter existing active chats locally
  const matchingChats = query.trim()
    ? chats.filter((c) => {
        const q = query.toLowerCase();
        if (c.isGroupChat) return c.groupName?.toLowerCase().includes(q);
        return c.participants?.some((p) => p.name?.toLowerCase().includes(q));
      })
    : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Command Palette & Search"
      description="Quickly jump to a conversation or search for users."
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users or conversations..."
            className="w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-6 text-xs text-slate-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
              <span>Searching...</span>
            </div>
          )}

          {/* Existing Chats Section */}
          {matchingChats.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
                Existing Conversations
              </span>
              <div className="space-y-1">
                {matchingChats.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => handleSelectExistingChat(c)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      <span className="font-semibold text-white">
                        {c.isGroupChat
                          ? c.groupName
                          : c.participants?.map((p) => p.name).join(', ')}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Results Section */}
          {userResults.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
                Global Users
              </span>
              <div className="space-y-1">
                {userResults.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => handleSelectUser(u)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 hover:bg-slate-800 border border-slate-800 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        src={u.avatar}
                        name={u.name}
                        size="sm"
                        isOnline={isUserOnline(u._id)}
                        showStatus={true}
                      />
                      <div>
                        <p className="text-xs font-semibold text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-400">@{u.username}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30"
                    >
                      Chat
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && !query && (
            <p className="text-center py-6 text-xs text-slate-500">
              Type to search conversations and teammates
            </p>
          )}

          {!loading && query && matchingChats.length === 0 && userResults.length === 0 && (
            <p className="text-center py-6 text-xs text-slate-500">
              No results found for "{query}"
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
