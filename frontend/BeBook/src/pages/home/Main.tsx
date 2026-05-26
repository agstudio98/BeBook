import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

/**
 * Main (Hero) Component
 * The visual centerpiece of the Home page.
 * Displays the brand name with cinematic animations and a dynamic background.
 */
export const Main: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Dynamic Background with animated decorative elements */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 8 }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-light-primary/10 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 10 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-light-secondary/10 rounded-full blur-3xl" 
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 px-4">
        {/* Animated Brand Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <h1 className="font-logo text-8xl md:text-[12rem] mb-2 text-light-primary tracking-tighter">
            BeBook
          </h1>
          {/* Decorative Divider */}
          <div className="h-0.5 w-full max-w-2xl mx-auto bg-gradient-to-r from-transparent via-light-primary/50 to-transparent" />
        </motion.div>

        {/* Localized Slogan */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-8 text-2xl md:text-3xl font-heading italic opacity-90 tracking-wide"
        >
          {t('HOME.SLOGAN')}
        </motion.p>

        {/* Call to Action: Internal scroll */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-12 px-8 py-3 border border-light-primary text-light-primary hover:bg-light-primary hover:text-white transition-all duration-500 uppercase tracking-widest text-sm font-bold"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          {t('HOME.EXPLORE_BTN') || 'Explorar Experiencia'}
        </motion.button>
      </div>

      {/* Animated Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="w-px h-16 bg-gradient-to-b from-light-primary/50 to-transparent" />
      </motion.div>
    </section>
  );
};
