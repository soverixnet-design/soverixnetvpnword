import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Flame, 
  Zap, 
  Radio, 
  Sparkles, 
  ExternalLink, 
  Calendar, 
  ShieldCheck,
  Check,
  Search,
  Filter
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { SiteAnnouncement, AnnouncementCategory } from '../types';

interface AnnouncementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'en' | 'bn';
}

const READ_ANNOUNCEMENTS_STORAGE_KEY = 'soverix_read_announcements_v1';

export const AnnouncementsModal: React.FC<AnnouncementsModalProps> = ({
  isOpen,
  onClose,
  lang = 'bn'
}) => {
  const [announcements, setAnnouncements] = useState<SiteAnnouncement[]>([]);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(READ_ANNOUNCEMENTS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let unsub = () => {};
    try {
      const q = query(
        collection(db, 'announcements'),
        where('isActive', '==', true)
      );

      unsub = onSnapshot(q, (snapshot) => {
        const items: SiteAnnouncement[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...(doc.data() as any) });
        });
        items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setAnnouncements(items);
      });
    } catch (err) {
      console.warn('AnnouncementsModal listener error:', err);
    }
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const markAllAsRead = () => {
    const allIds = announcements.map(a => a.id);
    setReadIds(allIds);
    try {
      localStorage.setItem(READ_ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(allIds));
      window.dispatchEvent(new Event('soverix_announcements_marked_read'));
    } catch {}
  };

  const markOneAsRead = (id: string) => {
    if (readIds.includes(id)) return;
    const updated = [...readIds, id];
    setReadIds(updated);
    try {
      localStorage.setItem(READ_ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('soverix_announcements_marked_read'));
    } catch {}
  };

  const filtered = announcements.filter(a => {
    if (activeCategory !== 'all' && a.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBn = a.titleBn?.toLowerCase().includes(q) || a.contentBn?.toLowerCase().includes(q);
      const matchEn = a.titleEn?.toLowerCase().includes(q) || a.contentEn?.toLowerCase().includes(q);
      return matchBn || matchEn;
    }
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'offer':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'server':
        return <Zap className="w-4 h-4 text-cyan-400" />;
      case 'freenet':
        return <Radio className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-2">
                <span>{lang === 'bn' ? 'সকল আপডেট ও নোটিফিকেশন' : 'Live Updates & Notices'}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {announcements.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'bn' ? 'এডমিন প্রেরিত সকল সাম্প্রতিক ঘোষণা ও অফার' : 'Latest official announcements from Admin'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {announcements.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                title={lang === 'bn' ? 'সবগুলো পড়া হয়েছে হিসেবে চিহ্নিত করুন' : 'Mark all as read'}
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'bn' ? 'সব পড়া হয়েছে' : 'Mark all read'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/30 space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'all', labelBn: 'সবগুলো', labelEn: 'All' },
              { id: 'offer', labelBn: '🔥 অফার', labelEn: '🔥 Offers' },
              { id: 'server', labelBn: '⚡ সার্ভার', labelEn: '⚡ Servers' },
              { id: 'freenet', labelBn: '📡 ফ্রি-নেট', labelEn: '📡 FreeNet' },
              { id: 'notice', labelBn: '📢 নোটিশ', labelEn: '📢 Notices' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === tab.id
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                {lang === 'bn' ? tab.labelBn : tab.labelEn}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'আপডেট বা অফার খুঁজুন...' : 'Search updates or promos...'}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Bell className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
              <p className="text-sm font-medium">
                {lang === 'bn' ? 'কোনো নোটিফিকেশন পাওয়া যায়নি' : 'No announcements found'}
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const isRead = readIds.includes(item.id);
              const title = lang === 'bn' ? (item.titleBn || item.titleEn) : (item.titleEn || item.titleBn);
              const content = lang === 'bn' ? (item.contentBn || item.contentEn) : (item.contentEn || item.contentBn);
              const badge = lang === 'bn' ? (item.badgeBn || item.badgeEn || 'আপডেট') : (item.badgeEn || item.badgeBn || 'Update');

              return (
                <div
                  key={item.id}
                  onClick={() => markOneAsRead(item.id)}
                  className={`p-4 rounded-2xl border transition-all duration-200 relative group cursor-pointer ${
                    isRead 
                      ? 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 text-slate-300' 
                      : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-emerald-500/40 shadow-lg shadow-emerald-950/20 text-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="p-1 rounded-lg bg-slate-800 border border-slate-700">
                        {getCategoryIcon(item.category)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {badge}
                      </span>
                      {!isRead && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                          {lang === 'bn' ? 'নতুন' : 'NEW'}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(item.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {item.imageUrl && (
                    <div className="my-2.5 rounded-xl overflow-hidden max-h-40 border border-slate-800 bg-black/40">
                      <img src={item.imageUrl} alt={title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <h4 className="font-bold text-sm text-white mb-1.5 leading-snug">
                    {title}
                  </h4>

                  {content && (
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {content}
                    </p>
                  )}

                  {item.actionUrl && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <a
                        href={item.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-xs font-bold shadow-sm hover:scale-105 transition-transform"
                      >
                        <span>{lang === 'bn' ? (item.actionLabelBn || 'অ্যাকশন নিন') : (item.actionLabelEn || 'Take Action')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        {isRead ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{lang === 'bn' ? 'পড়া হয়েছে' : 'Read'}</span>
                          </>
                        ) : (
                          <span className="text-amber-400 font-medium">
                            {lang === 'bn' ? 'অপঠিত' : 'Unread'}
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>{lang === 'bn' ? 'রিয়েল-টাইম পুশ সক্রিয়' : 'Real-time broadcast active'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
