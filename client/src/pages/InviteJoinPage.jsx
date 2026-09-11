import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupService } from '../services/groupService';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useToast } from '../context/ToastContext';
import { Avatar } from '../components/ui/Avatar';
import { MessageSquare, Users, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export const InviteJoinPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { selectChat, fetchChats } = useChat();
  const toast = useToast();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        setLoading(true);
        const res = await groupService.getGroupByInvite(token);
        if (res.success && res.data) {
          setGroup(res.data);
        } else {
          setError('Invalid or expired invitation link');
        }
      } catch (err) {
        setError('Invalid or expired invitation link');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [token]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in or create an account to join this group');
      navigate('/');
      return;
    }

    try {
      setJoining(true);
      const res = await groupService.joinGroupByInvite(token);
      if (res.success && res.data) {
        toast.success(`You joined ${group?.groupName || 'the group'}!`);
        await fetchChats();
        selectChat(res.data);
        navigate('/chat');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not join group');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-glow mx-auto mb-4">
          <MessageSquare className="w-6 h-6 fill-white/20" />
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
            <span>Verifying invitation...</span>
          </div>
        ) : error ? (
          <div className="py-8">
            <h3 className="text-lg font-bold text-rose-400 mb-2 font-display">
              Invalid Invite Link
            </h3>
            <p className="text-xs text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Return Home
            </button>
          </div>
        ) : (
          <div>
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-widest block mb-3">
              You've Been Invited To Join
            </span>

            <Avatar
              src={group.groupAvatar}
              name={group.groupName}
              size="xl"
              className="mx-auto mb-3"
            />

            <h3 className="text-xl font-bold text-white font-display mb-1">
              {group.groupName}
            </h3>

            <p className="text-xs text-slate-400 mb-4 flex items-center justify-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{group.participants?.length || 0} active members</span>
            </p>

            {group.groupDescription && (
              <p className="text-xs text-slate-300 italic mb-6 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                "{group.groupDescription}"
              </p>
            )}

            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-glow transition-all active:scale-98 disabled:opacity-60"
            >
              {joining ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Join Group</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
