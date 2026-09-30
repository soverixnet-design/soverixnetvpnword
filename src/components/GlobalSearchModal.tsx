import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  ArrowLeft,
  Globe2, 
  Radio, 
  HelpCircle, 
  Package, 
  Download, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  Zap,
  CornerDownLeft
} from 'lucide-react';
import { SERVERS_DATA } from '../data/servers';
import { CONTACT_CONFIG } from '../data/contact';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'bn';
  onNavigateTab: (tab: string, extraParam?: string) => void;
  onSelectServer?: (server: any) => void;
}

interface SearchItem {
  id: string;
  category: 'region' | 'sim' | 'troubleshoot' | 'package' | 'app';
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  badgeBn: string;
  badgeEn: string;
  icon: React.ReactNode;
  action: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  lang,
  onNavigateTab,
  onSelectServer
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open search modal via custom event
          window.dispatchEvent(new Event('soverix_open_global_search'));
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build searchable database
  const allSearchItems: SearchItem[] = [
    // 1. REGIONS
    {
      id: 'reg-saudi',
      category: 'region',
      titleBn: '🇸🇦 সৌদি আরব (Saudi Arabia 5G & FreeNet)',
      titleEn: '🇸🇦 Saudi Arabia 5G & FreeNet Nodes',
      subtitleBn: 'STC, Mobily, Zain সিমে ০ ব্যালেন্সে আনলিমিটেড ফ্রি ইন্টারনেট ও ভিওআইপি কলিং',
      subtitleEn: 'Zero-balance STC, Mobily, Zain payload injection and unblocked WhatsApp',
      badgeBn: '৫জি নোড',
      badgeEn: '5G NODE',
      icon: <Globe2 className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onNavigateTab('countryGuide', 'saudi');
        onClose();
      }
    },
    {
      id: 'reg-uae',
      category: 'region',
      titleBn: '🇦🇪 সংযুক্ত আরব আমিরাত ও দুবাই (UAE Dubai & Abu Dhabi)',
      titleEn: '🇦🇪 United Arab Emirates (Dubai & Abu Dhabi)',
      subtitleBn: 'Etisalat ও Du সিমে WhatsApp অডিও/ভিডিও কল, BOTIM ও Zoom ১০০% আনব্লক',
      subtitleEn: '100% crystal clear WhatsApp audio/video, BOTIM, and FaceTime unblocking',
      badgeBn: 'কলিং স্পেশাল',
      badgeEn: 'VOIP SPECIAL',
      icon: <Globe2 className="w-4 h-4 text-cyan-400" />,
      action: () => {
        onNavigateTab('countryGuide', 'uae');
        onClose();
      }
    },
    {
      id: 'reg-qatar',
      category: 'region',
      titleBn: '🇶🇦 কাতার (Qatar VIP Nodes)',
      titleEn: '🇶🇦 Qatar VIP High-Speed Nodes',
      subtitleBn: 'Ooredoo ও Vodafone কাতারে ফুল স্পিড ৫জি ও কলিং সুবিধা',
      subtitleEn: 'Ooredoo and Vodafone unmetered 5G data bypass and low-latency nodes',
      badgeBn: 'কাতার নোড',
      badgeEn: 'QATAR NODE',
      icon: <Globe2 className="w-4 h-4 text-purple-400" />,
      action: () => {
        onNavigateTab('countryGuide', 'qatar');
        onClose();
      }
    },
    {
      id: 'reg-bahrain',
      category: 'region',
      titleBn: '🇧🇭 বাহরাইন (Bahrain VIP Nodes)',
      titleEn: '🇧🇭 Bahrain High-Speed Nodes',
      subtitleBn: 'Batelco, STC Bahrain ও Zain সিমে ফ্রি নেট ও কলিং বাইপাস',
      subtitleEn: 'Batelco, STC Bahrain and Zain VoIP tunnel bypass',
      badgeBn: 'বাহরাইন নোড',
      badgeEn: 'BAHRAIN NODE',
      icon: <Globe2 className="w-4 h-4 text-rose-400" />,
      action: () => {
        onNavigateTab('countryGuide', 'bahrain');
        onClose();
      }
    },
    {
      id: 'reg-malaysia',
      category: 'region',
      titleBn: '🇲🇾 মালয়েশিয়া (Malaysia Ultra 5G)',
      titleEn: '🇲🇾 Malaysia Ultra 5G Nodes',
      subtitleBn: 'CelcomDigi, Maxis Hotlink, U Mobile ও Yes 5G আনলিমিটেড ডেটা বাইপাস',
      subtitleEn: 'CelcomDigi, Maxis Hotlink, U Mobile & Yes 5G unmetered bypass',
      badgeBn: 'মালয়েশিয়া',
      badgeEn: 'MALAYSIA',
      icon: <Globe2 className="w-4 h-4 text-amber-400" />,
      action: () => {
        onNavigateTab('countryGuide', 'malaysia');
        onClose();
      }
    },
    {
      id: 'reg-oman',
      category: 'region',
      titleBn: '🇴🇲 ওমান (Oman Sultanate Nodes)',
      titleEn: '🇴🇲 Oman Sultanate Nodes',
      subtitleBn: 'Omantel ও Ooredoo ওমানে আনব্লকড কলিং ও গেমিং নোডস',
      subtitleEn: 'Omantel & Ooredoo Oman low latency unblocked calling',
      badgeBn: 'ওমান নোড',
      badgeEn: 'OMAN NODE',
      icon: <Globe2 className="w-4 h-4 text-teal-400" />,
      action: () => {
        onNavigateTab('countryGuide', 'oman');
        onClose();
      }
    },
    {
      id: 'reg-kuwait',
      category: 'region',
      titleBn: '🇰🇼 কুয়েত (Kuwait VIP Nodes)',
      titleEn: '🇰🇼 Kuwait VIP Nodes',
      subtitleBn: 'Zain, Ooredoo ও STC কুয়েতে জিরো পিং ও বাফারিংলেস স্ট্রিমিং',
      subtitleEn: 'Zain, Ooredoo & STC Kuwait zero lag gaming & streaming',
      badgeBn: 'কুয়েত',
      badgeEn: 'KUWAIT',
      icon: <Globe2 className="w-4 h-4 text-blue-400" />,
      action: () => {
        onNavigateTab('countryGuide', 'kuwait');
        onClose();
      }
    },

    // 2. SIM PROVIDERS
    {
      id: 'sim-stc',
      category: 'sim',
      titleBn: '📶 STC (Saudi Telecom - Sawa SIM)',
      titleEn: '📶 STC (Saudi Telecom - Sawa SIM)',
      subtitleBn: '০ ব্যালেন্সে আনলিমিটেড ব্রাউজিং, freenet.stc.com.sa পেলোড কনফিগারেশন',
      subtitleEn: 'Zero balance payload injection freenet.stc.com.sa port 443',
      badgeBn: 'এসটিসি সাওয়া',
      badgeEn: 'STC SAWA',
      icon: <Radio className="w-4 h-4 text-purple-400" />,
      action: () => {
        onNavigateTab('dashboard');
        onClose();
      }
    },
    {
      id: 'sim-mobily',
      category: 'sim',
      titleBn: '📶 Mobily Saudi (মবিলি সৌদি আরব)',
      titleEn: '📶 Mobily Saudi Arabia (Mobily 60 / Wssal)',
      subtitleBn: 'মবিলি সোশ্যাল প্যাকেজ ও জিরো ব্যালেন্স V2Ray রিয়ালিটি পেলোড',
      subtitleEn: 'Mobily social pack and zero balance V2Ray reality tunnel',
      badgeBn: 'মবিলি সিম',
      badgeEn: 'MOBILY',
      icon: <Radio className="w-4 h-4 text-cyan-400" />,
      action: () => {
        onNavigateTab('dashboard');
        onClose();
      }
    },
    {
      id: 'sim-zain',
      category: 'sim',
      titleBn: '📶 Zain KSA / Kuwait / Bahrain (জাইন সিম)',
      titleEn: '📶 Zain Telecom (KSA, Kuwait & Bahrain)',
      subtitleBn: 'জাইন আনলিমিটেড ৫জি ব্রাউজিং ও আল্ট্রা লো-পিং পেলোড',
      subtitleEn: 'Zain ultra-fast 5G free net and bypass configs',
      badgeBn: 'জাইন সিম',
      badgeEn: 'ZAIN SIM',
      icon: <Radio className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onNavigateTab('dashboard');
        onClose();
      }
    },
    {
      id: 'sim-etisalat',
      category: 'sim',
      titleBn: '📶 Etisalat / e& UAE (ইতিসালাত দুবাই)',
      titleEn: '📶 Etisalat / e& UAE (Dubai & UAE)',
      subtitleBn: 'দুবাই ও ইউএই-তে হোয়াটসঅ্যাপ কল ও আইএমও আনব্লক পেলোড',
      subtitleEn: 'WhatsApp VoIP unblocking payload for Etisalat UAE',
      badgeBn: 'ইতিসালাত',
      badgeEn: 'ETISALAT',
      icon: <Radio className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onNavigateTab('dashboard');
        onClose();
      }
    },
    {
      id: 'sim-celcomdigi',
      category: 'sim',
      titleBn: '📶 CelcomDigi & Maxis Hotlink (মালয়েশিয়া)',
      titleEn: '📶 CelcomDigi & Maxis Hotlink (Malaysia)',
      subtitleBn: 'মালয়েশিয়ায় সব সিমের আনলিমিটেড স্পিড বুস্টার পেলোড',
      subtitleEn: 'Malaysia all carrier unmetered tunnel setup',
      badgeBn: 'মালয়েশিয়া সিম',
      badgeEn: 'MY SIM',
      icon: <Radio className="w-4 h-4 text-amber-400" />,
      action: () => {
        onNavigateTab('countryGuide', 'malaysia');
        onClose();
      }
    },

    // 3. TROUBLESHOOTING & GUIDES
    {
      id: 'guide-call-unblock',
      category: 'troubleshoot',
      titleBn: '🛠️ মধ্যপ্রাচ্যে WhatsApp ও IMO কল আনব্লক করার গাইড',
      titleEn: '🛠️ How to Unblock WhatsApp & IMO Calls in Gulf',
      subtitleBn: 'দুবাই ও সৌদি আরবে অডিও/ভিডিও কল ব্লক হলে কীভাবে ১-ট্যাপে ক্লিয়ার করবেন',
      subtitleEn: 'Step-by-step VoIP unblocking using WireGuard & V2Ray Reality',
      badgeBn: 'কলিং গাইড',
      badgeEn: 'CALLING FIX',
      icon: <HelpCircle className="w-4 h-4 text-cyan-400" />,
      action: () => {
        onNavigateTab('appsTutorials');
        onClose();
      }
    },
    {
      id: 'guide-pin-activation',
      category: 'troubleshoot',
      titleBn: '🛠️ ভিআইপি পিন কোড ও ইউজারনেম অ্যাক্টিভ করার নিয়ম',
      titleEn: '🛠️ How to Activate VIP PIN Code & Password',
      subtitleBn: 'বিকাশ বা নগদ দিয়ে পেমেন্ট করার পর পাওয়া কোড কীভাবে অ্যাপে বসাবেন',
      subtitleEn: 'Quick tutorial on activating VIP pass on Android apps',
      badgeBn: 'পিন অ্যাক্টিভ',
      badgeEn: 'PIN GUIDE',
      icon: <HelpCircle className="w-4 h-4 text-amber-400" />,
      action: () => {
        onNavigateTab('appsTutorials');
        onClose();
      }
    },
    {
      id: 'guide-connect-fail',
      category: 'troubleshoot',
      titleBn: '🛠️ ভিপিএন কানেক্ট না হলে কী করবেন? (Connection Failed Fix)',
      titleEn: '🛠️ Fixing "Connection Failed" or Reconnecting Loops',
      subtitleBn: 'সার্ভার নোড পরিবর্তন, কাস্টম ডিএনএস ও স্টিলথ ট্রাফিক মোড অন করার সমাধান',
      subtitleEn: 'Switching protocol, MTU optimization & Obfuscation toggle',
      badgeBn: 'কানেকশন সমাধান',
      badgeEn: 'FIX GUIDE',
      icon: <HelpCircle className="w-4 h-4 text-rose-400" />,
      action: () => {
        onNavigateTab('appsTutorials');
        onClose();
      }
    },
    {
      id: 'guide-speed-boost',
      category: 'troubleshoot',
      titleBn: '🛠️ ইন্টারনেটের স্পিড বাড়ানো ও লো-পিং গেমিং সেটিংস',
      titleEn: '🛠️ Speed Boost & Low-Ping Gaming Configuration',
      subtitleBn: 'PUBG ও Free Fire-এ ২০ms পিং পেতে সিঙ্গাপুর ও BDIX নোড ব্যবহার করুন',
      subtitleEn: 'Bypass ISP bandwidth throttling for 4K streaming and 8ms gaming ping',
      badgeBn: 'স্পিড বুস্ট',
      badgeEn: 'SPEED BOOST',
      icon: <HelpCircle className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onNavigateTab('benefits');
        onClose();
      }
    },

    // 4. PACKAGES & ORDERS
    {
      id: 'pkg-retail',
      category: 'package',
      titleBn: '📦 রিটেইল ভিআইপি পাস কিনুন (Buy Single VIP PIN)',
      titleEn: '📦 Buy VIP Pass (Single Month / Multi-Device)',
      subtitleBn: 'বিকাশ, নগদ, Mada বা STC Pay দিয়ে মাত্র ৬০ সেকেন্ডে সরাসরি পিন পান',
      subtitleEn: 'Instant automated WhatsApp delivery with replacement guarantee',
      badgeBn: 'রিটেইল বাই',
      badgeEn: 'RETAIL BUY',
      icon: <Package className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onNavigateTab('packages');
        onClose();
      }
    },
    {
      id: 'pkg-reseller',
      category: 'package',
      titleBn: '💼 রিসেলার ও হোলসেল পিন প্যানেল (Wholesale Reseller)',
      titleEn: '💼 Reseller & Wholesale PIN Panel (High Profit)',
      subtitleBn: 'পাইকারি দামে ভিপিএন পিন কিনে মাসে ৫০,০০০+ টাকা আয় করার সুযোগ',
      subtitleEn: 'Wholesale pricing, automated customer portal, sub-dealer reseller panel',
      badgeBn: 'হোলসেল',
      badgeEn: 'RESELLER',
      icon: <Package className="w-4 h-4 text-amber-400" />,
      action: () => {
        onNavigateTab('reseller');
        onClose();
      }
    },

    // 5. APPS
    {
      id: 'app-afv2ray',
      category: 'app',
      titleBn: '📱 AF V2Ray VPN Official APK',
      titleEn: '📱 AF V2Ray VPN Official Android APK',
      subtitleBn: 'বিশ্বের সব দেশে কাজ করে, V2Ray, VLESS Reality ও Trojan সাপোর্ট',
      subtitleEn: 'Works worldwide with V2Ray, VLESS Reality & Trojan tunneling',
      badgeBn: 'অফিসিয়াল অ্যাপ',
      badgeEn: 'OFFICIAL APK',
      icon: <Download className="w-4 h-4 text-cyan-400" />,
      action: () => {
        window.open(CONTACT_CONFIG.apps.afV2Ray.downloadUrl, '_blank');
        onClose();
      }
    },
    {
      id: 'app-jiyamplus',
      category: 'app',
      titleBn: '📱 Jiyam Plus VPN Official APK',
      titleEn: '📱 Jiyam Plus VPN Official Android APK',
      subtitleBn: 'সৌদি আরব ও আরব সিমে ০ ব্যালেন্সে সুপারফাস্ট ফ্রি-নেট স্পেশাল',
      subtitleEn: 'Specialized zero-balance carrier payload injection app',
      badgeBn: 'ফ্রি-নেট অ্যাপ',
      badgeEn: 'FREENET APK',
      icon: <Download className="w-4 h-4 text-emerald-400" />,
      action: () => {
        window.open(CONTACT_CONFIG.apps.jiyamPlus.downloadUrl, '_blank');
        onClose();
      }
    }
  ];

  // Filter items
  const filtered = allSearchItems.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const matchBn = item.titleBn.toLowerCase().includes(q) || item.subtitleBn.toLowerCase().includes(q) || item.badgeBn.toLowerCase().includes(q);
    const matchEn = item.titleEn.toLowerCase().includes(q) || item.subtitleEn.toLowerCase().includes(q) || item.badgeEn.toLowerCase().includes(q);
    return matchBn || matchEn;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar with Back Button */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center gap-2 sm:gap-3 bg-slate-950/90">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 text-xs sm:text-sm font-black border border-slate-700 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm group shrink-0 active:scale-95"
            title={lang === 'bn' ? 'ফিরে যান / ব্যাকে যান' : 'Go Back'}
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-1 transition-transform" />
            <span>{lang === 'bn' ? '← ব্যাকে যান' : '← Back'}</span>
          </button>

          <Search className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'bn' 
              ? 'ভিপিএন দেশ, সিম অপারেটর (STC, Mobily), সমস্যা সমাধান বা প্যাকেজ খুঁজুন...' 
              : 'Search VPN regions, SIM providers, troubleshooting guides, apps...'}
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-xs sm:text-base font-medium focus:outline-none min-w-0"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={lang === 'bn' ? 'মুছে ফেলুন' : 'Clear'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
          <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-mono font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Quick Category Filters */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {[
            { id: 'all', labelBn: 'সবগুলো', labelEn: 'All Results' },
            { id: 'region', labelBn: '🌍 দেশ ও রিজিয়ন', labelEn: '🌍 Regions' },
            { id: 'sim', labelBn: '📶 সিম প্রোভাইডার', labelEn: '📶 SIM Carriers' },
            { id: 'troubleshoot', labelBn: '🛠️ সমাধান গাইড', labelEn: '🛠️ Guides' },
            { id: 'package', labelBn: '📦 প্যাকেজ ও পিন', labelEn: '📦 Packages' },
            { id: 'app', labelBn: '📱 অফিসিয়াল অ্যাপ', labelEn: '📱 APKs' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === tab.id
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {lang === 'bn' ? tab.labelBn : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Search className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
              <p className="text-sm font-medium">
                {lang === 'bn' ? `'${query}' এর জন্য কোনো ফলাফল পাওয়া যায়নি` : `No results found for '${query}'`}
              </p>
              <p className="text-xs text-slate-600">
                {lang === 'bn' ? 'সঠিক দেশ বা সিমের নাম (STC, Mobily, Zain, UAE) লিখে চেষ্টা করুন' : 'Try searching for Saudi, STC, Mobily, Dubai, or PIN'}
              </p>
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                onClick={item.action}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group flex items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 flex-shrink-0 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors truncate">
                        {lang === 'bn' ? item.titleBn : item.titleEn}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {lang === 'bn' ? item.badgeBn : item.badgeEn}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {lang === 'bn' ? item.subtitleBn : item.subtitleEn}
                    </p>
                  </div>
                </div>

                <div className="p-1.5 rounded-lg text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400 px-5">
          <div className="flex items-center gap-3">
            <span>
              {lang === 'bn' 
                ? `মোট ${filtered.length} টি ফলাফল` 
                : `${filtered.length} results`}
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              {lang === 'bn' ? 'ক্লিক করে সরাসরি পেজে যান' : 'Click result to jump directly'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">
              Ctrl+K
            </kbd>
            <span className="text-[10px]">খুলতে চাপুন</span>
          </div>
        </div>
      </div>
    </div>
  );
};
