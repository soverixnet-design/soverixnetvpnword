import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Bell, 
  BellRing, 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Share, 
  PlusSquare,
  Zap,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PwaInstallAndPushBannerProps {
  lang: 'en' | 'bn';
}

export const PwaInstallAndPushBanner: React.FC<PwaInstallAndPushBannerProps> = ({ lang }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushToast, setPushToast] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Listen for PWA install event
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch {}
      }
      setDeferredPrompt(null);
    } else {
      // If iOS or generic desktop
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIos) {
        setShowIosGuide(true);
      } else {
        alert(
          lang === 'bn' 
            ? 'আপনার ব্রাউজার মেন্যু (৩টি ডট) থেকে "Add to Home Screen" বা "Install App" সিলেক্ট করে ইনস্টল করুন।'
            : 'Click your browser menu (3 dots) and select "Install App" or "Add to Home screen".'
        );
      }
    }
  };

  const handleTogglePush = () => {
    const nextState = !pushEnabled;
    setPushEnabled(nextState);

    if (nextState) {
      setPushToast(
        lang === 'bn' 
          ? '🔔 লাইভ পুশ নোটিফিকেশন সক্রিয় হয়েছে! নতুন আরব ফ্রি-নেট নোড ও স্পিড অ্যালার্ট পাবেন।' 
          : '🔔 Live Push Notifications Active! You will receive instant Arab FreeNet & node alerts.'
      );
      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      } catch {}
    } else {
      setPushToast(
        lang === 'bn' ? 'পুশ নোটিফিকেশন বন্ধ করা হয়েছে।' : 'Push Notifications Muted.'
      );
    }

    setTimeout(() => {
      setPushToast(null);
    }, 4000);
  };

  if (isDismissed) return null;

  return (
    <div className="w-full">
      
      {/* Toast Alert for Push Toggle */}
      {pushToast && (
        <div className="fixed bottom-20 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-cyan-950 via-slate-900 to-emerald-950 border border-cyan-400 text-cyan-200 text-xs font-bold shadow-2xl animate-fade-in flex items-center gap-3">
          <BellRing className="w-5 h-5 text-cyan-400 animate-bounce" />
          <span>{pushToast}</span>
        </div>
      )}

      {/* Modern High-Tech Install & Notification Strip */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-950/90 via-cyan-950/40 to-slate-950/90 border border-cyan-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-black font-extrabold shadow-md shadow-cyan-500/20 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="font-extrabold text-white text-sm">
                {lang === 'bn' ? '📲 SoverixNet মোবাইল অ্যাপ ইনস্টল করুন' : '📲 Install SoverixNet App on Device'}
              </h5>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold uppercase">
                PWA Fast
              </span>
            </div>
            <p className="text-slate-300 text-[11px] mt-0.5">
              {lang === 'bn' 
                ? 'ব্রাউজার ছাড়াই অ্যান্ড্রয়েড, আইফোন বা কম্পিউটারে সরাসরি অ্যাপের মতো ব্যবহার করুন ও নোটিফিকেশন পান।' 
                : 'Run as a native lightweight app on Android, iOS & Desktop with zero battery drain.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Push Notification Toggle */}
          <button
            onClick={handleTogglePush}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              pushEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            {pushEnabled ? <BellRing className="w-3.5 h-3.5 text-emerald-400" /> : <Bell className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">
              {pushEnabled 
                ? (lang === 'bn' ? 'নোটিফিকেশন সক্রিয়' : 'Alerts Active') 
                : (lang === 'bn' ? 'নোটিফিকেশন চালু করুন' : 'Enable Alerts')}
            </span>
          </button>

          {/* Install Button */}
          <button
            onClick={handleInstallPwa}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>{lang === 'bn' ? 'হোমস্ক্রিনে ইনস্টল' : 'Install App'}</span>
          </button>

          {/* Dismiss button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-2 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-900 cursor-pointer"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Step-by-Step Install Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-950 border border-cyan-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'bn' ? 'আইফোন / আইপ্যাডে ইনস্টল করার নিয়ম' : 'Install on iPhone & iPad (iOS)'}</span>
              </h4>
              <button onClick={() => setShowIosGuide(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 font-bold">1</span>
                <div>
                  <p className="font-bold text-white">{lang === 'bn' ? 'সাফারি ব্রাউজারে শেয়ার বাটনে চাপুন:' : 'Tap Safari Share Button:'}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <span>{lang === 'bn' ? 'স্ক্রিনের নিচে' : 'Bottom bar icon'}</span>
                    <Share className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === 'bn' ? 'আইকনটিতে চাপ দিন।' : 'tap Share.'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 font-bold">2</span>
                <div>
                  <p className="font-bold text-white">{lang === 'bn' ? '"Add to Home Screen" সিলেক্ট করুন:' : 'Select "Add to Home Screen":'}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <span>{lang === 'bn' ? 'মেনু থেকে' : 'Scroll down to'}</span>
                    <PlusSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>"Add to Home Screen" {lang === 'bn' ? 'চাপুন।' : 'and tap Add.'}</span>
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs cursor-pointer transition-all"
            >
              {lang === 'bn' ? 'বুঝেছি (Close)' : 'Got It'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
