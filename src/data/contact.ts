// Centralized Contact and WhatsApp Configuration for Soverixnet VPN
export const CONTACT_CONFIG = {
  // Official WhatsApp number (in international format without + or spaces for wa.me link)
  whatsappNumber: '8801700000000',
  whatsappDisplayNumber: '+880 1700-000000',
  whatsappChannelUrl: 'https://whatsapp.com/channel/0029Va8iGsyIyPtWmND2jm0A',
  telegramUrl: 'https://t.me/soverixnet_vpn',
  officialEmail: 'soverixnet@gmail.com',

  // Official APK Downloads provided by user
  apps: {
    afV2Ray: {
      name: 'AF V2Ray VPN',
      nameBn: 'এএফ ভি২রে ভিপিএন (সকল দেশে চলবে)',
      version: 'v1.0 (All Countries)',
      downloadUrl: 'https://github.com/flamessoflove-del/afv2rayapkdownloadelink/releases/download/1.0/af.v2.ray.apk',
      badge: 'All Countries Working',
      badgeBn: 'সব দেশে চলবে',
      descBn: 'বিশ্বের যেকোনো দেশে আল্ট্রা স্পিডে চলবে। V2Ray, VLESS, VMess ও ট্রোজান সাপোর্ট।',
      descEn: 'Works seamlessly in all countries worldwide. Supports V2Ray, VLESS, VMess & Trojan.'
    },
    jiyamPlus: {
      name: 'Jiyam Plus VPN',
      nameBn: 'জিয়াম প্লাস ভিপিএন (Jiyam Plus)',
      version: 'Latest Official Release',
      downloadUrl: 'https://upload.app/download/jiyam-plus-vpn/com.rksoft.jiyamplus.vpn/d75e1a0df56e37f253a36a6b2436f73edee03682c27356816f69d21da133983d',
      badge: 'Gulf & Asia Special',
      badgeBn: 'আরব ও এশিয়া স্পেশাল',
      descBn: 'সৌদি আরব, দুবাই, কাতার ও বাংলাদেশে ০ ব্যালেন্সে সুপারফাস্ট ফ্রি-নেট চালানোর জন্য পারফেক্ট।',
      descEn: 'Optimized for Gulf SIM FreeNet (STC, Mobily, Zain) and zero-balance high-speed browsing.'
    }
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
