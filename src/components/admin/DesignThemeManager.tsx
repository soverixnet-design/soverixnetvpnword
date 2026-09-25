import React, { useState } from 'react';
import { 
  SiteSettingsData, 
  DesignThemeConfig, 
  getSiteSettings, 
  saveSiteSettings,
  DEFAULT_DESIGN_THEME
} from '../../data/contact';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Palette, 
  Sparkles, 
  Check, 
  RotateCcw, 
  CheckCircle2, 
  Layers, 
  Type, 
  Eye,
  Sliders,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

interface DesignThemeManagerProps {
  lang: 'en' | 'bn';
  onUpdated?: () => void;
}

const COLOR_PRESETS: { id: 'cyan' | 'emerald' | 'amber' | 'purple' | 'rose'; name: string; nameBn: string; previewClass: string; descBn: string }[] = [
  { 
    id: 'cyan', 
    name: 'Cyber Cyan (Default)', 
    nameBn: 'সাইবার সায়ান ব্লু (ডিফল্ট)', 
    previewClass: 'from-cyan-500 to-blue-600', 
    descBn: 'ক্লাসিক সাইবার সিকিউরিটি ও হ্যাকার-প্রুফ লুক।' 
  },
  { 
    id: 'emerald', 
    name: 'Emerald Neon (Saudi FreeNet)', 
    nameBn: 'মরুভূমির পান্না / সৌদি ৫জি গ্রিন', 
    previewClass: 'from-emerald-500 to-teal-600', 
    descBn: 'সৌদি আরব ও উপসাগরীয় ফ্রি-নেট সিম ইউজারদের জন্য স্পেশাল ভাইব্রেন্ট লুক।' 
  },
  { 
    id: 'amber', 
    name: 'Royal Gold (VIP Luxury)', 
    nameBn: 'রয়েল অ্যাম্বার গোল্ড (ভিআইপি)', 
    previewClass: 'from-amber-500 to-yellow-600', 
    descBn: 'প্রিমিয়াম ভিআইপি গোল্ডেন ফিনিশ ও হাই-এন্ড লুক।' 
  },
  { 
    id: 'purple', 
    name: 'Electric Purple (Futuristic)', 
    nameBn: 'ইলেকট্রিক পার্পল (ফিউচারিস্টিক)', 
    previewClass: 'from-purple-500 to-pink-600', 
    descBn: 'গেমিং ও কোয়ান্টাম এনক্রিপশনের আল্ট্রা-মডার্ন ভাইব।' 
  },
  { 
    id: 'rose', 
    name: 'Crimson Red (Speed Rush)', 
    nameBn: 'ক্রিমসন রেড (টার্বো স্পিড)', 
    previewClass: 'from-rose-500 to-red-600', 
    descBn: 'হাই-ভোল্টেজ ১০ Gbps স্পিড ও ডেডিকেটেড টার্বো ফিল।' 
  },
];

export const DesignThemeManager: React.FC<DesignThemeManagerProps> = ({ lang, onUpdated }) => {
  const [settings, setSettings] = useState<SiteSettingsData>(getSiteSettings());
  const currentTheme = settings.designTheme || DEFAULT_DESIGN_THEME;

  const [accentColor, setAccentColor] = useState<'cyan' | 'emerald' | 'amber' | 'purple' | 'rose'>(currentTheme.accentColor || 'cyan');
  const [siteTitle, setSiteTitle] = useState(currentTheme.siteTitle || 'Soverixnet VPN');
  const [siteTaglineBn, setSiteTaglineBn] = useState(currentTheme.siteTaglineBn || '');
  const [siteTaglineEn, setSiteTaglineEn] = useState(currentTheme.siteTaglineEn || '');
  const [heroHeadlineBn, setHeroHeadlineBn] = useState(currentTheme.heroHeadlineBn || '');
  const [heroHeadlineEn, setHeroHeadlineEn] = useState(currentTheme.heroHeadlineEn || '');
  const [heroSubheadlineBn, setHeroSubheadlineBn] = useState(currentTheme.heroSubheadlineBn || '');
  const [heroSubheadlineEn, setHeroSubheadlineEn] = useState(currentTheme.heroSubheadlineEn || '');
  const [logoUrl, setLogoUrl] = useState(currentTheme.logoUrl || '/soverix_shield_logo.jpg');
  const [showGlow, setShowGlow] = useState(currentTheme.showBackgroundGlow !== false);

  const [tickerBn, setTickerBn] = useState(settings.tickerAnnouncementBn || '');
  const [tickerEn, setTickerEn] = useState(settings.tickerAnnouncementEn || '');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedTheme: DesignThemeConfig = {
      accentColor,
      siteTitle: siteTitle.trim() || 'Soverixnet VPN',
      siteTaglineBn: siteTaglineBn.trim(),
      siteTaglineEn: siteTaglineEn.trim(),
      heroHeadlineBn: heroHeadlineBn.trim(),
      heroHeadlineEn: heroHeadlineEn.trim(),
      heroSubheadlineBn: heroSubheadlineBn.trim(),
      heroSubheadlineEn: heroSubheadlineEn.trim(),
      logoUrl: logoUrl.trim() || '/soverix_shield_logo.jpg',
      showBackgroundGlow: showGlow,
    };

    const updatedSettings: SiteSettingsData = {
      ...settings,
      designTheme: updatedTheme,
      tickerAnnouncementBn: tickerBn.trim(),
      tickerAnnouncementEn: tickerEn.trim(),
    };

    try {
      saveSiteSettings(updatedSettings);
      setSettings(updatedSettings);
      await setDoc(doc(db, 'settings', 'general'), updatedSettings, { merge: true });
      setSaveSuccessNotice(lang === 'bn' ? '✅ সাইটের ডিজাইন ও কালার থিম সফলভাবে পরিবর্তিত হয়েছে!' : '✅ Site design & theme updated live across the network!');
      if (onUpdated) onUpdated();
    } catch (err) {
      console.warn('Firestore theme update error:', err);
      setSaveSuccessNotice(lang === 'bn' ? '✅ লোকাল সেভ সম্পন্ন হয়েছে।' : '✅ Saved locally.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccessNotice(null), 3000);
    }
  };

  const handleResetToDefaults = () => {
    if (!window.confirm(lang === 'bn' ? 'ডিজাইন থিম ফ্যাক্টরি ডিফল্ট এ ফিরিয়ে নিতে চান?' : 'Reset design theme to defaults?')) return;
    setAccentColor(DEFAULT_DESIGN_THEME.accentColor);
    setSiteTitle(DEFAULT_DESIGN_THEME.siteTitle);
    setSiteTaglineBn(DEFAULT_DESIGN_THEME.siteTaglineBn);
    setSiteTaglineEn(DEFAULT_DESIGN_THEME.siteTaglineEn);
    setHeroHeadlineBn(DEFAULT_DESIGN_THEME.heroHeadlineBn);
    setHeroHeadlineEn(DEFAULT_DESIGN_THEME.heroHeadlineEn);
    setHeroSubheadlineBn(DEFAULT_DESIGN_THEME.heroSubheadlineBn);
    setHeroSubheadlineEn(DEFAULT_DESIGN_THEME.heroSubheadlineEn);
    setLogoUrl(DEFAULT_DESIGN_THEME.logoUrl || '/soverix_shield_logo.jpg');
    setShowGlow(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900 to-[#030712] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ডিজাইন ও থিম কন্ট্রোলার' : 'Design & Theme Studio'}</span>
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
            {lang === 'bn' ? 'ওয়েবসাইটের সম্পূর্ণ ডিজাইন ও থিম পরিবর্তন করুন' : 'Full Website Visual & Branding Customization'}
          </h3>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            {lang === 'bn' 
              ? 'এখানে আপনি ওয়েবসাইটের প্রধান কালার অ্যাকসেন্ট, ব্র্যান্ড নাম, ট্যাগলাইন, হিরো টাইটেল ও নোটিশ টেক্সট পরিবর্তন করতে পারেন।' 
              : 'Customize colors, typography, brand names, hero headings, and global design accents.'}
          </p>
        </div>

        <button
          onClick={handleResetToDefaults}
          className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'ডিফল্ট ডিজাইন' : 'Reset'}</span>
        </button>
      </div>

      {saveSuccessNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Main Configuration Form */}
      <form onSubmit={handleSaveTheme} className="space-y-6">
        
        {/* Section 1: Color Accent Palettes */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 bg-[#070b14]/90 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              {lang === 'bn' ? '১. প্রাইমারি কালার স্কিম ও থিম নির্বাচন' : '1. Select Primary Color Scheme & Accent'}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {COLOR_PRESETS.map((preset) => {
              const isSelected = accentColor === preset.id;
              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => setAccentColor(preset.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-32 relative overflow-hidden ${
                    isSelected 
                      ? 'border-white bg-slate-900 shadow-xl ring-2 ring-white/30' 
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${preset.previewClass} shadow-md flex items-center justify-center text-black font-black`}>
                    {isSelected && <Check className="w-4 h-4 text-black" />}
                  </div>

                  <div>
                    <span className="text-xs font-black text-white block">
                      {lang === 'bn' ? preset.nameBn : preset.name}
                    </span>
                    <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {preset.descBn}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ACTIVE
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Branding & Website Title */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 bg-[#070b14]/90 space-y-4">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              {lang === 'bn' ? '২. সাইটের ব্র্যান্ডিং ও টাইটেল' : '2. Site Identity & Branding'}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'ওয়েবসাইটের নাম (Site Title)' : 'Website Title'} *
              </label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                placeholder="Soverixnet VPN"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <ImageUploadField
                label={lang === 'bn' ? 'ওয়েবসাইট লোগো (গ্যালারি থেকে সরাসরি আপলোড)' : 'Website Logo (Upload from Gallery)'}
                value={logoUrl}
                onChange={(url) => setLogoUrl(url)}
                placeholder="/soverix_shield_logo.jpg অথবা গ্যালারি থেকে সিলেক্ট করুন"
                category="logo"
                lang={lang}
                helpText={lang === 'bn' ? 'আপনার ফোন বা পিসির গ্যালারি থেকে নিজস্ব ব্র্যান্ড লোগো আপলোড করতে পারেন।' : 'Upload custom brand logo from phone gallery or PC.'}
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'ট্যাগলাইন (বাংলা)' : 'Tagline (Bengali)'}
              </label>
              <input
                type="text"
                value={siteTaglineBn}
                onChange={(e) => setSiteTaglineBn(e.target.value)}
                placeholder="কোয়ান্টাম-রেজিস্ট্যান্ট ক্রিপ্টোগ্রাফিক শিল্ড..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'ট্যাগলাইন (ইংরেজি)' : 'Tagline (English)'}
              </label>
              <input
                type="text"
                value={siteTaglineEn}
                onChange={(e) => setSiteTaglineEn(e.target.value)}
                placeholder="Quantum-Resistant Encrypted Network..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Hero Headline & Subtitle */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 bg-[#070b14]/90 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              {lang === 'bn' ? '৩. হোমপেজ হিরো হেডলাইন ও সাবটাইটেল' : '3. Homepage Hero Headline & Copy'}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'হিরো প্রধান শিরোনাম (বাংলা)' : 'Hero Main Headline (Bengali)'}
              </label>
              <input
                type="text"
                value={heroHeadlineBn}
                onChange={(e) => setHeroHeadlineBn(e.target.value)}
                placeholder="অজেয় সাইবার নিরাপত্তা ও আনলিমিটেড ফ্রি-নেট সলিউশন"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'হিরো প্রধান শিরোনাম (ইংরেজি)' : 'Hero Main Headline (English)'}
              </label>
              <input
                type="text"
                value={heroHeadlineEn}
                onChange={(e) => setHeroHeadlineEn(e.target.value)}
                placeholder="Invincible Cyber Defense & Unlimited Free-Net Solution"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'হিরো সাবটাইটেল (বাংলা)' : 'Hero Subtitle (Bengali)'}
              </label>
              <textarea
                rows={2}
                value={heroSubheadlineBn}
                onChange={(e) => setHeroSubheadlineBn(e.target.value)}
                placeholder="সৌদি আরব, সংযুক্ত আরব আমিরাত, কাতার..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'হিরো সাবটাইটেল (ইংরেজি)' : 'Hero Subtitle (English)'}
              </label>
              <textarea
                rows={2}
                value={heroSubheadlineEn}
                onChange={(e) => setHeroSubheadlineEn(e.target.value)}
                placeholder="Unrestricted browsing, ultra-low ping gaming..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Live Ticker Announcement */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 bg-[#070b14]/90 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              {lang === 'bn' ? '৪. স্ক্রোলিং নোটিশ ও অ্যানাউন্সমেন্ট বার' : '4. Top Scrolling Announcement Ticker'}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'স্ক্রোলিং নোটিশ (বাংলা)' : 'Announcement Marquee (Bengali)'}
              </label>
              <input
                type="text"
                value={tickerBn}
                onChange={(e) => setTickerBn(e.target.value)}
                placeholder="🇸🇦 সৌদি আরব STC & Mobily 5G আনলিমিটেড ফ্রি-নেট কনফিগ সরাসরি হোয়াটসঅ্যাপে সংগ্রহ করুন!"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'স্ক্রোলিং নোটিশ (ইংরেজি)' : 'Announcement Marquee (English)'}
              </label>
              <input
                type="text"
                value={tickerEn}
                onChange={(e) => setTickerEn(e.target.value)}
                placeholder="🇸🇦 Saudi Arabia STC & Mobily 5G Unlimited FreeNet Config now available on WhatsApp!"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Ambient Glow Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <span className="font-bold text-white text-xs block">
              {lang === 'bn' ? 'ব্যাকগ্রাউন্ড সাইবার অ্যাম্বিয়েন্ট ব্লার ও গ্লো অন রাখুন' : 'Ambient Cyber Background Glow & Grid'}
            </span>
            <span className="text-[11px] text-slate-400">
              {lang === 'bn' ? 'আধুনিক ব্যাকগ্রাউন্ড সাইবার নিওন ব্লার সক্রিয় রাখবে।' : 'Keep modern neon backdrops & glowing visual flares active.'}
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showGlow}
              onChange={(e) => setShowGlow(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
          </label>
        </div>

        {/* Submit Save Button */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-purple-500/20 cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.02]"
          >
            <Check className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ডিজাইন পরিবর্তন সংরক্ষণ করুন (Save Design)' : 'Apply & Save Design Changes'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
