import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';
import { Search, UserCircle, Plus, Minus, ArrowRight, Circle } from 'lucide-react';
import SharedNavbar from '../../components/Navigation/SharedNavbar';

export default function AccessTiersAlbert() {
  return (
    <div className="h-full overflow-y-auto bg-[#F4EFE6] text-[#3C2A21] w-full font-sans">
      <style>{`
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
        .glass-card {
            background: rgba(27, 32, 35, 0.06);
            backdrop-filter: blur(12px);
            border-top: 1px solid rgba(62, 73, 72, 0.4);
            border-left: 1px solid rgba(62, 73, 72, 0.4);
        }
    `}</style>
      

<SharedNavbar />
<main className="flex-grow">

<section className="relative w-full h-[460px] overflow-hidden grayscale contrast-125">
<img alt="The Royal Albert Hall Exhibition Venue" className="w-full h-full object-cover object-center" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsLewmjHJ0ZbAWYNBuiLW2f1fZsMGVo3rxFouAwXS3OkunMOanaAHmSXDxSmB9DLfdEyAGOZLQTQMk3r4mDY5PzsmjQW854EvMSJd1J2HQHdrPA2_RjI2IcFHz2jNxzjeStNxPPmRBxjneMXk8Vno8ClrE1XBWT-pi9WHQZUn8g9cJLPJNaCc1uxM_L8jSHElhKjWalWOHKlKKZ74cPP1ZGQ3wmB1P9jNZprUabDJsNf37q-Mc8dsKhiBIIbWGf2N8ZO8G095wwCgS" />
<div className="absolute inset-0 bg-gradient-to-t from-[#F4F0EB] via-transparent to-transparent"></div>
<div className="absolute bottom-8 left-8">
<p className="font-['Bebas_Neue'] text-[#C36B42] text-xl tracking-widest mb-2">Private Suite Access</p>
<h1 className="font-['Bebas_Neue'] text-7xl md:text-9xl tracking-tighter leading-none text-[#1C1B1A]">The Royal Albert Hall</h1>
</div>
</section>

<section className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">

<div className="flex-grow">
<div className="mb-8 border-l-4 border-[#C36B42] pl-6">
<h2 className="font-headline italic text-4xl text-[#1C1B1A]">Select Access Tiers</h2>
<p className="text-sm uppercase tracking-widest opacity-60 mt-2 font-label">Vault Registry Protocol v.2.4</p>
</div>
<div className="border-t border-[#1C1B1A]">

<div className="grid grid-cols-12 py-4 px-4 md:px-6 text-[0.6875rem] uppercase tracking-widest font-label border-b border-[#1C1B1A]/20 opacity-50">
<div className="col-span-6">Tier Description</div>
<div className="col-span-2 text-right">Unit Price</div>
<div className="col-span-4 text-right">Quantity</div>
</div>

<div className="grid grid-cols-12 py-8 px-4 md:px-6 items-center border-b border-[#1C1B1A]/10 hover:bg-[#1C1B1A]/5 transition-colors group">
<div className="col-span-6">
<h3 className="font-['Bebas_Neue'] text-2xl tracking-tight text-[#1C1B1A]">General Access</h3>
<p className="font-headline italic text-lg opacity-70">Standard gallery entry &amp; directional archive materials.</p>
</div>
<div className="col-span-2 text-right font-mono text-xl">
                        £ 45.00
                    </div>
<div className="col-span-4 flex justify-end items-center gap-6">
<button className="w-8 h-8 border border-[#1C1B1A]/20 flex items-center justify-center hover:bg-[#1C1B1A] hover:text-white transition-all text-sm"><Minus size={14} /></button>
<span className="font-mono text-2xl w-8 text-center">01</span>
<button className="w-8 h-8 border border-[#1C1B1A]/20 flex items-center justify-center hover:bg-[#1C1B1A] hover:text-white transition-all text-sm"><Plus size={14} /></button>
</div>
</div>

<div className="grid grid-cols-12 py-8 px-4 md:px-6 items-center border-b border-[#1C1B1A]/10 hover:bg-[#1C1B1A]/5 transition-colors group">
<div className="col-span-6">
<div className="flex items-center gap-3">
<h3 className="font-['Bebas_Neue'] text-2xl tracking-tight text-[#1C1B1A]">VIP Suite Access</h3>
<span className="bg-[#9A8838] text-white text-[10px] px-2 py-0.5 font-label tracking-widest uppercase">Preferred</span>
</div>
<p className="font-headline italic text-lg opacity-70">Elevated mezzanine positioning &amp; private suite lounge.</p>
</div>
<div className="col-span-2 text-right font-mono text-xl">
                        £ 125.00
                    </div>
<div className="col-span-4 flex justify-end items-center gap-6">
<button className="w-8 h-8 border border-[#1C1B1A]/20 flex items-center justify-center hover:bg-[#1C1B1A] hover:text-white transition-all text-sm"><Minus size={14} /></button>
<span className="font-mono text-2xl w-8 text-center text-[#1C1B1A]/30">00</span>
<button className="w-8 h-8 border border-[#1C1B1A]/20 flex items-center justify-center hover:bg-[#1C1B1A] hover:text-white transition-all text-sm"><Plus size={14} /></button>
</div>
</div>

<div className="grid grid-cols-12 py-8 px-4 md:px-6 items-center border-b border-[#1C1B1A] hover:bg-[#1C1B1A]/5 transition-colors group">
<div className="col-span-6">
<h3 className="font-['Bebas_Neue'] text-2xl tracking-tight text-[#1C1B1A]">Vault Access Key</h3>
<p className="font-headline italic text-lg opacity-70">Complete immersion. Direct Artifact Access via the Sub-Level Archive.</p>
</div>
<div className="col-span-2 text-right font-mono text-xl">
                        £ 450.00
                    </div>
<div className="col-span-4 flex justify-end items-center gap-6">
<button className="w-8 h-8 border border-[#1C1B1A]/20 flex items-center justify-center hover:bg-[#1C1B1A] hover:text-white transition-all text-sm"><Minus size={14} /></button>
<span className="font-mono text-2xl w-8 text-center text-[#1C1B1A]/30">00</span>
<button className="w-8 h-8 border border-[#1C1B1A]/20 flex items-center justify-center hover:bg-[#1C1B1A] hover:text-white transition-all text-sm"><Plus size={14} /></button>
</div>
</div>
</div>
</div>

<aside className="w-full lg:w-96">
<div className="border border-[#1C1B1A] p-8 bg-[#1C1B1A]/5 sticky top-24">
<div className="flex justify-between items-start mb-12">
<div>
<h2 className="font-['Bebas_Neue'] text-4xl text-[#1C1B1A]">The Ledger</h2>
<p className="text-[0.6875rem] font-mono tracking-widest uppercase opacity-60">ID: ALBERT-8821</p>
</div>
<Circle className="text-3xl opacity-20" />
</div>
<div className="space-y-4 mb-12">
<div className="flex justify-between items-center text-sm font-label uppercase tracking-widest border-b border-[#1C1B1A]/10 pb-4">
<span>Subtotal</span>
<span className="font-mono">£ 45.00</span>
</div>
<div className="flex justify-between items-center text-sm font-label uppercase tracking-widest border-b border-[#1C1B1A]/10 pb-4">
<span>Admin Fee</span>
<span className="font-mono">£ 2.50</span>
</div>
<div className="flex justify-between items-center text-sm font-label uppercase tracking-widest border-b border-[#1C1B1A]/10 pb-4">
<span>Tax (VAT)</span>
<span className="font-mono">£ 9.00</span>
</div>
</div>
<div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-12">
<span className="font-['Bebas_Neue'] text-xl tracking-widest whitespace-nowrap">Total Due</span>
<span className="font-mono text-4xl md:text-5xl font-bold whitespace-nowrap text-[#3C2A21]">£ 56.50</span>
</div>
<button className="w-full bg-[#C36B42] text-white font-['Bebas_Neue'] text-xl md:text-2xl py-6 tracking-widest hover:bg-[#EC5107] active:scale-[0.98] transition-all flex flex-row items-center justify-center gap-3 whitespace-nowrap">
                    Authorize Access
                    <ArrowRight className="shrink-0" />
</button>
<p className="text-[0.5rem] font-label uppercase text-center mt-6 opacity-40 leading-relaxed tracking-wider">
                    By authorizing, you agree to the estate's private protocol and archival preservation standards. Non-refundable.
                </p>
</div>
</aside>
</section>
</main>

<footer className="bg-[#F4F0EB] border-t border-[#1C1B1A]/20 mt-auto">
<div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 max-w-7xl mx-auto">
<p className="font-['Manrope'] text-[0.6875rem] uppercase tracking-widest text-[#1C1B1A]/70 mb-8 md:mb-0">
            © 2024 THE ESTATE DIRECTORY. ALL RIGHTS RESERVED.
        </p>
<div className="flex gap-10">
<Link className="font-['Manrope'] text-[0.6875rem] uppercase tracking-widest text-[#1C1B1A] opacity-70 hover:opacity-100 transition-opacity duration-300" to="/proto/directory">Terms of Access</Link>
<Link className="font-['Manrope'] text-[0.6875rem] uppercase tracking-widest text-[#1C1B1A] opacity-70 hover:opacity-100 transition-opacity duration-300" to="/proto/directory">Privacy Protocol</Link>
<Link className="font-['Manrope'] text-[0.6875rem] uppercase tracking-widest text-[#1C1B1A] opacity-70 hover:opacity-100 transition-opacity duration-300 underline font-bold" to="/proto/directory">Institutional Contact</Link>
</div>
</div>
</footer>

    </div>
  );
}