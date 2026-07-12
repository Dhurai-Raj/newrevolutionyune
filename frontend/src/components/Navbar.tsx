import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BiSun, BiMoon, BiSearch, 
  BiChevronDown, BiLogOut, BiGridAlt, BiCloudUpload, 
  BiMusic
} from 'react-icons/bi';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout, theme, toggleTheme } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<{ title: string; id: string }[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setSuggestions([]);
    }
  };

  // Autocomplete fetch
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tracks/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside listener for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-40 w-full glass border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-royal flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <BiMusic className="text-white text-2xl" />
            </div>
            <span className="font-display font-black text-xl tracking-wider bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-300 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              New Revolution Tune
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/browse" className="text-sm font-semibold hover:text-royal-500 transition-colors">
              Explore Music
            </Link>
            <Link to="/pricing" className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors">
              Pricing Plans
            </Link>
            <Link to="/about" className="text-sm font-semibold hover:text-royal-500 transition-colors">
              About
            </Link>
          </div>
        </div>

        {/* Search & Profile Section */}
        <div className="flex items-center gap-4 flex-1 max-w-md mx-4 relative">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search royalty-free tracks, genre, moods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-full bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-royal-500 focus:bg-white/10 transition-all placeholder:text-gray-400"
              />
              <BiSearch className="absolute left-3.5 top-3 text-gray-400 text-lg" />
            </div>

            {/* Autocomplete Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute top-12 left-0 right-0 glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      navigate(`/track/${item.id}`);
                      setSearchQuery('');
                      setSuggestions([]);
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <BiMusic className="text-royal-500" />
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        <div className="flex items-center gap-3">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-lg"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <BiSun className="text-yellow-400" /> : <BiMoon className="text-royal-600" />}
          </button>

          {/* User Auth Info */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-royal-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.email[0].toUpperCase()}
                </div>
                <BiChevronDown className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2.5 w-56 rounded-2xl glass border border-white/10 shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                    <p className="text-xs text-gray-400 truncate">Logged in as</p>
                    <p className="text-sm font-semibold truncate">{user?.email}</p>
                    {user?.subscription_status === 'active' ? (
                      <span className="inline-block mt-1 text-[10px] bg-gradient-gold text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Premium Member
                      </span>
                    ) : (
                      <span className="inline-block mt-1 text-[10px] bg-white/10 text-gray-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Free: {user?.remaining_free_downloads} Left
                      </span>
                    )}
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-white/5 transition-colors"
                  >
                    <BiGridAlt className="text-royal-500 text-lg" />
                    My Dashboard
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-yellow-400 hover:bg-white/5 transition-colors font-medium"
                    >
                      <BiCloudUpload className="text-lg" />
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-colors mt-1"
                  >
                    <BiLogOut className="text-lg" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden sm:block text-sm font-semibold px-4 py-2 hover:text-royal-500 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-bold bg-gradient-royal text-white px-5 py-2 rounded-full hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all transform hover:-translate-y-0.5"
              >
                Join Free
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};
