import React, { useState } from 'react';
import { 
  Globe, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Server, 
  Wifi, 
  Search,
  ShoppingCart,
  ChevronDown
} from 'lucide-react';

interface CountrySeoShowcaseProps {
  lang: 'bn' | 'en';
  onOrderCountry: (countryId: string) => void;
}

interface CountryInfo {
  id: string;
  flag: string;
  nameBn: string;
  nameEn: string;
  taglineBn: string;
  taglineEn: string;
  sims: string[];
  protocols: string[];
  avgPing: string;
  priceStartSar: number;
  priceStartBdt: number;
  featuresBn: string[];
  featuresEn: string[];
  descriptionBn: string;
  descriptionEn: string;
}

const COUNTRIES_DATA: CountryInfo[] = [
  {
    id: 'saudi',
    flag: '🇸🇦',
    nameBn: 'সৌদি আরব (Saudi Arabia)',
    nameEn: 'Saudi Arabia STC, Mobily & Zain',
    taglineBn: 'STC 5G ফ্রি-নেট ও Mobily 60 SAR আনলিমিটেড হাই-স্পিড পিন',
    taglineEn: 'STC 5G FreeNet & Mobily 60 SAR Unlimited High-Speed PIN',
    sims: ['STC (Sawa)', 'Mobily (60 SAR Package)', 'Zain KSA', 'Jawwy (STC)', 'Red Bull Mobile', 'Salam Mobile'],
    protocols: ['WireGuard UDP Turbo', 'V2Ray VLESS Reality', 'Hysteria 2 (UDP BBR)', 'Shadowsocks AEAD'],
    avgPing: '12 - 18 ms',
    priceStartSar: 15,
    priceStartBdt: 350,
    featuresBn: [
      'STC জিরো-ব্যালেন্স 5G ফ্রি ইন্টারনেট বাইপাস',
      'Mobily 60 SAR প্যাকেজে ফুল স্পিড নো-বাফারিং',
      'হোয়াটসঅ্যাপ, মেসেঞ্জার ও ইমো হাই-কোয়ালিটি অডিও/ভিডিও কল',
      'ইউটিউব ও টিকটক ৪K আল্ট্রা এইচডি প্লেব্যাক'
    ],
    featuresEn: [
      'STC Zero-Balance 5G Free Internet Bypass',
      'Mobily 60 SAR package full speed unmetered',
      'WhatsApp, Messenger & IMO HD voice/video calls unblocked',
      'YouTube & TikTok 4K ultra smooth streaming'
    ],
    descriptionBn: 'সৌদি আরবের সকল প্রবাসী বাংলাদেশীদের জন্য সোভারিক্সনেট ভিপিএন হলো সবচেয়ে জনপ্রিয় ও নির্ভরযোগ্য ভিপিএন পিন। রিয়াদ, জেদ্দা, মক্কা, মদিনা, দাম্মাম সহ পুরো সৌদি আরবে কোনো ব্যালেন্স বা এমবি ছাড়াই ফুল স্পিডে ইন্টারনেট চালান।',
    descriptionEn: 'The most trusted VPN PIN provider in Saudi Arabia. Unrestricted high-speed internet across Riyadh, Jeddah, Makkah, Madinah, Dammam, and Jubail.'
  },
  {
    id: 'uae',
    flag: '🇦🇪',
    nameBn: 'সংযুক্ত আরব আমিরাত - দুবাই (UAE)',
    nameEn: 'United Arab Emirates (Dubai & Abu Dhabi)',
    taglineBn: 'du ও Etisalat সিমে হোয়াটসঅ্যাপ ও ইমো কল আনব্লক সলিউশন',
    taglineEn: 'du & Etisalat WhatsApp/BOTIM/IMO Call Unblock',
    sims: ['du UAE', 'Etisalat (e&)', 'Virgin Mobile UAE', 'Swyp'],
    protocols: ['V2Ray VLESS (TLS 443)', 'WireGuard Obfuscated', 'Trojan-Go'],
    avgPing: '15 - 22 ms',
    priceStartSar: 15,
    priceStartBdt: 350,
    featuresBn: [
      'দুবাই ও আবুধাবিতে WhatsApp, IMO, FaceTime ও BOTIM এইচডি কলিং',
      'du ও Etisalat নেটওয়ার্কে হাই-স্পিড অ্যান্টি-ব্লক বাইপাস',
      'ব্যাংকিং ও অফিসিয়াল সাইট সেফ ক্রিপ্টোগ্রাফিক টানেলিং',
      'সোশ্যাল মিডিয়া ও গেমিংয়ে জিরো ড্রপ গ্যারান্টি'
    ],
    featuresEn: [
      'Crystal-clear WhatsApp, IMO, Messenger & FaceTime video calls in Dubai',
      'Ultra-stealth obfuscation bypassing du & Etisalat strict DPI',
      'Military-grade banking privacy and encryption',
      'Zero-lag gaming and buffer-free social media'
    ],
    descriptionBn: 'দুবাই ও আরব আমিরাতের কঠোর ফায়ারওয়াল বাইপাস করে সহজে দেশে পরিবারের সাথে স্পষ্ট ভিডিও কলে কথা বলুন এবং কোনো ঝামেলা ছাড়াই আনলিমিটেড ব্রাউজিং উপভোগ করুন।',
    descriptionEn: 'Seamlessly bypass UAE VoIP restrictions to connect with family via high-definition video calls in Dubai, Abu Dhabi, and Sharjah.'
  },
  {
    id: 'oman',
    flag: '🇴🇲',
    nameBn: 'ওমান (Oman)',
    nameEn: 'Oman Omantel & Ooredoo FreeNet',
    taglineBn: 'Omantel ও Ooredoo সিমে আনলিমিটেড ফ্রি ইন্টারনেট ও কলিং',
    taglineEn: 'Omantel & Ooredoo Unlimited Free Internet & Calling',
    sims: ['Omantel', 'Ooredoo Oman', 'Vodafone Oman', 'Friendi Mobile', 'Renna Mobile'],
    protocols: ['WireGuard Turbo', 'V2Ray WebSocket', 'Shadowsocks'],
    avgPing: '18 - 25 ms',
    priceStartSar: 15,
    priceStartBdt: 350,
    featuresBn: [
      'ওমানের সকল সিমে সোশ্যাল মিডিয়া ও মেসেঞ্জার কল আনব্লক',
      'Omantel ও Ooredoo স্পেশাল ফ্রি-নেট এসএনআই হোস্ট কনফিগ',
      'ইউটিউব ৪K ও ফেসবুক ভিডিও ফুল স্পিডে লোড',
      'মাস্কাট, সালালাহ ও সোহারে সুপারফাস্ট কানেক্টিভিটি'
    ],
    featuresEn: [
      'Unrestricted WhatsApp and IMO audio/video calling in Oman',
      'Working SNI host payloads for Omantel and Ooredoo',
      'Bufferless 4K YouTube and TikTok streaming',
      'Stable low-latency connections in Muscat, Salalah, and Sohar'
    ],
    descriptionBn: 'ওমানের মাস্কাট, সালালাহ ও অন্যান্য শহরে প্রবাসীদের জন্য নির্ভরযোগ্য ভিপিএন পিন। ফ্রি ইন্টারনেট এবং বন্ধুদের সাথে কথা বলার জন্য সেরা চয়েস।',
    descriptionEn: 'Reliable and affordable VPN solution for residents and expats in Oman. Enjoy smooth streaming, VoIP calling, and high-speed data.'
  },
  {
    id: 'kuwait',
    flag: '🇰🇼',
    nameBn: 'কুয়েত (Kuwait)',
    nameEn: 'Kuwait Zain, Ooredoo & STC',
    taglineBn: 'কুয়েত Zain, Ooredoo ও STC সিমের জন্য আল্ট্রা ফাস্ট নোড',
    taglineEn: 'Kuwait Zain, Ooredoo & STC Low Ping Nodes',
    sims: ['Zain Kuwait', 'Ooredoo Kuwait', 'STC Kuwait (VIVA)'],
    protocols: ['WireGuard UDP', 'V2Ray VLESS', 'Hysteria 2'],
    avgPing: '16 - 22 ms',
    priceStartSar: 15,
    priceStartBdt: 350,
    featuresBn: [
      'Zain ও Ooredoo সিমে ফাস্ট ডাউনলোডিং ও ব্রাউজিং',
      'লো-পিং পাবজি (PUBG) ও ফ্রিফায়ার গেমিং নোডস',
      'পাবলিক ওয়াইফাইয়ে সম্পূর্ণ ডেটা ইনক্রিপশন',
      '১-ক্লিকে কুয়েত থেকে বাংলাদেশ ও সিঙ্গাপুর গেটওয়ে'
    ],
    featuresEn: [
      'Blazing fast speeds on Zain, Ooredoo, and STC Kuwait',
      'Ultra low-ping routing for online gaming (PUBG, Warzone)',
      'Bank-grade AES-256 data protection on public WiFi',
      'Direct low-latency tunnels to Bangladesh and Singapore'
    ],
    descriptionBn: 'কুয়েতে অবস্থানরত প্রবাসীদের জন্য বিশেষভাবে অপটিমাইজড সার্ভার। কম পিং এবং হাই স্পিড ব্যান্ডউইডথ উপভোগ করুন।',
    descriptionEn: 'Optimized high-speed VPN infrastructure for users across Kuwait City, Jahra, and Hawally with guaranteed uptime.'
  },
  {
    id: 'qatar',
    flag: '🇶🇦',
    nameBn: 'কাতার ও বাহরাইন (Qatar & Bahrain)',
    nameEn: 'Qatar & Bahrain Ooredoo, Vodafone & Batelco',
    taglineBn: 'দোহা ও মানামায় হাই-স্পিড নোড ও আনলিমিটেড কলিং',
    taglineEn: 'Doha & Manama High-Speed Calling and Privacy',
    sims: ['Ooredoo Qatar', 'Vodafone Qatar', 'Batelco Bahrain', 'STC Bahrain', 'Zain Bahrain'],
    protocols: ['WireGuard Turbo', 'V2Ray Reality', 'Shadowsocks'],
    avgPing: '18 - 24 ms',
    priceStartSar: 15,
    priceStartBdt: 350,
    featuresBn: [
      'কাতার ও বাহরাইনে WhatsApp ও IMO ক্রিস্টাল ক্লিয়ার কল',
      'Ooredoo ও Vodafone এ আনরেস্ট্রিক্টেড হাই স্পিড ট্রাফিক',
      'গোপনীয়তা ও জিরো-লগ নিশ্চিত নিরাপত্তা',
      '২৪/৭ ইনস্ট্যান্ট রিপ্লেসমেন্ট সুবিধা'
    ],
    featuresEn: [
      'Crystal-clear audio and video calls on Ooredoo and Vodafone',
      'Zero-log sovereign encrypted private network',
      'Unrestricted high-throughput servers for 4K video playback',
      '24/7 dedicated support and replacement warranty'
    ],
    descriptionBn: 'কাতার ও বাহরাইনে বসবাসকারী বাংলাদেশী কমিউনিটির জন্য সুপারফাস্ট ভিপিএন পিন। কল ড্রপ ছাড়া দেশে স্বজনদের সাথে কথা বলুন।',
    descriptionEn: 'Premium VPN network tailored for Qatar and Bahrain with uninterrupted communication and ultra-fast download bandwidth.'
  },
  {
    id: 'malaysia',
    flag: '🇲🇾',
    nameBn: 'মালয়েশিয়া (Malaysia - মালোশিয়া)',
    nameEn: 'Malaysia CelcomDigi, Maxis & U Mobile',
    taglineBn: 'Celcom, Digi, Maxis ও U Mobile সিমে আনলিমিটেড হাই-স্পিড ও লো-পিং',
    taglineEn: 'CelcomDigi, Maxis Hotlink, U Mobile & Yes 5G Unmetered VIP',
    sims: ['CelcomDigi', 'Maxis (Hotlink)', 'U Mobile', 'Yes 5G', 'Tune Talk', 'Yoodo', 'Unifi Mobile'],
    protocols: ['WireGuard UDP Turbo', 'V2Ray VLESS TLS', 'Hysteria 2 (UDP BBR)', 'Shadowsocks AEAD'],
    avgPing: '10 - 18 ms',
    priceStartSar: 15,
    priceStartBdt: 350,
    featuresBn: [
      'কুয়ালালামপুর, পেনাং ও জোহর বাহরুতে WhatsApp, IMO ও Messenger HD অডিও/ভিডিও কল',
      'Celcom, Digi, Maxis Hotlink ও U Mobile সোশ্যাল ডেটা ফুল স্পিড আনলিমিটেড বাইপাস',
      'মোবাইল লেজেন্ডস (MLBB) ও পাবজি লো-পিং (১০-১৫ ms) আল্ট্রা গেমিং এক্সিলারেটর',
      'বাংলাদেশের লাইভ টিভি চ্যানেল ও ইউটিউব/টিকটক ৪K জিরো বাফারিং প্লেব্যাক'
    ],
    featuresEn: [
      'Crystal-clear WhatsApp and IMO video calling to Bangladesh from Malaysia',
      'Celcom, Digi, Maxis Hotlink, and U Mobile high-speed data bypass',
      'Ultra low-latency gaming routing for Mobile Legends (MLBB) and PUBG Mobile',
      'Zero-buffer streaming for Bangladeshi live channels and 4K OTT playback'
    ],
    descriptionBn: 'মালয়েশিয়া (মালোশিয়া) অবস্থানরত সকল প্রবাসী ভাইদের জন্য সোভারিক্সনেট ভিপিএন পিন হলো এক নম্বর পছন্দ। কুয়ালালামপুর, পেনাং, জোহর বাহরু, সেলাঙ্গর সহ পুরো মালয়েশিয়ায় হাই-স্পিড ইন্টারনেট ও পরিবারে ক্রিস্টাল ক্লিয়ার কলে কথা বলুন।',
    descriptionEn: 'The most reliable and ultra-fast VIP VPN for residents and expats in Malaysia. Connect seamlessly across Kuala Lumpur, Penang, and Johor Bahru.'
  },
  {
    id: 'bangladesh',
    flag: '🇧🇩',
    nameBn: 'বাংলাদেশ (Bangladesh)',
    nameEn: 'Bangladesh Low Ping Gaming & Privacy',
    taglineBn: 'GP, Robi, Banglalink ও ওয়াইফাইয়ে লো-পিং গেমিং ও সিকিউরিটি',
    taglineEn: 'GP, Robi, Banglalink Low Ping Gaming & Security',
    sims: ['Grameenphone (GP)', 'Robi Axiata', 'Banglalink', 'Teletalk', 'All Broadband ISPs'],
    protocols: ['WireGuard UDP Turbo', 'V2Ray VLESS', 'Hysteria 2'],
    avgPing: '8 - 14 ms',
    priceStartSar: 15,
    priceStartBdt: 350,
    featuresBn: [
      'পাবজি ও ফ্রিফায়ারে ২০ms পিং স্পিড এক্সিলারেটর',
      'যেকোনো ব্লকড সাইট ও কনটেন্ট ১-ক্লিকে আনব্লক',
      'আইএসপি থ্রটলিং বাইপাস করে সর্বোচ্চ ডাউনলোড স্পিড',
      'সম্পূর্ণ পরিচয় গোপন ও ব্যাংক-গ্রেড সাইবার শিল্ড'
    ],
    featuresEn: [
      'Low 20ms ping accelerator for PUBG, Free Fire, and Valorant',
      'Instant access to any geo-restricted websites and streaming',
      'Bypass ISP speed throttling for maximum torrent and download speed',
      'Complete online privacy and DNS leak protection'
    ],
    descriptionBn: 'বাংলাদেশে গেমার ও ইন্টারনেট ব্যবহারকারীদের জন্য দেশ সেরা লো-পিং ভিপিএন। আইএসপির স্পিড লিমিট বাইপাস করে রকেট গতিতে ডাউনলোড ও স্ট্রিমিং করুন।',
    descriptionEn: 'The fastest gaming and streaming VPN in Bangladesh. Defeat ISP throttling and experience latency-free competitive gaming.'
  }
];

export const CountrySeoShowcase: React.FC<CountrySeoShowcaseProps> = ({ 
  lang,
  onOrderCountry 
}) => {
  const [activeCountryId, setActiveCountryId] = useState<string>('saudi');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeCountry = COUNTRIES_DATA.find(c => c.id === activeCountryId) || COUNTRIES_DATA[0];

  const filteredCountries = COUNTRIES_DATA.filter(country => {
    const q = searchQuery.toLowerCase();
    return (
      country.nameBn.toLowerCase().includes(q) ||
      country.nameEn.toLowerCase().includes(q) ||
      country.sims.some(s => s.toLowerCase().includes(q))
    );
  });

  return (
    <section id="country-servers-section" className="space-y-8 my-10 max-w-6xl mx-auto text-slate-100">
      
      {/* Title & SEO Lead */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black uppercase tracking-wider">
          <Globe className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'সৌদি আরব ও সকল দেশের ভিপিএন পিন' : 'GCC & Global VPN PIN Network'}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          {lang === 'bn' 
            ? 'মধ্যপ্রাচ্যের সকল সিম ও দেশের জন্য বিশেষভাবে অপটিমাইজড' 
            : 'Optimized for Middle East SIMs & Low Ping Gaming'}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {lang === 'bn'
            ? 'সৌদি আরব (STC, Mobily, Zain), দুবাই, ওমান, কুয়েত, মালয়েশিয়া (Celcom, Digi, Maxis), কাতার এবং বাংলাদেশে ১০০% ফুল স্পিড নো-বাফারিং ভিপিএন কানেকশন। নিচে আপনার দেশটি বেছে নিন।'
            : 'Select your country to see working telecom operators, FreeNet payloads, latency benchmarks, and order retail PINs instantly.'}
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto pt-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'দেশ বা সিমের নাম লিখুন (যেমন: STC, Mobily, দুবাই)...' : 'Search country or network (e.g. STC, Mobily, du)...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Country Selection Pill Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {filteredCountries.map((c) => {
          const isActive = c.id === activeCountryId;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCountryId(c.id)}
              className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 text-white border-emerald-400 shadow-lg shadow-emerald-950/40 scale-[1.02]'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
              }`}
            >
              <span className="text-xl">{c.flag}</span>
              <span>{lang === 'bn' ? c.nameBn.split(' ')[0] : c.nameEn.split(' ')[0]}</span>
              {isActive && <Check className="w-4 h-4 text-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* Selected Country Detailed Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Top Info */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <span className="text-4xl sm:text-5xl">{activeCountry.flag}</span>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {lang === 'bn' ? activeCountry.nameBn : activeCountry.nameEn}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-400 font-bold mt-0.5">
                  {lang === 'bn' ? activeCountry.taglineBn : activeCountry.taglineEn}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">গড় পিং (Latency)</span>
                <span className="text-sm font-black text-cyan-400 font-mono">{activeCountry.avgPing}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">শুরু মূল্য (From)</span>
                <span className="text-sm font-black text-emerald-400 font-mono">{activeCountry.priceStartSar} SAR / ৳{activeCountry.priceStartBdt}</span>
              </div>

              <button
                onClick={() => onOrderCountry(activeCountry.id)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer transform hover:scale-105"
              >
                <ShoppingCart className="w-4 h-4 text-slate-950" />
                <span>{lang === 'bn' ? 'এই দেশের পিন অর্ডার করুন' : 'Order PIN for This Country'}</span>
              </button>
            </div>
          </div>

          {/* Supported Sims & Protocols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* SIMs */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" />
                <span>সমর্থিত সিম ও অপারেটর (Supported Telecom Networks)</span>
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {activeCountry.sims.map((sim, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold"
                  >
                    📶 {sim}
                  </span>
                ))}
              </div>
            </div>

            {/* Protocols */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                <span>সক্রিয় প্রটোকল ও এনক্রিপশন (Active VPN Protocols)</span>
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {activeCountry.protocols.map((proto, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold"
                  >
                    🔒 {proto}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Key Advantages */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              প্রধান সুবিধাসমূহ (Key Highlights):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(lang === 'bn' ? activeCountry.featuresBn : activeCountry.featuresEn).map((f, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300 font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description Paragraph for SEO */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
            <p>{lang === 'bn' ? activeCountry.descriptionBn : activeCountry.descriptionEn}</p>
          </div>

        </div>
      </div>

    </section>
  );
};
