import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const Profile = () => {
  const { user, isSignedIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  }

  if (!isSignedIn || !user) {
    return (
      <div className="p-8 text-center bg-black/50 rounded-2xl border border-gray-800">
        <p className="text-gray-400 mb-6">Please sign in to view your profile.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const stats = {
    totalPoints: (user as any).points || (user as any).votedPoints || 0,
    rank: (user as any).rank || 99,
    level: Math.floor(((user as any).points || (user as any).votedPoints || 0) / 100) + 1,
    xp: ((user as any).points || (user as any).votedPoints || 0) % 100
  };

  const socials = (user as any).socials || {};

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in font-display">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-[1600px] mx-auto">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-950 border border-zinc-900 rounded-sm p-8 flex flex-col items-center text-center sticky top-24">
            <div className="relative mb-6">
              <div className="w-40 h-40 rounded-full border-2 border-red-600 p-1 flex items-center justify-center overflow-hidden">
                <img 
                  src="/src/public/assets/test-image.jpg" 
                  alt={user.displayName || 'User'} 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-2 rounded-full shadow-lg">
                <iconify-icon icon="solar:medal-star-bold" width="24" height="24"></iconify-icon>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white uppercase tracking-tighter mb-1">{user.displayName}</h2>
            <p className="text-red-500 font-bold text-sm mb-2">@{(user as any).username || 'user'}</p>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-4">Wolfpack Elite Member</p>

            {/* Bio */}
            {(user as any).bio && (
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 px-2">
                {(user as any).bio}
              </p>
            )}

            {/* Social Links */}
            {(socials.twitter || socials.instagram || socials.tiktok) && (
              <div className="flex gap-3 mb-8">
                {socials.twitter && (
                  <a href={`https://twitter.com/${socials.twitter}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:border-red-600 transition-all">
                    <iconify-icon icon="simple-icons:x" width="18" height="18"></iconify-icon>
                  </a>
                )}
                {socials.instagram && (
                  <a href={`https://instagram.com/${socials.instagram}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:border-red-600 transition-all">
                    <iconify-icon icon="simple-icons:instagram" width="18" height="18"></iconify-icon>
                  </a>
                )}
                {socials.tiktok && (
                  <a href={`https://tiktok.com/@${socials.tiktok}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:border-red-600 transition-all">
                    <iconify-icon icon="simple-icons:tiktok" width="18" height="18"></iconify-icon>
                  </a>
                )}
              </div>
            )}

            <div className="w-full space-y-4 mb-8">
              <div className="bg-zinc-900/50 p-4 rounded-sm border border-zinc-800">
                 <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Points</p>
                 <p className="text-white text-2xl font-bold">{stats.totalPoints}</p>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-sm border border-zinc-800">
                 <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Rank</p>
                 <p className="text-red-500 text-2xl font-bold">#{stats.rank}</p>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="w-full mb-6">
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3 text-left">Language</p>
              <div className="flex gap-2">
                {['English', 'Spanish'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-sm border transition-all ${
                      selectedLanguage === lang 
                        ? 'bg-red-600/10 border-red-600 text-white' 
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-600'
                    }`}
                  >
                    <iconify-icon icon={lang === 'English' ? 'twemoji:flag-united-states' : 'twemoji:flag-spain'} width="18" height="18" style={{ filter: selectedLanguage === lang ? 'none' : 'grayscale(1)' }}></iconify-icon>
                    <span className="text-xs font-bold uppercase tracking-wider">{lang}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full">
              <button 
                onClick={() => navigate('/profile/edit')}
                className="w-full bg-white hover:bg-zinc-200 text-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Activity & Quests */}
        <div className="lg:col-span-2 space-y-12">
          {/* XP Progress Section */}
          <section>
             <div className="flex justify-between items-end mb-4">
                <div>
                   <h3 className="text-white font-bold text-xl uppercase tracking-tighter">Current Level</h3>
                   <p className="text-zinc-500 text-xs font-medium">Progress towards Next Level</p>
                </div>
                <div className="text-right">
                   <p className="text-white font-bold text-lg">LEVEL {stats.level}</p>
                   <p className="text-red-500 text-[10px] font-bold tracking-widest uppercase">Elite Status</p>
                </div>
             </div>
             <div className="h-4 bg-zinc-900/50 rounded-full border border-zinc-800 overflow-hidden p-0.5">
                <motion.div 
                   className="h-full bg-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                   initial={{ width: 0 }}
                   animate={{ width: `${stats.xp}%` }}
                   transition={{ duration: 1, ease: 'easeOut' }}
                />
             </div>
             <div className="flex justify-between mt-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                <span>{stats.xp} XP</span>
                <span>100 XP TO NEXT</span>
             </div>
          </section>

          {/* Activity Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold text-white uppercase tracking-tighter flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-red-600 rounded-sm"></span>
                  Active Quests
               </h3>
               <button className="text-[10px] text-zinc-500 hover:text-white uppercase font-bold tracking-widest">View All</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="bg-zinc-950 border border-zinc-900 p-6 rounded-sm group hover:border-red-900/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-3 bg-zinc-900 border border-zinc-800 group-hover:bg-red-950/20 group-hover:border-red-900/50 transition-colors">
                          <iconify-icon icon="solar:fire-bold" class="text-red-600 text-xl"></iconify-icon>
                       </div>
                       <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] border border-zinc-800 px-2 py-1">In Progress</span>
                    </div>
                    <h4 className="text-white font-bold uppercase text-xs tracking-wide mb-2">Wolfpack Recruit {i}</h4>
                    <p className="text-zinc-500 text-xs mb-4">Complete 5 forum posts and get 10 likes to earn rewards.</p>
                    <div className="h-1.5 bg-zinc-900 rounded-full">
                       <div className="h-full bg-zinc-800 w-1/3 rounded-full"></div>
                    </div>
                 </div>
               ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};
