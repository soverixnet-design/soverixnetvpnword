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
import { CONTACT_CONFIG } from '../data/contact';
import { ProtocolTooltip, ProtocolComparisonModal } from './ProtocolTooltip';
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
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  const [copiedPayload, setCopiedPayload] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState<'all' | 'asia_me' | 'europe_us' | 'free'>('all');

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
            <span>{lang === 'bn' ? 'মিলিটারী-গ্রেড পোস্ট-কোয়ান্টাম সাইবার শিল্ড ও নো-লগ ভিপিএন নেটওয়ার্ক' : 'Military-Grade Post-Quantum Cyber Shield & Zero-Log VPN'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            {lang === 'bn' ? (
              <>
                সীমাহীন স্বাধীনতা ও সুরক্ষায় বিশ্বের দ্রুততম ভিপিএন —{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  Soverixnet
                </span>
              </>
            ) : (
              <>
                Next-Gen Quantum Cyber Shield & Global{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  Free-Net Gateway
                </span>
              </>
            )}
          </h1>

          <p className="mt-4 text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl leading-relaxed">
            {lang === 'bn' 
              ? '১০ জিবিপিএস ব্যান্ডউইথ, র‍্যাম-অনলি নো-লগ অবকাঠামো, সৌদি আরব ও মধ্যপ্রাচ্যের (STC, Mobily, Zain) আল্ট্রা-স্পিড ফ্রি-নেট পেলোড এবং পাবজি/ফ্রিফায়ার গেমারদের জন্য ৮ms আল্ট্রা-লো পিং BDIX এক্সিলারেশন।' 
              : 'Ultra-fast 10Gbps unmetered bandwidth, RAM-only diskless zero-log infrastructure, Gulf SIM FreeNet SNI payloads (STC, Mobily, Zain), and 8ms low-ping gaming tunnels.'}
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
              <span>{lang === 'bn' ? '💬 হোয়াটসঅ্যাপে ভিপিএন নিন (WhatsApp Order)' : '💬 Order VPN on WhatsApp'}</span>
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
                ? 'এটি Soverixnet VPN এর শোকেস ও বিজ্ঞাপন ওয়েবসাইট। কোনো ঝামেলা ছাড়াই সরাসরি আমাদের হোয়াটসঅ্যাপে মেসেজ দিন — আমরা আপনার মোবাইল (Android / iPhone) বা কম্পিউটারের জন্য প্রিমিয়াম ভিপিএন অ্যাপ, ইউজার আইডি এবং হাই-স্পিড কনফিগ ফাইল প্রদান করব এবং নিজে বুঝিয়ে দেব।'
                : 'Welcome to Soverixnet VPN official showcase. For personal or business VPN configs, contact our WhatsApp directly. We deliver ready-to-use v2rayNG, WireGuard & OpenVPN apps and configs instantly.'}
            </p>
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
                    ⚡ 24/7 Live Support & Instant Delivery
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {lang === 'bn' ? 'হোয়াটসঅ্যাপে ভিপিএন অর্ডার করুন' : 'Order VPN via WhatsApp Now'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  {lang === 'bn'
                    ? 'মেসেজ দেওয়ার ২ মিনিটের মধ্যে আপনি টেস্ট বা পেইড ভিপিএন লিঙ্ক পেয়ে যাবেন।'
                    : 'Get your personal high-speed VPN link & configuration within 2 minutes of contacting us.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
              <a
                href={CONTACT_CONFIG.getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/30 transition-all cursor-pointer transform hover:scale-105"
              >
                <svg className="w-5 h-5 fill-current text-black" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-1.99-.46-1.657-.683-2.73-2.366-2.812-2.476-.083-.11-1.01-1.348-1.01-2.572 0-1.223.636-1.824.862-2.073.226-.249.493-.311.658-.311.164 0 .328.002.472.01.153.007.358-.058.56.427.207.499.704 1.722.766 1.847.062.125.103.271.021.434-.083.164-.124.266-.247.41-.124.144-.261.322-.373.432-.124.123-.254.256-.11.503.144.247.641 1.057 1.376 1.713.946.843 1.744 1.104 1.991 1.228.247.124.391.103.535-.062.145-.165.618-.719.783-.967.165-.247.33-.206.556-.123.226.082 1.436.677 1.683.801.247.124.412.185.473.288.062.103.062.597-.082 1.002zM12 2C6.477 2 2 6.477 2 12c0 1.891.528 3.659 1.442 5.174L2 22l4.981-1.306C8.441 21.545 10.16 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
                <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপে চ্যাট করুন ➔' : 'Chat on WhatsApp ➔'}</span>
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

          {/* Supported Apps & Platforms + Payment Methods Bar */}
          <div className="space-y-4 pt-6 border-t border-slate-800/80">
            {/* Featured Official Android Apps (User Provided Direct Download Links) */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/40 border border-emerald-500/40 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{lang === 'bn' ? 'অফিসিয়াল অ্যান্ডয়েড অ্যাপস' : 'Official Android APKs'}</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-white">
                    {lang === 'bn' ? 'সরাসরি অ্যাপস ডাউনলোড করুন (যেগুলোতে সব দেশে ভিপিএন চলবে)' : 'Download Official VPN Apps (Works in All Countries)'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {lang === 'bn' 
                      ? 'নিচের অ্যাপস দুটি ইন্সটল করে সরাসরি আমাদের দেওয়া কনফিগ ফাইল বা লিংক দিয়ে এক ক্লিকে কানেক্ট করুন।' 
                      : 'Install these dedicated apps and import your Soverixnet VPN config with one tap.'}
                  </p>
                </div>

                <a
                  href={CONTACT_CONFIG.whatsappChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-all"
                >
                  <span>📢</span>
                  <span>{lang === 'bn' ? 'চ্যানেলে নতুন অ্যাপ নিন' : 'Get Configs in Channel'}</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* App 1: AF V2Ray APK */}
                <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/40 hover:border-cyan-400 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-cyan-400 font-mono">
                        {CONTACT_CONFIG.apps.afV2Ray.name}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {lang === 'bn' ? CONTACT_CONFIG.apps.afV2Ray.badgeBn : CONTACT_CONFIG.apps.afV2Ray.badge}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white mt-1">
                      {lang === 'bn' ? CONTACT_CONFIG.apps.afV2Ray.nameBn : CONTACT_CONFIG.apps.afV2Ray.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {lang === 'bn' ? CONTACT_CONFIG.apps.afV2Ray.descBn : CONTACT_CONFIG.apps.afV2Ray.descEn}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-900 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">APK File • v1.0</span>
                    <a
                      href={CONTACT_CONFIG.apps.afV2Ray.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'APK ডাউনলোড ➔' : 'Download APK ➔'}</span>
                    </a>
                  </div>
                </div>

                {/* App 2: Jiyam Plus VPN APK */}
                <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/40 hover:border-emerald-400 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-emerald-400 font-mono">
                        {CONTACT_CONFIG.apps.jiyamPlus.name}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {lang === 'bn' ? CONTACT_CONFIG.apps.jiyamPlus.badgeBn : CONTACT_CONFIG.apps.jiyamPlus.badge}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white mt-1">
                      {lang === 'bn' ? CONTACT_CONFIG.apps.jiyamPlus.nameBn : CONTACT_CONFIG.apps.jiyamPlus.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {lang === 'bn' ? CONTACT_CONFIG.apps.jiyamPlus.descBn : CONTACT_CONFIG.apps.jiyamPlus.descEn}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-900 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">Android App • Fast</span>
                    <a
                      href={CONTACT_CONFIG.apps.jiyamPlus.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'APK ডাউনলোড ➔' : 'Download APK ➔'}</span>
                    </a>
                  </div>
                </div>
              </div>
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



      {/* Official WhatsApp Channel Join Banner */}
      <div className="animate-fade-in-up delay-350 glass-panel rounded-3xl p-5 sm:p-6 border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#030712] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 border border-emerald-300/30 shrink-0 transform group-hover:scale-105 transition-transform">
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-1.99-.46-1.657-.683-2.73-2.366-2.812-2.476-.083-.11-1.01-1.348-1.01-2.572 0-1.223.636-1.824.862-2.073.226-.249.493-.311.658-.311.164 0 .328.002.472.01.153.007.358-.058.56.427.207.499.704 1.722.766 1.847.062.125.103.271.021.434-.083.164-.124.266-.247.41-.124.144-.261.322-.373.432-.124.123-.254.256-.11.503.144.247.641 1.057 1.376 1.713.946.843 1.744 1.104 1.991 1.228.247.124.391.103.535-.062.145-.165.618-.719.783-.967.165-.247.33-.206.556-.123.226.082 1.436.677 1.683.801.247.124.412.185.473.288.062.103.062.597-.082 1.002zM12 2C6.477 2 2 6.477 2 12c0 1.891.528 3.659 1.442 5.174L2 22l4.981-1.306C8.441 21.545 10.16 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {lang === 'bn' ? 'অফিসিয়াল WhatsApp চ্যানেল' : 'Official WhatsApp Channel'}
                </span>
                <span className="text-[10px] text-emerald-300 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Free Configs
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-white mt-1 group-hover:text-emerald-300 transition-colors">
                Soverixnet Internet unlimited Vpn
              </h4>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                {lang === 'bn' 
                  ? 'ফ্রি ভিপিএন ট্রিক্স, হাই-স্পিড কনফিগ ফাইল ও সকল নতুন আপডেট পেতে আমাদের অফিসিয়াল Soverixnet Internet unlimited Vpn চ্যানেলে যুক্ত থাকুন।' 
                  : 'Follow the Soverixnet Internet unlimited Vpn channel on WhatsApp for free high-speed VPN configs, payload tricks & daily server updates.'}
              </p>
            </div>
          </div>

          <a
            href={CONTACT_CONFIG.whatsappChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/25 shrink-0 transform group-hover:scale-105"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-1.99-.46-1.657-.683-2.73-2.366-2.812-2.476-.083-.11-1.01-1.348-1.01-2.572 0-1.223.636-1.824.862-2.073.226-.249.493-.311.658-.311.164 0 .328.002.472.01.153.007.358-.058.56.427.207.499.704 1.722.766 1.847.062.125.103.271.021.434-.083.164-.124.266-.247.41-.124.144-.261.322-.373.432-.124.123-.254.256-.11.503.144.247.641 1.057 1.376 1.713.946.843 1.744 1.104 1.991 1.228.247.124.391.103.535-.062.145-.165.618-.719.783-.967.165-.247.33-.206.556-.123.226.082 1.436.677 1.683.801.247.124.412.185.473.288.062.103.062.597-.082 1.002zM12 2C6.477 2 2 6.477 2 12c0 1.891.528 3.659 1.442 5.174L2 22l4.981-1.306C8.441 21.545 10.16 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
            </svg>
            <span>{lang === 'bn' ? 'WhatsApp চ্যানেলে যুক্ত হোন ➔' : 'Join WhatsApp Channel ➔'}</span>
          </a>
        </div>
      </div>

      {/* Fast Navigation Quick Links with Entry Stagger */}
      <div className="animate-fade-in-up delay-350 grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <button
          onClick={() => onNavigateTab('vipPlans')}
          className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 hover:border-amber-400 transition-all flex items-center justify-between text-left group cursor-pointer shadow-lg shadow-amber-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                {lang === 'bn' ? 'প্যাকেজ ও মূল্য' : 'VIP Plans & Pricing'}
              </h5>
              <p className="text-[11px] text-slate-400">{lang === 'bn' ? 'বিকাশ/নগদ/মাদা দিয়ে নিন' : 'bKash, Nagad, Mada activation'}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => onNavigateTab('arabSim')}
          className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 hover:border-emerald-400 transition-all flex items-center justify-between text-left group cursor-pointer shadow-lg shadow-emerald-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                {lang === 'bn' ? '🇸🇦 আরব ফ্রি-নেট' : 'Arab SIM FreeNet'}
              </h5>
              <p className="text-[11px] text-slate-400">{lang === 'bn' ? 'STC, Mobily, Zain বাগ' : 'Saudi & Gulf FreeNet setups'}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => onNavigateTab('configs')}
          className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/40 hover:border-cyan-400 transition-all flex items-center justify-between text-left group cursor-pointer shadow-lg shadow-cyan-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                {lang === 'bn' ? 'ডাউনলোড ও কনফিগ' : 'Downloads & Configs'}
              </h5>
              <p className="text-[11px] text-slate-400">{lang === 'bn' ? 'APK ও QR কোড স্ক্যান' : 'Official APK & QR scanner'}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => onNavigateTab('servers')}
          className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/40 hover:border-purple-400 transition-all flex items-center justify-between text-left group cursor-pointer shadow-lg shadow-purple-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                {lang === 'bn' ? 'সার্ভার লিস্ট ও পিং' : 'Servers & Ping'}
              </h5>
              <p className="text-[11px] text-slate-400">{lang === 'bn' ? '৫০+ সুপারফাস্ট নোড' : '50+ Ultra-low latency nodes'}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* SECTION 1: Arab SIM FreeNet & Gulf SNI Showcase */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-gradient-to-br from-[#021814] via-[#030d11] to-[#041a1a] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-500/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
              <span>🇸🇦 🇦🇪 🇶🇦</span>
              <span>{lang === 'bn' ? 'সৌদি আরব ও মধ্যপ্রাচ্য স্পেশাল ফ্রি-নেট' : 'Saudi Arabia & Gulf Free-Net SNI'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {lang === 'bn' ? 'আরব সিম ফ্রি-নেট ও আনলিমিটেড SNI পেলোড' : 'Arab SIM Free-Net & Unlimited SNI Payloads'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {lang === 'bn' 
                ? 'সৌদি আরব (STC, Mobily, Zain), সংযুক্ত আরব আমিরাত ও কাতারে ০ ব্যালেন্সে আল্ট্রা-স্পিড ফ্রি ইন্টারনেটের টেস্টেড পেলোড।' 
                : 'Zero-balance tested FreeNet configurations and SNI payloads for STC, Mobily, Zain, Etisalat & Ooredoo.'}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('arabSim')}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 shrink-0 cursor-pointer"
          >
            <span>{lang === 'bn' ? '🇸🇦 সকল পেলোড ও কনফিগ দেখুন ➔' : '🇸🇦 Open Arab SIM Customizer ➔'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* STC KSA */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-400">STC KSA (সৌদি আরব)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">100% Tested</span>
              </div>
              <p className="text-xs text-white font-bold mt-2">Zero-Balance High Speed</p>
              <div className="mt-2 p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                <span className="truncate">freenet.stc.com.sa</span>
                <button
                  onClick={() => handleCopyPayload('freenet.stc.com.sa')}
                  className="ml-2 text-slate-400 hover:text-emerald-300 cursor-pointer"
                  title="Copy SNI"
                >
                  {copiedPayload === 'freenet.stc.com.sa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
              <span>Port: 443 (SSL/TLS)</span>
              <span className="text-emerald-400 font-bold">~85 Mbps</span>
            </div>
          </div>

          {/* Mobily KSA */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 hover:border-cyan-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-cyan-400">Mobily KSA (সৌদি আরব)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">Active</span>
              </div>
              <p className="text-xs text-white font-bold mt-2">Social & Browsing SNI</p>
              <div className="mt-2 p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                <span className="truncate">free.mobily.com.sa</span>
                <button
                  onClick={() => handleCopyPayload('free.mobily.com.sa')}
                  className="ml-2 text-slate-400 hover:text-cyan-300 cursor-pointer"
                  title="Copy SNI"
                >
                  {copiedPayload === 'free.mobily.com.sa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
              <span>Port: 80 / 443</span>
              <span className="text-cyan-400 font-bold">~95 Mbps</span>
            </div>
          </div>

          {/* Zain KSA */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 hover:border-purple-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-purple-400">Zain KSA (সৌদি আরব)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">Turbo</span>
              </div>
              <p className="text-xs text-white font-bold mt-2">Streaming Bypass Tunnel</p>
              <div className="mt-2 p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                <span className="truncate">fast.zain.sa</span>
                <button
                  onClick={() => handleCopyPayload('fast.zain.sa')}
                  className="ml-2 text-slate-400 hover:text-purple-300 cursor-pointer"
                  title="Copy SNI"
                >
                  {copiedPayload === 'fast.zain.sa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
              <span>Port: 443 (V2Ray)</span>
              <span className="text-purple-400 font-bold">~75 Mbps</span>
            </div>
          </div>

          {/* UAE & Qatar */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-400">UAE / Qatar (Etisalat/Ooredoo)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Call Unblock</span>
              </div>
              <p className="text-xs text-white font-bold mt-2">WhatsApp / IMO Call Shield</p>
              <div className="mt-2 p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                <span className="truncate">chat.etisalat.ae</span>
                <button
                  onClick={() => handleCopyPayload('chat.etisalat.ae')}
                  className="ml-2 text-slate-400 hover:text-amber-300 cursor-pointer"
                  title="Copy SNI"
                >
                  {copiedPayload === 'chat.etisalat.ae' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
              <span>Port: 443 (WireGuard)</span>
              <span className="text-amber-400 font-bold">HD Voice</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Global Countries & Server Locations (Prominent Country Names & 1-Click Connect) */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-slate-950 to-[#02050e] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/30 mb-2">
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'গ্লোবাল কান্ট্রি নেটওয়ার্ক' : 'Global Country Network'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {lang === 'bn' ? 'বিশ্বজুড়ে আমাদের দেশ ও সার্ভার লোকেশনসমূহ' : 'Global Countries & Server Locations'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {lang === 'bn' 
                ? 'বাংলাদেশ, সৌদি আরব, আরব আমিরাত, সিঙ্গাপুর, আমেরিকা সহ ৫০+ দেশের ডেডিকেটেড নোড।' 
                : 'Ultra low-latency dedicated nodes across Bangladesh, Saudi Arabia, UAE, Singapore, USA & 50+ countries.'}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('servers')}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <span>{lang === 'bn' ? 'সকল ৫০+ দেশ ও সার্ভার দেখুন ➔' : 'View All 50+ Countries & Servers ➔'}</span>
          </button>
        </div>

        {/* Country categories filter tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          {[
            { id: 'all', label: lang === 'bn' ? 'সব দেশ (All Countries)' : 'All Countries' },
            { id: 'asia_me', label: lang === 'bn' ? '🇧🇩 🇸🇦 এশিয়া ও মধ্যপ্রাচ্য' : 'Asia & Middle East' },
            { id: 'europe_us', label: lang === 'bn' ? '🇺🇸 🇪🇺 ইউরোপ ও আমেরিকা' : 'Europe & Americas' },
            { id: 'free', label: lang === 'bn' ? '⚡ ফ্রি ট্রায়াল নোডস' : 'Free Trial Nodes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCountryFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                countryFilter === tab.id
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Country Server Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {SERVERS_DATA.filter((s) => {
            if (countryFilter === 'free') return s.isFreeNet || !s.isVip;
            if (countryFilter === 'asia_me') return s.region === 'asia' || s.region === 'middle_east';
            if (countryFilter === 'europe_us') return s.region === 'europe' || s.region === 'north_america';
            return true;
          }).slice(0, 9).map((server) => {
            const isThisSelected = selectedServer.id === server.id;
            return (
              <div
                key={server.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isThisSelected 
                    ? 'bg-cyan-950/30 border-cyan-400 shadow-lg shadow-cyan-500/10' 
                    : 'bg-slate-950/70 border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl leading-none">{server.flag}</span>
                      <div>
                        <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider block">
                          {lang === 'bn' ? 'দেশ' : 'Country'}
                        </span>
                        <h4 className="text-base font-black text-white">
                          {lang === 'bn' ? server.countryBn : server.country}
                        </h4>
                        <span className="text-xs text-slate-400 block mt-0.5">{server.city}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                        {server.ping}ms
                      </span>
                      {server.isFreeNet && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ফ্রি-নেট
                        </span>
                      )}
                      {server.isVip && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          VIP
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{lang === 'bn' ? 'সার্ভার লোড:' : 'Server Load:'}</span>
                    <span className="text-cyan-300 font-mono font-bold">{server.load}%</span>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${server.load > 70 ? 'bg-amber-400' : 'bg-cyan-400'}`} 
                      style={{ width: `${server.load}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">{server.protocols?.[0] || 'WireGuard'} • 10Gbps</span>
                  <button
                    onClick={() => {
                      if (onSelectServer) {
                        onSelectServer(server);
                      }
                      if (status === 'disconnected') {
                        onToggleConnect();
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isThisSelected
                        ? 'bg-cyan-500 text-black shadow-md'
                        : 'bg-slate-900 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700'
                    }`}
                  >
                    {isThisSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'কানেক্টেড' : 'Selected'}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'সংযোগ করুন' : 'Connect'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
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
          {/* Reason 1: Arab FreeNet */}
          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-all group">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              {lang === 'bn' ? '১. সৌদি ও আরব সিমে ফ্রি নেট' : '1. Gulf Free Internet'}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {lang === 'bn' 
                ? 'সৌদি STC, Mobily, Zain এবং UAE-তে ০ ব্যালেন্সে আনলিমিটেড ফ্রি ইন্টারনেট ব্রাউজিং।' 
                : 'Zero-balance free internet payloads for KSA STC, Mobily, Zain & UAE Etisalat networks.'}
            </p>
          </div>

          {/* Reason 2: Low-Ping Gaming */}
          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              {lang === 'bn' ? '২. ৮ms আল্ট্রা লো-পিং গেমিং' : '2. Ultra Low-Ping Gaming'}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {lang === 'bn' 
                ? 'পাবজি (PUBG) ও ফ্রি ফায়ারে জিরো ল্যাগ। BDIX ও সিঙ্গাপুর সরাসরি অপটিক্যাল নোড।' 
                : 'Dedicated BDIX and Singapore low-jitter nodes for Free Fire, PUBG & competitive esports.'}
            </p>
          </div>

          {/* Reason 3: Unblock Calling Apps */}
          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all group">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
              {lang === 'bn' ? '৩. কলিং অ্যাপস আনব্লক' : '3. Unblock Calling Apps'}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {lang === 'bn' 
                ? 'দুবাই ও মধ্যপ্রাচ্যে WhatsApp কল, IMO, BOTIM ও FaceTime ১০০% ক্লিয়ার কাজ করে।' 
                : 'Unblock WhatsApp voice/video calls, BOTIM, IMO, and FaceTime in UAE & Gulf regions.'}
            </p>
          </div>

          {/* Reason 4: Zero Logs */}
          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/40 transition-all group">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              {lang === 'bn' ? '৪. ১০০% র‍্যাম-অনলি নো-লগ' : '4. Diskless Zero Logs'}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {lang === 'bn' 
                ? 'হার্ডড্রাইভে কোনো ডাটা লেখা হয় না। রিবুট করলেই মেমোরির সব তথ্য চিরতরে মুছে যায়।' 
                : 'Server OS runs in volatile RAM; zero logs are ever saved, stored, or inspected.'}
            </p>
          </div>

          {/* Reason 5: 10Gbps Speed */}
          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all group">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
              {lang === 'bn' ? '৫. ১০ Gbps আল্ট্রা স্পিড' : '5. 10 Gbps Unmetered'}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {lang === 'bn' 
                ? 'আইএসপি থ্রটলিং পুরোপুরি বাইপাস করে 4K স্ট্রিমিং ও সুপারফাস্ট ডাউনলোড।' 
                : 'Bypass throttling completely with high-speed fiber backbones and zero bandwidth limits.'}
            </p>
          </div>

          {/* Reason 6: CleanNet AdBlock */}
          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              {lang === 'bn' ? '৬. ক্লিন-নেট অ্যাড ব্লকার' : '6. CleanNet AdBlock'}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {lang === 'bn' 
                ? 'বিজ্ঞাপন ও ক্ষতিকর ট্র্যাকার ব্লক করে পেজ স্পিড বাড়ায় ও ৪০% ডাটা সাশ্রয় করে।' 
                : 'DNS filters strip ads, malicious domains, and battery-draining scripts.'}
            </p>
          </div>

          {/* Reason 7: Local Easy Payment */}
          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-all group">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              {lang === 'bn' ? '৭. বিকাশ, নগদ ও STC Pay' : '7. bKash, Nagad & STC Pay'}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {lang === 'bn' 
                ? 'আন্তর্জাতিক কার্ড ছাড়াই দেশীয় টাকায় ও রিয়ালে মুহূর্তে প্যাকেজ অ্যাক্টিভেশন।' 
                : 'Instant activation via bKash, Nagad, Rocket, Mada, STC Pay, and Crypto.'}
            </p>
          </div>

          {/* Reason 8: Post-Quantum Kyber-1024 */}
          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/40 transition-all group">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              {lang === 'bn' ? '৮. কোয়ান্টাম Kyber-1024' : '8. Post-Quantum Kyber'}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {lang === 'bn' 
                ? 'WireGuard, V2Ray VLESS Reality এবং কোয়ান্টাম সাইফার দিয়ে অভেদ্য নিরাপত্তা।' 
                : 'Next-generation quantum-resistant encryption that protects all sensitive data.'}
            </p>
          </div>
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

      {/* SECTION 4: Live IP & Privacy Diagnostic Tool */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-cyan-500/20 bg-gradient-to-r from-slate-950 via-[#030914] to-slate-950 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold">
              <Activity className="w-3 h-3" />
              <span>IP & PRIVACY AUDIT</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {lang === 'bn' ? 'লাইভ আইপি ও প্রাইভেসি শিল্ড স্ট্যাটাস' : 'Live IP & Privacy Diagnostic Shield'}
            </h3>
            <p className="text-xs text-slate-400 max-w-lg">
              {lang === 'bn' 
                ? 'আপনার বর্তমান ব্রাউজিং ট্র্যাফিক সোভারিক্সনেট এনক্রিপশন টানেলের ভেতর দিয়ে পরিচালিত হচ্ছে কিনা যাচাই করুন।' 
                : 'Verify that your DNS queries, WebRTC packets, and physical ISP location are completely masked.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center min-w-[130px]">
              <span className="text-[10px] text-slate-400 block font-mono">{lang === 'bn' ? 'ভার্চুয়াল আইপি' : 'Virtual IP'}</span>
              <span className="text-xs font-extrabold text-cyan-300 font-mono">
                {isConnected ? selectedServer.ip : '103.144.12.98'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center min-w-[130px]">
              <span className="text-[10px] text-slate-400 block font-mono">{lang === 'bn' ? 'টানেল স্ট্যাটাস' : 'Tunnel'}</span>
              <span className={`text-xs font-extrabold ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isConnected ? 'PROTECTED' : 'EXPOSED'}
              </span>
            </div>

            <button
              onClick={() => onNavigateTab('vipPlans')}
              className="px-4 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
            >
              <Crown className="w-4 h-4" />
              <span>{lang === 'bn' ? 'ভিআইপি মেম্বারশিপ নিন ➔' : 'Get VIP Protection ➔'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5: Dedicated VIP Packages & Pricing Hub (প্যাকেজগুলো আলাদা করা এবং পুনরাবৃত্তি দূর করা) */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-amber-500/20 bg-gradient-to-br from-[#120e03] via-slate-950 to-[#02050f] shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Crown className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'আলাদা প্যাকেজ ও মূল্যতালিকা হাব' : 'VIP Packages & Pricing Hub'}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white">
              {lang === 'bn' ? 'সাশ্রয়ী মূল্যে প্রিমিয়াম ভিপিএন প্যাকেজসমূহ' : 'Affordable Premium VIP Packages'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              {lang === 'bn' 
                ? '১ মাস, ৩ মাস, ১ বছর এবং লাইফটাইম প্যাকেজগুলো বিস্তারিত দেখতে এবং বিকাশ, নগদ, রকেট, সৌদি মাদা বা ক্রিপ্টো দিয়ে নিতে আমাদের আলাদা প্যাকেজ পেইজ ভিজিট করুন।' 
                : 'Explore our 1-Month, 3-Month, 1-Year, and Lifetime VIP passes. Instant activation via bKash, Nagad, Mada, and Cards.'}
            </p>

            {/* Price Preview Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
                {lang === 'bn' ? '১ মাস: ৳১৫০' : '1 Month: $1.49'}
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300">
                {lang === 'bn' ? '৩ মাস: ৳৩৯৯' : '3 Months: $3.89'}
              </span>
              <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-300">
                {lang === 'bn' ? '১ বছর: ৳১,৯৫০' : '1 Year: $19.99'}
              </span>
              <span className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300">
                {lang === 'bn' ? 'লাইফটাইম: ৳২,৪৯৯' : 'Lifetime: $23.99'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('vipPlans')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/20 cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>{lang === 'bn' ? 'সকল প্যাকেজ ও মূল্যতালিকা দেখুন ➔' : 'View All VIP Packages & Pricing ➔'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 6: Multi-Platform Client Downloads */}
      <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-slate-800 bg-slate-950/70 shadow-xl">
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/30 mb-2">
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'মাল্টি-প্ল্যাটফর্ম ক্লায়েন্ট' : 'Client Downloads'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {lang === 'bn' ? 'আপনার প্রিয় ডিভাইসে সোভারিক্সনেট ব্যবহার করুন' : 'Download for All Your Devices'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'bn' 
              ? 'উইন্ডোজ, অ্যান্ড্রয়েড, ম্যাক, আইওএস অথবা ওপেনভিপিএন/ওয়্যারগার্ড কনফিগ ডাউনলোড করুন।' 
              : 'Compatible with Windows, Android APK, iOS, macOS, Linux, and OpenVPN/WireGuard profiles.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Featured 1: AF V2Ray APK */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-cyan-950/50 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 transition-all text-left flex flex-col justify-between shadow-lg shadow-cyan-500/10">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-black">
                  {CONTACT_CONFIG.apps.afV2Ray.badge}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">v1.0 APK</span>
              </div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>AF V2Ray VPN</span>
              </h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {lang === 'bn' 
                  ? 'সব দেশে চলবে। V2Ray, VLESS Reality ও Trojan কানেকশন সাপোর্ট।' 
                  : 'Works in all countries worldwide. Fast V2Ray, VLESS Reality & Trojan.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800">
              <a
                href={CONTACT_CONFIG.apps.afV2Ray.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'AF V2Ray APK ডাউনলোড' : 'Download AF V2Ray APK'}</span>
              </a>
            </div>
          </div>

          {/* Featured 2: Jiyam Plus VPN APK */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/50 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 transition-all text-left flex flex-col justify-between shadow-lg shadow-emerald-500/10">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-black">
                  {CONTACT_CONFIG.apps.jiyamPlus.badge}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Gulf FreeNet</span>
              </div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Jiyam Plus VPN</span>
              </h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {lang === 'bn' 
                  ? 'সৌদি আরব (STC, Mobily, Zain), দুবাই ও বাংলাদেশে সুপারফাস্ট ফ্রি ইন্টারনেট।' 
                  : 'Special for Gulf SIM FreeNet (STC, Mobily, Zain) & 0-balance high-speed.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800">
              <a
                href={CONTACT_CONFIG.apps.jiyamPlus.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'Jiyam Plus APK ডাউনলোড' : 'Download Jiyam Plus APK'}</span>
              </a>
            </div>
          </div>

          {/* Windows */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all text-center flex flex-col items-center justify-between">
            <Laptop className="w-7 h-7 text-cyan-400 mb-2" />
            <span className="text-xs font-bold text-white block">Windows PC</span>
            <span className="text-[10px] text-slate-400 mb-3">v2rayN & WireGuard</span>
            <button
              onClick={() => onNavigateTab('configs')}
              className="w-full py-1.5 px-2 rounded-lg bg-cyan-500/20 text-cyan-300 text-[11px] font-bold border border-cyan-500/30 cursor-pointer"
            >
              {lang === 'bn' ? 'কনফিগ ও সেটআপ' : 'Get Config'}
            </button>
          </div>

          {/* iOS iPhone / iPad */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all text-center flex flex-col items-center justify-between">
            <Apple className="w-7 h-7 text-indigo-400 mb-2" />
            <span className="text-xs font-bold text-white block">iOS (iPhone/iPad)</span>
            <span className="text-[10px] text-slate-400 mb-3">Shadowrocket & Sing-box</span>
            <button
              onClick={() => onNavigateTab('configs')}
              className="w-full py-1.5 px-2 rounded-lg bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30 cursor-pointer"
            >
              {lang === 'bn' ? 'কনফিগ ও সেটআপ' : 'Get Config'}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 7: Verified Customer Testimonials & Reviews */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30 mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{lang === 'bn' ? 'ব্যবহারকারীদের মতামত' : 'Real Testimonials'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {lang === 'bn' ? 'সোভারিক্সনেট ইউজারদের বাস্তব অভিজ্ঞতা' : 'What Our Users Say'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "{lang === 'bn' 
                  ? 'পাবজি খেলার জন্য বেস্ট ভিপিএন। ঢাকা BDIX নোডে পিং মাত্র ৮ms পাই, কোনো ফ্রেমড্রপ বা ল্যাগ হয় না!' 
                  : 'The best VPN for PUBG Mobile. I get 8ms ping on the Dhaka BDIX node with zero packet drops!'}"
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">তানভীর আহমেদ</span>
                <span className="text-[10px] text-slate-400">ঢাকা, বাংলাদেশ (PUBG Pro)</span>
              </div>
              <span className="text-lg">🇧🇩</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-950/80 border border-emerald-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "{lang === 'bn' 
                  ? 'সৌদি আরবে STC সিমে কোনো ব্যালেন্স ছাড়াই চমৎকার স্পিডে ইউটিউব এবং ফেসবুক চালাতে পারছি।' 
                  : 'Works smoothly in Saudi Arabia on STC SIM without balance. YouTube and HD calls work effortlessly!'}"
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">মোহাম্মদ রফিক</span>
                <span className="text-[10px] text-slate-400">রিয়াদ, কেএসএ (STC FreeNet)</span>
              </div>
              <span className="text-lg">🇸🇦</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "{lang === 'bn' 
                  ? 'দুবাই থেকে দেশে হোয়াটসঅ্যাপ ও ইমোতে পরিষ্কার ক্রিস্টাল ক্লিয়ার ভিডিও কল করা যায়।' 
                  : 'Allows crystal-clear WhatsApp and IMO video calls from Dubai without any voice delay!'}"
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">আশরাফুল ইসলাম</span>
                <span className="text-[10px] text-slate-400">দুবাই, ইউএই (VoIP User)</span>
              </div>
              <span className="text-lg">🇦🇪</span>
            </div>
          </div>
        </div>
      </section>

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
          {[
            {
              qBn: 'সৌদি আরব বা মধ্যপ্রাচ্যে ফ্রি-নেট কীভাবে কাজ করে?',
              qEn: 'How does Arab SIM Free-Net work in Saudi Arabia?',
              aBn: 'সোভারিক্সনেট বিশেষ SNI ও হোস্ট পেলোড (যেমন freenet.stc.com.sa) ব্যবহার করে টেলিকম ফায়ারওয়াল বাইপাস করে শূন্য ব্যালেন্সে হাই-স্পিড ভিপিএন টানেল তৈরি করে।',
              aEn: 'Soverixnet uses custom SNI spoofing and V2Ray Reality payloads over port 443 to tunnel traffic through zero-rated carrier CDN endpoints with zero account balance.'
            },
            {
              qBn: 'সোভারিক্সনেট কি আসলেই কোনো লগ সংরক্ষণ করে না?',
              qEn: 'Does Soverixnet VPN keep any logs?',
              aBn: 'হ্যাঁ, আমাদের সার্ভারগুলো ১০০% র‍্যাম-অনলি (RAM-only diskless) সিস্টেমে পরিচালিত হয়। কোনো ব্যবহারকারীর আইপি বা ব্রাউজিং হিস্টোরি কোথাও সেভ হয় না।',
              aEn: 'Yes! All server instances run purely in volatile RAM. No connection metadata, real IP addresses, or browsing activities are ever written to disk or database.'
            },
            {
              qBn: 'গেম খেলার সময় পিং কেমন পাওয়া যাবে?',
              qEn: 'What ping can I expect while playing online games?',
              aBn: 'আমাদের ঢাকা BDIX নোডে পাবজি বা ফ্রি ফায়ারে মাত্র ৮ms থেকে ১৫ms পিং পাওয়া যায়। সিঙ্গাপুর নোডে পিং থাকে মাত্র ২৮ms থেকে ৩৫ms।',
              aEn: 'Gamers connecting to our Dhaka BDIX or Singapore nodes achieve ultra-low 8ms to 28ms ping with optimal packet routing and zero jitter.'
            },
            {
              qBn: 'ফ্রি এবং ভিআইপি প্ল্যানের মধ্যে পার্থক্য কী?',
              qEn: 'What is the difference between Free and VIP plans?',
              aBn: 'ফ্রি সার্ভারগুলো সবার জন্য উন্মুক্ত। ভিআইপি প্ল্যানে পাওয়া যায় ১০Gbps আল্ট্রা-হাই স্পিড নোড, মধ্যপ্রাচ্য ফ্রি-নেট পেলোড এবং একাধিক ডিভাইসে একসাথে ব্যবহারের সুবিধা।',
              aEn: 'Free servers offer standard connectivity. VIP subscribers unlock dedicated 10Gbps high-capacity servers, Arab SIM FreeNet configurations, and priority routing.'
            },
            {
              qBn: 'কোন অ্যাপস দিয়ে সবচেয়ে ভালো ভিপিএন চলবে?',
              qEn: 'Which apps work best with Soverixnet VPN?',
              aBn: 'আমরা অফিসিয়ালি দুটি অ্যাপস রিকমেন্ড করি: ১. AF V2Ray APK (বিশ্বের যেকোনো দেশে আল্ট্রা স্পিডে চলার জন্য) এবং ২. Jiyam Plus VPN (সৌদি আরব ও মধ্যপ্রাচ্যে ০ ব্যালেন্সে ফ্রি-নেট চালানোর জন্য)। এছাড়াও v2rayNG, Shadowrocket ও WireGuard-এ চমৎকার কাজ করে।',
              aEn: 'We officially recommend: 1. AF V2Ray APK (works smoothly in all countries worldwide) and 2. Jiyam Plus VPN (tailored for Gulf SIM zero-balance FreeNet). You can also use v2rayNG, Shadowrocket, and WireGuard.'
            },
            {
              qBn: 'কীভাবে পেমেন্ট করতে পারি এবং অ্যাক্টিভ হতে কতক্ষণ লাগে?',
              qEn: 'How do I pay and how quickly is VIP activated?',
              aBn: 'বিকাশ, নগদ, রকেট অথবা ক্রিপ্টোকারেন্সির মাধ্যমে সরাসরি পেমেন্ট করতে পারবেন। ট্রানজাকশন সাবমিট করার সাথে সাথেই ভিআইপি ইনস্ট্যান্ট চালু হয়ে যায়।',
              aEn: 'You can pay instantly using bKash, Nagad, Rocket, Binance Pay, or credit cards. Your VIP account activates immediately upon confirmation.'
            }
          ].map((item, idx) => {
            const isOpen = activeFaqIndex === idx;
            return (
              <div
                key={idx}
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
              {lang === 'bn' ? 'যুক্ত হোন অফিসিয়াল WhatsApp চ্যানেলে: Soverixnet Internet unlimited Vpn' : 'Join Our Official WhatsApp Channel: Soverixnet Internet unlimited Vpn'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'bn' 
                ? 'প্রতিদিনের ফ্রি ইন্টারনেট ট্রিক্স, নতুন নোড আপডেট ও এক্সক্লুসিভ অফার পান সবার আগে।' 
                : 'Get daily free internet configs, new server updates, and priority customer support.'}
            </p>
          </div>
        </div>

        <a
          href={CONTACT_CONFIG.whatsappChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all shrink-0 cursor-pointer transform hover:scale-105"
        >
          <span>{lang === 'bn' ? 'WhatsApp চ্যানেলে জয়েন করুন ➔' : 'Join WhatsApp Channel ➔'}</span>
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
