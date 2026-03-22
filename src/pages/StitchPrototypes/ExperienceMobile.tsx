import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';
import { ArrowLeft, Circle, ShoppingBag, Calendar } from 'lucide-react';

export default function ExperienceMobile() {
  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#3C2A21] w-full font-sans">
      <style>{`
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }
        body { background-color: #F4EFE6; }
        .grid-ink { border: 1px solid rgba(60, 42, 33, 0.15); }
    `}</style>
      

<nav className="sticky top-0 z-50 bg-[#F4EFE6] flex justify-between items-center w-full px-6 h-16 border-b border-[#3C2A21]">
<ArrowLeft className="text-on-surface" />
<h1 className="font-headline italic text-2xl tracking-tight text-[#C36B42]">ARCHIVE</h1>
<Circle className="text-on-surface" />
</nav>
<main className="max-w-md mx-auto">

<section className="relative w-full aspect-[4/5] bg-surface-container-highest overflow-hidden">
<img className="w-full h-full object-cover shadow-md" data-alt="Grand interior architecture of the Royal Albert Hall" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrmDwmzg5bpex1ODuJ-L3IFKoesABt_LwlfOY0POqyHZ5xB_JGvN9D1kOsWoWZtq7YoF71Dn_ZLMj1VUBdjBMkh-yvIcL5yR8Nzz_9-lFfUsz0t1tRLcmp2wXY_73144eETftSd2DWWspm518anvnQCIY_drO_WSiqqo_JJ-9T_x_acYU3kw7n1X1QBDIWlI6INo3HagOQUcGYC080tbXz1NrY9mEY__pOJijJKewjH8rFQBlqIAwNkr6qoAbdhpQMEfll1_ZDflO8" />
<div className="absolute inset-0 bg-gradient-to-t from-secondary/40 to-transparent"></div>
<div className="absolute bottom-0 left-0 p-8 w-full">
<span className="font-label font-semibold uppercase tracking-[0.15em] text-[10px] text-on-secondary bg-primary px-3 py-1 inline-block mb-3">Live Presentation</span>
<h2 className="font-headline text-4xl text-on-secondary leading-none">Royal Albert Hall</h2>
<p className="font-body text-sm text-on-secondary/80 mt-2 uppercase tracking-widest">Kensington, London</p>
</div>
</section>

<section className="p-8 border-b border-outline-variant bg-surface-container-low">
<div className="flex items-center gap-4 mb-6">
<div className="h-[1px] flex-1 bg-outline"></div>
<h3 className="font-label font-semibold uppercase tracking-[0.15em] text-[11px] text-primary">The Genesis of Obsidian</h3>
<div className="h-[1px] flex-1 bg-outline"></div>
</div>
<p className="font-headline italic text-2xl text-on-surface leading-tight mb-6">
                "We sought to create a sound that felt as enduring as the stone it is named for—cold to the touch, but born from fire."
            </p>
<div className="space-y-4 font-body text-sm text-on-surface-variant leading-relaxed">
<p>
                    The Royal Albert Hall serves as the definitive monolithic canvas for this acoustic architecture. The performance is structured around the resonance of Victorian masonry and modern syntheses.
                </p>
<p>
                    Every vibration within the hall has been meticulously mapped to ensure that 'Obsidian' is not merely heard, but felt as a structural shift in the atmosphere.
                </p>
</div>
</section>

<section className="p-8 border-b border-outline-variant">
<h3 className="font-label font-semibold uppercase tracking-[0.15em] text-[11px] text-on-surface mb-8">Event Rules &amp; Protocol</h3>
<div className="space-y-8">
<div className="flex gap-6 items-start">
<span className="font-headline text-3xl text-primary-container text-stroke-primary" >01</span>
<div>
<h4 className="font-label font-bold text-xs uppercase tracking-widest mb-1">Silence Mandate</h4>
<p className="text-sm text-on-surface-variant">Absolute silence is requested during movement transitions. Digital devices must be in theater mode.</p>
</div>
</div>
<div className="flex gap-6 items-start">
<span className="font-headline text-3xl text-primary-container text-stroke-primary" >02</span>
<div>
<h4 className="font-label font-bold text-xs uppercase tracking-widest mb-1">Architectural Respect</h4>
<p className="text-sm text-on-surface-variant">Strict adherence to seated zones. Standing is only permitted during the final movement.</p>
</div>
</div>
<div className="flex gap-6 items-start">
<span className="font-headline text-3xl text-primary-container text-stroke-primary" >03</span>
<div>
<h4 className="font-label font-bold text-xs uppercase tracking-widest mb-1">Dress Code</h4>
<p className="text-sm text-on-surface-variant">The evening requires 'Obsidian Formal'—monochromatic black or deep charcoal attire only.</p>
</div>
</div>
</div>
</section>

<section className="p-8 bg-surface-bright">
<div className="flex justify-between items-end mb-8">
<div>
<h3 className="font-label font-semibold uppercase tracking-[0.15em] text-[11px] text-on-surface">Availability</h3>
<p className="font-headline text-2xl">Secure Admission</p>
</div>
<span className="font-label font-bold text-[10px] text-primary uppercase border border-primary px-2 py-1">Limited</span>
</div>
<div className="space-y-8">

<div className="space-y-2">
<div className="flex justify-between items-baseline">
<span className="font-body font-semibold text-sm">General Admission</span>
<span className="font-label font-bold text-[10px] text-on-surface-variant">85% SOLD</span>
</div>
<div className="h-[2px] w-full bg-surface-container-highest">
<div className="h-full bg-primary" ></div>
</div>
<div className="flex justify-between text-[10px] font-label text-on-tertiary-fixed-variant tracking-wider">
<span>£120.00</span>
<span>REMAINING: 42</span>
</div>
</div>

<div className="space-y-2">
<div className="flex justify-between items-baseline">
<span className="font-body font-semibold text-sm">VIP Box Seating</span>
<span className="font-label font-bold text-[10px] text-on-surface-variant">98% SOLD</span>
</div>
<div className="h-[2px] w-full bg-surface-container-highest">
<div className="h-full bg-primary" ></div>
</div>
<div className="flex justify-between text-[10px] font-label text-on-tertiary-fixed-variant tracking-wider">
<span>£350.00</span>
<span>REMAINING: 4</span>
</div>
</div>

<div className="space-y-2">
<div className="flex justify-between items-baseline">
<span className="font-body font-semibold text-sm">Executive Tier</span>
<span className="font-label font-bold text-[10px] text-on-surface-variant">40% SOLD</span>
</div>
<div className="h-[2px] w-full bg-surface-container-highest">
<div className="h-full bg-primary" ></div>
</div>
<div className="flex justify-between text-[10px] font-label text-on-tertiary-fixed-variant tracking-wider">
<span>£550.00</span>
<span>REMAINING: 18</span>
</div>
</div>
</div>
<button className="w-full mt-10 py-5 border border-secondary font-label font-bold uppercase tracking-[0.2em] text-xs hover:bg-secondary hover:text-on-secondary transition-all active:scale-[0.98]">
                Proceed to Checkout
            </button>
</section>
</main>

<nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-6 pt-2 bg-[#F4EFE6] border-t border-[#3C2A21] z-50">
<div className="flex flex-col items-center justify-center text-[#8E7D72] pt-2">
<ShoppingBag className="mb-1" />
<span className="font-['Manrope'] font-semibold uppercase tracking-[0.15em] text-[10px]">Store</span>
</div>
<div className="flex flex-col items-center justify-center text-[#C36B42] border-t-2 border-[#C36B42] -mt-[2px] pt-2">
<Calendar className="mb-1" />
<span className="font-['Manrope'] font-semibold uppercase tracking-[0.15em] text-[10px]">Events</span>
</div>
<div className="flex flex-col items-center justify-center text-[#8E7D72] pt-2">
<Circle className="mb-1" />
<span className="font-['Manrope'] font-semibold uppercase tracking-[0.15em] text-[10px]">Community</span>
</div>
<div className="flex flex-col items-center justify-center text-[#8E7D72] pt-2">
<Circle className="mb-1" />
<span className="font-['Manrope'] font-semibold uppercase tracking-[0.15em] text-[10px]">Journey</span>
</div>
<div className="flex flex-col items-center justify-center text-[#8E7D72] pt-2">
<Circle className="mb-1" />
<span className="font-['Manrope'] font-semibold uppercase tracking-[0.15em] text-[10px]">Identity</span>
</div>
</nav>

    </div>
  );
}