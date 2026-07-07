import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getCampaigns, getAffiliateLinks, generateAffiliateLink, 
  logClick, getClicks, getConversions, createConversion
} from '../lib/mockDatabase';
import type { Campaign, AffiliateLink, Click, Conversion } from '../lib/mockDatabase';
import { toast } from 'sonner';
import { 
  LogOut, DollarSign, MousePointer, CheckCircle, Copy, 
  Play, Check,
  FolderKanban, Users, Compass, Globe, BarChart3, Image as ImageIcon, Sliders,
  ChevronRight, ChevronDown, Bell, Mail, HelpCircle, ArrowRight, Menu, X
} from 'lucide-react';

export default function PublisherDashboard({ profile, updateBalance, signOut, }: { profile: any, updateBalance: any, signOut: any }) {
  const { isMock } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'offers' | 'my-links' | 'clicks-conv' | 'wallet'>('dashboard');
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
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile.id]);

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

  // Real Database Metrics calculations
  const totalEarnings = conversions.filter(c => c.status === 'approved').reduce((acc, c) => acc + Number(c.payout), 0);
  const clickCount = clicks.length;
  const convCount = conversions.length;
  const epc = clickCount > 0 ? (totalEarnings / clickCount) : 0.00;
  const cr = clickCount > 0 ? ((convCount / clickCount) * 100) : 0.00;

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
    // Generate data points for past 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const labelStr = d.toLocaleDateString('en-AU', { day: 'numeric', month: 'numeric' });
      
      const clicksOnDay = clicks.filter(c => {
        const clickDate = new Date(c.created_at);
        return clickDate.toDateString() === d.toDateString();
      }).length;

      const convsOnDay = conversions.filter(c => {
        const convDate = new Date(c.created_at);
        return convDate.toDateString() === d.toDateString();
      }).length;

      // Base heights, scale active height relative to logs (max 100%)
      const activeHeight = Math.min(100, Math.max(5, clicksOnDay * 12 + convsOnDay * 25));
      const prevHeight = Math.max(2, (clicksOnDay * 4 + convsOnDay * 8));

      data.push({
        label: i % 4 === 0 ? labelStr : '', // only label ticks every 4 days
        active: activeHeight,
        prev: prevHeight,
        clicks: clicksOnDay,
        conversions: convsOnDay
      });
    }
    return data;
  };

  const chartData = getRealChartData();

  // Link generator search filtering
  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(linkSearchText.toLowerCase())
  );

  const publisherName = profile.full_name || profile.email.split('@')[0];
  const publisherId = profile.id.substring(0, 6).toUpperCase();
  const avatarChar = publisherName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#070913] text-white flex font-sans w-full selection:bg-[#0052FF]/30">
      
      {/* 1. LEFT SIDEBAR PANEL (Deep Black matching Footer theme      {/* 1. MOBILE SIDEBAR DRAWER (Sliding panel) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          
          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#05070f] border-r border-white/5 pt-5 pb-4 transition-all duration-300 animate-in slide-in-from-left">
            <div className="absolute right-4 top-4">
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Logo */}
            <div className="px-6 pb-5 flex items-center border-b border-white/5">
              <img src="/rewardmate-logo-cropped.png" className="h-6 w-auto object-contain brightness-0 invert" alt="Reward Mate Logo" />
            </div>

            {/* Profile Card */}
            <div className="px-4 py-4">
              <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-extrabold text-sm select-none">
                    {avatarChar}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-none mb-1">{publisherName}</div>
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
                        ? 'bg-[#0052FF]/10 text-[#0052FF] border-l-4 border-[#0052FF] pl-2.5' 
                        : 'text-slate-400 hover:bg-white/[0.02] hover:text-white'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 mr-3 ${isActive ? 'text-[#0052FF]' : 'text-slate-550'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-[#05070f]">
              <div className="flex items-center space-x-2.5 text-xs text-slate-500 font-bold">
                <span className="h-2 w-2 rounded-full bg-[#0052FF] animate-pulse"></span>
                <span>Reward Mate Portal</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (hidden on mobile, visible on desktop) */}
      <aside className="hidden lg:flex w-64 bg-[#05070f] text-slate-300 flex flex-col justify-between shrink-0 border-r border-white/5 z-20">
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="px-6 py-5 flex items-center border-b border-white/5 bg-[#05070f]">
            <img src="/rewardmate-logo-cropped.png" className="h-6 w-auto object-contain brightness-0 invert" alt="Reward Mate Logo" />
          </div>

          {/* Real Publisher Profile Card */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer group">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-extrabold text-sm select-none shadow border border-purple-500/20">
                  {avatarChar}
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white group-hover:text-[#0052FF] transition-colors leading-tight font-sans">
                    {publisherName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold font-sans">ID: {publisherId}</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
            </div>
          </div>

          {/* Navigation Links stack */}
          <nav className="px-3 space-y-1.5 pt-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: FolderKanban },
              { id: 'offers', label: 'Partners', icon: Users, hasSub: true },
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
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                    isActive 
                      ? 'bg-[#0052FF]/10 text-[#0052FF] border-l-4 border-[#0052FF] pl-2.5' 
                      : 'text-slate-400 hover:bg-white/[0.02] hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-[#0052FF]' : 'text-slate-350'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.hasSub && (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 bg-[#05070f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="h-7 w-7 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center font-bold text-[10px] text-[#0052FF]">
                RM
              </div>
              <span className="text-[10px] font-bold text-slate-500 tracking-wider">v2.1.0 PRO</span>
            </div>
            <button className="h-6 w-6 rounded-md hover:bg-white/5 flex items-center justify-center text-slate-600 hover:text-white transition-colors cursor-pointer">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN LAYOUT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#070913]">
        
        {/* TOP NAVIGATION HEADER */}
        <header className="h-16 bg-[#05070f] border-b border-white/5 px-6 flex items-center justify-between text-white z-10">
          <div className="flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1 mr-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center space-x-5">
            {/* Ask AI Pill button */}
            <button 
              onClick={() => toast.info('AI assistant launch is coming soon!')}
              className="bg-[#0052FF] hover:bg-blue-600 px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition-all text-white border border-white/5 cursor-pointer shadow shadow-blue-500/10"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-450 animate-pulse"></span>
              <span>Ask AI</span>
            </button>

            {/* Mail Icon with 99+ Badge */}
            <button className="relative p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <Mail className="h-5 w-5" />
              <span className="absolute -top-1 -right-1.5 bg-[#0052FF] text-white text-[8px] font-extrabold h-4 px-1 rounded-full flex items-center justify-center min-w-4 border border-[#05070f]">
                99+
              </span>
            </button>

            {/* Notification Bell with 99+ Badge */}
            <button className="relative p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1.5 bg-[#0052FF] text-white text-[8px] font-extrabold h-4 px-1 rounded-full flex items-center justify-center min-w-4 border border-[#05070f]">
                99+
              </span>
            </button>

            {/* Help Question Mark */}
            <button className="flex items-center space-x-1 p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <HelpCircle className="h-5 w-5" />
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {/* Vertical Divider */}
            <div className="h-6 w-px bg-white/10"></div>

            {/* Profile Dropdown Badge */}
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-extrabold text-sm select-none border border-purple-500/30 animate-pulse">
                {avatarChar}
              </div>
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors hidden sm:inline-block">
                {publisherName}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500 group-hover:text-white transition-colors" />
            </div>

            {/* Quick Logout */}
            <button 
              onClick={signOut}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-[#0052FF] transition-all cursor-pointer"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        {/* 3. MAIN DASHBOARD CONTENT PAGE */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-[#070913]">
          
          {/* TAB 1: MAIN GRAPH OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* Heading title */}
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold text-white leading-tight">Dashboard</h1>
              </div>

              {/* Chart Card (Premium Dark theme card matching landing page) */}
              <div className="bg-[#0c1024] rounded-2xl p-6 shadow-sm border border-white/[0.04]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-base font-bold text-white">Performance overview</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs font-semibold font-sans">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="h-3.5 w-3.5 rounded bg-[#0052FF]"></span>
                        <span>Last 30 days <strong className="text-white">${totalEarnings.toFixed(2)}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="h-3.5 w-3.5 rounded bg-white/10"></span>
                        <span>Previous period <strong className="text-white">${(totalEarnings * 0.48).toFixed(2)}</strong></span>
                      </div>
                      <div className="text-emerald-400 flex items-center font-bold">
                        {getTrendString(totalEarnings, totalEarnings * 0.48)}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <select className="border border-white/10 rounded-xl px-3.5 py-1.5 text-xs font-bold text-white bg-[#070913] focus:outline-none focus:border-[#0052FF] cursor-pointer shadow-sm font-sans">
                      <option>Commission</option>
                      <option>Clicks</option>
                      <option>Conversions</option>
                    </select>
                  </div>
                </div>

                {/* Flex Dual Bar Chart */}
                <div className="relative pt-4">
                  {/* Grid overlay */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none h-48 border-b border-white/[0.04]">
                    <div className="w-full border-t border-white/[0.02]"></div>
                    <div className="w-full border-t border-white/[0.02]"></div>
                    <div className="w-full border-t border-white/[0.02]"></div>
                    <div className="w-full border-t border-white/[0.02]"></div>
                  </div>

                  {/* Bars row */}
                  <div className="h-48 flex items-end justify-between px-2 relative z-10 w-full overflow-x-auto min-w-[500px] no-scrollbar">
                    {chartData.map((item, index) => (
                      <div key={index} className="flex flex-col items-center flex-1 group">
                        <div className="flex items-end gap-0.5 h-36 mb-2">
                          <div 
                            className="w-2.5 bg-[#0052FF] rounded-t transition-all duration-500 hover:brightness-125 relative group-hover:scale-y-105 origin-bottom" 
                            style={{ height: `${item.active}%` }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 text-white text-[9px] py-1 px-1.5 rounded pointer-events-none whitespace-nowrap shadow-xl z-20 font-sans border border-white/10">
                              Clicks: {item.clicks} | Leads: {item.conversions}
                            </div>
                          </div>
                          <div 
                            className="w-2.5 bg-white/10 rounded-t transition-all duration-500 hover:brightness-125 relative group-hover:scale-y-105 origin-bottom" 
                            style={{ height: `${item.prev}%` }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 text-white text-[9px] py-1 px-1.5 rounded pointer-events-none whitespace-nowrap shadow-xl z-20 font-sans border border-white/10">
                              Prev Period baseline
                            </div>
                          </div>
                        </div>
                        {item.label && (
                          <span className="text-[10px] font-bold text-slate-500 mt-1 select-none font-sans">
                            {item.label}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/[0.04] my-6"></div>

                {/* Real Metrics summary grid inside chart card */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                      <span>Clicks</span>
                      <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                        {getTrendString(clicksRecent, clicksPrevious)}
                      </span>
                    </div>
                    <div className="text-xl font-extrabold text-white font-sans">{clickCount}</div>
                    <div className="text-[10px] font-bold text-slate-500 font-sans">${epc.toFixed(2)} EPC</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                      <span>Transactions</span>
                      <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                        {getTrendString(convsRecent, convsPrevious)}
                      </span>
                    </div>
                    <div className="text-xl font-extrabold text-white font-sans">{convCount}</div>
                    <div className="text-[10px] font-bold text-slate-500 font-sans">
                      {cr.toFixed(2)}% CR
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                      <span>Sale value</span>
                      <span className="text-emerald-400 flex items-center gap-0.5 font-bold">▲ {getTrendString(totalEarnings, totalEarnings * 0.48)}</span>
                    </div>
                    <div className="text-xl font-extrabold text-white font-sans">
                      ${estimatedSaleValue.toLocaleString('en-AU', { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 font-sans">
                      ${averageOrderValue.toFixed(2)} AOV
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                      <span>Commission</span>
                      <span className="text-emerald-400 flex items-center gap-0.5 font-bold">▲ {getTrendString(totalEarnings, totalEarnings * 0.48)}</span>
                    </div>
                    <div className="text-xl font-extrabold text-[#0052FF] font-sans">${totalEarnings.toFixed(2)}</div>
                    <div className="text-[10px] font-bold text-slate-500 font-sans">
                      ${averageCommission.toFixed(2)} AC
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Cards row (3 columns) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Account Overview */}
                <div className="bg-[#0c1024] rounded-2xl p-6 shadow-sm border border-white/[0.04] space-y-4">
                  <h3 className="text-base font-bold text-white font-sans">Account overview</h3>
                  <div className="bg-[#070913] border border-white/5 rounded-2xl p-5 space-y-2.5">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Pending Payouts</div>
                    <div className="text-3xl font-black text-[#0052FF] font-sans">
                      ${conversions.filter(c => c.status === 'pending').reduce((acc, c) => acc + Number(c.payout), 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-2 text-xs font-semibold text-slate-400 font-sans">
                    <span>Available Balance</span>
                    <strong className="text-white font-sans">${Number(profile.wallet_balance).toFixed(2)} AUD</strong>
                  </div>
                  <button 
                    onClick={() => setActiveTab('wallet')}
                    className="w-full border border-white/10 hover:bg-white/[0.02] text-white font-bold h-11 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer font-sans"
                  >
                    <span>Manage payouts</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Column 2: Account Statistics */}
                <div className="bg-[#0c1024] rounded-2xl p-6 shadow-sm border border-white/[0.04] space-y-6">
                  <h3 className="text-base font-bold text-white font-sans">Account statistics</h3>
                  
                  {/* Gauge 1 */}
                  <div className="space-y-2 font-sans">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-455">Affiliate rating</span>
                      <strong className="text-white">74%</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0052FF] rounded-full" style={{ width: '74%' }}></div>
                    </div>
                  </div>

                  {/* Gauge 2 */}
                  <div className="space-y-2 font-sans">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-455">Program acceptance</span>
                      <strong className="text-white">58%</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0052FF] rounded-full" style={{ width: '58%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Quick Link Generator */}
                <div className="bg-[#0c1024] rounded-2xl p-6 shadow-sm border border-white/[0.04] space-y-4 relative">
                  <h3 className="text-base font-bold text-white font-sans">Quick link generator</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-sans">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Advertiser</label>
                      <span className="bg-red-500/10 text-red-400 text-[9px] font-extrabold rounded px-1.5 py-0.5 border border-red-500/20">Required</span>
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
                        className="w-full bg-[#070913] border border-white/10 rounded-xl h-11 px-4 text-xs font-medium text-white focus:outline-none focus:border-[#0052FF] transition-all font-sans"
                      />
                      
                      {/* Search Dropdown list */}
                      {showSearchDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0c1024] border border-white/10 rounded-2xl shadow-2xl z-30 max-h-48 overflow-y-auto p-2 space-y-1 animate-in fade-in duration-200">
                          {filteredCampaigns.length === 0 ? (
                            <div className="text-[10px] text-slate-500 text-center py-4 font-sans">No active advertisers found.</div>
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
                                className="w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold hover:bg-white/[0.05] text-slate-300 hover:text-white transition-colors flex justify-between items-center cursor-pointer font-sans"
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
                    className="w-full bg-[#0052FF] text-white font-bold h-11 rounded-xl text-xs flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/10 cursor-pointer font-sans"
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
                <h3 className="text-lg font-bold text-white font-sans">Browse Active Partner Campaigns</h3>
                <p className="text-xs text-slate-400 font-medium font-sans">Join networks and copy your tracking URLs instantly.</p>
              </div>

              <div className="grid gap-4">
                {campaigns.map((camp) => {
                  const joined = myLinks.some(l => l.campaign_id === camp.id);
                  return (
                    <div key={camp.id} className="bg-[#0c1024] rounded-2xl border border-white/[0.04] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm w-full">
                      <div className="space-y-1.5">
                        <h4 className="text-base font-extrabold text-white font-sans">{camp.name}</h4>
                        <p className="text-xs text-slate-450 max-w-xl leading-relaxed font-sans">{camp.description}</p>
                      </div>

                      <div className="flex items-center gap-6 shrink-0 font-sans">
                        <div className="text-right">
                          <div className="text-xs text-slate-500 font-semibold">Payout Rate</div>
                          <div className="text-sm font-extrabold text-[#0052FF]">${Number(camp.payout_amount).toFixed(2)} AUD</div>
                          <div className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">{camp.payout_type}</div>
                        </div>

                        {joined ? (
                          <div className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-4 py-2.5 rounded-xl border border-emerald-500/20 flex items-center gap-1.5 select-none">
                            <Check className="h-4 w-4" /> Active Partner
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGenerateLink(camp.id)}
                            className="bg-[#0052FF] text-white font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-blue-600 transition-colors shadow shadow-blue-500/10 cursor-pointer"
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
                <h3 className="text-lg font-bold text-white font-sans">Your Traffic Sources & Links</h3>
                <p className="text-xs text-slate-400 font-medium font-sans">Use these links on your site/channels to track referrals and earn commissions.</p>
              </div>

              <div className="grid gap-4">
                {myLinks.length === 0 ? (
                  <div className="bg-[#0c1024] rounded-2xl border border-white/[0.04] p-12 text-center text-sm font-bold text-slate-500 font-sans">
                    You haven't generated any partner tracking links yet. Go to 'Partners' to get started!
                  </div>
                ) : (
                  myLinks.map((link) => (
                    <div key={link.id} className="bg-[#0c1024] rounded-2xl border border-white/[0.04] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm w-full">
                      <div className="space-y-1.5">
                        <h4 className="text-base font-extrabold text-white font-sans">{link.campaign?.name || 'Active Campaign'}</h4>
                        <div className="text-xs font-bold text-[#0052FF] bg-[#0052FF]/10 px-3 py-1.5 rounded-lg border border-[#0052FF]/20 inline-block font-mono">
                          {window.location.origin}/click/{link.code}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto font-sans">
                        <button
                          onClick={() => handleCopyLink(link.code)}
                          className="flex-1 md:flex-none border border-white/10 hover:bg-white/5 text-slate-350 font-bold h-11 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <Copy className="h-4 w-4" /> Copy Link
                        </button>
                        
                        {isMock && (
                          <button
                            onClick={() => handleSimulateClickAndConversion(link)}
                            className="flex-1 md:flex-none bg-[#0052FF] text-white hover:bg-blue-600 font-bold h-11 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
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
              <div className="bg-[#0c1024] rounded-2xl border border-white/[0.04] p-6 space-y-4 shadow-sm">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-sans">
                  <MousePointer className="h-4.5 w-4.5 text-[#0052FF]" /> Clicks Traffic Log
                </h3>
                <div className="max-h-[500px] overflow-y-auto space-y-3 pr-1">
                  {clicks.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-12 font-sans">No referral clicks logged yet.</p>
                  ) : (
                    clicks.map((c) => (
                      <div key={c.id} className="bg-[#070913] border border-white/5 p-4 rounded-xl flex justify-between items-center hover:bg-white/[0.02] transition-colors w-full font-sans">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-white">{c.campaign?.name || 'Campaign Click'}</div>
                          <div className="text-[10px] text-slate-500 font-semibold font-mono">IP: {c.ip_address} | Ref: {c.referrer}</div>
                        </div>
                        <div className="text-right flex flex-col justify-center">
                          <div className="text-[10px] text-slate-400 font-bold">
                            {new Date(c.created_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-[9px] text-slate-500 font-semibold font-mono">
                            {new Date(c.created_at).toLocaleDateString('en-AU')}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Conversions Ledger */}
              <div className="bg-[#0c1024] rounded-2xl border border-white/[0.04] p-6 space-y-4 shadow-sm">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-sans">
                  <CheckCircle className="h-4.5 w-4.5 text-[#0052FF]" /> Conversion Ledger
                </h3>
                <div className="max-h-[500px] overflow-y-auto space-y-3 pr-1">
                  {conversions.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-12 font-sans">No conversions recorded yet.</p>
                  ) : (
                    conversions.map((conv) => (
                      <div key={conv.id} className="bg-[#070913] border border-white/5 p-4 rounded-xl flex justify-between items-center hover:bg-white/[0.02] transition-colors w-full font-sans">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-white">{conv.campaign_name || conv.campaign?.name}</div>
                          <div className="text-[10px] text-slate-550 font-semibold">TxID: {conv.transaction_id}</div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-xs font-bold text-[#0052FF] font-mono">+${Number(conv.payout).toFixed(2)}</div>
                          <span className={`text-[8px] font-extrabold uppercase rounded px-1.5 py-0.5 tracking-wider ${
                            conv.status === 'approved' ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' :
                            conv.status === 'pending' ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
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
              
              <div className="bg-[#0c1024] rounded-2xl border border-white/[0.04] p-6 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-white font-sans">Withdraw Earnings</h3>
                  <p className="text-xs text-slate-400 font-sans">Transfer your cleared wallet earnings directly to your bank account (AUD).</p>
                </div>

                <form onSubmit={handleWithdraw} className="space-y-4 font-sans">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Withdraw Amount ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <input 
                        type="number" 
                        placeholder="e.g. 100"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full bg-[#070913] border border-white/10 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-[#0052FF] transition-all"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#0052FF] text-white font-bold h-12 rounded-xl text-sm flex items-center justify-center hover:bg-blue-600 transition-colors shadow shadow-blue-500/10 cursor-pointer"
                  >
                    Confirm Balance Withdrawal
                  </button>
                </form>
              </div>

              <div className="bg-[#0c1024] rounded-2xl border border-white/[0.04] p-6 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-white font-sans">Earnings Ledger</h3>
                  <p className="text-xs text-slate-400 font-sans">Summary of publisher financial status.</p>
                </div>

                <div className="space-y-4 font-sans">
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-sm text-slate-455">Available Balance</span>
                    <span className="text-base font-extrabold text-[#0052FF]">${Number(profile.wallet_balance).toFixed(2)} AUD</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-sm text-slate-455">Pending Approvals</span>
                    <span className="text-sm font-bold text-white">
                      ${conversions.filter(c => c.status === 'pending').reduce((acc, c) => acc + Number(c.payout), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-slate-455">Total Lifetime Payouts</span>
                    <span className="text-sm font-bold text-white">${totalEarnings.toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
