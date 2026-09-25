import React, { useState } from 'react';
import { 
  SiteSettingsData, 
  SectionVisibilityConfig, 
  getSiteSettings, 
  saveSiteSettings,
  DEFAULT_SECTION_VISIBILITY
} from '../../data/contact';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  SlidersHorizontal, 
  Eye, 
  EyeOff, 
  Check, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck,
  Server,
  Smartphone,
  MessageSquare,
  Gift,
  Zap,
  Radio,
  Sparkles,
  Layers,
  HelpCircle,
  PlaySquare
} from 'lucide-react';

interface SectionsManagerProps {
  lang: 'en' | 'bn';
  onUpdated?: () => void;
}

interface SectionMeta {
  key: keyof SectionVisibilityConfig;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  icon: any;
  category: 'core' | 'marketing' | 'widgets';
}

const ALL_SECTIONS: SectionMeta[] = [
  {
    key: 'heroConnect',
    titleBn: 'হিরো ভিপিএন কানেক্ট কার্ড (Hero Connect Card)',
    titleEn: 'Hero VPN Connect Dial & Card',
    descBn: 'প্রধান ১-ট্যাপ ভিপিএন কানেক্ট বাটন, লাইভ স্পিড অ্যানিমেশন ও স্ট্যাটাস ডায়াল।',
    descEn: 'The central connect/disconnect button dial and live connection status.',
    icon: Radio,
    category: 'core',
  },
  {
    key: 'topNoticeMarquee',
    titleBn: 'শীর্ষ নোটিশ অ্যানাউন্সমেন্ট বার (Top Marquee Ticker)',
    titleEn: 'Top Announcement Scrolling Ticker',
    descBn: 'ওয়েবসাইটের একদম উপরে গুরুত্বপূর্ণ নোটিশ, অফার বা ব্রেকিং নিউজ স্ক্রোলিং বার।',
    descEn: 'The top notification strip displaying breaking news or promos.',
    icon: Zap,
    category: 'marketing',
  },
  {
    key: 'bannersSlider',
    titleBn: 'প্রমোশনাল ব্যানার ক্যারোসেল (Promotional Banners Slider)',
    titleEn: 'Promotional Banners Slider',
    descBn: 'হোমপেজে প্রদর্শিত আকর্ষণীয় বড় ব্যানার স্লাইডার ও সরাসরি হোয়াটসঅ্যাপ লিংক বাটন।',
    descEn: 'Interactive banner slider carousel with image previews and WhatsApp action.',
    icon: Sparkles,
    category: 'marketing',
  },
  {
    key: 'officialApks',
    titleBn: 'অফিসিয়াল এপিকে ডাউনলোড গ্রিড (Official APKs Section)',
    titleEn: 'Official Android APK Download Cards',
    descBn: 'AF V2Ray, Jiyam Plus, Mohin VIP ও Net Solution অ্যাপগুলোর ডাউনলোড কার্ড সেকশন।',
    descEn: 'Cards showcasing direct download links for all 4 official Android APKs.',
    icon: Smartphone,
    category: 'core',
  },
  {
    key: 'videoTutorials',
    titleBn: 'ভিডিও টিউটোরিয়াল ও গাইড হাব (Video Guides Section)',
    titleEn: 'Video Tutorials & Setup Guides Hub',
    descBn: 'ইউটিউব বা সরাসরি ভিডিও প্লেয়ার, আরব সিম ফ্রি-নেট সেটিং ও অ্যাপ টিউটোরিয়াল সেকশন।',
    descEn: 'Video player showcase with Gulf SIM setup tutorials and app guides.',
    icon: PlaySquare,
    category: 'marketing',
  },
  {
    key: 'arabSimPayload',
    titleBn: 'আরব সিম পেলোড ও এসএনআই কাস্টমাইজার (Arab SIM & FreeNet)',
    titleEn: 'Arab SIM & FreeNet SNI Customizer',
    descBn: 'সৌদি আরব (STC, Mobily, Zain) এবং উপসাগরীয় দেশের ০ ব্যালেন্স ফ্রি-নেট সিম টুল।',
    descEn: 'Interactive SIM payload injector and SNI configurator tab.',
    icon: ShieldCheck,
    category: 'core',
  },
  {
    key: 'vipPlans',
    titleBn: 'ভিআইপি প্ল্যান ও প্রাইসিং প্যাকেজ (VIP Pricing Plans)',
    titleEn: 'VIP Pricing & Subscription Plans',
    descBn: '১ মাস, ১ বছর ও লাইফটাইম ভিআইপি প্যাকেজ এবং বিকাশ/নগদ/মাদা পেমেন্ট বাটন।',
    descEn: 'VIP tier pricing cards with local and international payment buttons.',
    icon: Sparkles,
    category: 'core',
  },
  {
    key: 'serverNodes',
    titleBn: 'গ্লোবাল সার্ভার নোড ও পিং টেবিল (Server Fleet & Nodes)',
    titleEn: 'Global Server Nodes & Live Ping Table',
    descBn: 'বিশ্বব্যাপী বিভিন্ন দেশের আল্ট্রা-ফাস্ট সার্ভার নোড লিস্ট ও রিয়েলটাইম পিং।',
    descEn: 'Worldwide server location list with flags, ping latency, and protocols.',
    icon: Server,
    category: 'core',
  },
  {
    key: 'benefitsFeatures',
    titleBn: 'সিকিউরিটি ফিচার ও সুবিধাসমূহ (Benefits & Features)',
    titleEn: 'Security Benefits & Protocol Features',
    descBn: 'কোয়ান্টাম শিল্ড, জিরো লগ, কিল সুইচ ও গেমিং এক্সিলারেটরের বিস্তারিত সেকশন।',
    descEn: 'Overview of military-grade encryption, zero logs, and gaming speeds.',
    icon: Layers,
    category: 'core',
  },
  {
    key: 'communityReviews',
    titleBn: 'গ্রাহক রিভিউ ও স্টার রেটিং (Customer Reviews Section)',
    titleEn: 'Customer Reviews & Star Ratings',
    descBn: 'প্রবাসীদের লাইভ রিভিউ, ফিডব্যাক ও মন্তব্য জমা দেওয়ার কমিউনিটি সেকশন।',
    descEn: 'Live customer testimonials and review submission modal.',
    icon: MessageSquare,
    category: 'marketing',
  },
  {
    key: 'floatingDock',
    titleBn: 'ফ্লোটিং বটম ডাউনলোড ও হোয়াটসঅ্যাপ বার (Floating Dock)',
    titleEn: 'Floating Quick Download & WhatsApp Dock',
    descBn: 'স্ক্রিনের নিচে ভাসমান কুইক ডাউনলোড ও সরাসরি হোয়াটসঅ্যাপ সাপোর্ট বাটন।',
    descEn: 'Bottom sticky bar for 1-click APK download and WhatsApp chat.',
    icon: Radio,
    category: 'widgets',
  },
  {
    key: 'promoModal',
    titleBn: 'ওয়েলকাম প্রমো পপআপ মডাল (Welcome Promo Pop-up Modal)',
    titleEn: 'Auto Welcome Promo Modal Popup',
    descBn: 'সাইটে প্রবেশ করার সময় স্বয়ংক্রিয়ভাবে ভেসে ওঠা স্পেশাল অফার পপআপ উইন্ডো।',
    descEn: 'Initial popup modal offering Saudi 5G FreeNet & WhatsApp chat.',
    icon: Gift,
    category: 'widgets',
  },
  {
    key: 'liveSupport',
    titleBn: 'ভাসমান লাইভ সাপোর্ট হেল্পডেস্ক (Floating Live Support)',
    titleEn: 'Floating Helpdesk Live Support Button',
    descBn: 'স্ক্রিনের ডানপাশের নিচে ভাসমান সার্বক্ষণিক হেল্প ও চ্যাট উইজেট।',
    descEn: 'Bottom right floating action button for 24/7 client assistance.',
    icon: HelpCircle,
    category: 'widgets',
  },
];

export const SectionsManager: React.FC<SectionsManagerProps> = ({ lang, onUpdated }) => {
  const [settings, setSettings] = useState<SiteSettingsData>(getSiteSettings());
  const currentVisibility = settings.sectionVisibility || DEFAULT_SECTION_VISIBILITY;

  const [visibilityState, setVisibilityState] = useState<SectionVisibilityConfig>(currentVisibility);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  const handleToggle = (key: keyof SectionVisibilityConfig) => {
    setVisibilityState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleEnableAll = () => {
    const allEnabled: SectionVisibilityConfig = {
      heroConnect: true,
      topNoticeMarquee: true,
      bannersSlider: true,
      officialApks: true,
      videoTutorials: true,
      arabSimPayload: true,
      vipPlans: true,
      serverNodes: true,
      benefitsFeatures: true,
      communityReviews: true,
      floatingDock: true,
      liveSupport: true,
      promoModal: true,
    };
    setVisibilityState(allEnabled);
  };

  const handleSaveVisibility = async () => {
    setIsSaving(true);
    const updatedSettings: SiteSettingsData = {
      ...settings,
      sectionVisibility: visibilityState,
      promoModalEnabled: visibilityState.promoModal,
    };

    try {
      saveSiteSettings(updatedSettings);
      setSettings(updatedSettings);
      await setDoc(doc(db, 'settings', 'general'), updatedSettings, { merge: true });
      setSaveSuccessNotice(
        lang === 'bn' 
          ? '✅ ওয়েবসাইটের সেকশন দৃশ্যমানতা সফলভাবে আপডেট হয়েছে! যা যা বন্ধ করেছেন তা মুছে/লুকিয়ে গেছে।' 
          : '✅ Website section visibility updated live! Hidden sections are now removed from view.'
      );
      if (onUpdated) onUpdated();
    } catch (err) {
      console.warn('Firestore section visibility update error:', err);
      setSaveSuccessNotice(lang === 'bn' ? '✅ লোকাল সেভ সম্পন্ন হয়েছে।' : '✅ Saved locally.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccessNotice(null), 3500);
    }
  };

  const handleResetToDefaults = () => {
    if (!window.confirm(lang === 'bn' ? 'সবগুলো সেকশন ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?' : 'Reset all sections to defaults?')) return;
    setVisibilityState(DEFAULT_SECTION_VISIBILITY);
  };

  const visibleCount = Object.values(visibilityState).filter(Boolean).length;
  const hiddenCount = ALL_SECTIONS.length - visibleCount;

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-teal-500/30 bg-gradient-to-r from-teal-950/40 via-slate-900 to-[#030712] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'সেকশন ও কন্টেন্ট রিমুভার' : 'Section Visibility & Content Manager'}</span>
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {visibleCount} চালু / {hiddenCount} রিমুভড
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
            {lang === 'bn' ? 'ওয়েবসাইটের যেকোনো সেকশন চালু, বন্ধ বা রিমুভ করুন' : 'Show, Hide, or Remove Any Website Section'}
          </h3>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            {lang === 'bn' 
              ? 'আপনার অনুরোধ অনুযায়ী সাইটের যেকোনো অংশ (ব্যানার, কানেক্ট বাটন, এপিকে লিস্ট, রিভিউ, বা পপআপ) ১-ক্লিকে ওয়েবসাইট থেকে সরিয়ে ফেলতে বা ফিরিয়ে আনতে পারবেন।' 
              : 'Toggle visibility of any module. Hiding a section removes it completely from visitor view while preserving its configuration.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleEnableAll}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            {lang === 'bn' ? 'সব চালু করুন' : 'Show All'}
          </button>

          <button
            onClick={handleResetToDefaults}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ডিফল্ট' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {saveSuccessNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Sections Control List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ALL_SECTIONS.map((sec) => {
          const isVisible = visibilityState[sec.key] !== false;
          const Icon = sec.icon;

          return (
            <div
              key={sec.key}
              className={`glass-panel p-4 sm:p-5 rounded-3xl border transition-all duration-300 flex items-start justify-between gap-4 ${
                isVisible 
                  ? 'border-slate-800 bg-[#070b14]/90 hover:border-teal-500/40' 
                  : 'border-red-900/40 bg-red-950/10 opacity-70'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-2xl border shrink-0 mt-0.5 ${
                  isVisible 
                    ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' 
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      {lang === 'bn' ? sec.titleBn : sec.titleEn}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                      isVisible 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}>
                      {isVisible ? (lang === 'bn' ? 'সাইটে সক্রিয়' : 'Visible') : (lang === 'bn' ? 'রিমুভড / হাইড' : 'Hidden')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {lang === 'bn' ? sec.descBn : sec.descEn}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="shrink-0 pt-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => handleToggle(sec.key)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
              </div>

            </div>
          );
        })}
      </div>

      {/* Save Button Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 shadow-2xl z-20">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-teal-400" />
          <span className="text-xs text-slate-300 font-bold">
            {lang === 'bn' 
              ? `মোট ${visibleCount} টি সেকশন চালু আছে এবং ${hiddenCount} টি সেকশন ওয়েবসাইট থেকে লুকানো হয়েছে।` 
              : `${visibleCount} sections currently visible; ${hiddenCount} sections hidden.`}
          </span>
        </div>

        <button
          onClick={handleSaveVisibility}
          disabled={isSaving}
          className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-teal-500/20 cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.02]"
        >
          <Check className="w-4 h-4" />
          <span>{lang === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন (Save Visibility)' : 'Apply & Save Visibility'}</span>
        </button>
      </div>

    </div>
  );
};
