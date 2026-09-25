// Image Upload Helper for Direct Gallery Pick & In-Browser Compression
export interface MediaGalleryItem {
  id: string;
  name: string;
  url: string; // Base64 Data URL or remote URL
  sizeKb?: number;
  uploadedAt: string;
  category: 'banner' | 'logo' | 'app' | 'general';
}

export const GALLERY_STORAGE_KEY = 'soverix_gallery_images';

export const DEFAULT_GALLERY_PRESETS: MediaGalleryItem[] = [
  {
    id: 'preset-saudi-5g',
    name: '🇸🇦 Saudi 5G Desert Network',
    url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    sizeKb: 120,
    uploadedAt: '2026-01-01',
    category: 'banner'
  },
  {
    id: 'preset-cyber-tunnel',
    name: '⚡ Cyber Neon Matrix Tunnel',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    sizeKb: 145,
    uploadedAt: '2026-01-01',
    category: 'banner'
  },
  {
    id: 'preset-server-rack',
    name: '👑 10 Gbps VIP Server Node',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    sizeKb: 160,
    uploadedAt: '2026-01-01',
    category: 'banner'
  },
  {
    id: 'preset-quantum-shield',
    name: '🛡️ Quantum Shield Cyber Defense',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    sizeKb: 135,
    uploadedAt: '2026-01-01',
    category: 'banner'
  },
  {
    id: 'preset-middle-east',
    name: '🏙️ Middle East Cyber Skyline',
    url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    sizeKb: 155,
    uploadedAt: '2026-01-01',
    category: 'banner'
  }
];

/**
 * Reads an image file from the device/phone gallery and compresses it via HTML Canvas.
 * Returns a high-quality Data URL (base64) ready to store and render directly anywhere.
 */
export const readImageFileAsDataUrl = (
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<{ dataUrl: string; sizeKb: number; name: string }> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file from gallery'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image object'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while scaling down if larger than max bounds
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // Draw image with smooth rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp if supported, or jpeg
        let format = 'image/jpeg';
        if (file.type === 'image/png') {
          // If PNG has transparency, preserve png or webp
          format = 'image/png';
        }

        const dataUrl = canvas.toDataURL(format, quality);
        const approxSizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl,
          sizeKb: approxSizeKb,
          name: file.name
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Retrieve all gallery images stored locally and presets
 */
export const getSavedGalleryImages = (): MediaGalleryItem[] => {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Error reading gallery storage:', err);
  }
  return DEFAULT_GALLERY_PRESETS;
};

/**
 * Save an uploaded image to the gallery storage
 */
export const saveGalleryImage = (item: MediaGalleryItem): MediaGalleryItem[] => {
  const current = getSavedGalleryImages();
  // Filter out any duplicate id
  const updated = [item, ...current.filter((i) => i.id !== item.id)];
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('soverix_gallery_updated', { detail: updated }));
    }
  } catch (err) {
    console.warn('Could not save to localStorage (quota may be full):', err);
  }
  return updated;
};

/**
 * Delete an image from the gallery
 */
export const deleteGalleryImage = (id: string): MediaGalleryItem[] => {
  const current = getSavedGalleryImages();
  const updated = current.filter((i) => i.id !== id);
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('soverix_gallery_updated', { detail: updated }));
    }
  } catch (err) {
    console.error('Error saving updated gallery:', err);
  }
  return updated;
};
