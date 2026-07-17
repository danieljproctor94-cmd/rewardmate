import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSEO } from '../../hooks/useSEO';
import { getAppUrl, slugify } from '../../lib/domain';
import { 
  getAdvertisers, 
  getCampaigns, 
  getProgramApplications, 
  createProgramApplication, 
  getAffiliateLinks
} from '../../lib/mockDatabase';
import type { 
  Campaign,
  ProgramApplication,
  AffiliateLink
} from '../../lib/mockDatabase';
import type { Profile } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Globe, 
  Calendar, 
  MapPin, 
  Layers, 
  Lock, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Copy, 
  ExternalLink, 
  ArrowRight, 
  Shield, 
  Zap, 
  ArrowLeft,
  Briefcase,
  AlertCircle
} from 'lucide-react';

export default function BrandAffiliatePage() {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, profile: currentUserProfile } = useAuth();
  
  const [brand, setBrand] = useState<Profile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<ProgramApplication[]>([]);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Load Brand and Campaigns
  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        setLoading(true);
        const advertisers = await getAdvertisers();
        const matchedBrand = advertisers.find(
          (a) => slugify(a.business_name || a.full_name) === brandSlug
        );

        if (!matchedBrand) {
          setBrand(null);
          setLoading(false);
          return;
        }

        setBrand(matchedBrand);

        // Fetch campaigns and filter for this brand
        const allCampaigns = await getCampaigns();
        const brandCamps = allCampaigns.filter(
          (c) => c.advertiser_id === matchedBrand.id && c.status === 'active'
        );
        setCampaigns(brandCamps);

        // Fetch applications & links if user is logged in publisher
        if (isAuthenticated && currentUserProfile?.user_type === 'publisher') {
          const publisherApps = await getProgramApplications('publisher', currentUserProfile.id);
          setApplications(publisherApps.filter(app => brandCamps.some(c => c.id === app.campaign_id)));

          const publisherLinks = await getAffiliateLinks(currentUserProfile.id);
          setAffiliateLinks(publisherLinks);
        }
      } catch (err) {
        console.error('Error fetching brand affiliate page data:', err);
        toast.error('Failed to load affiliate program details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBrandData();
  }, [brandSlug, isAuthenticated, currentUserProfile]);

  // Handle Application Submit
  const handleApply = async (campaignId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in or register to join this program.');
      navigate(`/login?redirect=${window.location.pathname}`);
      return;
    }

    if (currentUserProfile?.user_type !== 'publisher') {
      toast.error('Only Affiliate Partners can apply to promote offers.');
      return;
    }

    try {
      setActionLoading(campaignId);
      await createProgramApplication(currentUserProfile.id, campaignId);
      toast.success('Successfully applied to the program!');
      
      // Reload applications and links
      const publisherApps = await getProgramApplications('publisher', currentUserProfile.id);
      setApplications(publisherApps.filter(app => campaigns.some(c => c.id === app.campaign_id)));

      const publisherLinks = await getAffiliateLinks(currentUserProfile.id);
      setAffiliateLinks(publisherLinks);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application.');
    } finally {
      setActionLoading(null);
    }
  };

  // Copy tracking link to clipboard
  const handleCopyLink = (code: string, linkId: string) => {
    const trackingUrl = `${window.location.origin}/click/${code}`;
    navigator.clipboard.writeText(trackingUrl);
    setCopiedLinkId(linkId);
    toast.success('Tracking URL copied to clipboard!');
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  // SEO configuration
  const brandName = brand ? (brand.business_name || brand.full_name) : 'Brand';
  const brandLogo = brand?.avatar_url || '';
  // Get dynamic commission text from active campaigns (avoiding platform fee in UI)
  const getCommissionDisplay = () => {
    if (campaigns.length === 0) return 'CPA / RevShare';
    
    const revshareCamp = campaigns.find(c => c.payout_type === 'revshare');
    const cpaCamps = campaigns.filter(c => c.payout_type === 'cpa');
    
    if (revshareCamp) {
      return `${Number(revshareCamp.payout_amount).toFixed(2)}%`;
    } else if (cpaCamps.length > 0) {
      const maxCpa = Math.max(...cpaCamps.map(c => Number(c.payout_amount)));
      return `$${maxCpa.toFixed(2)}`;
    } else {
      const cpcCamp = campaigns.find(c => c.payout_type === 'cpc');
      if (cpcCamp) {
        return `$${Number(cpcCamp.payout_amount).toFixed(2)}`;
      }
    }
    return 'CPA';
  };

  const brandCommission = getCommissionDisplay();
  const brandBio = brand?.about_us || `${brandName} is a partner merchant on the Reward Mate performance marketing network.`;
  
  useSEO({
    title: `${brandName} Affiliate Program | Reward Mate Australia`,
    description: `Join the ${brandName} affiliate program. Promote ${brandName} products, earn up to ${brandCommission} commission on CPA referrals. View program terms and start earning today.`,
    noIndex: false,
    schema: brand ? {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": `${brandName} Affiliate Program`,
      "description": brandBio,
      "brand": {
        "@type": "Brand",
        "name": brandName,
        "logo": brandLogo
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "AUD",
        "lowPrice": campaigns.length > 0 ? Number(campaigns[0].payout_amount) : 8.0,
        "price": campaigns.length > 0 ? Number(campaigns[0].payout_amount) : 8.0
      }
    } : undefined
  });

  // Helper for countries mapping
  const countryList = brand?.target_countries 
    ? brand.target_countries.split(',').map(c => c.trim()) 
    : ['AU'];

  return (
    <div className="bg-white text-slate-800 font-sans selection:bg-blue-500/20 overflow-x-hidden min-h-screen flex flex-col">
      
      {/* Top Sticky Header */}
      <header className="w-full bg-[#070913] py-5 border-b border-white/5 relative z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between relative">
          <a href="/" className="flex items-center cursor-pointer">
            <img 
              src="/rewardmate-logo-cropped.png" 
              className="h-6 sm:h-8 w-auto object-contain brightness-0 invert" 
              alt="Reward Mate Logo" 
            />
          </a>
          <div className="flex items-center space-x-4">
            <a 
              href="/" 
              className="hidden sm:inline-flex items-center text-xs font-bold text-white/80 hover:text-white transition-all gap-1 mr-4"
            >
              <ArrowLeft className="h-3 w-3" /> Home
            </a>
            {isAuthenticated ? (
              <a 
                href="/dashboard"
                className="bg-[#0052FF] text-white hover:bg-blue-600 px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm"
              >
                Go to Dashboard
              </a>
            ) : (
              <>
                <a 
                  href={getAppUrl('/login')} 
                  className="border border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm"
                >
                  Login
                </a>
                <a 
                  href={getAppUrl('/register')}
                  className="bg-white text-black hover:bg-white/95 px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm"
                >
                  Register
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {loading ? (
        /* SKELETON LOADER STATE */
        <div className="flex-1 bg-[#070913]">
          {/* Skeleton Hero Header */}
          <section className="bg-[#070913] text-white py-16 sm:py-24 relative overflow-hidden animate-pulse">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,#0052FF_0%,transparent_70%)] opacity-20 blur-[80px]" />
            <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 text-center md:text-left">
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl bg-white/5 border border-white/10 shrink-0 shadow-2xl" />
              <div className="space-y-4 flex-1">
                <div className="h-6 w-36 bg-white/10 rounded" />
                <div className="h-10 w-64 bg-white/10 rounded" />
                <div className="h-4 w-40 bg-white/10 rounded" />
              </div>
            </div>
          </section>

          {/* Skeleton Content Body */}
          <div className="bg-white py-16">
            <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-12 text-left animate-pulse">
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-4">
                  <div className="h-6 w-36 bg-slate-200 rounded" />
                  <div className="space-y-2.5">
                    <div className="h-3.5 w-full bg-slate-200 rounded" />
                    <div className="h-3.5 w-5/6 bg-slate-200 rounded" />
                  </div>
                </div>
              </div>
              <div className="space-y-6 animate-pulse">
                <div className="h-48 w-full bg-slate-50 border border-slate-100 rounded-3xl" />
              </div>
            </div>
          </div>
        </div>
      ) : !brand ? (
        /* NOT FOUND STATE */
        <div className="flex-1 bg-[#070913] text-white flex flex-col justify-center items-center py-24 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,#0052FF_0%,transparent_70%)] opacity-20 blur-[80px] pointer-events-none" />
          <div className="space-y-6 text-center max-w-md relative z-10">
            <AlertCircle className="h-16 w-16 text-rose-500 mx-auto animate-bounce" />
            <h1 className="text-3xl font-black tracking-tight">Affiliate Program Not Found</h1>
            <p className="text-slate-400 text-sm">
              We couldn't locate an active advertiser profile matching <span className="text-[#38bdf8] font-semibold font-mono">"{brandSlug}"</span>.
            </p>
            <button 
              onClick={() => navigate('/')} 
              className="inline-flex items-center gap-2 bg-[#0052FF] hover:bg-blue-600 text-white font-bold h-11 px-6 rounded-full transition-all text-xs cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Reward Mate
            </button>
          </div>
        </div>
      ) : (
        /* REAL PAGE CONTENT wrapper */
        <div className="flex-1 flex flex-col">

      {/* Brand Hero Header */}
      <section className="bg-[#070913] text-white py-16 sm:py-24 relative overflow-hidden">
        {/* Decorative ambient radial glows */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,#0052FF_0%,transparent_70%)] opacity-20 blur-[80px]" />
        <div className="absolute -bottom-10 left-10 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,#8b5cf6_0%,transparent_70%)] opacity-15 blur-[60px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 text-center md:text-left">
          {/* Brand Logo Grid wrapper */}
          <div className="shrink-0">
            {brand.avatar_url ? (
              <img 
                src={brand.avatar_url} 
                className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl object-cover border-4 border-white/15 bg-white shadow-2xl p-1" 
                alt={`${brandName} Logo`}
              />
            ) : (
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl bg-[#0052FF] text-white flex items-center justify-center font-black text-4xl shadow-2xl border-4 border-white/15">
                {brandName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="space-y-4 flex-1">
            <div className="space-y-1.5">
              <span className="bg-[#0052FF]/20 border border-[#0052FF]/30 text-[#38bdf8] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                Affiliate Program Partner
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-none">
                {brandName}
              </h1>
            </div>

            {/* Quick Metadata */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-5 text-slate-400 text-xs font-semibold">
              {brand.website && (
                <a 
                  href={brand.website} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <Globe className="h-3.5 w-3.5 text-[#38bdf8]" /> Visit Website <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
              {brand.year_founded && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" /> Founded {brand.year_founded}
                </div>
              )}
              {brand.channels && (
                <div className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-slate-500" /> {brand.channels}
                </div>
              )}
            </div>

            {/* Badges / Countries */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1.5">
              {countryList.map((code) => (
                <span 
                  key={code} 
                  className="bg-white/5 border border-white/10 text-white/95 text-[10px] font-bold px-2.5 py-0.75 rounded-lg flex items-center gap-1"
                >
                  <MapPin className="h-3 w-3 text-emerald-400" /> {code === 'AU' ? 'Australia' : code === 'US' ? 'USA' : code === 'GB' ? 'UK' : code === 'NZ' ? 'New Zealand' : code === 'CA' ? 'Canada' : code}
                </span>
              ))}
              
              {brand.facebook_url && (
                <a href={brand.facebook_url} target="_blank" rel="noreferrer" className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                  </svg>
                </a>
              )}
              {brand.instagram_url && (
                <a href={brand.instagram_url} target="_blank" rel="noreferrer" className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <svg className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Stat Card */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center w-full md:w-56 shrink-0 mt-4 md:mt-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Standard Commission</div>
            <div className="text-4xl font-black text-[#38bdf8] tracking-tight">{brandCommission}</div>
            <div className="text-[10px] font-semibold text-slate-500 mt-1">CPA (Cost per Acquisition)</div>
            
            <div className="border-t border-white/5 mt-4 pt-4 flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-400">
              <Zap className="h-3.5 w-3.5 fill-current text-amber-400" /> Real-time Tracking Ready
            </div>
          </div>
        </div>
      </section>

      {/* Main Page Content Grid */}
      <main className="py-20 max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Side: About & Campaigns */}
        <div className="lg:col-span-8 space-y-12 text-left">
          
          {/* About us bio */}
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">About {brandName}</h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {brandBio}
            </p>
          </section>

          {/* Campaigns / Program Offers */}
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Affiliate Program Offers</h2>
              <p className="text-xs text-slate-500 font-bold mt-1">Review active promotional offers available for this brand.</p>
            </div>

            <div className="space-y-4">
              {campaigns.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 space-y-2.5">
                  <Briefcase className="h-10 w-10 text-slate-300" />
                  <div className="text-center">
                    <span className="text-xs font-bold block text-slate-500">No campaigns currently active.</span>
                    <span className="text-[10px] text-slate-400 font-semibold leading-relaxed">Check back later or register as an affiliate for updates.</span>
                  </div>
                </div>
              ) : (
                campaigns.map((camp) => {
                  // Determine publisher state for this campaign
                  const app = applications.find(a => a.campaign_id === camp.id);
                  const link = affiliateLinks.find(l => l.campaign_id === camp.id);
                  const isApproved = app?.status === 'approved' || !!link;
                  const isPending = app?.status === 'pending';
                  const isRejected = app?.status === 'rejected';

                  return (
                    <div 
                      key={camp.id} 
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="bg-blue-50 text-[#0052FF] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                              {camp.category || 'Campaign'}
                            </span>
                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                              Active
                            </span>
                          </div>
                          <h3 className="text-lg font-black text-slate-900">{camp.name}</h3>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <div className="text-xs text-slate-455 font-bold uppercase">Payout rate</div>
                          <div className="text-lg font-black text-[#0052FF]">
                            {camp.payout_type === 'revshare' 
                              ? `${Number(camp.payout_amount).toFixed(2)}% per Sale` 
                              : camp.payout_type === 'cpc'
                                ? `$${Number(camp.payout_amount).toFixed(2)} per Click`
                                : `$${Number(camp.payout_amount).toFixed(2)} per Sale`}
                          </div>
                        </div>
                      </div>

                      <p className="text-slate-650 text-xs font-semibold leading-relaxed">
                        {camp.description}
                      </p>

                      {/* Campaign parameters checklist */}
                      <div className="grid grid-cols-3 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4.5 text-left">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Payout Type</span>
                          <span className="text-xs font-bold text-slate-700 uppercase">{camp.payout_type}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">ITP Support</span>
                          <span className="text-xs font-bold text-slate-700">{camp.itp_support || 'Yes'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Avg Payout Days</span>
                          <span className="text-xs font-bold text-slate-700">{camp.avg_payout_days || '30'} Days</span>
                        </div>
                      </div>

                      {/* CTA & Link details */}
                      <div className="pt-2 border-t border-slate-100">
                        {(() => {
                          if (!isAuthenticated) {
                            return (
                              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <span className="text-[11px] font-bold text-slate-455">Log in to secure your dynamic tracking code.</span>
                                <button
                                  onClick={() => navigate(`/login?redirect=${window.location.pathname}`)}
                                  className="w-full sm:w-auto bg-[#0052FF] hover:bg-blue-650 text-white font-bold h-10 px-6 rounded-full transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/10"
                                >
                                  Login to Promote <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            );
                          }

                          if (currentUserProfile?.user_type !== 'publisher') {
                            return (
                              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-[11px] font-bold">
                                <Lock className="h-4 w-4 shrink-0" />
                                <span>You are logged in as an Advertiser. Log out and register a Publisher profile to join this campaign.</span>
                              </div>
                            );
                          }

                          // Approved & Link generated
                          if (isApproved && link) {
                            return (
                              <div className="space-y-3 text-left">
                                <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600">
                                  <CheckCircle className="h-4 w-4" /> Affiliate Partnership Active
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 pl-3">
                                  <span className="font-mono text-xs font-black text-slate-700 select-all break-all flex-1 text-center sm:text-left">
                                    {window.location.origin}/click/{link.code}
                                  </span>
                                  <button
                                    onClick={() => handleCopyLink(link.code, link.id)}
                                    className={`w-full sm:w-auto h-9 px-4 rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                                      copiedLinkId === link.id
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-[#0052FF] hover:bg-blue-650 text-white'
                                    }`}
                                  >
                                    <Copy className="h-3.5 w-3.5" /> {copiedLinkId === link.id ? 'Copied' : 'Copy Link'}
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          // Pending
                          if (isPending) {
                            return (
                              <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                <div className="flex items-center gap-2 text-amber-850 text-xs font-bold">
                                  <Clock className="h-4 w-4 text-amber-500 animate-spin" />
                                  <span>Application Pending Advertiser Approval</span>
                                </div>
                                <span className="text-[10px] text-amber-600 font-bold uppercase">Reviewing</span>
                              </div>
                            );
                          }

                          // Rejected
                          if (isRejected) {
                            return (
                              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-bold">
                                <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                                <span>Your application to join this program has been declined by the advertiser.</span>
                              </div>
                            );
                          }

                          // Unapplied
                          return (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                              <span className="text-[11px] font-bold text-slate-500">
                                {brand.auto_approve 
                                  ? "Instant Approval Enabled. Get your link immediately."
                                  : "Requires advertiser approval. Average response time: 24h."
                                }
                              </span>
                              <button
                                onClick={() => handleApply(camp.id)}
                                disabled={actionLoading === camp.id}
                                className="w-full sm:w-auto bg-[#0052FF] hover:bg-blue-650 text-white font-extrabold h-10 px-6 rounded-full transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                {actionLoading === camp.id ? (
                                  <div className="h-4.5 w-4.5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                                ) : (
                                  <>Apply to Promote <ArrowRight className="h-3.5 w-3.5" /></>
                                )}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Program terms & rules */}
          {brand.program_terms && (
            <section className="space-y-4 border-t border-slate-100 pt-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Program Terms & Guidelines</h2>
              <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 sm:p-8">
                <p className="text-slate-600 leading-relaxed text-xs sm:text-sm whitespace-pre-line font-sans font-medium">
                  {brand.program_terms}
                </p>
              </div>
            </section>
          )}

        </div>

        {/* Right Side: Network features / Sticky highlights */}
        <div className="lg:col-span-4 space-y-6 text-left">
          
          <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 sm:p-8 space-y-6 sticky top-6">
            <h3 className="font-extrabold text-slate-900 text-base">Program Details</h3>
            
            <div className="space-y-4.5 text-xs font-semibold text-slate-600">
              <div className="flex justify-between items-center py-2 border-b border-slate-150">
                <span className="text-slate-400">Industry</span>
                <span className="text-slate-800 font-extrabold">{brand.channels || 'General'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-150">
                <span className="text-slate-400">Target Region</span>
                <span className="text-slate-800 font-extrabold">{brand.target_countries || 'AU'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-150">
                <span className="text-slate-400">Auto-Approval</span>
                <span className="text-slate-800 font-extrabold">{brand.auto_approve ? 'Yes' : 'Manual'}</span>
              </div>
              {brand.website && (
                <div className="flex justify-between items-center py-2 border-b border-slate-150">
                  <span className="text-slate-400">Merchant Site</span>
                  <a href={brand.website} target="_blank" rel="noreferrer" className="text-[#0052FF] font-extrabold hover:underline inline-flex items-center gap-0.5">
                    Link <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Reward Mate Shield badge */}
            <div className="bg-white border border-slate-150 rounded-2xl p-4 flex items-start gap-3.5">
              <Shield className="h-5 w-5 text-[#0052FF] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-900">Reward Mate Shield</h4>
                <p className="text-[10px] text-slate-455 leading-relaxed font-bold">
                  All campaign wallets are pre-funded. Approved referral conversions are paid out directly to your balance ledger, risk-free.
                </p>
              </div>
            </div>
          </div>

        </div>

      </main>
      </div>
      )}

      {/* Footer Banner CTA */}
      <section className="py-20 bg-[#0a0f24] text-white relative overflow-hidden text-center mt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#0052FF_0%,transparent_50%)] opacity-35 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6">
          <span className="text-[10px] font-black tracking-[0.2em] text-[#38bdf8] uppercase">Connect on Reward Mate</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold">Grow Your Revenue in Australia</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Apply to promote {brandName} and thousands of other leading brands on Australia's premium performance affiliate network.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a 
              href={getAppUrl('/register')}
              className="bg-[#0052FF] text-white font-extrabold h-12 px-8 rounded-full flex items-center justify-center hover:bg-blue-650 transition-all text-xs w-full sm:w-auto"
            >
              Sign Up as Publisher
            </a>
            <a 
              href={getAppUrl('/login')}
              className="bg-transparent border border-white/20 text-white font-extrabold h-12 px-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-all text-xs w-full sm:w-auto"
            >
              Login to Partner Portal
            </a>
          </div>
        </div>
      </section>

      {/* Main Footer (Reused styling from marketing shell) */}
      <footer className="bg-[#05070f] text-slate-500 py-16 border-t border-white/5 text-xs text-left">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <img src="/rewardmate-logo-cropped.png" className="h-6 w-auto object-contain brightness-0 invert" alt="Logo" />
            <p className="text-[11px] leading-relaxed text-slate-500">
              Reward Mate is Australia's independent CPA & Performance Affiliate network.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px] mb-3">Merchant Programs</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="/#features" className="hover:text-white transition-colors">Directory</a></li>
              <li><a href={getAppUrl('/register/advertiser')} className="hover:text-white transition-colors">Apply as Merchant</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px] mb-3">Affiliates</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href={getAppUrl('/register')} className="hover:text-white transition-colors">Join Network</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">Who We Are</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px] mb-3">Support</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Platform Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-8 border-t border-white/5 text-[10px] flex justify-between items-center">
          <span>&copy; {new Date().getFullYear()} Reward Mate. All rights reserved.</span>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="/terms" className="hover:text-white">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
