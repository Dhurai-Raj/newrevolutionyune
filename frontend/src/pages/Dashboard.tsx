import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MusicCard } from '../components/MusicCard';
import { 
  BiUser, BiDownload, BiHeart, 
  BiCrown, BiTime, BiFile, BiLoaderAlt 
} from 'react-icons/bi';

export const Dashboard: React.FC = () => {
  const { user, downloads, favoritesData, refreshDashboard, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'downloads' | 'favorites'>('downloads');

  useEffect(() => {
    refreshDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-3">
        <BiLoaderAlt className="text-4xl text-royal-500 animate-spin" />
        <p className="text-sm text-gray-400">Loading your profile dashboard...</p>
      </div>
    );
  }

  const isPremium = user?.subscription_status === 'active';
  const freeDownloadsLimit = 20;
  const currentDownloads = user?.free_downloads_count || 0;
  const remainingDownloads = Math.max(0, freeDownloadsLimit - currentDownloads);
  const downloadProgressPercent = Math.min(100, (currentDownloads / freeDownloadsLimit) * 100);

  // Format epoch seconds to readable date
  const formatDate = (epoch: number) => {
    return new Date(epoch * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10 flex flex-col gap-10">
      
      {/* 1. Header user banner */}
      <div className="w-full rounded-3xl glass border border-white/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Glow Spheres */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-royal-600/10 rounded-full blur-3xl" />

        <div className="flex items-center gap-4 relative">
          <div className="w-16 h-16 rounded-2xl bg-royal-600/20 border border-royal-600/30 flex items-center justify-center text-white text-3xl font-black">
            {user?.email[0].toUpperCase()}
          </div>
          <div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-wide">{user?.email}</h2>
            <p className="text-xs text-gray-400">Member since 2026 • Unique User ID: {user?.id.slice(0, 8)}...</p>
          </div>
        </div>

        {/* Plan card badge */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 min-w-[240px] relative">
          {isPremium ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center text-white text-xl">
                <BiCrown />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Subscription</p>
                <p className="text-sm font-bold text-white">Premium Unlimited Plan</p>
                {user?.current_period_end && (
                  <p className="text-[10px] text-yellow-400 font-semibold mt-0.5">
                    Renews on: {formatDate(user.current_period_end)}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gray-300 text-xl">
                <BiUser />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Level</p>
                <p className="text-sm font-bold text-white">Free Plan User</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Limit: 20 free track downloads</p>
              </div>
            </>
          )}
        </div>

      </div>

      {/* 2. Stats Grid */}
      {!isPremium && (
        <div className="w-full rounded-3xl glass border border-white/5 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-gray-300 uppercase tracking-wider text-xs">Free Download Allowance</span>
            <span className="font-bold text-white">{currentDownloads} / {freeDownloadsLimit} used ({remainingDownloads} remaining)</span>
          </div>
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              style={{ width: `${downloadProgressPercent}%` }} 
              className={`h-full rounded-full transition-all duration-500 ${downloadProgressPercent >= 90 ? 'bg-rose-500' : 'bg-gradient-royal'}`}
            />
          </div>
          <p className="text-xs text-gray-400">
            Once you download 20 songs, downloading will be locked. Upgrade to Unlimited for perpetual commercial licensing!
          </p>
        </div>
      )}

      {/* 3. Main lists (Downloads vs. Favorites) */}
      <div className="flex flex-col gap-6 w-full">
        
        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-white/5 gap-6 text-sm font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('downloads')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'downloads' ? 'border-royal-600 text-white font-extrabold' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            <BiDownload className="text-lg" />
            <span>Download History ({downloads.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'favorites' ? 'border-royal-600 text-white font-extrabold' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            <BiHeart className="text-lg" />
            <span>Favorites List ({favoritesData.length})</span>
          </button>
        </div>

        {/* Tab Panel contents */}
        {activeTab === 'downloads' ? (
          <div className="flex flex-col gap-4">
            
            {/* Downloads logs table list */}
            {downloads.map((item) => (
              <div 
                key={item.download_id}
                className="w-full p-4 rounded-2xl glass-card border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                  <img src={item.thumbnail_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-sm text-white truncate">{item.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                      <BiTime /> {formatDate(item.download_date)} • License ID: <span className="font-semibold text-royal-500">{item.license_id}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <a
                    href={`/api/downloads/license/${item.license_id}`}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 hover:text-white border border-white/5 transition-colors flex items-center gap-1.5"
                    title="Download Copyright License Certificate"
                  >
                    <BiFile className="text-base" /> License Certificate
                  </a>
                  <a
                    href={`/api/downloads/file?token=${localStorage.getItem('rt_token')}&trackId=${item.track_id}`}
                    onClick={(e) => {
                      // Prevent direct link navigation if we have the specific stream action
                      e.preventDefault();
                      // We can just fetch download again or download via normal flow
                      // To simplify, let's trigger download endpoint fetch or signed request
                      const getSignedUrl = async () => {
                        try {
                          const res = await fetch('/api/downloads/request', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('rt_token')}`
                            },
                            body: JSON.stringify({ trackId: item.track_id })
                          });
                          if (res.ok) {
                            const data = await res.json();
                            window.open(data.downloadUrl);
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      };
                      getSignedUrl();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-royal-600 hover:bg-royal-500 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
                  >
                    <BiDownload className="text-base" /> Audio File
                  </a>
                </div>

              </div>
            ))}

            {downloads.length === 0 && (
              <p className="text-sm text-gray-400 italic text-center py-10">You haven't downloaded any tracks yet. Explore and find music!</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {favoritesData.map((track) => (
              <MusicCard key={track.id} track={track as any} />
            ))}
            {favoritesData.length === 0 && (
              <p className="text-sm text-gray-400 italic text-center py-10">Your favorites folder is empty.</p>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
