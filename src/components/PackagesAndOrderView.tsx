import React, { useState } from 'react';
import { 
  Crown, 
  ShoppingCart, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Check, 
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { RetailBuyView } from './RetailBuyView';
import { VipPlansView } from './VipPlansView';

interface PackagesAndOrderViewProps {
  lang: 'en' | 'bn';
  initialCountry?: string;
  onNavigateToTab: (tab: string) => void;
  onOpenAuthModal?: () => void;
}

export const PackagesAndOrderView: React.FC<PackagesAndOrderViewProps> = ({
  lang,
  initialCountry,
  onNavigateToTab,
  onOpenAuthModal,
}) => {
  const [subTab, setSubTab] = useState<'order' | 'plans'>('order');

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      {/* Top Banner with Toggle */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-br from-[#1c1404] via-slate-950 to-[#0c0d18] shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Crown className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ইন্টারনেট প্যাকেজ ও পিন অর্ডার হাব' : 'Internet Packages & Order Hub'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {lang === 'bn' 
                ? 'ভিআইপি ইন্টারনেট প্যাকেজ ও রিটেইল পিন অর্ডার' 
                : 'VIP Internet Packages & Retail PIN Order'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {lang === 'bn'
                ? 'সৌদি আরব, আরব আমিরাত, ওমান, কুয়েত, মালয়েশিয়া, কাতার ও বাংলাদেশের জন্য ১টি বা একাধিক পিন সহজে অর্ডার করুন। বিকাশ, নগদ, STC Pay, Touch \'n Go বা ক্রিপ্টো দিয়ে পেমেন্ট করুন।'
                : 'Choose your VIP internet subscription or order retail PINs with instant 60-second delivery on WhatsApp.'}
            </p>
          </div>

          {/* SubTab Toggle */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setSubTab('order')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                subTab === 'order'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{lang === 'bn' ? '🛒 পিন অর্ডার ফর্ম' : '🛒 Order PIN'}</span>
            </button>

            <button
              onClick={() => setSubTab('plans')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                subTab === 'plans'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>{lang === 'bn' ? '👑 সকল প্যাকেজের তালিকা' : '👑 All VIP Plans'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Selected View */}
      {subTab === 'order' ? (
        <RetailBuyView
          lang={lang}
          initialCountry={initialCountry}
          onNavigateToTab={onNavigateToTab}
        />
      ) : (
        <VipPlansView
          lang={lang}
          onOpenAuthModal={onOpenAuthModal}
        />
      )}
    </div>
  );
};
