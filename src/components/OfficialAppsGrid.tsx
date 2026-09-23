import React, { useState } from 'react';
import { CONTACT_CONFIG, AppDownloadItem } from '../data/contact';
import { 
  Download, 
  Smartphone, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Share2,
  Copy,
  Check
} from 'lucide-react';

interface OfficialAppsGridProps {
  lang: 'en' | 'bn';
  title?: string;
  subtitle?: string;
  highlightedAppId?: string;
  compact?: boolean;
}

export const OfficialAppsGrid: React.FC<OfficialAppsGridProps> = ({
  lang,
  title,
  subtitle,
  compact = false,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const apps = CONTACT_CONFIG.getAppList();

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  // Color schemes for each app to give high-end distinctive 3D cyber styling
  const getColorStyles = (color: AppDownloadItem['themeColor']) => {
    switch (color) {
      case 'cyan':
        return {
          cardBorder: 'border-cyan-500/40 hover:border-cyan-400',
          glow: 'from-cyan-500/10 via-slate-900 to-slate-950',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-500/20',
          accentText: 'text-cyan-400',
          iconBg: 'bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-cyan-500/30',
          // 3D Pushable Button styles
          btn3D: 'bg-gradient-to-b from-cyan-400 to-cyan-600 hover:from-cyan-300 hover:to-cyan-500 text-slate-950 border-b-[4px] border-cyan-800 hover:border-cyan-900 active:border-b-0 active:translate-y-[3px] shadow-lg shadow-cyan-500/25',
          secBtn: 'bg-cyan-950/40 hover:bg-cyan-900/60 border-cyan-500/30 text-cyan-300 hover:text-white',
        };
      case 'emerald':
        return {
          cardBorder: 'border-emerald-500/40 hover:border-emerald-400',
          glow: 'from-emerald-500/10 via-slate-900 to-slate-950',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20',
          accentText: 'text-emerald-400',
          iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/30',
          // 3D Pushable Button styles
          btn3D: 'bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-slate-950 border-b-[4px] border-emerald-800 hover:border-emerald-900 active:border-b-0 active:translate-y-[3px] shadow-lg shadow-emerald-500/25',
          secBtn: 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-500/30 text-emerald-300 hover:text-white',
        };
      case 'amber':
        return {
          cardBorder: 'border-amber-500/40 hover:border-amber-400',
          glow: 'from-amber-500/10 via-slate-900 to-slate-950',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20',
          accentText: 'text-amber-400',
          iconBg: 'bg-gradient-to-tr from-amber-600 to-orange-500 shadow-amber-500/30',
          // 3D Pushable Button styles
          btn3D: 'bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 border-b-[4px] border-amber-800 hover:border-amber-900 active:border-b-0 active:translate-y-[3px] shadow-lg shadow-amber-500/25',
          secBtn: 'bg-amber-950/40 hover:bg-amber-900/60 border-amber-500/30 text-amber-300 hover:text-white',
        };
      case 'purple':
      default:
        return {
          cardBorder: 'border-purple-500/40 hover:border-purple-400',
          glow: 'from-purple-500/10 via-slate-900 to-slate-950',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-purple-500/20',
          accentText: 'text-purple-400',
          iconBg: 'bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-purple-500/30',
          // 3D Pushable Button styles
          btn3D: 'bg-gradient-to-b from-purple-400 to-purple-600 hover:from-purple-300 hover:to-purple-500 text-slate-950 border-b-[4px] border-purple-800 hover:border-purple-900 active:border-b-0 active:translate-y-[3px] shadow-lg shadow-purple-500/25',
          secBtn: 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-500/30 text-purple-300 hover:text-white',
        };
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header section if provided or default */}
      {(title || subtitle) && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>{lang === 'bn' ? 'অফিসিয়াল মোবাইল অ্যাপস হাব' : 'Official Mobile App Ecosystem'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              {title || (lang === 'bn' ? '৪টি সুপারফাস্ট অফিসিয়াল ভিপিএন অ্যাপ' : '4 Official High-Speed VPN Apps')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {subtitle || (lang === 'bn' 
                ? 'সরাসরি হাই-স্পিড ডাউনলোড লিংক। কোনো ঝামেলা বা অ্যাড ছাড়া সরাসরি ইন্সটল করে আনলিমিটেড ইন্টারনেট উপভোগ করুন।' 
                : 'Direct high-speed APK download links. No annoying redirects—install directly and surf unthrottled.')}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={CONTACT_CONFIG.getWhatsAppUrl('আসসালামু আলাইকুম, আমি ভিপিএন অ্যাপসের কনফিগ ও সেটআপ হেল্প চাই।')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-500/10 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-current text-emerald-400 shrink-0" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-1.99-.46-1.657-.683-2.73-2.366-2.812-2.476-.083-.11-1.01-1.348-1.01-2.572 0-1.223.636-1.824.862-2.073.226-.249.493-.311.658-.311.164 0 .328.002.472.01.153.007.358-.058.56.427.207.499.704 1.722.766 1.847.062.125.103.271.021.434-.083.164-.124.266-.247.41-.124.144-.261.322-.373.432-.124.123-.254.256-.11.503.144.247.641 1.057 1.376 1.713.946.843 1.744 1.104 1.991 1.228.247.124.391.103.535-.062.145-.165.618-.719.783-.967.165-.247.33-.206.556-.123.226.082 1.436.677 1.683.801.247.124.412.185.473.288.062.103.062.597-.082 1.002zM12 2C6.477 2 2 6.477 2 12c0 1.891.528 3.659 1.442 5.174L2 22l4.981-1.306C8.441 21.545 10.16 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
              </svg>
              <span>{lang === 'bn' ? 'WhatsApp সাপোর্ট' : 'WhatsApp Support'}</span>
            </a>
          </div>
        </div>
      )}

      {/* Uniform Pattern Grid for all 4 apps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {apps.map((app, index) => {
          const styles = getColorStyles(app.themeColor);
          const isCopied = copiedLink === app.id;

          return (
            <div
              key={app.id}
              className={`relative rounded-3xl bg-gradient-to-b ${styles.glow} border ${styles.cardBorder} p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-[1.015] group`}
            >
              {/* Top Row: App Index Badge & Category Tag */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${styles.badge}`}>
                  {lang === 'bn' ? app.badgeBn : app.badge}
                </span>

                <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
                  {app.size}
                </span>
              </div>

              {/* App Identity */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl p-0.5 flex items-center justify-center text-white shadow-lg ${styles.iconBg} group-hover:rotate-3 transition-transform`}>
                    <Smartphone className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-white truncate group-hover:text-cyan-200 transition-colors">
                      {app.name}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      {app.version}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-medium leading-relaxed min-h-[44px]">
                  {lang === 'bn' ? app.descBn : app.descEn}
                </p>

                {/* Features Pill List */}
                <div className="space-y-1 pt-2 border-t border-slate-800/80">
                  {(lang === 'bn' ? app.featuresBn : app.featuresEn).map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${styles.accentText} shrink-0`} />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3D Action Section */}
              <div className="mt-5 pt-4 border-t border-slate-800/90 space-y-2.5">
                {/* 3D Tactile Pushable Download Button */}
                <a
                  href={app.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all transform cursor-pointer tracking-wide ${styles.btn3D}`}
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>{lang === 'bn' ? 'সরাসরি APK ডাউনলোড' : 'Download APK'}</span>
                </a>

                {/* Secondary Utility Row (Copy Link & Setup Help) */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyLink(app.downloadUrl, app.id)}
                    title={lang === 'bn' ? 'ডাউনলোড লিংক কপি করুন' : 'Copy Download URL'}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-colors flex items-center justify-center gap-1 cursor-pointer ${styles.secBtn}`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{lang === 'bn' ? 'কপি হয়েছে' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'লিংক কপি' : 'Copy Link'}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={CONTACT_CONFIG.getWhatsAppUrl(`আসসালামু আলাইকুম, আমি "${app.name}" অ্যাপটি ডাউনলোড করেছি। এর ইউজারনেম/পিন বা ফ্রি-নেট কনফিগ দিন প্লিজ।`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={lang === 'bn' ? 'হোয়াটসঅ্যাপে কনফিগ নিন' : 'Get Config on WhatsApp'}
                    className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>💬</span>
                    <span>{lang === 'bn' ? 'সেটআপ' : 'Setup'}</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Helpful Guarantee / Security Note */}
      <div className="p-4 rounded-2xl bg-[#030814] border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {lang === 'bn' 
              ? 'নিরাপদ ও ভাইরাস মুক্ত: সব কয়টি APK ফাইল ১০০% নিরাপদ ও অফিসিয়াল সার্ভার লিংক থেকে ডাউনলোড হবে।' 
              : '100% Virus-Free & Clean APKs: Verified safe builds with zero trackers.'}
          </span>
        </div>

        <div className="flex items-center gap-3 font-semibold text-slate-300">
          <span>📱 Android 7.0+</span>
          <span>⚡ No Root Required</span>
          <span>🛡️ SSL TLS 1.3</span>
        </div>
      </div>
    </div>
  );
};
