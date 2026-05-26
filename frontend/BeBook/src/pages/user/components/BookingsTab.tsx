import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, MapPin, Edit3, Trash2 } from 'lucide-react';

interface BookingsTabProps {
  bookings: any[];
  onEdit: (booking: any) => void;
  onCancel: (id: string) => void;
}

/**
 * BookingsTab Component
 * Displays a list of user reservations and an activity calendar.
 */
export const BookingsTab: React.FC<BookingsTabProps> = ({
  bookings,
  onEdit,
  onCancel
}) => {
  return (
    <motion.div 
      key="turnos" 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="space-y-10"
    >
      <div className="space-y-2">
        <h3 className="text-2xl font-heading italic text-light-text">Mis Reservas</h3>
        <p className="text-xs opacity-50 font-body text-light-text">Gestiona tus visitas a nuestras sedes BeBook.</p>
      </div>

      <div className="space-y-6">
        {bookings.length === 0 ? (
          <div className="py-20 text-center opacity-30 italic text-light-text flex flex-col items-center gap-4">
            <CalendarIcon size={48} />
            <p>No tienes turnos programados.</p>
          </div>
        ) : (
          bookings.map((booking: any) => (
            <div 
              key={booking._id} 
              className="p-8 rounded-3xl bg-light-accent border border-light-primary/5 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-light-primary/20 transition-all"
            >
              <div className="flex items-center gap-8 w-full md:w-auto">
                {/* Date Badge */}
                <div className="w-16 h-16 rounded-2xl bg-light-primary flex flex-col items-center justify-center text-white shadow-xl">
                  <span className="text-[10px] font-bold uppercase opacity-60">
                    {new Date(booking.date + 'T12:00:00').toLocaleDateString('es-ES', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-bold leading-none">
                    {new Date(booking.date + 'T12:00:00').getDate()}
                  </span>
                </div>
                {/* Booking Info */}
                <div className="space-y-1">
                  <h4 className="text-xl font-heading italic text-light-text">{booking.sucursal?.name || 'Sede BeBook'}</h4>
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-40">
                    <div className="flex items-center gap-1"><Clock size={10} /> {booking.timeSlot} hs</div>
                    <div className="flex items-center gap-1"><MapPin size={10} /> {booking.sucursal?.city}</div>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-4 w-full md:w-auto">
                <button 
                  onClick={() => onEdit(booking)}
                  className="flex-1 md:flex-none p-4 rounded-xl border border-light-primary/10 hover:bg-light-primary hover:text-white transition-all text-light-primary"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => onCancel(booking._id)}
                  className="flex-1 md:flex-none p-4 rounded-xl border border-red-100 hover:bg-red-500 hover:text-white transition-all text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Activity Calendar Visualization */}
      <div className="pt-10 border-t border-light-primary/5">
        <h4 className="text-[10px] font-bold uppercase tracking-[.3em] opacity-40 mb-8">Calendario de Actividad</h4>
        <div className="p-8 rounded-[2rem] bg-white border border-light-primary/5 shadow-xl">
          <div className="grid grid-cols-7 gap-1 text-center">
            {['D','L','M','M','J','V','S'].map((d, i) => (
              <div key={`${d}-${i}`} className="text-[8px] font-bold opacity-30 py-2">{d}</div>
            ))}
            {[...Array(35)].map((_, i) => {
              const day = i - 2; // Simulated day offset
              const hasBooking = bookings.some(b => new Date(b.date + 'T12:00:00').getDate() === day);
              return (
                <div 
                  key={`day-${i}`} 
                  className={`aspect-square flex items-center justify-center text-[10px] font-bold rounded-lg ${
                    hasBooking ? 'bg-light-primary text-white shadow-md' : 'opacity-10'
                  }`}
                >
                  {day > 0 && day <= 30 ? day : ''}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
