import React, { useState } from 'react';
import { motion } from 'framer-motion';

const EMOJI_CATEGORIES = {
  Recent: ['❤️', '👍', '😂', '🔥', '🎉', '✨', '🙏', '😍'],
  Faces: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'],
  Gestures: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪'],
  Hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
  Fun: ['🔥', '✨', '⚡', '💥', '🎉', '🎊', '🚀', '⭐', '🌟', '💯', '🏆', '🎯', '💡', '🔔', '💬', '👀', '🍕', '☕', '🍻'],
};

export const EmojiPickerPopover = ({ onSelectEmoji, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('Faces');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-14 left-0 z-40 w-72 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl backdrop-blur-xl p-3 select-none"
    >
      {/* Category Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        {Object.keys(EMOJI_CATEGORIES).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
              activeCategory === cat
                ? 'bg-indigo-600/30 text-indigo-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-7 gap-1 max-h-48 overflow-y-auto p-1">
        {EMOJI_CATEGORIES[activeCategory].map((emoji, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              onSelectEmoji(emoji);
            }}
            className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-slate-800 active:scale-95 transition-transform"
          >
            {emoji}
          </button>
        ))}
      </div>
    </motion.div>
  );
};
