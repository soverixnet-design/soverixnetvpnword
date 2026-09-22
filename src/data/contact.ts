// Centralized Contact and WhatsApp Configuration for Soverixnet VPN
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

export const CONTACT_CONFIG = {
  // Official WhatsApp number: +880 1342-930870
  whatsappNumber: '8801342930870',
  whatsappDisplayNumber: '+880 1342-930870',
  whatsappChannelUrl: 'https://whatsapp.com/channel/0029Va8iGsyIyPtWmND2jm0A',
  telegramUrl: 'https://t.me/soverixnet_vpn',
  officialEmail: 'soverixnet@gmail.com',

  // Official APK Downloads provided by user
  apps: {
    afV2Ray: {
      id: 'af-v2ray',
      name: 'AF V2Ray VPN',
      nameBn: 'এএফ ভি২রে ভিপিএন (AF V2Ray)',
      version: 'v1.0 (All Countries)',
      downloadUrl: 'https://github.com/flamessoflove-del/afv2rayapkdownloadelink/releases/download/1.0/af.v2.ray.apk',
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
      downloadUrl: 'https://upload.app/download/jiyam-plus-vpn/com.rksoft.jiyamplus.vpn/d75e1a0df56e37f253a36a6b2436f73edee03682c27356816f69d21da133983d',
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
      downloadUrl: 'https://upload.app/download/mohin-vip-vpn/dev.masterbuild.mohinvip/b330cdea6a0ce3ac5ff44d7f997f6762e7a4a7f8d7c1306bdd7811ea79d0e8b9/downloading',
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
      downloadUrl: 'https://premiumapk.store/Apk/Net%20Solution.apk',
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
    return [
      CONTACT_CONFIG.apps.afV2Ray,
      CONTACT_CONFIG.apps.jiyamPlus,
      CONTACT_CONFIG.apps.mohinVip,
      CONTACT_CONFIG.apps.netSolution,
    ];
  },

  // Helper to generate customized WhatsApp direct chat URLs with pre-filled messages
  getWhatsAppUrl: (customMessage?: string) => {
    // Check if custom number is saved in localStorage
    let phone = CONTACT_CONFIG.whatsappNumber;
    try {
      const saved = localStorage.getItem('soverix_whatsapp_number');
      if (saved && saved.trim()) {
        phone = saved.replace(/[^0-9]/g, '');
      }
    } catch {}

    const defaultMsg = 'আসসালামু আলাইকুম, আমি Soverixnet VPN নিতে চাই। বিস্তারিত জানাবেন প্লিজ।';
    const message = customMessage || defaultMsg;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
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

