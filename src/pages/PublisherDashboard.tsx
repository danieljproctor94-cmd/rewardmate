import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { 
  getCampaigns, getAffiliateLinks, generateAffiliateLink, 
  logClick, getClicks, getConversions, createConversion,
  getMessages, sendMessage
} from '../lib/mockDatabase';
import type { Campaign, AffiliateLink, Click, Conversion } from '../lib/mockDatabase';
import { toast } from 'sonner';
import { 
  LogOut, DollarSign, MousePointer, CheckCircle, Copy, 
  Play, Check,
  FolderKanban, Users, Compass, Globe, BarChart3, Image as ImageIcon, Sliders,
  ChevronRight, Bell, Mail, HelpCircle, ArrowRight, Menu, X
} from 'lucide-react';

export default function PublisherDashboard({ profile, updateBalance, signOut, }: { profile: any, updateBalance: any, signOut: any }) {
  const { isMock } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'offers' | 'my-links' | 'clicks-conv' | 'wallet' | 'messages'>('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [myLinks, setMyLinks] = useState<AffiliateLink[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Link Generator State
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [linkSearchText, setLinkSearchText] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedCampaignForModal, setSelectedCampaignForModal] = useState<Campaign | null>(null);

  const loadData = async () => {
    try {
      const camps = await getCampaigns();
      setCampaigns(camps.filter(c => c.status === 'active'));
      
      const links = await getAffiliateLinks(profile.id);
      setMyLinks(links);

      const clickLogs = await getClicks(profile.id);
      setClicks(clickLogs);

      const convs = await getConversions('publisher', profile.id);
      setConversions(convs);
      
      await loadMessages();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile.id]);

  // Auto scroll brand carousel
  useEffect(() => {
    const el = document.getElementById('brands-carousel-container');
    if (!el || campaigns.length === 0) return;

    // Width of one complete set of cards (160px card width + 16px gap = 176px)
    const setWidth = campaigns.length * 176;

    // Initialize position in the middle set
    el.scrollLeft = setWidth;

    const scrollStep = () => {
      // If we scroll past the second set, jump back to the first set seamlessly (without smooth behavior)
      if (el.scrollLeft >= setWidth * 2) {
        el.style.scrollBehavior = 'auto';
        el.scrollLeft = el.scrollLeft - setWidth;
      }
      
      // Perform the smooth scroll step
      setTimeout(() => {
        if (el) {
          el.style.scrollBehavior = 'smooth';
          el.scrollBy({ left: 176, behavior: 'smooth' });
        }
      }, 50);
    };

    const interval = setInterval(scrollStep, 3000);

    return () => clearInterval(interval);
  }, [campaigns]);

  const handleGenerateLink = async (campaignId: string) => {
    try {
      await generateAffiliateLink(profile.id, campaignId);
      toast.success('Affiliate tracking link generated successfully!');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCopyLink = (code: string) => {
    const trackingUrl = `${window.location.origin}/click/${code}`;
    navigator.clipboard.writeText(trackingUrl);
    toast.success('Tracking Link copied to clipboard!');
  };

  // Click & Conversion Simulator tool
  const handleSimulateClickAndConversion = async (link: AffiliateLink) => {
    try {
      await logClick(link.code);
      const triggerConv = Math.random() < 0.7;
      if (triggerConv) {
        const campaignPayout = link.campaign?.payout_amount || 25.00;
        await createConversion(link.code, campaignPayout);
        toast.success(`Click & Conversion Simulated! Payout of $${campaignPayout.toFixed(2)} logged.`);
      } else {
        toast.info('Click Simulated! (This hit did not convert).');
      }
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      toast.error('Please enter a valid withdrawal amount.');
      return;
    }
    if (Number(withdrawAmount) > Number(profile.wallet_balance)) {
      toast.error('Withdrawal amount exceeds your current wallet balance.');
      return;
    }

    try {
      await updateBalance(Number(withdrawAmount), 'withdrawal');
      setWithdrawAmount('');
      toast.success('Withdrawal request processed!');
      loadData();
    } catch (err) {}
  };

  const [messages, setMessages] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [searchContactText, setSearchContactText] = useState('');

  const loadMessages = async () => {
    try {
      const allMsgs = await getMessages(profile.id);
      setMessages(allMsgs);

      const targetRoles = profile.user_type === 'admin' 
        ? ['publisher', 'advertiser'] 
        : [profile.user_type === 'publisher' ? 'advertiser' : 'publisher', 'admin'];
      let fetchedContacts = [];
      if (!isMock) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('user_type', targetRoles);
        if (!error && data) {
          fetchedContacts = data;
        }
      } else {
        const stored = JSON.parse(localStorage.getItem('rewardmate_mock_profiles') || '[]');
        fetchedContacts = stored.filter((p: any) => targetRoles.includes(p.user_type));
      }
      setContacts(fetchedContacts);
      
      // Auto-select first contact if none selected
      if (fetchedContacts.length > 0 && !selectedContact) {
        setSelectedContact(fetchedContacts[0]);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'messages') {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab, profile.id, selectedContact]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedContact) return;

    try {
      await sendMessage({
        sender_id: profile.id,
        sender_name: profile.full_name || profile.email,
        receiver_id: selectedContact.id,
        receiver_name: selectedContact.full_name || selectedContact.email,
        subject: `Message to ${selectedContact.full_name || selectedContact.email}`,
        body: newMessageText
      });
      setNewMessageText('');
      loadMessages();
    } catch (err) {
      toast.error('Failed to send message.');
    }
  };

  // Real Database Metrics calculations
  const totalEarnings = conversions.filter(c => c.status === 'approved').reduce((acc, c) => acc + Number(c.payout), 0);
  const clickCount = clicks.length;
  const convCount = conversions.length;
  const epc = clickCount > 0 ? (totalEarnings / clickCount) : 0.00;
  const cr = clickCount > 0 ? ((convCount / clickCount) * 100) : 0.00;

  // Real Account Statistics Calculations
  const programAcceptanceRate = campaigns.length > 0 
    ? Math.round((myLinks.length / campaigns.length) * 100)
    : 0;

  const affiliateRating = clickCount > 0
    ? Math.min(100, Math.round(cr * 10) || Math.min(25, clickCount * 2))
    : 0;

  // Real Order Value estimation (assuming 10% average commission fee)
  const estimatedSaleValue = totalEarnings * 10;
  const averageOrderValue = convCount > 0 ? (estimatedSaleValue / convCount) : 0.00;
  const averageCommission = convCount > 0 ? (totalEarnings / convCount) : 0.00;

  // Real Click/Conversion Trend calculations (Compare first 15 days vs last 15 days of logs)
  const nowTime = Date.now();
  const fifteenDaysAgo = nowTime - 15 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = nowTime - 30 * 24 * 60 * 60 * 1000;

  const clicksRecent = clicks.filter(c => new Date(c.created_at).getTime() >= fifteenDaysAgo).length;
  const clicksPrevious = clicks.filter(c => {
    const t = new Date(c.created_at).getTime();
    return t >= thirtyDaysAgo && t < fifteenDaysAgo;
  }).length;

  const convsRecent = conversions.filter(c => new Date(c.created_at).getTime() >= fifteenDaysAgo).length;
  const convsPrevious = conversions.filter(c => {
    const t = new Date(c.created_at).getTime();
    return t >= thirtyDaysAgo && t < fifteenDaysAgo;
  }).length;

  const getTrendString = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? '▲ 100%' : '0%';
    const pct = ((curr - prev) / prev) * 100;
    return `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(1)}%`;
  };

  // Generate real chart data coordinates based on last 30 days of actual click logs
  const getRealChartData = () => {
    const data = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const labelStr = d.toLocaleDateString('en-AU', { day: 'numeric', month: 'numeric' });
      
      const clicksOnDay = clicks.filter(c => {
        const clickDate = new Date(c.created_at);
        return clickDate.toDateString() === d.toDateString();
      }).length;

      const commissionsOnDay = conversions.filter(c => {
        const convDate = new Date(c.created_at);
        return convDate.toDateString() === d.toDateString() && c.status === 'approved';
      }).reduce((s, c) => s + Number(c.payout), 0);

      data.push({
        label: i % 5 === 0 ? labelStr : '', 
        clicks: clicksOnDay,
        commissions: commissionsOnDay
      });
    }
    return data;
  };

  const chartData = getRealChartData();

  // Helper for generating cubic bezier wave paths for responsive SVG rendering
  const getBezierPath = (pts: {x: number, y: number}[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const maxClicks = Math.max(...chartData.map(d => d.clicks), 1);
  const maxCommissions = Math.max(...chartData.map(d => d.commissions), 1);

  const clicksPoints = chartData.map((d, idx) => ({
    x: (idx / 29) * 1000,
    y: d.clicks === 0 ? 175 : 165 - (d.clicks / maxClicks) * 140
  }));

  const commissionsPoints = chartData.map((d, idx) => ({
    x: (idx / 29) * 1000,
    y: d.commissions === 0 ? 175 : 165 - (d.commissions / maxCommissions) * 140
  }));

  const clicksLinePath = getBezierPath(clicksPoints);
  const clicksAreaPath = clicksPoints.length > 0 ? `${clicksLinePath} L 1000 175 L 0 175 Z` : '';

  const commissionsLinePath = getBezierPath(commissionsPoints);
  const commissionsAreaPath = commissionsPoints.length > 0 ? `${commissionsLinePath} L 1000 175 L 0 175 Z` : '';

  // Dynamic Notifications based on Conversions
  const liveNotifications = conversions.map(c => ({
    id: c.id,
    title: c.status === 'approved' ? 'Commission Approved' : c.status === 'rejected' ? 'Conversion Rejected' : 'Conversion Pending',
    text: `Campaign: ${c.campaign_name || 'Offer'}. Payout: $${Number(c.payout).toFixed(2)} AUD.`,
    time: new Date(c.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    type: c.status
  }));

  // Dynamic Messages
  const liveMessages = messages
    .filter(m => m.receiver_id === profile.id)
    .slice(-3)
    .reverse()
    .map(m => ({
      id: m.id,
      sender: m.sender_name,
      subject: m.subject,
      preview: m.body,
      time: new Date(m.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
    }));

  // Link generator search filtering
  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(linkSearchText.toLowerCase())
  );

  const publisherName = profile.full_name || profile.email.split('@')[0];
  const publisherId = profile.id.substring(0, 6).toUpperCase();
  const avatarChar = publisherName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden w-full bg-slate-50 text-slate-800 font-sans selection:bg-[#0052FF]/10">
      
      {/* 1. MOBILE SIDEBAR DRAWER (Sliding panel) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          
          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-slate-100 pt-5 pb-4 transition-all duration-300 animate-in slide-in-from-left">
            <div className="absolute right-4 top-4">
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Logo */}
            <div className="px-6 pb-5 flex items-center border-b border-slate-100">
              <img src="/rewardmate-logo-cropped.png" className="h-6 w-auto object-contain brightness-0" alt="Reward Mate Logo" />
            </div>

            {/* Profile Card */}
            <div className="px-4 py-4">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-purple-650 text-white flex items-center justify-center font-extrabold text-sm select-none shadow">
                    {avatarChar}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-850 leading-none mb-1">{publisherName}</div>
                    <div className="text-[9px] text-slate-500 font-bold">ID: {publisherId}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation stack */}
            <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto pt-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: FolderKanban },
                { id: 'offers', label: 'Partners', icon: Users },
                { id: 'my-links', label: 'Traffic Sources', icon: Globe },
                { id: 'clicks-conv', label: 'Reporting', icon: BarChart3 },
                { id: 'wallet', label: 'Finance', icon: DollarSign },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#0052FF]/5 text-[#0052FF] border-l-4 border-[#0052FF] pl-2.5' 
                        : 'text-slate-655 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 mr-3 ${isActive ? 'text-[#0052FF]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2.5 text-xs text-slate-500 font-bold">
                <span className="h-2 w-2 rounded-full bg-[#0052FF] animate-pulse"></span>
                <span>Reward Mate Portal</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Fixed Left Column - Never Scrolls with Content) */}
      <aside className="hidden lg:flex w-64 bg-[#090b16] flex-col justify-between shrink-0 h-full z-20">
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="px-6 py-5 flex items-center border-b border-white/5 bg-[#090b16]">
            <img src="/rewardmate-logo-cropped.png" className="h-6 w-auto object-contain brightness-0 invert" alt="Reward Mate Logo" />
          </div>

          {/* Real Publisher Profile Card */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group text-white">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-[#0052FF] text-white flex items-center justify-center font-extrabold text-sm select-none shadow border border-[#0052FF]/10">
                  {avatarChar}
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors leading-tight font-sans">
                    {publisherName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold font-sans">ID: {publisherId}</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-350 transition-colors" />
            </div>
          </div>

          {/* Navigation Links stack */}
          <nav className="px-3 space-y-1 pt-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: FolderKanban },
              { id: 'offers', label: 'Partners', icon: Users, hasSub: true },
              { id: 'messages', label: 'Messages', icon: Mail, hasSub: true },
              { id: 'opportunities', label: 'Opportunities', icon: Compass, hasSub: true },
              { id: 'my-links', label: 'Traffic Sources', icon: Globe, hasSub: true },
              { id: 'clicks-conv', label: 'Reporting', icon: BarChart3, hasSub: true },
              { id: 'creatives', label: 'Creatives', icon: ImageIcon, hasSub: true },
              { id: 'wallet', label: 'Finance', icon: DollarSign, hasSub: true },
              { id: 'settings', label: 'Account Settings', icon: Sliders, hasSub: true },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              const handleTabClick = () => {
                if (item.id === 'opportunities' || item.id === 'creatives' || item.id === 'settings') {
                  toast.info(`${item.label} section will be live in premium rollout.`);
                  setActiveTab('dashboard');
                } else {
                  setActiveTab(item.id as any);
                }
              };

              return (
                <button
                  key={item.id}
                  onClick={handleTabClick}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                    isActive 
                      ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.hasSub && (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-350" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 bg-[#090b16]">
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-[10px] text-white select-none shadow-sm">
                RM
              </div>
              <span className="text-[10px] font-bold text-slate-500 tracking-wider">v2.1.0 PRO</span>
            </div>
            <button className="h-6 w-6 rounded-md hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN LAYOUT CONTAINER (Header fixed, Main scrolls) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* TOP NAVIGATION HEADER (White theme header) */}
        <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1 mr-3 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-xs font-bold text-[#0052FF] bg-[#0052FF]/5 border border-[#0052FF]/10 px-2.5 py-1 rounded-full uppercase tracking-wider hidden sm:inline-block">
              Publisher Control
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Ask AI Pill button */}
            <button 
              onClick={() => toast.info('AI assistant launch is coming soon!')}
              className="bg-[#0052FF] hover:bg-blue-650 px-3 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 transition-all text-white cursor-pointer shadow-sm shadow-blue-500/10"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Ask AI</span>
            </button>
            <div className="relative">
              <button 
                onClick={() => {
                  setShowMessages(!showMessages);
                  setShowNotifications(false);
                }}
                title="Messages"
                className="relative p-1.5 text-slate-450 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <Mail className="h-4.5 w-4.5" />
                {liveMessages.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#0052FF] text-white text-[7px] font-black h-3 px-1 rounded-full flex items-center justify-center min-w-3 border border-white">
                    {liveMessages.length}
                  </span>
                )}
              </button>

              {showMessages && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 space-y-3 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 font-sans">Messages ({liveMessages.length})</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {liveMessages.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400 font-sans">No messages.</div>
                    ) : (
                      liveMessages.map(m => (
                        <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-left space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-800">{m.sender}</span>
                            <span className="text-[9px] text-slate-400 font-semibold">{m.time}</span>
                          </div>
                          <div className="text-[10px] font-bold text-[#0052FF] truncate font-sans">{m.subject}</div>
                          <p className="text-[10px] text-slate-650 font-sans leading-tight">{m.preview}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowMessages(false);
                }}
                title="Notifications"
                className="relative p-1.5 text-slate-450 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <Bell className="h-4.5 w-4.5" />
                {liveNotifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#0052FF] text-white text-[7px] font-black h-3 px-1 rounded-full flex items-center justify-center min-w-3 border border-white">
                    {liveNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 space-y-3 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 font-sans">Notifications ({liveNotifications.length})</span>
                    {liveNotifications.length > 0 && (
                      <button onClick={() => toast.success('Notifications cleared')} className="text-[10px] text-[#0052FF] font-bold hover:underline cursor-pointer">Clear all</button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {liveNotifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400 font-sans">No new notifications.</div>
                    ) : (
                      liveNotifications.map(n => (
                        <div key={n.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5 text-left">
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              n.type === 'approved' ? 'bg-emerald-500/10 text-emerald-600' : n.type === 'rejected' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'
                            }`}>
                              {n.title}
                            </span>
                            <span className="text-[9px] text-slate-400 font-semibold">{n.time}</span>
                          </div>
                          <p className="text-[10px] text-slate-650 font-medium font-sans leading-tight">{n.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Help Question Mark */}
            <button className="flex items-center space-x-1 p-1.5 text-slate-450 hover:text-slate-800 transition-colors cursor-pointer">
              <HelpCircle className="h-4.5 w-4.5" />
            </button>

            {/* Vertical Divider */}
            <div className="h-5 w-px bg-slate-200"></div>

            {/* Profile Dropdown Badge */}
            <div className="flex items-center space-x-2 cursor-pointer group">
              <div className="h-7 w-7 rounded-full bg-[#0052FF] text-white flex items-center justify-center font-extrabold text-xs select-none border border-[#0052FF]/10 shadow-sm">
                {avatarChar}
              </div>
              <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800 transition-colors hidden md:inline-block">
                {publisherName}
              </span>
            </div>

            {/* Quick Logout */}
            <button 
              onClick={signOut}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-450 hover:text-slate-800 transition-all cursor-pointer"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        {/* 3. MAIN SCROLLABLE SECTION (Restored to flat flat background) */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50">
          
          {/* TAB 1: MAIN GRAPH OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* Heading title */}
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">Dashboard</h1>
              </div>

              {/* Featured Brands Carousel */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans">Featured Brand Campaigns</h2>
                  <div className="flex space-x-1.5">
                    <button 
                      onClick={() => {
                        const el = document.getElementById('brands-carousel-container');
                        if (el) el.scrollBy({ left: -240, behavior: 'smooth' });
                      }}
                      className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shadow-sm"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => {
                        const el = document.getElementById('brands-carousel-container');
                        if (el) el.scrollBy({ left: 240, behavior: 'smooth' });
                      }}
                      className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shadow-sm"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div 
                  id="brands-carousel-container" 
                  className="flex gap-4 overflow-x-auto no-scrollbar pb-2 pt-1.5 px-3 scroll-smooth max-w-lg mx-auto bg-slate-50/50 border border-slate-100 rounded-2xl"
                >
                  {(campaigns.length > 0 ? [...campaigns, ...campaigns, ...campaigns] : []).map((camp, index) => {
                    const alreadyPartnered = myLinks.some(link => link.campaign_id === camp.id);
                    const initials = camp.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
                    const colors = [
                      'from-blue-600 to-indigo-600',
                      'from-orange-500 to-red-500',
                      'from-pink-500 to-purple-500',
                      'from-emerald-500 to-teal-500',
                      'from-cyan-500 to-blue-500'
                    ];
                    const grad = colors[camp.id.charCodeAt(camp.id.length - 1) % colors.length] || colors[0];

                    const commRate = (() => {
                      if (camp.id === 'campaign-1') return '5% Comm.';
                      if (camp.id === 'campaign-2') return '6% Comm.';
                      if (camp.id === 'campaign-3') return '7% Comm.';
                      if (camp.id === 'campaign-4') return '8% Comm.';
                      if (camp.id === 'campaign-5') return '10% Comm.';
                      if (camp.id === 'campaign-6') return '5% Comm.';
                      if (camp.id === 'campaign-7') return '10% Comm.';
                      const charCode = camp.id.charCodeAt(camp.id.length - 1) || 0;
                      return `${5 + (charCode % 4)}% Comm.`;
                    })();

                    return (
                      <div 
                        key={`${camp.id}-${index}`}
                        onClick={() => setSelectedCampaignForModal(camp)}
                        className="w-40 shrink-0 bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col items-center text-center space-y-3 relative overflow-hidden"
                      >
                        {/* Logo Circle */}
                        <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${grad} text-white flex items-center justify-center font-extrabold text-sm shadow-sm transition-transform group-hover:scale-105 duration-200`}>
                          {initials}
                        </div>

                        {/* Brand Details */}
                        <div className="w-full truncate">
                          <h4 className="text-[11px] font-black text-slate-800 truncate font-sans group-hover:text-[#0052FF] transition-colors">{camp.name}</h4>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Daniel Proctor</span>
                        </div>

                        {/* Commission Pill */}
                        <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100/50 px-2 py-0.5 rounded-lg inline-block">
                          {commRate}
                        </span>

                        {alreadyPartnered && (
                          <span className="absolute top-1.5 right-2 text-[7px] font-black uppercase text-emerald-600 bg-emerald-50 px-1 rounded-md border border-emerald-150">
                            Partner
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Performance overview</h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 mt-2 text-xs font-semibold font-sans">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="h-3 w-3 rounded-full bg-[#0052FF]"></span>
                        <span>Commissions: <strong className="text-slate-900 font-extrabold">${totalEarnings.toFixed(2)} AUD</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="h-3 w-3 rounded-full bg-[#38bdf8]"></span>
                        <span>Clicks: <strong className="text-slate-900 font-extrabold">{clickCount}</strong></span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="border border-slate-200 rounded-xl px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-505 bg-slate-50 font-sans">
                      Last 30 Days Trend
                    </div>
                  </div>
                </div>

                {/* Responsive SVG Wave Chart */}
                <div className="relative pt-4">
                  {/* Grid overlay */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none h-48 border-b border-slate-100">
                    <div className="w-full border-t border-slate-50"></div>
                    <div className="w-full border-t border-slate-50"></div>
                    <div className="w-full border-t border-slate-50"></div>
                    <div className="w-full border-t border-slate-50"></div>
                  </div>

                  <div className="h-48 relative z-10 w-full">
                    <svg viewBox="0 0 1000 180" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.00" />
                        </linearGradient>
                        <linearGradient id="commissionsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0052FF" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#0052FF" stopOpacity="0.00" />
                        </linearGradient>
                      </defs>

                      {/* Clicks Wave Area */}
                      {clicksAreaPath && (
                        <path d={clicksAreaPath} fill="url(#clicksGrad)" />
                      )}

                      {/* Commissions Wave Area */}
                      {commissionsAreaPath && (
                        <path d={commissionsAreaPath} fill="url(#commissionsGrad)" />
                      )}

                      {/* Clicks Stroke Line */}
                      {clicksLinePath && (
                        <path d={clicksLinePath} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                      )}

                      {/* Commissions Stroke Line */}
                      {commissionsLinePath && (
                        <path d={commissionsLinePath} fill="none" stroke="#0052FF" strokeWidth="2.5" strokeLinecap="round" />
                      )}
                    </svg>
                  </div>

                  {/* Day Labels at bottom */}
                  <div className="w-full flex justify-between px-1 mt-3">
                    {chartData.map((item, index) => (
                      <div key={index} className="flex-1 text-center">
                        {item.label && (
                          <span className="text-[9px] font-bold text-slate-400 select-none font-sans">
                            {item.label}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 my-6"></div>

                {/* Real Metrics summary grid inside chart card */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                      <span>Clicks</span>
                      <span className="text-emerald-600 flex items-center gap-0.5 font-bold">
                        {getTrendString(clicksRecent, clicksPrevious)}
                      </span>
                    </div>
                    <div className="text-xl font-extrabold text-slate-900 font-sans">{clickCount}</div>
                    <div className="text-[10px] font-bold text-slate-400 font-sans">${epc.toFixed(2)} EPC</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                      <span>Transactions</span>
                      <span className="text-emerald-600 flex items-center gap-0.5 font-bold">
                        {getTrendString(convsRecent, convsPrevious)}
                      </span>
                    </div>
                    <div className="text-xl font-extrabold text-slate-900 font-sans">{convCount}</div>
                    <div className="text-[10px] font-bold text-slate-400 font-sans">
                      {cr.toFixed(2)}% CR
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                      <span>Sale value</span>
                      <span className="text-emerald-600 flex items-center gap-0.5 font-bold">▲ {getTrendString(totalEarnings, totalEarnings * 0.48)}</span>
                    </div>
                    <div className="text-xl font-extrabold text-slate-900 font-sans">
                      ${estimatedSaleValue.toLocaleString('en-AU', { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 font-sans">
                      ${averageOrderValue.toFixed(2)} AOV
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                      <span>Commission</span>
                      <span className="text-emerald-600 flex items-center gap-0.5 font-bold">▲ {getTrendString(totalEarnings, totalEarnings * 0.48)}</span>
                    </div>
                    <div className="text-xl font-extrabold text-[#0052FF] font-sans">${totalEarnings.toFixed(2)}</div>
                    <div className="text-[10px] font-bold text-slate-400 font-sans">
                      ${averageCommission.toFixed(2)} AC
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Cards row (3 columns) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Account Overview */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <h3 className="text-base font-bold text-slate-800 font-sans">Account overview</h3>
                  <div className="bg-[#0052FF]/5 border border-[#0052FF]/10 rounded-2xl p-5 space-y-2.5">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Pending Payouts</div>
                    <div className="text-3xl font-black text-[#0052FF] font-sans">
                      ${conversions.filter(c => c.status === 'pending').reduce((acc, c) => acc + Number(c.payout), 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-2 text-xs font-semibold text-slate-500 font-sans">
                    <span>Available Balance</span>
                    <strong className="text-slate-800 font-sans">${Number(profile.wallet_balance).toFixed(2)} AUD</strong>
                  </div>
                  <button 
                    onClick={() => setActiveTab('wallet')}
                    className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold h-11 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer font-sans"
                  >
                    <span>Manage payouts</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Column 2: Account Statistics */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                  <h3 className="text-base font-bold text-slate-800 font-sans">Account statistics</h3>
                  
                  {/* Gauge 1 */}
                  <div className="space-y-2 font-sans">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Affiliate rating</span>
                      <strong className="text-slate-850">{affiliateRating}%</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0052FF] rounded-full transition-all duration-500" style={{ width: `${affiliateRating}%` }}></div>
                    </div>
                  </div>

                  {/* Gauge 2 */}
                  <div className="space-y-2 font-sans">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Program acceptance</span>
                      <strong className="text-slate-850">{programAcceptanceRate}%</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0052FF] rounded-full transition-all duration-500" style={{ width: `${programAcceptanceRate}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Quick Link Generator */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4 relative">
                  <h3 className="text-base font-bold text-slate-800 font-sans">Quick link generator</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-sans">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Advertiser</label>
                      <span className="bg-red-500/10 text-red-600 text-[9px] font-extrabold rounded px-1.5 py-0.5 border border-red-500/10">Required</span>
                    </div>
                    
                    {/* Search Field */}
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Start typing to see a list of advertisers"
                        value={linkSearchText}
                        onChange={(e) => {
                          setLinkSearchText(e.target.value);
                          setShowSearchDropdown(true);
                        }}
                        onFocus={() => setShowSearchDropdown(true)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all font-sans"
                      />
                      
                      {/* Search Dropdown list */}
                      {showSearchDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-250 rounded-2xl shadow-xl z-30 max-h-48 overflow-y-auto p-2 space-y-1 animate-in fade-in duration-200">
                          {filteredCampaigns.length === 0 ? (
                            <div className="text-[10px] text-slate-400 text-center py-4 font-sans">No active advertisers found.</div>
                          ) : (
                            filteredCampaigns.map((camp) => (
                              <button
                                key={camp.id}
                                type="button"
                                onClick={() => {
                                  setSelectedCampaignId(camp.id);
                                  setLinkSearchText(camp.name);
                                  setShowSearchDropdown(false);
                                }}
                                className="w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors flex justify-between items-center cursor-pointer font-sans"
                              >
                                <span>{camp.name}</span>
                                <span className="text-[9px] font-extrabold text-[#0052FF]">${Number(camp.payout_amount).toFixed(2)} Payout</span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedCampaignId) {
                        toast.error('Please select an active advertiser from the search list.');
                        return;
                      }
                      handleGenerateLink(selectedCampaignId);
                      setSelectedCampaignId('');
                      setLinkSearchText('');
                    }}
                    className="w-full bg-[#0052FF] text-white font-bold h-11 rounded-xl text-xs flex items-center justify-center hover:bg-blue-650 transition-colors shadow-sm cursor-pointer font-sans"
                  >
                    Generate Tracking Link
                  </button>
                </div>

              </div>
            </>
          )}

          {/* TAB 2: FIND OFFERS (PARTNERS) */}
          {activeTab === 'offers' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="text-lg font-bold text-slate-800 font-sans">Browse Active Partner Campaigns</h3>
                <p className="text-xs text-slate-500 font-medium font-sans">Join networks and copy your tracking URLs instantly.</p>
              </div>

              <div className="grid gap-4">
                {campaigns.map((camp) => {
                  const joined = myLinks.some(l => l.campaign_id === camp.id);
                  return (
                    <div key={camp.id} className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm w-full">
                      <div className="space-y-1.5">
                        <h4 className="text-base font-extrabold text-slate-800 font-sans">{camp.name}</h4>
                        <p className="text-xs text-slate-500 max-w-xl leading-relaxed font-sans">{camp.description}</p>
                      </div>

                      <div className="flex items-center gap-6 shrink-0 font-sans">
                        <div className="text-right">
                          <div className="text-xs text-slate-400 font-semibold">Payout Rate</div>
                          <div className="text-sm font-extrabold text-[#0052FF]">${Number(camp.payout_amount).toFixed(2)} AUD</div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{camp.payout_type}</div>
                        </div>

                        {joined ? (
                          <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-emerald-100 flex items-center gap-1.5 select-none">
                            <Check className="h-4 w-4" /> Active Partner
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGenerateLink(camp.id)}
                            className="bg-[#0052FF] text-white font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-blue-650 transition-colors shadow-sm cursor-pointer"
                          >
                            Get tracking code
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: MY AFFILIATE LINKS (TRAFFIC SOURCES) */}
          {activeTab === 'my-links' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="text-lg font-bold text-slate-800 font-sans">Your Traffic Sources & Links</h3>
                <p className="text-xs text-slate-500 font-medium font-sans">Use these links on your site/channels to track referrals and earn commissions.</p>
              </div>

              <div className="grid gap-4">
                {myLinks.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-sm font-bold text-slate-450 font-sans">
                    You haven't generated any partner tracking links yet. Go to 'Partners' to get started!
                  </div>
                ) : (
                  myLinks.map((link) => (
                    <div key={link.id} className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm w-full">
                      <div className="space-y-1.5">
                        <h4 className="text-base font-extrabold text-slate-800 font-sans">{link.campaign?.name || 'Active Campaign'}</h4>
                        <div className="text-xs font-bold text-[#0052FF] bg-[#0052FF]/5 px-3 py-1.5 rounded-lg border border-[#0052FF]/10 inline-block font-mono">
                          {window.location.origin}/click/{link.code}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto font-sans">
                        <button
                          onClick={() => handleCopyLink(link.code)}
                          className="flex-1 md:flex-none border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold h-11 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <Copy className="h-4 w-4" /> Copy Link
                        </button>
                        
                        {isMock && (
                          <button
                            onClick={() => handleSimulateClickAndConversion(link)}
                            className="flex-1 md:flex-none bg-[#0052FF] text-white hover:bg-blue-650 font-bold h-11 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
                          >
                            <Play className="h-4 w-4" /> Simulate Lead
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TRAFFIC & CONVERSION LOGS (REPORTING) */}
          {activeTab === 'clicks-conv' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
              
              {/* Traffic Click Logs */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2 font-sans">
                  <MousePointer className="h-4.5 w-4.5 text-[#0052FF]" /> Clicks Traffic Log
                </h3>
                <div className="max-h-[500px] overflow-y-auto space-y-3 pr-1">
                  {clicks.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-12 font-sans">No referral clicks logged yet.</p>
                  ) : (
                    clicks.map((c) => (
                      <div key={c.id} className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl flex justify-between items-center hover:bg-slate-50 transition-colors w-full font-sans">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-800">{c.campaign?.name || 'Campaign Click'}</div>
                          <div className="text-[10px] text-slate-400 font-semibold font-mono">IP: {c.ip_address} | Ref: {c.referrer}</div>
                        </div>
                        <div className="text-right flex flex-col justify-center">
                          <div className="text-[10px] text-slate-500 font-bold">
                            {new Date(c.created_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-[9px] text-slate-400 font-semibold font-mono">
                            {new Date(c.created_at).toLocaleDateString('en-AU')}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Conversions Ledger */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2 font-sans">
                  <CheckCircle className="h-4.5 w-4.5 text-[#0052FF]" /> Conversion Ledger
                </h3>
                <div className="max-h-[500px] overflow-y-auto space-y-3 pr-1">
                  {conversions.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-12 font-sans">No conversions recorded yet.</p>
                  ) : (
                    conversions.map((conv) => (
                      <div key={conv.id} className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl flex justify-between items-center hover:bg-slate-50 transition-colors w-full font-sans">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-800">{conv.campaign_name || conv.campaign?.name}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">TxID: {conv.transaction_id}</div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-xs font-bold text-[#0052FF] font-mono">+${Number(conv.payout).toFixed(2)}</div>
                          <span className={`text-[8px] font-extrabold uppercase rounded px-1.5 py-0.5 tracking-wider ${
                            conv.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            conv.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {conv.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: FINANCE WITH-DRAW WALLET */}
          {activeTab === 'wallet' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
              
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 font-sans">Withdraw Earnings</h3>
                  <p className="text-xs text-slate-500 font-sans">Transfer your cleared wallet earnings directly to your bank account (AUD).</p>
                </div>

                <form onSubmit={handleWithdraw} className="space-y-4 font-sans">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Withdraw Amount ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        type="number" 
                        placeholder="e.g. 100"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] transition-all"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#0052FF] text-white font-bold h-12 rounded-xl text-sm flex items-center justify-center hover:bg-blue-650 transition-colors shadow-sm cursor-pointer"
                  >
                    Confirm Balance Withdrawal
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 font-sans">Earnings Ledger</h3>
                  <p className="text-xs text-slate-500 font-sans">Summary of publisher financial status.</p>
                </div>

                <div className="space-y-4 font-sans">
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">Available Balance</span>
                    <span className="text-base font-extrabold text-[#0052FF]">${Number(profile.wallet_balance).toFixed(2)} AUD</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">Pending Approvals</span>
                    <span className="text-sm font-bold text-slate-800">
                      ${conversions.filter(c => c.status === 'pending').reduce((acc, c) => acc + Number(c.payout), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-slate-500">Total Lifetime Payouts</span>
                    <span className="text-sm font-bold text-slate-800">${totalEarnings.toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: MESSAGES SECTION */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-[550px] flex animate-in fade-in duration-300">
              
              {/* Left Panel: Contacts list */}
              <div className="w-80 border-r border-slate-100 flex flex-col h-full bg-slate-50/30">
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-100">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search partner brands..."
                      value={searchContactText}
                      onChange={(e) => setSearchContactText(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl h-10 px-3.5 pl-9 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0052FF] transition-all font-sans"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Contacts Stream */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
                  {contacts.filter(c => (c.full_name || c.email).toLowerCase().includes(searchContactText.toLowerCase())).length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-400 font-sans font-semibold">No contacts found.</div>
                  ) : (
                    contacts.filter(c => (c.full_name || c.email).toLowerCase().includes(searchContactText.toLowerCase())).map((c) => {
                      const isSelected = selectedContact?.id === c.id;
                      const cInitials = (c.full_name || c.email).split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();
                      const lastMessage = messages
                        .filter(m => (m.sender_id === profile.id && m.receiver_id === c.id) || (m.sender_id === c.id && m.receiver_id === profile.id))
                        .pop();

                      return (
                        <div 
                          key={c.id}
                          onClick={() => setSelectedContact(c)}
                          className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-[#0052FF]/5 border border-[#0052FF]/10 text-[#0052FF]' 
                              : 'hover:bg-slate-50 border border-transparent text-slate-700'
                          }`}
                        >
                          <div className={`h-9 w-9 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 text-slate-750 flex items-center justify-center font-extrabold text-xs shadow-sm uppercase ${
                            isSelected ? 'from-[#0052FF] to-blue-600 text-white' : ''
                          }`}>
                            {cInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold truncate font-sans">{c.full_name || c.email}</h4>
                              {lastMessage && (
                                <span className="text-[8px] text-slate-400 font-medium">
                                  {new Date(lastMessage.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 truncate font-sans font-medium mt-0.5">
                              {lastMessage ? lastMessage.body : 'Start a new conversation'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Panel: Chat Thread */}
              <div className="flex-1 flex flex-col h-full bg-white">
                {selectedContact ? (
                  <>
                    {/* Thread Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/20">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#0052FF] to-blue-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm uppercase">
                        {(selectedContact.full_name || selectedContact.email).split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-slate-800 leading-none mb-0.5">{selectedContact.full_name || selectedContact.email}</h3>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{selectedContact.user_type}</span>
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/10 no-scrollbar">
                      {messages.filter(m => (m.sender_id === profile.id && m.receiver_id === selectedContact.id) || (m.sender_id === selectedContact.id && m.receiver_id === profile.id)).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                          <Mail className="h-8 w-8 text-slate-300" />
                          <p className="text-xs font-bold font-sans">No messages yet. Send a message to start partnership chat!</p>
                        </div>
                      ) : (
                        messages.filter(m => (m.sender_id === profile.id && m.receiver_id === selectedContact.id) || (m.sender_id === selectedContact.id && m.receiver_id === profile.id)).map((m) => {
                          const isMe = m.sender_id === profile.id;
                          return (
                            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                              <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-xs shadow-sm leading-relaxed ${
                                isMe 
                                  ? 'bg-[#0052FF] text-white rounded-tr-none' 
                                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-150'
                              }`}>
                                <p className="font-sans font-medium">{m.body}</p>
                                <div className={`text-[8px] mt-1 font-semibold ${isMe ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
                                  {new Date(m.created_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Text Input area */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex items-center space-x-3 bg-white">
                      <input 
                        type="text" 
                        placeholder="Type your message here..."
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all font-sans"
                      />
                      <button 
                        type="submit"
                        className="bg-[#0052FF] hover:bg-blue-650 text-white font-bold h-11 px-5 rounded-xl text-xs transition-colors flex items-center justify-center cursor-pointer shadow-sm shadow-blue-500/10"
                      >
                        Send
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <Mail className="h-10 w-10 text-slate-300" />
                    <p className="text-xs font-bold font-sans">Select a partner brand to view conversation.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Brand Partnership details Modal */}
      {selectedCampaignForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in scale-in duration-205 border border-slate-100">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0052FF] to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
                  {selectedCampaignForModal.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 leading-none mb-1">{selectedCampaignForModal.name}</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{selectedCampaignForModal.advertiser_name || 'Partner Brand'}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCampaignForModal(null)}
                className="h-8 w-8 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-450 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[380px] overflow-y-auto no-scrollbar">
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</h4>
                <p className="text-xs text-slate-650 font-sans leading-relaxed">{selectedCampaignForModal.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-3.5">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Commission Rate</h4>
                  <div className="text-sm font-extrabold text-[#0052FF] mt-0.5">${selectedCampaignForModal.payout_amount.toFixed(2)} AUD</div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payout Type</h4>
                  <div className="text-sm font-extrabold text-slate-800 mt-0.5 uppercase">{selectedCampaignForModal.payout_type === 'cpa' ? 'Cost Per Action (CPA)' : selectedCampaignForModal.payout_type === 'cpc' ? 'Cost Per Click (CPC)' : 'Revenue Share'}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Campaign Guidelines</h4>
                <div className="space-y-1.5 font-sans">
                  <div className="flex items-center text-[11px] text-slate-650 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2"></span>
                    <span>Allowed Traffic: Blogs, Social, Email</span>
                  </div>
                  <div className="flex items-center text-[11px] text-slate-650 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2"></span>
                    <span>Cookie Duration: 30 Days</span>
                  </div>
                  <div className="flex items-center text-[11px] text-slate-650 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2"></span>
                    <span>No SEM/Trademark search bidding allowed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {myLinks.some(l => l.campaign_id === selectedCampaignForModal.id) ? (
                <>
                  <div className="text-[10px] font-bold text-slate-500 font-sans">You are partnered.</div>
                  <button 
                    onClick={() => {
                      const link = myLinks.find(l => l.campaign_id === selectedCampaignForModal.id);
                      if (link) handleCopyLink(link.code);
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm"
                  >
                    Copy Tracking Link
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setSelectedCampaignForModal(null)}
                    className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      await handleGenerateLink(selectedCampaignForModal.id);
                      setSelectedCampaignForModal(null);
                    }}
                    className="px-5 py-2.5 bg-[#0052FF] hover:bg-blue-650 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm"
                  >
                    Apply & Join Program
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
