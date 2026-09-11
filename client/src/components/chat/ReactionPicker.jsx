import React from 'react';
import { motion } from 'framer-motion';

const EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

export const ReactionPicker = ({ onSelect, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 5 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-700/80 rounded-full shadow-xl backdrop-blur-md z-30 select-none"
    >
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => {
            onSelect(emoji);
            if (onClose) onClose();
          }}
          className="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 active:scale-95 transition-transform rounded-full hover:bg-slate-800"
        >
          {emoji}
        </button>
      ))}
    </motion.div>
  );
};
