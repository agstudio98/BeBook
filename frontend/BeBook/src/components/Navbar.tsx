import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  Languages, 
  User as UserIcon, 
  Menu, 
  X, 
  LogOut, 
  Settings, 
  LayoutDashboard,
  ShoppingBag 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartDrawer } from './CartDrawer';

/**
 * Navbar Component
 * Global navigation bar featuring main links, language toggle, cart access, and user profile management.
 * Includes responsive mobile behavior and dropdown menus.
 */
export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  
  // Local State
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Refs
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * Toggles the application language between Spanish and English.
   */
  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  /**
   * Handles user logout, closes the profile menu, and redirects to the home page.
   */
  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/');
  };

  /**
   * Effect to handle clicks outside the profile dropdown to close it.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-light-primary/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link to="/" className="font-logo text-3xl font-bold text-light-primary tracking-tighter">
              BeBook
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-10">
              <Link to="/sucursales" className="text-sm font-bold tracking-widest uppercase opacity-60 hover:opacity-100 hover:text-light-primary transition-all">
                {t('NAVBAR.LOCATIONS')}
              </Link>
              <Link to="/catalog" className="text-sm font-bold tracking-widest uppercase opacity-60 hover:opacity-100 hover:text-light-primary transition-all">
                {t('NAVBAR.CATALOG')}
              </Link>
              <Link to="/foro" className="text-sm font-bold tracking-widest uppercase opacity-60 hover:opacity-100 hover:text-light-primary transition-all">
                {t('NAVBAR.FORUM')}
              </Link>
              
              <div className="flex items-center space-x-2 border-l pl-10 border-light-primary/10">
                {/* Language Toggle */}
                <button onClick={toggleLanguage} className="p-3 rounded-full hover:bg-light-primary/5 transition-colors opacity-60 hover:opacity-100 flex items-center gap-2">
                  <Languages size={18} />
                  <span className="text-[10px] font-bold uppercase">{i18n.language === 'es' ? 'EN' : 'ES'}</span>
                </button>

                {/* Cart Access */}
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="p-3 rounded-full hover:bg-light-primary/5 transition-colors opacity-60 hover:opacity-100 relative"
                >
                  <ShoppingBag size={18} />
                  {itemCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-4 h-4 bg-light-primary text-white text-[8px] font-bold flex items-center justify-center rounded-full"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </button>

                {/* User Identity Section */}
                <div className="relative" ref={menuRef}>
                  {user ? (
                    <button 
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-3 p-1 pl-3 pr-2 rounded-full border border-light-primary/10 hover:border-light-primary/30 transition-all bg-light-primary/5"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                        {user.name ? user.name.split(' ')[0] : 'Lector'}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-light-primary flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-light-primary/20">
                        {user.avatar ? (
                          <img src={user.avatar} crossOrigin="anonymous" className="w-full h-full rounded-full object-cover" alt="User" />
                        ) : (
                          (user.name ? user.name[0] : 'U').toUpperCase()
                        )}
                      </div>
                    </button>
                  ) : (
                    <Link to="/auth" className="p-3 rounded-full hover:bg-light-primary/5 transition-colors opacity-60 hover:opacity-100">
                      <UserIcon size={18} />
                    </Link>
                  )}

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-64 bg-white border border-light-primary/10 rounded-2xl shadow-2xl overflow-hidden py-2"
                      >
                        <div className="px-6 py-4 border-b border-light-primary/5">
                          <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">Sesión Iniciada</p>
                          <p className="text-sm font-bold truncate">{user?.email}</p>
                        </div>
                        
                        <div className="p-2 space-y-1">
                          <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-4 px-4 py-3 text-xs font-bold tracking-widest uppercase opacity-60 hover:opacity-100 hover:bg-light-primary/5 rounded-xl transition-all">
                            <Settings size={16} /> {t('NAVBAR.SETTINGS')}
                          </Link>
                          {user?.isAdmin && (
                            <Link to="/admin" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-4 px-4 py-3 text-xs font-bold tracking-widest uppercase opacity-60 hover:opacity-100 hover:bg-light-primary/5 rounded-xl transition-all">
                              <LayoutDashboard size={16} /> {t('NAVBAR.ADMIN')}
                            </Link>
                          )}
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-4 py-3 text-xs font-bold tracking-widest uppercase text-red-500 opacity-80 hover:opacity-100 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <LogOut size={16} /> {t('NAVBAR.LOGOUT')}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="md:hidden flex items-center space-x-4">
              <button onClick={() => setIsCartOpen(true)} className="p-2 relative">
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-light-primary text-white text-[7px] font-bold flex items-center justify-center rounded-full">
                    {itemCount}
                  </span>
                )}
              </button>
              <button onClick={toggleLanguage} className="p-2 flex items-center gap-1">
                  <Languages size={20} />
                  <span className="text-[10px] font-bold uppercase">{i18n.language === 'es' ? 'EN' : 'ES'}</span>
              </button>
              <button onClick={() => setIsOpen(!isOpen)} className="p-2">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white px-6 pb-10 border-t border-light-primary/5"
            >
              <div className="flex flex-col space-y-6 pt-6">
                <Link to="/sucursales" onClick={() => setIsOpen(false)} className="text-sm font-bold tracking-[.2em] uppercase">
                  {t('NAVBAR.LOCATIONS')}
                </Link>
                <Link to="/catalog" onClick={() => setIsOpen(false)} className="text-sm font-bold tracking-[.2em] uppercase">
                  {t('NAVBAR.CATALOG')}
                </Link>
                <Link to="/foro" onClick={() => setIsOpen(false)} className="text-sm font-bold tracking-[.2em] uppercase">
                  {t('NAVBAR.FORUM')}
                </Link>
                
                <div className="h-px bg-light-primary/10 w-full" />
                
                {user ? (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-light-primary flex items-center justify-center text-white font-bold">
                        {user.avatar ? (
                          <img src={user.avatar} crossOrigin="anonymous" className="w-full h-full rounded-full object-cover" alt="User" />
                        ) : (
                          (user.name ? user.name[0] : 'U').toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest">{user.name || 'Usuario'}</p>
                        <button onClick={handleLogout} className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{t('NAVBAR.LOGOUT')}</button>
                      </div>
                    </div>
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="text-sm font-bold tracking-[.2em] uppercase">{t('NAVBAR.SETTINGS')}</Link>
                    {user?.isAdmin && (
                      <Link to="/admin" onClick={() => setIsOpen(false)} className="text-sm font-bold tracking-[.2em] uppercase">{t('NAVBAR.ADMIN')}</Link>
                    )}
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)} className="text-sm font-bold tracking-[.2em] uppercase text-light-primary">
                    {t('NAVBAR.LOGIN')}
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};
