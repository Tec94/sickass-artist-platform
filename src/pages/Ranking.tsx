import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

// Mock Data (will be replaced by backend later)
const LEADERBOARD = [
  {
    id: 1,
    title: "MIDNIGHT RUN",
    album: "Neon Nights",
    score: 12543,
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=100&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "ECHOES OF TOMORROW",
    album: "Future Tense",
    score: 10892,
    cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=100&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "WOLF MOON",
    album: "Alpha",
    score: 9876,
    cover: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=100&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "DIGITAL SHADOWS",
    album: "Neon Nights",
    score: 8754,
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=100&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "VELOCITY",
    album: "Single",
    score: 7532,
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=100&auto=format&fit=crop"
  }
];

export const Ranking = () => {
  const [votedIds, setVotedIds] = useState<number[]>([]);
  const { t } = useTranslation();

  const handleVote = (id: number) => {
    if (votedIds.includes(id)) {
        setVotedIds(prev => prev.filter(vid => vid !== id));
    } else {
        setVotedIds(prev => [...prev, id]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-display font-bold text-white uppercase tracking-wide mb-4">{t('ranking.title')}</h1>
        <p className="text-zinc-400 max-w-lg mx-auto">{t('ranking.subtitle')}</p>
        <button className="mt-8 bg-red-700 text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-red-600 transition-all">
          {t('ranking.submitTop3')}
        </button>
      </div>

      <div className="space-y-4">
        {LEADERBOARD.map((song, index) => (
          <div key={song.id} className="relative bg-zinc-900 border border-zinc-800 p-4 flex items-center gap-6 group hover:border-zinc-700 transition-all">
            <div className={`text-4xl font-display font-bold w-12 text-center transition-colors ${index < 3 ? 'text-white' : 'text-zinc-800 group-hover:text-red-900/50'}`}>
              #{index + 1}
            </div>
            
            <div className="w-16 h-16 bg-zinc-800 shrink-0 shadow-lg overflow-hidden">
              <img src={song.cover} alt={song.title} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1">
               <h3 className="text-xl font-bold text-white mb-1 uppercase">{song.title}</h3>
               <p className="text-zinc-500 text-sm">{song.album}</p>
            </div>

            <div className="flex items-center gap-8 mr-4">
               <div className="text-right hidden sm:block">
                 <div className="text-sm font-bold text-zinc-300">{t('ranking.score')}</div>
                 <div className="text-red-500 font-display font-bold text-lg">{song.score.toLocaleString()}</div>
               </div>
               
               <button 
                 onClick={() => handleVote(song.id)}
                 className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    votedIds.includes(song.id) 
                    ? 'bg-red-600 text-white' 
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                 }`}
               >
                 <iconify-icon icon="solar:arrow-up-linear" style={{ fontSize: '20px' }}></iconify-icon>
               </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 p-6 bg-zinc-900/50 border border-zinc-800 text-center text-sm text-zinc-500">
        <p>{t('ranking.leaderboardUpdate')}</p>
      </div>
    </div>
  );
};
