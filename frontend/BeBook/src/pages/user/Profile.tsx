import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  User as UserIcon, 
  Shield, 
  CreditCard,
  History,
  TrendingUp,
  Check,
  X,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';

// Component Imports
import { GeneralTab } from './components/GeneralTab';
import { BookingsTab } from './components/BookingsTab';
import { MembershipTab } from './components/MembershipTab';
import { HistoryTab } from './components/HistoryTab';
import { StatsTab } from './components/StatsTab';
import { SecurityTab } from './components/SecurityTab';
import { BookingCalendar } from '../../components/BookingCalendar';
import CustomDialog from '../../components/CustomDialog';

/**
 * Profile Page Component
 * Central hub for user management including personal info, bookings, payments, and activity history.
 */
export const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  
  // UI & Navigation State
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Dialog & Modal State
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm' | 'success';
    onConfirm?: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'alert' });
  
  // Data States
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Form States (General)
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Booking Edit State
  const [editingBooking, setEditingBooking] = useState<any>(null);

  // Payment States
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [paymentMethodType, setPaymentMethodType] = useState<'CARD' | 'MERCADO_PAGO'>('CARD');
  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvv: '', name: '', cardType: 'Mastercard' });
  const [newMP, setNewMP] = useState({ email: '' });

  /**
   * Fetches all necessary user data for the profile page.
   */
  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([
        API.get('/users/profile'),
        API.get('/orders/myorders'),
        API.get('/bookings/mybookings'),
        API.get('/users/activities'),
        API.get('/users/stats')
      ]);

      if (results[0].status === 'fulfilled') setFullProfile(results[0].value.data);
      if (results[1].status === 'fulfilled') setOrders(results[1].value.data);
      if (results[2].status === 'fulfilled') setBookings(results[2].value.data);
      if (results[3].status === 'fulfilled') setActivities(results[3].value.data);
      if (results[4].status === 'fulfilled') setStats(results[4].value.data);
      
    } catch (err) {
      console.error("Error fetching profile data", err);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatar(user.avatar || '');
      fetchData();
    }
  }, [user]);

  /**
   * Updates basic user profile info or security settings.
   */
  const handleUpdateProfile = async (e: React.FormEvent, dataToUpdate?: any) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const payload = dataToUpdate || { name, email, avatar };
      const { data } = await API.put('/users/profile', payload);
      updateUser({ ...data, token: user?.token });
      setFullProfile(data);
      setMsg({ type: 'success', text: 'Operación realizada con éxito' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error al actualizar' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancels a specific booking after confirmation.
   */
  const cancelBooking = (id: string) => {
    setDialog({
      isOpen: true,
      title: 'Cancelar Turno',
      message: '¿Estás seguro de que deseas cancelar este turno? Esta acción no se puede deshacer.',
      type: 'confirm',
      onConfirm: async () => {
        try {
          setLoading(true);
          await API.delete(`/bookings/${id}`);
          setDialog(prev => ({ ...prev, isOpen: false }));
          setMsg({ type: 'success', text: 'Turno cancelado exitosamente' });
          fetchData();
        } catch (err) {
          setMsg({ type: 'error', text: 'Error al cancelar el turno' });
          setDialog(prev => ({ ...prev, isOpen: false }));
        } finally {
          setLoading(false);
        }
      }
    });
  };

  /**
   * Adds or updates a payment method.
   */
  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let paymentMethod;
      if (paymentMethodType === 'CARD') {
        const lastFour = newCard.number.replace(/\s/g, '').slice(-4);
        paymentMethod = {
          methodType: 'CARD',
          cardType: newCard.cardType,
          lastFour,
          cardNumber: newCard.number,
          expiry: newCard.expiry,
          cvv: newCard.cvv,
          holderName: newCard.name,
        };
      } else {
        paymentMethod = { methodType: 'MERCADO_PAGO', emailMP: newMP.email };
      }

      let data;
      if (editingPayment) {
        const response = await API.put(`/users/payments/${editingPayment._id}`, paymentMethod);
        data = response.data;
        setMsg({ type: 'success', text: 'Método de pago actualizado' });
      } else {
        const response = await API.post('/users/payments', paymentMethod);
        data = response.data;
        setMsg({ type: 'success', text: 'Método de pago agregado' });
      }

      setFullProfile({ ...fullProfile, paymentMethods: data });
      setShowAddCard(false);
      setEditingPayment(null);
      setNewCard({ number: '', expiry: '', cvv: '', name: '', cardType: 'Mastercard' });
      setNewMP({ email: '' });
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Error al procesar método de pago' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletes a payment method after confirmation.
   */
  const handleDeletePaymentMethod = async (id: string) => {
    setDialog({
      isOpen: true,
      title: t('PROFILE.MEMBERSHIP.MODAL.DELETE_TITLE') || 'Eliminar Método',
      message: t('PROFILE.MEMBERSHIP.MODAL.DELETE_CONFIRM'),
      type: 'confirm',
      onConfirm: async () => {
        try {
          setLoading(true);
          const { data } = await API.delete(`/users/payments/${id}`);
          setFullProfile({ ...fullProfile, paymentMethods: data });
          setMsg({ type: 'success', text: t('PROFILE.MEMBERSHIP.MODAL.SUCCESS_DELETE') });
          setDialog(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          setMsg({ type: 'error', text: 'Error al eliminar' });
          setDialog(prev => ({ ...prev, isOpen: false }));
        } finally {
          setLoading(false);
        }
      }
    });
  };

  /**
   * Sets a payment method as the default one.
   */
  const handleSetDefaultPaymentMethod = async (id: string) => {
    setLoading(true);
    try {
      const { data } = await API.put(`/users/payments/${id}`, { isDefault: true });
      setFullProfile({ ...fullProfile, paymentMethods: data });
      setMsg({ type: 'success', text: t('PROFILE.MEMBERSHIP.MODAL.SUCCESS_UPDATE') });
    } catch (err) {
      setMsg({ type: 'error', text: 'Error al actualizar' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Prepares the UI to edit an existing payment method.
   */
  const openEditPayment = (method: any) => {
    setEditingPayment(method);
    setPaymentMethodType(method.methodType);
    if (method.methodType === 'CARD') {
      setNewCard({
        number: method.cardNumber || '',
        expiry: method.expiry || '',
        cvv: method.cvv || '',
        name: method.holderName || '',
        cardType: method.cardType || 'Mastercard'
      });
    } else {
      setNewMP({ email: method.emailMP || '' });
    }
    setShowAddCard(true);
  };

  /**
   * Synchronizes activity history from various content types.
   */
  const handleSyncHistory = async () => {
    setLoading(true);
    try {
      const { data } = await API.post('/users/activities/sync');
      setMsg({ type: 'success', text: data.message });
      fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Error al sincronizar historial' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maps activity types to human-readable translated strings.
   */
  const translateActivity = (activity: any) => {
    const { type, metadata, description, amount } = activity;
    if (type && metadata) return t(`PROFILE.HISTORY.LOGS.${type}`, { ...metadata, amount });
    return description;
  };

  const TABS = [
    { id: 'general', label: t('PROFILE.TABS.GENERAL'), icon: <UserIcon size={16} /> },
    { id: 'turnos', label: t('PROFILE.TABS.BOOKINGS'), icon: <CalendarIcon size={16} /> },
    { id: 'membresia', label: t('PROFILE.TABS.MEMBERSHIP'), icon: <CreditCard size={16} /> },
    { id: 'historial', label: t('PROFILE.TABS.HISTORY'), icon: <History size={16} /> },
    { id: 'stats', label: t('PROFILE.TABS.STATS'), icon: <TrendingUp size={16} /> },
    { id: 'seguridad', label: t('PROFILE.TABS.SECURITY'), icon: <Shield size={16} /> },
  ];

  if (!user) return null;

  return (
    <section className="min-h-screen pt-32 pb-20 px-4 bg-light-bg">
      <CustomDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={dialog.onConfirm}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
      />

      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <span className="text-[10px] font-bold tracking-[.4em] uppercase text-light-primary opacity-60 block mb-2">{t('PROFILE.SUBTITLE')}</span>
            <h2 className="text-5xl md:text-6xl font-heading italic tracking-tighter text-light-text">{t('PROFILE.TITLE')}</h2>
          </div>
          <AnimatePresence>
            {msg && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 ${msg.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {msg.type === 'success' ? <Check size={14} /> : <X size={14} />} {msg.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-1/4 space-y-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMsg(null); }}
                className={`w-full flex items-center gap-4 px-6 py-4 text-xs font-bold tracking-widest uppercase transition-all rounded-2xl ${activeTab === tab.id ? 'bg-light-primary text-white shadow-xl shadow-light-primary/20' : 'hover:bg-light-primary/10 opacity-60 hover:opacity-100 bg-white border border-light-primary/5'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            <div className="bg-white border border-light-primary/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl min-h-[600px]">
              <AnimatePresence mode="wait">
                {activeTab === 'general' && (
                  <GeneralTab 
                    user={user} name={name} setName={setName} email={email} setEmail={setEmail} 
                    avatar={avatar} setAvatar={setAvatar} loading={loading} onUpdate={handleUpdateProfile} 
                  />
                )}
                {activeTab === 'turnos' && (
                  <BookingsTab bookings={bookings} onEdit={setEditingBooking} onCancel={cancelBooking} />
                )}
                {activeTab === 'membresia' && (
                  <MembershipTab 
                    fullProfile={fullProfile} showAddCard={showAddCard} setShowAddCard={setShowAddCard} 
                    editingPayment={editingPayment} setEditingPayment={setEditingPayment}
                    paymentMethodType={paymentMethodType} setPaymentMethodType={setPaymentMethodType}
                    newCard={newCard} setNewCard={setNewCard} newMP={newMP} setNewMP={setNewMP}
                    loading={loading} onAddPayment={handleAddPaymentMethod}
                    onDeletePayment={handleDeletePaymentMethod} onSetDefaultPayment={handleSetDefaultPaymentMethod}
                    openEditPayment={openEditPayment}
                  />
                )}
                {activeTab === 'historial' && (
                  <HistoryTab 
                    activities={activities} loading={loading} onSync={handleSyncHistory} 
                    translateActivity={translateActivity} language={i18n.language} 
                  />
                )}
                {activeTab === 'stats' && (
                  <StatsTab stats={stats} language={i18n.language} />
                )}
                {activeTab === 'seguridad' && (
                  <SecurityTab onUpdate={handleUpdateProfile} loading={loading} />
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

      {/* Booking Calendar Modal */}
      <AnimatePresence>
        {editingBooking && (
          <BookingCalendar 
            sucursalId={editingBooking.sucursal?._id || editingBooking.sucursal}
            sucursalName={editingBooking.sucursal?.name || 'Sede BeBook'}
            onClose={() => { setEditingBooking(null); fetchData(); }}
            editBookingId={editingBooking._id}
            initialDate={editingBooking.date}
            initialSlot={editingBooking.timeSlot}
            onSuccess={fetchData}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Profile;
