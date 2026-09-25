import React, { useState } from 'react';
import { 
  SiteSettingsData, 
  HeroContentConfig, 
  WhatsappCtaConfig, 
  getSiteSettings, 
  saveSiteSettings,
  DEFAULT_HERO_CONTENT,
  DEFAULT_WHATSAPP_CTA
} from '../../data/contact';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Type, 
  Sparkles, 
  Check, 
  RotateCcw, 
  CheckCircle2, 
  Radio, 
  Zap, 
  MessageSquare, 
  Globe, 
  Phone, 
  Mail, 
  Send,
  X
} from 'lucide-react';

interface AllTextsManagerProps {
  lang: 'en' | 'bn';
  onUpdated?: () => void;
}

export const AllTextsManager: React.FC<AllTextsManagerProps> = ({ lang, onUpdated }) => {
  const [settings, setSettings] = useState<SiteSettingsData>(getSiteSettings());
  const hero = settings.heroContent || DEFAULT_HERO_CONTENT;
  const cta = settings.whatsappCtaContent || DEFAULT_WHATSAPP_CTA;

  // Hero Texts
  const [heroBadgeBn, setHeroBadgeBn] = useState(hero.badgeBn || '');
  const [heroBadgeEn, setHeroBadgeEn] = useState(hero.badgeEn || '');
  const [heroHeadlineBn, setHeroHeadlineBn] = useState(hero.headlineBn || '');
  const [heroHeadlineEn, setHeroHeadlineEn] = useState(hero.headlineEn || '');
  const [heroSubheadlineBn, setHeroSubheadlineBn] = useState(hero.subheadlineBn || '');
  const [heroSubheadlineEn, setHeroSubheadlineEn] = useState(hero.subheadlineEn || '');
  const [connectBtnBn, setConnectBtnBn] = useState(hero.connectBtnTextBn || '১-ট্যাপ ভিপিএন কানেক্ট করুন');
  const [connectBtnEn, setConnectBtnEn] = useState(hero.connectBtnTextEn || '1-Tap Quick Connect');
  const [statUptime, setStatUptime] = useState(hero.statUptime || '99.9%');
  const [statPing, setStatPing] = useState(hero.statPing || '12ms');
  const [statSpeed, setStatSpeed] = useState(hero.statSpeed || '10 Gbps');

  // Top Notice Ticker
  const [tickerBn, setTickerBn] = useState(settings.tickerAnnouncementBn || '');
  const [tickerEn, setTickerEn] = useState(settings.tickerAnnouncementEn || '');

  // WhatsApp Community Section
  const [ctaTitleBn, setCtaTitleBn] = useState(cta.titleBn || '');
  const [ctaTitleEn, setCtaTitleEn] = useState(cta.titleEn || '');
  const [ctaSubBn, setCtaSubBn] = useState(cta.subtitleBn || '');
  const [ctaSubEn, setCtaSubEn] = useState(cta.subtitleEn || '');
  const [ctaBtnBn, setCtaBtnBn] = useState(cta.buttonTextBn || '');
  const [ctaBtnEn, setCtaBtnEn] = useState(cta.buttonTextEn || '');
  const [ctaChannelUrl, setCtaChannelUrl] = useState(cta.channelUrl || '');

  // Contacts
  const [waNumber, setWaNumber] = useState(settings.whatsappNumber || '8801342930870');
  const [waDisplay, setWaDisplay] = useState(settings.whatsappDisplayNumber || '+880 1342-930870');
  const [telegram, setTelegram] = useState(settings.telegramUrl || 'https://t.me/soverixnet_vpn');
  const [email, setEmail] = useState(settings.officialEmail || 'soverixnet@gmail.com');

  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedHero: HeroContentConfig = {
      badgeBn: heroBadgeBn.trim(),
      badgeEn: heroBadgeEn.trim(),
      headlineBn: heroHeadlineBn.trim(),
      headlineEn: heroHeadlineEn.trim(),
      subheadlineBn: heroSubheadlineBn.trim(),
      subheadlineEn: heroSubheadlineEn.trim(),
      connectBtnTextBn: connectBtnBn.trim(),
      connectBtnTextEn: connectBtnEn.trim(),
      statUptime: statUptime.trim(),
      statPing: statPing.trim(),
      statSpeed: statSpeed.trim(),
    };

    const updatedCta: WhatsappCtaConfig = {
      titleBn: ctaTitleBn.trim(),
      titleEn: ctaTitleEn.trim(),
      subtitleBn: ctaSubBn.trim(),
      subtitleEn: ctaSubEn.trim(),
      buttonTextBn: ctaBtnBn.trim(),
      buttonTextEn: ctaBtnEn.trim(),
      channelUrl: ctaChannelUrl.trim(),
    };

    // Also sync with designTheme so title/headlines stay matching
    const updatedTheme = {
      ...settings.designTheme,
      heroHeadlineBn: heroHeadlineBn.trim(),
      heroHeadlineEn: heroHeadlineEn.trim(),
      heroSubheadlineBn: heroSubheadlineBn.trim(),
      heroSubheadlineEn: heroSubheadlineEn.trim(),
    };

    const newSettings = saveSiteSettings({
      heroContent: updatedHero,
      whatsappCtaContent: updatedCta,
      designTheme: updatedTheme,
      tickerAnnouncementBn: tickerBn.trim(),
      tickerAnnouncementEn: tickerEn.trim(),
      whatsappNumber: waNumber.trim(),
      whatsappDisplayNumber: waDisplay.trim(),
      whatsappChannelUrl: ctaChannelUrl.trim(),
      telegramUrl: telegram.trim(),
      officialEmail: email.trim(),
    });

    setSettings(newSettings);

    try {
      await setDoc(doc(db, 'settings', 'general'), {
        heroContent: updatedHero,
        whatsappCtaContent: updatedCta,
        designTheme: updatedTheme,
        tickerAnnouncementBn: tickerBn.trim(),
        tickerAnnouncementEn: tickerEn.trim(),
        whatsappNumber: waNumber.trim(),
        whatsappDisplayNumber: waDisplay.trim(),
        whatsappChannelUrl: ctaChannelUrl.trim(),
        telegramUrl: telegram.trim(),
        officialEmail: email.trim(),
      }, { merge: true });
    } catch {}

    setIsSaving(false);
    setNotice(lang === 'bn' ? 'সকল টেক্সট ও কন্টেন্ট সফলভাবে আপডেট করা হয়েছে!' : 'All website texts saved and updated!');
    setTimeout(() => setNotice(null), 3500);
    onUpdated?.();
  };

  const handleReset = () => {
    if (confirm(lang === 'bn' ? 'সব টেক্সট কি ডিফল্ট মানে রিসেট করতে চান?' : 'Reset all texts to default?')) {
      setHeroBadgeBn(DEFAULT_HERO_CONTENT.badgeBn);
      setHeroBadgeEn(DEFAULT_HERO_CONTENT.badgeEn);
      setHeroHeadlineBn(DEFAULT_HERO_CONTENT.headlineBn);
      setHeroHeadlineEn(DEFAULT_HERO_CONTENT.headlineEn);
      setHeroSubheadlineBn(DEFAULT_HERO_CONTENT.subheadlineBn);
      setHeroSubheadlineEn(DEFAULT_HERO_CONTENT.subheadlineEn);
      setConnectBtnBn(DEFAULT_HERO_CONTENT.connectBtnTextBn || '১-ট্যাপ ভিপিএন কানেক্ট করুন');
      setConnectBtnEn(DEFAULT_HERO_CONTENT.connectBtnTextEn || '1-Tap Quick Connect');
      setStatUptime(DEFAULT_HERO_CONTENT.statUptime || '99.9%');
      setStatPing(DEFAULT_HERO_CONTENT.statPing || '12ms');
      setStatSpeed(DEFAULT_HERO_CONTENT.statSpeed || '10 Gbps');
      setCtaTitleBn(DEFAULT_WHATSAPP_CTA.titleBn);
      setCtaTitleEn(DEFAULT_WHATSAPP_CTA.titleEn);
      setCtaSubBn(DEFAULT_WHATSAPP_CTA.subtitleBn);
      setCtaSubEn(DEFAULT_WHATSAPP_CTA.subtitleEn);
      setCtaBtnBn(DEFAULT_WHATSAPP_CTA.buttonTextBn);
      setCtaBtnEn(DEFAULT_WHATSAPP_CTA.buttonTextEn);
      setCtaChannelUrl(DEFAULT_WHATSAPP_CTA.channelUrl);
    }
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6">
      
      {/* Notice */}
      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">{notice}</span>
          </div>
          <button type="button" onClick={() => setNotice(null)} className="p-1 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#091522] via-slate-950 to-[#0e1d2c] border border-cyan-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold mb-2">
            <Type className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ওয়েবসাইটের সকল টেক্সট ও কন্টেন্ট এডিটর' : 'Website Copy & Content Editor'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {lang === 'bn' ? 'প্রত্যেকটি সেক্টরের লেখা ও ক্যাপশন পরিবর্তন' : 'Edit Every Sector Texts & Headings'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'bn' 
              ? 'হিরো সেকশনের শিরোনাম, সাবটাইটেল, বাটন লেবেল, টপ নোটিশ স্ক্রোলার এবং হোয়াটসঅ্যাপ চ্যানেলের বিবরণ নিজে থেকে লিখুন।' 
              : 'Customize hero headlines, connect buttons, scrolling marquee text, and WhatsApp CTA.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="py-2.5 px-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'রিসেট' : 'Reset'}</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>{lang === 'bn' ? 'সেভ হচ্ছে...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{lang === 'bn' ? 'সব টেক্সট সেভ করুন' : 'Save All Texts'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. HERO SECTION TEXTS */}
      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Radio className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            {lang === 'bn' ? '১. হিরো সেকশন হেডলাইন, সাবটাইটেল ও বাটন' : '1. Hero Section Headings & Connect Button'}
          </h3>
        </div>

        {/* Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'হিরো টপ ব্যাজ (বাংলা)' : 'Hero Badge (Bengali)'}
            </label>
            <input
              type="text"
              value={heroBadgeBn}
              onChange={(e) => setHeroBadgeBn(e.target.value)}
              placeholder="⚡ কোয়ান্টাম শিল্ড ও ফ্রি-নেট"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'হিরো টপ ব্যাজ (ইংরেজি)' : 'Hero Badge (English)'}
            </label>
            <input
              type="text"
              value={heroBadgeEn}
              onChange={(e) => setHeroBadgeEn(e.target.value)}
              placeholder="⚡ Next-Gen Cyber Shield & FreeNet"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Main Headlines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'প্রধান হিরো শিরোনাম (বাংলা)' : 'Main Hero Headline (Bengali)'} *
            </label>
            <input
              type="text"
              value={heroHeadlineBn}
              onChange={(e) => setHeroHeadlineBn(e.target.value)}
              placeholder="অজেয় সাইবার নিরাপত্তা ও আনলিমিটেড ফ্রি-নেট সলিউশন"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'প্রধান হিরো শিরোনাম (ইংরেজি)' : 'Main Hero Headline (English)'}
            </label>
            <input
              type="text"
              value={heroHeadlineEn}
              onChange={(e) => setHeroHeadlineEn(e.target.value)}
              placeholder="Invincible Cyber Defense & Unlimited Free-Net Solution"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Subtitles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'হিরো সাবটাইটেল বিবরণ (বাংলা)' : 'Hero Subtitle (Bengali)'}
            </label>
            <textarea
              rows={2}
              value={heroSubheadlineBn}
              onChange={(e) => setHeroSubheadlineBn(e.target.value)}
              placeholder="সৌদি আরব, সংযুক্ত আরব আমিরাত, কাতার এবং বিশ্বব্যাপী..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'হিরো সাবটাইটেল বিবরণ (ইংরেজি)' : 'Hero Subtitle (English)'}
            </label>
            <textarea
              rows={2}
              value={heroSubheadlineEn}
              onChange={(e) => setHeroSubheadlineEn(e.target.value)}
              placeholder="Unrestricted browsing, ultra-low ping gaming..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>
        </div>

        {/* Connect Button Labels & Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'কানেক্ট বাটন টেক্সট (বাংলা)' : 'Connect Button (Bn)'}
            </label>
            <input
              type="text"
              value={connectBtnBn}
              onChange={(e) => setConnectBtnBn(e.target.value)}
              placeholder="১-ট্যাপ ভিপিএন কানেক্ট করুন"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'কানেক্ট বাটন টেক্সট (English)' : 'Connect Button (En)'}
            </label>
            <input
              type="text"
              value={connectBtnEn}
              onChange={(e) => setConnectBtnEn(e.target.value)}
              placeholder="1-Tap Quick Connect"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'স্ট্যাট স্পিড (যেমন 10 Gbps)' : 'Stat Speed'}
            </label>
            <input
              type="text"
              value={statSpeed}
              onChange={(e) => setStatSpeed(e.target.value)}
              placeholder="10 Gbps"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* 2. TOP SCROLLING TICKER */}
      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Zap className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            {lang === 'bn' ? '২. টপ স্ক্রোলিং নোটিশ ও অ্যানাউন্সমেন্ট বার' : '2. Top Scrolling Announcement Ticker'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'স্ক্রোলিং নোটিশ টেক্সট (বাংলা)' : 'Ticker Announcement (Bengali)'}
            </label>
            <input
              type="text"
              value={tickerBn}
              onChange={(e) => setTickerBn(e.target.value)}
              placeholder="🇸🇦 সৌদি আরব STC & Mobily 5G আনলিমিটেড ফ্রি-নেট..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'স্ক্রোলিং নোটিশ টেক্সট (ইংরেজি)' : 'Ticker Announcement (English)'}
            </label>
            <input
              type="text"
              value={tickerEn}
              onChange={(e) => setTickerEn(e.target.value)}
              placeholder="🇸🇦 Saudi Arabia STC & Mobily 5G Unlimited FreeNet..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* 3. WHATSAPP CHANNEL CALL-TO-ACTION */}
      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            {lang === 'bn' ? '৩. অফিসিয়াল WhatsApp চ্যানেল ব্যানার সেক্টর' : '3. Official WhatsApp Channel CTA Banner'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'চ্যানেল ব্যানার শিরোনাম (বাংলা)' : 'Channel Title (Bengali)'}
            </label>
            <input
              type="text"
              value={ctaTitleBn}
              onChange={(e) => setCtaTitleBn(e.target.value)}
              placeholder="যুক্ত হোন অফিসিয়াল WhatsApp চ্যানেলে..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'চ্যানেল ব্যানার শিরোনাম (ইংরেজি)' : 'Channel Title (English)'}
            </label>
            <input
              type="text"
              value={ctaTitleEn}
              onChange={(e) => setCtaTitleEn(e.target.value)}
              placeholder="Join Our Official WhatsApp Channel..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'সাবটাইটেল বিবরণ (বাংলা)' : 'Subtitle (Bengali)'}
            </label>
            <input
              type="text"
              value={ctaSubBn}
              onChange={(e) => setCtaSubBn(e.target.value)}
              placeholder="প্রতিদিনের ফ্রি ইন্টারনেট ট্রিক্স, নতুন নোড আপডেট..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'সাবটাইটেল বিবরণ (ইংরেজি)' : 'Subtitle (English)'}
            </label>
            <input
              type="text"
              value={ctaSubEn}
              onChange={(e) => setCtaSubEn(e.target.value)}
              placeholder="Get daily free internet configs, new server updates..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'বাটন টেক্সট (বাংলা)' : 'Button Label (Bengali)'}
            </label>
            <input
              type="text"
              value={ctaBtnBn}
              onChange={(e) => setCtaBtnBn(e.target.value)}
              placeholder="WhatsApp চ্যানেলে জয়েন করুন ➔"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'WhatsApp চ্যানেল লিংক (Channel URL)' : 'WhatsApp Channel Link'}
            </label>
            <input
              type="url"
              value={ctaChannelUrl}
              onChange={(e) => setCtaChannelUrl(e.target.value)}
              placeholder="https://whatsapp.com/channel/..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* 4. OFFICIAL CONTACTS & NUMBERS */}
      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Phone className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            {lang === 'bn' ? '৪. অফিসিয়াল যোগাযোগ ও সোশ্যাল হ্যান্ডেল' : '4. Official Contact Details'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'WhatsApp নাম্বার (আন্তর্জাতিক কোডসহ)' : 'WhatsApp Number (Country Code)'}
            </label>
            <input
              type="text"
              value={waNumber}
              onChange={(e) => setWaNumber(e.target.value)}
              placeholder="8801342930870"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'WhatsApp প্রদর্শনী নাম্বার' : 'WhatsApp Display Format'}
            </label>
            <input
              type="text"
              value={waDisplay}
              onChange={(e) => setWaDisplay(e.target.value)}
              placeholder="+880 1342-930870"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'টেলিগ্রাম চ্যানেল / সাপোর্ট লিংক' : 'Telegram URL'}
            </label>
            <input
              type="url"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="https://t.me/soverixnet_vpn"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">
              {lang === 'bn' ? 'অফিসিয়াল সাপোর্ট ইমেইল' : 'Official Support Email'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="soverixnet@gmail.com"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

    </form>
  );
};
