// Centralized Contact, Design, and Banners Configuration for Soverixnet VPN
export interface AppDownloadItem {
  id: string;
  name: string;
  nameBn: string;
  version: string;
  downloadUrl: string;
  badge: string;
  badgeBn: string;
  themeColor: 'cyan' | 'emerald' | 'amber' | 'purple';
  descBn: string;
  descEn: string;
  size: string;
  featuresBn: string[];
  featuresEn: string[];
}

export interface SiteBanner {
  id: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  badgeBn: string;
  badgeEn: string;
  imageUrl: string;
  actionUrl: string;
  actionLabelBn: string;
  actionLabelEn: string;
  themeGradient: 'cyan' | 'emerald' | 'amber' | 'purple' | 'rose';
  placement: 'hero' | 'promo_modal' | 'bottom';
  isActive: boolean;
  order: number;
}

export interface DesignThemeConfig {
  accentColor: 'cyan' | 'emerald' | 'amber' | 'purple' | 'rose';
  siteTitle: string;
  siteTaglineBn: string;
  siteTaglineEn: string;
  heroHeadlineBn: string;
  heroHeadlineEn: string;
  heroSubheadlineBn: string;
  heroSubheadlineEn: string;
  logoUrl?: string;
  showBackgroundGlow: boolean;
}

export interface SectionVisibilityConfig {
  heroConnect: boolean;
  topNoticeMarquee: boolean;
  bannersSlider: boolean;
  officialApks: boolean;
  videoTutorials: boolean;
  arabSimPayload: boolean;
  vipPlans: boolean;
  serverNodes: boolean;
  benefitsFeatures: boolean;
  communityReviews: boolean;
  floatingDock: boolean;
  liveSupport: boolean;
  promoModal: boolean;
}

export interface CustomPlanItem {
  id: string;
  name: string;
  nameBn: string;
  priceBdt: number;
  priceSar: number;
  periodBn: string;
  periodEn: string;
  badgeBn: string;
  badgeEn: string;
  isPopular?: boolean;
  featuresBn: string[];
  featuresEn: string[];
}

export interface CustomAppItem {
  id: string;
  name: string;
  nameBn: string;
  version: string;
  downloadUrl: string;
  iconUrl?: string; // Direct gallery image
  badge: string;
  badgeBn: string;
  themeColor: 'cyan' | 'emerald' | 'amber' | 'purple';
  descBn: string;
  descEn: string;
  size: string;
  featuresBn: string[];
  featuresEn: string[];
  order: number;
  isActive: boolean;
}

export interface CustomBenefitItem {
  id: string;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  iconType: 'zap' | 'activity' | 'globe' | 'harddrive' | 'eyeoff' | 'shield' | 'lock' | 'crown' | 'sparkles' | 'server';
  themeColor: 'cyan' | 'emerald' | 'amber' | 'purple' | 'rose';
  imageUrl?: string;
  order: number;
  isActive: boolean;
}

export interface CustomFaqItem {
  id: string;
  qBn: string;
  qEn: string;
  aBn: string;
  aEn: string;
  category?: string;
  order: number;
  isActive: boolean;
}

export interface CustomVideoItem {
  id: string;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  videoUrl: string; // YouTube URL, Shorts, direct MP4, or embed
  thumbnailUrl?: string; // Image URL for poster / card thumbnail
  duration?: string; // e.g. "04:12"
  category: 'sim_setup' | 'app_tutorial' | 'speed_proof' | 'general';
  badgeBn?: string;
  badgeEn?: string;
  isFeatured?: boolean;
  order: number;
  isActive: boolean;
  viewsCount?: number;
  createdAt?: string;
}

export interface HeroContentConfig {
  badgeBn: string;
  badgeEn: string;
  headlineBn: string;
  headlineEn: string;
  subheadlineBn: string;
  subheadlineEn: string;
  connectBtnTextBn?: string;
  connectBtnTextEn?: string;
  statUptime?: string;
  statPing?: string;
  statSpeed?: string;
}

export interface WhatsappCtaConfig {
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  buttonTextBn: string;
  buttonTextEn: string;
  channelUrl: string;
  imageUrl?: string;
}

export interface SiteSettingsData {
  settingId: string;
  whatsappNumber: string;
  whatsappDisplayNumber: string;
  whatsappChannelUrl: string;
  telegramUrl: string;
  officialEmail: string;
  tickerAnnouncementBn: string;
  tickerAnnouncementEn: string;
  promoModalEnabled: boolean;
  appAfV2RayUrl?: string;
  appJiyamPlusUrl?: string;
  appMohinVipUrl?: string;
  appNetSolutionUrl?: string;
  banners: SiteBanner[];
  designTheme: DesignThemeConfig;
  sectionVisibility: SectionVisibilityConfig;
  customPlans?: CustomPlanItem[];
  customApps?: CustomAppItem[];
  customBenefits?: CustomBenefitItem[];
  customFaqs?: CustomFaqItem[];
  customVideos?: CustomVideoItem[];
  heroContent?: HeroContentConfig;
  whatsappCtaContent?: WhatsappCtaConfig;
  updatedBy?: string;
  updatedAt?: string;
}

export const SITE_SETTINGS_STORAGE_KEY = 'soverix_site_settings';

export const DEFAULT_BANNERS: SiteBanner[] = [
  {
    id: 'banner-saudi-5g',
    titleBn: '🇸🇦 সৌদি আরব ও মধ্যপ্রাচ্য ৫জি আনলিমিটেড ফ্রি-নেট কনফিগ',
    titleEn: '🇸🇦 Saudi Arabia & Gulf 5G Unlimited Free-Net Configs',
    subtitleBn: 'STC, Mobily, Zain ও Ooredoo সিমে ০ ব্যালেন্সে আল্ট্রা-স্পিড ব্রাউজিং এবং ১০০% আনব্লকড ভিওআইপি কলিং।',
    subtitleEn: 'Zero-balance ultra-fast browsing & crystal clear unblocked WhatsApp/IMO calling across STC, Mobily & Zain.',
    badgeBn: '🔥 হট অফার ২০২৬',
    badgeEn: '🔥 HOT PROMO 2026',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    actionUrl: 'https://api.whatsapp.com/send?phone=8801342930870&text=%E0%A6%86%E0%A6%B8%E0%A6%B8%E0%A6%BE%E0%A6%B2%E0%A6%BE%E0%A6%AE%E0%A7%81%20%E0%A6%86%E0%A6%B2%E0%A6%BE%E0%A6%87%E0%A6%95%E0%A7%81%E0%A6%AE%2C%20%E0%A6%86%E0%A6%AE%E0%A6%BF%20%E0%A6%B8%E0%A7%8C%E0%A6%A6%E0%A6%BF%20%E0%A6%86%E0%A6%B0%E0%A6%AC%20%E0%A7%AB%E0%A6%9C%E0%A6%BF%20%E0%A6%AB%E0%A7%8D%E0%A6%B0%E0%A6%BF-%E0%A6%A8%E0%A7%87%E0%A6%9F%20%E0%A6%95%E0%A6%A8%E0%A6%AB%E0%A6%BF%E0%A6%97%20%E0%A6%A8%E0%A6%BF%E0%A6%A4%E0%A7%87%20%E0%A6%9A%E0%A6%BE%E0%A6%87%E0%A7%A4',
    actionLabelBn: 'WhatsApp-এ ফ্রি-নেট কনফিগ সংগ্রহ করুন',
    actionLabelEn: 'Get FreeNet Config on WhatsApp',
    themeGradient: 'emerald',
    placement: 'hero',
    isActive: true,
    order: 1,
  },
  {
    id: 'banner-afv2ray-apps',
    titleBn: '⚡ অফিসিয়াল এপিকে ডাউনলোড: AF V2Ray & Jiyam Plus VPN',
    titleEn: '⚡ Official Android APKs: AF V2Ray & Jiyam Plus VIP',
    subtitleBn: 'বিশ্বের যেকোনো দেশে আল্ট্রা স্পিডে চলবে। V2Ray, VLESS Reality এবং বিশেষ বাইপাস প্রোটোকল যুক্ত।',
    subtitleEn: 'Seamless connection worldwide with V2Ray, VLESS Reality and specialized payload injection.',
    badgeBn: '📱 ভেরিফাইড অ্যাপ',
    badgeEn: '📱 VERIFIED APKS',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    actionUrl: 'https://github.com/flamessoflove-del/afv2rayapkdownloadelink/releases/download/1.0/af.v2.ray.apk',
    actionLabelBn: 'সরাসরি এপিকে ডাউনলোড করুন',
    actionLabelEn: 'Download Official APK Directly',
    themeGradient: 'cyan',
    placement: 'hero',
    isActive: true,
    order: 2,
  },
  {
    id: 'banner-vip-dedicated',
    titleBn: '👑 সোভারিক্সনেট প্রিমিয়াম ১০ Gbps ডেডিকেটেড নোডস',
    titleEn: '👑 Soverixnet Premium 10 Gbps Dedicated VIP Nodes',
    subtitleBn: 'PUBG ও Free Fire-এ ২০ms লো-পিং গেমিং এবং বাফারিং ছাড়া 4K লাইভ স্ট্রিমিং এক্সিলারেটর।',
    subtitleEn: 'Ultra-low 20ms ping for competitive gaming and 4K ultra HD bufferless streaming.',
    badgeBn: '⚡ আল্ট্রা ভিআইপি',
    badgeEn: '⚡ ULTRA VIP',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    actionUrl: 'https://api.whatsapp.com/send?phone=8801342930870&text=%E0%A6%86%E0%A6%B8%E0%A6%B8%E0%A6%BE%E0%A6%B2%E0%A6%BE%E0%A6%AE%E0%A7%81%20%E0%A6%86%E0%A6%B2%E0%A6%BE%E0%A6%87%E0%A6%95%E0%A7%81%E0%A6%AE%2C%20%E0%A6%86%E0%A6%AE%E0%A6%BF%20Soverixnet%20VPN%20%E0%A6%AD%E0%A6%BF%E0%A6%86%E0%A6%87%E0%A6%AA%E0%A6%BF%20%E0%A6%AA%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%95%E0%A7%87%E0%A6%9C%20%E0%A6%A8%E0%A6%BF%E0%A6%A4%E0%A7%87%20%E0%A6%9A%E0%A6%BE%E0%A6%87%E0%A7%A4',
    actionLabelBn: 'ভিআইপি অ্যাকাউন্ট একটিভ করুন',
    actionLabelEn: 'Activate VIP Account',
    themeGradient: 'amber',
    placement: 'hero',
    isActive: true,
    order: 3,
  },
];

export const DEFAULT_DESIGN_THEME: DesignThemeConfig = {
  accentColor: 'cyan',
  siteTitle: 'Soverixnet VPN',
  siteTaglineBn: 'কোয়ান্টাম-রেজিস্ট্যান্ট ক্রিপ্টোগ্রাফিক শিল্ড ও আল্ট্রা-ফাস্ট গ্লোবাল নেটওয়ার্ক',
  siteTaglineEn: 'Quantum-Resistant Encrypted Network & Zero-Log Anonymity',
  heroHeadlineBn: 'অজেয় সাইবার নিরাপত্তা ও আনলিমিটেড ফ্রি-নেট সলিউশন',
  heroHeadlineEn: 'Invincible Cyber Defense & Unlimited Free-Net Solution',
  heroSubheadlineBn: 'সৌদি আরব, সংযুক্ত আরব আমিরাত, কাতার এবং বিশ্বব্যাপী আনব্লকড ব্রাউজিং, আল্ট্রা লো-পিং গেমিং ও হাই-স্পিড ভিআইপি নোডস।',
  heroSubheadlineEn: 'Unrestricted browsing, ultra-low ping gaming, and high-speed VIP servers across Saudi Arabia, UAE, and worldwide.',
  showBackgroundGlow: true,
};

export const DEFAULT_SECTION_VISIBILITY: SectionVisibilityConfig = {
  heroConnect: true,
  topNoticeMarquee: true,
  bannersSlider: true,
  officialApks: true,
  videoTutorials: true,
  arabSimPayload: true,
  vipPlans: true,
  serverNodes: true,
  benefitsFeatures: true,
  communityReviews: true,
  floatingDock: true,
  liveSupport: true,
  promoModal: true,
};

export const DEFAULT_CUSTOM_APPS: CustomAppItem[] = [
  {
    id: 'af-v2ray',
    name: 'AF V2Ray VPN',
    nameBn: 'এএফ ভি২রে ভিপিএন (AF V2Ray)',
    version: 'v1.0 (All Countries)',
    downloadUrl: 'https://github.com/flamessoflove-del/afv2rayapkdownloadelink/releases/download/1.0/af.v2.ray.apk',
    badge: 'All Countries Working',
    badgeBn: 'সব দেশে চলবে',
    themeColor: 'cyan',
    descBn: 'বিশ্বের যেকোনো দেশে আল্ট্রা স্পিডে চলবে। V2Ray, VLESS Reality ও Trojan সাপোর্ট।',
    descEn: 'Works seamlessly in all countries worldwide. Supports V2Ray, VLESS Reality & Trojan.',
    size: '18.4 MB',
    featuresBn: ['সব দেশে কার্যকর', 'হাই-স্পিড নো-ল্যাগ', 'জিরো লগ পলিসি'],
    featuresEn: ['Global bypass', 'Ultra low ping', 'Zero logs'],
    order: 1,
    isActive: true,
  },
  {
    id: 'jiyam-plus',
    name: 'Jiyam Plus VPN',
    nameBn: 'জিয়াম প্লাস ভিপিএন (Jiyam Plus)',
    version: 'Latest Official Release',
    downloadUrl: 'https://upload.app/download/jiyam-plus-vpn/com.rksoft.jiyamplus.vpn/d75e1a0df56e37f253a36a6b2436f73edee03682c27356816f69d21da133983d',
    badge: 'Gulf & Arab FreeNet',
    badgeBn: 'আরব ও এশিয়া স্পেশাল',
    themeColor: 'emerald',
    descBn: 'সৌদি আরব (STC, Mobily, Zain), দুবাই, কাতার ও বাংলাদেশে ০ ব্যালেন্সে সুপারফাস্ট ফ্রি-নেট।',
    descEn: 'Optimized for Gulf SIM FreeNet (STC, Mobily, Zain) and zero-balance high-speed browsing.',
    size: '22.1 MB',
    featuresBn: ['STC, Mobily, Zain বাগ', '০ ব্যালেন্সে ফ্রি-নেট', 'অটো-রিকানেক্ট'],
    featuresEn: ['STC/Mobily/Zain', 'Zero balance freenet', 'Auto reconnect'],
    order: 2,
    isActive: true,
  },
  {
    id: 'mohin-vip',
    name: 'Mohin VIP VPN',
    nameBn: 'মহিন ভিআইপি ভিপিএন (Mohin VIP)',
    version: 'VIP Pro Edition',
    downloadUrl: 'https://upload.app/download/mohin-vip-vpn/dev.masterbuild.mohinvip/b330cdea6a0ce3ac5ff44d7f997f6762e7a4a7f8d7c1306bdd7811ea79d0e8b9/downloading',
    badge: 'Ultra VIP High-Speed',
    badgeBn: 'আল্ট্রা ভিআইপি স্পেশাল',
    themeColor: 'amber',
    descBn: 'গেমিং, এইচডি ভিডিও ও সরাসরি কলিংয়ের জন্য ভিআইপি ডেডিকেটেড সার্ভার। কোনো ডিসকানেক্ট নেই।',
    descEn: 'Ultra-fast dedicated VIP routing for seamless HD video, low-ping gaming, and uninterrupted calls.',
    size: '19.8 MB',
    featuresBn: ['ভিআইপি আল্ট্রা স্পিড', 'লো-পিং কলিং ও গেমিং', '১-ট্যাপ অটো কানেক্ট'],
    featuresEn: ['Ultra VIP Speed', 'Crystal Clear Audio/Video', 'Instant Connect'],
    order: 3,
    isActive: true,
  },
  {
    id: 'net-solution',
    name: 'Net Solution VPN',
    nameBn: 'নেট সলিউশন ভিপিএন (Net Solution)',
    version: 'Solution Final Release',
    downloadUrl: 'https://premiumapk.store/Apk/Net%20Solution.apk',
    badge: 'All SIM Solution',
    badgeBn: 'অল সিম সলিউশন',
    themeColor: 'purple',
    descBn: 'সব ধরনের সিম কার্ড ও ওয়াইফাই নেটওয়ার্কের জন্য শক্তিশালী টানেল সলিউশন ও আনলিমিটেড ব্যান্ডউইথ।',
    descEn: 'Complete all-in-one tunnel solution with instant payload injection and unlimited bandwidth.',
    size: '16.5 MB',
    featuresBn: ['অল সিম পেলোড সাপোর্ট', 'কাস্টম এসএনআই ইনজেক্টর', 'আনলিমিটেড ব্যান্ডউইথ'],
    featuresEn: ['All SIM payloads', 'Custom SNI bypass', 'Unlimited data'],
    order: 4,
    isActive: true,
  }
];

export const DEFAULT_CUSTOM_BENEFITS: CustomBenefitItem[] = [
  {
    id: 'benefit-1',
    titleBn: '১. সৌদি ও আরব সিমে ফ্রি নেট',
    titleEn: '1. Gulf Free Internet',
    descBn: 'সৌদি STC, Mobily, Zain এবং UAE-তে ০ ব্যালেন্সে আনলিমিটেড ফ্রি ইন্টারনেট ব্রাউজিং।',
    descEn: 'Zero-balance free internet payloads for KSA STC, Mobily, Zain & UAE Etisalat networks.',
    iconType: 'zap',
    themeColor: 'amber',
    order: 1,
    isActive: true,
  },
  {
    id: 'benefit-2',
    titleBn: '২. ৮ms আল্ট্রা লো-পিং গেমিং',
    titleEn: '2. Ultra Low-Ping Gaming',
    descBn: 'পাবজি (PUBG) ও ফ্রি ফায়ারে জিরো ল্যাগ। BDIX ও সিঙ্গাপুর সরাসরি অপটিক্যাল নোড।',
    descEn: 'Dedicated BDIX and Singapore low-jitter nodes for Free Fire, PUBG & competitive esports.',
    iconType: 'activity',
    themeColor: 'emerald',
    order: 2,
    isActive: true,
  },
  {
    id: 'benefit-3',
    titleBn: '৩. কলিং অ্যাপস আনব্লক',
    titleEn: '3. Unblock Calling Apps',
    descBn: 'দুবাই ও মধ্যপ্রাচ্যে WhatsApp কল, IMO, BOTIM ও FaceTime ১০০% ক্লিয়ার কাজ করে।',
    descEn: 'Unblock WhatsApp voice/video calls, BOTIM, IMO, and FaceTime in UAE & Gulf regions.',
    iconType: 'globe',
    themeColor: 'cyan',
    order: 3,
    isActive: true,
  },
  {
    id: 'benefit-4',
    titleBn: '৪. ১০০% র‍্যাম-অনলি নো-লগ',
    titleEn: '4. Diskless Zero Logs',
    descBn: 'হার্ডড্রাইভে কোনো ডাটা লেখা হয় না। রিবুট করলেই মেমোরির সব তথ্য চিরতরে মুছে যায়।',
    descEn: 'Server OS runs in volatile RAM; zero logs are ever saved, stored, or inspected.',
    iconType: 'harddrive',
    themeColor: 'purple',
    order: 4,
    isActive: true,
  },
  {
    id: 'benefit-5',
    titleBn: '৫. ১০ Gbps আল্ট্রা স্পিড',
    titleEn: '5. 10 Gbps Unmetered',
    descBn: 'আইএসপি থ্রটলিং পুরোপুরি বাইপাস করে 4K স্ট্রিমিং ও সুপারফাস্ট ডাউনলোড।',
    descEn: 'Bypass throttling completely with high-speed fiber backbones and zero bandwidth limits.',
    iconType: 'zap',
    themeColor: 'cyan',
    order: 5,
    isActive: true,
  },
  {
    id: 'benefit-6',
    titleBn: '৬. ক্লিন-নেট অ্যাড ব্লকার',
    titleEn: '6. CleanNet AdBlock',
    descBn: 'বিজ্ঞাপন ও ক্ষতিকর ট্র্যাকার ব্লক করে পেজ স্পিড বাড়ায় ও ৪০% ডাটা সাশ্রয় করে।',
    descEn: 'DNS filters strip ads, malicious domains, and battery-draining scripts.',
    iconType: 'eyeoff',
    themeColor: 'emerald',
    order: 6,
    isActive: true,
  },
  {
    id: 'benefit-7',
    titleBn: '৭. বিকাশ, নগদ ও STC Pay',
    titleEn: '7. bKash, Nagad & STC Pay',
    descBn: 'আন্তর্জাতিক কার্ড ছাড়াই দেশীয় টাকায় ও রিয়ালে মুহূর্তে প্যাকেজ অ্যাক্টিভেশন।',
    descEn: 'Instant activation via bKash, Nagad, Rocket, Mada, STC Pay, and Crypto.',
    iconType: 'shield',
    themeColor: 'amber',
    order: 7,
    isActive: true,
  },
  {
    id: 'benefit-8',
    titleBn: '৮. কোয়ান্টাম Kyber-1024',
    titleEn: '8. Post-Quantum Kyber',
    descBn: 'WireGuard, V2Ray VLESS Reality এবং কোয়ান্টাম সাইফার দিয়ে অভেদ্য নিরাপত্তা।',
    descEn: 'Next-generation quantum-resistant encryption that protects all sensitive data.',
    iconType: 'lock',
    themeColor: 'purple',
    order: 8,
    isActive: true,
  }
];

export const DEFAULT_CUSTOM_FAQS: CustomFaqItem[] = [
  {
    id: 'faq-1',
    qBn: 'সৌদি আরব বা মধ্যপ্রাচ্যে ফ্রি-নেট কীভাবে কাজ করে?',
    qEn: 'How does Arab SIM Free-Net work in Saudi Arabia?',
    aBn: 'সোভারিক্সনেট বিশেষ SNI ও হোস্ট পেলোড (যেমন freenet.stc.com.sa) ব্যবহার করে টেলিকম ফায়ারওয়াল বাইপাস করে শূন্য ব্যালেন্সে হাই-স্পিড ভিপিএন টানেল তৈরি করে।',
    aEn: 'Soverixnet uses custom SNI spoofing and V2Ray Reality payloads over port 443 to tunnel traffic through zero-rated carrier CDN endpoints with zero account balance.',
    category: 'freenet',
    order: 1,
    isActive: true,
  },
  {
    id: 'faq-2',
    qBn: 'সোভারিক্সনেট কি আসলেই কোনো লগ সংরক্ষণ করে না?',
    qEn: 'Does Soverixnet VPN keep any logs?',
    aBn: 'হ্যাঁ, আমাদের সার্ভারগুলো ১০০% র‍্যাম-অনলি (RAM-only diskless) সিস্টেমে পরিচালিত হয়। কোনো ব্যবহারকারীর আইপি বা ব্রাউজিং হিস্টোরি কোথাও সেভ হয় না।',
    aEn: 'Yes! All server instances run purely in volatile RAM. No connection metadata, real IP addresses, or browsing activities are ever written to disk or database.',
    category: 'privacy',
    order: 2,
    isActive: true,
  },
  {
    id: 'faq-3',
    qBn: 'গেম খেলার সময় পিং কেমন পাওয়া যাবে?',
    qEn: 'What ping can I expect while playing online games?',
    aBn: 'আমাদের ঢাকা BDIX নোডে পাবজি বা ফ্রি ফায়ারে মাত্র ৮ms থেকে ১৫ms পিং পাওয়া যায়। সিঙ্গাপুর নোডে পিং থাকে মাত্র ২৮ms থেকে ৩৫ms।',
    aEn: 'Gamers connecting to our Dhaka BDIX or Singapore nodes achieve ultra-low 8ms to 28ms ping with optimal packet routing and zero jitter.',
    category: 'gaming',
    order: 3,
    isActive: true,
  },
  {
    id: 'faq-4',
    qBn: 'ফ্রি এবং ভিআইপি প্ল্যানের মধ্যে পার্থক্য কী?',
    qEn: 'What is the difference between Free and VIP plans?',
    aBn: 'ফ্রি সার্ভারগুলো সবার জন্য উন্মুক্ত। ভিআইপি প্ল্যানে পাওয়া যায় ১০Gbps আল্ট্রা-হাই স্পিড নোড, মধ্যপ্রাচ্য ফ্রি-নেট পেলোড এবং একাধিক ডিভাইসে একসাথে ব্যবহারের সুবিধা।',
    aEn: 'Free servers offer standard connectivity. VIP subscribers unlock dedicated 10Gbps high-capacity servers, Arab SIM FreeNet configurations, and priority routing.',
    category: 'plans',
    order: 4,
    isActive: true,
  },
  {
    id: 'faq-5',
    qBn: 'কোন অ্যাপস দিয়ে সবচেয়ে ভালো ভিপিএন চলবে?',
    qEn: 'Which apps work best with Soverixnet VPN?',
    aBn: 'আমরা অফিসিয়ালি দুটি অ্যাপস রিকমেন্ড করি: ১. AF V2Ray APK (বিশ্বের যেকোনো দেশে আল্ট্রা স্পিডে চলার জন্য) এবং ২. Jiyam Plus VPN (সৌদি আরব ও মধ্যপ্রাচ্যে ০ ব্যালেন্সে ফ্রি-নেট চালানোর জন্য)। এছাড়াও v2rayNG, Shadowrocket ও WireGuard-এ চমৎকার কাজ করে।',
    aEn: 'We officially recommend: 1. AF V2Ray APK (works smoothly in all countries worldwide) and 2. Jiyam Plus VPN (tailored for Gulf SIM zero-balance FreeNet). You can also use v2rayNG, Shadowrocket, and WireGuard.',
    category: 'apps',
    order: 5,
    isActive: true,
  },
  {
    id: 'faq-6',
    qBn: 'কীভাবে পেমেন্ট করতে পারি এবং অ্যাক্টিভ হতে কতক্ষণ লাগে?',
    qEn: 'How do I pay and how quickly is VIP activated?',
    aBn: 'বিকাশ, নগদ, রকেট অথবা ক্রিপ্টোকারেন্সির মাধ্যমে সরাসরি পেমেন্ট করতে পারবেন। ট্রানজাকশন সাবমিট করার সাথে সাথেই ভিআইপি ইনস্ট্যান্ট চালু হয়ে যায়।',
    aEn: 'You can pay instantly using bKash, Nagad, Rocket, Binance Pay, or credit cards. Your VIP account activates immediately upon confirmation.',
    category: 'payment',
    order: 6,
    isActive: true,
  }
];

export const DEFAULT_CUSTOM_VIDEOS: CustomVideoItem[] = [
  {
    id: 'video-saudi-freenet-setup',
    titleBn: '🇸🇦 সৌদি আরব STC, Zain ও Mobily সিমে ফ্রি-নেট কিভাবে সেটআপ করবেন',
    titleEn: '🇸🇦 Saudi Arabia STC, Zain & Mobily Free-Net Setup Guide',
    descBn: 'কোনো ব্যালেন্স বা এমবি ছাড়াই সৌদি আরবে আনলিমিটেড হাই-স্পিড ইন্টারনেট চালানোর সম্পূর্ণ টিউটোরিয়াল। অ্যাপ সেটিংস ও SNI হোস্ট।',
    descEn: 'Complete step-by-step setup guide for zero-balance unlimited internet across Saudi Arabia networks.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    duration: '04:12',
    category: 'sim_setup',
    badgeBn: '🔥 সবচেয়ে জনপ্রিয়',
    badgeEn: '🔥 MOST POPULAR',
    isFeatured: true,
    order: 1,
    isActive: true,
    viewsCount: 12480,
    createdAt: '2026-03-01',
  },
  {
    id: 'video-afv2ray-app-guide',
    titleBn: '📱 AF V2Ray এবং Jiyam Plus VPN অ্যাপ ইনস্টল ও কানেক্ট করার নিয়ম',
    titleEn: '📱 How to Install and Connect AF V2Ray & Jiyam Plus VPN',
    descBn: 'অ্যান্ড্রয়েড ফোনে এপিকে ডাউনলোড করে ১-ট্যাপে ভিআইপি সার্ভারে সুপারফাস্ট কানেক্ট করার সহজ ভিডিও নির্দেশিকা।',
    descEn: 'How to install the official APKs on Android and connect to ultra-fast servers with 1 tap.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    duration: '03:30',
    category: 'app_tutorial',
    badgeBn: '📱 অ্যাপ টিউটোরিয়াল',
    badgeEn: '📱 APP TUTORIAL',
    isFeatured: false,
    order: 2,
    isActive: true,
    viewsCount: 8920,
    createdAt: '2026-03-05',
  },
  {
    id: 'video-speedtest-proof',
    titleBn: '⚡ লাইভ স্পিড টেস্ট ও আনলিমিটেড ডাউনলোড স্পিড প্রুফ (১০ Gbps)',
    titleEn: '⚡ 10 Gbps Live Speed Test & Zero Buffering 4K Streaming Proof',
    descBn: 'বাস্তবে কত স্পিড পাওয়া যায় দেখুন। ইউটিউব ৪K ভিডিও, টিকটক ও ফেসবুক ভিডিও কোনো বাফারিং ছাড়াই চলে।',
    descEn: 'Live network speed test showing ultra-high download speeds with zero lag and bufferless 4K streaming.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    duration: '02:45',
    category: 'speed_proof',
    badgeBn: '⚡ লাইভ প্রুফ',
    badgeEn: '⚡ LIVE PROOF',
    isFeatured: false,
    order: 3,
    isActive: true,
    viewsCount: 15300,
    createdAt: '2026-03-10',
  },
  {
    id: 'video-vip-pin-activation',
    titleBn: '👑 ভিআইপি ইউজারনেম ও পাসওয়ার্ড দিয়ে একাউন্ট অ্যাক্টিভ করার পদ্ধতি',
    titleEn: '👑 How to Activate VIP Account using Username & PIN Code',
    descBn: 'বিকাশ বা নগদ দিয়ে পেমেন্ট করার পর পাওয়া ভিআইপি কোড অ্যাপে বসিয়ে সাথে সাথে একটিভ করে নিন।',
    descEn: 'Quick activation instructions after purchasing VIP pass via bKash, Nagad, Mada or STC Pay.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    duration: '03:15',
    category: 'app_tutorial',
    badgeBn: '👑 ভিআইপি গাইড',
    badgeEn: '👑 VIP GUIDE',
    isFeatured: false,
    order: 4,
    isActive: true,
    viewsCount: 6410,
    createdAt: '2026-03-15',
  },
];

export const DEFAULT_HERO_CONTENT: HeroContentConfig = {
  badgeBn: '⚡ Next-Gen Cyber Shield & FreeNet',
  badgeEn: '⚡ Next-Gen Cyber Shield & FreeNet',
  headlineBn: 'অজেয় সাইবার নিরাপত্তা ও আনলিমিটেড ফ্রি-নেট সলিউশন',
  headlineEn: 'Invincible Cyber Defense & Unlimited Free-Net Solution',
  subheadlineBn: 'সৌদি আরব, সংযুক্ত আরব আমিরাত, কাতার এবং বিশ্বব্যাপী আনব্লকড ব্রাউজিং, আল্ট্রা লো-পিং গেমিং ও হাই-স্পিড ভিআইপি নোডস।',
  subheadlineEn: 'Unrestricted browsing, ultra-low ping gaming, and high-speed VIP servers across Saudi Arabia, UAE, and worldwide.',
  connectBtnTextBn: '১-ট্যাপ ভিপিএন কানেক্ট করুন',
  connectBtnTextEn: '1-Tap Quick Connect',
  statUptime: '99.9%',
  statPing: '12ms',
  statSpeed: '10 Gbps',
};

export const DEFAULT_WHATSAPP_CTA: WhatsappCtaConfig = {
  titleBn: 'যুক্ত হোন অফিসিয়াল WhatsApp চ্যানেলে: Soverixnet Internet unlimited Vpn',
  titleEn: 'Join Our Official WhatsApp Channel: Soverixnet Internet unlimited Vpn',
  subtitleBn: 'প্রতিদিনের ফ্রি ইন্টারনেট ট্রিক্স, নতুন নোড আপডেট ও এক্সক্লুসিভ অফার পান সবার আগে।',
  subtitleEn: 'Get daily free internet configs, new server updates, and priority customer support.',
  buttonTextBn: 'WhatsApp চ্যানেলে জয়েন করুন ➔',
  buttonTextEn: 'Join WhatsApp Channel ➔',
  channelUrl: 'https://whatsapp.com/channel/0029Va8iGsyIyPtWmND2jm0A',
};

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  settingId: 'general',
  whatsappNumber: '8801342930870',
  whatsappDisplayNumber: '+880 1342-930870',
  whatsappChannelUrl: 'https://whatsapp.com/channel/0029Va8iGsyIyPtWmND2jm0A',
  telegramUrl: 'https://t.me/soverixnet_vpn',
  officialEmail: 'soverixnet@gmail.com',
  tickerAnnouncementBn: '🇸🇦 সৌদি আরব STC & Mobily 5G আনলিমিটেড ফ্রি-নেট কনফিগ সরাসরি হোয়াটসঅ্যাপে সংগ্রহ করুন!',
  tickerAnnouncementEn: '🇸🇦 Saudi Arabia STC & Mobily 5G Unlimited FreeNet Config now available on WhatsApp!',
  promoModalEnabled: true,
  appAfV2RayUrl: 'https://github.com/flamessoflove-del/afv2rayapkdownloadelink/releases/download/1.0/af.v2.ray.apk',
  appJiyamPlusUrl: 'https://upload.app/download/jiyam-plus-vpn/com.rksoft.jiyamplus.vpn/d75e1a0df56e37f253a36a6b2436f73edee03682c27356816f69d21da133983d',
  appMohinVipUrl: 'https://upload.app/download/mohin-vip-vpn/dev.masterbuild.mohinvip/b330cdea6a0ce3ac5ff44d7f997f6762e7a4a7f8d7c1306bdd7811ea79d0e8b9/downloading',
  appNetSolutionUrl: 'https://premiumapk.store/Apk/Net%20Solution.apk',
  banners: DEFAULT_BANNERS,
  designTheme: DEFAULT_DESIGN_THEME,
  sectionVisibility: DEFAULT_SECTION_VISIBILITY,
  customApps: DEFAULT_CUSTOM_APPS,
  customBenefits: DEFAULT_CUSTOM_BENEFITS,
  customFaqs: DEFAULT_CUSTOM_FAQS,
  customVideos: DEFAULT_CUSTOM_VIDEOS,
  heroContent: DEFAULT_HERO_CONTENT,
  whatsappCtaContent: DEFAULT_WHATSAPP_CTA,
};

export const getSiteSettings = (): SiteSettingsData => {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_SITE_SETTINGS,
          ...parsed,
          banners: Array.isArray(parsed.banners) ? parsed.banners : DEFAULT_BANNERS,
          designTheme: { ...DEFAULT_DESIGN_THEME, ...(parsed.designTheme || {}) },
          sectionVisibility: { ...DEFAULT_SECTION_VISIBILITY, ...(parsed.sectionVisibility || {}) },
          customApps: Array.isArray(parsed.customApps) ? parsed.customApps : DEFAULT_CUSTOM_APPS,
          customBenefits: Array.isArray(parsed.customBenefits) ? parsed.customBenefits : DEFAULT_CUSTOM_BENEFITS,
          customFaqs: Array.isArray(parsed.customFaqs) ? parsed.customFaqs : DEFAULT_CUSTOM_FAQS,
          customVideos: Array.isArray(parsed.customVideos) ? parsed.customVideos : DEFAULT_CUSTOM_VIDEOS,
          heroContent: { ...DEFAULT_HERO_CONTENT, ...(parsed.heroContent || {}) },
          whatsappCtaContent: { ...DEFAULT_WHATSAPP_CTA, ...(parsed.whatsappCtaContent || {}) },
        };
      }
    }
  } catch {}
  return DEFAULT_SITE_SETTINGS;
};

export const saveSiteSettings = (newSettings: Partial<SiteSettingsData>): SiteSettingsData => {
  const current = getSiteSettings();
  const updated: SiteSettingsData = {
    ...current,
    ...newSettings,
    updatedAt: new Date().toISOString()
  };
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('soverix_settings_changed', { detail: updated }));
    }
  } catch {}
  return updated;
};

export const CONTACT_CONFIG = {
  // Official WhatsApp number with dynamic override
  get whatsappNumber() {
    return getSiteSettings().whatsappNumber;
  },
  get whatsappDisplayNumber() {
    return getSiteSettings().whatsappDisplayNumber;
  },
  get whatsappChannelUrl() {
    return getSiteSettings().whatsappChannelUrl;
  },
  get telegramUrl() {
    return getSiteSettings().telegramUrl;
  },
  get officialEmail() {
    return getSiteSettings().officialEmail;
  },

  // Official APK Downloads provided by user
  apps: {
    afV2Ray: {
      id: 'af-v2ray',
      name: 'AF V2Ray VPN',
      nameBn: 'এএফ ভি২রে ভিপিএন (AF V2Ray)',
      version: 'v1.0 (All Countries)',
      get downloadUrl() {
        return getSiteSettings().appAfV2RayUrl || 'https://github.com/flamessoflove-del/afv2rayapkdownloadelink/releases/download/1.0/af.v2.ray.apk';
      },
      badge: 'All Countries Working',
      badgeBn: 'সব দেশে চলবে',
      themeColor: 'cyan' as const,
      descBn: 'বিশ্বের যেকোনো দেশে আল্ট্রা স্পিডে চলবে। V2Ray, VLESS Reality ও Trojan সাপোর্ট।',
      descEn: 'Works seamlessly in all countries worldwide. Supports V2Ray, VLESS Reality & Trojan.',
      size: '18.4 MB',
      featuresBn: ['সব দেশে কার্যকর', 'হাই-স্পিড নো-ল্যাগ', 'জিরো লগ পলিসি'],
      featuresEn: ['Global bypass', 'Ultra low ping', 'Zero logs']
    },
    jiyamPlus: {
      id: 'jiyam-plus',
      name: 'Jiyam Plus VPN',
      nameBn: 'জিয়াম প্লাস ভিপিএন (Jiyam Plus)',
      version: 'Latest Official Release',
      get downloadUrl() {
        return getSiteSettings().appJiyamPlusUrl || 'https://upload.app/download/jiyam-plus-vpn/com.rksoft.jiyamplus.vpn/d75e1a0df56e37f253a36a6b2436f73edee03682c27356816f69d21da133983d';
      },
      badge: 'Gulf & Arab FreeNet',
      badgeBn: 'আরব ও এশিয়া স্পেশাল',
      themeColor: 'emerald' as const,
      descBn: 'সৌদি আরব (STC, Mobily, Zain), দুবাই, কাতার ও বাংলাদেশে ০ ব্যালেন্সে সুপারফাস্ট ফ্রি-নেট।',
      descEn: 'Optimized for Gulf SIM FreeNet (STC, Mobily, Zain) and zero-balance high-speed browsing.',
      size: '22.1 MB',
      featuresBn: ['STC, Mobily, Zain বাগ', '০ ব্যালেন্সে ফ্রি-নেট', 'অটো-রিকানেক্ট'],
      featuresEn: ['STC/Mobily/Zain', 'Zero balance freenet', 'Auto reconnect']
    },
    mohinVip: {
      id: 'mohin-vip',
      name: 'Mohin VIP VPN',
      nameBn: 'মহিন ভিআইপি ভিপিএন (Mohin VIP)',
      version: 'VIP Pro Edition',
      get downloadUrl() {
        return getSiteSettings().appMohinVipUrl || 'https://upload.app/download/mohin-vip-vpn/dev.masterbuild.mohinvip/b330cdea6a0ce3ac5ff44d7f997f6762e7a4a7f8d7c1306bdd7811ea79d0e8b9/downloading';
      },
      badge: 'Ultra VIP High-Speed',
      badgeBn: 'আল্ট্রা ভিআইপি স্পেশাল',
      themeColor: 'amber' as const,
      descBn: 'গেমিং, এইচডি ভিডিও ও সরাসরি কলিংয়ের জন্য ভিআইপি ডেডিকেটেড সার্ভার। কোনো ডিসকানেক্ট নেই।',
      descEn: 'Ultra-fast dedicated VIP routing for seamless HD video, low-ping gaming, and uninterrupted calls.',
      size: '19.8 MB',
      featuresBn: ['ভিআইপি আল্ট্রা স্পিড', 'লো-পিং কলিং ও গেমিং', '১-ট্যাপ অটো কানেক্ট'],
      featuresEn: ['Ultra VIP Speed', 'Crystal Clear Audio/Video', 'Instant Connect']
    },
    netSolution: {
      id: 'net-solution',
      name: 'Net Solution VPN',
      nameBn: 'নেট সলিউশন ভিপিএন (Net Solution)',
      version: 'Solution Final Release',
      get downloadUrl() {
        return getSiteSettings().appNetSolutionUrl || 'https://premiumapk.store/Apk/Net%20Solution.apk';
      },
      badge: 'All SIM Solution',
      badgeBn: 'অল সিম সলিউশন',
      themeColor: 'purple' as const,
      descBn: 'সব ধরনের সিম কার্ড ও ওয়াইফাই নেটওয়ার্কের জন্য শক্তিশালী টানেল সলিউশন ও আনলিমিটেড ব্যান্ডউইথ।',
      descEn: 'Complete all-in-one tunnel solution with instant payload injection and unlimited bandwidth.',
      size: '16.5 MB',
      featuresBn: ['অল সিম পেলোড সাপোর্ট', 'কাস্টম এসএনআই ইনজেক্টর', 'আনলিমিটেড ব্যান্ডউইথ'],
      featuresEn: ['All SIM payloads', 'Custom SNI bypass', 'Unlimited data']
    }
  },

  // Helper list of all apps for uniform rendering
  getAppList: () => {
    const settings = getSiteSettings();
    if (Array.isArray(settings.customApps) && settings.customApps.length > 0) {
      return settings.customApps.filter((a) => a.isActive !== false);
    }
    return [
      CONTACT_CONFIG.apps.afV2Ray,
      CONTACT_CONFIG.apps.jiyamPlus,
      CONTACT_CONFIG.apps.mohinVip,
      CONTACT_CONFIG.apps.netSolution,
    ];
  },

  // Helper to generate customized WhatsApp direct chat URLs with pre-filled messages
  getWhatsAppUrl: (customMessage?: string) => {
    const rawNumber = CONTACT_CONFIG.whatsappNumber || '8801342930870';
    const phone = rawNumber.replace(/[^0-9]/g, '');
    const defaultMsg = 'আসসালামু আলাইকুম, আমি Soverixnet VPN নিতে চাই। বিস্তারিত জানাবেন প্লিজ।';
    const message = customMessage || defaultMsg;
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
  },

  getServerOrderUrl: (serverName: string, country: string, isFreeNet?: boolean) => {
    const text = isFreeNet
      ? `আসসালামু আলাইকুম, আমি Soverixnet এর "${serverName}" (${country}) ফ্রি-নেট সার্ভার কনফিগ নিতে চাই। এটি কিভাবে সেটআপ করব জানাবেন প্লিজ।`
      : `আসসালামু আলাইকুম, আমি Soverixnet এর "${serverName}" (${country}) সার্ভারটি নিতে চাই। প্যাকেজ ও সেটআপ বিস্তারিত জানাবেন প্লিজ।`;
    return CONTACT_CONFIG.getWhatsAppUrl(text);
  },

  getPlanOrderUrl: (planName: string, price: string) => {
    const text = `আসসালামু আলাইকুম, আমি Soverixnet VPN এর "${planName}" (${price}) প্যাকেজটি নিতে চাই। বিকাশ/নগদ/মাদা পেমেন্ট ও সেটআপ বিস্তারিত জানাবেন প্লিজ।`;
    return CONTACT_CONFIG.getWhatsAppUrl(text);
  }
};

export const getAppList = CONTACT_CONFIG.getAppList;

