import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Globe, 
  Gauge, 
  Shield, 
  FileCode2, 
  User, 
  Terminal, 
  Volume2, 
  VolumeX, 
  Flame, 
  Radio, 
  Sliders, 
  Sparkles, 
  LogIn, 
  Crown,
  Briefcase,
  Sun,
  Moon,
  Gift,
  Zap,
  RefreshCw,
  Menu,
  X,
  Download,
  ChevronDown,
  Star,
  Film
} from 'lucide-react';
import { ConnectionStatus } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { useAuth } from '../firebase/AuthContext';
import { CONTACT_CONFIG, getSiteSettings } from '../data/contact';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
  theme: 'dark' | 'cyber-light';
  setTheme: (theme: 'dark' | 'cyber-light') => void;
  status: ConnectionStatus;
  soundEnabled?: boolean;
  setSoundEnabled?: (enabled: boolean) => void;
  killSwitchActive?: boolean;
  onOpenQuickSettings?: () => void;
  onOpenAuthModal: (tab?: 'signin' | 'signup') => void;
  onOpenPromoModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  theme,
  setTheme,
  status,
  soundEnabled,
  setSoundEnabled,
  killSwitchActive,
  onOpenQuickSettings,
  onOpenAuthModal,
  onOpenPromoModal,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState(getSiteSettings());
  const t = TRANSLATIONS[lang];
  const isConnected = status === 'connected';
  const { user, isSuperAdmin, isAdmin, isReseller, canAccessAdminPanel, userProfile } = useAuth();

  React.useEffect(() => {
    const handleUpdate = () => {
      setSiteSettings(getSiteSettings());
    };
    window.addEventListener('soverix_settings_changed', handleUpdate);
    return () => window.removeEventListener('soverix_settings_changed', handleUpdate);
  }, []);

  const rawNavLinks = [
    { id: 'dashboard', label: lang === 'bn' ? 'হোম' : 'Home', icon: Radio, show: siteSettings.sectionVisibility?.heroConnect !== false },
    { id: 'vipPlans', label: lang === 'bn' ? 'প্যাকেজ ও মূল্য' : 'Packages & Pricing', icon: Crown, vipHighlight: true, show: siteSettings.sectionVisibility?.vipPlans !== false },
    { id: 'arabSim', label: lang === 'bn' ? '🇸🇦 আরব ফ্রি-নেট' : '🇸🇦 Arab FreeNet', icon: Zap, highlight: true, show: siteSettings.sectionVisibility?.arabSimPayload !== false },
    { id: 'videos', label: lang === 'bn' ? 'ভিডিও গাইড' : 'Video Guides', icon: Film, show: siteSettings.sectionVisibility?.videoTutorials !== false },
    { id: 'configs', label: lang === 'bn' ? 'ডাউনলোড ও কনফিগ' : 'Downloads', icon: FileCode2, show: true },
    { id: 'servers', label: lang === 'bn' ? 'সার্ভারসমূহ' : 'Servers', icon: Globe, show: siteSettings.sectionVisibility?.serverNodes !== false },
    { id: 'reviews', label: lang === 'bn' ? 'রিভিউ ও মন্তব্য' : 'Reviews', icon: Star, show: siteSettings.sectionVisibility?.communityReviews !== false },
    { id: 'benefits', label: lang === 'bn' ? 'সুবিধাসমূহ' : 'Why Us?', icon: Sparkles, show: siteSettings.sectionVisibility?.benefitsFeatures !== false },
    { id: 'account', label: lang === 'bn' ? 'অ্যাকাউন্ট' : 'Account', icon: User, show: true },
    ...(canAccessAdminPanel ? [{
      id: 'admin',
      label: lang === 'bn' ? '👑 ওনার এডমিন' : '👑 Owner Admin',
      icon: ShieldAlert,
      adminOnly: true,
      show: true
    }] : []),
  ];

  const navLinks = rawNavLinks.filter((item) => item.show !== false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'cyber-light' : 'dark');
  };

  const handleNavClick = (tabId: string) => {
    if (tabId === 'videos') {
      setActiveTab('dashboard');
      setIsMobileMenuOpen(false);
      setTimeout(() => {
        const el = document.getElementById('video-tutorials-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return;
    }
    if (tabId === 'reviews') {
      setActiveTab('dashboard');
      setIsMobileMenuOpen(false);
      setTimeout(() => {
        const el = document.getElementById('community-reviews');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return;
    }
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentSiteTitle = siteSettings.designTheme?.siteTitle || 'Soverixnet VPN';
  const currentLogoUrl = siteSettings.designTheme?.logoUrl || '/soverix_shield_logo.jpg';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-[#030712]/95 backdrop-blur-xl shadow-2xl shadow-cyan-950/25 transition-colors duration-300">
      
      {/* Top Ticker / Notification Bar */}
      {siteSettings.sectionVisibility?.topNoticeMarquee !== false && (
        <div className="w-full bg-gradient-to-r from-emerald-950/90 via-slate-950 to-cyan-950/90 border-b border-emerald-500/20 py-1.5 px-4 text-[11px] text-slate-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30 text-[10px] shrink-0">
                NEW UPDATE
              </span>
              <span className="truncate">
                {lang === 'bn' 
                  ? (siteSettings.tickerAnnouncementBn || '🇸🇦 সৌদি আরব (STC, Mobily, Zain) ও মধ্যপ্রাচ্যে আনলিমিটেড FreeNet SNI পেলোড সক্রিয়!') 
                  : (siteSettings.tickerAnnouncementEn || '🇸🇦 High-speed Arab SIM FreeNet Payloads active for STC, Mobily & Zain!')}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-[11px]">
              {onOpenPromoModal && siteSettings.sectionVisibility?.promoModal !== false && (
                <button
                  onClick={onOpenPromoModal}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-[10px] font-black hover:scale-105 transition-all cursor-pointer shadow-sm"
                >
                  <span>🔥</span>
                  <span>{lang === 'bn' ? 'অফার ব্যানার ও পপআপ' : 'Special Offer Banner'}</span>
                </button>
              )}
              <a
                href={CONTACT_CONFIG.whatsappChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
              >
                <span>WhatsApp Channel</span>
                <span>➔</span>
              </a>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <span className="text-cyan-400 font-mono hidden sm:inline">Zero-Logs Verified</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Website Title (Official 3D Shield Badge) */}
          <div 
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative">
              <img
                src={currentLogoUrl}
                alt={currentSiteTitle}
                referrerPolicy="no-referrer"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover border border-cyan-400/40 shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-400/50 transition-all duration-300 transform group-hover:scale-105"
              />
              {isConnected && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#030712]"></span>
                </span>
              )}
              {status === 'reconnecting' && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-[#030712]"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  {currentSiteTitle}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                {lang === 'bn' ? (siteSettings.designTheme?.siteTaglineBn || 'অফিসিয়াল সাইবার শিল্ড ও ফ্রি-নেট পোর্টাল') : (siteSettings.designTheme?.siteTaglineEn || 'Official Cyber Shield & Free-Net Web Portal')}
              </p>
            </div>
          </div>

          {/* Desktop Website Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                      : item.vipHighlight
                      ? 'text-amber-300 hover:text-amber-200 hover:bg-amber-950/30'
                      : item.highlight
                      ? 'text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/30'
                      : item.adminOnly
                      ? 'text-red-300 hover:bg-red-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${
                    isActive 
                      ? 'text-cyan-400' 
                      : item.vipHighlight 
                      ? 'text-amber-400' 
                      : item.highlight 
                      ? 'text-emerald-400' 
                      : item.adminOnly
                      ? 'text-red-400'
                      : 'text-slate-400'
                  }`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Utilities (Website Style) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* WhatsApp Direct Order CTA Button */}
            <a
              href={CONTACT_CONFIG.getWhatsAppUrl('আসসালামু আলাইকুম, আমি Soverixnet VPN সার্ভিস নিতে চাই।')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold text-xs transition-all shadow-md shadow-emerald-500/25 cursor-pointer hover:scale-105 shrink-0"
              title="WhatsApp Support"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
              </span>
              <svg className="w-3.5 h-3.5 fill-current text-black shrink-0" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-1.99-.46-1.657-.683-2.73-2.366-2.812-2.476-.083-.11-1.01-1.348-1.01-2.572 0-1.223.636-1.824.862-2.073.226-.249.493-.311.658-.311.164 0 .328.002.472.01.153.007.358-.058.56.427.207.499.704 1.722.766 1.847.062.125.103.271.021.434-.083.164-.124.266-.247.41-.124.144-.261.322-.373.432-.124.123-.254.256-.11.503.144.247.641 1.057 1.376 1.713.946.843 1.744 1.104 1.991 1.228.247.124.391.103.535-.062.145-.165.618-.719.783-.967.165-.247.33-.206.556-.123.226.082 1.436.677 1.683.801.247.124.412.185.473.288.062.103.062.597-.082 1.002zM12 2C6.477 2 2 6.477 2 12c0 1.891.528 3.659 1.442 5.174L2 22l4.981-1.306C8.441 21.545 10.16 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
              </svg>
              <span className="font-black">{lang === 'bn' ? 'WhatsApp চ্যাট' : 'WhatsApp'}</span>
            </a>

            {/* VIP Plans Pill Button */}
            <button
              onClick={() => handleNavClick('vipPlans')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-400/20 hover:from-amber-500/30 hover:to-yellow-400/30 border border-amber-500/40 text-amber-300 text-xs font-black transition-all cursor-pointer shadow-sm shadow-amber-500/10"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'bn' ? 'VIP প্ল্যান' : 'VIP Plans'}</span>
            </button>

            {/* Global Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                theme === 'cyber-light'
                  ? 'bg-amber-400/20 border-amber-400 text-amber-600 shadow-md shadow-amber-400/20'
                  : 'bg-slate-900 border-slate-700/80 text-cyan-400 hover:border-cyan-400 shadow-sm'
              }`}
            >
              {theme === 'cyber-light' ? (
                <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-400" />
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Login / Profile Button */}
            {user ? (
              <button
                onClick={() => handleNavClick('account')}
                className={`flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all cursor-pointer shadow-sm ${
                  userProfile?.plan && !userProfile.plan.toLowerCase().includes('free')
                    ? 'bg-slate-900 border-amber-500/40 text-amber-300 hover:border-amber-400'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-cyan-400'
                }`}
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="User Avatar" 
                    className="w-5 h-5 rounded-full object-cover border border-amber-400" 
                  />
                ) : userProfile?.plan && !userProfile.plan.toLowerCase().includes('free') ? (
                  <Crown className="w-4 h-4 text-amber-400" />
                ) : (
                  <Flame className="w-4 h-4 text-cyan-400" />
                )}
                <span className="text-xs font-bold hidden sm:inline truncate max-w-[85px]">
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'User'}
                </span>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                  userProfile?.plan && !userProfile.plan.toLowerCase().includes('free')
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {userProfile?.plan && !userProfile.plan.toLowerCase().includes('free') ? 'VIP' : 'FREE'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => onOpenAuthModal('signin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs transition-all cursor-pointer shadow-md shadow-cyan-500/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'সাইন ইন' : 'Sign In'}</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Dropdown Drawer (Website style) */}
        {isMobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-slate-800 animate-fade-in-up">
            <div className="grid grid-cols-2 gap-2 pb-3">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : item.vipHighlight
                        ? 'text-amber-300 bg-amber-950/30 border border-amber-500/30'
                        : item.highlight
                        ? 'text-emerald-300 bg-emerald-950/30 border border-emerald-500/30'
                        : item.adminOnly
                        ? 'text-red-300 bg-red-950/30 border border-red-500/30'
                        : 'text-slate-300 bg-slate-900/60 border border-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-cyan-400" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <a
                href={CONTACT_CONFIG.getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 fill-emerald-400 shrink-0" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-1.99-.46-1.657-.683-2.73-2.366-2.812-2.476-.083-.11-1.01-1.348-1.01-2.572 0-1.223.636-1.824.862-2.073.226-.249.493-.311.658-.311.164 0 .328.002.472.01.153.007.358-.058.56.427.207.499.704 1.722.766 1.847.062.125.103.271.021.434-.083.164-.124.266-.247.41-.124.144-.261.322-.373.432-.124.123-.254.256-.11.503.144.247.641 1.057 1.376 1.713.946.843 1.744 1.104 1.991 1.228.247.124.391.103.535-.062.145-.165.618-.719.783-.967.165-.247.33-.206.556-.123.226.082 1.436.677 1.683.801.247.124.412.185.473.288.062.103.062.597-.082 1.002zM12 2C6.477 2 2 6.477 2 12c0 1.891.528 3.659 1.442 5.174L2 22l4.981-1.306C8.441 21.545 10.16 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                  </svg>
                  <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপ সরাসরি চ্যাট' : 'WhatsApp Direct Chat'}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">● Live Support</span>
              </a>

              <div className="flex items-center justify-between text-xs">
                <a
                  href={CONTACT_CONFIG.whatsappChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 font-medium text-[11px]"
                >
                  <span>📢 {lang === 'bn' ? 'অফিশিয়াল চ্যানেল' : 'Official Channel'} ➔</span>
                </a>
                <span className="text-slate-500 text-[11px]">Soverixnet Web</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};

