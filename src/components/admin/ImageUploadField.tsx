import React, { useRef, useState } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Check, 
  ExternalLink, 
  Sparkles,
  Camera,
  FolderOpen
} from 'lucide-react';
import { 
  readImageFileAsDataUrl, 
  saveGalleryImage, 
  getSavedGalleryImages,
  MediaGalleryItem 
} from '../../utils/imageUploadHelper';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  category?: 'banner' | 'logo' | 'app' | 'general';
  lang?: 'en' | 'bn';
  helpText?: string;
  required?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'https://...',
  category = 'banner',
  lang = 'bn',
  helpText,
  required = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const galleryItems = getSavedGalleryImages();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      // Auto compress and convert to base64
      const result = await readImageFileAsDataUrl(file, 1400, 1400, 0.82);
      
      // Save into media gallery for future reuse
      const newItem: MediaGalleryItem = {
        id: 'img-' + Date.now(),
        name: file.name.slice(0, 30),
        url: result.dataUrl,
        sizeKb: result.sizeKb,
        uploadedAt: new Date().toISOString(),
        category: (category || 'general') as 'banner' | 'logo' | 'app' | 'general',
      };
      saveGalleryImage(newItem);

      // Set value
      onChange(result.dataUrl);
    } catch (err: any) {
      console.error('File upload error:', err);
      setUploadError(err.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelectFromGallery = (url: string) => {
    onChange(url);
    setShowGalleryModal(false);
  };

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>{label}</span>
          {required && <span className="text-red-400">*</span>}
        </label>

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>{lang === 'bn' ? 'ছবি মুছুন' : 'Clear'}</span>
          </button>
        )}
      </div>

      {helpText && (
        <p className="text-[11px] text-slate-400 leading-tight">{helpText}</p>
      )}

      {/* Upload & Gallery Actions Buttons Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Hidden direct file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* 1. Direct Gallery Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{lang === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...'}</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 text-cyan-200" />
              <span>{lang === 'bn' ? '📷 গ্যালারি থেকে সরাসরি আপলোড করুন' : '📷 Upload from Device Gallery'}</span>
            </>
          )}
        </button>

        {/* 2. Choose from Saved Media Bank */}
        <button
          type="button"
          onClick={() => setShowGalleryModal(true)}
          className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'bn' ? 'মিডিয়া লাইব্রেরি' : 'Media Library'}</span>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full text-slate-400">
            {galleryItems.length}
          </span>
        </button>
      </div>

      {uploadError && (
        <div className="p-2 rounded-lg bg-red-950/60 border border-red-800/40 text-red-300 text-[11px]">
          {uploadError}
        </div>
      )}

      {/* URL Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 truncate pr-16"
        />
        {value.startsWith('data:image') && (
          <span className="absolute right-2 top-2 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
            Gallery Photo
          </span>
        )}
      </div>

      {/* Image Preview Box */}
      {value && (
        <div className="relative mt-2 p-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3 overflow-hidden">
          <img
            src={value}
            alt="Preview"
            onError={(e) => {
              (e.target as any).src = 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80';
            }}
            className="w-16 h-14 object-cover rounded-xl border border-slate-800 shrink-0 bg-slate-900"
          />
          <div className="min-w-0 flex-1">
            <span className="text-white font-bold text-xs block truncate">
              {value.startsWith('data:image') ? '📷 গ্যালারি থেকে আপলোডকৃত ছবি' : '🔗 অনলাইন ইমেজ লিংক'}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono truncate">
              {value.startsWith('data:image') 
                ? `বেস-৬৪ ফরম্যাট (${Math.round((value.length * 3) / 4 / 1024)} KB)` 
                : value}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-0.5">
              <Check className="w-3 h-3" />
              <span>{lang === 'bn' ? 'সরাসরি প্রদর্শিত হবে' : 'Ready to display'}</span>
            </span>
          </div>
        </div>
      )}

      {/* Gallery Selector Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#070e1c] border border-cyan-500/40 shadow-2xl p-5 text-slate-200 max-h-[85vh] flex flex-col space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {lang === 'bn' ? 'মিডিয়া লাইব্রেরি থেকে ছবি সিলেক্ট করুন' : 'Select Image from Library'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'bn' ? 'আপনার পূর্বে আপলোডকৃত বা রেডিমেড প্রিসেট ছবি বেছে নিন' : 'Choose any pre-uploaded or curated asset'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGalleryModal(false)}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Upload from inside Modal */}
            <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-between gap-3">
              <span className="text-xs text-cyan-200">
                {lang === 'bn' ? 'নতুন কোনো ছবি ফোন বা কম্পিউটার থেকে দিতে চান?' : 'Need to upload a new photo right now?'}
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'নতুন ছবি আপলোড' : 'Upload New'}</span>
              </button>
            </div>

            {/* Grid of Images */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[220px]">
              {galleryItems.map((item) => {
                const isSelected = value === item.url;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectFromGallery(item.url)}
                    className={`relative rounded-2xl border p-2 cursor-pointer transition-all flex flex-col justify-between group ${
                      isSelected 
                        ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-500/50' 
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 mb-2">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-cyan-500 text-slate-950">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-white truncate block">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {item.sizeKb ? `${item.sizeKb} KB` : 'Preset'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGalleryModal(false)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
