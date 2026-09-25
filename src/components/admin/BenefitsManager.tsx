import React, { useState } from 'react';
import { 
  CustomBenefitItem, 
  SiteSettingsData, 
  getSiteSettings, 
  saveSiteSettings,
  DEFAULT_CUSTOM_BENEFITS
} from '../../data/contact';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  Activity, 
  Globe, 
  HardDrive, 
  EyeOff, 
  ShieldCheck, 
  Lock, 
  Crown, 
  Sparkles,
  Server
} from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

interface BenefitsManagerProps {
  lang: 'en' | 'bn';
  onUpdated?: () => void;
}

const ICON_OPTIONS = [
  { id: 'zap', label: '⚡ Zap (Speed / FreeNet)' },
  { id: 'activity', label: '📈 Activity (Low Ping Gaming)' },
  { id: 'globe', label: '🌐 Globe (Unblock Calling)' },
  { id: 'harddrive', label: '💾 HardDrive (RAM Zero Logs)' },
  { id: 'eyeoff', label: '👁️ EyeOff (CleanNet AdBlock)' },
  { id: 'shield', label: '🛡️ Shield (Payment & Security)' },
  { id: 'lock', label: '🔒 Lock (Quantum Kyber)' },
  { id: 'crown', label: '👑 Crown (VIP High-End)' },
  { id: 'server', label: '🖥️ Server (Global Backbone)' },
];

export const BenefitsManager: React.FC<BenefitsManagerProps> = ({ lang, onUpdated }) => {
  const [settings, setSettings] = useState<SiteSettingsData>(getSiteSettings());
  const benefits = settings.customBenefits || DEFAULT_CUSTOM_BENEFITS;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formTitleBn, setFormTitleBn] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formDescBn, setFormDescBn] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formIconType, setFormIconType] = useState<any>('zap');
  const [formThemeColor, setFormThemeColor] = useState<'cyan' | 'emerald' | 'amber' | 'purple' | 'rose'>('cyan');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormTitleBn('');
    setFormTitleEn('');
    setFormDescBn('');
    setFormDescEn('');
    setFormIconType('zap');
    setFormThemeColor('cyan');
    setFormImageUrl('');
    setFormIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (b: CustomBenefitItem) => {
    setEditingId(b.id);
    setFormTitleBn(b.titleBn);
    setFormTitleEn(b.titleEn);
    setFormDescBn(b.descBn);
    setFormDescEn(b.descEn);
    setFormIconType(b.iconType || 'zap');
    setFormThemeColor(b.themeColor || 'cyan');
    setFormImageUrl(b.imageUrl || '');
    setFormIsActive(b.isActive !== false);
    setModalOpen(true);
  };

  const handleToggle = async (id: string) => {
    const updated = benefits.map((b) => {
      if (b.id === id) return { ...b, isActive: !b.isActive };
      return b;
    });

    const newSettings = saveSiteSettings({ customBenefits: updated });
    setSettings(newSettings);
    try {
      await setDoc(doc(db, 'settings', 'general'), { customBenefits: updated }, { merge: true });
    } catch {}
    setNotice(lang === 'bn' ? 'ফিচার কার্ড স্ট্যাটাস পরিবর্তন হয়েছে।' : 'Benefit status updated.');
    setTimeout(() => setNotice(null), 2500);
    onUpdated?.();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(lang === 'bn' ? `"${title}" কার্ডটি কি মুছে ফেলতে চান?` : `Delete benefit "${title}"?`)) {
      return;
    }

    const updated = benefits.filter((b) => b.id !== id);
    const newSettings = saveSiteSettings({ customBenefits: updated });
    setSettings(newSettings);
    try {
      await setDoc(doc(db, 'settings', 'general'), { customBenefits: updated }, { merge: true });
    } catch {}
    setNotice(lang === 'bn' ? 'কার্ডটি মুছে ফেলা হয়েছে।' : 'Benefit removed.');
    setTimeout(() => setNotice(null), 3000);
    onUpdated?.();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitleBn.trim() && !formTitleEn.trim()) return;

    setIsSaving(true);
    let updated: CustomBenefitItem[];

    if (editingId) {
      updated = benefits.map((b) => {
        if (b.id === editingId) {
          return {
            ...b,
            titleBn: formTitleBn.trim(),
            titleEn: formTitleEn.trim(),
            descBn: formDescBn.trim(),
            descEn: formDescEn.trim(),
            iconType: formIconType,
            themeColor: formThemeColor,
            imageUrl: formImageUrl.trim(),
            isActive: formIsActive,
          };
        }
        return b;
      });
    } else {
      const newItem: CustomBenefitItem = {
        id: 'benefit-' + Date.now(),
        titleBn: formTitleBn.trim(),
        titleEn: formTitleEn.trim(),
        descBn: formDescBn.trim(),
        descEn: formDescEn.trim(),
        iconType: formIconType,
        themeColor: formThemeColor,
        imageUrl: formImageUrl.trim(),
        order: benefits.length + 1,
        isActive: formIsActive,
      };
      updated = [...benefits, newItem];
    }

    const newSettings = saveSiteSettings({ customBenefits: updated });
    setSettings(newSettings);
    try {
      await setDoc(doc(db, 'settings', 'general'), { customBenefits: updated }, { merge: true });
    } catch {}

    setIsSaving(false);
    setModalOpen(false);
    setNotice(lang === 'bn' ? 'ফিচার কার্ড তালিকা সেভ হয়েছে!' : 'Benefits saved successfully!');
    setTimeout(() => setNotice(null), 3500);
    onUpdated?.();
  };

  const handleReset = async () => {
    if (confirm(lang === 'bn' ? 'সব ফিচার কি ডিফল্ট ৮টি কার্ডে রিসেট করবেন?' : 'Reset to default 8 benefits?')) {
      const newSettings = saveSiteSettings({ customBenefits: DEFAULT_CUSTOM_BENEFITS });
      setSettings(newSettings);
      try {
        await setDoc(doc(db, 'settings', 'general'), { customBenefits: DEFAULT_CUSTOM_BENEFITS }, { merge: true });
      } catch {}
      setNotice(lang === 'bn' ? 'ডিফল্ট ফিচার কার্ডে রিসেট করা হয়েছে।' : 'Reset to default benefits.');
      setTimeout(() => setNotice(null), 3000);
      onUpdated?.();
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'activity': return <Activity className="w-5 h-5" />;
      case 'globe': return <Globe className="w-5 h-5" />;
      case 'harddrive': return <HardDrive className="w-5 h-5" />;
      case 'eyeoff': return <EyeOff className="w-5 h-5" />;
      case 'shield': return <ShieldCheck className="w-5 h-5" />;
      case 'lock': return <Lock className="w-5 h-5" />;
      case 'crown': return <Crown className="w-5 h-5" />;
      case 'server': return <Server className="w-5 h-5" />;
      case 'zap':
      default: return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="p-1 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0b1424] via-slate-950 to-[#0e1c2e] border border-cyan-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'হোমপেজ ফিচার কার্ড ম্যানেজার' : 'Why Choose Us Benefits Manager'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {lang === 'bn' ? 'কেন সোভারিক্সনেট? সুবিধা ও ফিচার কার্ডস' : 'Why Choose Us? 8 Feature Benefit Cards'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'bn' 
              ? 'হোমপেজের ৮টি ফিচার বক্সের লেখা, আইকন, কালার পরিবর্তন করুন অথবা সরাসরি গ্যালারি থেকে নিজস্ব ছবি যুক্ত করুন।' 
              : 'Add, modify, or remove any benefit card, and upload custom images directly from gallery.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleReset}
            className="py-2.5 px-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ডিফল্ট রিসেট' : 'Reset'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{lang === 'bn' ? 'নতুন কার্ড যোগ করুন' : 'Add New Card'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Benefit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {benefits.map((b) => (
          <div
            key={b.id}
            className={`rounded-3xl border p-5 flex flex-col justify-between transition-all duration-300 relative ${
              b.isActive !== false
                ? 'bg-slate-950/80 border-slate-800 hover:border-cyan-500/50 shadow-xl'
                : 'bg-slate-950/40 border-slate-900 opacity-60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 overflow-hidden">
                  {b.imageUrl ? (
                    <img src={b.imageUrl} alt={b.titleBn} className="w-full h-full object-cover" />
                  ) : (
                    renderIcon(b.iconType)
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(b.id)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-all ${
                    b.isActive !== false
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  {b.isActive !== false ? 'Active' : 'Hidden'}
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white">
                  {lang === 'bn' ? b.titleBn : b.titleEn}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-3">
                  {lang === 'bn' ? b.descBn : b.descEn}
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenEdit(b)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'এডিট' : 'Edit'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDelete(b.id, b.titleBn)}
                className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 transition-all cursor-pointer"
                title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl my-auto rounded-3xl bg-[#070e1c] border border-cyan-500/40 shadow-2xl p-6 text-slate-200 animate-scale-up space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-black text-white">
                  {editingId 
                    ? (lang === 'bn' ? 'ফিচার কার্ড এডিট করুন' : 'Edit Benefit Card') 
                    : (lang === 'bn' ? 'নতুন ফিচার কার্ড যোগ করুন' : 'Add New Benefit Card')}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (Bengali)'} *
                  </label>
                  <input
                    type="text"
                    value={formTitleBn}
                    onChange={(e) => setFormTitleBn(e.target.value)}
                    placeholder="যেমন: ১. সৌদি ও আরব সিমে ফ্রি নেট"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    placeholder="e.g. 1. Gulf Free Internet"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'বিবরণ (বাংলা)' : 'Description (Bengali)'}
                  </label>
                  <textarea
                    rows={3}
                    value={formDescBn}
                    onChange={(e) => setFormDescBn(e.target.value)}
                    placeholder="সৌদি STC, Mobily, Zain এবং UAE-তে ০ ব্যালেন্সে..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'বিবরণ (ইংরেজি)' : 'Description (English)'}
                  </label>
                  <textarea
                    rows={3}
                    value={formDescEn}
                    onChange={(e) => setFormDescEn(e.target.value)}
                    placeholder="Zero-balance free internet payloads..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'আইকন নির্বাচন করুন' : 'Icon Type'}
                  </label>
                  <select
                    value={formIconType}
                    onChange={(e) => setFormIconType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'কালার স্কিম' : 'Color Scheme'}
                  </label>
                  <select
                    value={formThemeColor}
                    onChange={(e) => setFormThemeColor(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="cyan">Cyber Cyan</option>
                    <option value="emerald">Emerald Neon</option>
                    <option value="amber">Royal Gold</option>
                    <option value="purple">Electric Purple</option>
                    <option value="rose">Crimson Red</option>
                  </select>
                </div>
              </div>

              {/* Direct Image Upload from Gallery */}
              <ImageUploadField
                label={lang === 'bn' ? 'কার্ড ইমেজ (ঐচ্ছিক - গ্যালারি থেকে সরাসরি ছবি আপলোড)' : 'Card Image (Optional - Direct Upload)'}
                value={formImageUrl}
                onChange={(url) => setFormImageUrl(url)}
                placeholder="আইকনের বদলে কোনো ছবি ব্যবহার করতে চাইলে গ্যালারি থেকে আপলোড করুন"
                category="general"
                lang={lang}
              />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formBenefitActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="formBenefitActive" className="text-slate-300 font-bold cursor-pointer">
                  {lang === 'bn' ? 'এই কার্ডটি হোমপেজে প্রদর্শন করুন' : 'Display this card on homepage'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-900 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
