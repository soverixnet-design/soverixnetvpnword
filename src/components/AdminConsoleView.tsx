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
  CheckCircle2
} from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth, UserProfileData, UserRole } from '../firebase/AuthContext';
import { ServerManager } from '../services/serverManager';
import { VPNServer, ServerRegion, VPNProtocol, ServerCapability } from '../types';

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
    updateUserRoleAndCredits 
  } = useAuth();

  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'servers' | 'sheets'>('servers');
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
              {lang === 'bn' ? 'সার্ভার নোড ফ্লিট ও ওনার এডমিন প্যানেল' : 'Server Fleet & Global Node Operations'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {lang === 'bn' 
                ? 'রিয়েল-টাইমে নতুন হাই-স্পিড সার্ভার নোড তৈরি করুন, যেকোনো সার্ভারের আইপি ও কনফিগ এডিট করুন, ইউজারদের VIP এক্সেস ও গুগল শিট সিঙ্ক পরিচালনা করুন।' 
                : 'Dynamically add, modify, or remove VPN server nodes with instant network propagation across all client interfaces.'}
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

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('servers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'servers'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>{lang === 'bn' ? 'সার্ভার নোড কন্ট্রোল ও ফ্লিট ম্যানেজার' : 'Server Nodes Fleet & CRUD'} ({serverList.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'users'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{lang === 'bn' ? 'ইউজার ও রিসেলার তালিকা' : 'Users & Resellers'} ({usersList.length})</span>
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveAdminTab('sheets')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'sheets'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{lang === 'bn' ? 'গুগল শিট সিঙ্ক ওয়েবহুক' : 'Google Sheets Webhook'}</span>
          </button>
        )}
      </div>

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
