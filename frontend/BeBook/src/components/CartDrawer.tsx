import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';
import { translateProductName } from '../utils/translate';

/**
 * CartDrawerProps Interface
 * Defines the properties for controlling the visibility of the cart drawer.
 */
interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * CartDrawer Component
 * A slide-out panel that displays the current items in the user's shopping cart.
 * Handles the checkout process, including validation and order creation.
 */
export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { cartItems, removeFromCart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  
  // UI & Processing State
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Initial validation before proceeding to the confirmation step.
   * Checks for login state and existence of payment methods.
   */
  const handleCheckout = async () => {
    if (!user) {
      setError(t('CATALOG.CART.ERRORS.LOGIN'));
      return;
    }

    if (!user.paymentMethods || user.paymentMethods.length === 0) {
      setError(t('CATALOG.CART.ERRORS.PAYMENT'));
      return;
    }

    setShowConfirm(true);
  };

  /**
   * Finalizes the purchase by sending the order data to the backend.
   * Clears the cart upon success.
   */
  const confirmPurchase = async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine the payment method to display in the order history
      const defaultMethod = user?.paymentMethods?.find(m => m.isDefault) || user?.paymentMethods?.[0];
      const paymentMethodName = defaultMethod 
        ? (defaultMethod.methodType === 'MERCADO_PAGO' ? 'Mercado Pago' : (defaultMethod.cardType || 'Tarjeta'))
        : 'Tarjeta';

      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          qty: 1,
          image: item.image,
          price: item.price,
          product: item._id
        })),
        paymentMethod: paymentMethodName,
        totalPrice: totalPrice,
        shippingAddress: { // Placeholder for digital/branch-pickup goods
            address: 'Digital / Sede',
            city: 'Digital',
            postalCode: '0000',
            country: 'Argentina'
        }
      };

      await API.post('/orders', orderData);

      setSuccess(true);
      clearCart();
      // Reset UI after success feedback
      setTimeout(() => {
        setSuccess(false);
        setShowConfirm(false);
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || t('CATALOG.PURCHASE.ERROR_TITLE'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Background Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Side Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-8 border-b border-light-primary/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <ShoppingBag size={24} className="text-light-primary" />
                  <h2 className="text-2xl font-heading italic">{t('CATALOG.CART.TITLE')}</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-light-primary/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                    <ShoppingBag size={64} />
                    <p className="font-heading italic text-xl">{t('CATALOG.CART.EMPTY')}</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-6 group"
                    >
                      <div className="w-20 h-24 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t(`DATA.TYPES.${item.type}`, item.type)}</p>
                          <h4 className="font-heading italic text-lg leading-tight">{translateProductName(item.name, t, i18n.language)}</h4>
                        </div>
                        <div className="flex justify-between items-end">
                          <p className="font-bold text-light-primary">${item.price}</p>
                          <button 
                            onClick={() => removeFromCart(item._id)}
                            className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Drawer Footer & Checkout Action */}
              {cartItems.length > 0 && (
                <div className="p-8 bg-light-accent/30 border-t border-light-primary/5 space-y-6">
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-bold uppercase tracking-[.3em] opacity-40">{t('CATALOG.CART.TOTAL')}</p>
                    <p className="text-3xl font-heading italic text-light-primary">${totalPrice}</p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase tracking-widest leading-relaxed">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-light-primary text-white py-5 rounded-2xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-4 hover:brightness-110 transition-all shadow-xl shadow-light-primary/20"
                  >
                    <CreditCard size={18} /> {t('CATALOG.CART.CHECKOUT')}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => !loading && setShowConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl text-center space-y-8"
            >
              {success ? (
                /* Success Feedback */
                <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="space-y-6 py-10">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-3xl font-heading italic">{t('CATALOG.CART.SUCCESS_TITLE')}</h3>
                  <p className="opacity-60 text-sm">{t('CATALOG.CART.SUCCESS_TEXT')}</p>
                </motion.div>
              ) : (
                /* Order Confirmation */
                <>
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-light-primary/10 text-light-primary rounded-full flex items-center justify-center mx-auto">
                      <ShoppingBag size={30} />
                    </div>
                    <h3 className="text-3xl font-heading italic">{t('CATALOG.CART.CONFIRM_ORDER')}</h3>
                    <p className="opacity-60 text-sm italic">{t('CATALOG.CART.CONFIRM_SUBTITLE', { count: cartItems.length, total: totalPrice })}</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      disabled={loading}
                      onClick={confirmPurchase}
                      className="w-full bg-light-primary text-white py-5 rounded-2xl font-bold tracking-widest uppercase text-xs hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      {loading ? '...' : t('CATALOG.CART.YES')}
                    </button>
                    <button
                      disabled={loading}
                      onClick={() => setShowConfirm(false)}
                      className="w-full py-5 rounded-2xl font-bold tracking-widest uppercase text-[10px] opacity-40 hover:opacity-100 transition-all"
                    >
                      {t('CATALOG.CART.NO')}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
