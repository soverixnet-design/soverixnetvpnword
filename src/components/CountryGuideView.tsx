import React, { useState } from 'react';
import { 
  Globe, 
  Zap, 
  Shield, 
  Server, 
  Sliders, 
  ArrowRight, 
  Search, 
  Sparkles,
  CheckCircle2,
  Check
} from 'lucide-react';
import { CountrySeoShowcase } from './CountrySeoShowcase';
import { ArabSimPayloadCustomizer } from './ArabSimPayloadCustomizer';
import { VPNServer } from '../types';
import { SERVERS_DATA } from '../data/servers';

interface CountryGuideViewProps {
  lang: 'en' | 'bn';
  selectedServer: VPNServer;
  onSelectServer?: (server: VPNServer) => void;
  onApplySniToServer: (sni: string, payload: string) => void;
  onNavigateToTab: (tab: string) => void;
  onOrderCountry: (countryId: string) => void;
}

export const CountryGuideView: React.FC<CountryGuideViewProps> = ({
  lang,
  selectedServer,
  onSelectServer,
  onApplySniToServer,
  onNavigateToTab,
  onOrderCountry,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'showcase' | 'payloads' | 'servers'>('showcase');
  const [countryFilter, setCountryFilter] = useState<'all' | 'asia_me' | 'europe_us' | 'free'>('all');

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-gradient-to-br from-[#021814] via-slate-950 to-[#03131d] shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'দেশ ও সিম গাইড হাব' : 'Countries & SIM Network Hub'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {lang === 'bn' 
                ? 'সৌদি আরব, গাল্ফ, মালয়েশিয়া ও এশিয়ার কান্ট্রি ও সিম গাইড' 
                : 'Country Network, Arab SIMs & FreeNet Payloads'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {lang === 'bn'
                ? 'সৌদি আরব (STC, Mobily, Zain), সংযুক্ত আরব আমিরাত (du, Etisalat), ওমান, কুয়েত, মালয়েশিয়া (Celcom, Maxis, U Mobile), কাতার ও বাংলাদেশের প্রতিটি সিমের জন্য টেস্টেড ফ্রি-নেট ও হাই-স্পিড নোডস।'
                : 'Explore tested FreeNet payloads, SIM operator configurations, and ultra-low ping nodes across Gulf countries, Malaysia, and Bangladesh.'}
            </p>
          </div>

          {/* Sub-Tab Navigation Toggle */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveSubTab('showcase')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'showcase'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>{lang === 'bn' ? 'দেশসমূহ ও সিম তথ্য' : 'Country Showcase'}</span>
            </button>

            <button
              onClick={() => setActiveSubTab('payloads')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'payloads'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{lang === 'bn' ? 'আরব ও এশিয়া সিম পেলোড' : 'SIM Payloads & SNI'}</span>
            </button>

            <button
              onClick={() => setActiveSubTab('servers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'servers'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>{lang === 'bn' ? '৫০+ সার্ভার লোকেশন' : '50+ Server Nodes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tab 1: Country Showcase */}
      {activeSubTab === 'showcase' && (
        <div className="space-y-6">
          <CountrySeoShowcase
            lang={lang}
            onOrderCountry={(countryId) => {
              onOrderCountry(countryId);
            }}
          />
        </div>
      )}

      {/* Sub-Tab 2: SIM Payloads & Customizer */}
      {activeSubTab === 'payloads' && (
        <div className="space-y-6">
          <ArabSimPayloadCustomizer
            selectedServer={selectedServer}
            lang={lang}
            onApplySniToServer={onApplySniToServer}
            onNavigateToConfigs={() => onNavigateToTab('appsTutorials')}
          />
        </div>
      )}

      {/* Sub-Tab 3: Global Servers Grid */}
      {activeSubTab === 'servers' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-xl font-black text-white">
                {lang === 'bn' ? '৫০+ সুপারফাস্ট গ্লোবাল সার্ভার নোডস' : '50+ Global Server Locations'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'bn' ? 'আপনার কাঙ্ক্ষিত দেশটি সিলেক্ট করে টেস্ট করুন।' : 'Select and connect to any ultra low-latency node.'}
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: lang === 'bn' ? 'সব দেশ' : 'All' },
                { id: 'asia_me', label: lang === 'bn' ? '🇧🇩 🇸🇦 🇲🇾 এশিয়া ও মধ্যপ্রাচ্য' : 'Asia & Middle East' },
                { id: 'europe_us', label: lang === 'bn' ? '🇺🇸 🇪🇺 ইউরোপ ও আমেরিকা' : 'Europe & US' },
                { id: 'free', label: lang === 'bn' ? '⚡ ফ্রি ট্রায়াল' : 'Free Trial' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCountryFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    countryFilter === tab.id
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVERS_DATA.filter((s) => {
              if (countryFilter === 'free') return s.isFreeNet || !s.isVip;
              if (countryFilter === 'asia_me') return s.region === 'asia' || s.region === 'middle_east';
              if (countryFilter === 'europe_us') return s.region === 'europe' || s.region === 'north_america';
              return true;
            }).map((server) => {
              const isSelected = selectedServer.id === server.id;
              return (
                <div
                  key={server.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-emerald-950/30 border-emerald-400 shadow-lg shadow-emerald-500/10' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl leading-none">{server.flag}</span>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {lang === 'bn' ? server.countryBn : server.country}
                        </h4>
                        <span className="text-xs text-slate-400 block mt-0.5">{server.city}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                      {server.ping}ms
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">{server.protocols?.[0] || 'WireGuard'}</span>
                    <button
                      onClick={() => {
                        if (onSelectServer) onSelectServer(server);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-500 text-slate-950 font-black' 
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {isSelected ? (lang === 'bn' ? 'সিলেক্টেড ✓' : 'Selected ✓') : (lang === 'bn' ? 'সিলেক্ট করুন' : 'Select')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
