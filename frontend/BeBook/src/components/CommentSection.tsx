import React, { useState, useEffect } from 'react';
import { Star, Trash2, Edit2, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import CustomDialog from './CustomDialog';
import { useTranslation } from 'react-i18next';

/**
 * Comment Interface
 * Defines the structure of a single user comment/review.
 */
interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  text: string;
  rating: number;
  createdAt: string;
}

/**
 * CommentSectionProps Interface
 * Allows the component to be reused for Products, Branches, or Repositories.
 */
interface CommentSectionProps {
  productId?: string;
  sucursalId?: string;
}

/**
 * CommentSection Component
 * A full-featured review system allowing users to read, post, edit, and delete comments.
 * Includes star ratings and conditional rendering based on ownership/admin status.
 */
const CommentSection: React.FC<CommentSectionProps> = ({ productId, sucursalId }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // Data State
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Dialog UI State
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm' | 'success';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert'
  });

  /**
   * Fetches the comment list based on the provided entity ID.
   */
  const fetchComments = async () => {
    try {
      let url = '/comentarios?';
      if (productId) url += `productId=${productId}`;
      else if (sucursalId) url += `sucursalId=${sucursalId}`;
      
      const { data } = await API.get(url);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments', error);
    }
  };

  /**
   * Re-fetches comments whenever the target entity changes.
   */
  useEffect(() => {
    fetchComments();
  }, [productId, sucursalId]);

  /**
   * Handles the creation or update of a comment.
   * @param e Form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setDialog({
        isOpen: true,
        title: t('CATALOG.PURCHASE.ERROR_TITLE'),
        message: t('COMENTARIOS.LOGIN_REQUIRED'),
        type: 'alert'
      });
      return;
    }
    if (!text) return;

    try {
      setLoading(true);
      if (editingId) {
        // Update existing
        await API.put(`/comentarios/${editingId}`, { text, rating });
        setEditingId(null);
      } else {
        // Create new
        await API.post('/comentarios', {
          text,
          rating,
          productId,
          sucursalId
        });
      }
      // Reset form
      setText('');
      setRating(5);
      fetchComments();
    } catch (error) {
      console.error('Error saving comment', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Triggers a confirmation dialog before deleting a comment.
   * @param id ID of the comment to delete.
   */
  const handleDelete = (id: string) => {
    setDialog({
      isOpen: true,
      title: t('COMENTARIOS.DELETE_TITLE'),
      message: t('COMENTARIOS.DELETE_CONFIRM'),
      type: 'confirm',
      onConfirm: async () => {
        try {
          await API.delete(`/comentarios/${id}`);
          fetchComments();
          setDialog(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Error deleting comment', error);
        }
      }
    });
  };

  /**
   * Populates the form with the selected comment's data for editing.
   * @param comment The comment object to edit.
   */
  const handleEdit = (comment: Comment) => {
    setEditingId(comment._id);
    setText(comment.text);
    setRating(comment.rating);
  };

  return (
    <div className="mt-12 space-y-8">
      <CustomDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={dialog.onConfirm}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
      />
      
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-light-primary/10 pb-4">
        <h4 className="text-[10px] font-bold uppercase tracking-[.3em] opacity-40">{t('COMENTARIOS.TITLE')}</h4>
        <span className="text-xs font-bold italic opacity-60">{t('COMENTARIOS.COUNT', { count: comments.length })}</span>
      </div>

      {/* Comment Creation Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="bg-light-primary/5 p-6 rounded-3xl space-y-4">
          {/* Rating Selection */}
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('COMENTARIOS.VALUATION')}:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-120"
                >
                  <Star
                    size={16}
                    fill={star <= rating ? "currentColor" : "none"}
                    className={star <= rating ? "text-yellow-500" : "text-gray-300"}
                  />
                </button>
              ))}
            </div>
          </div>
          {/* Textarea & Submit */}
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('COMENTARIOS.PLACEHOLDER')}
              className="w-full bg-white border border-light-primary/10 rounded-2xl p-4 text-sm font-body italic focus:ring-2 ring-light-primary/20 min-h-[100px] transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute bottom-4 right-4 bg-light-primary text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all disabled:opacity-50"
            >
              {editingId ? <CheckCircleIcon size={18} /> : <Send size={18} />}
            </button>
          </div>
          {/* Cancel Edit Link */}
          {editingId && (
            <button 
              type="button" 
              onClick={() => { setEditingId(null); setText(''); setRating(5); }}
              className="text-[9px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100"
            >
              {t('COMENTARIOS.CANCEL_EDIT')}
            </button>
          )}
        </form>
      ) : (
        <div className="bg-light-primary/5 p-8 rounded-3xl text-center">
          <p className="text-xs font-bold tracking-widest uppercase opacity-40">{t('COMENTARIOS.LOGIN_REQUIRED')}</p>
        </div>
      )}

      {/* Comments Feed */}
      <div className="space-y-6">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-light-primary/5 pb-6 last:border-0"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="text-sm font-bold tracking-widest uppercase mb-1">{comment.user.name}</h5>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={10}
                        fill={star <= comment.rating ? "currentColor" : "none"}
                        className={star <= comment.rating ? "text-yellow-500" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase opacity-30">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm italic font-body opacity-80 leading-relaxed mb-4">{comment.text}</p>
              
              {/* Management Actions (Visible to owner or admin) */}
              {(user?._id === comment.user._id || user?.isAdmin) && (
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleEdit(comment)}
                    className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.2em] opacity-40 hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={10} /> {t('COMENTARIOS.EDIT_BTN')}
                  </button>
                  <button 
                    onClick={() => handleDelete(comment._id)}
                    className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.2em] text-red-500/60 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={10} /> {t('COMENTARIOS.DELETE_BTN')}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <p className="text-center py-10 text-xs italic opacity-30">{t('COMENTARIOS.EMPTY')}</p>
        )}
      </div>
    </div>
  );
};

/**
 * CheckCircleIcon SVG Component
 * Internal helper for the submit button during edit mode.
 */
const CheckCircleIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default CommentSection;
