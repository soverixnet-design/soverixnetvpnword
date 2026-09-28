import React from 'react';
import { 
  Download, 
  Film, 
  Smartphone, 
  Laptop, 
  Apple, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  FileCode2, 
  ChevronRight 
} from 'lucide-react';
import { OfficialAppsGrid } from './OfficialAppsGrid';
import { VideoTutorialsSection } from './VideoTutorialsSection';

interface AppsAndTutorialsViewProps {
  lang: 'en' | 'bn';
  onNavigateTab: (tab: string) => void;
}

export const AppsAndTutorialsView: React.FC<AppsAndTutorialsViewProps> = ({
  lang,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-cyan-500/30 bg-gradient-to-br from-[#02141a] via-slate-950 to-[#0c0418] shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'অফিসিয়াল অ্যাপস ও ভিডিও টিউটোরিয়াল' : 'Official Apps & Video Guides'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {lang === 'bn' 
                ? 'ভিপিএন অ্যাপস ডাউনলোড ও ভিডিও সেটআপ গাইড' 
                : 'VPN Apps Download & Step-by-Step Video Setup'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {lang === 'bn'
                ? 'আমাদের ৪টি ভেরিফাইড অফিসিয়াল অ্যান্ড্রয়েড ভিপিএন অ্যাপ ডাউনলোড করুন এবং ভিডিও টিউটোরিয়াল দেখে ১ মিনিটে সহজে কানেক্ট করুন।'
                : 'Download our official Android APKs with 3D tactile buttons, or configure Windows PC and iPhone with easy video tutorials.'}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('packages')}
            className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 shrink-0 cursor-pointer"
          >
            <span>{lang === 'bn' ? '🛒 পিন অর্ডার করুন ➔' : '🛒 Order PIN ➔'}</span>
          </button>
        </div>
      </div>

      {/* 4 Official Android Apps (3D Download Buttons) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-6">
        <OfficialAppsGrid 
          lang={lang}
          title={lang === 'bn' ? '৪টি অফিসিয়াল অ্যান্ড্রয়েড অ্যাপস হাব' : '4 Official Android VPN Apps'}
          subtitle={lang === 'bn' 
            ? 'সরাসরি ৩ডি বাটনে ক্লিক করে হাই-স্পিড APK ফাইল ডাউনলোড করুন এবং সহজে আনলিমিটেড চালান।' 
            : 'Download verified high-speed official APKs directly with tactile 3D buttons.'}
        />

        {/* Windows & iOS Configs */}
        <div className="pt-6 border-t border-slate-800/80">
          <div className="text-center mb-4">
            <span className="text-xs font-bold text-slate-400">
              💻 {lang === 'bn' ? 'উইন্ডোজ পিসি ও আইফোনের জন্য সেটআপ' : 'Windows PC & iPhone / iPad Setup'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            {/* Windows */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all text-center flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Laptop className="w-6 h-6 text-cyan-400 shrink-0" />
                <div className="text-left">
                  <span className="text-xs font-bold text-white block">Windows PC</span>
                  <span className="text-[10px] text-slate-400">v2rayN & WireGuard</span>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('configs')}
                className="py-1.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/30 cursor-pointer"
              >
                {lang === 'bn' ? 'কনফিগ নিন' : 'Get Config'}
              </button>
            </div>

            {/* iOS */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all text-center flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Apple className="w-6 h-6 text-indigo-400 shrink-0" />
                <div className="text-left">
                  <span className="text-xs font-bold text-white block">iOS (iPhone/iPad)</span>
                  <span className="text-[10px] text-slate-400">Shadowrocket & Sing-box</span>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('configs')}
                className="py-1.5 px-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold border border-indigo-500/30 cursor-pointer"
              >
                {lang === 'bn' ? 'কনফিগ নিন' : 'Get Config'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Tutorials Section */}
      <VideoTutorialsSection 
        lang={lang} 
        onNavigateTab={onNavigateTab} 
      />
    </div>
  );
};
