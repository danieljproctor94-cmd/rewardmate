import { useState } from 'react';
import { getAppUrl } from '../../lib/domain';
import { Mail, Phone, MapPin, Clock, Send, ChevronDown, Search, Zap, Mic, BookOpen, HelpCircle, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSEO } from '../../hooks/useSEO';
import { saveContactInquiry } from '../../lib/mockDatabase';

export default function Contact() {
  useSEO({
    title: "Contact Us | Reward Mate Australia",
    description: "Get in touch with the Reward Mate affiliate support team. Submit inquiries regarding advertisers, publishers, API systems, or local partner support.",
    noIndex: false
  });

  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [inquiryType, setInquiryType] = useState('advertiser');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSending(true);
    try {
      await saveContactInquiry({
        full_name: fullName,
        email: email,
        phone: phone || '',
        company: company || '',
        inquiry_type: inquiryType,
        message: message
      });
      toast.success('Your message has been sent successfully! Our team will contact you within 24 business hours.');
      // Reset form
      setFullName('');
      setEmail('');
      setPhone('');
      setCompany('');
      setInquiryType('advertiser');
      setMessage('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white text-slate-800 font-sans selection:bg-blue-500/20 overflow-x-hidden">
      
      {/* Header (Matching Landing dark header styling) */}
      <header className="w-full bg-[#070913] py-5 border-b border-white/5 relative z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between relative">
          <a href="/" className="flex items-center cursor-pointer">
            <img 
              src="/rewardmate-logo-cropped.png" 
              className="h-6 sm:h-8 w-auto object-contain brightness-0 invert" 
              alt="Reward Mate Logo" 
            />
          </a>
          <nav className="hidden md:flex items-center space-x-3 text-sm font-bold text-white/90">
            <a href="/#features" className="transition-all hover:bg-white/10 hover:text-white py-1.5 px-3.5 rounded-full">Features</a>
            <a href="/#pricing" className="transition-all hover:bg-white/10 hover:text-white py-1.5 px-3.5 rounded-full">Pricing</a>
            
            {/* Resources Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                className={`flex items-center gap-1 py-1.5 px-3.5 rounded-full text-sm font-bold transition-all ${
                  isResourcesOpen ? 'bg-white/10 text-white' : 'hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>Resources</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isResourcesOpen ? 'rotate-180' : ''}`} />
              </button>
 
              {/* Dropdown Box */}
              {isResourcesOpen && (
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-80 bg-white text-slate-800 rounded-3xl p-5 shadow-2xl border border-slate-100 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-4 text-left">
                    <a href="/#features" onClick={() => setIsResourcesOpen(false)} className="flex items-start gap-4.5 p-2 rounded-2xl hover:bg-slate-50 transition-colors group">
                      <Search className="h-5 w-5 text-[#0052FF] shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#0052FF] transition-colors">Advertiser directory</h4>
                        <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">Search and connect with brands across every industry.</p>
                      </div>
                    </a>
                    <a href="/#features" onClick={() => setIsResourcesOpen(false)} className="flex items-start gap-4.5 p-2 rounded-2xl hover:bg-slate-50 transition-colors group">
                      <Zap className="h-5 w-5 text-[#0052FF] shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#0052FF] transition-colors">Product releases</h4>
                        <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">Stay informed with our latest platform innovations and updates.</p>
                      </div>
                    </a>
                    <a href="#" onClick={() => setIsResourcesOpen(false)} className="flex items-start gap-4.5 p-2 rounded-2xl hover:bg-slate-50 transition-colors group">
                      <Mic className="h-5 w-5 text-[#0052FF] shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#0052FF] transition-colors">Podcast</h4>
                        <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">Practical affiliate marketing advice and industry insights.</p>
                      </div>
                    </a>
                    <a href="/#faq" onClick={() => setIsResourcesOpen(false)} className="flex items-start gap-4.5 p-2 rounded-2xl hover:bg-slate-50 transition-colors group">
                      <HelpCircle className="h-5 w-5 text-[#0052FF] shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#0052FF] transition-colors">FAQ</h4>
                        <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">Get quick answers about Reward Mate and affiliate best practices.</p>
                      </div>
                    </a>
                    <a href="#" onClick={() => setIsResourcesOpen(false)} className="flex items-start gap-4.5 p-2 rounded-2xl hover:bg-slate-50 transition-colors group">
                      <BookOpen className="h-5 w-5 text-[#0052FF] shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#0052FF] transition-colors">Market Insights</h4>
                        <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">Expert affiliate marketing insights and industry trends.</p>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>
 
            <a href="/about" className="transition-all hover:bg-white/10 hover:text-white py-1.5 px-3.5 rounded-full">Who we are</a>
          </nav>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden sm:flex items-center space-x-3 sm:space-x-4">
              <a 
                href={getAppUrl('/login')} 
                className="border border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm"
              >
                Login
              </a>
              <a 
                href={getAppUrl('/register')}
                className="bg-white text-black hover:bg-white/95 px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm"
              >
                Register
              </a>
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label="Open Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Dropdown Navigation Menu (Floating card drops down from header) */}
          {mobileMenuOpen && (
            <div className="absolute top-16 sm:top-20 left-6 right-6 sm:left-8 sm:right-8 bg-[#090b16]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-2xl flex flex-col space-y-6 md:hidden animate-in fade-in slide-in-from-top-4 duration-200 z-[100] text-white overflow-hidden">
              {/* Purple/Violet radial glow gradient */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[240px] h-[100px] rounded-full bg-[radial-gradient(circle,#8b5cf6_0%,transparent_70%)] opacity-30 blur-xl pointer-events-none" />

              <nav className="flex flex-col space-y-5 relative z-10 text-left">
                <a 
                  href="/#features" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors"
                >
                  Features
                </a>
                <a 
                  href="/#pricing" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors"
                >
                  Pricing
                </a>
                <a 
                  href="/about" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors"
                >
                  Who we are
                </a>
                <a 
                  href="/#faq" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors"
                >
                  FAQ
                </a>
              </nav>

              {/* Login & Register */}
              <div className="pt-6 border-t border-white/5 flex flex-col space-y-3 relative z-10">
                <a 
                  href={getAppUrl('/register')}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-white hover:bg-white/90 text-black py-3.5 rounded-full font-bold text-center transition-all shadow-lg flex items-center justify-center text-sm"
                >
                  Register
                </a>
                <a 
                  href={getAppUrl('/login')}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full border border-white/20 hover:border-white/40 text-white py-3.5 rounded-full font-bold text-center transition-all flex items-center justify-center text-sm"
                >
                  Log in
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Header */}
      <section className="bg-[#070913] text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,#0052FF_0%,transparent_70%)] opacity-20 blur-[80px]" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Contact Our Team</h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Have questions about integrations, CPA structures, or publisher onboarding? We're here to help.
          </p>
        </div>
      </section>

      {/* Main Grid Contact Information & Form */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-slate-900">Get in Touch</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Whether you're an advertiser looking to launch, a publisher seeking premium offers, or need technical campaign assistance, our Queensland-based team is ready to support you.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-blue-100 rounded-2xl flex items-center justify-center text-[#0052FF] shrink-0 mt-1">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Headquarters & Corporate Details</h4>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5 leading-relaxed">
                    Noosaville QLD<br />
                    REWARD MATE PTY LTD<br />
                    ACN: 700 041 676
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-blue-100 rounded-2xl flex items-center justify-center text-[#0052FF] shrink-0 mt-1">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Email Inquiries</h4>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                    <a href="mailto:support@rewardmate.com.au" className="text-[#0052FF] hover:underline font-medium">support@rewardmate.com.au</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-blue-100 rounded-2xl flex items-center justify-center text-[#0052FF] shrink-0 mt-1">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Direct Support</h4>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5 leading-relaxed">
                    5450 2766
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-blue-100 rounded-2xl flex items-center justify-center text-[#0052FF] shrink-0 mt-1">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Operating Hours</h4>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5 leading-relaxed">
                    Monday &ndash; Friday, 9:00 AM &ndash; 5:00 PM AEST<br />
                    Excluding QLD public holidays.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm">
            <h3 className="text-xl font-extrabold text-slate-900 mb-6">Send an Online Inquiry</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name *</label>
                  <input 
                    type="text" 
                    placeholder=""
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 px-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Business Email *</label>
                  <input 
                    type="email" 
                    placeholder=""
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 px-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder=""
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 px-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Company Name</label>
                  <input 
                    type="text" 
                    placeholder=""
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 px-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Inquiry Type *</label>
                <select 
                  value={inquiryType} 
                  onChange={(e) => setInquiryType(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl h-12 px-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all"
                >
                  <option value="advertiser">Advertiser / Brand onboarding query</option>
                  <option value="publisher">Publisher / Affiliate partnership inquiry</option>
                  <option value="technical">API & Tracking setup support</option>
                  <option value="billing">Wallet deposits & billing support</option>
                  <option value="other">Other general inquiry</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Message details *</label>
                <textarea 
                  placeholder=""
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0052FF] focus:bg-white transition-all resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-[#0052FF] text-white font-bold h-12 rounded-xl text-sm flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/10 disabled:opacity-50 mt-2"
              >
                {sending ? (
                  <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Inquiry
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* Footer (Matching Landing page footer) */}
      <footer className="bg-[#05070f] text-slate-400 py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
          
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src="/rewardmate-logo-cropped.png" className="h-6 w-auto object-contain brightness-0 invert" alt="Reward Mate Logo" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Australia's independent affiliate marketing platform. Connecting brands and partners across the Asia-Pacific region since 2026.
            </p>
            <div className="inline-block bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 px-3 py-1 rounded-full uppercase tracking-wider">
              Australia's Performance Network
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Solutions</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li><a href={getAppUrl('/register/advertiser')} className="hover:text-white transition-colors">Advertisers</a></li>
              <li><a href={getAppUrl('/register?role=publisher')} className="hover:text-white transition-colors">Affiliate Partners</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Agencies</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li><a href="/#features" className="hover:text-white transition-colors">Advertiser Directory</a></li>
              <li><a href="/#features" className="hover:text-white transition-colors">Agency Directory</a></li>
              <li><a href="/#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li><a href="/about" className="hover:text-white transition-colors">Who We Are</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Questions?</h4>
            <div className="space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Reach out for support, guidance, or any info about Reward Mate.
              </p>
              <a href="/contact" className="inline-flex items-center text-xs font-bold text-[#38bdf8] hover:text-[#0052FF] transition-all">
                Contact us &rarr;
              </a>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Reward Mate. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </footer>
      
    </div>
  );
}
