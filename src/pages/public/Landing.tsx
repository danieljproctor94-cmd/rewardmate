import { useState } from 'react';
import { getAppUrl } from '../../lib/domain';
import { Check, ArrowRight, Star, Shield, TrendingUp, HelpCircle, Layers } from 'lucide-react';

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
    <div className="glow-mesh-bg min-h-screen text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* Premium Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#0d0f17]/80 backdrop-blur-md border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Layers className="h-6 w-6 text-slate-900" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Reward<span className="text-emerald-400">Mate</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#payouts" className="hover:text-emerald-400 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center space-x-4">
            <a href={getAppUrl('/login')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Sign In
            </a>
            <a 
              href={getAppUrl('/register')}
              className="bg-emerald-500 text-slate-950 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 transition-all"
            >
              Join Free
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-36 overflow-hidden">
        {/* Glow Horizon */}
        <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[1200px] h-[300px] rounded-full opacity-50 blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.3) 0%, rgba(59,130,246,0.1) 50%, rgba(0,0,0,0) 80%)' }} />

        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          
          {/* Badge Pill */}
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-8 hover:bg-emerald-500/25 transition-all cursor-default">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-300 tracking-wide uppercase">Australia's Premier Affiliate Network</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-white mb-8 leading-[1.15]">
            Scale Your Performance.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 inline-block">
              Pay Only For Results.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Connecting premium Australian advertisers with elite publishers. Drive risk-free sales, leads, and conversions with the country's most transparent tracking network.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none px-4 sm:px-0">
            <a 
              href={getAppUrl('/register')}
              className="w-full sm:w-auto bg-emerald-500 text-slate-950 h-14 px-8 rounded-full text-base font-bold flex items-center justify-center hover:bg-emerald-400 hover:scale-[1.02] shadow-xl shadow-emerald-500/10 transition-all group"
            >
              Start Earning Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href={getAppUrl('/login')}
              className="w-full sm:w-auto bg-white/5 border border-white/10 text-white h-14 px-8 rounded-full text-base font-bold flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all"
            >
              Simulate Sandbox Demo
            </a>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-16 pt-12 border-t border-white/[0.05] grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-white">5,000+</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">Active Affiliates</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-white">250+</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">Premium Brands</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-white">$12M+</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">Paid Commissions</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-white">99.9%</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">Tracking Accuracy</div>
            </div>
          </div>

        </div>
      </section>

      {/* Tabs / Benefits Switcher */}
      <section id="features" className="py-24 border-t border-b border-white/[0.03] bg-[#0c0e16]/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Tailored for Your Growth</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Select whether you are a brand looking to acquire customers or a publisher seeking to monetize traffic.</p>
            
            {/* Tab Buttons */}
            <div className="inline-flex p-1 bg-slate-900 border border-white/[0.05] rounded-full mt-8">
              <button 
                onClick={() => setActiveTab('publishers')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'publishers' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                For Publishers
              </button>
              <button 
                onClick={() => setActiveTab('advertisers')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'advertisers' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                For Advertisers
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto mt-8">
            <div className="space-y-6">
              {activeTab === 'publishers' ? (
                <>
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">Monetize Your Traffic at High Payouts</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Partner with Australia's leading advertisers in retail, finance, utilities, and telecom. Access custom promo codes, unique links, and high CPA commissions.
                  </p>
                  <ul className="space-y-3.5">
                    {[
                      "Weekly payouts in AUD with low minimum threshold",
                      "Instant, easy-to-use custom link generator",
                      "Dynamic tracking engine ensuring 100% payout credit",
                      "Free support and expert affiliate management guidance"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-3 text-sm text-slate-300">
                        <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">Pay Only for Sales and Conversions</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Eliminate risk. Stop buying impressions or unverified clicks. Choose your payout structure (CPA, CPC, or RevShare) and pay only for completed sales.
                  </p>
                  <ul className="space-y-3.5">
                    {[
                      "Custom campaign constructor with real-time budget controls",
                      "Direct access to top Australian publishers and creators",
                      "Built-in fraud detection filter protecting your budget",
                      "Comprehensive dashboards showing spend, ROI, and EPC"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-3 text-sm text-slate-300">
                        <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Premium Visual Card */}
            <div className="premium-glow-panel p-8 flex flex-col justify-between min-h-[350px]">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <Star className="h-4 w-4 text-emerald-400" />
                    <span>Real-time Dashboard</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full px-3 py-1">
                    Live Feed
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-900/80 border border-white/[0.03] rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-xs">
                        AMEX
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">American Express Gold</div>
                        <div className="text-xs text-slate-500">Financial Offer • Active</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">$150.00 Payout</div>
                      <div className="text-xs text-slate-500">per conversion</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-900/80 border border-white/[0.03] rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-blue-400 text-xs">
                        OE
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Origin Energy Connection</div>
                        <div className="text-xs text-slate-500">Utility Offer • Active</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">$75.00 Payout</div>
                      <div className="text-xs text-slate-500">per connection</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/[0.05] mt-6 flex justify-between items-center">
                <div>
                  <div className="text-xs text-slate-500">Estimated Network EPC</div>
                  <div className="text-lg font-bold text-white">$1.84 AUD</div>
                </div>
                <a href={getAppUrl('/login')} className="text-emerald-400 text-sm font-bold hover:text-emerald-300 flex items-center gap-1">
                  View network offers <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Transparent Pricing Model</h2>
            <p className="text-slate-400 max-w-xl mx-auto">No setup fees or hidden surprises. Choose the path that matches your scaling speed.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Publisher Plan */}
            <div className="premium-glass-panel p-8 flex flex-col justify-between">
              <div>
                <div className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2">Publishers</div>
                <div className="text-3xl font-bold text-white mb-4">Always Free</div>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Monetize your blog, newsletter, social channels, or comparison portals. Zero platform usage fees.
                </p>
                <div className="border-t border-white/[0.05] pt-6 space-y-4">
                  <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Access all active campaigns</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Instant click tracking token</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Weekly payout withdrawals</span>
                  </div>
                </div>
              </div>
              <a 
                href={getAppUrl('/register?role=publisher')}
                className="mt-8 w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 py-3 rounded-full text-center font-bold text-sm transition-all"
              >
                Join as Publisher
              </a>
            </div>

            {/* Advertiser Basic */}
            <div className="premium-glow-panel p-8 flex flex-col justify-between scale-[1.02]">
              <div>
                <div className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2">Advertiser Standard</div>
                <div className="text-3xl font-bold text-white mb-4">5% Commission</div>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Start listing campaigns instantly. Pay a small 5% network fee strictly on approved tracked conversions.
                </p>
                <div className="border-t border-white/[0.05] pt-6 space-y-4">
                  <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Unlimited active offers</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Fraud protection system</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Wallet payout balance management</span>
                  </div>
                </div>
              </div>
              <a 
                href={getAppUrl('/register?role=advertiser')}
                className="mt-8 w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 py-3 rounded-full text-center font-bold text-sm transition-all"
              >
                Start Listing Campaigns
              </a>
            </div>

            {/* Advertiser Premium */}
            <div className="premium-glass-panel p-8 flex flex-col justify-between">
              <div>
                <div className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2">Advertiser Enterprise</div>
                <div className="text-3xl font-bold text-white mb-4">2.5% Commission</div>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  For large brands spending &gt; $10k per month. Discounted commission and custom support tools.
                </p>
                <div className="border-t border-white/[0.05] pt-6 space-y-4">
                  <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Dedicated account manager</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>API conversion triggers</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Custom publisher recruitment</span>
                  </div>
                </div>
              </div>
              <a 
                href={getAppUrl('/register?role=advertiser')}
                className="mt-8 w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 py-3 rounded-full text-center font-bold text-sm transition-all"
              >
                Inquire Enterprise
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-white/[0.03] bg-[#0c0e16]/30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400">Everything you need to know about setting up and running RewardMate.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-[#151926]/40 border border-white/[0.03] rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 text-left font-bold text-white flex justify-between items-center hover:bg-white/5 transition-all"
                >
                  <span>{faq.q}</span>
                  <HelpCircle className={`h-5 w-5 text-emerald-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-sm text-slate-400 leading-relaxed border-t border-white/[0.03] pt-4 animate-in fade-in duration-300">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0d0f17] pointer-events-none" />
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full opacity-20 blur-[100px] pointer-events-none bg-emerald-500" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">Ready to scale your affiliate growth?</h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-10 text-base md:text-lg">
            Join Australia's most transparent performance network today. Sign up takes less than 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href={getAppUrl('/register')}
              className="bg-emerald-500 text-slate-950 font-bold h-14 px-8 rounded-full flex items-center justify-center hover:bg-emerald-400 transition-all hover:scale-[1.02] shadow-xl shadow-emerald-500/10"
            >
              Get Started for Free
            </a>
            <a 
              href={getAppUrl('/login')}
              className="bg-white/5 border border-white/10 text-white font-bold h-14 px-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
            >
              Sign In as Existing User
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/[0.05] bg-[#090b12]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <div className="flex items-center space-x-2 mb-6 md:mb-0">
            <Layers className="h-5 w-5 text-emerald-400" />
            <span className="font-bold text-white">RewardMate</span>
            <span className="text-slate-600">| Australia's Affiliate Leader</span>
          </div>
          <div className="flex space-x-6">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href={getAppUrl('/login')} className="hover:text-white transition-colors">Portal Login</a>
          </div>
          <div className="mt-6 md:mt-0">
            &copy; {new Date().getFullYear()} RewardMate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
