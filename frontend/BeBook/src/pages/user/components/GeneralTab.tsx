import React from 'react';
import { motion } from 'framer-motion';
import { Camera, User as UserIcon, Mail, Loader2, Save } from 'lucide-react';

interface GeneralTabProps {
  user: any;
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  avatar: string;
  setAvatar: (val: string) => void;
  loading: boolean;
  onUpdate: (e: React.FormEvent) => void;
}

/**
 * GeneralTab Component
 * Handles the display and update of basic user information like name, email, and avatar.
 */
export const GeneralTab: React.FC<GeneralTabProps> = ({
  user,
  name,
  setName,
  email,
  setEmail,
  avatar,
  setAvatar,
  loading,
  onUpdate
}) => {
  return (
    <motion.div 
      key="general" 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="space-y-12"
    >
      {/* Profile Header & Avatar Selection */}
      <div className="flex flex-col md:flex-row items-center gap-8 pb-12 border-b border-light-primary/5">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-light-primary flex items-center justify-center text-white text-4xl font-bold shadow-2xl overflow-hidden">
            {avatar ? (
              <img src={avatar} crossOrigin="anonymous" className="w-full h-full object-cover" alt="User Avatar" />
            ) : (
              (user?.name ? user.name[0] : 'U').toUpperCase()
            )}
          </div>
          <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <Camera size={24} className="text-white" />
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setAvatar(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} 
            />
          </label>
        </div>
        <div className="text-center md:text-left space-y-2">
          <h3 className="text-2xl font-heading italic text-light-text">{user?.name || 'Lector'}</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 text-light-text">
            Haz clic en la imagen para cambiar tu avatar
          </p>
        </div>
      </div>

      {/* Profile Update Form */}
      <form onSubmit={onUpdate} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-2 text-light-text">
              Nombre Público
            </label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-light-text" size={18} />
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-light-accent border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 ring-light-primary/20 transition-all font-body italic text-light-text" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-2 text-light-text">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-light-text" size={18} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full bg-light-accent border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 ring-light-primary/20 transition-all font-body italic text-light-text" 
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button 
            disabled={loading} 
            className="bg-light-primary text-white px-10 py-4 rounded-2xl font-bold tracking-widest uppercase text-xs flex items-center gap-3 hover:brightness-110 transition-all shadow-xl shadow-light-primary/20"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
            Guardar Cambios
          </button>
        </div>
      </form>
    </motion.div>
  );
};
