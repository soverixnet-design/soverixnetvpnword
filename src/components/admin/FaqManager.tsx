import React, { useState } from 'react';
import { 
  CustomFaqItem, 
  SiteSettingsData, 
  getSiteSettings, 
  saveSiteSettings,
  DEFAULT_CUSTOM_FAQS
} from '../../data/contact';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  RotateCcw, 
  CheckCircle2, 
  ChevronDown
} from 'lucide-react';

interface FaqManagerProps {
  lang: 'en' | 'bn';
  onUpdated?: () => void;
}

export const FaqManager: React.FC<FaqManagerProps> = ({ lang, onUpdated }) => {
  const [settings, setSettings] = useState<SiteSettingsData>(getSiteSettings());
  const faqs = settings.customFaqs || DEFAULT_CUSTOM_FAQS;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formQBn, setFormQBn] = useState('');
  const [formQEn, setFormQEn] = useState('');
  const [formABn, setFormABn] = useState('');
  const [formAEn, setFormAEn] = useState('');
  const [formCategory, setFormCategory] = useState('general');
  const [formIsActive, setFormIsActive] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormQBn('');
    setFormQEn('');
    setFormABn('');
    setFormAEn('');
    setFormCategory('general');
    setFormIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (faq: CustomFaqItem) => {
    setEditingId(faq.id);
    setFormQBn(faq.qBn);
    setFormQEn(faq.qEn);
    setFormABn(faq.aBn);
    setFormAEn(faq.aEn);
    setFormCategory(faq.category || 'general');
    setFormIsActive(faq.isActive !== false);
    setModalOpen(true);
  };

  const handleToggle = async (id: string) => {
    const updated = faqs.map((f) => {
      if (f.id === id) return { ...f, isActive: !f.isActive };
      return f;
    });

    const newSettings = saveSiteSettings({ customFaqs: updated });
    setSettings(newSettings);
    try {
      await setDoc(doc(db, 'settings', 'general'), { customFaqs: updated }, { merge: true });
    } catch {}
    setNotice(lang === 'bn' ? 'প্রশ্নোত্তর স্ট্যাটাস পরিবর্তন হয়েছে।' : 'FAQ status updated.');
    setTimeout(() => setNotice(null), 2500);
    onUpdated?.();
  };

  const handleDelete = async (id: string, qText: string) => {
    if (!confirm(lang === 'bn' ? `"${qText}" প্রশ্নটি কি মুছে ফেলতে চান?` : `Delete FAQ "${qText}"?`)) {
      return;
    }

    const updated = faqs.filter((f) => f.id !== id);
    const newSettings = saveSiteSettings({ customFaqs: updated });
    setSettings(newSettings);
    try {
      await setDoc(doc(db, 'settings', 'general'), { customFaqs: updated }, { merge: true });
    } catch {}
    setNotice(lang === 'bn' ? 'প্রশ্নোত্তরটি মুছে ফেলা হয়েছে।' : 'FAQ removed.');
    setTimeout(() => setNotice(null), 3000);
    onUpdated?.();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQBn.trim() && !formQEn.trim()) return;

    setIsSaving(true);
    let updated: CustomFaqItem[];

    if (editingId) {
      updated = faqs.map((f) => {
        if (f.id === editingId) {
          return {
            ...f,
            qBn: formQBn.trim(),
            qEn: formQEn.trim(),
            aBn: formABn.trim(),
            aEn: formAEn.trim(),
            category: formCategory,
            isActive: formIsActive,
          };
        }
        return f;
      });
    } else {
      const newItem: CustomFaqItem = {
        id: 'faq-' + Date.now(),
        qBn: formQBn.trim(),
        qEn: formQEn.trim(),
        aBn: formABn.trim(),
        aEn: formAEn.trim(),
        category: formCategory,
        order: faqs.length + 1,
        isActive: formIsActive,
      };
      updated = [...faqs, newItem];
    }

    const newSettings = saveSiteSettings({ customFaqs: updated });
    setSettings(newSettings);
    try {
      await setDoc(doc(db, 'settings', 'general'), { customFaqs: updated }, { merge: true });
    } catch {}

    setIsSaving(false);
    setModalOpen(false);
    setNotice(lang === 'bn' ? 'প্রশ্নোত্তর সফলভাবে সেভ হয়েছে!' : 'FAQs saved successfully!');
    setTimeout(() => setNotice(null), 3500);
    onUpdated?.();
  };

  const handleReset = async () => {
    if (confirm(lang === 'bn' ? 'সব প্রশ্নোত্তর কি ডিফল্ট মানে রিসেট করতে চান?' : 'Reset to default FAQs?')) {
      const newSettings = saveSiteSettings({ customFaqs: DEFAULT_CUSTOM_FAQS });
      setSettings(newSettings);
      try {
        await setDoc(doc(db, 'settings', 'general'), { customFaqs: DEFAULT_CUSTOM_FAQS }, { merge: true });
      } catch {}
      setNotice(lang === 'bn' ? 'ডিফল্ট প্রশ্নোত্তরে রিসেট করা হয়েছে।' : 'Reset to default FAQs.');
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
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0a1625] via-slate-950 to-[#0e1d2c] border border-cyan-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী ম্যানেজার' : 'Frequently Asked Questions (FAQ)'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {lang === 'bn' ? 'এফএকিউ (FAQ) প্রশ্নোত্তর পরিবর্তন ও যুক্তকরণ' : 'Manage All Website FAQs'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'bn' 
              ? 'ওয়েবসাইটের নিচের প্রশ্নোত্তর সেকশনের প্রতিটি প্রশ্ন ও উত্তর নিজে থেকে লিখুন, এডিট করুন বা মুছে ফেলুন।' 
              : 'Add new questions, customize answers in Bengali and English, or remove questions.'}
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
            className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{lang === 'bn' ? 'নতুন প্রশ্নোত্তর যোগ করুন' : 'Add New FAQ'}</span>
          </button>
        </div>
      </div>

      {/* List of FAQs */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div
            key={faq.id}
            className={`rounded-2xl border p-4 transition-all ${
              faq.isActive !== false
                ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                : 'bg-slate-950/40 border-slate-900 opacity-60'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    Q{idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {lang === 'bn' ? faq.qBn : faq.qEn}
                  </h4>
                </div>

                <p className="text-xs text-slate-300 pl-8 leading-relaxed">
                  {lang === 'bn' ? faq.aBn : faq.aEn}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleToggle(faq.id)}
                  className={`px-2 py-1 rounded-full text-[10px] font-bold border cursor-pointer ${
                    faq.isActive !== false
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  {faq.isActive !== false ? 'Active' : 'Hidden'}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(faq)}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 cursor-pointer"
                  title={lang === 'bn' ? 'এডিট করুন' : 'Edit'}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(faq.id, faq.qBn)}
                  className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 cursor-pointer"
                  title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl my-auto rounded-3xl bg-[#070e1c] border border-cyan-500/40 shadow-2xl p-6 text-slate-200 animate-scale-up space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-black text-white">
                  {editingId 
                    ? (lang === 'bn' ? 'প্রশ্নোত্তর সম্পাদনা' : 'Edit FAQ') 
                    : (lang === 'bn' ? 'নতুন প্রশ্নোত্তর যোগ করুন' : 'Add New FAQ')}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'প্রশ্ন (বাংলা)' : 'Question (Bengali)'} *
                </label>
                <input
                  type="text"
                  value={formQBn}
                  onChange={(e) => setFormQBn(e.target.value)}
                  placeholder="যেমন: সৌদি আরবে ফ্রি-নেট কীভাবে কাজ করে?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'প্রশ্ন (ইংরেজি)' : 'Question (English)'}
                </label>
                <input
                  type="text"
                  value={formQEn}
                  onChange={(e) => setFormQEn(e.target.value)}
                  placeholder="e.g. How does Arab SIM Free-Net work?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'উত্তর (বাংলা)' : 'Answer (Bengali)'} *
                </label>
                <textarea
                  rows={3}
                  value={formABn}
                  onChange={(e) => setFormABn(e.target.value)}
                  placeholder="উত্তরের বিস্তারিত বিবরণ লিখুন..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'উত্তর (ইংরেজি)' : 'Answer (English)'}
                </label>
                <textarea
                  rows={3}
                  value={formAEn}
                  onChange={(e) => setFormAEn(e.target.value)}
                  placeholder="Detailed answer text..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formFaqActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="formFaqActive" className="text-slate-300 font-bold cursor-pointer">
                  {lang === 'bn' ? 'এই প্রশ্নোত্তরটি হোমপেজে সক্রিয় রাখুন' : 'Keep this FAQ active on site'}
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
                  className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
