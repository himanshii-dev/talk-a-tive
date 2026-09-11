import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Users2,
  Activity,
  CheckCheck,
  FileUp,
  BellRing,
  Moon,
  Search,
} from 'lucide-react';

const FEATURES = [
  {
    icon: MessageCircle,
    title: 'Instant Messaging',
    description:
      'Lightning-fast messaging built on direct Socket.IO connection rooms with automatic offline sync and history retrieval.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: Users2,
    title: 'Advanced Group Chats',
    description:
      'Create multi-user teams, assign administrators, share invite links, and orchestrate communications with full role control.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Activity,
    title: 'Live Typing & Presence',
    description:
      'Subtly debounced typing indicators showing who is currently replying, paired with real-time online status and last-seen timestamps.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: CheckCheck,
    title: 'Delivery & Read Receipts',
    description:
      'Granular message states: Sent (✓), Delivered (✓✓), and Read (✓✓ in vibrant accent color), tracked per conversation.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: FileUp,
    title: 'Rich Media & Files',
    description:
      'Share photos with instant lightbox previews, plus PDFs and documents with file size and direct download capabilities.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: BellRing,
    title: 'Smart Notifications',
    description:
      'Interactive dropdown alert drawer with unread badges, synthesized audio chimes, and optional desktop browser alerts.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
  {
    icon: Moon,
    title: 'AMOLED & Focus Modes',
    description:
      'Carefully calibrated light, dark, and true-black AMOLED modes, plus a distraction-free Focus Mode designed for deep work.',
    color: 'text-indigo-300',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: Search,
    title: 'Command Palette & Search',
    description:
      'Quick jump anywhere with Ctrl+K command palette, find users by username, and search messages inside any chat instantly.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">
            Engineered For Excellence
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            Everything you expect from modern chat, perfected.
          </h3>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Engineered with a high-throughput Node.js + Socket.IO backend and a responsive React frontend.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all duration-200"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center ${feature.color} mb-4 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2 font-display">
                  {feature.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
