import React from 'react';
import { BiFilterAlt, BiRotateLeft } from 'react-icons/bi';

export interface FilterState {
  genre: string;
  mood: string;
  instrument: string;
  vocals: string;
  bpm: string; // 'slow', 'medium', 'fast' or ''
  is_free: string; // '1' = free, '0' = premium, '' = all
  sort_by: string; // 'newest', 'popular', 'bpm'
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onChange }) => {
  const genres = ['Cinematic', 'Corporate', 'Ambient', 'Acoustic', 'Gaming', 'Electronic', 'Hip Hop', 'Rock', 'Pop', 'Nature', 'Kids', 'Festival'];
  const moods = ['Motivational', 'Happy', 'Sad', 'Energetic', 'Relaxing', 'Dark', 'Romantic', 'Dreamy', 'Suspenseful'];
  const instruments = ['Piano', 'Guitar', 'Synthesizer', 'Violin', 'Drums', 'Orchestral', 'Brass'];
  const vocalsOptions = ['Instrumental', 'Vocals', 'Choir'];

  const handleSelectChange = (key: keyof FilterState, value: string) => {
    onChange({
      ...filters,
      [key]: value
    });
  };

  const handleReset = () => {
    onChange({
      genre: '',
      mood: '',
      instrument: '',
      vocals: '',
      bpm: '',
      is_free: '',
      sort_by: 'newest'
    });
  };

  return (
    <aside className="w-full lg:w-64 glass border border-white/5 rounded-3xl p-5 flex flex-col gap-6 h-fit sticky top-20">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2 font-display font-black text-sm uppercase tracking-wider text-royal-500">
          <BiFilterAlt className="text-lg" />
          <span>Filters</span>
        </div>
        <button 
          onClick={handleReset}
          className="text-xs text-gray-400 hover:text-royal-500 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <BiRotateLeft className="text-sm" /> Reset
        </button>
      </div>

      {/* License Type Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">License Model</label>
        <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-xs font-semibold text-center">
          <button
            onClick={() => handleSelectChange('is_free', '')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${filters.is_free === '' ? 'bg-royal-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            All
          </button>
          <button
            onClick={() => handleSelectChange('is_free', '1')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${filters.is_free === '1' ? 'bg-royal-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Free
          </button>
          <button
            onClick={() => handleSelectChange('is_free', '0')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${filters.is_free === '0' ? 'bg-royal-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Premium
          </button>
        </div>
      </div>

      {/* Sort By Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Sort By</label>
        <select
          value={filters.sort_by}
          onChange={(e) => handleSelectChange('sort_by', e.target.value)}
          className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-royal-500 focus:bg-white/10 transition-all text-gray-200"
        >
          <option value="newest" className="bg-[#0b0819]">Newest Uploads</option>
          <option value="popular" className="bg-[#0b0819]">Most Popular</option>
          <option value="bpm" className="bg-[#0b0819]">BPM (Low to High)</option>
        </select>
      </div>

      {/* Genre Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Genre</label>
        <select
          value={filters.genre}
          onChange={(e) => handleSelectChange('genre', e.target.value)}
          className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-royal-500 focus:bg-white/10 transition-all text-gray-200"
        >
          <option value="" className="bg-[#0b0819]">All Genres</option>
          {genres.map(g => (
            <option key={g} value={g} className="bg-[#0b0819]">{g}</option>
          ))}
        </select>
      </div>

      {/* Mood Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Mood</label>
        <select
          value={filters.mood}
          onChange={(e) => handleSelectChange('mood', e.target.value)}
          className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-royal-500 focus:bg-white/10 transition-all text-gray-200"
        >
          <option value="" className="bg-[#0b0819]">All Moods</option>
          {moods.map(m => (
            <option key={m} value={m} className="bg-[#0b0819]">{m}</option>
          ))}
        </select>
      </div>

      {/* Instrument Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Instrument</label>
        <select
          value={filters.instrument}
          onChange={(e) => handleSelectChange('instrument', e.target.value)}
          className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-royal-500 focus:bg-white/10 transition-all text-gray-200"
        >
          <option value="" className="bg-[#0b0819]">All Instruments</option>
          {instruments.map(i => (
            <option key={i} value={i} className="bg-[#0b0819]">{i}</option>
          ))}
        </select>
      </div>

      {/* Vocals Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Vocals</label>
        <select
          value={filters.vocals}
          onChange={(e) => handleSelectChange('vocals', e.target.value)}
          className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-royal-500 focus:bg-white/10 transition-all text-gray-200"
        >
          <option value="" className="bg-[#0b0819]">Any Vocals</option>
          {vocalsOptions.map(v => (
            <option key={v} value={v} className="bg-[#0b0819]">{v}</option>
          ))}
        </select>
      </div>

      {/* Tempo BPM Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Tempo (BPM)</label>
        <select
          value={filters.bpm}
          onChange={(e) => handleSelectChange('bpm', e.target.value)}
          className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-royal-500 focus:bg-white/10 transition-all text-gray-200"
        >
          <option value="" className="bg-[#0b0819]">Any Tempo</option>
          <option value="slow" className="bg-[#0b0819]">Slow (&lt; 90 BPM)</option>
          <option value="medium" className="bg-[#0b0819]">Medium (90 - 120 BPM)</option>
          <option value="fast" className="bg-[#0b0819]">Fast (&gt; 120 BPM)</option>
        </select>
      </div>

    </aside>
  );
};
