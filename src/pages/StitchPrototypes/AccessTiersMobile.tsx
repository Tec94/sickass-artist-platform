import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';
import { Menu, Search, Circle, ShoppingBag, Calendar } from 'lucide-react';

export default function AccessTiersMobile() {
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
        .ledger-line {
            border-bottom: 1px solid rgba(60, 42, 33, 0.15);
        }
        .ink-border {
            border: 1px solid #3C2A21;
        }
    `}</style>
      

<header className="bg-[#F4EFE6] dark:bg-[#1A1614] border-b border-[#3C2A21] dark:border-[#FAF7F2] fixed top-0 z-50 w-full flex justify-between items-center px-6 h-16">
<button className="text-[#3C2A21] dark:text-[#FAF7F2] Active: scale-95 transition-transform duration-150">
<Menu />
</button>
<h1 className="font-['Newsreader'] italic text-2xl tracking-tight text-[#C36B42] dark:text-[#E28A61]">ARCHIVE</h1>
<button className="text-[#3C2A21] dark:text-[#FAF7F2] Active: scale-95 transition-transform duration-150">
<Search />
</button>
</header>
<main className="pt-24 pb-32 px-6 max-w-md mx-auto">

<section className="mb-12">
<span className="font-label font-semibold uppercase tracking-[0.15em] text-[10px] text-primary mb-2 block">Acquisition Phase 04</span>
<h2 className="font-headline text-4xl leading-none mb-4">Access Tiers &amp; Selection</h2>
<p className="font-headline italic text-on-surface-variant text-lg leading-relaxed">Secure your digital keys for the upcoming sequence. Quantities are limited by archive capacity.</p>
</section>

<div className="space-y-0">

<div className="ledger-line py-8 flex flex-col">
<div className="flex justify-between items-start mb-4">
<div className="flex-1">
<h3 className="font-label font-extrabold uppercase tracking-widest text-sm mb-1">General Access</h3>
<p className="text-xs text-on-surface-variant uppercase tracking-wider">Entry-level archival clearance</p>
</div>
<div className="text-right">
<span className="font-headline italic text-2xl">$145.00</span>
<p className="text-[10px] uppercase tracking-tighter text-on-surface-variant">Per Unit</p>
</div>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-4 ink-border p-1 bg-surface-container-low">
<button className="w-8 h-8 flex items-center justify-center hover:bg-primary/5 active:scale-95">
<Circle className="text-sm" />
</button>
<span className="font-label font-bold text-sm min-w-[20px] text-center">01</span>
<button className="w-8 h-8 flex items-center justify-center hover:bg-primary/5 active:scale-95">
<Circle className="text-sm" />
</button>
</div>
<span className="font-label text-[10px] text-on-tertiary-fixed-variant">STATUS: AVAILABLE</span>
</div>
</div>

<div className="ledger-line py-8 flex flex-col">
<div className="flex justify-between items-start mb-4">
<div className="flex-1">
<h3 className="font-label font-extrabold uppercase tracking-widest text-sm mb-1">VIP Suite Access</h3>
<p className="text-xs text-on-surface-variant uppercase tracking-wider">Elevated floor viewing + lounge</p>
</div>
<div className="text-right">
<span className="font-headline italic text-2xl text-primary">$420.00</span>
<p className="text-[10px] uppercase tracking-tighter text-on-surface-variant">Per Unit</p>
</div>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-4 ink-border p-1 bg-surface-container-low">
<button className="w-8 h-8 flex items-center justify-center hover:bg-primary/5 active:scale-95">
<Circle className="text-sm" />
</button>
<span className="font-label font-bold text-sm min-w-[20px] text-center">00</span>
<button className="w-8 h-8 flex items-center justify-center hover:bg-primary/5 active:scale-95">
<Circle className="text-sm" />
</button>
</div>
<span className="font-label text-[10px] text-on-tertiary-fixed-variant">STATUS: LIMITED</span>
</div>
</div>

<div className="ledger-line py-8 flex flex-col">
<div className="flex justify-between items-start mb-4">
<div className="flex-1">
<h3 className="font-label font-extrabold uppercase tracking-widest text-sm mb-1">Vault Access Key</h3>
<p className="text-xs text-on-surface-variant uppercase tracking-wider">Full metadata clearance + private bar</p>
</div>
<div className="text-right">
<span className="font-headline italic text-2xl">$890.00</span>
<p className="text-[10px] uppercase tracking-tighter text-on-surface-variant">Per Unit</p>
</div>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-4 ink-border p-1 bg-surface-container-low">
<button className="w-8 h-8 flex items-center justify-center hover:bg-primary/5 active:scale-95">
<Circle className="text-sm" />
</button>
<span className="font-label font-bold text-sm min-w-[20px] text-center">00</span>
<button className="w-8 h-8 flex items-center justify-center hover:bg-primary/5 active:scale-95">
<Circle className="text-sm" />
</button>
</div>
<span className="font-label text-[10px] text-primary">STATUS: HIGH DEMAND</span>
</div>
</div>
</div>

<section className="mt-12 p-6 bg-[#EADECF] border border-[#3C2A21] relative">
<div className="absolute -top-3 left-6 bg-[#3C2A21] text-[#FAF7F2] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">
                The Ledger
            </div>
<div className="space-y-3 mb-8 pt-4">
<div className="flex justify-between text-[11px] font-label font-semibold uppercase tracking-wider">
<span>Subtotal</span>
<span>$145.00</span>
</div>
<div className="flex justify-between text-[11px] font-label font-semibold uppercase tracking-wider">
<span>Archival Fee (10%)</span>
<span>$14.50</span>
</div>
<div className="flex justify-between text-[11px] font-label font-semibold uppercase tracking-wider">
<span>Processing</span>
<span>$0.00</span>
</div>
<div className="pt-4 border-t border-[#3C2A21]/20 flex justify-between items-end">
<span className="font-headline text-lg italic">Total Due</span>
<span className="font-headline text-3xl font-bold">$159.50</span>
</div>
</div>
<button className="w-full bg-[#3C2A21] text-[#FAF7F2] py-4 font-label font-extrabold uppercase tracking-[0.2em] text-sm hover:opacity-90 active:scale-[0.98] transition-all">
                AUTHORIZE ACCESS
            </button>
</section>

<p className="mt-8 text-[9px] uppercase tracking-widest text-on-surface-variant text-center leading-loose">
            All transactions are finalized upon authorization. Digital keys are non-transferable and subject to ARCHIVE security protocols.
        </p>
</main>

<nav className="fixed bottom-0 left-0 w-full bg-[#F4EFE6] dark:bg-[#1A1614] flex justify-around items-center px-2 pb-6 pt-2 border-t border-[#3C2A21] dark:border-[#FAF7F2] z-50">
<Link className="flex flex-col items-center justify-center text-[#C36B42] dark:text-[#E28A61] border-t-2 border-[#C36B42] -mt-[2px] pt-2" to="/proto/directory">
<ShoppingBag />
<span className="font-['Manrope'] font-semibold uppercase tracking-[0.15em] text-[10px]">Store</span>
</Link>
<Link className="flex flex-col items-center justify-center text-[#8E7D72] dark:text-[#D1C7BC] pt-2" to="/proto/directory">
<Calendar />
<span className="font-['Manrope'] font-semibold uppercase tracking-[0.15em] text-[10px]">Events</span>
</Link>
<Link className="flex flex-col items-center justify-center text-[#8E7D72] dark:text-[#D1C7BC] pt-2" to="/proto/directory">
<Circle />
<span className="font-['Manrope'] font-semibold uppercase tracking-[0.15em] text-[10px]">Community</span>
</Link>
<Link className="flex flex-col items-center justify-center text-[#8E7D72] dark:text-[#D1C7BC] pt-2" to="/proto/directory">
<Circle />
<span className="font-['Manrope'] font-semibold uppercase tracking-[0.15em] text-[10px]">Journey</span>
</Link>
<Link className="flex flex-col items-center justify-center text-[#8E7D72] dark:text-[#D1C7BC] pt-2" to="/proto/directory">
<Circle />
<span className="font-['Manrope'] font-semibold uppercase tracking-[0.15em] text-[10px]">Identity</span>
</Link>
</nav>

    </div>
  );
}