import React, { useState } from 'react';
import { 
  CustomPlanItem, 
  SiteSettingsData, 
  getSiteSettings, 
  saveSiteSettings 
} from '../../data/contact';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Crown, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  RotateCcw, 
  CheckCircle2, 
  Star,
  Sparkles
} from 'lucide-react';

interface VipPlansManagerProps {
  lang: 'en' | 'bn';
  onUpdated?: () => void;
}

const DEFAULT_VIP_PLANS: CustomPlanItem[] = [
  {
    id: 'turbo',
    name: 'Gaming Turbo 1-Month',
    nameBn: 'গেমিং টার্বো (১ মাস)',
    priceBdt: 150,
    priceSar: 6,
    periodBn: '/মাস',
    periodEn: '/mo',
    badgeBn: '১৫ms লো-পিং',
    badgeEn: '15ms Low Ping',
    isPopular: false,
    featuresBn: [
      '১৫ms আল্ট্রা-লো পিং গেমিং রুট',
      '৩টি ডিভাইস একসাথে কানেক্ট',
      'WireGuard ও Shadowsocks ১০Gbps',
      'BDIX হাই-স্পিড ক্যাশ বাইপাস',
      'ক্লিন-নেট অ্যাড ব্লকার যুক্ত',
    ],
    featuresEn: [
      '15ms Ultra-Low Ping Gaming Routes',
      '3 Simultaneous Device Connections',
      'WireGuard & Shadowsocks 10Gbps',
      'BDIX Ultra-Speed Routing',
      'CleanNet AdBlocker Included',
    ]
  },
  {
    id: 'cyber_pro',
    name: 'Cyber Pro 1-Year',
    nameBn: 'সাইবার প্রো (১ বছর)',
    priceBdt: 1950,
    priceSar: 65,
    periodBn: '/বছর',
    periodEn: '/yr',
    badgeBn: '🔥 সেরা ভ্যালু (Best Value)',
    badgeEn: '🔥 Best Value',
    isPopular: true,
    featuresBn: [
      '৫০+ প্রিমিয়াম গ্লোবাল নোড এক্সেস',
      '৫টি ডিভাইস একসাথে কানেক্ট',
      '4K/8K বাফারিং ছাড়া স্ট্রিমিং',
      'V2Ray VLESS Reality স্টিলথ মোড',
      '২৪/৭ প্রায়োরিটি কাস্টমার সাপোর্ট',
    ],
    featuresEn: [
      'All 50+ Global Server Locations',
      '5 Simultaneous Device Connections',
      '4K/8K Buffer-free Streaming Unlock',
      'V2Ray VLESS Reality Stealth DPI Bypass',
      '24/7 Priority Tech Support',
    ]
  },
  {
    id: 'lifetime',
    name: 'VIP Lifetime Pass',
    nameBn: 'ভিআইপি লাইফটাইম পাস (আজীবন)',
    priceBdt: 2499,
    priceSar: 85,
    periodBn: 'এককালীন',
    periodEn: 'one-time',
    badgeBn: '👑 মেগা লাইফটাইম ডিল',
    badgeEn: '👑 Elite Lifetime',
    isPopular: true,
    featuresBn: [
      'আজীবন কোনো মাসিক ফি ছাড়া আনলিমিটেড',
      '১০টি ডিভাইস সম্পূর্ণ লাইফটাইম সিঙ্ক',
      'NIST Kyber-1024 কোয়ান্টাম এনক্রিপশন',
      'আনলিমিটেড ব্যান্ডউইথ ও RAM সার্ভার',
      'জিরো-লগ অডিট ভেরিফাইড গ্যারান্টি',
    ],
    featuresEn: [
      'Lifetime Access with Zero Monthly Fees',
      '10 Device Simultaneous Slots',
      'NIST Kyber-1024 Quantum Shield',
      'Unlimited Bandwidth RAM-Only Server',
      'Zero-Log Certified Architecture',
    ]
  },
  {
    id: 'gulf_vip',
    name: 'Gulf SIM 5G FreeNet',
    nameBn: 'সৌদি ও আরব ৫জি স্পেশাল',
    priceBdt: 399,
    priceSar: 14,
    periodBn: '/৩ মাস',
    periodEn: '/3mo',
    badgeBn: '🇸🇦 সৌদি আরব স্পেশাল',
    badgeEn: '🇸🇦 Gulf SIM 5G',
    isPopular: false,
    featuresBn: [
      'STC, Mobily, Zain ০ ব্যালেন্স ফ্রি-নেট',
      'WhatsApp ও IMO ক্রিস্টাল কলিং আনব্লক',
      'কাস্টম SNI ও পেলোড অটো-ইনজেক্টর',
      'হাই-স্পিড ৫জি আনলিমিটেড ট্রাফিক',
    ],
    featuresEn: [
      'STC, Mobily & Zain zero balance bypass',
      'WhatsApp & IMO voice/video call unblock',
      'Custom SNI & Payload auto-injector',
      'High-speed 5G unlimited bandwidth',
    ]
  }
];

export const VipPlansManager: React.FC<VipPlansManagerProps> = ({ lang, onUpdated }) => {
  const [settings, setSettings] = useState<SiteSettingsData>(getSiteSettings());
  const plans = settings.customPlans && settings.customPlans.length > 0 ? settings.customPlans : DEFAULT_VIP_PLANS;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formNameBn, setFormNameBn] = useState('');
  const [formPriceBdt, setFormPriceBdt] = useState(150);
  const [formPriceSar, setFormPriceSar] = useState(6);
  const [formPeriodBn, setFormPeriodBn] = useState('/মাস');
  const [formPeriodEn, setFormPeriodEn] = useState('/mo');
  const [formBadgeBn, setFormBadgeBn] = useState('🔥 হট অফার');
  const [formBadgeEn, setFormBadgeEn] = useState('🔥 Hot Offer');
  const [formIsPopular, setFormIsPopular] = useState(false);
  const [formFeaturesBn, setFormFeaturesBn] = useState('১৫ms লো-পিং গেমিং\n৩টি ডিভাইস সিঙ্ক\nআনলিমিটেড স্পিড');
  const [formFeaturesEn, setFormFeaturesEn] = useState('15ms low ping\n3 devices sync\nUnlimited speed');

  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormName('VIP Custom Plan');
    setFormNameBn('ভিআইপি কাস্টম প্ল্যান');
    setFormPriceBdt(250);
    setFormPriceSar(9);
    setFormPeriodBn('/মাস');
    setFormPeriodEn('/mo');
    setFormBadgeBn('🔥 নতুন প্যাকেজ');
    setFormBadgeEn('🔥 New Package');
    setFormIsPopular(false);
    setFormFeaturesBn('সব ডিভাইসে চলবে\nহাই-স্পিড নোড\n২৪/৭ সাপোর্ট');
    setFormFeaturesEn('All devices supported\nHigh speed node\n24/7 Support');
    setModalOpen(true);
  };

  const handleOpenEdit = (p: CustomPlanItem) => {
    setEditingId(p.id);
    setFormName(p.name);
    setFormNameBn(p.nameBn || p.name);
    setFormPriceBdt(p.priceBdt);
    setFormPriceSar(p.priceSar || Math.round(p.priceBdt / 32));
    setFormPeriodBn(p.periodBn || '/মাস');
    setFormPeriodEn(p.periodEn || '/mo');
    setFormBadgeBn(p.badgeBn || '');
    setFormBadgeEn(p.badgeEn || '');
    setFormIsPopular(Boolean(p.isPopular));
    setFormFeaturesBn((p.featuresBn || []).join('\n'));
    setFormFeaturesEn((p.featuresEn || []).join('\n'));
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(lang === 'bn' ? `"${name}" প্যাকেজটি কি মুছে ফেলতে চান?` : `Delete plan "${name}"?`)) {
      return;
    }

    const updated = plans.filter((p) => p.id !== id);
    const newSettings = saveSiteSettings({ customPlans: updated });
    setSettings(newSettings);
    try {
      await setDoc(doc(db, 'settings', 'general'), { customPlans: updated }, { merge: true });
    } catch {}
    setNotice(lang === 'bn' ? 'প্যাকেজটি মুছে ফেলা হয়েছে।' : 'Plan deleted.');
    setTimeout(() => setNotice(null), 3000);
    onUpdated?.();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const featBn = formFeaturesBn.split('\n').map((s) => s.trim()).filter(Boolean);
    const featEn = formFeaturesEn.split('\n').map((s) => s.trim()).filter(Boolean);

    let updated: CustomPlanItem[];

    if (editingId) {
      updated = plans.map((p) => {
        if (p.id === editingId) {
          return {
            ...p,
            name: formName.trim(),
            nameBn: formNameBn.trim() || formName.trim(),
            priceBdt: Number(formPriceBdt),
            priceSar: Number(formPriceSar),
            periodBn: formPeriodBn.trim(),
            periodEn: formPeriodEn.trim(),
            badgeBn: formBadgeBn.trim(),
            badgeEn: formBadgeEn.trim(),
            isPopular: formIsPopular,
            featuresBn: featBn,
            featuresEn: featEn,
          };
        }
        return p;
      });
    } else {
      const newPlan: CustomPlanItem = {
        id: 'plan-' + Date.now(),
        name: formName.trim(),
        nameBn: formNameBn.trim() || formName.trim(),
        priceBdt: Number(formPriceBdt),
        priceSar: Number(formPriceSar),
        periodBn: formPeriodBn.trim(),
        periodEn: formPeriodEn.trim(),
        badgeBn: formBadgeBn.trim(),
        badgeEn: formBadgeEn.trim(),
        isPopular: formIsPopular,
        featuresBn: featBn,
        featuresEn: featEn,
      };
      updated = [...plans, newPlan];
    }

    const newSettings = saveSiteSettings({ customPlans: updated });
    setSettings(newSettings);
    try {
      await setDoc(doc(db, 'settings', 'general'), { customPlans: updated }, { merge: true });
    } catch {}

    setIsSaving(false);
    setModalOpen(false);
    setNotice(lang === 'bn' ? 'ভিআইপি প্ল্যান তালিকা সফলভাবে সেভ হয়েছে!' : 'VIP plans saved successfully!');
    setTimeout(() => setNotice(null), 3500);
    onUpdated?.();
  };

  const handleReset = async () => {
    if (confirm(lang === 'bn' ? 'সব প্যাকেজ কি ডিফল্ট মানে রিসেট করবেন?' : 'Reset all plans to default?')) {
      const newSettings = saveSiteSettings({ customPlans: DEFAULT_VIP_PLANS });
      setSettings(newSettings);
      try {
        await setDoc(doc(db, 'settings', 'general'), { customPlans: DEFAULT_VIP_PLANS }, { merge: true });
      } catch {}
      setNotice(lang === 'bn' ? 'ডিফল্ট প্ল্যানে রিসেট করা হয়েছে।' : 'Reset to default plans.');
      setTimeout(() => setNotice(null), 3000);
      onUpdated?.();
    }
  };

  return (
    <div className="space-y-6">
      
      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="p-1 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#171004] via-slate-950 to-[#0e1627] border border-amber-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-2">
            <Crown className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ভিআইপি প্ল্যান ও প্রাইসিং প্যাকেজ ম্যানেজার' : 'VIP Plans & Pricing Hub'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {lang === 'bn' ? 'প্যাকেজের মূল্য, নাম ও ফিচার পরিবর্তন' : 'Manage Subscription Plans & Prices'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'bn' 
              ? '১ মাস, ১ বছর, লাইফটাইম প্যাকেজের দাম (৳ টাকা ও SAR রিয়াল), ব্যাজ ও ফিচার বুলেট পয়েন্ট পরিবর্তন বা নতুন প্ল্যান যোগ করুন।' 
              : 'Add custom packages, edit prices in BDT and SAR, features list, and WhatsApp activation link.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleReset}
            className="py-2.5 px-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ডিফল্ট রিসেট' : 'Reset'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{lang === 'bn' ? 'নতুন প্ল্যান যোগ করুন' : 'Add New Plan'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`rounded-3xl border p-5 flex flex-col justify-between transition-all duration-300 relative ${
              p.isPopular
                ? 'bg-gradient-to-b from-amber-950/20 via-slate-950 to-slate-950 border-amber-500/50 shadow-xl'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 truncate">
                  {lang === 'bn' ? p.badgeBn : p.badgeEn}
                </span>

                {p.isPopular && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>Popular</span>
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-black text-white">{lang === 'bn' ? p.nameBn : p.name}</h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-white">৳{p.priceBdt}</span>
                  <span className="text-xs text-slate-400 font-mono">({p.priceSar} SAR)</span>
                  <span className="text-xs text-slate-400">{lang === 'bn' ? p.periodBn : p.periodEn}</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
                {(lang === 'bn' ? p.featuresBn : p.featuresEn).map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenEdit(p)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'এডিট' : 'Edit'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDelete(p.id, p.nameBn || p.name)}
                className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 transition-all cursor-pointer"
                title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl my-auto rounded-3xl bg-[#070e1c] border border-amber-500/40 shadow-2xl p-6 text-slate-200 animate-scale-up space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">
                  {editingId ? (lang === 'bn' ? 'প্ল্যান এডিট করুন' : 'Edit Plan') : (lang === 'bn' ? 'নতুন প্ল্যান যোগ করুন' : 'Add New Plan')}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'প্ল্যানের নাম (বাংলা)' : 'Plan Name (Bengali)'} *
                  </label>
                  <input
                    type="text"
                    value={formNameBn}
                    onChange={(e) => setFormNameBn(e.target.value)}
                    placeholder="যেমন: গেমিং টার্বো (১ মাস)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'প্ল্যানের নাম (ইংরেজি)' : 'Plan Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Gaming Turbo 1-Month"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'মূল্য (বাংলাদেশি ৳ টাকা)' : 'Price (BDT ৳)'} *
                  </label>
                  <input
                    type="number"
                    value={formPriceBdt}
                    onChange={(e) => setFormPriceBdt(Number(e.target.value))}
                    placeholder="150"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'মূল্য (সৌদি SAR রিয়াল)' : 'Price (SAR)'} *
                  </label>
                  <input
                    type="number"
                    value={formPriceSar}
                    onChange={(e) => setFormPriceSar(Number(e.target.value))}
                    placeholder="6"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'প্যাকেজের মেয়াদ' : 'Period Text'}
                  </label>
                  <input
                    type="text"
                    value={formPeriodBn}
                    onChange={(e) => setFormPeriodBn(e.target.value)}
                    placeholder="/মাস বা /বছর বা এককালীন"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'ব্যাজ ট্যাগ (বাংলা)' : 'Badge (Bengali)'}
                  </label>
                  <input
                    type="text"
                    value={formBadgeBn}
                    onChange={(e) => setFormBadgeBn(e.target.value)}
                    placeholder="🔥 সেরা অফার"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {lang === 'bn' ? 'ব্যাজ ট্যাগ (ইংরেজি)' : 'Badge (English)'}
                  </label>
                  <input
                    type="text"
                    value={formBadgeEn}
                    onChange={(e) => setFormBadgeEn(e.target.value)}
                    placeholder="🔥 Best Deal"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'সুবিধাসমূহ (বাংলা - প্রতি লাইনে একটি)' : 'Features (Bn - 1 per line)'}
                </label>
                <textarea
                  rows={3}
                  value={formFeaturesBn}
                  onChange={(e) => setFormFeaturesBn(e.target.value)}
                  placeholder="১৫ms লো-পিং&#10;৩টি ডিভাইস সিঙ্ক&#10;আনলিমিটেড স্পিড"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formPlanPopular"
                  checked={formIsPopular}
                  onChange={(e) => setFormIsPopular(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="formPlanPopular" className="text-slate-300 font-bold cursor-pointer">
                  {lang === 'bn' ? 'এই প্যাকেজটিতে "Popular / হাইলাইট" গোল্ডেন বর্ডার দিন' : 'Highlight as "Popular"'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-900 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{lang === 'bn' ? 'প্যাকেজ সেভ করুন' : 'Save Plan'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
