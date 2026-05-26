import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Calendar as CalendarIcon,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';

/**
 * BookingCalendarProps Interface
 * Defines the required and optional data to manage bookings in a specific branch.
 */
interface BookingCalendarProps {
  sucursalId: string;
  sucursalName: string;
  onClose: () => void;
  editBookingId?: string;
  initialDate?: string;
  initialSlot?: string;
  onSuccess?: () => void;
}

/**
 * Standard business hours for bookings.
 */
const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00", 
  "19:00", "20:00"
];

/**
 * BookingCalendar Component
 * An interactive scheduling tool that allows users to pick dates and available time slots for a branch.
 * Supports both creating new bookings and editing existing ones.
 */
export const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
    sucursalId, 
    sucursalName, 
    onClose,
    editBookingId,
    initialDate,
    initialSlot,
    onSuccess
}) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  
  // Navigation & Selection State
  const [currentDate, setCurrentDate] = useState(initialDate ? new Date(initialDate) : new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate ? new Date(initialDate) : null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(initialSlot || null);
  
  // Data & UI State
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Helper: Get total days in a month
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  // Helper: Get first day of month (0-6)
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  /**
   * Retrieves already booked time slots for a specific date from the server.
   * @param dateStr ISO date string (YYYY-MM-DD).
   */
  const fetchOccupiedSlots = async (dateStr: string) => {
    try {
      setLoading(true);
      const { data } = await API.get(`/bookings/sucursal/${sucursalId}?date=${dateStr}`);
      
      // If editing, allow selecting the currently booked slot
      const filteredSlots = editBookingId && dateStr === initialDate 
        ? data.filter((s: string) => s !== initialSlot)
        : data;
        
      setOccupiedSlots(filteredSlots);
    } catch (err) {
      console.error("Error fetching slots", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refetches occupied slots whenever the selected date changes.
   */
  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      fetchOccupiedSlots(dateStr);
    }
  }, [selectedDate]);

  /**
   * Handles selecting a specific day in the calendar.
   * Prevents selecting past dates or Sundays (closed).
   * @param day Number of the day (1-31).
   */
  const handleDayClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (date < new Date(new Date().setHours(0,0,0,0))) return;
    if (date.getDay() === 0) return;
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  /**
   * Executes the booking process (POST for new, PUT for update).
   */
  const handleBooking = async () => {
    if (!user) {
      setError("Debes iniciar sesión.");
      return;
    }
    if (!selectedDate || !selectedSlot) return;

    try {
      setLoading(true);
      setError(null);
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      if (editBookingId) {
        await API.put(`/bookings/${editBookingId}`, {
            date: dateStr,
            timeSlot: selectedSlot
          });
      } else {
        await API.post('/bookings', {
          sucursalId,
          date: dateStr,
          timeSlot: selectedSlot
        });
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      // Auto-close after success feedback
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || t('BOOKING.ERRORS.PROCESS'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generates the day elements for the calendar grid.
   */
  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const startDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

    // Empty spacers for previous month's alignment
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 w-full" />);
    }

    // Actual day buttons
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const isPast = date < new Date(new Date().setHours(0,0,0,0));
      const isSunday = date.getDay() === 0;
      const isSelected = selectedDate?.getDate() === d && selectedDate?.getMonth() === currentDate.getMonth() && selectedDate?.getFullYear() === currentDate.getFullYear();

      days.push(
        <button
          key={d}
          disabled={isPast || isSunday}
          onClick={() => handleDayClick(d)}
          className={`h-12 w-full rounded-xl text-xs font-bold transition-all flex items-center justify-center
            ${isSelected ? 'bg-light-primary text-white shadow-lg' : ''}
            ${!isSelected && !isPast && !isSunday ? 'hover:bg-light-primary/5 text-light-text' : ''}
            ${isPast || isSunday ? 'opacity-10 cursor-not-allowed' : ''}
          `}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  // Localization Data
  const monthNames = t('BOOKING.MONTHS', { returnObjects: true }) as string[];
  const dayLabels = t('BOOKING.DAYS', { returnObjects: true }) as string[];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-10"
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 z-10 p-3 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Left Side: Calendar View */}
        <div className="w-full md:w-1/2 p-8 md:p-12 border-r border-light-primary/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-heading italic">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                className="p-2 hover:bg-light-primary/5 rounded-full"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                className="p-2 hover:bg-light-primary/5 rounded-full"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4 text-center">
            {dayLabels.map((day, i) => (
              <span key={`${day}-${i}`} className="text-[10px] font-bold uppercase opacity-30">{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>
        </div>

        {/* Right Side: Slot Selection & Checkout */}
        <div className="flex-1 p-8 md:p-12 flex flex-col bg-light-accent/5">
          {success ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-heading italic">{editBookingId ? t('BOOKING.SUCCESS_TITLE_EDIT') : t('BOOKING.SUCCESS_TITLE')}</h3>
                <p className="opacity-60 text-sm italic">{t('BOOKING.SUCCESS_TEXT', { name: sucursalName })}</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <span className="text-[10px] font-bold uppercase tracking-[.3em] text-light-primary block mb-2">
                  {editBookingId ? t('BOOKING.MODIFYING_IN') : t('BOOKING.RESERVING_IN')}
                </span>
                <h2 className="text-3xl font-heading italic leading-tight">{sucursalName}</h2>
              </div>

              {!selectedDate ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center space-y-4">
                    <CalendarIcon size={48} />
                    <p className="font-heading italic">{t('BOOKING.CALENDAR_SELECT')}</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-6">
                        {selectedDate.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {TIME_SLOTS.map(slot => {
                            const isOccupied = occupiedSlots.includes(slot);
                            const isSelected = selectedSlot === slot;
                            return (
                                <button
                                    key={slot}
                                    disabled={isOccupied || loading}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`py-4 rounded-xl text-xs font-bold transition-all border
                                        ${isSelected ? 'bg-light-primary text-white border-light-primary shadow-lg' : 'bg-white border-light-primary/5 text-light-text hover:border-light-primary/30'}
                                        ${isOccupied ? 'opacity-20 bg-black/5 cursor-not-allowed border-transparent line-through' : ''}
                                    `}
                                >
                                    <Clock size={12} className="inline mr-2" /> {slot}
                                </button>
                            );
                        })}
                    </div>
                </div>
              )}

              <div className="mt-10 space-y-6">
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                        <AlertCircle size={14} className="flex-shrink-0" />
                        {error}
                    </div>
                )}

                <button
                    disabled={!selectedSlot || loading}
                    onClick={handleBooking}
                    className="w-full bg-light-primary text-white py-5 rounded-2xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-4 hover:brightness-110 transition-all shadow-xl shadow-light-primary/20 disabled:opacity-30"
                >
                    {loading ? <RefreshCw className="animate-spin" size={18} /> : (editBookingId ? t('BOOKING.UPDATE_RESERVE') : t('BOOKING.CONFIRM_RESERVE'))}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
