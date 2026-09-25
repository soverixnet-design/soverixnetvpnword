import React, { useState } from 'react';
import { 
  CustomVideoItem, 
  getSiteSettings, 
  CONTACT_CONFIG 
} from '../data/contact';
import { 
  parseVideoSource, 
  formatViews 
} from '../utils/videoHelper';
import { 
  Play, 
  Film, 
  Clock, 
  Eye, 
  Sparkles, 
  X, 
  Smartphone, 
  ShieldCheck, 
  ExternalLink,
  MessageCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

interface VideoTutorialsSectionProps {
  lang: 'en' | 'bn';
  onNavigateTab?: (tab: string) => void;
}

export const VideoTutorialsSection: React.FC<VideoTutorialsSectionProps> = ({ 
  lang, 
  onNavigateTab 
}) => {
  const siteSettings = getSiteSettings();
  const allVideos: CustomVideoItem[] = (siteSettings.customVideos || []).filter((v) => v.isActive !== false);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeVideoModal, setActiveVideoModal] = useState<CustomVideoItem | null>(null);

  // If no videos published yet, don't break
  if (allVideos.length === 0) {
    return null;
  }

  // Filtered list
  const filteredVideos = allVideos
    .filter((v) => (selectedCategory === 'all' ? true : v.category === selectedCategory))
    .sort((a, b) => a.order - b.order);

  // Featured video for top spotlight
  const featuredVideo = allVideos.find((v) => v.isFeatured) || allVideos[0];

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'sim_setup':
        return lang === 'bn' ? '🇸🇦 আরব সিম ফ্রি-নেট' : '🇸🇦 Gulf SIM Setup';
      case 'app_tutorial':
        return lang === 'bn' ? '📱 ভিপিএন অ্যাপ ব্যবহার' : '📱 App Tutorial';
      case 'speed_proof':
        return lang === 'bn' ? '⚡ স্পিড টেস্ট ও প্রুফ' : '⚡ Speed Proof';
      default:
        return lang === 'bn' ? '📢 আপডেট ও তথ্য' : '📢 Updates';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'sim_setup':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'app_tutorial':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'speed_proof':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    }
  };

  return (
    <section id="video-tutorials-section" className="relative space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/30 mb-2">
            <Film className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{lang === 'bn' ? 'ভিডিও টিউটোরিয়াল ও লাইভ গাইড' : 'Video Guides & Tutorials'}</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black text-white tracking-wide">
            {lang === 'bn' 
              ? 'সহজ ভিডিও গাইড: ১-মিনিটেই ফ্রি-নেট ও ভিপিএন কানেক্ট করুন' 
              : 'Step-by-Step Video Guides: Connect in 1 Minute'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {lang === 'bn' 
              ? 'সৌদি আরব STC, Zain, Mobily সিমে ফ্রি-নেট সেটিং এবং AF V2Ray ও Jiyam Plus ভিপিএন অ্যাপ সহজে ব্যবহারের অফিসিয়াল ভিডিও নির্দেশিকা।' 
              : 'Watch practical video walk-throughs for Gulf SIM zero-balance setup, official APK installation, and speed tests.'}
          </p>
        </div>

        {/* Contact WhatsApp Button */}
        <a
          href={CONTACT_CONFIG.getWhatsAppUrl(
            lang === 'bn' 
              ? 'আসসালামু আলাইকুম, আমি ভিডিও টিউটোরিয়াল দেখে ভিপিএন সেটাপ করতে চাই। কিছু হেল্প দরকার।' 
              : 'Hello, I watched the video tutorials and need some help setting up the VPN.'
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-400 text-xs font-bold transition-all shadow-lg shadow-emerald-500/10 shrink-0 self-start md:self-auto cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'bn' ? 'ভিডিও সহায়তার জন্য WhatsApp' : 'Get Video Help on WhatsApp'}</span>
        </a>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', labelBn: '🎬 সব ভিডিও', labelEn: '🎬 All Videos' },
          { id: 'sim_setup', labelBn: '🇸🇦 আরব সিম ফ্রি-নেট সেটিং', labelEn: '🇸🇦 Gulf SIM Free-Net' },
          { id: 'app_tutorial', labelBn: '📱 ভিপিএন অ্যাপ টিউটোরিয়াল', labelEn: '📱 App Tutorials' },
          { id: 'speed_proof', labelBn: '⚡ স্পিড টেস্ট ও প্রুফ', labelEn: '⚡ Speed Proofs' },
        ].map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {lang === 'bn' ? tab.labelBn : tab.labelEn}
            </button>
          );
        })}
      </div>

      {/* Spotlight Cinema Banner (Featured Video Player Showcase) */}
      {featuredVideo && selectedCategory === 'all' && (
        <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0c182a] via-slate-950 to-[#071d2b] border border-cyan-500/30 shadow-2xl relative overflow-hidden group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Thumbnail & Play Trigger */}
            <div className="lg:col-span-7 relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 aspect-video bg-black flex items-center justify-center">
              {(() => {
                const parsed = parseVideoSource(featuredVideo.videoUrl, featuredVideo.thumbnailUrl);
                return (
                  <>
                    <img
                      src={parsed.thumbnailUrl}
                      alt={featuredVideo.titleBn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80';
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                    {/* Badge top-left */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-red-600/90 text-white font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3 h-3" />
                        {featuredVideo.badgeBn || (lang === 'bn' ? 'হট ভিডিও' : 'FEATURED')}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg border font-bold text-[10px] backdrop-blur-md ${getCategoryBadgeColor(featuredVideo.category)}`}>
                        {getCategoryLabel(featuredVideo.category)}
                      </span>
                    </div>

                    {/* Duration badge bottom-right */}
                    {featuredVideo.duration && (
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/80 text-white text-[11px] font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>{featuredVideo.duration}</span>
                      </div>
                    )}

                    {/* Giant Glowing Play Button */}
                    <button
                      type="button"
                      onClick={() => setActiveVideoModal(featuredVideo)}
                      aria-label="Play video"
                      className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-cyan-500/50 hover:scale-110 active:scale-95 transition-all cursor-pointer group-hover:ring-8 ring-cyan-500/30"
                    >
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current translate-x-0.5" />
                    </button>
                  </>
                );
              })()}
            </div>

            {/* Right: Featured Video Details */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  {lang === 'bn' ? 'বিশেষ রিকমেন্ডেড টিউটোরিয়াল' : 'Top Recommended Guide'}
                </span>
              </div>

              <h3 className="text-lg sm:text-2xl font-black text-white leading-tight">
                {lang === 'bn' ? featuredVideo.titleBn : featuredVideo.titleEn}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {lang === 'bn' ? featuredVideo.descBn : featuredVideo.descEn}
              </p>

              {/* Highlights List */}
              <div className="space-y-1.5 pt-1 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{lang === 'bn' ? 'সহজ ১-মিনিটের ধাপে ধাপে নির্দেশনা' : 'Easy 1-minute step-by-step instructions'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{lang === 'bn' ? '১০ Gbps সুপার স্পিড ও লো-পিং গ্যারান্টি' : '10 Gbps ultra-speed & low-ping guaranteed'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveVideoModal(featuredVideo)}
                  className="py-3 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-[1.02] cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{lang === 'bn' ? 'এখনই সম্পূর্ণ ভিডিও দেখুন' : 'Watch Full Video Now'}</span>
                </button>

                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('arabSim')}
                    className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'bn' ? 'সিম কনফিগ টুল ➔' : 'SIM Config Tool ➔'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVideos.map((video) => {
          const parsed = parseVideoSource(video.videoUrl, video.thumbnailUrl);

          return (
            <div
              key={video.id}
              onClick={() => setActiveVideoModal(video)}
              className="group rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/50 p-3.5 space-y-3 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black/90 border border-slate-800 flex items-center justify-center">
                <img
                  src={parsed.thumbnailUrl}
                  alt={video.titleBn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                {/* Badge top-left */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold backdrop-blur-md ${getCategoryBadgeColor(video.category)}`}>
                    {getCategoryLabel(video.category)}
                  </span>
                </div>

                {/* Duration bottom-right */}
                {video.duration && (
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-cyan-400" />
                    <span>{video.duration}</span>
                  </div>
                )}

                {/* Hover Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-115 transition-all">
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  </div>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span>{formatViews(video.viewsCount || 3500)} {lang === 'bn' ? 'ভিউ' : 'views'}</span>
                  </span>
                  {video.badgeBn && (
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {lang === 'bn' ? video.badgeBn : (video.badgeEn || video.badgeBn)}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                  {lang === 'bn' ? video.titleBn : video.titleEn}
                </h4>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {lang === 'bn' ? video.descBn : video.descEn}
                </p>
              </div>

              {/* Watch Now CTA */}
              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                <span>{lang === 'bn' ? 'ভিডিওটি দেখুন' : 'Watch Video'}</span>
                <span className="transform group-hover:translate-x-1 transition-transform">➔</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Responsive Theatre / Video Player Modal */}
      {activeVideoModal && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveVideoModal(null)}
        >
          <div 
            className="w-full max-w-4xl rounded-3xl bg-slate-950 border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${getCategoryBadgeColor(activeVideoModal.category)}`}>
                  {getCategoryLabel(activeVideoModal.category)}
                </span>
                <h3 className="font-black text-sm sm:text-base text-white line-clamp-1">
                  {lang === 'bn' ? activeVideoModal.titleBn : activeVideoModal.titleEn}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                aria-label="Close video player"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Box */}
            <div className="relative aspect-video w-full bg-black">
              {(() => {
                const parsed = parseVideoSource(activeVideoModal.videoUrl, activeVideoModal.thumbnailUrl);

                if (parsed.type === 'youtube') {
                  return (
                    <iframe
                      src={parsed.embedUrl}
                      title={activeVideoModal.titleBn}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  );
                }

                if (parsed.type === 'direct') {
                  return (
                    <video
                      src={parsed.embedUrl}
                      controls
                      autoPlay
                      poster={parsed.thumbnailUrl}
                      className="w-full h-full"
                    >
                      Your browser does not support HTML5 video.
                    </video>
                  );
                }

                // If general iframe or embed URL
                return (
                  <iframe
                    src={parsed.embedUrl}
                    title={activeVideoModal.titleBn}
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                );
              })()}
            </div>

            {/* Modal Footer & Description */}
            <div className="p-4 sm:p-6 bg-slate-950 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-base sm:text-lg font-bold text-white">
                    {lang === 'bn' ? activeVideoModal.titleBn : activeVideoModal.titleEn}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                    {lang === 'bn' ? activeVideoModal.descBn : activeVideoModal.descEn}
                  </p>
                </div>

                {/* Direct Action Link */}
                <a
                  href={CONTACT_CONFIG.getWhatsAppUrl(
                    lang === 'bn'
                      ? `আসসালামু আলাইকুম, আমি "${activeVideoModal.titleBn}" ভিডিওটি দেখেছি। এ বিষয়ে বিস্তারিত জানতে চাই।`
                      : `Hello, I watched the video "${activeVideoModal.titleEn}" and would like to ask questions.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>{lang === 'bn' ? 'WhatsApp-এ হেল্প নিন' : 'Chat on WhatsApp'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
