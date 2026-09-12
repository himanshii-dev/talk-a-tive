import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';
import {
  Sun,
  Moon,
  Sparkles,
  Volume2,
  VolumeX,
  Bell,
  Eye,
  LogOut,
  Sliders,
  Check,
  Shield,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose, onLogout }) => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme, compactMode, setCompactMode } = useTheme();
  const { soundEnabled, toggleSound, requestNotificationPermission } = useNotification();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('appearance');
  const [enterToSend, setEnterToSend] = useState(
    user?.settings?.enterToSend !== false
  );

  const handleNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      toast.success('Desktop notifications enabled');
    } else {
      toast.info('Notification permission was not granted');
    }
  };

  const handleToggleEnterToSend = () => {
    const newVal = !enterToSend;
    setEnterToSend(newVal);
    updateUser({ settings: { ...user?.settings, enterToSend: newVal } });
    toast.success(newVal ? 'Enter to send enabled' : 'Shift+Enter to send enabled');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application Settings"
      description="Personalize your experience, layout, and privacy."
      maxWidth="max-w-xl"
    >
      <div className="flex flex-col sm:flex-row gap-4 min-h-[320px]">
        {/* Settings Navigation Sidebar */}
        <div className="w-full sm:w-44 flex flex-row sm:flex-col gap-1 border-b sm:border-b-0 sm:border-r border-slate-800 pb-3 sm:pb-0 sm:pr-3 overflow-x-auto select-none">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'appearance'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Appearance</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Chat Spacing</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'account'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Account</span>
          </button>
        </div>

        {/* Settings Tab Content */}
        <div className="flex-1 py-1 sm:pl-2 space-y-5">
          {/* Tab: Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <h5 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
                  Theme Preset
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Deep navy/slate contrast' },
                    { id: 'amoled', label: 'AMOLED Mode', icon: Sparkles, desc: 'Pure pitch black #000' },
                    { id: 'light', label: 'Light Mode', icon: Sun, desc: 'Fresh modern SaaS style' },
                    { id: 'focus', label: 'Focus Mode', icon: Eye, desc: 'Distraction-free layout' },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isSelected = theme === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setTheme(mode.id);
                          if (user) {
                            updateUser({ settings: { ...user.settings, theme: mode.id } });
                          }
                          toast.success(`Switched to ${mode.label}`);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <p className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-200'}`}>{mode.label}</p>
                        <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>{mode.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Chat & Spacing */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <h6 className="text-xs font-semibold text-white">Compact Chat Mode</h6>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Reduces message bubble padding and avatar sizes for higher information density.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCompactMode(!compactMode);
                    toast.success(compactMode ? 'Normal spacing active' : 'Compact mode active');
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    compactMode ? 'bg-indigo-600' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      compactMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <h6 className="text-xs font-semibold text-white">Enter to Send</h6>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Pressing Enter will immediately send the message. Use Shift+Enter for new lines.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleEnterToSend}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    enterToSend ? 'bg-indigo-600' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      enterToSend ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Tab: Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-slate-500" />
                  )}
                  <div>
                    <h6 className="text-xs font-semibold text-white">Synthesized Audio Chimes</h6>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Play subtle Web Audio tone on incoming messages.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    toggleSound(!soundEnabled);
                    toast.success(!soundEnabled ? 'Message sound enabled' : 'Message sound muted');
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    soundEnabled ? 'bg-indigo-600' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h6 className="text-xs font-semibold text-white">Browser Desktop Alerts</h6>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Receive alerts when Talk-a-tive is running in the background.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleNotificationPermission}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  Enable
                </button>
              </div>
            </div>
          )}

          {/* Tab: Account & Danger Zone */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account ID:</span>
                  <span className="text-slate-200 font-mono text-[11px]">{user?._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Registered Email:</span>
                  <span className="text-slate-200">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Username:</span>
                  <span className="text-slate-200">@{user?.username}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <h6 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">
                  Session Controls
                </h6>
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out of Talk-a-tive
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
