import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Quote, History, Award, Book } from 'lucide-react';

/**
 * Who Component
 * 
 * An "About Us" section that introduces the brand's philosophy and history.
 * It uses a balanced layout of text and imagery to convey the brand's aesthetic values.
 * 
 * Key Features:
 * - Localized storytelling content.
 * - Decorative background elements and floating badges.
 * - Image reveal animations with grayscale-to-color transitions.
 * - Floating icons representing brand pillars (History, Award, Book).
 * 
 * @returns {JSX.Element} The rendered Who section.
 */
export const Who: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-32 px-4 bg-white relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-light-primary/5 -skew-x-12 translate-x-20" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Text Content Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <span className="text-light-primary font-bold uppercase tracking-[.4em] text-xs">
                {t('HOME.WHO.SUBTITLE')}
              </span>
              <h2 className="text-6xl md:text-8xl font-heading italic tracking-tighter leading-tight">
                {t('HOME.WHO.TITLE')}
              </h2>
            </div>

            <div className="space-y-6 text-xl font-body leading-relaxed opacity-80 italic">
              <p>{t('HOME.WHO.TEXT_1')}</p>
              <p>{t('HOME.WHO.TEXT_2')}</p>
            </div>

            {/* Brand Manifesto Grid */}
            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-light-primary/10">
               <div className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-light-primary">{t('HOME.WHO.MANIFESTO')}</h4>
                  <p className="text-xs opacity-60 uppercase font-bold tracking-widest">{t('HOME.WHO.AESTHETIC')}</p>
               </div>
               <div className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-light-primary">{t('HOME.WHO.EST')}</h4>
                  <p className="text-xs opacity-60 uppercase font-bold tracking-widest">{t('HOME.WHO.RESERVE_KNOWLEDGE')}</p>
               </div>
            </div>
          </motion.div>

          {/* Image & Decorative Badges Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
             <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative group">
                <img 
                  src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000" 
                  alt="BeBook Library" 
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-light-primary/10 group-hover:bg-transparent transition-colors duration-1000" />
             </div>

             {/* Animated Floating Quote Badge */}
             <motion.div 
               animate={{ y: [0, -20, 0] }}
               transition={{ repeat: Infinity, duration: 4 }}
               className="absolute -bottom-10 -left-10 bg-light-primary text-white p-10 rounded-[2rem] shadow-2xl"
             >
                <Quote size={40} className="mb-4 opacity-50" />
                <p className="font-heading text-2xl italic leading-tight">
                  {t('HOME.WHO.CURATION')}
                </p>
             </motion.div>

             {/* Vertical Pillar Icons */}
             <div className="absolute top-10 -right-10 flex flex-col gap-4">
                {[History, Award, Book].map((Icon, i) => (
                  <div key={i} className="w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center text-light-primary hover:bg-light-primary hover:text-white transition-all cursor-pointer border border-light-primary/5">
                    <Icon size={24} />
                  </div>
                ))}
             </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
