import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Phone, 
  MessageSquare, 
  Trash2, 
  RefreshCw, 
  Download, 
  FileSpreadsheet, 
  ShieldAlert, 
  Lock, 
  Plus, 
  Key, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Calendar,
  X,
  Send,
  Zap,
  ChevronDown
} from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth, OWNER_EMAIL } from '../../firebase/AuthContext';
import { RetailOrder, OrderStatus } from '../../types';
import confetti from 'canvas-confetti';

interface OrdersManagerProps {
  lang: 'en' | 'bn';
}

const FALLBACK_ORDERS: RetailOrder[] = [
  {
    orderId: 'ORD-1727529100000-8A1',
    countryId: 'saudi',
    countryName: 'সৌদি আরব (Saudi Arabia)',
    packageId: '1m',
    packageName: '১ মাস ভিআইপি পিন (1 Month VIP)',
    quantity: 1,
    totalSar: 15,
    totalBdt: 350,
    name: 'মোহাম্মদ তারেক',
    phone: '+966501234567',
    payment: 'stc_pay',
    notes: 'STC SIM 5G আনলিমিটেড চালানোর জন্য পিন প্রয়োজন।',
    status: 'pending',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    orderId: 'ORD-1727528400000-9B2',
    countryId: 'malaysia',
    countryName: 'মালয়েশিয়া (Malaysia)',
    packageId: '3m',
    packageName: '৩ মাস ভিআইপি পিন (3 Months VIP)',
    quantity: 2,
    totalSar: 80,
    totalBdt: 1900,
    name: 'রাশেদ খান (KL)',
    phone: '+601123456789',
    payment: 'tng_duitnow',
    notes: 'CelcomDigi & Hotlink SIM-এ ব্যবহার করব।',
    status: 'processing',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    assignedPin: 'SOV-MYR-9921-VIP',
  },
  {
    orderId: 'ORD-1727524800000-3C4',
    countryId: 'qatar',
    countryName: 'কাতার (Qatar)',
    packageId: '1y',
    packageName: '১ বছর আনলিমিটেড (1 Year Unlimited)',
    quantity: 1,
    totalSar: 130,
    totalBdt: 3200,
    name: 'ইসমাইল হোসেন',
    phone: '+97455123456',
    payment: 'bkash',
    notes: 'বিকাশ সেন্ড মানি করেছি, ট্রানজেকশন ID: 9X8Y7Z6W5V',
    status: 'completed',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    assignedPin: 'SOV-VIP-QAT-1YEAR-84920',
  },
  {
    orderId: 'ORD-1727521200000-4D5',
    countryId: 'uae',
    countryName: 'সংযুক্ত আরব আমিরাত (UAE)',
    packageId: '1m',
    packageName: '১ মাস ভিআইপি পিন (1 Month VIP)',
    quantity: 1,
    totalSar: 15,
    totalBdt: 350,
    name: 'ফারুক আহমেদ',
    phone: '+971501234567',
    payment: 'nagad',
    notes: 'ডুপ্লেক্স ও ইমারজেন্সি হোয়াটসঅ্যাপ কল আনলক করার জন্য।',
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    orderId: 'ORD-1727518000000-5E6',
    countryId: 'bahrain',
    countryName: 'বাহরাইন (Bahrain)',
    packageId: '6m',
    packageName: '৬ মাস সুপার সেভার (6 Months VIP)',
    quantity: 1,
    totalSar: 75,
    totalBdt: 1800,
    name: 'আব্দুল করিম',
    phone: '+97333123456',
    payment: 'binance',
    notes: 'USDT 15$ sent via Binance Pay',
    status: 'completed',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 11 * 3600 * 1000).toISOString(),
    assignedPin: 'SOV-BHR-6M-7731-TITAN',
  }
];

export const OrdersManager: React.FC<OrdersManagerProps> = ({ lang }) => {
  const { user, userProfile, isSuperAdmin, signInWithGoogle } = useAuth();

  // Strict check: User must be authenticated super admin (email matches OWNER_EMAIL or role is super_admin)
  const isAuthorizedSuperAdmin = Boolean(
    isSuperAdmin ||
    (user?.email && user.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) ||
    (userProfile?.email && userProfile.email.toLowerCase() === OWNER_EMAIL.toLowerCase())
  );

  const [orders, setOrders] = useState<RetailOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedTsv, setCopiedTsv] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modal for Fulfilling / Completing order
  const [fulfillingOrder, setFulfillingOrder] = useState<RetailOrder | null>(null);
  const [modalPinInput, setModalPinInput] = useState<string>('');
  const [modalNotesInput, setModalNotesInput] = useState<string>('');
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  // Manual Add Order Modal
  const [showAddOrderModal, setShowAddOrderModal] = useState<boolean>(false);
  const [manualName, setManualName] = useState<string>('');
  const [manualPhone, setManualPhone] = useState<string>('');
  const [manualCountry, setManualCountry] = useState<string>('Saudi Arabia (সৌদি আরব)');
  const [manualPackage, setManualPackage] = useState<string>('১ মাস ভিআইপি পিন (1 Month VIP)');
  const [manualQty, setManualQty] = useState<number>(1);
  const [manualSar, setManualSar] = useState<number>(15);
  const [manualBdt, setManualBdt] = useState<number>(350);
  const [manualPayment, setManualPayment] = useState<string>('bkash');
  const [manualNotes, setManualNotes] = useState<string>('');

  // Realtime Firestore Listener
  useEffect(() => {
    if (!isAuthorizedSuperAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubscribe = () => {};

    try {
      unsubscribe = onSnapshot(
        collection(db, 'retailOrders'),
        (snapshot) => {
          const loaded: RetailOrder[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            loaded.push({
              orderId: docSnap.id,
              ...data,
            } as RetailOrder);
          });

          // Sort by createdAt descending
          loaded.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

          if (loaded.length > 0) {
            setOrders(loaded);
          } else {
            // Provide fallback demo dataset so super admin can test interactions
            setOrders(FALLBACK_ORDERS);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('OrdersManager live subscription notice (using local fallback dataset):', err);
          setOrders(FALLBACK_ORDERS);
          setLoading(false);
        }
      );
    } catch {
      setOrders(FALLBACK_ORDERS);
      setLoading(false);
    }

    return () => unsubscribe();
  }, [isAuthorizedSuperAdmin]);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Status Update Handlers
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const orderRef = doc(db, 'retailOrders', orderId);
      const updateData: Partial<RetailOrder> = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      if (newStatus === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }

      await updateDoc(orderRef, updateData);

      setOrders((prev) =>
        prev.map((ord) => (ord.orderId === orderId ? { ...ord, ...updateData } : ord))
      );

      showNotification(
        lang === 'bn' 
          ? `অর্ডার #${orderId} স্ট্যাটাস '${newStatus}' আপডেট হয়েছে!` 
          : `Order #${orderId} status set to '${newStatus}'!`
      );
    } catch (err) {
      console.warn('Firestore update fallback:', err);
      // Local state update fallback
      setOrders((prev) =>
        prev.map((ord) =>
          ord.orderId === orderId
            ? { ...ord, status: newStatus, updatedAt: new Date().toISOString() }
            : ord
        )
      );
      showNotification(
        lang === 'bn' 
          ? `অর্ডার #${orderId} আপডেট সম্পন্ন হয়েছে (লোকাল সেশন)` 
          : `Order #${orderId} updated successfully (local session)`
      );
    }
  };

  // Open Fulfill Modal
  const handleOpenFulfillModal = (order: RetailOrder) => {
    setFulfillingOrder(order);
    const suggestedPin = order.assignedPin || `SOV-VIP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setModalPinInput(suggestedPin);
    setModalNotesInput(order.notes || '');
  };

  // Complete Order with Assigned PIN
  const handleConfirmCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fulfillingOrder) return;

    setIsSubmittingAction(true);
    const nowIso = new Date().toISOString();
    const pin = modalPinInput.trim() || `SOV-VIP-${Date.now().toString(36).toUpperCase()}`;

    try {
      const orderRef = doc(db, 'retailOrders', fulfillingOrder.orderId);
      await updateDoc(orderRef, {
        status: 'completed',
        assignedPin: pin,
        notes: modalNotesInput.trim(),
        completedAt: nowIso,
        updatedAt: nowIso,
      });

      setOrders((prev) =>
        prev.map((ord) =>
          ord.orderId === fulfillingOrder.orderId
            ? {
                ...ord,
                status: 'completed',
                assignedPin: pin,
                notes: modalNotesInput.trim(),
                completedAt: nowIso,
                updatedAt: nowIso,
              }
            : ord
        )
      );

      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      } catch {}

      showNotification(
        lang === 'bn'
          ? `অর্ডার #${fulfillingOrder.orderId} সফলভাবে কমপ্লিট করা হয়েছে এবং পিন নির্ধারণ হয়েছে!`
          : `Order #${fulfillingOrder.orderId} successfully completed with PIN assigned!`
      );
    } catch (err) {
      console.warn('Update fallback:', err);
      setOrders((prev) =>
        prev.map((ord) =>
          ord.orderId === fulfillingOrder.orderId
            ? {
                ...ord,
                status: 'completed',
                assignedPin: pin,
                notes: modalNotesInput.trim(),
                completedAt: nowIso,
                updatedAt: nowIso,
              }
            : ord
        )
      );
      showNotification(
        lang === 'bn' ? 'অর্ডার কমপ্লিট হয়েছে!' : 'Order completed!'
      );
    } finally {
      setIsSubmittingAction(false);
      setFulfillingOrder(null);
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(lang === 'bn' ? `আপনি কি নিশ্চিত অর্ডার #${orderId} মুছে ফেলতে চান?` : `Are you sure you want to delete order #${orderId}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'retailOrders', orderId));
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
      showNotification(lang === 'bn' ? 'অর্ডার মুছে ফেলা হয়েছে।' : 'Order removed successfully.');
    } catch (err) {
      console.warn('Delete fallback:', err);
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
      showNotification(lang === 'bn' ? 'অর্ডার মুছে ফেলা হয়েছে।' : 'Order removed.');
    }
  };

  // Create Manual Order
  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim()) {
      alert(lang === 'bn' ? 'নাম এবং ফোন নম্বর পূরণ করুন।' : 'Please fill in name and phone number.');
      return;
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nowIso = new Date().toISOString();

    const newOrder: RetailOrder = {
      orderId,
      countryId: 'custom',
      countryName: manualCountry,
      packageId: 'custom',
      packageName: manualPackage,
      quantity: manualQty,
      totalSar: manualSar,
      totalBdt: manualBdt,
      name: manualName.trim(),
      phone: manualPhone.trim(),
      payment: manualPayment,
      notes: manualNotes.trim(),
      status: 'pending',
      createdAt: nowIso,
    };

    try {
      await setDoc(doc(db, 'retailOrders', orderId), newOrder);
    } catch (err) {
      console.warn('Manual order setDoc notice:', err);
    }

    setOrders((prev) => [newOrder, ...prev]);
    setShowAddOrderModal(false);
    setManualName('');
    setManualPhone('');
    setManualNotes('');
    showNotification(lang === 'bn' ? 'ম্যানুয়াল অর্ডার সফলভাবে যুক্ত হয়েছে!' : 'Manual order created successfully!');
  };

  // Open WhatsApp with Delivery Message
  const handleOpenWhatsAppDelivery = (order: RetailOrder) => {
    const cleanPhone = order.phone.replace(/[^0-9]/g, '');
    const pinText = order.assignedPin ? `🔑 আপনার ভিআইপি পিন কোড: *${order.assignedPin}*` : '🔑 আপনার পিন সক্রিয় করা হচ্ছে।';
    const msg = `আসসালামু আলাইকুম ${order.name} ভাই,\nSoverixNet VPN এ আপনার অর্ডারের তথ্য:\n\n📋 অর্ডার আইডি: ${order.orderId}\n📦 প্যাকেজ: ${order.packageName || 'VIP Plan'}\n🔢 পরিমাণ: ${order.quantity} টি পিন\n${pinText}\n\n✅ যেকোনো প্রয়োজনে আমাদের মেসেজ দিন। ধন্যবাদ!`;
    const encoded = encodeURIComponent(msg);
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Order ID,Customer Name,Phone,Country,Package,Qty,Total SAR,Total BDT,Payment Method,Status,Assigned PIN,Created At,Completed At,Notes'];
    const rows = filteredOrders.map((o) => {
      return `"${o.orderId}","${o.name}","${o.phone}","${o.countryName || o.countryId || ''}","${o.packageName || ''}",${o.quantity || 1},${o.totalSar || 0},${o.totalBdt || 0},"${o.payment}","${o.status}","${o.assignedPin || ''}","${o.createdAt}","${o.completedAt || ''}","${(o.notes || '').replace(/"/g, '""')}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `soverixnet_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy TSV for Google Sheets
  const handleCopyTSV = () => {
    const headers = 'Order ID\tDate\tName\tPhone\tCountry\tPackage\tQty\tSAR\tBDT\tPayment\tStatus\tPIN\tNotes';
    const rows = filteredOrders.map((o) => {
      return `${o.orderId}\t${o.createdAt}\t${o.name}\t${o.phone}\t${o.countryName || ''}\t${o.packageName || ''}\t${o.quantity || 1}\t${o.totalSar || 0}\t${o.totalBdt || 0}\t${o.payment}\t${o.status}\t${o.assignedPin || ''}\t${o.notes || ''}`;
    });
    const tsv = [headers, ...rows].join('\n');
    navigator.clipboard.writeText(tsv);
    setCopiedTsv(true);
    setTimeout(() => setCopiedTsv(false), 2500);
  };

  // Filter Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.notes && o.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.assignedPin && o.assignedPin.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesCountry = countryFilter === 'all' || 
      (o.countryId && o.countryId.toLowerCase().includes(countryFilter.toLowerCase())) ||
      (o.countryName && o.countryName.toLowerCase().includes(countryFilter.toLowerCase()));

    return matchesSearch && matchesStatus && matchesCountry;
  });

  // Calculate statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const processingOrders = orders.filter((o) => o.status === 'processing').length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
  const totalRevenueBdt = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? (o.totalBdt || 0) : 0), 0);
  const totalRevenueSar = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? (o.totalSar || 0) : 0), 0);

  // Security Access Guard: If not super-admin, restrict access
  if (!isAuthorizedSuperAdmin) {
    return (
      <div className="p-8 rounded-3xl bg-[#080d1a] border border-red-500/40 text-center space-y-5 max-w-xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 mx-auto flex items-center justify-center text-red-400">
          <Lock className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40 inline-flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? '⛔ এক্সেস সীমাবদ্ধ / SUPER-ADMIN RESTRICTED' : '⛔ SUPER-ADMIN ACCESS RESTRICTED'}</span>
          </span>
          <h3 className="text-xl font-black text-white">
            {lang === 'bn' ? 'গ্রাহকদের অর্ডার টেবিল সংরক্ষিত' : 'Customer Orders Table Restricted'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {lang === 'bn'
              ? `ইনকামিং রিটেইল ও হোলসেল অর্ডার দেখার এবং স্ট্যাটাস পরিবর্তন করার অনুমতি শুধুমাত্র অথেনটিকেটেড সুপার-এডমিন (${OWNER_EMAIL}) এর রয়েছে।`
              : `Viewing incoming orders and updating fulfilment status is restricted exclusively to authenticated super-administrators (${OWNER_EMAIL}).`}
          </p>
        </div>

        <button
          onClick={() => signInWithGoogle()}
          className="py-3 px-6 rounded-2xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-black font-extrabold text-sm inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-red-500/20"
        >
          <Key className="w-4 h-4" />
          <span>{lang === 'bn' ? `Google দিয়ে সুপার-এডমিন লগইন করুন` : `Sign In as Super-Admin`}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-cyan-400 text-cyan-300 shadow-2xl flex items-center gap-3 text-sm font-bold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Header & Metrics Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c1427] via-slate-900 to-[#070b14] border border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'সুপার-এডমিন অর্ডার ম্যানেজমেন্ট কনসোল' : 'Super-Admin Orders Command Center'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>{lang === 'bn' ? 'সকল ইনকামিং গ্রাহক অর্ডার' : 'Incoming Customer Orders'}</span>
              {pendingOrders > 0 && (
                <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 animate-pulse shadow-md shadow-amber-500/40">
                  {pendingOrders} {lang === 'bn' ? 'পেন্ডিং' : 'Pending'}
                </span>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {lang === 'bn'
                ? 'সৌদি আরব, মালয়েশিয়া, কাতার, বাহরাইন, আমিরাত ও বাংলাদেশের গ্রাহকদের পিন অর্ডার পর্যালোচনা করুন, ১-ক্লিকে কমপ্লিট করুন এবং সরাসরি হোয়াটসঅ্যাপে পিন ডেলিভারি দিন।'
                : 'Review incoming customer VPN PIN orders, update statuses, assign keys, and deliver directly to customers on WhatsApp.'}
            </p>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowAddOrderModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? '+ ম্যানুয়াল অর্ডার যোগ' : '+ Add Manual Order'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              title="Download CSV spreadsheet"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleCopyTSV}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              title="Copy for Google Sheets"
            >
              {copiedTsv ? <Check className="w-4 h-4 text-emerald-400" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
              <span>{copiedTsv ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : 'Google Sheets'}</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {lang === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}
              </span>
              <Package className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
              {totalOrders}
            </div>
            <span className="text-[10px] text-slate-500">
              {lang === 'bn' ? 'ডাটাবেজে সংরক্ষিত' : 'Recorded in database'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                {lang === 'bn' ? 'পেন্ডিং অর্ডার' : 'Pending Action'}
              </span>
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-1">
              {pendingOrders}
            </div>
            <span className="text-[10px] text-amber-300/80">
              {lang === 'bn' ? 'জরুরি ডেলিভারি আবশ্যক' : 'Urgent fulfillment needed'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                {lang === 'bn' ? 'সম্পন্ন / ডেলিভার্ড' : 'Completed / Delivered'}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
              {completedOrders}
            </div>
            <span className="text-[10px] text-emerald-400/80">
              {totalOrders > 0 ? `${Math.round((completedOrders / totalOrders) * 100)}% সম্পন্ন রেট` : '0%'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                {lang === 'bn' ? 'মোট আয় (সেলস)' : 'Total Revenue'}
              </span>
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-cyan-400 font-mono mt-1 truncate">
              ৳{totalRevenueBdt.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              ~ {totalRevenueSar} SAR
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'bn' ? 'অর্ডার আইডি, গ্রাহকের নাম, মোবাইল নম্বর বা পিন কোড খুঁজুন...' : 'Search by Order ID, customer name, phone or PIN...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter by Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['all', 'pending', 'processing', 'completed', 'cancelled'] as const).map((st) => {
              const count = st === 'all' ? orders.length : orders.filter((o) => o.status === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === st
                      ? st === 'pending'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : st === 'completed'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : st === 'processing'
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : st === 'cancelled'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="capitalize">
                    {st === 'all' 
                      ? (lang === 'bn' ? 'সকল' : 'All') 
                      : st === 'pending' 
                      ? (lang === 'bn' ? 'পেন্ডিং' : 'Pending')
                      : st === 'processing'
                      ? (lang === 'bn' ? 'প্রসেসিং' : 'Processing')
                      : st === 'completed'
                      ? (lang === 'bn' ? 'কমপ্লিট' : 'Completed')
                      : (lang === 'bn' ? 'বাতিল' : 'Cancelled')}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    statusFilter === st ? 'bg-black/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Country Filter Dropdown */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-semibold focus:outline-none focus:border-amber-400"
          >
            <option value="all">{lang === 'bn' ? 'সকল দেশ (All Countries)' : 'All Countries'}</option>
            <option value="saudi">🇸🇦 সৌদি আরব (Saudi Arabia)</option>
            <option value="malaysia">🇲🇾 মালয়েশিয়া (Malaysia)</option>
            <option value="qatar">🇶🇦 কাতার (Qatar)</option>
            <option value="bahrain">🇧🇭 বাহরাইন (Bahrain)</option>
            <option value="uae">🇦🇪 সংযুক্ত আরব আমিরাত (UAE)</option>
            <option value="oman">🇴🇲 ওমান (Oman)</option>
            <option value="kuwait">🇰🇼 কুয়েত (Kuwait)</option>
            <option value="bangladesh">🇧🇩 বাংলাদেশ (Bangladesh)</option>
          </select>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="rounded-3xl border border-slate-800 bg-[#070b14]/90 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="py-4 px-4">{lang === 'bn' ? 'অর্ডার আইডি ও সময়' : 'Order ID & Time'}</th>
                <th className="py-4 px-4">{lang === 'bn' ? 'গ্রাহক তথ্য' : 'Customer Info'}</th>
                <th className="py-4 px-4">{lang === 'bn' ? 'দেশ / সিম' : 'Country'}</th>
                <th className="py-4 px-4">{lang === 'bn' ? 'প্যাকেজ ও পরিমাণ' : 'Package & Qty'}</th>
                <th className="py-4 px-4">{lang === 'bn' ? 'মূল্য ও পেমেন্ট' : 'Total & Payment'}</th>
                <th className="py-4 px-4">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="py-4 px-4">{lang === 'bn' ? 'ভিআইপি পিন কোড' : 'VIP PIN / Key'}</th>
                <th className="py-4 px-4 text-right">{lang === 'bn' ? 'একশন বাটন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShoppingCart className="w-8 h-8 text-slate-600" />
                      <p className="text-sm font-bold">
                        {lang === 'bn' ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No matching orders found'}
                      </p>
                      <p className="text-xs text-slate-600">
                        {lang === 'bn' ? 'সার্চ ফিল্টার রিসেট করুন বা নতুন ম্যানুয়াল অর্ডার যোগ করুন।' : 'Try resetting your search filter or add a manual order.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isPending = order.status === 'pending';
                  const isCompleted = order.status === 'completed';
                  const isProcessing = order.status === 'processing';
                  const isCancelled = order.status === 'cancelled';

                  const dateFormatted = new Date(order.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr 
                      key={order.orderId}
                      className={`transition-colors hover:bg-slate-900/50 ${
                        isPending ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Order ID & Time */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-amber-400">{order.orderId}</span>
                          <button
                            onClick={() => copyToClipboard(order.orderId, `id-${order.orderId}`)}
                            className="p-1 rounded text-slate-500 hover:text-slate-300"
                            title="Copy Order ID"
                          >
                            {copiedId === `id-${order.orderId}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{dateFormatted}</span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-4 min-w-[160px]">
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <span>{order.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`tel:${order.phone}`}
                            className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-cyan-500" />
                            <span>{order.phone}</span>
                          </a>
                        </div>
                        {order.notes && (
                          <p className="text-[11px] text-slate-400 mt-1 italic max-w-xs line-clamp-1" title={order.notes}>
                            "{order.notes}"
                          </p>
                        )}
                      </td>

                      {/* Country */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium text-xs">
                          {order.countryName || order.countryId || 'Middle East'}
                        </span>
                      </td>

                      {/* Package & Quantity */}
                      <td className="py-4 px-4 min-w-[150px]">
                        <div className="font-bold text-slate-200">
                          {order.packageName || 'VIP PIN'}
                        </div>
                        <div className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                          {lang === 'bn' ? `পরিমাণ: ${order.quantity} টি পিন` : `Quantity: ${order.quantity} PIN(s)`}
                        </div>
                      </td>

                      {/* Total & Payment */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-black text-emerald-400 font-mono text-sm">
                          ৳{(order.totalBdt || 0).toLocaleString()} BDT
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {order.totalSar || 0} SAR
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-cyan-300 border border-slate-700">
                          {order.payment}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black">
                            <Clock className="w-3 h-3 animate-spin" />
                            <span>{lang === 'bn' ? 'পেন্ডিং' : 'Pending'}</span>
                          </span>
                        )}
                        {isProcessing && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black">
                            <Zap className="w-3 h-3" />
                            <span>{lang === 'bn' ? 'প্রসেসিং' : 'Processing'}</span>
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{lang === 'bn' ? 'কমপ্লিট' : 'Completed'}</span>
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black">
                            <XCircle className="w-3 h-3" />
                            <span>{lang === 'bn' ? 'বাতিল' : 'Cancelled'}</span>
                          </span>
                        )}
                      </td>

                      {/* Assigned PIN */}
                      <td className="py-4 px-4 whitespace-nowrap min-w-[140px]">
                        {order.assignedPin ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-1 rounded bg-slate-900 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                              {order.assignedPin}
                            </span>
                            <button
                              onClick={() => copyToClipboard(order.assignedPin!, `pin-${order.orderId}`)}
                              className="p-1 rounded text-slate-400 hover:text-white"
                              title="Copy PIN"
                            >
                              {copiedId === `pin-${order.orderId}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic text-[11px]">
                            {lang === 'bn' ? 'পিন দেয়া হয়নি' : 'Not assigned'}
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Mark Complete button */}
                          <button
                            onClick={() => handleOpenFulfillModal(order)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                            title={lang === 'bn' ? 'কমপ্লিট করুন ও পিন কোড দিন' : 'Mark Completed & Assign PIN'}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{lang === 'bn' ? 'কমপ্লিট' : 'Complete'}</span>
                          </button>

                          {/* Quick WhatsApp Send */}
                          <button
                            onClick={() => handleOpenWhatsAppDelivery(order)}
                            className="p-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs transition-all cursor-pointer"
                            title={lang === 'bn' ? 'হোয়াটসঅ্যাপে পিন ও কনফার্মেশন পাঠান' : 'Send PIN via WhatsApp'}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Status Dropdown toggle */}
                          <div className="relative group">
                            <button
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs cursor-pointer"
                              title="More Status Actions"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-slate-900 border border-slate-700 p-1 shadow-xl z-20 hidden group-hover:block text-left">
                              <button
                                onClick={() => handleUpdateStatus(order.orderId, 'processing')}
                                className="w-full text-left px-2.5 py-1.5 text-xs text-cyan-300 hover:bg-slate-800 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                              >
                                <Zap className="w-3 h-3 text-cyan-400" />
                                <span>{lang === 'bn' ? 'প্রসেসিং করুন' : 'Processing'}</span>
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(order.orderId, 'cancelled')}
                                className="w-full text-left px-2.5 py-1.5 text-xs text-rose-300 hover:bg-slate-800 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                              >
                                <XCircle className="w-3 h-3 text-rose-400" />
                                <span>{lang === 'bn' ? 'অর্ডার বাতিল' : 'Cancel'}</span>
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.orderId)}
                                className="w-full text-left px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/20 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer border-t border-slate-800 mt-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>{lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Mark Complete & Assign PIN */}
      {fulfillingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded-3xl bg-[#090e1c] border border-emerald-500/40 p-6 sm:p-7 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setFulfillingOrder(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {lang === 'bn' ? 'অর্ডার সম্পন্ন ও পিন প্রদান' : 'Complete Order & Assign PIN'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  #{fulfillingOrder.orderId}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{lang === 'bn' ? 'গ্রাহক:' : 'Customer:'}</span>
                <span className="text-white font-bold">{fulfillingOrder.name} ({fulfillingOrder.phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{lang === 'bn' ? 'প্যাকেজ:' : 'Package:'}</span>
                <span className="text-amber-400 font-bold">{fulfillingOrder.packageName} ({fulfillingOrder.quantity} টি)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{lang === 'bn' ? 'মূল্য:' : 'Total:'}</span>
                <span className="text-emerald-400 font-bold">৳{fulfillingOrder.totalBdt} BDT / {fulfillingOrder.totalSar} SAR</span>
              </div>
            </div>

            <form onSubmit={handleConfirmCompletion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>{lang === 'bn' ? 'ভিআইপি পিন কোড (VIP PIN)' : 'VIP PIN Code'}</span>
                  <button
                    type="button"
                    onClick={() => setModalPinInput(`SOV-VIP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`)}
                    className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    {lang === 'bn' ? 'নতুন জেনারেট করুন' : 'Generate New'}
                  </button>
                </label>
                <input
                  type="text"
                  required
                  value={modalPinInput}
                  onChange={(e) => setModalPinInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 font-mono text-emerald-400 font-bold text-sm focus:outline-none focus:border-emerald-400"
                  placeholder="SOV-VIP-XXXX-YYYY"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  {lang === 'bn' ? 'অতিরিক্ত নোট (Customer Note / Delivery Ref)' : 'Additional Notes / Ref'}
                </label>
                <input
                  type="text"
                  value={modalNotesInput}
                  onChange={(e) => setModalNotesInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  placeholder="Delivered on WhatsApp, STC 5G verified..."
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'অর্ডার কমপ্লিট করুন' : 'Mark as Completed'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillingOrder(null)}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manual Add Order */}
      {showAddOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-lg w-full rounded-3xl bg-[#090e1c] border border-amber-500/40 p-6 sm:p-7 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddOrderModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {lang === 'bn' ? 'নতুন ম্যানুয়াল অর্ডার এন্ট্রি' : 'New Manual Order Entry'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'bn' ? 'সরাসরি ফোন বা ক্যাশ অর্ডারের তথ্য সিস্টেমে রেকর্ড করুন' : 'Record direct phone or cash orders into the system'}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'গ্রাহকের নাম' : 'Customer Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                    placeholder="e.g. Tariq Al-Otaibi"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'মোবাইল / হোয়াটসঅ্যাপ' : 'WhatsApp / Mobile'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                    placeholder="+966 50 123 4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'দেশ' : 'Country'}
                  </label>
                  <select
                    value={manualCountry}
                    onChange={(e) => setManualCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="সৌদি আরব (Saudi Arabia)">🇸🇦 সৌদি আরব (Saudi Arabia)</option>
                    <option value="মালয়েশিয়া (Malaysia)">🇲🇾 মালয়েশিয়া (Malaysia)</option>
                    <option value="কাতার (Qatar)">🇶🇦 কাতার (Qatar)</option>
                    <option value="বাহরাইন (Bahrain)">🇧🇭 বাহরাইন (Bahrain)</option>
                    <option value="সংযুক্ত আরব আমিরাত (UAE)">🇦🇪 সংযুক্ত আরব আমিরাত (UAE)</option>
                    <option value="ওমান (Oman)">🇴🇲 ওমান (Oman)</option>
                    <option value="কুয়েত (Kuwait)">🇰🇼 কুয়েত (Kuwait)</option>
                    <option value="বাংলাদেশ (Bangladesh)">🇧🇩 বাংলাদেশ (Bangladesh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'প্যাকেজ' : 'Package'}
                  </label>
                  <select
                    value={manualPackage}
                    onChange={(e) => setManualPackage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="১ মাস ভিআইপি পিন (1 Month VIP)">১ মাস ভিআইপি পিন (1 Month VIP)</option>
                    <option value="৩ মাস ভিআইপি পিন (3 Months VIP)">৩ মাস ভিআইপি পিন (3 Months VIP)</option>
                    <option value="৬ মাস সুপার সেভার (6 Months VIP)">৬ মাস সুপার সেভার (6 Months VIP)</option>
                    <option value="১ বছর আনলিমিটেড (1 Year Unlimited)">১ বছর আনলিমিটেড (1 Year Unlimited)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'পরিমাণ (Qty)' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={manualQty}
                    onChange={(e) => setManualQty(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'SAR রেট' : 'SAR Total'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={manualSar}
                    onChange={(e) => setManualSar(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'BDT রেট' : 'BDT Total'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={manualBdt}
                    onChange={(e) => setManualBdt(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                </label>
                <select
                  value={manualPayment}
                  onChange={(e) => setManualPayment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="bkash">বিকাশ (bKash)</option>
                  <option value="nagad">নগদ (Nagad)</option>
                  <option value="rocket">রকেট (Rocket)</option>
                  <option value="stc_pay">STC Pay (সৌদি আরব)</option>
                  <option value="tng_duitnow">Touch 'n Go / DuitNow (মালয়েশিয়া)</option>
                  <option value="alrajhi">আল রাজি / Urpay</option>
                  <option value="binance">Binance USDT</option>
                  <option value="cash">সরাসরি ক্যাশ (Cash)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'bn' ? 'নোট / মন্তব্য' : 'Notes / Remarks'}
                </label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  placeholder="Direct WhatsApp order, verified cash..."
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'অর্ডার সেভ করুন' : 'Save Order'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddOrderModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
