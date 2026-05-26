import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, HelpCircle, CheckCircle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * CustomDialogProps Interface
 * Defines the properties for the modal dialog window.
 */
interface CustomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  message: string;
  type?: 'info' | 'confirm' | 'alert' | 'success' | 'warning';
  confirmText?: string;
  cancelText?: string;
}

/**
 * CustomDialog Component
 * A highly customizable modal for alerts, confirmations, and success/error messages.
 * Uses Framer Motion for smooth entrance and exit animations.
 */
const CustomDialog: React.FC<CustomDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText,
  cancelText
}) => {
  const { t } = useTranslation();
  
  // Dynamic text based on provided props or defaults
  const finalConfirmText = confirmText || t('COMMON.CONFIRM');
  const finalCancelText = cancelText || t('COMMON.CANCEL');

  /**
   * Helper to determine the visual icon based on the dialog type.
   */
  const getIcon = () => {
    switch (type) {
      case 'confirm': return <HelpCircle className="text-blue-500" size={24} />;
      case 'alert':
      case 'warning': return <AlertCircle className="text-amber-500" size={24} />;
      case 'success': return <CheckCircle className="text-green-500" size={24} />;
      default: return <Info className="text-blue-500" size={24} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay: Closes dialog on click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          />
          
          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[2rem] shadow-2xl z-[1001] overflow-hidden"
          >
            <div className="p-8">
              {/* Content Header Area */}
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-gray-50">
                  {getIcon()}
                </div>
                <div className="flex-1">
                  {title && (
                    <h3 className="text-xs font-bold uppercase tracking-[.3em] opacity-40 mb-2">
                      {title}
                    </h3>
                  )}
                  <p className="text-sm font-body italic opacity-80 leading-relaxed">
                    {message}
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors opacity-30 hover:opacity-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Action Footer Area */}
              <div className="flex justify-end gap-3 mt-8">
                {type === 'confirm' && (
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-all border border-gray-200"
                  >
                    {finalCancelText}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (onConfirm) {
                      onConfirm();
                    } else {
                      onClose();
                    }
                  }}
                  className="px-8 py-2.5 rounded-full bg-light-primary text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-light-primary/20 hover:scale-105 transition-all"
                >
                  {finalConfirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CustomDialog;
