import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { userService } from '../../services/userService';
import { groupService } from '../../services/groupService';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../../context/ToastContext';
import { Search, Check, Loader2, UserPlus } from 'lucide-react';

export const AddMembersModal = ({ isOpen, onClose }) => {
  const { selectedChat, fetchChats, selectChat } = useChat();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await userService.searchUsers(query);
        if (res.success) {
          // Filter out users already in the group
          const existingIds = new Set(selectedChat?.participants?.map((p) => p._id));
          setResults(res.data.filter((u) => !existingIds.has(u._id)));
        }
      } catch (err) {
        console.error(err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, selectedChat]);

  const toggleUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAdd = async () => {
    if (selectedUserIds.length === 0) return;

    try {
      setLoading(true);
      const res = await groupService.addMembers(selectedChat._id, selectedUserIds);
      if (res.success && res.data) {
        toast.success('Members added to group');
        await fetchChats();
        selectChat(res.data);
        handleClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setSelectedUserIds([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Add Members to ${selectedChat?.groupName || 'Group'}`}
      description="Search and select new members to add."
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            autoFocus
          />
        </div>

        <div className="max-h-56 overflow-y-auto space-y-1">
          {results.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-500">
              {query ? 'No new eligible users found' : 'Type to search users'}
            </p>
          ) : (
            results.map((u) => {
              const isSelected = selectedUserIds.includes(u._id);
              return (
                <div
                  key={u._id}
                  onClick={() => toggleUser(u._id)}
                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar src={u.avatar} name={u.name} size="sm" />
                    <div>
                      <h6 className="text-xs font-semibold text-white">{u.name}</h6>
                      <p className="text-[10px] text-slate-400">@{u.username}</p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'border-slate-600 bg-slate-800/60'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            {selectedUserIds.length} selected
          </span>
          <button
            type="button"
            disabled={selectedUserIds.length === 0 || loading}
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-glow transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
            <span>Add Selected</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
