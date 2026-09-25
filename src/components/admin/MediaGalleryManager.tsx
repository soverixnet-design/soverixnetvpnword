import React, { useRef, useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Upload, 
  Camera, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Image as ImageIcon,
  CheckCircle2,
  X,
  Layers,
  Info
} from 'lucide-react';
import { 
  getSavedGalleryImages, 
  saveGalleryImage, 
  deleteGalleryImage, 
  readImageFileAsDataUrl, 
  MediaGalleryItem 
} from '../../utils/imageUploadHelper';
import { 
  getSiteSettings, 
  saveSiteSettings, 
  SiteBanner 
} from '../../data/contact';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface MediaGalleryManagerProps {
  lang: 'en' | 'bn';
  onNavigateToTab?: (tab: string) => void;
}

export const MediaGalleryManager: React.FC<MediaGalleryManagerProps> = ({ lang, onNavigateToTab }) => {
  const [items, setItems] = useState<MediaGalleryItem[]>(() => getSavedGalleryImages());
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<MediaGalleryItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setItems(getSavedGalleryImages());
    };
    window.addEventListener('soverix_gallery_updated', handleUpdate);
    return () => window.removeEventListener('soverix_gallery_updated', handleUpdate);
  }, []);

  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    setIsUploading(true);
    let count = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await readImageFileAsDataUrl(file, 1600, 1600, 0.84);
        const newItem: MediaGalleryItem = {
          id: 'gallery-' + Date.now() + '-' + i,
          name: file.name.slice(0, 30),
          url: res.dataUrl,
          sizeKb: res.sizeKb,
          uploadedAt: new Date().toLocaleDateString(),
          category: 'general',
        };
        saveGalleryImage(newItem);
        count++;
      }
      setItems(getSavedGalleryImages());
      setNotice(lang === 'bn' ? `${count}টি ছবি গ্যালারিতে সফলভাবে যুক্ত হয়েছে!` : `${count} images uploaded successfully!`);
      setTimeout(() => setNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleUploadFromDevice = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(lang === 'bn' ? `"${name}" ছবিটি কি মুছে ফেলতে চান?` : `Delete image "${name}"?`)) {
      deleteGalleryImage(id);
      setItems(getSavedGalleryImages());
      setNotice(lang === 'bn' ? 'ছবি গ্যালারি থেকে মুছে ফেলা হয়েছে।' : 'Image removed from gallery.');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSetAsLogo = async (item: MediaGalleryItem) => {
    const current = getSiteSettings();
    const updatedTheme = {
      ...current.designTheme,
      logoUrl: item.url,
    };
    saveSiteSettings({ designTheme: updatedTheme });
    try {
      await setDoc(doc(db, 'settings', 'general'), { designTheme: updatedTheme }, { merge: true });
    } catch {}
    setNotice(lang === 'bn' ? 'ছবিটি ওয়েবসাইটের প্রধান লোগো হিসেবে সেট করা হয়েছে!' : 'Set as main site logo!');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleSetAsNewBanner = async (item: MediaGalleryItem) => {
    const current = getSiteSettings();
    const newBanner: SiteBanner = {
      id: 'banner-' + Date.now(),
      titleBn: 'নতুন স্পেশাল অফার ব্যানার',
      titleEn: 'New Special Promotional Banner',
      subtitleBn: 'সৌদি আরব ও মধ্যপ্রাচ্যে আল্ট্রা স্পিড ৫জি আনলিমিটেড ইন্টারনেট।',
      subtitleEn: 'Ultra-fast 5G unlimited Internet across Saudi Arabia and the Middle East.',
      badgeBn: '🔥 নতুন অফার',
      badgeEn: '🔥 NEW PROMO',
      imageUrl: item.url,
      actionUrl: 'https://api.whatsapp.com/send?phone=' + current.whatsappNumber,
      actionLabelBn: 'WhatsApp-এ মেসেজ দিন',
      actionLabelEn: 'Chat on WhatsApp',
      themeGradient: 'emerald',
      placement: 'hero',
      isActive: true,
      order: (current.banners?.length || 0) + 1,
    };

    const updatedBanners = [newBanner, ...(current.banners || [])];
    saveSiteSettings({ banners: updatedBanners });
    try {
      await setDoc(doc(db, 'settings', 'general'), { banners: updatedBanners }, { merge: true });
    } catch {}

    setNotice(lang === 'bn' ? 'ছবিটি দিয়ে একটি নতুন হোমপেজ ব্যানার তৈরি করা হয়েছে!' : 'Created new active homepage banner with this image!');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Notice */}
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

      {/* Header & Direct Upload Box */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-6 rounded-3xl bg-gradient-to-r from-[#0d1627] via-slate-950 to-[#0c1f2e] border transition-all duration-300 shadow-2xl space-y-4 ${
          isDragging 
            ? 'border-cyan-400 bg-cyan-950/40 ring-4 ring-cyan-500/30 scale-[1.01]' 
            : 'border-cyan-500/30'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold mb-2">
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'bn' ? 'সরাসরি গ্যালারি ও ফটো লাইব্রেরি' : 'Direct Gallery Image Bank'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {lang === 'bn' ? 'ছবি ও গ্যালারি কন্ট্রোল' : 'Media & Gallery Assets Manager'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {lang === 'bn'
                ? 'আপনার মোবাইল ফোনের গ্যালারি, মেমোরি ফাইল বা কম্পিউটার থেকে সরাসরি যেকোনো ছবি আপলোড করুন। যেকোনো আপলোড করা ছবি ১-ক্লিকে ব্যানার, লোগো বা অ্যাপ আইকন হিসেবে ব্যবহার করতে পারবেন।'
                : 'Upload photos directly from your phone gallery, files or PC. Use uploaded photos across banners, site logo, and app icons with 1-click.'}
            </p>
          </div>

          {/* Hidden File Inputs:
              1. Gallery/File input (NO capture attribute = opens photo gallery & files on Android/iPhone)
              2. Camera input (WITH capture attribute = opens camera when explicitly wanted)
          */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/*"
            multiple
            onChange={handleUploadFromDevice}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleUploadFromDevice}
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Primary Button: Direct Gallery / Files */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{lang === 'bn' ? 'ছবি আপলোড হচ্ছে...' : 'Uploading...'}</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                  <span>{lang === 'bn' ? '📁 গ্যালারি / ফাইল থেকে ছবি বাছুন' : '📁 Choose from Gallery / Files'}</span>
                </>
              )}
            </button>

            {/* Secondary Button: Camera */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isUploading}
              className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'bn' ? 'ক্যামেরা' : 'Camera'}</span>
            </button>
          </div>
        </div>

        {/* Drag & Drop Prompt or Click to Upload */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 py-3 px-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-400/60 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-xs text-slate-400 hover:text-slate-200 cursor-pointer transition-all"
        >
          <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {lang === 'bn' 
              ? '👆 এখানে ক্লিক করে অথবা ছবি টেনে এনে (Drag & Drop) মোবাইল গ্যালারি বা কম্পিউটার থেকে সরাসরি আপলোড করতে পারবেন' 
              : 'Click here or drag & drop image files to upload directly from your gallery'}
          </span>
        </div>

        {/* Info Pill */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'ছবি স্বয়ংক্রিয়ভাবে সাইজ অপ্টিমাইজ হয়' : 'In-browser smart compression active'}
          </span>
          <span>•</span>
          <span>{lang === 'bn' ? 'সাপোর্ট: JPG, PNG, WebP, GIF' : 'Supports: JPG, PNG, WebP, GIF'}</span>
          <span>•</span>
          <span className="font-mono text-emerald-400">{items.length} {lang === 'bn' ? 'টি ছবি গ্যালারিতে আছে' : 'images in gallery'}</span>
        </div>
      </div>

      {/* Grid of Uploaded Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const isCopied = copiedId === item.id;
          const isBase64 = item.url.startsWith('data:image');

          return (
            <div
              key={item.id}
              className="rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 p-3.5 space-y-3 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between group"
            >
              {/* Image Preview with Lightbox Trigger */}
              <div 
                onClick={() => setPreviewImage(item)}
                className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 cursor-pointer group-hover:border-cyan-500/40"
              >
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3 py-1 rounded-xl bg-black/80 text-white font-bold text-[11px] border border-white/20">
                    {lang === 'bn' ? 'বড় করে দেখুন 🔍' : 'Zoom Preview 🔍'}
                  </span>
                </div>

                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isBase64 
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                      : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {isBase64 ? '📷 Gallery' : 'Preset'}
                  </span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white truncate" title={item.name}>
                  {item.name}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{item.sizeKb ? `${item.sizeKb} KB` : 'Cloud Asset'}</span>
                  <span>{item.uploadedAt}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                
                {/* 1-Click Set as Banner */}
                <button
                  type="button"
                  onClick={() => handleSetAsNewBanner(item)}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>{lang === 'bn' ? 'ব্যানার হিসেবে যুক্ত করুন' : 'Create Banner with This'}</span>
                </button>

                {/* 1-Click Set as Logo */}
                <button
                  type="button"
                  onClick={() => handleSetAsLogo(item)}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>{lang === 'bn' ? 'সাইট লোগো বানান' : 'Set as Site Logo'}</span>
                </button>

                {/* Copy & Delete */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.url, item.id)}
                    className="flex-1 py-1 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-mono text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">{lang === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{lang === 'bn' ? 'লিংক কপি' : 'Copy'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-1 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 transition-all cursor-pointer"
                    title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* Lightbox Zoom Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-4xl max-h-[90vh] rounded-3xl bg-[#080d19] border border-cyan-500/50 p-4 space-y-4 shadow-2xl flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{previewImage.name}</h3>
                <span className="text-xs text-slate-400 font-mono">{previewImage.sizeKb} KB</span>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto rounded-2xl bg-black/60 flex items-center justify-center p-2">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleSetAsNewBanner(previewImage)}
                className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                {lang === 'bn' ? 'এই ছবি দিয়ে ব্যানার তৈরি করুন' : 'Create Banner with Image'}
              </button>
              <button
                onClick={() => handleSetAsLogo(previewImage)}
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                {lang === 'bn' ? 'সাইট লোগো হিসেবে সেট করুন' : 'Set as Site Logo'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
