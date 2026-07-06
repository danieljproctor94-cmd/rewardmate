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
  isMock: boolean;
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
    full_name: 'David Proctor (Advertiser)',
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
    full_name: 'Super Admin (RewardMate)',
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
      setProfile(data);
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
          approval_status: 'approved',
          wallet_balance: role === 'advertiser' ? 1000.00 : 0.00
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
      isMock
    }}>
      {children}
    </AuthContext.Provider>
  );
};
