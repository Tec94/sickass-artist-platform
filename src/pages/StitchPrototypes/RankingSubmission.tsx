import { Link } from 'react-router-dom';
import SharedNavbar from '../../components/Navigation/SharedNavbar';
import { ArrowLeft } from 'lucide-react';

export default function RankingSubmission() {
  return (
    <div className="h-full overflow-y-auto bg-parchment text-ink w-full font-sans flex flex-col">
      <SharedNavbar />
      
      <main className="flex-1 flex flex-col md:flex-row w-full max-w-[1600px] mx-auto">
        {/* Left Side: Static Visual Ranking List */}
        <div className="flex-1 p-8 md:p-16 border-r border-ink flex flex-col overflow-y-auto bg-vellum">
          <div className="mb-12">
            <Link to="/rankings" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors mb-8">
              <ArrowLeft size={16} /> Back to Rankings
            </Link>
            <h1 className="font-display text-4xl md:text-6xl uppercase tracking-tighter leading-none mb-4">Submit Your Archive</h1>
            <p className="font-headline italic text-lg text-muted">Arrange your top selections to contribute to the global estate ledger.</p>
          </div>
          
          <div className="flex-1 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-ink/20 pb-4 mb-6">Your Selections (Static View)</h3>
            
            {[
              { rank: '01', title: 'Midnight City', duration: '4:03' },
              { rank: '02', title: 'Nightcall', duration: '4:18' },
              { rank: '03', title: 'Under Your Spell', duration: '3:52' },
              { rank: '04', title: 'A Real Hero', duration: '4:27' },
              { rank: '05', title: 'Odd Look', duration: '4:11' },
            ].map((track) => (
              <div key={track.rank} className="p-4 border border-ink bg-parchment hover:bg-[#1C1B1A]/5 transition-colors flex items-center gap-6 cursor-grab shadow-sm">
                <span className="font-display text-2xl text-primary leading-none w-8">{track.rank}</span>
                <span className="flex-1 font-semibold text-sm uppercase tracking-wider">{track.title}</span>
                <span className="font-mono text-sm text-muted">{track.duration}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-ink/20 flex justify-end">
            <button className="bg-ink text-vellum px-12 py-4 font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-primary transition-colors cursor-pointer">
              Seal & Submit Archive
            </button>
          </div>
        </div>
        
        {/* Right Side: Image Display */}
        <div className="flex-1 relative hidden md:block min-h-[500px]">
          <img 
            src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=1600" 
            alt="Submission Moodboard" 
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-90 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-parchment via-transparent to-transparent"></div>
          
          <div className="absolute bottom-16 left-16 right-16">
            <h2 className="font-display text-5xl text-ink uppercase tracking-tighter leading-none">Curatorial Insight</h2>
            <div className="w-12 h-1 bg-primary mt-6 mb-6"></div>
            <p className="font-headline italic text-xl text-ink max-w-md">"The archive is not simply a record of what was, but a blueprint for what will be remembered."</p>
          </div>
        </div>
      </main>
    </div>
  );
}
