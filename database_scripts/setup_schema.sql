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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    business_name TEXT,
    website TEXT,
    channels TEXT,
    traffic TEXT,
    onboarding_completed BOOLEAN DEFAULT false,
    payout_method TEXT CHECK (payout_method IN ('paypal', 'bank')),
    paypal_email TEXT,
    bank_name TEXT,
    bank_bsb TEXT,
    bank_account_number TEXT,
    bank_account_name TEXT,
    commission_rate NUMERIC(5,2) DEFAULT 1.50,
    program_terms TEXT,
    about_us TEXT,
    target_countries TEXT,
    year_founded INTEGER,
    facebook_url TEXT,
    instagram_url TEXT,
    auto_approve BOOLEAN DEFAULT false,
    payout_threshold NUMERIC(10,2) DEFAULT 50.00 CHECK (payout_threshold >= 50.00)
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profiles or admin updates" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id OR 
        coalesce(auth.jwt() -> 'user_metadata' ->> 'user_type', '') = 'admin'
    );

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
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to campaigns" ON public.campaigns
    FOR SELECT USING (true);

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
    sale_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    rewardmate_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'pending',
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger: Automatically handle wallet balance payout and RewardMate flat-rate 1.5% fee on conversion approval
CREATE OR REPLACE FUNCTION public.handle_conversion_approval()
RETURNS trigger AS $$
DECLARE
  v_advertiser_id UUID;
  v_rewardmate_fee NUMERIC(10,2);
  v_admin_id UUID;
  v_commission_rate NUMERIC(5,2);
BEGIN
  -- Only run if status transitioned to approved
  IF NEW.status = 'approved' AND (TG_OP = 'INSERT' OR OLD.status IS NULL OR OLD.status <> 'approved') THEN
    -- Find advertiser (brand)
    SELECT advertiser_id INTO v_advertiser_id FROM public.campaigns WHERE id = NEW.campaign_id;
    
    -- Get custom brand commission fee rate or default to 1.50%
    SELECT COALESCE(commission_rate, 1.50) INTO v_commission_rate 
    FROM public.profiles 
    WHERE id = v_advertiser_id;
    
    -- Compute fee based on brand's specific commission_rate
    v_rewardmate_fee := ROUND(COALESCE(NEW.sale_amount, 0.00) * (COALESCE(v_commission_rate, 1.50) / 100.00), 2);
    
    -- Store the fee inside the row
    NEW.rewardmate_fee := v_rewardmate_fee;
    
    -- Update publisher (affiliate) balance
    UPDATE public.profiles 
    SET wallet_balance = wallet_balance + NEW.payout 
    WHERE id = NEW.publisher_id;
    
    -- Update advertiser (brand) balance: deduct payout + 1.5% RewardMate fee
    IF v_advertiser_id IS NOT NULL THEN
      UPDATE public.profiles 
      SET wallet_balance = wallet_balance - (NEW.payout + v_rewardmate_fee) 
      WHERE id = v_advertiser_id;
    END IF;
    
    -- Update admin balance (first admin account found)
    SELECT id INTO v_admin_id FROM public.profiles WHERE user_type = 'admin' LIMIT 1;
    IF v_admin_id IS NOT NULL THEN
      UPDATE public.profiles 
      SET wallet_balance = wallet_balance + v_rewardmate_fee 
      WHERE id = v_admin_id;
    END IF;

    -- Increment campaign spend
    UPDATE public.campaigns
    SET spend = COALESCE(spend, 0.00) + NEW.payout
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_conversion_approved
  BEFORE INSERT OR UPDATE ON public.conversions
  FOR EACH ROW EXECUTE FUNCTION public.handle_conversion_approval();

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
  INSERT INTO public.profiles (id, email, full_name, avatar_url, user_type, approval_status, wallet_balance, business_name, website, channels, traffic, onboarding_completed)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'user_type', 'publisher'),
    CASE 
      WHEN COALESCE(new.raw_user_meta_data->>'user_type', 'publisher') IN ('publisher', 'advertiser') THEN 'pending'
      ELSE 'approved'
    END,
    0.00,
    COALESCE(new.raw_user_meta_data->>'business_name', ''),
    COALESCE(new.raw_user_meta_data->>'website', ''),
    COALESCE(new.raw_user_meta_data->>'channels', ''),
    COALESCE(new.raw_user_meta_data->>'traffic', ''),
    COALESCE((new.raw_user_meta_data->>'onboarding_completed')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7b. Trigger to auto-confirm new signups automatically (no verification email required)
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS trigger AS $$
BEGIN
  NEW.email_confirmed_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_new_user();

-- Migration snippet to run in Supabase SQL editor for existing tables:
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS channels TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS traffic TEXT;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- 8. Seed Live Campaigns and Profiles
INSERT INTO public.profiles (id, email, full_name, user_type, approval_status, wallet_balance, onboarding_completed) VALUES
('c5ab1c29-8b39-4a36-9c80-f46ad36b7bfc', 'info@danielproctor.com', 'Daniel Proctor (Admin)', 'admin', 'approved', 0.00, true),
('a9dd24da-573e-41df-9214-cc3533f81e40', 'sam@danielproctor.com', 'Sam Proctor', 'publisher', 'approved', 0.00, true)
ON CONFLICT (id) DO NOTHING;

-- 9. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    receiver_name TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own messages" ON public.messages
    FOR SELECT USING (
        auth.uid()::text = sender_id OR 
        auth.uid()::text = receiver_id
    );

CREATE POLICY "Allow message inserts between valid roles" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid()::text = sender_id
        AND (
            -- Admin can message anyone
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
            )
            OR
            -- Non-admin rules: Publisher & Advertiser cannot message same-type roles
            EXISTS (
                SELECT 1 FROM public.profiles sender 
                CROSS JOIN public.profiles receiver
                WHERE sender.id = auth.uid() 
                  AND receiver.id::text = receiver_id 
                  AND NOT (sender.user_type = 'publisher' AND receiver.user_type = 'publisher')
                  AND NOT (sender.user_type = 'advertiser' AND receiver.user_type = 'advertiser')
            )
        )
    );

-- 10. Contact Inquiries Table
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    inquiry_type TEXT NOT NULL,
    message TEXT NOT NULL,
    replied BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Contact Inquiries
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to contact inquiries" ON public.contact_inquiries
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Allow admins to manage contact inquiries" ON public.contact_inquiries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
        )
    );-- 11. Affiliate/Program Applications Table (Affiliates apply to Brand Campaigns/Offers)
CREATE TABLE IF NOT EXISTS public.program_applications (
    id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    publisher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(publisher_id, campaign_id)
);

-- Enable RLS on Program Applications
ALTER TABLE public.program_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read related applications" ON public.program_applications
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

CREATE POLICY "Allow publishers to apply" ON public.program_applications
    FOR INSERT WITH CHECK (auth.uid() = publisher_id);

CREATE POLICY "Allow advertisers or admin to update status" ON public.program_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = campaign_id AND campaigns.advertiser_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
        )
    );

-- 12. Brand Creatives Table (Banners/Assets uploaded by Brands)
CREATE TABLE IF NOT EXISTS public.brand_creatives (
    id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    advertiser_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    banner_size TEXT NOT NULL DEFAULT '728x90',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Brand Creatives
ALTER TABLE public.brand_creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to read brand creatives" ON public.brand_creatives
    FOR SELECT USING (true);

CREATE POLICY "Allow advertisers to manage their own creatives" ON public.brand_creatives
    FOR ALL USING (
        auth.uid() = advertiser_id OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
        )
    );

-- 13. Invoices Table (Monthly invoices issued to brands/advertisers)
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT NOT NULL PRIMARY KEY,
    advertiser_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    month TEXT NOT NULL,
    commission_due NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    conversions_count INTEGER NOT NULL DEFAULT 0,
    status TEXT CHECK (status IN ('payable', 'paid', 'overdue')) NOT NULL DEFAULT 'payable',
    issue_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on Invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access or admin access to invoices" ON public.invoices
    FOR SELECT USING (
        auth.uid() = advertiser_id OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
        )
    );

CREATE POLICY "Allow advertisers or admin to update invoices" ON public.invoices
    FOR UPDATE USING (
        auth.uid() = advertiser_id OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
        )
    );

CREATE POLICY "Allow admin or advertisers to insert invoices" ON public.invoices
    FOR INSERT WITH CHECK (true);

-- 14. System Settings Table (Global configurations)
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT NOT NULL PRIMARY KEY,
    value JSONB NOT NULL
);

-- Enable RLS on System Settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to system settings" ON public.system_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow admin to manage system settings" ON public.system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
        )
    );
