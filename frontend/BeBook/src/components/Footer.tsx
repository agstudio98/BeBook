import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Twitter, 
  Linkedin, 
  MapPin, 
  Phone,
  ArrowUpRight
} from 'lucide-react';

/**
 * Footer Component
 * Global footer providing company information, navigation links, newsletter signup, and language toggle.
 */
export const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();

  /**
   * Toggles the application language between Spanish and English.
   */
  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <footer className="bg-white pt-24 pb-12 px-4 border-t border-light-primary/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          
          {/* Brand Column: Logo and social links */}
          <div className="space-y-8">
            <Link to="/" className="font-logo text-4xl font-bold text-light-primary tracking-tighter">
              BeBook
            </Link>
            <p className="font-body italic text-sm opacity-60 leading-relaxed">
              {t('FOOTER.DESC')}
            </p>
            <div className="flex gap-4">
              {[Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-light-primary/10 flex items-center justify-center text-light-primary hover:bg-light-primary hover:text-white transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Explore Column: Core platform links */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-bold uppercase tracking-[.4em] text-light-primary">
              {t('FOOTER.EXPLORE.TITLE')}
            </h4>
            <ul className="space-y-4">
              {[
                { label: t('FOOTER.EXPLORE.CATALOG'), path: '/catalog' },
                { label: t('FOOTER.EXPLORE.NEWS'), path: '#' },
                { label: t('FOOTER.EXPLORE.AUTHORS'), path: '#' },
                { label: t('FOOTER.EXPLORE.PUBLISHERS'), path: '#' },
                { label: t('FOOTER.EXPLORE.VIP'), path: '#' }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-sm font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-light-primary transition-all flex items-center justify-between group">
                    {link.label}
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Column: User interaction and support links */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-bold uppercase tracking-[.4em] text-light-primary">
              {t('FOOTER.COMMUNITY.TITLE')}
            </h4>
            <ul className="space-y-4">
              {[
                { label: t('FOOTER.COMMUNITY.MEMBERSHIPS'), path: '/profile' },
                { label: t('FOOTER.COMMUNITY.FORUMS'), path: '#' },
                { label: t('FOOTER.COMMUNITY.EVENTS'), path: '#' },
                { label: t('FOOTER.COMMUNITY.BLOG'), path: '#' },
                { label: t('FOOTER.COMMUNITY.SUPPORT'), path: '/support' }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-sm font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-light-primary transition-all flex items-center justify-between group">
                    {link.label}
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column: Newsletter and physical info */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-bold uppercase tracking-[.4em] text-light-primary">
              {t('FOOTER.NEWSLETTER')}
            </h4>
            <div className="space-y-6">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="email@bebook.com"
                  className="w-full bg-light-accent border-none rounded-xl py-4 pl-4 pr-12 text-xs font-body italic focus:ring-1 ring-light-primary/20"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-light-primary text-white rounded-lg flex items-center justify-center hover:brightness-110 transition-all">
                  <ArrowUpRight size={16} />
                </button>
              </div>
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 text-xs opacity-60 font-bold uppercase tracking-widest">
                  <MapPin size={16} className="text-light-primary" />
                  {t('FOOTER.CONTACT.ADDRESS')}
                </div>
                <div className="flex items-center gap-4 text-xs opacity-60 font-bold uppercase tracking-widest">
                  <Phone size={16} className="text-light-primary" />
                  {t('FOOTER.CONTACT.PHONE')}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Legal links, language toggle, and credits */}
        <div className="pt-12 border-t border-light-primary/5 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex gap-8 order-2 md:order-1">
              {[t('FOOTER.PRIVACY'), t('FOOTER.TERMS'), t('FOOTER.COOKIES')].map((text, i) => (
                <a key={i} href="#" className="text-[10px] font-bold uppercase tracking-[.2em] opacity-40 hover:opacity-100 transition-opacity">
                  {text}
                </a>
              ))}
           </div>
           
           <button 
             onClick={toggleLanguage}
             className="flex items-center gap-4 order-1 md:order-2 px-6 py-2 rounded-full border border-light-primary/10 text-[10px] font-bold uppercase tracking-[.3em] hover:bg-light-primary hover:text-white transition-all"
           >
              {i18n.language === 'es' ? 'ES / EN' : 'EN / ES'}
           </button>

           <div className="text-[10px] font-bold uppercase tracking-[.2em] opacity-30 order-3">
              {t('FOOTER.CREDITS')}
           </div>
        </div>
      </div>
    </footer>
  );
};
