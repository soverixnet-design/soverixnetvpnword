import React, { useState } from 'react';
import { 
  CustomVideoItem, 
  getSiteSettings, 
  saveSiteSettings, 
  DEFAULT_CUSTOM_VIDEOS 
} from '../../data/contact';
import { ImageUploadField } from './ImageUploadField';
import { 
  parseVideoSource, 
  extractYouTubeId, 
  formatViews 
} from '../../utils/videoHelper';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Film, 
  Plus, 
  Trash2, 
  Edit3, 
  Play, 
  Eye, 
  Clock, 
  Sparkles, 
  Check, 
  X, 
  RotateCcw, 
  ExternalLink,
  CheckCircle2,
  Video,
  Upload,
  AlertCircle
} from 'lucide-react';

interface VideoManagerProps {
  lang: 'en' | 'bn';
  onUpdated?: () => void;
}

export const VideoManager: React.FC<VideoManagerProps> = ({ lang, onUpdated }) => {
  const [videos, setVideos] = useState<CustomVideoItem[]>(() => {
    const s = getSiteSettings();
    return Array.isArray(s.customVideos) ? s.customVideos : DEFAULT_CUSTOM_VIDEOS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<CustomVideoItem | null>(null);
  const [previewVideo, setPreviewVideo] = useState<CustomVideoItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<CustomVideoItem>>({
    titleBn: '',
    titleEn: '',
    descBn: '',
    descEn: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: '03:30',
    category: 'sim_setup',
    badgeBn: 'নতুন ভিডিও',
    badgeEn: 'NEW',
    isFeatured: false,
    order: 1,
    isActive: true,
  });

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const persistVideos = async (updatedList: CustomVideoItem[]) => {
    setVideos(updatedList);
    saveSiteSettings({ customVideos: updatedList });

    // Sync to Firestore in real-time
    try {
      await setDoc(doc(db, 'settings', 'general'), { customVideos: updatedList }, { merge: true });
    } catch (err) {
      console.warn('Firestore video sync note:', err);
    }

    if (onUpdated) onUpdated();
  };

  const handleOpenAddModal = () => {
    setEditingVideo(null);
    setFormData({
      id: `video-${Date.now()}`,
      titleBn: '',
      titleEn: '',
      descBn: '',
      descEn: '',
      videoUrl: '',
      thumbnailUrl: '',
      duration: '03:45',
      category: 'sim_setup',
      badgeBn: '🔥 নতুন গাইড',
      badgeEn: 'NEW GUIDE',
      isFeatured: false,
      order: videos.length + 1,
      isActive: true,
      viewsCount: 1500,
      createdAt: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (video: CustomVideoItem) => {
    setEditingVideo(video);
    setFormData({ ...video });
    setIsModalOpen(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleBn || !formData.videoUrl) {
      triggerNotice(lang === 'bn' ? '⚠️ দয়া করে ভিডিও শিরোনাম ও লিংক দিন!' : '⚠️ Please enter video title and URL');
      return;
    }

    setIsSaving(true);
    let updatedList: CustomVideoItem[] = [];

    // If no custom thumbnail was provided but it's a YouTube video, auto-extract thumbnail!
    let finalThumbnail = formData.thumbnailUrl;
    if (!finalThumbnail || !finalThumbnail.trim()) {
      const ytId = extractYouTubeId(formData.videoUrl);
      if (ytId) {
        finalThumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      }
    }

    const payload: CustomVideoItem = {
      id: editingVideo ? editingVideo.id : (formData.id || `video-${Date.now()}`),
      titleBn: formData.titleBn.trim(),
      titleEn: formData.titleEn?.trim() || formData.titleBn.trim(),
      descBn: formData.descBn?.trim() || '',
      descEn: formData.descEn?.trim() || formData.descBn?.trim() || '',
      videoUrl: formData.videoUrl.trim(),
      thumbnailUrl: finalThumbnail || '',
      duration: formData.duration?.trim() || '03:00',
      category: formData.category || 'sim_setup',
      badgeBn: formData.badgeBn?.trim() || '',
      badgeEn: formData.badgeEn?.trim() || '',
      isFeatured: !!formData.isFeatured,
      order: Number(formData.order) || 1,
      isActive: formData.isActive !== false,
      viewsCount: formData.viewsCount || 2000,
      createdAt: formData.createdAt || new Date().toISOString().split('T')[0],
    };

    if (editingVideo) {
      updatedList = videos.map((v) => (v.id === editingVideo.id ? payload : v));
      triggerNotice(lang === 'bn' ? '✅ ভিডিও সফলভাবে আপডেট করা হয়েছে!' : '✅ Video updated successfully!');
    } else {
      updatedList = [...videos, payload];
      triggerNotice(lang === 'bn' ? '🎉 নতুন ভিডিও সফলভাবে পাবলিশ হয়েছে!' : '🎉 New video published successfully!');
    }

    // If marked as featured, make sure others have isFeatured=false
    if (payload.isFeatured) {
      updatedList = updatedList.map((v) => (v.id === payload.id ? v : { ...v, isFeatured: false }));
    }

    await persistVideos(updatedList);
    setIsSaving(false);
    setIsModalOpen(false);
  };

  const handleDeleteVideo = async (id: string) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই ভিডিওটি ডিলিট করতে চান?' : 'Are you sure you want to delete this video?')) {
      const updated = videos.filter((v) => v.id !== id);
      await persistVideos(updated);
      triggerNotice(lang === 'bn' ? '🗑️ ভিডিও ডিলিট করা হয়েছে' : '🗑️ Video deleted');
    }
  };

  const handleToggleActive = async (id: string) => {
    const updated = videos.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v));
    await persistVideos(updated);
    triggerNotice(lang === 'bn' ? 'ভিডিও স্ট্যাটাস পরিবর্তন হয়েছে' : 'Video status updated');
  };

  const handleToggleFeatured = async (id: string) => {
    const target = videos.find((v) => v.id === id);
    const newFeaturedState = !target?.isFeatured;
    const updated = videos.map((v) => {
      if (v.id === id) return { ...v, isFeatured: newFeaturedState };
      if (newFeaturedState) return { ...v, isFeatured: false };
      return v;
    });
    await persistVideos(updated);
    triggerNotice(lang === 'bn' ? 'ফিচার্ড ভিডিও স্ট্যাটাস সেট হয়েছে' : 'Featured status updated');
  };

  const handleResetDefaults = async () => {
    if (confirm(lang === 'bn' ? 'সব ভিডিও কি ডিফল্ট টিউটোরিয়াল তালিকায় রিসেট করতে চান?' : 'Reset all videos to default tutorials?')) {
      await persistVideos(DEFAULT_CUSTOM_VIDEOS);
      triggerNotice(lang === 'bn' ? 'ডিফল্ট ভিডিও তালিকা রিস্টোর হয়েছে' : 'Restored default videos');
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {notice && (
        <div className="p-4 rounded-2xl bg-cyan-950/80 border border-cyan-400 text-cyan-200 text-xs font-bold flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{notice}</span>
          </div>
          <button type="button" onClick={() => setNotice(null)} className="text-cyan-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d1726] via-slate-950 to-[#071d2b] border border-cyan-500/30 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold mb-2">
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'bn' ? 'ভিডিও পাবলিশার ও টিউটোরিয়াল ম্যানেজার' : 'Video Publisher & Manager'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {lang === 'bn' ? 'সহজে ভিডিও পাবলিশ ও ম্যানেজ করুন' : 'Publish & Control Videos Easily'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {lang === 'bn'
                ? 'ইউটিউব (YouTube) বা যেকোনো ভিডিও লিংক দিয়ে সরাসরি নতুন ভিডিও পাবলিশ করুন। সৌদি সিম ফ্রি-নেট টিউটোরিয়াল, অ্যাপ ব্যবহার গাইড কিংবা লাইভ স্পিড টেস্ট প্রুফ ভিডিও যুক্ত করুন।'
                : 'Publish video tutorials, Gulf SIM setup guides, and speed test proof videos using YouTube or direct video URLs.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Add Video Button */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{lang === 'bn' ? 'নতুন ভিডিও পাবলিশ করুন' : 'Publish New Video'}</span>
            </button>

            {/* Reset Defaults */}
            <button
              type="button"
              onClick={handleResetDefaults}
              title={lang === 'bn' ? 'ডিফল্ট ভিডিও ফেরত আনুন' : 'Reset to default videos'}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Instructions Pill */}
        <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 border-t border-slate-900">
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {lang === 'bn' ? '📍 অবস্থান: ওয়েবসাইটের হোমপেজে অফিসিয়াল অ্যাপস ও আরব সিম সেকশনের নিচে "ভিডিও টিউটোরিয়াল" সেকশনে প্রদর্শিত হয়' : '📍 Location: Displayed in the "Video Tutorials" section on homepage under Official APKs'}
          </span>
          <span>•</span>
          <span>{lang === 'bn' ? 'ইউটিউব লিংক দিলে স্বয়ংক্রিয়ভাবে থাম্বনেইল চলে আসবে' : 'Auto-extracts YouTube thumbnails'}</span>
          <span>•</span>
          <span className="font-mono text-emerald-400">{videos.length} {lang === 'bn' ? 'টি ভিডিও প্রকাশিত' : 'videos published'}</span>
        </div>
      </div>

      {/* Videos List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => {
          const parsed = parseVideoSource(video.videoUrl, video.thumbnailUrl);

          return (
            <div
              key={video.id}
              className={`rounded-2xl border transition-all duration-300 p-4 space-y-3.5 flex flex-col justify-between ${
                video.isActive
                  ? 'bg-slate-950/80 border-slate-800 hover:border-cyan-500/50 shadow-lg'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              {/* Thumbnail & Video Preview Trigger */}
              <div 
                onClick={() => setPreviewVideo(video)}
                className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 group cursor-pointer"
              >
                <img
                  src={parsed.thumbnailUrl}
                  alt={video.titleBn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                {/* Overlay with Play Button */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-all">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-115 transition-all">
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-cyan-400" />
                    <span>{video.duration}</span>
                  </div>
                )}

                {/* Featured Star Badge */}
                {video.isFeatured && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3 h-3 fill-current" />
                    <span>{lang === 'bn' ? 'হোমপেজে ফিচার্ড' : 'FEATURED'}</span>
                  </div>
                )}
              </div>

              {/* Title & Category Info */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-semibold">
                    {video.category === 'sim_setup' && (lang === 'bn' ? '🇸🇦 আরব সিম' : 'Gulf SIM')}
                    {video.category === 'app_tutorial' && (lang === 'bn' ? '📱 অ্যাপ গাইড' : 'App Guide')}
                    {video.category === 'speed_proof' && (lang === 'bn' ? '⚡ স্পিড টেস্ট' : 'Speed Test')}
                    {video.category === 'general' && (lang === 'bn' ? '📢 আপডেট' : 'Updates')}
                  </span>
                  <span className="font-mono text-slate-500">#{video.order}</span>
                </div>

                <h4 className="font-bold text-sm text-white line-clamp-2 leading-snug">
                  {lang === 'bn' ? video.titleBn : video.titleEn}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {lang === 'bn' ? video.descBn : video.descEn}
                </p>

                <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1">
                  <span>{formatViews(video.viewsCount || 2000)} ভিউ</span>
                  <span>•</span>
                  <span className="truncate max-w-[180px] font-mono">{video.videoUrl}</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-3 border-t border-slate-900 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {/* Preview Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewVideo(video)}
                    title={lang === 'bn' ? 'ভিডিও চালান' : 'Preview'}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-white transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                  </button>

                  {/* Toggle Active */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(video.id)}
                    title={video.isActive ? (lang === 'bn' ? 'হাইড করুন' : 'Hide') : (lang === 'bn' ? 'সক্রিয় করুন' : 'Show')}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      video.isActive
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Toggle Featured */}
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(video.id)}
                    title={lang === 'bn' ? 'হোমপেজে মূল ভিডিও হিসেবে সেট করুন' : 'Set as Featured video'}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      video.isFeatured
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(video)}
                    className="py-1.5 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'এডিট' : 'Edit'}</span>
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeleteVideo(video.id)}
                    className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-950 border border-red-800/40 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PUBLISH / EDIT VIDEO MODAL */}
      {isModalOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-2xl rounded-3xl bg-slate-950 border border-cyan-500/40 shadow-2xl p-6 sm:p-8 space-y-6 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {editingVideo 
                      ? (lang === 'bn' ? 'ভিডিও এডিট করুন' : 'Edit Video') 
                      : (lang === 'bn' ? 'নতুন ভিডিও পাবলিশ করুন' : 'Publish New Video')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn' ? 'ইউটিউব বা সরাসরি লিংক দিয়ে সহজে ভিডিও যুক্ত করুন' : 'Publish videos via YouTube or direct video URLs'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Form */}
            <form onSubmit={handleSaveVideo} className="space-y-4">
              {/* Video URL (The Core Input) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'ভিডিও লিংক / URL (ইউটিউব বা সরাসরি ভিডিও)' : 'Video URL (YouTube or Direct Video)'}</span>
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/..."
                  value={formData.videoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
                <p className="text-[11px] text-slate-400">
                  💡 {lang === 'bn' ? 'ইউটিউবের যেকোনো সাধারণ ভিডিও, শর্টস কিংবা সরাসরি MP4 লিংক পেস্ট করুন।' : 'Paste any standard YouTube video, Shorts, or direct MP4 URL.'}
                </p>
              </div>

              {/* Title Bangla & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    {lang === 'bn' ? 'ভিডিওর শিরোনাম (বাংলা)' : 'Title (Bengali)'} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 🇸🇦 সৌদি আরব STC সিমে ফ্রি-নেট সেটিং নির্দেশিকা"
                    value={formData.titleBn || ''}
                    onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    {lang === 'bn' ? 'ভিডিওর শিরোনাম (English)' : 'Title (English)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 🇸🇦 Saudi Arabia STC Free-Net Setup Guide"
                    value={formData.titleEn || ''}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Category, Duration, Badge & Order */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    {lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <select
                    value={formData.category || 'sim_setup'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="sim_setup">{lang === 'bn' ? '🇸🇦 আরব সিম ফ্রি-নেট' : 'Gulf SIM Setup'}</option>
                    <option value="app_tutorial">{lang === 'bn' ? '📱 অ্যাপ ব্যবহার' : 'App Tutorial'}</option>
                    <option value="speed_proof">{lang === 'bn' ? '⚡ স্পিড টেস্ট' : 'Speed Proof'}</option>
                    <option value="general">{lang === 'bn' ? '📢 সাধারণ আপডেট' : 'General'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    {lang === 'bn' ? 'দৈর্ঘ্য (Duration)' : 'Duration'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 03:45"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    {lang === 'bn' ? 'ব্যাজ (Badge)' : 'Badge'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 🔥 হট গাইড"
                    value={formData.badgeBn || ''}
                    onChange={(e) => setFormData({ ...formData, badgeBn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    {lang === 'bn' ? 'ক্রম (Order)' : 'Order'}
                  </label>
                  <input
                    type="number"
                    value={formData.order || 1}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">
                  {lang === 'bn' ? 'ভিডিও বিবরণ ও নির্দেশনা (বাংলা)' : 'Description (Bengali)'}
                </label>
                <textarea
                  rows={2}
                  placeholder="ভিডিও সম্পর্কে সংক্ষিপ্ত বিবরণ বা নির্দেশিকা..."
                  value={formData.descBn || ''}
                  onChange={(e) => setFormData({ ...formData, descBn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              {/* Custom Thumbnail Photo via Gallery Uploader */}
              <div className="pt-1 border-t border-slate-800">
                <ImageUploadField
                  label={lang === 'bn' ? 'কাস্টম কভার / থাম্বনেইল ছবি (ঐচ্ছিক)' : 'Custom Thumbnail Photo (Optional)'}
                  value={formData.thumbnailUrl || ''}
                  onChange={(val) => setFormData({ ...formData, thumbnailUrl: val })}
                  lang={lang}
                  helpText={
                    lang === 'bn'
                      ? 'ফাঁকা রাখলে ইউটিউবের থাম্বনেইল স্বয়ংক্রিয়ভাবে ব্যবহৃত হবে। নিজের তৈরি থাম্বনেইল দিতে চাইলে ফোন গ্যালারি থেকে সিলেক্ট করুন।'
                      : 'If left empty, YouTube thumbnail is used automatically. Or pick from phone gallery.'
                  }
                />
              </div>

              {/* Toggles: Featured & Active */}
              <div className="pt-2 flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured || false}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
                  />
                  <span>⭐ {lang === 'bn' ? 'হোমপেজের মূল হাইলাইট (Featured) হিসেবে দেখান' : 'Show as Featured on Homepage'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isActive !== false}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <span>👁️ {lang === 'bn' ? 'সরাসরি ওয়েবসাইটে দৃশ্যমান (Active)' : 'Active on Website'}</span>
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>
                    {isSaving
                      ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                      : (editingVideo ? (lang === 'bn' ? 'আপডেট করুন' : 'Update Video') : (lang === 'bn' ? 'এখনই পাবলিশ করুন' : 'Publish Video'))}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK PREVIEW THEATRE MODAL */}
      {previewVideo && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
          onClick={() => setPreviewVideo(null)}
        >
          <div 
            className="w-full max-w-3xl rounded-3xl bg-slate-950 border border-cyan-500/40 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <h4 className="font-bold text-sm text-white line-clamp-1">
                {lang === 'bn' ? previewVideo.titleBn : previewVideo.titleEn}
              </h4>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              {(() => {
                const parsed = parseVideoSource(previewVideo.videoUrl, previewVideo.thumbnailUrl);
                if (parsed.type === 'youtube') {
                  return (
                    <iframe
                      src={parsed.embedUrl}
                      title={previewVideo.titleBn}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  );
                }
                return (
                  <video src={parsed.embedUrl} controls autoPlay className="w-full h-full">
                    Your browser does not support HTML5 video.
                  </video>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
