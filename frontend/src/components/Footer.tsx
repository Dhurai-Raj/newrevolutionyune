import React from 'react';
import { Link } from 'react-router-dom';
import { BiMusic, BiEnvelope } from 'react-icons/bi';
import { FaTwitter, FaYoutube, FaSoundcloud, FaInstagram } from 'react-icons/fa';

export const Footer: React.FC = () => {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing to RoyalTune newsletter!');
  };

  return (
    <footer className="w-full bg-[#070512] border-t border-white/5 pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        
        {/* About & Branding */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-royal flex items-center justify-center">
              <BiMusic className="text-white text-xl" />
            </div>
            <span className="font-display font-black text-lg tracking-wider bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
              New Revolution Tune
            </span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed">
            Premium royalty-free music for content creators, podcasts, YouTube, film, and commercial productions. Modern, fast, and fully licensed.
          </p>
          {/* Social Icons */}
          <div className="flex items-center gap-4 mt-2">
            <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-royal-600 hover:text-white transition-all text-gray-400">
              <FaTwitter />
            </a>
            <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-royal-600 hover:text-white transition-all text-gray-400">
              <FaYoutube />
            </a>
            <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-royal-600 hover:text-white transition-all text-gray-400">
              <FaSoundcloud />
            </a>
            <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-royal-600 hover:text-white transition-all text-gray-400">
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* Explore Links */}
        <div>
          <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Explore</h4>
          <ul className="flex flex-col gap-2.5 text-sm text-gray-400">
            <li><Link to="/browse?genre=Cinematic" className="hover:text-royal-500 transition-colors">Cinematic Tracks</Link></li>
            <li><Link to="/browse?genre=Corporate" className="hover:text-royal-500 transition-colors">Corporate Themes</Link></li>
            <li><Link to="/browse?genre=Gaming" className="hover:text-royal-500 transition-colors">Gaming Music</Link></li>
            <li><Link to="/browse?free=1" className="hover:text-royal-500 transition-colors">Free Download Library</Link></li>
            <li><Link to="/pricing" className="hover:text-royal-500 transition-colors">Premium Subscriptions</Link></li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Support & Company</h4>
          <ul className="flex flex-col gap-2.5 text-sm text-gray-400">
            <li><Link to="/about" className="hover:text-royal-500 transition-colors">About Us</Link></li>
            <li><Link to="/blog" className="hover:text-royal-500 transition-colors">Our Blog</Link></li>
            <li><Link to="/contact" className="hover:text-royal-500 transition-colors">Contact Support</Link></li>
            <li><Link to="/terms" className="hover:text-royal-500 transition-colors">Terms of Use</Link></li>
            <li><Link to="/privacy" className="hover:text-royal-500 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/dmca" className="hover:text-royal-500 transition-colors">DMCA Notice</Link></li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Subscribe to Newsletter</h4>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Get the newest track drops, licensing updates, and discount codes directly in your inbox.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="email"
                required
                placeholder="Your email address"
                className="w-full h-10 pl-10 pr-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-royal-500 focus:bg-white/10 transition-all placeholder:text-gray-500"
              />
              <BiEnvelope className="absolute left-3 top-3 text-gray-500 text-lg" />
            </div>
            <button
              type="submit"
              className="h-10 px-4 rounded-lg bg-royal-600 hover:bg-royal-700 text-white font-semibold text-sm transition-all"
            >
              Join
            </button>
          </form>
        </div>

      </div>

      {/* Copy & Legal bottom */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/5 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} New Revolution Tune Music Platform. All Rights Reserved. All tracks are subject to respective license conditions.</p>
      </div>
    </footer>
  );
};
