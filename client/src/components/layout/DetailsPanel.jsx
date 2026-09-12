import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { groupService } from '../../services/groupService';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import {
  X,
  Users,
  Image as ImageIcon,
  FileText,
  UserPlus,
  Shield,
  LogOut,
  Ban,
  Link,
  Copy,
  Check,
  Crown,
} from 'lucide-react';

export const DetailsPanel = ({ onOpenAddMembers, onOpenGroupSettings }) => {
  const { user } = useAuth();
  const { selectedChat, isDetailsOpen, setIsDetailsOpen, messages, selectChat, fetchChats } = useChat();
  const { isUserOnline } = useSocket();
  const toast = useToast();

  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'media'

  if (!isDetailsOpen || !selectedChat) return null;

  const isGroup = selectedChat.isGroupChat;
  const otherUser = !isGroup
    ? selectedChat.participants?.find((p) => p._id.toString() !== user?._id.toString())
    : null;

  const isAdmin = isGroup && selectedChat.admins?.some(
    (a) => a._id?.toString() === user?._id?.toString() || a.toString() === user?._id?.toString()
  );

  const isUserBlocked = !isGroup && otherUser && user?.blockedUsers?.some(
    (bId) => bId === otherUser._id || bId?._id === otherUser._id
  );

  // Extract shared media from current messages
  const sharedImages = messages
    .flatMap((m) => m.attachments || [])
    .filter((a) => a.fileType?.startsWith('image/'));

  const sharedDocuments = messages
    .flatMap((m) => m.attachments || [])
    .filter((a) => !a.fileType?.startsWith('image/'));

  const handleCopyInviteLink = () => {
    if (selectedChat.inviteToken) {
      const inviteUrl = `${window.location.origin}/invite/${selectedChat.inviteToken}`;
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      toast.success('Group invite link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      toast.info('No invite link generated yet.');
    }
  };

  const handleToggleBlock = async () => {
    if (!otherUser) return;
    try {
      if (isUserBlocked) {
        await userService.unblockUser(otherUser._id);
        toast.success(`Unblocked ${otherUser.name}`);
      } else {
        await userService.blockUser(otherUser._id);
        toast.success(`Blocked ${otherUser.name}`);
      }
      window.location.reload(); // Refresh block status state
    } catch (err) {
      toast.error('Could not update block status');
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await groupService.removeMember(selectedChat._id, user._id);
      toast.info('You left the group');
      selectChat(null);
      fetchChats();
    } catch (err) {
      toast.error('Could not leave group');
    }
  };

  return (
    <div className="w-80 h-full border-l border-subtle bg-sidebar backdrop-blur-md flex flex-col z-20 overflow-hidden transition-colors duration-200">
      {/* Header */}
      <div className="h-16 px-4 border-b border-subtle flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white font-display">
          {isGroup ? 'Group Information' : 'Contact Information'}
        </h3>
        <button
          onClick={() => setIsDetailsOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Profile Card */}
        <div className="flex flex-col items-center text-center">
          <Avatar
            src={isGroup ? selectedChat.groupAvatar : otherUser?.avatar}
            name={isGroup ? selectedChat.groupName : otherUser?.name}
            size="2xl"
            isOnline={!isGroup && otherUser ? isUserOnline(otherUser._id) : false}
            showStatus={!isGroup}
          />
          <h4 className="text-base font-bold text-white mt-3 font-display">
            {isGroup ? selectedChat.groupName : otherUser?.name}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {isGroup ? `${selectedChat.participants?.length || 0} members` : `@${otherUser?.username}`}
          </p>

          {/* Status or Bio */}
          <div className="mt-3 w-full p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">
              {isGroup ? 'Description' : 'About'}
            </span>
            <p className="italic">
              {isGroup
                ? selectedChat.groupDescription || 'No group description set.'
                : otherUser?.bio || 'Hey there! I am using Talk-a-tive.'}
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'info'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isGroup ? 'Members' : 'Overview'}
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'media'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Media ({sharedImages.length + sharedDocuments.length})
          </button>
        </div>

        {/* Tab 1: Info & Members */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            {/* Group Members List */}
            {isGroup && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase text-slate-400">
                    Participants
                  </span>
                  {isAdmin && (
                    <button
                      onClick={onOpenAddMembers}
                      className="text-xs font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Add Member
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {selectedChat.participants?.map((member) => {
                    const isMemberAdmin = selectedChat.admins?.some(
                      (a) => a._id?.toString() === member._id.toString() || a.toString() === member._id.toString()
                    );
                    const isOnline = isUserOnline(member._id);

                    return (
                      <div
                        key={member._id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 border border-slate-800/60"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar
                            src={member.avatar}
                            name={member.name}
                            size="sm"
                            isOnline={isOnline}
                            showStatus={true}
                          />
                          <div className="truncate">
                            <p className="text-xs font-semibold text-white truncate">
                              {member.name} {member._id === user._id && '(You)'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">@{member.username}</p>
                          </div>
                        </div>

                        {isMemberAdmin && (
                          <span className="flex items-center gap-1 text-[10px] bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded font-medium border border-amber-500/20">
                            <Crown className="w-2.5 h-2.5" />
                            Admin
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Group Invite Link */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <span className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                    Invite Link
                  </span>
                  <button
                    onClick={handleCopyInviteLink}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Invite Link Copied!' : 'Copy Group Invite Link'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Actions: Block / Leave Group */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              {isGroup ? (
                <button
                  onClick={handleLeaveGroup}
                  className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Leave Group
                </button>
              ) : (
                <button
                  onClick={handleToggleBlock}
                  className={`w-full flex items-center justify-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-colors ${
                    isUserBlocked
                      ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/60'
                      : 'bg-rose-950/40 border-rose-800/40 text-rose-300 hover:bg-rose-900/60'
                  }`}
                >
                  <Ban className="w-4 h-4" />
                  {isUserBlocked ? 'Unblock User' : 'Block User'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Shared Media & Documents */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400 block mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                Photos ({sharedImages.length})
              </span>
              {sharedImages.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2">No photos shared yet.</p>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {sharedImages.map((img, i) => (
                    <a
                      key={i}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-lg overflow-hidden border border-slate-800 hover:opacity-80 transition-opacity"
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold uppercase text-slate-400 block mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Documents ({sharedDocuments.length})
              </span>
              {sharedDocuments.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2">No documents shared yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {sharedDocuments.map((doc, i) => (
                    <a
                      key={i}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 truncate"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="truncate">{doc.fileName}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
