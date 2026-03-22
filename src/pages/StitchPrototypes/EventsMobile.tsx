import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';
import { Menu, Search, ShoppingBag, Calendar, Circle } from 'lucide-react';

export default function EventsMobile() {
  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#3C2A21] w-full font-sans">
      <style>{`
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body {
            background-color: #F4EFE6;
            color: #3C2A21;
        }
        .ledger-row {
            border-bottom: 1px solid rgba(60, 42, 33, 0.15);
        }
    `}</style>
      

<header className="bg-[#F4EFE6] dark:bg-[#1A1614] border-b border-[#3C2A21] dark:border-[#FAF7F2] fixed top-0 z-50 w-full">
<div className="flex justify-between items-center w-full px-6 h-16">
<button className="Active: scale-95 transition-transform duration-150">
<Menu className="text-[#3C2A21] dark:text-[#FAF7F2]" />
</button>
<h1 className="font-['Newsreader'] font-bold text-[#3C2A21] dark:text-[#FAF7F2] uppercase tracking-[0.15em] text-sm">ARCHIVE</h1>
<button className="Active: scale-95 transition-transform duration-150">
<Search className="text-[#3C2A21] dark:text-[#FAF7F2]" />
</button>
</div>
</header>
<main className="pt-24 pb-32 px-6">

<div className="mb-12">
<span className="font-label font-semibold uppercase tracking-[0.15em] text-[10px] text-primary mb-2 block">Exhibitions &amp; Tours</span>
<h2 className="font-headline italic text-4xl tracking-tight leading-none mb-4">The Global Schedule</h2>
<p className="font-body text-on-surface-variant text-sm leading-relaxed max-w-xs">
                A chronological ledger of upcoming appearances, curated installations, and cultural exchanges for the current cycle.
            </p>
</div>

<section className="mb-12">
<div className="flex items-baseline justify-between ledger-row pb-2 mb-4">
<h3 className="font-headline font-bold text-2xl">2024</h3>
<span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Session I</span>
</div>
<div className="space-y-0">

<div className="ledger-row py-5 flex flex-col gap-1">
<div className="flex justify-between items-start">
<span className="font-label font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">OCT 14 — OCT 20</span>
<span className="font-label font-semibold text-[10px] uppercase tracking-[0.15em] text-primary">RSVP</span>
</div>
<div className="flex justify-between items-end">
<h4 className="font-headline text-xl leading-tight uppercase tracking-tight">ROYAL ALBERT HALL</h4>
<span className="font-body italic text-xs text-on-surface-variant">London, UK</span>
</div>
</div>

<div className="ledger-row py-5 flex flex-col gap-1">
<div className="flex justify-between items-start">
<span className="font-label font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">NOV 02 — NOV 05</span>
<span className="font-label font-semibold text-[10px] uppercase tracking-[0.15em] text-on-tertiary-fixed-variant">SOLD OUT</span>
</div>
<div className="flex justify-between items-end">
<h4 className="font-headline text-xl leading-tight uppercase tracking-tight">O2 ARENA</h4>
<span className="font-body italic text-xs text-on-surface-variant">Prague, CZ</span>
</div>
</div>

<div className="ledger-row py-5 flex flex-col gap-1">
<div className="flex justify-between items-start">
<span className="font-label font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">DEC 12 — DEC 15</span>
<span className="font-label font-semibold text-[10px] uppercase tracking-[0.15em] text-primary">RSVP</span>
</div>
<div className="flex justify-between items-end">
<h4 className="font-headline text-xl leading-tight uppercase tracking-tight">THE LOUVRE</h4>
<span className="font-body italic text-xs text-on-surface-variant">Paris, FR</span>
</div>
</div>
</div>
</section>

<section className="mb-12">
<div className="flex items-baseline justify-between ledger-row pb-2 mb-4">
<h3 className="font-headline font-bold text-2xl">2025</h3>
<span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Session II</span>
</div>
<div className="space-y-0">

<div className="ledger-row py-5 flex flex-col gap-1">
<div className="flex justify-between items-start">
<span className="font-label font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">JAN 20 — JAN 28</span>
<span className="font-label font-semibold text-[10px] uppercase tracking-[0.15em] text-primary">RSVP</span>
</div>
<div className="flex justify-between items-end">
<h4 className="font-headline text-xl leading-tight uppercase tracking-tight">MADISON SQUARE GARDEN</h4>
<span className="font-body italic text-xs text-on-surface-variant">New York, NY</span>
</div>
</div>

<div className="ledger-row py-5 flex flex-col gap-1">
<div className="flex justify-between items-start">
<span className="font-label font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">FEB 14 — FEB 16</span>
<span className="font-label font-semibold text-[10px] uppercase tracking-[0.15em] text-on-tertiary-fixed-variant text-opacity-50">TICKETS SOON</span>
</div>
<div className="flex justify-between items-end">
<h4 className="font-headline text-xl leading-tight uppercase tracking-tight">SYDNEY OPERA HOUSE</h4>
<span className="font-body italic text-xs text-on-surface-variant">Sydney, AU</span>
</div>
</div>
</div>
</section>

<div className="bg-surface-container-low border border-outline-variant p-6 mt-12 mb-8 relative">
<div className="absolute -top-3 left-6 bg-primary text-on-primary px-3 py-1 font-label text-[9px] uppercase tracking-widest font-bold">Recommended</div>
<div className="flex flex-col gap-4">
<div className="aspect-[4/3] w-full overflow-hidden">
<img alt="Classical architecture interior" className="w-full h-full object-cover grayscale contrast-125" data-alt="Monochrome architectural view of a museum hall" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXVVk2xNz3br8-1hYf_7QMjOTg045kDCvWj34rHWJChcyQNfMhzkDpZuAqGhFgnGPdCDciVdpNGvn5hhPUrUZommzigusbNHlWN8RiP-doUVLYhO5UIWHapaA4ZGx7GyjHwf_HpSl0o_CTj_y9Z3CCapYYIVzceANGraKihjLbgNPZFCrI3VaFkHRPR0bZqsMRFNRZ7eXKIRXsU_3qFBHiubm0IYOupPYx78Mnc6KTdFh38MXmktiHa3Hkl5VUTKoea0H2RQCRtq5f" />
</div>
<div className="flex flex-col gap-2">
<h5 className="font-headline text-2xl italic leading-none">The Ink &amp; Stone Retrospective</h5>
<p className="font-body text-sm text-on-surface-variant leading-relaxed">A permanent collection of physical ephemera showcasing the evolution of papercraft across centuries.</p>
<button className="mt-2 border border-secondary py-3 px-6 font-label text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-secondary hover:text-on-secondary transition-colors">
                        Explore Collection
                    </button>
</div>
</div>
</div>
</main>

<nav className="fixed bottom-0 left-0 w-full bg-[#F4EFE6] dark:bg-[#1A1614] border-t border-[#3C2A21] dark:border-[#FAF7F2] flex justify-around items-center px-2 pb-6 pt-2 z-50">
<Link className="flex flex-col items-center justify-center text-[#8E7D72] dark:text-[#D1C7BC] pt-2 hover:text-[#3C2A21] dark:hover:text-[#FAF7F2] Active: opacity-80 transition-opacity" to="/dashboard">
<ShoppingBag className="mb-1" />
<span className="font-['Manrope'] font-semibold uppercase tracking-[0.15em] text-[10px]">Store</span>
</Link>
<Link className="flex flex-col items-center justify-center text-[#C36B42] dark:text-[#E28A61] border-t-2 border-[#C36B42] -mt-[2px] pt-2 Active: opacity-80 transition-opacity" to="/dashboard">
<Calendar className="mb-1" />
<span className="font-['Manrope'] font-semibold uppercase tracking-[0.15em] text-[10px]">Events</span>
</Link>
<Link className="flex flex-col items-center justify-center text-[#8E7D72] dark:text-[#D1C7BC] pt-2 hover:text-[#3C2A21] dark:hover:text-[#FAF7F2] Active: opacity-80 transition-opacity" to="/dashboard">
<Circle className="mb-1" />
<span className="font-['Manrope'] font-semibold uppercase tracking-[0.15em] text-[10px]">Community</span>
</Link>
<Link className="flex flex-col items-center justify-center text-[#8E7D72] dark:text-[#D1C7BC] pt-2 hover:text-[#3C2A21] dark:hover:text-[#FAF7F2] Active: opacity-80 transition-opacity" to="/dashboard">
<Circle className="mb-1" />
<span className="font-['Manrope'] font-semibold uppercase tracking-[0.15em] text-[10px]">Journey</span>
</Link>
<Link className="flex flex-col items-center justify-center text-[#8E7D72] dark:text-[#D1C7BC] pt-2 hover:text-[#3C2A21] dark:hover:text-[#FAF7F2] Active: opacity-80 transition-opacity" to="/dashboard">
<Circle className="mb-1" />
<span className="font-['Manrope'] font-semibold uppercase tracking-[0.15em] text-[10px]">Identity</span>
</Link>
</nav>

    </div>
  );
}