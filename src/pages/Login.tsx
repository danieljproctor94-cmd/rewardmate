import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layers, Mail, Lock, User, Briefcase, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { getLandingUrl } from '../lib/domain';
import { useSEO } from '../hooks/useSEO';

export default function Login() {
  const { signIn, signUp, isMock } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'advertiser' | 'publisher'>('publisher');

  useSEO({
    title: isRegister ? "Sign Up | RewardMate Affiliate Portal" : "Sign In | RewardMate Affiliate Portal",
    description: "Access your RewardMate performance dashboard. Register or log in to manage your CPA campaigns, track link clicks, and claim affiliate payouts.",
    noIndex: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Directly sign in to sandbox for local demonstration
  const handleMockLogin = async (mockEmail: string) => {
    setLoading(true);
    try {
      await signIn(mockEmail, 'sandbox');
      toast.success('Successfully logged into Sandbox simulation!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !fullName)) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await signUp(email, password, fullName, role);
        toast.success('Registration successful! Redirecting to dashboard...');
      } else {
        await signIn(email, password);
        toast.success('Signed in successfully!');
      }
      navigate('/dashboard');
    } catch (err) {
      // handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 text-slate-800 font-sans selection:bg-blue-500/20 bg-white">
      
      {/* Left panel: Info/Branding (Premium blue corporate panel) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-tr from-[#002699] via-[#0047FF] to-[#3b82f6] border-r border-slate-100 relative overflow-hidden text-white">
        {/* Decorative glows */}
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-20 blur-[80px] pointer-events-none bg-white" />
        <div className="absolute bottom-[10%] left-[-10%] w-[300px] h-[300px] rounded-full opacity-10 blur-[70px] pointer-events-none bg-blue-900" />

        <a href={getLandingUrl('/')} className="flex items-center space-x-3 cursor-pointer relative z-10">
          <img src="/rewardmate-logo-cropped.png" className="h-7 sm:h-8 w-auto object-contain brightness-0 invert" alt="RewardMate Logo" />
        </a>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">
            Australia's Most Transparent Affiliate Network.
          </h2>
          <p className="text-white/80 text-base leading-relaxed">
            Acquire high-intent customers on a risk-free cost-per-acquisition basis, or generate premium revenues from your digital content.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-3 text-sm text-white/90">
              <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-xs">✓</div>
              <span>Pay strictly for tracked sales/leads (Advertisers)</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-white/90">
              <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-xs">✓</div>
              <span>Access highest paying CPA offers in Australia (Publishers)</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-white/90">
              <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-xs">✓</div>
              <span>Real-time wallet payout logic with zero delay</span>
            </div>
          </div>
        </div>

        <div className="text-white/60 text-xs relative z-10">
          &copy; {new Date().getFullYear()} RewardMate. All rights reserved.
        </div>
      </div>

      {/* Right panel: Login forms */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto bg-white">
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
          
          <div className="text-center lg:text-left">
            <a href={getLandingUrl('/')} className="flex items-center justify-center lg:justify-start space-x-3 mb-6 lg:hidden cursor-pointer">
              <img src="/rewardmate-logo-cropped.png" className="h-6 sm:h-7 w-auto object-contain brightness-0" alt="RewardMate Logo" />
            </a>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              {isRegister ? 'Join as an Advertiser or Publisher to get started' : 'Sign in to access your RewardMate portal'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <>
                {/* Full name field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole('publisher')}
                      className={`h-14 rounded-xl border flex flex-col justify-center items-center font-bold text-xs transition-all ${role === 'publisher' ? 'border-[#0052FF] bg-blue-50 text-[#0052FF]' : 'border-slate-200 bg-[#f8fafc] text-slate-500 hover:border-slate-300'}`}
                    >
                      <Briefcase className="h-5 w-5 mb-1" />
                      Publisher / Affiliate
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('advertiser')}
                      className={`h-14 rounded-xl border flex flex-col justify-center items-center font-bold text-xs transition-all ${role === 'advertiser' ? 'border-[#0052FF] bg-blue-50 text-[#0052FF]' : 'border-slate-200 bg-[#f8fafc] text-slate-500 hover:border-slate-300'}`}
                    >
                      <Layers className="h-5 w-5 mb-1" />
                      Advertiser / Brand
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="e.g. name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
                {!isRegister && (
                  <button type="button" className="text-xs font-bold text-[#0052FF] hover:text-blue-700 transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 pl-12 pr-12 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0052FF] text-white font-bold h-12 rounded-xl text-sm flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/10 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                isRegister ? 'Register Account' : 'Sign In Portal'
              )}
            </button>
          </form>

          {/* Toggle form type */}
          <div className="text-center text-sm font-semibold text-slate-500">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button onClick={() => setIsRegister(false)} className="text-[#0052FF] hover:underline">
                  Sign In
                </button>
              </>
            ) : (
              <>
                New to RewardMate?{' '}
                <button onClick={() => setIsRegister(true)} className="text-[#0052FF] hover:underline">
                  Create Account
                </button>
              </>
            )}
          </div>

          {/* Sandbox Helper panel */}
          {isMock && (
            <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Sandbox Simulation Mode</div>
                <span className="bg-blue-50 text-[#0052FF] text-[10px] font-extrabold rounded-full px-2.5 py-0.5">Active</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Supabase credentials not configured. Click any button below to instantly log in as a sandbox role:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleMockLogin('advertiser@rewardmate.com.au')}
                  className="bg-blue-50 hover:bg-blue-100 text-[#0052FF] border border-blue-200/50 py-2.5 rounded-lg text-[10px] font-bold text-center transition-all shadow-sm"
                >
                  Advertiser
                </button>
                <button
                  onClick={() => handleMockLogin('publisher@rewardmate.com.au')}
                  className="bg-blue-50 hover:bg-blue-100 text-[#0052FF] border border-blue-200/50 py-2.5 rounded-lg text-[10px] font-bold text-center transition-all shadow-sm"
                >
                  Publisher
                </button>
                <button
                  onClick={() => handleMockLogin('admin@rewardmate.com.au')}
                  className="bg-blue-50 hover:bg-blue-100 text-[#0052FF] border border-blue-200/50 py-2.5 rounded-lg text-[10px] font-bold text-center transition-all shadow-sm"
                >
                  Admin
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
