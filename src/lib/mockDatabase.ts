import { supabase, isSupabaseConfigured } from '../supabaseClient';

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
  status: 'pending' | 'approved' | 'rejected';
  transaction_id: string;
  created_at: string;
  campaign?: Campaign;
}

const CAMPAIGNS_KEY = 'rewardmate_mock_campaigns';
const LINKS_KEY = 'rewardmate_mock_links';
const CLICKS_KEY = 'rewardmate_mock_clicks';
const CONVERSIONS_KEY = 'rewardmate_mock_conversions';

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: 'campaign-1',
    advertiser_id: 'mock-advertiser-id',
    advertiser_name: 'Daniel Proctor (Advertiser)',
    name: 'AMEX Gold Card Sign-ups',
    description: 'Promote the American Express Gold Card. High payout for every approved credit card application.',
    landing_page_url: 'https://www.amex.com.au/gold-card',
    payout_type: 'cpa',
    payout_amount: 150.00,
    status: 'active',
    total_budget: 10000.00,
    spend: 4500.00,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'campaign-2',
    advertiser_id: 'mock-advertiser-id',
    advertiser_name: 'Daniel Proctor (Advertiser)',
    name: 'Origin Energy Switch Deal',
    description: 'Refer customers to switch their electricity/gas provider. Earn per successful connection.',
    landing_page_url: 'https://www.originenergy.com.au/switch',
    payout_type: 'cpa',
    payout_amount: 75.00,
    status: 'active',
    total_budget: 5000.00,
    spend: 1125.00,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'campaign-3',
    advertiser_id: 'mock-advertiser-id',
    advertiser_name: 'Daniel Proctor (Advertiser)',
    name: 'Kogan Mobile Yearly Plan',
    description: 'Get users to sign up for Kogan Mobile 365-day prepaid plans. High conversion rates.',
    landing_page_url: 'https://www.koganmobile.com.au/plans',
    payout_type: 'cpc',
    payout_amount: 0.80,
    status: 'active',
    total_budget: 2000.00,
    spend: 0.00,
    created_at: new Date().toISOString()
  },
  {
    id: 'campaign-4',
    advertiser_id: 'mock-advertiser-id',
    advertiser_name: 'Daniel Proctor (Advertiser)',
    name: 'Woolworths Everyday Mobile',
    description: 'Promote Everyday Mobile by Woolworths prepaid SIMs. Excellent value and network coverage.',
    landing_page_url: 'https://www.everydaymobile.com.au',
    payout_type: 'cpa',
    payout_amount: 45.00,
    status: 'active',
    total_budget: 8000.00,
    spend: 1200.00,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'campaign-5',
    advertiser_id: 'mock-advertiser-id',
    advertiser_name: 'Daniel Proctor (Advertiser)',
    name: 'Bupa Health Insurance Cover',
    description: 'Promote Bupa domestic health insurance. High payout for every approved customer policy switcher.',
    landing_page_url: 'https://www.bupa.com.au/health-insurance',
    payout_type: 'cpa',
    payout_amount: 120.00,
    status: 'active',
    total_budget: 15000.00,
    spend: 3600.00,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'campaign-6',
    advertiser_id: 'mock-advertiser-id',
    advertiser_name: 'Daniel Proctor (Advertiser)',
    name: 'Samsung Galaxy S26 Promo',
    description: 'Promote Samsung Galaxy S26 flagship pre-orders. Earn flat payout per successful referral sign-up.',
    landing_page_url: 'https://www.samsung.com/au/smartphones/galaxy-s/',
    payout_type: 'cpa',
    payout_amount: 80.00,
    status: 'active',
    total_budget: 12000.00,
    spend: 0.00,
    created_at: new Date().toISOString()
  },
  {
    id: 'campaign-7',
    advertiser_id: 'mock-advertiser-id',
    advertiser_name: 'Daniel Proctor (Advertiser)',
    name: 'Amazon Prime Free Trial',
    description: 'Get visitors to sign up for Amazon Prime 30-day Free Trial. Extremely high click-to-conversion rates.',
    landing_page_url: 'https://www.amazon.com.au/prime',
    payout_type: 'cpa',
    payout_amount: 12.00,
    status: 'active',
    total_budget: 6000.00,
    spend: 0.00,
    created_at: new Date().toISOString()
  }
];

const DEFAULT_LINKS: AffiliateLink[] = [
  {
    id: 'link-1',
    publisher_id: 'mock-publisher-id',
    campaign_id: 'campaign-1',
    code: 'SarahAMEX123',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'link-2',
    publisher_id: 'mock-publisher-id',
    campaign_id: 'campaign-2',
    code: 'SarahOrigin456',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_CLICKS: Click[] = [
  {
    id: 'click-1',
    link_id: 'link-1',
    publisher_id: 'mock-publisher-id',
    campaign_id: 'campaign-1',
    ip_address: '124.168.1.5',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    referrer: 'https://www.google.com.au/',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'click-2',
    link_id: 'link-1',
    publisher_id: 'mock-publisher-id',
    campaign_id: 'campaign-1',
    ip_address: '203.45.16.2',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15',
    referrer: 'https://instagram.com/',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'click-3',
    link_id: 'link-2',
    publisher_id: 'mock-publisher-id',
    campaign_id: 'campaign-2',
    ip_address: '1.120.2.1',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0',
    referrer: 'https://t.co/',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_CONVERSIONS: Conversion[] = [
  {
    id: 'conv-1',
    click_id: 'click-1',
    publisher_id: 'mock-publisher-id',
    publisher_name: 'Sarah Connor (Publisher)',
    campaign_id: 'campaign-1',
    campaign_name: 'AMEX Gold Card Sign-ups',
    payout: 150.00,
    status: 'approved',
    transaction_id: 'TXN-AMEX-98213',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'conv-2',
    click_id: 'click-3',
    publisher_id: 'mock-publisher-id',
    publisher_name: 'Sarah Connor (Publisher)',
    campaign_id: 'campaign-2',
    campaign_name: 'Origin Energy Switch Deal',
    payout: 75.00,
    status: 'approved',
    transaction_id: 'TXN-ORIGIN-45612',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'conv-3',
    click_id: 'click-2',
    publisher_id: 'mock-publisher-id',
    publisher_name: 'Sarah Connor (Publisher)',
    campaign_id: 'campaign-1',
    campaign_name: 'AMEX Gold Card Sign-ups',
    payout: 150.00,
    status: 'pending',
    transaction_id: 'TXN-AMEX-22341',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  }
];

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
    return getStored(CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
  }
  try {
    const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) {
      console.log('No live campaigns found. Using default mock campaigns as fallback.');
      return DEFAULT_CAMPAIGNS;
    }
    return data;
  } catch (err) {
    console.error('Error loading campaigns from Supabase:', err);
    return DEFAULT_CAMPAIGNS;
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
  const { data, error } = await supabase.from('campaigns').insert(campaign).select().single();
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

export const createConversion = async (clickId: string, payout: number): Promise<Conversion> => {
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
      status: 'pending',
      transaction_id: `TXN-SIM-${Math.floor(Math.random()*90000) + 10000}`,
      created_at: new Date().toISOString()
    };
    setStored(CONVERSIONS_KEY, [newConv, ...conversions]);
    return newConv;
  }
  // supabase logic
  const { data, error } = await supabase.from('conversions').insert({ click_id: clickId, payout }).select().single();
  if (error) throw error;
  return data;
};

export const updateConversionStatus = async (id: string, status: Conversion['status']): Promise<void> => {
  if (!isSupabaseConfigured) {
    const conversions = getStored(CONVERSIONS_KEY, DEFAULT_CONVERSIONS);
    const updated = conversions.map(c => c.id === id ? { ...c, status } : c);
    setStored(CONVERSIONS_KEY, updated);

    // If approved, trigger wallet balance payout to publisher
    if (status === 'approved') {
      const conv = conversions.find(c => c.id === id);
      if (conv) {
        // Payout to publisher
        const profilesKey = 'rewardmate_mock_profiles';
        const profiles = JSON.parse(localStorage.getItem(profilesKey) || '[]');
        const updatedProfiles = profiles.map((p: any) => {
          if (p.id === conv.publisher_id) {
            return { ...p, wallet_balance: Number(p.wallet_balance) + Number(conv.payout) };
          }
          // Spend deduction for advertiser
          const campaigns = getStored(CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
          const campaign = campaigns.find(camp => camp.id === conv.campaign_id);
          if (campaign && p.id === campaign.advertiser_id) {
            return { ...p, wallet_balance: Number(p.wallet_balance) - Number(conv.payout) };
          }
          return p;
        });
        localStorage.setItem(profilesKey, JSON.stringify(updatedProfiles));

        // Increment campaign spend
        const campaigns = getStored(CAMPAIGNS_KEY, DEFAULT_CAMPAIGNS);
        const updatedCamp = campaigns.map(c => {
          if (c.id === conv.campaign_id) {
            return { ...c, spend: Number(c.spend) + Number(conv.payout) };
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
