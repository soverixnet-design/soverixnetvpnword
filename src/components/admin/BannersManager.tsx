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
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Maximize2, 
  FolderOpen, 
  Layers, 
  LayoutTemplate,
  Upload,
  RefreshCw,
  Search,
  Filter
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

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [placementFilter, setPlacementFilter] = useState<'all' | 'hero' | 'bottom'>('all');
  const [activeOnlyFilter, setActiveOnlyFilter] = useState(false);

  // Full Screen Lightbox Preview State
  const [previewBanner, setPreviewBanner] = useState<SiteBanner | null>(null);

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

  const handleOpenAdd = (presetUrl?: string) => {
    setEditingBannerId(null);
    setFormTitleBn('');
    setFormTitleEn('');
    setFormSubtitleBn('');
    setFormSubtitleEn('');
    setFormBadgeBn('🔥 বিশেষ অফার');
    setFormBadgeEn('🔥 SPECIAL OFFER');
    setFormImageUrl(presetUrl || PRESET_IMAGES[0].url);
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
    setFormTitleBn(b.titleBn || '');
    setFormTitleEn(b.titleEn || '');
    setFormSubtitleBn(b.subtitleBn || '');
    setFormSubtitleEn(b.subtitleEn || '');
    setFormBadgeBn(b.badgeBn || '');
    setFormBadgeEn(b.badgeEn || '');
    setFormImageUrl(b.imageUrl || '');
    setFormActionUrl(b.actionUrl || CONTACT_CONFIG.getWhatsAppUrl());
    setFormActionLabelBn(b.actionLabelBn || 'মেসেজ দিন');
    setFormActionLabelEn(b.actionLabelEn || 'Contact');
    setFormGradient(b.themeGradient || 'emerald');
    setFormPlacement(b.placement || 'hero');
    setFormIsActive(b.isActive !== false);
    setModalOpen(true);
  };

  const syncSettingsToFirestore = async (updatedSettings: SiteSettingsData, noticeText?: string) => {
    setIsSaving(true);
    try {
      saveSiteSettings(updatedSettings);
      setSettings(updatedSettings);
      await setDoc(doc(db, 'settings', 'general'), updatedSettings, { merge: true });
      setSavingNotice(noticeText || (lang === 'bn' ? '✅ ব্যানার ফাইল সফলভাবে আপডেট হয়েছে!' : '✅ Banner file successfully updated!'));
      if (onUpdated) onUpdated();
    } catch (err) {
      console.warn('Firestore sync failed, local updated:', err);
      setSavingNotice(lang === 'bn' ? '✅ লোকাল সেভ সম্পন্ন হয়েছে।' : '✅ Saved locally.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSavingNotice(null), 3000);
    }
  };

  // Reorder support: Move Up
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...banners];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    
    const finalBanners = reordered.map((b, idx) => ({ ...b, order: idx + 1 }));
    await syncSettingsToFirestore({ ...settings, banners: finalBanners }, lang === 'bn' ? 'ব্যানার ক্রম উপরে নেওয়া হয়েছে (Move Up)' : 'Banner moved up');
  };

  // Reorder support: Move Down
  const handleMoveDown = async (index: number) => {
    if (index === banners.length - 1) return;
    const reordered = [...banners];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;

    const finalBanners = reordered.map((b, idx) => ({ ...b, order: idx + 1 }));
    await syncSettingsToFirestore({ ...settings, banners: finalBanners }, lang === 'bn' ? 'ব্যানার ক্রম নিচে নেওয়া হয়েছে (Move Down)' : 'Banner moved down');
  };

  // Duplicate / Clone Banner
  const handleDuplicateBanner = async (banner: SiteBanner) => {
    const clone: SiteBanner = {
      ...banner,
      id: `banner-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      titleBn: banner.titleBn ? `${banner.titleBn} (কপি)` : '',
      titleEn: banner.titleEn ? `${banner.titleEn} (Copy)` : '',
      order: banners.length + 1,
    };
    const updated = [clone, ...banners];
    await syncSettingsToFirestore({ ...settings, banners: updated }, lang === 'bn' ? 'ব্যানার ফাইল ডুপ্লিকেট করা হয়েছে' : 'Banner duplicated');
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formImageUrl.trim() && !formTitleBn.trim() && !formTitleEn.trim()) return;

    const bannerObj: SiteBanner = {
      id: editingBannerId || `banner-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      titleBn: formTitleBn.trim() || formTitleEn.trim() || '',
      titleEn: formTitleEn.trim() || formTitleBn.trim() || '',
      subtitleBn: formSubtitleBn.trim() || formSubtitleEn.trim() || '',
      subtitleEn: formSubtitleEn.trim() || formSubtitleBn.trim() || '',
      badgeBn: formBadgeBn.trim() || '',
      badgeEn: formBadgeEn.trim() || '',
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

  const handleDeleteBanner = async (bannerId: string, title?: string) => {
    const displayTitle = title || (lang === 'bn' ? 'এই ব্যানার' : 'this banner');
    const confirmMsg = lang === 'bn' 
      ? `আপনি কি নিশ্চিত যে '${displayTitle}' ব্যানারটি সম্পূর্ণ মুছে ফেলতে চান?` 
      : `Are you sure you want to delete banner '${displayTitle}'?`;
    if (!window.confirm(confirmMsg)) return;

    const updatedBanners = banners.filter(b => b.id !== bannerId);
    const updatedSettings = {
      ...settings,
      banners: updatedBanners,
    };
    await syncSettingsToFirestore(updatedSettings, lang === 'bn' ? 'ব্যানার মুছে ফেলা হয়েছে' : 'Banner deleted successfully');
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
    await syncSettingsToFirestore(updatedSettings, lang === 'bn' ? 'ডিফল্ট ব্যানার রিস্টোর হয়েছে' : 'Restored default banners');
  };

  // Filtered banners
  const filteredBanners = banners.filter(b => {
    if (activeOnlyFilter && !b.isActive) return false;
    if (placementFilter !== 'all') {
      const p = b.placement || 'hero';
      if (p !== placementFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBn = (b.titleBn || '').toLowerCase().includes(q) || (b.subtitleBn || '').toLowerCase().includes(q);
      const matchEn = (b.titleEn || '').toLowerCase().includes(q) || (b.subtitleEn || '').toLowerCase().includes(q);
      const matchBadge = (b.badgeBn || '').toLowerCase().includes(q) || (b.badgeEn || '').toLowerCase().includes(q);
      if (!matchBn && !matchEn && !matchBadge) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner Control Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-[#030712] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-sm">
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'bn' ? 'ব্যানার ফাইল ও ডিসপ্লে ম্যানেজার' : 'Banner File Manager'}</span>
            </span>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800/80 font-bold">
              {banners.length} {lang === 'bn' ? 'টি ব্যানার ফাইল' : 'Banners'}
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/60 hidden md:inline-block">
              {banners.filter(b => b.isActive).length} {lang === 'bn' ? 'সক্রিয়' : 'Active'}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
            <span>{lang === 'bn' ? 'ব্যানার ফাইল ম্যানেজার ও লাইভ স্লাইডার কন্ট্রোল' : 'Banner Media File Manager'}</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            {lang === 'bn' 
              ? 'ওয়েবসাইটের সকল ব্যানার ছবি সাজান, ক্রম পরিবর্তন (Reorder) করুন, পূর্ণাঙ্গ প্রিভিউ দেখুন, ডিলিট বা ডুপ্লিকেট করুন। যেকোনো পরিবর্তন রিয়েল-টাইমে হোমপেজে লাইভ হবে।' 
              : 'Full file manager with live preview, drag/reorder, duplicate, status toggles and delete controls. Synced live to Firestore.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetToDefaults}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reset to default banners"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'ডিফল্ট' : 'Reset'}</span>
          </button>

          <button
            onClick={() => handleOpenAdd()}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{lang === 'bn' ? '➕ নতুন ব্যানার আপলোড' : '➕ Upload New Banner'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {savingNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savingNotice}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'ব্যানার নাম বা অফার দিয়ে খুঁজুন...' : 'Search banners by title or promo keyword...'}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Placement Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3 text-cyan-400" />
            <span>{lang === 'bn' ? 'অবস্থান:' : 'Placement:'}</span>
          </span>

          <button
            onClick={() => setPlacementFilter('all')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              placementFilter === 'all'
                ? 'bg-cyan-500 text-slate-950 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {lang === 'bn' ? 'সব ব্যানার' : 'All'}
          </button>

          <button
            onClick={() => setPlacementFilter('hero')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              placementFilter === 'hero'
                ? 'bg-cyan-500 text-slate-950 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {lang === 'bn' ? '🔝 শীর্ষ হিরো' : '🔝 Top Hero'}
          </button>

          <button
            onClick={() => setPlacementFilter('bottom')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              placementFilter === 'bottom'
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {lang === 'bn' ? '⬇️ নিচের বিজ্ঞাপন' : '⬇️ Bottom Promo'}
          </button>

          <button
            onClick={() => setActiveOnlyFilter(!activeOnlyFilter)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
              activeOnlyFilter
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {activeOnlyFilter ? (lang === 'bn' ? '✓ শুধু সক্রিয়গুলো' : '✓ Active Only') : (lang === 'bn' ? 'সব স্ট্যাটাস' : 'All Status')}
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredBanners.length === 0 && (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-800 bg-[#070b14]/50 space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-300">
            {lang === 'bn' ? 'কোনো ব্যানার ফাইল পাওয়া যায়নি।' : 'No banner files match your query.'}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setPlacementFilter('all'); setActiveOnlyFilter(false); }}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 text-xs font-bold hover:bg-slate-800 cursor-pointer"
          >
            {lang === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Clear Filters'}
          </button>
        </div>
      )}

      {/* Banners Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBanners.map((b) => {
          const originalIndex = banners.findIndex(x => x.id === b.id);
          const isFirst = originalIndex === 0;
          const isLast = originalIndex === banners.length - 1;

          return (
            <div
              key={b.id}
              className={`glass-panel rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between group ${
                b.isActive 
                  ? 'border-slate-800 bg-[#070b14]/90 hover:border-cyan-500/50 shadow-lg' 
                  : 'border-red-900/30 bg-[#070b14]/50 opacity-60'
              }`}
            >
              {/* Banner Image Preview Header */}
              <div className="relative h-44 w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                {b.imageUrl ? (
                  <img 
                    src={b.imageUrl} 
                    alt={b.titleEn || b.titleBn || 'Banner'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-black/30 to-transparent pointer-events-none" />
                
                {/* Badge & Order & Lightbox Preview Trigger */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-black/80 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
                    {lang === 'bn' ? (b.badgeBn || '🔥 অফার') : (b.badgeEn || 'PROMO')}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-white border border-white/10">
                    #{originalIndex + 1}
                  </span>
                </div>

                {/* Top Right: Lightbox & Active Toggle */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  <button
                    onClick={() => setPreviewBanner(b)}
                    className="p-1.5 rounded-xl bg-black/75 hover:bg-black text-slate-200 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-md"
                    title={lang === 'bn' ? 'পূর্ণাঙ্গ বড় প্রিভিউ দেখুন' : 'Full Preview'}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

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
                    <span>{b.isActive ? (lang === 'bn' ? 'সক্রিয়' : 'Active') : (lang === 'bn' ? 'লুকানো' : 'Hidden')}</span>
                  </button>
                </div>

                {/* Theme & Placement Tags */}
                <div className="absolute bottom-2 left-3 flex items-center gap-1.5 flex-wrap z-10">
                  <span className="text-[10px] uppercase font-bold text-slate-300 bg-black/80 px-2 py-0.5 rounded border border-slate-700">
                    {b.themeGradient || 'cyan'}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded border shadow-sm ${
                    b.placement === 'bottom' 
                      ? 'bg-emerald-500/90 text-black border-emerald-400 font-extrabold' 
                      : 'bg-cyan-500/90 text-black border-cyan-400 font-extrabold'
                  }`}>
                    {b.placement === 'bottom' 
                      ? (lang === 'bn' ? '⬇️ নিচের ব্যানার' : '⬇️ Bottom Promo') 
                      : (lang === 'bn' ? '🔝 শীর্ষ হিরো' : '🔝 Top Hero')}
                  </span>
                </div>
              </div>

              {/* Banner Text Details */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">
                    {lang === 'bn' ? (b.titleBn || 'বিশুদ্ধ ছবি ব্যানার (কোনো টাইটেল নেই)') : (b.titleEn || 'Pure Image Banner')}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                    {lang === 'bn' ? (b.subtitleBn || 'ক্লিক করলে নির্ধারিত হোয়াটসঅ্যাপ বা লিংকে যাবে।') : (b.subtitleEn || 'Direct action trigger banner.')}
                  </p>
                </div>

                {/* Reorder & Action Buttons */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono truncate">
                    <span className="text-cyan-400 font-bold truncate max-w-[180px]">{lang === 'bn' ? b.actionLabelBn : b.actionLabelEn}</span>
                    <a 
                      href={b.actionUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-white flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Reorder and Card Controls */}
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    {/* Reorder Buttons */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(originalIndex)}
                        disabled={isFirst}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-25 disabled:hover:bg-transparent cursor-pointer"
                        title={lang === 'bn' ? 'উপরে নিয়ে যান (Move Up)' : 'Move Up'}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(originalIndex)}
                        disabled={isLast}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-25 disabled:hover:bg-transparent cursor-pointer"
                        title={lang === 'bn' ? 'নিচে নিয়ে যান (Move Down)' : 'Move Down'}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Clone */}
                    <button
                      type="button"
                      onClick={() => handleDuplicateBanner(b)}
                      className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs transition-all cursor-pointer"
                      title={lang === 'bn' ? 'ক্লোন / ডুপ্লিকেট করুন' : 'Duplicate'}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(b)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'এডিট' : 'Edit'}</span>
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(b.id, b.titleBn || b.titleEn)}
                      className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 transition-all cursor-pointer"
                      title={lang === 'bn' ? 'ব্যানার মুছে ফেলুন' : 'Delete Banner'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Lightbox / Full Screen Banner Preview Modal */}
      {previewBanner && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-4xl w-full bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {previewBanner.badgeBn || previewBanner.badgeEn || 'PROMO'}
                </span>
                <span className="text-xs font-bold text-white truncate max-w-md">
                  {previewBanner.titleBn || previewBanner.titleEn || 'Banner Preview'}
                </span>
              </div>
              <button
                onClick={() => setPreviewBanner(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="w-full rounded-2xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center max-h-[480px]">
                <img
                  src={previewBanner.imageUrl}
                  alt={previewBanner.titleEn || 'Preview'}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {previewBanner.titleBn || previewBanner.titleEn || 'No Title (Pure Image Banner)'}
                  </h4>
                  <p className="text-slate-400 mt-0.5">
                    {previewBanner.subtitleBn || previewBanner.subtitleEn || 'No subtitle'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const toEdit = previewBanner;
                      setPreviewBanner(null);
                      handleOpenEdit(toEdit);
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 cursor-pointer"
                  >
                    {lang === 'bn' ? 'এডিট করুন' : 'Edit Banner'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Banner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-cyan-500/40 bg-[#070b14] p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base sm:text-lg font-black text-white">
                  {editingBannerId 
                    ? (lang === 'bn' ? 'ব্যানার ফাইল এডিট ও আপডেট' : 'Edit Banner File')
                    : (lang === 'bn' ? 'নতুন ব্যানার আপলোড ও সংযোজন' : 'Upload New Banner File')}
                </h3>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              
              {/* Banner Image Upload & Preset Picker */}
              <div className="space-y-2">
                <ImageUploadField
                  label={lang === 'bn' ? 'ব্যানার ছবি (মোবাইল গ্যালারি বা কম্পিউটার থেকে)' : 'Banner Image (Direct from Gallery / PC)'}
                  value={formImageUrl}
                  onChange={(val) => setFormImageUrl(val)}
                  category="banner"
                  placeholder="https://... অথবা গ্যালারি থেকে ছবি সিলেক্ট করুন"
                  lang={lang}
                  helpText={lang === 'bn' ? 'মোবাইল ফোনের ফটো গ্যালারি থেকে যেকোনো ছবি সরাসরি সিলেক্ট করতে পারেন।' : 'Select any image directly from phone gallery or paste image link.'}
                />

                {/* Quick Presets Strip */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    {lang === 'bn' ? 'অথবা দ্রুত রেডিমেড ব্যাকগ্রাউন্ড সিলেক্ট করুন:' : 'Or pick from curated background presets:'}
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setFormImageUrl(preset.url)}
                        className={`relative h-14 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                          formImageUrl === preset.url ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-800 hover:border-slate-600'
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-bold text-white px-1 py-0.5 truncate">
                          #{idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Titles Bn & En */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'ব্যানার শিরোনাম (বাংলা - ঐচ্ছিক)' : 'Banner Title (Bengali - Optional)'}
                  </label>
                  <input
                    type="text"
                    value={formTitleBn}
                    onChange={(e) => setFormTitleBn(e.target.value)}
                    placeholder={lang === 'bn' ? 'ফাঁকা রাখলে ব্যানারে শুধু ছবি থাকবে' : 'Leave empty for pure image banner'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'ব্যানার শিরোনাম (ইংরেজি - ঐচ্ছিক)' : 'Banner Title (English - Optional)'}
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
                    {lang === 'bn' ? 'বিবরণ / সাবটাইটেল (বাংলা - ঐচ্ছিক)' : 'Subtitle (Bengali - Optional)'}
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
                    {lang === 'bn' ? 'বিবরণ / সাবটাইটেল (ইংরেজি - ঐচ্ছিক)' : 'Subtitle (English - Optional)'}
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
                    {lang === 'bn' ? 'কালার থিম গ্লো' : 'Color Accent'}
                  </label>
                  <select
                    value={formGradient}
                    onChange={(e) => setFormGradient(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="emerald">🟢 Emerald Green (Saudi 5G)</option>
                    <option value="cyan">🔵 Cyber Cyan (High Speed)</option>
                    <option value="amber">🟡 Royal Amber (VIP Gold)</option>
                    <option value="purple">🟣 Electric Purple (Quantum)</option>
                    <option value="rose">🔴 Crimson Rose (Turbo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'ওয়েবসাইটে প্রদর্শনের স্থান' : 'Site Placement'}
                  </label>
                  <select
                    value={formPlacement}
                    onChange={(e) => setFormPlacement(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-bold"
                  >
                    <option value="hero">🔝 শীর্ষ হিরো সেকশন (Top Hero Slider)</option>
                    <option value="bottom">⬇️ নিচের বিজ্ঞাপন ব্যানার (Bottom Promo Banner)</option>
                    <option value="promo_modal">✨ স্পেশাল অফার মোডাল (Popup Modal)</option>
                  </select>
                </div>
              </div>

              {/* Action Button Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'বাটন লেবেল (বাংলা)' : 'Action Button Text (Bn)'}
                  </label>
                  <input
                    type="text"
                    value={formActionLabelBn}
                    onChange={(e) => setFormActionLabelBn(e.target.value)}
                    placeholder="WhatsApp-এ যোগাযোগ করুন"
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
