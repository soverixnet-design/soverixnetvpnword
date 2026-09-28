import React, { useState } from 'react';
import { 
  Briefcase, 
  Crown, 
  Check, 
  Copy, 
  ArrowRight, 
  Zap, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  MessageSquare,
  BadgePercent,
  Layers,
  Award
} from 'lucide-react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CONTACT_CONFIG } from '../data/contact';
import confetti from 'canvas-confetti';

interface ResellerPageViewProps {
  lang: 'bn' | 'en';
  onNavigateToTab?: (tab: string) => void;
}

const WHOLESALE_TIERS = [
  {
    id: 'silver',
    nameBn: 'সিলভার রিসেলার (Silver)',
    nameEn: 'Silver Reseller',
    pinRange: '১০ - ২৫ টি পিন',
    priceSar: '৭ SAR / পিন',
    priceBdt: '১৮০ BDT / পিন',
    margin: '৫০% প্রফিট মার্জিন',
    badge: 'শুরু করার জন্য সেরা',
    color: 'slate',
    featuresBn: [
      '১০টি পিনের সাব-প্যানেল ক্রেডিট',
      'সৌদি আরব ও GCC সব সার্ভার এক্সেস',
      '২৪/৭ সার্ভার মনিটরিং ও গাইড',
      'গ্রাহক রিপ্লেসমেন্ট সাপোর্ট'
    ]
  },
  {
    id: 'gold',
    nameBn: 'গোল্ড রিসেলার (Gold)',
    nameEn: 'Gold Reseller',
    pinRange: '৫০ - ৯৯ টি পিন',
    priceSar: '৬ SAR / পিন',
    priceBdt: '১৫০ BDT / পিন',
    margin: '৬৫% উচ্চ মুনাফা',
    badge: 'সবচেয়ে জনপ্রিয়',
    color: 'amber',
    popular: true,
    featuresBn: [
      '৫০টি পিনের ফুল রিসেলার ড্যাশবোর্ড',
      'নিজস্ব গ্রাহক ম্যানেজমেন্ট ও রিনিউয়াল',
      'প্রাইভেট ভিআইপি সার্ভার লিঙ্ক',
      'হোলসেল প্রাইস লক গ্যারান্টি'
    ]
  },
  {
    id: 'platinum',
    nameBn: 'প্লাটিনাম রিসেলার (Platinum)',
    nameEn: 'Platinum Reseller',
    pinRange: '১০০ - ২৪৯ টি পিন',
    priceSar: '৫ SAR / পিন',
    priceBdt: '১২০ BDT / পিন',
    margin: '৭৫% সর্বোচ্চ মার্জিন',
    badge: 'সুপার ডিলার',
    color: 'cyan',
    featuresBn: [
      '১০০টি পিনের মাস্টার প্যানেল',
      'সাব-রিসেলার তৈরি করার ক্ষমতা',
      '১০ Gbps ডেডিকেটেড ভিআইপি নোডস',
      'অগ্রাধিকার ভিআইপি সাপোর্ট গ্রুপ'
    ]
  },
  {
    id: 'master',
    nameBn: 'মাস্টার ওনার রিসেলার (Master)',
    nameEn: 'Master Reseller',
    pinRange: '৫০০+ টি পিন',
    priceSar: '৪ SAR / পিন',
    priceBdt: '১০০ BDT / পিন',
    margin: '৮৫% মেগা হোলসেল',
    badge: 'বিজনেস ডিস্ট্রিবিউটর',
    color: 'purple',
    featuresBn: [
      'আনলিমিটেড সাব-রিসেলার ও ভাউচার',
      'কাস্টম ব্রান্ডেড এপিকে সাপোর্ট',
      'সরাসরি এডমিন সাপোর্ট হটলাইন',
      'মাসিক ক্যাশব্যাক রিওয়ার্ডস'
    ]
  }
];

export const ResellerPageView: React.FC<ResellerPageViewProps> = ({ 
  lang,
  onNavigateToTab 
}) => {
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantCountry, setApplicantCountry] = useState('সৌদি আরব');
  const [expectedPins, setExpectedPins] = useState('৫০ পিন (গোল্ড রিসেলার)');
  const [experienceLevel, setExperienceLevel] = useState('আমি আগে ভিপিএন ব্যবসা করেছি (অভিজ্ঞ)');
  const [additionalMessage, setAdditionalMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedApp, setCompletedApp] = useState<{
    appId: string;
    name: string;
    phone: string;
    country: string;
    pins: string;
    experience: string;
    message: string;
    createdAt: string;
  } | null>(null);

  const [copiedAppId, setCopiedAppId] = useState(false);

  const handleCopyAppId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedAppId(true);
    setTimeout(() => setCopiedAppId(false), 2000);
  };

  const generateWhatsAppMessage = (app: typeof completedApp) => {
    if (!app) return '';
    return lang === 'bn'
      ? `💼 *নতুন রিসেলার আবেদন (Soverixnet Wholesale Application)*
━━━━━━━━━━━━━━━━━━━━━
🆔 *Application ID:* ${app.appId}
👤 *নাম:* ${app.name}
📱 *WhatsApp:* ${app.phone}
🌍 *দেশ / শহর:* ${app.country}
📦 *পিনের পরিমাণ:* ${app.pins}
💼 *অভিজ্ঞতা:* ${app.experience}
💬 *নোট:* ${app.message || 'রিসেলার প্যানেল এক্টিভ করতে চাই'}
━━━━━━━━━━━━━━━━━━━━━
আসসালামু আলাইকুম সোভারিক্সনেট, আমি রিসেলার আবেদন সাবমিট করেছি। দয়া করে আমার আবেদনটি অনুমোদন করে রিসেলার রেট ও পোর্টাল লগইন বুঝিয়ে দিন। ধন্যবাদ!`
      : `💼 *New Reseller Application (Soverixnet Wholesale)*
━━━━━━━━━━━━━━━━━━━━━
🆔 *App ID:* ${app.appId}
👤 *Name:* ${app.name}
📱 *WhatsApp:* ${app.phone}
🌍 *Country:* ${app.country}
📦 *Tier:* ${app.pins}
💼 *Experience:* ${app.experience}
━━━━━━━━━━━━━━━━━━━━━
Hello Soverixnet, I submitted a wholesale reseller application. Please approve my panel and provide login credentials. Thank you!`;
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantPhone.trim()) {
      alert(lang === 'bn' ? 'দয়া করে আপনার নাম এবং হোয়াটসঅ্যাপ নম্বর লিখুন।' : 'Please enter your name and WhatsApp number.');
      return;
    }

    setIsSubmitting(true);
    const appId = `SOV-RSL-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    const applicationPayload = {
      appId,
      name: applicantName.trim(),
      phone: applicantPhone.trim(),
      country: applicantCountry.trim(),
      pins: expectedPins,
      experience: experienceLevel,
      message: additionalMessage.trim(),
      status: 'pending_approval',
      createdAt: nowIso,
    };

    try {
      await setDoc(doc(db, 'resellerApplications', appId), applicationPayload);
    } catch (err) {
      console.warn('Direct firestore save note (fallback mode):', err);
    }

    setCompletedApp(applicationPayload);
    setIsSubmitting(false);

    try {
      confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
    } catch {}
  };

  const handleOpenWhatsAppForApp = (app: typeof completedApp) => {
    if (!app) return;
    const msg = generateWhatsAppMessage(app);
    const url = CONTACT_CONFIG.getWhatsAppUrl(msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-slate-100">
      
      {/* Hero Header */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-[#030712] border border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'bn' ? 'সোভারিক্সনেট হোলসেল রিসেলার প্রোগ্রাম' : 'Soverixnet Wholesale Reseller Program'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {lang === 'bn' ? 'ভিপিএন রিসেলার ব্যবসা শুরু করুন — সর্বোচ্চ মুনাফা' : 'Start Your VPN Reseller Business with Maximum Profit'}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {lang === 'bn' 
              ? 'সৌদি আরব (STC, Mobily, Zain), দুবাই, ওমান, কুয়েত, মালয়েশিয়া ও বাংলাদেশের জন্য পাইকারি রেটে পিন কিনুন। নিজস্ব গ্রাহকদের ১-সেকেন্ডে পিন দিন এবং প্রতি মাসে ৫০,০০০ - ২,০০,০০০ টাকা পর্যন্ত আয় করুন।' 
              : 'Buy wholesale VPN PINs at the lowest rates. Issue instant customer passes, manage subscribers, and scale your business effortlessly.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Check className="w-4 h-4" />
              <span>১-সেকেন্ডে পিন তৈরি</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
              <Check className="w-4 h-4" />
              <span>সাব-রিসেলার তৈরি সুবিধা</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Check className="w-4 h-4" />
              <span>১০০% ব্যালেন্স ও রিপ্লেসমেন্ট সেফটি</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wholesale Tier Rate Cards */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            পাইকারি রেট ও প্রফিট মার্জিন তালিকা (Wholesale Pricing Tiers)
          </h3>
          <p className="text-xs text-slate-400">
            যত বেশি পিন অর্ডার করবেন, তত কম রেট এবং বেশি প্রফিট পাবেন।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WHOLESALE_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`p-5 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative ${
                tier.popular
                  ? 'bg-gradient-to-b from-amber-950/40 to-slate-900 border-amber-500/50 shadow-xl shadow-amber-950/40 ring-1 ring-amber-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-[10px] uppercase tracking-wider shadow-md">
                  {tier.badge}
                </div>
              )}

              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase">
                  {tier.pinRange}
                </span>
                <h4 className="text-base font-black text-white mt-1">
                  {tier.nameBn}
                </h4>

                <div className="mt-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-xl font-black text-amber-400 font-mono">
                    {tier.priceSar}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    ({tier.priceBdt})
                  </div>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    {tier.margin}
                  </span>
                </div>

                <div className="space-y-2 mt-4 text-xs text-slate-300">
                  {tier.featuresBn.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    setExpectedPins(`${tier.pinRange} (${tier.nameBn})`);
                    const formEl = document.getElementById('reseller-apply-form');
                    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                    tier.popular
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  এই টিয়ারে আবেদন করুন
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Reseller Application Form Section */}
      <div id="reseller-apply-form" className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-2xl space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl sm:text-2xl font-black text-white">
              রিসেলার প্যানেল আবেদন ফর্ম (Apply for Wholesale Panel)
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            নিচের ফর্মটি পূরণ করে সাবমিট করুন। স্বয়ংক্রিয়ভাবে একটি Application ID তৈরি হবে এবং সরাসরি WhatsApp এ আমাদের সাথে কথা বলে ১ মিনিটে প্যানেল বুঝে নিন।
          </p>
        </div>

        <form onSubmit={handleSubmitApplication} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              আপনার পুরো নাম (Full Name) *
            </label>
            <input
              type="text"
              required
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              placeholder="যেমন: রাশেদুল ইসলাম"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              আপনার WhatsApp নম্বর (Active WhatsApp Number) *
            </label>
            <input
              type="text"
              required
              value={applicantPhone}
              onChange={(e) => setApplicantPhone(e.target.value)}
              placeholder="যেমন: +966 50 123 4567 বা +88017..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              আপনার বর্তমান দেশ / শহর (Country / Location)
            </label>
            <input
              type="text"
              value={applicantCountry}
              onChange={(e) => setApplicantCountry(e.target.value)}
              placeholder="যেমন: রিয়াদ / দুবাই / কুয়ালালামপুর / ঢাকা / মাস্কাট"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              কতগুলো পিন দিয়ে শুরু করতে চান? (Target PIN Tier)
            </label>
            <select
              value={expectedPins}
              onChange={(e) => setExpectedPins(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="১০ - ২৫ পিন (সিলভার রিসেলার)">১০ - ২৫ পিন (সিলভার রিসেলার)</option>
              <option value="৫০ পিন (গোল্ড রিসেলার)">৫০ পিন (গোল্ড রিসেলার)</option>
              <option value="১০০ পিন (প্লাটিনাম রিসেলার)">১০০ পিন (প্লাটিনাম রিসেলার)</option>
              <option value="৫০০+ পিন (মাস্টার ডিস্ট্রিবিউটর)">৫০০+ পিন (মাস্টার ডিস্ট্রিবিউটর)</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              আপনার আগের অভিজ্ঞতা (Experience in VPN Business)
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="আমি আগে ভিপিএন ব্যবসা করেছি (অভিজ্ঞ)">আমি আগে ভিপিএন ব্যবসা করেছি (অভিজ্ঞ)</option>
              <option value="আমি সম্পূর্ণ নতুন, গাইডলাইন প্রয়োজন">আমি সম্পূর্ণ নতুন, গাইডলাইন প্রয়োজন</option>
              <option value="আমার নিজস্ব দোকান বা কাস্টমার বেস আছে">আমার নিজস্ব দোকান বা কাস্টমার বেস আছে</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              অতিরিক্ত কোনো প্রশ্ন বা মেসেজ (Optional Note)
            </label>
            <textarea
              rows={2}
              value={additionalMessage}
              onChange={(e) => setAdditionalMessage(e.target.value)}
              placeholder="যেমন: দ্রুত রেট ও পোর্টাল লগইন পেতে চাই..."
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all transform hover:scale-[1.01] cursor-pointer"
            >
              {isSubmitting ? (
                <span>আবেদন প্রসেস হচ্ছে...</span>
              ) : (
                <>
                  <Briefcase className="w-4 h-4 text-black" />
                  <span>রিসেলার আবেদন সাবমিট করুন (Submit Reseller Application)</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Confirmation Modal */}
      {completedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#070e1c] border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-4">
            
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
              <Crown className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase">
                আবেদন জমা হয়েছে (Application Submitted)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                রিসেলার Application ID তৈরি হয়েছে!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                প্যানেল অ্যাক্টিভ ও ক্রেডিট লোড করতে এখনই হোয়াটসঅ্যাপে মেসেজ দিন।
              </p>
            </div>

            {/* Application Details */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Application ID:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-amber-400">{completedApp.appId}</span>
                  <button
                    onClick={() => handleCopyAppId(completedApp.appId)}
                    className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    title="কপি করুন"
                  >
                    {copiedAppId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">নাম:</span>
                <span className="font-bold text-white">{completedApp.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">WhatsApp:</span>
                <span className="font-mono text-white">{completedApp.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">টার্গেট পিন:</span>
                <span className="text-amber-300 font-bold">{completedApp.pins}</span>
              </div>
            </div>

            {/* Giant WhatsApp action button */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleOpenWhatsAppForApp(completedApp)}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 transition-all cursor-pointer transform hover:scale-[1.02]"
              >
                <MessageSquare className="w-5 h-5 text-slate-950" />
                <span>💬 হোয়াটসঅ্যাপে রিসেলার প্যানেল নিন (Get Panel on WA)</span>
              </button>

              <button
                onClick={() => setCompletedApp(null)}
                className="w-full py-2.5 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                পপ-আপ বন্ধ করুন (Close)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
