// Centralized Contact and WhatsApp Configuration for Soverixnet VPN
export const CONTACT_CONFIG = {
  // Official WhatsApp number (in international format without + or spaces for wa.me link)
  whatsappNumber: '8801700000000',
  whatsappDisplayNumber: '+880 1700-000000',
  whatsappChannelUrl: 'https://whatsapp.com/channel/0029VbCB2eb1Hsq1gDX4HP13',
  telegramUrl: 'https://t.me/soverixnet_vpn',
  officialEmail: 'soverixnet@gmail.com',

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
