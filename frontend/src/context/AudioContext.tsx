import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface TrackData {
  id: string;
  title: string;
  description?: string;
  thumbnail_url: string;
  preview_url: string;
  file_url: string;
  duration: number;
  genre: string;
  mood: string;
  instrument?: string;
  bpm: number;
  vocals: string;
  language: string;
  tags: string;
  is_free: number;
  is_featured: number;
  is_trending: number;
  waveform_data: string; // JSON Array of numbers
  downloads_count: number;
}

interface AudioContextType {
  currentTrack: TrackData | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  isLooping: boolean;
  isShuffle: boolean;
  queue: TrackData[];
  currentIndex: number;
  recentlyPlayed: TrackData[];
  playTrack: (track: TrackData, newQueue?: TrackData[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  changeVolume: (v: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  seekTo: (time: number) => void;
  addToQueue: (track: TrackData) => void;
  removeFromQueue: (trackId: string) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<TrackData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('rt_volume') || '0.8'));
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [queue, setQueue] = useState<TrackData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [recentlyPlayed, setRecentlyPlayed] = useState<TrackData[]>(() => {
    const saved = localStorage.getItem('rt_recent');
    return saved ? JSON.parse(saved) : [];
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio Element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(() => setIsPlaying(false));
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);

    // Set initial volume
    audio.volume = isMuted ? 0 : volume;

    return () => {
      audio.pause();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, [isLooping, queue, currentIndex]);

  // Sync volume state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      localStorage.setItem('rt_volume', volume.toString());
    }
  }, [volume, isMuted]);

  // Sync track URL
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      const wasPlaying = isPlaying;
      audioRef.current.src = currentTrack.preview_url;
      audioRef.current.load();
      
      if (wasPlaying || currentIndex >= 0) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error('Audio playback failed:', err);
            setIsPlaying(false);
          });
      }
    }
  }, [currentTrack]);

  const playTrack = (track: TrackData, newQueue?: TrackData[]) => {
    if (newQueue) {
      setQueue(newQueue);
      const index = newQueue.findIndex(t => t.id === track.id);
      setCurrentIndex(index >= 0 ? index : 0);
    } else {
      // Add to queue if not exists
      const existsIndex = queue.findIndex(t => t.id === track.id);
      if (existsIndex >= 0) {
        setCurrentIndex(existsIndex);
      } else {
        const updatedQueue = [...queue, track];
        setQueue(updatedQueue);
        setCurrentIndex(updatedQueue.length - 1);
      }
    }

    setCurrentTrack(track);

    // Save to recently played (max 10)
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      const updated = [track, ...filtered].slice(0, 10);
      localStorage.setItem('rt_recent', JSON.stringify(updated));
      return updated;
    });
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  };

  const nextTrack = () => {
    if (queue.length === 0) return;
    let nextIdx = currentIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      nextIdx = 0; // wrap around
    }
    setCurrentIndex(nextIdx);
    setCurrentTrack(queue[nextIdx]);
  };

  const prevTrack = () => {
    if (queue.length === 0) return;
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1; // wrap to back
    }
    setCurrentIndex(prevIdx);
    setCurrentTrack(queue[prevIdx]);
  };

  const changeVolume = (v: number) => {
    const bounded = Math.max(0, Math.min(1, v));
    setVolume(bounded);
    if (bounded > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const toggleLoop = () => {
    setIsLooping(prev => !prev);
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const addToQueue = (track: TrackData) => {
    if (queue.some(t => t.id === track.id)) return;
    setQueue(prev => [...prev, track]);
  };

  const removeFromQueue = (trackId: string) => {
    const index = queue.findIndex(t => t.id === trackId);
    if (index === currentIndex) {
      nextTrack();
    }
    setQueue(prev => prev.filter(t => t.id !== trackId));
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        duration,
        currentTime,
        volume,
        isMuted,
        isLooping,
        isShuffle,
        queue,
        currentIndex,
        recentlyPlayed,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        changeVolume,
        toggleMute,
        toggleLoop,
        toggleShuffle,
        seekTo,
        addToQueue,
        removeFromQueue,
        audioRef,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
