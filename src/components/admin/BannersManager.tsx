import React, { useState } from 'react';
import { 
  SiteBanner, 
  SiteSettingsData, 
  getSiteSettings, 
  saveSiteSettings,
  DEFAULT_BANNERS,
  CONTACT_CONFIG
} from '../../data/contact';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Image as ImageIcon, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

interface BannersManagerProps {
  lang: 'en' | 'bn';
  onUpdated?: () => void;
}

const PRESET_IMAGES = [
  { name: 'Saudi 5G Desert Network', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Cyber Neon Tunnel', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Server Data Center Rack', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Quantum Shield Matrix', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Middle East Skyline Cyber', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80' },
];

export const BannersManager: React.FC<BannersManagerProps> = ({ lang, onUpdated }) => {
  const [settings, setSettings] = useState<SiteSettingsData>(getSiteSettings());
  const banners = Array.isArray(settings.banners) ? settings.banners : DEFAULT_BANNERS;

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // Form fields
  const [formTitleBn, setFormTitleBn] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formSubtitleBn, setFormSubtitleBn] = useState('');
  const [formSubtitleEn, setFormSubtitleEn] = useState('');
  const [formBadgeBn, setFormBadgeBn] = useState('🔥 হট অফার');
  const [formBadgeEn, setFormBadgeEn] = useState('🔥 HOT PROMO');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formActionUrl, setFormActionUrl] = useState(CONTACT_CONFIG.getWhatsAppUrl());
  const [formActionLabelBn, setFormActionLabelBn] = useState('WhatsApp-এ মেসেজ দিন');
  const [formActionLabelEn, setFormActionLabelEn] = useState('Chat on WhatsApp');
  const [formGradient, setFormGradient] = useState<'cyan' | 'emerald' | 'amber' | 'purple' | 'rose'>('emerald');
  const [formPlacement, setFormPlacement] = useState<'hero' | 'promo_modal' | 'bottom'>('hero');
  const [formIsActive, setFormIsActive] = useState(true);

  const [savingNotice, setSavingNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingBannerId(null);
    setFormTitleBn('');
    setFormTitleEn('');
    setFormSubtitleBn('');
    setFormSubtitleEn('');
    setFormBadgeBn('🔥 বিশেষ অফার');
    setFormBadgeEn('🔥 SPECIAL OFFER');
    setFormImageUrl(PRESET_IMAGES[0].url);
    setFormActionUrl(CONTACT_CONFIG.getWhatsAppUrl());
    setFormActionLabelBn('WhatsApp-এ যোগাযোগ করুন');
    setFormActionLabelEn('Contact on WhatsApp');
    setFormGradient('emerald');
    setFormPlacement('hero');
    setFormIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (b: SiteBanner) => {
    setEditingBannerId(b.id);
    setFormTitleBn(b.titleBn);
    setFormTitleEn(b.titleEn);
    setFormSubtitleBn(b.subtitleBn);
    setFormSubtitleEn(b.subtitleEn);
    setFormBadgeBn(b.badgeBn);
    setFormBadgeEn(b.badgeEn);
    setFormImageUrl(b.imageUrl);
    setFormActionUrl(b.actionUrl);
    setFormActionLabelBn(b.actionLabelBn);
    setFormActionLabelEn(b.actionLabelEn);
    setFormGradient(b.themeGradient || 'cyan');
    setFormPlacement(b.placement || 'hero');
    setFormIsActive(b.isActive !== false);
    setModalOpen(true);
  };

  const syncSettingsToFirestore = async (updatedSettings: SiteSettingsData) => {
    setIsSaving(true);
    try {
      saveSiteSettings(updatedSettings);
      setSettings(updatedSettings);
      await setDoc(doc(db, 'settings', 'general'), updatedSettings, { merge: true });
      setSavingNotice(lang === 'bn' ? '✅ ব্যানার সফলভাবে সংরক্ষিত ও লাইভ আপডেট হয়েছে!' : '✅ Banner successfully saved and updated live!');
      if (onUpdated) onUpdated();
    } catch (err) {
      console.warn('Firestore sync failed, local updated:', err);
      setSavingNotice(lang === 'bn' ? '✅ লোকাল সেভ সম্পন্ন হয়েছে।' : '✅ Saved locally.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSavingNotice(null), 3000);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitleBn.trim() && !formTitleEn.trim()) return;

    const bannerObj: SiteBanner = {
      id: editingBannerId || `banner-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      titleBn: formTitleBn.trim() || formTitleEn.trim(),
      titleEn: formTitleEn.trim() || formTitleBn.trim(),
      subtitleBn: formSubtitleBn.trim() || formSubtitleEn.trim(),
      subtitleEn: formSubtitleEn.trim() || formSubtitleBn.trim(),
      badgeBn: formBadgeBn.trim() || '🔥 অফার',
      badgeEn: formBadgeEn.trim() || '🔥 PROMO',
      imageUrl: formImageUrl.trim() || PRESET_IMAGES[0].url,
      actionUrl: formActionUrl.trim() || CONTACT_CONFIG.getWhatsAppUrl(),
      actionLabelBn: formActionLabelBn.trim() || 'মেসেজ দিন',
      actionLabelEn: formActionLabelEn.trim() || 'Contact',
      themeGradient: formGradient,
      placement: formPlacement,
      isActive: formIsActive,
      order: editingBannerId 
        ? (banners.find(b => b.id === editingBannerId)?.order || 1)
        : banners.length + 1,
    };

    let updatedBanners: SiteBanner[];
    if (editingBannerId) {
      updatedBanners = banners.map(b => b.id === editingBannerId ? bannerObj : b);
    } else {
      updatedBanners = [bannerObj, ...banners];
    }

    const updatedSettings = {
      ...settings,
      banners: updatedBanners,
    };

    await syncSettingsToFirestore(updatedSettings);
    setModalOpen(false);
  };

  const handleDeleteBanner = async (bannerId: string, title: string) => {
    const confirmMsg = lang === 'bn' 
      ? `আপনি কি নিশ্চিত যে '${title}' ব্যানারটি সম্পূর্ণ মুছে ফেলতে চান?` 
      : `Are you sure you want to delete banner '${title}'?`;
    if (!window.confirm(confirmMsg)) return;

    const updatedBanners = banners.filter(b => b.id !== bannerId);
    const updatedSettings = {
      ...settings,
      banners: updatedBanners,
    };
    await syncSettingsToFirestore(updatedSettings);
  };

  const handleToggleBanner = async (bannerId: string) => {
    const updatedBanners = banners.map(b => 
      b.id === bannerId ? { ...b, isActive: !b.isActive } : b
    );
    const updatedSettings = {
      ...settings,
      banners: updatedBanners,
    };
    await syncSettingsToFirestore(updatedSettings);
  };

  const handleResetToDefaults = async () => {
    const confirmMsg = lang === 'bn'
      ? 'আপনি কি ব্যানারগুলো ফ্যাক্টরি ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?'
      : 'Reset banners to default factory list?';
    if (!window.confirm(confirmMsg)) return;

    const updatedSettings = {
      ...settings,
      banners: DEFAULT_BANNERS,
    };
    await syncSettingsToFirestore(updatedSettings);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Control Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-[#030712] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ব্যানার কাস্টমাইজেশন' : 'Banners Manager'}</span>
            </span>
            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {banners.length} {lang === 'bn' ? 'টি ব্যানার' : 'Banners'}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
            {lang === 'bn' ? 'ওয়েবসাইটের ব্যানার যোগ, এডিট ও পরিবর্তন করুন' : 'Add, Edit & Manage Website Banners'}
          </h3>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            {lang === 'bn' 
              ? 'এখানে আপনি নতুন যেকোনো অফার ব্যানার ছবি সহ যুক্ত করতে পারেন, বিদ্যমান ব্যানারগুলোর লেখা ও হোয়াটসঅ্যাপ লিংক বদলাতে পারেন বা অপ্রয়োজনীয় ব্যানার ডিলিট ও বন্ধ করতে পারেন।' 
              : 'Deploy promotional banners, update images, change WhatsApp target links, or hide banners in 1-click.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetToDefaults}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reset to default banners"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ডিফল্ট ব্যানার' : 'Reset'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? '➕ নতুন ব্যানার যুক্ত করুন' : '➕ Add New Banner'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {savingNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savingNotice}</span>
        </div>
      )}

      {/* Banners Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((b, index) => (
          <div
            key={b.id}
            className={`glass-panel rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
              b.isActive 
                ? 'border-slate-800 bg-[#070b14]/90 hover:border-cyan-500/50 shadow-lg' 
                : 'border-red-900/30 bg-[#070b14]/50 opacity-60'
            }`}
          >
            {/* Banner Image Preview Header */}
            <div className="relative h-36 w-full bg-slate-950 overflow-hidden">
              {b.imageUrl ? (
                <img 
                  src={b.imageUrl} 
                  alt={b.titleEn}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-black/40 to-transparent" />
              
              {/* Badge & Order */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-black/70 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
                  {lang === 'bn' ? b.badgeBn : b.badgeEn}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/60 text-slate-400">
                  #{index + 1}
                </span>
              </div>

              {/* Status Toggle Button */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => handleToggleBanner(b.id)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all backdrop-blur-md ${
                    b.isActive 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30' 
                      : 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                  }`}
                  title={b.isActive ? 'Hide Banner' : 'Show Banner'}
                >
                  {b.isActive ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-red-400" />}
                  <span>{b.isActive ? (lang === 'bn' ? 'সক্রিয় (Active)' : 'Active') : (lang === 'bn' ? 'বন্ধ (Hidden)' : 'Hidden')}</span>
                </button>
              </div>

              {/* Theme & Placement Tags */}
              <div className="absolute bottom-2 left-3 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-slate-300 bg-black/80 px-2 py-0.5 rounded border border-slate-700">
                  Theme: {b.themeGradient || 'cyan'}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded border shadow-sm ${
                  b.placement === 'bottom' 
                    ? 'bg-emerald-500/80 text-black border-emerald-400 font-extrabold' 
                    : 'bg-cyan-500/80 text-black border-cyan-400 font-extrabold'
                }`}>
                  {b.placement === 'bottom' 
                    ? (lang === 'bn' ? '⬇️ নিচের সেকশন' : '⬇️ Bottom Promo') 
                    : (lang === 'bn' ? '🔝 শীর্ষ হিরো সেকশন' : '🔝 Top Hero')}
                </span>
              </div>
            </div>

            {/* Banner Text Details */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white line-clamp-2">
                  {lang === 'bn' ? b.titleBn : b.titleEn}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {lang === 'bn' ? b.subtitleBn : b.subtitleEn}
                </p>
              </div>

              {/* Action Link Preview */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono truncate">
                  <span className="text-cyan-400 font-bold">{lang === 'bn' ? b.actionLabelBn : b.actionLabelEn}</span>
                  <a 
                    href={b.actionUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'এডিট করুন' : 'Edit'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteBanner(b.id, b.titleBn)}
                    className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 transition-all cursor-pointer"
                    title={lang === 'bn' ? 'ব্যানার মুছে ফেলুন' : 'Delete Banner'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add / Edit Banner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-[#070e1c] border border-cyan-500/40 shadow-2xl p-6 text-slate-200 animate-scale-up space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {editingBannerId 
                      ? (lang === 'bn' ? 'ব্যানার সম্পাদনা / এডিট করুন' : 'Edit Banner Details') 
                      : (lang === 'bn' ? 'নতুন ব্যানার যুক্ত করুন' : 'Add New Promotional Banner')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn' ? 'ব্যানারের ছবি, শিরোনাম ও হোয়াটসঅ্যাপ লিংক নির্ধারণ করুন' : 'Configure banner images, text, and WhatsApp CTA'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              
              {/* Titles Bn & En */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'ব্যানার শিরোনাম (বাংলা)' : 'Banner Title (Bengali)'} *
                  </label>
                  <input
                    type="text"
                    value={formTitleBn}
                    onChange={(e) => setFormTitleBn(e.target.value)}
                    placeholder="যেমন: 🇸🇦 সৌদি আরব ৫জি ফ্রি-নেট অফার"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'ব্যানার শিরোনাম (ইংরেজি)' : 'Banner Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    placeholder="e.g. 🇸🇦 Saudi Arabia 5G FreeNet Config"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Subtitles Bn & En */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'বিবরণ / সাবটাইটেল (বাংলা)' : 'Subtitle (Bengali)'}
                  </label>
                  <textarea
                    rows={2}
                    value={formSubtitleBn}
                    onChange={(e) => setFormSubtitleBn(e.target.value)}
                    placeholder="যেমন: STC, Mobily ও Zain সিমে ০ ব্যালেন্সে আল্ট্রা-স্পিড ব্রাউজিং..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'বিবরণ / সাবটাইটেল (ইংরেজি)' : 'Subtitle (English)'}
                  </label>
                  <textarea
                    rows={2}
                    value={formSubtitleEn}
                    onChange={(e) => setFormSubtitleEn(e.target.value)}
                    placeholder="e.g. Zero-balance high-speed browsing on STC, Mobily & Zain..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </div>

              {/* Badge & Theme Gradient & Placement */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'ব্যাজ ট্যাগ (বাংলা)' : 'Badge Tag (Bn)'}
                  </label>
                  <input
                    type="text"
                    value={formBadgeBn}
                    onChange={(e) => setFormBadgeBn(e.target.value)}
                    placeholder="🔥 হট অফার"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'ব্যাজ ট্যাগ (ইংরেজি)' : 'Badge Tag (En)'}
                  </label>
                  <input
                    type="text"
                    value={formBadgeEn}
                    onChange={(e) => setFormBadgeEn(e.target.value)}
                    placeholder="🔥 HOT PROMO"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'কালার থিম' : 'Color Gradient'}
                  </label>
                  <select
                    value={formGradient}
                    onChange={(e) => setFormGradient(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="emerald">Emerald Neon (Saudi FreeNet)</option>
                    <option value="cyan">Cyber Cyan (Default Blue)</option>
                    <option value="amber">Royal Gold (VIP Luxury)</option>
                    <option value="purple">Electric Purple (Futuristic)</option>
                    <option value="rose">Crimson Red (Speed Rush)</option>
                  </select>
                </div>
              </div>

              {/* Banner Exact Placement Location on Website */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                <label className="block text-cyan-300 font-black text-xs sm:text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>{lang === 'bn' ? '📍 ব্যানারটি ওয়েবসাইটের কোথায় থাকবে? (Placement Location)' : '📍 Where should this banner be displayed?'}</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label 
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      formPlacement === 'hero' 
                        ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md' 
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="bannerPlacement" 
                      value="hero"
                      checked={formPlacement === 'hero'}
                      onChange={() => setFormPlacement('hero')}
                      className="mt-1 text-cyan-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-xs text-white block">
                        🔝 {lang === 'bn' ? 'উপরে হিরো সেকশন (Top Main Banner)' : 'Top Hero Section (Main Banner)'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {lang === 'bn' ? 'ওয়েবসাইট খোলার সাথে সাথে সবার উপরে বড় স্লাইডার হিসেবে দেখাবে।' : 'Displayed right at the top under the navbar as a hero slider.'}
                      </span>
                    </div>
                  </label>

                  <label 
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      formPlacement === 'bottom' 
                        ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-md' 
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="bannerPlacement" 
                      value="bottom"
                      checked={formPlacement === 'bottom'}
                      onChange={() => setFormPlacement('bottom')}
                      className="mt-1 text-emerald-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-xs text-white block">
                        ⬇️ {lang === 'bn' ? 'নিচে বিজ্ঞাপনের সাথে (Bottom Promo Banner)' : 'Bottom Promo Section'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {lang === 'bn' ? 'পেজের একদম নিচের দিকে হোয়াটসঅ্যাপ অর্ডার সেকশনের পূর্বে দেখাবে।' : 'Displayed near the bottom before the WhatsApp footer section.'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Direct Gallery & Image Upload Field */}
              <ImageUploadField
                label={lang === 'bn' ? 'ব্যানারের ছবি (গ্যালারি থেকে আপলোড করুন)' : 'Banner Image (Upload from Gallery)'}
                value={formImageUrl}
                onChange={(url) => setFormImageUrl(url)}
                placeholder="https://... অথবা সরাসরি গ্যালারি থেকে ছবি সিলেক্ট করুন"
                category="banner"
                lang={lang}
                helpText={lang === 'bn' ? 'আপনার ফোন বা কম্পিউটারের গ্যালারি থেকে ছবি আপলোড করুন অথবা অনলাইন লিংক দিন।' : 'Upload directly from your phone gallery or paste image link.'}
                required
              />

              {/* Action Button & Link (WhatsApp or URL) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'বাটন লেবেল (বাংলা)' : 'Button Label (Bengali)'}
                  </label>
                  <input
                    type="text"
                    value={formActionLabelBn}
                    onChange={(e) => setFormActionLabelBn(e.target.value)}
                    placeholder="WhatsApp-এ মেসেজ দিন"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'বাটনে ক্লিক করলে কোথায় যাবে (URL / WhatsApp Link)' : 'Target Action URL'}
                  </label>
                  <input
                    type="text"
                    value={formActionUrl}
                    onChange={(e) => setFormActionUrl(e.target.value)}
                    placeholder="https://api.whatsapp.com/send?phone=..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Active Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-bold text-white text-xs block">
                    {lang === 'bn' ? 'ব্যানারটি ওয়েবসাইটে প্রদর্শন করুন' : 'Show Banner on Live Website'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {lang === 'bn' ? 'বন্ধ করলে এটি সাময়িকভাবে লুকিয়ে থাকবে, মুছে যাবে না।' : 'Disable to temporarily hide without deleting.'}
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingBannerId ? (lang === 'bn' ? 'আপডেট করুন' : 'Update Banner') : (lang === 'bn' ? 'ব্যানার সংরক্ষণ করুন' : 'Save Banner')}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
