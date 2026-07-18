import { supabase, isSupabaseConfigured } from '../supabaseClient';
import type { Profile } from '../contexts/AuthContext';

export interface Campaign {
  id: string;
  advertiser_id: string;
  advertiser_name?: string;
  name: string;
  description: string;
  landing_page_url: string;
  payout_type: 'cpa' | 'cpc' | 'revshare';
  payout_amount: number;
  status: 'pending_approval' | 'active' | 'paused' | 'rejected';
  total_budget: number;
  spend: number;
  created_at: string;
  itp_support?: string;
  target_markets?: string;
  commission_rate?: string;
  avc?: string;
  aov?: string;
  cr?: string;
  epc?: string;
  avg_payout_days?: string;
  logo_url?: string;
  logo_bg?: string;
  category?: string;
}

export interface AffiliateLink {
  id: string;
  publisher_id: string;
  campaign_id: string;
  code: string;
  created_at: string;
  campaign?: Campaign;
}

export interface Click {
  id: string;
  link_id: string;
  publisher_id: string;
  campaign_id: string;
  ip_address: string;
  user_agent: string;
  referrer: string;
  created_at: string;
  campaign?: Campaign;
}

export interface Conversion {
  id: string;
  click_id: string | null;
  publisher_id: string;
  publisher_name?: string;
  campaign_id: string;
  campaign_name?: string;
  payout: number;
  sale_amount?: number;
  rewardmate_fee?: number;
  status: 'pending' | 'approved' | 'rejected' | 'voided';
  transaction_id: string;
  created_at: string;
  campaign?: Campaign;
}

export interface Invoice {
  id: string;
  advertiser_id: string;
  month: string;
  commissionDue: number;
  conversionsCount: number;
  status: 'payable' | 'paid' | 'overdue';
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  advertiser_name?: string;
}

const CAMPAIGNS_KEY = 'rewardmate_mock_campaigns';
const LINKS_KEY = 'rewardmate_mock_links';
const CLICKS_KEY = 'rewardmate_mock_clicks';
const CONVERSIONS_KEY = 'rewardmate_mock_conversions';

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: 'campaign-daniel-1',
    advertiser_id: 'mock-advertiser-id',
    name: 'Daniel Proctor Fashion CPA Offer',
    description: 'Promote our premium apparel collection. Earn a flat $150.00 CPA on every verified sale.',
    landing_page_url: 'https://www.danielproctor.com.au/promo',
    payout_type: 'cpa',
    payout_amount: 150.00,
    status: 'active',
    total_budget: 10000.00,
    spend: 0.00,
    created_at: new Date().toISOString(),
    itp_support: 'Yes',
    target_markets: 'AU, NZ',
    category: 'Retail & Fashion',
    logo_bg: 'bg-[#0052FF]'
  }
];
const DEFAULT_LINKS: AffiliateLink[] = [];
const DEFAULT_CLICKS: Click[] = [];
const DEFAULT_CONVERSIONS: Conversion[] = [];

const getStored = <T>(key: string, defaults: T[]): T[] => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(data);
};

const setStored = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getCampaigns = async (): Promise<Campaign[]> => {
  if (!isSupabaseConfigured) {
    let campaigns = getStored(CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
    const hasDanielCampaign = campaigns.some(c => c.id === 'campaign-daniel-1');
    if (!hasDanielCampaign) {
      campaigns = [...DEFAULT_CAMPAIGNS, ...campaigns.filter(c => c.id !== 'campaign-daniel-1')];
      setStored(CAMPAIGNS_KEY, campaigns);
    }
    const profiles = JSON.parse(localStorage.getItem('rewardmate_mock_profiles') || '[]');
    return campaigns.map(c => {
      const adv = profiles.find((p: any) => p.id === c.advertiser_id);
      return {
        ...c,
        logo_url: adv?.avatar_url || c.logo_url || c.name.charAt(0).toUpperCase(),
        advertiser_name: adv?.business_name || adv?.full_name || 'Partner Brand'
      };
    });
  }
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, profiles:advertiser_id(avatar_url, business_name, full_name)')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    if (!data) return [];
    const overrides = JSON.parse(localStorage.getItem('rewardmate_supabase_profiles_override') || '{}');
    return data.map((camp: any) => {
      const matchedMock = DEFAULT_CAMPAIGNS.find(c => c.name.toLowerCase() === camp.name.toLowerCase());
      const advOverride = overrides[camp.advertiser_id];
      const adv = camp.profiles;
      const logoUrl = advOverride?.avatar_url || adv?.avatar_url || (matchedMock ? matchedMock.logo_url : camp.name.charAt(0).toUpperCase());
      const advertiserName = advOverride?.business_name || advOverride?.full_name || adv?.business_name || adv?.full_name || 'Partner Brand';
      
      if (matchedMock) {
        return {
          ...camp,
          itp_support: matchedMock.itp_support,
          target_markets: matchedMock.target_markets,
          commission_rate: matchedMock.commission_rate,
          avc: matchedMock.avc,
          aov: matchedMock.aov,
          cr: matchedMock.cr,
          epc: matchedMock.epc,
          avg_payout_days: matchedMock.avg_payout_days,
          logo_url: logoUrl,
          logo_bg: matchedMock.logo_bg,
          advertiser_name: advertiserName
        };
      }
      return {
        ...camp,
        itp_support: 'Yes',
        target_markets: 'AU',
        commission_rate: camp.payout_type === 'revshare' 
          ? `${Number(camp.payout_amount).toFixed(2)}% per Sale` 
          : camp.payout_type === 'cpc'
            ? `$${Number(camp.payout_amount).toFixed(2)} per Click`
            : `$${Number(camp.payout_amount).toFixed(2)} per Sale`,
        avc: '-',
        aov: '-',
        cr: '-',
        epc: '-',
        avg_payout_days: '30',
        logo_url: logoUrl,
        logo_bg: 'bg-[#0052FF]',
        advertiser_name: advertiserName
      };
    });
  } catch (err) {
    console.error('Error loading campaigns from Supabase:', err);
    return [];
  }
};

export const createCampaign = async (campaign: Omit<Campaign, 'id' | 'spend' | 'created_at'>): Promise<Campaign> => {
  if (!isSupabaseConfigured) {
    const campaigns = getStored(CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
    const newCamp: Campaign = {
      ...campaign,
      id: `campaign-${Date.now()}`,
      spend: 0.00,
      created_at: new Date().toISOString()
    };
    setStored(CAMPAIGNS_KEY, [newCamp, ...campaigns]);
    return newCamp;
  }
  
  // Destructure database columns for INSERT
  const {
    advertiser_id,
    name,
    description,
    landing_page_url,
    payout_type,
    payout_amount,
    status,
    total_budget,
    category
  } = campaign;

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      advertiser_id,
      name,
      description,
      landing_page_url,
      payout_type,
      payout_amount,
      status,
      total_budget: total_budget || 0.00,
      category
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateCampaignStatus = async (id: string, status: Campaign['status']): Promise<void> => {
  if (!isSupabaseConfigured) {
    const campaigns = getStored(CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
    const updated = campaigns.map(c => c.id === id ? { ...c, status } : c);
    setStored(CAMPAIGNS_KEY, updated);
    return;
  }
  const { error } = await supabase.from('campaigns').update({ status }).eq('id', id);
  if (error) throw error;
};

export const updateCampaignDetails = async (
  campaignId: string, 
  details: {
    name: string;
    description: string;
    landing_page_url: string;
    payout_type: 'cpa' | 'revshare' | 'cpc';
    payout_amount: number;
    category?: string;
  }
): Promise<void> => {
  if (!isSupabaseConfigured) {
    const list = getStored(CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
    const updated = list.map(c => c.id === campaignId ? { ...c, ...details } : c);
    setStored(CAMPAIGNS_KEY, updated);
    return;
  }

  const { name, description, landing_page_url, payout_type, payout_amount, category } = details;
  const { error } = await supabase
    .from('campaigns')
    .update({
      name,
      description,
      landing_page_url,
      payout_type,
      payout_amount,
      category
    })
    .eq('id', campaignId);
  if (error) throw error;
};
export const getInvoices = async (advertiserId: string): Promise<Invoice[]> => {
  const INVOICES_KEY = `rewardmate_advertiser_invoices_${advertiserId}`;
  
  if (!isSupabaseConfigured) {
    const defaultInvs: Invoice[] = [
      {
        id: 'INV-2026-05',
        advertiser_id: advertiserId,
        month: 'May 2026',
        commissionDue: 180.00,
        conversionsCount: 4,
        status: 'paid',
        issueDate: '31/05/2026',
        dueDate: '14/06/2026'
      },
      {
        id: 'INV-2026-06',
        advertiser_id: advertiserId,
        month: 'June 2026',
        commissionDue: 350.00,
        conversionsCount: 6,
        status: 'paid',
        issueDate: '30/06/2026',
        dueDate: '14/07/2026'
      },
      {
        id: 'INV-2026-07',
        advertiser_id: advertiserId,
        month: new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' }),
        commissionDue: 150.00,
        conversionsCount: 1,
        status: 'payable',
        issueDate: new Date().toLocaleDateString('en-AU'),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-AU')
      }
    ];
    return getStored(INVOICES_KEY, defaultInvs);
  }

  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('advertiser_id', advertiserId)
      .order('id', { ascending: true });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      // Seed default invoices into Supabase for this advertiser
      const currentMonth = new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
      const defaultInvs = [
        {
          id: `INV-2026-05-${advertiserId.substring(0,4)}`,
          advertiser_id: advertiserId,
          month: 'May 2026',
          commission_due: 180.00,
          conversions_count: 4,
          status: 'paid',
          issue_date: '31/05/2026',
          due_date: '14/06/2026'
        },
        {
          id: `INV-2026-06-${advertiserId.substring(0,4)}`,
          advertiser_id: advertiserId,
          month: 'June 2026',
          commission_due: 350.00,
          conversions_count: 6,
          status: 'paid',
          issue_date: '30/06/2026',
          due_date: '14/07/2026'
        },
        {
          id: `INV-2026-07-${advertiserId.substring(0,4)}`,
          advertiser_id: advertiserId,
          month: currentMonth,
          commission_due: 150.00,
          conversions_count: 1,
          status: 'payable',
          issue_date: new Date().toLocaleDateString('en-AU'),
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-AU')
        }
      ];
      
      const { data: inserted, error: insertError } = await supabase
        .from('invoices')
        .insert(defaultInvs)
        .select();
        
      if (insertError) throw insertError;
      return (inserted || []).map((inv: any) => ({
        id: inv.id,
        advertiser_id: inv.advertiser_id,
        month: inv.month,
        commissionDue: Number(inv.commission_due),
        conversionsCount: Number(inv.conversions_count),
        status: inv.status,
        issueDate: inv.issue_date,
        dueDate: inv.due_date,
        paidAt: inv.paid_at
      }));
    }
    
    return data.map((inv: any) => ({
      id: inv.id,
      advertiser_id: inv.advertiser_id,
      month: inv.month,
      commissionDue: Number(inv.commission_due),
      conversionsCount: Number(inv.conversions_count),
      status: inv.status,
      issueDate: inv.issue_date,
      dueDate: inv.due_date,
      paidAt: inv.paid_at
    }));
  } catch (err) {
    console.error('Error fetching invoices:', err);
    return [];
  }
};

export const getAllInvoices = async (): Promise<Invoice[]> => {
  if (!isSupabaseConfigured) {
    const profiles = JSON.parse(localStorage.getItem('rewardmate_mock_profiles') || '[]');
    const advertisers = profiles.filter((p: any) => p.user_type === 'advertiser');
    let allInvs: Invoice[] = [];
    for (const adv of advertisers) {
      const INVOICES_KEY = `rewardmate_advertiser_invoices_${adv.id}`;
      const defaultInvs: Invoice[] = [
        {
          id: 'INV-2026-05',
          advertiser_id: adv.id,
          month: 'May 2026',
          commissionDue: 180.00,
          conversionsCount: 4,
          status: 'paid',
          issueDate: '31/05/2026',
          dueDate: '14/06/2026'
        },
        {
          id: 'INV-2026-06',
          advertiser_id: adv.id,
          month: 'June 2026',
          commissionDue: 350.00,
          conversionsCount: 6,
          status: 'paid',
          issueDate: '30/06/2026',
          dueDate: '14/07/2026'
        },
        {
          id: 'INV-2026-07',
          advertiser_id: adv.id,
          month: new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' }),
          commissionDue: 150.00,
          conversionsCount: 1,
          status: 'payable',
          issueDate: new Date().toLocaleDateString('en-AU'),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-AU')
        }
      ];
      const invs = getStored(INVOICES_KEY, defaultInvs);
      allInvs = [...allInvs, ...invs.map(inv => ({
        ...inv,
        advertiser_name: adv.business_name || adv.full_name || 'Brand Partner'
      }))];
    }
    return allInvs;
  }

  try {
    const { data: advertisers, error: advErr } = await supabase
      .from('profiles')
      .select('id, business_name, full_name')
      .eq('user_type', 'advertiser');
    
    if (advErr) throw advErr;

    const { data: invoices, error: invErr } = await supabase
      .from('invoices')
      .select('*, profiles:advertiser_id(business_name, full_name)');
    
    if (invErr) throw invErr;

    const advertiserIdsWithInvs = new Set((invoices || []).map(i => i.advertiser_id));
    const missingAdvertisers = (advertisers || []).filter(a => !advertiserIdsWithInvs.has(a.id));

    if (missingAdvertisers.length > 0) {
      const currentMonth = new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
      let seedInvs: any[] = [];
      for (const adv of missingAdvertisers) {
        seedInvs.push(
          {
            id: `INV-2026-05-${adv.id.substring(0,4)}`,
            advertiser_id: adv.id,
            month: 'May 2026',
            commission_due: 180.00,
            conversions_count: 4,
            status: 'paid',
            issue_date: '31/05/2026',
            due_date: '14/06/2026'
          },
          {
            id: `INV-2026-06-${adv.id.substring(0,4)}`,
            advertiser_id: adv.id,
            month: 'June 2026',
            commission_due: 350.00,
            conversions_count: 6,
            status: 'paid',
            issue_date: '30/06/2026',
            due_date: '14/07/2026'
          },
          {
            id: `INV-2026-07-${adv.id.substring(0,4)}`,
            advertiser_id: adv.id,
            month: currentMonth,
            commission_due: 150.00,
            conversions_count: 1,
            status: 'payable',
            issue_date: new Date().toLocaleDateString('en-AU'),
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-AU')
          }
        );
      }
      
      const { error: seedErr } = await supabase
        .from('invoices')
        .insert(seedInvs);
      
      if (!seedErr) {
        const { data: refetched, error: refetchErr } = await supabase
          .from('invoices')
          .select('*, profiles:advertiser_id(business_name, full_name)');
        if (!refetchErr && refetched) {
          return refetched.map((inv: any) => ({
            id: inv.id,
            advertiser_id: inv.advertiser_id,
            month: inv.month,
            commissionDue: Number(inv.commission_due),
            conversionsCount: Number(inv.conversions_count),
            status: inv.status,
            issueDate: inv.issue_date,
            dueDate: inv.due_date,
            paidAt: inv.paid_at,
            advertiser_name: inv.profiles?.business_name || inv.profiles?.full_name || 'Brand Partner'
          })).sort((a, b) => b.dueDate.localeCompare(a.dueDate));
        }
      }
    }
    
    return (invoices || []).map((inv: any) => ({
      id: inv.id,
      advertiser_id: inv.advertiser_id,
      month: inv.month,
      commissionDue: Number(inv.commission_due),
      conversionsCount: Number(inv.conversions_count),
      status: inv.status,
      issueDate: inv.issue_date,
      dueDate: inv.due_date,
      paidAt: inv.paid_at,
      advertiser_name: inv.profiles?.business_name || inv.profiles?.full_name || 'Brand Partner'
    })).sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  } catch (err) {
    console.error('Error fetching all invoices for admin:', err);
    return [];
  }
};

export const payInvoice = async (invoiceId: string, advertiserId: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    const INVOICES_KEY = `rewardmate_advertiser_invoices_${advertiserId}`;
    const list = getStored<Invoice>(INVOICES_KEY, []);
    const updated = list.map(inv => inv.id === invoiceId ? { ...inv, status: 'paid' as const } : inv);
    setStored(INVOICES_KEY, updated);
    return;
  }

  const { error } = await supabase
    .from('invoices')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', invoiceId);
  if (error) throw error;
};

export const syncActiveInvoice = async (
  invoiceId: string, 
  advertiserId: string, 
  commissionDue: number, 
  conversionsCount: number
): Promise<void> => {
  if (!isSupabaseConfigured) {
    const INVOICES_KEY = `rewardmate_advertiser_invoices_${advertiserId}`;
    const list = getStored<Invoice>(INVOICES_KEY, []);
    const updated = list.map(inv => inv.id === invoiceId ? { ...inv, commissionDue: commissionDue, conversionsCount: conversionsCount } : inv);
    setStored(INVOICES_KEY, updated);
    return;
  }

  const { error } = await supabase
    .from('invoices')
    .update({
      commission_due: commissionDue,
      conversions_count: conversionsCount
    })
    .eq('id', invoiceId);
  if (error) throw error;
};

export const getSystemSettings = async (key: string, defaultValue: any): Promise<any> => {
  const SETTING_KEY = `rewardmate_system_setting_${key}`;
  if (!isSupabaseConfigured) {
    const val = localStorage.getItem(SETTING_KEY);
    return val ? JSON.parse(val) : defaultValue;
  }

  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data ? data.value : defaultValue;
  } catch (err) {
    console.error(`Error loading system setting for ${key}:`, err);
    return defaultValue;
  }
};

export const saveSystemSettings = async (key: string, value: any): Promise<void> => {
  const SETTING_KEY = `rewardmate_system_setting_${key}`;
  if (!isSupabaseConfigured) {
    localStorage.setItem(SETTING_KEY, JSON.stringify(value));
    return;
  }

  const { error } = await supabase
    .from('system_settings')
    .upsert({ key, value });
  if (error) throw error;
};
export const getAffiliateLinks = async (publisherId: string): Promise<AffiliateLink[]> => {
  if (!isSupabaseConfigured) {
    const links = getStored(LINKS_KEY, DEFAULT_LINKS);
    const campaigns = getStored(CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
    return links
      .filter(l => l.publisher_id === publisherId)
      .map(l => ({
        ...l,
        campaign: campaigns.find(c => c.id === l.campaign_id)
      }));
  }
  const { data, error } = await supabase
    .from('affiliate_links')
    .select('*, campaign:campaigns(*)')
    .eq('publisher_id', publisherId);
  if (error) throw error;
  return data || [];
};

export const generateAffiliateLink = async (publisherId: string, campaignId: string): Promise<AffiliateLink> => {
  const code = `RM_${publisherId.substring(5, 9)}_${campaignId.substring(9, 13)}_${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
  
  if (!isSupabaseConfigured) {
    const links = getStored(LINKS_KEY, DEFAULT_LINKS);
    const existing = links.find(l => l.publisher_id === publisherId && l.campaign_id === campaignId);
    if (existing) return existing;

    const newLink: AffiliateLink = {
      id: `link-${Date.now()}`,
      publisher_id: publisherId,
      campaign_id: campaignId,
      code,
      created_at: new Date().toISOString()
    };
    setStored(LINKS_KEY, [...links, newLink]);
    return newLink;
  }
  const { data, error } = await supabase
    .from('affiliate_links')
    .insert({ publisher_id: publisherId, campaign_id: campaignId, code })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const logClick = async (code: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    const links = getStored(LINKS_KEY, DEFAULT_LINKS);
    const link = links.find(l => l.code.toLowerCase() === code.toLowerCase());
    if (!link) return;

    const clicks = getStored(CLICKS_KEY, DEFAULT_CLICKS);
    const newClick: Click = {
      id: `click-${Date.now()}`,
      link_id: link.id,
      publisher_id: link.publisher_id,
      campaign_id: link.campaign_id,
      ip_address: '124.168.1.1',
      user_agent: navigator.userAgent,
      referrer: document.referrer || 'Direct',
      created_at: new Date().toISOString()
    };
    setStored(CLICKS_KEY, [...clicks, newClick]);
    
    // Increment campaign spend if CPC
    const campaigns = getStored(CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
    const updatedCamp = campaigns.map(c => {
      if (c.id === link.campaign_id && c.payout_type === 'cpc') {
        return { ...c, spend: Number(c.spend) + Number(c.payout_amount) };
      }
      return c;
    });
    setStored(CAMPAIGNS_KEY, updatedCamp);
    return;
  }
  // supabase logic for redirect & log click
  // In real systems, this is handled by a redirect edge function
};

export const getClicks = async (publisherId?: string): Promise<Click[]> => {
  if (!isSupabaseConfigured) {
    const clicks = getStored(CLICKS_KEY, DEFAULT_CLICKS);
    const campaigns = getStored(CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
    const filtered = publisherId ? clicks.filter(c => c.publisher_id === publisherId) : clicks;
    return filtered.map(c => ({
      ...c,
      campaign: campaigns.find(camp => camp.id === c.campaign_id)
    }));
  }
  let query = supabase.from('clicks').select('*, campaign:campaigns(*)');
  if (publisherId) query = query.eq('publisher_id', publisherId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const getConversions = async (role?: 'publisher' | 'advertiser' | 'admin', userId?: string): Promise<Conversion[]> => {
  if (!isSupabaseConfigured) {
    const conversions = getStored(CONVERSIONS_KEY, DEFAULT_CONVERSIONS);
    const campaigns = getStored(CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
    
    let filtered = conversions;
    if (role === 'publisher' && userId) {
      filtered = conversions.filter(c => c.publisher_id === userId);
    } else if (role === 'advertiser' && userId) {
      const advertiserCampIds = campaigns.filter(camp => camp.advertiser_id === userId).map(camp => camp.id);
      filtered = conversions.filter(c => advertiserCampIds.includes(c.campaign_id));
    }
    
    return filtered.map(c => ({
      ...c,
      campaign: campaigns.find(camp => camp.id === c.campaign_id)
    }));
  }
  
  let query = supabase.from('conversions').select('*, campaign:campaigns(*)');
  if (role === 'publisher' && userId) {
    query = query.eq('publisher_id', userId);
  } else if (role === 'advertiser' && userId) {
    // RLS or join filtering
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const createConversion = async (clickId: string, payout: number, saleAmount?: number): Promise<Conversion> => {
  const finalSaleAmount = saleAmount || Math.floor(Math.random() * 450) + 50;
  const rewardmateFee = Number((finalSaleAmount * 0.015).toFixed(2));

  if (!isSupabaseConfigured) {
    const clicks = getStored(CLICKS_KEY, DEFAULT_CLICKS);
    const click = clicks.find(c => c.id === clickId);
    if (!click) throw new Error('Click log not found');

    const conversions = getStored(CONVERSIONS_KEY, DEFAULT_CONVERSIONS);
    const newConv: Conversion = {
      id: `conv-${Date.now()}`,
      click_id: clickId,
      publisher_id: click.publisher_id,
      publisher_name: 'Sarah Connor (Publisher)',
      campaign_id: click.campaign_id,
      campaign_name: 'Origin Energy Switch Deal',
      payout,
      sale_amount: finalSaleAmount,
      rewardmate_fee: rewardmateFee,
      status: 'pending',
      transaction_id: `TXN-SIM-${Math.floor(Math.random()*90000) + 10000}`,
      created_at: new Date().toISOString()
    };
    setStored(CONVERSIONS_KEY, [newConv, ...conversions]);
    return newConv;
  }
  // supabase logic
  const { data, error } = await supabase
    .from('conversions')
    .insert({ 
      click_id: clickId, 
      payout,
      sale_amount: finalSaleAmount,
      rewardmate_fee: rewardmateFee
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateConversionStatus = async (id: string, status: Conversion['status']): Promise<void> => {
  if (!isSupabaseConfigured) {
    const conversions = getStored(CONVERSIONS_KEY, DEFAULT_CONVERSIONS);
    const updated = conversions.map(c => c.id === id ? { ...c, status } : c);
    setStored(CONVERSIONS_KEY, updated);

    if (status === 'approved') {
      const conv = conversions.find(c => c.id === id);
      if (conv) {
        const finalSaleAmount = conv.sale_amount || 100.00;

        const profilesKey = 'rewardmate_mock_profiles';
        const profiles = JSON.parse(localStorage.getItem(profilesKey) || '[]');

        // Find advertiser (brand) profile to read their custom commission rate
        const campaigns = getStored(CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
        const campaign = campaigns.find(camp => camp.id === conv.campaign_id);
        const advertiserProfile = campaign ? profiles.find((p: any) => p.id === campaign.advertiser_id) : null;

        // Custom rate defaults to 1.5%
        const commissionRate = advertiserProfile && advertiserProfile.commission_rate !== undefined 
          ? advertiserProfile.commission_rate 
          : 1.50;

        const rewardmateFee = conv.rewardmate_fee || Number((finalSaleAmount * (commissionRate / 100)).toFixed(2));

        // Payout to publisher
        const updatedProfiles = profiles.map((p: any) => {
          if (p.id === conv.publisher_id) {
            return { ...p, wallet_balance: Number(p.wallet_balance) + Number(conv.payout) };
          }
          // Spend deduction for advertiser: payout + RewardMate fee
          if (campaign && p.id === campaign.advertiser_id) {
            return { ...p, wallet_balance: Number(p.wallet_balance) - (Number(conv.payout) + rewardmateFee) };
          }
          // Credit admin with RewardMate fee
          if (p.user_type === 'admin') {
            return { ...p, wallet_balance: Number(p.wallet_balance) + rewardmateFee };
          }
          return p;
        });
        localStorage.setItem(profilesKey, JSON.stringify(updatedProfiles));

        // Increment campaign spend
        const updatedCamp = campaigns.map(c => {
          if (c.id === conv.campaign_id) {
            return { ...c, spend: Number(c.spend) + Number(conv.payout) };
          }
          return c;
        });
        setStored(CAMPAIGNS_KEY, updatedCamp);
      }
    }

    if (status === 'voided') {
      const conv = conversions.find(c => c.id === id);
      if (conv) {
        const finalSaleAmount = conv.sale_amount || 100.00;

        const profilesKey = 'rewardmate_mock_profiles';
        const profiles = JSON.parse(localStorage.getItem(profilesKey) || '[]');

        const campaigns = getStored(CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
        const campaign = campaigns.find(camp => camp.id === conv.campaign_id);
        const advertiserProfile = campaign ? profiles.find((p: any) => p.id === campaign.advertiser_id) : null;

        const commissionRate = advertiserProfile && advertiserProfile.commission_rate !== undefined 
          ? advertiserProfile.commission_rate 
          : 1.50;

        const rewardmateFee = conv.rewardmate_fee || Number((finalSaleAmount * (commissionRate / 100)).toFixed(2));

        // Revert payout and fees
        const updatedProfiles = profiles.map((p: any) => {
          if (p.id === conv.publisher_id) {
            return { ...p, wallet_balance: Math.max(0, Number(p.wallet_balance) - Number(conv.payout)) };
          }
          if (campaign && p.id === campaign.advertiser_id) {
            return { ...p, wallet_balance: Number(p.wallet_balance) + (Number(conv.payout) + rewardmateFee) };
          }
          if (p.user_type === 'admin') {
            return { ...p, wallet_balance: Math.max(0, Number(p.wallet_balance) - rewardmateFee) };
          }
          return p;
        });
        localStorage.setItem(profilesKey, JSON.stringify(updatedProfiles));

        // Decrement campaign spend
        const updatedCamp = campaigns.map(c => {
          if (c.id === conv.campaign_id) {
            return { ...c, spend: Math.max(0, Number(c.spend) - Number(conv.payout)) };
          }
          return c;
        });
        setStored(CAMPAIGNS_KEY, updatedCamp);
      }
    }
    return;
  }
  const { error } = await supabase.from('conversions').update({ status }).eq('id', id);
  if (error) throw error;
};

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  receiver_name: string;
  subject: string;
  body: string;
  read: boolean;
  created_at: string;
  parent_id?: string;
}

const MESSAGES_KEY = 'rewardmate_mock_messages';

export const getMessages = async (userId: string): Promise<Message[]> => {
  if (!isSupabaseConfigured) {
    const messages: Message[] = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    
    // Auto-seed welcome message from admin if not already present
    const hasWelcome = messages.some(m => m.receiver_id === userId && m.sender_id === 'mock-admin-id');
    if (!hasWelcome && userId !== 'mock-admin-id') {
      const welcomeMsg: Message = {
        id: 'msg-welcome-seeded-' + userId,
        sender_id: 'mock-admin-id',
        sender_name: 'Super Admin (Reward Mate)',
        receiver_id: userId,
        receiver_name: 'User',
        subject: 'Welcome to Reward Mate Australia!',
        body: 'Welcome to Reward Mate Australia! Your publisher application has been approved. Start building links, generating clicks, and earning commissions!',
        read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
      };
      messages.push(welcomeMsg);
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    }

    return messages
      .filter(m => m.sender_id === userId || m.receiver_id === userId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Supabase messages query failed, using localStorage backup:', err);
    const messages: Message[] = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    return messages
      .filter(m => m.sender_id === userId || m.receiver_id === userId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
};

export const sendMessage = async (msg: Omit<Message, 'id' | 'created_at' | 'read'>): Promise<Message> => {
  // Validate sender and receiver roles to prevent messaging between restricted roles (e.g. affiliate to affiliate or brand to brand)
  let senderRole = '';
  let receiverRole = '';

  if (!isSupabaseConfigured) {
    const stored = JSON.parse(localStorage.getItem('rewardmate_mock_profiles') || '[]');
    const sender = stored.find((p: any) => p.id === msg.sender_id);
    const receiver = stored.find((p: any) => p.id === msg.receiver_id);
    if (sender) senderRole = sender.user_type;
    if (receiver) receiverRole = receiver.user_type;
  } else {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, user_type')
        .in('id', [msg.sender_id, msg.receiver_id]);
      if (!error && profiles) {
        const sender = profiles.find(p => p.id === msg.sender_id);
        const receiver = profiles.find(p => p.id === msg.receiver_id);
        if (sender) senderRole = sender.user_type;
        if (receiver) receiverRole = receiver.user_type;
      }
    } catch (err) {
      console.warn('Failed to query profiles for message validation:', err);
    }
  }

  // Restrict same-type messaging for non-admin accounts
  if (senderRole && receiverRole) {
    if (senderRole === 'publisher' && receiverRole === 'publisher') {
      throw new Error('Affiliates are not permitted to message other affiliates.');
    }
    if (senderRole === 'advertiser' && receiverRole === 'advertiser') {
      throw new Error('Brands are not permitted to message other brands.');
    }
  }

  const newMsg: Message = {
    ...msg,
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    read: false,
    created_at: new Date().toISOString()
  };

  if (!isSupabaseConfigured) {
    const messages: Message[] = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    messages.push(newMsg);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    return newMsg;
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert(newMsg)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase messages send failed, using localStorage backup:', err);
    const messages: Message[] = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    messages.push(newMsg);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    return newMsg;
  }
};

export const getAllAffiliateLinks = async (): Promise<AffiliateLink[]> => {
  if (!isSupabaseConfigured) {
    const links = getStored(LINKS_KEY, DEFAULT_LINKS);
    const campaigns = getStored(CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
    return links.map(l => ({
      ...l,
      campaign: campaigns.find(c => c.id === l.campaign_id)
    }));
  }
  try {
    const { data, error } = await supabase
      .from('affiliate_links')
      .select('*, campaign:campaigns(*)');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching all affiliate links:', err);
    return [];
  }
};

// ----------------------------------------------------
// CONTACT INQUIRIES DATABASE INTERFACE & METHODS
// ----------------------------------------------------
const CONTACT_INQUIRIES_KEY = 'rewardmate_mock_contact_inquiries';

export interface ContactInquiry {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  inquiry_type: string;
  message: string;
  replied: boolean;
  created_at: string;
}

export const getContactInquiries = async (): Promise<ContactInquiry[]> => {
  if (!isSupabaseConfigured) {
    const list: ContactInquiry[] = JSON.parse(localStorage.getItem(CONTACT_INQUIRIES_KEY) || '[]');
    // Seed standard dummy inquiry if empty, just so the admin sees something
    if (list.length === 0) {
      const dummy: ContactInquiry = {
        id: 'inq-dummy-1',
        full_name: 'Sarah Jenkins',
        email: 'sarah.j@activebrand.com.au',
        phone: '0412 345 678',
        company: 'Active Brand Pty Ltd',
        inquiry_type: 'advertiser',
        message: 'Hi Support, we would like to launch a CPA campaign targeting retail audiences in Australia. What are the integration steps for Shopify store click tracking?',
        replied: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() // 4 hours ago
      };
      list.push(dummy);
      localStorage.setItem(CONTACT_INQUIRIES_KEY, JSON.stringify(list));
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  try {
    const { data, error } = await supabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Supabase contact_inquiries fetch failed, falling back to localStorage:', err);
    const list: ContactInquiry[] = JSON.parse(localStorage.getItem(CONTACT_INQUIRIES_KEY) || '[]');
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
};

export const saveContactInquiry = async (inquiry: Omit<ContactInquiry, 'id' | 'replied' | 'created_at'>): Promise<ContactInquiry> => {
  const newInq: ContactInquiry = {
    ...inquiry,
    id: `inq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    replied: false,
    created_at: new Date().toISOString()
  };

  if (!isSupabaseConfigured) {
    const list: ContactInquiry[] = JSON.parse(localStorage.getItem(CONTACT_INQUIRIES_KEY) || '[]');
    list.push(newInq);
    localStorage.setItem(CONTACT_INQUIRIES_KEY, JSON.stringify(list));
    return newInq;
  }

  try {
    const { data, error } = await supabase
      .from('contact_inquiries')
      .insert(newInq)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase contact_inquiries save failed, falling back to localStorage:', err);
    const list: ContactInquiry[] = JSON.parse(localStorage.getItem(CONTACT_INQUIRIES_KEY) || '[]');
    list.push(newInq);
    localStorage.setItem(CONTACT_INQUIRIES_KEY, JSON.stringify(list));
    return newInq;
  }
};

export const markContactInquiryReplied = async (inquiryId: string): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    const list: ContactInquiry[] = JSON.parse(localStorage.getItem(CONTACT_INQUIRIES_KEY) || '[]');
    const updated = list.map(inq => inq.id === inquiryId ? { ...inq, replied: true } : inq);
    localStorage.setItem(CONTACT_INQUIRIES_KEY, JSON.stringify(updated));
    return true;
  }

  try {
    const { error } = await supabase
      .from('contact_inquiries')
      .update({ replied: true })
      .eq('id', inquiryId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase contact_inquiries update failed, falling back to localStorage:', err);
    const list: ContactInquiry[] = JSON.parse(localStorage.getItem(CONTACT_INQUIRIES_KEY) || '[]');
    const updated = list.map(inq => inq.id === inquiryId ? { ...inq, replied: true } : inq);
    localStorage.setItem(CONTACT_INQUIRIES_KEY, JSON.stringify(updated));
    return true;
  }
};

// --- Program Applications & Brand Creatives Helpers ---

export interface ProgramApplication {
  id: string;
  publisher_id: string;
  campaign_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  campaign?: Campaign;
  publisher?: Profile;
}

export interface BrandCreative {
  id: string;
  advertiser_id: string;
  title: string;
  image_url: string;
  banner_size: string;
  created_at: string;
}

const APPLICATIONS_KEY = 'rewardmate_mock_applications';
const CREATIVES_KEY = 'rewardmate_mock_creatives';

export const getProgramApplications = async (
  role: 'publisher' | 'advertiser' | 'admin', 
  userId: string
): Promise<ProgramApplication[]> => {
  if (!isSupabaseConfigured) {
    const list: ProgramApplication[] = JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || '[]');
    const campaigns = getStored(CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
    const profiles = JSON.parse(localStorage.getItem('rewardmate_mock_profiles') || '[]');
    
    let filtered = list;
    if (role === 'publisher') {
      filtered = list.filter(a => a.publisher_id === userId);
    } else if (role === 'advertiser') {
      const advertiserCampIds = campaigns.filter(c => c.advertiser_id === userId).map(c => c.id);
      filtered = list.filter(a => advertiserCampIds.includes(a.campaign_id));
    }
    
    return filtered.map(a => ({
      ...a,
      campaign: campaigns.find(c => c.id === a.campaign_id),
      publisher: profiles.find((p: any) => p.id === a.publisher_id)
    }));
  }

  let query = supabase.from('program_applications').select('*, campaign:campaigns(*), publisher:profiles(*)');
  if (role === 'publisher') {
    query = query.eq('publisher_id', userId);
  } else if (role === 'advertiser') {
    query = supabase.from('program_applications').select('*, campaign:campaigns!inner(*), publisher:profiles(*)').eq('campaign.advertiser_id', userId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const createProgramApplication = async (publisherId: string, campaignId: string): Promise<ProgramApplication> => {
  if (!isSupabaseConfigured) {
    const list: ProgramApplication[] = JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || '[]');
    const existing = list.find(a => a.publisher_id === publisherId && a.campaign_id === campaignId);
    if (existing) return existing;

    const campaigns = getStored(CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
    const profiles = JSON.parse(localStorage.getItem('rewardmate_mock_profiles') || '[]');
    const camp = campaigns.find(c => c.id === campaignId);
    const adv = profiles.find((p: any) => p.id === camp?.advertiser_id);
    const overrides = JSON.parse(localStorage.getItem('rewardmate_supabase_profiles_override') || '{}');
    const advOverride = camp ? overrides[camp.advertiser_id] : null;

    const autoApprove = advOverride?.auto_approve || adv?.auto_approve || false;
    const initialStatus = autoApprove ? 'approved' : 'pending';

    const newApp: ProgramApplication = {
      id: `app-${Date.now()}`,
      publisher_id: publisherId,
      campaign_id: campaignId,
      status: initialStatus,
      created_at: new Date().toISOString()
    };
    list.push(newApp);
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(list));

    if (autoApprove) {
      await generateAffiliateLink(publisherId, campaignId);
    }
    return newApp;
  }

  // 1. Fetch campaign and advertiser's auto-approve configuration
  const { data: campData } = await supabase
    .from('campaigns')
    .select('*, profiles:advertiser_id(auto_approve)')
    .eq('id', campaignId)
    .single();

  const autoApprove = campData?.profiles?.auto_approve || false;
  const initialStatus = autoApprove ? 'approved' : 'pending';

  const { data, error } = await supabase
    .from('program_applications')
    .insert({ publisher_id: publisherId, campaign_id: campaignId, status: initialStatus })
    .select()
    .single();
  if (error) throw error;

  if (autoApprove) {
    try {
      await generateAffiliateLink(publisherId, campaignId);
    } catch (e) {
      console.error('Failed to auto-generate link:', e);
    }
  }
  return data;
};

export const updateApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected' | 'suspended'): Promise<void> => {
  if (!isSupabaseConfigured) {
    const list: ProgramApplication[] = JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || '[]');
    const updated = list.map(a => a.id === applicationId ? { ...a, status } : a);
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(updated));

    if (status === 'approved') {
      const app = list.find(a => a.id === applicationId);
      if (app) {
        await generateAffiliateLink(app.publisher_id, app.campaign_id);
      }
    }
    return;
  }

  const { error } = await supabase
    .from('program_applications')
    .update({ status })
    .eq('id', applicationId);
  if (error) throw error;

  if (status === 'approved') {
    const { data: app } = await supabase
      .from('program_applications')
      .select('*')
      .eq('id', applicationId)
      .single();
    if (app) {
      try {
        await generateAffiliateLink(app.publisher_id, app.campaign_id);
      } catch (rlsError) {
        console.warn('Skipped auto-generating affiliate link due to RLS permissions. The affiliate can generate it in their dashboard:', rlsError);
      }
    }
  }
};

export const getAdvertiserClicks = async (advertiserId: string): Promise<Click[]> => {
  if (!isSupabaseConfigured) {
    const clicks = getStored(CLICKS_KEY, DEFAULT_CLICKS);
    const campaigns = getStored(CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
    const advertiserCampIds = campaigns.filter(camp => camp.advertiser_id === advertiserId).map(camp => camp.id);
    const filtered = clicks.filter(c => advertiserCampIds.includes(c.campaign_id));
    return filtered.map(c => ({
      ...c,
      campaign: campaigns.find(camp => camp.id === c.campaign_id)
    }));
  }
  const { data, error } = await supabase
    .from('clicks')
    .select('*, campaign:campaigns!inner(*)')
    .eq('campaign.advertiser_id', advertiserId);
  if (error) throw error;
  return data || [];
};

export const getBrandCreatives = async (advertiserId?: string): Promise<BrandCreative[]> => {
  if (!isSupabaseConfigured) {
    const list: BrandCreative[] = JSON.parse(localStorage.getItem(CREATIVES_KEY) || '[]');
    return advertiserId ? list.filter(c => c.advertiser_id === advertiserId) : list;
  }

  let query = supabase.from('brand_creatives').select('*');
  if (advertiserId) query = query.eq('advertiser_id', advertiserId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const addBrandCreative = async (creative: Omit<BrandCreative, 'id' | 'created_at'>): Promise<BrandCreative> => {
  if (!isSupabaseConfigured) {
    const list: BrandCreative[] = JSON.parse(localStorage.getItem(CREATIVES_KEY) || '[]');
    const newCreative: BrandCreative = {
      ...creative,
      id: `creative-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    list.push(newCreative);
    localStorage.setItem(CREATIVES_KEY, JSON.stringify(list));
    return newCreative;
  }

  const { data, error } = await supabase
    .from('brand_creatives')
    .insert(creative)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteBrandCreative = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    const list: BrandCreative[] = JSON.parse(localStorage.getItem(CREATIVES_KEY) || '[]');
    const updated = list.filter(c => c.id !== id);
    localStorage.setItem(CREATIVES_KEY, JSON.stringify(updated));
    return;
  }

  const { error } = await supabase.from('brand_creatives').delete().eq('id', id);
  if (error) throw error;
};

export const getAdvertisers = async (): Promise<Profile[]> => {
  if (!isSupabaseConfigured) {
    const profiles = JSON.parse(localStorage.getItem('rewardmate_mock_profiles') || '[]');
    return profiles.filter((p: any) => p.user_type === 'advertiser');
  }
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'advertiser');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching advertisers from Supabase:', err);
    const profiles = JSON.parse(localStorage.getItem('rewardmate_mock_profiles') || '[]');
    return profiles.filter((p: any) => p.user_type === 'advertiser');
  }
};

