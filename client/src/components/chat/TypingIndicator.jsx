import React from 'react';
import { motion } from 'framer-motion';

export const TypingIndicator = ({ typingUsers = [] }) => {
  if (!typingUsers || typingUsers.length === 0) return null;

  let text = '';
  if (typingUsers.length === 1) {
    text = `${typingUsers[0].userName} is typing`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing`;
  } else {
    text = `${typingUsers[0].userName} and ${typingUsers.length - 1} others are typing`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="flex items-center gap-2 px-4 py-1.5 text-xs text-slate-400 select-none"
    >
      <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
        <span
          className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
          style={{ animationDuration: '800ms', animationDelay: '0ms' }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
          style={{ animationDuration: '800ms', animationDelay: '200ms' }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
          style={{ animationDuration: '800ms', animationDelay: '400ms' }}
        />
      </div>
      <span className="font-medium italic">{text}...</span>
    </motion.div>
  );
};
