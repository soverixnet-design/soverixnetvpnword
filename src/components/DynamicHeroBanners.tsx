import React, { useState, useEffect } from 'react';
import { SiteBanner, CONTACT_CONFIG } from '../data/contact';
import { ChevronLeft, ChevronRight, MessageCircle, ExternalLink, Sparkles, ArrowRight } from 'lucide-react';

interface DynamicHeroBannersProps {
  banners: SiteBanner[];
  lang: 'en' | 'bn';
  onNavigateTab?: (tab: string) => void;
  placement?: 'hero' | 'bottom';
}

export const DynamicHeroBanners: React.FC<DynamicHeroBannersProps> = ({
  banners,
  lang,
  onNavigateTab,
  placement = 'hero'
}) => {
  // If placement is specified, match placement (defaulting untagged to hero)
  const activeBanners = banners.filter((b) => {
    if (!b.isActive) return false;
    const bannerPlacement = b.placement || 'hero';
    return bannerPlacement === placement;
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance slider every 6 seconds if multiple banners exist
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) {
    return null;
  }

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  // Gradient themes mapping
  const gradientStyles: Record<string, { border: string; glow: string; badge: string; btn: string }> = {
    emerald: {
      border: 'border-emerald-500/40 hover:border-emerald-500/70',
      glow: 'from-emerald-950/80 via-slate-900/90 to-[#030712]',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      btn: 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black shadow-emerald-500/30',
    },
    cyan: {
      border: 'border-cyan-500/40 hover:border-cyan-500/70',
      glow: 'from-cyan-950/80 via-slate-900/90 to-[#030712]',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      btn: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black shadow-cyan-500/30',
    },
    amber: {
      border: 'border-amber-500/40 hover:border-amber-500/70',
      glow: 'from-amber-950/80 via-slate-900/90 to-[#030712]',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      btn: 'bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-black shadow-amber-500/30',
    },
    purple: {
      border: 'border-purple-500/40 hover:border-purple-500/70',
      glow: 'from-purple-950/80 via-slate-900/90 to-[#030712]',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      btn: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-purple-500/30',
    },
    rose: {
      border: 'border-rose-500/40 hover:border-rose-500/70',
      glow: 'from-rose-950/80 via-slate-900/90 to-[#030712]',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      btn: 'bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400 text-white shadow-rose-500/30',
    },
  };

  const style = gradientStyles[currentBanner.themeGradient || 'cyan'] || gradientStyles.cyan;
  const isWhatsApp = currentBanner.actionUrl.includes('whatsapp.com') || currentBanner.actionUrl.includes('api.whatsapp.com');

  return (
    <div className="relative group w-full mb-6">
      {/* Outer Banner Card Container */}
      <div 
        className={`relative overflow-hidden rounded-3xl border ${style.border} bg-gradient-to-r ${style.glow} shadow-2xl transition-all duration-500 backdrop-blur-md min-h-[220px] sm:min-h-[200px] flex flex-col justify-center p-5 sm:p-7 md:p-8`}
      >
        {/* Background Image with Overlay Blend */}
        {currentBanner.imageUrl && (
          <div 
            className="absolute inset-0 z-0 opacity-20 group-hover:opacity-25 transition-opacity duration-700 pointer-events-none bg-cover bg-center filter grayscale group-hover:grayscale-0"
            style={{ backgroundImage: `url(${currentBanner.imageUrl})` }}
          />
        )}

        {/* Ambient Radial Accent */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Banner Content Layout */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          <div className="space-y-3 max-w-3xl">
            {/* Badge Tag */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border inline-flex items-center gap-1.5 shadow-sm ${style.badge}`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? currentBanner.badgeBn : currentBanner.badgeEn}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950/70 px-2.5 py-0.5 rounded-full border border-slate-800">
                PROMO #{currentIndex + 1} OF {activeBanners.length}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              {lang === 'bn' ? currentBanner.titleBn : currentBanner.titleEn}
            </h3>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
              {lang === 'bn' ? currentBanner.subtitleBn : currentBanner.subtitleEn}
            </p>
          </div>

          {/* Action Button & Carousel Controls */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 shrink-0">
            <a
              href={currentBanner.actionUrl || CONTACT_CONFIG.getWhatsAppUrl()}
              target={currentBanner.actionUrl.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer ${style.btn}`}
            >
              {isWhatsApp ? (
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-1.99-.46-1.657-.683-2.73-2.366-2.812-2.476-.083-.11-1.01-1.348-1.01-2.572 0-1.223.636-1.824.862-2.073.226-.249.493-.311.658-.311.164 0 .328.002.472.01.153.007.358-.058.56.427.207.499.704 1.722.766 1.847.062.125.103.271.021.434-.083.164-.124.266-.247.41-.124.144-.261.322-.373.432-.124.123-.254.256-.11.503.144.247.641 1.057 1.376 1.713.946.843 1.744 1.104 1.991 1.228.247.124.391.103.535-.062.145-.165.618-.719.783-.967.165-.247.33-.206.556-.123.226.082 1.436.677 1.683.801.247.124.412.185.473.288.062.103.062.597-.082 1.002zM12 2C6.477 2 2 6.477 2 12c0 1.891.528 3.659 1.442 5.174L2 22l4.981-1.306C8.441 21.545 10.16 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
              ) : (
                <ExternalLink className="w-4 h-4 shrink-0" />
              )}
              <span>{lang === 'bn' ? currentBanner.actionLabelBn : currentBanner.actionLabelEn}</span>
              <ArrowRight className="w-4 h-4 shrink-0 ml-0.5" />
            </a>

            {/* Slider Dots and Prev/Next */}
            {activeBanners.length > 1 && (
              <div className="flex items-center gap-2 self-center sm:self-auto">
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Previous Banner"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 px-2">
                  {activeBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentIndex
                          ? 'w-6 bg-white shadow-sm'
                          : 'w-2 bg-slate-700 hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Next Banner"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
