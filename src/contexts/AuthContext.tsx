import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { toast } from 'sonner';

export type UserType = 'advertiser' | 'publisher' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  user_type: UserType;
  approval_status: 'pending' | 'approved' | 'rejected';
  wallet_balance: number;
  onboarding_completed?: boolean;
  business_name?: string;
  website?: string;
  channels?: string;
  traffic?: string;
  payout_method?: 'paypal' | 'bank' | null;
  paypal_email?: string;
  bank_name?: string;
  bank_bsb?: string;
  bank_account_number?: string;
  bank_account_name?: string;
}

interface AuthContextType {
  user: any;
  profile: Profile | null;
  isAuthenticated: boolean;
  loading: boolean;
  userType: UserType | null;
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (email: string, password?: string, fullName?: string, role?: UserType) => Promise<void>;
  signOut: () => Promise<void>;
  updateBalance: (amount: number, type: 'deposit' | 'withdrawal' | 'payout' | 'spend') => Promise<void>;
  updateProfileDetails: (updates: Partial<Profile>) => Promise<void>;
  isMock: boolean;
  impersonateUser?: (targetProfile: any) => void;
  stopImpersonating?: () => void;
  isImpersonating?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Initial Mock Sandbox Data
const MOCK_PROFILES_KEY = 'rewardmate_mock_profiles';
const DEFAULT_MOCK_PROFILES: Profile[] = [
  {
    id: 'mock-advertiser-id',
    email: 'advertiser@rewardmate.com.au',
    full_name: 'Daniel Proctor (Advertiser)',
    avatar_url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80',
    user_type: 'advertiser',
    approval_status: 'approved',
    wallet_balance: 5000.00
  },
  {
    id: 'mock-publisher-id',
    email: 'publisher@rewardmate.com.au',
    full_name: 'Sarah Connor (Publisher)',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    user_type: 'publisher',
    approval_status: 'approved',
    wallet_balance: 245.50
  },
  {
    id: 'mock-admin-id',
    email: 'admin@rewardmate.com.au',
    full_name: 'Daniel Proctor (Admin)',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80',
    user_type: 'admin',
    approval_status: 'approved',
    wallet_balance: 0.00
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isMock = !isSupabaseConfigured;
  const [originalAdminProfile, setOriginalAdminProfile] = useState<any>(null);

  useEffect(() => {
    const origProfileStr = localStorage.getItem('rewardmate_original_admin_profile');
    if (origProfileStr) {
      setOriginalAdminProfile(JSON.parse(origProfileStr));
    }
  }, []);

  // Migrate legacy "David Proctor" to "Daniel Proctor" in localStorage
  useEffect(() => {
    const MESSAGES_KEY = 'rewardmate_mock_messages';
    
    // 1. Migrate mock profiles
    const storedProfiles = localStorage.getItem(MOCK_PROFILES_KEY);
    if (storedProfiles) {
      try {
        const profiles = JSON.parse(storedProfiles);
        let updated = false;
        const newProfiles = profiles.map((p: any) => {
          if (p.full_name && p.full_name.includes('David')) {
            updated = true;
            return { ...p, full_name: p.full_name.replace(/David/g, 'Daniel') };
          }
          return p;
        });
        if (updated) {
          localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(newProfiles));
        }
      } catch (e) {}
    }

    // 2. Migrate mock messages
    const storedMessages = localStorage.getItem(MESSAGES_KEY);
    if (storedMessages) {
      try {
        const messages = JSON.parse(storedMessages);
        let updated = false;
        const newMessages = messages.map((m: any) => {
          let msgUpdated = false;
          let sender_name = m.sender_name;
          let receiver_name = m.receiver_name;
          if (sender_name && sender_name.includes('David')) {
            sender_name = sender_name.replace(/David/g, 'Daniel');
            msgUpdated = true;
          }
          if (receiver_name && receiver_name.includes('David')) {
            receiver_name = receiver_name.replace(/David/g, 'Daniel');
            msgUpdated = true;
          }
          if (msgUpdated) {
            updated = true;
            return { ...m, sender_name, receiver_name };
          }
          return m;
        });
        if (updated) {
          localStorage.setItem(MESSAGES_KEY, JSON.stringify(newMessages));
        }
      } catch (e) {}
    }

    // 3. Migrate currently logged in user profile if cached
    const storedUser = localStorage.getItem('rewardmate_mock_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.full_name && u.full_name.includes('David')) {
          const newU = { ...u, full_name: u.full_name.replace(/David/g, 'Daniel') };
          localStorage.setItem('rewardmate_mock_user', JSON.stringify(newU));
        }
      } catch (e) {}
    }

    // 4. Force override stale mock campaigns from previous sessions via schema versioning
    const cacheVersion = localStorage.getItem('rewardmate_cache_version');
    if (cacheVersion !== 'v3') {
      console.log('Detected older schema version. Force clearing mock localStorage databases...');
      localStorage.removeItem('rewardmate_mock_campaigns');
      localStorage.removeItem('rewardmate_mock_clicks');
      localStorage.removeItem('rewardmate_mock_conversions');
      localStorage.removeItem('rewardmate_mock_affiliate_links');
      localStorage.setItem('rewardmate_cache_version', 'v3');
    }
  }, []);

  // Initialize Mock Profiles
  useEffect(() => {
    if (isMock) {
      const stored = localStorage.getItem(MOCK_PROFILES_KEY);
      if (!stored) {
        localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(DEFAULT_MOCK_PROFILES));
      }
    }
  }, [isMock]);

  // Auth Subscription
  useEffect(() => {
    if (!isMock) {
      // Real Supabase Auth Setup
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Mock Sandbox Auth Session Check
      const activeUserId = localStorage.getItem('rewardmate_mock_active_user_id');
      if (activeUserId) {
        const storedProfiles: Profile[] = JSON.parse(localStorage.getItem(MOCK_PROFILES_KEY) || '[]');
        const activeProfile = storedProfiles.find(p => p.id === activeUserId);
        if (activeProfile) {
          setUser({ id: activeProfile.id, email: activeProfile.email });
          setProfile(activeProfile);
        }
      }
      setLoading(false);
    }
  }, [isMock]);

  const fetchProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();
      
      if (error) throw error;

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const meta = currentUser?.user_metadata || {};

      const localOverrides = JSON.parse(localStorage.getItem('rewardmate_supabase_profiles_override') || '{}');
      const userOverride = localOverrides[uid] || {};

      setProfile({
        ...data,
        onboarding_completed: meta.onboarding_completed || false,
        business_name: meta.business_name || data.business_name || '',
        website: meta.website || data.website || '',
        channels: meta.channels || data.channels || '',
        traffic: meta.traffic || data.traffic || '',
        payout_method: meta.payout_method || data.payout_method || null,
        paypal_email: meta.paypal_email || data.paypal_email || '',
        bank_name: meta.bank_name || data.bank_name || '',
        bank_bsb: meta.bank_bsb || data.bank_bsb || '',
        bank_account_number: meta.bank_account_number || data.bank_account_number || '',
        bank_account_name: meta.bank_account_name || data.bank_account_name || '',
        ...userOverride,
      });
    } catch (err: any) {
      console.error('Error fetching user profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password?: string) => {
    setLoading(true);
    try {
      if (isMock) {
        // Mock Sign-in Logic
        const storedProfiles: Profile[] = JSON.parse(localStorage.getItem(MOCK_PROFILES_KEY) || '[]');
        const matched = storedProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
        
        if (!matched) {
          throw new Error('User not found. Use advertiser@rewardmate.com.au or publisher@rewardmate.com.au or register a new account.');
        }
        
        localStorage.setItem('rewardmate_mock_active_user_id', matched.id);
        setUser({ id: matched.id, email: matched.email });
        setProfile(matched);
        toast.success(`Logged in as ${matched.full_name}`);
      } else {
        // Supabase Real Sign-in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: password || 'password123',
        });
        if (error) throw error;
        toast.success('Successfully logged in!');
      }
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password?: string, fullName?: string, role: UserType = 'publisher') => {
    setLoading(true);
    try {
      if (isMock) {
        // Mock Sign-up Logic
        const storedProfiles: Profile[] = JSON.parse(localStorage.getItem(MOCK_PROFILES_KEY) || '[]');
        if (storedProfiles.some(p => p.email.toLowerCase() === email.toLowerCase())) {
          throw new Error('Email already registered.');
        }

        const newProfile: Profile = {
          id: `mock-user-${Date.now()}`,
          email,
          full_name: fullName || email.split('@')[0],
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName || email)}`,
          user_type: role,
          approval_status: role === 'publisher' ? 'pending' : 'approved',
          wallet_balance: role === 'advertiser' ? 1000.00 : 0.00,
          onboarding_completed: role !== 'publisher',
        };

        const updated = [...storedProfiles, newProfile];
        localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(updated));

        localStorage.setItem('rewardmate_mock_active_user_id', newProfile.id);
        setUser({ id: newProfile.id, email: newProfile.email });
        setProfile(newProfile);
        toast.success(`Registered successfully as ${role}!`);
      } else {
        // Supabase Real Sign-up
        const { error } = await supabase.auth.signUp({
          email,
          password: password || 'password123',
          options: {
            data: {
              full_name: fullName,
              user_type: role,
            }
          }
        });
        if (error) throw error;
        toast.success('Registration successful! Please check your email or log in.');
      }
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (isMock) {
        localStorage.removeItem('rewardmate_mock_active_user_id');
        setUser(null);
        setProfile(null);
        toast.success('Logged out successfully.');
      } else {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        toast.success('Logged out successfully.');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async (amount: number, type: 'deposit' | 'withdrawal' | 'payout' | 'spend') => {
    if (!profile) return;
    try {
      const modifier = (type === 'deposit' || type === 'payout') ? 1 : -1;
      const change = amount * modifier;
      const nextBalance = Number(profile.wallet_balance) + change;

      if (nextBalance < 0) {
        throw new Error('Insufficient wallet balance for this transaction.');
      }

      if (isMock) {
        const storedProfiles: Profile[] = JSON.parse(localStorage.getItem(MOCK_PROFILES_KEY) || '[]');
        const updated = storedProfiles.map(p => {
          if (p.id === profile.id) {
            return { ...p, wallet_balance: nextBalance };
          }
          return p;
        });
        localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(updated));
        
        // Log transaction mock history
        const mockTxList = JSON.parse(localStorage.getItem('rewardmate_mock_transactions') || '[]');
        const newTx = {
          id: `mock-tx-${Date.now()}`,
          profile_id: profile.id,
          type,
          amount,
          status: 'completed',
          description: `${type.toUpperCase()} transaction of $${amount.toFixed(2)}`,
          created_at: new Date().toISOString()
        };
        localStorage.setItem('rewardmate_mock_transactions', JSON.stringify([newTx, ...mockTxList]));

        setProfile({ ...profile, wallet_balance: nextBalance });
        toast.success(`Transaction complete: Wallet balance updated!`);
      } else {
        // Record real Supabase transaction
        const { error: txError } = await supabase.from('transactions').insert({
          profile_id: profile.id,
          type,
          amount,
          status: 'completed',
          description: `${type.toUpperCase()} transaction of $${amount.toFixed(2)}`
        });
        if (txError) throw txError;

        // Update profile balance
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ wallet_balance: nextBalance })
          .eq('id', profile.id);
        
        if (profileError) throw profileError;

        setProfile({ ...profile, wallet_balance: nextBalance });
        toast.success(`Wallet updated!`);
      }
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const updateProfileDetails = async (updates: Partial<Profile>) => {
    if (!profile) return;
    try {
      if (isMock) {
        const storedProfiles: Profile[] = JSON.parse(localStorage.getItem(MOCK_PROFILES_KEY) || '[]');
        const updated = storedProfiles.map(p => {
          if (p.id === profile.id) {
            return { ...p, ...updates };
          }
          return p;
        });
        localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(updated));
        setProfile({ ...profile, ...updates });
        
        const storedActiveUser = localStorage.getItem('rewardmate_mock_user');
        if (storedActiveUser) {
          const u = JSON.parse(storedActiveUser);
          if (u.id === profile.id) {
            localStorage.setItem('rewardmate_mock_user', JSON.stringify({ ...u, ...updates }));
          }
        }
      } else {
        // 1. Update user metadata in Supabase Auth (always works, persistent)
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const meta = currentUser?.user_metadata || {};
        
        const newMeta: any = { ...meta };
        if (updates.payout_method !== undefined) newMeta.payout_method = updates.payout_method;
        if (updates.paypal_email !== undefined) newMeta.paypal_email = updates.paypal_email;
        if (updates.bank_name !== undefined) newMeta.bank_name = updates.bank_name;
        if (updates.bank_bsb !== undefined) newMeta.bank_bsb = updates.bank_bsb;
        if (updates.bank_account_number !== undefined) newMeta.bank_account_number = updates.bank_account_number;
        if (updates.bank_account_name !== undefined) newMeta.bank_account_name = updates.bank_account_name;
        if (updates.business_name !== undefined) newMeta.business_name = updates.business_name;
        if (updates.website !== undefined) newMeta.website = updates.website;
        if (updates.full_name !== undefined) newMeta.full_name = updates.full_name;

        const { error: authError } = await supabase.auth.updateUser({
          data: newMeta
        });
        if (authError) throw authError;

        // 2. Filter update fields to only those columns that exist in the profiles database table
        const dbUpdates: any = {};
        if (updates.full_name !== undefined) dbUpdates.full_name = updates.full_name;
        if (updates.business_name !== undefined) dbUpdates.business_name = updates.business_name;
        if (updates.website !== undefined) dbUpdates.website = updates.website;

        if (Object.keys(dbUpdates).length > 0) {
          const { error: dbError } = await supabase
            .from('profiles')
            .update(dbUpdates)
            .eq('id', profile.id);
          if (dbError) throw dbError;
        }

        setProfile({ ...profile, ...updates });
      }
      toast.success('Profile settings saved successfully!');
    } catch (err: any) {
      console.warn('Real db update failed, using localStorage override:', err);
      const storedProfiles = JSON.parse(localStorage.getItem('rewardmate_supabase_profiles_override') || '{}');
      storedProfiles[profile.id] = { ...(storedProfiles[profile.id] || {}), ...updates };
      localStorage.setItem('rewardmate_supabase_profiles_override', JSON.stringify(storedProfiles));
      
      setProfile({ ...profile, ...updates });
      toast.warning('Settings saved locally!');
    }
  };

  const impersonateUser = (targetProfile: any) => {
    if (!originalAdminProfile) {
      setOriginalAdminProfile(profile);
      localStorage.setItem('rewardmate_original_admin_profile', JSON.stringify(profile));
      localStorage.setItem('rewardmate_original_admin_user', JSON.stringify(user));
    }
    setUser({ id: targetProfile.id, email: targetProfile.email });
    setProfile(targetProfile);
    toast.success(`Now impersonating: ${targetProfile.full_name || targetProfile.email}`);
  };

  const stopImpersonating = () => {
    const origProfileStr = localStorage.getItem('rewardmate_original_admin_profile');
    const origUserStr = localStorage.getItem('rewardmate_original_admin_user');
    if (origProfileStr && origUserStr) {
      const origProfile = JSON.parse(origProfileStr);
      const origUser = JSON.parse(origUserStr);
      setUser(origUser);
      setProfile(origProfile);
      setOriginalAdminProfile(null);
      localStorage.removeItem('rewardmate_original_admin_profile');
      localStorage.removeItem('rewardmate_original_admin_user');
      toast.success(`Returned to administrator profile`);
    } else if (originalAdminProfile) {
      setUser({ id: originalAdminProfile.id, email: originalAdminProfile.email });
      setProfile(originalAdminProfile);
      setOriginalAdminProfile(null);
      toast.success(`Returned to administrator profile`);
    } else {
      toast.error('No admin session history found.');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated: !!user,
      loading,
      userType: profile?.user_type || null,
      signIn,
      signUp,
      signOut,
      updateBalance,
      updateProfileDetails,
      isMock,
      impersonateUser,
      stopImpersonating,
      isImpersonating: !!originalAdminProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
