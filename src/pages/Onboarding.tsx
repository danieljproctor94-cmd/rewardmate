import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { 
  LogOut, ClipboardList, Globe, BarChart3, Radio, FileCheck, AlertCircle 
} from 'lucide-react';

export default function Onboarding({ onOnboardingComplete }: { onOnboardingComplete: () => void }) {
  const { profile, signOut, isMock } = useAuth();
  const isBrand = profile?.user_type === 'advertiser';
  const [businessName, setBusinessName] = useState(profile?.business_name || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [channels, setChannels] = useState(profile?.channels || (isBrand ? 'Retail & E-commerce' : 'Social Media'));
  const [traffic, setTraffic] = useState(profile?.traffic || (isBrand ? 'Under $5,000' : 'Under 10,000 views'));
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(profile?.approval_status === 'pending');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !website) {
      toast.error('Please complete all questions.');
      return;
    }

    setLoading(true);
    try {
      if (isMock) {
        // Mock update
        const storedProfiles = JSON.parse(localStorage.getItem('rewardmate_mock_profiles') || '[]');
        const updated = storedProfiles.map((p: any) => {
          if (p.id === profile?.id) {
            return {
              ...p,
              business_name: businessName,
              website: website,
              channels: channels,
              traffic: traffic,
              onboarding_completed: true,
              approval_status: p.approval_status === 'approved' ? 'approved' : 'pending'
            };
          }
          return p;
        });
        localStorage.setItem('rewardmate_mock_profiles', JSON.stringify(updated));
        toast.success('Application submitted successfully!');
        setSubmitted(true);
        onOnboardingComplete();
      } else {
        // Supabase update
        // We save the details inside profiles table if the columns are set up, else fallback
        let saveError = null;
        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              approval_status: profile?.approval_status === 'approved' ? 'approved' : 'pending',
              full_name: profile?.full_name || businessName,
              business_name: businessName,
              website: website,
              channels: channels,
              traffic: traffic,
              onboarding_completed: true
            } as any)
            .eq('id', profile?.id);
          if (error) {
            saveError = error;
          }
        } catch (err) {
          saveError = err;
        }

        if (saveError) {
          console.warn("Profiles custom columns are missing, falling back to profile status update.", saveError);
          // Fallback: update only columns we are sure exist
          const { error: fallbackErr } = await supabase
            .from('profiles')
            .update({
              approval_status: profile?.approval_status === 'approved' ? 'approved' : 'pending',
              full_name: profile?.full_name || businessName,
            } as any)
            .eq('id', profile?.id);
          if (fallbackErr) throw fallbackErr;
        }

        // Also save detailed onboarding in user metadata for safety
        const { error: metaErr } = await supabase.auth.updateUser({
          data: {
            business_name: businessName,
            website: website,
            channels: channels,
            traffic: traffic,
            onboarding_completed: true
          }
        });
        if (metaErr) throw metaErr;

        toast.success('Application submitted successfully!');
        setSubmitted(true);
        onOnboardingComplete();
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };



  if (submitted || profile?.approval_status === 'pending') {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-center items-center p-6 font-sans">
        <div className="bg-white border border-slate-100 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-xl text-left">
          <div className="h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto border border-amber-100">
            <AlertCircle className="h-8 w-8 animate-pulse" />
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
              Application Pending Review
            </h1>
            <p className="text-xs text-slate-550 leading-relaxed font-sans font-medium">
              Your account is pending. Please allow 24-48 hours for our team to review the application.
            </p>
          </div>

          <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 space-y-3 text-xs font-semibold text-slate-600">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-400">{isBrand ? 'Brand Name' : 'Business Name'}</span>
              <span className="text-slate-800 font-bold">{profile?.business_name || businessName || 'Reward Partner'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Website URL</span>
              <span className="text-[#0052FF] underline truncate max-w-[200px]">{profile?.website || website || 'Check Submitted Details'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-400">{isBrand ? 'Industry Category' : 'Marketing Channels'}</span>
              <span className="text-slate-800 font-bold">{profile?.channels || channels || 'Retail'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-400">{isBrand ? 'Est. Monthly Budget' : 'Monthly Traffic'}</span>
              <span className="text-slate-800 font-bold">{profile?.traffic || traffic || '$5,000'}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-center">
            <p className="text-[10px] text-slate-400 font-bold">
              You will receive full portal dashboard access once your {isBrand ? 'brand' : 'profile'} is approved.
            </p>
            <button
              onClick={signOut}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold h-11 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-center items-center p-6 font-sans">
      <div className="bg-white border border-slate-100 rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-xl text-left">
        <div className="flex items-center space-x-3 pb-2 border-b border-slate-100">
          <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-[#0052FF]">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-none mb-1">
              {profile?.approval_status === 'approved' ? 'Complete Your Account Setup' : isBrand ? 'Brand Onboarding' : 'Publisher Onboarding'}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              {profile?.approval_status === 'approved' 
                ? 'Your application is approved! Please complete these final setup details to access your dashboard.' 
                : isBrand ? 'Provide brand details to apply for advertiser network membership.' : 'Provide details to apply for active network membership.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isBrand ? 'Company or Brand Name' : 'Business or Brand Name'}
            </label>
            <input
              type="text"
              placeholder={isBrand ? "e.g. Mattel Shop" : "e.g. Woolworths Deals Blog"}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-850 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all font-sans"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 text-slate-400" /> {isBrand ? 'Website or Online Store URL' : 'Website or Social Media URL'}
            </label>
            <input
              type="url"
              placeholder={isBrand ? "https://shop.mattel.com" : "https://www.yourdomain.com.au"}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-850 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all font-sans"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Radio className="h-3.5 w-3.5 text-slate-400" /> {isBrand ? 'Primary Industry Category' : 'Primary Marketing Channel'}
              </label>
              {isBrand ? (
                <select
                  value={channels}
                  onChange={(e) => setChannels(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-850 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all cursor-pointer font-sans"
                >
                  <option>Retail & E-commerce</option>
                  <option>Finance & Insurance</option>
                  <option>Travel & Tourism</option>
                  <option>Health & Beauty</option>
                  <option>Technology & Services</option>
                </select>
              ) : (
                <select
                  value={channels}
                  onChange={(e) => setChannels(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-850 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all cursor-pointer font-sans"
                >
                  <option>Social Media</option>
                  <option>Content Blog</option>
                  <option>Email Marketing</option>
                  <option>Cashback & Loyalty</option>
                  <option>Coupon & Deals Site</option>
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <BarChart3 className="h-3.5 w-3.5 text-slate-400" /> {isBrand ? 'Est. Monthly Ad Budget' : 'Est. Monthly Traffic'}
              </label>
              {isBrand ? (
                <select
                  value={traffic}
                  onChange={(e) => setTraffic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-850 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all cursor-pointer font-sans"
                >
                  <option>Under $5,000</option>
                  <option>$5,000 - $25,000</option>
                  <option>$25,000 - $100,000</option>
                  <option>Over $100,000</option>
                </select>
              ) : (
                <select
                  value={traffic}
                  onChange={(e) => setTraffic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-xs font-medium text-slate-850 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all cursor-pointer font-sans"
                >
                  <option>Under 10,000 views</option>
                  <option>10,000 - 50,000 views</option>
                  <option>50,000 - 100,000 views</option>
                  <option>Over 100,000 views</option>
                </select>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0052FF] text-white font-bold h-12 rounded-xl text-sm flex items-center justify-center hover:bg-blue-650 disabled:opacity-50 transition-all cursor-pointer shadow-sm shadow-blue-500/10"
            >
              {loading ? (
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <span className="flex items-center gap-1.5 font-sans"><FileCheck className="h-4 w-4" /> Apply Now</span>
              )}
            </button>
          </div>
        </form>

        <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-[10px] font-bold text-slate-400">
          <span>{isBrand ? 'Company Details Secure' : 'ABN Required for Payouts'}</span>
          <button 
            onClick={signOut}
            className="text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Cancel & Logout
          </button>
        </div>
      </div>
    </div>
  );
}
