import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getCampaigns, createCampaign, updateCampaignStatus, 
  getAffiliateLinks, generateAffiliateLink, logClick, 
  getClicks, getConversions, updateConversionStatus, createConversion
} from '../lib/mockDatabase';
import type { Campaign, AffiliateLink, Click, Conversion } from '../lib/mockDatabase';
import { toast } from 'sonner';
import { 
  LogOut, DollarSign, MousePointer, CheckCircle, Plus, Copy, 
  Play, TrendingUp, Check, X, AlertCircle 
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile, signOut, updateBalance } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
      {/* Top Navbar */}
      <nav className="border-b border-slate-100 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/rewardmate-logo-cropped.png" className="h-5 sm:h-6 w-auto object-contain" alt="RewardMate Logo" />
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider ml-2">Advertiser</span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">Wallet Balance</div>
            <div className="text-sm font-extrabold text-[#0052FF]">${Number(profile.wallet_balance).toFixed(2)} AUD</div>
          </div>
          <button 
            onClick={signOut}
            className="flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors bg-slate-100 px-3 py-2 rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </button>
        </div>
      </nav>

      {/* Main Section */}
      <main className="flex-1 p-6 md:p-12 max-w-7xl w-full mx-auto space-y-8">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="premium-glass-panel p-6">
            <div className="flex justify-between items-center text-slate-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Spend</span>
              <DollarSign className="h-5 w-5 text-[#0052FF]" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">${totalSpend.toFixed(2)}</div>
            <p className="text-[11px] text-slate-600 mt-2">Deducted from budget for approved conversions</p>
          </div>
          <div className="premium-glass-panel p-6">
            <div className="flex justify-between items-center text-slate-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Active Campaigns</span>
              <TrendingUp className="h-5 w-5 text-[#0052FF]" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{activeCampaigns}</div>
            <p className="text-[11px] text-slate-600 mt-2">Out of {campaigns.length} campaigns listed</p>
          </div>
          <div className="premium-glass-panel p-6">
            <div className="flex justify-between items-center text-slate-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Acquisition Wallet</span>
              <MousePointer className="h-5 w-5 text-[#0052FF]" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">${Number(profile.wallet_balance).toFixed(2)}</div>
            <p className="text-[11px] text-slate-600 mt-2">Available for campaign allocation</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex space-x-4 border-b border-slate-200/80">
          <button 
            onClick={() => setActiveTab('campaigns')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'campaigns' ? 'border-blue-600 text-[#0052FF]' : 'border-transparent text-slate-600 hover:text-slate-200'}`}
          >
            My Campaigns
          </button>
          <button 
            onClick={() => setActiveTab('wallet')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'wallet' ? 'border-blue-600 text-[#0052FF]' : 'border-transparent text-slate-600 hover:text-slate-200'}`}
          >
            Deposit & Wallet
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Campaign Directory</h3>
                <p className="text-xs text-slate-600">Submit, pause, and monitor performance offers</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-[#0052FF] hover:bg-blue-700 text-white font-bold text-xs h-10 px-5 rounded-xl flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Create Offer
              </button>
            </div>

            {campaigns.length === 0 ? (
              <div className="premium-glass-panel p-12 text-center text-slate-600 space-y-3">
                <AlertCircle className="h-10 w-10 text-slate-600 mx-auto" />
                <p className="font-bold text-sm">No campaigns created yet.</p>
                <p className="text-xs max-w-sm mx-auto">Click "Create Offer" to submit your first campaign for Admin approval.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {campaigns.map((camp) => (
                  <div key={camp.id} className="premium-glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-bold text-slate-900">{camp.name}</h4>
                        <span className={`text-[10px] font-extrabold rounded-full px-2.5 py-0.5 border ${
                          camp.status === 'active' ? 'bg-blue-500/10 border-blue-600/30 text-[#0052FF]' :
                          camp.status === 'pending_approval' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                          'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                          {camp.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 max-w-xl">{camp.description}</p>
                      <div className="text-[11px] text-slate-600 pt-1">
                        URL: <a href={camp.landing_page_url} target="_blank" rel="noreferrer" className="text-[#0052FF] underline">{camp.landing_page_url}</a>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 text-right shrink-0">
                      <div>
                        <div className="text-xs text-slate-600">Payout Rate</div>
                        <div className="text-sm font-bold text-slate-900">${Number(camp.payout_amount).toFixed(2)} AUD <span className="text-[10px] text-slate-600 uppercase">{camp.payout_type}</span></div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600">Spend / Budget</div>
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
          <div className="grid md:grid-cols-2 gap-8">
            <div className="premium-glass-panel p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Deposit Budget</h3>
                <p className="text-xs text-slate-600">Add funds to allocate to your affiliate campaigns.</p>
              </div>

              <form onSubmit={handleDeposit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Amount (AUD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                    <input 
                      type="number" 
                      placeholder="e.g. 500"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0052FF] text-white font-bold h-12 rounded-xl text-sm flex items-center justify-center hover:bg-blue-500 transition-colors"
                >
                  Deposit Sandbox Funds
                </button>
              </form>
            </div>

            <div className="premium-glass-panel p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Wallet Overview</h3>
                <p className="text-xs text-slate-600">Summary of advertiser credit balance.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/[0.03]">
                  <span className="text-sm text-slate-600">Available Balance</span>
                  <span className="text-base font-extrabold text-[#0052FF]">${Number(profile.wallet_balance).toFixed(2)} AUD</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/[0.03]">
                  <span className="text-sm text-slate-600">Pending Campaign Allocations</span>
                  <span className="text-sm font-bold text-slate-900">
                    ${campaigns.filter(c => c.status === 'pending_approval').reduce((acc, c) => acc + Number(c.total_budget), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-slate-600">Total Capital Spent</span>
                  <span className="text-sm font-bold text-slate-900">${totalSpend.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Campaign Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-50 border border-slate-200/50 border border-slate-200 rounded-2xl w-full max-w-lg p-8 space-y-6 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute right-6 top-6 text-slate-600 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white">List New Campaign</h3>
              <p className="text-xs text-slate-600">Submit your affiliate deal parameters for verification.</p>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Campaign Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Woolworths Credit Card Promo"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Description</label>
                <textarea 
                  placeholder="Summarize the offer criteria, target audience, and traffic restrictions..."
                  value={campDesc}
                  onChange={(e) => setCampDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0d0f17] border border-slate-200 rounded-xl p-4 text-xs font-medium text-white focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Landing Page URL</label>
                <input 
                  type="url" 
                  placeholder="https://www.company.com/promotion"
                  value={campUrl}
                  onChange={(e) => setCampUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Payout Type</label>
                  <select
                    value={campPayoutType}
                    onChange={(e) => setCampPayoutType(e.target.value as 'cpa' | 'cpc')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white"
                  >
                    <option value="cpa">CPA (Cost per Acquisition)</option>
                    <option value="cpc">CPC (Cost per Click)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Payout Payout ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="e.g. 50.00"
                    value={campPayoutAmount}
                    onChange={(e) => setCampPayoutAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Campaign Budget ($)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 2000"
                  value={campBudget}
                  onChange={(e) => setCampBudget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0052FF] text-white font-bold h-12 rounded-xl text-sm flex items-center justify-center hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? <div className="h-5 w-5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" /> : 'Submit for Approval'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 2. PUBLISHER DASHBOARD
// ----------------------------------------------------
function PublisherDashboard({ profile, updateBalance, signOut, }: { profile: any, updateBalance: any, signOut: any }) {
  const { isMock } = useAuth();
  const [activeTab, setActiveTab] = useState<'offers' | 'my-links' | 'clicks-conv' | 'wallet'>('offers');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [myLinks, setMyLinks] = useState<AffiliateLink[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');

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
      // 1. Log click
      await logClick(link.code);

      // 2. Roll 70% conversion chance for demonstration
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
    } catch (err) {}
  };

  // Metrics
  const totalEarnings = conversions.filter(c => c.status === 'approved').reduce((acc, c) => acc + Number(c.payout), 0);
  const clickCount = clicks.length;
  const convCount = conversions.length;
  const epc = clickCount > 0 ? (totalEarnings / clickCount) : 0.00;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
      {/* Top Navbar */}
      <nav className="border-b border-slate-100 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/rewardmate-logo-cropped.png" className="h-5 sm:h-6 w-auto object-contain" alt="RewardMate Logo" />
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider ml-2">Publisher</span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">Available Earnings</div>
            <div className="text-sm font-extrabold text-[#0052FF]">${Number(profile.wallet_balance).toFixed(2)} AUD</div>
          </div>
          <button 
            onClick={signOut}
            className="flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors bg-slate-100 px-3 py-2 rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 p-6 md:p-12 max-w-7xl w-full mx-auto space-y-8">
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="premium-glass-panel p-6">
            <div className="flex justify-between items-center text-slate-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Earnings</span>
              <DollarSign className="h-5 w-5 text-[#0052FF]" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">${totalEarnings.toFixed(2)}</div>
            <p className="text-[10px] text-slate-600 mt-1">From approved conversions</p>
          </div>
          <div className="premium-glass-panel p-6">
            <div className="flex justify-between items-center text-slate-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Conversions</span>
              <CheckCircle className="h-5 w-5 text-[#0052FF]" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{convCount}</div>
            <p className="text-[10px] text-slate-600 mt-1">Approved & pending leads</p>
          </div>
          <div className="premium-glass-panel p-6">
            <div className="flex justify-between items-center text-slate-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Clicks</span>
              <MousePointer className="h-5 w-5 text-[#0052FF]" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{clickCount}</div>
            <p className="text-[10px] text-slate-600 mt-1">Total click logs tracked</p>
          </div>
          <div className="premium-glass-panel p-6">
            <div className="flex justify-between items-center text-slate-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">EPC</span>
              <TrendingUp className="h-5 w-5 text-[#0052FF]" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">${epc.toFixed(2)}</div>
            <p className="text-[10px] text-slate-600 mt-1">Earnings per click average</p>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex space-x-6 border-b border-slate-200/80">
          <button 
            onClick={() => setActiveTab('offers')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'offers' ? 'border-blue-600 text-[#0052FF]' : 'border-transparent text-slate-600 hover:text-slate-200'}`}
          >
            Find Offers ({campaigns.length})
          </button>
          <button 
            onClick={() => setActiveTab('my-links')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'my-links' ? 'border-blue-600 text-[#0052FF]' : 'border-transparent text-slate-600 hover:text-slate-200'}`}
          >
            My Affiliate Links ({myLinks.length})
          </button>
          <button 
            onClick={() => setActiveTab('clicks-conv')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'clicks-conv' ? 'border-blue-600 text-[#0052FF]' : 'border-transparent text-slate-600 hover:text-slate-200'}`}
          >
            Traffic & Conversion logs
          </button>
          <button 
            onClick={() => setActiveTab('wallet')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'wallet' ? 'border-blue-600 text-[#0052FF]' : 'border-transparent text-slate-600 hover:text-slate-200'}`}
          >
            Withdraw Wallet
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Browse Active Affiliate Campaigns</h3>
              <p className="text-xs text-slate-600 font-medium">Join networks and copy your tracking URLs instantly.</p>
            </div>

            <div className="grid gap-4">
              {campaigns.map((camp) => {
                const joined = myLinks.some(l => l.campaign_id === camp.id);
                return (
                  <div key={camp.id} className="premium-glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">{camp.name}</h4>
                      <p className="text-xs text-slate-600 max-w-xl leading-relaxed">{camp.description}</p>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-slate-600">Payout Rate</div>
                        <div className="text-sm font-extrabold text-[#0052FF]">${Number(camp.payout_amount).toFixed(2)} AUD</div>
                        <div className="text-[10px] text-slate-600 uppercase tracking-wider">{camp.payout_type}</div>
                      </div>
                      
                      {joined ? (
                        <span className="text-xs bg-slate-900 border border-slate-200/80 text-slate-600 font-bold px-4 py-2.5 rounded-xl">
                          Link Generated
                        </span>
                      ) : (
                        <button
                          onClick={() => handleGenerateLink(camp.id)}
                          className="bg-[#0052FF] hover:bg-blue-700 text-white font-bold text-xs h-10 px-5 rounded-xl transition-all"
                        >
                          Generate Link
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'my-links' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Your Affiliate Channels</h3>
              <p className="text-xs text-slate-600">Copy link and start driving traffic. Click "Simulate Click" to generate dummy conversions instantly in sandbox.</p>
            </div>

            {myLinks.length === 0 ? (
              <div className="premium-glass-panel p-12 text-center text-slate-600">
                <p className="font-bold text-sm">No links generated yet. Go to "Find Offers" to choose a campaign.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {myLinks.map((link) => (
                  <div key={link.id} className="premium-glass-panel p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{link.campaign?.name}</h4>
                        <p className="text-xs text-slate-600 mt-1">{link.campaign?.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-600">Payout Rate</div>
                        <div className="text-xs font-bold text-[#0052FF]">${Number(link.campaign?.payout_amount).toFixed(2)} AUD ({link.campaign?.payout_type.toUpperCase()})</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                      <div className="flex-1 bg-[#0d0f17] border border-slate-200 rounded-xl h-11 px-4 flex items-center text-xs text-slate-600 overflow-hidden text-ellipsis whitespace-nowrap">
                        {`${window.location.origin}/click/${link.code}`}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyLink(link.code)}
                          className="bg-white/5 border border-slate-200 hover:bg-white/10 text-white font-bold text-xs h-11 px-4 rounded-xl flex items-center gap-1.5 shrink-0"
                        >
                          <Copy className="h-4 w-4" /> Copy Link
                        </button>
                        
                        {isMock && (
                          <button
                            onClick={() => handleSimulateClickAndConversion(link)}
                            className="bg-blue-500/10 hover:bg-blue-600/20 border border-blue-600/30 text-[#0052FF] font-bold text-xs h-11 px-4 rounded-xl flex items-center gap-1.5 shrink-0"
                          >
                            <Play className="h-4 w-4" /> Simulate Traffic
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'clicks-conv' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Click Log */}
            <div className="premium-glass-panel p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MousePointer className="h-4 w-4 text-[#0052FF]" /> Click Log history
              </h3>
              <div className="max-h-[350px] overflow-y-auto space-y-3">
                {clicks.length === 0 ? (
                  <p className="text-xs text-slate-600 text-center py-8">No clicks logged yet.</p>
                ) : (
                  clicks.map((c) => (
                    <div key={c.id} className="bg-slate-900/60 border border-white/[0.03] p-3 rounded-xl flex justify-between items-center">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{c.campaign?.name}</div>
                        <div className="text-[10px] text-slate-600 mt-0.5">IP: {c.ip_address} • Ref: {c.referrer}</div>
                      </div>
                      <div className="text-[10px] text-slate-600">
                        {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Conversions Log */}
            <div className="premium-glass-panel p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#0052FF]" /> Conversion Transactions
              </h3>
              <div className="max-h-[350px] overflow-y-auto space-y-3">
                {conversions.length === 0 ? (
                  <p className="text-xs text-slate-600 text-center py-8">No conversions logged yet.</p>
                ) : (
                  conversions.map((conv) => (
                    <div key={conv.id} className="bg-slate-900/60 border border-white/[0.03] p-3 rounded-xl flex justify-between items-center">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{conv.campaign_name || conv.campaign?.name}</div>
                        <div className="text-[10px] text-slate-600 mt-0.5">TxID: {conv.transaction_id}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-[#0052FF]">+${Number(conv.payout).toFixed(2)}</div>
                        <span className={`text-[9px] font-extrabold uppercase rounded px-1.5 py-0.5 ${
                          conv.status === 'approved' ? 'bg-blue-500/10 text-[#0052FF]' :
                          conv.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-red-500/10 text-red-400'
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

        {activeTab === 'wallet' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="premium-glass-panel p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Withdraw Earnings</h3>
                <p className="text-xs text-slate-600">Transfer your cleared earnings directly to your bank account (AUD).</p>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Withdraw Amount ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                    <input 
                      type="number" 
                      placeholder="e.g. 100"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0052FF] text-white font-bold h-12 rounded-xl text-sm flex items-center justify-center hover:bg-blue-500 transition-colors"
                >
                  Confirm Sandbox Withdrawal
                </button>
              </form>
            </div>

            <div className="premium-glass-panel p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Earnings Ledger</h3>
                <p className="text-xs text-slate-600">Summary of publisher financial status.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/[0.03]">
                  <span className="text-sm text-slate-600">Available Balance</span>
                  <span className="text-base font-extrabold text-[#0052FF]">${Number(profile.wallet_balance).toFixed(2)} AUD</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/[0.03]">
                  <span className="text-sm text-slate-600">Pending Approvals</span>
                  <span className="text-sm font-bold text-slate-900">
                    ${conversions.filter(c => c.status === 'pending').reduce((acc, c) => acc + Number(c.payout), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-slate-600">Total Lifetime Payouts</span>
                  <span className="text-sm font-bold text-slate-900">${totalEarnings.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ----------------------------------------------------
// 3. ADMIN DASHBOARD
// ----------------------------------------------------
function AdminDashboard({ profile, signOut }: { profile: any, signOut: any }) {
  const [activeTab, setActiveTab] = useState<'campaign-approvals' | 'conversion-approvals'>('campaign-approvals');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);

  const loadData = async () => {
    try {
      const camps = await getCampaigns();
      setCampaigns(camps);

      const convs = await getConversions('admin');
      setConversions(convs);

      const clickLogs = await getClicks();
      setClicks(clickLogs);
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

  // Metrics
  const pendingCamps = campaigns.filter(c => c.status === 'pending_approval').length;
  const pendingConvs = conversions.filter(c => c.status === 'pending').length;
  const networkVolume = conversions.filter(c => c.status === 'approved').reduce((acc, c) => acc + Number(c.payout), 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
      {/* Top Navbar */}
      <nav className="border-b border-slate-100 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/rewardmate-logo-cropped.png" className="h-5 sm:h-6 w-auto object-contain" alt="RewardMate Logo" />
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider ml-2">Super Admin</span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">Logged In As</div>
            <div className="text-sm font-extrabold text-[#0052FF]">{profile.full_name}</div>
          </div>
          <button 
            onClick={signOut}
            className="flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors bg-slate-100 px-3 py-2 rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 p-6 md:p-12 max-w-7xl w-full mx-auto space-y-8">
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="premium-glass-panel p-6">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Network Payout Volume</div>
            <div className="text-2xl font-extrabold text-slate-900">${networkVolume.toFixed(2)} AUD</div>
            <p className="text-[10px] text-slate-600 mt-1">Approved payouts across network</p>
          </div>
          <div className="premium-glass-panel p-6">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Network Traffic Clicks</div>
            <div className="text-2xl font-extrabold text-slate-900">{clicks.length} Clicks</div>
            <p className="text-[10px] text-slate-600 mt-1">Raw visitor redirects logged</p>
          </div>
          <div className="premium-glass-panel p-6">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Pending Offer Reviews</div>
            <div className="text-2xl font-extrabold text-amber-400">{pendingCamps} Campaigns</div>
            <p className="text-[10px] text-slate-600 mt-1">Requires admin approval</p>
          </div>
          <div className="premium-glass-panel p-6">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Pending Lead Approvals</div>
            <div className="text-2xl font-extrabold text-amber-400">{pendingConvs} Leads</div>
            <p className="text-[10px] text-slate-600 mt-1">Requires audit to credit wallet</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-6 border-b border-slate-200/80">
          <button 
            onClick={() => setActiveTab('campaign-approvals')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'campaign-approvals' ? 'border-blue-600 text-[#0052FF]' : 'border-transparent text-slate-600 hover:text-slate-200'}`}
          >
            Pending Campaign Approvals ({pendingCamps})
          </button>
          <button 
            onClick={() => setActiveTab('conversion-approvals')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'conversion-approvals' ? 'border-blue-600 text-[#0052FF]' : 'border-transparent text-slate-600 hover:text-slate-200'}`}
          >
            Pending Conversion Audits ({pendingConvs})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'campaign-approvals' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Advertiser Offer Approvals</h3>
              <p className="text-xs text-slate-600 font-medium">Verify that the target landing pages comply with program criteria.</p>
            </div>

            {campaigns.filter(c => c.status === 'pending_approval').length === 0 ? (
              <div className="premium-glass-panel p-12 text-center text-slate-600">
                <p className="font-bold text-sm">No campaigns pending review.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {campaigns.filter(c => c.status === 'pending_approval').map((camp) => (
                  <div key={camp.id} className="premium-glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">{camp.name}</h4>
                        <span className="text-[10px] text-slate-600 font-semibold bg-slate-900 border border-slate-200/80 rounded-full px-2 py-0.5">By {camp.advertiser_name}</span>
                      </div>
                      <p className="text-xs text-slate-600 max-w-xl leading-relaxed">{camp.description}</p>
                      <div className="text-[10px] text-slate-600">
                        URL: <a href={camp.landing_page_url} target="_blank" rel="noreferrer" className="text-[#0052FF] underline">{camp.landing_page_url}</a>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-slate-600">Payout / Budget</div>
                        <div className="text-sm font-extrabold text-white">${Number(camp.payout_amount).toFixed(2)} AUD ({camp.payout_type.toUpperCase()})</div>
                        <div className="text-[10px] text-slate-600">Budget: ${Number(camp.total_budget).toFixed(2)}</div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveCampaign(camp.id)}
                          className="bg-[#0052FF] hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1"
                        >
                          <Check className="h-4 w-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectCampaign(camp.id)}
                          className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1"
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
              <p className="text-xs text-slate-600">Auditing pending leads. Approving transfers the commission from Advertiser balance directly to Publisher wallet.</p>
            </div>

            {conversions.filter(c => c.status === 'pending').length === 0 ? (
              <div className="premium-glass-panel p-12 text-center text-slate-600">
                <p className="font-bold text-sm">No conversions pending approval.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {conversions.filter(c => c.status === 'pending').map((conv) => (
                  <div key={conv.id} className="premium-glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">{conv.campaign_name || conv.campaign?.name}</h4>
                      <div className="text-xs text-slate-600">
                        Publisher: <span className="font-bold text-white">{conv.publisher_name}</span>
                      </div>
                      <div className="text-[10px] text-slate-600">TxID: {conv.transaction_id}</div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-slate-600">Payout Commission</div>
                        <div className="text-sm font-extrabold text-[#0052FF]">${Number(conv.payout).toFixed(2)} AUD</div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveConversion(conv.id)}
                          className="bg-[#0052FF] hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1"
                        >
                          <Check className="h-4 w-4" /> Credit Publisher
                        </button>
                        <button
                          onClick={() => handleRejectConversion(conv.id)}
                          className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1"
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

      </main>
    </div>
  );
}
