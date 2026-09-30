import React, { useState, useEffect } from 'react';
import { 
  ConnectionStatus, 
  VPNServer, 
  VPNProtocol, 
  SecuritySettings 
} from './types';
import { SERVERS_DATA } from './data/servers';
import { ServerManager } from './services/serverManager';
import { TRANSLATIONS } from './data/translations';
import { CONTACT_CONFIG, saveSiteSettings, getSiteSettings, SiteSettingsData } from './data/contact';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { Navbar } from './components/Navbar';
import { MainConnectView } from './components/MainConnectView';
import { BenefitsView } from './components/BenefitsView';
import { VipPlansView } from './components/VipPlansView';
import { ServerListModal } from './components/ServerListModal';
import { ConfigGeneratorModal } from './components/ConfigGeneratorModal';
import { ArabSimPayloadCustomizer } from './components/ArabSimPayloadCustomizer';
import { PwaInstallAndPushBanner } from './components/PwaInstallAndPushBanner';
import { DynamicHeroBanners } from './components/DynamicHeroBanners';
import { LiveSupportWidget } from './components/LiveSupportWidget';
import { FloatingDownloadBar } from './components/FloatingDownloadBar';
import { WelcomePromoModal } from './components/WelcomePromoModal';
import { AccountView } from './components/AccountView';
import { AdminConsoleView } from './components/AdminConsoleView';
import { RetailBuyView } from './components/RetailBuyView';
import { ResellerPageView } from './components/ResellerPageView';
import { CountrySeoShowcase } from './components/CountrySeoShowcase';
import { CountryGuideView } from './components/CountryGuideView';
import { PackagesAndOrderView } from './components/PackagesAndOrderView';
import { AppsAndTutorialsView } from './components/AppsAndTutorialsView';
import { AuthModal } from './components/AuthModal';
import { ActionFeedbackToast, ToastFeedbackData } from './components/ActionFeedbackToast';
import { LiveNotificationAlert } from './components/LiveNotificationAlert';
import { AnnouncementsModal } from './components/AnnouncementsModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { soundEffects } from './services/soundEffects';
import { autoReconnectService } from './services/autoReconnectService';
import { AuthProvider, useAuth } from './firebase/AuthContext';
import { 
  ShieldCheck, 
  Globe2, 
  X,
  ArrowLeft,
  Home,
  ChevronRight
} from 'lucide-react';

const THEME_STORAGE_KEY = 'soverix_app_theme';

const normalizeTabName = (tab: string): string => {
  const clean = (tab || '').toLowerCase().replace(/[-_\s]/g, '');
  if (['regionalguide', 'countryguide', 'arabsim', 'saudi', 'uae', 'qatar', 'bahrain', 'malaysia', 'oman', 'kuwait', 'countries', 'sim'].includes(clean)) {
    return 'countryGuide';
  }
  if (['packages', 'package', 'retailbuy', 'retail', 'vipplans', 'plans', 'pricing', 'order'].includes(clean)) {
    return 'packages';
  }
  if (['reseller', 'wholesale', 'dealer', 'subdealer'].includes(clean)) {
    return 'reseller';
  }
  if (['appstutorials', 'apps', 'tutorials', 'configs', 'videos', 'troubleshoot', 'guide', 'guides', 'apk'].includes(clean)) {
    return 'appsTutorials';
  }
  if (['benefits', 'whysoverix', 'features'].includes(clean)) {
    return 'benefits';
  }
  if (['account', 'profile', 'vip', 'myaccount'].includes(clean)) {
    return 'account';
  }
  if (['admin', 'adminconsole', 'masteradmin'].includes(clean)) {
    return 'admin';
  }
  if (['servers', 'nodes'].includes(clean)) {
    return 'servers';
  }
  return 'dashboard';
};

function AppContent() {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [theme, setTheme] = useState<'dark' | 'cyber-light'>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return (saved === 'cyber-light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });
  const isAdminPage = typeof window !== 'undefined' && (
    window.location.pathname.toLowerCase().includes('admin') ||
    window.location.hash.toLowerCase().includes('admin') ||
    window.location.search.toLowerCase().includes('admin')
  );

  const [activeTab, setActiveTab] = useState<string>(() => {
    return isAdminPage ? 'admin' : 'dashboard';
  });
  const [tabHistory, setTabHistory] = useState<string[]>(() => [isAdminPage ? 'admin' : 'dashboard']);

  const handleNavigateTab = (rawTab: string, extraParam?: string) => {
    const normTab = normalizeTabName(rawTab);
    if (extraParam) {
      setSelectedOrderCountry(extraParam);
    }
    setTabHistory((prev) => {
      const filtered = prev.filter((t) => t !== normTab);
      return [...filtered, normTab];
    });
    setActiveTab(normTab);
    try {
      window.history.pushState({ tab: normTab }, '', normTab === 'dashboard' ? '/' : `#${normTab}`);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBack = () => {
    setTabHistory((prev) => {
      if (prev.length > 1) {
        const nextHistory = [...prev];
        nextHistory.pop(); // remove active tab
        const targetTab = nextHistory[nextHistory.length - 1] || 'dashboard';
        setActiveTab(targetTab);
        try {
          window.history.pushState({ tab: targetTab }, '', targetTab === 'dashboard' ? '/' : `#${targetTab}`);
        } catch {}
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return nextHistory;
      }
      setActiveTab('dashboard');
      try {
        window.history.pushState({ tab: 'dashboard' }, '', '/');
      } catch {}
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return ['dashboard'];
    });
  };

  const getTabTitle = (tab: string, currentLang: 'bn' | 'en') => {
    switch (tab) {
      case 'countryGuide':
      case 'arabSim':
        return currentLang === 'bn' ? '🌍 দেশ ও সিম ফ্রি-নেট গাইড' : '🌍 Country & SIM Network Hub';
      case 'packages':
      case 'retailBuy':
      case 'vipPlans':
        return currentLang === 'bn' ? '📦 ভিআইপি প্যাকেজ ও পিন অর্ডার' : '📦 VIP Packages & PIN Order';
      case 'reseller':
        return currentLang === 'bn' ? '💼 রিসেলার ও হোলসেল প্যানেল' : '💼 Reseller & Wholesale Panel';
      case 'appsTutorials':
      case 'configs':
      case 'videos':
        return currentLang === 'bn' ? '📱 অ্যাপস, কনফিগ ও ভিডিও টিউটোরিয়াল' : '📱 Apps, Configs & Tutorials';
      case 'benefits':
        return currentLang === 'bn' ? '⚡ কেন সোভরিক্সনেট ভিপিএন' : '⚡ Why SoverixNet VPN';
      case 'account':
        return currentLang === 'bn' ? '👑 ভিআইপি অ্যাকাউন্ট ও প্রোফাইল' : '👑 VIP Account & Profile';
      case 'admin':
        return currentLang === 'bn' ? '⚙️ মাস্টার অ্যাডমিন কনসোল' : '⚙️ Master Admin Console';
      case 'servers':
        return currentLang === 'bn' ? '🌐 গ্লোবাল সার্ভার নোডস' : '🌐 Global Server Nodes';
      default:
        return currentLang === 'bn' ? 'মূল ড্যাশবোর্ড' : 'Main Dashboard';
    }
  };

  // Browser popstate listener for back/forward buttons
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.tab) {
        setActiveTab(normalizeTabName(e.state.tab));
      } else {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
          setActiveTab(normalizeTabName(hash));
        } else {
          setActiveTab('dashboard');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [selectedServer, setSelectedServer] = useState<VPNServer>(SERVERS_DATA[0]);
  const [activeProtocol, setActiveProtocol] = useState<VPNProtocol>('wireguard');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isServerModalOpen, setIsServerModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [toastFeedback, setToastFeedback] = useState<ToastFeedbackData | null>(null);
  const [isWelcomePromoOpen, setIsWelcomePromoOpen] = useState<boolean>(true);
  const [selectedOrderCountry, setSelectedOrderCountry] = useState<string>('saudi');
  const [isAnnouncementsModalOpen, setIsAnnouncementsModalOpen] = useState<boolean>(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);

  // Listen to global open search event
  useEffect(() => {
    const handleOpenSearch = () => setIsGlobalSearchOpen(true);
    window.addEventListener('soverix_open_global_search', handleOpenSearch);
    return () => window.removeEventListener('soverix_open_global_search', handleOpenSearch);
  }, []);

  const { user, userProfile, isSuperAdmin, isAdmin, updateUserPreferences, saveConnectionSession } = useAuth();

  const isUserVip = Boolean(
    isSuperAdmin || 
    isAdmin || 
    (userProfile?.plan && userProfile.plan.toLowerCase().includes('vip')) || 
    (userProfile?.plan && userProfile.plan.toLowerCase().includes('pro')) || 
    (userProfile?.plan && userProfile.plan.toLowerCase().includes('titan')) || 
    (userProfile?.plan && userProfile.plan.toLowerCase().includes('turbo')) || 
    (userProfile?.plan && userProfile.plan.toLowerCase().includes('lifetime')) || 
    (userProfile?.plan && userProfile.plan.toLowerCase().includes('elite'))
  );

  const [settings, setSettings] = useState<SecuritySettings>({
    killSwitch: true,
    autoReconnect: true,
    cleanNetAdBlock: true,
    malwareShield: true,
    antiPhishing: true,
    preventDnsLeaks: true,
    preventWebRtcLeaks: true,
    splitTunnelingEnabled: true,
    autoConnectOnUntrustedWifi: true,
    stealthObfuscation: false,
    mtuSize: 1420,
    dnsProvider: 'soverix_secure',
    customDnsIp: '',
    quantumSafeKyber: true,
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettingsData>(getSiteSettings());

  const t = TRANSLATIONS[lang];

  // Sync theme changes with localStorage and HTML root element
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
    if (theme === 'cyber-light') {
      document.documentElement.classList.add('cyber-light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('cyber-light');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  // Keep selected server synchronized if dynamic servers load
  useEffect(() => {
    const unsub = ServerManager.subscribe((all) => {
      if (all.length > 0) {
        setSelectedServer((curr) => {
          const match = all.find((s) => s.id === curr.id);
          return match || all[0];
        });
      }
    });
    return () => unsub();
  }, []);

  // Synchronize global site settings dynamically from Firestore & local events
  useEffect(() => {
    const applySiteBranding = (settingsData: SiteSettingsData) => {
      // Dynamic page title
      if (settingsData.designTheme?.siteTitle) {
        document.title = `${settingsData.designTheme.siteTitle} | Official Cyber Shield & FreeNet`;
      }
      // Dynamic favicon
      const targetFavicon = settingsData.designTheme?.faviconUrl || settingsData.designTheme?.logoUrl;
      if (targetFavicon) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'shortcut icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = targetFavicon;
      }
      // Dynamic branding css variable if custom hex is set
      if (settingsData.designTheme?.primaryHex) {
        document.documentElement.style.setProperty('--brand-primary', settingsData.designTheme.primaryHex);
      }
    };

    const handleSettingsChanged = () => {
      const current = getSiteSettings();
      setSiteSettings(current);
      applySiteBranding(current);
    };
    window.addEventListener('soverix_settings_changed', handleSettingsChanged);

    // Initial branding apply
    applySiteBranding(getSiteSettings());

    let unsub = () => {};
    try {
      unsub = onSnapshot(doc(db, 'settings', 'general'), (snap) => {
        if (snap.exists()) {
          const firestoreData = snap.data() as Partial<SiteSettingsData>;
          const currentLocal = getSiteSettings();

          const firestoreTime = new Date(firestoreData.updatedAt || 0).getTime();
          const localTime = new Date(currentLocal.updatedAt || 0).getTime();

          // Only apply Firestore if it has newer or equal timestamp, or local has none
          if (firestoreTime >= localTime || !currentLocal.updatedAt) {
            const updated = saveSiteSettings(firestoreData);
            setSiteSettings(updated);
            applySiteBranding(updated);
          } else if (localTime > firestoreTime) {
            // Local has newer changes (e.g. admin edited banners right now). Heal Firestore with latest data!
            try {
              const cleanPayload = JSON.parse(JSON.stringify(currentLocal));
              setDoc(doc(db, 'settings', 'general'), cleanPayload, { merge: true }).catch(() => {});
            } catch {}
          }
        }
      }, (err) => {
        if (err && (err as any).code !== 'unavailable') {
          console.warn('Firestore settings listener notice:', err?.message || err);
        }
      });
    } catch {}
    return () => {
      window.removeEventListener('soverix_settings_changed', handleSettingsChanged);
      unsub();
    };
  }, []);

  // Synchronize dynamic canonical tag, alternate hreflang and og:url on activeTab changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const tabHash = activeTab === 'dashboard' ? '' : `#${activeTab}`;
      const cleanOrigin = window.location.origin;
      const cleanPath = window.location.pathname;
      
      // Retain clean parameters (e.g. lang=bn), strip noisy ad trackers
      const urlParams = new URLSearchParams(window.location.search);
      const cleanParams = new URLSearchParams();
      urlParams.forEach((val, key) => {
        if (!key.startsWith('utm_') && key !== 'fbclid' && key !== 'gclid') {
          cleanParams.append(key, val);
        }
      });
      const searchStr = cleanParams.toString() ? `?${cleanParams.toString()}` : '';
      const dynamicCanonicalUrl = `${cleanOrigin}${cleanPath}${searchStr}${tabHash}`;

      let canonicalLink: HTMLLinkElement | null = (document.getElementById('dynamic-canonical') as HTMLLinkElement) || document.querySelector("link[rel='canonical']");
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        canonicalLink.setAttribute('id', 'dynamic-canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', dynamicCanonicalUrl);

      const ogUrl: HTMLMetaElement | null = document.querySelector("meta[property='og:url']");
      if (ogUrl) {
        ogUrl.setAttribute('content', dynamicCanonicalUrl);
      }

      window.dispatchEvent(new Event('soverix_route_change'));
    } catch {}
  }, [activeTab]);

  const handleOpenAuthModal = (initialTab: 'signin' | 'signup' = 'signin') => {
    soundEffects.playClick();
    setAuthModalTab(initialTab);
    setIsAuthModalOpen(true);
  };

  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    soundEffects.setEnabled(enabled);
  };

  const handleToggleConnect = () => {
    soundEffects.playClick();

    // If currently reconnecting, allow user to cancel and disconnect cleanly
    if (status === 'reconnecting') {
      autoReconnectService.cancelReconnect();
      setStatus('disconnecting');
      soundEffects.playDisconnected();
      setSessionStartTime(null);
      setTimeout(() => {
        setStatus('disconnected');
      }, 500);
      return;
    }

    if (status === 'connected') {
      autoReconnectService.cancelReconnect();

      if (sessionStartTime) {
        const durationSecs = Math.round((Date.now() - sessionStartTime) / 1000);
        const dlMB = +(durationSecs * 18.5).toFixed(1);
        const ulMB = +(durationSecs * 9.2).toFixed(1);
        saveConnectionSession(
          selectedServer.id,
          selectedServer.name,
          activeProtocol,
          durationSecs,
          dlMB,
          ulMB
        );
      }

      setStatus('disconnecting');
      soundEffects.playDisconnected();
      setSessionStartTime(null);

      setTimeout(() => {
        setStatus('disconnected');
      }, 600);
    } else if (status === 'disconnected') {
      // 1. MANDATORY LOGIN CHECK: Must be logged in to connect
      if (!user) {
        soundEffects.playAlert();
        setToastFeedback({
          type: 'login_required',
          message: lang === 'bn'
            ? '🔒 ভিপিএন কানেক্ট করার পূর্বে অনুগ্রহ করে আপনার অ্যাকাউন্টে সাইন ইন করুন।'
            : '🔒 Please sign in to your SoverixNet account before connecting.',
          onAction: () => handleOpenAuthModal('signin'),
        });
        setAuthModalTab('signin');
        setIsAuthModalOpen(true);
        return;
      }

      // 2. VIP EXCLUSIVE NODE CHECK: If server is VIP and user has not unlocked VIP
      if (selectedServer.isVip && !isUserVip) {
        soundEffects.playAlert();
        setToastFeedback({
          type: 'vip_required',
          server: selectedServer,
          message: lang === 'bn'
            ? `👑 '${selectedServer.name}' একটি এক্সক্লুসিভ VIP ১০ Gbps নোড। এটি ব্যবহার করতে VIP সাবস্ক্রিপশন সক্রিয় করুন!`
            : `👑 '${selectedServer.name}' is a VIP Exclusive 10 Gbps Node. Upgrade or activate VIP to connect!`,
          onAction: () => {
            setActiveTab('vipPlans');
          },
        });
        return;
      }

      setStatus('connecting');
      soundEffects.playConnecting();

      setTimeout(() => {
        setStatus('handshaking');
        setTimeout(() => {
          setStatus('connected');
          setSessionStartTime(Date.now());
          soundEffects.playConnected();
        }, 800);
      }, 700);
    }
  };

  // Smart Auto-Reconnect Trigger for unexpected connection drops
  const handleTriggerConnectionDrop = (reason = 'Network tunnel packet timeout') => {
    if (status !== 'connected') return;

    if (settings.autoReconnect) {
      setStatus('reconnecting');
      soundEffects.playReconnecting();
      setToastFeedback({
        type: 'system_alert',
        message: lang === 'bn' 
          ? '⚠️ সংযোগ বিচ্ছিন্ন হয়েছে! স্মার্ট অটো-রিকানেক্ট টানেল পুনরুদ্ধারের চেষ্টা করছে...'
          : '⚠️ Connection dropped! Smart Auto-Reconnect is restoring tunnel...',
      });

      autoReconnectService.triggerConnectionDrop(
        reason,
        () => {
          // Success: Tunnel Restored
          setStatus('connected');
          soundEffects.playConnected();
          setToastFeedback({
            type: 'system_alert',
            message: lang === 'bn'
              ? '✅ ভিপিএন টানেল সফলভাবে পুনরুদ্ধার করা হয়েছে!'
              : '✅ VPN Tunnel successfully restored by Auto-Reconnect!',
          });
        },
        (failReason) => {
          // Fail: Maximum retries reached
          setStatus('disconnected');
          soundEffects.playDisconnected();
          setSessionStartTime(null);
          setToastFeedback({
            type: 'system_alert',
            message: lang === 'bn'
              ? `🛑 টানেল পুনরুদ্ধার করা যায়নি। কিল সুইচ সক্রিয় রয়েছে: ${failReason}`
              : `🛑 Auto-reconnect failed. Kill Switch engaged: ${failReason}`,
          });
        }
      );
    } else {
      // Auto-reconnect disabled: drop immediately to disconnected
      setStatus('disconnecting');
      soundEffects.playDisconnected();
      setSessionStartTime(null);
      setTimeout(() => {
        setStatus('disconnected');
      }, 500);
    }
  };

  // Browser offline listener: automatically trigger auto-reconnect when device loses connection
  useEffect(() => {
    const handleOffline = () => {
      if (status === 'connected') {
        handleTriggerConnectionDrop('Device lost network connectivity (Offline)');
      }
    };

    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('offline', handleOffline);
    };
  }, [status, settings.autoReconnect, lang]);

  const handleSelectFreeServer = () => {
    const all = ServerManager.getAllServers();
    const freeNode = all.find((s) => !s.isVip) || all[0];
    if (freeNode) {
      handleSelectServer(freeNode);
    }
  };

  const handleSelectServer = (server: VPNServer) => {
    soundEffects.playClick();
    const prev = selectedServer;
    setSelectedServer(server);
    
    // Trigger subtle Framer Motion success feedback
    setToastFeedback({
      type: 'server_switch',
      server,
      prevServer: prev,
    });

    if (status === 'connected') {
      if (server.isVip && !isUserVip) {
        soundEffects.playAlert();
        setToastFeedback({
          type: 'vip_required',
          server,
          message: lang === 'bn'
            ? `👑 '${server.name}' একটি VIP নোড। ফ্রি অ্যাকাউন্টে ব্যবহারের জন্য সিঙ্গাপুর নোড নির্বাচন করুন।`
            : `👑 '${server.name}' requires a VIP subscription.`,
          onAction: () => setActiveTab('vipPlans'),
        });
        // Disconnect if unauthorized server switched to while connected
        setStatus('disconnecting');
        setTimeout(() => setStatus('disconnected'), 500);
        return;
      }

      setStatus('handshaking');
      soundEffects.playConnecting();
      setTimeout(() => {
        setStatus('connected');
        soundEffects.playConnected();
      }, 700);
    }
  };

  const handleAuthSuccess = (details: { userName?: string; email?: string; isVip?: boolean; actionType: 'signin' | 'signup' | 'instant_vip' }) => {
    setToastFeedback({
      type: 'auth_success',
      userName: details.userName,
      email: details.email,
      isVip: details.isVip,
      actionType: details.actionType,
    });
  };

  const handleSelectProtocol = (proto: VPNProtocol) => {
    soundEffects.playClick();
    setActiveProtocol(proto);
    if (user) {
      updateUserPreferences(settings, proto);
    }
  };

  const handleUpdateSettings = (newSettings: Partial<SecuritySettings>) => {
    soundEffects.playShieldToggle();
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (user) {
      updateUserPreferences(updated, activeProtocol);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'cyber-light' ? 'bg-[#f8fafc] text-slate-900 cyber-light' : 'bg-[#030712] text-slate-100 dark'} flex flex-col selection:bg-cyan-500 selection:text-black relative transition-colors duration-300`}>
      
      {/* Background Ambient Glow & Grid */}
      <div className="fixed inset-0 bg-cyber-grid opacity-25 pointer-events-none z-0" />
      {siteSettings.designTheme?.showBackgroundGlow !== false && (
        <>
          <div className={`fixed top-0 left-1/4 w-96 h-96 ${theme === 'cyber-light' ? 'bg-cyan-500/10' : 'bg-cyan-600/10'} rounded-full blur-[140px] pointer-events-none z-0`} />
          <div className={`fixed bottom-0 right-1/4 w-96 h-96 ${theme === 'cyber-light' ? 'bg-indigo-400/10' : 'bg-indigo-600/10'} rounded-full blur-[140px] pointer-events-none z-0`} />
        </>
      )}

      {/* Admin Top Quick Navigation Bar */}
      {(isAdminPage || activeTab === 'admin') && (
        <div className="bg-slate-950/95 border-b border-emerald-500/30 px-4 py-2.5 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-black text-white uppercase tracking-wider">
                ⚡ Soverix Net মাস্টার এডমিন কন্ট্রোল সেন্টার
              </span>
              <span className="hidden sm:inline text-slate-400">
                (ব্যানার, ওয়েবসাইট ডিজাইন ও সকল কন্টেন্ট কন্ট্রোল)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().includes('admin.html')) {
                    window.location.href = '/';
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <span>🌐 মূল ড্যাশবোর্ড দেখুন (View Dashboard)</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Top Navbar with Theme Toggle */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        status={status}
        soundEnabled={soundEnabled}
        setSoundEnabled={handleToggleSound}
        killSwitchActive={settings.killSwitch}
        onOpenAuthModal={handleOpenAuthModal}
        onOpenPromoModal={() => setIsWelcomePromoOpen(true)}
        onOpenSearch={() => setIsGlobalSearchOpen(true)}
        onOpenAnnouncements={() => setIsAnnouncementsModalOpen(true)}
        siteSettings={siteSettings}
      />

      {/* Main App Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 z-10 space-y-6">

        {/* Universal Sticky Back Bar when user enters any section or option */}
        {activeTab !== 'dashboard' && (
          <div className="sticky top-16 z-30 mb-4 sm:mb-6 bg-slate-900/95 dark:bg-slate-900/95 border border-slate-700/80 rounded-2xl p-2.5 sm:p-3.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-2.5 sm:gap-4 animate-fadeIn">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Primary Back Button */}
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer group shrink-0"
                title={lang === 'bn' ? 'পেছনে ফিরে যান' : 'Go Back'}
              >
                <ArrowLeft className="w-4 h-4 text-slate-950 group-hover:-translate-x-1 transition-transform" />
                <span>{lang === 'bn' ? '← ব্যাকে যান (Back)' : '← Go Back'}</span>
              </button>

              {/* Direct Home Dashboard Shortcut */}
              <button
                onClick={() => handleNavigateTab('dashboard')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer shrink-0"
                title={lang === 'bn' ? 'মূল ড্যাশবোর্ডে ফিরে যান' : 'Back to Home Dashboard'}
              >
                <Home className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'bn' ? 'হোম ড্যাশবোর্ড' : 'Home'}</span>
              </button>

              {/* Breadcrumb location */}
              <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 min-w-0 truncate">
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="font-semibold text-emerald-400 truncate">
                  {getTabTitle(activeTab, lang)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Mobile Home shortcut */}
              <button
                onClick={() => handleNavigateTab('dashboard')}
                className="sm:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
                title={lang === 'bn' ? 'হোম ড্যাশবোর্ড' : 'Home'}
              >
                <Home className="w-4 h-4 text-emerald-400" />
              </button>

              {/* Search shortcut button */}
              <button
                onClick={() => setIsGlobalSearchOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              >
                <span className="text-emerald-400">🔍</span>
                <span className="hidden sm:inline">{lang === 'bn' ? 'অনুসন্ধান' : 'Search'}</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Dynamic Promotional Banners Carousel (Managed from Admin Console) */}
        {!isAdminPage && activeTab !== 'admin' && siteSettings.sectionVisibility?.bannersSlider !== false && (
          <DynamicHeroBanners 
            banners={siteSettings.banners || []} 
            lang={lang} 
            onNavigateTab={handleNavigateTab} 
          />
        )}

        {/* PWA & Mobile Install Strip Banner */}
        {!isAdminPage && activeTab !== 'admin' && <PwaInstallAndPushBanner lang={lang} />}
        
        {/* Page 1: Dashboard Tab (What VPN does, How to use, Connect & Ping) */}
        {activeTab === 'dashboard' && (
          <MainConnectView
            status={status}
            onToggleConnect={handleToggleConnect}
            selectedServer={selectedServer}
            onSelectServer={handleSelectServer}
            onOpenServerModal={() => setIsServerModalOpen(true)}
            activeProtocol={activeProtocol}
            onSelectProtocol={handleSelectProtocol}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            lang={lang}
            onNavigateTab={handleNavigateTab}
            onOpenAuthModal={handleOpenAuthModal}
            onSelectFreeServer={handleSelectFreeServer}
            onSimulateDrop={() => handleTriggerConnectionDrop('Manual test simulation')}
          />
        )}

        {/* Page 2: Dedicated Countries & SIMs Guide Tab */}
        {(activeTab === 'countryGuide' || activeTab === 'arabSim' || activeTab === 'servers') && (
          <CountryGuideView
            lang={lang}
            selectedServer={selectedServer}
            onSelectServer={handleSelectServer}
            onApplySniToServer={(sni, payload) => {
              setSelectedServer((prev) => ({
                ...prev,
                freeNetSni: sni,
                payloadTemplate: payload,
              }));
              handleUpdateSettings({ customDnsIp: sni });
            }}
            onNavigateToTab={handleNavigateTab}
            onOrderCountry={(countryId) => {
              setSelectedOrderCountry(countryId);
              handleNavigateTab('packages');
            }}
          />
        )}

        {/* Page 3: Dedicated Internet Packages & Order PIN Tab */}
        {(activeTab === 'packages' || activeTab === 'retailBuy' || activeTab === 'vipPlans') && (
          <PackagesAndOrderView
            lang={lang}
            initialCountry={selectedOrderCountry}
            onNavigateToTab={handleNavigateTab}
            onOpenAuthModal={handleOpenAuthModal}
          />
        )}

        {/* Page 4: Dedicated Reseller Wholesale Tab */}
        {activeTab === 'reseller' && (
          <ResellerPageView
            lang={lang}
            onNavigateToTab={handleNavigateTab}
          />
        )}

        {/* Page 5: Dedicated Apps & Video Tutorials Tab */}
        {(activeTab === 'appsTutorials' || activeTab === 'configs' || activeTab === 'videos') && (
          <AppsAndTutorialsView
            lang={lang}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {/* Server Nodes Tab */}
        {activeTab === 'servers' && (
          <ServerListModal
            selectedServer={selectedServer}
            onSelectServer={handleSelectServer}
            lang={lang}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {/* Why Soverixnet / Benefits Tab */}
        {activeTab === 'benefits' && (
          <BenefitsView
            lang={lang}
            onConnectNow={() => {
              handleNavigateTab('dashboard');
              if (status === 'disconnected') {
                handleToggleConnect();
              }
            }}
          />
        )}

        {/* VIP Account Tab */}
        {activeTab === 'account' && (
          <AccountView 
            lang={lang} 
            onOpenAuthModal={handleOpenAuthModal} 
          />
        )}

        {/* Master Admin Console Tab */}
        {activeTab === 'admin' && (
          <AdminConsoleView lang={lang} />
        )}

      </main>

      {/* Floating Action Feedback Toast (Framer Motion) */}
      <ActionFeedbackToast
        toast={toastFeedback}
        onClose={() => setToastFeedback(null)}
        lang={lang}
      />

      {/* Auth Modal (Sign In / Sign Up / Forgot Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        initialTab={authModalTab}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Global Server Selector Modal */}
      {isServerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#050b18] border border-cyan-500/30 rounded-3xl p-6 overflow-y-auto shadow-2xl">
            
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {lang === 'bn' ? 'সার্ভার লোকেশন পরিবর্তন করুন' : 'Change Server Node Location'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn' ? 'আপনার পছন্দের দ্রুততম সার্ভারটি সিলেক্ট করুন' : 'Select an ultra-fast sovereign node worldwide'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsServerModalOpen(false)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ServerListModal
              selectedServer={selectedServer}
              onSelectServer={(server) => {
                handleSelectServer(server);
                setIsServerModalOpen(false);
              }}
              lang={lang}
              onClose={() => setIsServerModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Cyber Sleek Footer with SEO Authority Keywords */}
      <footer className="w-full border-t border-slate-800/80 bg-[#02050c] py-8 px-4 sm:px-6 lg:px-8 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-6 text-xs text-slate-500">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-sm">Soverixnet VPN (সোভারিক্সনেট)</span>
                <p className="text-[11px] text-slate-400">
                  {lang === 'bn' ? 'কোয়ান্টাম-রেজিস্ট্যান্ট ক্রিপ্টোগ্রাফিক শিল্ড ও আল্ট্রা-ফাস্ট গ্লোবাল নেটওয়ার্ক' : 'Quantum-Resistant Encrypted Network & Zero-Log Anonymity'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Zero-Logs RAM Verified
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-bold">{user?.email || 'soverixnet@gmail.com'}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">v4.30-{theme.toUpperCase()}</span>
            </div>
          </div>

          {/* Global Free Internet WhatsApp Channel Bar */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-1.99-.46-1.657-.683-2.73-2.366-2.812-2.476-.083-.11-1.01-1.348-1.01-2.572 0-1.223.636-1.824.862-2.073.226-.249.493-.311.658-.311.164 0 .328.002.472.01.153.007.358-.058.56.427.207.499.704 1.722.766 1.847.062.125.103.271.021.434-.083.164-.124.266-.247.41-.124.144-.261.322-.373.432-.124.123-.254.256-.11.503.144.247.641 1.057 1.376 1.713.946.843 1.744 1.104 1.991 1.228.247.124.391.103.535-.062.145-.165.618-.719.783-.967.165-.247.33-.206.556-.123.226.082 1.436.677 1.683.801.247.124.412.185.473.288.062.103.062.597-.082 1.002zM12 2C6.477 2 2 6.477 2 12c0 1.891.528 3.659 1.442 5.174L2 22l4.981-1.306C8.441 21.545 10.16 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
              </div>
              <div>
                <span className="text-white font-bold text-xs block">
                  {lang === 'bn' ? 'অফিসিয়াল WhatsApp চ্যাট ও সাপোর্ট (Soverixnet VPN)' : 'Official WhatsApp Support (Soverixnet VPN)'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {lang === 'bn' ? 'ফ্রি ইন্টারনেট, ভিআইপি কনফিগ ও যেকোনো সাপোর্টের জন্য মেসেজ দিন।' : 'Get free internet configs, VIP accounts & instant customer support.'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={CONTACT_CONFIG.getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-black shrink-0" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-1.99-.46-1.657-.683-2.73-2.366-2.812-2.476-.083-.11-1.01-1.348-1.01-2.572 0-1.223.636-1.824.862-2.073.226-.249.493-.311.658-.311.164 0 .328.002.472.01.153.007.358-.058.56.427.207.499.704 1.722.766 1.847.062.125.103.271.021.434-.083.164-.124.266-.247.41-.124.144-.261.322-.373.432-.124.123-.254.256-.11.503.144.247.641 1.057 1.376 1.713.946.843 1.744 1.104 1.991 1.228.247.124.391.103.535-.062.145-.165.618-.719.783-.967.165-.247.33-.206.556-.123.226.082 1.436.677 1.683.801.247.124.412.185.473.288.062.103.062.597-.082 1.002zM12 2C6.477 2 2 6.477 2 12c0 1.891.528 3.659 1.442 5.174L2 22l4.981-1.306C8.441 21.545 10.16 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
                <span>{lang === 'bn' ? 'WhatsApp মেসেজ' : 'Chat on WhatsApp'}</span>
              </a>

              <a
                href={CONTACT_CONFIG.whatsappChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>📢 {lang === 'bn' ? 'চ্যানেল' : 'Channel'}</span>
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 text-center text-[10px] text-slate-600 leading-relaxed max-w-4xl mx-auto">
            © 2026 <strong>{siteSettings.designTheme?.siteTitle || 'Soverixnet VPN'}</strong>. All Rights Reserved. Official Portal for Soverixnet, Soverix net, WireGuard VPN, V2Ray VLESS Reality, Low Ping Gaming VPN Bangladesh, 4K Streaming Accelerator & Military-Grade Online Privacy Gateway.
          </div>

        </div>
      </footer>

      {/* Global Floating Quick Download & WhatsApp Dock */}
      {siteSettings.sectionVisibility?.floatingDock !== false && (
        <FloatingDownloadBar lang={lang} />
      )}

      {/* Global Live Support & Helpdesk Floating Widget */}
      {siteSettings.sectionVisibility?.liveSupport !== false && (
        <LiveSupportWidget lang={lang} />
      )}

      {/* Auto Welcome & Special Promo Modal (Saudi 5G & WhatsApp Support) */}
      {siteSettings.sectionVisibility?.promoModal !== false && siteSettings.promoModalEnabled !== false && (
        <WelcomePromoModal 
          lang={lang} 
          forceOpen={isWelcomePromoOpen} 
          onClose={() => setIsWelcomePromoOpen(false)} 
        />
      )}

      {/* Real-Time Live Auto-Notification Popup for Visitors */}
      <LiveNotificationAlert 
        lang={lang} 
        onOpenAnnouncementList={() => setIsAnnouncementsModalOpen(true)} 
      />

      {/* Recent Updates & Announcements Drawer / Modal */}
      <AnnouncementsModal 
        isOpen={isAnnouncementsModalOpen} 
        onClose={() => setIsAnnouncementsModalOpen(false)} 
        lang={lang} 
      />

      {/* Global Instant Search Modal (Regions, SIMs, Guides, Packages) */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        lang={lang}
        onNavigateTab={(tab, extra) => {
          handleNavigateTab(tab, extra);
        }}
        onSelectServer={(srv) => {
          setSelectedServer(srv);
          handleNavigateTab('dashboard');
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
