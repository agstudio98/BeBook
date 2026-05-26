import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Smartphone, CreditCard, Trash2, Edit3, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MembershipTabProps {
  fullProfile: any;
  showAddCard: boolean;
  setShowAddCard: (val: boolean) => void;
  editingPayment: any;
  setEditingPayment: (val: any) => void;
  paymentMethodType: 'CARD' | 'MERCADO_PAGO';
  setPaymentMethodType: (val: 'CARD' | 'MERCADO_PAGO') => void;
  newCard: any;
  setNewCard: (val: any) => void;
  newMP: any;
  setNewMP: (val: any) => void;
  loading: boolean;
  onAddPayment: (e: React.FormEvent) => void;
  onDeletePayment: (id: string) => void;
  onSetDefaultPayment: (id: string) => void;
  openEditPayment: (method: any) => void;
}

/**
 * MembershipTab Component
 * Manages user payment methods, including adding, editing, and deleting cards or Mercado Pago accounts.
 */
export const MembershipTab: React.FC<MembershipTabProps> = ({
  fullProfile,
  showAddCard,
  setShowAddCard,
  editingPayment,
  setEditingPayment,
  paymentMethodType,
  setPaymentMethodType,
  newCard,
  setNewCard,
  newMP,
  setNewMP,
  loading,
  onAddPayment,
  onDeletePayment,
  onSetDefaultPayment,
  openEditPayment
}) => {
  const { t } = useTranslation();

  return (
    <motion.div 
      key="membresia" 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="space-y-12"
    >
      {/* Tab Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h3 className="text-2xl font-heading italic text-light-text">{t('PROFILE.MEMBERSHIP.TITLE')}</h3>
          <p className="text-xs opacity-50 font-body text-light-text">{t('PROFILE.MEMBERSHIP.SUBTITLE')}</p>
        </div>
      </div>

      <div className="space-y-12">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-bold uppercase tracking-[.3em] opacity-40">
              {t('PROFILE.MEMBERSHIP.MY_METHODS')}
            </h4>
            <button 
              onClick={() => setShowAddCard(true)}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-light-primary"
            >
              <Wallet size={14} /> {t('PROFILE.MEMBERSHIP.ADD_NEW')}
            </button>
          </div>

          {/* Payment Methods List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fullProfile?.paymentMethods?.length > 0 ? (
              fullProfile.paymentMethods.map((m: any, i: number) => (
                <div 
                  key={m._id || i} 
                  className={`p-6 rounded-3xl border transition-all relative group overflow-hidden ${
                    m.isDefault ? 'bg-white border-light-primary/30 shadow-lg' : 'bg-light-accent border-light-primary/5 hover:border-light-primary/20'
                  }`}
                >
                  {/* Decorative Background Icon */}
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                    {m.methodType === 'MERCADO_PAGO' ? <Smartphone size={40} /> : <CreditCard size={40} />}
                  </div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        {/* Icon Badge */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                          m.isDefault ? 'bg-light-primary text-white' : 'bg-white text-light-primary'
                        }`}>
                          {m.methodType === 'MERCADO_PAGO' ? <Smartphone size={18} /> : <CreditCard size={18} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-light-text">
                            {m.methodType === 'MERCADO_PAGO' ? 'Mercado Pago' : m.cardType}
                          </p>
                          <p className="text-xs font-body italic opacity-40">
                            {m.methodType === 'MERCADO_PAGO' ? m.emailMP : `**** **** **** ${m.lastFour}`}
                          </p>
                        </div>
                      </div>
                      {/* Default Tag / Set Default Action */}
                      {m.isDefault ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[8px] font-bold uppercase tracking-tighter">
                          {t('PROFILE.MEMBERSHIP.PRINCIPAL')}
                        </span>
                      ) : (
                        <button 
                          onClick={() => onSetDefaultPayment(m._id)}
                          className="text-[8px] font-bold uppercase tracking-widest text-light-primary hover:underline"
                        >
                          {t('PROFILE.MEMBERSHIP.SET_DEFAULT')}
                        </button>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditPayment(m)}
                        className="p-2 text-light-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-light-primary/5 rounded-xl"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => onDeletePayment(m._id)}
                        className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-12 text-center border-2 border-dashed border-light-primary/5 rounded-[2rem] opacity-30 italic text-xs">
                {t('PROFILE.MEMBERSHIP.EMPTY_METHODS')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Payment Method Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-heading italic text-light-text">
                {editingPayment ? 'Editar Método de Pago' : t('PROFILE.MEMBERSHIP.MODAL.TITLE')}
              </h3>
              <button 
                onClick={() => { setShowAddCard(false); setEditingPayment(null); }} 
                className="p-2 hover:bg-light-accent rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Type Selector */}
            <div className="flex bg-light-accent p-1 rounded-2xl">
              <button 
                disabled={!!editingPayment}
                onClick={() => setPaymentMethodType('CARD')}
                className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                  paymentMethodType === 'CARD' ? 'bg-white shadow-md text-light-primary' : 'opacity-40'
                } ${editingPayment ? 'cursor-not-allowed' : ''}`}
              >
                {t('PROFILE.MEMBERSHIP.MODAL.CARD')}
              </button>
              <button 
                disabled={!!editingPayment}
                onClick={() => setPaymentMethodType('MERCADO_PAGO')}
                className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                  paymentMethodType === 'MERCADO_PAGO' ? 'bg-white shadow-md text-light-primary' : 'opacity-40'
                } ${editingPayment ? 'cursor-not-allowed' : ''}`}
              >
                {t('PROFILE.MEMBERSHIP.MODAL.MERCADO_PAGO')}
              </button>
            </div>

            <form onSubmit={onAddPayment} className="space-y-6">
              {paymentMethodType === 'CARD' ? (
                <div className="space-y-4">
                  {/* Card Holder Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-2">
                      Nombre en la tarjeta
                    </label>
                    <input 
                      type="text" 
                      placeholder="JUAN PEREZ"
                      value={newCard.name}
                      onChange={(e) => setNewCard({...newCard, name: e.target.value.toUpperCase()})}
                      className="w-full bg-light-accent border-none rounded-2xl py-4 px-6 focus:ring-2 ring-light-primary/20 font-body italic"
                    />
                  </div>
                  {/* Card Type Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-2">
                      {t('PROFILE.MEMBERSHIP.MODAL.CARD_TYPE')}
                    </label>
                    <select 
                      value={newCard.cardType}
                      onChange={(e) => setNewCard({...newCard, cardType: e.target.value})}
                      className="w-full bg-light-accent border-none rounded-2xl py-4 px-6 focus:ring-2 ring-light-primary/20 font-body italic"
                    >
                      <option value="Mastercard">Mastercard</option>
                      <option value="Visa">Visa</option>
                      <option value="Naranja">Naranja</option>
                    </select>
                  </div>
                  {/* Card Number */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-2">
                      {t('PROFILE.MEMBERSHIP.MODAL.CARD_NUMBER')}
                    </label>
                    <input 
                      type="text" 
                      placeholder="XXXX XXXX XXXX XXXX"
                      maxLength={19}
                      value={newCard.number.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim()}
                      onChange={(e) => setNewCard({...newCard, number: e.target.value.replace(/\s/g, '')})}
                      className="w-full bg-light-accent border-none rounded-2xl py-4 px-6 focus:ring-2 ring-light-primary/20 font-body italic"
                    />
                  </div>
                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-2">
                        {t('PROFILE.MEMBERSHIP.MODAL.EXPIRY')}
                      </label>
                      <input 
                        type="text" 
                        placeholder="MM/YY"
                        maxLength={5}
                        value={newCard.expiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
                          setNewCard({...newCard, expiry: val});
                        }}
                        className="w-full bg-light-accent border-none rounded-2xl py-4 px-6 focus:ring-2 ring-light-primary/20 font-body italic"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-2">
                        {t('PROFILE.MEMBERSHIP.MODAL.CVV')}
                      </label>
                      <input 
                        type="password" 
                        placeholder="***"
                        maxLength={3}
                        value={newCard.cvv}
                        onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
                        className="w-full bg-light-accent border-none rounded-2xl py-4 px-6 focus:ring-2 ring-light-primary/20 font-body italic"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Mercado Pago Form */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-2">
                      {t('PROFILE.MEMBERSHIP.MODAL.EMAIL_MP')}
                    </label>
                    <input 
                      type="email" 
                      placeholder="usuario@email.com"
                      value={newMP.email}
                      onChange={(e) => setNewMP({email: e.target.value})}
                      className="w-full bg-light-accent border-none rounded-2xl py-4 px-6 focus:ring-2 ring-light-primary/20 font-body italic"
                    />
                  </div>
                </div>
              )}
              {/* Submit Button */}
              <button 
                disabled={loading} 
                className="w-full bg-light-primary text-white py-5 rounded-2xl font-bold uppercase tracking-[.2em] text-[10px] shadow-xl shadow-light-primary/20 hover:brightness-110 transition-all"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin mx-auto" />
                ) : (
                  editingPayment ? 'Guardar Cambios' : t('PROFILE.MEMBERSHIP.MODAL.SAVE_BTN')
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
