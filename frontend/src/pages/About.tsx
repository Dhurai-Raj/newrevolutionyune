import React from 'react';
import { Link } from 'react-router-dom';
import { BiMusic, BiShieldQuarter, BiBadgeCheck, BiSupport } from 'react-icons/bi';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 w-full py-16 flex flex-col gap-12">
      
      <div className="text-center flex flex-col gap-3">
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">About New Revolution Tune</h1>
        <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
          We are on a mission to supply premium, royalty-free audio tracks for creators, YouTubers, broadcasters, and design agencies globally.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass-card flex flex-col gap-3">
          <BiMusic className="text-3xl text-royal-500" />
          <h3 className="font-display font-bold text-base text-white">Curated Quality</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Each audio track uploaded to New Revolution Tune is masterfully engineered and manually reviewed for outstanding clarity.</p>
        </div>
        <div className="p-6 rounded-3xl glass-card flex flex-col gap-3">
          <BiShieldQuarter className="text-3xl text-royal-cyan" />
          <h3 className="font-display font-bold text-base text-white">DMCA Protection</h3>
          <p className="text-xs text-gray-400 leading-relaxed">Unique licensing certificates generate copyright clearances, keeping your social channel safe from claims.</p>
        </div>
        <div className="p-6 rounded-3xl glass-card flex flex-col gap-3">
          <BiBadgeCheck className="text-3xl text-amber-400" />
          <h3 className="font-display font-bold text-base text-white">Simple Pricing</h3>
          <p className="text-xs text-gray-400 leading-relaxed">A clean, transparent tier system. Download 20 tracks for free, or grab unlimited access under easy plans.</p>
        </div>
      </div>

      <div className="rounded-3xl glass border border-white/5 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-display font-bold text-lg text-white">Have licensing queries?</h3>
          <p className="text-xs text-gray-400 mt-1">Our support staff is ready to clarify licensing compliance rules.</p>
        </div>
        <Link 
          to="/contact" 
          className="px-6 py-3 rounded-xl bg-royal-600 hover:bg-royal-500 text-white font-bold text-sm transition-colors flex items-center gap-1 cursor-pointer"
        >
          <BiSupport className="text-lg" /> Contact Support Team
        </Link>
      </div>

    </div>
  );
};
