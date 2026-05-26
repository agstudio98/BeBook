import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, MapPin, ArrowRight, X, Clock, Star } from 'lucide-react';

/**
 * Events Component
 * 
 * Displays a section of upcoming workshops and literary events.
 * It features a grid of cards that open a detailed modal when clicked.
 * 
 * Key Features:
 * - Dynamic list of events (currently static but structured for expansion).
 * - Animated reveals for event cards.
 * - Full-screen modal for detailed event information.
 * - Interactive UI with hover states and scroll-friendly layouts.
 * 
 * @returns {JSX.Element} The rendered Events section.
 */
export const Events: React.FC = () => {
  const { t } = useTranslation();

  /** @state {any | null} selectedEvent - The event currently selected to be displayed in the modal. */
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  /**
   * Static Events Data
   * Array of event objects containing details like date, title, description, location, etc.
   * Note: This could be moved to a separate JSON or fetched from an API in the future.
   */
  const events = [
    {
      id: 1,
      date: "15 MAY",
      title: "Workshop: Escritura Creativa",
      desc: "Descubre tu voz narrativa en este taller intensivo liderado por expertos de la industria literaria.",
      fullDesc: "Un viaje profundo a las técnicas de narrativa moderna. Aprenderás a construir personajes memorables, estructurar tramas sólidas y encontrar ese tono único que define a los grandes autores. Incluye materiales de trabajo y certificado de asistencia.",
      location: "Sede Central, Buenos Aires",
      stats: "120+ Inscriptos",
      tag: "CUPOS LIMITADOS",
      time: "18:00 - 21:00 hs",
      instructor: "Elena Walch",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1000"
    },
    {
      id: 2,
      date: "22 JUN",
      title: "Club de Lectura: Clásicos",
      desc: "Debate profundo sobre las obras que dieron forma al pensamiento moderno en un ambiente íntimo.",
      fullDesc: "Este mes exploramos 'Rayuela' de Julio Cortázar. Un espacio para el intercambio de ideas, análisis crítico y apreciación estética de la literatura que desafía el tiempo. Café premium incluido durante la sesión.",
      location: "Sede Palermo",
      stats: "25 Cupos",
      tag: "EXCLUSIVO",
      time: "19:00 hs",
      instructor: "Marcos Di Cesare",
      image: "https://images.unsplash.com/photo-1529148482759-b35b25c5f217?q=80&w=1000"
    },
    {
      id: 3,
      date: "10 JUL",
      title: "Presentación: IA en Letras",
      desc: "Explora la intersección entre la tecnología de vanguardia y el arte de la creación literaria.",
      fullDesc: "Conferencia sobre cómo las herramientas de IA están transformando el proceso creativo y editorial. Veremos demostraciones en vivo y discutiremos el futuro de la autoría humana en la era digital.",
      location: "Virtual & Presencial",
      stats: "Híbrido",
      tag: "VANGUARDIA",
      time: "17:30 hs",
      instructor: "Tech Team BeBook",
      image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=1000"
    }
  ];

  return (
    <section className="py-32 px-4 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-24 space-y-4">
           <span className="text-light-primary font-bold uppercase tracking-[.4em] text-xs">
             Experiencias BeBook
           </span>
           <h2 className="text-6xl md:text-8xl font-heading italic tracking-tighter leading-tight">
             Workshops & Eventos
           </h2>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              {/* Event Image Container */}
              <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden mb-8 shadow-xl">
                 <img 
                   src={event.image} 
                   alt={event.title} 
                   crossOrigin="anonymous"
                   className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0" 
                 />
                 <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-light-primary shadow-lg">
                    {event.date}
                 </div>
              </div>
              
              {/* Event Basic Info */}
              <div className="space-y-6 px-4">
                 <div className="space-y-2">
                    <h3 className="text-3xl font-heading italic group-hover:text-light-primary transition-colors duration-500">{event.title}</h3>
                    <p className="opacity-60 font-body leading-relaxed text-sm">{event.desc}</p>
                 </div>

                 <div className="flex flex-col gap-3 pt-6 border-t border-light-primary/5">
                    <div className="flex items-center gap-3 text-[10px] opacity-50 font-bold uppercase tracking-widest">
                       <MapPin size={12} className="text-light-primary" />
                       {event.location}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] opacity-50 font-bold uppercase tracking-widest">
                       <Users size={12} className="text-light-primary" />
                       {event.stats}
                    </div>
                 </div>

                 <button className="pt-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.3em] text-light-primary hover:gap-6 transition-all duration-500">
                    VER DETALLES <ArrowRight size={14} />
                 </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Event Detail Modal Overlay */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[3rem] overflow-hidden max-w-4xl w-full shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto"
            >
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-6 right-6 z-20 p-3 bg-white/20 hover:bg-white/40 text-white md:text-light-text md:bg-light-accent md:hover:bg-light-primary/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>

              {/* Event Image & Date Badge */}
              <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                <img 
                  src={selectedEvent.image} 
                  alt={selectedEvent.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-8 left-8 bg-white px-6 py-3 rounded-2xl shadow-xl">
                  <p className="text-2xl font-bold text-light-primary leading-none">{selectedEvent.date.split(' ')[0]}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{selectedEvent.date.split(' ')[1]}</p>
                </div>
              </div>

              {/* Event Detailed Text & Stats */}
              <div className="flex-1 p-8 md:p-12 space-y-8 overflow-y-auto">
                <div className="space-y-4">
                  <span className="px-4 py-1.5 rounded-full bg-light-primary/5 text-light-primary text-[10px] font-bold uppercase tracking-widest border border-light-primary/10">
                    {selectedEvent.tag}
                  </span>
                  <h3 className="text-4xl md:text-5xl font-heading italic text-light-text leading-tight">{selectedEvent.title}</h3>
                </div>

                <p className="text-sm md:text-base opacity-60 font-body leading-relaxed">
                  {selectedEvent.fullDesc}
                </p>

                {/* Event Metadata Grid */}
                <div className="grid grid-cols-2 gap-6 pt-8 border-t border-light-primary/5">
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold uppercase tracking-[.2em] opacity-30">Ubicación</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-light-text">
                      <MapPin size={14} className="text-light-primary" />
                      {selectedEvent.location}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold uppercase tracking-[.2em] opacity-30">Horario</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-light-text">
                      <Clock size={14} className="text-light-primary" />
                      {selectedEvent.time}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold uppercase tracking-[.2em] opacity-30">Disertante</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-light-text">
                      <Star size={14} className="text-light-primary" />
                      {selectedEvent.instructor}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold uppercase tracking-[.2em] opacity-30">Estado</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-light-text">
                      <Users size={14} className="text-light-primary" />
                      {selectedEvent.stats}
                    </div>
                  </div>
                </div>

                <button className="w-full bg-light-primary text-white py-5 rounded-[2rem] font-bold uppercase tracking-[.3em] text-[10px] shadow-2xl shadow-light-primary/30 hover:brightness-110 transition-all">
                  Reservar mi lugar ahora
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
