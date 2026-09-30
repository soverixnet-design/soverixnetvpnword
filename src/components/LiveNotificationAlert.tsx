import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  ExternalLink, 
  Sparkles, 
  Flame, 
  Zap, 
  Radio, 
  Volume2, 
  Check, 
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { SiteAnnouncement } from '../types';
import { soundEffects } from '../services/soundEffects';

interface LiveNotificationAlertProps {
  lang?: 'en' | 'bn';
  onOpenAnnouncementList?: () => void;
}

const READ_ANNOUNCEMENTS_STORAGE_KEY = 'soverix_read_announcements_v1';
const POPUP_DISMISSED_SESSION_KEY = 'soverix_popup_dismissed_ids';

export const LiveNotificationAlert: React.FC<LiveNotificationAlertProps> = ({
  lang = 'bn',
  onOpenAnnouncementList
}) => {
  const [announcements, setAnnouncements] = useState<SiteAnnouncement[]>([]);
  const [activePopupAnnouncement, setActivePopupAnnouncement] = useState<SiteAnnouncement | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Read stored read IDs from localStorage
  const getReadIds = (): string[] => {
    try {
      const raw = localStorage.getItem(READ_ANNOUNCEMENTS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const getDismissedSessionIds = (): string[] => {
    try {
      const raw = sessionStorage.getItem(POPUP_DISMISSED_SESSION_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const markAsRead = (id: string) => {
    try {
      const current = getReadIds();
      if (!current.includes(id)) {
        const updated = [...current, id];
        localStorage.setItem(READ_ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(updated));
        // Update unread count
        const unread = announcements.filter(a => !updated.includes(a.id)).length;
        setUnreadCount(unread);
        window.dispatchEvent(new CustomEvent('soverix_unread_announcements', { detail: { unread, announcements } }));
      }
    } catch {}
  };

  const dismissPopup = (id: string, permanentRead = false) => {
    setIsClosing(true);
    setTimeout(() => {
      try {
        const dismissed = getDismissedSessionIds();
        if (!dismissed.includes(id)) {
          sessionStorage.setItem(POPUP_DISMISSED_SESSION_KEY, JSON.stringify([...dismissed, id]));
        }
      } catch {}
      if (permanentRead) {
        markAsRead(id);
      }
      setActivePopupAnnouncement(null);
      setIsClosing(false);
    }, 250);
  };

  // Real-time listener for Firestore announcements
  useEffect(() => {
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

        // Client-side sort by createdAt descending
        items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setAnnouncements(items);

        const readIds = getReadIds();
        const dismissedSessionIds = getDismissedSessionIds();
        const unreadList = items.filter(a => !readIds.includes(a.id));
        setUnreadCount(unreadList.length);

        // Dispatch global event for Navbar Bell & others
        window.dispatchEvent(new CustomEvent('soverix_unread_announcements', { 
          detail: { unread: unreadList.length, announcements: items } 
        }));

        // Pick top unread announcement that wasn't dismissed in this browser session
        const candidate = unreadList.find(a => !dismissedSessionIds.includes(a.id));
        if (candidate) {
          // Play sound notification if enabled
          if (candidate.soundAlert !== false) {
            try {
              soundEffects.playConnected();
            } catch {}
          }
          setActivePopupAnnouncement(candidate);
        } else {
          setActivePopupAnnouncement(null);
        }
      }, (error) => {
        if (error && (error as any).code !== 'unavailable') {
          console.warn('Live announcement sync warning:', error);
        }
      });
    } catch (err) {
      console.warn('Failed to attach announcements listener:', err);
    }

    return () => unsub();
  }, []);

  // Listen to manual read resets
  useEffect(() => {
    const handleReadSync = () => {
      const readIds = getReadIds();
      const unread = announcements.filter(a => !readIds.includes(a.id)).length;
      setUnreadCount(unread);
    };
    window.addEventListener('soverix_announcements_marked_read', handleReadSync);
    return () => window.removeEventListener('soverix_announcements_marked_read', handleReadSync);
  }, [announcements]);

  if (!activePopupAnnouncement) return null;

  const a = activePopupAnnouncement;
  const title = lang === 'bn' ? (a.titleBn || a.titleEn) : (a.titleEn || a.titleBn);
  const content = lang === 'bn' ? (a.contentBn || a.contentEn) : (a.contentEn || a.contentBn);
  const badge = lang === 'bn' ? (a.badgeBn || a.badgeEn || '📢 নতুন আপডেট') : (a.badgeEn || a.badgeBn || '📢 NEW UPDATE');
  const actionLabel = lang === 'bn' ? (a.actionLabelBn || a.actionLabelEn || 'বিস্তারিত দেখুন') : (a.actionLabelEn || a.actionLabelBn || 'View Details');

  const getCategoryTheme = (cat?: string) => {
    switch (cat) {
      case 'offer':
        return {
          border: 'border-amber-500/50 hover:border-amber-400',
          bg: 'from-amber-950/95 via-slate-900/95 to-slate-950/95',
          badgeBg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40',
          btnBg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-amber-500/20',
          icon: <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        };
      case 'server':
        return {
          border: 'border-cyan-500/50 hover:border-cyan-400',
          bg: 'from-cyan-950/95 via-slate-900/95 to-slate-950/95',
          badgeBg: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40',
          btnBg: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-cyan-500/20',
          icon: <Zap className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
        };
      case 'freenet':
        return {
          border: 'border-emerald-500/50 hover:border-emerald-400',
          bg: 'from-emerald-950/95 via-slate-900/95 to-slate-950/95',
          badgeBg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40',
          btnBg: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-emerald-500/20',
          icon: <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        };
      default:
        return {
          border: 'border-indigo-500/50 hover:border-indigo-400',
          bg: 'from-indigo-950/95 via-slate-900/95 to-slate-950/95',
          badgeBg: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/40',
          btnBg: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-indigo-500/20',
          icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        };
    }
  };

  const theme = getCategoryTheme(a.category);

  return (
    <div 
      className={`fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100vw-24px)] transition-all duration-300 ${
        isClosing ? 'opacity-0 translate-y-4 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100'
      }`}
      role="alert"
    >
      <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-2xl backdrop-blur-xl bg-gradient-to-br ${theme.bg} ${theme.border} text-white relative overflow-hidden group`}>
        {/* Subtle decorative glowing corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider border shadow-sm ${theme.badgeBg}`}>
              {theme.icon}
              <span>{badge}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {lang === 'bn' ? 'অটো-নোটিফিকেশন' : 'Live Broadcast'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => dismissPopup(a.id, true)}
              title={lang === 'bn' ? 'পড়া হয়েছে চিহ্নিত করুন' : 'Mark as Read'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => dismissPopup(a.id, false)}
              title={lang === 'bn' ? 'বন্ধ করুন' : 'Dismiss'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional Thumbnail Image */}
        {a.imageUrl && (
          <div className="mb-3 rounded-xl overflow-hidden max-h-36 w-full border border-white/10 bg-black/40">
            <img 
              src={a.imageUrl} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              loading="lazy"
            />
          </div>
        )}

        {/* Title */}
        <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug mb-1.5 flex items-start gap-1.5">
          <span className="text-emerald-400 flex-shrink-0 mt-0.5">●</span>
          <span>{title}</span>
        </h4>

        {/* Content text */}
        {content && (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3.5 line-clamp-3">
            {content}
          </p>
        )}

        {/* Action Row */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          {a.actionUrl ? (
            <a
              href={a.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => markAsRead(a.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-95 ${theme.btnBg}`}
            >
              <span>{actionLabel}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button
              onClick={() => dismissPopup(a.id, true)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-95 ${theme.btnBg}`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ঠিক আছে, বুঝেছি' : 'Got it'}</span>
            </button>
          )}

          {onOpenAnnouncementList && (
            <button
              onClick={() => {
                dismissPopup(a.id, true);
                onOpenAnnouncementList();
              }}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition-colors flex items-center gap-1"
              title={lang === 'bn' ? 'সকল নোটিশ দেখুন' : 'All Announcements'}
            >
              <Bell className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'সকল নোটিশ' : 'All'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
