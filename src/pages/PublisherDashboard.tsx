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
  ChevronRight, ChevronDown, Bell, Mail, HelpCircle, ArrowRight
} from 'lucide-react';

export default function PublisherDashboard({ profile, updateBalance, signOut, }: { profile: any, updateBalance: any, signOut: any }) {
  const { isMock } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'offers' | 'my-links' | 'clicks-conv' | 'wallet'>('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [myLinks, setMyLinks] = useState<AffiliateLink[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
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
        await createConversion(`click-${Date.now()}`, campaignPayout);
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

  // Metrics
  const totalEarnings = conversions.filter(c => c.status === 'approved').reduce((acc, c) => acc + Number(c.payout), 0);
  const clickCount = clicks.length;
  const convCount = conversions.length;
  const epc = clickCount > 0 ? (totalEarnings / clickCount) : 0.00;

  // Chart Data (Mock data points that mimic the exact height distribution in the mockup)
  const chartData = [
    { label: '8/06', active: 60, prev: 35 },
    { label: '', active: 30, prev: 20 },
    { label: '', active: 35, prev: 40 },
    { label: '11/06', active: 70, prev: 30 },
    { label: '', active: 40, prev: 45 },
    { label: '', active: 20, prev: 15 },
    { label: '14/06', active: 15, prev: 10 },
    { label: '', active: 10, prev: 25 },
    { label: '', active: 12, prev: 18 },
    { label: '17/06', active: 20, prev: 22 },
    { label: '', active: 15, prev: 30 },
    { label: '', active: 32, prev: 40 },
    { label: '20/06', active: 28, prev: 25 },
    { label: '', active: 30, prev: 15 },
    { label: '', active: 85, prev: 40 },
    { label: '23/06', active: 15, prev: 12 },
    { label: '', active: 8, prev: 5 },
    { label: '', active: 30, prev: 10 },
    { label: '26/06', active: 8, prev: 5 },
    { label: '', active: 90, prev: 55 },
    { label: '', active: 45, prev: 50 },
    { label: '29/06', active: 75, prev: 80 },
    { label: '', active: 50, prev: 45 },
    { label: '', active: 10, prev: 8 },
    { label: '2/07', active: 5, prev: 4 },
    { label: '', active: 8, prev: 12 },
    { label: '', active: 10, prev: 15 },
    { label: '5/07', active: 5, prev: 10 },
  ];

  // Link generator search filtering
  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(linkSearchText.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f3f6f9] text-slate-800 flex font-sans w-full">
      
      {/* 1. LEFT SIDEBAR PANEL (Deep Dark Slate) */}
      <aside className="w-64 bg-[#1a2536] text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800/80 z-20">
        <div className="flex flex-col">
          {/* Cog/Gears Logo */}
          <div className="px-6 py-5 flex items-center space-x-3.5 border-b border-slate-800/60 bg-[#16202f]">
            <div className="h-8 w-8 bg-[#00a8e8] rounded-xl flex items-center justify-center text-white shadow shadow-blue-500/20">
              <svg className="h-5 w-5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="font-extrabold text-sm tracking-wide text-white">REWARD MATE</span>
          </div>

          {/* Publisher Card Selection */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 transition-all cursor-pointer group">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-extrabold text-sm select-none shadow">
                  W
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white group-hover:text-[#00a8e8] transition-colors leading-tight font-sans">Student Wow Deals</div>
                  <div className="text-[10px] text-slate-500 font-semibold font-sans">(19798)</div>
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
              
              // Map placeholder views to Dashboard to prevent dead menus
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
                      ? 'bg-blue-600/10 text-[#00a8e8] border-l-4 border-[#00a8e8] pl-2.5' 
                      : 'text-slate-400 hover:bg-slate-900/30 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-[#00a8e8]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.hasSub && (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/40 bg-[#16202f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-[#00a8e8]">
                RM
              </div>
              <span className="text-[10px] font-bold text-slate-500 tracking-wider">v2.1.0 PRO</span>
            </div>
            <button className="h-6 w-6 rounded-md hover:bg-slate-800 flex items-center justify-center text-slate-600 hover:text-white transition-colors cursor-pointer">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN LAYOUT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP NAVIGATION HEADER (Deep Dark Slate matching Navbar height) */}
        <header className="h-16 bg-[#1a2536] border-b border-slate-850 px-6 flex items-center justify-between text-white z-10">
          <div className="flex items-center">
            <span className="text-xs font-semibold text-[#00a8e8] bg-blue-500/10 border border-[#00a8e8]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Publisher Portal
            </span>
          </div>

          <div className="flex items-center space-x-5">
            {/* Nexus Pro Pill */}
            <div className="relative group cursor-pointer">
              <div className="bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 transition-all text-white border border-white/5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Nexus Pro</span>
                <span className="text-xs font-bold text-[#00a8e8]">+</span>
              </div>
            </div>

            {/* Mail Icon with 99+ Badge */}
            <button className="relative p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <Mail className="h-5 w-5" />
              <span className="absolute -top-1 -right-1.5 bg-[#ea4335] text-white text-[8px] font-extrabold h-4 px-1 rounded-full flex items-center justify-center min-w-4 border border-[#1a2536]">
                99+
              </span>
            </button>

            {/* Notification Bell with 99+ Badge */}
            <button className="relative p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1.5 bg-[#ea4335] text-white text-[8px] font-extrabold h-4 px-1 rounded-full flex items-center justify-center min-w-4 border border-[#1a2536]">
                99+
              </span>
            </button>

            {/* Help Question Mark */}
            <button className="flex items-center space-x-1 p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <HelpCircle className="h-5 w-5" />
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {/* Vertical Divider */}
            <div className="h-6 w-px bg-slate-800"></div>

            {/* Profile Dropdown Badge */}
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-extrabold text-sm select-none border border-purple-500/30">
                W
              </div>
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors hidden sm:inline-block">
                {profile.full_name || 'Daniel Proctor'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500 group-hover:text-white transition-colors" />
            </div>

            {/* Quick Logout */}
            <button 
              onClick={signOut}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        {/* 3. MAIN DASHBOARD CONTENT PAGE */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* TAB 1: MAIN GRAPH OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* Heading title */}
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">Dashboard</h1>
              </div>

              {/* Chart Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 font-sans">Performance overview</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs font-semibold font-sans">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span className="h-3.5 w-3.5 rounded bg-[#00a8e8]"></span>
                        <span>Last 30 days <strong className="text-slate-700">${totalEarnings.toFixed(0)}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span className="h-3.5 w-3.5 rounded bg-[#dbe2e9]"></span>
                        <span>Previous period <strong className="text-slate-700">${(totalEarnings * 0.48).toFixed(0)}</strong></span>
                      </div>
                      <div className="text-emerald-500 flex items-center font-bold">
                        ▲ 106.41%
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <select className="border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm font-sans">
                      <option>Commission</option>
                      <option>Clicks</option>
                      <option>Conversions</option>
                    </select>
                  </div>
                </div>

                {/* Flex Dual Bar Chart */}
                <div className="relative pt-4">
                  {/* Grid overlay */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none h-48 border-b border-slate-100">
                    <div className="w-full border-t border-slate-100/80"></div>
                    <div className="w-full border-t border-slate-100/80"></div>
                    <div className="w-full border-t border-slate-100/80"></div>
                    <div className="w-full border-t border-slate-100/80"></div>
                  </div>

                  {/* Bars row */}
                  <div className="h-48 flex items-end justify-between px-2 relative z-10 w-full overflow-x-auto min-w-[500px] no-scrollbar">
                    {chartData.map((item, index) => (
                      <div key={index} className="flex flex-col items-center flex-1 group">
                        <div className="flex items-end gap-0.5 h-36 mb-2">
                          <div 
                            className="w-2.5 bg-[#00a8e8] rounded-t transition-all duration-500 hover:brightness-95 relative group-hover:scale-y-105 origin-bottom" 
                            style={{ height: `${item.active}%` }}
                            title={`Last 30 days: ${item.active}%`}
                          >
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 text-white text-[9px] py-1 px-1.5 rounded pointer-events-none whitespace-nowrap shadow z-20 font-sans">
                              Active: {item.active}%
                            </div>
                          </div>
                          <div 
                            className="w-2.5 bg-[#dbe2e9] rounded-t transition-all duration-500 hover:brightness-95 relative group-hover:scale-y-105 origin-bottom" 
                            style={{ height: `${item.prev}%` }}
                            title={`Previous period: ${item.prev}%`}
                          >
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 text-white text-[9px] py-1 px-1.5 rounded pointer-events-none whitespace-nowrap shadow z-20 font-sans">
                              Prev: {item.prev}%
                            </div>
                          </div>
                        </div>
                        {item.label && (
                          <span className="text-[10px] font-bold text-slate-400 mt-1 select-none font-sans">
                            {item.label}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 my-6"></div>

                {/* Bottom row summary grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                      <span>Clicks</span>
                      <span className="text-emerald-500 flex items-center gap-0.5">▲ 8.00%</span>
                    </div>
                    <div className="text-xl font-extrabold text-slate-800 font-sans">{clickCount}</div>
                    <div className="text-[10px] font-bold text-slate-400 font-sans">${epc.toFixed(2)} EPC</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                      <span>Transactions</span>
                      <span className="text-emerald-500 flex items-center gap-0.5">▲ 100.00%</span>
                    </div>
                    <div className="text-xl font-extrabold text-slate-800 font-sans">{convCount}</div>
                    <div className="text-[10px] font-bold text-slate-400 font-sans">
                      {clickCount > 0 ? ((convCount / clickCount) * 100).toFixed(2) : '0.00'}% CR
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                      <span>Sale value</span>
                      <span className="text-emerald-500 flex items-center gap-0.5">▲ 185.60%</span>
                    </div>
                    <div className="text-xl font-extrabold text-slate-800 font-sans">
                      ${(totalEarnings * 26.74).toLocaleString('en-AU', { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 font-sans">
                      ${(totalEarnings * 0.89).toFixed(2)} AOV
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                      <span>Commission</span>
                      <span className="text-emerald-500 flex items-center gap-0.5">▲ 106.41%</span>
                    </div>
                    <div className="text-xl font-extrabold text-[#00a8e8] font-sans">${totalEarnings.toFixed(2)}</div>
                    <div className="text-[10px] font-bold text-slate-400 font-sans">
                      ${(totalEarnings / (convCount || 1)).toFixed(2)} AC
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Cards row (3 columns) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Account Overview */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <h3 className="text-base font-bold text-slate-800 font-sans">Account overview</h3>
                  <div className="bg-[#f8fafc] border border-slate-200/50 rounded-2xl p-5 space-y-2.5">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Pending</div>
                    <div className="text-3xl font-black text-[#00a8e8] font-sans">
                      ${conversions.filter(c => c.status === 'pending').reduce((acc, c) => acc + Number(c.payout), 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-2 text-xs font-semibold text-slate-500 font-sans">
                    <span>Available Wallet Balance</span>
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
                      <strong className="text-slate-800">74%</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00a8e8] rounded-full" style={{ width: '74%' }}></div>
                    </div>
                  </div>

                  {/* Gauge 2 */}
                  <div className="space-y-2 font-sans">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Program acceptance</span>
                      <strong className="text-slate-800">58%</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00a8e8] rounded-full" style={{ width: '58%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Quick Link Generator */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4 relative">
                  <h3 className="text-base font-bold text-slate-800 font-sans">Quick link generator</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-sans">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Advertiser</label>
                      <span className="bg-red-50 text-red-500 text-[9px] font-extrabold rounded px-1.5 py-0.5 border border-red-100">Required</span>
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
                        className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-sans"
                      />
                      
                      {/* Search Dropdown list */}
                      {showSearchDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-48 overflow-y-auto p-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
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
                                className="w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-colors flex justify-between items-center cursor-pointer font-sans"
                              >
                                <span>{camp.name}</span>
                                <span className="text-[9px] font-extrabold text-[#00a8e8]">${Number(camp.payout_amount).toFixed(2)} Payout</span>
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
                    className="w-full bg-[#0052FF] text-white font-bold h-11 rounded-xl text-xs flex items-center justify-center hover:bg-blue-700 transition-colors shadow shadow-blue-500/10 cursor-pointer font-sans"
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
                <h3 className="text-lg font-bold text-slate-900 font-sans">Browse Active Partner Campaigns</h3>
                <p className="text-xs text-slate-600 font-medium font-sans">Join networks and copy your tracking URLs instantly.</p>
              </div>

              <div className="grid gap-4">
                {campaigns.map((camp) => {
                  const joined = myLinks.some(l => l.campaign_id === camp.id);
                  return (
                    <div key={camp.id} className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:shadow transition-all w-full">
                      <div className="space-y-1.5">
                        <h4 className="text-base font-extrabold text-slate-900 font-sans">{camp.name}</h4>
                        <p className="text-xs text-slate-500 max-w-xl leading-relaxed font-sans">{camp.description}</p>
                      </div>

                      <div className="flex items-center gap-6 shrink-0 font-sans">
                        <div className="text-right">
                          <div className="text-xs text-slate-400 font-semibold">Payout Rate</div>
                          <div className="text-sm font-extrabold text-[#00a8e8]">${Number(camp.payout_amount).toFixed(2)} AUD</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{camp.payout_type}</div>
                        </div>

                        {joined ? (
                          <div className="bg-emerald-50 text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-emerald-100 flex items-center gap-1.5 select-none">
                            <Check className="h-4 w-4" /> Active Partner
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGenerateLink(camp.id)}
                            className="bg-[#0052FF] text-white font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-blue-700 transition-colors shadow shadow-blue-500/10 cursor-pointer"
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
                <h3 className="text-lg font-bold text-slate-900 font-sans">Your Traffic Sources & Links</h3>
                <p className="text-xs text-slate-600 font-medium font-sans">Use these links on your site/channels to track referrals and earn commissions.</p>
              </div>

              <div className="grid gap-4">
                {myLinks.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-sm font-bold text-slate-500 font-sans">
                    You haven't generated any partner tracking links yet. Go to 'Partners' to get started!
                  </div>
                ) : (
                  myLinks.map((link) => (
                    <div key={link.id} className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm w-full">
                      <div className="space-y-1.5">
                        <h4 className="text-base font-extrabold text-slate-900 font-sans">{link.campaign?.name || 'Active Campaign'}</h4>
                        <div className="text-xs font-bold text-[#0052FF] bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-200/20 inline-block font-mono">
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
                            className="flex-1 md:flex-none bg-blue-550 text-white hover:bg-blue-600 font-bold h-11 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
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
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-sans">
                  <MousePointer className="h-4.5 w-4.5 text-[#0052FF]" /> Clicks Traffic Log
                </h3>
                <div className="max-h-[500px] overflow-y-auto space-y-3 pr-1">
                  {clicks.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-12 font-sans">No referral clicks logged yet.</p>
                  ) : (
                    clicks.map((c) => (
                      <div key={c.id} className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl flex justify-between items-center hover:bg-slate-100/50 transition-colors w-full font-sans">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-800">{c.campaign?.name || 'Campaign Click'}</div>
                          <div className="text-[10px] text-slate-500 font-semibold">IP: {c.ip_address} | Ref: {c.referrer}</div>
                        </div>
                        <div className="text-right flex flex-col justify-center">
                          <div className="text-[10px] text-slate-400 font-bold">
                            {new Date(c.created_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-[9px] text-slate-400 font-bold">
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
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-sans">
                  <CheckCircle className="h-4.5 w-4.5 text-[#0052FF]" /> Conversion Ledger
                </h3>
                <div className="max-h-[500px] overflow-y-auto space-y-3 pr-1">
                  {conversions.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-12 font-sans">No conversions recorded yet.</p>
                  ) : (
                    conversions.map((conv) => (
                      <div key={conv.id} className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl flex justify-between items-center hover:bg-slate-100/50 transition-colors w-full font-sans">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-800">{conv.campaign_name || conv.campaign?.name}</div>
                          <div className="text-[10px] text-slate-500 font-semibold">TxID: {conv.transaction_id}</div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-xs font-bold text-[#00a8e8]">+${Number(conv.payout).toFixed(2)}</div>
                          <span className={`text-[8px] font-extrabold uppercase rounded px-1.5 py-0.5 tracking-wider ${
                            conv.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            conv.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
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

          {/* TAB 5: FINANCE WITHDRAW WALLET */}
          {activeTab === 'wallet' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
              
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-sans">Withdraw Earnings</h3>
                  <p className="text-xs text-slate-500 font-sans">Transfer your cleared wallet earnings directly to your bank account (AUD).</p>
                </div>

                <form onSubmit={handleWithdraw} className="space-y-4 font-sans">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Withdraw Amount ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        type="number" 
                        placeholder="e.g. 100"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#0052FF] text-white font-bold h-12 rounded-xl text-sm flex items-center justify-center hover:bg-blue-700 transition-colors shadow shadow-blue-500/10 cursor-pointer"
                  >
                    Confirm Balance Withdrawal
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-sans">Earnings Ledger</h3>
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

        </main>
      </div>

    </div>
  );
}
