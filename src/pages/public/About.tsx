import { useState } from 'react';
import { getAppUrl } from '../../lib/domain';
import { Shield, Award, ChevronDown, Search, Zap, Mic, BookOpen, HelpCircle, Menu, X } from 'lucide-react';
import { useSEO } from '../../hooks/useSEO';

export default function About() {
  useSEO({
    title: "Who We Are | Reward Mate Australia",
    description: "Learn about the mission, values, and team behind Reward Mate, Australia's independent performance marketing and CPA affiliate network.",
    noIndex: false
  });

  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
 
            <a href="/about" className="transition-all bg-white/10 text-white py-1.5 px-3.5 rounded-full">Who we are</a>
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
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Who We Are</h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Pioneering a fairer, more transparent performance marketing ecosystem for independent Australian brands and elite publishers.
          </p>
        </div>
      </section>

      {/* Our Mission & Numbers */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
              Reimagining Affiliate Marketing Down Under
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Reward Mate was founded with a singular purpose: to challenge the status quo of affiliate networks. Traditional networks are built on legacy tracking systems, hidden platform fees, and delayed payouts. We set out to change that by delivering real-time wallet payout logic and robust, first-party cookie technology.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Today, we connect premium Australian advertisers with elite content publishers, bloggers, loyalty systems, and growth agencies. We work strictly on a risk-free cost-per-acquisition model—meaning brands only pay when they get conversions, and publishers get credited instantly.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm grid grid-cols-2 gap-6">
            <div className="space-y-1.5 p-4 border-r border-b border-slate-100 text-center lg:text-left">
              <div className="text-3xl font-black text-[#0052FF]">2026</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Founded</div>
            </div>
            <div className="space-y-1.5 p-4 border-b border-slate-100 text-center lg:text-left">
              <div className="text-3xl font-black text-[#0052FF]">10,000+</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Publishers</div>
            </div>
            <div className="space-y-1.5 p-4 border-r border-slate-100 text-center lg:text-left">
              <div className="text-3xl font-black text-[#0052FF]">1.2M+</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Referrals Tracked</div>
            </div>
            <div className="space-y-1.5 p-4 text-center lg:text-left">
              <div className="text-3xl font-black text-[#0052FF]">100%</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">CPA Risk-Free</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900">Our Core Principles</h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
              Our growth is anchored on three foundational values that ensure trust, technology, and local alignment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 space-y-4">
              <div className="h-10 w-10 bg-blue-100 rounded-2xl flex items-center justify-center text-[#0052FF]">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">Transparency First</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                We believe in zero hidden fees, clear campaign guidelines, and fully accessible referral tracking audit trails for both brands and publishers.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 space-y-4">
              <div className="h-10 w-10 bg-blue-100 rounded-2xl flex items-center justify-center text-[#0052FF]">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">Technology Driven</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                By designing first-party cookie code and automated ledger balance reconciliations, we keep tracking online and payouts faster.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 space-y-4">
              <div className="h-10 w-10 bg-blue-100 rounded-2xl flex items-center justify-center text-[#0052FF]">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">Supporting Australian Business</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                As a Queensland-owned and operated network, we dedicate support lines to regional brands and local content publishers trying to build business locally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-[#0a0f24] text-white relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#0052FF_0%,transparent_50%)] opacity-30 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6">
          <h2 className="text-3xl font-extrabold">Ready to Partner With Reward Mate?</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
            Create an account today and leverage our secure wallet payout logic and tracking structures.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a 
              href={getAppUrl('/register/advertiser')}
              className="bg-[#0052FF] text-white font-bold h-12 px-8 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all text-sm w-full sm:w-auto"
            >
              Become an Advertiser
            </a>
            <a 
              href={getAppUrl('/register')}
              className="bg-transparent border border-white/20 text-white font-bold h-12 px-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-all text-sm w-full sm:w-auto"
            >
              Become an Affiliate
            </a>
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
