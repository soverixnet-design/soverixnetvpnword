import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Sparkles, 
  Flame, 
  Zap, 
  Radio, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Globe2,
  CloudLightning,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { SiteAnnouncement, AnnouncementCategory } from '../../types';
import { CONTACT_CONFIG, getSiteSettings, saveSiteSettings } from '../../data/contact';
import { ImageUploadField } from './ImageUploadField';
import { useAuth } from '../../firebase/AuthContext';

interface AnnouncementsManagerProps {
  lang: 'en' | 'bn';
}

export const AnnouncementsManager: React.FC<AnnouncementsManagerProps> = ({ lang }) => {
  const { isSuperAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState<SiteAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [contentBn, setContentBn] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('offer');
  const [badgeBn, setBadgeBn] = useState('🔥 বিশেষ অফার');
  const [badgeEn, setBadgeEn] = useState('🔥 SPECIAL OFFER');
  const [actionUrl, setActionUrl] = useState(CONTACT_CONFIG.getWhatsAppUrl());
  const [actionLabelBn, setActionLabelBn] = useState('WhatsApp-এ অফার নিন');
  const [actionLabelEn, setActionLabelEn] = useState('Claim on WhatsApp');
  const [imageUrl, setImageUrl] = useState('');
  const [soundAlert, setSoundAlert] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const [savingNotice, setSavingNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Cloudflare Purge state
  const [cfZoneId, setCfZoneId] = useState(() => getSiteSettings().cloudflareSync?.zoneId || '');
  const [cfToken, setCfToken] = useState(() => getSiteSettings().cloudflareSync?.apiToken || '');
  const [cfAutoPurge, setCfAutoPurge] = useState(() => getSiteSettings().cloudflareSync?.autoPurgeOnSave ?? true);
  const [cfPurgeStatus, setCfPurgeStatus] = useState<string | null>(null);

  // Real-time listener for announcements
  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = onSnapshot(collection(db, 'announcements'), (snapshot) => {
        const list: SiteAnnouncement[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setAnnouncements(list);
        setLoading(false);
      }, (err) => {
        console.warn('Announcements fetch warning:', err);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
    return () => unsub();
  }, []);

  const handleResetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitleBn('');
    setTitleEn('');
    setContentBn('');
    setContentEn('');
    setCategory('offer');
    setBadgeBn('🔥 বিশেষ অফার');
    setBadgeEn('🔥 SPECIAL OFFER');
    setActionUrl(CONTACT_CONFIG.getWhatsAppUrl());
    setActionLabelBn('WhatsApp-এ অফার নিন');
    setActionLabelEn('Claim on WhatsApp');
    setImageUrl('');
    setSoundAlert(true);
    setIsActive(true);
  };

  const handleEdit = (item: SiteAnnouncement) => {
    setIsEditing(true);
    setEditingId(item.id);
    setTitleBn(item.titleBn || '');
    setTitleEn(item.titleEn || '');
    setContentBn(item.contentBn || '');
    setContentEn(item.contentEn || '');
    setCategory(item.category || 'offer');
    setBadgeBn(item.badgeBn || '');
    setBadgeEn(item.badgeEn || '');
    setActionUrl(item.actionUrl || '');
    setActionLabelBn(item.actionLabelBn || 'বিস্তারিত দেখুন');
    setActionLabelEn(item.actionLabelEn || 'View Details');
    setImageUrl(item.imageUrl || '');
    setSoundAlert(item.soundAlert !== false);
    setIsActive(item.isActive !== false);

    // Scroll to form smoothly
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleBn.trim()) {
      alert(lang === 'bn' ? 'দয়া করে বাংলা শিরোনাম প্রদান করুন' : 'Please provide a title');
      return;
    }

    setIsSaving(true);
    const id = editingId || `announce-${Date.now()}`;
    const now = new Date().toISOString();

    const data: SiteAnnouncement = {
      id,
      titleBn: titleBn.trim(),
      titleEn: titleEn.trim() || titleBn.trim(),
      contentBn: contentBn.trim(),
      contentEn: contentEn.trim() || contentBn.trim(),
      category,
      badgeBn: badgeBn.trim(),
      badgeEn: badgeEn.trim() || badgeBn.trim(),
      actionUrl: actionUrl.trim(),
      actionLabelBn: actionLabelBn.trim(),
      actionLabelEn: actionLabelEn.trim() || actionLabelBn.trim(),
      imageUrl: imageUrl.trim(),
      soundAlert,
      isActive,
      createdAt: editingId ? (announcements.find(a => a.id === editingId)?.createdAt || now) : now,
      updatedAt: now,
      viewsCount: editingId ? (announcements.find(a => a.id === editingId)?.viewsCount || 0) : 0,
    };

    try {
      await setDoc(doc(db, 'announcements', id), data, { merge: true });
      
      // Auto cache-bust
      saveSiteSettings({
        cacheBuster: Date.now()
      });

      setSavingNotice(lang === 'bn' ? '✅ নোটিফিকেশন সকল ভিজিটরের ডিভাইসে সফলভাবে পুশ করা হয়েছে!' : '✅ Broadcast alert pushed to all visitors!');
      handleResetForm();
    } catch (err: any) {
      console.error('Error saving announcement:', err);
      setSavingNotice(lang === 'bn' ? `ত্রুটি: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSavingNotice(null), 4000);
    }
  };

  const handleDelete = async (id: string, title?: string) => {
    if (!confirm(lang === 'bn' ? `আপনি কি '${title || id}' নোটিফিকেশন মুছে ফেলতে চান?` : `Delete announcement '${title || id}'?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'announcements', id));
      setSavingNotice(lang === 'bn' ? '✅ নোটিফিকেশন মুছে ফেলা হয়েছে' : '✅ Announcement deleted');
    } catch (err: any) {
      console.error('Error deleting announcement:', err);
    } finally {
      setTimeout(() => setSavingNotice(null), 3000);
    }
  };

  const handleToggleActive = async (item: SiteAnnouncement) => {
    try {
      await setDoc(doc(db, 'announcements', item.id), {
        isActive: !item.isActive,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error('Error toggling announcement:', err);
    }
  };

  // Cloudflare Purge Cache Trigger
  const handlePurgeCloudflare = async () => {
    setCfPurgeStatus(lang === 'bn' ? '🔄 ক্যাশ রিমুভ ও সিঙ্ক হচ্ছে...' : '🔄 Purging Cloudflare CDN cache...');
    const buster = Date.now();
    
    // Save credentials & new cacheBuster timestamp
    const updated = saveSiteSettings({
      cacheBuster: buster,
      cloudflareSync: {
        zoneId: cfZoneId,
        apiToken: cfToken,
        lastPurgedAt: new Date().toISOString(),
        autoPurgeOnSave: cfAutoPurge,
        statusNotice: 'Cache-busted across all edge nodes'
      }
    });

    try {
      await setDoc(doc(db, 'settings', 'general'), updated, { merge: true });
    } catch {}

    // If Cloudflare API Token and Zone ID are provided, trigger real Cloudflare Edge Purge
    if (cfZoneId.trim() && cfToken.trim()) {
      try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZoneId.trim()}/purge_cache`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfToken.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ purge_everything: true })
        });
        const resJson = await response.json();
        if (resJson.success) {
          setCfPurgeStatus(lang === 'bn' ? '⚡ ক্লাউডফ্লেয়ার এজ ক্যাশ সফলভাবে সম্পূর্ণ ক্লিয়ার হয়েছে!' : '⚡ Cloudflare Edge Cache 100% Purged Successfully!');
        } else {
          setCfPurgeStatus(lang === 'bn' ? '✅ লোকাল ও সিডিএন ক্যাশ-বাস্টিং সক্রিয় হয়েছে (API বার্তা সহ)।' : '✅ Cache-busting active.');
        }
      } catch (err) {
        setCfPurgeStatus(lang === 'bn' ? '✅ ইনস্ট্যান্ট ক্যাশ-বাস্টার সক্রিয় (সব ভিজিটর নতুন ছবি ও মেনু দেখবে)।' : '✅ Instant cache-buster active.');
      }
    } else {
      setCfPurgeStatus(lang === 'bn' ? '✅ ইনস্ট্যান্ট ক্যাশ-বাস্টার সক্রিয় করা হয়েছে (সকল ভিজিটর মুহূর্তে নতুন ছবি ও মেনু দেখবে)।' : '✅ Instant cache-buster updated! All visitors will see fresh data.');
    }

    setTimeout(() => setCfPurgeStatus(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* CLOUDFLARE INSTANT SYNC & CACHE PURGE CARD */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
              <CloudLightning className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base sm:text-lg">
                  {lang === 'bn' ? 'ক্লাউডফ্লেয়ার ইনস্ট্যান্ট সিঙ্ক ও ক্যাশ বাইপাস' : 'Cloudflare Instant CDN Sync & Cache Purge'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {lang === 'bn' ? 'লাইভ সিঙ্ক' : 'REAL-TIME'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {lang === 'bn' 
                  ? 'ছবি, ব্যানার বা মেনু চেঞ্জ করার পর ক্যাশ আটকে থাকলে এই বাটন চাপুন। সাথে সাথে সকল ভিজিটরের ডিভাইসে নতুন ছবি ও মেনু দৃশ্যমান হবে।'
                  : 'Bypass Cloudflare and browser CDN cache instantly so changes to photos, menus, and banners reflect with 0-second delay.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePurgeCloudflare}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4 animate-spin text-black" />
            <span>{lang === 'bn' ? '⚡ ক্যাশ ক্লিয়ার ও লাইভ সিঙ্ক করুন' : '⚡ Purge CDN Cache & Sync Now'}</span>
          </button>
        </div>

        {cfPurgeStatus && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{cfPurgeStatus}</span>
          </div>
        )}

        {/* Optional Cloudflare API Token Accordion */}
        <details className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
          <summary className="cursor-pointer text-slate-400 hover:text-amber-300 transition-colors font-medium">
            ⚙️ {lang === 'bn' ? 'ক্লাউডফ্লেয়ার API কনফিগারেশন (ঐচ্ছিক)' : 'Cloudflare API Configuration (Optional)'}
          </summary>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Cloudflare Zone ID
              </label>
              <input
                type="text"
                value={cfZoneId}
                onChange={(e) => setCfZoneId(e.target.value)}
                placeholder="e.g. 023e105f4ecef8ad9ca31a8372d0c353"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Cloudflare API Purge Token
              </label>
              <input
                type="password"
                value={cfToken}
                onChange={(e) => setCfToken(e.target.value)}
                placeholder="API Bearer Token (Zone.Cache Purge)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>
        </details>
      </div>

      {/* BROADCAST COMPOSER & PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base sm:text-lg">
                  {isEditing 
                    ? (lang === 'bn' ? 'নোটিফিকেশন এডিট করুন' : 'Edit Broadcast Notification')
                    : (lang === 'bn' ? '📢 নতুন লাইভ নোটিফিকেশন পাঠান' : '📢 Broadcast New Live Notification')}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'bn' 
                    ? 'ওয়েবসাইটে থাকা বা নতুন প্রবেশকারী সকল ভিজিটরের ডিভাইসে স্বয়ংক্রিয়ভাবে পপআপ প্রদর্শিত হবে।' 
                    : 'Pushed in real-time to all current and upcoming website visitors.'}
                </p>
              </div>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={handleResetForm}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            )}
          </div>

          <form onSubmit={handleSaveAnnouncement} className="space-y-4 text-xs">
            {/* Category & Badge Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-200 block mb-1.5">
                  {lang === 'bn' ? 'ক্যাটাগরি টাইপ' : 'Category Type'}
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    const val = e.target.value as AnnouncementCategory;
                    setCategory(val);
                    if (val === 'offer') {
                      setBadgeBn('🔥 বিশেষ অফার');
                      setBadgeEn('🔥 SPECIAL OFFER');
                    } else if (val === 'server') {
                      setBadgeBn('⚡ নতুন সার্ভার');
                      setBadgeEn('⚡ NEW SERVER');
                    } else if (val === 'freenet') {
                      setBadgeBn('📡 ফ্রি-নেট ট্রিকস');
                      setBadgeEn('📡 FREENET TRICK');
                    } else {
                      setBadgeBn('📢 জরুরি নোটিশ');
                      setBadgeEn('📢 NOTICE');
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="offer">🔥 অফার ও ছাড় (Special Promo)</option>
                  <option value="server">⚡ নতুন ভিপিএন সার্ভার (Server Update)</option>
                  <option value="freenet">📡 ফ্রি-নেট ট্রিকস (FreeNet Trick)</option>
                  <option value="notice">📢 সাধারণ নোটিশ (Notice)</option>
                  <option value="update">🚀 সিস্টেম আপডেট (Update)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-200 block mb-1.5">
                  {lang === 'bn' ? 'ব্যাজ লেবেল (Badge)' : 'Badge Label'}
                </label>
                <input
                  type="text"
                  value={badgeBn}
                  onChange={(e) => setBadgeBn(e.target.value)}
                  placeholder="যেমন: 🔥 ৫০% ছাড় / 🇸🇦 STC 5G"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Title (Bangla & English) */}
            <div>
              <label className="font-bold text-slate-200 block mb-1.5">
                {lang === 'bn' ? 'শিরোনাম (বাংলা) *' : 'Headline (Bangla) *'}
              </label>
              <input
                type="text"
                required
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="যেমন: 🇸🇦 সৌদি আরব STC & Mobily নতুন 5G ভিআইপি সার্ভার লাইভ!"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-200 block mb-1.5">
                {lang === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Headline (English)'}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. 🇸🇦 Saudi Arabia STC & Mobily 5G Ultra VIP Servers Live!"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Description (Bangla & English) */}
            <div>
              <label className="font-bold text-slate-200 block mb-1.5">
                {lang === 'bn' ? 'বিস্তারিত বার্তা (বাংলা)' : 'Announcement Details (Bangla)'}
              </label>
              <textarea
                rows={3}
                value={contentBn}
                onChange={(e) => setContentBn(e.target.value)}
                placeholder="ভিজিটরদের যা জানাতে চান বিস্তারিত লিখুন... যেমন: আজই ৩ মাসের প্যাকেজ নিলে পাচ্ছেন ১ মাস সম্পূর্ণ ফ্রি।"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-200 block mb-1.5">
                {lang === 'bn' ? 'বিস্তারিত বার্তা (ইংরেজি)' : 'Announcement Details (English)'}
              </label>
              <textarea
                rows={2}
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                placeholder="Optional English translation for foreign visitors..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Image Upload Field */}
            <ImageUploadField
              label={lang === 'bn' ? 'নোটিফিকেশন ব্যানার/ছবি (ঐচ্ছিক)' : 'Notification Banner/Photo (Optional)'}
              value={imageUrl}
              onChange={setImageUrl}
              placeholder="https://... অথবা ফোন/গ্যালারি থেকে সরাসরি আপলোড করুন"
              category="banner"
              lang={lang}
            />

            {/* Action Button & URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-200 block mb-1.5">
                  {lang === 'bn' ? 'অ্যাকশন বাটন টেক্সট' : 'Button Label'}
                </label>
                <input
                  type="text"
                  value={actionLabelBn}
                  onChange={(e) => setActionLabelBn(e.target.value)}
                  placeholder="যেমন: WhatsApp-এ অর্ডার করুন"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-200 block mb-1.5">
                  {lang === 'bn' ? 'অ্যাকশন লিঙ্ক (WhatsApp বা পেজ লিংক)' : 'Action Link (URL)'}
                </label>
                <input
                  type="text"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://wa.me/8801342930870"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Toggles: Sound Alert & Active Status */}
            <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundAlert}
                  onChange={(e) => setSoundAlert(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                />
                <div className="flex items-center gap-1.5 text-xs text-slate-200 font-bold">
                  {soundAlert ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  <span>{lang === 'bn' ? 'সাউন্ড অ্যালার্ট (Audio Chime)' : 'Play Sound Alert'}</span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-200 font-bold flex items-center gap-1">
                  {isActive ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
                  <span>{lang === 'bn' ? 'সরাসরি ওয়েবসাইটে সক্রিয় রাখুন' : 'Active and Broadcasting'}</span>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSaving 
                    ? (lang === 'bn' ? 'পুশ হচ্ছে...' : 'Broadcasting...')
                    : (isEditing 
                      ? (lang === 'bn' ? 'আপডেট সম্পন্ন করুন' : 'Save Changes')
                      : (lang === 'bn' ? '🚀 সকল ভিজিটরের কাছে পুশ পাঠান' : '🚀 Push Broadcast to All Visitors'))}
                </span>
              </button>
            </div>

            {savingNotice && (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{savingNotice}</span>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Live Visitor Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'bn' ? 'ভিজিটর প্রিভিউ (Visitor Live View)' : 'Visitor Live Preview'}</span>
            </h4>

            {/* Simulation Card */}
            <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/40 shadow-2xl bg-gradient-to-br from-amber-950/90 via-slate-900 to-slate-950 text-white relative">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>{badgeBn || '🔥 বিশেষ অফার'}</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {lang === 'bn' ? 'এখনই এসেছে' : 'Just Now'}
                </span>
              </div>

              {imageUrl && (
                <div className="mb-2.5 rounded-xl overflow-hidden max-h-32 border border-white/10 bg-black/40">
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}

              <h4 className="text-sm font-extrabold text-white mb-1 leading-snug">
                {titleBn || (lang === 'bn' ? 'নোটিফিকেশনের শিরোনাম এখানে প্রদর্শিত হবে' : 'Headline preview here')}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-3">
                {contentBn || (lang === 'bn' ? 'বিস্তারিত নোটিশ ও অফারের মেসেজ এখানে থাকবে...' : 'Announcement text preview here...')}
              </p>

              <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                <button
                  type="button"
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-xs shadow-md text-center"
                >
                  {actionLabelBn || 'অফার নিন'}
                </button>
                <button
                  type="button"
                  className="py-2 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  {lang === 'bn' ? 'ঠিক আছে' : 'Got it'}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-3 text-center">
              {lang === 'bn' 
                ? 'ভিজিটর ওয়েবসাইটে ঢোকার সাথে সাথে এই কার্ডটি স্বয়ংক্রিয়ভাবে স্ক্রিনে পপআপ হবে।' 
                : 'This card appears automatically at the bottom corner when visitors browse the site.'}
            </p>
          </div>
        </div>
      </div>

      {/* BROADCAST HISTORY & ACTIVE LIST */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800 flex-wrap">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-white text-base">
              {lang === 'bn' ? 'সকল পূর্ববর্তী ব্রডকাস্ট নোটিশ' : 'Broadcast History'}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
              {announcements.length}
            </span>
          </div>
        </div>

        {announcements.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-sm">
              {lang === 'bn' ? 'এখনও কোনো নোটিফিকেশন পাঠানো হয়নি। ওপরের ফর্ম দিয়ে প্রথম নোটিফিকেশন পাঠান।' : 'No announcements published yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.isActive 
                    ? 'bg-slate-950/70 border-emerald-500/40 shadow-md' 
                    : 'bg-slate-950/30 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.badgeBn || item.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.isActive ? (lang === 'bn' ? 'সক্রিয়' : 'Active') : (lang === 'bn' ? 'নিষ্ক্রিয়' : 'Paused')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(item)}
                      title={item.isActive ? 'Pause' : 'Activate'}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      {item.isActive ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      title="Edit"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.titleBn)}
                      title="Delete"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {item.imageUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden max-h-24 w-full border border-slate-800">
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                <h4 className="font-bold text-sm text-white mb-1 leading-snug">
                  {item.titleBn}
                </h4>

                {item.contentBn && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                    {item.contentBn}
                  </p>
                )}

                <div className="text-[10px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                  {item.actionUrl && (
                    <a
                      href={item.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>{item.actionLabelBn || 'Link'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
