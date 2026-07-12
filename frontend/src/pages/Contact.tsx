import React, { useState } from 'react';
import { BiEnvelope, BiUser, BiComment, BiLoaderAlt } from 'react-icons/bi';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      alert("Thank you! Your message has been sent to New Revolution Tune support.");
      setName('');
      setEmail('');
      setMessage('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 w-full py-16 flex flex-col gap-8">
      
      <div className="text-center flex flex-col gap-2">
        <h1 className="font-display font-black text-3xl text-white tracking-wide">Contact Us</h1>
        <p className="text-sm text-gray-400">Send us your feedback, questions, or custom license inquiries.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-xl">
        
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Name</label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-royal-500 focus:bg-white/10 transition-all text-white"
            />
            <BiUser className="absolute left-4 top-3.5 text-gray-500 text-lg" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-royal-500 focus:bg-white/10 transition-all text-white"
            />
            <BiEnvelope className="absolute left-4 top-3.5 text-gray-500 text-lg" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message Description</label>
          <div className="relative">
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your query details here..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-royal-500 focus:bg-white/10 transition-all text-white resize-none"
            />
            <BiComment className="absolute left-4 top-3.5 text-gray-500 text-lg" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-xl bg-gradient-royal text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-95 disabled:opacity-50 mt-2 shadow-lg hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
        >
          {isSubmitting ? (
            <BiLoaderAlt className="animate-spin text-lg" />
          ) : (
            <span>Send Message</span>
          )}
        </button>

      </form>

    </div>
  );
};
