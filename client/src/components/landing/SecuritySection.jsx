import React from 'react';
import { Shield, KeyRound, UserCheck, Lock } from 'lucide-react';

export const SecuritySection = () => {
  return (
    <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
              <Shield className="w-3.5 h-3.5" />
              <span>Enterprise-Grade Security Architecture</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-snug">
              Privacy, security, and access control by design.
            </h3>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              Talk-a-tive is designed from the ground up to protect user identity, conversation integrity, and private media.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Cryptographic Password Hashing</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Salted Bcrypt password hashing with zero plaintext credentials stored or transmitted.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Signed JWT Authentication</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Stateless JWT session tokens verified at both HTTP route handlers and real-time Socket.IO handshakes.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0 mt-0.5">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Server-Side Authorization & Blocking</h4>
                  <p className="text-xs text-slate-400 mt-0.5">All group mutations and user-to-user messaging actions are enforced on the backend database layer.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl border border-slate-700/60 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Active Protection Protocols
            </h4>
            <div className="space-y-3 font-mono text-xs text-slate-400">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex justify-between">
                <span>Password Hashing</span>
                <span className="text-emerald-400">Bcrypt (10 Salt Rounds)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex justify-between">
                <span>Token Authority</span>
                <span className="text-emerald-400">JWT (HS256)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex justify-between">
                <span>Upload Sanitization</span>
                <span className="text-emerald-400">MIME Whitelist & Cloudinary</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex justify-between">
                <span>Database Indexing</span>
                <span className="text-emerald-400">Compound Mongoose Indexes</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex justify-between">
                <span>Real-Time Isolation</span>
                <span className="text-emerald-400">Scoped Socket.IO Rooms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 py-10 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white text-sm font-display tracking-tight">
            Talk<span className="text-indigo-400">-a-</span>tive
          </span>
          <span className="text-slate-600">|</span>
          <span>Production Real-Time Platform</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
          <span className="text-slate-500">Built with React, Express, MongoDB & Socket.IO</span>
        </div>
      </div>
    </footer>
  );
};
