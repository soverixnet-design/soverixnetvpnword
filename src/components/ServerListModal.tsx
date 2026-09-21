import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VPNServer, ServerCapability, VPNProtocol, ServerRegion } from '../types';
import { ServerManager } from '../services/serverManager';
import { useAuth } from '../firebase/AuthContext';
import { soundEffects } from '../services/soundEffects';
import { 
  Search, 
  Globe, 
  Sparkles, 
  Tv, 
  Gamepad2, 
  FolderDown, 
  ShieldAlert, 
  Layers, 
  Check, 
  ArrowUpDown, 
  RefreshCw,
  Zap,
  Lock,
  Radio,
  Crown,
  Plus,
  X,
  Server,
  Trash2,
  SlidersHorizontal,
  Compass,
  Cpu,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

interface ServerListModalProps {
  selectedServer: VPNServer;
  onSelectServer: (server: VPNServer) => void;
  lang: 'en' | 'bn';
  onClose?: () => void;
  onNavigateTab?: (tab: string) => void;
}

const ALL_REGIONS_OPTIONS: { id: 'all' | ServerRegion; name: string; nameBn: string; flag: string }[] = [
  { id: 'all', name: 'All Regions (গ্লোবাল)', nameBn: 'সকল অঞ্চল (All Regions)', flag: '🌐' },
  { id: 'middle_east', name: 'Middle East (KSA / UAE / QAT)', nameBn: 'মধ্যপ্রাচ্য (সৌদি / ইউএই)', flag: '🇸🇦' },
  { id: 'asia', name: 'Asia Pacific (SG / JP / MY / HK)', nameBn: 'এশিয়া প্যাসিফিক (সিঙ্গাপুর / জাপান)', flag: '🇸🇬' },
  { id: 'europe', name: 'Europe (DE / UK / FR / NL)', nameBn: 'ইউরোপ (জার্মানি / ইউকে)', flag: '🇪🇺' },
  { id: 'north_america', name: 'North America (US / CA)', nameBn: 'উত্তর আমেরিকা (ইউএস / কানাডা)', flag: '🇺🇸' },
  { id: 'oceania', name: 'Oceania (AU / NZ)', nameBn: 'ওশেনিয়া (অস্ট্রেলিয়া)', flag: '🇦🇺' },
];

const ALL_PROTOCOLS_OPTIONS: { id: 'all' | VPNProtocol; name: string; tag: string }[] = [
  { id: 'all', name: 'All Protocol Types (সব প্রোটোকল)', tag: 'ALL' },
  { id: 'wireguard', name: 'WireGuard (UDP Turbo 10G)', tag: 'WireGuard' },
  { id: 'v2ray', name: 'V2Ray / VLESS (WebSocket TLS)', tag: 'V2Ray' },
  { id: 'hysteria2', name: 'Hysteria 2 (UDP BBR Bypass)', tag: 'Hysteria2' },
  { id: 'trojan', name: 'Trojan-Go (TLS Port 443)', tag: 'Trojan' },
  { id: 'shadowsocks', name: 'Shadowsocks (AEAD 2022)', tag: 'Shadowsocks' },
  { id: 'openvpn_udp', name: 'OpenVPN (Fast UDP)', tag: 'OpenVPN UDP' },
  { id: 'openvpn_tcp', name: 'OpenVPN (HTTPS 443 TCP)', tag: 'OpenVPN TCP' },
];

export const ServerListModal: React.FC<ServerListModalProps> = ({
  selectedServer,
  onSelectServer,
  lang,
  onClose,
  onNavigateTab,
}) => {
  const t = TRANSLATIONS[lang];
  const { userProfile, isSuperAdmin, isAdmin, canAccessAdminPanel } = useAuth();
  
  const isUserVip = Boolean(
    isSuperAdmin || 
    isAdmin || 
    (userProfile?.plan && userProfile.plan.toLowerCase().includes('vip')) || 
    (userProfile?.plan && userProfile.plan.toLowerCase().includes('pro')) || 
    (userProfile?.plan && userProfile.plan.toLowerCase().includes('titan'))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<'all' | ServerRegion>('all');
  const [selectedProtocol, setSelectedProtocol] = useState<'all' | VPNProtocol>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'ping' | 'load' | 'name'>('ping');
  const [servers, setServers] = useState<VPNServer[]>(() => ServerManager.getAllServers());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justSelectedId, setJustSelectedId] = useState<string | null>(null);
  const [autoSelectNotice, setAutoSelectNotice] = useState<string | null>(null);

  // Add Custom Server Modal State
  const [showAddServerModal, setShowAddServerModal] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newServerCountry, setNewServerCountry] = useState('Saudi Arabia');
  const [newServerCountryBn, setNewServerCountryBn] = useState('সৌদি আরব');
  const [newServerCity, setNewServerCity] = useState('Riyadh');
  const [newServerCityBn, setNewServerCityBn] = useState('রিয়াদ');
  const [newServerFlag, setNewServerFlag] = useState('🇸🇦');
  const [newServerIp, setNewServerIp] = useState('');
  const [newServerPing, setNewServerPing] = useState(38);
  const [newServerIsVip, setNewServerIsVip] = useState(false);
  const [newServerIsFreeNet, setNewServerIsFreeNet] = useState(true);
  const [newServerSimOp, setNewServerSimOp] = useState('STC / Mobily / Zain 5G');
  const [newServerSni, setNewServerSni] = useState('sawa.stc.com.sa');
  const [newServerPayload, setNewServerPayload] = useState('GET / HTTP/1.1[crlf]Host: sawa.stc.com.sa[crlf]Connection: Upgrade[crlf]Upgrade: websocket[crlf][crlf]');
  const [newServerRegion, setNewServerRegion] = useState<ServerRegion>('middle_east');
  const [addServerSuccess, setAddServerSuccess] = useState(false);

  // Subscribe to live ServerManager updates
  useEffect(() => {
    const unsub = ServerManager.subscribe((all) => {
      setServers(all);
    });
    return () => unsub();
  }, []);

  // Ping refresh simulation
  const handleRefreshPings = () => {
    setIsRefreshing(true);
    soundEffects.playClick();
    setTimeout(() => {
      setServers((prev) =>
        prev.map((s) => ({
          ...s,
          ping: Math.max(8, s.ping + Math.floor(Math.random() * 6 - 3)),
          load: Math.min(95, Math.max(10, s.load + Math.floor(Math.random() * 8 - 4))),
        }))
      );
      setIsRefreshing(false);
      soundEffects.playSuccess();
    }, 600);
  };

  const handlePickServer = (server: VPNServer) => {
    soundEffects.playClick();
    setJustSelectedId(server.id);
    onSelectServer(server);
    setTimeout(() => {
      if (onClose) onClose();
    }, 280);
  };

  const handleCreateCustomServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName.trim() || !newServerIp.trim()) return;

    const id = `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const createdServer: VPNServer = {
      id,
      name: newServerName.trim(),
      country: newServerCountry.trim(),
      countryBn: newServerCountryBn.trim() || newServerCountry.trim(),
      countryCode: newServerFlag,
      city: newServerCity.trim(),
      cityBn: newServerCityBn.trim() || newServerCity.trim(),
      flag: newServerFlag.trim() || '🌐',
      ip: newServerIp.trim(),
      ping: Number(newServerPing) || 45,
      load: Math.floor(Math.random() * 25) + 10,
      isVip: newServerIsVip,
      isRecommended: true,
      isFreeNet: newServerIsFreeNet,
      simOperator: newServerSimOp.trim() || undefined,
      simOperatorBn: newServerSimOp.trim() || undefined,
      freeNetSni: newServerSni.trim() || undefined,
      payloadTemplate: newServerPayload.trim() || undefined,
      capabilities: ['streaming', 'gaming', 'p2p', 'obfuscated', ...(newServerIsFreeNet ? (['free_net'] as ServerCapability[]) : [])],
      protocols: ['wireguard', 'v2ray', 'hysteria2', 'trojan', 'shadowsocks', 'openvpn_udp'],
      lat: 24.7136,
      lng: 46.6753,
      region: newServerRegion,
      speed: '10 Gbps',
    };

    await ServerManager.addOrUpdateServer(createdServer);
    setAddServerSuccess(true);
    soundEffects.playSuccess();
    setTimeout(() => {
      setAddServerSuccess(false);
      setShowAddServerModal(false);
      onSelectServer(createdServer);
    }, 1200);
  };

  const handleDeleteCustomServer = async (serverId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(lang === 'bn' ? 'আপনি কি এই কাস্টম সার্ভারটি মুছে ফেলতে চান?' : 'Delete this custom server node?')) {
      await ServerManager.deleteServer(serverId);
    }
  };

  const categories = [
    { id: 'all', label: t.serverCategories.all, icon: Globe },
    { id: 'free_tier', label: lang === 'bn' ? '🆓 ১টি ফ্রি নোড' : '🆓 1 Free Node', icon: Sparkles },
    { id: 'vip', label: lang === 'bn' ? '👑 VIP ৫০+ নোড' : '👑 VIP 10G Fleet', icon: Crown },
    { id: 'free_net', label: t.serverCategories.freeNet, icon: Zap },
    { id: 'recommended', label: t.serverCategories.recommended, icon: Sparkles },
    { id: 'streaming', label: t.serverCategories.streaming, icon: Tv },
    { id: 'gaming', label: t.serverCategories.gaming, icon: Gamepad2 },
    { id: 'p2p', label: t.serverCategories.p2p, icon: FolderDown },
    { id: 'double_vpn', label: t.serverCategories.doubleVpn, icon: Layers },
    { id: 'obfuscated', label: t.serverCategories.obfuscated, icon: ShieldAlert },
  ];

  // Filter and sort servers
  const filteredServers = useMemo(() => {
    return servers
      .filter((s) => {
        // 1. Text Search Filter
        const q = searchQuery.toLowerCase().trim();
        if (q) {
          const matchSearch =
            s.name.toLowerCase().includes(q) ||
            s.country.toLowerCase().includes(q) ||
            s.countryBn.toLowerCase().includes(q) ||
            s.city.toLowerCase().includes(q) ||
            s.cityBn.toLowerCase().includes(q) ||
            s.ip.includes(q) ||
            (s.simOperator && s.simOperator.toLowerCase().includes(q)) ||
            (s.simOperatorBn && s.simOperatorBn.toLowerCase().includes(q)) ||
            (s.freeNetSni && s.freeNetSni.toLowerCase().includes(q)) ||
            s.protocols.some((p) => p.toLowerCase().includes(q));

          if (!matchSearch) return false;
        }

        // 2. Region Dropdown Filter
        if (selectedRegion !== 'all' && s.region !== selectedRegion) {
          return false;
        }

        // 3. Protocol Dropdown Filter
        if (selectedProtocol !== 'all' && !s.protocols.includes(selectedProtocol)) {
          return false;
        }

        // 4. Category Filter Chip
        if (activeCategory === 'all') return true;
        if (activeCategory === 'free_tier') return !s.isVip;
        if (activeCategory === 'vip') return s.isVip;
        if (activeCategory === 'free_net') return s.isFreeNet;
        if (activeCategory === 'recommended') return s.isRecommended;
        return s.capabilities.includes(activeCategory as ServerCapability);
      })
      .sort((a, b) => {
        if (sortBy === 'ping') return a.ping - b.ping;
        if (sortBy === 'load') return a.load - b.load;
        return a.country.localeCompare(b.country);
      });
  }, [servers, searchQuery, selectedRegion, selectedProtocol, activeCategory, sortBy]);

  // Find the fastest / lowest ping server overall (or within current filtered view)
  const lowestPingNode = useMemo(() => {
    if (filteredServers.length === 0) return null;
    return [...filteredServers].sort((a, b) => a.ping - b.ping)[0];
  }, [filteredServers]);

  // Auto-Select Best Low-Latency Node
  const handleAutoSelectLowestPing = () => {
    const target = lowestPingNode || servers[0];
    if (!target) return;

    soundEffects.playSuccess();
    handlePickServer(target);
    const countryText = lang === 'bn' ? target.countryBn : target.country;
    setAutoSelectNotice(
      lang === 'bn' 
        ? `⚡ দ্রুততম নোড নির্বাচিত: ${countryText} - ${target.name} (${target.ping} ms)` 
        : `⚡ Auto-selected lowest latency node: ${countryText} - ${target.name} (${target.ping} ms)`
    );

    setTimeout(() => {
      setAutoSelectNotice(null);
    }, 2500);
  };

  const hasActiveFilters = searchQuery !== '' || selectedRegion !== 'all' || selectedProtocol !== 'all' || activeCategory !== 'all';

  const handleResetFilters = () => {
    soundEffects.playClick();
    setSearchQuery('');
    setSelectedRegion('all');
    setSelectedProtocol('all');
    setActiveCategory('all');
    setSortBy('ping');
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* 1. Main Search & Filter Control Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-4 sm:p-5 rounded-3xl border border-cyan-500/30 shadow-xl space-y-3.5"
      >
        {/* Row 1: Search Bar & Quick Low-Latency Auto-Select */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Enhanced Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'দেশ, শহর, সিম অপারেটর, আইপি বা প্রোটোকল খুঁজুন...' : 'Search by country, city, SIM operator, IP, or protocol...'}
              className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-400 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Best Low-Latency Auto-Select Button */}
          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleAutoSelectLowestPing}
              disabled={!lowestPingNode}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 border border-emerald-300/40"
              title="Automatically find & connect to the server with lowest latency"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-current animate-pulse" />
              <span>
                {lang === 'bn' 
                  ? `⚡ দ্রুততম নোড নির্বাচন (${lowestPingNode ? lowestPingNode.ping + ' ms' : 'স্বয়ংক্রিয়'})` 
                  : `⚡ Auto-Select Best Node (${lowestPingNode ? lowestPingNode.ping + ' ms' : 'Fastest'})`}
              </span>
            </motion.button>

            {/* Owner Add Server Button */}
            {canAccessAdminPanel && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddServerModal(true)}
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-black font-extrabold text-xs cursor-pointer shadow-md shadow-amber-500/20 flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'ওনার সার্ভার এড' : 'Add Node'}</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Row 2: Region Dropdown, Protocol Dropdown, Sort, & Reset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80">
          
          {/* 🌍 Region Filter Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-1.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value as any);
                soundEffects.playClick();
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 text-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none transition-all cursor-pointer font-medium"
            >
              {ALL_REGIONS_OPTIONS.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-950 text-white">
                  {r.flag} {lang === 'bn' ? r.nameBn : r.name}
                </option>
              ))}
            </select>
          </div>

          {/* ⚡ Protocol Type Filter Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-1.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <select
              value={selectedProtocol}
              onChange={(e) => {
                setSelectedProtocol(e.target.value as any);
                soundEffects.playClick();
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 text-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none transition-all cursor-pointer font-medium"
            >
              {ALL_PROTOCOLS_OPTIONS.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-950 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* 📊 Sort By Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 ml-2 shrink-0" />
            <button
              onClick={() => {
                setSortBy('ping');
                soundEffects.playClick();
              }}
              className={`flex-1 py-1 rounded-lg font-bold transition-all cursor-pointer text-center ${
                sortBy === 'ping' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'bn' ? 'পিং (Ping)' : 'Ping'}
            </button>
            <button
              onClick={() => {
                setSortBy('load');
                soundEffects.playClick();
              }}
              className={`flex-1 py-1 rounded-lg font-bold transition-all cursor-pointer text-center ${
                sortBy === 'load' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'bn' ? 'লোড (Load)' : 'Load'}
            </button>
          </div>

          {/* 🔄 Refresh Latencies & Reset Filter Action */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleRefreshPings}
              disabled={isRefreshing}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold"
              title="Ping all servers in real-time"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{lang === 'bn' ? 'পিং রিফ্রেশ' : 'Test Ping'}</span>
            </motion.button>

            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleResetFilters}
                className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
                title={lang === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset All Filters'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>

        </div>

      </motion.div>

      {/* Auto-Select Success Toast / Notice */}
      <AnimatePresence>
        {autoSelectNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{autoSelectNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveCategory(cat.id);
                soundEffects.playClick();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? cat.id === 'vip' 
                    ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 border border-amber-400 shadow-sm shadow-amber-500/20'
                    : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? (cat.id === 'vip' ? 'text-amber-300' : 'text-cyan-400') : 'text-slate-400'}`} />
              <span>{cat.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Active Filter Counter & Result Summary */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span>
            {lang === 'bn' ? `মোট প্রদর্শিত সার্ভার:` : `Showing:`} <strong className="text-white font-mono">{filteredServers.length}</strong> / {servers.length}
          </span>
          {selectedRegion !== 'all' && (
            <span className="bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-md font-mono">
              Region: {selectedRegion}
            </span>
          )}
          {selectedProtocol !== 'all' && (
            <span className="bg-purple-950/60 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md font-mono">
              Proto: {selectedProtocol}
            </span>
          )}
        </div>

        {lowestPingNode && (
          <span className="text-emerald-400 font-mono flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" />
            Lowest Latency: <strong>{lowestPingNode.ping} ms</strong> ({lang === 'bn' ? lowestPingNode.countryBn : lowestPingNode.country})
          </span>
        )}
      </div>

      {/* 3. Server Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredServers.map((server, idx) => {
          const isSelected = selectedServer.id === server.id;
          const isJustSelected = justSelectedId === server.id;
          const isCustomServer = server.id.startsWith('custom-');
          const isLowestPing = lowestPingNode && lowestPingNode.id === server.id;

          return (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.02, 0.3), duration: 0.25 }}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePickServer(server)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
                isSelected || isJustSelected
                  ? 'bg-gradient-to-br from-cyan-950/50 via-slate-900/90 to-blue-950/50 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40'
                  : isLowestPing
                  ? 'glass-panel border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-950/10 shadow-md shadow-emerald-950/20'
                  : server.isVip
                  ? 'glass-panel border-amber-500/30 hover:border-amber-400/60 hover:bg-amber-950/10'
                  : 'glass-panel border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/70'
              }`}
            >
              {/* Highlight ribbon for Lowest Ping or Recommended */}
              {isLowestPing ? (
                <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden pointer-events-none">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-[7.5px] font-black uppercase py-0.5 text-center transform rotate-45 translate-x-5 translate-y-3 shadow-sm">
                    BEST PING
                  </div>
                </div>
              ) : server.isRecommended ? (
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[8px] font-black uppercase py-0.5 text-center transform rotate-45 translate-x-4 translate-y-2 shadow-sm">
                    FAST
                  </div>
                </div>
              ) : null}

              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <motion.span 
                      animate={isSelected ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className="text-3xl filter drop-shadow select-none"
                    >
                      {server.flag}
                    </motion.span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {lang === 'bn' ? server.countryBn : server.country}
                        </h4>
                        {server.isFreeNet && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 text-emerald-300 border border-emerald-500/40 animate-pulse flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5 text-emerald-400" />
                            FREE SIM
                          </span>
                        )}
                        {!server.isVip && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                            {lang === 'bn' ? 'ফ্রি ট্রায়াল' : 'FREE TIER'}
                          </span>
                        )}
                        {server.isVip && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                            isUserVip 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                              : 'bg-slate-800 text-amber-300/80 border border-amber-500/30'
                          }`}>
                            {isUserVip ? <Crown className="w-2.5 h-2.5 text-amber-400" /> : <Lock className="w-2.5 h-2.5 text-amber-400" />}
                            VIP
                          </span>
                        )}
                        {isCustomServer && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            CUSTOM
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[190px]">
                        {server.name}
                      </p>

                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                        <span>{server.city}</span>
                        <span>•</span>
                        <span className="text-cyan-400 font-semibold">{server.ip}</span>
                      </div>

                      {/* Arab SIM Operator Tag */}
                      {server.simOperator && (
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1">
                            <Radio className="w-2.5 h-2.5 text-amber-400" />
                            {lang === 'bn' ? server.simOperatorBn || server.simOperator : server.simOperator}
                          </span>
                          {server.freeNetSni && (
                            <span className="text-[9px] font-mono text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                              SNI: {server.freeNetSni}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold font-mono flex items-center gap-1 ${isLowestPing ? 'text-emerald-300 font-black' : 'text-emerald-400'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        {server.ping} ms
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      Load: {server.load}%
                    </span>
                    
                    {isCustomServer && canAccessAdminPanel && (
                      <button
                        onClick={(e) => handleDeleteCustomServer(server.id, e)}
                        className="mt-1 text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Custom Server"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Protocol Badges */}
                <div className="mt-2.5 flex items-center gap-1 flex-wrap">
                  <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {server.speed}
                  </span>
                  {server.protocols.slice(0, 3).map((proto) => (
                    <span 
                      key={proto} 
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                        selectedProtocol === proto 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold' 
                          : 'text-slate-300 bg-slate-900/80 border-slate-800/80'
                      }`}
                    >
                      {proto}
                    </span>
                  ))}
                  {server.protocols.length > 3 && (
                    <span className="text-[9px] font-mono text-slate-400">
                      +{server.protocols.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono text-[10px] capitalize">
                  {server.region.replace('_', ' ')}
                </span>

                {isSelected ? (
                  <span className="text-cyan-400 font-bold text-xs flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {lang === 'bn' ? 'নির্বাচিত' : 'Selected'}
                  </span>
                ) : server.isVip && !isUserVip ? (
                  <span className="text-amber-400/80 text-[10px] font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    VIP Only
                  </span>
                ) : (
                  <span className="text-slate-500 group-hover:text-cyan-400 text-xs font-medium transition-colors">
                    {lang === 'bn' ? 'কানেক্ট করুন ➔' : 'Connect ➔'}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredServers.length === 0 && (
        <div className="text-center py-12 glass-panel rounded-3xl border border-slate-800/80 space-y-3">
          <Server className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-white text-sm font-bold">
            {lang === 'bn' ? 'কোনো নোড পাওয়া যায়নি' : 'No server nodes found'}
          </h4>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            {lang === 'bn' 
              ? 'আপনার বর্তমান সার্চ বা ফিল্টার শর্ত অনুযায়ী কোনো সার্ভার মেলেনি। ফিল্টার রিসেট করতে নিচের বাটনে চাপুন।' 
              : 'No servers match your current search query, region, or protocol filters.'}
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold cursor-pointer hover:bg-cyan-500/30 transition-all"
          >
            {lang === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset All Filters'}
          </button>
        </div>
      )}

      {/* Owner Add Custom Server Modal */}
      <AnimatePresence>
        {showAddServerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-[#030712] border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-amber-400" />
                  <span>{lang === 'bn' ? 'নতুন সার্ভার নোড যুক্ত করুন (ওনার প্যানেল)' : 'Deploy New Server Node (Owner Panel)'}</span>
                </h4>
                <button
                  onClick={() => setShowAddServerModal(false)}
                  className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {addServerSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    {lang === 'bn' ? 'সার্ভার নোড সফলভাবে যুক্ত হয়েছে!' : 'Server Node Deployed!'}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {lang === 'bn' ? 'সার্ভারটি অবিলম্বে গ্লোবাল নোড লিস্টে সক্রিয় করা হয়েছে।' : 'Custom node is live and ready for all users.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreateCustomServer} className="space-y-3.5 text-xs">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">
                        {lang === 'bn' ? 'সার্ভার নাম' : 'Server Name'}
                      </label>
                      <input
                        type="text"
                        value={newServerName}
                        onChange={(e) => setNewServerName(e.target.value)}
                        placeholder="e.g. Riyadh STC 5G Ultra"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">
                        {lang === 'bn' ? 'সার্ভার আইপি বা ডোমেন' : 'Server IP / Domain'}
                      </label>
                      <input
                        type="text"
                        value={newServerIp}
                        onChange={(e) => setNewServerIp(e.target.value)}
                        placeholder="188.130.45.12 or node.soverixnet.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">
                        {lang === 'bn' ? 'দেশ' : 'Country'}
                      </label>
                      <input
                        type="text"
                        value={newServerCountry}
                        onChange={(e) => setNewServerCountry(e.target.value)}
                        placeholder="Saudi Arabia"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">
                        {lang === 'bn' ? 'শহর' : 'City'}
                      </label>
                      <input
                        type="text"
                        value={newServerCity}
                        onChange={(e) => setNewServerCity(e.target.value)}
                        placeholder="Riyadh"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">
                        {lang === 'bn' ? 'পতাকা ইমোজি' : 'Flag Emoji'}
                      </label>
                      <input
                        type="text"
                        value={newServerFlag}
                        onChange={(e) => setNewServerFlag(e.target.value)}
                        placeholder="🇸🇦"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 text-center text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">
                        {lang === 'bn' ? 'ফ্রি নেট এসএনআই (SNI)' : 'Free Net SNI'}
                      </label>
                      <input
                        type="text"
                        value={newServerSni}
                        onChange={(e) => setNewServerSni(e.target.value)}
                        placeholder="sawa.stc.com.sa"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">
                        {lang === 'bn' ? 'সিম অপারেটর ট্যাগ' : 'SIM Operator Tag'}
                      </label>
                      <input
                        type="text"
                        value={newServerSimOp}
                        onChange={(e) => setNewServerSimOp(e.target.value)}
                        placeholder="STC / Mobily / Zain"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">
                      {lang === 'bn' ? 'এইচটিটিপি পেলোড টেমপ্লেট' : 'Payload Template'}
                    </label>
                    <textarea
                      value={newServerPayload}
                      onChange={(e) => setNewServerPayload(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300 font-mono text-[11px] focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newServerIsVip}
                        onChange={(e) => setNewServerIsVip(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                      />
                      <span className="text-white font-bold">{lang === 'bn' ? 'শুধুমাত্র VIP এক্সেস' : 'VIP Only Node'}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newServerIsFreeNet}
                        onChange={(e) => setNewServerIsFreeNet(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                      />
                      <span className="text-white font-bold">{lang === 'bn' ? 'আরব ফ্রি সিম সাপোর্ট' : 'Arab Free SIM Support'}</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddServerModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold cursor-pointer shadow-lg shadow-amber-500/25"
                    >
                      {lang === 'bn' ? 'সার্ভার নোড ডিপ্লয় করুন ➔' : 'Deploy Server Node ➔'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
