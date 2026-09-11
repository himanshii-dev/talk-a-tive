import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useNavigate } from 'react-router-dom';

import { Sidebar } from '../components/layout/Sidebar';
import { ChatArea } from '../components/layout/ChatArea';
import { DetailsPanel } from '../components/layout/DetailsPanel';

import { NewChatModal } from '../components/modals/NewChatModal';
import { NewGroupModal } from '../components/modals/NewGroupModal';
import { AddMembersModal } from '../components/modals/AddMembersModal';
import { ProfileModal } from '../components/modals/ProfileModal';
import { SettingsModal } from '../components/modals/SettingsModal';
import { NotificationDrawerModal } from '../components/modals/NotificationDrawerModal';
import { GlobalSearchModal } from '../components/modals/GlobalSearchModal';
import { Modal } from '../components/ui/Modal';
import { Loader2, LogOut } from 'lucide-react';

export const ChatPage = () => {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { selectedChat, selectChat } = useChat();
  const navigate = useNavigate();

  // Modals state
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Authentication guard
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [loading, isAuthenticated, navigate]);

  // Global Keyboard Shortcut: Ctrl/Cmd + K opens search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleConfirmLogout = async () => {
    await logout();
    setIsLogoutConfirmOpen(false);
    navigate('/');
  };

  if (loading || !user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400 mb-3" />
        <p className="text-xs text-slate-400 font-medium tracking-wide">
          Connecting to Talk-a-tive...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-950 text-slate-100">
      {/* 1. Left Column: Sidebar (Hidden on mobile when chat is open) */}
      <div
        className={`${
          selectedChat ? 'hidden md:flex' : 'flex'
        } w-full md:w-auto h-full flex-shrink-0`}
      >
        <Sidebar
          onOpenNewChat={() => setIsNewChatOpen(true)}
          onOpenNewGroup={() => setIsNewGroupOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
          onLogout={() => setIsLogoutConfirmOpen(true)}
        />
      </div>

      {/* 2. Middle Column: Chat Conversation Area (Hidden on mobile when no chat is selected) */}
      <div
        className={`${
          !selectedChat ? 'hidden md:flex' : 'flex'
        } flex-1 h-full min-w-0 flex-col`}
      >
        <ChatArea
          onBackMobile={() => selectChat(null)}
          onOpenNewChat={() => setIsNewChatOpen(true)}
          onOpenNewGroup={() => setIsNewGroupOpen(true)}
        />
      </div>

      {/* 3. Right Column: Details/Info Panel */}
      <DetailsPanel
        onOpenAddMembers={() => setIsAddMembersOpen(true)}
        onOpenGroupSettings={() => {}}
      />

      {/* Application Modals */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
      />

      <NewGroupModal
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
      />

      <AddMembersModal
        isOpen={isAddMembersOpen}
        onClose={() => setIsAddMembersOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onLogout={() => {
          setIsSettingsOpen(false);
          setIsLogoutConfirmOpen(true);
        }}
      />

      <NotificationDrawerModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
      />

      {/* Logout Confirmation Dialog */}
      <Modal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        title="Confirm Sign Out"
        description="Are you sure you want to sign out of your Talk-a-tive account?"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-300">
            You will need to sign in again to send messages and receive real-time notifications.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsLogoutConfirmOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
