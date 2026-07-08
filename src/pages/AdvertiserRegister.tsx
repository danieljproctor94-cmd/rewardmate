import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layers, Mail, Lock, User, Briefcase, Eye, EyeOff, Globe, Phone, FileText, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getLandingUrl } from '../lib/domain';
import { useSEO } from '../hooks/useSEO';

export default function AdvertiserRegister() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  useSEO({
    title: "Advertiser Registration | Reward Mate Australia",
    description: "Launch your performance marketing campaigns on Reward Mate. Complete our Advertiser registration form to connect with elite publishers and drive CPA conversions.",
    noIndex: false
  });

  // Steps state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [abnNumber, setAbnNumber] = useState('');
  const [category, setCategory] = useState('retail');

  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [monthlyBudget, setMonthlyBudget] = useState('under_1000');
  const [targetRegion, setTargetRegion] = useState('australia');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // Validation
  const validateStep = () => {
    if (step === 1) {
      if (!companyName) {
        toast.error('Please enter your Company Name.');
        return false;
      }
      if (!websiteUrl) {
        toast.error('Please enter your Website URL.');
        return false;
      }
      if (!abnNumber) {
        toast.error('Please enter your Business Number (ABN/ACN).');
        return false;
      }
    } else if (step === 2) {
      if (!fullName) {
        toast.error('Please enter your Full Name.');
        return false;
      }
      if (!email) {
        toast.error('Please enter your Business Email.');
        return false;
      }
      if (!phone) {
        toast.error('Please enter your Business Phone Number.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 3) return;

    if (!password) {
      toast.error('Please enter a password.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      toast.error('You must agree to the Reward Mate Advertiser Agreement.');
      return;
    }

    setLoading(true);
    try {
      // Register through AuthContext
      await signUp(email, password, fullName, 'advertiser');
      
      // Store additional merchant metadata in localStorage for simulation
      const merchantData = {
        companyName,
        tradingName: tradingName || companyName,
        websiteUrl,
        abnNumber,
        category,
        jobTitle,
        phone,
        monthlyBudget,
        targetRegion,
        registeredAt: new Date().toISOString()
      };
      localStorage.setItem(`rewardmate_advertiser_meta_${email}`, JSON.stringify(merchantData));

      toast.success('Advertiser account registered successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full grid lg:grid-cols-2 text-slate-800 font-sans selection:bg-blue-500/20 bg-white overflow-x-hidden relative">
      
      {/* Mobile Go Back Button */}
      <div className="absolute top-6 left-6 lg:hidden z-20">
        <a 
          href={getLandingUrl('/')} 
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
        >
          <span>←</span>
          <span>Go Back</span>
        </a>
      </div>

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
            Grow Your Brand on <span className="bg-gradient-to-r from-[#38bdf8] via-[#0052FF] to-[#3b82f6] bg-clip-text text-transparent">Performance.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Acquire high-intent customers on a risk-free cost-per-acquisition basis. Pay only when our publishers generate verified sales or leads.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <div className="h-6 w-6 rounded-full bg-[#0052FF]/20 border border-[#0052FF]/30 flex items-center justify-center font-bold text-[#38bdf8] text-xs">✓</div>
              <span>No setup, monthly, or platform subscription fees</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <div className="h-6 w-6 rounded-full bg-[#0052FF]/20 border border-[#0052FF]/30 flex items-center justify-center font-bold text-[#38bdf8] text-xs">✓</div>
              <span>Connect with thousands of premium verified publishers</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <div className="h-6 w-6 rounded-full bg-[#0052FF]/20 border border-[#0052FF]/30 flex items-center justify-center font-bold text-[#38bdf8] text-xs">✓</div>
              <span>Track, manage, and credit referrals in real time</span>
            </div>
          </div>
        </div>

        <div className="text-slate-500 text-xs relative z-10">
          &copy; {new Date().getFullYear()} Reward Mate. All rights reserved.
        </div>
      </div>

      {/* Right panel: Multi-step Signup Form */}
      <div className="flex items-center justify-center p-4 sm:p-12 relative overflow-y-auto overflow-x-hidden bg-white h-full w-full">
        <div className="w-full max-w-md space-y-6 animate-in fade-in duration-500 relative z-10 py-6">
          
          <div className="text-center lg:text-left">
            <a href={getLandingUrl('/')} className="flex items-center justify-center lg:justify-start space-x-3 mb-6 lg:hidden cursor-pointer">
              <img src="/rewardmate-logo-cropped.png" className="h-6 sm:h-7 w-auto object-contain brightness-0" alt="Reward Mate Logo" />
            </a>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Advertiser Account
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Onboard your brand to launch performance campaigns
            </p>

            {/* Step Indicators */}
            <div className="flex items-center justify-between mt-6 max-w-xs mx-auto lg:mx-0">
              <div className={`flex items-center space-x-1.5 text-xs font-bold ${step >= 1 ? 'text-[#0052FF]' : 'text-slate-400'}`}>
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-blue-100' : 'bg-slate-100'}`}>1</span>
                <span>Profile</span>
              </div>
              <div className="h-[1px] bg-slate-200 flex-1 mx-3" />
              <div className={`flex items-center space-x-1.5 text-xs font-bold ${step >= 2 ? 'text-[#0052FF]' : 'text-slate-400'}`}>
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-blue-100' : 'bg-slate-100'}`}>2</span>
                <span>Contact</span>
              </div>
              <div className="h-[1px] bg-slate-200 flex-1 mx-3" />
              <div className={`flex items-center space-x-1.5 text-xs font-bold ${step >= 3 ? 'text-[#0052FF]' : 'text-slate-400'}`}>
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-blue-100' : 'bg-slate-100'}`}>3</span>
                <span>Program</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            
            {/* STEP 1: Company Profile */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Company Legal Name *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. Acme Corporation Pty Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Trading Name (Optional)</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. Acme Store"
                      value={tradingName}
                      onChange={(e) => setTradingName(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">ABN / ACN Number *</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. 11 222 333 444"
                      value={abnNumber}
                      onChange={(e) => setAbnNumber(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Website URL *</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="url" 
                      placeholder="e.g. https://www.acmestore.com.au"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Primary Industry Category *</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 px-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                  >
                    <option value="retail">E-Commerce & Retail</option>
                    <option value="fashion">Fashion & Apparel</option>
                    <option value="finance">Finance & Insurance</option>
                    <option value="travel">Travel & Tourism</option>
                    <option value="tech">Software & Technology</option>
                    <option value="health">Health & Beauty</option>
                    <option value="other">Other / Multi-Category</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-[#0052FF] text-white font-bold h-12 rounded-xl text-sm flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/10 mt-6"
                >
                  Continue to Contact Info
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* STEP 2: Main Contact Information */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. Jane Smith"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Job Title / Position</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. Marketing Director"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Business Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="email" 
                      placeholder="e.g. marketing@acmestore.com.au"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="tel" 
                      placeholder="e.g. 02 9999 8888"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold h-12 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-[#0052FF] text-white font-bold h-12 rounded-xl text-sm flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/10"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Objectives & Password Configuration */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimated Monthly Marketing Budget</label>
                  <select 
                    value={monthlyBudget} 
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 px-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                  >
                    <option value="under_1000">Less than $1,000 / month</option>
                    <option value="1000_5000">$1,000 - $5,000 / month</option>
                    <option value="5000_20000">$5,000 - $20,000 / month</option>
                    <option value="over_20000">More than $20,000 / month</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Primary Target Region</label>
                  <select 
                    value={targetRegion} 
                    onChange={(e) => setTargetRegion(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 px-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                  >
                    <option value="australia">Australia / APAC (Primary)</option>
                    <option value="global">Global / International</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Create Account Password *</label>
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

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirm Account Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 pl-12 pr-12 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-3 pt-2">
                  <input 
                    type="checkbox"
                    id="agree"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0052FF] focus:ring-[#0052FF] mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="agree" className="text-xs text-slate-500 leading-normal select-none cursor-pointer">
                    I agree to the <span className="text-[#0052FF] hover:underline font-semibold">Reward Mate Advertiser Program Agreement</span> and authorize verification of our corporate entities.
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleBack}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold h-12 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-500 text-white font-bold h-12 rounded-xl text-sm flex items-center justify-center gap-1.5 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </form>

          {/* Toggle login link */}
          <div className="text-center text-sm font-semibold text-slate-500 pt-2 border-t border-slate-100">
            Already registered?{' '}
            <a href={getLandingUrl('/login')} className="text-[#0052FF] hover:underline">
              Sign in to Portal
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}
