import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Carousel Component
 * 
 * An immersive, full-screen image slider used at the bottom of the Home page.
 * It features auto-playing transitions, cinematic zoom effects, and localized content.
 * 
 * Key Features:
 * - Auto-play functionality with a 6-second interval.
 * - Framer Motion animations for smooth, cinematic transitions.
 * - Manual navigation via arrows and pagination indicators.
 * - Localized titles and subtitles for each slide.
 * 
 * @returns {JSX.Element} The rendered Carousel section.
 */
export const Carousel: React.FC = () => {
  const { t } = useTranslation();
  
  /** @state {number} index - The current slide index being displayed. */
  const [index, setIndex] = useState(0);

  /**
   * Carousel Data
   * Array of objects containing image URLs and localized text keys.
   */
  const IMAGES = [
    {
      url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2000&auto=format&fit=crop",
      title: t('HOME.CAROUSEL.ITEM_1.TITLE'),
      subtitle: t('HOME.CAROUSEL.ITEM_1.SUBTITLE')
    },
    {
      url: "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?q=80&w=2000&auto=format&fit=crop",
      title: t('HOME.CAROUSEL.ITEM_2.TITLE'),
      subtitle: t('HOME.CAROUSEL.ITEM_2.SUBTITLE')
    },
    {
      url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=2000&auto=format&fit=crop",
      title: t('HOME.CAROUSEL.ITEM_3.TITLE'),
      subtitle: t('HOME.CAROUSEL.ITEM_3.SUBTITLE')
    }
  ];

  /**
   * Auto-play Effect
   * Sets up an interval to advance the slide every 6 seconds.
   * Cleans up the interval on component unmount.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [IMAGES.length]);

  /**
   * Advances to the next slide in the carousel.
   */
  const next = () => setIndex((prev) => (prev + 1) % IMAGES.length);

  /**
   * Goes back to the previous slide in the carousel.
   */
  const prev = () => setIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);

  return (
    <section className="h-screen relative overflow-hidden bg-black text-white">
      <AnimatePresence mode="wait">
        {/* Animated Slide Container */}
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Overlay Gradients for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-10" />
          <img 
            src={IMAGES[index].url} 
            alt={IMAGES[index].title} 
            crossOrigin="anonymous"
            className="w-full h-full object-cover grayscale brightness-75"
          />
          
          {/* Slide Text Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-4">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xs font-bold tracking-[.8em] uppercase mb-6"
            >
              {IMAGES[index].subtitle}
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-7xl md:text-9xl font-heading italic tracking-tighter"
            >
              {IMAGES[index].title}
            </motion.h2>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-10 z-30 pointer-events-none">
        <button onClick={prev} className="p-4 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all duration-500 pointer-events-auto">
          <ChevronLeft />
        </button>
        <button onClick={next} className="p-4 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all duration-500 pointer-events-auto">
          <ChevronRight />
        </button>
      </div>

      {/* Pagination Indicators */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex gap-4">
        {IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1 transition-all duration-700 rounded-full ${i === index ? 'w-16 bg-white' : 'w-8 bg-white/30'}`}
          />
        ))}
      </div>
    </section>
  );
};
