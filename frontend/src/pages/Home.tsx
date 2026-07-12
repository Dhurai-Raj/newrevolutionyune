import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MusicCard } from '../components/MusicCard';
import type { TrackData } from '../context/AudioContext';
import { 
  BiSearch, BiTrendingUp, BiChevronRight, BiTimeFive, 
  BiStar, BiPlus, BiMinus
} from 'react-icons/bi';

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingTracks, setTrendingTracks] = useState<TrackData[]>([]);
  const [newTracks, setNewTracks] = useState<TrackData[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  const navigate = useNavigate();

  // Fetch frontpage tracks (Trending & Newest)
  useEffect(() => {
    const fetchHomeTracks = async () => {
      try {
        const trendRes = await fetch('/api/tracks?is_trending=1&limit=4');
        if (trendRes.ok) {
          const trendData = await trendRes.ok ? await trendRes.json() : null;
          setTrendingTracks(trendData?.tracks || []);
        }

        const newRes = await fetch('/api/tracks?sort_by=newest&limit=4');
        if (newRes.ok) {
          const newData = await newRes.json();
          setNewTracks(newData?.tracks || []);
        }
      } catch (err) {
        console.error('Failed to load frontpage tracks', err);
      }
    };
    fetchHomeTracks();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { name: 'Cinematic', description: 'Epic films & trailers', icon: '🎬', genre: 'Cinematic' },
    { name: 'Corporate', description: 'Business & presentations', icon: '💼', genre: 'Corporate' },
    { name: 'Gaming', description: 'High-energy soundscapes', icon: '🎮', genre: 'Gaming' },
    { name: 'Acoustic', description: 'Folk, guitars & soft tones', icon: '🎸', genre: 'Acoustic' },
    { name: 'Nature', description: 'Calm & organic sounds', icon: '🌿', genre: 'Nature' },
    { name: 'Kids', description: 'Playful & happy tracks', icon: '🧸', genre: 'Kids' },
    { name: 'Festival', description: 'Traditional & celebrations', icon: '🎉', genre: 'Festival' },
    { name: 'Ambient', description: 'Chill lo-fi & relaxation', icon: '🧘', genre: 'Ambient' },
  ];

  const popularTags = ['Wedding', 'Travel', 'Podcast', 'Motivational', 'Tamil', 'Indian', 'Technology', 'Sports'];

  const faqs = [
    {
      q: 'Is the music really royalty-free?',
      a: 'Yes! Once you download a track from New Revolution Tune, you can use it in your videos, podcasts, streams, or client work without paying ongoing royalties. All synchronization rights are covered under our license.'
    },
    {
      q: 'How does the 20 free downloads limit work?',
      a: 'Every registered free user receives 20 free download tokens. You can browse, play, and download up to 20 tracks. Once this limit is reached, you must subscribe to our monthly or yearly plans to continue downloading.'
    },
    {
      q: 'Can I monetize my YouTube videos using New Revolution Tune music?',
      a: 'Absolutely! If you download tracks using a Premium subscription, you receive a commercial license that allows full monetization. For free downloads, you can use them for personal, non-monetized content with attribution.'
    },
    {
      q: 'Do you provide WAV or MP3 files?',
      a: 'Free users receive high-quality 320kbps MP3 downloads. Subscribed premium users receive access to original, uncompressed WAV master files alongside MP3 files.'
    }
  ];

  return (
    <div className="w-full flex flex-col gap-20 pb-20">
      
      {/* 1. Large Hero Section */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden px-4 py-20 bg-gradient-to-b from-[#0b0819] via-[#100c28] to-[#0b0819]">
        
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-royal-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-royal-cyan/15 blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-royal-cyan animate-pulse">
            <BiStar className="text-yellow-400" /> Premium Royalty-Free Soundtrack Library
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight leading-[1.1] text-white">
            Unleash Your Creativity with{' '}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
              New Revolution Tune
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
            Download 20 tracks completely free. Unlock unlimited commercial licensing, uncompressed WAV downloads, and the entire catalog with premium subscription.
          </p>

          {/* Search bar inside Hero */}
          <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl flex items-center gap-2 p-1.5 rounded-full bg-white/5 border border-white/15 focus-within:border-royal-500/50 shadow-2xl transition-all">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search cinematic, energetic, piano tracks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-full bg-transparent text-sm focus:outline-none text-white placeholder:text-gray-400"
              />
              <BiSearch className="absolute left-4.5 top-4 text-gray-400 text-lg" />
            </div>
            <button
              type="submit"
              className="h-12 px-8 rounded-full bg-gradient-royal hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] text-white font-bold text-sm transition-all transform active:scale-95 cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Popular Tags list */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-gray-400">Popular Searches:</span>
            {popularTags.map(tag => (
              <button
                key={tag}
                onClick={() => navigate(`/browse?search=${encodeURIComponent(tag)}`)}
                className="px-3 py-1 rounded-full bg-white/5 border border-white/5 hover:border-royal-500/30 text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 2. Collections & Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="font-display font-black text-2xl tracking-wide">Featured Collections</h2>
          <p className="text-sm text-gray-400">Find the perfect soundtracks curated specifically for your video genre.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/browse?genre=${encodeURIComponent(cat.genre)}`)}
              className="p-6 rounded-3xl glass-card flex flex-col gap-4 cursor-pointer hover:border-royal-500/40 relative overflow-hidden group"
            >
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
              <div>
                <h3 className="font-display font-bold text-base text-white group-hover:text-royal-500 transition-colors">{cat.name}</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{cat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Trending Tracks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <BiTrendingUp className="text-royal-cyan text-2xl" />
            <h2 className="font-display font-black text-2xl tracking-wide">Trending Music</h2>
          </div>
          <Link to="/browse?sort_by=popular" className="text-sm font-semibold text-royal-500 hover:text-royal-400 flex items-center gap-1">
            See all popular tracks <BiChevronRight className="text-lg" />
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {trendingTracks.map((track) => (
            <MusicCard key={track.id} track={track} />
          ))}
          {trendingTracks.length === 0 && (
            <p className="text-sm text-gray-400 italic">No trending tracks found. Start uploading to fill the database!</p>
          )}
        </div>
      </section>

      {/* 4. Premium CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-violet-900 via-indigo-950 to-purple-900 p-8 sm:p-12 border border-yellow-500/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-yellow-500/10 blur-3xl" />
          
          <div className="flex flex-col gap-4 max-w-xl relative">
            <span className="inline-flex items-center gap-1 text-[10px] bg-gradient-gold px-2.5 py-0.5 rounded-full text-white font-bold tracking-widest uppercase">
              Unlimited Plan
            </span>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-white leading-tight">
              Unlock All Premium Tracks & Sync Commercial Licenses
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Don't let download limits restrict your creativity. Subscribe to monthly or yearly membership to download files in lossless quality.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 relative">
            <Link 
              to="/pricing" 
              className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-sm shadow-xl shadow-amber-500/10 transition-all hover:scale-105"
            >
              Get Premium Access
            </Link>
            <Link 
              to="/browse?free=1" 
              className="px-8 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-sm transition-colors"
            >
              Explore Free Library
            </Link>
          </div>

        </div>
      </section>

      {/* 5. Newest Uploads */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <BiTimeFive className="text-royal-500 text-2xl" />
            <h2 className="font-display font-black text-2xl tracking-wide">Newest Releases</h2>
          </div>
          <Link to="/browse?sort_by=newest" className="text-sm font-semibold text-royal-500 hover:text-royal-400 flex items-center gap-1">
            Browse all tracks <BiChevronRight className="text-lg" />
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {newTracks.map((track) => (
            <MusicCard key={track.id} track={track} />
          ))}
          {newTracks.length === 0 && (
            <p className="text-sm text-gray-400 italic">No releases found. Start uploading to fill the database!</p>
          )}
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 w-full flex flex-col gap-8">
        <div className="text-center flex flex-col gap-2">
          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-wide">Frequently Asked Questions</h2>
          <p className="text-sm text-gray-400">Everything you need to know about New Revolution Tune licensing and pricing models.</p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl glass-card border border-white/5 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between text-base font-bold text-white hover:text-royal-500 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <BiMinus className="text-xl" /> : <BiPlus className="text-xl" />}
                </button>
                <div 
                  className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-40 border-t border-white/5' : 'max-h-0'}`}
                >
                  <p className="px-6 py-5 text-sm text-gray-300 leading-relaxed bg-[#0e0a24]/30">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
