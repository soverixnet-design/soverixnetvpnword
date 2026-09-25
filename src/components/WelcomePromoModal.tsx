import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ExternalLink, 
  Zap, 
  ShieldCheck, 
  PhoneCall, 
  MessageSquare, 
  Gift, 
  ArrowRight,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { CONTACT_CONFIG, getSiteSettings } from '../data/contact';

interface WelcomePromoModalProps {
  lang: 'en' | 'bn';
  forceOpen?: boolean;
  onClose?: () => void;
}

export const WelcomePromoModal: React.FC<WelcomePromoModalProps> = ({ 
  lang, 
  forceOpen = false,
  onClose 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'saudi5g' | 'support'>('saudi5g');

  useEffect(() => {
    // If forceOpen is provided via props
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    const currentSettings = getSiteSettings();
    if (!currentSettings.promoModalEnabled || currentSettings.sectionVisibility?.promoModal === false) {
      return;
    }

    // Check if modal was already dismissed in this session
    try {
      const dismissed = sessionStorage.getItem('soverix_welcome_popup_seen');
      if (!dismissed) {
        // Pop up smoothly after initial site load
        const timer = setTimeout(() => {
          const check = getSiteSettings();
          if (check.promoModalEnabled && check.sectionVisibility?.promoModal !== false) {
            setIsOpen(true);
          }
        }, 700);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('soverix_welcome_popup_seen', 'true');
    } catch {}
    if (onClose) onClose();
  };

  const handleOpenWhatsApp = (customText?: string) => {
    const message = customText || (
      lang === 'bn' 
        ? 'আসসালামু আলাইকুম, আমি ওয়েবসাইটের অফার ব্যানার দেখে Soverixnet ভিপিএন আইডি ও ফ্রি-নেট অফার নিতে এসেছি। বিস্তারিত জানাবেন প্লিজ।'
        : 'Hello, I saw the special offer banner on the website and want to get Soverixnet VPN ID & FreeNet setup. Please provide details.'
    );
    const url = CONTACT_CONFIG.getWhatsAppUrl(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-xl my-auto rounded-3xl bg-[#070e1c] border border-cyan-500/40 shadow-2xl shadow-cyan-950/60 overflow-hidden text-slate-200 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="relative z-10 px-4 sm:px-5 py-3.5 bg-slate-900/90 border-b border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src="/soverix_shield_logo.jpg" 
              alt="Soverixnet Cyber Shield" 
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-xl object-cover border border-cyan-400/40 shadow-md shadow-cyan-500/20"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-wide text-white">Soverixnet VPN</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
                  OFFICIAL OFFER
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {lang === 'bn' ? 'সৌদি আরব ও গাল্ফ স্পেশাল ফ্রি-নেট অফার' : 'Gulf & Global Free-Net Special Offer'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title={lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: Saudi 5G Banner vs 24/7 WhatsApp Support */}
        <div className="relative z-10 px-4 pt-2.5 pb-1 flex items-center gap-2 bg-[#040914] border-b border-slate-800/60">
          <button
            onClick={() => setActiveTab('saudi5g')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'saudi5g'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'bn' ? '🇸🇦 সৌদি আরব 5G অফার' : '🇸🇦 Saudi 5G FreeNet'}</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'support'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'bn' ? '💬 হোয়াটসঅ্যাপ সাপোর্ট ব্যানার' : '💬 WhatsApp Support'}</span>
          </button>
        </div>

        {/* Modal Body & Clickable Cover Banner */}
        <div className="relative z-10 p-4 sm:p-5 space-y-4">

          {/* THE COVER BANNER (Clicking opens WhatsApp directly with no distracting text overlay) */}
          <div 
            onClick={() => handleOpenWhatsApp()}
            className="group relative rounded-2xl overflow-hidden border border-emerald-500/40 shadow-2xl shadow-emerald-950/40 cursor-pointer transition-all duration-300 transform hover:scale-[1.01] hover:border-emerald-400"
          >
            {activeTab === 'saudi5g' ? (
              <img 
                src="/file_00000000fed471faa1f0ce09aa2e4615.png" 
                alt="সৌদি আরবে সম্পূর্ণ আনলিমিটেড ফ্রি ইন্টারনেট ব্যবহার করুন"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover max-h-[300px] sm:max-h-[340px] block"
              />
            ) : (
              <img 
                src="/thumb-android-tips.png" 
                alt="Soverixnet Android Tips & VPN Support"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover max-h-[300px] sm:max-h-[340px] block"
              />
            )}
          </div>

          {/* Quick Choice Preset WhatsApp Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-1">
              <span>{lang === 'bn' ? 'সরাসরি প্যাকেজ সিলেক্ট করে মেসেজ দিন:' : 'Instant Package Inquiry:'}</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {lang === 'bn' ? 'অনলাইন সাপোর্ট সক্রিয়' : 'Support Active'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleOpenWhatsApp('আসসালামু আলাইকুম, আমি সৌদি আরবে STC সিমে আনলিমিটেড 5G ফ্রি-নেট চালাতে চাই। কনফিগ ও আইডি দিন প্লিজ।')}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-emerald-300">
                  <span>🇸🇦 STC 5G ফ্রি-নেট</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">০ ব্যালেন্সে ফ্রি ইন্টারনেট</span>
              </button>

              <button
                onClick={() => handleOpenWhatsApp('আসসালামু আলাইকুম, আমি সৌদি আরবে Mobily 60 SAR আনলিমিটেড প্যাকেজ চালাতে চাই। পিন কোড দিন প্লিজ।')}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-emerald-300">
                  <span>🇸🇦 Mobily আনলিমিটেড</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">৬০ রিয়ালে ফুল স্পিড নো লিমিট</span>
              </button>

              <button
                onClick={() => handleOpenWhatsApp('আসসালামু আলাইকুম, আমি Zain / Redbull / Jawwy সিমের ফ্রি-নেট প্যাকেজ ট্রিক নিতে চাই।')}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-emerald-300">
                  <span>🇸🇦 Zain / Jawwy ট্রিক</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">হাই-স্পিড ভিআইপি নোড</span>
              </button>

              <button
                onClick={() => handleOpenWhatsApp('আসসালামু আলাইকুম, আমি Soverixnet VPN এর ১ মাসের টেস্ট পিন বা ভিআইপি একাউন্ট নিতে চাই।')}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-cyan-300">
                  <span>🛡️ ১ মাসের VIP আইডি</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">সব দেশে আনলিমিটেড স্পিড</span>
              </button>
            </div>
          </div>

          {/* Giant Main WhatsApp CTA Button */}
          <button
            onClick={() => handleOpenWhatsApp()}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/30 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          >
            <svg className="w-5 h-5 fill-black shrink-0" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-1.99-.46-1.657-.683-2.73-2.366-2.812-2.476-.083-.11-1.01-1.348-1.01-2.572 0-1.223.636-1.824.862-2.073.226-.249.493-.311.658-.311.164 0 .328.002.472.01.153.007.358-.058.56.427.207.499.704 1.722.766 1.847.062.125.103.271.021.434-.083.164-.124.266-.247.41-.124.144-.261.322-.373.432-.124.123-.254.256-.11.503.144.247.641 1.057 1.376 1.713.946.843 1.744 1.104 1.991 1.228.247.124.391.103.535-.062.145-.165.618-.719.783-.967.165-.247.33-.206.556-.123.226.082 1.436.677 1.683.801.247.124.412.185.473.288.062.103.062.597-.082 1.002zM12 2C6.477 2 2 6.477 2 12c0 1.891.528 3.659 1.442 5.174L2 22l4.981-1.306C8.441 21.545 10.16 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
            </svg>
            <span>
              {lang === 'bn' 
                ? '💬 WhatsApp এ সরাসরি কথা বলুন ও অফার নিন' 
                : '💬 Chat on WhatsApp to Get Instant Offer'}
            </span>
          </button>

          {/* Bottom dismissal */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              {lang === 'bn' ? '১০০% নিরাপদ ও ভেরিফাইড সাপোর্ট' : '100% Safe & Verified Support'}
            </span>

            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              {lang === 'bn' ? 'পরে দেখুন / সাইটে যান' : 'Continue to Site'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
