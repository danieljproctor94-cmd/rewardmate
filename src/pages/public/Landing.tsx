import { useState } from 'react';
import { getAppUrl } from '../../lib/domain';
import { Check, ArrowRight, Star, Shield, TrendingUp, HelpCircle } from 'lucide-react';
import { useSEO } from '../../hooks/useSEO';

export default function Landing() {
  const [activeTab, setActiveTab] = useState<'publishers' | 'advertisers'>('publishers');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Reward Mate",
    "url": "https://rewardmate.com.au",
    "logo": "https://rewardmate.com.au/rewardmate-logo-cropped.png",
    "description": "Australia's leading affiliate marketing network connecting high-intent publishers with premier advertisers on a risk-free CPA basis.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AU"
    },
    "sameAs": [
      "https://twitter.com/rewardmate",
      "https://www.linkedin.com/company/rewardmate"
    ]
  };

  useSEO({
    title: "Reward Mate | Australia's Leading Affiliate & CPA Network",
    description: "Reward Mate connects premium Australian publishers with premier brands. Acquire customers on a 100% risk-free CPA affiliate basis or earn top revenues today.",
    schema
  });

  const faqs = [
    {
      q: "What is Reward Mate?",
      a: "Reward Mate is Australia's leading affiliate marketing network. We connect brands looking for risk-free sales (Advertisers) with creators, media buyers, and website owners (Publishers) who promote those brands for a commission."
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

      <header className="absolute top-10 sm:top-12 left-0 w-full z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src="/rewardmate-logo-cropped.png" className="h-6 sm:h-8 w-auto object-contain brightness-0 invert" alt="Reward Mate Logo" />
            </div>
            <nav className="hidden md:flex items-center space-x-8 text-sm font-bold text-white/90">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </nav>
          </div>
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
      </header>      {/* Dark Centered Hero Section */}
      <section className="relative bg-[#070913] text-white pt-40 pb-24 md:pt-48 md:pb-32 overflow-hidden">
        
        {/* Radial Glow Overlays (using brand digital blue) */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,#0052FF_0%,transparent_70%)] opacity-20 blur-[80px] pointer-events-none" />
        <div className="absolute top-[10%] right-0 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,#002699_0%,transparent_70%)] opacity-25 blur-[90px] pointer-events-none" />
        
        {/* Soft Background Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 space-y-8">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center space-x-2 bg-[#0052FF]/10 border border-[#0052FF]/20 rounded-full px-4.5 py-1.5 transition-all cursor-default mx-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
            <span className="text-[10px] sm:text-xs font-bold text-[#38bdf8] tracking-widest uppercase">Australia's Premier Affiliate Network</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Scale Your Performance.<br />
            <span className="bg-gradient-to-r from-[#38bdf8] via-[#0052FF] to-[#3b82f6] bg-clip-text text-transparent">Pay Only For Results.</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Connecting premium Australian advertisers with elite publishers. Drive risk-free sales, leads, and conversions with the country's most transparent tracking network.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a 
              href={getAppUrl('/register')}
              className="bg-[#0052FF] text-white font-bold h-12 px-8 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(0,82,255,0.3)] hover:shadow-[0_0_25px_rgba(0,82,255,0.5)] text-sm w-full sm:w-auto"
            >
              Start Earning Now &rarr;
            </a>
            <a 
              href={getAppUrl('/login')}
              className="bg-transparent border border-white/10 text-white font-bold h-12 px-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-all text-sm w-full sm:w-auto"
            >
              Simulate Sandbox Demo
            </a>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/5 pt-8" />

          {/* Bottom Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 text-center max-w-4xl mx-auto">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">5,000+</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active Affiliates</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">250+</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Premium Brands</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">$12M+</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Paid Commissions</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">99.9%</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Tracking Accuracy</div>
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
            <p className="text-slate-500">Everything you need to know about setting up and running Reward Mate.</p>
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
      <section className="py-24 relative overflow-hidden bg-[#0a0f24] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#0052FF_0%,transparent_50%)] opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#002699_0%,transparent_50%)] opacity-35 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="text-[10px] sm:text-xs font-black tracking-[0.2em] text-[#38bdf8] uppercase mb-4">
            Get Started Today
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Join the #1 Affiliate Marketing Platform in Australia
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-10 text-sm sm:text-base leading-relaxed">
            Start growing your business with affiliate marketing today.<br className="hidden sm:inline" />
            Thousands of advertisers and partners are already seeing results.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href={getAppUrl('/register?role=advertiser')}
              className="bg-[#0052FF] text-white font-bold h-12 px-8 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all hover:shadow-lg hover:shadow-blue-500/20 text-sm w-full sm:w-auto"
            >
              Become an Advertiser
            </a>
            <a 
              href={getAppUrl('/register?role=publisher')}
              className="bg-transparent border border-white/20 text-white font-bold h-12 px-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-all text-sm w-full sm:w-auto"
            >
              Become an Affiliate
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#05070f] text-slate-400 py-16 border-t border-white/5 font-sans relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
          
          {/* Logo & Description */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src="/rewardmate-logo-cropped.png" className="h-6 w-auto object-contain brightness-0 invert" alt="Reward Mate Logo" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Australia's leading affiliate marketing platform. Connecting brands and partners across the Asia-Pacific region since 2026.
            </p>
            <div className="inline-block bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 px-3 py-1 rounded-full uppercase tracking-wider">
              Australia's Performance Leader
            </div>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 hover:bg-white/5 hover:text-white transition-all">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </a>
              <a href="#" className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 hover:bg-white/5 hover:text-white transition-all">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a href="#" className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 hover:bg-white/5 hover:text-white transition-all">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 hover:bg-white/5 hover:text-white transition-all">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.52 3.545 12 3.545 12 3.545s-7.52 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.868.508 9.388.508 9.388.508s7.52 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Solutions Column */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Solutions</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li><a href={getAppUrl('/register?role=advertiser')} className="hover:text-white transition-colors">Advertisers</a></li>
              <li><a href={getAppUrl('/register?role=publisher')} className="hover:text-white transition-colors">Affiliate Partners</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Agencies</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Integration</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Features</a></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li><a href="#features" className="hover:text-white transition-colors">Advertiser Directory</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Agency Directory</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Product Releases</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Podcast</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li><a href="#" className="hover:text-white transition-colors">Who We Are</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Market Insights</a></li>
            </ul>
          </div>

          {/* Help Column */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Questions?</h4>
            <div className="space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Reach out for support, guidance, or any info about Reward Mate.
              </p>
              <a href="mailto:support@rewardmate.com.au" className="inline-flex items-center text-xs font-bold text-[#38bdf8] hover:text-[#0052FF] transition-all">
                Contact us &rarr;
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Reward Mate. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
