import React, { useState } from 'react';
import { 
  CustomAppItem, 
  SiteSettingsData, 
  getSiteSettings, 
  saveSiteSettings,
  DEFAULT_CUSTOM_APPS
} from '../../data/contact';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Smartphone, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  Download
} from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

interface AppsManagerProps {
  lang: 'en' | 'bn';
  onUpdated?: () => void;
}

export const AppsManager: React.FC<AppsManagerProps> = ({ lang, onUpdated }) => {
  const [settings, setSettings] = useState<SiteSettingsData>(getSiteSettings());
  const apps = settings.customApps || DEFAULT_CUSTOM_APPS;

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formNameBn, setFormNameBn] = useState('');
  const [formVersion, setFormVersion] = useState('v1.0 Pro Edition');
  const [formDownloadUrl, setFormDownloadUrl] = useState('');
  const [formIconUrl, setFormIconUrl] = useState('');
  const [formBadge, setFormBadge] = useState('Official VIP');
  const [formBadgeBn, setFormBadgeBn] = useState('অফিসিয়াল ভিআইপি');
  const [formThemeColor, setFormThemeColor] = useState<'cyan' | 'emerald' | 'amber' | 'purple'>('cyan');
  const [formDescBn, setFormDescBn] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formSize, setFormSize] = useState('18.5 MB');
  const [formFeaturesBn, setFormFeaturesBn] = useState('সব দেশে কার্যকর\nহাই-স্পিড নো-ল্যাগ\nজিরো লগ পলিসি');
  const [formFeaturesEn, setFormFeaturesEn] = useState('Global bypass\nUltra low ping\nZero logs');
  const [formIsActive, setFormIsActive] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingAppId(null);
    setFormName('');
    setFormNameBn('');
    setFormVersion('Latest Release');
    setFormDownloadUrl('');
    setFormIconUrl('');
    setFormBadge('Verified APK');
    setFormBadgeBn('ভেরিফাইড অ্যাপ');
    setFormThemeColor('cyan');
    setFormDescBn('বিশ্বের যেকোনো দেশে আল্ট্রা স্পিডে চলবে। আনলিমিটেড ব্যান্ডউইথ।');
    setFormDescEn('Works smoothly worldwide with ultra fast speed and zero logs.');
    setFormSize('18.0 MB');
    setFormFeaturesBn('সুপার ফাস্ট স্পিড\nসহজ সেটআপ\n২৪/৭ সাপোর্ট');
    setFormFeaturesEn('Ultra fast speed\nEasy setup\n24/7 Support');
    setFormIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (app: CustomAppItem) => {
    setEditingAppId(app.id);
    setFormName(app.name);
    setFormNameBn(app.nameBn || app.name);
    setFormVersion(app.version);
    setFormDownloadUrl(app.downloadUrl);
    setFormIconUrl(app.iconUrl || '');
    setFormBadge(app.badge);
    setFormBadgeBn(app.badgeBn || app.badge);
    setFormThemeColor(app.themeColor || 'cyan');
    setFormDescBn(app.descBn);
    setFormDescEn(app.descEn);
    setFormSize(app.size);
    setFormFeaturesBn((app.featuresBn || []).join('\n'));
    setFormFeaturesEn((app.featuresEn || []).join('\n'));
    setFormIsActive(app.isActive !== false);
    setModalOpen(true);
  };

  const handleToggleActive = async (appId: string) => {
    const updated = apps.map((a) => {
      if (a.id === appId) {
        return { ...a, isActive: !a.isActive };
      }
      return a;
    });

    const newSettings = saveSiteSettings({ customApps: updated });
    setSettings(newSettings);
    try {
      await setDoc(doc(db, 'settings', 'general'), { customApps: updated }, { merge: true });
    } catch {}
    setNotice(lang === 'bn' ? 'অ্যাপ স্ট্যাটাস পরিবর্তন করা হয়েছে।' : 'App status updated.');
    setTimeout(() => setNotice(null), 2500);
    onUpdated?.();
  };

  const handleDelete = async (appId: string, name: string) => {
    if (!confirm(lang === 'bn' ? `"${name}" অ্যাপটি কি মুছে ফেলতে চান?` : `Delete app "${name}"?`)) {
      return;
    }

    const updated = apps.filter((a) => a.id !== appId);
    const newSettings = saveSiteSettings({ customApps: updated });
    setSettings(newSettings);
    try {
      await setDoc(doc(db, 'settings', 'general'), { customApps: updated }, { merge: true });
    } catch {}
    setNotice(lang === 'bn' ? 'অ্যাপটি সফলভাবে রিমুভ করা হয়েছে।' : 'App removed successfully.');
    setTimeout(() => setNotice(null), 3000);
    onUpdated?.();
  };

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDownloadUrl.trim()) return;

    setIsSaving(true);
    const featBn = formFeaturesBn.split('\n').map((s) => s.trim()).filter(Boolean);
    const featEn = formFeaturesEn.split('\n').map((s) => s.trim()).filter(Boolean);

    let updatedList: CustomAppItem[];

    if (editingAppId) {
      updatedList = apps.map((a) => {
        if (a.id === editingAppId) {
          return {
            ...a,
            name: formName.trim(),
            nameBn: formNameBn.trim() || formName.trim(),
            version: formVersion.trim(),
            downloadUrl: formDownloadUrl.trim(),
            iconUrl: formIconUrl.trim(),
            badge: formBadge.trim(),
            badgeBn: formBadgeBn.trim() || formBadge.trim(),
            themeColor: formThemeColor,
            descBn: formDescBn.trim(),
            descEn: formDescEn.trim(),
            size: formSize.trim(),
            featuresBn: featBn,
            featuresEn: featEn,
            isActive: formIsActive,
          };
        }
        return a;
      });
    } else {
      const newApp: CustomAppItem = {
        id: 'app-' + Date.now(),
        name: formName.trim(),
        nameBn: formNameBn.trim() || formName.trim(),
        version: formVersion.trim(),
        downloadUrl: formDownloadUrl.trim(),
        iconUrl: formIconUrl.trim(),
        badge: formBadge.trim(),
        badgeBn: formBadgeBn.trim() || formBadge.trim(),
        themeColor: formThemeColor,
        descBn: formDescBn.trim(),
        descEn: formDescEn.trim(),
        size: formSize.trim(),
        featuresBn: featBn,
        featuresEn: featEn,
        order: apps.length + 1,
        isActive: formIsActive,
      };
      updatedList = [...apps, newApp];
    }

    const newSettings = saveSiteSettings({ customApps: updatedList });
    setSettings(newSettings);

    try {
      await setDoc(doc(db, 'settings', 'general'), { customApps: updatedList }, { merge: true });
    } catch {}

    setIsSaving(false);
    setModalOpen(false);
    setNotice(lang === 'bn' ? 'অ্যাপ তালিকা সফলভাবে সেভ করা হয়েছে!' : 'App settings saved!');
    setTimeout(() => setNotice(null), 3500);
    onUpdated?.();
  };

  const handleResetToDefault = async () => {
    if (confirm(lang === 'bn' ? 'সব অ্যাপ কি ডিফল্ট ৪টি অ্যাপে রিসেট করতে চান?' : 'Reset to the 4 default official apps?')) {
      const newSettings = saveSiteSettings({ customApps: DEFAULT_CUSTOM_APPS });
      setSettings(newSettings);
      try {
        await setDoc(doc(db, 'settings', 'general'), { customApps: DEFAULT_CUSTOM_APPS }, { merge: true });
      } catch {}
      setNotice(lang === 'bn' ? 'ডিফল্ট অ্যাপ তালিকায় রিসেট করা হয়েছে।' : 'Reset to default apps.');
      setTimeout(() => setNotice(null), 3000);
      onUpdated?.();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Notice */}
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

      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0a1220] via-slate-950 to-[#0b1b2b] border border-cyan-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold mb-2">
            <Smartphone className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'অফিসিয়াল মোবাইল অ্যাপস হাব কাস্টমাইজার' : 'Official APK Apps Hub Manager'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {lang === 'bn' ? 'এপিকে অ্যাপস ও ৩ডি ডাউনলোড বাটন' : 'Official Apps & 3D Download Hub'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'bn' 
              ? 'ওয়েবসাইটে প্রদর্শিত প্রতিটি অ্যাপের নাম, ভার্সন, ডাউনলোড লিংক, সরাসরি গ্যালারি থেকে আইকন ছবি এবং ফিচার পরিবর্তন বা নতুন অ্যাপ যুক্ত করুন।' 
              : 'Add new APKs, modify names, download URLs, and upload custom app icons directly from phone gallery.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleResetToDefault}
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
            <span>{lang === 'bn' ? 'নতুন অ্যাপ যোগ করুন' : 'Add New App'}</span>
          </button>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {apps.map((app) => (
          <div
            key={app.id}
            className={`rounded-3xl border p-5 flex flex-col justify-between transition-all duration-300 relative ${
              app.isActive !== false
                ? 'bg-slate-950/80 border-slate-800 hover:border-cyan-500/50 shadow-xl'
                : 'bg-slate-950/40 border-slate-900 opacity-60'
            }`}
          >
            <div className="space-y-3">
              {/* Badge & Active Toggle */}
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 truncate">
                  {lang === 'bn' ? app.badgeBn || app.badge : app.badge}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleActive(app.id)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-all ${
                    app.isActive !== false
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  {app.isActive !== false ? 'Active' : 'Hidden'}
                </button>
              </div>

              {/* Identity */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shrink-0 overflow-hidden shadow-lg shadow-cyan-500/20">
                  {app.iconUrl ? (
                    <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Smartphone className="w-6 h-6 stroke-[2.2]" />
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-black text-white truncate">{app.name}</h4>
                  <p className="text-[11px] font-mono text-slate-400 truncate">{app.version}</p>
                  <span className="text-[10px] text-cyan-400 font-mono">{app.size}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {lang === 'bn' ? app.descBn : app.descEn}
              </p>

              {/* Features list */}
              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                {(lang === 'bn' ? app.featuresBn : app.featuresEn).slice(0, 3).map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-300 truncate">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenEdit(app)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'এডিট' : 'Edit'}</span>
              </button>

              <a
                href={app.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
                title={lang === 'bn' ? 'ডাউনলোড লিংক টেস্ট' : 'Test Download Link'}
              >
                <Download className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => handleDelete(app.id, app.name)}
                className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 transition-all cursor-pointer"
                title={lang === 'bn' ? 'রিমুভ করুন' : 'Delete'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit App Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-[#070e1c] border border-cyan-500/40 shadow-2xl p-6 text-slate-200 animate-scale-up space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingAppId 
                      ? (lang === 'bn' ? 'অ্যাপ তথ্য এডিট করুন' : 'Edit App Details') 
                      : (lang === 'bn' ? 'নতুন অ্যান্ড্রয়েড অ্যাপ যুক্ত করুন' : 'Add New Android App')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn' ? 'অ্যাপের নাম, ডাউনলোড লিংক ও সরাসরি গ্যালারি থেকে আইকন দিন' : 'Set APK title, download link and upload custom icon'}
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

            <form onSubmit={handleSaveApp} className="space-y-4 text-xs">
              
              {/* App Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'অ্যাপের নাম (English)' : 'App Name (English)'} *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. AF V2Ray VPN"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'অ্যাপের নাম (বাংলা)' : 'App Name (Bengali)'}
                  </label>
                  <input
                    type="text"
                    value={formNameBn}
                    onChange={(e) => setFormNameBn(e.target.value)}
                    placeholder="যেমন: এএফ ভি২রে ভিপিএন"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Version & Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'ভার্সন টেক্সট' : 'Version Text'}
                  </label>
                  <input
                    type="text"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                    placeholder="v1.0 (All Countries)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'ফাইলের আকার / সাইজ' : 'File Size'}
                  </label>
                  <input
                    type="text"
                    value={formSize}
                    onChange={(e) => setFormSize(e.target.value)}
                    placeholder="18.4 MB"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Direct APK Download URL */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'সরাসরি এপিকে ডাউনলোড লিংক (Direct APK Link)' : 'Direct APK Download URL'} *
                </label>
                <input
                  type="url"
                  value={formDownloadUrl}
                  onChange={(e) => setFormDownloadUrl(e.target.value)}
                  placeholder="https://github.com/.../release.apk অথবা ডাইরেক্ট ডাউনলোড লিংক"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* App Icon Upload from Gallery */}
              <ImageUploadField
                label={lang === 'bn' ? 'অ্যাপ আইকন (গ্যালারি থেকে সরাসরি ছবি আপলোড)' : 'App Icon (Upload from Gallery)'}
                value={formIconUrl}
                onChange={(url) => setFormIconUrl(url)}
                placeholder="গ্যালারি থেকে ছবি সিলেক্ট করুন বা লিংক দিন"
                category="app"
                lang={lang}
                helpText={lang === 'bn' ? 'আপনার ফোন বা কম্পিউটারের গ্যালারি থেকে যেকোনো অ্যাপ আইকন ছবি সিলেক্ট করতে পারেন।' : 'Upload custom app logo or icon directly from device gallery.'}
              />

              {/* Badge & Color Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'ব্যাজ ট্যাগ' : 'Badge Tag'}
                  </label>
                  <input
                    type="text"
                    value={formBadgeBn}
                    onChange={(e) => setFormBadgeBn(e.target.value)}
                    placeholder="🔥 সব দেশে চলবে"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'কালার থিম' : 'Color Theme'}
                  </label>
                  <select
                    value={formThemeColor}
                    onChange={(e) => setFormThemeColor(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="cyan">Cyber Cyan (Default Blue)</option>
                    <option value="emerald">Emerald Green (Saudi FreeNet)</option>
                    <option value="amber">Royal Gold (VIP)</option>
                    <option value="purple">Electric Purple</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'বিবরণ (বাংলা)' : 'Description (Bengali)'}
                  </label>
                  <textarea
                    rows={2}
                    value={formDescBn}
                    onChange={(e) => setFormDescBn(e.target.value)}
                    placeholder="বিশ্বের যেকোনো দেশে আল্ট্রা স্পিডে চলবে..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'বিবরণ (ইংরেজি)' : 'Description (English)'}
                  </label>
                  <textarea
                    rows={2}
                    value={formDescEn}
                    onChange={(e) => setFormDescEn(e.target.value)}
                    placeholder="Works smoothly worldwide..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </div>

              {/* Features (One per line) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'ফিচারসমূহ (বাংলা - প্রতি লাইনে একটি)' : 'Features (Bn - 1 per line)'}
                  </label>
                  <textarea
                    rows={3}
                    value={formFeaturesBn}
                    onChange={(e) => setFormFeaturesBn(e.target.value)}
                    placeholder="সব দেশে কার্যকর&#10;হাই-স্পিড নো-ল্যাগ&#10;জিরো লগ পলিসি"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'ফিচারসমূহ (ইংরেজি - প্রতি লাইনে একটি)' : 'Features (En - 1 per line)'}
                  </label>
                  <textarea
                    rows={3}
                    value={formFeaturesEn}
                    onChange={(e) => setFormFeaturesEn(e.target.value)}
                    placeholder="Global bypass&#10;Ultra low ping&#10;Zero logs"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formAppActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="formAppActive" className="text-slate-300 font-bold cursor-pointer">
                  {lang === 'bn' ? 'হোমপেজে এই অ্যাপটি সক্রিয়ভাবে প্রদর্শন করুন' : 'Display this app actively on homepage'}
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold transition-all cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'অ্যাপ সেভ করুন' : 'Save App'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
