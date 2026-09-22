import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  X, 
  Sparkles, 
  Check, 
  Headphones, 
  ExternalLink,
  Bot,
  HelpCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { CONTACT_CONFIG } from '../data/contact';
import confetti from 'canvas-confetti';

interface LiveSupportWidgetProps {
  lang: 'en' | 'bn';
}

export const LiveSupportWidget: React.FC<LiveSupportWidgetProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick_faq' | 'contact' | 'ticket'>('quick_faq');
  const [userQuery, setUserQuery] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const WHATSAPP_CHANNEL_URL = CONTACT_CONFIG.whatsappChannelUrl;
  const TELEGRAM_COMMUNITY_URL = CONTACT_CONFIG.telegramUrl;
  const WHATSAPP_DIRECT_CHAT = CONTACT_CONFIG.getWhatsAppUrl('Hello SoverixNet Support, I need assistance with VPN setup.');

  const FAQS = [
    {
      qEn: 'How do I connect on Saudi STC, Mobily or Zain with FreeNet?',
      qBn: 'সৌদি STC, Mobily বা Zain সিমে ফ্রি-নেট কীভাবে চালাবো?',
      aEn: '1. Select the Arab FreeNet server node (STC Sawa or Mobily 60). 2. Go to "Export Configs" or "🇸🇦 Arab SIM SNI". 3. Scan the QR code or copy the VLESS/HTTP Custom URI into v2rayNG or HTTP Custom app on your phone.',
      aBn: '১. আরব ফ্রি-নেট সার্ভার (যেমন STC Sawa বা Mobily 60) সিলেক্ট করুন। ২. "কনফিগ ফাইল" বা "🇸🇦 আরব সিম SNI" ট্যাবে যান। ৩. QR কোড স্ক্যান করে বা VLESS লিঙ্ক কপি করে আপনার ফোনে v2rayNG বা HTTP Custom অ্যাপে পেস্ট করে কানেক্ট করুন।'
    },
    {
      qEn: 'What is the difference between Free and VIP accounts?',
      qBn: 'ফ্রি এবং ভিআইপি অ্যাকাউন্টের মধ্যে পার্থক্য কী?',
      aEn: 'Free accounts get 1 high-speed Singapore trial node. VIP accounts unlock all 50+ global 10Gbps nodes, Arab SIM bypass SNIs, 4K streaming unblock, and 15ms gaming routes.',
      aBn: 'ফ্রি অ্যাকাউন্টে ১টি ফ্রি সিঙ্গাপুর ট্রায়াল নোড দেওয়া হয়। আর ভিআইপি অ্যাকাউন্টে ৫০+ সব গ্লোবাল নোড, আরব সিমের ফ্রি নেট বাইপাস, ৪কে স্ট্রিমিং এবং লো-পিং গেমিং সুবিধা আনলক হয়।'
    },
    {
      qEn: 'How long does VIP activation take after bKash/Nagad payment?',
      qBn: 'বিকাশ/নগদ পেমেন্টের কতক্ষণ পর VIP চালু হয়?',
      aEn: 'Instant! Once you submit your Transaction ID or redeem a VIP token, your account updates automatically in under 5 seconds.',
      aBn: 'তাৎক্ষণিকভাবে! ট্রানজেকশন আইডি (TrxID) বা প্রমো কোড সাবমিট করার ৫ সেকেন্ডের মধ্যে অ্যাকাউন্ট স্বয়ংক্রিয়ভাবে ভিআইপিতে আপগ্রেড হয়ে যায়।'
    }
  ];

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    setTicketSent(true);
    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } catch {}

    setTimeout(() => {
      setUserQuery('');
      setTicketSent(false);
      setIsOpen(false);
    }, 3000);
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-3.5 sm:p-4 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black font-extrabold shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center gap-2 group border border-emerald-300/40"
          title="24/7 Live Support & Helpdesk"
        >
          <Headphones className="w-6 h-6 text-black" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold text-black pl-1">
            {lang === 'bn' ? '২৪/৭ লাইভ সাপোর্ট' : '24/7 Live Support'}
          </span>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-[#030712] animate-ping" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-[#030712]" />
        </button>
      </div>

      {/* Interactive Support Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#050b18] border border-cyan-500/30 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 relative overflow-hidden">
            
            {/* Ambient glow */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Headphones className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">
                    {lang === 'bn' ? 'সোভারিক্স হেল্পডেস্ক ও লাইভ সাপোর্ট' : 'Soverix Helpdesk & Live Support'}
                  </h4>
                  <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{lang === 'bn' ? '২৪/৭ সাপোর্ট এজেন্ট অনলাইনে আছে' : '24/7 Agents Online'}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Support Mode Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              {[
                { id: 'quick_faq', label: lang === 'bn' ? '❓ সাধারণ প্রশ্নোত্তর' : '❓ Quick FAQ' },
                { id: 'contact', label: lang === 'bn' ? '💬 WhatsApp / Telegram' : '💬 Live Chat' },
                { id: 'ticket', label: lang === 'bn' ? '📩 মেসেজ পাঠান' : '📩 Ticket' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: FAQs */}
            {activeTab === 'quick_faq' && (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {FAQS.map((faq, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <h5 className="text-xs font-bold text-cyan-300">
                      {lang === 'bn' ? faq.qBn : faq.qEn}
                    </h5>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {lang === 'bn' ? faq.aBn : faq.aEn}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: WhatsApp & Telegram Direct Contacts */}
            {activeTab === 'contact' && (
              <div className="space-y-3">
                <a
                  href={WHATSAPP_DIRECT_CHAT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/40 border border-emerald-500/50 hover:border-emerald-400 flex items-center justify-between transition-all group shadow-lg shadow-emerald-500/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                      💬
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                        {lang === 'bn' ? `WhatsApp ডিরেক্ট সাপোর্ট (${CONTACT_CONFIG.whatsappDisplayNumber})` : `WhatsApp Support (${CONTACT_CONFIG.whatsappDisplayNumber})`}
                      </h5>
                      <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                        {CONTACT_CONFIG.whatsappDisplayNumber} • {lang === 'bn' ? '২৪ ঘণ্টা দ্রুত রেসপন্স' : 'Fast 24/7 Response'}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href={WHATSAPP_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                      🟢
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                        {lang === 'bn' ? 'WhatsApp অফিসিয়াল চ্যানেল' : 'Official WhatsApp Channel'}
                      </h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {lang === 'bn' ? 'নতুন ফ্রি-নেট কনফিগ, ট্রিক্স ও আপডেট পান' : 'Instant free-net configs, updates & notice'}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href={TELEGRAM_COMMUNITY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/70 to-slate-900 border border-blue-500/40 hover:border-blue-400 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg">
                      ✈️
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-white group-hover:text-blue-300 transition-colors">
                        {lang === 'bn' ? 'Telegram কমিউনিটি ও সাপোর্ট' : 'Telegram VIP Community'}
                      </h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {lang === 'bn' ? 'সার্ভার স্ট্যাটাস ও লাইভ চ্যাট হেল্প' : 'Server status, bot keys & direct help'}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            )}

            {/* Tab 3: Direct Ticket / Inquiry */}
            {activeTab === 'ticket' && (
              <form onSubmit={handleSendTicket} className="space-y-3">
                {ticketSent ? (
                  <div className="p-5 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 text-center space-y-2">
                    <Check className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h5 className="text-xs font-bold text-emerald-300">
                      {lang === 'bn' ? 'আপনার মেসেজ এডমিনের কাছে পাঠানো হয়েছে!' : 'Ticket submitted to Admin!'}
                    </h5>
                    <p className="text-[11px] text-slate-300">
                      {lang === 'bn' ? 'আমাদের প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করবে।' : 'Our agents will review and follow up promptly.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <textarea
                      rows={3}
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder={
                        lang === 'bn'
                          ? 'আপনার সমস্যা বা প্রশ্ন বিস্তারিত লিখুন (যেমন: কোন সিম, কোন সার্ভার)...'
                          : 'Describe your issue or question (e.g. SIM operator, server node)...'
                      }
                      className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none resize-none"
                    />

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Send className="w-4 h-4 text-black" />
                      <span>{lang === 'bn' ? 'মেসেজ সাবমিট করুন' : 'Submit Inquiry'}</span>
                    </button>
                  </>
                )}
              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
};
