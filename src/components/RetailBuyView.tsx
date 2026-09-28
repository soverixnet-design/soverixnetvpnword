import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Check, 
  Copy, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  User, 
  Phone, 
  Zap, 
  Sparkles,
  AlertCircle,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CONTACT_CONFIG } from '../data/contact';
import confetti from 'canvas-confetti';

interface RetailBuyViewProps {
  lang: 'bn' | 'en';
  initialCountry?: string;
  onNavigateToTab?: (tab: string) => void;
}

interface CountryOption {
  id: string;
  nameBn: string;
  nameEn: string;
  flag: string;
  sims: string;
  currency: string;
  sarRate: number; // relative currency rate to SAR
  bdtRate: number;
}

const COUNTRIES: CountryOption[] = [
  { id: 'saudi', nameBn: 'সৌদি আরব', nameEn: 'Saudi Arabia', flag: '🇸🇦', sims: 'STC, Mobily, Zain, Jawwy, Red Bull', currency: 'SAR', sarRate: 1, bdtRate: 32 },
  { id: 'uae', nameBn: 'সংযুক্ত আরব আমিরাত (দুবাই)', nameEn: 'UAE (Dubai & Abu Dhabi)', flag: '🇦🇪', sims: 'du, Etisalat (e&), Virgin Mobile', currency: 'AED', sarRate: 1, bdtRate: 32 },
  { id: 'oman', nameBn: 'ওমান', nameEn: 'Oman', flag: '🇴🇲', sims: 'Omantel, Ooredoo, Vodafone, Friendi', currency: 'OMR', sarRate: 0.1, bdtRate: 310 },
  { id: 'kuwait', nameBn: 'কুয়েত', nameEn: 'Kuwait', flag: '🇰🇼', sims: 'Zain, Ooredoo, STC Kuwait', currency: 'KWD', sarRate: 0.08, bdtRate: 390 },
  { id: 'malaysia', nameBn: 'মালয়েশিয়া (মালোশিয়া)', nameEn: 'Malaysia', flag: '🇲🇾', sims: 'CelcomDigi, Maxis Hotlink, U Mobile, Yes 5G, Tune Talk', currency: 'MYR', sarRate: 1.25, bdtRate: 26 },
  { id: 'qatar', nameBn: 'কাতার', nameEn: 'Qatar', flag: '🇶🇦', sims: 'Ooredoo Qatar, Vodafone', currency: 'QAR', sarRate: 1, bdtRate: 32 },
  { id: 'bahrain', nameBn: 'বাহরাইন', nameEn: 'Bahrain', flag: '🇧🇭', sims: 'Batelco, STC Bahrain, Zain', currency: 'BHD', sarRate: 0.1, bdtRate: 315 },
  { id: 'bangladesh', nameBn: 'বাংলাদেশ', nameEn: 'Bangladesh', flag: '🇧🇩', sims: 'GP, Robi, Banglalink, Teletalk, WiFi', currency: 'BDT', sarRate: 32, bdtRate: 1 },
];

const PACKAGES = [
  { id: '1m', nameBn: '১ মাস ভিআইপি পিন (1 Month VIP)', nameEn: '1 Month VIP PIN', baseSar: 15, baseBdt: 350, badgeBn: '🔥 হট সেলিং' },
  { id: '3m', nameBn: '৩ মাস ভিআইপি পিন (3 Months VIP)', nameEn: '3 Months VIP PIN', baseSar: 40, baseBdt: 950, badgeBn: '⚡ জনপ্রিয়' },
  { id: '6m', nameBn: '৬ মাস সুপার সেভার (6 Months VIP)', nameEn: '6 Months Super Saver', baseSar: 75, baseBdt: 1800, badgeBn: '💰 ছাড়' },
  { id: '1y', nameBn: '১ বছর আনলিমিটেড (1 Year Unlimited)', nameEn: '1 Year Unlimited VIP', baseSar: 130, baseBdt: 3200, badgeBn: '👑 মেগা অফার' },
];

const PAYMENT_METHODS = [
  { id: 'bkash', nameBn: 'বিকাশ (bKash Personal / Send Money)', nameEn: 'bKash Personal' },
  { id: 'nagad', nameBn: 'নগদ (Nagad Personal)', nameEn: 'Nagad Personal' },
  { id: 'rocket', nameBn: 'রকেট (Rocket)', nameEn: 'Rocket' },
  { id: 'tng_duitnow', nameBn: "Touch 'n Go / DuitNow (মালয়েশিয়া)", nameEn: "Touch 'n Go / DuitNow (Malaysia)" },
  { id: 'stc_pay', nameBn: 'STC Pay (সৌদি আরব)', nameEn: 'STC Pay (Saudi Arabia)' },
  { id: 'alrajhi', nameBn: 'আল রাজি ব্যাংক / Urpay (সৌদি আরব)', nameEn: 'Al Rajhi / Urpay' },
  { id: 'binance', nameBn: 'Binance USDT (ক্রিপ্টো)', nameEn: 'Binance USDT (Crypto)' },
];

export const RetailBuyView: React.FC<RetailBuyViewProps> = ({ 
  lang, 
  initialCountry = 'saudi',
  onNavigateToTab 
}) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>(initialCountry);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('1m');
  const [pinQuantity, setPinQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('bkash');
  const [orderNotes, setOrderNotes] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    countryName: string;
    packageName: string;
    quantity: number;
    totalSar: number;
    totalBdt: number;
    name: string;
    phone: string;
    payment: string;
    createdAt: string;
  } | null>(null);
  
  const [copiedOrderId, setCopiedOrderId] = useState<boolean>(false);

  const selectedCountry = COUNTRIES.find(c => c.id === selectedCountryId) || COUNTRIES[0];
  const selectedPackage = PACKAGES.find(p => p.id === selectedPackageId) || PACKAGES[0];

  const totalSar = selectedPackage.baseSar * pinQuantity;
  const totalBdt = selectedPackage.baseBdt * pinQuantity;

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const handleGenerateWhatsAppMessage = (orderData: typeof completedOrder) => {
    if (!orderData) return '';
    return lang === 'bn'
      ? `🛒 *নতুন ভিপিএন পিন অর্ডার (Soverixnet Retail Order)*
━━━━━━━━━━━━━━━━━━━━━
🆔 *Order ID:* ${orderData.orderId}
🌍 *দেশ:* ${orderData.countryName}
📦 *প্যাকেজ:* ${orderData.packageName}
🔢 *পরিমাণ:* ${orderData.quantity} টি পিন
💵 *মূল্য:* ${orderData.totalSar} SAR / ৳${orderData.totalBdt} BDT
👤 *গ্রাহকের নাম:* ${orderData.name}
📱 *গ্রাহক WhatsApp:* ${orderData.phone}
💳 *পেমেন্ট মাধ্যম:* ${orderData.payment}
━━━━━━━━━━━━━━━━━━━━━
আসসালামু আলাইকুম সোভারিক্সনেট, আমি ওয়েবসাইটে অর্ডার সাবমিট করেছি। দয়া করে আমার পিন কোড ও সেটআপ গাইড পাঠিয়ে দিন। ধন্যবাদ!`
      : `🛒 *New VPN PIN Order (Soverixnet Retail)*
━━━━━━━━━━━━━━━━━━━━━
🆔 *Order ID:* ${orderData.orderId}
🌍 *Country:* ${orderData.countryName}
📦 *Package:* ${orderData.packageName}
🔢 *Quantity:* ${orderData.quantity} PIN(s)
💵 *Price:* ${orderData.totalSar} SAR / ${orderData.totalBdt} BDT
👤 *Customer Name:* ${orderData.name}
📱 *Customer WhatsApp:* ${orderData.phone}
💳 *Payment Method:* ${orderData.payment}
━━━━━━━━━━━━━━━━━━━━━
Hello Soverixnet, I have submitted an order online. Please send my PIN and setup instructions. Thank you!`;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert(lang === 'bn' ? 'দয়া করে আপনার নাম এবং মোবাইল/হোয়াটসঅ্যাপ নম্বর দিন।' : 'Please enter your name and phone/WhatsApp number.');
      return;
    }

    setIsSubmitting(true);
    const orderId = `SOV-ORD-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    const orderPayload = {
      orderId,
      countryId: selectedCountry.id,
      countryName: selectedCountry.nameBn,
      packageId: selectedPackage.id,
      packageName: selectedPackage.nameBn,
      quantity: pinQuantity,
      totalSar,
      totalBdt,
      name: customerName.trim(),
      phone: customerPhone.trim(),
      payment: paymentMethod,
      notes: orderNotes.trim(),
      status: 'pending',
      createdAt: nowIso,
    };

    try {
      // Save directly to Firestore collection retailOrders
      await setDoc(doc(db, 'retailOrders', orderId), orderPayload);
    } catch (err) {
      console.warn('Direct firestore save note (fallback mode):', err);
    }

    setCompletedOrder(orderPayload);
    setIsSubmitting(false);

    try {
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
    } catch {}
  };

  const handleOpenWhatsAppForOrder = (orderData: typeof completedOrder) => {
    if (!orderData) return;
    const msg = handleGenerateWhatsAppMessage(orderData);
    const url = CONTACT_CONFIG.getWhatsAppUrl(msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-100">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-[#030712] border border-emerald-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'অফিশিয়াল রিটেইল পিন অর্ডার ফর্ম' : 'Official Retail PIN Order'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {lang === 'bn' ? '১-ক্লিকে ভিপিএন পিন অর্ডার করুন' : 'Instant Retail VPN PIN Order'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {lang === 'bn' 
                ? 'সৌদি আরব, আরব আমিরাত, ওমান, কুয়েত, মালয়েশিয়া (মালোশিয়া), কাতার ও বাংলাদেশের জন্য ১টি বা একাধিক পিন অর্ডার করুন। অর্ডার সাবমিট করলে ৬০ সেকেন্ডে হোয়াটসঅ্যাপে পিন পেয়ে যাবেন।'
                : 'Buy 1 or multiple pins for Saudi Arabia, UAE, Oman, Kuwait, Malaysia, Qatar, and Bangladesh with instant 60-second delivery on WhatsApp.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">ডেলিভারি সময়</span>
              <span className="text-base font-black text-emerald-400">৬০ সেকেন্ড</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">রিপ্লেসমেন্ট গ্যারান্টি</span>
              <span className="text-base font-black text-cyan-400">১০০% লাইভ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Order Form Grid */}
      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Selections (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Step 1: Select Country */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span>১. কান্ট্রি সিলেক্ট করুন (Select Country)</span>
              </span>
              <span className="text-[11px] text-slate-400">সব মধ্যপ্রাচ্য ও বাংলাদেশ</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
              {COUNTRIES.map((country) => {
                const isSelected = country.id === selectedCountryId;
                return (
                  <button
                    key={country.id}
                    type="button"
                    onClick={() => setSelectedCountryId(country.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-400 shadow-md shadow-emerald-950/40 scale-[1.02]'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{country.flag}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="mt-2">
                      <span className="text-xs font-black text-white block truncate">
                        {lang === 'bn' ? country.nameBn : country.nameEn}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                        {country.sims}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Package */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <span>২. প্যাকেজ মেয়াদ পছন্দ করুন (Choose Package)</span>
              </span>
              <span className="text-[11px] text-slate-400">সব প্যাকেজেই হাই-স্পিড নো-বাফার</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {PACKAGES.map((pkg) => {
                const isSelected = pkg.id === selectedPackageId;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-950/40 scale-[1.01]'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {pkg.badgeBn}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>

                    <h4 className="text-sm font-black text-white mt-2.5">
                      {lang === 'bn' ? pkg.nameBn : pkg.nameEn}
                    </h4>

                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-lg font-black text-cyan-300 font-mono">
                        {pkg.baseSar} {selectedCountry.currency === 'BDT' ? 'SAR' : selectedCountry.currency}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        / ৳{pkg.baseBdt} BDT
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Customer Details */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
              ৩. আপনার যোগাযোগের তথ্য (Customer Information)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>আপনার নাম (Your Name) *</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="যেমন: মোঃ সাকিব হাসান"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>মোবাইল বা WhatsApp নম্বর *</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="যেমন: +966 50 123 4567 বা +88017..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>পেমেন্ট মাধ্যম (Payment Method)</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.id} value={method.nameBn}>
                    {lang === 'bn' ? method.nameBn : method.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                বিশেষ কোনো নোট বা সিমের বিবরণ (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="যেমন: STC সিমে চালাব, দ্রুত পিন দিন"
                className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Checkout Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="sticky top-24 p-5 sm:p-6 rounded-3xl bg-slate-900/95 border border-emerald-500/40 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                অর্ডার সারাংশ (Order Summary)
              </span>
              <span className="text-2xl">{selectedCountry.flag}</span>
            </div>

            {/* Selected details */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">দেশ:</span>
                <span className="font-bold text-white">{selectedCountry.nameBn}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">প্যাকেজ:</span>
                <span className="font-bold text-white truncate max-w-[160px] text-right">{selectedPackage.nameBn}</span>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-400">পিনের সংখ্যা:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPinQuantity(prev => Math.max(1, prev - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-white w-6 text-center">{pinQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setPinQuantity(prev => Math.min(20, prev + 1))}
                    className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing total */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-center">
              <span className="text-[11px] text-slate-400 block font-bold">মোট প্রদেয় মূল্য</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {totalSar} SAR / ৳{totalBdt} BDT
              </div>
              <span className="text-[10px] text-slate-500 block">
                (১ পিন = {selectedPackage.baseSar} SAR / ৳{selectedPackage.baseBdt} BDT)
              </span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-[1.01] cursor-pointer"
            >
              {isSubmitting ? (
                <span>অর্ডার তৈরি হচ্ছে...</span>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>অর্ডার নিশ্চিত করুন (Confirm Order)</span>
                </>
              )}
            </button>

            <div className="pt-2 text-[10px] text-slate-400 space-y-1 text-center">
              <p>⚡ অর্ডার করার পর স্বয়ংক্রিয়ভাবে WhatsApp মেসেজ তৈরি হবে।</p>
              <p>🔒 ১০০% মানি-ব্যাক ও ফুল রিপ্লেসমেন্ট সুবিধা।</p>
            </div>
          </div>
        </div>

      </form>

      {/* Confirmation Modal once order is placed */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#070e1c] border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-4">
            
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
                অর্ডার সফল হয়েছে (Order Placed)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                আপনার অর্ডার আইডি তৈরি হয়েছে!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                এখন নিচে ক্লিক করে হোয়াটসঅ্যাপে মেসেজ পাঠিয়ে সরাসরি পিন বুঝে নিন।
              </p>
            </div>

            {/* Order receipt card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Order ID:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-emerald-400">{completedOrder.orderId}</span>
                  <button
                    onClick={() => handleCopyOrderId(completedOrder.orderId)}
                    className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    title="কপি করুন"
                  >
                    {copiedOrderId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">প্যাকেজ:</span>
                <span className="font-bold text-white">{completedOrder.packageName} ({completedOrder.quantity} টি)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">দেশ:</span>
                <span className="font-bold text-white">{completedOrder.countryName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">মোট মূল্য:</span>
                <span className="font-mono font-black text-cyan-300">{completedOrder.totalSar} SAR / ৳{completedOrder.totalBdt} BDT</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">গ্রাহক:</span>
                <span className="text-white">{completedOrder.name} ({completedOrder.phone})</span>
              </div>
            </div>

            {/* Giant WhatsApp action button */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleOpenWhatsAppForOrder(completedOrder)}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 transition-all cursor-pointer transform hover:scale-[1.02]"
              >
                <MessageSquare className="w-5 h-5 text-slate-950" />
                <span>💬 হোয়াটসঅ্যাপে পিন নিন (WhatsApp Instant Delivery)</span>
              </button>

              <button
                onClick={() => setCompletedOrder(null)}
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
