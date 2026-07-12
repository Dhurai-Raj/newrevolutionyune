import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { MusicCard } from '../components/MusicCard';
import type { TrackData } from '../context/AudioContext';
import { 
  BiPlay, BiPause, BiDownload, BiHeart, BiShareAlt, 
  BiBadgeCheck, BiArrowBack, BiLoaderAlt
} from 'react-icons/bi';

export const TrackDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();
  const { token, favorites, toggleFavorite, user, refreshDashboard } = useAuth();
  
  const [track, setTrack] = useState<TrackData | null>(null);
  const [recommendations, setRecommendations] = useState<TrackData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const isCurrent = currentTrack?.id === track?.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;

  useEffect(() => {
    if (track) {
      setIsFavorited(favorites.includes(track.id));
    }
  }, [favorites, track]);

  // Fetch track and recommendations
  useEffect(() => {
    const fetchTrackData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/tracks/${id}`);
        if (!res.ok) {
          throw new Error('Track not found');
        }
        const data = await res.json();
        setTrack(data.track);

        // Fetch recommendations based on this track's genre/mood
        const recRes = await fetch(`/api/tracks/recommendations?genre=${encodeURIComponent(data.track.genre)}&mood=${encodeURIComponent(data.track.mood)}&limit=3`);
        if (recRes.ok) {
          const recData = await recRes.json();
          // Filter out current track
          setRecommendations(
            (recData.tracks || []).filter((t: TrackData) => t.id !== data.track.id)
          );
        }
      } catch (err) {
        console.error(err);
        navigate('/browse');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrackData();
  }, [id, navigate]);

  const handlePlayToggle = () => {
    if (!track) return;
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const handleFavoriteClick = async () => {
    if (!track) return;
    if (!token) {
      navigate('/login');
      return;
    }
    await toggleFavorite(track.id);
  };

  const handleDownloadClick = async () => {
    if (!track) return;
    if (!token) {
      navigate('/login');
      return;
    }

    setIsDownloading(true);
    try {
      const res = await fetch('/api/downloads/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trackId: track.id,
          buyerName: user?.email.split('@')[0],
          buyerEmail: user?.email
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Download failed');
        setIsDownloading(false);
        return;
      }

      // Initiate downloads
      const dl = document.createElement('a');
      dl.href = data.downloadUrl;
      dl.download = `${track.title}_royaltune.mp3`;
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);

      await refreshDashboard();
    } catch {
      alert('Error initiating download.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareClick = () => {
    if (!track) return;
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-3">
        <BiLoaderAlt className="text-4xl text-royal-500 animate-spin" />
        <p className="text-sm text-gray-400">Loading track details...</p>
      </div>
    );
  }

  if (!track) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 w-full py-10 flex flex-col gap-10">
      
      {/* Back Button */}
      <div>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <BiArrowBack className="text-lg" /> Back
        </button>
      </div>

      {/* Main Track Info Box */}
      <div className="relative w-full rounded-3xl glass border border-white/5 p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-center overflow-hidden">
        
        {/* Glow Spheres */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-royal-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-royal-cyan/10 rounded-full blur-3xl" />

        {/* Thumbnail Image */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 group shadow-2xl">
          <img src={track.thumbnail_url} alt={track.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={handlePlayToggle}
              className="w-14 h-14 rounded-full bg-royal-600 hover:bg-royal-500 text-white flex items-center justify-center shadow-lg transition-transform transform hover:scale-105 active:scale-95"
            >
              {isCurrentlyPlaying ? <BiPause className="text-3xl" /> : <BiPlay className="text-3xl ml-1" />}
            </button>
          </div>
          {track.is_free ? (
            <span className="absolute top-3 left-3 text-[10px] bg-emerald-500 font-bold px-2 py-0.5 rounded text-white tracking-widest uppercase shadow">Free</span>
          ) : (
            <span className="absolute top-3 left-3 text-[10px] bg-gradient-gold font-bold px-2 py-0.5 rounded text-white tracking-widest uppercase shadow">Premium</span>
          )}
        </div>

        {/* Details text & actions */}
        <div className="flex-1 flex flex-col gap-4 text-center md:text-left w-full">
          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide">{track.title}</h2>
            <p className="text-sm text-gray-400 mt-1">Released in Curated Album • Royalty-Free Synchronization Rights</p>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed">
            {track.description || "A beautiful, premium audio soundtrack recorded in high resolution, masterfully prepared for immediate licensing. Perfectly fitting film projects, web advertisement campaigns, podcasts, background scores, and content creation."}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5">
            <span className="text-[10px] bg-white/5 border border-white/5 text-gray-300 px-3 py-1 rounded-full">{track.genre}</span>
            <span className="text-[10px] bg-white/5 border border-white/5 text-gray-300 px-3 py-1 rounded-full">{track.mood}</span>
            <span className="text-[10px] bg-white/5 border border-white/5 text-gray-300 px-3 py-1 rounded-full">{track.bpm} BPM</span>
            <span className="text-[10px] bg-white/5 border border-white/5 text-gray-300 px-3 py-1 rounded-full capitalize">{track.vocals}</span>
            <span className="text-[10px] bg-white/5 border border-white/5 text-gray-300 px-3 py-1 rounded-full">{formatDuration(track.duration)} Duration</span>
          </div>

          {/* Buttons row */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
            <button
              onClick={handlePlayToggle}
              className="px-6 h-12 rounded-xl bg-royal-600 hover:bg-royal-500 text-white font-bold text-sm flex items-center gap-2 transition-all transform active:scale-95 shadow-md shadow-royal-600/10 cursor-pointer"
            >
              {isCurrentlyPlaying ? <BiPause className="text-xl" /> : <BiPlay className="text-xl" />}
              <span>{isCurrentlyPlaying ? 'Pause Preview' : 'Listen Preview'}</span>
            </button>

            <button
              onClick={handleDownloadClick}
              disabled={isDownloading}
              className="px-6 h-12 rounded-xl bg-gradient-royal text-white font-bold text-sm flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer shadow-lg"
            >
              <BiDownload className="text-xl" />
              <span>{isDownloading ? 'Processing...' : 'Download File'}</span>
            </button>

            <button
              onClick={handleFavoriteClick}
              className={`p-3 rounded-xl border text-xl flex items-center justify-center transition-colors cursor-pointer ${isFavorited ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'}`}
            >
              <BiHeart />
            </button>

            <button
              onClick={handleShareClick}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xl flex items-center justify-center transition-colors cursor-pointer"
            >
              <BiShareAlt />
            </button>
          </div>

        </div>

      </div>

      {/* Licensing Certificate Info Block */}
      <div className="rounded-3xl glass border border-white/5 p-6 flex flex-col gap-4">
        <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
          <BiBadgeCheck className="text-emerald-400 text-2xl" /> Licensing Protection Included
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          Downloading this track generates a unique **RoyalTune License ID Certificate** issued under your account. This copyright release protects your YouTube channels and media creations against DMCA claims and copyright notifications globally.
        </p>
      </div>

      {/* Similar Songs / Recommendations */}
      <div className="flex flex-col gap-6">
        <h3 className="font-display font-black text-xl text-white">Recommended Similar Tracks</h3>
        <div className="flex flex-col gap-4">
          {recommendations.map(t => (
            <MusicCard key={t.id} track={t} />
          ))}
          {recommendations.length === 0 && (
            <p className="text-sm text-gray-400 italic">No similar tracks found in this category.</p>
          )}
        </div>
      </div>

    </div>
  );
};
