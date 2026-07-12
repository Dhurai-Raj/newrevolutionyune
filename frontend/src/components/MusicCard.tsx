import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import type { TrackData } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { PremiumPopup } from './PremiumPopup';
import { 
  BiPlay, BiPause, BiDownload, BiHeart, 
  BiShareAlt, BiTime, BiPulse
} from 'react-icons/bi';

interface MusicCardProps {
  track: TrackData;
}

export const MusicCard: React.FC<MusicCardProps> = ({ track }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, currentTime, duration } = useAudio();
  const { token, favorites, toggleFavorite, user, refreshDashboard } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [popupState, setPopupState] = useState<{ isOpen: boolean; reason: 'limit_reached' | 'premium_required' | '' }>({
    isOpen: false,
    reason: ''
  });
  
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isCurrent = currentTrack?.id === track.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;

  useEffect(() => {
    setIsFavorited(favorites.includes(track.id));
  }, [favorites, track.id]);

  // Render Canvas Waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Parse waveform data (JSON array of numbers)
    let peaks: number[] = [];
    try {
      peaks = JSON.parse(track.waveform_data);
    } catch {
      // Mock peaks if invalid
      peaks = Array.from({ length: 60 }, () => Math.floor(Math.random() * 25) + 5);
    }

    if (peaks.length === 0) {
      peaks = Array.from({ length: 60 }, () => Math.floor(Math.random() * 25) + 5);
    }

    // Set high resolution for canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const barWidth = 3;
    const gap = 2;
    const totalBars = Math.floor(width / (barWidth + gap));
    
    // Normalize peaks to fit total bars
    const sampledPeaks: number[] = [];
    const step = peaks.length / totalBars;
    for (let i = 0; i < totalBars; i++) {
      const peakIndex = Math.floor(i * step);
      sampledPeaks.push(peaks[peakIndex] || 5);
    }

    // Determine current progress ratio
    const progress = isCurrent && duration > 0 ? currentTime / duration : 0;

    // Draw bars
    ctx.clearRect(0, 0, width, height);
    sampledPeaks.forEach((peak, index) => {
      const x = index * (barWidth + gap);
      const barHeight = (peak / 40) * height; // Scale height
      const y = (height - barHeight) / 2;

      // Color based on active progress
      const isPlayed = index / totalBars <= progress;
      if (isCurrent) {
        ctx.fillStyle = isPlayed ? '#8b5cf6' : 'rgba(139, 92, 246, 0.25)'; // Brand violet / light violet
      } else {
        ctx.fillStyle = 'rgba(224, 222, 242, 0.3)'; // Default gray
      }

      // Draw rounded rect (manually drawing to support rounding on edge workers compatibility)
      ctx.beginPath();
      ctx.roundRect?.(x, y, barWidth, barHeight, 1.5);
      ctx.fill();
    });
  }, [track.waveform_data, isCurrent, currentTime, duration]);

  const handlePlayToggle = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const handleFavoriteClick = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    await toggleFavorite(track.id);
  };

  const handleDownloadClick = async () => {
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
        if (data.code === 'LIMIT_REACHED') {
          setPopupState({ isOpen: true, reason: 'limit_reached' });
        } else if (data.code === 'PREMIUM_REQUIRED') {
          setPopupState({ isOpen: true, reason: 'premium_required' });
        } else {
          alert(data.error || 'Download failed');
        }
        setIsDownloading(false);
        return;
      }

      // Initiate file download
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = data.downloadUrl;
      downloadAnchor.download = `${track.title}_new_revolution_tune.mp3`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      // Trigger license download
      const licenseRes = await fetch(`/api/downloads/license/${data.licenseId}`);
      if (licenseRes.ok) {
        const text = await licenseRes.text();
        const licenseBlob = new Blob([text], { type: 'text/plain' });
        const licenseUrl = URL.createObjectURL(licenseBlob);
        const licenseAnchor = document.createElement('a');
        licenseAnchor.href = licenseUrl;
        licenseAnchor.download = `License_${data.licenseId}.txt`;
        document.body.appendChild(licenseAnchor);
        licenseAnchor.click();
        document.body.removeChild(licenseAnchor);
      }

      await refreshDashboard();
    } catch (err) {
      console.error('Download failed', err);
      alert('Failed to process download.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}/track/${track.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  // Convert duration to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`w-full p-4 rounded-2xl glass-card flex flex-col md:flex-row items-center gap-5 transition-all duration-300 border ${isCurrent ? 'border-royal-600/35 bg-royal-950/20' : 'border-white/5'}`}>
      
      {/* Thumbnail & Hover Play */}
      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 group">
        <img 
          src={track.thumbnail_url} 
          alt={track.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
          <button 
            onClick={handlePlayToggle}
            className="w-10 h-10 rounded-full bg-royal-600 hover:bg-royal-500 text-white flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all shadow-md"
          >
            {isCurrentlyPlaying ? <BiPause className="text-2xl" /> : <BiPlay className="text-2xl ml-0.5" />}
          </button>
        </div>
        {/* Floating badge */}
        {track.is_free ? (
          <span className="absolute top-1.5 left-1.5 text-[9px] bg-emerald-500 font-bold px-1.5 py-0.5 rounded text-white tracking-wide uppercase">Free</span>
        ) : (
          <span className="absolute top-1.5 left-1.5 text-[9px] bg-gradient-gold font-bold px-1.5 py-0.5 rounded text-white tracking-wide uppercase">Premium</span>
        )}
      </div>

      {/* Info: Title & Tag lists */}
      <div className="flex-1 min-w-0 flex flex-col gap-1 w-full md:w-auto">
        <div className="flex items-center gap-2">
          <h4 
            onClick={() => navigate(`/track/${track.id}`)}
            className="font-display font-bold text-base hover:text-royal-500 cursor-pointer truncate"
          >
            {track.title}
          </h4>
          {!track.is_free && <BiPulse className="text-yellow-400 text-lg flex-shrink-0" title="Premium Sync license" />}
        </div>
        <p className="text-xs text-gray-400 truncate">
          By <span className="hover:underline cursor-pointer">New Revolution Tune Artist</span> • {track.genre} • {track.mood}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <span className="text-[10px] bg-white/5 border border-white/5 text-gray-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <BiTime className="text-xs" /> {formatTime(track.duration)}
          </span>
          <span className="text-[10px] bg-white/5 border border-white/5 text-gray-300 px-2 py-0.5 rounded-full">
            {track.bpm} BPM
          </span>
          <span className="text-[10px] bg-white/5 border border-white/5 text-gray-300 px-2 py-0.5 rounded-full capitalize">
            {track.vocals}
          </span>
        </div>
      </div>

      {/* Waveform Visualization area */}
      <div className="flex-1 w-full md:w-auto h-12 flex items-center">
        <canvas ref={canvasRef} className="w-full h-full cursor-pointer" onClick={handlePlayToggle} />
      </div>

      {/* Action Buttons row */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayToggle}
          className={`p-2.5 rounded-xl text-lg flex items-center justify-center transition-all ${isCurrentlyPlaying ? 'bg-royal-600 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
        >
          {isCurrentlyPlaying ? <BiPause /> : <BiPlay />}
        </button>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`p-2.5 rounded-xl text-lg flex items-center justify-center transition-colors ${isFavorited ? 'bg-rose-500/10 text-rose-500' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
          title="Favorite Track"
        >
          <BiHeart />
        </button>

        {/* Share Button */}
        <button
          onClick={handleShareClick}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-lg flex items-center justify-center transition-colors"
          title="Share Track"
        >
          <BiShareAlt />
        </button>

        {/* Download Button */}
        <button
          onClick={handleDownloadClick}
          disabled={isDownloading}
          className="px-4 py-2.5 rounded-xl bg-gradient-royal hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50 text-white text-sm font-bold flex items-center gap-1.5 transition-all transform active:scale-95"
        >
          <BiDownload className="text-lg" />
          <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
        </button>
      </div>

      {/* Modal dialog popup for Limits / Licensing */}
      <PremiumPopup 
        isOpen={popupState.isOpen} 
        reason={popupState.reason} 
        onClose={() => setPopupState({ isOpen: false, reason: '' })} 
      />
    </div>
  );
};
