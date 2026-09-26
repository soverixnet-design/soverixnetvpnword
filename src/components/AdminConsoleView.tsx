import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  RefreshCw, 
  Activity, 
  Crown, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Smartphone, 
  Mail, 
  Key, 
  Clock, 
  Sliders, 
  Briefcase, 
  Plus, 
  Wallet, 
  Lock, 
  UserCheck, 
  UserX, 
  Sparkles,
  HelpCircle,
  X,
  Server,
  Trash2,
  Edit3,
  Radio,
  Zap,
  Globe2,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  CheckCircle2,
  MessageSquare,
  Settings,
  Link2,
  Phone,
  Send,
  Megaphone,
  Star,
  LogOut,
  LogIn,
  Palette,
  Eye,
  Image as ImageIcon,
  FolderOpen,
  FileText,
  LayoutGrid,
  Film
} from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth, UserProfileData, UserRole, OWNER_EMAIL } from '../firebase/AuthContext';
import { ServerManager } from '../services/serverManager';
import { VPNServer, ServerRegion, VPNProtocol, ServerCapability } from '../types';
import { getSiteSettings, saveSiteSettings, SiteSettingsData, CONTACT_CONFIG } from '../data/contact';
import { BannersManager } from './admin/BannersManager';
import { DesignThemeManager } from './admin/DesignThemeManager';
import { SectionsManager } from './admin/SectionsManager';
import { MediaGalleryManager } from './admin/MediaGalleryManager';
import { AppsManager } from './admin/AppsManager';
import { AllTextsManager } from './admin/AllTextsManager';
import { BenefitsManager } from './admin/BenefitsManager';
import { VipPlansManager } from './admin/VipPlansManager';
import { FaqManager } from './admin/FaqManager';
import { VideoManager } from './admin/VideoManager';

interface AdminConsoleViewProps {
  lang: 'en' | 'bn';
}

const GOOGLE_SHEET_WEBHOOK_KEY = 'soverix_gsheet_webhook_url';

const ALL_PROTOCOLS: { id: VPNProtocol; name: string }[] = [
  { id: 'wireguard', name: 'WireGuard (UDP Turbo)' },
  { id: 'v2ray', name: 'V2Ray / VLESS (WebSocket)' },
  { id: 'hysteria2', name: 'Hysteria 2 (UDP BBR)' },
  { id: 'trojan', name: 'Trojan-Go (TLS 443)' },
  { id: 'shadowsocks', name: 'Shadowsocks (AEAD 2022)' },
  { id: 'openvpn_udp', name: 'OpenVPN UDP' },
  { id: 'openvpn_tcp', name: 'OpenVPN TCP 443' },
];

const ALL_CAPABILITIES: { id: ServerCapability; name: string }[] = [
  { id: 'free_net', name: 'Free Net SIM Bypass' },
  { id: 'streaming', name: '4K OTT Streaming' },
  { id: 'gaming', name: 'Ultra-Low Ping Gaming' },
  { id: 'p2p', name: 'P2P / Torrenting' },
  { id: 'obfuscated', name: 'Obfuscation Shield' },
  { id: 'double_vpn', name: 'Double Hop Tunnel' },
  { id: 'onion', name: 'Tor / Onion Routing' },
];

const ALL_REGIONS: { id: ServerRegion; name: string; nameBn: string }[] = [
  { id: 'middle_east', name: 'Middle East', nameBn: 'মধ্যপ্রাচ্য' },
  { id: 'asia', name: 'Asia', nameBn: 'এশিয়া' },
  { id: 'europe', name: 'Europe', nameBn: 'ইউরোপ' },
  { id: 'north_america', name: 'North America', nameBn: 'উত্তর আমেরিকা' },
  { id: 'oceania', name: 'Oceania', nameBn: 'ওশেনিয়া' },
];

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({ lang }) => {
  const { 
    user, 
    userProfile, 
    isSuperAdmin, 
    isAdmin, 
    isReseller, 
    canAccessAdminPanel,
    updateUserRoleAndCredits,
    signInWithGoogle,
    signInDemoVip,
    signOutUser
  } = useAuth();

  // Strict Security Check: ONLY soverixnet@gmail.com is granted access
  const isOwner = Boolean(
    (user?.email && user.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) ||
    (userProfile?.email && userProfile.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) ||
    isSuperAdmin
  );

  const [activeAdminTab, setActiveAdminTab] = useState<'videos' | 'gallery' | 'banners' | 'apps' | 'texts' | 'benefits' | 'plans' | 'faqs' | 'design' | 'sections' | 'servers' | 'users' | 'reviews' | 'site_settings' | 'app_links' | 'sheets'>('videos');
  const [usersList, setUsersList] = useState<UserProfileData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'reseller' | 'admin'>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [copiedData, setCopiedData] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    return localStorage.getItem(GOOGLE_SHEET_WEBHOOK_KEY) || '';
  });
  const [savedWebhook, setSavedWebhook] = useState(false);
  const [showWebhookSetupGuide, setShowWebhookSetupGuide] = useState(false);

  // Reviews Moderation State
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewFilterRating, setReviewFilterRating] = useState<'all' | '5' | '4' | '3'>('all');
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  // Site Settings & WhatsApp State
  const [siteSettingsForm, setSiteSettingsForm] = useState<SiteSettingsData>(getSiteSettings());
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);
  const [savedAppsNotice, setSavedAppsNotice] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Server Management State
  const [serverList, setServerList] = useState<VPNServer[]>(() => ServerManager.getAllServers());
  const [serverSearch, setServerSearch] = useState('');
  const [serverRegionFilter, setServerRegionFilter] = useState<string>('all');
  const [serverTypeFilter, setServerTypeFilter] = useState<'all' | 'vip' | 'freenet' | 'custom'>('all');

  // Modal State for Add & Edit
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingServerId, setEditingServerId] = useState<string | null>(null);

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formCountry, setFormCountry] = useState('Saudi Arabia');
  const [formCountryBn, setFormCountryBn] = useState('সৌদি আরব');
  const [formCity, setFormCity] = useState('Riyadh');
  const [formCityBn, setFormCityBn] = useState('রিয়াদ');
  const [formFlag, setFormFlag] = useState('🇸🇦');
  const [formIp, setFormIp] = useState('');
  const [formPing, setFormPing] = useState(38);
  const [formLoad, setFormLoad] = useState(15);
  const [formSpeed, setFormSpeed] = useState('10 Gbps');
  const [formRegion, setFormRegion] = useState<ServerRegion>('middle_east');
  const [formIsVip, setFormIsVip] = useState(true);
  const [formIsRecommended, setFormIsRecommended] = useState(true);
  const [formIsFreeNet, setFormIsFreeNet] = useState(true);
  const [formSimOp, setFormSimOp] = useState('STC / Mobily / Zain 5G');
  const [formSimOpBn, setFormSimOpBn] = useState('এসটিসি / মোবাইলি / জাইন ৫জি');
  const [formSni, setFormSni] = useState('sawa.stc.com.sa');
  const [formPayload, setFormPayload] = useState('GET / HTTP/1.1[crlf]Host: sawa.stc.com.sa[crlf]Connection: Upgrade[crlf]Upgrade: websocket[crlf][crlf]');
  const [formProtocols, setFormProtocols] = useState<VPNProtocol[]>(['wireguard', 'v2ray', 'hysteria2', 'trojan']);
  const [formCapabilities, setFormCapabilities] = useState<ServerCapability[]>(['free_net', 'streaming', 'gaming', 'p2p', 'obfuscated']);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Reseller Create Customer State
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerPlan, setCustomerPlan] = useState('Cyber Pro 1-Year');
  const [createdCustomerKey, setCreatedCustomerKey] = useState<string | null>(null);

  // Super Admin Edit Role Modal State
  const [editingUser, setEditingUser] = useState<UserProfileData | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [allocatedCredits, setAllocatedCredits] = useState<number>(0);

  // Subscribe to live ServerManager updates
  useEffect(() => {
    const unsub = ServerManager.subscribe((all) => {
      setServerList(all);
    });
    return () => unsub();
  }, []);

  // Listen to all users from Firestore (or fallback mock data)
  useEffect(() => {
    if (!canAccessAdminPanel) return;

    let unsubscribe = () => {};
    try {
      unsubscribe = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          const loadedUsers: UserProfileData[] = [];
          snapshot.forEach((docSnap) => {
            loadedUsers.push(docSnap.data() as UserProfileData);
          });
          if (loadedUsers.length > 0) {
            setUsersList(loadedUsers);
          } else {
            setUsersList(getFallbackUsers());
          }
        },
        (err) => {
          console.warn('AdminConsole: Live listener error, using local session view:', err);
          setUsersList(getFallbackUsers());
        }
      );
    } catch {
      setUsersList(getFallbackUsers());
    }

    return () => unsubscribe();
  }, [canAccessAdminPanel]);

  // Listen to live reviews collection from Firestore
  useEffect(() => {
    if (!isOwner) return;
    let unsub = () => {};
    try {
      unsub = onSnapshot(
        collection(db, 'reviews'),
        (snapshot) => {
          const loaded: any[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push({ id: docSnap.id, ...docSnap.data() });
          });
          loaded.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          setReviewsList(loaded);
        },
        (err) => {
          console.warn('Reviews live listener warning:', err);
        }
      );
    } catch {}
    return () => unsub();
  }, [isOwner]);

  // Review management handlers
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত এই কমেন্ট/রিভিউটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this review?')) return;
    setDeletingReviewId(reviewId);
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      setReviewsList((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      console.error('Delete review error:', err);
      alert(lang === 'bn' ? 'রিভিউ মুছে ফেলতে সমস্যা হয়েছে।' : 'Failed to delete review.');
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleToggleVerifiedBuyer = async (reviewId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), { verifiedBuyer: !currentStatus });
      setReviewsList((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, verifiedBuyer: !currentStatus } : r))
      );
    } catch (err) {
      console.error('Toggle verified review error:', err);
    }
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    const updated = saveSiteSettings(siteSettingsForm);
    try {
      await setDoc(doc(db, 'settings', 'general'), updated, { merge: true });
    } catch (err) {
      console.warn('Firestore settings update error:', err);
    }
    setIsSavingSettings(false);
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 3500);
  };

  const handleSaveAppLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    const updated = saveSiteSettings(siteSettingsForm);
    try {
      await setDoc(doc(db, 'settings', 'general'), updated, { merge: true });
    } catch (err) {
      console.warn('Firestore app links update error:', err);
    }
    setIsSavingSettings(false);
    setSavedAppsNotice(true);
    setTimeout(() => setSavedAppsNotice(false), 3500);
  };

  const getFallbackUsers = (): UserProfileData[] => {
    return [
      {
        userId: 'admin-master-01',
        email: 'soverixnet@gmail.com',
        displayName: 'Soverix Master Owner',
        phoneNumber: '+8801700-000000',
        photoURL: '',
        role: 'super_admin',
        resellerCredits: 100000,
        resellerVouchersGenerated: 24,
        plan: 'Sovereign VIP Lifetime',
        vipMasterKey: 'SOVERIX-VIP-8B392835-972B-47CC-B1C1',
        status: 'active',
        lastLoginAt: new Date().toLocaleString(),
        createdAt: '2026-08-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        userId: 'reseller-dhaka-01',
        email: 'reseller.dhaka@soverixnet.com',
        displayName: 'Dhaka Cyber Reseller Point',
        phoneNumber: '+8801811-223344',
        photoURL: '',
        role: 'reseller',
        resellerCredits: 25000,
        resellerVouchersGenerated: 18,
        plan: 'Quantum Elite Pass',
        vipMasterKey: 'SOVERIX-RESELLER-DHK-9921-A',
        status: 'active',
        lastLoginAt: '15 minutes ago',
        createdAt: '2026-08-10T12:00:00Z',
        updatedAt: '2026-08-19T00:00:00Z',
      },
      {
        userId: 'vip-riyadh-02',
        email: 'saudi.member@gmail.com',
        displayName: 'Tariq Al-Harbi (STC VIP)',
        phoneNumber: '+966501234567',
        photoURL: '',
        role: 'user',
        resellerCredits: 0,
        resellerVouchersGenerated: 0,
        plan: 'Sovereign VIP Lifetime',
        vipMasterKey: 'SOVERIX-VIP-SAUDI-STC-47CC',
        status: 'active',
        lastLoginAt: '2 hours ago',
        createdAt: '2026-08-15T09:00:00Z',
        updatedAt: '2026-08-19T00:00:00Z',
      },
    ];
  };

  // Open Add Server Modal
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingServerId(null);
    setFormName('');
    setFormCountry('Saudi Arabia');
    setFormCountryBn('সৌদি আরব');
    setFormCity('Riyadh');
    setFormCityBn('রিয়াদ');
    setFormFlag('🇸🇦');
    setFormIp('');
    setFormPing(38);
    setFormLoad(15);
    setFormSpeed('10 Gbps');
    setFormRegion('middle_east');
    setFormIsVip(true);
    setFormIsRecommended(true);
    setFormIsFreeNet(true);
    setFormSimOp('STC / Mobily / Zain 5G');
    setFormSimOpBn('এসটিসি / মোবাইলি / জাইন ৫জি');
    setFormSni('sawa.stc.com.sa');
    setFormPayload('GET / HTTP/1.1[crlf]Host: sawa.stc.com.sa[crlf]Connection: Upgrade[crlf]Upgrade: websocket[crlf][crlf]');
    setFormProtocols(['wireguard', 'v2ray', 'hysteria2', 'trojan']);
    setFormCapabilities(['free_net', 'streaming', 'gaming', 'p2p', 'obfuscated']);
    setActionSuccessNotice(null);
  };

  // Open Edit Server Modal
  const handleOpenEditModal = (server: VPNServer) => {
    setModalMode('edit');
    setEditingServerId(server.id);
    setFormName(server.name);
    setFormCountry(server.country);
    setFormCountryBn(server.countryBn || server.country);
    setFormCity(server.city);
    setFormCityBn(server.cityBn || server.city);
    setFormFlag(server.flag);
    setFormIp(server.ip);
    setFormPing(server.ping);
    setFormLoad(server.load);
    setFormSpeed(server.speed || '10 Gbps');
    setFormRegion(server.region || 'middle_east');
    setFormIsVip(Boolean(server.isVip));
    setFormIsRecommended(Boolean(server.isRecommended));
    setFormIsFreeNet(Boolean(server.isFreeNet));
    setFormSimOp(server.simOperator || '');
    setFormSimOpBn(server.simOperatorBn || server.simOperator || '');
    setFormSni(server.freeNetSni || '');
    setFormPayload(server.payloadTemplate || '');
    setFormProtocols(server.protocols || ['wireguard', 'v2ray']);
    setFormCapabilities(server.capabilities || ['streaming', 'gaming']);
    setActionSuccessNotice(null);
  };

  // Toggle protocol checkbox
  const handleToggleProtocol = (proto: VPNProtocol) => {
    setFormProtocols((prev) => 
      prev.includes(proto) ? prev.filter((p) => p !== proto) : [...prev, proto]
    );
  };

  // Toggle capability checkbox
  const handleToggleCapability = (cap: ServerCapability) => {
    setFormCapabilities((prev) => 
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  // Save (Add or Update) Server Node
  const handleSaveServerForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formIp.trim()) return;

    const id = modalMode === 'edit' && editingServerId 
      ? editingServerId 
      : `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const serverObj: VPNServer = {
      id,
      name: formName.trim(),
      country: formCountry.trim(),
      countryBn: formCountryBn.trim() || formCountry.trim(),
      countryCode: formFlag,
      city: formCity.trim(),
      cityBn: formCityBn.trim() || formCity.trim(),
      flag: formFlag.trim() || '🌐',
      ip: formIp.trim(),
      ping: Number(formPing) || 45,
      load: Number(formLoad) || 20,
      speed: formSpeed.trim() || '10 Gbps',
      region: formRegion,
      isVip: formIsVip,
      isRecommended: formIsRecommended,
      isFreeNet: formIsFreeNet,
      simOperator: formSimOp.trim() || undefined,
      simOperatorBn: formSimOpBn.trim() || formSimOp.trim() || undefined,
      freeNetSni: formSni.trim() || undefined,
      payloadTemplate: formPayload.trim() || undefined,
      capabilities: formCapabilities.length > 0 ? formCapabilities : ['streaming', 'gaming'],
      protocols: formProtocols.length > 0 ? formProtocols : ['wireguard', 'v2ray'],
      lat: formRegion === 'middle_east' ? 24.7136 : formRegion === 'asia' ? 1.3521 : 50.1109,
      lng: formRegion === 'middle_east' ? 46.6753 : formRegion === 'asia' ? 103.8198 : 8.6821,
    };

    await ServerManager.addOrUpdateServer(serverObj);
    setActionSuccessNotice(
      modalMode === 'add'
        ? (lang === 'bn' ? 'সার্ভার নোড সফলভাবে তৈরি ও যুক্ত হয়েছে!' : 'Server node deployed successfully!')
        : (lang === 'bn' ? 'সার্ভার নোডের তথ্য সফলভাবে আপডেট হয়েছে!' : 'Server node updated successfully!')
    );

    setTimeout(() => {
      setActionSuccessNotice(null);
      setModalMode(null);
      setEditingServerId(null);
    }, 1200);
  };

  // Delete Server Node
  const handleDeleteServer = async (serverId: string, serverName: string) => {
    const confirmMsg = lang === 'bn'
      ? `আপনি কি নিশ্চিত যে '${serverName}' সার্ভার নোডটি মুছে ফেলতে চান?`
      : `Are you sure you want to remove '${serverName}' node from the network?`;

    if (window.confirm(confirmMsg)) {
      await ServerManager.deleteServer(serverId);
    }
  };

  // Reset Server Fleet to Factory Defaults
  const handleResetFleet = async () => {
    const confirmMsg = lang === 'bn'
      ? 'সতর্কতা: এটি আপনার সমস্ত কাস্টম সার্ভার নোড এবং এডিট রিসেট করে ফ্যাক্টরি ডিফল্ট ফ্লিট ফিরিয়ে আনবে। আপনি কি এগিয়ে যেতে চান?'
      : 'Warning: This will reset all server customizations, deletions, and overrides back to original factory defaults. Continue?';

    if (window.confirm(confirmMsg)) {
      await ServerManager.resetToDefaults();
    }
  };

  // Webhook save
  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(GOOGLE_SHEET_WEBHOOK_KEY, webhookUrl.trim());
    setSavedWebhook(true);
    setTimeout(() => setSavedWebhook(false), 2500);
  };

  // Filter users
  const filteredUsers = usersList.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = 
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phoneNumber && u.phoneNumber.toLowerCase().includes(q)) ||
      (u.vipMasterKey && u.vipMasterKey.toLowerCase().includes(q));

    if (!matchSearch) return false;
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (filterPlan !== 'all' && u.plan !== filterPlan) return false;
    return true;
  });

  // Filter servers
  const filteredServers = serverList.filter((s) => {
    const q = serverSearch.toLowerCase();
    const matchesQuery = 
      s.name.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q) ||
      s.countryBn.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.ip.includes(q) ||
      (s.simOperator && s.simOperator.toLowerCase().includes(q)) ||
      (s.freeNetSni && s.freeNetSni.toLowerCase().includes(q));

    if (!matchesQuery) return false;

    if (serverRegionFilter !== 'all' && s.region !== serverRegionFilter) return false;

    if (serverTypeFilter === 'vip' && !s.isVip) return false;
    if (serverTypeFilter === 'freenet' && !s.isFreeNet) return false;
    if (serverTypeFilter === 'custom' && !s.id.startsWith('custom-')) return false;

    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['User ID,Name,Email,Phone,Role,Plan,Master Key,Status,Created At,Last Login'];
    const rows = filteredUsers.map((u) => {
      return `"${u.userId}","${u.displayName || ''}","${u.email}","${u.phoneNumber || 'N/A'}","${u.role || 'user'}","${u.plan}","${u.vipMasterKey || ''}","${u.status || 'active'}","${u.createdAt}","${u.lastLoginAt || ''}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `soverixnet_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy for Google Sheet TSV
  const handleCopyForGoogleSheet = () => {
    const headers = 'Timestamp\tName\tEmail\tPhone\tRole\tPlan\tMaster Key\tStatus';
    const rows = filteredUsers.map((u) => {
      return `${u.createdAt}\t${u.displayName}\t${u.email}\t${u.phoneNumber || 'N/A'}\t${u.role || 'user'}\t${u.plan}\t${u.vipMasterKey}\t${u.status}`;
    });
    const tsvData = [headers, ...rows].join('\n');
    navigator.clipboard.writeText(tsvData);
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 2500);
  };

  // Reseller: Create Customer Account
  const handleResellerCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail.trim()) return;

    const newCustomerId = `cust-${Date.now()}`;
    const generatedKey = `SOVERIX-VIP-${Date.now().toString(36).toUpperCase()}-47CC-B1C1`;

    const newCustomer: UserProfileData = {
      userId: newCustomerId,
      email: customerEmail.trim(),
      displayName: customerName.trim() || customerEmail.split('@')[0],
      phoneNumber: customerPhone.trim(),
      photoURL: '',
      role: 'user',
      managedByResellerId: userProfile?.userId || user?.uid || 'reseller-agent',
      plan: customerPlan,
      vipMasterKey: generatedKey,
      status: 'active',
      lastLoginAt: 'Not logged in yet',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const userRef = doc(db, 'users', newCustomerId);
      await setDoc(userRef, newCustomer);
    } catch {}

    setUsersList((prev) => [newCustomer, ...prev]);
    setCreatedCustomerKey(generatedKey);
  };

  // Super Admin: Save Role & Credit Updates
  const handleSaveUserRole = async () => {
    if (!editingUser) return;
    await updateUserRoleAndCredits(editingUser.userId, selectedRole, allocatedCredits);
    
    setUsersList((prev) => 
      prev.map((u) => 
        u.userId === editingUser.userId 
          ? { ...u, role: selectedRole, resellerCredits: allocatedCredits } 
          : u
      )
    );
    setEditingUser(null);
  };

  // Toggle user active / suspended status
  const handleToggleUserStatus = async (targetUser: UserProfileData) => {
    const newStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';
    try {
      const userRef = doc(db, 'users', targetUser.userId);
      await updateDoc(userRef, { status: newStatus });
    } catch {}
    setUsersList((prev) => 
      prev.map((u) => u.userId === targetUser.userId ? { ...u, status: newStatus } : u)
    );
  };

  const currentResellerCredits = userProfile?.resellerCredits ?? (isSuperAdmin ? 100000 : 25000);

  // Quick fleet stats
  const totalServersCount = serverList.length;
  const vipServersCount = serverList.filter((s) => s.isVip).length;
  const freeNetServersCount = serverList.filter((s) => s.isFreeNet).length;
  const avgPing = Math.round(serverList.reduce((acc, curr) => acc + curr.ping, 0) / (serverList.length || 1));

  // Security Access Gate: Strictly restricted to soverixnet@gmail.com
  if (!isOwner) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="glass-panel max-w-lg w-full p-8 rounded-3xl border border-red-500/40 bg-[#070b14]/95 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40 inline-flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? '⛔ এক্সেস সীমাবদ্ধ / RESTRICTED ACCESS' : '⛔ ACCESS RESTRICTED'}</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {lang === 'bn' ? 'মাস্টার ওনার এডমিন কন্ট্রোল সেন্টার' : 'Master Owner Admin Center'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              {lang === 'bn' 
                ? `এই কন্ট্রোল প্যানেলটি শুধুমাত্র প্রধান স্বত্বাধিকারী (${OWNER_EMAIL}) এর জন্য কঠোরভাবে সংরক্ষিত। সাধারণ ভিজিটর বা অন্য কোনো ব্যবহারকারী এখানে কিছু এডিট করতে পারবেন না।` 
                : `This control center is strictly locked for the master owner (${OWNER_EMAIL}). Unauthorized users cannot view or modify system configurations.`}
            </p>
          </div>

          {user && (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                {lang === 'bn' ? 'বর্তমানে লগইন থাকা অ্যাকাউন্ট:' : 'Currently signed in as:'}
              </span>
              <p className="text-amber-400 font-mono font-bold truncate">{user.email || user.displayName || 'Anonymous'}</p>
              <p className="text-[11px] text-slate-400">
                {lang === 'bn' ? 'এই ইমেইলটি ওনার হিসেবে অনুমোদিত নয়।' : 'This account does not have owner privileges.'}
              </p>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={() => signInWithGoogle()}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-500/20"
            >
              <LogIn className="w-4 h-4" />
              <span>{lang === 'bn' ? `Google দিয়ে লগইন করুন (${OWNER_EMAIL})` : `Sign In with Google (${OWNER_EMAIL})`}</span>
            </button>

            <button
              onClick={() => signInDemoVip()}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? '⚡ ১-ক্লিক মাস্টার ওনার লগইন (Instant Owner Mode)' : '⚡ Instant Master Owner Mode'}</span>
            </button>

            {user && (
              <button
                onClick={() => signOutUser()}
                className="w-full py-2 px-3 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'লগআউট করুন' : 'Sign Out'}</span>
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SoverixNet Zero-Trust RBAC Protection Enabled</span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className={`glass-panel p-6 sm:p-8 rounded-3xl border ${isSuperAdmin ? 'border-red-500/40 bg-gradient-to-r from-red-950/40 via-slate-900 to-[#030712]' : 'border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-[#030712]'} shadow-2xl relative overflow-hidden`}>
        <div className={`absolute top-0 right-0 w-80 h-80 ${isSuperAdmin ? 'bg-red-500/10' : 'bg-amber-500/10'} rounded-full blur-3xl pointer-events-none`} />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                isSuperAdmin 
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {isSuperAdmin ? <Crown className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
                <span>
                  {isSuperAdmin 
                    ? (lang === 'bn' ? 'মাস্টার ওনার এডমিন কন্ট্রোল সেন্টার' : 'Master Owner Admin Center') 
                    : isReseller 
                    ? (lang === 'bn' ? 'সোভারিক্সনেট রিসেলার পোর্টাল' : 'SoverixNet Reseller Portal') 
                    : (lang === 'bn' ? 'এডমিন মনিটরিং কনসোল' : 'Admin Operations Console')}
                </span>
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-bold">
                {user?.email || 'soverixnet@gmail.com'}
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-white tracking-wide">
              {lang === 'bn' ? 'সহজ ও সম্পূর্ণ কন্ট্রোল প্যানেল' : 'Soverix Complete Admin Center'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {lang === 'bn' 
                ? 'আপনার ফোন বা কম্পিউটার থেকে সরাসরি ছবি আপলোড করুন, ওয়েবসাইটের যেকোনো লেখা বদলান এবং অ্যাপস ও ভিআইপি প্ল্যানের রেট নিজের মতো সাজান।' 
                : 'Upload photos directly from gallery, edit texts and headings, manage VPN apps, VIP pricing, and server fleet.'}
            </p>
          </div>

          {/* Quick Reseller Action & Wallet Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-950/90 border border-amber-500/30 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">
                  {lang === 'bn' ? 'রিসেলার ক্রেডিট ব্যালেন্স' : 'Reseller Balance'}
                </span>
                <span className="text-base font-black text-amber-400 font-mono">
                  ৳{currentResellerCredits.toLocaleString()} BDT
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setCreatedCustomerKey(null);
                setShowCreateCustomerModal(true);
              }}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? '+ নতুন কাস্টমার তৈরি' : '+ Create Customer'}</span>
            </button>
          </div>
        </div>

        {/* Quick Fleet Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              {lang === 'bn' ? 'মোট অ্যাক্টিভ সার্ভার' : 'Total Active Nodes'}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Server className="w-4 h-4 text-cyan-400" />
              <span className="text-xl font-black text-cyan-400 font-mono">{totalServersCount}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              {lang === 'bn' ? 'VIP ১০ Gbps নোড' : 'VIP 10G Nodes'}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xl font-black text-amber-400 font-mono">{vipServersCount}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              {lang === 'bn' ? 'আরব ফ্রি-নেট সিম নোড' : 'Free Net SIM Nodes'}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-xl font-black text-emerald-400 font-mono">{freeNetServersCount}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              {lang === 'bn' ? 'গড় পিং লেটেন্সি' : 'Average Latency'}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-xl font-black text-purple-400 font-mono">{avgPing} ms</span>
            </div>
          </div>
        </div>

      </div>

      {/* 5 Main Simplified & Beautiful Categories (হিবিজিবি মুক্ত পরিষ্কার নেভিগেশন) */}
      {(() => {
        const categoryGroups = [
          {
            id: 'media',
            nameBn: 'ছবি, ভিডিও ও ব্যানার ফাইল',
            nameEn: 'Photos, Videos & Banner Files',
            descBn: 'ব্যানার ফাইল ম্যানেজার, গ্যালারি ও সাইট আইডেন্টিটি লোগো',
            descEn: 'Banner file manager, gallery, and site identity logo',
            icon: Film,
            color: 'emerald',
            activeTabDefault: 'banners',
            tabs: [
              { id: 'banners', labelBn: '🚀 ব্যানার ফাইল ম্যানেজার', labelEn: '🚀 Banner File Manager', icon: Sparkles },
              { id: 'design', labelBn: '🎨 সাইট আইডেন্টিটি ও লোগো', labelEn: '🎨 Site Identity & Logo', icon: Palette },
              { id: 'gallery', labelBn: '📷 ফটো গ্যালারি ও আপলোড', labelEn: '📷 Photo Gallery', icon: ImageIcon },
              { id: 'videos', labelBn: '🎬 ভিডিও পাবলিশার ও গাইড', labelEn: '🎬 Video Publisher', icon: Film },
            ]
          },
          {
            id: 'content',
            nameBn: 'সাইটের লেখা',
            nameEn: 'Texts & Content',
            descBn: 'প্রধান শিরোনাম, ৮টি সুবিধার কার্ড ও সাধারণ প্রশ্নোত্তর',
            descEn: 'Hero text, feature benefits, and FAQ answers',
            icon: Radio,
            color: 'cyan',
            activeTabDefault: 'texts',
            tabs: [
              { id: 'texts', labelBn: '📝 প্রধান শিরোনাম ও টেক্সট', labelEn: '📝 Headings & Hero', icon: Radio },
              { id: 'benefits', labelBn: '⭐ ৮টি বিশেষ সুবিধার কার্ড', labelEn: '⭐ 8 Benefit Cards', icon: Zap },
              { id: 'faqs', labelBn: '❓ সাধারণ প্রশ্নোত্তর (FAQ)', labelEn: '❓ FAQs', icon: HelpCircle },
            ]
          },
          {
            id: 'apps_plans',
            nameBn: 'অ্যাপস ও প্যাকেজ',
            nameEn: 'Apps & VIP Plans',
            descBn: 'ভিপিএন এপিকে ডাউনলোড লিংক ও ভিআইপি প্ল্যানের রেট',
            descEn: 'APK app downloads and VIP pricing tiers',
            icon: Smartphone,
            color: 'amber',
            activeTabDefault: 'apps',
            tabs: [
              { id: 'apps', labelBn: '📲 ভিপিএন অ্যাপস ডাউনলোড', labelEn: '📲 VPN Apps Hub', icon: Smartphone },
              { id: 'plans', labelBn: '👑 ভিআইপি প্ল্যান ও দাম', labelEn: '👑 VIP Plans & Pricing', icon: Crown },
            ]
          },
          {
            id: 'fleet_users',
            nameBn: 'সার্ভার ও গ্রাহক',
            nameEn: 'Servers & Customers',
            descBn: 'ভিপিএন নোড স্পিড, ইউজার তালিকা ও গ্রাহকদের রিভিউ',
            descEn: 'Server fleet, user management, and reviews',
            icon: Server,
            color: 'purple',
            activeTabDefault: 'servers',
            tabs: [
              { id: 'servers', labelBn: `⚡ সার্ভার তালিকা (${serverList.length})`, labelEn: `⚡ Server Fleet (${serverList.length})`, icon: Server },
              { id: 'users', labelBn: `👥 গ্রাহক ও ইউজার (${usersList.length})`, labelEn: `👥 Users (${usersList.length})`, icon: Users },
              { id: 'reviews', labelBn: `⭐ কাস্টমার রিভিউ (${reviewsList.length})`, labelEn: `⭐ Reviews (${reviewsList.length})`, icon: MessageSquare },
            ]
          },
          {
            id: 'settings_ctrl',
            nameBn: 'সেটিংস ও নিয়ন্ত্রণ',
            nameEn: 'Settings & Control',
            descBn: 'হোয়াটসঅ্যাপ নাম্বার ও সেকশন চালু/বন্ধ করার অপশন',
            descEn: 'WhatsApp contacts and section visibility',
            icon: Settings,
            color: 'teal',
            activeTabDefault: 'site_settings',
            tabs: [
              { id: 'site_settings', labelBn: '📞 হোয়াটসঅ্যাপ নাম্বার', labelEn: '📞 WhatsApp Contacts', icon: Settings },
              { id: 'sections', labelBn: '👁️ সেকশন চালু/বন্ধ', labelEn: '👁️ Show / Hide Sections', icon: SlidersHorizontal },
              { id: 'sheets', labelBn: '📊 গুগল শিট সিঙ্ক', labelEn: '📊 Google Sheets', icon: FileSpreadsheet },
            ]
          },
        ];

        const currentCategory = categoryGroups.find(c => c.tabs.some(t => t.id === activeAdminTab)) || categoryGroups[0];

        return (
          <div className="space-y-4">
            {/* Top 5 Primary Category Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {categoryGroups.map((cat) => {
                const isSelectedCat = currentCategory.id === cat.id;
                const CatIcon = cat.icon;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      if (!isSelectedCat) {
                        setActiveAdminTab(cat.activeTabDefault as any);
                      }
                    }}
                    className={`p-3.5 rounded-2xl sm:rounded-3xl border transition-all duration-300 text-left cursor-pointer flex flex-col justify-between relative group ${
                      isSelectedCat
                        ? 'bg-gradient-to-b from-cyan-950/60 to-slate-950 border-cyan-400 shadow-xl shadow-cyan-500/20 ring-2 ring-cyan-500/40'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-xl ${
                        isSelectedCat 
                          ? 'bg-cyan-500 text-slate-950 shadow-md' 
                          : 'bg-slate-900 text-slate-400 group-hover:text-white'
                      }`}>
                        <CatIcon className="w-5 h-5" />
                      </div>
                      {isSelectedCat && (
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
                      )}
                    </div>

                    <div>
                      <h3 className={`font-black text-xs sm:text-sm tracking-tight ${
                        isSelectedCat ? 'text-white' : 'text-slate-300 group-hover:text-white'
                      }`}>
                        {lang === 'bn' ? cat.nameBn : cat.nameEn}
                      </h3>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 leading-snug">
                        {lang === 'bn' ? cat.descBn : cat.descEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sub-Navigation Pill Bar for Active Category */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 shadow-lg flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider hidden sm:inline-block">
                  {lang === 'bn' ? `${currentCategory.nameBn} সাব-মেনু:` : 'Sub-options:'}
                </span>

                {currentCategory.tabs.map((t) => {
                  const isActiveTab = activeAdminTab === t.id;
                  const SubIcon = t.icon;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveAdminTab(t.id as any)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isActiveTab
                          ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-cyan-500/25 font-black scale-[1.02]'
                          : 'text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <SubIcon className={`w-4 h-4 ${isActiveTab ? 'text-slate-950' : 'text-cyan-400'}`} />
                      <span>{lang === 'bn' ? t.labelBn : t.labelEn}</span>
                    </button>
                  );
                })}
              </div>

              {/* Friendly Language Hint */}
              <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold px-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'সরাসরি রিয়েলটাইমে হোমপেজে সেভ হবে' : 'Changes apply live to homepage'}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB: VIDEO PUBLISHER & MANAGER */}
      {activeAdminTab === 'videos' && (
        <VideoManager lang={lang} />
      )}

      {/* TAB: MEDIA & PHOTO GALLERY MANAGER */}
      {activeAdminTab === 'gallery' && (
        <MediaGalleryManager lang={lang} onNavigateToTab={(t) => setActiveAdminTab(t as any)} />
      )}

      {/* TAB: BANNERS MANAGER */}
      {activeAdminTab === 'banners' && (
        <BannersManager lang={lang} />
      )}

      {/* TAB: OFFICIAL APK APPS MANAGER */}
      {activeAdminTab === 'apps' && (
        <AppsManager lang={lang} />
      )}

      {/* TAB: ALL TEXTS & HERO COPY MANAGER */}
      {activeAdminTab === 'texts' && (
        <AllTextsManager lang={lang} />
      )}

      {/* TAB: BENEFITS / WHY CHOOSE US CARDS */}
      {activeAdminTab === 'benefits' && (
        <BenefitsManager lang={lang} />
      )}

      {/* TAB: VIP PLANS & PRICING HUB */}
      {activeAdminTab === 'plans' && (
        <VipPlansManager lang={lang} />
      )}

      {/* TAB: FAQ ACCORDION MANAGER */}
      {activeAdminTab === 'faqs' && (
        <FaqManager lang={lang} />
      )}

      {/* TAB: DESIGN & THEME STUDIO */}
      {activeAdminTab === 'design' && (
        <DesignThemeManager lang={lang} />
      )}

      {/* TAB: SECTIONS REMOVER & VISIBILITY MANAGER */}
      {activeAdminTab === 'sections' && (
        <SectionsManager lang={lang} />
      )}

      {/* TAB 1: SERVER FLEET & DYNAMIC CRUD MANAGER */}
      {activeAdminTab === 'servers' && (
        <div className="space-y-4">
          
          {/* Action & Filter Bar */}
          <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={serverSearch}
                onChange={(e) => setServerSearch(e.target.value)}
                placeholder={lang === 'bn' ? 'সার্ভার নাম, দেশ, আইপি বা এসএনআই খুঁজুন...' : 'Search by name, country, IP, SNI...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Region & Type Filters */}
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
              <select
                value={serverRegionFilter}
                onChange={(e) => setServerRegionFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
              >
                <option value="all">{lang === 'bn' ? 'সকল অঞ্চল (All Regions)' : 'All Regions'}</option>
                {ALL_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {lang === 'bn' ? r.nameBn : r.name}
                  </option>
                ))}
              </select>

              <select
                value={serverTypeFilter}
                onChange={(e) => setServerTypeFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
              >
                <option value="all">{lang === 'bn' ? 'সকল প্রকার সার্ভার' : 'All Server Types'}</option>
                <option value="vip">👑 VIP 10 Gbps Nodes</option>
                <option value="freenet">⚡ Arab Free SIM Nodes</option>
                <option value="custom">🛠️ Custom Added Nodes</option>
              </select>

              {/* Reset to Factory Defaults Button */}
              <button
                onClick={handleResetFleet}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
                title={lang === 'bn' ? 'ফ্যাক্টরি ডিফল্টে রিসেট করুন' : 'Reset Fleet to Factory Defaults'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Deploy New Server Button */}
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'bn' ? '+ নতুন সার্ভার ডিপ্লয় করুন' : '+ Add Server Node'}</span>
              </button>
            </div>

          </div>

          {/* Server Nodes Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServers.map((s) => {
              const isCustom = s.id.startsWith('custom-');
              return (
                <div 
                  key={s.id}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all duration-200 group relative overflow-hidden flex flex-col justify-between ${
                    s.isVip
                      ? 'border-amber-500/40 bg-gradient-to-br from-[#070d1d] via-slate-900/90 to-amber-950/20 shadow-lg shadow-amber-950/20'
                      : 'border-slate-800/90 bg-gradient-to-br from-[#050b18] to-slate-900/80 hover:border-cyan-500/40'
                  }`}
                >
                  <div>
                    {/* Top Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl filter drop-shadow select-none">
                          {s.flag}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                              {lang === 'bn' ? s.countryBn : s.country}
                            </h4>
                            {s.isVip && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                                <Crown className="w-2.5 h-2.5" />
                                VIP 10G
                              </span>
                            )}
                            {s.isFreeNet && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5 animate-pulse">
                                <Zap className="w-2.5 h-2.5" />
                                FREE SIM
                              </span>
                            )}
                            {isCustom && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                CUSTOM
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-slate-300 mt-0.5 font-medium">
                            {s.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <span>{s.city}</span>
                            <span>•</span>
                            <span className="text-cyan-400 font-semibold">{s.ip}</span>
                          </p>
                        </div>
                      </div>

                      {/* Ping and Load */}
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          {s.ping} ms
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Load: {s.load}%
                        </span>
                      </div>
                    </div>

                    {/* SIM Operator & SNI Details if FreeNet */}
                    {s.simOperator && (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-1">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-300">
                          <Radio className="w-3 h-3 text-amber-400" />
                          <span>{lang === 'bn' ? s.simOperatorBn || s.simOperator : s.simOperator}</span>
                        </div>
                        {s.freeNetSni && (
                          <div className="text-[10px] font-mono text-cyan-400 truncate">
                            SNI: <span className="text-slate-300">{s.freeNetSni}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Protocol Badges */}
                    <div className="mt-3 flex items-center gap-1 flex-wrap">
                      <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        {s.speed}
                      </span>
                      {s.protocols.slice(0, 3).map((proto) => (
                        <span key={proto} className="text-[9px] font-mono text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800/80">
                          {proto}
                        </span>
                      ))}
                      {s.protocols.length > 3 && (
                        <span className="text-[9px] font-mono text-slate-400">
                          +{s.protocols.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      ID: {s.id.slice(0, 14)}...
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(s)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors border border-slate-700"
                        title="Edit Server Node"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lang === 'bn' ? 'এডিট' : 'Edit'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteServer(s.id, s.name)}
                        className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 cursor-pointer transition-colors"
                        title="Remove Server Node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {filteredServers.length === 0 && (
            <div className="text-center py-12 glass-panel rounded-3xl border border-slate-800">
              <Server className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm font-semibold">
                {lang === 'bn' ? 'কোনো সার্ভার নোড পাওয়া যায়নি।' : 'No server nodes match your filters.'}
              </p>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: USERS & RESELLERS */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          
          {/* Action Bar: Search, Filters & Export Buttons */}
          <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={lang === 'bn' ? 'ইমেইল, নাম বা ফোন নম্বর খুঁজুন...' : 'Search by email, name or phone...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Role & Plan Filters */}
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">{lang === 'bn' ? 'সকল রোল (All Roles)' : 'All Roles'}</option>
                <option value="user">User (গ্রাহক)</option>
                <option value="reseller">Reseller (রিসেলার)</option>
                <option value="admin">Admin (এডমিন)</option>
              </select>

              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">{lang === 'bn' ? 'সকল প্ল্যান (All Plans)' : 'All Plans'}</option>
                <option value="Sovereign VIP Lifetime">Sovereign VIP Lifetime</option>
                <option value="Cyber Pro 1-Year">Cyber Pro 1-Year</option>
                <option value="Gaming Turbo Monthly">Gaming Turbo Monthly</option>
                <option value="Quantum Elite Pass">Quantum Elite Pass</option>
                <option value="Free Tier">Free Tier</option>
              </select>

              {/* Export CSV Button */}
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'CSV ডাউনলোড' : 'Export CSV'}</span>
              </button>

              {/* Copy for Google Sheet */}
              <button
                onClick={handleCopyForGoogleSheet}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedData ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedData ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'শিটে পেস্টের জন্য কপি' : 'Copy for Sheets')}</span>
              </button>
            </div>

          </div>

          {/* Users & Resellers Table */}
          <div className="glass-panel rounded-3xl border border-cyan-500/20 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-4">User / Subscriber</th>
                    <th className="px-5 py-4">Phone / Contact</th>
                    <th className="px-5 py-4">Role & Level</th>
                    <th className="px-5 py-4">VIP Plan Tier</th>
                    <th className="px-5 py-4">Master Key Token</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Last Activity</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => {
                      const isOwnerRecord = u.email.toLowerCase() === 'soverixnet@gmail.com';
                      return (
                        <tr key={u.userId} className="hover:bg-slate-900/40 transition-colors">
                          
                          {/* Name & Email */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                isOwnerRecord 
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                                  : u.role === 'reseller'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                              }`}>
                                {u.displayName ? u.displayName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <span className="text-white font-bold block">{u.displayName}</span>
                                <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-500" />
                                  {u.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Phone Number */}
                          <td className="px-5 py-4 font-mono text-slate-300">
                            {u.phoneNumber ? (
                              <span className="flex items-center gap-1 text-emerald-400">
                                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                                {u.phoneNumber}
                              </span>
                            ) : (
                              <span className="text-slate-500">N/A</span>
                            )}
                          </td>

                          {/* Role */}
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 w-fit ${
                                isOwnerRecord || u.role === 'super_admin'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                  : u.role === 'reseller'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : u.role === 'admin'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                  : 'bg-slate-800 text-slate-300'
                              }`}>
                                {isOwnerRecord ? '👑 OWNER' : u.role === 'reseller' ? '💼 RESELLER' : u.role === 'admin' ? '🛡️ ADMIN' : 'USER'}
                              </span>
                              {u.role === 'reseller' && (
                                <span className="text-[10px] text-amber-400 font-mono">
                                  ৳{(u.resellerCredits || 0).toLocaleString()} Credit
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Plan */}
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-950/50 text-cyan-300 border border-cyan-500/30 inline-block">
                              {u.plan}
                            </span>
                          </td>

                          {/* Master Key */}
                          <td className="px-5 py-4 font-mono text-slate-300">
                            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 w-fit">
                              <Key className="w-3 h-3 text-amber-400" />
                              <span className="text-[11px] text-amber-300 select-all truncate max-w-[120px]">
                                {u.vipMasterKey}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.status === 'suspended'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            }`}>
                              {u.status || 'ACTIVE'}
                            </span>
                          </td>

                          {/* Last Activity */}
                          <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {u.lastLoginAt || 'Recently'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Super Admin can edit role and assign reseller credits */}
                              {isSuperAdmin && (
                                <button
                                  onClick={() => {
                                    setEditingUser(u);
                                    setSelectedRole(u.role || 'user');
                                    setAllocatedCredits(u.resellerCredits || 0);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                                  title={lang === 'bn' ? 'রোল ও ক্রেডিট পরিবর্তন' : 'Change Role & Credits'}
                                >
                                  Edit Role
                                </button>
                              )}

                              {/* Toggle active / suspended */}
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  u.status === 'suspended'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                                }`}
                                title={u.status === 'suspended' ? 'Activate User' : 'Suspend Access'}
                              >
                                {u.status === 'suspended' ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-500">
                        {lang === 'bn' ? 'কোনো ব্যবহারকারী পাওয়া যায়নি।' : 'No users found matching query.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: GOOGLE SHEETS */}
      {activeAdminTab === 'sheets' && isSuperAdmin && (
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-white">
                  {lang === 'bn' ? 'গুগল শিট অটো-সিঙ্ক ওয়েবহুক (Google Sheets Real-Time Sync)' : 'Google Sheets Webhook Real-Time Sync'}
                </h4>
                <p className="text-xs text-slate-400">
                  {lang === 'bn' 
                    ? 'যেকোনো ইউজার সাইন ইন করার সাথে সাথে তার ইমেইল ও মোবাইল নম্বর রিয়েল-টাইমে গুগল শিটে জমা হবে।' 
                    : 'Automatically pushes every user email and phone number to your Google Sheet upon login.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowWebhookSetupGuide(!showWebhookSetupGuide)}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'কিভাবে সেটআপ করবেন?' : 'How to setup?'}</span>
            </button>
          </div>

          <form onSubmit={handleSaveWebhook} className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 shrink-0"
            >
              {savedWebhook ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{savedWebhook ? (lang === 'bn' ? 'সংরক্ষিত হয়েছে!' : 'Saved!') : (lang === 'bn' ? 'ওয়েবহুক সেভ করুন' : 'Save Webhook')}</span>
            </button>
          </form>

          {showWebhookSetupGuide && (
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 space-y-2 font-mono">
              <p className="text-emerald-400 font-bold">📋 গুগল শিট অটো-সিঙ্ক সেটআপের সহজ ধাপ:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                <li>আপনার Google Sheet খুলে <strong>Extensions ➔ Apps Script</strong> এ যান।</li>
                <li>নিচের কোডটি পেস্ট করুন:</li>
              </ol>
              <pre className="p-3 bg-black/80 rounded-xl border border-slate-800 text-[10px] text-cyan-300 overflow-x-auto select-all">
{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.timestamp || new Date(),
    data.displayName,
    data.email,
    data.phoneNumber || 'N/A',
    data.role || 'user',
    data.plan,
    data.vipMasterKey,
    data.status
  ]);
  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}`}
              </pre>
              <p className="text-slate-400 text-[11px]">
                ৩. <strong>Deploy ➔ New deployment ➔ Web App</strong> নির্বাচন করে <em>Who has access</em> এ <strong>"Anyone"</strong> দিয়ে ডিপ্লয় করে URL টি উপরের ঘরে বসিয়ে দিন।
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: REVIEWS & COMMUNITY FEEDBACK MODERATION */}
      {activeAdminTab === 'reviews' && (
        <div className="space-y-4">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-purple-500/30 bg-purple-950/10 space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    <span>{lang === 'bn' ? 'পাবলিক কমেন্ট ও রিভিউ মডারেশন সেন্টার' : 'Public Reviews & Feedback Moderation'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
                      LIVE FIRESTORE
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn'
                      ? 'ভিজিটরদের করা সকল লাইভ রিভিউ নিয়ন্ত্রণ করুন। অনাকাঙ্ক্ষিত বা স্প্যাম কমেন্ট মুছে ফেলতে পারবেন এবং বিশ্বস্ত কাস্টমারদের "Verified Buyer" ব্যাজ দিতে পারেন।'
                      : 'Live Firestore reviews moderation. Instantly remove spam comments or award Verified Buyer credentials.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-purple-300 bg-purple-950/80 px-3 py-1.5 rounded-xl border border-purple-500/30 font-bold">
                  {lang === 'bn' ? `মোট রিভিউ: ${reviewsList.length} টি` : `Total Reviews: ${reviewsList.length}`}
                </span>
              </div>
            </div>

            {/* Review Analytics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {lang === 'bn' ? 'গড় রেটিং' : 'Average Rating'}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-xl font-black text-amber-400 font-mono">
                    {reviewsList.length ? (reviewsList.reduce((acc, curr) => acc + (curr.rating || 5), 0) / reviewsList.length).toFixed(1) : '5.0'} / 5.0
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {lang === 'bn' ? '৫-স্টার রিভিউ' : '5-Star Reviews'}
                </span>
                <span className="text-xl font-black text-emerald-400 font-mono block mt-1">
                  {reviewsList.filter((r) => r.rating === 5).length}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {lang === 'bn' ? 'ভেরিফায়েড ক্রেতা' : 'Verified Buyers'}
                </span>
                <span className="text-xl font-black text-cyan-400 font-mono block mt-1">
                  {reviewsList.filter((r) => r.verifiedBuyer).length}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {lang === 'bn' ? 'পেন্ডিং / অ্যাক্টিভ' : 'Active Status'}
                </span>
                <span className="text-xl font-black text-purple-400 font-mono block mt-1">
                  100% Live
                </span>
              </div>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  placeholder={lang === 'bn' ? 'লেখক বা কমেন্টের টেক্সট দিয়ে খুঁজুন...' : 'Search by author or comment text...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <select
                  value={reviewFilterRating}
                  onChange={(e) => setReviewFilterRating(e.target.value as any)}
                  className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">{lang === 'bn' ? 'সব রেটিং' : 'All Ratings'}</option>
                  <option value="5">{lang === 'bn' ? '⭐ ৫ স্টার' : '⭐ 5 Stars'}</option>
                  <option value="4">{lang === 'bn' ? '⭐ ৪ স্টার' : '⭐ 4 Stars'}</option>
                  <option value="3">{lang === 'bn' ? '⭐ ৩ স্টার বা কম' : '⭐ 3 Stars & below'}</option>
                </select>
              </div>
            </div>

          </div>

          {/* Reviews List Cards */}
          <div className="space-y-3">
            {(() => {
              const filtered = reviewsList.filter((r) => {
                const matchesSearch =
                  !reviewSearch ||
                  (r.authorName && r.authorName.toLowerCase().includes(reviewSearch.toLowerCase())) ||
                  (r.comment && r.comment.toLowerCase().includes(reviewSearch.toLowerCase())) ||
                  (r.packageUsed && r.packageUsed.toLowerCase().includes(reviewSearch.toLowerCase()));
                const matchesRating =
                  reviewFilterRating === 'all'
                    ? true
                    : reviewFilterRating === '5'
                    ? r.rating === 5
                    : reviewFilterRating === '4'
                    ? r.rating === 4
                    : (r.rating || 5) <= 3;
                return matchesSearch && matchesRating;
              });

              if (filtered.length === 0) {
                return (
                  <div className="glass-panel p-10 text-center rounded-3xl border border-slate-800 text-slate-500 space-y-2">
                    <MessageSquare className="w-10 h-10 mx-auto text-slate-600 opacity-50" />
                    <p className="text-sm font-semibold">
                      {lang === 'bn' ? 'কোনো রিভিউ পাওয়া যায়নি।' : 'No reviews found.'}
                    </p>
                  </div>
                );
              }

              return filtered.map((r) => (
                <div
                  key={r.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-purple-500/40 bg-slate-950/60 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                        {r.authorName ? r.authorName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{r.authorName || 'Anonymous Customer'}</span>
                          {r.verifiedBuyer && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{lang === 'bn' ? 'ভেরিফায়েড ক্রেতা' : 'Verified Buyer'}</span>
                            </span>
                          )}
                          {r.role && r.role !== 'user' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                              {r.role}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {r.createdAt ? new Date(r.createdAt).toLocaleString() : 'Recently'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Rating Stars */}
                      <div className="flex items-center gap-0.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < (r.rating || 5)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-800 text-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Package / SIM tag */}
                      {r.packageUsed && (
                        <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-cyan-300 font-mono">
                          {r.packageUsed}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {r.comment}
                  </p>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-3 pt-2 text-xs border-t border-slate-900">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>👍 {r.helpfulVotes || 0} {lang === 'bn' ? 'উপকারী ভোট' : 'helpful'}</span>
                      {r.feedbackType && (
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono text-[10px]">
                          {r.feedbackType}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleVerifiedBuyer(r.id, Boolean(r.verifiedBuyer))}
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                          r.verifiedBuyer
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {r.verifiedBuyer
                          ? (lang === 'bn' ? '✓ ভেরিফায়েড অন' : '✓ Verified')
                          : (lang === 'bn' ? '+ ভেরিফায়েড করুন' : 'Mark Verified')}
                      </button>

                      <button
                        onClick={() => handleDeleteReview(r.id)}
                        disabled={deletingReviewId === r.id}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingReviewId === r.id ? 'মুছে ফেলা হচ্ছে...' : (lang === 'bn' ? 'মুছে ফেলুন' : 'Delete')}</span>
                      </button>
                    </div>
                  </div>

                </div>
              ));
            })()}
          </div>

        </div>
      )}

      {/* TAB 5: SITE SETTINGS & WHATSAPP CONFIG */}
      {activeAdminTab === 'site_settings' && (
        <div className="space-y-4">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 space-y-6">
            
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    <span>{lang === 'bn' ? 'ওয়েবসাইট সেটিংস ও অফিশিয়াল যোগাযোগ' : 'Site Settings & Contact Config'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                      EXCLUSIVELY OWNER
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn'
                      ? 'এখানে পরিবর্তন করলে ওয়েবসাইটের সকল হোয়াটসঅ্যাপ বাটন, অফার পপআপ, নোটিশ ব্যানার ও সাপোর্ট লিংকে রিয়েল-টাইমে আপডেট কার্যকর হবে।'
                      : 'Update WhatsApp number, display labels, social support links, and top announcements globally.'}
                  </p>
                </div>
              </div>

              {/* Live Test WhatsApp Button */}
              <a
                href={CONTACT_CONFIG.getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপ টেস্ট লিংক খুলুন ↗' : 'Test WhatsApp Link ↗'}</span>
              </a>
            </div>

            {savedSettingsNotice && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {lang === 'bn'
                    ? '✅ সাইট সেটিংস সফলভাবে ক্লাউডে ও লোকাল মেমরিতে সংরক্ষণ করা হয়েছে! ওয়েবসাইটের সর্বত্র আপডেট কার্যকর।'
                    : '✅ Site settings successfully updated and broadcast across the entire website!'}
                </span>
              </div>
            )}

            <form onSubmit={handleSaveSiteSettings} className="space-y-4 text-xs">
              
              {/* WhatsApp & Phone Numbers */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? '১. অফিশিয়াল হোয়াটসঅ্যাপ ও নম্বর' : '1. Official WhatsApp Phone'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">
                      {lang === 'bn' ? 'হোয়াটসঅ্যাপ ডিরেক্ট নম্বর (শুধু সংখ্যা)' : 'WhatsApp API Number (Digits Only)'} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={siteSettingsForm.whatsappNumber}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, whatsappNumber: e.target.value })}
                      placeholder="8801342930870"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-400"
                      required
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      {lang === 'bn' ? 'দেশের কোডসহ শুধু নম্বর দিন (যেমন: 8801342930870)।' : 'Include country code without + or spaces (e.g. 8801342930870).'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">
                      {lang === 'bn' ? 'ওয়েবসাইটে প্রদর্শিত নম্বর (Display Text)' : 'Display Format (Visual Text)'}
                    </label>
                    <input
                      type="text"
                      value={siteSettingsForm.whatsappDisplayNumber}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, whatsappDisplayNumber: e.target.value })}
                      placeholder="+880 1342-930870"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      {lang === 'bn' ? 'ভিজিটররা স্ক্রিনে এই সুন্দর ফরম্যাটটি দেখতে পাবে।' : 'Formatted text shown in cards and headers.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Channels & Links */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="text-[11px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? '২. সোশ্যাল চ্যানেল ও ইমেইল' : '2. Channels & Official Email'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">
                      {lang === 'bn' ? 'অফিশিয়াল হোয়াটসঅ্যাপ চ্যানেল লিংক' : 'WhatsApp Channel Link'}
                    </label>
                    <input
                      type="url"
                      value={siteSettingsForm.whatsappChannelUrl}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, whatsappChannelUrl: e.target.value })}
                      placeholder="https://whatsapp.com/channel/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">
                      {lang === 'bn' ? 'টেলিগ্রাম গ্রুপ / চ্যানেল লিংক' : 'Telegram URL'}
                    </label>
                    <input
                      type="url"
                      value={siteSettingsForm.telegramUrl}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, telegramUrl: e.target.value })}
                      placeholder="https://t.me/soverixnet_vpn"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">
                      {lang === 'bn' ? 'অফিশিয়াল সাপোর্ট ইমেইল' : 'Official Email'}
                    </label>
                    <input
                      type="email"
                      value={siteSettingsForm.officialEmail}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, officialEmail: e.target.value })}
                      placeholder="soverixnet@gmail.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* Ticker Announcements */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? '৩. টপ নোটিশ ব্যানার (হেডার টিকার)' : '3. Top Ticker Announcements'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">
                      {lang === 'bn' ? 'বাংলা নোটিশ লেখা' : 'Bengali Announcement'}
                    </label>
                    <textarea
                      rows={2}
                      value={siteSettingsForm.tickerAnnouncementBn}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, tickerAnnouncementBn: e.target.value })}
                      placeholder="🇸🇦 সৌদি আরব STC & Mobily 5G আনলিমিটেড ফ্রি-নেট..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">
                      {lang === 'bn' ? 'ইংরেজি নোটিশ লেখা' : 'English Announcement'}
                    </label>
                    <textarea
                      rows={2}
                      value={siteSettingsForm.tickerAnnouncementEn}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, tickerAnnouncementEn: e.target.value })}
                      placeholder="🇸🇦 Saudi Arabia STC & Mobily 5G Unlimited FreeNet..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(siteSettingsForm.promoModalEnabled)}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, promoModalEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700"
                    />
                    <span className="text-slate-300 font-bold">
                      {lang === 'bn' ? 'নতুন ভিজিটরদের জন্য ওয়েলকাম অফার পপআপ সক্রিয় রাখুন' : 'Enable Welcome Offer Popup for new visitors'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/25 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingSettings ? 'সংরক্ষণ হচ্ছে...' : (lang === 'bn' ? '💾 সাইট সেটিংস সংরক্ষণ করুন' : '💾 Save Site Settings')}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* TAB 6: APK DOWNLOAD LINKS */}
      {activeAdminTab === 'app_links' && (
        <div className="space-y-4">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-blue-500/30 bg-blue-950/10 space-y-6">
            
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    <span>{lang === 'bn' ? 'এপিকে অ্যাপ ডাউনলোড লিংক পরিচালনা' : 'APK Download Links Manager'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold">
                      4 OFFICIAL APPS
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn'
                      ? 'ওয়েবসাইটে ভিজিটরদের জন্য প্রদর্শিত ৪টি অ্যাপের অফিশিয়াল ডাউনলোড লিংক সরাসরি আপডেট করুন।'
                      : 'Update direct APK release URLs for AF V2Ray, Jiyam Plus, Mohin VIP, and Net Solution.'}
                  </p>
                </div>
              </div>
            </div>

            {savedAppsNotice && (
              <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/50 text-blue-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {lang === 'bn'
                    ? '✅ এপিকে ডাউনলোড লিংক সফলভাবে ক্লাউডে সেভ হয়েছে! ডাউনলোড বাটনে নতুন লিংক কাজ করছে।'
                    : '✅ APK download links updated and saved successfully!'}
                </span>
              </div>
            )}

            <form onSubmit={handleSaveAppLinks} className="space-y-4 text-xs">
              
              {/* AF V2Ray */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-cyan-400">
                    1. AF V2Ray VPN APK (GitHub / Direct Link)
                  </span>
                  <a
                    href={siteSettingsForm.appAfV2RayUrl || 'https://github.com/flamessoflove-del/afv2rayapkdownloadelink/releases/download/1.0/af.v2.ray.apk'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline text-[11px] flex items-center gap-1"
                  >
                    <span>Test Download</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="url"
                  value={siteSettingsForm.appAfV2RayUrl || ''}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, appAfV2RayUrl: e.target.value })}
                  placeholder="https://github.com/.../af.v2.ray.apk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Jiyam Plus */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-emerald-400">
                    2. Jiyam Plus VPN APK (Gulf & Arab FreeNet)
                  </span>
                  <a
                    href={siteSettingsForm.appJiyamPlusUrl || 'https://upload.app/download/jiyam-plus-vpn/com.rksoft.jiyamplus.vpn/d75e1a0df56e37f253a36a6b2436f73edee03682c27356816f69d21da133983d'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline text-[11px] flex items-center gap-1"
                  >
                    <span>Test Download</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="url"
                  value={siteSettingsForm.appJiyamPlusUrl || ''}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, appJiyamPlusUrl: e.target.value })}
                  placeholder="https://upload.app/download/jiyam-plus-vpn/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Mohin VIP */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-amber-400">
                    3. Mohin VIP VPN APK (Ultra Pro VIP)
                  </span>
                  <a
                    href={siteSettingsForm.appMohinVipUrl || 'https://upload.app/download/mohin-vip-vpn/dev.masterbuild.mohinvip/b330cdea6a0ce3ac5ff44d7f997f6762e7a4a7f8d7c1306bdd7811ea79d0e8b9/downloading'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline text-[11px] flex items-center gap-1"
                  >
                    <span>Test Download</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="url"
                  value={siteSettingsForm.appMohinVipUrl || ''}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, appMohinVipUrl: e.target.value })}
                  placeholder="https://upload.app/download/mohin-vip-vpn/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Net Solution */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-purple-400">
                    4. Net Solution VPN APK (All SIM Tunnel)
                  </span>
                  <a
                    href={siteSettingsForm.appNetSolutionUrl || 'https://premiumapk.store/Apk/Net%20Solution.apk'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:underline text-[11px] flex items-center gap-1"
                  >
                    <span>Test Download</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="url"
                  value={siteSettingsForm.appNetSolutionUrl || ''}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, appNetSolutionUrl: e.target.value })}
                  placeholder="https://premiumapk.store/Apk/Net%20Solution.apk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 text-black font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/25 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingSettings ? 'সংরক্ষণ হচ্ছে...' : (lang === 'bn' ? '💾 অ্যাপ ডাউনলোড লিংক সেভ করুন' : '💾 Save APK Download Links')}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DYNAMIC SERVER NODE ADD / EDIT MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#040816] border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl my-8">
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {modalMode === 'add'
                      ? (lang === 'bn' ? 'নতুন সার্ভার নোড ডিপ্লয় করুন' : 'Deploy New Server Node')
                      : (lang === 'bn' ? 'সার্ভার নোড এডিট ও কনফিগার করুন' : 'Edit & Configure Server Node')}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {modalMode === 'add'
                      ? (lang === 'bn' ? 'নতুন ডেডিকেটেড বা ফ্রি-নেট সার্ভার গ্লোবাল ফ্লিটে যুক্ত করুন' : 'Provision a new high-speed or FreeNet server to the network')
                      : (lang === 'bn' ? `নোড আইডি: ${editingServerId}` : `Node ID: ${editingServerId}`)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionSuccessNotice ? (
              <div className="text-center py-8 space-y-3 animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h5 className="text-lg font-bold text-white">
                  {actionSuccessNotice}
                </h5>
                <p className="text-xs text-slate-300">
                  {lang === 'bn' ? 'পরিবর্তনসমূহ ক্লায়েন্ট ইন্টারফেসে তাৎক্ষণিকভাবে আপডেট হয়েছে।' : 'Changes propagated globally in real time.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSaveServerForm} className="space-y-4 text-xs">
                
                {/* Basic Details Section */}
                <div className="space-y-3">
                  <div className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>Basic Server Identity & Location</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">
                        Server Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Riyadh Sovereign VIP 10G"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">
                        Server IP Address / Domain <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formIp}
                        onChange={(e) => setFormIp(e.target.value)}
                        placeholder="188.130.5.100 or node.soverixnet.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Country</label>
                      <input
                        type="text"
                        value={formCountry}
                        onChange={(e) => setFormCountry(e.target.value)}
                        placeholder="Saudi Arabia"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Country (Bangla)</label>
                      <input
                        type="text"
                        value={formCountryBn}
                        onChange={(e) => setFormCountryBn(e.target.value)}
                        placeholder="সৌদি আরব"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">City</label>
                      <input
                        type="text"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        placeholder="Riyadh"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Flag Emoji</label>
                      <input
                        type="text"
                        value={formFlag}
                        onChange={(e) => setFormFlag(e.target.value)}
                        placeholder="🇸🇦"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-center text-lg focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Region</label>
                      <select
                        value={formRegion}
                        onChange={(e) => setFormRegion(e.target.value as ServerRegion)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                      >
                        {ALL_REGIONS.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Latency (ms)</label>
                      <input
                        type="number"
                        value={formPing}
                        onChange={(e) => setFormPing(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Server Load (%)</label>
                      <input
                        type="number"
                        value={formLoad}
                        onChange={(e) => setFormLoad(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Bandwidth Speed</label>
                      <input
                        type="text"
                        value={formSpeed}
                        onChange={(e) => setFormSpeed(e.target.value)}
                        placeholder="10 Gbps"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* FreeNet SIM & SNI Section */}
                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Free Net, Zero-Rating SIM & Payloads</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">
                        Free Net SNI (Bypass Host)
                      </label>
                      <input
                        type="text"
                        value={formSni}
                        onChange={(e) => setFormSni(e.target.value)}
                        placeholder="sawa.stc.com.sa or etisalat.ae"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">
                        SIM Operator Tag
                      </label>
                      <input
                        type="text"
                        value={formSimOp}
                        onChange={(e) => setFormSimOp(e.target.value)}
                        placeholder="STC / Mobily / Zain 5G"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">
                      HTTP Payload Template (For HTTP Custom / OpenVPN)
                    </label>
                    <textarea
                      value={formPayload}
                      onChange={(e) => setFormPayload(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-300 font-mono text-[11px] focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                {/* Protocols & Capabilities Checklist */}
                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Supported Protocols & Node Capabilities</span>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1.5 font-bold">Protocols</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ALL_PROTOCOLS.map((p) => {
                        const checked = formProtocols.includes(p.id);
                        return (
                          <label 
                            key={p.id} 
                            onClick={() => handleToggleProtocol(p.id)}
                            className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition-all ${
                              checked 
                                ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300' 
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {}}
                              className="hidden"
                            />
                            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${checked ? 'bg-cyan-400 text-black' : 'border border-slate-600'}`}>
                              {checked && <Check className="w-2.5 h-2.5" />}
                            </div>
                            <span className="text-[11px] font-semibold">{p.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1.5 font-bold">Capabilities</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ALL_CAPABILITIES.map((c) => {
                        const checked = formCapabilities.includes(c.id);
                        return (
                          <label 
                            key={c.id} 
                            onClick={() => handleToggleCapability(c.id)}
                            className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition-all ${
                              checked 
                                ? 'bg-amber-500/20 border-amber-400/60 text-amber-300' 
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {}}
                              className="hidden"
                            />
                            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${checked ? 'bg-amber-400 text-black' : 'border border-slate-600'}`}>
                              {checked && <Check className="w-2.5 h-2.5" />}
                            </div>
                            <span className="text-[11px] font-semibold">{c.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* VIP & FreeNet Switches */}
                <div className="flex items-center gap-6 pt-3 border-t border-slate-800/80">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formIsVip}
                      onChange={(e) => setFormIsVip(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <span className="text-white font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      VIP Dedicated Access
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formIsFreeNet}
                      onChange={(e) => setFormIsFreeNet(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <span className="text-white font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      Arab Free SIM Active
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formIsRecommended}
                      onChange={(e) => setFormIsRecommended(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <span className="text-white font-bold">
                      Recommended Badge
                    </span>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalMode(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold cursor-pointer shadow-lg shadow-amber-500/25 flex items-center gap-1.5"
                  >
                    {modalMode === 'add' ? (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'সার্ভার ডিপ্লয় করুন ➔' : 'Deploy Server Node ➔'}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'আপডেট সংরক্ষণ করুন ➔' : 'Save Changes ➔'}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* Super Admin: Edit Role & Credits Modal Dialog */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#050b18] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl">
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>{lang === 'bn' ? 'ব্যবহারকারীর রোল ও রিসেলার ক্রেডিট সেট করুন' : 'Assign Role & Reseller Credits'}</span>
              </h4>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">TARGET ACCOUNT</span>
                <span className="text-white font-bold">{editingUser.displayName}</span>
                <span className="text-cyan-400 block font-mono text-[11px]">{editingUser.email}</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">
                  {lang === 'bn' ? 'রোল নির্বাচন করুন (Assign Role)' : 'Select Role'}
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="user">User (সাধারণ গ্রাহক)</option>
                  <option value="reseller">Reseller (রিসেলার - নিজস্ব প্যানেল ও ব্যালেন্স পাবে)</option>
                  <option value="admin">Admin (এডমিন - ইউজার ম্যানেজমেন্ট এক্সেস)</option>
                  <option value="super_admin">Super Admin (মাস্টার ওনার)</option>
                </select>
              </div>

              {selectedRole === 'reseller' && (
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">
                    {lang === 'bn' ? 'রিসেলার ওয়ালেট ক্রেডিট (BDT)' : 'Reseller Wallet Credits (BDT)'}
                  </label>
                  <input
                    type="number"
                    value={allocatedCredits}
                    onChange={(e) => setAllocatedCredits(Number(e.target.value))}
                    placeholder="25000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <p className="text-[10px] text-amber-400 mt-1">
                    💡 এই ক্রেডিট দিয়ে রিসেলার তার আন্ডারে নতুন কাস্টমারদের VIP অ্যাকাউন্ট সক্রিয় করতে পারবে।
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveUserRole}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-black font-extrabold cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  Save Changes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Reseller Create Customer Modal */}
      {showCreateCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#050b18] border border-cyan-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl">
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'bn' ? 'নতুন কাস্টমার একাউন্ট তৈরি ও ভাউচার প্রদান' : 'Provision Customer VIP Account'}</span>
              </h4>
              <button
                onClick={() => setShowCreateCustomerModal(false)}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createdCustomerKey ? (
              <div className="text-center py-6 space-y-4 animate-fade-in">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="text-base font-bold text-white">
                    {lang === 'bn' ? 'কাস্টমার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' : 'Customer Account Created!'}
                  </h5>
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === 'bn' ? 'নিচের ভিআইপি মাস্টার কি-টি কাস্টমারকে সরবরাহ করুন:' : 'Deliver the generated VIP Master Token to customer:'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-amber-300 font-bold select-all truncate">
                    {createdCustomerKey}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdCustomerKey);
                      setCopiedData(true);
                      setTimeout(() => setCopiedData(false), 2000);
                    }}
                    className="p-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedData ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={() => setShowCreateCustomerModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleResellerCreateCustomer} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">
                    {lang === 'bn' ? 'কাস্টমারের নাম' : 'Customer Name'}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tariq Al-Mansoor"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">
                    {lang === 'bn' ? 'কাস্টমারের ইমেইল' : 'Customer Email'}
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">
                    {lang === 'bn' ? 'মোবাইল / হোয়াটসঅ্যাপ নম্বর' : 'Phone / WhatsApp'}
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+88017... or +9665..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">
                    {lang === 'bn' ? 'প্ল্যান নির্বাচন করুন' : 'Subscription Tier'}
                  </label>
                  <select
                    value={customerPlan}
                    onChange={(e) => setCustomerPlan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Sovereign VIP Lifetime">Sovereign VIP Lifetime (৳4,990)</option>
                    <option value="Cyber Pro 1-Year">Cyber Pro 1-Year (৳2,490)</option>
                    <option value="Gaming Turbo Monthly">Gaming Turbo Monthly (৳450)</option>
                    <option value="Quantum Elite Pass">Quantum Elite Pass (৳990)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateCustomerModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-black font-extrabold cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    Provision Account ➔
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
