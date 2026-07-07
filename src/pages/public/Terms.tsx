import { useState } from 'react';
import { getAppUrl } from '../../lib/domain';
import { ChevronDown, Search, Zap, Mic, BookOpen, HelpCircle, FileText } from 'lucide-react';
import { useSEO } from '../../hooks/useSEO';

export default function Terms() {
  useSEO({
    title: "Terms of Use | Reward Mate Australia",
    description: "Read the official website Terms of Use for Reward Mate Australia (ABN: 68 857 006 693). Understand the legal parameters, copyright restrictions, and user guidelines for our marketing platform.",
    noIndex: false
  });

  const [isResourcesOpen, setIsResourcesOpen] = useState(false);

  return (
    <div className="bg-white text-slate-800 font-sans selection:bg-blue-500/20 overflow-x-hidden">
      
      {/* Header (Matching Landing dark header styling) */}
      <header className="w-full bg-[#070913] py-5 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
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
          <div className="flex items-center space-x-4">
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
              Start Free
            </a>
          </div>
        </div>
      </header>

      {/* Main Title Section */}
      <section className="py-20 bg-slate-50 border-b border-slate-100 text-center">
        <div className="max-w-3xl mx-auto px-6 space-y-4">
          <p className="text-xs text-[#0052FF] font-bold uppercase tracking-wider">Legal Framework</p>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">Terms of Use</h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Welcome to Reward Mate. These terms govern your interaction with our public site and platform interfaces. Please review them carefully.
          </p>
          <p className="text-[10px] text-slate-400 font-bold">Last Updated: 07 July 2026</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Quick Menu */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 h-fit">
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-950 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#0052FF]" /> Document Index
              </h3>
              <ul className="space-y-3 text-xs font-bold text-slate-500">
                <li><a href="#permitted" className="hover:text-[#0052FF] transition-colors">1. Permitted Use</a></li>
                <li><a href="#prohibited" className="hover:text-[#0052FF] transition-colors">2. Prohibited Behavior</a></li>
                <li><a href="#ip" className="hover:text-[#0052FF] transition-colors">3. Copyrights & Trademarks</a></li>
                <li><a href="#user-materials" className="hover:text-[#0052FF] transition-colors">4. Your Submitted Materials</a></li>
                <li><a href="#limitations" className="hover:text-[#0052FF] transition-colors">5. Limitations of Liability</a></li>
                <li><a href="#governing-law" className="hover:text-[#0052FF] transition-colors">6. Governing Jurisdiction</a></li>
              </ul>
            </div>
          </div>

          {/* Legal Text */}
          <div className="lg:col-span-8 space-y-8 text-slate-650 text-sm leading-relaxed font-sans">
            
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-950">Overview of Terms</h2>
              <p>
                Welcome to our Website Terms of Use (“Terms of Use”) that govern your access to each website that links to these terms ("Site"). <strong>Reward Mate Australia (ABN: 68 857 006 693)</strong> (“Reward Mate,” “we,” “us,” or “our”) operates this Site to provide online access to information about Reward Mate and our performance tracking solutions, campaign management portals, and marketing opportunities.
              </p>
              <p>
                By accessing and using this Site, you explicitly agree to comply with these Terms of Use and our Privacy Policy. If you register or interact as a platform member, your activities are additionally governed by our Advertiser Standard Terms or Affiliate Standard Terms, depending on your role.
              </p>
              <p>
                We reserve the right to modify these Terms of Use at any time without prior notice. Your continued use of the Site following any updates constitutes agreement to follow and be bound by the modified Terms.
              </p>
            </div>

            <div id="permitted" className="space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-950">1. Permitted Use of the Site</h2>
              <p>
                You may use the Site, and the information, writing, images, and other materials you see, hear, or otherwise experience on the Site (singly or collectively, the "Content") solely for your non-commercial, personal purposes and to learn about Reward Mate performance tracking and affiliate solutions, and solely in compliance with these Terms.
              </p>
            </div>

            <div id="prohibited" className="space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-950">2. Prohibited Behavior</h2>
              <p>By accessing the Site, you agree that you will not:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Use the Site in violation of these Terms of Use or any applicable law;</li>
                <li>Copy, modify, create a derivative work from, reverse engineer, or reverse assemble the Site, or otherwise attempt to discover any source code;</li>
                <li>Sell, assign, sublicense, distribute, commercially exploit, or otherwise transfer any right in the Content or tracking software to third parties;</li>
                <li>Use or launch any automated systems, including without limitation "robots," "spiders," or "offline readers" that send more request messages to our servers in a given period of time than a human can reasonably produce;</li>
                <li>Mirror, frame, or embed any portion of the Site on other web pages or applications;</li>
                <li>Attempt to gain unauthorized access to the Reward Mate portals, database logs, or API interfaces;</li>
                <li>Use the Site for any purpose that is unlawful, defamatory, harassing, or harmful.</li>
              </ol>
            </div>

            <div id="ip" className="space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-950">3. Copyrights and Trademarks</h2>
              <p>
                The Site and its Content are protected by applicable intellectual property, copyright, and trademark laws. All intellectual property in the Site, technology, designs, and brand symbols belongs to Reward Mate. Except as explicitly permitted, you are prohibited from copying, publishing, transmitting, or distributing any content from this Site.
              </p>
              <p>
                Reward Mate owns all copyrights to our platform code, database design, and visual styling. Any suggestions, feature requests, or feedback you submit may be incorporated into the Site without obligation or payment to you.
              </p>
            </div>

            <div id="user-materials" className="space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-950">4. Your Submitted Materials</h2>
              <p>
                You represent that you have all right, title, and authority to any materials or application information you submit to Reward Mate. You warrant that your submitted details are accurate, not fictitious, do not infringe on third-party intellectual property, privacy, or publicity rights, and comply fully with our community rules.
              </p>
            </div>

            <div id="limitations" className="space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-950">5. Disclaimers & Limitations of Liability</h2>
              <p>
                REWARD MATE AND ITS PARTNERS MAKE NO REPRESENTATIONS ABOUT THE SUITABILITY, ACCURACY, RELIABILITY, OR TIMELINESS OF THE SITE OR CONTENT. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SITE AND ALL MATERIALS ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING THE WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
              </p>
              <p>
                IN NO EVENT SHALL REWARD MATE BE LIABLE FOR ANY DIRECT, INDIRECT, PUNITIVE, SPECIAL, OR CONSEQUENTIAL DAMAGES (INCLUDING LOSS OF DATA, PROFITS, OR REVENUE) ARISING FROM YOUR USE OF OR INABILITY TO USE THE SITE, WHETHER BASED ON CONTRACT, TORT, OR NEGLIGENCE. IN ALL CASES, THE TOTAL AGGREGATE LIABILITY OF REWARD MATE FOR ANY CLAIM SHALL BE LIMITED TO ONE HUNDRED AUSTRALIAN DOLLARS ($100 AUD).
              </p>
            </div>

            <div id="governing-law" className="space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-950">6. Governing Jurisdiction</h2>
              <p>
                These Terms of Use, your use of the Site, and any disputes relating to Reward Mate's services are governed by and will be interpreted in accordance with the laws of the State of New South Wales, Australia. You agree to submit to the exclusive jurisdiction of the state and federal courts located in Sydney, NSW, in the event of any legal dispute.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#0052FF_0%,transparent_50%)] opacity-30 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6">
          <h2 className="text-3xl font-extrabold">Ready to Partner With Reward Mate?</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
            Create an account today and leverage our secure wallet payout logic and tracking structures.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a 
              href={getAppUrl('/register/advertiser')}
              className="bg-[#0052FF] text-white font-bold h-12 px-8 rounded-full flex items-center justify-center hover:bg-blue-650 transition-all text-sm w-full sm:w-auto cursor-pointer"
            >
              Become an Advertiser
            </a>
            <a 
              href={getAppUrl('/register')}
              className="bg-transparent border border-white/20 text-white font-bold h-12 px-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-all text-sm w-full sm:w-auto cursor-pointer"
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
            <p className="text-xs text-slate-550 leading-relaxed max-w-sm">
              Australia's leading affiliate marketing platform. Connecting brands and partners across the Asia-Pacific region since 2026.
            </p>
            <div className="inline-block bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 px-3 py-1 rounded-full uppercase tracking-wider">
              ABN: 68 857 006 693
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
            <ul className="space-y-2.5 text-xs text-slate-505">
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
