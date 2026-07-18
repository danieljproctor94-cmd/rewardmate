import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PublisherDashboard from './PublisherDashboard';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { 
  getCampaigns, createCampaign, updateCampaignStatus, updateCampaignDetails, 
  getClicks, getConversions, updateConversionStatus,
  getMessages, sendMessage, getAllAffiliateLinks,
  getContactInquiries, markContactInquiryReplied,
  getProgramApplications, updateApplicationStatus,
  getBrandCreatives, addBrandCreative, deleteBrandCreative,
  getAdvertiserClicks,
  getInvoices, getAllInvoices, payInvoice, syncActiveInvoice
} from '../lib/mockDatabase';
import type { Campaign, Click, Conversion, AffiliateLink, ContactInquiry, ProgramApplication, BrandCreative } from '../lib/mockDatabase';
import { toast } from 'sonner';
import { 
  LogOut, DollarSign, MousePointer, Plus, 
  TrendingUp, Check, X, AlertCircle, FolderKanban, Users, Mail, Bell,
  ChevronLeft, ChevronRight, Menu, Sliders, Building, LayoutDashboard,
  Image as ImageIcon, Receipt, Download
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export const formatUserId = (id: string | undefined): string => {
  if (!id) return '';
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const numericId = Math.abs(hash) % 100000;
  return String(numericId).padStart(5, '0');
};

export const printInvoice = (inv: any, brand: any) => {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    toast.error('Popup blocker prevented invoice download. Please allow popups for this site.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${inv.id}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 40px;
            font-size: 14px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 30px;
            margin-bottom: 40px;
          }
          .logo-container img {
            height: 32px;
            width: auto;
            object-fit: contain;
            filter: brightness(0);
          }
          .corporate-details {
            text-align: left;
            margin-top: 15px;
            font-size: 12px;
            color: #64748b;
            line-height: 1.6;
          }
          .invoice-meta {
            text-align: right;
          }
          .invoice-title {
            font-size: 28px;
            font-weight: 900;
            color: #0f172a;
            margin: 0 0 10px 0;
            letter-spacing: -0.5px;
          }
          .meta-item {
            margin-bottom: 6px;
            font-size: 13px;
          }
          .meta-label {
            color: #64748b;
            font-weight: 600;
          }
          .meta-value {
            font-weight: 700;
            color: #0f172a;
          }
          .details-grid {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            gap: 40px;
          }
          .details-block {
            flex: 1;
          }
          .details-block h4 {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #94a3b8;
            margin: 0 0 10px 0;
            font-weight: 800;
          }
          .details-content {
            font-size: 13px;
            line-height: 1.6;
          }
          .details-content .name {
            font-weight: 800;
            font-size: 15px;
            color: #0f172a;
            margin-bottom: 4px;
          }
          .table-container {
            margin-bottom: 40px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }
          th {
            background-color: #f8fafc;
            font-weight: 800;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #475569;
            padding: 12px 16px;
            border-bottom: 2px solid #e2e8f0;
          }
          td {
            padding: 16px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 13px;
          }
          td.numeric, th.numeric {
            text-align: right;
          }
          td.center, th.center {
            text-align: center;
          }
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
          }
          .totals-table {
            width: 320px;
          }
          .totals-table tr td {
            padding: 10px 16px;
            border: none;
          }
          .totals-table tr.grand-total td {
            border-top: 2px solid #e2e8f0;
            border-bottom: 2px solid #e2e8f0;
            font-size: 16px;
            font-weight: 900;
            color: #0f172a;
          }
          .payment-status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 15px;
          }
          .status-paid {
            background-color: #dcfce7;
            color: #15803d;
            border: 1px solid #bbf7d0;
          }
          .status-unpaid {
            background-color: #fef3c7;
            color: #b45309;
            border: 1px solid #fde68a;
          }
          .footer-note {
            margin-top: 80px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            font-weight: 500;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo-container">
              <img src="/rewardmate-logo-cropped.png" alt="Reward Mate Logo" />
            </div>
            <div class="corporate-details">
              <strong>REWARD MATE PTY LTD</strong><br />
              ACN: 700 041 676<br />
              Noosaville QLD, Australia<br />
              support@rewardmate.com.au
            </div>
          </div>
          <div class="invoice-meta">
            <h1 class="invoice-title">TAX INVOICE</h1>
            <div class="meta-item">
              <span class="meta-label">Invoice No:</span>
              <span class="meta-value">${inv.id}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Date Issued:</span>
              <span class="meta-value">${inv.issueDate}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Due Date:</span>
              <span class="meta-value">${inv.dueDate}</span>
            </div>
            <div class="payment-status ${inv.status === 'paid' ? 'status-paid' : 'status-unpaid'}">
              Status: ${inv.status === 'paid' ? 'Paid' : 'Unpaid'}
            </div>
          </div>
        </div>

        <div class="details-grid">
          <div class="details-block">
            <h4>Billed To</h4>
            <div class="details-content">
              <div class="name">${brand.business_name || brand.full_name || 'Brand Partner'}</div>
              <div>Advertiser ID: ${brand.id}</div>
              <div>Email Address: ${brand.email || ''}</div>
            </div>
          </div>
          <div class="details-block" style="text-align: right;">
            <h4>Remit Payment To</h4>
            <div class="details-content">
              <strong>Reward Mate Corporate</strong><br />
              Bank: <strong>Bendigo Bank</strong><br />
              BSB: <strong style="font-family: monospace;">633-000</strong><br />
              Account No: <strong style="font-family: monospace;">Coming Soon</strong><br />
              Payment Ref: <strong style="font-family: monospace;">${inv.id}</strong>
            </div>
          </div>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="center">Conversions</th>
                <th class="numeric">Amount (AUD)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Approved Affiliate Referrals (Billing Month: ${inv.month})</td>
                <td class="center">${inv.conversionsCount}</td>
                <td class="numeric">$${Number(inv.commissionDue).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">RewardMate Platform Campaign Service Fee</td>
                <td class="center" style="color: #64748b;">-</td>
                <td class="numeric" style="color: #16a34a; font-weight: bold;">FREE</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="totals-section">
          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">$${Number(inv.commissionDue).toFixed(2)} AUD</td>
            </tr>
            <tr>
              <td>GST (10% Inc):</td>
              <td style="text-align: right;">$${(Number(inv.commissionDue) * 0.1).toFixed(2)} AUD</td>
            </tr>
            <tr class="grand-total">
              <td>Total Payable:</td>
              <td style="text-align: right;">$${Number(inv.commissionDue).toFixed(2)} AUD</td>
            </tr>
          </table>
        </div>

        <div class="footer-note">
          Thank you for promoting with the Reward Mate Performance Network.<br />
          For any billing enquiries, please contact support@rewardmate.com.au.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
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
      return <AdvertiserDashboard profile={profile} signOut={signOut} />;
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
function AdvertiserDashboard({ profile, signOut, }: { profile: any, signOut: any }) {
  const { updateProfileDetails } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'wallet' | 'messages' | 'affiliates' | 'brand-settings' | 'transactions'>('overview');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Form fields for new campaign
  const [campName, setCampName] = useState('');
  const [campDesc, setCampDesc] = useState('');
  const [campUrl, setCampUrl] = useState('');
  const [campPayoutType, setCampPayoutType] = useState<'cpa' | 'revshare' | 'cpc'>('cpa');
  const [campPayoutAmount, setCampPayoutAmount] = useState('');
  const [campCategory, setCampCategory] = useState('Retail');
  const [loading, setLoading] = useState(false);
  const [programApplications, setProgramApplications] = useState<ProgramApplication[]>([]);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [selectedPublisherForModal, setSelectedPublisherForModal] = useState<any | null>(null);
  const [hasClickedAffiliates, setHasClickedAffiliates] = useState(false);
  const [prevPendingCount, setPrevPendingCount] = useState(0);
  
  // Edit Campaign state
  const [selectedCampaignForEdit, setSelectedCampaignForEdit] = useState<Campaign | null>(null);
  const [editCampName, setEditCampName] = useState('');
  const [editCampDesc, setEditCampDesc] = useState('');
  const [editCampUrl, setEditCampUrl] = useState('');
  const [editCampPayoutType, setEditCampPayoutType] = useState<'cpa' | 'revshare' | 'cpc'>('cpa');
  const [editCampPayoutAmount, setEditCampPayoutAmount] = useState('');
  const [editCampCategory, setEditCampCategory] = useState('Retail');

  const pendingApplicationsCount = programApplications.filter(app => app.status === 'pending').length;

  useEffect(() => {
    if (activeTab === 'affiliates') {
      setHasClickedAffiliates(true);
    }
  }, [activeTab]);

  useEffect(() => {
    if (pendingApplicationsCount > prevPendingCount) {
      setHasClickedAffiliates(false);
    }
    setPrevPendingCount(pendingApplicationsCount);
  }, [pendingApplicationsCount]);

  const [brandCreatives, setBrandCreatives] = useState<BrandCreative[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [creativeImageUrl, setCreativeImageUrl] = useState('');
  const [brandLogoUrl, setBrandLogoUrl] = useState(profile?.avatar_url || '');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Initialize and load invoices
  useEffect(() => {
    if (!profile?.id) return;
    
    const loadInvoices = async () => {
      try {
        const loadedInvs = await getInvoices(profile.id);
        
        // Calculate live commission due
        const approvedConvs = conversions.filter(c => c.status === 'approved');
        const liveCommission = approvedConvs.reduce((sum, c) => sum + Number(c.payout), 0);
        const liveCount = approvedConvs.length;

        // If there's an active (payable) invoice, sync it with live database conversions
        const activeInvoice = loadedInvs.find((inv: any) => inv.status === 'payable');
        if (activeInvoice) {
          const finalCommission = liveCommission > 0 ? liveCommission : activeInvoice.commissionDue;
          const finalCount = liveCount > 0 ? liveCount : activeInvoice.conversionsCount;
          
          if (activeInvoice.commissionDue !== finalCommission || activeInvoice.conversionsCount !== finalCount) {
            await syncActiveInvoice(activeInvoice.id, profile.id, finalCommission, finalCount);
            // Re-fetch
            const refreshed = await getInvoices(profile.id);
            setInvoices(refreshed);
            setSelectedInvoice(refreshed.find((i: any) => i.id === activeInvoice.id) || refreshed[0]);
            return;
          }
        }
        
        setInvoices(loadedInvs);
        if (!selectedInvoice && loadedInvs.length > 0) {
          setSelectedInvoice(loadedInvs.find((i: any) => i.status === 'payable') || loadedInvs[0]);
        }
      } catch (err) {
        console.error('Error loading invoices:', err);
      }
    };
    
    loadInvoices();
  }, [profile?.id, conversions]);

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      if (!profile?.id) return;
      await payInvoice(invoiceId, profile.id);
      
      const refreshed = await getInvoices(profile.id);
      setInvoices(refreshed);
      
      const newSel = refreshed.find(inv => inv.id === invoiceId);
      if (newSel) setSelectedInvoice(newSel);

      toast.success(`Invoice ${invoiceId} has been successfully paid!`);
    } catch (err) {
      console.error('Error paying invoice:', err);
      toast.error('Failed to complete payment.');
    }
  };

  useEffect(() => {
    if (profile) {
      setBrandLogoUrl(profile.avatar_url || '');
      const countries = profile.target_countries 
        ? profile.target_countries.split(',').map((c: string) => c.trim()) 
        : [];
      setSelectedCountries(countries);
    }
  }, [profile]);

  const [messages, setMessages] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [searchContactText, setSearchContactText] = useState('');

  const loadData = async () => {
    try {
      const all = await getCampaigns();
      setCampaigns(all.filter(c => c.advertiser_id === profile.id));

      try {
        const apps = await getProgramApplications('advertiser', profile.id);
        setProgramApplications(apps);
      } catch (e) {
        setProgramApplications([]);
      }

      try {
        const creatives = await getBrandCreatives(profile.id);
        setBrandCreatives(creatives);
      } catch (e) {
        setBrandCreatives([]);
      }

      try {
        const advertiserClicks = await getAdvertiserClicks(profile.id);
        setClicks(advertiserClicks);
      } catch (e) {
        setClicks([]);
      }

      try {
        const advertiserConvs = await getConversions('advertiser', profile.id);
        setConversions(advertiserConvs);
      } catch (e) {
        setConversions([]);
      }

      try {
        const links = await getAllAffiliateLinks();
        setAffiliateLinks(links);
      } catch (e) {
        setAffiliateLinks([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error('Image file must be under 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 128;
        const MAX_HEIGHT = 128;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setBrandLogoUrl(compressedBase64);
          toast.success('Brand logo loaded! Save settings to apply.');
        }
      };
      img.src = base64Str;
    };
    reader.readAsDataURL(file);
  };

  const handleCreativeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Creative image file must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      setCreativeImageUrl(base64Str);
      toast.success('Creative image loaded! Ready to submit.');
    };
    reader.readAsDataURL(file);
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

      // Filter contacts for advertisers to only those with existing message history
      if (profile.user_type === 'advertiser') {
        const activeUserIds = new Set<string>();
        allMsgs.forEach((m: any) => {
          if (m.sender_id === profile.id) {
            activeUserIds.add(m.receiver_id);
          }
          if (m.receiver_id === profile.id) {
            activeUserIds.add(m.sender_id);
          }
        });
        fetchedContacts = fetchedContacts.filter((c: any) => activeUserIds.has(c.id));
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
    setLoading(true);

    try {
      await createCampaign({
        advertiser_id: profile.id,
        advertiser_name: profile.full_name,
        name: campName,
        description: campDesc,
        landing_page_url: campUrl,
        payout_type: campPayoutType,
        payout_amount: Number(campPayoutAmount),
        category: campCategory,
        status: 'pending_approval',
        total_budget: 0
      });

      toast.success('Offer submitted for Admin approval!');
      setShowCreateModal(false);
      
      // Reset form
      setCampName('');
      setCampDesc('');
      setCampUrl('');
      setCampPayoutAmount('');
      setCampCategory('Retail');
      
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditCampaign = (camp: Campaign) => {
    setSelectedCampaignForEdit(camp);
    setEditCampName(camp.name);
    setEditCampDesc(camp.description);
    setEditCampUrl(camp.landing_page_url);
    setEditCampPayoutType(camp.payout_type);
    setEditCampPayoutAmount(String(camp.payout_amount));
    setEditCampCategory(camp.category || 'Retail');
  };

  const handleSaveEditCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignForEdit) return;
    setLoading(true);

    try {
      await updateCampaignDetails(selectedCampaignForEdit.id, {
        name: editCampName,
        description: editCampDesc,
        landing_page_url: editCampUrl,
        payout_type: editCampPayoutType,
        payout_amount: Number(editCampPayoutAmount),
        category: editCampCategory
      });

      toast.success('Campaign details updated successfully!');
      setSelectedCampaignForEdit(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update campaign details.');
    } finally {
      setLoading(false);
    }
  };



  // Derived metrics
  const totalSpend = campaigns.reduce((acc, c) => acc + Number(c.spend), 0);
  const totalSales = conversions
    .filter(c => c.status === 'approved')
    .reduce((acc, c) => acc + Number(c.sale_amount || 0), 0);
  const totalAffiliatesCount = new Set(
    programApplications
      .filter(app => app.status === 'approved')
      .map(app => app.publisher_id)
  ).size;

  return (
    <div className="flex h-screen overflow-hidden w-full bg-slate-50 text-slate-800 font-sans selection:bg-[#0052FF]/10">
      
      {/* MOBILE SIDEBAR DRAWER (Sliding panel) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          
          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#090b16] border-r border-white/5 pt-5 pb-4 transition-all duration-300 animate-in slide-in-from-left text-white">
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
              <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer text-white">
                <div className="flex items-center space-x-3">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} className="h-8 w-8 rounded-full object-cover shrink-0" alt="Avatar" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#0052FF] text-white flex items-center justify-center font-extrabold text-sm select-none shadow shrink-0">
                      {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-slate-200 leading-none mb-1 truncate max-w-[150px]">{profile.full_name || 'Advertiser'}</div>
                    <div className="text-[9px] text-slate-400 font-bold">ID: {formatUserId(profile.id)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation stack */}
            <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto pt-2">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'campaigns', label: 'My Campaigns', icon: FolderKanban },
                { id: 'wallet', label: 'Invoices', icon: DollarSign },
                { id: 'transactions', label: 'Transactions', icon: Receipt },
                { id: 'affiliates', label: 'Affiliates', icon: Users },
                { id: 'brand-settings', label: 'Brand Settings', icon: Sliders },
                { id: 'messages', label: 'Messages', icon: Mail },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const showBadge = item.id === 'affiliates' && !hasClickedAffiliates && pendingApplicationsCount > 0;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Icon className={`h-4.5 w-4.5 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {showBadge && (
                        <span className="bg-[#0052FF] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full select-none shrink-0">
                          {pendingApplicationsCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-[#090b16]">
              <button 
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 h-10 rounded-xl cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 1. LEFT SIDEBAR PANEL (Fixed) */}
      <aside className={`hidden lg:flex bg-[#090b16] flex-col justify-between shrink-0 h-full z-20 transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex flex-col w-full">
          {/* Logo Header */}
          <div className={`py-5 flex items-center border-b border-white/5 bg-[#090b16] w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'px-6'}`}>
            {isSidebarCollapsed ? (
              <div className="flex flex-col items-center gap-3">
                <img 
                  src="/RewardMateFav.png" 
                  className="h-7 w-7 object-contain cursor-pointer" 
                  alt="Reward Mate Favicon"
                  onClick={() => setIsSidebarCollapsed(false)}
                />
                <button 
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5"
                  title="Expand Menu"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <img 
                  src="/rewardmate-logo-cropped.png" 
                  className="h-6 w-auto object-contain" 
                  alt="Reward Mate Logo" 
                />
                <button 
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5 shrink-0"
                  title="Collapse Menu"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Profile Card */}
          <div className={isSidebarCollapsed ? 'px-2 py-4 flex justify-center' : 'px-4 py-4'}>
            <div className={`flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group text-white ${isSidebarCollapsed ? 'w-10 h-10 p-0 justify-center' : 'w-full'}`}>
              <div className="flex items-center space-x-3">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} className="h-8 w-8 rounded-full object-cover shrink-0" alt="Avatar" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-[#0052FF] text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                  </div>
                )}
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
              onClick={() => setActiveTab('overview')}
              title="Overview"
              className={`w-full flex items-center py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5'} ${
                activeTab === 'overview' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Overview</span>}
            </button>
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
              title="Invoices"
              className={`w-full flex items-center py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5'} ${
                activeTab === 'wallet' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <DollarSign className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Invoices</span>}
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              title="Transactions"
              className={`w-full flex items-center py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5'} ${
                activeTab === 'transactions' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Receipt className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Transactions</span>}
            </button>
             <button
              onClick={() => setActiveTab('affiliates')}
              title="Affiliates"
              className={`w-full flex items-center py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} ${
                activeTab === 'affiliates' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center truncate">
                <div className="relative">
                  <Users className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
                  {isSidebarCollapsed && !hasClickedAffiliates && pendingApplicationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#0052FF]" />
                  )}
                </div>
                {!isSidebarCollapsed && <span>Affiliates</span>}
              </div>
              {!isSidebarCollapsed && !hasClickedAffiliates && pendingApplicationsCount > 0 && (
                <span className="bg-[#0052FF] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full select-none shrink-0 ml-2">
                  {pendingApplicationsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('brand-settings')}
              title="Brand Settings"
              className={`w-full flex items-center py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5'} ${
                activeTab === 'brand-settings' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Sliders className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Brand Settings</span>}
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
          {!isSidebarCollapsed && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-slate-500 font-bold select-none">
                <span className="text-[10px] tracking-wider font-semibold uppercase text-slate-455">v1.0</span>
              </div>
            </div>
          )}

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
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1 mr-3 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>
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
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} className="h-7 w-7 rounded-full object-cover shrink-0" alt="Avatar" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-[#0052FF] text-white flex items-center justify-center font-extrabold text-xs select-none border border-[#0052FF]/10 shadow-sm shrink-0">
                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                  </div>
                )}
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
          
          {/* Tab Contents */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-200 text-left">
              {/* Header section */}
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Advertiser Overview</h2>
                <p className="text-xs text-slate-500 font-bold">Monitor your partner activity, clicks, and affiliate performance.</p>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center text-slate-500 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Sales</span>
                    <DollarSign className="h-4 w-4 text-[#0052FF]" />
                  </div>
                  <div className="text-xl font-black text-slate-900">${totalSales.toFixed(2)}</div>
                  <p className="text-[9px] text-slate-400 mt-1 font-bold">Revenue generated from promotions</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center text-slate-500 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Affiliates</span>
                    <TrendingUp className="h-4 w-4 text-[#0052FF]" />
                  </div>
                  <div className="text-xl font-black text-slate-900">{totalAffiliatesCount}</div>
                  <p className="text-[9px] text-slate-400 mt-1 font-bold">Approved partners on program</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center text-slate-500 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Clicks</span>
                    <MousePointer className="h-4 w-4 text-[#0052FF]" />
                  </div>
                  <div className="text-xl font-black text-slate-900">{clicks.length}</div>
                  <p className="text-[9px] text-slate-400 mt-1 font-bold">Redirects from promo links</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center text-slate-500 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Conversions</span>
                    <Check className="h-4 w-4 text-[#0052FF]" />
                  </div>
                  <div className="text-xl font-black text-slate-900">{conversions.length}</div>
                  <p className="text-[9px] text-slate-400 mt-1 font-bold">Approved acquisitions</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center text-slate-500 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Balance Due</span>
                    <TrendingUp className="h-4 w-4 text-[#0052FF]" />
                  </div>
                  <div className="text-xl font-black text-rose-600">${totalSpend.toFixed(2)}</div>
                  <p className="text-[9px] text-slate-400 mt-1 font-bold">Unpaid commission balance</p>
                </div>
              </div>

              {/* Charts & Graphs Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
                {/* Clicks Trend Chart */}
                <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Clicks Traffic Trend</h3>
                    <p className="text-[10px] text-slate-455 font-bold">Daily click volume generated over the last week</p>
                  </div>
                  <div className="h-44 w-full flex items-end">
                    {(() => {
                      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                      const data = [0, 0, 0, 0, 0, 0, 0];
                      clicks.forEach(click => {
                        const clickDate = new Date(click.created_at);
                        const dayIndex = (clickDate.getDay() + 6) % 7; // Mon=0, Sun=6
                        data[dayIndex] += 1;
                      });
                      const max = Math.max(...data) || 1;
                      return (
                        <div className="w-full h-full flex flex-col justify-between">
                          <div className="flex-1 flex items-end justify-between px-2 gap-2 relative">
                            {/* Gridlines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 border-b border-slate-200">
                              <div className="border-b border-slate-200 w-full text-left"></div>
                              <div className="border-b border-slate-200 w-full text-left"></div>
                              <div className="border-b border-slate-200 w-full text-left"></div>
                            </div>
                            {data.map((val, idx) => {
                              const heightPct = (val / max) * 100;
                              return (
                                <div key={idx} className="flex-1 flex flex-col items-center group relative z-10">
                                  <div className="absolute -top-7 bg-[#090b16] text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow pointer-events-none">{val} Clicks</div>
                                  <div 
                                    className="w-full bg-[#0052FF]/10 group-hover:bg-[#0052FF] rounded-t-lg transition-all duration-300"
                                    style={{ height: `${heightPct * 0.8}%` }}
                                  ></div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 px-1 border-t border-slate-100 pt-2">
                            {days.map((d, i) => <span key={i} className="flex-1 text-center">{d}</span>)}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Commissions Paid Chart */}
                <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Paid Commissions Trend</h3>
                    <p className="text-[10px] text-slate-455 font-bold">Daily spend metrics in partner acquisitions</p>
                  </div>
                  <div className="h-44 w-full flex items-end">
                    {(() => {
                      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                      const data = [0, 0, 0, 0, 0, 0, 0];
                      conversions.forEach(c => {
                        if (c.status === 'approved') {
                          const convDate = new Date(c.created_at);
                          const dayIndex = (convDate.getDay() + 6) % 7; // Mon=0, Sun=6
                          data[dayIndex] += Number(c.payout);
                        }
                      });
                      const max = Math.max(...data) || 1;
                      return (
                        <div className="w-full h-full flex flex-col justify-between">
                          <div className="flex-1 flex items-end justify-between px-2 gap-2 relative">
                            {/* Gridlines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 border-b border-slate-200">
                              <div className="border-b border-slate-200 w-full text-left"></div>
                              <div className="border-b border-slate-200 w-full text-left"></div>
                              <div className="border-b border-slate-200 w-full text-left"></div>
                            </div>
                            {data.map((val, idx) => {
                              const heightPct = (val / max) * 100;
                              return (
                                <div key={idx} className="flex-1 flex flex-col items-center group relative z-10">
                                  <div className="absolute -top-7 bg-[#090b16] text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow pointer-events-none">${val.toFixed(2)}</div>
                                  <div 
                                    className="w-full bg-emerald-100 group-hover:bg-emerald-500 rounded-t-lg transition-all duration-300"
                                    style={{ height: `${heightPct * 0.8}%` }}
                                  ></div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 px-1 border-t border-slate-100 pt-2">
                            {days.map((d, i) => <span key={i} className="flex-1 text-center">{d}</span>)}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Best Affiliates Leaderboard */}
              <div className="bg-white border border-slate-150 p-8 rounded-2xl shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Affiliate Program Leaderboard</h3>
                  <p className="text-xs text-slate-500 font-bold">Top performance publishers listed by commissions generated.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {(() => {
                    const pubApprovedConvs = conversions.filter(c => c.status === 'approved');
                    const pubGroupMap: Record<string, { name: string, payout: number, count: number }> = {};
                    
                    pubApprovedConvs.forEach((c) => {
                      const pubId = c.publisher_id;
                      if (!pubGroupMap[pubId]) {
                        pubGroupMap[pubId] = {
                          name: c.publisher_name || 'Publisher',
                          payout: 0,
                          count: 0
                        };
                      }
                      pubGroupMap[pubId].payout += Number(c.payout);
                      pubGroupMap[pubId].count += 1;
                    });

                    const leaderboard = Object.values(pubGroupMap)
                      .sort((a, b) => b.payout - a.payout);

                    if (leaderboard.length === 0) {
                      return (
                        <div className="col-span-full py-8 text-center text-xs text-slate-400 font-bold italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          No active affiliate performance logged yet.
                        </div>
                      );
                    }

                    const colors = [
                      { trophy: '🥇', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', ring: 'ring-amber-400' },
                      { trophy: '🥈', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700', ring: 'ring-slate-400' },
                      { trophy: '🥉', bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', ring: 'ring-orange-400' }
                    ];

                    return leaderboard.slice(0, 3).map((item, idx) => {
                      const theme = colors[idx] || { trophy: '🏆', bg: 'bg-slate-50', text: 'text-slate-600', ring: 'ring-slate-300' };
                      const name = item.name;
                      return (
                        <div key={idx} className={`relative flex flex-col justify-between p-6 border rounded-2xl transition-all shadow-sm group hover:scale-[1.02] ${theme.bg}`}>
                          <div className={`absolute -top-3 -right-3 h-8 w-8 rounded-full bg-white ring-2 flex items-center justify-center text-sm shadow-md ${theme.ring}`}>
                            {theme.trophy}
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Rank #{idx + 1}</span>
                              <h4 className="text-sm font-black text-slate-800 leading-tight truncate">{name}</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                              <div>
                                <span className="text-[8px] font-black uppercase text-slate-455 block">Conversions</span>
                                <span className="text-xs font-black text-slate-700">{item.count} approved</span>
                              </div>
                              <div>
                                <span className="text-[8px] font-black uppercase text-slate-455 block">Commissions</span>
                                <span className="text-xs font-black text-[#0052FF]">${item.payout.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}

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

                      <div className="flex items-center gap-6 text-right shrink-0">
                        <div>
                          <div className="text-xs text-slate-500 font-semibold">Payout Rate</div>
                          <div className="text-sm font-bold text-slate-900">
                            {camp.payout_type === 'revshare' ? `${camp.payout_amount}%` : `$${Number(camp.payout_amount).toFixed(2)} AUD`} <span className="text-[10px] text-slate-500 uppercase">{camp.payout_type}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartEditCampaign(camp)}
                          className="border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-800 font-extrabold text-[10px] h-8 px-4 rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          Edit Offer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="grid md:grid-cols-3 gap-8 font-sans animate-in fade-in duration-205">
              {/* Left 1/3: Invoice list */}
              <div className="md:col-span-1 bg-white border border-slate-100 p-6 rounded-2xl space-y-6 shadow-sm flex flex-col h-[550px]">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Invoice History</h3>
                  <p className="text-[10px] text-slate-500 font-bold">Automated monthly billing for commissions due.</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
                  {invoices.map((inv) => {
                    const isSelected = selectedInvoice?.id === inv.id;
                    return (
                      <div 
                        key={inv.id} 
                        onClick={() => setSelectedInvoice(inv)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer text-left space-y-2 ${
                          isSelected 
                            ? 'bg-[#0052FF]/5 border-[#0052FF]/20' 
                            : 'bg-slate-50/40 border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-800 font-mono">{inv.id}</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            inv.status === 'paid' 
                              ? 'bg-emerald-500/10 text-emerald-600' 
                              : 'bg-amber-500/10 text-amber-600 animate-pulse'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                        
                        <div>
                          <div className="text-xs font-bold text-slate-700">{inv.month}</div>
                          <div className="text-xs font-black text-slate-900 mt-1">${Number(inv.commissionDue).toFixed(2)} AUD</div>
                        </div>

                        <div className="text-[9px] text-slate-400 font-bold">
                          {inv.conversionsCount} approved conversions
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right 2/3: Selected Invoice Details */}
              <div className="md:col-span-2 bg-white border border-slate-100 p-8 rounded-2xl shadow-sm flex flex-col justify-between min-h-[550px] text-left">
                {selectedInvoice ? (
                  <>
                    <div className="space-y-6">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                          <span className="text-[9px] font-black uppercase text-slate-400">Monthly Statement</span>
                          <h3 className="text-base font-black text-slate-800 font-mono mt-0.5">{selectedInvoice.id}</h3>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-xl border ${
                          selectedInvoice.status === 'paid' 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                            : 'bg-amber-50 border-amber-100 text-amber-600'
                        }`}>
                          {selectedInvoice.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Details Meta */}
                      <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                        <div>
                          <span className="text-[9px] font-black uppercase text-slate-400 block">Statement For</span>
                          <span className="font-extrabold text-slate-800 block mt-0.5">{profile.business_name || 'My Brand'}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{profile.email}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase text-slate-400 block">Billing Period</span>
                          <span className="font-extrabold text-slate-800 block mt-0.5">{selectedInvoice.month}</span>
                          <span className="text-[10px] text-slate-455 font-bold">Issued: {selectedInvoice.issueDate}</span>
                        </div>
                      </div>

                      {/* Invoice Items Table */}
                      <div className="border border-slate-100 rounded-xl overflow-hidden mt-4">
                        <table className="w-full text-xs font-sans text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b border-slate-100">
                              <th className="py-2.5 px-4">Description</th>
                              <th className="py-2.5 px-4 text-center">Conversions</th>
                              <th className="py-2.5 px-4 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-bold text-slate-650">
                            <tr>
                              <td className="py-3 px-4">Approved Commissions due (Direct Campaign Traffic)</td>
                              <td className="py-3 px-4 text-center">{selectedInvoice.conversionsCount}</td>
                              <td className="py-3 px-4 text-right text-slate-900">${Number(selectedInvoice.commissionDue).toFixed(2)} AUD</td>
                            </tr>
                            <tr className="bg-slate-50/50">
                              <td className="py-2.5 px-4 text-slate-500">Service Fee (RewardMate Platform)</td>
                              <td className="py-2.5 px-4 text-center">-</td>
                              <td className="py-2.5 px-4 text-right text-emerald-600">FREE</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Bank Payment Details */}
                      <div className="bg-slate-50/70 border border-slate-150 rounded-2xl p-4.5 space-y-2.5 text-[11px] font-sans">
                        <span className="text-[9px] font-black uppercase text-[#0052FF] block tracking-wider">Bendigo Bank Direct EFT Details</span>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-slate-700">
                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] block mb-0.5">Bank Name</span>
                            <strong className="text-slate-800">Bendigo Bank</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] block mb-0.5">BSB Code</span>
                            <strong className="text-slate-800 font-mono">633-000</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] block mb-0.5">Account Number</span>
                            <strong className="text-slate-800 font-mono">Coming Soon</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] block mb-0.5">Reference Code</span>
                            <strong className="text-[#0052FF] font-mono">{selectedInvoice.id}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pay Block Footer */}
                    <div className="border-t border-slate-100 pt-6 flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400 block">Total Due Amount</span>
                        <span className="text-xl font-black text-slate-900">${Number(selectedInvoice.commissionDue).toFixed(2)} AUD</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => printInvoice(selectedInvoice, profile)}
                          className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs h-11 px-5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Download className="h-4 w-4" /> Download Tax Invoice
                        </button>

                        {selectedInvoice.status === 'payable' ? (
                          <button
                            onClick={() => handlePayInvoice(selectedInvoice.id)}
                            className="bg-[#0052FF] hover:bg-blue-650 text-white font-extrabold text-xs h-11 px-6 rounded-xl transition-all shadow-sm shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            Pay Monthly Invoice
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100 text-xs font-black select-none">
                            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Paid on {selectedInvoice.dueDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                    <span className="text-xs font-bold font-sans">No invoice selected.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MESSAGES SECTION */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-[550px] flex animate-in fade-in duration-300">
              
              {/* Left Panel: Contacts list */}
              <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col h-full bg-slate-50/30 shrink-0 ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
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
                  {contacts.filter(c => (c.business_name || c.full_name || c.email).toLowerCase().includes(searchContactText.toLowerCase())).length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-400 font-sans font-semibold">No contacts found.</div>
                  ) : (
                    contacts.filter(c => (c.business_name || c.full_name || c.email).toLowerCase().includes(searchContactText.toLowerCase())).map((c) => {
                      const isSelected = selectedContact?.id === c.id;
                      const contactDisplayName = c.business_name || c.full_name || c.email;
                      const cInitials = contactDisplayName.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();
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
                          {c.avatar_url ? (
                            <img src={c.avatar_url} className="h-9 w-9 rounded-xl object-cover shrink-0 border border-slate-200 shadow-sm" alt="" />
                          ) : (
                            <div className={`h-9 w-9 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 text-slate-750 flex items-center justify-center font-extrabold text-xs shadow-sm uppercase ${
                              isSelected ? 'from-[#0052FF] to-blue-600 text-white' : ''
                            }`}>
                              {cInitials}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold truncate font-sans">{contactDisplayName}</h4>
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
              <div className={`flex-1 flex flex-col h-full bg-white ${selectedContact ? 'flex' : 'hidden md:flex'}`}>
                {selectedContact ? (
                  <>
                    {/* Thread Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center bg-slate-50/20">
                      {/* Back button for mobile */}
                      <button 
                        type="button"
                        onClick={() => setSelectedContact(null)}
                        className="md:hidden p-1 mr-2.5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Back to contacts"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                       <div className="flex items-center space-x-3">
                        {selectedContact.avatar_url ? (
                          <img src={selectedContact.avatar_url} className="h-9 w-9 rounded-xl object-cover shrink-0 border border-slate-200 shadow-sm" alt="" />
                        ) : (
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#0052FF] to-blue-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm uppercase">
                            {(selectedContact.business_name || selectedContact.full_name || selectedContact.email).split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-800 leading-none mb-0.5">{selectedContact.business_name || selectedContact.full_name || selectedContact.email}</h3>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{selectedContact.user_type}</span>
                        </div>
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
                            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} w-full space-y-1`}>
                              <div className="flex items-center space-x-1.5 text-[9px] font-bold text-slate-500 select-none">
                                {isMe ? (
                                  <>
                                    <span>{profile.full_name || 'Me'}</span>
                                    {profile.avatar_url ? (
                                      <img src={profile.avatar_url} className="h-4 w-4 rounded-full object-cover shrink-0 border border-slate-200" alt="" />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full bg-blue-50 text-[#0052FF] flex items-center justify-center font-extrabold text-[8px] border border-blue-100 shrink-0">
                                        {(profile.full_name || 'Me').charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {selectedContact.avatar_url ? (
                                      <img src={selectedContact.avatar_url} className="h-4 w-4 rounded-full object-cover shrink-0 border border-slate-200" alt="" />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full bg-blue-50 text-[#0052FF] flex items-center justify-center font-extrabold text-[8px] border border-blue-100 shrink-0">
                                        {(selectedContact.business_name || selectedContact.full_name || selectedContact.email).charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <span>{selectedContact.business_name || selectedContact.full_name || selectedContact.email}</span>
                                  </>
                                )}
                              </div>
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

          {activeTab === 'transactions' && (() => {
            const advertiserCampIds = campaigns.map(camp => camp.id);
            const advertiserConvs = conversions.filter(c => advertiserCampIds.includes(c.campaign_id));
            
            return (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center text-left">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Transactions Ledger</h2>
                    <p className="text-xs text-slate-500 font-bold">Track customer purchases and commissions generated by your affiliate partners.</p>
                  </div>
                </div>

                {/* Ledger Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-left">
                    <span className="text-[10px] font-black uppercase text-slate-400">Approved Commission Volume</span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      ${advertiserConvs.filter(c => c.status === 'approved').reduce((sum, c) => sum + Number(c.payout), 0).toFixed(2)} AUD
                    </h3>
                  </div>
                  <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-left">
                    <span className="text-[10px] font-black uppercase text-slate-400">Total Sales Value Generated</span>
                    <h3 className="text-lg font-black text-[#0052FF] mt-1">
                      ${advertiserConvs.filter(c => c.status === 'approved').reduce((sum, c) => sum + Number(c.sale_amount || 0), 0).toFixed(2)} AUD
                    </h3>
                  </div>
                  <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-left">
                    <span className="text-[10px] font-black uppercase text-slate-400">Voided Transactions</span>
                    <h3 className="text-lg font-black text-rose-600 mt-1">
                      {advertiserConvs.filter(c => c.status === 'voided').length} / {advertiserConvs.length}
                    </h3>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-sans border-collapse text-left">
                      <thead>
                        <tr className="bg-slate-50/75 border-b border-slate-150 text-[10px] font-black uppercase text-slate-455 tracking-wider">
                          <th className="py-3.5 px-6">Transaction ID & Date</th>
                          <th className="py-3.5 px-6">Campaign</th>
                          <th className="py-3.5 px-6">Affiliate</th>
                          <th className="py-3.5 px-6 text-right">Sale Amount</th>
                          <th className="py-3.5 px-6 text-right">Commission Payout</th>
                          <th className="py-3.5 px-6 text-center">Status</th>
                          <th className="py-3.5 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {advertiserConvs.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-400 font-bold text-xs">
                              No transactions recorded yet.
                            </td>
                          </tr>
                        ) : (
                          advertiserConvs.map((txn) => {
                            const pubName = txn.publisher_name || 'Publisher';
                            const dateStr = new Date(txn.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                            return (
                              <tr key={txn.id} className="hover:bg-slate-50/40 transition-colors">
                                <td className="py-4 px-6">
                                  <div className="font-mono text-xs text-slate-900 font-black">{txn.transaction_id || formatUserId(txn.id)}</div>
                                  <div className="text-[10px] text-slate-400 font-bold mt-0.5">{dateStr}</div>
                                </td>
                                <td className="py-4 px-6 text-xs font-bold text-slate-800">{txn.campaign?.name || txn.campaign_name || 'Campaign'}</td>
                                <td className="py-4 px-6 text-xs text-slate-600">{pubName}</td>
                                <td className="py-4 px-6 text-right text-xs font-extrabold text-slate-950">${Number(txn.sale_amount || 0).toFixed(2)}</td>
                                <td className="py-4 px-6 text-right text-xs font-black text-[#0052FF]">${Number(txn.payout).toFixed(2)}</td>
                                <td className="py-4 px-6 text-center">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide border ${
                                    txn.status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                    txn.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-700 animate-pulse' :
                                    txn.status === 'voided' ? 'bg-rose-50 border-rose-100 text-rose-700 line-through' :
                                    'bg-slate-50 border-slate-200 text-slate-500'
                                  }`}>
                                    {txn.status}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  {txn.status === 'approved' && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          await updateConversionStatus(txn.id, 'voided');
                                          toast.success('Transaction voided successfully and excluded from commissions!');
                                          loadData();
                                        } catch (err: any) {
                                          toast.error(err.message || 'Failed to void transaction.');
                                        }
                                      }}
                                      className="border border-rose-200 hover:bg-rose-500 hover:text-white text-rose-600 font-extrabold text-[10px] h-7 px-3.5 rounded-xl transition-colors cursor-pointer"
                                    >
                                      Void
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === 'affiliates' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center text-left">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Affiliates & Partners</h2>
                  <p className="text-xs text-slate-500 font-bold">Review applications from publishers seeking to promote your offers.</p>
                </div>
              </div>

              <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-sans border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-150 text-[10px] font-black uppercase text-slate-450 tracking-wider">
                        <th className="py-3 px-6">Publisher</th>
                        <th className="py-3 px-6">Offer / Program</th>
                        <th className="py-3 px-6">Applied Date</th>
                        <th className="py-3 px-6 text-center">Status</th>
                        <th className="py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {programApplications.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 font-bold text-xs">
                            No applications submitted yet.
                          </td>
                        </tr>
                      ) : (
                        programApplications.map((app) => {
                          const pubName = app.publisher?.business_name || app.publisher?.full_name || app.publisher?.email || 'Publisher';
                          const pubEmail = app.publisher?.email || '';
                          const dateStr = new Date(app.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'numeric', year: 'numeric' });
                          return (
                            <tr key={app.id} className="hover:bg-slate-50/40 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-3">
                                  {app.publisher?.avatar_url ? (
                                    <img src={app.publisher.avatar_url} className="h-8 w-8 rounded-full object-cover shrink-0 border border-slate-200 shadow-sm" alt="" />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shadow-sm">
                                      {pubName.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <div 
                                      className="font-bold text-slate-900 text-xs hover:text-[#0052FF] cursor-pointer hover:underline"
                                      onClick={() => setSelectedPublisherForModal(app.publisher)}
                                      title="Click to view affiliate profile, stats, and traffic sources"
                                    >
                                      {pubName}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium">{pubEmail}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-slate-800 text-xs font-bold">{app.campaign?.name || 'Unknown Offer'}</td>
                              <td className="py-4 px-6 text-xs text-slate-500">{dateStr}</td>
                              <td className="py-4 px-6 text-center">
                                {(() => {
                                  const hasLink = affiliateLinks.some(l => l.campaign_id === app.campaign_id && l.publisher_id === app.publisher_id);
                                  const isSuspended = app.status === 'rejected' && hasLink;
                                  return (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                      app.status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                      app.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-700 animate-pulse' :
                                      isSuspended ? 'bg-rose-50 border-rose-100 text-rose-700 line-through' :
                                      'bg-slate-50 border-slate-200 text-slate-500' // rejected / declined
                                    }`}>
                                      {isSuspended ? 'SUSPENDED' : app.status === 'rejected' ? 'DECLINED' : app.status.toUpperCase()}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex justify-end items-center space-x-2 font-sans">
                                  <button
                                    onClick={() => {
                                      setSelectedContact(app.publisher);
                                      setActiveTab('messages');
                                    }}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-455 hover:text-[#0052FF] transition-all cursor-pointer mr-1 shrink-0"
                                    title="Send Direct Message"
                                  >
                                    <Mail className="h-4 w-4" />
                                  </button>

                                  {(() => {
                                    const hasLink = affiliateLinks.some(l => l.campaign_id === app.campaign_id && l.publisher_id === app.publisher_id);
                                    const isSuspended = app.status === 'rejected' && hasLink;

                                    if (app.status === 'pending') {
                                      return (
                                        <>
                                          <button
                                            onClick={async () => {
                                              try {
                                                await updateApplicationStatus(app.id, 'approved');
                                                toast.success('Affiliate approved successfully!');
                                                loadData();
                                              } catch (err: any) {
                                                toast.error(err.message || 'Failed to approve application.');
                                              }
                                            }}
                                            className="bg-[#0052FF] hover:bg-blue-650 text-white font-extrabold text-[10px] h-7 px-3.5 rounded-xl transition-colors shadow-sm shadow-blue-500/10 cursor-pointer shrink-0"
                                          >
                                            Approve
                                          </button>
                                          <button
                                            onClick={async () => {
                                              try {
                                                await updateApplicationStatus(app.id, 'rejected');
                                                toast.success('Affiliate application declined.');
                                                loadData();
                                              } catch (err: any) {
                                                toast.error(err.message || 'Failed to decline application.');
                                              }
                                            }}
                                            className="border border-slate-200 hover:bg-slate-50 text-slate-650 hover:text-slate-800 font-extrabold text-[10px] h-7 px-3.5 rounded-xl transition-colors cursor-pointer shrink-0"
                                          >
                                            Decline
                                          </button>
                                        </>
                                      );
                                    }

                                    if (app.status === 'approved') {
                                      return (
                                        <button
                                          onClick={async () => {
                                            try {
                                              await updateApplicationStatus(app.id, 'rejected');
                                              toast.success('Affiliate suspended successfully.');
                                              loadData();
                                            } catch (err: any) {
                                              toast.error(err.message || 'Failed to suspend affiliate.');
                                            }
                                          }}
                                          className="border border-rose-200 hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-extrabold text-[10px] h-7 px-3.5 rounded-xl transition-colors cursor-pointer shrink-0"
                                        >
                                          Suspend
                                        </button>
                                      );
                                    }

                                    if (isSuspended) {
                                      return (
                                        <button
                                          onClick={async () => {
                                            try {
                                              await updateApplicationStatus(app.id, 'approved');
                                              toast.success('Affiliate reactivated successfully!');
                                              loadData();
                                            } catch (err: any) {
                                              toast.error(err.message || 'Failed to reactivate affiliate.');
                                            }
                                          }}
                                          className="bg-[#0052FF] hover:bg-blue-650 text-white font-extrabold text-[10px] h-7 px-3.5 rounded-xl transition-colors shadow-sm shadow-blue-500/10 cursor-pointer shrink-0"
                                        >
                                          Reactivate
                                        </button>
                                      );
                                    }

                                    return (
                                      <button
                                        onClick={async () => {
                                          try {
                                            await updateApplicationStatus(app.id, 'approved');
                                            toast.success('Affiliate approved successfully!');
                                            loadData();
                                          } catch (err: any) {
                                            toast.error(err.message || 'Failed to approve affiliate.');
                                          }
                                        }}
                                        className="bg-[#0052FF] hover:bg-blue-650 text-white font-extrabold text-[10px] h-7 px-3.5 rounded-xl transition-colors shadow-sm shadow-blue-500/10 cursor-pointer shrink-0"
                                      >
                                        Approve
                                      </button>
                                    );
                                  })()}
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
            </div>
          )}

          {activeTab === 'brand-settings' && (
            <div className="grid md:grid-cols-2 gap-8 font-sans animate-in fade-in duration-200 text-left">
              {/* Profile Details Edit Form */}
              <div className="bg-white border border-slate-150 p-8 rounded-2xl space-y-6 shadow-sm">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Brand Settings</h3>
                  <p className="text-xs text-slate-500 font-bold">Edit your business profile information.</p>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const business_name = (form.elements.namedItem('business_name') as HTMLInputElement).value;
                    const website = (form.elements.namedItem('website') as HTMLInputElement).value;
                    const channels = (form.elements.namedItem('channels') as HTMLInputElement).value;
                    const full_name = (form.elements.namedItem('full_name') as HTMLInputElement).value;
                    const year_founded = parseInt((form.elements.namedItem('year_founded') as HTMLInputElement).value);
                    const about_us = (form.elements.namedItem('about_us') as HTMLTextAreaElement).value;
                    const program_terms = (form.elements.namedItem('program_terms') as HTMLTextAreaElement).value;
                    const facebook_url = (form.elements.namedItem('facebook_url') as HTMLInputElement).value;
                    const instagram_url = (form.elements.namedItem('instagram_url') as HTMLInputElement).value;
                    const auto_approve = (form.elements.namedItem('auto_approve') as HTMLInputElement).checked;
                    const target_countries = selectedCountries.join(',');

                    try {
                      setLoading(true);
                      await updateProfileDetails({
                        business_name,
                        website,
                        channels,
                        full_name,
                        avatar_url: brandLogoUrl,
                        year_founded: isNaN(year_founded) ? undefined : year_founded,
                        about_us,
                        program_terms,
                        target_countries,
                        facebook_url,
                        instagram_url,
                        auto_approve
                      });
                      toast.success('Brand settings updated successfully!');
                      setTimeout(() => {
                        window.location.reload();
                      }, 800);
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to update brand details.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="space-y-4 font-semibold text-slate-700 text-xs"
                >
                  {/* Logo Preview & Upload */}
                  <div className="flex items-center space-x-4 py-2 border-b border-slate-100/70">
                    <div className="relative group shrink-0">
                      {brandLogoUrl ? (
                        <img 
                          src={brandLogoUrl} 
                          className="h-16 w-16 rounded-full object-cover border-2 border-slate-200" 
                          alt="Brand Logo Preview" 
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-[#0052FF] text-white flex items-center justify-center font-extrabold text-xl shadow border border-[#0052FF]/10 shrink-0">
                          {(profile.business_name || profile.full_name || 'B').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Brand Logo Image</label>
                      <div className="flex items-center gap-2">
                        <label className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-extrabold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider cursor-pointer transition-colors select-none">
                          Upload File
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleLogoFileChange} 
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newSeed = `https://api.dicebear.com/7.x/identicon/svg?seed=${Date.now()}`;
                            setBrandLogoUrl(newSeed);
                            toast.success('Generated a premium brand icon seed!');
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-755 font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider cursor-pointer transition-all shrink-0"
                        >
                          Auto-Gen
                        </button>
                        {brandLogoUrl && (
                          <button
                            type="button"
                            onClick={() => setBrandLogoUrl('')}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider cursor-pointer transition-colors border border-rose-100/50"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-455">Contact Person Name</label>
                    <input 
                      type="text" 
                      name="full_name"
                      defaultValue={profile.full_name || ''}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0052FF]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-455">Brand / Business Name</label>
                    <input 
                      type="text" 
                      name="business_name"
                      defaultValue={profile.business_name || ''}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0052FF]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-455">Company Website URL</label>
                    <input 
                      type="url" 
                      name="website"
                      defaultValue={profile.website || ''}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0052FF]"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-455">Facebook URL</label>
                      <input 
                        type="url" 
                        name="facebook_url"
                        defaultValue={profile.facebook_url || ''}
                        placeholder="https://facebook.com/..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0052FF]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-455">Instagram URL</label>
                      <input 
                        type="url" 
                        name="instagram_url"
                        defaultValue={profile.instagram_url || ''}
                        placeholder="https://instagram.com/..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0052FF]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-455">Industry Category</label>
                    <input 
                      type="text" 
                      name="channels"
                      defaultValue={profile.channels || ''}
                      placeholder="e.g. Retail, Finance, Technology"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0052FF]"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-455">Year Founded</label>
                    <input 
                      type="number" 
                      name="year_founded"
                      defaultValue={profile.year_founded || ''}
                      placeholder="e.g. 2018"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0052FF]"
                    />
                  </div>

                  {/* Target Countries Selector (Multi-select checkbox buttons) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="text-[10px] font-black uppercase text-slate-455 block">Target Countries</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { code: 'AU', label: '🇦🇺 Australia' },
                        { code: 'US', label: '🇺🇸 USA' },
                        { code: 'GB', label: '🇬🇧 UK' },
                        { code: 'NZ', label: '🇳🇿 New Zealand' },
                        { code: 'CA', label: '🇨🇦 Canada' },
                        { code: 'DE', label: '🇩🇪 Germany' }
                      ].map((c) => {
                        const isChecked = selectedCountries.includes(c.code);
                        return (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                setSelectedCountries(selectedCountries.filter(x => x !== c.code));
                              } else {
                                setSelectedCountries([...selectedCountries, c.code]);
                              }
                            }}
                            className={`flex items-center justify-center py-2 px-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-[#0052FF]/10 border-[#0052FF] text-[#0052FF]'
                                : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'
                            }`}
                          >
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-455">About Us / Bio</label>
                    <textarea 
                      name="about_us"
                      defaultValue={profile.about_us || ''}
                      placeholder="Describe your brand, your products, and what makes your business unique..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0052FF] h-24 font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-455">Program Terms & Rules</label>
                    <textarea 
                      name="program_terms"
                      defaultValue={profile.program_terms || ''}
                      placeholder="Outline commission terms, brand guidelines, and disallowed traffic sources..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0052FF] h-24 font-sans"
                    />
                  </div>

                  {/* Auto Approve Toggle */}
                  <div className="flex items-center space-x-3 py-3 border-t border-b border-slate-100/70">
                    <input 
                      type="checkbox" 
                      name="auto_approve"
                      id="auto_approve_toggle"
                      defaultChecked={profile.auto_approve || false}
                      className="rounded border-slate-300 text-[#0052FF] focus:ring-[#0052FF] h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="auto_approve_toggle" className="text-xs font-extrabold text-slate-800 cursor-pointer select-none">
                      Auto-Approve Affiliates
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Automatically approve publishers who apply to your campaign.</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0052FF] text-white font-bold h-11 rounded-xl text-xs flex items-center justify-center hover:bg-blue-650 transition-colors shadow shadow-blue-500/10 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </form>
              </div>

              {/* Brand Creatives / Banners Upload Module */}
              <div className="bg-white border border-slate-150 p-8 rounded-2xl space-y-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Creatives & Banners</h3>
                    <p className="text-xs text-slate-500 font-bold">Add promotional banners and creatives for your publishers to use.</p>
                  </div>

                  {/* List of existing creatives */}
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                    {brandCreatives.length === 0 ? (
                      <div className="py-8 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 space-y-1">
                        <ImageIcon className="h-6 w-6 text-slate-300" />
                        <span className="text-[10px] font-bold">No creatives added yet.</span>
                      </div>
                    ) : (
                      brandCreatives.map((creative) => (
                        <div key={creative.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center space-x-3">
                            <a href={creative.image_url} target="_blank" rel="noreferrer" className="h-10 w-10 rounded bg-slate-200 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center">
                              <img src={creative.image_url} alt={creative.title} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                            </a>
                            <div>
                              <div className="font-bold text-slate-800 text-xs leading-none mb-1">{creative.title}</div>
                              <span className="bg-[#0052FF]/10 text-[#0052FF] px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">{creative.banner_size}</span>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                await deleteBrandCreative(creative.id);
                                toast.success('Creative deleted successfully!');
                                loadData();
                              } catch (err: any) {
                                toast.error(err.message || 'Failed to delete creative.');
                              }
                            }}
                            className="text-rose-500 hover:text-rose-700 font-bold text-[10px] hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Add new creative form */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const title = (form.elements.namedItem('creative_title') as HTMLInputElement).value;
                    const image_url = creativeImageUrl || (form.elements.namedItem('creative_url') as HTMLInputElement).value;
                    const banner_size = (form.elements.namedItem('creative_size') as HTMLSelectElement).value;

                    if (!image_url) {
                      toast.error('Please choose a file to upload or paste a creative URL.');
                      return;
                    }

                    try {
                      setLoading(true);
                      await addBrandCreative({
                        advertiser_id: profile.id,
                        title,
                        image_url,
                        banner_size
                      });
                      toast.success('Creative banner added!');
                      setCreativeImageUrl('');
                      form.reset();
                      loadData();
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to add creative.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="space-y-3 pt-4 border-t border-slate-100 font-semibold text-slate-700 text-xs"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-455">Creative Name</label>
                      <input 
                        type="text" 
                        name="creative_title"
                        placeholder="e.g. Summer Promo 728x90"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0052FF]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-455">Banner Size</label>
                      <select
                        name="creative_size"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 px-3 text-xs font-semibold text-slate-850 focus:outline-none focus:border-[#0052FF]"
                      >
                        <option value="728x90">Leaderboard (728x90)</option>
                        <option value="300x250">Square Banner (300x250)</option>
                        <option value="160x600">Skyscraper (160x600)</option>
                        <option value="1080x1080">Social Media (1080x1080)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="text-[9px] font-black uppercase text-slate-455 block">Creative Banner Image file</label>
                    <div className="flex items-center gap-2">
                      <label className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-extrabold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider cursor-pointer transition-colors select-none">
                        Upload File
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleCreativeFileChange} 
                        />
                      </label>
                      <span className="text-[10px] text-slate-400 font-semibold">or paste a URL below</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-455">Creative Asset Image URL</label>
                    <input 
                      type="text" 
                      name="creative_url"
                      value={creativeImageUrl}
                      onChange={(e) => setCreativeImageUrl(e.target.value)}
                      placeholder="e.g. Upload a file above or paste your banner link here"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0052FF]"
                    />
                  </div>

                  {creativeImageUrl && (
                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                      <span className="text-[8px] font-black uppercase text-slate-400 block">Banner Preview</span>
                      <img src={creativeImageUrl} className="max-h-24 w-auto rounded border border-slate-200 object-contain animate-in fade-in" alt="Creative Preview" />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0052FF] text-white font-bold h-10 rounded-xl text-xs flex items-center justify-center hover:bg-blue-650 transition-colors shadow shadow-blue-500/10 cursor-pointer disabled:opacity-50"
                  >
                    Add Creative Asset
                  </button>
                </form>
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

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">Category</label>
                <select
                  value={campCategory}
                  onChange={(e) => setCampCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all font-sans cursor-pointer"
                >
                  <option value="Finance">Finance</option>
                  <option value="Retail">Retail</option>
                  <option value="Travel">Travel</option>
                  <option value="Technology">Technology</option>
                  <option value="Health & Beauty">Health & Beauty</option>
                  <option value="Services">Services</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payout Type</label>
                  <select
                    value={campPayoutType}
                    onChange={(e) => setCampPayoutType(e.target.value as 'cpa' | 'revshare' | 'cpc')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                  >
                    <option value="cpa">CPA (Flat rate per Sale)</option>
                    <option value="revshare">Revshare (% Commission per Sale)</option>
                    <option value="cpc">CPC (Cost per Click)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {campPayoutType === 'revshare' ? 'Commission Rate (%)' : 'Commission Amount ($)'}
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder={campPayoutType === 'revshare' ? 'e.g. 10.00' : 'e.g. 50.00'}
                    value={campPayoutAmount}
                    onChange={(e) => setCampPayoutAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                    required
                  />
                </div>
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

      {/* Campaign Edit Modal */}
      {selectedCampaignForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-8 space-y-6 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 shadow-2xl">
            <button 
              onClick={() => setSelectedCampaignForEdit(null)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Edit Campaign Details</h3>
              <p className="text-xs text-slate-500 font-medium font-sans">Update the name, description, landing page URL, or commission payout configuration.</p>
            </div>

            <form onSubmit={handleSaveEditCampaign} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Campaign Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Woolworths Credit Card Promo"
                  value={editCampName}
                  onChange={(e) => setEditCampName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all font-sans"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                <textarea 
                  placeholder="Summarize the offer criteria, target audience, and traffic restrictions..."
                  value={editCampDesc}
                  onChange={(e) => setEditCampDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all font-sans"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Landing Page URL</label>
                <input 
                  type="url" 
                  placeholder="https://www.company.com/promotion"
                  value={editCampUrl}
                  onChange={(e) => setEditCampUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all font-sans"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">Category</label>
                <select
                  value={editCampCategory}
                  onChange={(e) => setEditCampCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all font-sans cursor-pointer"
                >
                  <option value="Finance">Finance</option>
                  <option value="Retail">Retail</option>
                  <option value="Travel">Travel</option>
                  <option value="Technology">Technology</option>
                  <option value="Health & Beauty">Health & Beauty</option>
                  <option value="Services">Services</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payout Type</label>
                  <select
                    value={editCampPayoutType}
                    onChange={(e) => setEditCampPayoutType(e.target.value as 'cpa' | 'revshare' | 'cpc')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all font-sans"
                  >
                    <option value="cpa">CPA (Flat rate per Sale)</option>
                    <option value="revshare">Revshare (% Commission per Sale)</option>
                    <option value="cpc">CPC (Cost per Click)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {editCampPayoutType === 'revshare' ? 'Commission Rate (%)' : 'Commission Amount ($)'}
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder={editCampPayoutType === 'revshare' ? 'e.g. 10.00' : 'e.g. 50.00'}
                    value={editCampPayoutAmount}
                    onChange={(e) => setEditCampPayoutAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all font-sans"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0052FF] text-white font-bold h-12 rounded-xl text-sm flex items-center justify-center hover:bg-blue-650 disabled:opacity-50 cursor-pointer shadow shadow-blue-500/10 transition-all font-sans"
              >
                {loading ? <div className="h-5 w-5 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" /> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Affiliate Details Modal */}
      {selectedPublisherForModal && (() => {
        const pub = selectedPublisherForModal;
        const tsKey = `rewardmate_publisher_traffic_sources_${pub.id}`;
        const sources = JSON.parse(localStorage.getItem(tsKey) || '[]');
        
        // Compute stats
        const allApps = JSON.parse(localStorage.getItem('rewardmate_mock_applications') || '[]');
        const pubApps = allApps.filter((a: any) => a.publisher_id === pub.id);
        const appliedCount = pubApps.length;
        const approvedCount = pubApps.filter((a: any) => a.status === 'approved').length;
        const acceptanceRate = appliedCount > 0 ? Math.round((approvedCount / appliedCount) * 100) : 100;

        const pubClicks = clicks.filter(c => c.publisher_id === pub.id).length;
        const pubConvs = conversions.filter(c => c.publisher_id === pub.id).length;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl animate-in scale-in duration-205 border border-slate-100 flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-left">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0052FF] to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm overflow-hidden shrink-0">
                    {pub.avatar_url ? (
                      <img src={pub.avatar_url} className="h-10 w-10 object-cover" alt="" />
                    ) : (
                      (pub.business_name || pub.full_name || 'P').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 leading-none mb-1">{pub.business_name || pub.full_name || 'Affiliate Publisher'}</h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{pub.full_name} ({pub.email})</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPublisherForModal(null)}
                  className="h-8 w-8 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-450 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto no-scrollbar flex-1 text-left font-sans">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">Program Acceptance</div>
                    <div className="text-lg font-black text-[#0052FF] mt-1">{acceptanceRate}%</div>
                    <div className="text-[8px] text-slate-400 font-bold mt-0.5">{approvedCount} of {appliedCount} approved</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">Generated Clicks</div>
                    <div className="text-lg font-black text-slate-900 mt-1">{pubClicks || 0}</div>
                    <div className="text-[8px] text-slate-400 font-bold mt-0.5">Redirect traffic total</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">Approved Sales</div>
                    <div className="text-lg font-black text-slate-900 mt-1">{pubConvs || 0}</div>
                    <div className="text-[8px] text-slate-400 font-bold mt-0.5">Approved acquisitions</div>
                  </div>
                </div>

                {/* Primary Website Info */}
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/20 space-y-1.5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans">Primary Channel Details</h4>
                  <div className="text-xs font-bold text-slate-800">
                    Website: <a href={pub.website} target="_blank" rel="noreferrer" className="text-[#0052FF] hover:underline font-mono">{pub.website || 'Not specified'}</a>
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Traffic Volume: <span className="text-slate-600">{pub.traffic || 'Not specified'}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Promo Type / Channels: <span className="text-slate-600">{pub.channels || 'Not specified'}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-2 pt-1 border-t border-slate-100/60 mt-1">
                    Media Kit: {pub.media_kit_url ? (
                      <a 
                        href={pub.media_kit_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-extrabold hover:underline"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                        Open Media Kit (PDF)
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No Media Kit uploaded</span>
                    )}
                  </div>
                </div>

                {/* Registered Traffic Sources List */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans">Linked Traffic Sources ({sources.length})</h4>
                  {sources.length === 0 ? (
                    <div className="text-xs font-bold text-slate-400 italic py-2 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No additional traffic sources registered by this publisher.
                    </div>
                  ) : (
                    <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
                      {sources.map((src: any) => (
                        <div key={src.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/40 flex justify-between items-center text-xs">
                          <div className="truncate pr-4 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-850 truncate">{src.name}</span>
                              <span className="text-[8px] bg-slate-200 text-slate-600 px-1 py-0.5 rounded font-extrabold uppercase">
                                {src.type}
                              </span>
                              {src.is_default && (
                                <span className="text-[8px] bg-[#0052FF]/10 text-[#0052FF] px-1 py-0.5 rounded font-extrabold uppercase">
                                  Default
                                </span>
                              )}
                            </div>
                            <a href={src.url.startsWith('http') ? src.url : `https://${src.url}`} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-slate-400 hover:text-[#0052FF] truncate block font-mono">
                              {src.url}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 font-sans">
                <button 
                  onClick={() => {
                    setSelectedContact(pub);
                    setActiveTab('messages');
                    setSelectedPublisherForModal(null);
                  }}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Mail className="h-4 w-4 text-[#0052FF]" /> Message Affiliate
                </button>
                <button 
                  onClick={() => setSelectedPublisherForModal(null)}
                  className="px-5 py-2.5 bg-[#0052FF] hover:bg-blue-650 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}


// ----------------------------------------------------
// 3. ADMIN DASHBOARD
// ----------------------------------------------------
function AdminDashboard({ profile, signOut }: { profile: any, signOut: any }) {
  const { impersonateUser, updateProfileDetails } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'campaign-approvals' | 'conversion-approvals' | 'brands' | 'invoices' | 'affiliates' | 'messages' | 'settings' | 'contact-messages'>('overview');
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [messageFilter, setMessageFilter] = useState<'all' | 'brands' | 'affiliates'>('all');
  const [adminChartRange, setAdminChartRange] = useState<'1m' | '3m' | '6m' | '12m' | 'ytd'>('3m');

  // Account Settings Form State
  const [settingsFullName, setSettingsFullName] = useState(profile?.full_name || '');
  const [settingsAvatarUrl, setSettingsAvatarUrl] = useState(profile?.avatar_url || '');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setSettingsFullName(profile.full_name || '');
      setSettingsAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error('Image file must be under 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 128;
        const MAX_HEIGHT = 128;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setSettingsAvatarUrl(compressedBase64);
          toast.success('Avatar loaded! Save settings to apply.');
        }
      };
      img.src = base64Str;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await updateProfileDetails({
        full_name: settingsFullName,
        avatar_url: settingsAvatarUrl
      });
      toast.success('Settings updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings.');
    } finally {
      setSaveLoading(false);
    }
  };
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);
  const [adminInvoices, setAdminInvoices] = useState<any[]>([]);
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
          business_name: newUserType !== 'admin' ? newUserBusiness : undefined,
          website: newUserType !== 'admin' ? newUserWebsite : undefined,
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
            business_name: newUserType !== 'admin' ? newUserBusiness : null,
            website: newUserType !== 'admin' ? newUserWebsite : null,
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

      const links = await getAllAffiliateLinks();
      setAffiliateLinks(links);

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

      // Fetch contact inquiries
      const inqs = await getContactInquiries();
      setContactInquiries(inqs);

      // Fetch all brand invoices
      const allInvs = await getAllInvoices();
      setAdminInvoices(allInvs);

      await loadMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkInquiryReplied = async (inquiryId: string) => {
    try {
      await markContactInquiryReplied(inquiryId);
      toast.success('Inquiry marked as replied successfully!');
      const inqs = await getContactInquiries();
      setContactInquiries(inqs);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update inquiry status.');
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateCommissionRate = async (userId: string, newRate: number) => {
    try {
      if (!isSupabaseConfigured) {
        const stored = JSON.parse(localStorage.getItem('rewardmate_mock_profiles') || '[]');
        const updated = stored.map((p: any) => p.id === userId ? { ...p, commission_rate: newRate } : p);
        localStorage.setItem('rewardmate_mock_profiles', JSON.stringify(updated));
        toast.success(`Successfully updated RewardMate fee rate to ${newRate}%`);
        loadData();
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({ commission_rate: newRate })
          .eq('id', userId);
        if (error) throw error;
        toast.success(`Successfully updated RewardMate fee rate to ${newRate}%`);
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update RewardMate fee rate.');
    }
  };

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
          .update({ approval_status: 'approved', onboarding_completed: true })
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
      
      {/* MOBILE SIDEBAR DRAWER (Sliding panel) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          
          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#090b16] border-r border-white/5 pt-5 pb-4 transition-all duration-300 animate-in slide-in-from-left text-white">
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
              <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer text-white">
                <div className="flex items-center space-x-3">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} className="h-8 w-8 rounded-full object-cover shrink-0" alt="Avatar" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-extrabold text-sm select-none shadow shrink-0">
                      {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-slate-200 leading-none mb-1 truncate max-w-[150px]">{profile.full_name || 'Admin'}</div>
                    <div className="text-[9px] text-slate-400 font-bold">ID: {formatUserId(profile.id)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation stack */}
            <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto pt-2">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'campaign-approvals', label: 'Campaigns', icon: FolderKanban },
                { id: 'conversion-approvals', label: 'Conversions', icon: DollarSign },
                { id: 'brands', label: 'Brands', icon: Building },
                { id: 'affiliates', label: 'Affiliates', icon: Users },
                { id: 'messages', label: 'Messages', icon: Mail },
                { id: 'contact-messages', label: 'Contact Messages', icon: Bell },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={async () => {
                      setActiveTab(item.id as any);
                      setMobileMenuOpen(false);
                      if (item.id === 'contact-messages') {
                        try {
                          const inqs = await getContactInquiries();
                          setContactInquiries(inqs);
                        } catch (err) {
                          console.error('Error reloading contact messages on mobile click:', err);
                        }
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-white/10 text-white border-l-4 border-purple-500 pl-2.5' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`h-4.5 w-4.5 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.id === 'contact-messages' && contactInquiries.filter(i => !i.replied).length > 0 && (
                      <span className="bg-amber-500 text-white text-[7px] font-black h-3.5 px-1.5 rounded-full flex items-center justify-center min-w-3.5 border border-[#0d0f17]">
                        {contactInquiries.filter(i => !i.replied).length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-[#090b16]">
              <button 
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 h-10 rounded-xl cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 1. LEFT SIDEBAR PANEL (Fixed) */}
      <aside className={`hidden lg:flex bg-[#090b16] flex-col justify-between shrink-0 h-full z-20 transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex flex-col w-full">
          {/* Logo Header */}
          <div className={`py-5 flex items-center border-b border-white/5 bg-[#090b16] w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'px-6'}`}>
            {isSidebarCollapsed ? (
              <div className="flex flex-col items-center gap-3">
                <img 
                  src="/RewardMateFav.png" 
                  className="h-7 w-7 object-contain cursor-pointer" 
                  alt="Reward Mate Favicon"
                  onClick={() => setIsSidebarCollapsed(false)}
                />
                <button 
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5"
                  title="Expand Menu"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <img 
                  src="/rewardmate-logo-cropped.png" 
                  className="h-6 w-auto object-contain" 
                  alt="Reward Mate Logo" 
                />
                <button 
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5 shrink-0"
                  title="Collapse Menu"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Profile Card */}
          <div className={isSidebarCollapsed ? 'px-2 py-4 flex justify-center' : 'px-4 py-4'}>
            <div className={`flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group text-white ${isSidebarCollapsed ? 'w-10 h-10 p-0 justify-center' : 'w-full'}`}>
              <div className="flex items-center space-x-3">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} className="h-8 w-8 rounded-full object-cover shrink-0" alt="Avatar" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-purple-650 text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                  </div>
                )}
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
              onClick={() => setActiveTab('overview')}
              title="Overview"
              className={`w-full flex items-center py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5'} ${
                activeTab === 'overview' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Overview</span>}
            </button>
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
              onClick={() => setActiveTab('brands')}
              title="Brands"
              className={`w-full flex items-center py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5'} ${
                activeTab === 'brands' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Building className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Brands</span>}
            </button>
            <button
              onClick={async () => {
                setActiveTab('invoices');
                try {
                  const invs = await getAllInvoices();
                  setAdminInvoices(invs);
                } catch (e) {
                  console.error('Error loading invoices:', e);
                }
              }}
              title="Brand Invoices"
              className={`w-full flex items-center py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5'} ${
                activeTab === 'invoices' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Receipt className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Brand Invoices</span>}
            </button>
            <button
              onClick={() => setActiveTab('affiliates')}
              title="Affiliates"
              className={`w-full flex items-center py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5'} ${
                activeTab === 'affiliates' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Affiliates</span>}
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
            <button
              onClick={async () => {
                setActiveTab('contact-messages');
                try {
                  const inqs = await getContactInquiries();
                  setContactInquiries(inqs);
                } catch (err) {
                  console.error('Error reloading contact messages on click:', err);
                }
              }}
              title="Contact Messages"
              className={`w-full flex items-center py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5'} ${
                activeTab === 'contact-messages' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="relative flex items-center shrink-0">
                <Bell className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
                {contactInquiries.filter(i => !i.replied).length > 0 && (
                  <span className={`absolute bg-amber-500 text-white text-[7px] font-black h-3 px-1 rounded-full flex items-center justify-center min-w-3 border border-[#0d0f17] ${
                    isSidebarCollapsed ? '-top-1.5 -right-1' : '-top-2 left-2'
                  }`}>
                    {contactInquiries.filter(i => !i.replied).length}
                  </span>
                )}
              </div>
              {!isSidebarCollapsed && <span>Contact Messages</span>}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              title="Account Settings"
              className={`w-full flex items-center py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5'} ${
                activeTab === 'settings' 
                  ? 'bg-white/10 text-white border-l-4 border-[#0052FF] pl-2.5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Sliders className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Account Settings</span>}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className={`border-t border-white/5 bg-[#090b16] ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
          {!isSidebarCollapsed && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-slate-500 font-bold select-none">
                <span className="text-[10px] tracking-wider font-semibold uppercase text-slate-455">v1.0</span>
              </div>
            </div>
          )}

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
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1 mr-3 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>
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
                              const matchingContact = contacts.find(c => c.id === m.sender_id);
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
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} className="h-7 w-7 rounded-full object-cover shrink-0" alt="Avatar" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-extrabold text-xs select-none border border-purple-200 shadow-sm shrink-0">
                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                  </div>
                )}
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
                    
                    <button 
                      onClick={() => {
                        setShowUserDropdown(false);
                        setActiveTab('settings');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-655 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      Account Settings
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
          
          {/* Tab Contents */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300 font-sans text-left">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-sans">Network Overview</h3>
                <p className="text-xs text-slate-550 font-medium">Real-time performance metrics, pending review items, and platform volume audits.</p>
              </div>

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

              {/* Expanded Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Audits & Approvals</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-slate-500">Pending Brands</span>
                      <span className="font-bold text-slate-800">{profiles.filter(p => p.user_type === 'advertiser' && p.approval_status === 'pending').length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-slate-500">Pending Affiliates</span>
                      <span className="font-bold text-slate-800">{profiles.filter(p => p.user_type === 'publisher' && p.approval_status === 'pending').length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-500">New Contact Inquiries</span>
                      <span className="font-bold text-[#0052FF]">{contactInquiries.filter(i => !i.replied).length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Total User Accounts</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-slate-500">Advertisers (Brands)</span>
                      <span className="font-bold text-slate-800">{profiles.filter(p => p.user_type === 'advertiser').length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-slate-500">Publishers (Affiliates)</span>
                      <span className="font-bold text-slate-800">{profiles.filter(p => p.user_type === 'publisher').length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-500">System Administrators</span>
                      <span className="font-bold text-slate-800">{profiles.filter(p => p.user_type === 'admin').length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Campaign Stats Summary</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-slate-500">Active Offers</span>
                      <span className="font-bold text-emerald-600">{campaigns.filter(c => c.status === 'active').length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-slate-500">Pending Offers</span>
                      <span className="font-bold text-amber-600">{campaigns.filter(c => c.status === 'pending_approval').length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-500">Total System Offers</span>
                      <span className="font-bold text-slate-800">{campaigns.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Performance Audit Chart */}
              <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Network Performance Audit</h3>
                    <p className="text-[10px] text-slate-400 font-bold">Auditing clicks, total sales, and affiliate payout commissions</p>
                  </div>
                  
                  {/* Time Range Filters */}
                  <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-150 text-[10px] font-black shrink-0 select-none">
                    {(['1m', '3m', '6m', '12m', 'ytd'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setAdminChartRange(r)}
                        className={`h-7 px-3.5 rounded-lg transition-all cursor-pointer ${
                          adminChartRange === r 
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-150' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {r === '1m' ? '1 Month' :
                         r === '3m' ? '3 Months' :
                         r === '6m' ? '6 Months' :
                         r === '12m' ? '12 Months' : 'YTD'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Graph Grid */}
                {(() => {
                  const { labels, clicksData, salesData, commData } = (() => {
                    const now = new Date();
                    let cutoffDate = new Date();
                    let bucketCount = 6;
                    let bucketUnit: 'day' | 'month' = 'month';

                    if (adminChartRange === '1m') {
                      cutoffDate.setDate(now.getDate() - 30);
                      bucketCount = 30;
                      bucketUnit = 'day';
                    } else if (adminChartRange === '3m') {
                      cutoffDate.setMonth(now.getMonth() - 3);
                      bucketCount = 3;
                      bucketUnit = 'month';
                    } else if (adminChartRange === '6m') {
                      cutoffDate.setMonth(now.getMonth() - 6);
                      bucketCount = 6;
                      bucketUnit = 'month';
                    } else if (adminChartRange === '12m') {
                      cutoffDate.setMonth(now.getMonth() - 12);
                      bucketCount = 12;
                      bucketUnit = 'month';
                    } else if (adminChartRange === 'ytd') {
                      cutoffDate = new Date(now.getFullYear(), 0, 1);
                      bucketCount = now.getMonth() + 1;
                      bucketUnit = 'month';
                    }

                    const lbs: string[] = [];
                    const clks: number[] = [];
                    const sls: number[] = [];
                    const cms: number[] = [];

                    if (bucketUnit === 'day') {
                      for (let i = bucketCount - 1; i >= 0; i--) {
                        const d = new Date();
                        d.setDate(now.getDate() - i);
                        lbs.push(d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }));

                        const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
                        const dEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

                        const dayClicks = clicks.filter(c => {
                          const dt = new Date(c.created_at);
                          return dt >= dStart && dt <= dEnd;
                        }).length;

                        const approvedConvs = conversions.filter(c => c.status === 'approved');
                        const daySales = approvedConvs.filter(c => {
                          const dt = new Date(c.created_at);
                          return dt >= dStart && dt <= dEnd;
                        }).reduce((sum, c) => sum + Number(c.sale_amount || 0), 0);

                        const dayComm = approvedConvs.filter(c => {
                          const dt = new Date(c.created_at);
                          return dt >= dStart && dt <= dEnd;
                        }).reduce((sum, c) => sum + Number(c.payout || 0), 0);

                        clks.push(dayClicks);
                        sls.push(daySales);
                        cms.push(dayComm);
                      }
                    } else {
                      for (let i = bucketCount - 1; i >= 0; i--) {
                        const d = new Date();
                        d.setMonth(now.getMonth() - i);
                        lbs.push(d.toLocaleDateString('en-AU', { month: 'short', year: '2-digit' }));

                        const year = d.getFullYear();
                        const month = d.getMonth();
                        const mStart = new Date(year, month, 1);
                        const mEnd = new Date(year, month + 1, 0, 23, 59, 59);

                        const mClicks = clicks.filter(c => {
                          const dt = new Date(c.created_at);
                          return dt >= mStart && dt <= mEnd;
                        }).length;

                        const approvedConvs = conversions.filter(c => c.status === 'approved');
                        const mSales = approvedConvs.filter(c => {
                          const dt = new Date(c.created_at);
                          return dt >= mStart && dt <= mEnd;
                        }).reduce((sum, c) => sum + Number(c.sale_amount || 0), 0);

                        const mComm = approvedConvs.filter(c => {
                          const dt = new Date(c.created_at);
                          return dt >= mStart && dt <= mEnd;
                        }).reduce((sum, c) => sum + Number(c.payout || 0), 0);

                        clks.push(mClicks);
                        sls.push(mSales);
                        cms.push(mComm);
                      }
                    }

                    return { labels: lbs, clicksData: clks, salesData: sls, commData: cms };
                  })();

                  const maxClicks = Math.max(...clicksData) || 1;
                  const maxSales = Math.max(...salesData) || 1;
                  const maxComm = Math.max(...commData) || 1;

                  return (
                    <div className="space-y-4">
                      {/* Vertical bars layout */}
                      <div className="h-64 flex items-end justify-between px-2 gap-4 relative border-b border-slate-100">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 border-b border-slate-200">
                          <div className="border-b border-slate-200 w-full"></div>
                          <div className="border-b border-slate-200 w-full"></div>
                          <div className="border-b border-slate-200 w-full"></div>
                        </div>

                        {labels.map((lbl, idx) => {
                          const clickPct = (clicksData[idx] / maxClicks) * 100;
                          const salePct = (salesData[idx] / maxSales) * 100;
                          const commPct = (commData[idx] / maxComm) * 100;

                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end z-10">
                              {/* Hover Tooltip card details */}
                              <div className="absolute bottom-full mb-2 bg-[#090b16] text-white text-[10px] font-bold p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl pointer-events-none z-50 min-w-[140px] space-y-1">
                                <div className="text-[9px] uppercase tracking-wider text-slate-400 border-b border-slate-805 pb-1 mb-1">{lbl} Details</div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-400">Clicks:</span>
                                  <span>{clicksData[idx]}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-400">Sales:</span>
                                  <span className="text-emerald-400">${salesData[idx].toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-400">Commission:</span>
                                  <span className="text-[#0052FF]">${commData[idx].toFixed(2)}</span>
                                </div>
                              </div>

                              {/* Three side-by-side series bars */}
                              <div className="w-full flex items-end justify-center gap-1.5 h-[80%] pb-1">
                                {/* Clicks Bar */}
                                <div 
                                  className="w-2.5 sm:w-4 bg-indigo-500/80 group-hover:bg-indigo-650 rounded-t-sm transition-all duration-300"
                                  style={{ height: `${clickPct * 0.9}%` }}
                                  title={`Clicks: ${clicksData[idx]}`}
                                ></div>
                                {/* Sales Bar */}
                                <div 
                                  className="w-2.5 sm:w-4 bg-emerald-400/80 group-hover:bg-emerald-500 rounded-t-sm transition-all duration-300"
                                  style={{ height: `${salePct * 0.9}%` }}
                                  title={`Sales Volume: $${salesData[idx].toFixed(2)}`}
                                ></div>
                                {/* Commission Bar */}
                                <div 
                                  className="w-2.5 sm:w-4 bg-[#0052FF]/80 group-hover:bg-[#0052FF] rounded-t-sm transition-all duration-300"
                                  style={{ height: `${commPct * 0.9}%` }}
                                  title={`Commission: $${commData[idx].toFixed(2)}`}
                                ></div>
                              </div>

                              {/* Label */}
                              <span className="text-[9px] font-bold text-slate-400 mt-2 truncate w-full text-center">{lbl}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Legend Row */}
                      <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-black text-slate-600 pt-2 select-none">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 bg-indigo-500 rounded-sm"></div>
                          <span>Clicks Logged</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 bg-emerald-400 rounded-sm"></div>
                          <span>Sales Volume ($ AUD)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 bg-[#0052FF] rounded-sm"></div>
                          <span>Commissions Generated ($ AUD)</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Latest Registered Entities Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Latest Brands */}
                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4 text-left">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Latest Brands</h3>
                    <p className="text-[10px] text-slate-400 font-bold font-sans">Most recently registered advertiser profiles</p>
                  </div>
                  
                  <div className="divide-y divide-slate-50 font-sans text-xs">
                    {(() => {
                      const latestBrands = profiles
                        .filter(p => p.user_type === 'advertiser')
                        .slice(-5)
                        .reverse();
                      if (latestBrands.length === 0) {
                        return <div className="text-slate-400 italic py-6 text-center">No brands registered.</div>;
                      }
                      return latestBrands.map((b) => (
                        <div key={b.id} className="flex items-center justify-between py-3 hover:bg-slate-50/50 px-2 rounded-xl transition-all">
                          <div className="flex items-center space-x-3 text-left min-w-0">
                            <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-slate-100 flex items-center justify-center font-bold text-slate-700 overflow-hidden shrink-0">
                              {b.avatar_url ? (
                                <img src={b.avatar_url} className="h-full w-full object-cover" alt="" />
                              ) : (
                                (b.business_name || b.full_name || 'B').charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="truncate">
                              <div className="font-extrabold text-slate-800 truncate">{b.business_name || b.full_name}</div>
                              <div className="text-[10px] text-slate-400 font-medium truncate">{b.email}</div>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                            b.approval_status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                            b.approval_status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-700 animate-pulse' :
                            'bg-rose-50 border-rose-100 text-rose-700'
                          }`}>
                            {b.approval_status}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Latest Affiliates */}
                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4 text-left">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Latest Affiliates</h3>
                    <p className="text-[10px] text-slate-400 font-bold font-sans">Most recently registered partner profiles</p>
                  </div>
                  
                  <div className="divide-y divide-slate-50 font-sans text-xs">
                    {(() => {
                      const latestAffs = profiles
                        .filter(p => p.user_type === 'publisher')
                        .slice(-5)
                        .reverse();
                      if (latestAffs.length === 0) {
                        return <div className="text-slate-400 italic py-6 text-center">No affiliates registered.</div>;
                      }
                      return latestAffs.map((a) => (
                        <div key={a.id} className="flex items-center justify-between py-3 hover:bg-slate-50/50 px-2 rounded-xl transition-all">
                          <div className="flex items-center space-x-3 text-left min-w-0">
                            <div className="h-8 w-8 rounded-lg bg-[#0052FF]/5 border border-slate-100 flex items-center justify-center font-bold text-slate-700 overflow-hidden shrink-0">
                              {a.avatar_url ? (
                                <img src={a.avatar_url} className="h-full w-full object-cover" alt="" />
                              ) : (
                                (a.business_name || a.full_name || 'A').charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="truncate">
                              <div className="font-extrabold text-slate-800 truncate">{a.business_name || a.full_name}</div>
                              <div className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1.5">
                                <span>{a.email}</span>
                                {a.media_kit_url && (
                                  <a 
                                    href={a.media_kit_url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-emerald-600 hover:text-emerald-700 font-extrabold flex items-center gap-0.5 hover:underline"
                                    title="Open Media Kit"
                                  >
                                    • Media Kit
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                            a.approval_status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                            a.approval_status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-700 animate-pulse' :
                            'bg-rose-50 border-rose-100 text-rose-700'
                          }`}>
                            {a.approval_status}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

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
                          <div className="text-xs text-slate-500">Payout Rate</div>
                          <div className="text-sm font-extrabold text-[#0052FF]">
                            {camp.payout_type === 'revshare' ? `${camp.payout_amount}%` : `$${Number(camp.payout_amount).toFixed(2)} AUD`} ({camp.payout_type.toUpperCase()})
                          </div>
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

          {/* TAB: BRANDS */}
          {activeTab === 'brands' && (
            <>
              <div className="space-y-6 animate-in fade-in duration-300 font-sans text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-sans">Brand Management</h3>
                    <p className="text-xs text-slate-550 font-medium">Monitor active advertiser brands, view their balance, active campaigns, and connected affiliates.</p>
                  </div>
                  <button
                    onClick={() => {
                      setNewUserType('advertiser');
                      setNewUserFullName('');
                      setNewUserEmail('');
                      setNewUserBalance('0.00');
                      setNewUserBusiness('');
                      setNewUserWebsite('');
                      setShowAddUserModal(true);
                    }}
                    className="bg-[#0052FF] hover:bg-blue-650 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm self-start sm:self-center"
                  >
                    <Plus className="h-4 w-4" /> Setup New Brand
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-455">
                          <th className="py-4 px-6">Brand Details</th>
                          <th className="py-4 px-6">Starting Country</th>
                          <th className="py-4 px-6">Campaigns Count</th>
                          <th className="py-4 px-6">Total Clicks</th>
                          <th className="py-4 px-6 text-right">Account Balance</th>
                          <th className="py-4 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {profiles.filter(p => p.user_type === 'advertiser').length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">No brands found. Setup a new brand account to start.</td>
                          </tr>
                        ) : (
                          profiles.filter(p => p.user_type === 'advertiser').map((p) => {
                            const country = (() => {
                              if (p.email.endsWith('.au')) return { flag: '🇦🇺', code: 'AU', name: 'Australia' };
                              if (p.email.endsWith('.uk') || p.email.endsWith('.co.uk')) return { flag: '🇬🇧', code: 'GB', name: 'United Kingdom' };
                              if (p.email.endsWith('.nz')) return { flag: '🇳🇿', code: 'NZ', name: 'New Zealand' };
                              const charCode = p.id.charCodeAt(0) || 0;
                              if (charCode % 3 === 0) return { flag: '🇺🇸', code: 'US', name: 'United States' };
                              if (charCode % 3 === 1) return { flag: '🇬🇧', code: 'GB', name: 'United Kingdom' };
                              return { flag: '🇦🇺', code: 'AU', name: 'Australia' };
                            })();

                            const brandCampaigns = campaigns.filter(c => c.advertiser_id === p.id);
                            const brandClicks = clicks.filter(c => c.campaign?.advertiser_id === p.id).length;
                            
                            // Connected affiliates are publishers who have tracking links for this brand's campaigns
                            const connectedLinks = affiliateLinks.filter(l => l.campaign?.advertiser_id === p.id);
                            const uniqueAffiliateIds = Array.from(new Set(connectedLinks.map(l => l.publisher_id)));
                            
                            return (
                              <Fragment key={p.id}>
                                <tr 
                                  onClick={() => setExpandedUserId(expandedUserId === p.id ? null : p.id)}
                                  className={`hover:bg-slate-50 transition-colors cursor-pointer select-none ${expandedUserId === p.id ? 'bg-slate-50/80' : ''}`}
                                >
                                  <td className="py-4 px-6">
                                    <div className="flex items-center space-x-3">
                                      {p.avatar_url ? (
                                        <img src={p.avatar_url} className="h-8 w-8 rounded-full object-cover shrink-0 mt-0.5 border border-slate-200" alt="Avatar" />
                                      ) : (
                                        <div className="h-8 w-8 rounded-full bg-blue-50 text-[#0052FF] flex items-center justify-center font-extrabold text-xs border border-blue-100 mt-0.5 shrink-0">
                                          {(p.business_name || p.full_name || p.email).charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <div className="space-y-0.5 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-slate-800 truncate">{p.business_name || p.full_name || 'No Name'}</span>
                                          {p.approval_status === 'pending' && (
                                            <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0">
                                              Pending Review
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
                                    <span className="flex items-center gap-1.5 font-semibold text-slate-555">
                                      <span>{country.flag}</span>
                                      <span>{country.code}</span>
                                    </span>
                                  </td>
                                  <td className="py-4 px-6 font-bold text-slate-600">{brandCampaigns.length} Campaigns</td>
                                  <td className="py-4 px-6 font-bold text-slate-600">{brandClicks} Clicks</td>
                                  <td className="py-4 px-6 text-right font-sans">
                                    <div className="font-bold text-slate-800">${Number(p.wallet_balance).toFixed(2)} AUD</div>
                                  </td>
                                  <td className="py-4 px-6 font-sans text-center" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-center gap-2">
                                      {p.approval_status === 'pending' && (
                                        <button
                                          onClick={() => handleApproveUser(p.id)}
                                          className="bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-600 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer text-[10px]"
                                        >
                                          Approve
                                        </button>
                                      )}
                                      <button
                                        onClick={() => impersonateUser?.(p)}
                                        className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-650 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer text-[10px]"
                                      >
                                        Login As
                                      </button>
                                      <button
                                        onClick={() => handleRemoveUser(p.id)}
                                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer text-[10px] border border-rose-100"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {expandedUserId === p.id && (
                                  <tr className="bg-slate-50/50">
                                    <td colSpan={6} className="px-6 py-4 border-t border-slate-100/50">
                                      <div className="bg-white rounded-2xl border border-slate-150 p-5 space-y-6 shadow-sm animate-in slide-in-from-top-2 duration-200 text-left">
                                        
                                        {/* Brand Profile Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Account Details</h4>
                                            <div className="space-y-2 bg-slate-50/40 border border-slate-150 p-4 rounded-xl font-semibold text-slate-655 text-xs">
                                              <div><span className="text-slate-400 font-bold">Contact Name:</span> {p.full_name || 'Not provided'}</div>
                                              <div><span className="text-slate-400 font-bold">Registered:</span> {new Date(p.created_at).toLocaleDateString('en-AU')}</div>
                                              <div><span className="text-slate-400 font-bold">Role ID:</span> <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{p.id}</span></div>
                                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
                                                <div className="flex items-center space-x-1.5">
                                                  <span className="text-slate-400 font-bold">RewardMate Fee:</span>
                                                  <span className="font-extrabold text-[#0052FF]">{p.commission_rate !== undefined ? p.commission_rate : '1.50'}%</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                  <input 
                                                    type="number" 
                                                    step="0.1" 
                                                    min="0"
                                                    max="100"
                                                    defaultValue={p.commission_rate !== undefined ? p.commission_rate : 1.50}
                                                    id={`commission_rate_${p.id}`}
                                                    className="w-14 h-7 bg-white border border-slate-200 rounded-lg text-center text-[10px] font-bold text-slate-800 focus:outline-none focus:border-[#0052FF]"
                                                  />
                                                  <button
                                                    onClick={async () => {
                                                      const inputEl = document.getElementById(`commission_rate_${p.id}`) as HTMLInputElement;
                                                      if (inputEl) {
                                                        const val = parseFloat(inputEl.value);
                                                        if (isNaN(val) || val < 0 || val > 100) {
                                                          toast.error('Please enter a valid rate between 0 and 100.');
                                                          return;
                                                        }
                                                        await handleUpdateCommissionRate(p.id, val);
                                                      }
                                                    }}
                                                    className="bg-[#0052FF] hover:bg-blue-650 text-white font-black text-[9px] h-7 px-2 rounded-lg transition-colors cursor-pointer"
                                                  >
                                                    Save
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Brand Onboarding Details</h4>
                                            <div className="space-y-2 bg-slate-50/40 border border-slate-150 p-4 rounded-xl font-semibold text-slate-655 text-xs">
                                              <div><span className="text-slate-400 font-bold">Company Website:</span> {p.website ? <a href={p.website} target="_blank" rel="noreferrer" className="text-[#0052FF] underline ml-1">{p.website}</a> : 'Not provided'}</div>
                                              <div><span className="text-slate-400 font-bold">Industry Category:</span> {p.channels || 'Not provided'}</div>
                                              <div><span className="text-slate-400 font-bold">Monthly Ad Budget:</span> {p.traffic || 'Not provided'}</div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Brand Campaigns */}
                                        <div>
                                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Campaigns ({brandCampaigns.length})</h4>
                                          {brandCampaigns.length === 0 ? (
                                            <div className="text-xs text-slate-400 italic bg-slate-50/30 p-4 rounded-xl border border-slate-150/50">No campaigns created yet.</div>
                                          ) : (
                                            <div className="border border-slate-150 rounded-xl overflow-hidden shadow-sm">
                                              <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                  <tr className="bg-slate-50 border-b border-slate-150 text-[9px] font-black text-slate-400 uppercase">
                                                    <th className="py-2.5 px-4">Offer Name</th>
                                                    <th className="py-2.5 px-4">Payout</th>
                                                    <th className="py-2.5 px-4">Total Paid Commission</th>
                                                    <th className="py-2.5 px-4">Status</th>
                                                  </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 font-medium text-slate-655">
                                                  {brandCampaigns.map(c => (
                                                    <tr key={c.id} className="hover:bg-slate-50/30">
                                                      <td className="py-2 px-4 font-bold text-slate-800">{c.name}</td>
                                                      <td className="py-2 px-4">
                                                        {c.payout_type === 'revshare' ? `${c.payout_amount}%` : `$${Number(c.payout_amount).toFixed(2)}`} ({c.payout_type.toUpperCase()})
                                                      </td>
                                                      <td className="py-2 px-4">${Number(c.spend || 0).toFixed(2)}</td>
                                                      <td className="py-2 px-4">
                                                        <span className={`text-[9px] font-black uppercase rounded px-1.5 py-0.2 border ${
                                                          c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                          c.status === 'pending_approval' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                          'bg-rose-50 text-rose-700 border-rose-100'
                                                        }`}>{c.status}</span>
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          )}
                                        </div>

                                        {/* Connected Affiliates */}
                                        <div>
                                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Connected Affiliates ({uniqueAffiliateIds.length})</h4>
                                          {uniqueAffiliateIds.length === 0 ? (
                                            <div className="text-xs text-slate-400 italic bg-slate-50/30 p-4 rounded-xl border border-slate-150/50">No active publishers connected to this brand yet.</div>
                                          ) : (
                                            <div className="border border-slate-150 rounded-xl overflow-hidden shadow-sm">
                                              <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                  <tr className="bg-slate-50 border-b border-slate-150 text-[9px] font-black text-slate-400 uppercase">
                                                    <th className="py-2.5 px-4">Publisher</th>
                                                    <th className="py-2.5 px-4">Website</th>
                                                    <th className="py-2.5 px-4">Link Tracking Code</th>
                                                    <th className="py-2.5 px-4">Monthly Traffic</th>
                                                    <th className="py-2.5 px-4">Connected Campaign</th>
                                                  </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 font-medium text-slate-655">
                                                  {connectedLinks.map(link => {
                                                    const pub = profiles.find(pr => pr.id === link.publisher_id);
                                                    if (!pub) return null;
                                                    return (
                                                      <tr key={link.id} className="hover:bg-slate-50/30">
                                                        <td className="py-2 px-4 font-bold text-slate-800">{pub.business_name || pub.full_name || pub.email}</td>
                                                        <td className="py-2 px-4">{pub.website ? <a href={pub.website} target="_blank" rel="noreferrer" className="text-[#0052FF] hover:underline font-semibold">{pub.website}</a> : 'Not provided'}</td>
                                                        <td className="py-2 px-4"><span className="font-mono bg-slate-50 border border-slate-200 px-1 py-0.5 rounded text-[10px]">{link.code}</span></td>
                                                        <td className="py-2 px-4 text-slate-500">{pub.traffic || 'Not provided'}</td>
                                                        <td className="py-2 px-4 text-slate-500">{link.campaign?.name || 'Campaign'}</td>
                                                      </tr>
                                                    );
                                                  })}
                                                </tbody>
                                              </table>
                                            </div>
                                          )}
                                        </div>

                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB: INVOICES */}
          {activeTab === 'invoices' && (
            <>
              <div className="space-y-6 animate-in fade-in duration-300 font-sans text-left">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-sans">Brand Invoice Ledger</h3>
                  <p className="text-xs text-slate-550 font-medium">Monitor paid, unpaid, and outstanding advertiser invoices across the network.</p>
                </div>

                {/* Summary Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Paid (Ledger)</span>
                    <div className="text-2xl font-black text-emerald-600 font-sans">
                      ${adminInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.commissionDue, 0).toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Collected from paid brand invoices</span>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Due / Unpaid</span>
                    <div className="text-2xl font-black text-amber-500 font-sans">
                      ${adminInvoices.filter(i => i.status === 'payable').reduce((sum, i) => sum + i.commissionDue, 0).toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Awaiting merchant payment</span>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Advertisers</span>
                    <div className="text-2xl font-black text-[#0052FF] font-sans">
                      {profiles.filter(p => p.user_type === 'advertiser').length}
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Brands currently subject to billing</span>
                  </div>
                </div>

                {/* Invoices List Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-455">
                          <th className="py-4 px-6">Invoice ID</th>
                          <th className="py-4 px-6">Brand / Advertiser</th>
                          <th className="py-4 px-6">Billing Month</th>
                          <th className="py-4 px-6 text-center">Conversions</th>
                          <th className="py-4 px-6 text-right">Commission Due</th>
                          <th className="py-4 px-6 text-center">Status</th>
                          <th className="py-4 px-6">Due Date</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                        {adminInvoices.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-10 text-center text-slate-400 italic">
                              No invoices found in database.
                            </td>
                          </tr>
                        ) : (
                          adminInvoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50/40 transition-colors">
                              <td className="py-4 px-6 font-mono text-slate-900 font-bold">{inv.id}</td>
                              <td className="py-4 px-6 font-extrabold text-slate-800">{inv.advertiser_name}</td>
                              <td className="py-4 px-6">{inv.month}</td>
                              <td className="py-4 px-6 text-center font-bold">{inv.conversionsCount}</td>
                              <td className="py-4 px-6 text-right text-slate-900 font-bold">
                                ${inv.commissionDue.toFixed(2)} AUD
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  inv.status === 'paid'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}>
                                  {inv.status === 'paid' ? 'Paid' : 'Unpaid'}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-slate-500 font-medium">{inv.dueDate}</td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-2.5">
                                  <button
                                    onClick={() => {
                                      const brandDetails = {
                                        id: inv.advertiser_id,
                                        business_name: inv.advertiser_name,
                                        email: profiles.find(p => p.id === inv.advertiser_id)?.email || ''
                                      };
                                      printInvoice(inv, brandDetails);
                                    }}
                                    className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
                                    title="Download Tax Invoice"
                                  >
                                    <Download className="h-3.5 w-3.5" /> PDF
                                  </button>

                                  {inv.status === 'payable' ? (
                                    <button
                                      onClick={async () => {
                                        try {
                                          await payInvoice(inv.id, inv.advertiser_id);
                                          toast.success(`Invoice ${inv.id} marked as Paid!`);
                                          const refreshed = await getAllInvoices();
                                          setAdminInvoices(refreshed);
                                        } catch (err: any) {
                                          toast.error(err.message || 'Failed to update invoice.');
                                        }
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                    >
                                      Mark Paid
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                                      Paid {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString('en-AU') : ''}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB: AFFILIATES */}
          {activeTab === 'affiliates' && (
            <>
              <div className="space-y-6 animate-in fade-in duration-300 font-sans text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-sans">Affiliate Management</h3>
                    <p className="text-xs text-slate-555 font-medium">Monitor active affiliate publishers, audit onboarding answers, and track traffic click stats.</p>
                  </div>
                  <button
                    onClick={() => {
                      setNewUserType('publisher');
                      setNewUserFullName('');
                      setNewUserEmail('');
                      setNewUserBalance('0.00');
                      setNewUserBusiness('');
                      setNewUserWebsite('');
                      setNewUserChannels('');
                      setNewUserTraffic('');
                      setNewUserApproval('approved');
                      setShowAddUserModal(true);
                    }}
                    className="bg-[#0052FF] hover:bg-blue-650 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm self-start sm:self-center"
                  >
                    <Plus className="h-4 w-4" /> Setup New Affiliate
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-455">
                          <th className="py-4 px-6">Affiliate Profile</th>
                          <th className="py-4 px-6">Country</th>
                          <th className="py-4 px-6">Onboarding</th>
                          <th className="py-4 px-6">Total Clicks</th>
                          <th className="py-4 px-6 text-right">Total Earnings</th>
                          <th className="py-4 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {profiles.filter(p => p.user_type === 'publisher').length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">No affiliates found. Setup a new affiliate account to start.</td>
                          </tr>
                        ) : (
                          profiles.filter(p => p.user_type === 'publisher').map((p) => {
                            const country = (() => {
                              if (p.email.endsWith('.au')) return { flag: '🇦🇺', code: 'AU', name: 'Australia' };
                              if (p.email.endsWith('.uk') || p.email.endsWith('.co.uk')) return { flag: '🇬🇧', code: 'GB', name: 'United Kingdom' };
                              if (p.email.endsWith('.nz')) return { flag: '🇳🇿', code: 'NZ', name: 'New Zealand' };
                              const charCode = p.id.charCodeAt(0) || 0;
                              if (charCode % 3 === 0) return { flag: '🇺🇸', code: 'US', name: 'United States' };
                              if (charCode % 3 === 1) return { flag: '🇬🇧', code: 'GB', name: 'United Kingdom' };
                              return { flag: '🇦🇺', code: 'AU', name: 'Australia' };
                            })();

                            const isSelf = p.id === profile.id;
                            const clicksCount = clicks.filter(c => c.publisher_id === p.id).length;
                            const earnings = conversions.filter(c => c.publisher_id === p.id && c.status === 'approved').reduce((s, c) => s + Number(c.payout), 0);
                            
                            return (
                              <Fragment key={p.id}>
                                <tr 
                                  onClick={() => setExpandedUserId(expandedUserId === p.id ? null : p.id)}
                                  className={`hover:bg-slate-50 transition-colors cursor-pointer select-none ${expandedUserId === p.id ? 'bg-slate-50/80' : ''}`}
                                >
                                  <td className="py-4 px-6">
                                    <div className="flex items-center space-x-3">
                                      {p.avatar_url ? (
                                        <img src={p.avatar_url} className="h-8 w-8 rounded-full object-cover shrink-0 mt-0.5 border border-slate-200" alt="Avatar" />
                                      ) : (
                                        <div className="h-8 w-8 rounded-full bg-blue-50 text-[#0052FF] flex items-center justify-center font-extrabold text-xs border border-blue-100 mt-0.5 shrink-0">
                                          {(p.full_name || p.email).charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <div className="space-y-0.5 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-slate-800 truncate">{p.full_name || 'No Name'}</span>
                                          {p.approval_status === 'pending' && (
                                            <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0">
                                              Pending Review
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
                                    <span className="flex items-center gap-1.5 font-semibold text-slate-555">
                                      <span>{country.flag}</span>
                                      <span>{country.code}</span>
                                    </span>
                                  </td>
                                  <td className="py-4 px-6 font-sans">
                                    <span className={`text-[9px] font-black uppercase rounded px-2 py-0.5 border ${
                                      p.onboarding_completed 
                                        ? 'bg-blue-50 text-[#0052FF] border-blue-100' 
                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                    }`}>
                                      {p.onboarding_completed ? 'Completed' : 'Pending'}
                                    </span>
                                  </td>
                                  <td className="py-4 px-6 font-bold text-slate-600">{clicksCount} Clicks</td>
                                  <td className="py-4 px-6 text-right font-sans">
                                    <div className="font-bold text-slate-800">+${earnings.toFixed(2)} AUD</div>
                                  </td>
                                  <td className="py-4 px-6 font-sans text-center" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-center gap-2">
                                      {!isSelf && p.approval_status === 'pending' && (
                                        <button
                                          onClick={() => handleApproveUser(p.id)}
                                          className="bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-600 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer text-[10px]"
                                        >
                                          Approve
                                        </button>
                                      )}
                                      {!isSelf && (
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
                                    </div>
                                  </td>
                                </tr>

                                {expandedUserId === p.id && (
                                  <tr className="bg-slate-50/50">
                                    <td colSpan={6} className="px-6 py-4 border-t border-slate-100/50">
                                      <div className="bg-white rounded-2xl border border-slate-150 p-5 space-y-4 shadow-sm animate-in slide-in-from-top-2 duration-200 text-left">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Affiliate Detailed Profile</h4>
                                          <span className="text-[9px] text-slate-400 font-bold font-mono">Ref ID: {formatUserId(p.id)} | DB Key: {p.id}</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
                                          <div className="space-y-2">
                                            <div className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Account Details</div>
                                            <div><span className="text-slate-400 font-bold">Email Address:</span> {p.email}</div>
                                            <div><span className="text-slate-400 font-bold">Full Name:</span> {p.full_name || 'Not provided'}</div>
                                            <div><span className="text-slate-400 font-bold">Registration Date:</span> {new Date(p.created_at).toLocaleString('en-AU')}</div>
                                            <div><span className="text-slate-400 font-bold">Account Balance:</span> ${Number(p.wallet_balance).toFixed(2)} AUD</div>
                                            <div>
                                              <span className="text-slate-400 font-bold">Approval Status:</span> 
                                              <span className={`ml-2 text-[9px] font-black uppercase rounded px-2 py-0.5 border ${
                                                p.approval_status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                p.approval_status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-rose-50 text-rose-700 border-rose-100'
                                              }`}>{p.approval_status}</span>
                                            </div>
                                          </div>

                                          <div className="space-y-2">
                                            <div className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Publisher Onboarding Answers</div>
                                            {p.onboarding_completed || p.website || p.business_name ? (
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
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

            {/* SETUP NEW USER MODAL */}
            {showAddUserModal && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-205 text-left font-sans">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                      {newUserType === 'advertiser' ? 'Setup New Brand' : newUserType === 'publisher' ? 'Setup New Affiliate' : 'Setup New Account'}
                    </h3>
                    <button 
                      onClick={() => setShowAddUserModal(false)}
                      className="text-slate-400 hover:text-slate-655 font-bold p-1 cursor-pointer transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-655">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Contact Full Name</label>
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
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">
                          {newUserType === 'advertiser' ? 'Starting Funds (AUD)' : 'Starting Balance (AUD)'}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newUserBalance}
                          onChange={(e) => setNewUserBalance(e.target.value)}
                          className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#0052FF]"
                        />
                      </div>
                    </div>

                    {/* Pre-fill Onboarding / Business details if Brand or Affiliate */}
                    {newUserType !== 'admin' && (
                      <div className="space-y-3 pt-3 border-t border-slate-105 bg-slate-50/40 p-3 rounded-2xl">
                        <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                          {newUserType === 'advertiser' ? 'Pre-fill Brand details (Optional)' : 'Pre-fill Onboarding details (Optional)'}
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400">
                              {newUserType === 'advertiser' ? 'Company / Brand Name' : 'Business Name'}
                            </label>
                            <input
                              type="text"
                              placeholder={newUserType === 'advertiser' ? 'e.g. Mattel Shop' : 'e.g. Deal Hunters AU'}
                              value={newUserBusiness}
                              onChange={(e) => setNewUserBusiness(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0052FF]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-400">Website URL</label>
                            <input
                              type="text"
                              placeholder={newUserType === 'advertiser' ? 'e.g. https://shop.mattel.com' : 'e.g. https://dealhunters.com'}
                              value={newUserWebsite}
                              onChange={(e) => setNewUserWebsite(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0052FF]"
                            />
                          </div>
                        </div>

                        {newUserType === 'publisher' && (
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
                        )}
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

          {/* TAB: CONTACT MESSAGES */}
          {activeTab === 'contact-messages' && (
            <div className="space-y-6 animate-in fade-in duration-300 font-sans text-left">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-sans">Contact Messages</h3>
                <p className="text-xs text-slate-550 font-medium">Review and respond to general inquiries and partnerships leads submitted via the public contact form.</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-455">
                        <th className="py-4 px-6">Sender Details</th>
                        <th className="py-4 px-6">Inquiry Category</th>
                        <th className="py-4 px-6">Message details</th>
                        <th className="py-4 px-6">Submitted At</th>
                        <th className="py-4 px-6 text-center">Status</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {contactInquiries.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">No contact messages received yet.</td>
                        </tr>
                      ) : (
                        contactInquiries.map((inq) => {
                          const typeLabel = (() => {
                            switch (inq.inquiry_type) {
                              case 'advertiser': return 'Brand Onboarding';
                              case 'publisher': return 'Publisher Partnership';
                              case 'technical': return 'API & Technical Support';
                              case 'billing': return 'Billing & Deposits';
                              default: return 'General Inquiry';
                            }
                          })();
                          return (
                            <tr key={inq.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-4 px-6">
                                <div className="space-y-1">
                                  <div className="font-bold text-slate-800">{inq.full_name}</div>
                                  <div className="text-[10px] text-slate-400 font-medium">{inq.email}</div>
                                  {inq.phone && <div className="text-[9px] text-slate-400 font-mono">{inq.phone}</div>}
                                  {inq.company && <div className="text-[9px] text-[#0052FF] font-bold uppercase tracking-wider">{inq.company}</div>}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="inline-block bg-blue-50 text-[#0052FF] border border-blue-100 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  {typeLabel}
                                </span>
                              </td>
                              <td className="py-4 px-6 max-w-xs">
                                <p className="text-slate-655 font-medium leading-relaxed break-words whitespace-pre-line">{inq.message}</p>
                              </td>
                              <td className="py-4 px-6 text-slate-455 font-semibold">
                                {new Date(inq.created_at).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-4 px-6 text-center">
                                {inq.replied ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-150 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                    <Check className="h-3 w-3" /> Replied
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-150 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                    <Bell className="h-3 w-3 animate-pulse" /> New Inquiry
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-center">
                                {!inq.replied && (
                                  <button
                                    onClick={() => handleMarkInquiryReplied(inq.id)}
                                    className="bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-600 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer text-[10px]"
                                  >
                                    Mark as Replied
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MESSAGES SECTION */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-[550px] flex animate-in fade-in duration-300">
              
              {/* Left Panel: Contacts list */}
              <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col h-full bg-slate-50/30 shrink-0 ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-100 space-y-3">
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

                  {/* Message Segment Filter */}
                  <div className="grid grid-cols-3 bg-slate-100/85 p-0.5 rounded-xl text-[10px] font-bold text-slate-500 font-sans">
                    <button
                      type="button"
                      onClick={() => setMessageFilter('all')}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer ${messageFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'hover:text-slate-700'}`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageFilter('brands')}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer ${messageFilter === 'brands' ? 'bg-white text-slate-800 shadow-sm' : 'hover:text-slate-700'}`}
                    >
                      Brands
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageFilter('affiliates')}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer ${messageFilter === 'affiliates' ? 'bg-white text-slate-800 shadow-sm' : 'hover:text-slate-700'}`}
                    >
                      Affiliates
                    </button>
                  </div>
                </div>

                {/* Contacts Stream */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
                  {(() => {
                    const filteredContacts = contacts
                      .filter(c => {
                        if (messageFilter === 'brands') return c.user_type === 'advertiser';
                        if (messageFilter === 'affiliates') return c.user_type === 'publisher';
                        return true;
                      })
                      .filter(c => (c.full_name || c.email || c.business_name || '').toLowerCase().includes(searchContactText.toLowerCase()));

                    if (filteredContacts.length === 0) {
                      return <div className="text-center py-12 text-xs text-slate-400 font-sans font-semibold">No contacts found.</div>;
                    }

                    return filteredContacts.map((c) => {
                      const isSelected = selectedContact?.id === c.id;
                      const cInitials = (c.business_name || c.full_name || c.email).split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();
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
                          {c.avatar_url ? (
                            <img src={c.avatar_url} className="h-9 w-9 rounded-xl object-cover shrink-0 border border-slate-200 shadow-sm" alt="" />
                          ) : (
                            <div className={`h-9 w-9 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 text-slate-755 flex items-center justify-center font-extrabold text-xs shadow-sm uppercase ${
                              isSelected ? 'from-[#0052FF] to-blue-600 text-white' : ''
                            }`}>
                              {cInitials}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold truncate font-sans text-left">{c.business_name || c.full_name || c.email}</h4>
                              {lastMessage && (
                                <span className="text-[8px] text-slate-400 font-medium">
                                  {new Date(lastMessage.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 truncate font-sans font-medium mt-0.5 text-left">
                              {lastMessage ? lastMessage.body : 'Start a new conversation'}
                            </p>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Right Panel: Chat Thread */}
              <div className={`flex-1 flex flex-col h-full bg-white ${selectedContact ? 'flex' : 'hidden md:flex'}`}>
                {selectedContact ? (
                  <>
                    {/* Thread Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center bg-slate-50/20">
                      {/* Back button for mobile */}
                      <button 
                        type="button"
                        onClick={() => setSelectedContact(null)}
                        className="md:hidden p-1 mr-2.5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Back to contacts"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#0052FF] to-blue-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm uppercase">
                          {(selectedContact.full_name || selectedContact.email).split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-800 leading-none mb-0.5">{selectedContact.full_name || selectedContact.email}</h3>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{selectedContact.user_type}</span>
                        </div>
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
                            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} w-full space-y-1`}>
                              <div className="flex items-center space-x-1.5 text-[9px] font-bold text-slate-500 select-none">
                                {isMe ? (
                                  <>
                                    <span>{profile.full_name || 'Me'}</span>
                                    {profile.avatar_url ? (
                                      <img src={profile.avatar_url} className="h-4 w-4 rounded-full object-cover shrink-0 border border-slate-200" alt="" />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full bg-blue-50 text-[#0052FF] flex items-center justify-center font-extrabold text-[8px] border border-blue-100 shrink-0">
                                        {(profile.full_name || 'Me').charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {selectedContact.avatar_url ? (
                                      <img src={selectedContact.avatar_url} className="h-4 w-4 rounded-full object-cover shrink-0 border border-slate-200" alt="" />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full bg-blue-50 text-[#0052FF] flex items-center justify-center font-extrabold text-[8px] border border-blue-100 shrink-0">
                                        {(selectedContact.business_name || selectedContact.full_name || selectedContact.email).charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <span>{selectedContact.business_name || selectedContact.full_name || selectedContact.email}</span>
                                  </>
                                )}
                              </div>
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

          {/* TAB 5: ACCOUNT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-300 text-left font-sans max-w-4xl mx-auto">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 leading-tight">Account Settings</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">Manage your administrative profile and platform details.</p>
              </div>

              <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm p-6 space-y-6">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100">
                  Profile Details
                </h3>

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* Avatar Upload block */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="relative group shrink-0">
                      {settingsAvatarUrl ? (
                        <img 
                          src={settingsAvatarUrl} 
                          className="h-20 w-20 rounded-2xl object-cover border border-slate-200 shadow-sm"
                          alt="Avatar Preview" 
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-2xl border border-purple-100 shadow-sm select-none">
                          {settingsFullName ? settingsFullName.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <label className="absolute -bottom-2 -right-2 h-7 w-7 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center cursor-pointer shadow-sm transition-all hover:scale-105">
                        <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                        </svg>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAvatarFileChange} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800">Profile Image</h4>
                      <p className="text-[10px] text-slate-455 font-medium">JPEG or PNG. Max size 1MB. Image will be scaled automatically.</p>
                      {settingsAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => setSettingsAvatarUrl('')}
                          className="text-[10px] text-red-500 font-bold hover:underline block cursor-pointer animate-in fade-in"
                        >
                          Remove Avatar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Input fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                      <input 
                        type="text" 
                        value={settingsFullName}
                        onChange={(e) => setSettingsFullName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all font-sans"
                        placeholder="Administrator Name"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address (Read Only)</label>
                      <input 
                        type="email" 
                        value={profile.email}
                        className="w-full bg-slate-105 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-500 cursor-not-allowed"
                        disabled
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="bg-[#0052FF] hover:bg-blue-650 text-white font-bold h-11 px-6 rounded-xl text-xs flex items-center justify-center cursor-pointer shadow-sm shadow-blue-500/10 transition-colors"
                    >
                      {saveLoading ? <div className="h-4 w-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" /> : 'Save Details'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
