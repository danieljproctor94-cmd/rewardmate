import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { isAppDomain } from './lib/domain';
import { useAuth } from './contexts/AuthContext';
import { getCampaigns, logClick } from './lib/mockDatabase';
import { Toaster, toast } from 'sonner';

import Landing from './pages/public/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdvertiserRegister from './pages/AdvertiserRegister';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Terms from './pages/public/Terms';

export default function App() {
  const { isAuthenticated, loading, isImpersonating, stopImpersonating, profile } = useAuth();
  const isApp = isAppDomain();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0d0f17] text-white">
        <div className="h-8 w-8 rounded-full border-4 border-[#0052FF]/30 border-t-[#0052FF] animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {isImpersonating && (
        <div className="bg-[#1e293b] border-b border-slate-700 text-white py-2 px-4 shadow-md sticky top-0 z-50 flex items-center justify-between font-sans text-xs">
          <div className="flex items-center gap-2 mx-auto">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Impersonating user: <strong>{profile?.full_name || profile?.email}</strong> ({profile?.user_type})</span>
            <button
              onClick={stopImpersonating}
              className="ml-4 bg-[#0052FF] hover:bg-blue-600 text-white font-extrabold px-3.5 py-1 rounded-xl transition-all cursor-pointer shadow-sm text-[10px] uppercase tracking-wider"
            >
              Exit Impersonation
            </button>
          </div>
        </div>
      )}
      <Toaster 
        position="top-center" 
        closeButton
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.05)'
          },
          classNames: {
            toast: 'font-sans border border-slate-100',
            success: '!border-emerald-200 bg-emerald-50/50 text-emerald-800',
            error: '!border-red-200 bg-red-50/50 text-red-800',
          }
        }}
      />

      <Routes>
        {/* Click Tracking Redirect handler */}
        <Route path="/click/:code" element={<ClickRedirect />} />

        {/* Public Marketing Routes */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />

        {/* App Portal Routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register/advertiser" element={<AdvertiserRegister />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />

        {/* Root Redirect handler based on domain */}
        <Route 
          path="/" 
          element={
            isApp ? (
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            ) : (
              <Landing />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

// ----------------------------------------------------
// CLICK TRACKING REDIRECT COMPONENT
// ----------------------------------------------------
function ClickRedirect() {
  const { code } = useParams<{ code: string }>();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const performRedirect = async () => {
      if (!code) return;
      try {
        // Track the click in local/Supabase database
        await logClick(code);

        // Fetch campaigns to find landing URL
        const campaigns = await getCampaigns();
        // Since myLinks has the code mapping, we simulate finding the link by looking up the codes
        const codeClean = code.toUpperCase();
        
        // Mock token decoding (RM_{PUB_ID}_{CAMP_ID}_{RANDOM})
        const segments = codeClean.split('_');
        if (segments.length >= 3) {
          // Attempt to find Campaign by matching the campaign segment
          const allLinks = JSON.parse(localStorage.getItem('rewardmate_mock_links') || '[]');
          const link = allLinks.find((l: any) => l.code.toUpperCase() === codeClean);
          const campaign = campaigns.find(c => c.id === link?.campaign_id || c.id === 'campaign-1');
          
          if (campaign) {
            toast.success(`Tracking click for ${campaign.name}... Redirecting!`);
            setTimeout(() => {
              window.location.replace(campaign.landing_page_url);
            }, 1200);
            return;
          }
        }
        
        // General fallback
        toast.success(`Tracking link clicked! Redirecting to Reward Mate Australia...`);
        setTimeout(() => {
          window.location.replace('https://www.rewardmate.com.au');
        }, 1500);
      } catch (err: any) {
        console.error(err);
        setErrorMsg('Invalid tracking link token.');
      }
    };

    performRedirect();
  }, [code]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#0d0f17] text-white font-sans p-6">
      {errorMsg ? (
        <div className="space-y-4 text-center">
          <div className="text-red-500 font-bold text-lg">Error: {errorMsg}</div>
          <p className="text-slate-400 text-xs">This affiliate link could not be verified or has expired.</p>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 rounded-full border-4 border-[#0052FF]/30 border-t-[#0052FF] animate-spin mx-auto"></div>
          <div className="text-sm font-bold text-[#0052FF]">Tracking Referral Click...</div>
          <p className="text-slate-400 text-xs">You are being redirected to our sponsor on a secure connection.</p>
        </div>
      )}
    </div>
  );
}
