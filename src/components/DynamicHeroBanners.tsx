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
    <div className="relative group w-full mb-6 select-none">
      {/* Outer Banner Card Container */}
      <div 
        className={`relative overflow-hidden rounded-3xl border ${style.border} bg-[#030712] shadow-2xl transition-all duration-500 flex flex-col`}
      >
        {/* Banner Visual Stage (Full Clear Photo Display) */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[24/8] md:aspect-[3/1] max-h-[340px] overflow-hidden bg-slate-950 flex items-center justify-center">
          {currentBanner.imageUrl ? (
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.titleBn || currentBanner.titleEn}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-700"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-r ${style.glow}`} />
          )}

          {/* Gentle vignette gradient at the bottom so text bar blends seamlessly */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

          {/* Top Floating Badge & Promo Counter Tag */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 flex-wrap">
            {(currentBanner.badgeBn || currentBanner.badgeEn) && (
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border inline-flex items-center gap-1.5 shadow-lg backdrop-blur-md ${style.badge}`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? currentBanner.badgeBn : currentBanner.badgeEn}</span>
              </span>
            )}
            {activeBanners.length > 1 && (
              <span className="text-[11px] font-mono font-bold text-slate-200 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-lg">
                {currentIndex + 1} / {activeBanners.length}
              </span>
            )}
          </div>

          {/* Slider Prev / Next Controls over the Image */}
          {activeBanners.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95"
                title="Previous Banner"
                aria-label="Previous Banner"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95"
                title="Next Banner"
                aria-label="Next Banner"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Bar: Clean, uncluttered details, title, and direct WhatsApp / URL action button */}
        {(currentBanner.titleBn || currentBanner.subtitleBn || currentBanner.actionUrl) && (
          <div className="relative z-10 px-5 py-4 sm:px-7 sm:py-5 bg-gradient-to-r from-slate-950 via-slate-900 to-[#050b18] border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="space-y-1 max-w-3xl">
              {/* Title */}
              {(currentBanner.titleBn || currentBanner.titleEn) && (
                <h3 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
                  {lang === 'bn' ? currentBanner.titleBn : currentBanner.titleEn}
                </h3>
              )}

              {/* Subtitle */}
              {(currentBanner.subtitleBn || currentBanner.subtitleEn) && (
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  {lang === 'bn' ? currentBanner.subtitleBn : currentBanner.subtitleEn}
                </p>
              )}
            </div>

            {/* Action Button & Slider Indicator Dots */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              {activeBanners.length > 1 && (
                <div className="flex items-center gap-1.5 px-2">
                  {activeBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentIndex
                          ? 'w-6 bg-cyan-400 shadow-md shadow-cyan-400/50'
                          : 'w-2 bg-slate-700 hover:bg-slate-500'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              {currentBanner.actionUrl && (
                <a
                  href={currentBanner.actionUrl || CONTACT_CONFIG.getWhatsAppUrl()}
                  target={currentBanner.actionUrl.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer ${style.btn}`}
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
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
