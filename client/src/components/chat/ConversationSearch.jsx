import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { Search, X, Loader2 } from 'lucide-react';

export const ConversationSearch = () => {
  const { isSearchingChat, setIsSearchingChat, searchConversation, searchResults } = useChat();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isSearchingChat) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    await searchConversation(query);
    setLoading(false);
  };

  const handleJumpToMessage = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-indigo-400');
      setTimeout(() => el.classList.remove('ring-2', 'ring-indigo-400'), 2000);
    }
  };

  return (
    <div className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md p-3 select-none animate-slide-up">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in this conversation..."
            className="w-full pl-9 pr-8 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
        </button>

        <button
          type="button"
          onClick={() => setIsSearchingChat(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </form>

      {/* Results Dropdown */}
      {searchResults.length > 0 && (
        <div className="mt-2 max-h-48 overflow-y-auto space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-semibold uppercase px-1">
            {searchResults.length} matching {searchResults.length === 1 ? 'message' : 'messages'}
          </div>
          {searchResults.map((result) => (
            <div
              key={result._id}
              onClick={() => handleJumpToMessage(result._id)}
              className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 cursor-pointer text-xs transition-colors"
            >
              <div className="flex items-center justify-between text-slate-400 text-[10px] mb-0.5">
                <span className="font-semibold text-brand-300">{result.sender?.name || 'User'}</span>
                <span>{new Date(result.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </div>
              <p className="text-slate-200 truncate">{result.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
