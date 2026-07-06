-- Reward Mate Supabase Schema Setup

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.conversions CASCADE;
DROP TABLE IF EXISTS public.clicks CASCADE;
DROP TABLE IF EXISTS public.affiliate_links CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Profiles Table (Linked to auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    user_type TEXT CHECK (user_type IN ('advertiser', 'publisher', 'admin')) NOT NULL DEFAULT 'publisher',
    approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'approved',
    wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profiles" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Campaigns/Offers Table (Created by Advertisers, approved by Admin)
CREATE TABLE public.campaigns (
    id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    advertiser_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    landing_page_url TEXT NOT NULL,
    payout_type TEXT CHECK (payout_type IN ('cpa', 'cpc', 'revshare')) NOT NULL DEFAULT 'cpa',
    payout_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status TEXT CHECK (status IN ('pending_approval', 'active', 'paused', 'rejected')) NOT NULL DEFAULT 'pending_approval',
    total_budget NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    spend NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read active/paused campaigns" ON public.campaigns
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow advertisers to manage their own campaigns" ON public.campaigns
    FOR ALL USING (
        auth.uid() = advertiser_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
        )
    );

-- 3. Affiliate/Tracking Links Table
CREATE TABLE public.affiliate_links (
    id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    publisher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (publisher_id, campaign_id)
);

-- Enable RLS on Affiliate Links
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow publishers to manage their own links" ON public.affiliate_links
    FOR ALL USING (
        auth.uid() = publisher_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
        )
    );

-- 4. Traffic Clicks Table
CREATE TABLE public.clicks (
    id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    link_id UUID REFERENCES public.affiliate_links(id) ON DELETE CASCADE NOT NULL,
    publisher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Clicks
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow publishers to read their own clicks" ON public.clicks
    FOR SELECT USING (
        auth.uid() = publisher_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
        )
    );

-- 5. Conversions Table
CREATE TABLE public.conversions (
    id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    click_id UUID REFERENCES public.clicks(id) ON DELETE SET NULL,
    publisher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    payout NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'pending',
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Conversions
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow publishers and advertisers to read related conversions" ON public.conversions
    FOR SELECT USING (
        auth.uid() = publisher_id OR 
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = campaign_id AND campaigns.advertiser_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
        )
    );

-- 6. Transactions Table (Wallet Ledger)
CREATE TABLE public.transactions (
    id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('deposit', 'withdrawal', 'payout', 'spend')) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')) NOT NULL DEFAULT 'pending',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own transactions" ON public.transactions
    FOR SELECT USING (
        auth.uid() = profile_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
        )
    );

-- 7. Trigger: Automatically create public profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, user_type, approval_status, wallet_balance)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'user_type', 'publisher'),
    'approved', -- Auto-approve for demo
    CASE 
      WHEN COALESCE(new.raw_user_meta_data->>'user_type', 'publisher') = 'advertiser' THEN 1000.00 -- Initial advertiser demo funds
      ELSE 0.00
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
