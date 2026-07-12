import React from 'react';
import { useLocation } from 'react-router-dom';

export const Legal: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  let title = "Terms of Use";
  let content = (
    <div className="flex flex-col gap-4 text-sm text-gray-300 leading-relaxed">
      <p>Welcome to New Revolution Tune! By accessing our website, you agree to comply with and be bound by the following terms and conditions of use. Please read these terms carefully before downloading any musical tracks.</p>
      <h3 className="font-bold text-white text-base mt-4">1. Licensing & Usage</h3>
      <p>All tracks provided on New Revolution Tune are protected under international copyright regulations. We grant you a synchronization license for creative work in accordance with your membership tier:</p>
      <ul className="list-disc pl-5 flex flex-col gap-2">
        <li><strong>Free Tier:</strong> Free download is limited to 20 tracks total per user. Tracks may be used in personal projects with mandatory attribution. No commercial monetization is allowed.</li>
        <li><strong>Premium Subscriptions:</strong> Grants a worldwide, royalty-free, perpetual synchronization license for commercial use across YouTube, streaming, social media, film, broadcast, and games.</li>
      </ul>
      <h3 className="font-bold text-white text-base mt-4">2. Prohibited Distribution</h3>
      <p>Under no circumstances may you resell, redistribute, sub-license, or share New Revolution Tune files as standalone audio clips. Tracks must be synchronized with other media assets (e.g. video, podcast narration, games).</p>
    </div>
  );

  if (path.includes('privacy')) {
    title = "Privacy Policy";
    content = (
      <div className="flex flex-col gap-4 text-sm text-gray-300 leading-relaxed">
        <p>At New Revolution Tune, we value your privacy and are committed to protecting your personal data. This privacy policy describes how we collect, store, and utilize details when you access our service.</p>
        <h3 className="font-bold text-white text-base mt-4">1. Data We Collect</h3>
        <p>We collect essential user metadata to provide the core download limits and licensing tracking:</p>
        <ul className="list-disc pl-5 flex flex-col gap-2">
          <li>Account registration data: Email address, passwords (fully encrypted with hashing algorithms).</li>
          <li>Transactions & Billing: Stripe customer references, billing periods, and subscription details.</li>
          <li>Log details: Download records containing IP addresses, generated License IDs, and dates.</li>
        </ul>
        <h3 className="font-bold text-white text-base mt-4">2. Cookies & Analytics</h3>
        <p>We use session cookies and local storage tokens to preserve your active login session and player settings (e.g., volume slider, theme choices).</p>
      </div>
    );
  } else if (path.includes('dmca')) {
    title = "DMCA Copyright Notice";
    content = (
      <div className="flex flex-col gap-4 text-sm text-gray-300 leading-relaxed">
        <p>New Revolution Tune respects the intellectual property rights of others. If you believe that your copyrighted work has been uploaded or distributed on our platform in a way that constitutes copyright infringement, please submit a written DMCA notice to our designated agent.</p>
        <h3 className="font-bold text-white text-base mt-4">DMCA Takedown Requirements</h3>
        <p>Your notification must include the following information:</p>
        <ul className="list-disc pl-5 flex flex-col gap-2">
          <li>A description of the copyrighted work that you claim has been infringed.</li>
          <li>The specific URL or Track ID of the material on New Revolution Tune.</li>
          <li>Your contact details: name, email, physical address, and telephone number.</li>
          <li>A statement signed under penalty of perjury that the information provided is accurate and that you are authorized to act on behalf of the owner.</li>
        </ul>
        <p className="mt-4">Please submit your notices directly to: <strong>dmca@newrevolutiontune.com</strong>. We take copyright issues seriously and will remove verified infringing content within 24-48 business hours.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 w-full py-16 flex flex-col gap-8 relative overflow-hidden bg-gradient-to-b from-[#0b0819] to-[#0b0819]">
      <div className="border-b border-white/5 pb-4">
        <h1 className="font-display font-black text-3xl text-white tracking-wide">{title}</h1>
        <p className="text-xs text-gray-400 mt-1">Last Updated: July 2026</p>
      </div>
      <div className="glass border border-white/5 rounded-3xl p-6 sm:p-10 shadow-lg">
        {content}
      </div>
    </div>
  );
};
