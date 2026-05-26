import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Trash2, User, Clock, MessageCircle, Smile, Reply as ReplyIcon, Edit2, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import CustomDialog from '../components/CustomDialog';

/**
 * Reply Interface
 * Represents a single reply in a discussion thread, supporting nested children for threaded conversations.
 */
interface Reply {
  _id: string;
  user: { _id: string, name: string };
  content: string;
  parentReply?: string | { _id: string, user: { name: string } };
  isEdited?: boolean;
  createdAt: string;
  children?: Reply[];
}

/**
 * ForumThreadProps Interface
 * Props for the ForumThread component.
 */
interface ForumThreadProps {
  topicId: string;
  onClose: () => void;
}

/**
 * ForumThread Component
 * 
 * A detailed view of a specific forum topic, including its content and all associated replies.
 * It features a recursive comment system allowing for deep-nested conversations.
 * 
 * Key Features:
 * - Recursive reply rendering (nested comments).
 * - Create, Edit, and Delete replies with authentication/authorization checks.
 * - Integrated emoji picker for expressive responses.
 * - Parent-child relationship mapping for threaded display.
 * - Smooth animations for new replies and modal transitions.
 * - Custom confirmation dialogs for destructive actions (Delete).
 * 
 * @param {ForumThreadProps} props - The component props.
 * @returns {JSX.Element} The rendered Thread view.
 */
export const ForumThread: React.FC<ForumThreadProps> = ({ topicId, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  /** @state {any} topic - The main topic data (title, content, author). */
  const [topic, setTopic] = useState<any>(null);
  
  /** @state {Reply[]} replies - The hierarchically structured list of replies. */
  const [replies, setReplies] = useState<Reply[]>([]);
  
  /** @state {boolean} loading - Loading state for the entire thread. */
  const [loading, setLoading] = useState(true);
  
  /** @state {string} newReply - Current text in the reply input field. */
  const [newReply, setNewReply] = useState('');
  
  /** @state {string | null} editingReplyId - ID of the reply currently being edited. */
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  
  /** @state {Reply | null} replyingTo - The specific reply being responded to (for nesting). */
  const [replyingTo, setReplyingTo] = useState<Reply | null>(null);
  
  /** @state {boolean} showEmojiPicker - Controls the visibility of the emoji selection overlay. */
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  /** @state {object} dialog - Configuration for the feedback/confirmation dialog. */
  const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', type: 'alert' as any, onConfirm: () => {} });

  /** Quick access emojis for the picker. */
  const COMMON_EMOJIS = ['😊', '😂', '🔥', '📚', '👏', '🤔', '🙌', '💡', '✨', '❤️', '📍', '✅', '🚀', '🌟', '📖'];

  /**
   * Transforms a flat array of replies into a tree structure based on parentReply IDs.
   * @param {Reply[]} flatReplies - The flat list of replies from the API.
   * @returns {Reply[]} The structured tree of replies.
   */
  const buildTree = (flatReplies: Reply[]) => {
    const map: { [key: string]: number } = {};
    const roots: Reply[] = [];
    flatReplies.forEach((reply, index) => { map[reply._id] = index; reply.children = []; });
    flatReplies.forEach((reply) => {
      const parentId = typeof reply.parentReply === 'object' ? reply.parentReply?._id : reply.parentReply;
      if (parentId && map[parentId] !== undefined) { flatReplies[map[parentId]].children?.push(reply); } 
      else { roots.push(reply); }
    });
    return roots;
  };

  /**
   * Fetches topic details and its flat replies, then builds the visual tree.
   */
  const fetchThread = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/forum/topics/${topicId}`);
      setTopic(data.topic);
      setReplies(buildTree(data.replies));
    } catch (error) {
      console.error("Error fetching thread", error);
    } finally {
      setLoading(false);
    }
  };

  /** Initial load effect. */
  useEffect(() => { fetchThread(); }, [topicId]);

  /**
   * Handles adding a new reply or saving an edited one.
   */
  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setDialog({ isOpen: true, title: t('CATALOG.PURCHASE.ERROR_TITLE'), message: t('COMENTARIOS.LOGIN_REQUIRED'), type: 'alert', onConfirm: () => {} });
      return;
    }
    if (!newReply.trim()) return;

    try {
      if (editingReplyId) {
        await API.put(`/forum/replies/${editingReplyId}`, { content: newReply });
        setEditingReplyId(null);
      } else {
        await API.post(`/forum/topics/${topicId}/replies`, { content: newReply, parentReplyId: replyingTo?._id });
        setReplyingTo(null);
      }
      setNewReply('');
      setShowEmojiPicker(false);
      fetchThread();
    } catch (error) {
      console.error("Error saving reply", error);
    }
  };

  /**
   * Triggers a confirmation dialog before deleting a reply.
   * @param {string} replyId - ID of the reply to delete.
   */
  const handleDeleteReply = (replyId: string) => {
    setDialog({
      isOpen: true,
      title: t('FORUM.THREAD.DELETE_CONFIRM_TITLE'),
      message: t('FORUM.THREAD.DELETE_CONFIRM_MSG'),
      type: 'confirm',
      onConfirm: async () => {
        try {
          await API.delete(`/forum/replies/${replyId}`);
          fetchThread();
          setDialog(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error("Error deleting reply", error);
        }
      }
    });
  };

  /** Appends an emoji to the current reply text. */
  const handleEmojiClick = (emoji: string) => { setNewReply(prev => prev + emoji); };

  /**
   * Internal Recursive Component for rendering replies and their children.
   */
  const ReplyItem = ({ reply, depth = 0 }: { reply: Reply, depth?: number }) => {
    const isOwner = user?._id === reply.user._id;
    const canDelete = isOwner || user?.isAdmin;
    const avatarSize = depth === 0 ? 'w-8 h-8' : depth === 1 ? 'w-7 h-7' : 'w-6 h-6';
    const textSize = depth === 0 ? 'text-sm' : 'text-[13px]';
    const titleSize = depth === 0 ? 'text-xs' : 'text-[11px]';
    const marginSize = depth > 0 ? 'ml-6 md:ml-10 border-l-2 border-light-primary/5 pl-4 md:pl-6' : '';

    return (
      <div className={`space-y-4 ${marginSize}`}>
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="group relative">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
              <div className={`${avatarSize} rounded-full bg-light-primary flex items-center justify-center text-white font-bold text-[10px] shadow-lg shadow-light-primary/20`}>
                {reply.user.name[0].toUpperCase()}
              </div>
              <div>
                <p className={`${titleSize} font-bold uppercase tracking-widest flex items-center gap-2`}>
                  {reply.user.name}
                  {reply.isEdited && <span className="text-[8px] opacity-30 italic font-normal">{t('FORUM.THREAD.EDITED')}</span>}
                </p>
                <p className="text-[8px] opacity-30 font-bold uppercase">{new Date(reply.createdAt).toLocaleString()}</p>
              </div>
            </div>
            {/* Reply Actions (Reply, Edit, Delete) */}
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={() => { setReplyingTo(reply); setEditingReplyId(null); setNewReply(''); setShowEmojiPicker(false); }} className="p-1.5 text-light-primary/60 hover:text-light-primary transition-all flex items-center gap-1 text-[8px] font-bold uppercase">
                <ReplyIcon size={10} /> {t('FORUM.THREAD.REPLY_BTN')}
              </button>
              {isOwner && (
                 <button onClick={() => { setEditingReplyId(reply._id); setNewReply(reply.content); setReplyingTo(null); }} className="p-1.5 text-amber-600/60 hover:text-amber-600 transition-all flex items-center gap-1 text-[8px] font-bold uppercase">
                  <Edit2 size={10} /> {t('FORUM.THREAD.EDIT_BTN')}
                </button>
              )}
              {canDelete && (
                <button onClick={() => handleDeleteReply(reply._id)} className="p-1.5 text-red-500/50 hover:text-red-500 transition-all flex items-center gap-1 text-[8px] font-bold uppercase">
                  <Trash2 size={10} /> {t('FORUM.THREAD.DELETE_BTN')}
                </button>
              )}
            </div>
          </div>
          <div className="pl-10">
            <p className={`${textSize} font-body italic opacity-80 leading-relaxed whitespace-pre-wrap`}>{reply.content}</p>
          </div>
        </motion.div>
        {/* Render child replies recursively */}
        {reply.children && reply.children.length > 0 && (
          <div className="space-y-4 mt-4">
            {reply.children.map(child => <ReplyItem key={child._id} reply={child} depth={depth + 1} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10">
      <CustomDialog isOpen={dialog.isOpen} onClose={() => setDialog({ ...dialog, isOpen: false })} onConfirm={dialog.onConfirm} title={dialog.title} message={dialog.message} type={dialog.type} />
      
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative w-full max-w-4xl bg-white rounded-[3rem] h-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <button onClick={onClose} className="absolute top-8 right-8 z-10 p-3 rounded-full bg-black/5 hover:bg-black/10 transition-colors"><X size={20} /></button>
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="w-12 h-12 border-4 border-light-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            {/* Thread Header: Topic Details */}
            <div className="p-12 md:p-16 border-b border-light-primary/5 bg-light-accent/10">
              <span className="px-3 py-1 bg-light-primary text-white text-[8px] font-bold uppercase tracking-widest rounded-lg mb-6 inline-block shadow-lg shadow-light-primary/20">{t(`FORUM.CATEGORIES.${topic.category}`)}</span>
              <h2 className="text-4xl md:text-5xl font-heading italic leading-tight mb-6">{topic.title}</h2>
              <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest opacity-40">
                <div className="flex items-center gap-2"><User size={14} /> {topic.user.name}</div>
                <div className="flex items-center gap-2"><Clock size={14} /> {new Date(topic.createdAt).toLocaleDateString()}</div>
                <div className="flex items-center gap-2 text-light-primary"><MessageCircle size={14} /> {topic.numReplies} {t('FORUM.REPLIES')}</div>
              </div>
              <p className="mt-8 text-lg font-body italic opacity-80 leading-relaxed max-w-3xl border-l-4 border-light-primary/10 pl-8">{topic.content}</p>
            </div>

            {/* Thread Body: Replies List */}
            <div className="flex-1 overflow-y-auto p-12 md:p-16 space-y-12 bg-light-bg/30">
              <div className="flex items-center justify-between border-b border-light-primary/10 pb-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[.3em] opacity-40">{t('FORUM.THREAD.COMMUNITY_DIALOG')}</h4>
              </div>
              <div className="space-y-12">
                {replies.map((reply) => <ReplyItem key={reply._id} reply={reply} />)}
                {replies.length === 0 && (
                  <div className="py-20 text-center opacity-30 italic text-sm flex flex-col items-center gap-4">
                    <MessageCircle size={48} className="opacity-20" /><p>{t('FORUM.THREAD.EMPTY')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Thread Footer: Reply Input & Actions */}
            <div className="p-8 md:p-12 border-t border-light-primary/5 bg-white relative">
              {/* Active Context Banner (Replying or Editing) */}
              <AnimatePresence>
                {(replyingTo || editingReplyId) && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mb-4 px-6 py-4 bg-light-primary/5 rounded-2xl flex justify-between items-center border border-light-primary/10">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-light-primary text-white rounded-xl">{replyingTo ? <ReplyIcon size={14} /> : <Edit2 size={14} />}</div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest">{replyingTo ? `${t('FORUM.THREAD.REPLYING_TO')} ${replyingTo.user.name}` : t('FORUM.THREAD.EDITING')}</p>
                            {replyingTo && <p className="text-[9px] opacity-40 truncate max-w-md italic mt-1">"{replyingTo.content}"</p>}
                        </div>
                    </div>
                    <button onClick={() => { setReplyingTo(null); setEditingReplyId(null); setNewReply(''); }} className="p-2 hover:bg-black/5 rounded-full transition-all"><X size={16} /></button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reply Form */}
              <form onSubmit={handleAddReply} className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                   <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-3 rounded-xl transition-all ${showEmojiPicker ? 'bg-light-primary text-white shadow-lg' : 'text-light-primary/40 hover:text-light-primary hover:bg-light-primary/5'}`}><Smile size={20} /></button>
                </div>
                <textarea value={newReply} onChange={e => setNewReply(e.target.value)} onFocus={() => setShowEmojiPicker(false)} placeholder={replyingTo ? t('FORUM.THREAD.PLACEHOLDER_REPLY') : t('FORUM.THREAD.PLACEHOLDER')} className="w-full bg-light-accent border-none rounded-[2rem] py-8 pl-16 pr-24 focus:ring-4 ring-light-primary/10 transition-all font-body italic min-h-[120px] shadow-inner" />
                <button type="submit" disabled={!newReply.trim()} className="absolute bottom-6 right-6 bg-light-primary text-white p-5 rounded-2xl shadow-2xl shadow-light-primary/30 hover:scale-110 active:scale-95 transition-all disabled:opacity-20 disabled:scale-100">
                  {editingReplyId ? <CheckCircle size={22} /> : <Send size={22} />}
                </button>
                
                {/* Emoji Picker Overlay */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: -70 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="absolute left-4 bottom-20 bg-white border border-light-primary/10 p-4 rounded-[2rem] shadow-2xl flex flex-wrap gap-3 z-[120] max-w-[280px]">
                      {COMMON_EMOJIS.map(emoji => <button key={emoji} type="button" onClick={() => handleEmojiClick(emoji)} className="w-10 h-10 flex items-center justify-center hover:bg-light-primary/5 rounded-xl transition-all text-2xl hover:scale-125">{emoji}</button>)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
