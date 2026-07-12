import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BiEnvelope, BiLock, BiLoaderAlt, BiMusic } from 'react-icons/bi';
import { FaGoogle } from 'react-icons/fa';

interface AuthPagesProps {
  mode: 'login' | 'register';
}

export const AuthPages: React.FC<AuthPagesProps> = ({ mode }) => {
  const { login, signup, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target after auth
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const result = mode === 'login' 
        ? await login(email, password) 
        : await signup(email, password);

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMsg(result.error || 'Authentication failed');
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Simulated Google login for local runs
  const handleGoogleLoginMock = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Mock Google OAuth JWT structure
      const mockPayload = {
        iss: 'https://accounts.google.com',
        sub: 'google-sub-mock-id-123456',
        email: email || 'google-user@newrevolutiontune.com',
        email_verified: true,
        name: 'Google User',
        picture: ''
      };
      
      const mockHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const mockBody = btoa(JSON.stringify(mockPayload));
      const mockSignature = 'mocksignature';
      const mockCredential = `${mockHeader}.${mockBody}.${mockSignature}`;

      const result = await googleLogin(mockCredential);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMsg(result.error || 'Google login verification failed');
      }
    } catch {
      setErrorMsg('Failed to process Google Auth.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-b from-[#0b0819] via-[#0d0a25] to-[#0b0819]">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-royal-600/10 blur-3xl" />

      {/* Card */}
      <div className="w-full max-w-md glass border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-royal flex items-center justify-center shadow-lg shadow-royal-600/20 mb-2">
            <BiMusic className="text-white text-2xl" />
          </div>
          <h2 className="font-display font-black text-2xl text-white tracking-wide">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-gray-400">
            {mode === 'login' 
              ? 'Sign in to access your downloaded tracks & favorites' 
              : 'Join New Revolution Tune and download up to 20 tracks for free'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-royal-500 focus:bg-white/10 transition-all text-white placeholder:text-gray-500"
              />
              <BiEnvelope className="absolute left-4 top-3.5 text-gray-500 text-lg" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-royal-500 focus:bg-white/10 transition-all text-white placeholder:text-gray-500"
              />
              <BiLock className="absolute left-4 top-3.5 text-gray-500 text-lg" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-gradient-royal hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer mt-2"
          >
            {loading ? (
              <BiLoaderAlt className="animate-spin text-lg" />
            ) : (
              <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-white/5 flex-1" />
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Or continue with</span>
          <div className="h-px bg-white/5 flex-1" />
        </div>

        {/* Google OAuth simulation button */}
        <button
          onClick={handleGoogleLoginMock}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
        >
          <FaGoogle className="text-sm" />
          <span>Google Accounts Login</span>
        </button>

        {/* Switching mode footer */}
        <div className="text-center text-xs text-gray-400 mt-8">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="text-royal-500 hover:underline font-bold">
                Sign Up Free
              </Link>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-royal-500 hover:underline font-bold">
                Sign In
              </Link>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
