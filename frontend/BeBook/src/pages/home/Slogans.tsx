import React from 'react';
import { BookOpen, MapPin, Calendar, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * Slogans Component
 * Displays the core pillars of the BeBook experience (Explore, Locate, Reserve, Connect).
 * Uses grid layouts and reveal animations to present brand values.
 */
export const Slogans: React.FC = () => {
  const { t } = useTranslation();
  
  /**
   * Pillar Data
   * Array of objects defining the icon, localized title, and description for each brand pillar.
   */
  const slogans = [
    { 
      icon: <BookOpen className="w-12 h-12" />, 
      title: t('HOME.PILLARS.EXPLORE.TITLE'), 
      text: t('HOME.PILLARS.EXPLORE.TEXT') 
    },
    { 
      icon: <MapPin className="w-12 h-12" />, 
      title: t('HOME.PILLARS.LOCATE.TITLE'), 
      text: t('HOME.PILLARS.LOCATE.TEXT') 
    },
    { 
      icon: <Calendar className="w-12 h-12" />, 
      title: t('HOME.PILLARS.RESERVE.TITLE'), 
      text: t('HOME.PILLARS.RESERVE.TEXT') 
    },
    { 
      icon: <MessageSquare className="w-12 h-12" />, 
      title: t('HOME.PILLARS.CONNECT.TITLE'), 
      text: t('HOME.PILLARS.CONNECT.TEXT') 
    },
  ];

  return (
    <section className="min-h-screen bg-light-accent flex items-center justify-center py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-heading mb-6 italic">{t('HOME.PILLARS.TITLE')}</h2>
          <div className="h-1 w-32 bg-light-primary mx-auto rounded-full" />
        </div>
        
        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {slogans.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="group flex flex-col items-center text-center space-y-6 p-10 bg-white border border-light-primary/10 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              {/* Icon Container */}
              <div className="p-4 rounded-full bg-light-primary/5 text-light-primary group-hover:bg-light-primary group-hover:text-white transition-all duration-500">
                {s.icon}
              </div>
              {/* Title & Description */}
              <h3 className="text-2xl font-heading tracking-wider uppercase">{s.title}</h3>
              <p className="opacity-70 leading-relaxed font-body italic">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
