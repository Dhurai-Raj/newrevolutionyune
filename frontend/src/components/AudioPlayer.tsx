import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { 
  BiPlay, BiPause, BiSkipNext, BiSkipPrevious, 
  BiVolumeMute, BiVolume, BiVolumeFull, BiSync, 
  BiShuffle, BiMenu, BiHeart
} from 'react-icons/bi';

export const AudioPlayer: React.FC = () => {
  const { 
    currentTrack, isPlaying, duration, currentTime, 
    volume, isMuted, isLooping, isShuffle, queue, 
    togglePlay, nextTrack, prevTrack, changeVolume, 
    toggleMute, toggleLoop, toggleShuffle, seekTo, removeFromQueue
  } = useAudio();
  const { favorites, toggleFavorite } = useAuth();
  
  const [showQueue, setShowQueue] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      setIsFavorited(favorites.includes(currentTrack.id));
    }
  }, [favorites, currentTrack]);

  if (!currentTrack) return null;

  // Time conversion
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleProgressBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(parseFloat(e.target.value));
  };

  const handleVolumeBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    changeVolume(parseFloat(e.target.value));
  };

  const handleFavoriteClick = async () => {
    if (currentTrack) {
      await toggleFavorite(currentTrack.id);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-300">
      
      {/* Expanded Playlist Queue Drawer */}
      {showQueue && (
        <div className="max-w-xl mx-auto w-full glass border border-white/10 border-b-0 rounded-t-3xl shadow-2xl p-5 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
            <h4 className="font-display font-bold text-sm tracking-wider uppercase text-royal-500">Up Next ({queue.length})</h4>
            <button 
              onClick={() => setShowQueue(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              Close Queue
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1.5">
            {queue.map((track, idx) => (
              <div 
                key={`${track.id}-${idx}`}
                className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 hover:border-royal-600/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={track.thumbnail_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{track.title}</p>
                    <p className="text-[10px] text-gray-400">{track.genre}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">{formatTime(track.duration)}</span>
                  <button 
                    onClick={() => removeFromQueue(track.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-500/10"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {queue.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">Your play queue is empty.</p>
            )}
          </div>
        </div>
      )}

      {/* Sticky Audio Player Bar */}
      <div className="w-full glass border-t border-white/10 shadow-2xl px-4 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left Area: Artwork & Details */}
          <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0">
            <img 
              src={currentTrack.thumbnail_url} 
              alt={currentTrack.title} 
              className={`w-12 h-12 rounded-xl object-cover border border-white/10 ${isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''}`} 
            />
            <div className="min-w-0 flex-1">
              <h5 className="font-display font-semibold text-sm truncate hover:text-royal-500 cursor-pointer">{currentTrack.title}</h5>
              <p className="text-xs text-gray-400 truncate">RoyalTune Creator</p>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handleFavoriteClick}
                className={`p-1.5 rounded-lg text-lg transition-colors ${isFavorited ? 'text-rose-500 hover:bg-rose-500/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <BiHeart />
              </button>
            </div>
          </div>

          {/* Middle Area: Playback Controls & Seek Slider */}
          <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
            {/* Control buttons */}
            <div className="flex items-center gap-5">
              <button 
                onClick={toggleShuffle} 
                className={`text-lg transition-colors ${isShuffle ? 'text-royal-500' : 'text-gray-400 hover:text-white'}`}
                title="Shuffle"
              >
                <BiShuffle />
              </button>
              <button 
                onClick={prevTrack} 
                className="text-2xl text-gray-400 hover:text-white transition-colors"
                title="Previous Track"
              >
                <BiSkipPrevious />
              </button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-gradient-royal text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <BiPause className="text-2xl" /> : <BiPlay className="text-2xl ml-0.5" />}
              </button>
              <button 
                onClick={nextTrack} 
                className="text-2xl text-gray-400 hover:text-white transition-colors"
                title="Next Track"
              >
                <BiSkipNext />
              </button>
              <button 
                onClick={toggleLoop} 
                className={`text-lg transition-colors ${isLooping ? 'text-royal-500' : 'text-gray-400 hover:text-white'}`}
                title="Loop"
              >
                <BiSync />
              </button>
            </div>

            {/* Timeline Progress Slider */}
            <div className="w-full flex items-center gap-3">
              <span className="text-[10px] text-gray-400 font-medium select-none w-8 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleProgressBarChange}
                className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-royal-500 focus:outline-none"
              />
              <span className="text-[10px] text-gray-400 font-medium select-none w-8">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right Area: Volume & Queue Toggle */}
          <div className="flex items-center justify-end gap-4 w-full md:w-1/4">
            
            {/* Volume controls */}
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleMute}
                className="text-gray-400 hover:text-white text-lg transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <BiVolumeMute />
                ) : volume < 0.4 ? (
                  <BiVolume />
                ) : (
                  <BiVolumeFull />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeBarChange}
                className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-royal-500 focus:outline-none"
              />
            </div>

            {/* Queue Toggle Button */}
            <button
              onClick={() => setShowQueue(prev => !prev)}
              className={`p-2 rounded-xl text-lg flex items-center justify-center transition-all ${showQueue ? 'bg-royal-600/20 text-royal-500 border border-royal-600/30' : 'bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 hover:text-white'}`}
              title="Play Queue"
            >
              <BiMenu />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
