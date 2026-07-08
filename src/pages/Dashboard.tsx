import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PublisherDashboard from './PublisherDashboard';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { 
  getCampaigns, createCampaign, updateCampaignStatus, 
  getClicks, getConversions, updateConversionStatus,
  getMessages, sendMessage
} from '../lib/mockDatabase';
import type { Campaign, Click, Conversion } from '../lib/mockDatabase';
import { toast } from 'sonner';
import { 
  LogOut, DollarSign, MousePointer, Plus, 
  TrendingUp, Check, X, AlertCircle, FolderKanban, Users, Mail, Bell,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export const formatUserId = (id: string | undefined): string => {
  if (!id) return '';
  const cleanId = id.replace('mock-user-', '').replace('db-user-', '').replace(/-/g, '');
  return cleanId.substring(0, 6).toUpperCase();
};

export default function Dashboard() {
  const { user, profile, signOut, updateBalance } = useAuth();
  const navigate = useNavigate();

  const roleName = profile?.user_type ? profile.user_type.charAt(0).toUpperCase() + profile.user_type.slice(1) : 'Affiliate';

  useSEO({
    title: `${roleName} Dashboard | Reward Mate`,
    description: "Reward Mate secure client portal dashboard. Track performance, analyze click conversion statistics, and request wallet payouts.",
    noIndex: true
  });

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 text-slate-850">
        <div className="h-8 w-8 rounded-full border-4 border-[#0052FF]/20 border-t-[#0052FF] animate-spin"></div>
      </div>
    );
  }

  // Render role-specific dashboard
  switch (profile.user_type) {
    case 'advertiser':
      return <AdvertiserDashboard profile={profile} updateBalance={updateBalance} signOut={signOut} />;
    case 'publisher':
      return <PublisherDashboard profile={profile} updateBalance={updateBalance} signOut={signOut} />;
    case 'admin':
      return <AdminDashboard profile={profile} signOut={signOut} />;
    default:
      return <div>Unknown account type.</div>;
  }
}

// ----------------------------------------------------
// 1. ADVERTISER DASHBOARD
// ----------------------------------------------------
function AdvertiserDashboard({ profile, updateBalance, signOut, }: { profile: any, updateBalance: any, signOut: any }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'wallet' | 'messages'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  
  // Form fields for new campaign
  const [campName, setCampName] = useState('');
  const [campDesc, setCampDesc] = useState('');
  const [campUrl, setCampUrl] = useState('');
  const [campPayoutType, setCampPayoutType] = useState<'cpa' | 'cpc'>('cpa');
  const [campPayoutAmount, setCampPayoutAmount] = useState('');
  const [campBudget, setCampBudget] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [searchContactText, setSearchContactText] = useState('');

  const loadData = async () => {
    try {
      const all = await getCampaigns();
      setCampaigns(all.filter(c => c.advertiser_id === profile.id));
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = async () => {
    try {
      const allMsgs = await getMessages(profile.id);
      setMessages(allMsgs);

      const targetRoles = profile.user_type === 'admin' 
        ? ['publisher', 'advertiser'] 
        : [profile.user_type === 'publisher' ? 'advertiser' : 'publisher', 'admin'];
      let fetchedContacts = [];
      if (!isSupabaseConfigured) {
        const stored = JSON.parse(localStorage.getItem('rewardmate_mock_profiles') || '[]');
        fetchedContacts = stored.filter((p: any) => targetRoles.includes(p.user_type));
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('user_type', targetRoles);
        if (!error && data) {
          fetchedContacts = data;
        }
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
    loadData();
  }, [profile.id]);

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

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(campBudget) > Number(profile.wallet_balance)) {
      toast.error('Campaign budget exceeds your current wallet balance. Please deposit funds first.');
      return;
    }
    setLoading(true);

    try {
      // Deduct campaign budget from wallet balance
      await updateBalance(Number(campBudget), 'spend');
      
      await createCampaign({
        advertiser_id: profile.id,
        advertiser_name: profile.full_name,
        name: campName,
        description: campDesc,
        landing_page_url: campUrl,
        payout_type: campPayoutType,
        payout_amount: Number(campPayoutAmount),
        status: 'pending_approval',
        total_budget: Number(campBudget)
      });

      toast.success('Campaign submitted for Admin approval!');
      setShowCreateModal(false);
      
      // Reset form
      setCampName('');
      setCampDesc('');
      setCampUrl('');
      setCampPayoutAmount('');
      setCampBudget('');
      
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) {
      toast.error('Please enter a valid deposit amount.');
      return;
    }
    try {
      await updateBalance(Number(depositAmount), 'deposit');
      setDepositAmount('');
    } catch (err) {}
  };

  // Derived metrics
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalSpend = campaigns.reduce((acc, c) => acc + Number(c.spend), 0);

  return (
    <div className="flex h-screen overflow-hidden w-full bg-slate-50 text-slate-800 font-sans selection:bg-[#0052FF]/10">
      
      {/* 1. LEFT SIDEBAR PANEL (Fixed) */}
      <aside className={`hidden lg:flex bg-[#090b16] flex-col justify-between shrink-0 h-full z-20 transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className={`py-5 flex items-center border-b border-white/5 bg-[#090b16] ${isSidebarCollapsed ? 'justify-center px-0' : 'px-6'}`}>
            {isSidebarCollapsed ? (
              <img 
                src="/RewardMateFav.png" 
                className="h-7 w-7 object-contain" 
                alt="Reward Mate Favicon" 
              />
            ) : (
              <img 
                src="/rewardmate-logo-cropped.png" 
                className="h-6 w-auto object-contain" 
                alt="Reward Mate Logo" 
              />
            )}
          </div>

          {/* Profile Card */}
          <div className={isSidebarCollapsed ? 'px-2 py-4 flex justify-center' : 'px-4 py-4'}>
            <div className={`flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group text-white ${isSidebarCollapsed ? 'w-10 h-10 p-0 justify-center' : 'w-full'}`}>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-[#0052FF] text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                  {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                </div>
                {!isSidebarCollapsed && (
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-200 leading-none mb-1 truncate">
                      {profile.full_name || 'Advertiser'}
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold">ID: {formatUserId(profile.id)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links stack */}
          <nav className={`space-y-1.5 pt-2 ${isSidebarCollapsed ? 'px-2' : 'px-3'}`}>
            <button
              onClick={() => setActiveTab('campaigns')}
              title="My Campaigns"
              className={`w-full flex items-center py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5'} ${
                activeTab === 'campaigns' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FolderKanban className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>My Campaigns</span>}
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              title="Deposit & Wallet"
              className={`w-full flex items-center py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5'} ${
                activeTab === 'wallet' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <DollarSign className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Deposit & Wallet</span>}
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              title="Messages"
              className={`w-full flex items-center py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5'} ${
                activeTab === 'messages' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Mail className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Messages</span>}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className={`border-t border-white/5 bg-[#090b16] ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
          <div className={`flex ${isSidebarCollapsed ? 'flex-col items-center gap-2 mb-2' : 'items-center justify-between mb-4'}`}>
            {isSidebarCollapsed ? (
              <button 
                onClick={() => setIsSidebarCollapsed(false)}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5"
                title="Expand Menu"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            ) : (
              <>
                <div className="flex items-center space-x-2 text-slate-500 font-bold select-none">
                  <span className="text-[10px] tracking-wider font-semibold uppercase text-slate-450">v1.0</span>
                </div>
                
                <button 
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5"
                  title="Collapse Menu"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          <button 
            onClick={signOut}
            title="Sign Out"
            className="w-full flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 h-10 rounded-xl cursor-pointer"
          >
            <LogOut className={`h-4 w-4 shrink-0 ${isSidebarCollapsed ? '' : 'mr-2'}`} />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN LAYOUT CONTAINER (Header fixed, Main scrolls) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* TOP NAVIGATION HEADER */}
        <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center">
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Wallet Balance</div>
              <div className="text-sm font-extrabold text-[#0052FF]">${Number(profile.wallet_balance).toFixed(2)} AUD</div>
            </div>

            {/* Vertical Divider */}
            <div className="h-5 w-px bg-slate-200"></div>

            {/* Profile Dropdown Badge */}
            <div className="relative">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 cursor-pointer group p-1.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
              >
                <div className="h-7 w-7 rounded-full bg-[#0052FF] text-white flex items-center justify-center font-extrabold text-xs select-none border border-[#0052FF]/10 shadow-sm shrink-0">
                  {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800 transition-colors hidden md:inline-block truncate max-w-[120px]">
                  {profile.full_name || 'Advertiser'}
                </span>
                <svg className={`h-3 w-3 text-slate-400 group-hover:text-slate-600 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* The Dropdown Menu */}
              {showUserDropdown && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)}></div>
                  
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2.5 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
                    {/* User Details */}
                    <div className="px-4 py-2 border-b border-slate-100 mb-1.5 text-left">
                      <div className="text-xs font-black text-slate-855 truncate">{profile.full_name || 'Advertiser'}</div>
                      <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{profile.email}</div>
                      <div className="text-[9px] text-slate-400 font-mono mt-1 font-bold">ID: {formatUserId(profile.id)}</div>
                    </div>

                    {/* Dropdown Options */}
                    <button 
                      onClick={() => {
                        setShowUserDropdown(false);
                        setActiveTab('campaigns');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-655 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      My Campaigns
                    </button>
                    
                    {/* Divider */}
                    <div className="h-px bg-slate-100 my-1.5"></div>

                    {/* Log Out option */}
                    <button 
                      onClick={() => {
                        setShowUserDropdown(false);
                        signOut();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* 3. SCROLLABLE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50">
          
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Spend</span>
                <DollarSign className="h-5 w-5 text-[#0052FF]" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">${totalSpend.toFixed(2)}</div>
              <p className="text-[11px] text-slate-500 mt-2">Deducted from budget for approved conversions</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Active Campaigns</span>
                <TrendingUp className="h-5 w-5 text-[#0052FF]" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{activeCampaigns}</div>
              <p className="text-[11px] text-slate-500 mt-2">Out of {campaigns.length} campaigns listed</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Acquisition Wallet</span>
                <MousePointer className="h-5 w-5 text-[#0052FF]" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">${Number(profile.wallet_balance).toFixed(2)}</div>
              <p className="text-[11px] text-slate-500 mt-2">Available for campaign allocation</p>
            </div>
          </div>

          {/* Tab Contents */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Campaign Directory</h3>
                  <p className="text-xs text-slate-500">Submit, pause, and monitor performance offers</p>
                </div>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-[#0052FF] hover:bg-blue-650 text-white font-bold text-xs h-10 px-5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm shadow-blue-500/10"
                >
                  <Plus className="h-4 w-4" /> Create Offer
                </button>
              </div>

              {campaigns.length === 0 ? (
                <div className="bg-white border border-slate-100 p-12 text-center text-slate-400 rounded-2xl space-y-3 shadow-sm">
                  <AlertCircle className="h-10 w-10 text-slate-350 mx-auto" />
                  <p className="font-bold text-sm text-slate-800">No campaigns created yet.</p>
                  <p className="text-xs max-w-sm mx-auto">Click "Create Offer" to submit your first campaign for Admin approval.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {campaigns.map((camp) => (
                    <div key={camp.id} className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-base font-bold text-slate-900">{camp.name}</h4>
                          <span className={`text-[10px] font-extrabold rounded-full px-2.5 py-0.5 border ${
                            camp.status === 'active' ? 'bg-[#0052FF]/5 border-[#0052FF]/20 text-[#0052FF]' :
                            camp.status === 'pending_approval' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                            'bg-red-50 border-red-100 text-red-700'
                          }`}>
                            {camp.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 max-w-xl leading-relaxed">{camp.description}</p>
                        <div className="text-[11px] text-slate-400 pt-1">
                          URL: <a href={camp.landing_page_url} target="_blank" rel="noreferrer" className="text-[#0052FF] underline">{camp.landing_page_url}</a>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 text-right shrink-0">
                        <div>
                          <div className="text-xs text-slate-500 font-semibold">Payout Rate</div>
                          <div className="text-sm font-bold text-slate-900">${Number(camp.payout_amount).toFixed(2)} AUD <span className="text-[10px] text-slate-500 uppercase">{camp.payout_type}</span></div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 font-semibold">Spend / Budget</div>
                          <div className="text-sm font-bold text-slate-900">${Number(camp.spend).toFixed(2)} / ${Number(camp.total_budget).toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="grid md:grid-cols-2 gap-8 font-sans animate-in fade-in duration-205">
              <div className="bg-white border border-slate-100 p-8 rounded-2xl space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Deposit Budget</h3>
                  <p className="text-xs text-slate-550">Add funds to allocate to your affiliate campaigns.</p>
                </div>

                <form onSubmit={handleDeposit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Amount (AUD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        type="number" 
                        placeholder="e.g. 500"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] transition-all"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#0052FF] text-white font-bold h-12 rounded-xl text-sm flex items-center justify-center hover:bg-blue-650 transition-colors shadow shadow-blue-500/10 cursor-pointer"
                  >
                    Deposit Sandbox Funds
                  </button>
                </form>
              </div>

              <div className="bg-white border border-slate-100 p-8 rounded-2xl space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Wallet Overview</h3>
                  <p className="text-xs text-slate-550">Summary of advertiser credit balance.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500 font-semibold">Available Balance</span>
                    <span className="text-base font-extrabold text-[#0052FF]">${Number(profile.wallet_balance).toFixed(2)} AUD</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500 font-semibold">Pending Campaign Allocations</span>
                    <span className="text-sm font-bold text-slate-800">
                      ${campaigns.filter(c => c.status === 'pending_approval').reduce((acc, c) => acc + Number(c.total_budget), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-slate-500 font-semibold">Total Capital Spent</span>
                    <span className="text-sm font-bold text-slate-800">${totalSpend.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MESSAGES SECTION */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-[550px] flex animate-in fade-in duration-300">
              
              {/* Left Panel: Contacts list */}
              <div className="w-80 border-r border-slate-100 flex flex-col h-full bg-slate-50/30">
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-100">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search publishers..."
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
                    <p className="text-xs font-bold font-sans">Select a publisher to view conversation.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Campaign Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-8 space-y-6 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 shadow-2xl">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-slate-900">List New Campaign</h3>
              <p className="text-xs text-slate-500 font-medium">Submit your affiliate deal parameters for verification.</p>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Campaign Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Woolworths Credit Card Promo"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                <textarea 
                  placeholder="Summarize the offer criteria, target audience, and traffic restrictions..."
                  value={campDesc}
                  onChange={(e) => setCampDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Landing Page URL</label>
                <input 
                  type="url" 
                  placeholder="https://www.company.com/promotion"
                  value={campUrl}
                  onChange={(e) => setCampUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payout Type</label>
                  <select
                    value={campPayoutType}
                    onChange={(e) => setCampPayoutType(e.target.value as 'cpa' | 'cpc')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                  >
                    <option value="cpa">CPA (Cost per Acquisition)</option>
                    <option value="cpc">CPC (Cost per Click)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payout ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="e.g. 50.00"
                    value={campPayoutAmount}
                    onChange={(e) => setCampPayoutAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Campaign Budget ($)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 2000"
                  value={campBudget}
                  onChange={(e) => setCampBudget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0052FF] text-white font-bold h-12 rounded-xl text-sm flex items-center justify-center hover:bg-blue-650 disabled:opacity-50 cursor-pointer shadow shadow-blue-500/10 transition-colors"
              >
                {loading ? <div className="h-5 w-5 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" /> : 'Submit for Approval'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


// ----------------------------------------------------
// 3. ADMIN DASHBOARD
// ----------------------------------------------------
function AdminDashboard({ profile, signOut }: { profile: any, signOut: any }) {
  const { impersonateUser } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'campaign-approvals' | 'conversion-approvals' | 'users-mgmt' | 'messages'>('campaign-approvals');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [searchContactText, setSearchContactText] = useState('');

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserType, setNewUserType] = useState<'admin' | 'publisher' | 'advertiser'>('publisher');
  const [newUserApproval, setNewUserApproval] = useState<'approved' | 'pending'>('approved');
  const [newUserBalance, setNewUserBalance] = useState('0.00');
  
  // Onboarding answers pre-fill
  const [newUserBusiness, setNewUserBusiness] = useState('');
  const [newUserWebsite, setNewUserWebsite] = useState('');
  const [newUserChannels, setNewUserChannels] = useState('');
  const [newUserTraffic, setNewUserTraffic] = useState('');

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail) {
      toast.error('Email is required.');
      return;
    }
    
    try {
      if (!isSupabaseConfigured) {
        // Mock Mode Creation
        const mockProfiles = JSON.parse(localStorage.getItem('rewardmate_mock_profiles') || '[]');
        if (mockProfiles.some((p: any) => p.email.toLowerCase() === newUserEmail.toLowerCase())) {
          toast.error('A user with this email already exists.');
          return;
        }

        const newProfile = {
          id: `mock-user-${Date.now()}`,
          email: newUserEmail,
          full_name: newUserFullName,
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(newUserFullName || newUserEmail)}`,
          user_type: newUserType,
          approval_status: newUserType === 'publisher' ? newUserApproval : 'approved',
          wallet_balance: Number(newUserBalance) || 0,
          created_at: new Date().toISOString(),
          business_name: newUserType === 'publisher' ? newUserBusiness : undefined,
          website: newUserType === 'publisher' ? newUserWebsite : undefined,
          channels: newUserType === 'publisher' ? newUserChannels : undefined,
          traffic: newUserType === 'publisher' ? newUserTraffic : undefined,
          onboarding_completed: newUserType === 'publisher' ? !!(newUserBusiness || newUserWebsite) : true
        };

        localStorage.setItem('rewardmate_mock_profiles', JSON.stringify([...mockProfiles, newProfile]));
        toast.success(`User account ${newUserEmail} created successfully!`);
      } else {
        // Supabase Live Mode Creation
        const tempId = 'db-user-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: tempId,
            email: newUserEmail,
            full_name: newUserFullName,
            user_type: newUserType,
            approval_status: newUserType === 'publisher' ? newUserApproval : 'approved',
            wallet_balance: Number(newUserBalance) || 0,
            created_at: new Date().toISOString(),
            business_name: newUserType === 'publisher' ? newUserBusiness : null,
            website: newUserType === 'publisher' ? newUserWebsite : null,
            channels: newUserType === 'publisher' ? newUserChannels : null,
            traffic: newUserType === 'publisher' ? newUserTraffic : null,
            onboarding_completed: newUserType === 'publisher' ? !!(newUserBusiness || newUserWebsite) : true
          } as any);

        if (error) throw error;
        toast.success(`User account ${newUserEmail} created in database!`);
      }

      // Reset form states
      setNewUserEmail('');
      setNewUserFullName('');
      setNewUserType('publisher');
      setNewUserApproval('approved');
      setNewUserBalance('0.00');
      setNewUserBusiness('');
      setNewUserWebsite('');
      setNewUserChannels('');
      setNewUserTraffic('');
      setShowAddUserModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user account.');
    }
  };

  const loadMessages = async () => {
    try {
      const allMsgs = await getMessages(profile.id);
      setMessages(allMsgs);

      const targetRoles = ['publisher', 'advertiser'];
      let fetchedContacts = [];
      if (!isSupabaseConfigured) {
        const stored = JSON.parse(localStorage.getItem('rewardmate_mock_profiles') || '[]');
        fetchedContacts = stored.filter((p: any) => targetRoles.includes(p.user_type));
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('user_type', targetRoles);
        if (!error && data) {
          fetchedContacts = data;
        }
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

  const loadData = async () => {
    try {
      const camps = await getCampaigns();
      setCampaigns(camps);

      const convs = await getConversions('admin');
      setConversions(convs);

      const clickLogs = await getClicks();
      setClicks(clickLogs);

      // Fetch users
      if (!isSupabaseConfigured) {
        const mockProfiles = JSON.parse(localStorage.getItem('rewardmate_mock_profiles') || '[]');
        setProfiles(mockProfiles);
      } else {
        const { data: usersData, error: usersErr } = await supabase.from('profiles').select('*');
        if (!usersErr && usersData) {
          setProfiles(usersData);
        }
      }
      await loadMessages();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveCampaign = async (id: string) => {
    try {
      await updateCampaignStatus(id, 'active');
      toast.success('Campaign activated on network!');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRejectCampaign = async (id: string) => {
    try {
      await updateCampaignStatus(id, 'rejected');
      toast.success('Campaign rejected.');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleApproveConversion = async (id: string) => {
    try {
      await updateConversionStatus(id, 'approved');
      toast.success('Conversion approved and publisher payout credited!');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRejectConversion = async (id: string) => {
    try {
      await updateConversionStatus(id, 'rejected');
      toast.success('Conversion rejected.');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (userId === profile.id) {
      toast.error('You cannot remove your own active administrator profile.');
      return;
    }
    if (window.confirm('Are you sure you want to remove this user? This profile will be deleted.')) {
      try {
        if (!isSupabaseConfigured) {
          const storedProfiles = JSON.parse(localStorage.getItem('rewardmate_mock_profiles') || '[]');
          const updated = storedProfiles.filter((p: any) => p.id !== userId);
          localStorage.setItem('rewardmate_mock_profiles', JSON.stringify(updated));
          toast.success('Mock User profile deleted successfully.');
          loadData();
        } else {
          const { error } = await supabase.from('profiles').delete().eq('id', userId);
          if (error) throw error;
          toast.success('User profile deleted successfully.');
          loadData();
        }
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      if (!isSupabaseConfigured) {
        const mockProfiles = JSON.parse(localStorage.getItem('rewardmate_mock_profiles') || '[]');
        const updated = mockProfiles.map((p: any) => 
          p.id === userId ? { ...p, approval_status: 'approved', onboarding_completed: true } : p
        );
        localStorage.setItem('rewardmate_mock_profiles', JSON.stringify(updated));
        toast.success('User profile approved successfully!');
        loadData();
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .update({ approval_status: 'approved' })
          .eq('id', userId)
          .select();
        if (error) throw error;

        if (!data || data.length === 0) {
          toast.warning('Database policy blocked update. Please execute the updated RLS policy in your Supabase SQL editor.');
          return;
        }

        toast.success('User profile approved successfully!');
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Metrics
  const pendingCamps = campaigns.filter(c => c.status === 'pending_approval').length;
  const pendingConvs = conversions.filter(c => c.status === 'pending').length;
  const networkVolume = conversions.filter(c => c.status === 'approved').reduce((acc, c) => acc + Number(c.payout), 0);

  // Dynamic Messages for Admin
  const liveMessages = messages
    .filter(m => m.receiver_id === profile.id)
    .slice(-3)
    .reverse()
    .map(m => ({
      id: m.id,
      sender: m.sender_name,
      subject: m.subject,
      preview: m.body,
      time: new Date(m.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
      sender_id: m.sender_id
    }));

  return (
    <div className="flex h-screen overflow-hidden w-full bg-slate-50 text-slate-800 font-sans selection:bg-[#0052FF]/10">
      
      {/* 1. LEFT SIDEBAR PANEL (Fixed) */}
      <aside className={`hidden lg:flex bg-[#090b16] flex-col justify-between shrink-0 h-full z-20 transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className={`py-5 flex items-center border-b border-white/5 bg-[#090b16] ${isSidebarCollapsed ? 'justify-center px-0' : 'px-6'}`}>
            {isSidebarCollapsed ? (
              <img 
                src="/RewardMateFav.png" 
                className="h-7 w-7 object-contain" 
                alt="Reward Mate Favicon" 
              />
            ) : (
              <img 
                src="/rewardmate-logo-cropped.png" 
                className="h-6 w-auto object-contain" 
                alt="Reward Mate Logo" 
              />
            )}
          </div>

          {/* Profile Card */}
          <div className={isSidebarCollapsed ? 'px-2 py-4 flex justify-center' : 'px-4 py-4'}>
            <div className={`flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group text-white ${isSidebarCollapsed ? 'w-10 h-10 p-0 justify-center' : 'w-full'}`}>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-purple-650 text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                  {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                </div>
                {!isSidebarCollapsed && (
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-200 leading-none mb-1 truncate">
                      {profile.full_name || 'Administrator'}
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold">ID: {formatUserId(profile.id)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links stack */}
          <nav className={`space-y-1.5 pt-2 ${isSidebarCollapsed ? 'px-2' : 'px-3'}`}>
            <button
              onClick={() => setActiveTab('campaign-approvals')}
              title={`Offer Approvals (${pendingCamps})`}
              className={`w-full flex items-center py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5'} ${
                activeTab === 'campaign-approvals' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FolderKanban className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Offer Approvals ({pendingCamps})</span>}
            </button>
            <button
              onClick={() => setActiveTab('conversion-approvals')}
              title={`Conversion Audits (${pendingConvs})`}
              className={`w-full flex items-center py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5'} ${
                activeTab === 'conversion-approvals' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Check className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Conversion Audits ({pendingConvs})</span>}
            </button>
            <button
              onClick={() => setActiveTab('users-mgmt')}
              title="User Management"
              className={`w-full flex items-center py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5'} ${
                activeTab === 'users-mgmt' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>User Management</span>}
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              title="Messages"
              className={`w-full flex items-center py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5'} ${
                activeTab === 'messages' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Mail className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Messages</span>}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className={`border-t border-white/5 bg-[#090b16] ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
          <div className={`flex ${isSidebarCollapsed ? 'flex-col items-center gap-2 mb-2' : 'items-center justify-between mb-4'}`}>
            {isSidebarCollapsed ? (
              <button 
                onClick={() => setIsSidebarCollapsed(false)}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5"
                title="Expand Menu"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            ) : (
              <>
                <div className="flex items-center space-x-2 text-slate-500 font-bold select-none">
                  <span className="text-[10px] tracking-wider font-semibold uppercase text-slate-450">v1.0</span>
                </div>
                
                <button 
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5"
                  title="Collapse Menu"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          <button 
            onClick={signOut}
            title="Sign Out"
            className="w-full flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 h-10 rounded-xl cursor-pointer"
          >
            <LogOut className={`h-4 w-4 shrink-0 ${isSidebarCollapsed ? '' : 'mr-2'}`} />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN LAYOUT CONTAINER (Header fixed, Main scrolls) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* TOP NAVIGATION HEADER */}
        <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center">
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              {/* Mail dropdown */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowMessages(!showMessages);
                    setShowNotifications(false);
                  }}
                  title="Messages"
                  className="relative p-1.5 text-slate-455 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <Mail className="h-4.5 w-4.5" />
                  {liveMessages.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-purple-600 text-white text-[7px] font-black h-3 px-1 rounded-full flex items-center justify-center min-w-3 border border-white">
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
                          <div 
                            key={m.id} 
                            onClick={() => {
                              const matchingContact = contacts.find(c => c.id === m.id.split('-').pop() || c.sender_id === m.sender_id || c.id === m.sender_id);
                              if (matchingContact) {
                                setSelectedContact(matchingContact);
                              }
                              setActiveTab('messages');
                              setShowMessages(false);
                            }}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-left space-y-1 cursor-pointer hover:bg-slate-100 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-800">{m.sender}</span>
                              <span className="text-[9px] text-slate-400 font-semibold">{m.time}</span>
                            </div>
                            <div className="text-[10px] font-bold text-purple-600 truncate font-sans">{m.subject}</div>
                            <p className="text-[10px] text-slate-655 font-sans leading-tight line-clamp-2">{m.preview}</p>
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
                  className="relative p-1.5 text-slate-455 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {pendingConvs + pendingCamps > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-purple-600 text-white text-[7px] font-black h-3 px-1 rounded-full flex items-center justify-center min-w-3 border border-white">
                      {pendingConvs + pendingCamps}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 space-y-3 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800 font-sans">Notifications</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 font-sans text-xs">
                      {pendingCamps > 0 && (
                        <div 
                          onClick={() => {
                            setActiveTab('campaign-approvals');
                            setShowNotifications(false);
                          }}
                          className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 hover:bg-purple-50 transition-colors cursor-pointer text-left space-y-1"
                        >
                          <div className="font-bold text-purple-700">Pending Offers ({pendingCamps})</div>
                          <p className="text-[10px] text-slate-500">New campaign requests are waiting for admin review.</p>
                        </div>
                      )}
                      {pendingConvs > 0 && (
                        <div 
                          onClick={() => {
                            setActiveTab('conversion-approvals');
                            setShowNotifications(false);
                          }}
                          className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 hover:bg-purple-50 transition-colors cursor-pointer text-left space-y-1"
                        >
                          <div className="font-bold text-purple-700">Pending Conversions ({pendingConvs})</div>
                          <p className="text-[10px] text-slate-500">Conversions are waiting for admin approval.</p>
                        </div>
                      )}
                      {pendingConvs === 0 && pendingCamps === 0 && (
                        <div className="text-center py-6 text-xs text-slate-400">All tasks completed!</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-455 font-bold uppercase tracking-wider">Active Role</div>
              <div className="text-sm font-extrabold text-purple-600">Network Admin</div>
            </div>

            {/* Vertical Divider */}
            <div className="h-5 w-px bg-slate-200"></div>

            {/* Profile Dropdown Badge */}
            <div className="relative">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 cursor-pointer group p-1.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
              >
                <div className="h-7 w-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-extrabold text-xs select-none border border-purple-200 shadow-sm shrink-0">
                  {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800 transition-colors hidden md:inline-block truncate max-w-[120px]">
                  {profile.full_name || 'Admin'}
                </span>
                <svg className={`h-3 w-3 text-slate-400 group-hover:text-slate-600 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* The Dropdown Menu */}
              {showUserDropdown && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)}></div>
                  
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2.5 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
                    {/* User Details */}
                    <div className="px-4 py-2 border-b border-slate-100 mb-1.5 text-left">
                      <div className="text-xs font-black text-slate-855 truncate">{profile.full_name || 'Administrator'}</div>
                      <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{profile.email}</div>
                      <div className="text-[9px] text-slate-400 font-mono mt-1 font-bold">ID: {formatUserId(profile.id)}</div>
                    </div>

                    {/* Dropdown Options */}
                    <button 
                      onClick={() => {
                        setShowUserDropdown(false);
                        setActiveTab('campaign-approvals');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-655 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      Offer Approvals
                    </button>
                    
                    {/* Divider */}
                    <div className="h-px bg-slate-100 my-1.5"></div>

                    {/* Log Out option */}
                    <button 
                      onClick={() => {
                        setShowUserDropdown(false);
                        signOut();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* 3. SCROLLABLE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Network Volume</div>
              <div className="text-2xl font-extrabold text-[#0052FF]">${networkVolume.toFixed(2)} AUD</div>
              <p className="text-[10px] text-slate-500 mt-1">Approved payouts across network</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Network traffic</div>
              <div className="text-2xl font-extrabold text-slate-900">{clicks.length} Clicks</div>
              <p className="text-[10px] text-slate-500 mt-1">Raw visitor redirects logged</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Offer reviews</div>
              <div className="text-2xl font-extrabold text-amber-600">{pendingCamps} Campaigns</div>
              <p className="text-[10px] text-slate-500 mt-1">Requires admin approval</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lead audits</div>
              <div className="text-2xl font-extrabold text-amber-600">{pendingConvs} Leads</div>
              <p className="text-[10px] text-slate-500 mt-1">Requires audit to credit wallet</p>
            </div>
          </div>

          {/* Tab Contents */}
          {activeTab === 'campaign-approvals' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Advertiser Offer Approvals</h3>
                <p className="text-xs text-slate-500 font-medium">Verify that the target landing pages comply with program criteria.</p>
              </div>

              {campaigns.filter(c => c.status === 'pending_approval').length === 0 ? (
                <div className="bg-white border border-slate-100 p-12 text-center text-slate-400 rounded-2xl shadow-sm">
                  <p className="font-bold text-sm text-slate-800">No campaigns pending review.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {campaigns.filter(c => c.status === 'pending_approval').map((camp) => (
                    <div key={camp.id} className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">{camp.name}</h4>
                          <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">By {camp.advertiser_name}</span>
                        </div>
                        <p className="text-xs text-slate-500 max-w-xl leading-relaxed">{camp.description}</p>
                        <div className="text-[10px] text-slate-400">
                          URL: <a href={camp.landing_page_url} target="_blank" rel="noreferrer" className="text-[#0052FF] underline">{camp.landing_page_url}</a>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right font-sans">
                          <div className="text-xs text-slate-500">Payout / Budget</div>
                          <div className="text-sm font-extrabold text-[#0052FF]">${Number(camp.payout_amount).toFixed(2)} AUD ({camp.payout_type.toUpperCase()})</div>
                          <div className="text-[10px] text-slate-400 font-semibold">Budget: ${Number(camp.total_budget).toFixed(2)}</div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveCampaign(camp.id)}
                            className="bg-[#0052FF] hover:bg-blue-650 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-sm shadow-blue-500/10"
                          >
                            <Check className="h-4 w-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectCampaign(camp.id)}
                            className="bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 text-red-500 font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <X className="h-4 w-4" /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'conversion-approvals' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Conversion Audit Panel</h3>
                <p className="text-xs text-slate-500 font-medium">Auditing pending leads. Approving transfers the commission from Advertiser balance directly to Publisher wallet.</p>
              </div>

              {conversions.filter(c => c.status === 'pending').length === 0 ? (
                <div className="bg-white border border-slate-100 p-12 text-center text-slate-400 rounded-2xl shadow-sm">
                  <p className="font-bold text-sm text-slate-800">No conversions pending approval.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {conversions.filter(c => c.status === 'pending').map((conv) => (
                    <div key={conv.id} className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-slate-900">{conv.campaign_name || conv.campaign?.name}</h4>
                        <div className="text-xs text-slate-505 font-medium">
                          Publisher: <span className="font-bold text-slate-700">{conv.publisher_name}</span>
                        </div>
                        <div className="text-[10px] text-slate-450 font-mono">TxID: {conv.transaction_id}</div>
                      </div>

                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right">
                          <div className="text-xs text-slate-500">Payout Commission</div>
                          <div className="text-sm font-extrabold text-[#0052FF]">${Number(conv.payout).toFixed(2)} AUD</div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveConversion(conv.id)}
                            className="bg-[#0052FF] hover:bg-blue-655 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-sm shadow-blue-500/10"
                          >
                            <Check className="h-4 w-4" /> Credit Publisher
                          </button>
                          <button
                            onClick={() => handleRejectConversion(conv.id)}
                            className="bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 text-red-500 font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <X className="h-4 w-4" /> Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'users-mgmt' && (
            <>
              <div className="space-y-6 animate-in fade-in duration-300 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-sans">User Management</h3>
                  <p className="text-xs text-slate-550 font-medium">Monitor active system members, impersonate publisher/advertiser views, or revoke profiles.</p>
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-[#0052FF] hover:bg-blue-650 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm self-start sm:self-center"
                >
                  <Plus className="h-4 w-4" /> Setup User Account
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-450">
                        <th className="py-4 px-6">Member Profile</th>
                        <th className="py-4 px-6">Type</th>
                        <th className="py-4 px-6">Country</th>
                        <th className="py-4 px-6">Last Active</th>
                        <th className="py-4 px-6 text-right">This Month Stats</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {profiles.map((p) => {
                        const country = (() => {
                          if (p.email.endsWith('.au')) return { flag: '🇦🇺', code: 'AU', name: 'Australia' };
                          if (p.email.endsWith('.uk') || p.email.endsWith('.co.uk')) return { flag: '🇬🇧', code: 'GB', name: 'United Kingdom' };
                          if (p.email.endsWith('.nz')) return { flag: '🇳🇿', code: 'NZ', name: 'New Zealand' };
                          const charCode = p.id.charCodeAt(0) || 0;
                          if (charCode % 3 === 0) return { flag: '🇺🇸', code: 'US', name: 'United States' };
                          if (charCode % 3 === 1) return { flag: '🇬🇧', code: 'GB', name: 'United Kingdom' };
                          return { flag: '🇦🇺', code: 'AU', name: 'Australia' };
                        })();

                        const lastLoggedIn = (() => {
                          const charCode = p.id.charCodeAt(p.id.length - 1) || 0;
                          const hoursAgo = 1 + (charCode % 72);
                          const date = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
                          return date.toLocaleDateString('en-AU', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          });
                        })();

                        const isSelf = p.id === profile.id;

                        // Metrics
                        const clicksCount = clicks.filter(c => c.publisher_id === p.id || c.campaign?.advertiser_id === p.id).length;
                        const financeVol = p.user_type === 'publisher' 
                          ? conversions.filter(c => c.publisher_id === p.id && c.status === 'approved').reduce((s, c) => s + Number(c.payout), 0)
                          : conversions.filter(c => c.campaign?.advertiser_id === p.id && c.status === 'approved').reduce((s, c) => s + Number(c.payout), 0);
                        return (
                          <Fragment key={p.id}>
                            <tr 
                              onClick={() => setExpandedUserId(expandedUserId === p.id ? null : p.id)}
                              className={`hover:bg-slate-50 transition-colors cursor-pointer select-none ${expandedUserId === p.id ? 'bg-slate-50/80' : ''}`}
                            >
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-3">
                                  <div className="h-8 w-8 rounded-full bg-blue-50 text-[#0052FF] flex items-center justify-center font-extrabold text-xs border border-blue-100 mt-0.5 shrink-0">
                                    {p.full_name ? p.full_name.charAt(0).toUpperCase() : p.email.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-800 truncate">{p.full_name || 'No Name'}</span>
                                      {p.approval_status === 'pending' && (
                                        <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0">
                                          Pending Review
                                        </span>
                                      )}
                                      {p.user_type === 'publisher' && (p.onboarding_completed || p.website) && (
                                        <span className="bg-blue-50 text-[#0052FF] border border-blue-100 text-[8px] font-black px-1 py-0.2 rounded uppercase shrink-0">
                                          Details Available
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-455">
                                      <span className="truncate">{p.email}</span>
                                      <span className="text-[9px] bg-slate-100 text-slate-500 font-mono font-bold px-1 rounded">
                                        {formatUserId(p.id)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`text-[9px] font-extrabold uppercase rounded px-2.5 py-0.5 tracking-wider ${
                                  p.user_type === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                  p.user_type === 'advertiser' ? 'bg-amber-50 text-amber-705 border border-amber-100' :
                                  'bg-blue-50 text-[#0052FF] border border-blue-100'
                                }`}>
                                  {p.user_type}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span className="flex items-center gap-1.5 font-semibold text-slate-555">
                                  <span>{country.flag}</span>
                                  <span>{country.code}</span>
                                </span>
                              </td>
                              <td className="py-4 px-6 text-slate-500 font-medium">{lastLoggedIn}</td>
                              <td className="py-4 px-6 text-right font-sans">
                                <div className="font-bold text-slate-800">
                                  {p.user_type === 'publisher' ? `+$${financeVol.toFixed(2)}` : p.user_type === 'advertiser' ? `-$${financeVol.toFixed(2)}` : '-'}
                                </div>
                                <div className="text-[10px] text-slate-455 font-medium">
                                  {p.user_type !== 'admin' ? `${clicksCount} clicks` : ''}
                                </div>
                              </td>
                              <td className="py-4 px-6 font-sans text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-2">
                                  {!isSelf && p.user_type !== 'admin' && p.approval_status === 'pending' && (
                                    <button
                                      onClick={() => handleApproveUser(p.id)}
                                      className="bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-600 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer text-[10px]"
                                    >
                                      Approve
                                    </button>
                                  )}
                                  {!isSelf && p.user_type !== 'admin' && (
                                    <button
                                      onClick={() => impersonateUser?.(p)}
                                      className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-650 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer text-[10px]"
                                    >
                                      Login As
                                    </button>
                                  )}
                                  {!isSelf && (
                                    <button
                                      onClick={() => handleRemoveUser(p.id)}
                                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer text-[10px] border border-rose-100"
                                    >
                                      Remove
                                    </button>
                                  )}
                                  {isSelf && (
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-150">
                                      You (Active)
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/* COLLAPSIBLE DETAILED VIEW */}
                            {expandedUserId === p.id && (
                              <tr className="bg-slate-50/50">
                                <td colSpan={6} className="px-6 py-4 border-t border-slate-100/50">
                                  <div className="bg-white rounded-2xl border border-slate-150 p-5 space-y-4 shadow-sm animate-in slide-in-from-top-2 duration-200 text-left">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Detailed Profile View</h4>
                                      <span className="text-[9px] text-slate-400 font-bold font-mono">Ref ID: {formatUserId(p.id)} | DB Key: {p.id}</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
                                      <div className="space-y-2">
                                        <div className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Account Information</div>
                                        <div><span className="text-slate-400 font-bold">Email Address:</span> {p.email}</div>
                                        <div><span className="text-slate-400 font-bold">Full Name:</span> {p.full_name || 'Not provided'}</div>
                                        <div><span className="text-slate-400 font-bold">Registration Date:</span> {new Date(p.created_at).toLocaleString('en-AU')}</div>
                                        <div><span className="text-slate-400 font-bold">Wallet Balance:</span> ${Number(p.wallet_balance).toFixed(2)} AUD</div>
                                        <div>
                                          <span className="text-slate-400 font-bold">Approval Status:</span> 
                                          <span className={`ml-2 text-[9px] font-black uppercase rounded px-2 py-0.5 border ${
                                            p.approval_status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            p.approval_status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                            'bg-rose-50 text-rose-700 border-rose-100'
                                          }`}>
                                            {p.approval_status}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <div className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Publisher Onboarding Answers</div>
                                        {p.user_type !== 'publisher' ? (
                                          <div className="text-slate-400 italic">Onboarding is only applicable to publisher profiles.</div>
                                        ) : p.onboarding_completed || p.website || p.business_name ? (
                                          <div className="space-y-2 bg-slate-50 border border-slate-150 p-4 rounded-xl font-medium text-slate-550 leading-relaxed">
                                            <div><span className="text-slate-400 font-bold">Business Name:</span> {p.business_name || 'Not provided'}</div>
                                            <div>
                                              <span className="text-slate-400 font-bold">Website / Channel:</span> 
                                              {p.website ? (
                                                <a href={p.website} target="_blank" rel="noreferrer" className="text-[#0052FF] hover:underline ml-1 font-semibold">{p.website}</a>
                                              ) : 'Not provided'}
                                            </div>
                                            <div><span className="text-slate-400 font-bold">Marketing Channels:</span> {p.channels || 'Not provided'}</div>
                                            <div><span className="text-slate-400 font-bold">Traffic Estimate:</span> {p.traffic || 'Not provided'}</div>
                                          </div>
                                        ) : (
                                          <div className="text-slate-400 italic">This publisher has not completed onboarding details yet.</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* SETUP NEW USER MODAL */}
            {showAddUserModal && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-205 text-left">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Setup New Account</h3>
                    <button 
                      onClick={() => setShowAddUserModal(false)}
                      className="text-slate-400 hover:text-slate-655 font-bold p-1 cursor-pointer transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-650">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Daniel Proctor"
                          value={newUserFullName}
                          onChange={(e) => setNewUserFullName(e.target.value)}
                          className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#0052FF]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. name@domain.com"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#0052FF]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Account Type</label>
                        <select
                          value={newUserType}
                          onChange={(e) => setNewUserType(e.target.value as any)}
                          className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-2 py-2 text-xs font-medium focus:outline-none focus:border-[#0052FF]"
                        >
                          <option value="publisher">Publisher</option>
                          <option value="advertiser">Advertiser</option>
                          <option value="admin">Super Admin</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Initial Approval</label>
                        <select
                          value={newUserApproval}
                          disabled={newUserType !== 'publisher'}
                          onChange={(e) => setNewUserApproval(e.target.value as any)}
                          className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-2 py-2 text-xs font-medium focus:outline-none focus:border-[#0052FF] disabled:opacity-50"
                        >
                          <option value="approved">Approved</option>
                          <option value="pending">Pending Review</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Starting Balance (AUD)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newUserBalance}
                          onChange={(e) => setNewUserBalance(e.target.value)}
                          className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#0052FF]"
                        />
                      </div>
                    </div>

                    {/* Pre-fill Onboarding details if Publisher */}
                    {newUserType === 'publisher' && (
                      <div className="space-y-3 pt-3 border-t border-slate-105 bg-slate-50/40 p-3 rounded-2xl">
                        <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Pre-fill Onboarding Answers (Optional)</h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400">Business/Brand Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Deal Hunters AU"
                              value={newUserBusiness}
                              onChange={(e) => setNewUserBusiness(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0052FF]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400">Website URL</label>
                            <input
                              type="text"
                              placeholder="e.g. https://dealhunters.com"
                              value={newUserWebsite}
                              onChange={(e) => setNewUserWebsite(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0052FF]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400">Traffic (Monthly Views)</label>
                            <select
                              value={newUserTraffic}
                              onChange={(e) => setNewUserTraffic(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0052FF]"
                            >
                              <option value="">Select Traffic...</option>
                              <option value="Under 5,000">Under 5,000</option>
                              <option value="5,000 - 25,000">5,000 - 25,000</option>
                              <option value="25,000 - 100,000">25,000 - 100,000</option>
                              <option value="100,000+">100,000+</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400">Channels</label>
                            <input
                              type="text"
                              placeholder="e.g. Email list, Instagram, Blog"
                              value={newUserChannels}
                              onChange={(e) => setNewUserChannels(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0052FF]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowAddUserModal(false)}
                        className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="h-10 px-5 bg-[#0052FF] hover:bg-blue-650 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-md shadow-blue-500/10"
                      >
                        Create Account
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

          {/* TAB 4: MESSAGES SECTION */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-[550px] flex animate-in fade-in duration-300">
              
              {/* Left Panel: Contacts list */}
              <div className="w-80 border-r border-slate-100 flex flex-col h-full bg-slate-50/30">
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-100">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search users..."
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
                          <div className={`h-9 w-9 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 text-slate-755 flex items-center justify-center font-extrabold text-xs shadow-sm uppercase ${
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
                    <p className="text-xs font-bold font-sans">Select a user to view conversation.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
