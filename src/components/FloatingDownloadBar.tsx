import React, { useState, useEffect } from 'react';
import { Download, MessageCircle, Radio, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { CONTACT_CONFIG, getSiteSettings } from '../data/contact';

interface FloatingDownloadBarProps {
  lang: 'en' | 'bn';
}

export const FloatingDownloadBar: React.FC<FloatingDownloadBarProps> = ({ lang }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [settings, setSettings] = useState(() => getSiteSettings());

  useEffect(() => {
    const handleUpdate = () => setSettings(getSiteSettings());
    window.addEventListener('soverix_settings_changed', handleUpdate);
    return () => window.removeEventListener('soverix_settings_changed', handleUpdate);
  }, []);

  // Directly trigger WhatsApp with reliable fallback
  const handleOpenWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = CONTACT_CONFIG.getWhatsAppUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const apps = [
    {
      id: 'mohin-vip',
      shortName: 'Mohin VIP',
      badge: 'VIP Pro',
      downloadUrl: settings.appMohinVipUrl,
      btnClass: 'from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 border-amber-800 text-slate-950 shadow-amber-500/25',
      icon: '👑',
    },
    {
      id: 'net-solution',
      shortName: 'Net Solution',
      badge: 'All SIM',
      downloadUrl: settings.appNetSolutionUrl,
      btnClass: 'from-purple-400 via-purple-500 to-purple-600 hover:from-purple-300 hover:to-purple-500 border-purple-800 text-white shadow-purple-500/25',
      icon: '⚡',
    },
    {
      id: 'af-v2ray',
      shortName: 'AF V2Ray',
      badge: 'Global',
      downloadUrl: settings.appAfV2RayUrl,
      btnClass: 'from-cyan-400 via-cyan-500 to-cyan-600 hover:from-cyan-300 hover:to-cyan-500 border-cyan-800 text-slate-950 shadow-cyan-500/25',
      icon: '🛡️',
    },
    {
      id: 'jiyam-plus',
      shortName: 'Jiyam Plus',
      badge: 'Gulf SIM',
      downloadUrl: settings.appJiyamPlusUrl,
      btnClass: 'from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 border-emerald-800 text-slate-950 shadow-emerald-500/25',
      icon: '🚀',
    },
  ];

  return (
    <aside
      aria-label="Floating Downloads & WhatsApp"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-full max-w-[96%] sm:max-w-fit px-2 pointer-events-none transition-all duration-300"
    >
      <div className="pointer-events-auto bg-[#040816]/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 shadow-[0_12px_45px_rgba(0,0,0,0.85),0_0_20px_rgba(6,182,212,0.18)] transition-all">
        
        {/* Minimized Bar view on small screen */}
        {isMinimized ? (
          <div className="flex items-center justify-between gap-3 px-2 py-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-cyan-300">
                {lang === 'bn' ? '৪টি অ্যাপ ও WhatsApp মেনু' : '4 Apps & WhatsApp Bar'}
              </span>
            </div>
            <button
              onClick={() => setIsMinimized(false)}
              className="px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>{lang === 'bn' ? 'খুলুন' : 'Expand'}</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            
            {/* Top Sub-Bar: Title & Controls */}
            <div className="flex items-center justify-between gap-2 px-1 text-[11px] text-slate-400 border-b border-slate-800/80 pb-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="text-white">
                  {lang === 'bn' ? 'সরাসরি ভাসমান ডাউনলোড (১-ক্লিক APK)' : 'Instant Floating Downloads (1-Click APK)'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden md:inline-block text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ● 24/7 Live Support
                </span>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                  title="Minimize"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Interactive Items Row */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5">
              
              {/* Separate 3D Download Button for each App */}
              {apps.map((app) => (
                <a
                  key={app.id}
                  href={app.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-b ${app.btnClass} font-black text-[11px] sm:text-xs flex items-center gap-1.5 border-b-[3px] active:border-b-0 active:translate-y-[2px] shadow-md cursor-pointer transition-all shrink-0 hover:brightness-110`}
                  title={`Download ${app.shortName} APK`}
                >
                  <span className="text-xs group-hover:scale-110 transition-transform">{app.icon}</span>
                  <span className="whitespace-nowrap font-bold tracking-tight">{app.shortName}</span>
                  <Download className="w-3 h-3 stroke-[2.5] shrink-0 opacity-80 group-hover:opacity-100" />
                </a>
              ))}

              {/* Visual Divider */}
              <div className="hidden sm:block w-px h-6 bg-slate-800 shrink-0" />

              {/* Separate WhatsApp Direct Button with Icon (No raw phone number exposed) */}
              <a
                href={CONTACT_CONFIG.getWhatsAppUrl()}
                onClick={handleOpenWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-300 hover:to-emerald-400 text-slate-950 font-black text-[11px] sm:text-xs flex items-center gap-1.5 border-b-[3px] border-emerald-800 active:border-b-0 active:translate-y-[2px] shadow-md shadow-emerald-500/25 cursor-pointer transition-all shrink-0 hover:brightness-110"
                title="WhatsApp Support"
              >
                <svg className="w-4 h-4 fill-slate-950 shrink-0" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-1.99-.46-1.657-.683-2.73-2.366-2.812-2.476-.083-.11-1.01-1.348-1.01-2.572 0-1.223.636-1.824.862-2.073.226-.249.493-.311.658-.311.164 0 .328.002.472.01.153.007.358-.058.56.427.207.499.704 1.722.766 1.847.062.125.103.271.021.434-.083.164-.124.266-.247.41-.124.144-.261.322-.373.432-.124.123-.254.256-.11.503.144.247.641 1.057 1.376 1.713.946.843 1.744 1.104 1.991 1.228.247.124.391.103.535-.062.145-.165.618-.719.783-.967.165-.247.33-.206.556-.123.226.082 1.436.677 1.683.801.247.124.412.185.473.288.062.103.062.597-.082 1.002zM12 2C6.477 2 2 6.477 2 12c0 1.891.528 3.659 1.442 5.174L2 22l4.981-1.306C8.441 21.545 10.16 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
                <span className="font-black whitespace-nowrap">
                  {lang === 'bn' ? 'WhatsApp চ্যাট' : 'WhatsApp Chat'}
                </span>
              </a>

              {/* Separate WhatsApp Channel Link */}
              <a
                href={CONTACT_CONFIG.whatsappChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/40 text-emerald-400 font-bold text-[11px] sm:text-xs flex items-center gap-1.5 transition-all shrink-0 hover:border-emerald-300"
                title="Join WhatsApp Channel"
              >
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span className="whitespace-nowrap">{lang === 'bn' ? 'চ্যানেল' : 'Channel'}</span>
              </a>

            </div>

          </div>
        )}
      </div>
    </aside>
  );
};
