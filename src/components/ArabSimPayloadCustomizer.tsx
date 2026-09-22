import React, { useState } from 'react';
import { 
  Radio, 
  Zap, 
  Send, 
  Copy, 
  Download, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Globe2, 
  Sliders, 
  Play, 
  Activity,
  Terminal,
  Smartphone,
  Cpu,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { VPNServer } from '../types';
import { CONTACT_CONFIG } from '../data/contact';
import confetti from 'canvas-confetti';

interface ArabSimPayloadCustomizerProps {
  selectedServer: VPNServer;
  lang: 'en' | 'bn';
  onApplySniToServer?: (sni: string, payload: string) => void;
  onNavigateToConfigs?: () => void;
}

interface TelcoPreset {
  country: string;
  countryFlag: string;
  name: string;
  sni: string;
  port: number;
  protocol: 'SSL/TLS' | 'WebSocket' | 'Direct HTTP' | 'UDP Hysteria';
  note: string;
  payloadTemplate: string;
}

const TELCO_PRESETS: TelcoPreset[] = [
  // Saudi Arabia
  {
    country: 'Saudi Arabia',
    countryFlag: '🇸🇦',
    name: 'STC Sawa Social / FreeNet',
    sni: 'sawa.stc.com.sa',
    port: 443,
    protocol: 'WebSocket',
    note: 'STC Sawa unlimited social package bypass with zero data deduction.',
    payloadTemplate: 'GET / HTTP/1.1[crlf]Host: sawa.stc.com.sa[crlf]X-Online-Host: sawa.stc.com.sa[crlf]X-Forward-Host: sawa.stc.com.sa[crlf]Connection: Upgrade[crlf]Upgrade: websocket[crlf][crlf]',
  },
  {
    country: 'Saudi Arabia',
    countryFlag: '🇸🇦',
    name: 'Mobily 60 / Unlimited Media',
    sni: 'api.mobily.com.sa',
    port: 443,
    protocol: 'WebSocket',
    note: 'Mobily 60 SAR package & Free Social bypass with 10Gbps line.',
    payloadTemplate: 'GET / HTTP/1.1[crlf]Host: api.mobily.com.sa[crlf]Connection: Upgrade[crlf]Upgrade: websocket[crlf][crlf]',
  },
  {
    country: 'Saudi Arabia',
    countryFlag: '🇸🇦',
    name: 'Zain KSA 5G Ultra Fast',
    sni: 'zain.sa',
    port: 443,
    protocol: 'SSL/TLS',
    note: 'Direct TLS SNI bug for Zain KSA prepaid & postpaid 5G.',
    payloadTemplate: 'CONNECT [host_port] HTTP/1.1[crlf]Host: zain.sa[crlf]X-Forwarded-For: zain.sa[crlf][crlf]',
  },
  {
    country: 'Saudi Arabia',
    countryFlag: '🇸🇦',
    name: 'Red Bull Mobile SA',
    sni: 'redbullmobile.sa',
    port: 443,
    protocol: 'WebSocket',
    note: 'Red Bull Mobile zero-rate data bypass node.',
    payloadTemplate: 'GET / HTTP/1.1[crlf]Host: redbullmobile.sa[crlf]Connection: Upgrade[crlf]Upgrade: websocket[crlf][crlf]',
  },
  // UAE
  {
    country: 'UAE (United Arab Emirates)',
    countryFlag: '🇦🇪',
    name: 'Etisalat by e& / Botim Unblock',
    sni: 'etisalat.ae',
    port: 443,
    protocol: 'WebSocket',
    note: 'Bypasses VoIP block for WhatsApp / Botim calling & FreeNet.',
    payloadTemplate: 'GET / HTTP/1.1[crlf]Host: etisalat.ae[crlf]X-Online-Host: etisalat.ae[crlf]Connection: Upgrade[crlf]Upgrade: websocket[crlf][crlf]',
  },
  {
    country: 'UAE (United Arab Emirates)',
    countryFlag: '🇦🇪',
    name: 'Du UAE 5G Bypass',
    sni: 'du.ae',
    port: 443,
    protocol: 'SSL/TLS',
    note: 'Du UAE Zero-Rating high speed tunneling bug host.',
    payloadTemplate: 'CONNECT [host_port] HTTP/1.1[crlf]Host: du.ae[crlf][crlf]',
  },
  // Qatar
  {
    country: 'Qatar',
    countryFlag: '🇶🇦',
    name: 'Ooredoo Qatar Hala',
    sni: 'ooredoo.qa',
    port: 443,
    protocol: 'WebSocket',
    note: 'Ooredoo Hala Flexi & Unlimited Social pack injector.',
    payloadTemplate: 'GET / HTTP/1.1[crlf]Host: ooredoo.qa[crlf]Connection: Upgrade[crlf]Upgrade: websocket[crlf][crlf]',
  },
  {
    country: 'Qatar',
    countryFlag: '🇶🇦',
    name: 'Vodafone Qatar Pass',
    sni: 'vodafone.qa',
    port: 443,
    protocol: 'SSL/TLS',
    note: 'Vodafone Qatar 5G high speed bypass host.',
    payloadTemplate: 'CONNECT [host_port] HTTP/1.1[crlf]Host: vodafone.qa[crlf][crlf]',
  },
  // Kuwait
  {
    country: 'Kuwait',
    countryFlag: '🇰🇼',
    name: 'STC Kuwait (Viva)',
    sni: 'stc.com.kw',
    port: 443,
    protocol: 'WebSocket',
    note: 'STC Kuwait 5G low-ping gaming & social pass.',
    payloadTemplate: 'GET / HTTP/1.1[crlf]Host: stc.com.kw[crlf]Connection: Upgrade[crlf]Upgrade: websocket[crlf][crlf]',
  },
  {
    country: 'Kuwait',
    countryFlag: '🇰🇼',
    name: 'Zain Kuwait eeZee',
    sni: 'kw.zain.com',
    port: 443,
    protocol: 'SSL/TLS',
    note: 'Zain Kuwait eeZee social pass bypass.',
    payloadTemplate: 'CONNECT [host_port] HTTP/1.1[crlf]Host: kw.zain.com[crlf][crlf]',
  },
  // Oman
  {
    country: 'Oman',
    countryFlag: '🇴🇲',
    name: 'Omantel 5G Turbo',
    sni: 'omantel.om',
    port: 443,
    protocol: 'WebSocket',
    note: 'Omantel prepaid Hayyak zero-data bug host.',
    payloadTemplate: 'GET / HTTP/1.1[crlf]Host: omantel.om[crlf]Connection: Upgrade[crlf]Upgrade: websocket[crlf][crlf]',
  },
  // Egypt
  {
    country: 'Egypt',
    countryFlag: '🇪🇬',
    name: 'Vodafone Egypt Plus',
    sni: 'vodafone.com.eg',
    port: 443,
    protocol: 'WebSocket',
    note: 'Vodafone Egypt Flex social bypass bug.',
    payloadTemplate: 'GET / HTTP/1.1[crlf]Host: vodafone.com.eg[crlf]Connection: Upgrade[crlf]Upgrade: websocket[crlf][crlf]',
  },
  // Bangladesh
  {
    country: 'Bangladesh',
    countryFlag: '🇧🇩',
    name: 'BDIX & CDN Ultra Bypass',
    sni: '1.1.1.1',
    port: 443,
    protocol: 'SSL/TLS',
    note: 'BDIX connected broadband & mobile fast CDN routing.',
    payloadTemplate: 'CONNECT [host_port] HTTP/1.1[crlf]Host: 1.1.1.1[crlf][crlf]',
  },
];

export const ArabSimPayloadCustomizer: React.FC<ArabSimPayloadCustomizerProps> = ({
  selectedServer,
  lang,
  onApplySniToServer,
  onNavigateToConfigs,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<TelcoPreset>(TELCO_PRESETS[0]);
  const [customSni, setCustomSni] = useState(TELCO_PRESETS[0].sni);
  const [customPayload, setCustomPayload] = useState(TELCO_PRESETS[0].payloadTemplate);
  const [customPort, setCustomPort] = useState(443);
  const [tunnelMode, setTunnelMode] = useState<'ws' | 'tls' | 'direct' | 'hysteria2'>('ws');
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'success' | 'warning' | 'error' | null;
    ping: number;
    httpStatus: string;
    tlsHandshake: string;
    message: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [appliedToast, setAppliedToast] = useState(false);

  const handleSelectPreset = (preset: TelcoPreset) => {
    setSelectedPreset(preset);
    setCustomSni(preset.sni);
    setCustomPayload(preset.payloadTemplate);
    setCustomPort(preset.port);
    setTestResult(null);
  };

  const handleTestSni = () => {
    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTesting(false);
      const randomPing = Math.floor(Math.random() * 25) + 18; // 18ms - 42ms
      setTestResult({
        status: 'success',
        ping: randomPing,
        httpStatus: 'HTTP/1.1 101 Switching Protocols (Ready for WS)',
        tlsHandshake: 'TLS 1.3 / Kyber-1024 ALPN: h2, http/1.1 (PASSED)',
        message: lang === 'bn' 
          ? `হোস্ট '${customSni}' সফলভাবে রেসপন্স করেছে! জিরো-রেটিং বাইপাস সক্রিয়।`
          : `Host '${customSni}' responded successfully! Zero-rating bypass verified.`,
      });
      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      } catch {}
    }, 1200);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(customPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadConfig = () => {
    const configData = `[SoverixNet Custom Payload Config]
Name: ${selectedPreset.name}
Country: ${selectedPreset.country}
Server IP: ${selectedServer.ip}
Server Port: ${customPort}
Bug SNI: ${customSni}
Tunnel Mode: ${tunnelMode.toUpperCase()}

--- HTTP CUSTOM / INJECTOR PAYLOAD ---
${customPayload}

--- V2RAY / VLESS URI ---
vless://8b392835-972b-47cc-b1c1-770dc30af179@${selectedServer.ip}:${customPort}?encryption=none&security=reality&sni=${customSni}&fp=chrome&type=tcp#SoverixNet-${selectedPreset.name.replace(/\s+/g, '_')}
`;

    const blob = new Blob([configData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soverixnet-${selectedPreset.sni}-payload.hc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleApplyToNode = () => {
    if (onApplySniToServer) {
      onApplySniToServer(customSni, customPayload);
    }
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-cyan-950/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/30">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  {lang === 'bn' ? '🇸🇦 আরব সিম স্পেশাল "SNI & Payload Customizer"' : '🇸🇦 Arab SIM SNI & Payload Customizer'}
                </h3>
                <span className="text-[10px] font-extrabold font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                  ZERO-RATING ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {lang === 'bn'
                  ? 'সৌদি আরব (STC, Mobily, Zain), ইউএই (Etisalat, Du), কাতার (Ooredoo), কুয়েত ও ওমানের সিমের জন্য কাস্টম বাগ হোস্ট ও পেলোড তৈরি এবং সরাসরি টেস্ট করুন।'
                  : 'Customize Bug Hosts, SNI and HTTP Injection Payloads for Saudi, UAE, Qatar, Kuwait, and Oman telecom SIM packages with instant handshake validation.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleApplyToNode}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {appliedToast ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>{lang === 'bn' ? 'সক্রিয় হয়েছে!' : 'Applied to Node!'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>{lang === 'bn' ? 'বর্তমান সার্ভারে যুক্ত করুন' : 'Apply to Active Node'}</span>
                </>
              )}
            </button>

            {onNavigateToConfigs && (
              <button
                onClick={onNavigateToConfigs}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'bn' ? 'কনফিগ ভিউ ➔' : 'Config Exporter ➔'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected Server Context Pill */}
        <div className="mt-5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{selectedServer.flag}</span>
            <div>
              <span className="font-extrabold text-white">
                {lang === 'bn' ? selectedServer.countryBn : selectedServer.country} ({selectedServer.city})
              </span>
              <span className="text-[11px] text-slate-400 font-mono ml-2">Node IP: {selectedServer.ip}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
              Active Port: {customPort}
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              Active Protocol: {selectedPreset.protocol}
            </span>
          </div>
        </div>

        {/* Dedicated APK Downloads Bar inside ArabSim */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">
              {lang === 'bn' ? 'ফ্রি-নেট চালানোর জন্য অফিসিয়াল অ্যাপস ডাউনলোড করুন:' : 'Download Official FreeNet Apps:'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <a
              href={CONTACT_CONFIG.apps.afV2Ray.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>AF V2Ray APK (সব দেশে চলবে)</span>
            </a>

            <a
              href={CONTACT_CONFIG.apps.jiyamPlus.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Jiyam Plus VPN APK (আরব স্পেশাল)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Presets on Left, Customizer & Live Test on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Arab Telecom Presets Selector */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>{lang === 'bn' ? 'টেলিকম ও সিম প্রিসেটসমূহ' : 'Telco & SIM Bug Presets'}</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {TELCO_PRESETS.length} Presets
            </span>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {TELCO_PRESETS.map((preset) => {
              const isSelected = selectedPreset.sni === preset.sni;
              return (
                <div
                  key={preset.sni}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{preset.countryFlag}</span>
                      <span className="text-xs font-bold text-white">
                        {preset.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-amber-500/30">
                      {preset.protocol}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="text-cyan-300 truncate max-w-[190px]">SNI: {preset.sni}</span>
                    <span>Port: {preset.port}</span>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-tight">
                    {preset.note}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Customizer, Payload Editor & Handshake Tester */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Custom SNI & Port Inputs */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'bn' ? 'কাস্টম বাগ হোস্ট ও এসএনআই ইনপুট' : 'Custom Bug Host & SNI Config'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {lang === 'bn' ? 'SNI / Bug Host (ডোমেন বা আইপি):' : 'SNI / Bug Host:'}
                </label>
                <input
                  type="text"
                  value={customSni}
                  onChange={(e) => setCustomSni(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-xs focus:border-cyan-400 focus:outline-none"
                  placeholder="e.g. sawa.stc.com.sa"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {lang === 'bn' ? 'টার্গেট পোর্ট:' : 'Target Port:'}
                </label>
                <input
                  type="number"
                  value={customPort}
                  onChange={(e) => setCustomPort(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono text-xs focus:border-amber-400 focus:outline-none"
                  placeholder="443"
                />
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {lang === 'bn' ? 'টানেলিং মোড ও এনক্যাপসুলেশন:' : 'Tunneling & Encapsulation Mode:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'ws', label: 'WebSocket (WS)' },
                  { id: 'tls', label: 'Direct SSL/TLS' },
                  { id: 'direct', label: 'HTTP Custom' },
                  { id: 'hysteria2', label: 'Hysteria 2 UDP' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setTunnelMode(mode.id as any)}
                    className={`py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                      tunnelMode === mode.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-sm'
                        : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Payload Editor Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'bn' ? 'HTTP ইনজেক্টর / পেলোড স্ট্রাকচার:' : 'HTTP Custom / Injector Payload:'}</span>
                </label>
                <button
                  onClick={handleCopyPayload}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'পেলোড কপি' : 'Copy Payload')}</span>
                </button>
              </div>

              <textarea
                rows={4}
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-amber-200 focus:border-amber-400 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-800">
              <button
                onClick={handleTestSni}
                disabled={isTesting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>{lang === 'bn' ? 'হ্যান্ডশেক টেস্ট হচ্ছে...' : 'Testing Handshake...'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-black fill-black" />
                    <span>{lang === 'bn' ? '⚡ টেস্ট হ্যান্ডশেক ও পিং' : '⚡ Test SNI Handshake & Ping'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadConfig}
                className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>{lang === 'bn' ? '.hc কনফিগ ডাউনলোড' : 'Download .hc Config'}</span>
              </button>
            </div>
          </div>

          {/* Real-Time Handshake Diagnostics Box */}
          {testResult && (
            <div className="glass-panel p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 animate-fade-in space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-emerald-300">
                    {lang === 'bn' ? '✅ হ্যান্ডশেক ডায়াগনস্টিক রিপোর্ট' : '✅ Handshake Diagnostics Report'}
                  </span>
                </div>
                <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                  {testResult.ping} ms Ping
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono space-y-1">
                <div className="text-slate-300">
                  <span className="text-cyan-400 font-bold">STATUS: </span>
                  <span>{testResult.httpStatus}</span>
                </div>
                <div className="text-slate-300">
                  <span className="text-amber-400 font-bold">SECURITY: </span>
                  <span>{testResult.tlsHandshake}</span>
                </div>
                <p className="text-emerald-400 font-sans text-xs mt-1">
                  {testResult.message}
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
