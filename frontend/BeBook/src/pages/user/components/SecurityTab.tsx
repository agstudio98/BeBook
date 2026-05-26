import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, Key } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SecurityTabProps {
  onUpdate: (e: React.FormEvent, data: any) => void;
  loading: boolean;
}

/**
 * SecurityTab Component
 * Allows users to update their account security settings, specifically their password.
 */
export const SecurityTab: React.FC<SecurityTabProps> = ({ onUpdate, loading }) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  return (
    <motion.div 
      key="security" 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="space-y-8"
    >
      <div className="max-w-md space-y-8">
        {/* Tab Header */}
        <div className="space-y-2">
          <h3 className="text-2xl font-heading italic text-light-text">{t('PROFILE.SECURITY.TITLE')}</h3>
          <p className="text-xs opacity-50 font-body text-light-text">{t('PROFILE.SECURITY.SUBTITLE')}</p>
        </div>

        {/* Password Update Form */}
        <form onSubmit={(e) => onUpdate(e, { password })} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder={t('PROFILE.SECURITY.PASSWORD_LABEL')} 
                className="w-full bg-light-accent border-none rounded-2xl py-4 pl-12 pr-12 focus:ring-2 ring-light-primary/20 transition-all font-body italic" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-light-primary text-white py-4 rounded-2xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-3 shadow-xl transition-all hover:brightness-110"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />} 
            {t('PROFILE.SECURITY.UPDATE_BTN')}
          </button>
        </form>
      </div>
    </motion.div>
  );
};
