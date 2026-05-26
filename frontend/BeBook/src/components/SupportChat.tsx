import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, ChevronRight, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * SupportItem Interface
 * Defines the hierarchical structure of support data, from categories to specific responses.
 */
interface SupportItem {
  title: string;
  sub: { [key: string]: string };
  responses: { [key: string]: string[] };
}

/**
 * SupportChat Component
 * An interactive floating chat widget that provides automated assistance.
 * Features a decision-tree structure to guide users through common inquiries.
 */
const SupportChat: React.FC = () => {
  const { t } = useTranslation();
  
  // Navigation State
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'label' | 'sublabel' | 'solution'>('label');
  
  // Selection State
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [selectedSubKey, setSelectedSubKey] = useState<string>('');
  const [dynamicResponse, setDynamicResponse] = useState<string>('');

  /**
   * Loads the structured support data from localization files.
   * Memoized to prevent unnecessary recalculations on re-renders.
   */
  const SUPPORT_DATA = useMemo(() => ({
    CATALOG: {
      title: t('SUPPORT.DATA.CATALOG.TITLE'),
      sub: t('SUPPORT.DATA.CATALOG.SUB', { returnObjects: true }) as { [key: string]: string },
      responses: t('SUPPORT.DATA.CATALOG.RESPONSES', { returnObjects: true }) as { [key: string]: string[] }
    },
    EVENTS: {
      title: t('SUPPORT.DATA.EVENTS.TITLE'),
      sub: t('SUPPORT.DATA.EVENTS.SUB', { returnObjects: true }) as { [key: string]: string },
      responses: t('SUPPORT.DATA.EVENTS.RESPONSES', { returnObjects: true }) as { [key: string]: string[] }
    },
    SUPPORT: {
      title: t('SUPPORT.DATA.SUPPORT.TITLE'),
      sub: t('SUPPORT.DATA.SUPPORT.SUB', { returnObjects: true }) as { [key: string]: string },
      responses: t('SUPPORT.DATA.SUPPORT.RESPONSES', { returnObjects: true }) as { [key: string]: string[] }
    },
    GENERAL: {
      title: t('SUPPORT.DATA.GENERAL.TITLE'),
      sub: t('SUPPORT.DATA.GENERAL.SUB', { returnObjects: true }) as { [key: string]: string },
      responses: t('SUPPORT.DATA.GENERAL.RESPONSES', { returnObjects: true }) as { [key: string]: string[] }
    }
  }), [t]);

  /**
   * Progresses the chat to the second level (Sub-labels).
   * @param key The selected category key.
   */
  const handleLabelSelect = (key: string) => {
    setSelectedKey(key);
    setStep('sublabel');
  };

  /**
   * Finalizes the inquiry and displays a randomly selected response from the target list.
   * @param subKey The specific inquiry key.
   */
  const handleSubLabelSelect = (subKey: string) => {
    setSelectedSubKey(subKey);
    const responses = (SUPPORT_DATA as any)[selectedKey].responses[subKey];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    setDynamicResponse(randomResponse);
    setStep('solution');
  };

  /**
   * Resets the chat state back to the initial category selection.
   */
  const resetChat = () => {
    setStep('label');
    setSelectedKey('');
    setSelectedSubKey('');
    setDynamicResponse('');
  };

  return (
    <div className="fixed bottom-8 right-8 z-[999]">
      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-light-primary/10"
          >
            {/* Header: Identity and Status */}
            <div className="bg-light-primary p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-widest uppercase">{t('SUPPORT.TITLE')}</h4>
                  <p className="text-[10px] opacity-60 uppercase font-bold tracking-tighter">{t('SUPPORT.SUBTITLE')}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
                <X size={20} />
              </button>
            </div>

            {/* Dynamic Content Body */}
            <div className="p-8 max-h-[400px] overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                
                {/* Level 1: Categories */}
                {step === 'label' && (
                  <motion.div 
                    key="labels"
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <p className="text-sm font-body italic opacity-60">{t('SUPPORT.HELP_PROMPT')}</p>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(SUPPORT_DATA).map(([key, data]) => (
                        <button
                          key={key}
                          onClick={() => handleLabelSelect(key)}
                          className="w-full py-4 px-6 rounded-2xl bg-light-accent hover:bg-light-primary hover:text-white transition-all text-left text-[10px] font-bold uppercase tracking-widest flex justify-between items-center group"
                        >
                          {data.title}
                          <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Level 2: Specific Inquiries */}
                {step === 'sublabel' && (
                  <motion.div 
                    key="sublabels"
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2">
                      <button onClick={() => setStep('label')} className="text-[9px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">← {t('SUPPORT.BACK')}</button>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-light-primary">{(SUPPORT_DATA as any)[selectedKey].title}</span>
                    </div>
                    <p className="text-sm font-body italic opacity-60">{t('SUPPORT.SPECIFIC_PROMPT')}</p>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries((SUPPORT_DATA as any)[selectedKey].sub).map(([subKey, subLabel]) => (
                        <button
                          key={subKey}
                          onClick={() => handleSubLabelSelect(subKey)}
                          className="w-full py-4 px-6 rounded-2xl bg-light-accent hover:bg-light-primary hover:text-white transition-all text-left text-[10px] font-bold uppercase tracking-widest flex justify-between items-center group"
                        >
                          {subLabel as string}
                          <HelpCircle size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Level 3: Automated Response */}
                {step === 'solution' && (
                  <motion.div 
                    key="solution"
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="p-6 bg-light-accent rounded-[2rem] border border-light-primary/10">
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-light-primary mb-3">{t('SUPPORT.RELEVANT_INFO')}</h5>
                      <p className="text-sm font-body italic leading-relaxed text-light-text/80">
                        {dynamicResponse}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 text-center italic">{t('SUPPORT.OTHER_INQUIRY')}</p>
                      <button 
                        onClick={() => setStep('sublabel')}
                        className="w-full py-4 rounded-2xl bg-light-primary text-white font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-light-primary/20"
                      >
                        {t('SUPPORT.BACK_TO', { label: (SUPPORT_DATA as any)[selectedKey].title })}
                      </button>
                      <button 
                        onClick={() => setStep('label')}
                        className="w-full py-4 rounded-2xl border border-light-primary/10 font-bold uppercase tracking-widest text-[10px] opacity-60 hover:opacity-100"
                      >
                        {t('SUPPORT.EXPLORE_OTHER')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) resetChat();
        }}
        className="w-16 h-16 bg-[#4CAF50] text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:brightness-110 active:scale-95 border-4 border-white group"
      >
        <User size={30} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
      </motion.button>
    </div>
  );
};

export default SupportChat;
