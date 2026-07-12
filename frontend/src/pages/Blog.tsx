import React, { useState } from 'react';
import { BiCalendar, BiUser, BiArrowBack } from 'react-icons/bi';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  image: string;
}

export const Blog: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const articles: Article[] = [
    {
      id: 1,
      title: "How to Choose the Best Background Music for YouTube Videos",
      excerpt: "Discover the critical rules of setting video mood, pacing, and licensing rights to double your channel monetization.",
      content: "Setting the background score of your videos determines how long viewers stay. A high-paced vlog needs energetic electronic or acoustic beats, while a deep documentary requires ambient or cinematic sounds. Always ensure synchronization rights are cleared under a premium license to avoid YouTube copyright claim warnings.",
      date: "July 10, 2026",
      author: "New Revolution Tune Creative Team",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80"
    },
    {
      id: 2,
      title: "Understanding Music Licensing: Standard vs Commercial Rights",
      excerpt: "What is synchronisation? Learn the difference between personal attribution and commercial royalty-free releases.",
      content: "Music licensing can seem complex, but it boils down to synchronization: combining audio with moving images. Personal/Creative Commons license models require you to attribute creators and prohibit monetization. Commercial licenses release all syncing claims, enabling developers, agencies, and film productions to monetize their platforms safely.",
      date: "June 25, 2026",
      author: "Legal & Copyright Team",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80"
    }
  ];

  if (selectedArticle) {
    return (
      <div className="max-w-3xl mx-auto px-4 w-full py-16 flex flex-col gap-6">
        <button 
          onClick={() => setSelectedArticle(null)}
          className="flex items-center gap-1 text-sm font-semibold text-gray-400 hover:text-white cursor-pointer"
        >
          <BiArrowBack className="text-lg" /> Back to Articles
        </button>
        <img 
          src={selectedArticle.image} 
          alt="" 
          className="w-full h-80 object-cover rounded-3xl border border-white/10 shadow-lg" 
        />
        <div className="flex flex-col gap-2">
          <h1 className="font-display font-black text-2xl sm:text-4xl text-white leading-tight">{selectedArticle.title}</h1>
          <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
            <span className="flex items-center gap-1"><BiCalendar /> {selectedArticle.date}</span>
            <span className="flex items-center gap-1"><BiUser /> By {selectedArticle.author}</span>
          </div>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line border-t border-white/5 pt-6">
          {selectedArticle.content}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 w-full py-16 flex flex-col gap-10">
      
      <div className="text-center flex flex-col gap-2">
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">New Revolution Tune Blog</h1>
        <p className="text-sm sm:text-base text-gray-300">Creator tutorials, sound design guides, and copyright licensing tips.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {articles.map(article => (
          <div 
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="rounded-3xl glass border border-white/5 overflow-hidden cursor-pointer hover:border-royal-500/30 transition-all flex flex-col justify-between group"
          >
            <div className="w-full h-48 overflow-hidden relative border-b border-white/5">
              <img 
                src={article.image} 
                alt="" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
            <div className="p-6 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1"><BiCalendar /> {article.date}</span>
              </div>
              <h3 className="font-display font-bold text-base text-white group-hover:text-royal-500 transition-colors leading-snug">
                {article.title}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {article.excerpt}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
