import { useState } from 'react';
import { getAppUrl } from '../../lib/domain';
import { Check, ArrowRight, Star, Shield, TrendingUp, HelpCircle } from 'lucide-react';

export default function Landing() {
  const [activeTab, setActiveTab] = useState<'publishers' | 'advertisers'>('publishers');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is RewardMate?",
      a: "RewardMate is Australia's leading affiliate marketing network. We connect brands looking for risk-free sales (Advertisers) with creators, media buyers, and website owners (Publishers) who promote those brands for a commission."
    },
    {
      q: "How does the tracking work?",
      a: "Our advanced tracking engine records unique affiliate codes when customers click publishers' links. If a click converts into a sale or lead, our system logs the transaction and payouts are processed instantly."
    },
    {
      q: "Is there a signup fee for Publishers?",
      a: "No, joining as a publisher is 100% free. Publishers are paid directly for the traffic and sales they generate, with weekly withdrawals available."
    },
    {
      q: "How do Advertisers pay?",
      a: "Advertisers set up a campaign budget and deposit funds into their wallet. They only pay when a conversion (e.g. sale, subscription, or qualified lead) is successfully tracked. No setup fees, no risks."
    }
  ];

  return (
    <div className="bg-white text-slate-800 font-sans selection:bg-blue-500/20 overflow-x-hidden">
      
      {/* Top Banner (Revolut Announcement style) */}
      <div className="bg-[#0047FF] text-white text-center py-2 px-4 text-[10px] sm:text-xs font-bold tracking-wide flex items-center justify-center gap-1 z-[60] relative">
        <span className="hidden sm:inline">Australia's premier performance affiliate network.</span>
        <span className="sm:hidden">Australia's leading affiliate network.</span>
        <a href={getAppUrl('/register')} className="underline hover:text-blue-100 transition-colors flex items-center gap-0.5 ml-1">
          Open account →
        </a>
      </div>

      {/* Premium Header */}
      <header className="absolute top-2 sm:top-6 left-0 w-full z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/rewardmate-logo-cropped.png" className="h-6 sm:h-8 w-auto object-contain brightness-0 invert" alt="RewardMate Logo" />
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-bold text-white/90">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <a href={getAppUrl('/login')} className="text-xs sm:text-sm font-bold text-white/90 hover:text-white transition-colors">
              Login
            </a>
            <a 
              href={getAppUrl('/register')}
              className="bg-white text-[#0052FF] px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold hover:bg-white/95 hover:shadow-xl transition-all"
            >
              Register
            </a>
          </div>
        </div>
      </header>

      {/* Revolut Style Hero Section */}
      <section className="relative bg-gradient-to-tr from-[#0038FF] via-[#0052FF] to-[#3b82f6] text-white pt-36 pb-24 md:pt-48 md:pb-40 overflow-hidden">
        
        {/* Soft Background Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-6">
            
            <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 hover:bg-white/15 transition-all cursor-default w-fit">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-white tracking-wider uppercase">Australia's leading affiliate network</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
              Affiliate marketing<br />
              <span className="text-white/80">and much more</span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 max-w-xl leading-relaxed">
              Whether you are at home or on the go, let RewardMate exceed your performance expectations. Drive risk-free sales or monetize your traffic with a tap.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a 
                href={getAppUrl('/register')}
                className="bg-slate-950 text-white h-12 px-8 rounded-full text-sm font-bold flex items-center justify-center hover:bg-slate-900 hover:scale-[1.02] shadow-xl transition-all"
              >
                Join RewardMate
              </a>
              <a 
                href={getAppUrl('/login')}
                className="bg-white/10 border border-white/20 text-white h-12 px-8 rounded-full text-sm font-bold flex items-center justify-center hover:bg-white/20 hover:border-white/30 transition-all"
              >
                Simulate Sandbox Demo
              </a>
            </div>
          </div>

          {/* Right Phone Mockup Column */}
          <div className="lg:col-span-5 flex justify-center items-center relative py-6">
            {/* Phone Container */}
            <div className="relative w-[300px] aspect-[9/18] rounded-[48px] border-[5px] border-white/40 shadow-2xl p-1 bg-slate-950 flex flex-col justify-between overflow-hidden">
              {/* Camera Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-4.5 bg-black rounded-full z-20" />
              
              {/* Partner Portrait Image */}
              <img 
                src="/hero_partner_portrait.png" 
                className="absolute inset-0 w-full h-full object-cover rounded-[38px] z-0 pointer-events-none" 
                alt="RewardMate Partner Portrait"
              />

              {/* Revolut Payout Stats Overlay Card */}
              <div className="absolute bottom-8 left-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-[28px] p-5 text-white flex flex-col items-center shadow-2xl z-10">
                <div className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-1">Personal</div>
                <div className="text-3xl font-black text-white tracking-tight mb-3">6012 $</div>
                <a 
                  href={getAppUrl('/login')}
                  className="bg-white text-[#0052FF] font-bold text-xs px-6 py-2 rounded-full shadow-lg hover:bg-white/95 transition-colors"
                >
                  Payouts
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Partner Logos */}
      <section id="logos-section" className="py-12 border-b border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">Trusted by Australia's biggest performance brands</p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-60 grayscale hover:opacity-85 transition-opacity">
            <div className="text-lg font-black text-slate-800 tracking-tighter">AMEX</div>
            <div className="text-lg font-black text-slate-800 tracking-tighter">Origin Energy</div>
            <div className="text-lg font-black text-slate-800 tracking-tighter">Canva</div>
            <div className="text-lg font-black text-slate-800 tracking-tighter">Afterpay</div>
          </div>
        </div>
      </section>

      {/* Tabs / Benefits Switcher */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Tailored for Your Growth</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Select whether you are a brand looking to acquire customers or a publisher seeking to monetize traffic.</p>
            
            {/* Switcher Tab Buttons */}
            <div className="inline-flex p-1 bg-slate-100 border border-slate-200/50 rounded-full mt-8">
              <button 
                onClick={() => setActiveTab('publishers')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'publishers' ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                For Publishers
              </button>
              <button 
                onClick={() => setActiveTab('advertisers')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'advertisers' ? 'bg-[#0052FF] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                For Advertisers
              </button>
            </div>
          </div>

          {/* Tab Content Grid */}
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto mt-8">
            <div className="space-y-6">
              {activeTab === 'publishers' ? (
                <>
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-[#0052FF]" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Monetize Your Traffic at High Payouts</h3>
                  <p className="text-slate-500 leading-relaxed">
                    Partner with Australia's leading advertisers in retail, finance, utilities, and telecom. Access custom promo codes, unique links, and high CPA commissions.
                  </p>
                  <ul className="space-y-3.5">
                    {[
                      "Weekly payouts in AUD with low minimum threshold",
                      "Instant, easy-to-use custom link generator",
                      "Dynamic tracking engine ensuring 100% payout credit",
                      "Free support and expert affiliate management guidance"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-3 text-sm text-slate-600">
                        <Check className="h-5 w-5 text-[#0052FF] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-[#0052FF]" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Pay Only for Sales and Conversions</h3>
                  <p className="text-slate-500 leading-relaxed">
                    Eliminate risk. Stop buying impressions or unverified clicks. Choose your payout structure (CPA, CPC, or RevShare) and pay only for completed sales.
                  </p>
                  <ul className="space-y-3.5">
                    {[
                      "Custom campaign constructor with real-time budget controls",
                      "Direct access to top Australian publishers and creators",
                      "Built-in fraud detection filter protecting your budget",
                      "Comprehensive dashboards showing spend, ROI, and EPC"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-3 text-sm text-slate-600">
                        <Check className="h-5 w-5 text-[#0052FF] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Live Feed Demo Card */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 flex flex-col justify-between min-h-[350px] shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <Star className="h-4 w-4 text-[#0052FF]" />
                    <span>Real-time Dashboard</span>
                  </div>
                  <div className="bg-blue-50 text-[#0052FF] text-xs font-bold rounded-full px-3 py-1">
                    Live Feed
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-black text-[#0052FF] text-xs">
                        AMEX
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">American Express Gold</div>
                        <div className="text-xs text-slate-500">Financial Offer • Active</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#0052FF]">$150.00 Payout</div>
                      <div className="text-xs text-slate-400">per conversion</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-black text-emerald-600 text-xs">
                        OE
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">Origin Energy Connection</div>
                        <div className="text-xs text-slate-500">Utility Offer • Active</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-600">$75.00 Payout</div>
                      <div className="text-xs text-slate-400">per connection</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6 flex justify-between items-center">
                <div>
                  <div className="text-xs text-slate-400">Estimated Network EPC</div>
                  <div className="text-lg font-bold text-slate-800">$1.84 AUD</div>
                </div>
                <a href={getAppUrl('/login')} className="text-[#0052FF] text-sm font-bold hover:text-blue-700 flex items-center gap-1">
                  View network offers <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-50 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Transparent Pricing Model</h2>
            <p className="text-slate-500 max-w-xl mx-auto">No setup fees or hidden surprises. Choose the path that matches your scaling speed.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Publisher Plan */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
              <div>
                <div className="text-[#0052FF] text-sm font-bold uppercase tracking-wider mb-2">Publishers</div>
                <div className="text-3xl font-extrabold text-slate-900 mb-4">Always Free</div>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Monetize your blog, newsletter, social channels, or comparison portals. Zero platform usage fees.
                </p>
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-[#0052FF] shrink-0" />
                    <span>Access all active campaigns</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-[#0052FF] shrink-0" />
                    <span>Instant click tracking token</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-[#0052FF] shrink-0" />
                    <span>Weekly payout withdrawals</span>
                  </div>
                </div>
              </div>
              <a 
                href={getAppUrl('/register?role=publisher')}
                className="mt-8 w-full bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 py-3 rounded-full text-center font-bold text-sm transition-all"
              >
                Join as Publisher
              </a>
            </div>

            {/* Advertiser Standard (Popular) */}
            <div className="bg-white border-2 border-[#0052FF] rounded-3xl p-8 flex flex-col justify-between shadow-md relative scale-[1.02] z-10">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#0052FF] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Popular
              </div>
              <div>
                <div className="text-[#0052FF] text-sm font-bold uppercase tracking-wider mb-2">Advertiser Standard</div>
                <div className="text-3xl font-extrabold text-slate-900 mb-4">5% Commission</div>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Start listing campaigns instantly. Pay a small 5% network fee strictly on approved tracked conversions.
                </p>
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-[#0052FF] shrink-0" />
                    <span>Unlimited active offers</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-[#0052FF] shrink-0" />
                    <span>Fraud protection system</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-[#0052FF] shrink-0" />
                    <span>Wallet payout balance management</span>
                  </div>
                </div>
              </div>
              <a 
                href={getAppUrl('/register?role=advertiser')}
                className="mt-8 w-full bg-[#0052FF] text-white hover:bg-blue-700 py-3 rounded-full text-center font-bold text-sm transition-all"
              >
                Start Listing Campaigns
              </a>
            </div>

            {/* Advertiser Premium */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
              <div>
                <div className="text-[#0052FF] text-sm font-bold uppercase tracking-wider mb-2">Advertiser Enterprise</div>
                <div className="text-3xl font-extrabold text-slate-900 mb-4">2.5% Commission</div>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  For large brands spending &gt; $10k per month. Discounted commission and custom support tools.
                </p>
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-[#0052FF] shrink-0" />
                    <span>Dedicated account manager</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-[#0052FF] shrink-0" />
                    <span>API conversion triggers</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-[#0052FF] shrink-0" />
                    <span>Custom publisher recruitment</span>
                  </div>
                </div>
              </div>
              <a 
                href={getAppUrl('/register?role=advertiser')}
                className="mt-8 w-full bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 py-3 rounded-full text-center font-bold text-sm transition-all"
              >
                Inquire Enterprise
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500">Everything you need to know about setting up and running RewardMate.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 text-left font-bold text-slate-800 flex justify-between items-center hover:bg-slate-50 transition-all"
                >
                  <span>{faq.q}</span>
                  <HelpCircle className={`h-5 w-5 text-[#0052FF] transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4 animate-in fade-in duration-300">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-tr from-[#0038FF] via-[#0052FF] to-[#3b82f6] text-white">
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">Ready to scale your affiliate growth?</h2>
          <p className="text-white/80 max-w-lg mx-auto mb-10 text-base md:text-lg">
            Join Australia's most transparent performance network today. Sign up takes less than 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href={getAppUrl('/register')}
              className="bg-white text-[#0052FF] font-bold h-14 px-8 rounded-full flex items-center justify-center hover:bg-white/95 transition-all shadow-xl"
            >
              Get Started for Free
            </a>
            <a 
              href={getAppUrl('/login')}
              className="bg-transparent border border-white/30 text-white font-bold h-14 px-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
            >
              Sign In as Existing User
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-slate-50 text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <img src="/rewardmate-logo-cropped.png" className="h-7 w-auto object-contain" alt="RewardMate Logo" />
            <span className="text-slate-400 text-xs">| Australia's Affiliate Leader</span>
          </div>
          <div className="flex space-x-6">
            <a href="#features" className="hover:text-[#0052FF] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#0052FF] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#0052FF] transition-colors">FAQ</a>
            <a href={getAppUrl('/login')} className="hover:text-[#0052FF] transition-colors">Portal Login</a>
          </div>
          <div className="mt-6 md:mt-0">
            &copy; {new Date().getFullYear()} RewardMate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
