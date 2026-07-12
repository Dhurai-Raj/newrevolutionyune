import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BiCheck, BiCrown, BiLoaderAlt } from 'react-icons/bi';

export const Pricing: React.FC = () => {
  const { token, mockSubscribe } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'yearly' | null>(null);
  const navigate = useNavigate();

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!token) {
      navigate('/login', { state: { from: { pathname: '/pricing' } } });
      return;
    }

    setLoadingPlan(plan);
    try {
      const res = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to initiate Checkout session');
        return;
      }

      // Redirect to Stripe checkout URL (or simulated local URL)
      if (data.url.includes('checkout_mock=success')) {
        // Local simulation flow
        const confirmMock = confirm("You are in Local Development Mode. Activate mock Stripe subscription now?");
        if (confirmMock) {
          const activateRes = await mockSubscribe(plan);
          if (activateRes.success) {
            alert("Mock subscription activated successfully! Redirecting to Dashboard.");
            navigate('/dashboard');
          } else {
            alert(activateRes.error || "Subscription mock error");
          }
        }
      } else {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      alert('Network error initiating subscription.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const features = [
    'Unlimited high-quality MP3 downloads',
    'Original uncompressed WAV files access',
    'Full Commercial Synchronization Rights',
    'YouTube, Socials, Film & Broadcast release license',
    'New tracks added weekly',
    'Access to premium curation lists',
    'Perpetual clearance (even after cancelation)',
    'Fast downloads with no rate limiting'
  ];

  return (
    <div className="w-full pb-20 pt-10 px-4 relative overflow-hidden bg-gradient-to-b from-[#0b0819] via-[#0e0a25] to-[#0b0819]">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-royal-600/10 blur-3xl" />

      <div className="max-w-5xl mx-auto flex flex-col items-center gap-12 relative z-10">
        
        {/* Section title */}
        <div className="text-center flex flex-col gap-3">
          <span className="inline-flex items-center gap-1 text-[10px] bg-gradient-gold px-3 py-1 rounded-full text-white font-bold tracking-widest uppercase">
            Pricing Plans
          </span>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Simple, Transparent Licensing Plans
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto leading-relaxed">
            Gain full rights to monetize your media. Choose a plan and download premium content with zero limitations.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          
          {/* Plan 1: Monthly */}
          <div className="rounded-3xl glass border border-white/5 p-8 flex flex-col justify-between relative shadow-xl hover:border-royal-600/35 transition-all group">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-display font-bold text-lg text-white">Monthly Subscription</h3>
                <p className="text-xs text-gray-400 mt-0.5">Cancel anytime, no long obligations</p>
              </div>

              <div className="flex items-baseline gap-1 py-4 border-y border-white/5">
                <span className="font-display font-black text-4xl text-white">$9.99</span>
                <span className="text-sm font-semibold text-gray-400">/ month</span>
              </div>

              <ul className="flex flex-col gap-3 py-4 text-sm text-gray-300">
                {features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <BiCheck className="text-emerald-400 text-lg flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loadingPlan !== null}
              className="w-full h-12 rounded-xl bg-white/5 group-hover:bg-royal-600 text-white font-bold text-sm transition-all transform active:scale-95 cursor-pointer mt-8 flex items-center justify-center gap-2 border border-white/10 group-hover:border-transparent hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50"
            >
              {loadingPlan === 'monthly' ? (
                <BiLoaderAlt className="animate-spin text-lg" />
              ) : (
                <span>Subscribe Monthly</span>
              )}
            </button>
          </div>

          {/* Plan 2: Yearly (Recommended) */}
          <div className="rounded-3xl glass border-2 border-amber-500/30 p-8 flex flex-col justify-between relative shadow-2xl overflow-hidden group">
            {/* Recommended banner overlay */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl shadow-md">
              Best Deal - Save 33%
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-1.5">
                  Yearly Subscription <BiCrown className="text-yellow-400 animate-pulse" />
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Continuous licensing protection</p>
              </div>

              <div className="flex items-baseline gap-1 py-4 border-y border-white/5">
                <span className="font-display font-black text-4xl text-white">$79.99</span>
                <span className="text-sm font-semibold text-gray-400">/ year</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full ml-2">Equivalent $6.66/mo</span>
              </div>

              <ul className="flex flex-col gap-3 py-4 text-sm text-gray-300">
                {features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <BiCheck className="text-emerald-400 text-lg flex-shrink-0" />
                    <span className={idx < 3 ? "font-bold text-white" : ""}>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={loadingPlan !== null}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-sm shadow-xl shadow-amber-500/15 transition-all transform active:scale-95 cursor-pointer mt-8 flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-50"
            >
              {loadingPlan === 'yearly' ? (
                <BiLoaderAlt className="animate-spin text-lg" />
              ) : (
                <span>Subscribe Yearly</span>
              )}
            </button>
          </div>

        </div>

        {/* Legal Disclaimer block */}
        <p className="text-[11px] text-gray-500 text-center max-w-md leading-relaxed mt-4">
          All transactions are secured and processed using Stripe. Subscription billing is recurring and you can cancel online at any moment. Assets downloaded during subscription period remain cleared for commercial synchronizations indefinitely.
        </p>

      </div>
    </div>
  );
};
