import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ShoppingBag, Calendar as CalendarIcon, CreditCard, Activity as ActivityIcon, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HistoryTabProps {
  activities: any[];
  loading: boolean;
  onSync: () => void;
  translateActivity: (activity: any) => string;
  language: string;
}

/**
 * HistoryTab Component
 * Displays a timeline of user activities and provides a synchronization option.
 */
export const HistoryTab: React.FC<HistoryTabProps> = ({
  activities,
  loading,
  onSync,
  translateActivity,
  language
}) => {
  const { t } = useTranslation();

  return (
    <motion.div 
      key="historial" 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="space-y-10"
    >
      {/* Tab Header & Sync Button */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h3 className="text-2xl font-heading italic text-light-text">{t('PROFILE.HISTORY.TITLE')}</h3>
          <p className="text-xs opacity-50 font-body text-light-text">{t('PROFILE.HISTORY.SUBTITLE')}</p>
        </div>
        <button 
          onClick={onSync}
          disabled={loading}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-light-primary border border-light-primary/10 px-4 py-2 rounded-xl hover:bg-light-primary hover:text-white transition-all"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <ActivityIcon size={12} />} 
          {t('PROFILE.HISTORY.SYNC')}
        </button>
      </div>

      {/* Timeline Visualization */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-px bg-light-primary/10" />
        <div className="space-y-8">
          {activities.length > 0 ? (
            activities.map((activity, i) => (
              <div key={i} className="relative flex gap-8 group">
                {/* Activity Icon Badge */}
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-white border border-light-primary/10 flex items-center justify-center text-light-primary shadow-sm group-hover:bg-light-primary group-hover:text-white transition-all duration-500">
                  {activity.type === 'COMMENT' && <MessageSquare size={20} />}
                  {activity.type === 'PURCHASE' && <ShoppingBag size={20} />}
                  {activity.type === 'BOOKING' && <CalendarIcon size={20} />}
                  {activity.type === 'FORUM_TOPIC' && <MessageSquare size={20} />}
                  {activity.type === 'SUBSCRIPTION_UPDATE' && <CreditCard size={20} />}
                </div>
                {/* Activity Details */}
                <div className="flex-1 pt-2 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-light-text">
                      {translateActivity(activity)}
                    </h4>
                    <span className="text-[8px] font-bold opacity-30 uppercase">
                      {new Date(activity.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-xs font-body italic opacity-40">{t('PROFILE.HISTORY.ACTION_HINT')}</p>
                  {activity.amount && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-light-primary bg-light-primary/5 px-3 py-1 rounded-full">
                        ${activity.amount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center opacity-30 italic text-xs">
              {t('PROFILE.HISTORY.EMPTY')}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
