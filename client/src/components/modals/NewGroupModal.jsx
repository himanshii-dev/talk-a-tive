import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { userService } from '../../services/userService';
import { groupService } from '../../services/groupService';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';
import {
  Search,
  Users,
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const NewGroupModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const { selectChat, fetchChats } = useChat();
  const toast = useToast();

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await userService.searchUsers(query);
        if (res.success) {
          setSearchResults(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const toggleSelectUser = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers((prev) => prev.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers((prev) => [...prev, user]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    if (selectedUsers.length === 0) {
      toast.error('Please add at least 1 member');
      return;
    }

    try {
      setLoading(true);
      const res = await groupService.createGroup({
        groupName: groupName.trim(),
        groupDescription: groupDescription.trim(),
        users: selectedUsers.map((u) => u._id),
      });

      if (res.success && res.data) {
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}

        toast.success(`Group "${groupName}" created!`);
        await fetchChats();
        selectChat(res.data);
        handleClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create group');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
    setGroupName('');
    setGroupDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? 'New Group Chat — Select Members' : 'New Group Details'}
      description={
        step === 1
          ? 'Pick the teammates or friends you want in this group.'
          : 'Set a name and description for your new group.'
      }
    >
      {step === 1 ? (
        <div className="space-y-4">
          {/* Selected Users Chips */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800 max-h-24 overflow-y-auto">
              {selectedUsers.map((u) => (
                <span
                  key={u._id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 text-xs font-semibold"
                >
                  <span>{u.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleSelectUser(u)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search Member */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people to add..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          {/* Search list */}
          <div className="max-h-56 overflow-y-auto space-y-1">
            {searchResults.map((user) => {
              const isSelected = selectedUsers.some((u) => u._id === user._id);
              return (
                <div
                  key={user._id}
                  onClick={() => toggleSelectUser(user)}
                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar src={user.avatar} name={user.name} size="sm" />
                    <div>
                      <h6 className="text-xs font-semibold text-white">{user.name}</h6>
                      <p className="text-[10px] text-slate-400">@{user.username}</p>
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
            })}
          </div>

          {/* Next Button */}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-400">
              {selectedUsers.length} {selectedUsers.length === 1 ? 'member' : 'members'} selected
            </span>
            <button
              type="button"
              disabled={selectedUsers.length === 0}
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-glow"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Step 2: Group Info */
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Group Name *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Design Systems & Frontend"
              className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="What is this group about?"
              rows={2}
              className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <button
              type="submit"
              disabled={loading || !groupName.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-glow"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Group</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
