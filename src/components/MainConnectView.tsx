import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Power, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Globe2, 
  Zap, 
  Lock, 
  Activity, 
  Sparkles, 
  RefreshCw,
  EyeOff,
  ChevronRight,
  Cpu,
  TrendingUp,
  Layers,
  Gift,
  Crown,
  CheckCircle2,
  HelpCircle,
  Laptop,
  Smartphone,
  Apple,
  Terminal,
  ExternalLink,
  Server,
  HardDrive,
  Users,
  Check,
  Copy,
  CreditCard,
  ArrowRight,
  ChevronDown,
  Download,
  Star,
  Globe
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { ConnectionStatus, VPNServer, VPNProtocol, SecuritySettings, LiveTrafficData } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { PROTOCOL_INFO, SERVERS_DATA } from '../data/servers';
import { 
  CONTACT_CONFIG, 
  getSiteSettings, 
  SiteSettingsData, 
  DEFAULT_CUSTOM_BENEFITS, 
  DEFAULT_CUSTOM_FAQS, 
  DEFAULT_HERO_CONTENT, 
  DEFAULT_WHATSAPP_CTA 
} from '../data/contact';
import { OfficialAppsGrid } from './OfficialAppsGrid';
import { VideoTutorialsSection } from './VideoTutorialsSection';
import { DynamicHeroBanners } from './DynamicHeroBanners';
import { ProtocolTooltip, ProtocolComparisonModal } from './ProtocolTooltip';
import { CommunityReviewsSection } from './CommunityReviewsSection';
import { NetworkSpeedService } from '../services/networkSpeedService';
import { autoReconnectService, AutoReconnectState } from '../services/autoReconnectService';
import { useAuth } from '../firebase/AuthContext';
import confetti from 'canvas-confetti';

interface MainConnectViewProps {
  status: ConnectionStatus;
  onToggleConnect: () => void;
  selectedServer: VPNServer;
  onOpenServerModal: () => void;
  activeProtocol: VPNProtocol;
  onSelectProtocol: (proto: VPNProtocol) => void;
  settings: SecuritySettings;
  onUpdateSettings: (newSettings: Partial<SecuritySettings>) => void;
  lang: 'en' | 'bn';
  onNavigateTab: (tab: string) => void;
  onOpenAuthModal?: (tab?: 'signin' | 'signup') => void;
  onSelectFreeServer?: () => void;
  onSelectServer?: (server: VPNServer) => void;
  onSimulateDrop?: () => void;
}

// Custom Cyber Tooltip Component for Recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
  lang: 'en' | 'bn';
}

const CyberChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, lang }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-[#030712]/95 border border-cyan-500/40 rounded-xl shadow-2xl backdrop-blur-md font-mono text-xs z-50">
        <div className="text-[10px] text-slate-400 border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between gap-3">
          <span>{label}</span>
          <span className="text-emerald-400 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            TLS 1.3
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4 text-cyan-300">
            <span className="text-[11px] flex items-center gap-1.5 font-sans font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              {lang === 'bn' ? 'ডাউনলোড গতি:' : 'Download:'}
            </span>
            <span className="font-bold text-cyan-300">{payload[0]?.value} Mbps</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-emerald-300">
            <span className="text-[11px] flex items-center gap-1.5 font-sans font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {lang === 'bn' ? 'আপলোড গতি:' : 'Upload:'}
            </span>
            <span className="font-bold text-emerald-300">{payload[1]?.value} Mbps</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const MainConnectView: React.FC<MainConnectViewProps> = ({
  status,
  onToggleConnect,
  selectedServer,
  onOpenServerModal,
  activeProtocol,
  onSelectProtocol,
  settings,
  onUpdateSettings,
  lang,
  onNavigateTab,
  onOpenAuthModal,
  onSelectFreeServer,
  onSelectServer,
  onSimulateDrop,
}) => {
  const t = TRANSLATIONS[lang];
  const { user, userProfile, isSuperAdmin, isAdmin } = useAuth();

  // Website interactive states
  const [siteSettings, setSiteSettings] = useState<SiteSettingsData>(() => getSiteSettings());
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  const [copiedPayload, setCopiedPayload] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState<'all' | 'asia_me' | 'europe_us' | 'free'>('all');

  useEffect(() => {
    const handleSettingsChange = (e: any) => {
      setSiteSettings(getSiteSettings());
    };
    window.addEventListener('soverix_settings_changed', handleSettingsChange);
    return () => window.removeEventListener('soverix_settings_changed', handleSettingsChange);
  }, []);

  const handleCopyPayload = (sni: string) => {
    navigator.clipboard.writeText(sni);
    setCopiedPayload(sni);
    setTimeout(() => setCopiedPayload(null), 2500);
  };

  const isUserVip = Boolean(
    isSuperAdmin || 
    isAdmin || 
    (userProfile?.plan && userProfile.plan.toLowerCase().includes('vip')) || 
    (userProfile?.plan && userProfile.plan.toLowerCase().includes('pro')) || 
    (userProfile?.plan && userProfile.plan.toLowerCase().includes('titan')) || 
    (userProfile?.plan && userProfile.plan.toLowerCase().includes('turbo')) || 
    (userProfile?.plan && userProfile.plan.toLowerCase().includes('lifetime')) || 
    (userProfile?.plan && userProfile.plan.toLowerCase().includes('elite'))
  );

  const isConnected = status === 'connected';
  const isReconnecting = status === 'reconnecting';
  const isConnecting = status === 'connecting' || status === 'handshaking';

  const [reconnectState, setReconnectState] = useState<AutoReconnectState>(() => autoReconnectService.getState());

  useEffect(() => {
    const unsub = autoReconnectService.subscribe((s) => {
      setReconnectState(s);
    });
    return () => unsub();
  }, []);

  // Live session timer
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  // Real-time speed numbers
  const [currentDownload, setCurrentDownload] = useState(0);
  const [currentUpload, setCurrentUpload] = useState(0);
  const [peakDownload, setPeakDownload] = useState(0);
  const [dataSentMB, setDataSentMB] = useState(14.2);
  const [dataRecvMB, setDataRecvMB] = useState(88.6);
  const [adsBlockedCount, setAdsBlockedCount] = useState(142);

  // Initial stream chart data
  const [trafficHistory, setTrafficHistory] = useState<LiveTrafficData[]>(() => {
    const initialPoints: LiveTrafficData[] = [];
    const now = Date.now();
    for (let i = 12; i >= 0; i--) {
      const timeStr = new Date(now - i * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      initialPoints.push({ time: timeStr, download: 0, upload: 0 });
    }
    return initialPoints;
  });

  // Timer effect and live traffic generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      const { downlink } = NetworkSpeedService.getDeviceNetworkInfo();

      interval = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);

        // Calculate dynamic accurate speeds tailored directly to server ping, load, and protocol
        const { download: newDl, upload: newUl } = NetworkSpeedService.calculateDynamicThroughput(
          selectedServer,
          activeProtocol,
          downlink > 0 ? downlink * 1.5 : 130
        );

        setCurrentDownload(newDl);
        setCurrentUpload(newUl);
        setPeakDownload((prev) => Math.max(prev, newDl));

        setDataRecvMB((prev) => +(prev + newDl / (8 * 10)).toFixed(2));
        setDataSentMB((prev) => +(prev + newUl / (8 * 10)).toFixed(2));

        if (Math.random() > 0.6) {
          setAdsBlockedCount((prev) => prev + 1);
        }

        setTrafficHistory((prev) => {
          const nowTime = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          const updated = [...prev, { time: nowTime, download: newDl, upload: newUl }];
          if (updated.length > 20) updated.shift();
          return updated;
        });
      }, 1000);
    } else {
      setDurationSeconds(0);
      setCurrentDownload(0);
      setCurrentUpload(0);
      // Reset data points gracefully when disconnected
      setTrafficHistory((prev) =>
        prev.map((pt) => ({ ...pt, download: 0, upload: 0 }))
      );
    }
    return () => clearInterval(interval);
  }, [isConnected, activeProtocol, selectedServer]);

  // Trigger celebration on initial connection
  useEffect(() => {
    if (status === 'connected') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#06b6d4', '#10b981', '#6366f1']
        });
      } catch {}
    }
  }, [status]);

  // Format Duration HH:MM:SS
  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const protocolData = PROTOCOL_INFO[activeProtocol];

  return (
    <div className="space-y-6 sm:space-y-10">
      
      {/* Website Hero Section */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-10 lg:p-12 border border-cyan-500/30 bg-gradient-to-br from-[#040d21] via-[#030712] to-[#0a122c] shadow-2xl animate-fade-in-up">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-bold shadow-sm mb-4">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>
              {lang === 'bn' 
                ? (siteSettings.heroContent?.badgeBn || '⚡ ১০০% নিরাপদ, নো-লগ ও আল্ট্রা হাই-স্পিড ভিপিএন নেটওয়ার্ক') 
                : (siteSettings.heroContent?.badgeEn || 'Ultra Fast & 100% No-Logs Premium VPN')}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            {lang === 'bn' ? (
              siteSettings.heroContent?.headlineBn || siteSettings.designTheme?.heroHeadlineBn ? (
                <span>{siteSettings.heroContent?.headlineBn || siteSettings.designTheme?.heroHeadlineBn}</span>
              ) : (
                <>
                  সীমাহীন গতি ও স্বাধীনতায় ইন্টারনেট চালান —{' '}
                  <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                    {siteSettings.designTheme?.siteTitle || 'Soverixnet VPN'}
                  </span>
                </>
              )
            ) : (
              siteSettings.heroContent?.headlineEn || siteSettings.designTheme?.heroHeadlineEn ? (
                <span>{siteSettings.heroContent?.headlineEn || siteSettings.designTheme?.heroHeadlineEn}</span>
              ) : (
                <>
                  Unmetered Speed & True Privacy —{' '}
                  <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                    {siteSettings.designTheme?.siteTitle || 'Soverixnet VPN'}
                  </span>
                </>
              )
            )}
          </h1>

          <p className="mt-4 text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl leading-relaxed">
            {lang === 'bn' 
              ? (siteSettings.heroContent?.subheadlineBn || siteSettings.designTheme?.heroSubheadlineBn || 'সৌদি আরব ও মধ্যপ্রাচ্যের সকল সিম (STC, Mobily, Zain), বাংলাদেশ এবং বিশ্বজুড়ে বাফারিং ছাড়া ইউটিউব, টিকটক, সোশ্যাল মিডিয়া ব্রাউজিং ও লো-পিং অনলাইন গেমিংয়ের নির্ভরযোগ্য সমাধান।') 
              : (siteSettings.heroContent?.subheadlineEn || siteSettings.designTheme?.heroSubheadlineEn || 'Ultra-fast servers for Gulf SIMs (STC, Mobily, Zain), seamless 4K streaming, buffer-free social media, and ultra-low ping gaming worldwide.')}
          </p>

          {/* Quick Action Navigation CTAs (WhatsApp Order & Showcase) */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <a
              href={CONTACT_CONFIG.getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-xl shadow-emerald-500/30 transition-all cursor-pointer transform hover:scale-105"
            >
              <svg className="w-4 h-4 fill-current text-black" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-1.99-.46-1.657-.683-2.73-2.366-2.812-2.476-.083-.11-1.01-1.348-1.01-2.572 0-1.223.636-1.824.862-2.073.226-.249.493-.311.658-.311.164 0 .328.002.472.01.153.007.358-.058.56.427.207.499.704 1.722.766 1.847.062.125.103.271.021.434-.083.164-.124.266-.247.41-.124.144-.261.322-.373.432-.124.123-.254.256-.11.503.144.247.641 1.057 1.376 1.713.946.843 1.744 1.104 1.991 1.228.247.124.391.103.535-.062.145-.165.618-.719.783-.967.165-.247.33-.206.556-.123.226.082 1.436.677 1.683.801.247.124.412.185.473.288.062.103.062.597-.082 1.002zM12 2C6.477 2 2 6.477 2 12c0 1.891.528 3.659 1.442 5.174L2 22l4.981-1.306C8.441 21.545 10.16 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
              </svg>
              <span>{lang === 'bn' ? '💬 হোয়াটসঅ্যাপে ভিপিএন নিন' : '💬 WhatsApp Order'}</span>
            </a>

            <button
              onClick={() => onNavigateTab('vipPlans')}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer transform hover:scale-105"
            >
              <Crown className="w-4 h-4 text-black" />
              <span>{lang === 'bn' ? '👑 VIP প্যাকেজ ও মূল্য' : '👑 VIP Plans & Pricing'}</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('country-servers-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3.5 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'bn' ? '৫০+ দেশ ও সার্ভার' : '50+ Global Servers'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('arabSim')}
              className="px-4 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>🇸🇦</span>
              <span>{lang === 'bn' ? 'আরব সিম ফ্রি-নেট' : 'Arab SIM Free-Net'}</span>
            </button>
          </div>

          {/* Social Proof & Trust Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-extrabold block text-sm">10 Gbps</span>
                <span className="text-slate-400 text-[11px]">{lang === 'bn' ? 'আনলিমিটেড স্পিড' : 'Unmetered Uplink'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-extrabold block text-sm">60+ Nodes</span>
                <span className="text-slate-400 text-[11px]">{lang === 'bn' ? 'বিশ্বজুড়ে হাই-স্পিড নোড' : 'Global Locations'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-extrabold block text-sm">100% RAM Only</span>
                <span className="text-slate-400 text-[11px]">{lang === 'bn' ? 'জিরো লগ নীতি' : 'Strict Zero Logs'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <div>
                <span className="text-white font-extrabold block text-sm">4.9 / 5.0 ★</span>
                <span className="text-slate-400 text-[11px]">{lang === 'bn' ? '১২,০০০+ সন্তুষ্ট ইউজার' : '12,000+ Reviews'}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION: Direct WhatsApp Order & Setup Showcase (বিজ্ঞাপন ও শোকেস হাব) */}
      <div id="order-vpn-hub" className="animate-fade-in-up relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-emerald-500/40 bg-gradient-to-b from-[#021b14] via-slate-950 to-[#02050e] shadow-2xl">
        {/* Glow ambient background orbs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          
          {/* Header Badge & Title */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/40 shadow-sm mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{lang === 'bn' ? 'অফিসিয়াল বিজ্ঞাপন ও অর্ডার হাব' : 'Official WhatsApp Order & Showcase'}</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {lang === 'bn' ? 'সরাসরি হোয়াটসঅ্যাপে মেসেজ দিয়ে আপনার ভিপিএন নিন' : 'Get Your Custom High-Speed VPN via WhatsApp'}
            </h2>
            
            <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
              {lang === 'bn' 
                ? 'কোনো জটিলতা ছাড়াই সরাসরি আমাদের হোয়াটসঅ্যাপে মেসেজ দিন — আমরা আপনার মোবাইল (Android / iPhone) বা কম্পিউটারের জন্য রেডি ভিপিএন অ্যাপ, ইউজার অ্যাকাউন্ট ও হাই-স্পিড কনফিগ ফাইল ২ মিনিটের মধ্যে বুঝিয়ে দেব।'
                : 'Message us directly on WhatsApp for instant setup on Android, iPhone, or Windows PC. We provide verified apps, user accounts, and high-speed configs in under 2 minutes.'}
            </p>
          </div>

          {/* Interactive WhatsApp Support Banner (Clickable) */}
          <div 
            onClick={() => window.open(CONTACT_CONFIG.getWhatsAppUrl('আসসালামু আলাইকুম, আমি Soverixnet VPN এর ২৪/৭ হোয়াটসঅ্যাপ সাপোর্ট ও ভিআইপি আইডি নিতে চাই।'), '_blank', 'noopener,noreferrer')}
            className="group relative rounded-3xl overflow-hidden border border-cyan-500/30 hover:border-cyan-400 mb-6 cursor-pointer shadow-xl shadow-cyan-950/40 transition-all duration-300"
          >
            <img 
              src="/thumb-android-tips.png" 
              alt="Soverixnet Online WhatsApp Support" 
              referrerPolicy="no-referrer"
              className="w-full h-36 sm:h-48 md:h-56 object-cover group-hover:scale-[1.01] transition-transform duration-500"
            />
          </div>

          {/* Primary Call To Action Big Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/40 shadow-xl mb-8 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-black shadow-xl shadow-emerald-500/30 shrink-0">
                <svg className="w-9 h-9 sm:w-11 sm:h-11 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-1.99-.46-1.657-.683-2.73-2.366-2.812-2.476-.083-.11-1.01-1.348-1.01-2.572 0-1.223.636-1.824.862-2.073.226-.249.493-.311.658-.311.164 0 .328.002.472.01.153.007.358-.058.56.427.207.499.704 1.722.766 1.847.062.125.103.271.021.434-.083.164-.124.266-.247.41-.124.144-.261.322-.373.432-.124.123-.254.256-.11.503.144.247.641 1.057 1.376 1.713.946.843 1.744 1.104 1.991 1.228.247.124.391.103.535-.062.145-.165.618-.719.783-.967.165-.247.33-.206.556-.123.226.082 1.436.677 1.683.801.247.124.412.185.473.288.062.103.062.597-.082 1.002zM12 2C6.477 2 2 6.477 2 12c0 1.891.528 3.659 1.442 5.174L2 22l4.981-1.306C8.441 21.545 10.16 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider">
                    ⚡ 24/7 Live Support & Instant Setup
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {lang === 'bn' ? 'হোয়াটসঅ্যাপে সরাসরি ভিপিএন অর্ডার করুন' : 'Order VPN via WhatsApp'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  {lang === 'bn'
                    ? 'মেসেজ দেওয়ার সাথে সাথে হাই-স্পিড একাউন্ট ও কনফিগ লিঙ্ক পেয়ে যাবেন।'
                    : 'Get your personal high-speed VPN link & configuration within 2 minutes of contacting us.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
              <a
                href={CONTACT_CONFIG.getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/30 transition-all cursor-pointer transform hover:scale-105"
              >
                <svg className="w-5 h-5 fill-current text-black" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-1.99-.46-1.657-.683-2.73-2.366-2.812-2.476-.083-.11-1.01-1.348-1.01-2.572 0-1.223.636-1.824.862-2.073.226-.249.493-.311.658-.311.164 0 .328.002.472.01.153.007.358-.058.56.427.207.499.704 1.722.766 1.847.062.125.103.271.021.434-.083.164-.124.266-.247.41-.124.144-.261.322-.373.432-.124.123-.254.256-.11.503.144.247.641 1.057 1.376 1.713.946.843 1.744 1.104 1.991 1.228.247.124.391.103.535-.062.145-.165.618-.719.783-.967.165-.247.33-.206.556-.123.226.082 1.436.677 1.683.801.247.124.412.185.473.288.062.103.062.597-.082 1.002zM12 2C6.477 2 2 6.477 2 12c0 1.891.528 3.659 1.442 5.174L2 22l4.981-1.306C8.441 21.545 10.16 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
                <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপে মেসেজ দিন' : 'Chat on WhatsApp'}</span>
              </a>

              <a
                href={CONTACT_CONFIG.whatsappChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400 font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>📢</span>
                <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপ চ্যানেল' : 'WhatsApp Channel'}</span>
              </a>
            </div>
          </div>

          {/* 3-Step Process (How to Get Soverixnet VPN) */}
          <div className="mb-8">
            <h4 className="text-center font-black text-slate-200 text-sm sm:text-base uppercase tracking-wider mb-4">
              {lang === 'bn' ? '৩টি সহজ ধাপে কীভাবে আমাদের ভিপিএন নিবেন ও চালাবেন?' : 'How to Get and Run Soverixnet VPN in 3 Simple Steps'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between relative group hover:border-cyan-500/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-black text-sm flex items-center justify-center font-mono">
                    ১
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300">
                    Step 1
                  </span>
                </div>
                <div>
                  <h5 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                    {lang === 'bn' ? 'প্যাকেজ বা দেশ পছন্দ করুন' : 'Choose Country or Plan'}
                  </h5>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {lang === 'bn'
                      ? 'আমাদের ওয়েবসাইটের তালিকা থেকে আপনার পছন্দের দেশ (সৌদি আরব, দুবাই, সিঙ্গাপুর, বাংলাদেশ ইত্যাদি) বা ভিআইপি প্ল্যান বেছে নিন।'
                      : 'Explore our 50+ locations or select a VIP plan (1-Month, 3-Month, 1-Year or Lifetime).'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const el = document.getElementById('country-servers-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="mt-4 text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>{lang === 'bn' ? 'দেশের তালিকা দেখুন ➔' : 'View Countries ➔'}</span>
                </button>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between relative group hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-sm flex items-center justify-center font-mono">
                    ২
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300">
                    Step 2
                  </span>
                </div>
                <div>
                  <h5 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                    {lang === 'bn' ? 'হোয়াটসঅ্যাপে অর্ডার মেসেজ দিন' : 'Message Us on WhatsApp'}
                  </h5>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {lang === 'bn'
                      ? 'বাটনে ক্লিক করলে সরাসরি আমাদের সাথে হোয়াটসঅ্যাপে মেসেজ চলে যাবে। আপনার প্রয়োজন অনুযায়ী ফ্রি ট্রায়াল বা প্যাকেজ কনফার্ম করুন।'
                      : 'Click the button to open WhatsApp chat. Request your free trial or paid configuration instantly.'}
                  </p>
                </div>
                <a
                  href={CONTACT_CONFIG.getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>{lang === 'bn' ? 'মেসেজ দিন ➔' : 'Message Now ➔'}</span>
                </a>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between relative group hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black text-sm flex items-center justify-center font-mono">
                    ৩
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300">
                    Step 3
                  </span>
                </div>
                <div>
                  <h5 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                    {lang === 'bn' ? 'অ্যাপে কানেক্ট করে ফুল স্পিডে চালান' : 'Connect and Enjoy'}
                  </h5>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {lang === 'bn'
                      ? 'আমরা আপনাকে রেডি অ্যাপ (v2rayNG / OpenVPN / WireGuard) ও লিংক পাঠিয়ে দেব। শুধু পেস্ট করে এক ক্লিকে কানেক্ট করে নিশ্চিন্তে ব্যবহার করুন।'
                      : 'We provide you the app download link and your private config key. Import and enjoy unlimited speed & security.'}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <span>⚡</span>
                  <span>{lang === 'bn' ? '১০০% আনলিমিটেড স্পিড' : '100% Unmetered'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Apps & Payment Methods Bar */}
          <div className="pt-6 border-t border-slate-800/80 space-y-4">
            
            {/* Quick 1-click CTA to the dedicated Apps Hub (Removing duplicate full grid) */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    {lang === 'bn' ? '৪টি অফিসিয়াল ভিপিএন অ্যাপ (Mohin VIP, Net Solution, AF V2Ray, Jiyam Plus)' : '4 Official VPN Apps (Mohin VIP, Net Solution, AF V2Ray, Jiyam Plus)'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {lang === 'bn' ? 'হাই-কোয়ালিটি ৩ডি বাটনে ক্লিক করে সরাসরি APK ফাইল ডাউনলোড করুন।' : 'Direct APK download with tactile 3D buttons.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  const el = document.getElementById('official-apps-hub');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{lang === 'bn' ? 'অ্যাপস ডাউনলোড দেখুন ➔' : 'View Download Hub ➔'}</span>
              </button>
            </div>

            {/* Other Supported Apps and Accepted Payment Methods Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Other supported apps */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-400 block mb-2">
                  📱 {lang === 'bn' ? 'অন্যান্য সাপোর্টেড অ্যাপস:' : 'Other Supported Applications:'}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {['v2rayNG', 'Shadowrocket (iOS)', 'WireGuard', 'OpenVPN', 'Sing-box', 'HTTP Custom', 'HA Tunnel Plus', 'Windows PC'].map((app) => (
                    <span key={app} className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80 text-cyan-300 font-mono text-[11px] font-bold">
                      {app}
                    </span>
                  ))}
                </div>
              </div>

              {/* Payment methods */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-400 block mb-2">
                  💳 {lang === 'bn' ? 'সহজ পেমেন্ট মাধ্যমসমূহ:' : 'Accepted Payment Methods:'}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { name: 'বিকাশ (bKash)', color: 'text-pink-400' },
                    { name: 'নগদ (Nagad)', color: 'text-orange-400' },
                    { name: 'রকেট (Rocket)', color: 'text-purple-400' },
                    { name: 'মাদা কার্ড (Saudi Mada)', color: 'text-emerald-400' },
                    { name: 'STC Pay', color: 'text-purple-300' },
                    { name: 'Binance Pay (USDT)', color: 'text-amber-400' }
                  ].map((pm) => (
                    <span key={pm.name} className={`px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80 font-bold text-[11px] ${pm.color}`}>
                      {pm.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>



      {/* Fast Navigation to Dedicated Pages */}
      <div className="animate-fade-in-up delay-350 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          onClick={() => onNavigateTab('countryGuide')}
          className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 hover:border-emerald-400 transition-all flex items-center justify-between text-left group cursor-pointer shadow-lg shadow-emerald-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                {lang === 'bn' ? '🗺️ দেশ ও সিম গাইড' : 'Countries & SIMs'}
              </h5>
              <p className="text-[11px] text-slate-400">{lang === 'bn' ? 'সৌদি, দুবাই, ওমান, কুয়েত, মালয়েশিয়া' : 'Gulf, Malaysia & SIM Payloads'}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => onNavigateTab('packages')}
          className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 hover:border-amber-400 transition-all flex items-center justify-between text-left group cursor-pointer shadow-lg shadow-amber-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                {lang === 'bn' ? '🛒 প্যাকেজ ও পিন অর্ডার' : 'Packages & Orders'}
              </h5>
              <p className="text-[11px] text-slate-400">{lang === 'bn' ? '১ মাস/৩ মাস/লাইফটাইম পিন' : '1-Mo / 3-Mo / Lifetime PIN'}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => onNavigateTab('reseller')}
          className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/40 hover:border-purple-400 transition-all flex items-center justify-between text-left group cursor-pointer shadow-lg shadow-purple-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform">
              <Crown className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                {lang === 'bn' ? '💼 রিসেলার প্যানেল' : 'Reseller Panel'}
              </h5>
              <p className="text-[11px] text-slate-400">{lang === 'bn' ? 'পাইকারি রেট ও ইনকাম' : 'Wholesale Rates & Portal'}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => onNavigateTab('appsTutorials')}
          className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/40 hover:border-cyan-400 transition-all flex items-center justify-between text-left group cursor-pointer shadow-lg shadow-cyan-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 group-hover:scale-105 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                {lang === 'bn' ? '📱 অ্যাপস ও ভিডিও গাইড' : 'Apps & Videos'}
              </h5>
              <p className="text-[11px] text-slate-400">{lang === 'bn' ? '৪টি অ্যাপ ও টিউটোরিয়াল' : '4 APKs & Video Tutorials'}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* SECTION: ভিপিএন দিয়ে কী কী করা যায়? (What You Can Do With Soverixnet VPN) */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-cyan-500/30 bg-gradient-to-br from-[#02141a] via-slate-950 to-[#040e1f] shadow-2xl space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ভিপিএন এর ব্যবহার ও সুবিধাসমূহ' : 'Core Capabilities of VPN'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {lang === 'bn' ? 'ভিপিএন দিয়ে আপনি কী কী করতে পারবেন?' : 'What Can You Do With Soverixnet VPN?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === 'bn' 
              ? 'আমাদের ভিপিএন আপনার ইন্টারনেট সংযোগকে সম্পূর্ণ নিরাপদ, দ্রুত এবং রেস্ট্রিকশন-মুক্ত করে তোলে।' 
              : 'Our quantum-safe VPN secures your connection, restores blocked VoIP calls, and accelerates streaming and gaming.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {/* 1. Blocked calling */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                📞
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                {lang === 'bn' ? 'ব্লক থাকা অডিও/ভিডিও কল আনব্লক' : 'Unblock Audio & Video Calls'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'bn' 
                  ? 'সৌদি আরব, দুবাই, ওমান, কাতার ও কুয়েতে WhatsApp, IMO, Messenger, BOTIM ও FaceTime ১০০% আনব্লক করে দেশে পরিবারের সাথে ক্রিস্টাল ক্লিয়ার ৪K ভিডিও কলে কথা বলুন।' 
                  : 'Bypass strict telecom firewalls to make crystal-clear WhatsApp, IMO, FaceTime, and BOTIM audio/video calls without drops.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-emerald-400 font-bold">
              <span>WhatsApp / IMO HD</span>
              <span>১০০% আনব্লক</span>
            </div>
          </div>

          {/* 2. Low Ping Gaming */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                🎮
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                {lang === 'bn' ? 'সুপার লো-পিং গেমিং এক্সিলারেটর' : 'Low Ping Gaming Accelerator'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'bn' 
                  ? 'পাবজি মোবাইল (PUBG), ফ্রিফায়ার (FreeFire) ও মোবাইল লেজেন্ডস (MLBB)-এ ১০–১৮ ms লো-পিং। কোনো ল্যাগ বা প্যাকেট লস ছাড়াই প্রো গেমারদের মতো খেলুন।' 
                  : 'Direct UDP routing providing ultra-stable 10-18ms latency for PUBG Mobile, FreeFire, Mobile Legends, and Warzone.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-cyan-400 font-bold">
              <span>Zero Packet Loss</span>
              <span>১০-১৮ ms Ping</span>
            </div>
          </div>

          {/* 3. Arab & Asian FreeNet */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                🌐
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                {lang === 'bn' ? 'সিম ফ্রি-নেট ও আনলিমিটেড ব্রাউজিং' : 'FreeNet SIM Payloads'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'bn' 
                  ? 'সৌদি STC 5G জিরো ব্যালেন্স, Mobily 60 SAR আনলিমিটেড, Zain, দুবাই du/Etisalat ও মালয়েশিয়া Celcom/Maxis সিমে কোনো ব্যালেন্স বা এমবি ছাড়াই ফুল স্পিডে ইন্টারনেট চালান।' 
                  : 'Tested working SNI bug hosts and payloads bypassing data caps on STC, Mobily, Zain, du, Etisalat, CelcomDigi, and Maxis.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-amber-400 font-bold">
              <span>০ ব্যালেন্স বাইপাস</span>
              <span>ফুল স্পিড 5G</span>
            </div>
          </div>

          {/* 4. Military Encryption & Privacy */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                🛡️
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                {lang === 'bn' ? 'কোয়ান্টাম এনক্রিপশন ও নো-লগ প্রাইভেসি' : 'Quantum-Safe Privacy & No-Logs'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'bn' 
                  ? 'আপনার আসল আইপি ও অবস্থান সম্পূর্ণ লুকিয়ে রাখা হয়। ইন্টারনেট সার্ভিস প্রোভাইডার (ISP) বা সরকার কেউ দেখতে পারবে না আপনি কোন সাইটে ঢুকছেন।' 
                  : 'RAM-only encrypted servers ensuring zero tracking, strict zero-log policy, and military-grade ChaCha20 / AES-256 ciphers.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-purple-400 font-bold">
              <span>RAM-Only Servers</span>
              <span>১০০% নো-লগ</span>
            </div>
          </div>

          {/* 5. 4K Streaming */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-pink-500/50 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                📺
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                {lang === 'bn' ? 'বাফারিং ছাড়া ৪K আল্ট্রা এইচডি স্ট্রিমিং' : 'Zero Buffer 4K Ultra HD Streaming'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'bn' 
                  ? 'ইউটিউব, টিকটক, ফেসবুক ওটিটি এবং বাংলাদেশের লাইভ টিভি চ্যানেলগুলো কোনো প্রকার স্পিড থ্রটলিং ছাড়া ফুল ১০Gbps ব্যান্ডউইথে উপভোগ করুন।' 
                  : 'Unthrottled 10Gbps transit pipelines optimized for YouTube 4K, TikTok, Netflix, and live sports broadcasting.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-pink-400 font-bold">
              <span>10Gbps Uplink</span>
              <span>৪K নো-বাফার</span>
            </div>
          </div>

          {/* 6. Public WiFi Protection */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                📶
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                {lang === 'bn' ? 'পাবলিক ওয়াইফাই ও ব্যাংকিং সিকিউরিটি' : 'Public Wi-Fi & Banking Shield'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'bn' 
                  ? 'এয়ারপোর্ট, শপিং মল বা হোটেলের উন্মুক্ত ওয়াইফাইয়ে আপনার ব্যাংক অ্যাকাউন্ট, পাসওয়ার্ড এবং ব্যক্তিগত চ্যাট হ্যাকারদের নজরদারি থেকে ১০০% সুরক্ষিত রাখে।' 
                  : 'Bulletproof defense against packet sniffers, man-in-the-middle attacks, and rogue hotspots on open hotel and airport Wi-Fi.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-teal-400 font-bold">
              <span>Anti-Sniffing Shield</span>
              <span>ব্যাংকিং সেফ</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: ৩টি সহজ ধাপে কীভাবে ভিপিএন ব্যবহার করবেন? (How to Use VPN in 3 Easy Steps) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
            {lang === 'bn' ? 'টিউটোরিয়াল গাইড' : 'Quick Tutorial'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {lang === 'bn' ? '৩টি সহজ ধাপে কীভাবে আমাদের ভিপিএন ব্যবহার করবেন?' : 'How to Use Soverixnet VPN in 3 Simple Steps'}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'bn' ? 'কোনো জটিল টেকনিক্যাল জ্ঞানের প্রয়োজন নেই, যে কেউ ১ মিনিটে চালু করতে পারবেন।' : 'No complex setup required. Anyone can connect and enjoy in 60 seconds.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-cyan-500/40 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-black text-base flex items-center justify-center font-mono">
                  ১
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300">ধাপ ১ / Step 1</span>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                {lang === 'bn' ? 'অ্যাপস ডাউনলোড করুন' : 'Download the App'}
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {lang === 'bn'
                  ? 'আমাদের অফিসিয়াল ৪টি অ্যাপ (Mohin VIP, Net Solution, AF V2Ray, Jiyam Plus) অথবা প্লে-স্টোর থেকে v2rayNG / WireGuard ডাউনলোড করে নিন।'
                  : 'Download any of our 4 official verified APKs or v2rayNG / WireGuard on your Android, iOS, or Windows device.'}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('appsTutorials')}
              className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-between cursor-pointer"
            >
              <span>{lang === 'bn' ? '📱 অ্যাপস ডাউনলোড পেজে যান' : 'Go to Apps Page'}</span>
              <span>➔</span>
            </button>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-amber-500/40 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black text-base flex items-center justify-center font-mono">
                  ২
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300">ধাপ ২ / Step 2</span>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                {lang === 'bn' ? 'পিন বা ইউজারনেম বসান' : 'Enter PIN / Username'}
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {lang === 'bn'
                  ? 'আমাদের ওয়েবসাইট থেকে কেনা ১ মাস বা ৩ মাসের ভিআইপি পিন কোড অথবা ফ্রি ট্রায়াল ইউজারনেম/পাসওয়ার্ডটি অ্যাপে পেস্ট করুন।'
                  : 'Enter the VIP PIN code or test pass you received from our order form or WhatsApp customer support.'}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('packages')}
              className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center justify-between cursor-pointer"
            >
              <span>{lang === 'bn' ? '🛒 পিন অর্ডার পেজে যান' : 'Order a PIN'}</span>
              <span>➔</span>
            </button>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/40 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-black text-base flex items-center justify-center font-mono">
                  ৩
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300">ধাপ ৩ / Step 3</span>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                {lang === 'bn' ? '১-ক্লিকে কানেক্ট করে চালান' : '1-Click Connect & Enjoy'}
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {lang === 'bn'
                  ? 'অ্যাপের মাঝে বড় কানেক্ট বাটনে চাপ দিন। ২ সেকেন্ডেই কানেক্ট হয়ে যাবে এবং আনলিমিটেড ইন্টারনেট ও এইচডি কলিং উপভোগ করুন!'
                  : 'Press the Connect button. Within 2 seconds you are securely connected to our 10Gbps private network.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>⚡ ১০০% আনলিমিটেড স্পিড</span>
              <span>✓ প্রস্তুত</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Why Choose Soverixnet VPN (কেন আমাদের ভিপিএন ব্যবহার করবেন) */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'কেন সোভারিক্সনেট সেরা?' : 'Why Choose Soverixnet VPN?'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {lang === 'bn' ? 'কেন আমাদের সোভারিক্সনেট ভিপিএন ব্যবহার করবেন?' : 'Why Choose Soverixnet VPN?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            {lang === 'bn' 
              ? 'সৌদি আরব ফ্রি ইন্টারনেট, আল্ট্রা লো-পিং গেমিং, ১০০% নো-লগ প্রাইভেসি এবং ১০Gbps আনলিমিটেড ব্যান্ডউইথ।' 
              : 'Enterprise encryption, ultra low gaming ping, Gulf free internet payloads, and 100% RAM-only zero logs.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(siteSettings.customBenefits || DEFAULT_CUSTOM_BENEFITS).filter((b) => b.isActive !== false).map((b) => {
            const renderCardIcon = () => {
              if (b.imageUrl) {
                return <img src={b.imageUrl} alt={b.titleBn} className="w-full h-full object-cover rounded-xl" />;
              }
              switch (b.iconType) {
                case 'activity': return <Activity className="w-5 h-5 text-emerald-400" />;
                case 'globe': return <Globe className="w-5 h-5 text-cyan-400" />;
                case 'harddrive': return <HardDrive className="w-5 h-5 text-purple-400" />;
                case 'eyeoff': return <EyeOff className="w-5 h-5 text-emerald-400" />;
                case 'shield': return <ShieldCheck className="w-5 h-5 text-amber-400" />;
                case 'lock': return <Lock className="w-5 h-5 text-purple-400" />;
                case 'crown': return <Crown className="w-5 h-5 text-amber-400" />;
                case 'server': return <Server className="w-5 h-5 text-cyan-400" />;
                case 'zap':
                default: return <Zap className="w-5 h-5 text-amber-400" />;
              }
            };

            return (
              <div key={b.id} className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform overflow-hidden">
                    {renderCardIcon()}
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {lang === 'bn' ? b.titleBn : b.titleEn}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {lang === 'bn' ? b.descBn : b.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => onNavigateTab('benefits')}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer shadow-lg"
          >
            <span>{lang === 'bn' ? 'কেন আমাদের ভিপিএন ব্যবহার করবেন বিস্তারিত পড়ুন ➔' : 'Learn More About Why Choose Us ➔'}</span>
          </button>
        </div>
      </section>

      {/* SECTION 5: Multi-Platform Client & Direct 3D Apps Hub */}
      <section id="official-apps-hub" className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-slate-800 bg-slate-950/70 shadow-xl space-y-6">
        <OfficialAppsGrid 
          lang={lang}
          title={lang === 'bn' ? 'অফিসিয়াল মোবাইল অ্যাপস হাব (ডাউনলোড বাটন)' : 'Official Mobile Apps Hub (3D Download Buttons)'}
          subtitle={lang === 'bn' 
            ? '৪টি নির্ভরযোগ্য অফিসিয়াল ভিপিএন অ্যাপ। সরাসরি ৩ডি বাটনে ক্লিক করে আনলিমিটেড ইন্টারনেট চালান।'
            : '4 verified official VPN APKs. Click the 3D download buttons below for immediate high-speed access.'}
        />

        {/* Other OS Badges (PC & iOS) */}
        <div className="pt-6 border-t border-slate-800/80">
          <div className="text-center mb-4">
            <span className="text-xs font-bold text-slate-400">
              💻 {lang === 'bn' ? 'কম্পিউটার ও আইফোনের জন্য ক্লায়েন্ট ডাউনলোড ও কনফিগ' : 'Client Setup for Windows PC & iOS iPhone'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            {/* Windows */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all text-center flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Laptop className="w-6 h-6 text-cyan-400 shrink-0" />
                <div className="text-left">
                  <span className="text-xs font-bold text-white block">Windows PC</span>
                  <span className="text-[10px] text-slate-400">v2rayN & WireGuard</span>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('configs')}
                className="py-1.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/30 cursor-pointer"
              >
                {lang === 'bn' ? 'কনফিগ নিন' : 'Get Config'}
              </button>
            </div>

            {/* iOS iPhone / iPad */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all text-center flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Apple className="w-6 h-6 text-indigo-400 shrink-0" />
                <div className="text-left">
                  <span className="text-xs font-bold text-white block">iOS (iPhone/iPad)</span>
                  <span className="text-[10px] text-slate-400">Shadowrocket & Sing-box</span>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('configs')}
                className="py-1.5 px-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold border border-indigo-500/30 cursor-pointer"
              >
                {lang === 'bn' ? 'কনফিগ নিন' : 'Get Config'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Video Tutorials & Live Step-by-Step Guides */}
      {siteSettings.sectionVisibility?.videoTutorials !== false && (
        <VideoTutorialsSection 
          lang={lang} 
          onNavigateTab={onNavigateTab} 
        />
      )}

      {/* SECTION 7: Live Public Community Reviews & Star Ratings */}
      <CommunityReviewsSection lang={lang} />

      {/* SECTION 8: Frequently Asked Questions (FAQ) Accordion */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/30 mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {lang === 'bn' ? 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {(siteSettings.customFaqs || DEFAULT_CUSTOM_FAQS).filter((f) => f.isActive !== false).map((item, idx) => {
            const isOpen = activeFaqIndex === idx;
            return (
              <div
                key={item.id || idx}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/50 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold text-white">
                    {lang === 'bn' ? item.qBn : item.qEn}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-cyan-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-900 pt-3">
                    {lang === 'bn' ? item.aBn : item.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION: Bottom Promotional Banners (when placement='bottom') */}
      {siteSettings.sectionVisibility?.bannersSlider !== false && (
        <DynamicHeroBanners 
          banners={siteSettings.banners || []} 
          lang={lang} 
          onNavigateTab={onNavigateTab}
          placement="bottom" 
        />
      )}

      {/* SECTION 9: WhatsApp Community Call-to-Action */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-emerald-950/40 border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-1.99-.46-1.657-.683-2.73-2.366-2.812-2.476-.083-.11-1.01-1.348-1.01-2.572 0-1.223.636-1.824.862-2.073.226-.249.493-.311.658-.311.164 0 .328.002.472.01.153.007.358-.058.56.427.207.499.704 1.722.766 1.847.062.125.103.271.021.434-.083.164-.124.266-.247.41-.124.144-.261.322-.373.432-.124.123-.254.256-.11.503.144.247.641 1.057 1.376 1.713.946.843 1.744 1.104 1.991 1.228.247.124.391.103.535-.062.145-.165.618-.719.783-.967.165-.247.33-.206.556-.123.226.082 1.436.677 1.683.801.247.124.412.185.473.288.062.103.062.597-.082 1.002zM12 2C6.477 2 2 6.477 2 12c0 1.891.528 3.659 1.442 5.174L2 22l4.981-1.306C8.441 21.545 10.16 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              {lang === 'bn' 
                ? (siteSettings.whatsappCtaContent?.titleBn || 'যুক্ত হোন অফিসিয়াল WhatsApp চ্যানেলে: Soverixnet Internet unlimited Vpn') 
                : (siteSettings.whatsappCtaContent?.titleEn || 'Join Our Official WhatsApp Channel: Soverixnet Internet unlimited Vpn')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'bn' 
                ? (siteSettings.whatsappCtaContent?.subtitleBn || 'প্রতিদিনের ফ্রি ইন্টারনেট ট্রিক্স, নতুন নোড আপডেট ও এক্সক্লুসিভ অফার পান সবার আগে।') 
                : (siteSettings.whatsappCtaContent?.subtitleEn || 'Get daily free internet configs, new server updates, and priority customer support.')}
            </p>
          </div>
        </div>

        <a
          href={siteSettings.whatsappCtaContent?.channelUrl || CONTACT_CONFIG.whatsappChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all shrink-0 cursor-pointer transform hover:scale-105"
        >
          <span>
            {lang === 'bn' 
              ? (siteSettings.whatsappCtaContent?.buttonTextBn || 'WhatsApp চ্যানেলে জয়েন করুন ➔') 
              : (siteSettings.whatsappCtaContent?.buttonTextEn || 'Join WhatsApp Channel ➔')}
          </span>
        </a>
      </section>

      {/* Protocol Comparison & Architecture Matrix Modal */}
      <ProtocolComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        lang={lang}
        activeProtocol={activeProtocol}
        onSelectProtocol={onSelectProtocol}
      />

    </div>
  );
};
