import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layers, Mail, Lock, User, Briefcase, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { getLandingUrl } from '../lib/domain';
import { useSEO } from '../hooks/useSEO';
import { supabase } from '../supabaseClient';

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
  const [rememberMe, setRememberMe] = useState(false);

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

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (isMock) {
        toast.info('Google login is simulated in Sandbox mode.');
        await handleMockLogin('google-publisher@rewardmate.com.au');
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/dashboard'
          }
        });
        if (error) throw error;
      }
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
        if (isMock) {
          toast.success('Registration successful! Redirecting to dashboard...');
          navigate('/dashboard');
        } else {
          setIsRegister(false);
        }
      } else {
        await signIn(email, password);
        toast.success('Signed in successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      // handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full grid lg:grid-cols-2 text-slate-800 font-sans selection:bg-blue-500/20 bg-white overflow-x-hidden relative">
      
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
      <div className="flex items-center justify-center p-4 sm:p-12 relative overflow-y-auto overflow-x-hidden bg-white h-full w-full">
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500 relative z-10">
          
          <div className="text-center lg:text-left">
            <a href={getLandingUrl('/')} className="flex items-center justify-center lg:justify-start space-x-3 mb-6 lg:hidden cursor-pointer">
              <img src="/rewardmate-logo-cropped.png" className="h-6 sm:h-7 w-auto object-contain brightness-0" alt="Reward Mate Logo" />
            </a>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              {isRegister ? 'Join as an Advertiser or Publisher to get started' : 'Sign in to access your Reward Mate portal'}
            </p>
          </div>

          {/* Social Sign-in Button */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold h-12 rounded-xl text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>{isRegister ? 'Register with Google' : 'Continue with Google'}</span>
            </button>

            <div className="flex items-center">
              <div className="border-t border-slate-200 flex-grow"></div>
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Or continue with email</span>
              <div className="border-t border-slate-200 flex-grow"></div>
            </div>
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
                      onClick={() => navigate('/register/advertiser')}
                      className="h-14 rounded-xl border flex flex-col justify-center items-center font-bold text-xs border-slate-200 bg-[#f8fafc] text-slate-500 hover:border-slate-300 transition-all"
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
 
            {/* Remember Me Checkbox */}
            {!isRegister && (
              <div className="flex items-center pt-1">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#0052FF] focus:ring-[#0052FF] border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="remember_me" className="ml-2 block text-xs font-bold text-slate-500 select-none cursor-pointer">
                  Remember me
                </label>
              </div>
            )}

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
                New to Reward Mate?{' '}
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
