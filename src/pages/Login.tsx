import React, { useState } from 'react';
import { useAuth, type UserType } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Layers, Mail, Lock, User, Briefcase, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { signIn, signUp, isMock } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode tabs: login vs register
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserType>((searchParams.get('role') as UserType) || 'publisher');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email.');
      return;
    }
    setLoading(true);

    try {
      if (isRegister) {
        await signUp(email, password, fullName, role);
      } else {
        await signIn(email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      // toast is triggered inside auth context
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = async (mockEmail: string) => {
    setLoading(true);
    try {
      await signIn(mockEmail);
      navigate('/dashboard');
    } catch (err) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen grid lg:grid-cols-2 text-slate-100 font-sans selection:bg-emerald-500/30 bg-[#0d0f17]">
      
      {/* Left panel: Info/Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-tr from-[#0a0c13] via-[#111624] to-[#151d30] border-r border-white/[0.05] relative overflow-hidden">
        {/* Decorative Grid and glows */}
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-10 blur-[80px] pointer-events-none bg-emerald-500" />
        <div className="absolute bottom-[10%] left-[-10%] w-[300px] h-[300px] rounded-full opacity-10 blur-[70px] pointer-events-none bg-blue-500" />

        <div className="flex items-center space-x-3 cursor-pointer relative z-10" onClick={() => navigate('/')}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center">
            <Layers className="h-6 w-6 text-slate-900" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Reward<span className="text-emerald-400">Mate</span>
          </span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h2 className="text-4xl md:text-5xl font-black leading-tight text-white">
            Australia's Most Transparent Affiliate Network.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Acquire high-intent customers on a risk-free cost-per-acquisition basis, or generate premium revenues from your digital content.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-400 text-xs">✓</div>
              <span>Pay strictly for tracked sales/leads (Advertisers)</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-400 text-xs">✓</div>
              <span>Access highest paying CPA offers in Australia (Publishers)</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-400 text-xs">✓</div>
              <span>Real-time wallet payout logic with zero delay</span>
            </div>
          </div>
        </div>

        <div className="text-slate-500 text-xs relative z-10">
          &copy; {new Date().getFullYear()} RewardMate. All rights reserved.
        </div>
      </div>

      {/* Right panel: Login forms */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
          
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6 lg:hidden cursor-pointer" onClick={() => navigate('/')}>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center">
                <Layers className="h-6 w-6 text-slate-900" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Reward<span className="text-emerald-400">Mate</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              {isRegister ? 'Join as an Advertiser or Publisher to get started' : 'Sign in to access your RewardMate portal'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <>
                {/* Full name field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#151926] border border-white/5 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-emerald-500 transition-colors"
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
                      className={`h-14 rounded-xl border flex flex-col justify-center items-center font-bold text-xs transition-all ${role === 'publisher' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/5 bg-[#151926] text-slate-400 hover:border-white/10'}`}
                    >
                      <Briefcase className="h-5 w-5 mb-1" />
                      Publisher / Affiliate
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('advertiser')}
                      className={`h-14 rounded-xl border flex flex-col justify-center items-center font-bold text-xs transition-all ${role === 'advertiser' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/5 bg-[#151926] text-slate-400 hover:border-white/10'}`}
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
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input 
                  type="email" 
                  placeholder="e.g. name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#151926] border border-white/5 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
                {!isRegister && (
                  <button type="button" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#151926] border border-white/5 rounded-xl h-12 pl-12 pr-12 text-sm font-medium text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-slate-950 font-bold h-12 rounded-xl text-sm flex items-center justify-center hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/5 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="h-5 w-5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
              ) : (
                isRegister ? 'Register Account' : 'Sign In Portal'
              )}
            </button>
          </form>

          {/* Toggle form type */}
          <div className="text-center text-sm font-medium text-slate-400">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button onClick={() => setIsRegister(false)} className="text-emerald-400 hover:underline">
                  Sign In
                </button>
              </>
            ) : (
              <>
                New to RewardMate?{' '}
                <button onClick={() => setIsRegister(true)} className="text-emerald-400 hover:underline">
                  Create Account
                </button>
              </>
            )}
          </div>

          {/* Sandbox Helper panel (Only if Supabase not configured) */}
          {isMock && (
            <div className="premium-glass-panel p-6 border-emerald-500/25 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Sandbox Simulation Mode</div>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold rounded-full px-2.5 py-0.5">Active</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Supabase credentials not detected yet. Click any button below to instantly log in as a sandbox user role:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleMockLogin('advertiser@rewardmate.com.au')}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2.5 rounded-lg text-[10px] font-bold text-center transition-all"
                >
                  Advertiser
                </button>
                <button
                  onClick={() => handleMockLogin('publisher@rewardmate.com.au')}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2.5 rounded-lg text-[10px] font-bold text-center transition-all"
                >
                  Publisher
                </button>
                <button
                  onClick={() => handleMockLogin('admin@rewardmate.com.au')}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2.5 rounded-lg text-[10px] font-bold text-center transition-all"
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
