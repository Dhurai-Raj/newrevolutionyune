import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterSidebar } from '../components/FilterSidebar';
import type { FilterState } from '../components/FilterSidebar';
import { MusicCard } from '../components/MusicCard';
import type { TrackData } from '../context/AudioContext';
import { BiSearch, BiMusic, BiChevronLeft, BiChevronRight, BiLoaderAlt } from 'react-icons/bi';

export const Browse: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tracks, setTracks] = useState<TrackData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination State
  const limit = 10;
  const [offset, setOffset] = useState(0);

  // Read URL search params initially, merge with local filter state
  const getInitialFilters = (): FilterState => {
    return {
      genre: searchParams.get('genre') || '',
      mood: searchParams.get('mood') || '',
      instrument: searchParams.get('instrument') || '',
      vocals: searchParams.get('vocals') || '',
      bpm: searchParams.get('bpm') || '',
      is_free: searchParams.get('free') || '', // '1' or '0'
      sort_by: searchParams.get('sort_by') || 'newest'
    };
  };

  const [filters, setFilters] = useState<FilterState>(getInitialFilters);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Keep local search input synced with searchParams
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Sync state with URL search params changes
  useEffect(() => {
    setFilters({
      genre: searchParams.get('genre') || '',
      mood: searchParams.get('mood') || '',
      instrument: searchParams.get('instrument') || '',
      vocals: searchParams.get('vocals') || '',
      bpm: searchParams.get('bpm') || '',
      is_free: searchParams.get('free') || '',
      sort_by: searchParams.get('sort_by') || 'newest'
    });
    setOffset(0); // Reset to page 1 on filter changes
  }, [searchParams]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    
    // Update URL Search Params
    const params: Record<string, string> = {};
    if (searchQuery) params.search = searchQuery;
    if (newFilters.genre) params.genre = newFilters.genre;
    if (newFilters.mood) params.mood = newFilters.mood;
    if (newFilters.instrument) params.instrument = newFilters.instrument;
    if (newFilters.vocals) params.vocals = newFilters.vocals;
    if (newFilters.bpm) params.bpm = newFilters.bpm;
    if (newFilters.is_free !== '') params.free = newFilters.is_free;
    if (newFilters.sort_by) params.sort_by = newFilters.sort_by;

    setSearchParams(params);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (filters.genre) params.genre = filters.genre;
    if (filters.mood) params.mood = filters.mood;
    if (filters.instrument) params.instrument = filters.instrument;
    if (filters.vocals) params.vocals = filters.vocals;
    if (filters.bpm) params.bpm = filters.bpm;
    if (filters.is_free !== '') params.free = filters.is_free;
    if (filters.sort_by) params.sort_by = filters.sort_by;

    setSearchParams(params);
    setOffset(0);
  };

  // Fetch API call
  useEffect(() => {
    const fetchFilteredTracks = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.set('search', searchQuery);
        if (filters.genre) queryParams.set('genre', filters.genre);
        if (filters.mood) queryParams.set('mood', filters.mood);
        if (filters.instrument) queryParams.set('instrument', filters.instrument);
        if (filters.vocals) queryParams.set('vocals', filters.vocals);
        if (filters.bpm) queryParams.set('bpm', filters.bpm);
        if (filters.is_free !== '') queryParams.set('is_free', filters.is_free);
        if (filters.sort_by) queryParams.set('sort_by', filters.sort_by);
        
        queryParams.set('limit', limit.toString());
        queryParams.set('offset', offset.toString());

        const res = await fetch(`/api/tracks?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setTracks(data.tracks || []);
          setTotalCount(data.pagination?.total || 0);
        }
      } catch (err) {
        console.error('Failed to load browse tracks', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredTracks();
  }, [filters, searchQuery, offset]);

  // Pagination Handlers
  const handlePrevPage = () => {
    if (offset >= limit) {
      setOffset(prev => prev - limit);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (offset + limit < totalCount) {
      setOffset(prev => prev + limit);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10 flex flex-col lg:flex-row gap-8">
      
      {/* Filters Column */}
      <div className="w-full lg:w-fit flex-shrink-0">
        <FilterSidebar filters={filters} onChange={handleFilterChange} />
      </div>

      {/* Music Explorer Results Column */}
      <div className="flex-1 flex flex-col gap-6 w-full">
        
        {/* Search header panel */}
        <div className="w-full glass border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="w-full sm:max-w-md relative">
            <input
              type="text"
              placeholder="Search keyword in titles, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-royal-500 focus:bg-white/10 transition-all placeholder:text-gray-400 text-white"
            />
            <BiSearch className="absolute left-4 top-3.5 text-gray-400 text-lg" />
          </form>

          <div className="text-sm text-gray-400 font-semibold select-none flex-shrink-0">
            Found <span className="text-white">{totalCount}</span> royalty-free tracks
          </div>
        </div>

        {/* Tracks List */}
        {isLoading ? (
          <div className="w-full h-80 flex flex-col items-center justify-center gap-3">
            <BiLoaderAlt className="text-4xl text-royal-500 animate-spin" />
            <p className="text-sm text-gray-400">Loading catalog tracks...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tracks.map(track => (
              <MusicCard key={track.id} track={track} />
            ))}

            {tracks.length === 0 && (
              <div className="w-full h-80 glass border border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 text-center p-6">
                <BiMusic className="text-5xl text-gray-600" />
                <div>
                  <h3 className="font-display font-bold text-lg text-white">No Tracks Found</h3>
                  <p className="text-sm text-gray-400 mt-1 max-w-sm">Try clearing filters or search queries to explore the full library.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pb-10">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-white/5"
            >
              <BiChevronLeft className="text-xl" /> Previous
            </button>
            <span className="text-xs text-gray-400 font-semibold select-none">
              Page <span className="text-white">{currentPage}</span> of <span className="text-white">{totalPages}</span>
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-white/5"
            >
              Next <BiChevronRight className="text-xl" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
