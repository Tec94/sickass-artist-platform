import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';
import { Search, ShoppingBag, ArrowRight, Calendar, Circle, Trophy, UserCircle } from 'lucide-react';

export default function DashboardMobile() {
  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#3C2A21] w-full font-sans">
      <style>{`
        body {
            background-color: #F4F0EB;
            color: #1C1B1A;
            font-family: 'Manrope', sans-serif;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            min-height: max(884px, 100dvh);
        }
        
        /* Strict Borders */
        .border-ink { border-color: rgba(28, 27, 26, 0.1); }

        /* Typography */
        h1, h2, h3, h4, .font-serif {
            font-family: 'Cormorant Garamond', serif;
            letter-spacing: -0.02em;
        }
        .text-xs-wide {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            font-weight: 600;
        }

        /* Bottom Nav Blur */
        .glass-nav {
            background: rgba(244, 240, 235, 0.85);
            backdrop-filter: blur(12px);
        }

        /* Custom Scroll */
        ::-webkit-scrollbar {
            width: 4px;
        }
        ::-webkit-scrollbar-track {
            background: #F4F0EB;
        }
        ::-webkit-scrollbar-thumb {
            background: #007A78;
        }
    `}</style>
      

<header className="h-16 border-b border-ink/10 bg-background-light flex items-center justify-between px-6 sticky top-0 z-50">
<Link className="font-serif text-xl font-semibold tracking-tight text-ink" to="/dashboard">THE ESTATE</Link>
<div className="flex items-center gap-4">
<button className="text-ink">
<Search />
</button>
<button className="text-ink relative pt-1">
<ShoppingBag />
<span className="absolute -top-1 -right-2.5 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-background-light">2</span>
</button>
</div>
</header>

<main className="flex-1 flex flex-col">

<section className="relative w-full aspect-[4/5] bg-cover bg-center overflow-hidden flex items-end p-8" data-alt="Abstract architectural concrete structure" >
<div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/20 to-transparent"></div>
<div className="relative z-10 w-full">

<span className="text-white bg-primary px-2 py-0.5 text-xs-wide inline-block mb-3 font-bold">Transmission 001</span>
<h2 className="font-serif text-5xl text-white leading-tight font-medium mb-3">LATEST<br />ERA</h2>
<p className="text-white font-serif text-lg italic mb-6 opacity-90">"A synthesis of digital permanence and physical entropy."</p>
<button className="w-full border-2 border-white text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-ink transition-all rounded-sm backdrop-blur-sm">
                    Enter Exhibition
                </button>
</div>
</section>

<section className="px-6 py-8 bg-vellum-light border-y border-ink/5">
<div className="flex items-center justify-between mb-6">
<div>
<span className="text-xs-wide text-muted block mb-1">Identity</span>
<h4 className="font-serif text-2xl text-ink">Resident #4,102</h4>
</div>
<div className="text-right">
<span className="text-xs-wide text-primary block">Rank XII</span>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted">
<span>Archive Progress</span>
<span className="text-ink">72%</span>
</div>
<div className="w-full h-1.5 bg-ink/5 rounded-full overflow-hidden">
<div className="bg-primary h-full" ></div>
</div>
</div>
</section>

<section className="flex flex-col bg-background-light">
<div className="px-6 py-6 border-b border-ink/10 flex items-center justify-between">
<h3 className="font-serif text-2xl text-ink font-medium">Dispatches</h3>
<span className="text-xs-wide text-muted">Log 24</span>
</div>
<div className="flex flex-col divide-y divide-ink/5">

<Link className="px-6 py-6 group flex flex-col gap-2 hover:bg-vellum-light transition-colors" to="/dashboard">
<span className="text-xs-wide text-primary/80">14 NOV 2024</span>
<h4 className="font-serif text-xl text-ink">The Vault Opens: Archival Merch Release</h4>
<p className="text-muted text-sm line-clamp-2 leading-relaxed">A limited selection of pieces from the 2019-2021 touring era have been restored and made available.</p>
</Link>

<Link className="px-6 py-6 group flex flex-col gap-2 hover:bg-vellum-light transition-colors" to="/dashboard">
<span className="text-xs-wide text-primary/80">02 NOV 2024</span>
<h4 className="font-serif text-xl text-ink">Global Coordinates Discovered</h4>
<p className="text-muted text-sm line-clamp-2 leading-relaxed">New waypoints have appeared in The Outergrounds. Seekers are advised to check the Journey map.</p>
</Link>

<Link className="px-6 py-6 group flex flex-col gap-2 hover:bg-vellum-light transition-colors" to="/dashboard">
<span className="text-xs-wide text-primary/80">28 OCT 2024</span>
<h4 className="font-serif text-xl text-ink">The Meaning of 'Vellum'</h4>
<p className="text-muted text-sm line-clamp-2 leading-relaxed">A highlighted thread from the community dissecting the thematic use of materials in the latest visual album.</p>
</Link>
</div>
<div className="px-6 py-10 flex justify-center">
<Link className="text-xs-wide text-primary flex items-center gap-2 border border-primary/40 px-6 py-3 rounded-sm hover:bg-primary hover:text-white transition-all" to="/dashboard">
                    Complete Archive
                    <ArrowRight className="text-[14px]" />
</Link>
</div>
</section>
</main>

<nav className="fixed bottom-0 left-0 w-full h-16 border-t border-ink/10 bg-background-light/90 backdrop-blur-lg z-50 flex items-center justify-around px-1">
<Link className="flex flex-col items-center justify-center gap-1 text-primary" to="/dashboard">
<ShoppingBag className="!text-[20px]" />
<span className="text-[9px] uppercase font-bold tracking-tighter" >Store</span>
</Link>
<Link className="flex flex-col items-center justify-center gap-1 text-muted hover:text-ink transition-colors" to="/dashboard">
<Calendar className="!text-[20px]" />
<span className="text-[9px] uppercase font-bold tracking-tighter" >Events</span>
</Link>
<Link className="flex flex-col items-center justify-center gap-1 text-muted hover:text-ink transition-colors" to="/dashboard">
<Circle className="!text-[20px]" />
<span className="text-[9px] uppercase font-bold tracking-tighter" >Community</span>
</Link>
<Link className="flex flex-col items-center justify-center gap-1 text-muted hover:text-ink transition-colors" to="/dashboard">
<Trophy className="!text-[20px]" />
<span className="text-[9px] uppercase font-bold tracking-tighter" >Rankings</span>
</Link>
<Link className="flex flex-col items-center justify-center gap-1 text-muted hover:text-ink transition-colors" to="/dashboard">
<Circle className="!text-[20px]" />
<span className="text-[9px] uppercase font-bold tracking-tighter" >Journey</span>
</Link>
<Link className="flex flex-col items-center justify-center gap-1 text-muted hover:text-ink transition-colors" to="/dashboard">
<UserCircle className="!text-[20px]" />
<span className="text-[9px] uppercase font-bold tracking-tighter" >Identity</span>
</Link>
</nav>

    </div>
  );
}