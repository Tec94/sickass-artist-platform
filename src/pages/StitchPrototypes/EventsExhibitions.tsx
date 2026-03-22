import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';
import { User, ShoppingCart } from 'lucide-react';
import SharedNavbar from '../../components/Navigation/SharedNavbar';
export default function EventsExhibitions() {
  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#3C2A21] w-full font-sans">
      <style>{`
        body {
            font-family: 'Manrope', sans-serif;
            background-color: theme('colors.parchment');
            color: theme('colors.ink');
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        /* Custom border utility to match the strict editorial design */
        .border-ink {
            border-color: #1C1B1A;
        }
        
        /* Smooth transitions for interactive elements */
        .transition-all-custom {
            transition-property: all;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 150ms;
        }

        /* Material Icons setup */
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
    `}</style>
      

<SharedNavbar />

<main className="flex-1 pt-[72px] pb-32 flex justify-center w-full px-6">

<div className="w-full max-w-[800px] flex flex-col pt-16">

<section className="mb-24">
<h1 className="text-massive font-light leading-none tracking-tight text-center border-b-[3px] border-ink pb-4">2024</h1>
<div className="flex flex-col border-t border-ink">

<div onClick={() => { setNextTransition('push'); window.location.href = '/proto/experience-albert'; }} className="group h-[80px] flex items-center justify-between px-4 border-b border-ink transition-all-custom hover:bg-[#FCFBF9] hover:rounded cursor-pointer">
<div className="w-1/4">
<span className="text-sm font-bold uppercase tracking-widest">14 Nov</span>
</div>
<div className="flex-1 text-center">
<span className="text-xl font-light tracking-wide uppercase">Royal Albert Hall</span>
<span className="text-xs font-semibold text-muted uppercase tracking-widest block mt-1">London, UK</span>
</div>
<div className="w-1/4 flex justify-end">
<button onClick={(e) => { e.stopPropagation(); setNextTransition('push'); window.location.href = '/proto/access-tiers-albert'; }} className="text-sm font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white px-4 py-2 rounded transition-colors border border-transparent hover:border-primary">
                                RSVP
                            </button>
</div>
</div>

<div onClick={() => { setNextTransition('push'); window.location.href = '/proto/experience-albert'; }} className="group h-[80px] flex items-center justify-between px-4 border-b border-ink transition-all-custom hover:bg-[#FCFBF9] hover:rounded cursor-pointer">
<div className="w-1/4">
<span className="text-sm font-bold uppercase tracking-widest">22 Nov</span>
</div>
<div className="flex-1 text-center">
<span className="text-xl font-light tracking-wide uppercase">O2 Arena</span>
<span className="text-xs font-semibold text-muted uppercase tracking-widest block mt-1">London, UK</span>
</div>
<div className="w-1/4 flex justify-end">
<button onClick={(e) => { e.stopPropagation(); setNextTransition('push'); window.location.href = '/proto/access-tiers-albert'; }} className="text-sm font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white px-4 py-2 rounded transition-colors border border-transparent hover:border-primary">
                                RSVP
                            </button>
</div>
</div>

<div className="group h-[80px] flex items-center justify-between px-4 border-b border-ink transition-all-custom hover:bg-[#FCFBF9] hover:rounded cursor-not-allowed">
<div className="w-1/4">
<span className="text-sm font-bold uppercase tracking-widest text-muted">05 Dec</span>
</div>
<div className="flex-1 text-center opacity-60">
<span className="text-xl font-light tracking-wide uppercase text-muted">Madison Square Garden</span>
<span className="text-xs font-semibold text-muted uppercase tracking-widest block mt-1">New York, NY</span>
</div>
<div className="w-1/4 flex justify-end">
<span className="text-sm font-bold uppercase tracking-widest text-muted">Sold Out</span>
</div>
</div>
</div>
</section>

<section className="mb-24">
<h1 className="text-massive font-light leading-none tracking-tight text-center border-b-[3px] border-ink pb-4">2025</h1>
<div className="flex flex-col border-t border-ink">

<div className="group h-[80px] flex items-center justify-between px-4 border-b border-ink transition-all-custom hover:bg-[#FCFBF9] hover:rounded cursor-pointer">
<div className="w-1/4">
<span className="text-sm font-bold uppercase tracking-widest">12 Jan</span>
</div>
<div className="flex-1 text-center">
<span className="text-xl font-light tracking-wide uppercase">Sydney Opera House</span>
<span className="text-xs font-semibold text-muted uppercase tracking-widest block mt-1">Sydney, AU</span>
</div>
<div className="w-1/4 flex justify-end">
<button className="text-sm font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white px-4 py-2 rounded transition-colors border border-transparent hover:border-primary">
                                RSVP
                            </button>
</div>
</div>

<div className="group h-[80px] flex items-center justify-between px-4 border-b border-ink transition-all-custom hover:bg-[#FCFBF9] hover:rounded">
<div className="w-1/4">
<span className="text-sm font-bold uppercase tracking-widest text-muted">Spr '25</span>
</div>
<div className="flex-1 text-center">
<span className="text-xl font-light tracking-wide uppercase text-muted">Tokyo Dome</span>
<span className="text-xs font-semibold text-muted uppercase tracking-widest block mt-1">Tokyo, JP</span>
</div>
<div className="w-1/4 flex justify-end">
<span className="text-sm font-bold uppercase tracking-widest text-muted">Coming Soon</span>
</div>
</div>
</div>
</section>
</div>
</main>

    </div>
  );
}