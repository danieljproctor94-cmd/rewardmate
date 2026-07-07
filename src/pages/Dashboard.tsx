import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PublisherDashboard from './PublisherDashboard';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { 
  getCampaigns, createCampaign, updateCampaignStatus, 
  getClicks, getConversions, updateConversionStatus
} from '../lib/mockDatabase';
import type { Campaign, Click, Conversion } from '../lib/mockDatabase';
import { toast } from 'sonner';
import { 
  LogOut, DollarSign, MousePointer, Plus, 
  TrendingUp, Check, X, AlertCircle, FolderKanban, Users 
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

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
      <div className="flex justify-center items-center h-screen bg-[#f8fafc] text-slate-800">
        <div className="h-8 w-8 rounded-full border-4 border-blue-600/30 border-t-blue-600 animate-spin"></div>
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
  const [activeTab, setActiveTab] = useState<'campaigns' | 'wallet'>('campaigns');
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

  const loadData = async () => {
    try {
      const all = await getCampaigns();
      setCampaigns(all.filter(c => c.advertiser_id === profile.id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile.id]);

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
    <div className="flex h-screen overflow-hidden w-full bg-[#f8fafc] text-slate-800 font-sans selection:bg-[#0052FF]/10">
      
      {/* 1. LEFT SIDEBAR PANEL (Fixed) */}
      <aside className="hidden lg:flex w-64 bg-[#090b16] border-r border-white/5 flex-col justify-between shrink-0 h-full z-20">
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="px-6 py-5 flex items-center border-b border-white/5 bg-[#090b16]">
            <img src="/rewardmate-logo-cropped.png" className="h-6 w-auto object-contain brightness-0 invert" alt="Reward Mate Logo" />
          </div>

          {/* Profile Card */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group text-white">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-[#0052FF] text-white flex items-center justify-center font-extrabold text-xs">
                  {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 leading-none mb-1">
                    {profile.full_name || 'Advertiser'}
                  </div>
                  <div className="text-[9px] text-slate-400 font-bold">ID: {profile.id.substring(0, 6).toUpperCase()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links stack */}
          <nav className="px-3 space-y-1.5 pt-2">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`w-full flex items-center px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'campaigns' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FolderKanban className="h-4.5 w-4.5 mr-3 text-slate-400" />
              <span>My Campaigns</span>
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`w-full flex items-center px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'wallet' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <DollarSign className="h-4.5 w-4.5 mr-3 text-slate-400" />
              <span>Deposit & Wallet</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 bg-[#090b16]">
          <button 
            onClick={signOut}
            className="w-full flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 h-10 rounded-xl cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN LAYOUT CONTAINER (Header fixed, Main scrolls) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* TOP NAVIGATION HEADER */}
        <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between text-slate-800 z-10 shrink-0">
          <div className="flex items-center">
            <span className="text-xs font-semibold text-[#0052FF] bg-[#0052FF]/5 border border-[#0052FF]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Advertiser Dashboard
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Wallet Balance</div>
              <div className="text-sm font-extrabold text-[#0052FF]">${Number(profile.wallet_balance).toFixed(2)} AUD</div>
            </div>
          </div>
        </header>

        {/* 3. SCROLLABLE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-[#f8fafc]">
          
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
  const [activeTab, setActiveTab] = useState<'campaign-approvals' | 'conversion-approvals' | 'users-mgmt'>('campaign-approvals');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

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
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
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
        const { error } = await supabase
          .from('profiles')
          .update({ approval_status: 'approved' })
          .eq('id', userId);
        if (error) throw error;
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

  return (
    <div className="flex h-screen overflow-hidden w-full bg-[#f8fafc] text-slate-800 font-sans selection:bg-[#0052FF]/10">
      
      {/* 1. LEFT SIDEBAR PANEL (Fixed) */}
      <aside className="hidden lg:flex w-64 bg-[#090b16] border-r border-white/5 flex-col justify-between shrink-0 h-full z-20">
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="px-6 py-5 flex items-center border-b border-white/5 bg-[#090b16]">
            <img src="/rewardmate-logo-cropped.png" className="h-6 w-auto object-contain brightness-0 invert" alt="Reward Mate Logo" />
          </div>

          {/* Profile Card */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group text-white">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-purple-650 text-white flex items-center justify-center font-extrabold text-xs">
                  {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 leading-none mb-1">
                    {profile.full_name || 'Administrator'}
                  </div>
                  <div className="text-[9px] text-slate-400 font-bold">ID: {profile.id.substring(0, 6).toUpperCase()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links stack */}
          <nav className="px-3 space-y-1.5 pt-2">
            <button
              onClick={() => setActiveTab('campaign-approvals')}
              className={`w-full flex items-center px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'campaign-approvals' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FolderKanban className="h-4.5 w-4.5 mr-3 text-slate-400" />
              <span>Offer Approvals ({pendingCamps})</span>
            </button>
            <button
              onClick={() => setActiveTab('conversion-approvals')}
              className={`w-full flex items-center px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'conversion-approvals' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Check className="h-4.5 w-4.5 mr-3 text-slate-400" />
              <span>Conversion Audits ({pendingConvs})</span>
            </button>
            <button
              onClick={() => setActiveTab('users-mgmt')}
              className={`w-full flex items-center px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users-mgmt' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users className="h-4.5 w-4.5 mr-3 text-slate-400" />
              <span>User Management</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 bg-[#090b16]">
          <button 
            onClick={signOut}
            className="w-full flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 h-10 rounded-xl cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN LAYOUT CONTAINER (Header fixed, Main scrolls) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* TOP NAVIGATION HEADER */}
        <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between text-slate-800 z-10 shrink-0">
          <div className="flex items-center">
            <span className="text-xs font-semibold text-[#0052FF] bg-[#0052FF]/5 border border-[#0052FF]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Super Admin Control
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-xs text-slate-550 font-bold uppercase tracking-wider">Active Role</div>
              <div className="text-sm font-extrabold text-[#0052FF]">Network Admin</div>
            </div>
          </div>
        </header>

        {/* 3. SCROLLABLE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-[#f8fafc]">
          
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
            <div className="space-y-6 animate-in fade-in duration-300 font-sans">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-sans">User Management</h3>
                <p className="text-xs text-slate-550 font-medium">Monitor active system members, impersonate publisher/advertiser views, or revoke profiles.</p>
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
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-start space-x-3">
                                <div className="h-8 w-8 rounded-full bg-blue-50 text-[#0052FF] flex items-center justify-center font-extrabold text-xs border border-blue-100 mt-0.5">
                                  {p.full_name ? p.full_name.charAt(0).toUpperCase() : p.email.charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-1">
                                  <div>
                                    <span className="font-bold text-slate-800">{p.full_name || 'No Name'}</span>
                                    {p.approval_status === 'pending' && (
                                      <span className="ml-2 bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                        Pending Review
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-455">{p.email}</div>
                                  {p.website && (
                                    <div className="mt-2 p-3 bg-slate-50 border border-slate-150/70 rounded-2xl space-y-1.5 text-[10px] text-slate-550 font-semibold max-w-sm">
                                      <div className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Onboarding Answers</div>
                                      <div><span className="text-slate-400">Business:</span> {p.business_name}</div>
                                      <div><span className="text-slate-400">Website:</span> <a href={p.website} target="_blank" rel="noreferrer" className="text-[#0052FF] hover:underline">{p.website}</a></div>
                                      <div><span className="text-slate-400">Channels:</span> {p.channels}</div>
                                      <div><span className="text-slate-400">Traffic:</span> {p.traffic}</div>
                                    </div>
                                  )}
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
                              <span className="flex items-center gap-1.5 font-semibold text-slate-550">
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
                            <td className="py-4 px-6 font-sans">
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
