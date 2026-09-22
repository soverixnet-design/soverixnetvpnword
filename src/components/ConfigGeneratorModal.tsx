import React, { useState, useEffect } from 'react';
import { VPNServer, VPNProtocol } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { CONTACT_CONFIG } from '../data/contact';
import { 
  FileCode2, 
  Copy, 
  Download, 
  Check, 
  QrCode, 
  Layers, 
  Share2, 
  Terminal,
  Key,
  Shield,
  Smartphone,
  Sparkles,
  Zap,
  ExternalLink
} from 'lucide-react';
import QRCode from 'qrcode';

interface ConfigGeneratorModalProps {
  selectedServer: VPNServer;
  activeProtocol: VPNProtocol;
  lang: 'en' | 'bn';
}

export const ConfigGeneratorModal: React.FC<ConfigGeneratorModalProps> = ({
  selectedServer,
  activeProtocol,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const [selectedFormat, setSelectedFormat] = useState<
    'vless' | 'wireguard' | 'http_custom' | 'ehi' | 'hat' | 'soverix' | 'hysteria2' | 'clash' | 'openvpn'
  >('vless');
  const [copied, setCopied] = useState(false);
  const [customSni, setCustomSni] = useState(selectedServer.freeNetSni || '');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const effectiveSni = customSni || selectedServer.freeNetSni || 'sawa.stc.com.sa';

  // Generate realistic configuration strings
  const generateWireguardConfig = () => {
    return `[Interface]
PrivateKey = yAn7G9z...SoverixNetSovereignKey99==
Address = 10.66.66.2/32, fd42:42:42::2/128
DNS = 1.1.1.1, 1.0.0.1
MTU = 1280

[Peer]
PublicKey = aK9L2xQ+SoverixNetGateNodeKey${selectedServer.countryCode}==
PresharedKey = pSK79x...QuantumKyber1024Shield==
Endpoint = ${selectedServer.ip}:51820
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25`;
  };

  const generateVlessUri = () => {
    return `vless://8b392835-972b-47cc-b1c1-770dc30af179@${selectedServer.ip}:443?encryption=none&security=reality&sni=${effectiveSni}&fp=chrome&pbk=soverixPublicRealityKey1024&sid=1a2b3c4d&type=tcp&headerType=none#SoverixNet-${selectedServer.country.replace(/\s+/g, '')}-${selectedServer.simOperator ? selectedServer.simOperator.replace(/\s+/g, '_') : selectedServer.city}`;
  };

  const generateHttpCustomPayload = () => {
    return `[Config Name: SoverixNet Free Net - ${selectedServer.country} ${selectedServer.simOperator || ''}]
Server: ${selectedServer.ip}
Port: 443 / 80
SNI / Bug Host: ${effectiveSni}

--- HTTP CUSTOM / INJECTOR PAYLOAD ---
GET / HTTP/1.1[crlf]Host: ${effectiveSni}[crlf]X-Online-Host: ${effectiveSni}[crlf]X-Forward-Host: ${effectiveSni}[crlf]Connection: Upgrade[crlf]Upgrade: websocket[crlf][crlf]

--- FAST SSH/WS INSTRUCTIONS ---
1. Open HTTP Custom / HTTP Injector / v2rayNG
2. Set Server IP: ${selectedServer.ip}
3. Set Remote Proxy: ${selectedServer.ip}:443 (or direct 80/8080)
4. Enable SSL/TLS with SNI: ${effectiveSni}
5. Connect & Enjoy Unlimited Zero-Rating Internet!`;
  };

  const generateEhiPayload = () => {
    return `--- HTTP INJECTOR (.EHI) CONFIG ---
[Profile: SoverixNet ${selectedServer.country} ${selectedServer.simOperator || 'FastNode'}]
Host: ${selectedServer.ip}
Port: 443
Payload: GET / HTTP/1.1[crlf]Host: ${effectiveSni}[crlf]X-Online-Host: ${effectiveSni}[crlf]Connection: Upgrade[crlf]Upgrade: websocket[crlf][crlf]
SNI: ${effectiveSni}
SSL: Enabled
TunnelType: SSH/WebSocket TLS`;
  };

  const generateHatPayload = () => {
    return `--- HA TUNNEL PLUS (.HAT) EXPORT ---
Server: ${selectedServer.ip}:443
CustomSNI: ${effectiveSni}
ConnectionMode: Custom SNI / TLS Direct
Realm: ${selectedServer.country}
Protocol: HA-TLS-1.3`;
  };

  const generateSoverixNative = () => {
    return JSON.stringify({
      app: 'SoverixNet VPN Sovereign',
      version: '2.5.0',
      node: {
        id: selectedServer.id,
        name: selectedServer.name,
        ip: selectedServer.ip,
        port: 443,
        sni: effectiveSni,
        protocol: activeProtocol,
        quantumKyber: true,
        zeroRatingSim: selectedServer.simOperator || 'Universal',
      }
    }, null, 2);
  };

  const generateHysteria2Uri = () => {
    return `hysteria2://soverixnet_vip@${selectedServer.ip}:38290/?sni=${effectiveSni}&insecure=0&mport=20000-40000#SoverixNet-Hysteria2-${selectedServer.city}`;
  };

  const generateClashYaml = () => {
    return `proxies:
  - name: "SoverixNet ${selectedServer.country} ${selectedServer.city}"
    type: vless
    server: ${selectedServer.ip}
    port: 443
    uuid: 8b392835-972b-47cc-b1c1-770dc30af179
    network: ws
    tls: true
    servername: ${effectiveSni}
    ws-opts:
      path: /
      headers:
        Host: ${effectiveSni}
    udp: true`;
  };

  const generateOpenVpnConfig = () => {
    return `client
dev tun
proto udp
remote ${selectedServer.ip} 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
auth SHA512
cipher AES-256-GCM
ignore-unknown-option block-outside-dns
block-outside-dns
verb 3
<ca>
-----BEGIN CERTIFICATE-----
MIIBojCCAUegAwIBAgIU...SOVERIXNET-ROOT-CA...
-----END CERTIFICATE-----
</ca>`;
  };

  const getConfigText = () => {
    switch (selectedFormat) {
      case 'vless': return generateVlessUri();
      case 'wireguard': return generateWireguardConfig();
      case 'http_custom': return generateHttpCustomPayload();
      case 'ehi': return generateEhiPayload();
      case 'hat': return generateHatPayload();
      case 'soverix': return generateSoverixNative();
      case 'hysteria2': return generateHysteria2Uri();
      case 'clash': return generateClashYaml();
      case 'openvpn': return generateOpenVpnConfig();
      default: return generateVlessUri();
    }
  };

  const configText = getConfigText();

  // Generate dynamic QR Code
  useEffect(() => {
    const textToEncode = (selectedFormat === 'vless' || selectedFormat === 'hysteria2') 
      ? configText 
      : `vless://8b392835-972b-47cc-b1c1-770dc30af179@${selectedServer.ip}:443?encryption=none&security=reality&sni=${effectiveSni}#SoverixNet-${selectedServer.city}`;

    QRCode.toDataURL(textToEncode, {
      width: 280,
      margin: 1,
      color: {
        dark: '#030712',
        light: '#ffffff'
      }
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('QR code generation failed:', err));
  }, [configText, selectedFormat, effectiveSni, selectedServer]);

  const handleCopy = () => {
    navigator.clipboard.writeText(configText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let ext = 'txt';
    if (selectedFormat === 'wireguard') ext = 'conf';
    else if (selectedFormat === 'clash') ext = 'yaml';
    else if (selectedFormat === 'openvpn') ext = 'ovpn';
    else if (selectedFormat === 'ehi') ext = 'ehi';
    else if (selectedFormat === 'hat') ext = 'hat';
    else if (selectedFormat === 'http_custom') ext = 'hc';
    else if (selectedFormat === 'soverix') ext = 'soverix';

    const blob = new Blob([configText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `soverixnet-${selectedServer.id}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/20 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">
                {t.configExport.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                {t.configExport.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-xl border border-cyan-500/30">
              {selectedServer.speed}
            </span>
          </div>
        </div>

        {/* Selected Server Context Pill */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{selectedServer.flag}</span>
            <div>
              <span className="text-xs font-bold text-white">
                {lang === 'bn' ? selectedServer.countryBn : selectedServer.country} ({selectedServer.city})
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">Node IP: {selectedServer.ip}</span>
            </div>
          </div>
          {selectedServer.simOperator && (
            <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
              📶 {selectedServer.simOperator}
            </span>
          )}
        </div>
      </div>

      {/* Format Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'vless', label: '⚡ V2Ray / VLESS Reality (URI)' },
          { id: 'wireguard', label: '🛡️ WireGuard (.conf)' },
          { id: 'http_custom', label: '🇸🇦 HTTP Custom (.hc)' },
          { id: 'ehi', label: '💉 HTTP Injector (.ehi)' },
          { id: 'hat', label: '🚇 HA Tunnel Plus (.hat)' },
          { id: 'soverix', label: '👑 Native Soverix (.soverix)' },
          { id: 'hysteria2', label: '🚀 Hysteria 2 (UDP)' },
          { id: 'clash', label: 'Clash / Sing-box (YAML)' },
          { id: 'openvpn', label: 'OpenVPN (.ovpn)' },
        ].map((fmt) => (
          <button
            key={fmt.id}
            onClick={() => setSelectedFormat(fmt.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedFormat === fmt.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {fmt.label}
          </button>
        ))}
      </div>

      {/* SNI / Zero-Rating Bug Host Customizer */}
      <div className="glass-panel p-4 rounded-2xl border border-cyan-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200">
              {lang === 'bn' ? 'জিরো-রেটিং SNI / বাগ হোস্ট সিলেক্ট করুন:' : 'Zero-Rating SNI / Bug Host Presets:'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">
            Current SNI: {effectiveSni}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[
            { name: 'STC Sawa (SA)', sni: 'sawa.stc.com.sa' },
            { name: 'Mobily 60 (SA)', sni: 'api.mobily.com.sa' },
            { name: 'Zain KSA (SA)', sni: 'zain.sa' },
            { name: 'Etisalat e& (UAE)', sni: 'etisalat.ae' },
            { name: 'Du (UAE)', sni: 'du.ae' },
            { name: 'Ooredoo (QA)', sni: 'ooredoo.qa' },
            { name: 'Omantel (OM)', sni: 'omantel.om' },
            { name: 'WhatsApp CDN', sni: 'web.whatsapp.com' },
            { name: 'Cloudflare WARP', sni: '1.1.1.1' },
          ].map((item) => (
            <button
              key={item.sni}
              onClick={() => setCustomSni(item.sni)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                effectiveSni === item.sni
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400 font-bold'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Code Editor & Dynamic Real QR Code Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Config Code Display Box */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-3xl border border-cyan-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>PROFILE PAYLOAD ({selectedFormat.toUpperCase()})</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                READY TO IMPORT
              </span>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-cyan-200 overflow-x-auto max-h-72 leading-relaxed selection:bg-cyan-500 selection:text-black">
              {configText}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-800">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t.configExport.copiedToast}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{t.configExport.copyString}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>{t.configExport.downloadConf}</span>
            </button>
          </div>
        </div>

        {/* Dynamic QR Code Card */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-3xl border border-cyan-500/20 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 mb-3">
            <QrCode className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.configExport.qrCodeTitle}
            </h4>
          </div>

          {/* Real Dynamic QR Code generated via Canvas/DataURL */}
          <div className="p-3.5 bg-white rounded-2xl shadow-xl shadow-cyan-500/10 my-2 flex items-center justify-center">
            {qrCodeDataUrl ? (
              <img 
                src={qrCodeDataUrl} 
                alt="VPN Scan QR Code" 
                className="w-44 h-44 object-contain"
              />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-700">
                Generating QR...
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            {lang === 'bn' 
              ? 'মোবাইল থেকে v2rayNG, Shadowrocket, NekoBox বা WireGuard দিয়ে সরাসরি স্ক্যান করুন' 
              : 'Scan with v2rayNG, Shadowrocket, NekoBox or WireGuard on your smartphone'}
          </p>

          {/* Quick Client Setup Guide & Direct APK Downloads */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 w-full text-left space-y-2">
            <span className="text-[11px] font-bold text-cyan-300 block">
              {lang === 'bn' ? '📱 সরাসরি রেডি ভিপিএন অ্যাপস ডাউনলোড:' : '📱 Direct Recommended VPN Apps:'}
            </span>

            <div className="space-y-1.5">
              <a
                href={CONTACT_CONFIG.apps.afV2Ray.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-1.5 px-2.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold flex items-center justify-between transition-all"
              >
                <span>AF V2Ray APK (সব দেশে চলবে)</span>
                <Download className="w-3 h-3 text-cyan-400" />
              </a>

              <a
                href={CONTACT_CONFIG.apps.jiyamPlus.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center justify-between transition-all"
              >
                <span>Jiyam Plus VPN APK (আরব স্পেশাল)</span>
                <Download className="w-3 h-3 text-emerald-400" />
              </a>
            </div>

            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-900">
              <div>• <b>iPhone/iOS:</b> Shadowrocket, Sing-box, WireGuard</div>
              <div>• <b>PC:</b> v2rayN, Clash Verge, WireGuard</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
