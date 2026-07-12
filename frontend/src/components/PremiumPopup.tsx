import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BiX, BiCrown, BiCheck } from 'react-icons/bi';

interface PremiumPopupProps {
  isOpen: boolean;
  onClose: () => void;
  reason: 'limit_reached' | 'premium_required' | '';
}

export const PremiumPopup: React.FC<PremiumPopupProps> = ({ isOpen, onClose, reason }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-md glass border border-yellow-500/20 rounded-3xl p-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-yellow-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
        >
          <BiX className="text-2xl" />
        </button>

        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
          <BiCrown className="text-white text-3xl animate-bounce" />
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h3 className="font-display font-black text-2xl mb-3 tracking-wide">
            {reason === 'limit_reached' ? 'Download Limit Reached!' : 'Premium Track Locked'}
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed px-2">
            {reason === 'limit_reached' 
              ? 'You have successfully downloaded 20 tracks for free. Upgrade to a subscription to enjoy unlimited premium downloads and commercial licensing!'
              : 'This is a premium high-quality WAV track. Unlock downloads for our entire premium catalog by subscribing.'}
          </p>
        </div>

        {/* Features Checklist */}
        <div className="space-y-3 mb-8 bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2.5 text-sm text-gray-200">
            <BiCheck className="text-emerald-400 text-xl flex-shrink-0" />
            <span>Unlimited downloads for all tracks</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-200">
            <BiCheck className="text-emerald-400 text-xl flex-shrink-0" />
            <span>Commercial Use License (YouTube, Film, Ads)</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-200">
            <BiCheck className="text-emerald-400 text-xl flex-shrink-0" />
            <span>HQ WAV + MP3 original format exports</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onClose();
              navigate('/pricing');
            }}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 font-bold text-sm text-white shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transform hover:-translate-y-0.5 transition-all"
          >
            Choose Subscription Plan
          </button>
          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-sm text-gray-300 transition-colors"
          >
            Keep Exploring Free Music
          </button>
        </div>

      </div>
    </div>
  );
};
