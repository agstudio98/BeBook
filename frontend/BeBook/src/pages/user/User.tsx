import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Chrome, 
  Eye, 
  EyeOff,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import CustomDialog from '../../components/CustomDialog';
import { useNavigate } from 'react-router-dom';

/**
 * User Component
 * 
 * This component handles the authentication flow for the BeBook application.
 * It provides a dual-purpose interface for both Login and Registration (Signup).
 * 
 * Features:
 * - Local email/password authentication (Login/Register).
 * - Google OAuth integration via @react-oauth/google.
 * - Real-time password strength validation with visual feedback.
 * - Internationalization support using i18next.
 * - Smooth UI transitions powered by Framer Motion.
 * - Mobile-responsive design with a modern, glassmorphism aesthetic.
 * 
 * @returns {React.FC} The rendered User authentication page.
 */
export const User: React.FC = () => {
  // --- Hooks & Context ---
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, user: authUserSession } = useAuth();

  // --- UI State Management ---
  /** @type {[boolean, Function]} Toggles between Login (true) and Register (false) modes. */
  const [isLogin, setIsLogin] = useState(true);
  /** @type {[boolean, Function]} Toggles visibility of the password input field. */
  const [showPassword, setShowPassword] = useState(false);
  /** @type {[boolean, Function]} Global loading state for API requests. */
  const [loading, setLoading] = useState(false);
  /** @type {[string|null, Function]} Stores error messages for display in the UI. */
  const [error, setError] = useState<string | null>(null);
  /** @type {[string|null, Function]} Stores success messages for display in the UI. */
  const [success, setSuccess] = useState<string | null>(null);

  // --- Form Field States ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // --- Dialog & Feedback State ---
  /** State for the custom modal dialog. */
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm' | 'success' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert'
  });
  
  // --- Password Strength Logic ---
  /**
   * Represents the various validation criteria for a secure password.
   */
  const [strength, setStrength] = useState({
    hasUpper: false,
    hasSpecial: false,
    hasNumber: false,
    isMinLength: false,
    score: 0
  });

  /**
   * Effect to recalculate password strength in real-time as the user types.
   * Updates the 'strength' state which triggers visual UI changes.
   */
  useEffect(() => {
    const hasUpper = /[A-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isMinLength = password.length >= 10;

    let score = 0;
    if (hasUpper) score++;
    if (hasSpecial) score++;
    if (hasNumber) score++;
    if (isMinLength) score++;

    setStrength({ hasUpper, hasSpecial, hasNumber, isMinLength, score });
  }, [password]);

  /**
   * Returns a Tailwind color class based on the password strength score.
   * @returns {string} Tailwind background color class.
   */
  const getStrengthColor = () => {
    switch(strength.score) {
      case 0: return 'bg-gray-200';
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-light-primary';
      default: return 'bg-gray-200';
    }
  };

  /**
   * Returns the translated strength description label.
   * @returns {string} Strength text (e.g., "Very Weak", "Excellent").
   */
  const getStrengthText = () => {
    switch(strength.score) {
      case 0: return t('AUTH.STRENGTH_TEXT.VERY_WEAK');
      case 1: return t('AUTH.STRENGTH_TEXT.WEAK');
      case 2: return t('AUTH.STRENGTH_TEXT.MEDIUM');
      case 3: return t('AUTH.STRENGTH_TEXT.STRONG');
      case 4: return t('AUTH.STRENGTH_TEXT.EXCELLENT');
      default: return '';
    }
  };

  // --- Event Handlers ---

  /**
   * Handles form submission for both Login and Registration.
   * Performs validation, API calls, and session management.
   * 
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        // --- Login Logic ---
        const { data } = await API.post('/users/login', { email, password });
        setSuccess(`${t('AUTH.WELCOME_BACK')}, ${data.name}!`);
        login(data); // Establish session in context
        setTimeout(() => navigate('/'), 1500); // Redirect after success message
      } else {
        // --- Registration Logic ---
        // Ensure password requirements are met before sending to server
        if (strength.score < 4) {
          setError(t('AUTH.STRENGTH_ERROR') || 'Password requirements not met');
          setLoading(false);
          return;
        }
        const { data } = await API.post('/users', { name, email, password });
        setSuccess(`${t('AUTH.JOIN_RESERVE')}, ${data.name}!`);
        login(data); // Automatically log in the new user
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err: any) {
      // Extract error message from server response or default to generic error
      setError(err.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Callback for successful Google Login.
   * Sends the credential token to the backend for verification/registration.
   * 
   * @param {any} response - The response from Google OAuth.
   */
  const onGoogleSuccess = async (response: any) => {
    setLoading(true);
    try {
      const { data } = await API.post('/users/google', {
        credential: response.credential
      });
      setSuccess(`${t('AUTH.WELCOME_BACK')}, ${data.name}!`);
      login(data);
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error login with Google');
    } finally {
      setLoading(false);
    }
  };

  /** Handles Google Login failures. */
  const onGoogleError = () => {
    setError('Google Login Failed');
  };

  return (
    <section className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center bg-light-bg overflow-hidden relative">
      <CustomDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-light-primary/5 rounded-full blur-[120px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white backdrop-blur-xl border border-light-primary/10 rounded-3xl shadow-2xl overflow-hidden p-8 md:p-12">
          
          <div className="text-center mb-10">
            <h2 className="font-logo text-4xl text-light-primary mb-2">BeBook</h2>
            <p className="text-xs uppercase tracking-[.3em] font-bold opacity-40">
              {authUserSession ? `Sesión iniciada como ${authUserSession.name}` : (isLogin ? t('AUTH.WELCOME_BACK') : t('AUTH.JOIN_RESERVE'))}
            </p>
          </div>

          <div className="flex bg-light-accent p-1 rounded-full mb-10">
            <button 
              onClick={() => { setIsLogin(true); setError(null); setSuccess(null); }}
              className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase transition-all duration-500 rounded-full ${isLogin ? 'bg-white shadow-lg text-light-primary' : 'opacity-40'}`}
            >
              {t('AUTH.LOGIN_TAB')}
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); setSuccess(null); }}
              className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase transition-all duration-500 rounded-full ${!isLogin ? 'bg-white shadow-lg text-light-primary' : 'opacity-40'}`}
            >
              {t('AUTH.REGISTER_TAB')}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-[10px] font-bold tracking-widest uppercase mb-6 flex items-center gap-3"
              >
                <X size={14} /> {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-2xl text-[10px] font-bold tracking-widest uppercase mb-6 flex items-center gap-3"
              >
                <Check size={14} /> {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-2">{t('AUTH.FULL_NAME')}</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-light-primary transition-colors" size={18} />
                    <input 
                      type="text" 
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Jorge Luis Borges"
                      className="w-full bg-light-accent border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 ring-light-primary/20 transition-all font-body italic text-light-text"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-2">{t('AUTH.EMAIL')}</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-light-primary transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lectura@bebook.com"
                  className="w-full bg-light-accent border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 ring-light-primary/20 transition-all font-body italic text-light-text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-2">{t('AUTH.PASSWORD')}</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-light-primary transition-colors" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-light-accent border-none rounded-2xl py-4 pl-12 pr-12 focus:ring-2 ring-light-primary/20 transition-all font-body italic tracking-widest text-light-text"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 transition-opacity"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {!isLogin && (
                <div className="mt-4 space-y-4 px-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">{t('AUTH.STRENGTH')}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${strength.score > 2 ? 'text-light-primary' : 'opacity-40'}`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div 
                        key={step}
                        className={`h-full flex-1 transition-all duration-500 ${step <= strength.score ? getStrengthColor() : 'bg-transparent'}`}
                      />
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter transition-opacity ${strength.isMinLength ? 'text-light-primary' : 'opacity-30'}`}>
                      {strength.isMinLength ? <Check size={10} /> : <X size={10} />} {t('AUTH.REQUIREMENTS.CHARACTERS')}
                    </div>
                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter transition-opacity ${strength.hasUpper ? 'text-light-primary' : 'opacity-30'}`}>
                      {strength.hasUpper ? <Check size={10} /> : <X size={10} />} {t('AUTH.REQUIREMENTS.UPPERCASE')}
                    </div>
                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter transition-opacity ${strength.hasNumber ? 'text-light-primary' : 'opacity-30'}`}>
                      {strength.hasNumber ? <Check size={10} /> : <X size={10} />} {t('AUTH.REQUIREMENTS.NUMBER')}
                    </div>
                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter transition-opacity ${strength.hasSpecial ? 'text-light-primary' : 'opacity-30'}`}>
                      {strength.hasSpecial ? <Check size={10} /> : <X size={10} />} {t('AUTH.REQUIREMENTS.SPECIAL')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              disabled={loading}
              className="w-full bg-light-primary text-white py-4 rounded-2xl font-bold tracking-[.2em] uppercase text-xs flex items-center justify-center gap-3 group hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-light-primary/20"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {isLogin ? t('AUTH.LOGIN_BTN') : t('AUTH.REGISTER_BTN')}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-light-primary/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 font-bold tracking-widest uppercase opacity-30">{t('AUTH.OR_CONTINUE')}</span>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={onGoogleError}
              useOneTap
              theme="outline"
              size="large"
              shape="pill"
              text="continue_with"
            />
          </div>

          <div className="mt-10 text-center">
            <a href="#" className="text-[10px] font-bold uppercase tracking-[.3em] opacity-30 hover:opacity-100 transition-opacity">
              {t('AUTH.FORGOT_PASSWORD')}
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default User;
