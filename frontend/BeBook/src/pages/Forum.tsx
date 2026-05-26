import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Plus, Filter, User, Clock, ChevronRight, Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { ForumThread } from './ForumThread';
import CustomDialog from '../components/CustomDialog';

/**
 * Topic Interface
 * Represents a discussion thread in the forum.
 */
interface Topic {
  _id: string;
  user: { name: string };
  title: string;
  content: string;
  category: string;
  views: number;
  numReplies: number;
  createdAt: string;
}

/**
 * Forum Component
 * 
 * A community space for users to discuss literature, study materials, and events.
 * It provides tools for browsing topics by category, searching, and creating new threads.
 * 
 * Key Features:
 * - Topic listing with view and reply counts.
 * - Category-based sidebar filtering.
 * - Real-time search functionality.
 * - Integrated detail view (ForumThread) via modal/overlay.
 * - Create Topic workflow with authentication checks.
 * - Custom dialogs for success/error feedback.
 * 
 * @returns {JSX.Element} The rendered Forum page.
 */
export const Forum: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  /** @state {Topic[]} topics - The list of discussion threads fetched from the API. */
  const [topics, setTopics] = useState<Topic[]>([]);
  
  /** @state {boolean} loading - Loading state for the topics list. */
  const [loading, setLoading] = useState(true);
  
  /** @state {string} keyword - Search term for filtering topics by title or content. */
  const [keyword, setKeyword] = useState('');
  
  /** @state {string} category - Current category filter for the forum. */
  const [category, setCategory] = useState('Todas');
  
  /** @state {string | null} selectedTopicId - ID of the topic currently being viewed in detail. */
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  
  /** @state {boolean} showCreate - Controls the visibility of the "New Topic" modal. */
  const [showCreate, setShowCreate] = useState(false);
  
  /** @state {object} newTopic - Form state for creating a new discussion thread. */
  const [newTopic, setNewTopic] = useState({ title: '', content: '', category: 'General' });
  
  /** @state {object} dialog - Configuration for the feedback dialog (Success/Error). */
  const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', type: 'alert' as any });

  /**
   * Fetches topics from the API based on current filters.
   */
  const fetchTopics = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/forum/topics?keyword=${keyword}&category=${category}`);
      setTopics(data);
    } catch (error) {
      console.error("Error fetching topics", error);
    } finally {
      setLoading(false);
    }
  };

  /** Debounced fetch effect to avoid excessive API calls during typing. */
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTopics();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [keyword, category]);

  /**
   * Handles the submission of a new topic.
   * Validates user authentication before proceeding.
   */
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setDialog({ isOpen: true, title: t('CATALOG.PURCHASE.ERROR_TITLE'), message: t('COMENTARIOS.LOGIN_REQUIRED'), type: 'alert' });
      return;
    }

    try {
      await API.post('/forum/topics', newTopic);
      setShowCreate(false);
      setNewTopic({ title: '', content: '', category: 'General' });
      fetchTopics();
      setDialog({ isOpen: true, title: t('FORUM.SUCCESS_TITLE'), message: t('FORUM.CREATE_MODAL.SUCCESS'), type: 'success' });
    } catch (error) {
      console.error("Error creating topic", error);
    }
  };

  /** Available forum categories for filtering and creation. */
  const CATEGORIES = ['Todas', 'Literatura', 'Estudio', 'Eventos', 'General', 'Soporte'];

  return (
    <section className="min-h-screen pt-32 pb-20 px-4 bg-light-bg">
      {/* Feedback Dialog */}
      <CustomDialog 
        isOpen={dialog.isOpen} 
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
      />

      <div className="max-w-6xl mx-auto">
        {/* Page Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-[10px] font-bold tracking-[.4em] uppercase text-light-primary opacity-60 block mb-2">{t('FORUM.SUBTITLE')}</span>
            <h2 className="text-6xl md:text-7xl font-heading italic tracking-tighter">{t('FORUM.TITLE')}</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative group flex-1 md:min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
              <input 
                type="text" 
                placeholder={t('FORUM.SEARCH_PLACEHOLDER')}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-white border border-light-primary/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 ring-light-primary/20 transition-all font-body italic"
              />
            </div>
            {/* Create Button */}
            <button 
              onClick={() => setShowCreate(true)}
              className="bg-light-primary text-white px-8 py-4 rounded-2xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-3 shadow-xl shadow-light-primary/20 hover:scale-105 transition-all"
            >
              <Plus size={18} /> {t('FORUM.NEW_TOPIC')}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filter Menu */}
          <aside className="w-full lg:w-1/4 space-y-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-2">{t('FORUM.CATEGORIES_TITLE')}</h4>
              <div className="flex flex-wrap lg:flex-col gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-left transition-all ${
                      category === cat 
                      ? 'bg-light-primary text-white shadow-lg shadow-light-primary/10' 
                      : 'bg-white border border-light-primary/5 opacity-60 hover:opacity-100 hover:bg-light-primary/5'
                    }`}
                  >
                    {t(`FORUM.CATEGORIES.${cat}`)}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Topics Feed */}
          <div className="flex-1 space-y-6">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)
            ) : (
              <AnimatePresence mode="popLayout">
                {topics.map((topic) => (
                  <motion.div
                    key={topic._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedTopicId(topic._id)}
                    className="bg-white border border-light-primary/5 p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:border-light-primary/20 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-light-accent text-light-primary text-[8px] font-bold uppercase tracking-widest rounded-lg">
                            {t(`FORUM.CATEGORIES.${topic.category}`)}
                          </span>
                          <span className="flex items-center gap-2 text-[9px] font-bold uppercase opacity-30">
                            <Clock size={12} /> {new Date(topic.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-2xl font-heading italic group-hover:text-light-primary transition-colors">{topic.title}</h3>
                        <div className="flex items-center gap-4 opacity-50">
                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                            <User size={12} /> {topic.user.name}
                          </div>
                        </div>
                      </div>
                      
                      {/* Topic Stats (Replies/Views) */}
                      <div className="flex gap-8 border-l border-light-primary/10 pl-8 h-full items-center">
                        <div className="text-center">
                          <p className="text-xl font-heading italic leading-none">{topic.numReplies}</p>
                          <p className="text-[8px] font-bold uppercase opacity-30 tracking-widest">{t('FORUM.REPLIES')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-heading italic leading-none">{topic.views}</p>
                          <p className="text-[8px] font-bold uppercase opacity-30 tracking-widest">{t('FORUM.VIEWS')}</p>
                        </div>
                        <ChevronRight className="opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* Empty State Feedback */}
            {!loading && topics.length === 0 && (
              <div className="py-20 text-center opacity-30 italic">
                <MessageSquare size={48} className="mx-auto mb-4" />
                <p>{t('FORUM.NOT_FOUND')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Topic Modal Overlay */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreate(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] p-12 shadow-2xl overflow-hidden"
            >
              <h3 className="text-4xl font-heading italic mb-8">{t('FORUM.CREATE_MODAL.TITLE')}</h3>
              <form onSubmit={handleCreateTopic} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-2">{t('FORUM.CREATE_MODAL.LABEL_TITLE')}</label>
                  <input 
                    type="text"
                    required
                    value={newTopic.title}
                    onChange={e => setNewTopic({ ...newTopic, title: e.target.value })}
                    className="w-full bg-light-accent border-none rounded-2xl py-4 px-6 focus:ring-2 ring-light-primary/20 transition-all font-body italic"
                    placeholder={t('FORUM.CREATE_MODAL.PLACEHOLDER_TITLE')}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-2">{t('FORUM.CREATE_MODAL.LABEL_CATEGORY')}</label>
                    <select 
                      value={newTopic.category}
                      onChange={e => setNewTopic({ ...newTopic, category: e.target.value })}
                      className="w-full bg-light-accent border-none rounded-2xl py-4 px-6 focus:ring-2 ring-light-primary/20 transition-all font-body italic cursor-pointer"
                    >
                      {CATEGORIES.filter(c => c !== 'Todas').map(c => <option key={c} value={c}>{t(`FORUM.CATEGORIES.${c}`)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-2">{t('FORUM.CREATE_MODAL.LABEL_CONTENT')}</label>
                  <textarea 
                    required
                    value={newTopic.content}
                    onChange={e => setNewTopic({ ...newTopic, content: e.target.value })}
                    className="w-full bg-light-accent border-none rounded-2xl py-4 px-6 focus:ring-2 ring-light-primary/20 transition-all font-body italic min-h-[200px]"
                    placeholder={t('FORUM.CREATE_MODAL.PLACEHOLDER_CONTENT')}
                  />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setShowCreate(false)} className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest opacity-40">{t('FORUM.CREATE_MODAL.CANCEL')}</button>
                  <button type="submit" className="bg-light-primary text-white px-10 py-4 rounded-2xl font-bold tracking-widest uppercase text-xs shadow-xl shadow-light-primary/20">{t('FORUM.CREATE_MODAL.SUBMIT')}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Thread View Detail (Nested Component) */}
      <AnimatePresence>
        {selectedTopicId && (
          <ForumThread 
            topicId={selectedTopicId} 
            onClose={() => { setSelectedTopicId(null); fetchTopics(); }} 
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Forum;
