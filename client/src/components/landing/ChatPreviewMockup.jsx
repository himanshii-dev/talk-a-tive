import React from 'react';
import { motion } from 'framer-motion';
import { CheckCheck, Heart, Flame, Paperclip, Send, Smile } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

export const ChatPreviewMockup = () => {
  return (
    <div className="relative mx-auto max-w-2xl w-full">
      {/* Background Glow */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-2xl animate-pulse-subtle" />

      {/* Main Glass Card */}
      <div className="relative rounded-2xl border border-slate-700/60 bg-slate-900/90 shadow-2xl backdrop-blur-xl overflow-hidden text-slate-100">
        {/* Mockup Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-3.5 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <Avatar
              name="Talkative Dev Team"
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80"
              size="md"
              isOnline={true}
              showStatus={true}
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-white">Talkative Dev Team</h4>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-medium px-1.5 py-0.5 rounded">Group</span>
              </div>
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Rahul, Priya & 3 others active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Live Sync
          </div>
        </div>

        {/* Mockup Message Stream */}
        <div className="p-5 space-y-4 min-h-[300px] flex flex-col justify-end">
          {/* Message 1: Priya */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-start gap-2.5 max-w-[80%]"
          >
            <Avatar
              name="Priya Patel"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
              size="sm"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-slate-300">Priya</span>
                <span className="text-[10px] text-slate-500">10:42 AM</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-sm px-3.5 py-2 text-sm text-slate-100 shadow-sm">
                The real-time websocket latency is under 15ms. The UI animations look so fluid! 🔥
              </div>
            </div>
          </motion.div>

          {/* Message 2: Self (Rahul) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col items-end self-end max-w-[80%]"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-slate-500">10:43 AM</span>
              <span className="text-xs font-medium text-brand-300">You</span>
            </div>
            <div className="relative group bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm shadow-md">
              <div className="text-xs text-indigo-200 border-l-2 border-white/50 pl-2 mb-1.5 opacity-80">
                Replying to Priya
              </div>
              All features are complete: typing indicators, group admin roles, invite links, and AMOLED mode! 🚀
              <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-indigo-200">
                <span>10:43 AM</span>
                <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />
              </div>

              {/* Reaction Badge */}
              <div className="absolute -bottom-2.5 right-2 flex items-center gap-1 bg-slate-900/90 border border-slate-700 px-1.5 py-0.5 rounded-full text-xs shadow-sm">
                <span>❤️</span>
                <span className="text-[10px] font-semibold text-slate-300">2</span>
              </div>
            </div>
          </motion.div>

          {/* Typing indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="flex items-center gap-2 text-xs text-slate-400 italic pt-2"
          >
            <div className="flex items-center gap-1 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/40">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Aman is typing...</span>
          </motion.div>
        </div>

        {/* Mockup Composer */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <button className="p-1.5 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <Smile className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-300">
            Type your message...
          </div>
          <button className="p-2 rounded-xl bg-indigo-600 text-white shadow-glow hover:bg-indigo-500 transition-colors">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
