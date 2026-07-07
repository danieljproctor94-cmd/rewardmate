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
  TrendingUp, Check, X, AlertCircle 
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
    <div className="min-h-screen bg-[#070913] text-white flex flex-col font-sans selection:bg-[#0052FF]/30">
      {/* Top Navbar */}
      <nav className="border-b border-white/5 bg-[#05070f] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/rewardmate-logo-cropped.png" className="h-6 sm:h-7 w-auto object-contain brightness-0 invert" alt="Reward Mate Logo" />
          <span className="text-xs font-semibold text-[#0052FF] bg-[#0052FF]/10 border border-[#0052FF]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider ml-2">Advertiser</span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Wallet Balance</div>
            <div className="text-sm font-extrabold text-[#0052FF]">${Number(profile.wallet_balance).toFixed(2)} AUD</div>
          </div>
          <button 
            onClick={signOut}
            className="flex items-center text-xs font-bold text-slate-350 hover:text-white transition-colors bg-white/[0.04] border border-white/5 px-3 py-2 rounded-xl cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2 text-slate-500" /> Sign Out
          </button>
        </div>
      </nav>

      {/* Main Section */}
      <main className="flex-1 p-6 md:p-12 max-w-7xl w-full mx-auto space-y-8">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#0c1024] border border-white/[0.04] rounded-2xl p-6 shadow-md">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Spend</span>
              <DollarSign className="h-5 w-5 text-[#0052FF]" />
            </div>
            <div className="text-3xl font-extrabold text-white">${totalSpend.toFixed(2)}</div>
            <p className="text-[11px] text-slate-500 mt-2">Deducted from budget for approved conversions</p>
          </div>
          <div className="bg-[#0c1024] border border-white/[0.04] rounded-2xl p-6 shadow-md">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Active Campaigns</span>
              <TrendingUp className="h-5 w-5 text-[#0052FF]" />
            </div>
            <div className="text-3xl font-extrabold text-white">{activeCampaigns}</div>
            <p className="text-[11px] text-slate-500 mt-2">Out of {campaigns.length} campaigns listed</p>
          </div>
          <div className="bg-[#0c1024] border border-white/[0.04] rounded-2xl p-6 shadow-md">
            <div className="flex justify-between items-center text-slate-455 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Acquisition Wallet</span>
              <MousePointer className="h-5 w-5 text-[#0052FF]" />
            </div>
            <div className="text-3xl font-extrabold text-white">${Number(profile.wallet_balance).toFixed(2)}</div>
            <p className="text-[11px] text-slate-500 mt-2">Available for campaign allocation</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex space-x-4 border-b border-white/5">
          <button 
            onClick={() => setActiveTab('campaigns')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'campaigns' ? 'border-[#0052FF] text-[#0052FF]' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            My Campaigns
          </button>
          <button 
            onClick={() => setActiveTab('wallet')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'wallet' ? 'border-[#0052FF] text-[#0052FF]' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            Deposit & Wallet
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Campaign Directory</h3>
                <p className="text-xs text-slate-400">Submit, pause, and monitor performance offers</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-[#0052FF] hover:bg-blue-700 text-white font-bold text-xs h-10 px-5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow shadow-blue-500/10"
              >
                <Plus className="h-4 w-4" /> Create Offer
              </button>
            </div>

            {campaigns.length === 0 ? (
              <div className="bg-[#0c1024] border border-white/[0.04] p-12 text-center text-slate-505 rounded-2xl space-y-3">
                <AlertCircle className="h-10 w-10 text-slate-505 mx-auto" />
                <p className="font-bold text-sm">No campaigns created yet.</p>
                <p className="text-xs max-w-sm mx-auto text-slate-500">Click "Create Offer" to submit your first campaign for Admin approval.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {campaigns.map((camp) => (
                  <div key={camp.id} className="bg-[#0c1024] border border-white/[0.04] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-bold text-white">{camp.name}</h4>
                        <span className={`text-[10px] font-extrabold rounded-full px-2.5 py-0.5 border ${
                          camp.status === 'active' ? 'bg-[#0052FF]/10 border-[#0052FF]/30 text-[#0052FF]' :
                          camp.status === 'pending_approval' ? 'bg-amber-500/10 border-amber-500/30 text-amber-450' :
                          'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                          {camp.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 max-w-xl leading-relaxed">{camp.description}</p>
                      <div className="text-[11px] text-slate-500 pt-1">
                        URL: <a href={camp.landing_page_url} target="_blank" rel="noreferrer" className="text-[#0052FF] underline">{camp.landing_page_url}</a>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 text-right shrink-0">
                      <div>
                        <div className="text-xs text-slate-500 font-semibold">Payout Rate</div>
                        <div className="text-sm font-bold text-white">${Number(camp.payout_amount).toFixed(2)} AUD <span className="text-[10px] text-slate-500 uppercase">{camp.payout_type}</span></div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-semibold">Spend / Budget</div>
                        <div className="text-sm font-bold text-white">${Number(camp.spend).toFixed(2)} / ${Number(camp.total_budget).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="grid md:grid-cols-2 gap-8 font-sans">
            <div className="bg-[#0c1024] border border-white/[0.04] p-8 rounded-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Deposit Budget</h3>
                <p className="text-xs text-slate-400">Add funds to allocate to your affiliate campaigns.</p>
              </div>

              <form onSubmit={handleDeposit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Amount (AUD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input 
                      type="number" 
                      placeholder="e.g. 500"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-[#070913] border border-white/10 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-[#0052FF] transition-all"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0052FF] text-white font-bold h-12 rounded-xl text-sm flex items-center justify-center hover:bg-blue-600 transition-colors shadow shadow-blue-500/10 cursor-pointer"
                >
                  Deposit Sandbox Funds
                </button>
              </form>
            </div>

            <div className="bg-[#0c1024] border border-white/[0.04] p-8 rounded-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Wallet Overview</h3>
                <p className="text-xs text-slate-400">Summary of advertiser credit balance.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-sm text-slate-400">Available Balance</span>
                  <span className="text-base font-extrabold text-[#0052FF]">${Number(profile.wallet_balance).toFixed(2)} AUD</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-sm text-slate-400">Pending Campaign Allocations</span>
                  <span className="text-sm font-bold text-white">
                    ${campaigns.filter(c => c.status === 'pending_approval').reduce((acc, c) => acc + Number(c.total_budget), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-slate-400">Total Capital Spent</span>
                  <span className="text-sm font-bold text-white">${totalSpend.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Campaign Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0c1024] border border-white/[0.08] rounded-2xl w-full max-w-lg p-8 space-y-6 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 shadow-2xl">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute right-6 top-6 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white">List New Campaign</h3>
              <p className="text-xs text-slate-400">Submit your affiliate deal parameters for verification.</p>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Campaign Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Woolworths Credit Card Promo"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  className="w-full bg-[#070913] border border-white/10 rounded-xl h-11 px-4 text-xs font-medium text-white focus:outline-none focus:border-[#0052FF]"
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
                  className="w-full bg-[#070913] border border-white/10 rounded-xl p-4 text-xs font-medium text-white focus:outline-none focus:border-[#0052FF]"
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
                  className="w-full bg-[#070913] border border-white/10 rounded-xl h-11 px-4 text-xs font-medium text-white focus:outline-none focus:border-[#0052FF]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payout Type</label>
                  <select
                    value={campPayoutType}
                    onChange={(e) => setCampPayoutType(e.target.value as 'cpa' | 'cpc')}
                    className="w-full bg-[#070913] border border-white/10 rounded-xl h-11 px-4 text-xs font-medium text-white focus:outline-none focus:border-[#0052FF]"
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
                    className="w-full bg-[#070913] border border-white/10 rounded-xl h-11 px-4 text-xs font-medium text-white focus:outline-none focus:border-[#0052FF]"
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
                  className="w-full bg-[#070913] border border-white/10 rounded-xl h-11 px-4 text-xs font-medium text-white focus:outline-none focus:border-[#0052FF]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0052FF] text-white font-bold h-12 rounded-xl text-sm flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 cursor-pointer shadow shadow-blue-500/10 transition-colors"
              >
                {loading ? <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : 'Submit for Approval'}
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

  // Metrics
  const pendingCamps = campaigns.filter(c => c.status === 'pending_approval').length;
  const pendingConvs = conversions.filter(c => c.status === 'pending').length;
  const networkVolume = conversions.filter(c => c.status === 'approved').reduce((acc, c) => acc + Number(c.payout), 0);

  return (
    <div className="min-h-screen bg-[#070913] text-white flex flex-col font-sans selection:bg-[#0052FF]/30">
      {/* Top Navbar */}
      <nav className="border-b border-white/5 bg-[#05070f] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/rewardmate-logo-cropped.png" className="h-6 sm:h-7 w-auto object-contain brightness-0 invert" alt="Reward Mate Logo" />
          <span className="text-xs font-semibold text-[#0052FF] bg-[#0052FF]/10 border border-[#0052FF]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider ml-2">Super Admin</span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Logged In As</div>
            <div className="text-sm font-extrabold text-white">{profile.full_name}</div>
          </div>
          <button 
            onClick={signOut}
            className="flex items-center text-xs font-bold text-slate-350 hover:text-white transition-colors bg-white/[0.04] border border-white/5 px-3 py-2 rounded-xl cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2 text-slate-500" /> Sign Out
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 p-6 md:p-12 max-w-7xl w-full mx-auto space-y-8">
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-[#0c1024] border border-white/[0.04] rounded-2xl p-6 shadow-md">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Network Payout Volume</div>
            <div className="text-2xl font-extrabold text-[#0052FF]">${networkVolume.toFixed(2)} AUD</div>
            <p className="text-[10px] text-slate-500 mt-1">Approved payouts across network</p>
          </div>
          <div className="bg-[#0c1024] border border-white/[0.04] rounded-2xl p-6 shadow-md">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Network Traffic Clicks</div>
            <div className="text-2xl font-extrabold text-white">{clicks.length} Clicks</div>
            <p className="text-[10px] text-slate-500 mt-1">Raw visitor redirects logged</p>
          </div>
          <div className="bg-[#0c1024] border border-white/[0.04] rounded-2xl p-6 shadow-md">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pending Offer Reviews</div>
            <div className="text-2xl font-extrabold text-amber-400">{pendingCamps} Campaigns</div>
            <p className="text-[10px] text-slate-550 mt-1">Requires admin approval</p>
          </div>
          <div className="bg-[#0c1024] border border-white/[0.04] rounded-2xl p-6 shadow-md">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pending Lead Approvals</div>
            <div className="text-2xl font-extrabold text-amber-400">{pendingConvs} Leads</div>
            <p className="text-[10px] text-slate-555 mt-1">Requires audit to credit wallet</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-6 border-b border-white/5 font-sans">
          <button 
            onClick={() => setActiveTab('campaign-approvals')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'campaign-approvals' ? 'border-[#0052FF] text-[#0052FF]' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            Pending Campaign Approvals ({pendingCamps})
          </button>
          <button 
            onClick={() => setActiveTab('conversion-approvals')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'conversion-approvals' ? 'border-[#0052FF] text-[#0052FF]' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            Pending Conversion Audits ({pendingConvs})
          </button>
          <button 
            onClick={() => setActiveTab('users-mgmt')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'users-mgmt' ? 'border-[#0052FF] text-[#0052FF]' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            User Management ({profiles.length})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'campaign-approvals' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Advertiser Offer Approvals</h3>
              <p className="text-xs text-slate-400 font-medium">Verify that the target landing pages comply with program criteria.</p>
            </div>

            {campaigns.filter(c => c.status === 'pending_approval').length === 0 ? (
              <div className="bg-[#0c1024] border border-white/[0.04] p-12 text-center text-slate-500 rounded-2xl">
                <p className="font-bold text-sm">No campaigns pending review.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {campaigns.filter(c => c.status === 'pending_approval').map((camp) => (
                  <div key={camp.id} className="bg-[#0c1024] border border-white/[0.04] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{camp.name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold bg-[#070913] border border-white/5 rounded-full px-2 py-0.5">By {camp.advertiser_name}</span>
                      </div>
                      <p className="text-xs text-slate-400 max-w-xl leading-relaxed">{camp.description}</p>
                      <div className="text-[10px] text-slate-500">
                        URL: <a href={camp.landing_page_url} target="_blank" rel="noreferrer" className="text-[#0052FF] underline">{camp.landing_page_url}</a>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Payout / Budget</div>
                        <div className="text-sm font-extrabold text-[#0052FF]">${Number(camp.payout_amount).toFixed(2)} AUD ({camp.payout_type.toUpperCase()})</div>
                        <div className="text-[10px] text-slate-500">Budget: ${Number(camp.total_budget).toFixed(2)}</div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveCampaign(camp.id)}
                          className="bg-[#0052FF] hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow shadow-blue-500/10"
                        >
                          <Check className="h-4 w-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectCampaign(camp.id)}
                          className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
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
              <h3 className="text-lg font-bold text-white">Conversion Audit Panel</h3>
              <p className="text-xs text-slate-400">Auditing pending leads. Approving transfers the commission from Advertiser balance directly to Publisher wallet.</p>
            </div>

            {conversions.filter(c => c.status === 'pending').length === 0 ? (
              <div className="bg-[#0c1024] border border-white/[0.04] p-12 text-center text-slate-500 rounded-2xl">
                <p className="font-bold text-sm">No conversions pending approval.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {conversions.filter(c => c.status === 'pending').map((conv) => (
                  <div key={conv.id} className="bg-[#0c1024] border border-white/[0.04] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">{conv.campaign_name || conv.campaign?.name}</h4>
                      <div className="text-xs text-slate-400">
                        Publisher: <span className="font-bold text-slate-350">{conv.publisher_name}</span>
                      </div>
                      <div className="text-[10px] text-slate-550 font-mono">TxID: {conv.transaction_id}</div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Payout Commission</div>
                        <div className="text-sm font-extrabold text-[#0052FF]">${Number(conv.payout).toFixed(2)} AUD</div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveConversion(conv.id)}
                          className="bg-[#0052FF] hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow shadow-blue-500/10"
                        >
                          <Check className="h-4 w-4" /> Credit Publisher
                        </button>
                        <button
                          onClick={() => handleRejectConversion(conv.id)}
                          className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
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
              <h3 className="text-lg font-bold text-white">User Management</h3>
              <p className="text-xs text-slate-400">Monitor active system members, impersonate publisher/advertiser views, or revoke profiles.</p>
            </div>

            <div className="bg-[#0c1024] rounded-2xl border border-white/[0.04] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/[0.04] text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-6">Member Profile</th>
                      <th className="py-4 px-6">Type</th>
                      <th className="py-4 px-6">Country</th>
                      <th className="py-4 px-6">Last Active</th>
                      <th className="py-4 px-6 text-right">This Month Stats</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-xs">
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
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-blue-500/10 text-[#0052FF] flex items-center justify-center font-extrabold text-xs border border-[#0052FF]/20 select-none">
                                {p.full_name ? p.full_name.charAt(0).toUpperCase() : p.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white">{p.full_name || 'No Name'}</div>
                                <div className="text-[10px] text-slate-500">{p.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-[9px] font-extrabold uppercase rounded px-2.5 py-0.5 tracking-wider ${
                              p.user_type === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                              p.user_type === 'advertiser' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-[#0052FF]/10 text-[#0052FF] border border-[#0052FF]/20'
                            }`}>
                              {p.user_type}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="flex items-center gap-1.5 font-semibold text-slate-400">
                              <span>{country.flag}</span>
                              <span>{country.code}</span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-400 font-medium">{lastLoggedIn}</td>
                          <td className="py-4 px-6 text-right">
                            <div className="font-bold text-white">
                              {p.user_type === 'publisher' ? `+$${financeVol.toFixed(2)}` : p.user_type === 'advertiser' ? `-$${financeVol.toFixed(2)}` : '-'}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {p.user_type !== 'admin' ? `${clicksCount} clicks` : ''}
                            </div>
                          </td>
                          <td className="py-4 px-6 font-sans">
                            <div className="flex items-center justify-center gap-2">
                              {!isSelf && p.user_type !== 'admin' && (
                                <button
                                  onClick={() => impersonateUser?.(p)}
                                  className="bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] text-slate-300 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer text-[10px]"
                                >
                                  Login As
                                </button>
                              )}
                              {!isSelf && (
                                <button
                                  onClick={() => handleRemoveUser(p.id)}
                                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer text-[10px] border border-rose-500/20"
                                >
                                  Remove
                                </button>
                              )}
                              {isSelf && (
                                <span className="text-[10px] font-bold text-slate-500 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/5">
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
  );
}
