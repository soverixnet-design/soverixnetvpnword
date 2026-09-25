// Utility for parsing, embedding, and formatting video sources for Soverixnet VPN

export interface ParsedVideoInfo {
  type: 'youtube' | 'direct' | 'iframe' | 'unknown';
  embedUrl: string;
  thumbnailUrl: string;
  originalUrl: string;
}

/**
 * Extracts a YouTube Video ID from any standard URL format:
 * - https://www.youtube.com/watch?v=xyz
 * - https://youtu.be/xyz
 * - https://www.youtube.com/shorts/xyz
 * - https://www.youtube.com/embed/xyz
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();

  // Standard or Shorts regex
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = cleanUrl.match(regExp);

  return match && match[1] ? match[1] : null;
}

/**
 * Checks if a URL points directly to an MP4, WebM, OGG or Blob video
 */
export function isDirectVideoUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.mov') ||
    clean.startsWith('data:video/') ||
    clean.startsWith('blob:')
  );
}

/**
 * Parses any video URL and returns embed URL + automatic thumbnail
 */
export function parseVideoSource(url: string, customThumbnail?: string): ParsedVideoInfo {
  if (!url || !url.trim()) {
    return {
      type: 'unknown',
      embedUrl: '',
      thumbnailUrl: customThumbnail || 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
      originalUrl: url,
    };
  }

  const trimmed = url.trim();
  const ytId = extractYouTubeId(trimmed);

  if (ytId) {
    const defaultYtThumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`,
      thumbnailUrl: (customThumbnail && customThumbnail.trim()) ? customThumbnail.trim() : defaultYtThumb,
      originalUrl: trimmed,
    };
  }

  if (isDirectVideoUrl(trimmed)) {
    return {
      type: 'direct',
      embedUrl: trimmed,
      thumbnailUrl: (customThumbnail && customThumbnail.trim()) ? customThumbnail.trim() : 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      originalUrl: trimmed,
    };
  }

  // Fallback for general embeddable iframes or links
  return {
    type: 'iframe',
    embedUrl: trimmed,
    thumbnailUrl: (customThumbnail && customThumbnail.trim()) ? customThumbnail.trim() : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    originalUrl: trimmed,
  };
}

/**
 * Format view counts nicely e.g. 12480 -> "12.4K"
 */
export function formatViews(count: number = 0): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}
