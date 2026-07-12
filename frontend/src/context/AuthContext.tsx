import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  subscription_status: 'free' | 'active' | 'past_due' | 'canceled';
  current_period_end: number | null;
  free_downloads_count: number;
  remaining_free_downloads: number;
}

export interface FavoriteTrack {
  id: string;
  title: string;
  genre: string;
  mood: string;
  duration: number;
  thumbnail_url: string;
  preview_url: string;
  file_url: string;
  is_free: number;
  bpm: number;
  vocals: string;
  artist?: string;
}

export interface DownloadLog {
  download_id: string;
  license_id: string;
  download_date: number;
  buyer_name: string;
  buyer_email: string;
  track_id: string;
  title: string;
  genre: string;
  duration: number;
  thumbnail_url: string;
  preview_url: string;
  is_free: number;
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  favorites: string[]; // List of track IDs
  favoritesData: FavoriteTrack[]; // Fully populated favorites
  downloads: DownloadLog[];
  theme: 'dark' | 'light';
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (credential: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  toggleFavorite: (trackId: string) => Promise<boolean>;
  refreshDashboard: () => Promise<void>;
  toggleTheme: () => void;
  mockSubscribe: (plan: 'monthly' | 'yearly') => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('rt_token'));
  const [user, setUser] = useState<UserProfile | null>(
    localStorage.getItem('rt_user') ? JSON.parse(localStorage.getItem('rt_user')!) : null
  );
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesData, setFavoritesData] = useState<FavoriteTrack[]>([]);
  const [downloads, setDownloads] = useState<DownloadLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Handle HTML document class for theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('rt_theme') as 'dark' | 'light' || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('rt_theme', nextTheme);
    if (nextTheme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  };

  // Sync state and local storage
  const setSession = (newToken: string | null, newUser: UserProfile | null) => {
    setToken(newToken);
    setUser(newUser);
    if (newToken && newUser) {
      localStorage.setItem('rt_token', newToken);
      localStorage.setItem('rt_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('rt_token');
      localStorage.removeItem('rt_user');
      setFavorites([]);
      setFavoritesData([]);
      setDownloads([]);
    }
  };

  const refreshDashboard = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/user/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.profile);
        localStorage.setItem('rt_user', JSON.stringify(data.profile));
        setDownloads(data.downloads || []);
        setFavoritesData(data.favorites || []);
        setFavorites(data.favorites ? data.favorites.map((f: any) => f.id) : []);
      }
    } catch (err) {
      console.error('Failed to refresh user dashboard info', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      if (token) {
        await refreshDashboard();
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setSession(data.token, data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Signup failed' };
      }
      setSession(data.token, data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const googleLogin = async (credential: string) => {
    try {
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Google login failed' };
      }
      setSession(data.token, data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = () => {
    setSession(null, null);
  };

  const toggleFavorite = async (trackId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trackId }),
      });
      if (res.ok) {
        const data = await res.json();
        // Update favorites local array
        if (data.favorited) {
          setFavorites(prev => [...prev, trackId]);
        } else {
          setFavorites(prev => prev.filter(id => id !== trackId));
        }
        await refreshDashboard();
        return data.favorited;
      }
      return false;
    } catch {
      return false;
    }
  };

  const mockSubscribe = async (_plan: 'monthly' | 'yearly') => {
    if (!token) return { success: false, error: 'Auth required' };
    try {
      const res = await fetch('/api/stripe/mock-success', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        await refreshDashboard();
        return { success: true };
      }
      const data = await res.json();
      return { success: false, error: data.error || 'Mock checkout failed' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        favorites,
        favoritesData,
        downloads,
        theme,
        login,
        signup,
        googleLogin,
        logout,
        toggleFavorite,
        refreshDashboard,
        toggleTheme,
        mockSubscribe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
