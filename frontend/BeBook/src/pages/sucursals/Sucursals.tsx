import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Globe,
  X,
  Calendar,
  Star,
  ExternalLink,
  Edit3,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BookOpen,
  Bookmark,
  Library,
  Book,
  GraduationCap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { BookingCalendar } from '../../components/BookingCalendar';
import CommentSection from '../../components/CommentSection';

interface Sucursal {
  _id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  location: {
    coordinates: number[]; // [lng, lat]
  };
  services: string[];
  image: string; // Now used for icon names
  rating: number;
  numReviews: number;
}

interface Booking {
    _id: string;
    sucursal: string | any;
    date: string;
    timeSlot: string;
}

// Icon mapper for dynamic Lucide icons
const IconComponent = ({ name, className }: { name: string, className?: string }) => {
    const icons: any = {
        BookOpen: <BookOpen className={className} />,
        Bookmark: <Bookmark className={className} />,
        Library: <Library className={className} />,
        MapPin: <MapPin className={className} />,
        Book: <Book className={className} />,
        GraduationCap: <GraduationCap className={className} />
    };
    return icons[name] || <Library className={className} />;
};

export const Sucursals: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  
  const translateName = (name: string) => {
    // If it's a generated name like "Biblioteca Norte" or "Santuario BeBook Centro"
    return name.split(' ').map(word => {
        const translation = t(`LOCATIONS.NAMES.${word}`);
        return translation.includes('LOCATIONS.NAMES') ? word : translation;
    }).join(' ');
  };

  const translateService = (service: string) => {
    const translation = t(`LOCATIONS.SERVICES.${service}`);
    return translation.includes('LOCATIONS.SERVICES') ? service : translation;
  };

  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [activeProvince, setActiveProvince] = useState<string>('Todas');
  const [provinces, setProvinces] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  
  const [notification, setNotification] = useState<{type: 'info' | 'success' | 'error', text: string} | null>(null);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  const fetchProvinces = async () => {
    try {
      const { data } = await API.get('/sucursales/provinces');
      setProvinces(data);
    } catch (error) {
      console.error("Error fetching provinces", error);
    }
  };

  const fetchMyBookings = async () => {
    if (!user) return;
    try {
        const { data } = await API.get('/bookings/mybookings');
        setMyBookings(data);
    } catch (error) {
        console.error("Error fetching my bookings", error);
    }
  };

  // Update fetchSucursales to handle 'Todas' internally but send empty or correct param
  const fetchSucursales = async () => {
    try {
      setLoading(true);
      let provinceParam = activeProvince === 'Todas' ? '' : activeProvince;
      let url = `/sucursales?keyword=${keyword}&province=${provinceParam}&pageNumber=${page}`;
      if (userCoords) {
        url += `&lat=${userCoords.lat}&lng=${userCoords.lng}`;
      }
      const { data } = await API.get(url);
      setSucursales(data.sucursales || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching sucursales", error);
      setSucursales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvinces();
    fetchMyBookings();
  }, [user]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSucursales();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [keyword, activeProvince, page, userCoords]);

  useEffect(() => {
    setPage(1);
  }, [keyword, activeProvince, userCoords]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLocateMe = () => {
    if (userCoords) {
        setUserCoords(null);
        setKeyword("");
        showNotify('info', t('LOCATIONS.PROXIMITY_DEACTIVATED'));
        return;
    }

    setIsLocating(true);
    showNotify('info', t('LOCATIONS.REQUESTING_ACCESS'));

    if (!navigator.geolocation) {
      showNotify('error', t('LOCATIONS.GEOLOCATION_NOT_SUPPORTED'));
      setIsLocating(false);
      return;
    }

    const options = { enableHighAccuracy: false, timeout: 5000, maximumAge: Infinity };

    const successCallback = (position: GeolocationPosition) => {
      setUserCoords({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      setKeyword(t('LOCATIONS.NEAR_ME')); 
      setIsLocating(false);
      showNotify('success', t('LOCATIONS.LOCATION_DETECTED'));
    };

    const ipFallback = async () => {
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            if (data.latitude && data.longitude) {
                setUserCoords({ lat: data.latitude, lng: data.longitude });
                setKeyword(t('LOCATIONS.NEAR_ME'));
                setIsLocating(false);
                showNotify('success', t('LOCATIONS.IP_FALLBACK_SUCCESS', { city: data.city }));
            } else {
                throw new Error("Invalid IP data");
            }
        } catch (err) {
            setIsLocating(false);
            showNotify('error', t('LOCATIONS.LOCATION_ERROR'));
        }
    };

    const errorCallback = (error: GeolocationPositionError) => {
      if (error.code === 2 || error.code === 3) {
        ipFallback();
        return;
      }
      setIsLocating(false);
      let errorMsg = t('LOCATIONS.LOCATION_ERROR');
      if (error.code === 1) errorMsg = t('LOCATIONS.ACCESS_DENIED');
      showNotify('error', errorMsg);
    };

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
  };

  const showNotify = (type: 'info' | 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const openGoogleMaps = (suc: Sucursal) => {
    const [lng, lat] = suc.location.coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const getExistingBooking = (sucId: string) => {
    return myBookings.find(b => {
        if (!b.sucursal) return false;
        const id = typeof b.sucursal === 'string' ? b.sucursal : b.sucursal._id;
        return id === sucId;
    });
  };

  return (
    <section className="min-h-screen pt-32 pb-20 px-4 bg-light-bg">
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-24 left-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-4 border min-w-[320px]"
            style={{ 
                backgroundColor: notification.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : notification.type === 'success' ? 'rgba(22, 163, 74, 0.9)' : 'rgba(11, 41, 42, 0.9)',
                borderColor: 'rgba(255,255,255,0.1)',
                color: 'white'
            }}
          >
            {notification.type === 'error' ? <AlertCircle size={20} /> : notification.type === 'success' ? <CheckCircle2 size={20} /> : <Navigation size={20} className="animate-pulse" />}
            <span className="text-xs font-bold uppercase tracking-widest">{notification.text}</span>
            <button onClick={() => setNotification(null)} className="ml-auto opacity-50 hover:opacity-100"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl">
            <span className="text-[10px] font-bold tracking-[.4em] uppercase text-light-primary block mb-2">{t('LOCATIONS.SUBTITLE')}</span>
            <h2 className="text-6xl md:text-7xl font-heading italic tracking-tighter">{t('LOCATIONS.TITLE')}</h2>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest opacity-40">
                {userCoords ? "Ordenado por proximidad • " : ""}
                {t('LOCATIONS.FOUND_COUNT', { count: total })}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
            <div className="relative group min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-light-primary transition-colors" size={20} />
              <input type="text" placeholder={t('LOCATIONS.SEARCH_PLACEHOLDER')} value={keyword === t('LOCATIONS.NEAR_ME') ? "" : keyword} onChange={(e) => { setKeyword(e.target.value); if (userCoords) setUserCoords(null); }} className="w-full bg-white border border-light-primary/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 ring-light-primary/20 transition-all font-body italic" />
            </div>
            
            <div className="relative group">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
              <select value={activeProvince} onChange={(e) => { setActiveProvince(e.target.value); if (userCoords) setUserCoords(null); }} className="w-full sm:w-64 appearance-none bg-white border border-light-primary/10 rounded-2xl py-4 pl-12 pr-10 focus:ring-2 ring-light-primary/20 transition-all font-body italic cursor-pointer">
                <option value="Todas">{t('LOCATIONS.ALL_PROVINCES')}</option>
                {provinces.map(prov => <option key={prov} value={prov}>{prov}</option>)}
              </select>
            </div>

            <button onClick={handleLocateMe} disabled={isLocating} className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold tracking-widest uppercase text-[10px] shadow-xl transition-all ${userCoords ? 'bg-green-600 text-white shadow-green-600/20' : 'bg-light-primary text-white shadow-light-primary/20 hover:brightness-110'}`}>
              {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
              {isLocating ? t('LOCATIONS.LOCATING') : userCoords ? t('LOCATIONS.LOCATION_ACTIVE') : t('LOCATIONS.NEAR_ME')}
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            [1,2,3,4,5,6].map(i => <div key={i} className="aspect-video bg-white rounded-[2rem] animate-pulse" />)
          ) : (
            <AnimatePresence mode="popLayout">
              {sucursales.map((suc) => (
                <motion.div
                  key={suc._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl group flex flex-col border border-light-primary/5 cursor-pointer"
                  onClick={() => setSelectedSucursal(suc)}
                >
                  <div className="relative h-64 overflow-hidden bg-light-accent/10 flex items-center justify-center p-12">
                    <IconComponent 
                        name={suc.image} 
                        className="w-32 h-32 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-in-out text-light-primary" 
                    />
                    <div className="absolute top-6 left-6">
                      <span className="px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest bg-light-primary text-white shadow-lg shadow-light-primary/20">{suc.province}</span>
                    </div>
                    {getExistingBooking(suc._id) && (
                        <div className="absolute top-6 right-6">
                            <span className="px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest bg-green-500 text-white shadow-lg">{t('LOCATIONS.BOOKED_TURN')}</span>
                        </div>
                    )}
                  </div>

                  <div className="p-10 flex-1 flex flex-col">
                    <div className="flex-1 space-y-6">
                      <div>
                        <h3 className="text-2xl font-heading italic mb-2">{translateName(suc.name)}</h3>
                        <div className="flex items-start gap-3 opacity-60">
                          <MapPin size={16} className="mt-1 flex-shrink-0 text-light-primary" />
                          <div className="text-sm italic leading-relaxed">
                            <p className="font-bold text-light-text opacity-100 not-italic">{suc.address}</p>
                            <p>{suc.city}, {suc.province}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {suc.services.map((service, idx) => (
                          <span key={idx} className="px-3 py-1 bg-light-accent text-[8px] font-bold uppercase tracking-widest rounded-full opacity-60 group-hover:opacity-100 transition-opacity">
                            {translateService(service)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button className="mt-10 w-full py-4 border border-light-primary/20 hover:bg-light-primary hover:text-white rounded-xl font-bold tracking-widest uppercase text-[10px] transition-all flex items-center justify-center gap-3">{t('LOCATIONS.ENTER')}</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {pages > 1 && (
          <div className="mt-20 flex justify-center items-center gap-4">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="p-4 rounded-full border border-light-primary/10 hover:bg-light-primary hover:text-white transition-all disabled:opacity-20 disabled:hover:bg-transparent"><ChevronLeft size={20} /></button>
            <div className="flex gap-2">
              {[...Array(pages)].map((_, i) => {
                const pageNum = i + 1;
                if (pages > 7 && pageNum !== 1 && pageNum !== pages && Math.abs(pageNum - page) > 1) {
                  if (pageNum === 2 || pageNum === pages - 1) return <span key={pageNum} className="px-2 opacity-30">...</span>;
                  return null;
                }
                return <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`w-12 h-12 rounded-full text-xs font-bold transition-all ${page === pageNum ? 'bg-light-primary text-white shadow-lg' : 'hover:bg-light-primary/5 opacity-60'}`}>{pageNum}</button>;
              })}
            </div>
            <button onClick={() => handlePageChange(page + 1)} disabled={page === pages} className="p-4 rounded-full border border-light-primary/10 hover:bg-light-primary hover:text-white transition-all disabled:opacity-20 disabled:hover:bg-transparent"><ChevronRight size={20} /></button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedSucursal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedSucursal(null)} />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-5xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[85vh]">
              <button onClick={() => setSelectedSucursal(null)} className="absolute top-8 right-8 z-10 p-3 rounded-full bg-black/5 hover:bg-black/10 transition-colors"><X size={20} /></button>
              <div className="w-full md:w-1/2 h-64 md:h-auto bg-light-accent/10 flex items-center justify-center p-20">
                <IconComponent name={selectedSucursal.image} className="w-48 h-48 text-light-primary opacity-40" />
              </div>
              <div className="flex-1 p-8 md:p-16 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-8">
                  <div>
                    <span className="text-xs font-bold tracking-[.4em] uppercase text-light-primary mb-4 block">{selectedSucursal.province}</span>
                    <h2 className="text-5xl font-heading italic leading-tight mb-4">{translateName(selectedSucursal.name)}</h2>
                    <div className="flex items-start gap-4 pt-4">
                        <MapPin className="text-light-primary mt-1" size={20} />
                        <div>
                            <p className="font-bold text-lg">{selectedSucursal.address}</p>
                            <p className="opacity-60 italic">{selectedSucursal.city}, {selectedSucursal.province}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-yellow-500">
                          {[1,2,3,4,5].map(s => (
                            <Star 
                              key={s} 
                              size={14} 
                              fill={s <= Math.round(selectedSucursal.rating) ? "currentColor" : "none"} 
                              className={s <= Math.round(selectedSucursal.rating) ? "text-yellow-500" : "text-gray-300"}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-bold opacity-60">({selectedSucursal.rating})</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('COMENTARIOS.COUNT', { count: selectedSucursal.numReviews })}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-y border-light-primary/10">
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-2"><Clock size={12} /> {t('LOCATIONS.HOURS')}</span>
                        <p className="text-sm font-bold">{t('LOCATIONS.SCHEDULE_DAYS')}</p>
                    </div>
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-2"><Phone size={12} /> {t('LOCATIONS.CONTACT')}</span>
                        <p className="text-sm font-bold">{selectedSucursal.phone}</p>
                    </div>
                  </div>

                  {/* Comment Section */}
                  <CommentSection sucursalId={selectedSucursal._id} />
                </div>
                <div className="mt-12 flex flex-col sm:flex-row items-center gap-6">
                  <button onClick={() => openGoogleMaps(selectedSucursal)} className="w-full sm:w-auto flex-1 bg-white border border-light-primary text-light-primary py-5 rounded-2xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-4 hover:bg-light-primary/5 transition-all"><ExternalLink size={18} /> {t('LOCATIONS.VIEW_MAP')}</button>
                  {getExistingBooking(selectedSucursal._id) ? (
                    <button onClick={() => setShowBooking(true)} className="w-full sm:w-auto flex-1 bg-green-600 text-white py-5 rounded-2xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-4 hover:brightness-110 transition-all shadow-xl shadow-green-600/20"><Edit3 size={18} /> {t('LOCATIONS.MODIFY_TURN')}</button>
                  ) : (
                    <button onClick={() => setShowBooking(true)} className="w-full sm:w-auto flex-1 bg-light-primary text-white py-5 rounded-2xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-4 hover:brightness-110 transition-all shadow-xl shadow-light-primary/20"><Calendar size={18} /> {t('LOCATIONS.BOOK_TURN')}</button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBooking && selectedSucursal && (
          <BookingCalendar sucursalId={selectedSucursal._id} sucursalName={selectedSucursal.name} onClose={() => { setShowBooking(false); fetchMyBookings(); }} editBookingId={getExistingBooking(selectedSucursal._id)?._id} initialDate={getExistingBooking(selectedSucursal._id)?.date} initialSlot={getExistingBooking(selectedSucursal._id)?.timeSlot} onSuccess={fetchMyBookings} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Sucursals;
