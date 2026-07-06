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
    title: isRegister ? "Sign Up | Reward Mate Affiliate Portal" : "Sign In | Reward Mate Affiliate Portal",
    description: "Access your Reward Mate performance dashboard. Register or log in to manage your CPA campaigns, track link clicks, and claim affiliate payouts.",
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
    <div className="min-h-screen grid lg:grid-cols-2 text-white font-sans selection:bg-blue-500/20 bg-[#070913]">
      
      {/* Left panel: Info/Branding (Premium dark blue hero-matched panel) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#070913] border-r border-white/5 relative overflow-hidden text-white">
        
        {/* Decorative glows */}
        <div className="absolute top-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,#0052FF_0%,transparent_70%)] opacity-20 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-15%] w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,#002699_0%,transparent_70%)] opacity-25 blur-[85px] pointer-events-none" />
        
        {/* Soft Background Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <a href={getLandingUrl('/')} className="flex items-center space-x-3 cursor-pointer relative z-10">
          <img src="/rewardmate-logo-cropped.png" className="h-7 sm:h-8 w-auto object-contain brightness-0 invert" alt="Reward Mate Logo" />
        </a>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">
            Australia's Most <span className="bg-gradient-to-r from-[#38bdf8] via-[#0052FF] to-[#3b82f6] bg-clip-text text-transparent">Performance Network.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Acquire high-intent customers on a risk-free cost-per-acquisition basis, or generate premium revenues from your digital content.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <div className="h-6 w-6 rounded-full bg-[#0052FF]/20 border border-[#0052FF]/30 flex items-center justify-center font-bold text-[#38bdf8] text-xs">✓</div>
              <span>Pay strictly for tracked sales/leads (Advertisers)</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <div className="h-6 w-6 rounded-full bg-[#0052FF]/20 border border-[#0052FF]/30 flex items-center justify-center font-bold text-[#38bdf8] text-xs">✓</div>
              <span>Access highest paying CPA offers in Australia (Publishers)</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <div className="h-6 w-6 rounded-full bg-[#0052FF]/20 border border-[#0052FF]/30 flex items-center justify-center font-bold text-[#38bdf8] text-xs">✓</div>
              <span>Real-time wallet payout logic with zero delay</span>
            </div>
          </div>
        </div>

        <div className="text-slate-500 text-xs relative z-10">
          &copy; {new Date().getFullYear()} Reward Mate. All rights reserved.
        </div>
      </div>

      {/* Right panel: Login forms */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto bg-[#070913]">
        
        {/* Glow Effects */}
        <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,#002699_0%,transparent_70%)] opacity-20 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,#0052FF_0%,transparent_70%)] opacity-15 blur-[90px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 space-y-6 shadow-2xl relative z-10 animate-in fade-in duration-500">
          
          <div className="text-center lg:text-left">
            <a href={getLandingUrl('/')} className="flex items-center justify-center lg:justify-start space-x-3 mb-6 lg:hidden cursor-pointer">
              <img src="/rewardmate-logo-cropped.png" className="h-6 sm:h-7 w-auto object-contain brightness-0 invert" alt="Reward Mate Logo" />
            </a>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              {isRegister ? 'Join as an Advertiser or Publisher to get started' : 'Sign in to access your Reward Mate portal'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <>
                {/* Full name field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#38bdf8]/75" />
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-[#0052FF] focus:bg-white/[0.06] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole('publisher')}
                      className={`h-14 rounded-xl border flex flex-col justify-center items-center font-bold text-xs transition-all ${role === 'publisher' ? 'border-[#0052FF] bg-[#0052FF]/10 text-white shadow-[0_0_15px_rgba(0,82,255,0.2)]' : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20'}`}
                    >
                      <Briefcase className="h-5 w-5 mb-1" />
                      Publisher / Affiliate
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('advertiser')}
                      className={`h-14 rounded-xl border flex flex-col justify-center items-center font-bold text-xs transition-all ${role === 'advertiser' ? 'border-[#0052FF] bg-[#0052FF]/10 text-white shadow-[0_0_15px_rgba(0,82,255,0.2)]' : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20'}`}
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
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#38bdf8]/75" />
                <input 
                  type="email" 
                  placeholder="e.g. name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-[#0052FF] focus:bg-white/[0.06] transition-all"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
                {!isRegister && (
                  <button type="button" className="text-xs font-bold text-[#38bdf8] hover:text-white transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#38bdf8]/75" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl h-12 pl-12 pr-12 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-[#0052FF] focus:bg-white/[0.06] transition-all"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0052FF] text-white font-bold h-12 rounded-xl text-sm flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                isRegister ? 'Register Account' : 'Sign In Portal'
              )}
            </button>
          </form>

          {/* Toggle form type */}
          <div className="text-center text-sm font-semibold text-slate-400">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button onClick={() => setIsRegister(false)} className="text-[#38bdf8] hover:underline hover:text-white transition-colors">
                  Sign In
                </button>
              </>
            ) : (
              <>
                New to Reward Mate?{' '}
                <button onClick={() => setIsRegister(true)} className="text-[#38bdf8] hover:underline hover:text-white transition-colors">
                  Create Account
                </button>
              </>
            )}
          </div>

          {/* Sandbox Helper panel */}
          {isMock && (
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-[#38bdf8]">Sandbox Simulation Mode</div>
                <span className="bg-[#0052FF]/20 text-[#38bdf8] text-[10px] font-extrabold rounded-full px-2.5 py-0.5 border border-[#0052FF]/30">Active</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Supabase credentials not configured. Click any button below to instantly log in as a sandbox role:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleMockLogin('advertiser@rewardmate.com.au')}
                  className="bg-[#0052FF]/10 hover:bg-[#0052FF]/20 text-[#38bdf8] border border-[#0052FF]/25 py-2.5 rounded-lg text-[10px] font-bold text-center transition-all shadow-sm"
                >
                  Advertiser
                </button>
                <button
                  onClick={() => handleMockLogin('publisher@rewardmate.com.au')}
                  className="bg-[#0052FF]/10 hover:bg-[#0052FF]/20 text-[#38bdf8] border border-[#0052FF]/25 py-2.5 rounded-lg text-[10px] font-bold text-center transition-all shadow-sm"
                >
                  Publisher
                </button>
                <button
                  onClick={() => handleMockLogin('admin@rewardmate.com.au')}
                  className="bg-[#0052FF]/10 hover:bg-[#0052FF]/20 text-[#38bdf8] border border-[#0052FF]/25 py-2.5 rounded-lg text-[10px] font-bold text-center transition-all shadow-sm"
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
