import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';
import { UserCircle, Scroll, BookOpen, Circle } from 'lucide-react';
import SharedNavbar from '../../components/Navigation/SharedNavbar';
export default function Salon() {
  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#3C2A21] w-full font-sans">
      <style>{`
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
      .ledger-line {
        background-image: linear-gradient(to bottom, transparent 31px, rgba(60, 42, 33, 0.1) 31px);
        background-size: 100% 32px;
      }
      .ink-border { border: 1px solid #3C2A21; }
      .ink-border-b { border-bottom: 1px solid #3C2A21; }
      .ink-border-r { border-right: 1px solid #3C2A21; }
    `}</style>
      

<SharedNavbar />

<div className="flex w-full max-w-[1600px] mx-auto">

<aside className="w-[320px] shrink-0 border-r border-solid border-[#3C2A21] flex flex-col min-h-[calc(100vh-72px)] bg-[#F4EFE6] sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto hidden lg:flex p-6">
<div className="mb-10">
<div className="flex items-center gap-3 mb-2">
<div className="w-10 h-10 bg-surface-dim ink-border flex items-center justify-center">
<Scroll className="text-on-background" />
</div>
<div>
<h2 className="font-headline text-lg font-bold text-[#3C2A21]">The Estate Directory</h2>
<p className="font-label text-[10px] uppercase font-bold text-[#8E7D72]">Archival Access v1.0</p>
</div>
</div>
</div>
<nav className="flex-1 space-y-1">
<Link className="flex items-center gap-3 py-3 px-2 text-[#3C2A21] hover:pl-4 transition-all duration-300 group" to="/dashboard">
<BookOpen className="text-sm" />
<span className="font-label text-[10px] font-bold uppercase">Artists Index</span>
</Link>
<Link className="flex items-center gap-3 py-3 px-2 text-[#3C2A21] hover:pl-4 transition-all duration-300 group" to="/dashboard">
<Circle className="text-sm" />
<span className="font-label text-[10px] font-bold uppercase">Regional Guilds</span>
</Link>
<Link className="flex items-center gap-3 py-3 px-2 text-[#3C2A21] hover:pl-4 transition-all duration-300 group" to="/dashboard">
<Circle className="text-sm" />
<span className="font-label text-[10px] font-bold uppercase">Mediums &amp; Methods</span>
</Link>
<Link className="flex items-center gap-3 py-3 px-4 bg-[#C36B42]/10 text-[#C36B42] border-r-4 border-[#C36B42] font-semibold transition-all duration-300" to="/dashboard">
<Scroll className="text-sm" />
<span className="font-label text-[10px] font-bold uppercase">Provenance Records</span>
</Link>
<Link className="flex items-center gap-3 py-3 px-2 text-[#3C2A21] hover:pl-4 transition-all duration-300 group" to="/dashboard">
<Circle className="text-sm" />
<span className="font-label text-[10px] font-bold uppercase">Exhibition History</span>
</Link>
</nav>
<div className="mt-auto pt-6 space-y-4">
<button className="w-full py-3 ink-border hover:bg-primary hover:text-white transition-colors duration-200 font-label text-[11px] uppercase tracking-widest">
                Submit For Review
            </button>
<div className="flex flex-col gap-2 border-t border-outline-variant pt-4">
<Link className="flex items-center gap-2 text-[#8E7D72] hover:text-[#3C2A21] transition-colors" to="/dashboard">
<Circle className="text-xs" />
<span className="text-[10px] uppercase font-bold">Legal</span>
</Link>
<Link className="flex items-center gap-2 text-[#8E7D72] hover:text-[#3C2A21] transition-colors" to="/dashboard">
<Circle className="text-xs" />
<span className="text-[10px] uppercase font-bold">Support</span>
</Link>
</div>
</div>
</aside>

<main className="flex-1 w-full min-h-[calc(100vh-72px)]">
<div className="max-w-5xl mx-auto p-8 md:p-12">

<div className="mb-12 border-b-2 border-on-background pb-6 flex justify-between items-end">
<div>
<span className="font-label text-[11px] uppercase tracking-[0.2em] text-primary mb-2 block">Archive Entry No. 882-C</span>
<h1 className="font-headline text-5xl md:text-6xl font-light">New Dispatch</h1>
</div>
<div className="text-right hidden md:block">
<p className="font-label text-[10px] uppercase font-bold text-on-surface-variant">Location: The Central Atelier</p>
<p className="font-headline italic text-lg text-on-background">October 24th, 1924</p>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-12 ink-border">

<div className="md:col-span-3 ink-border-r bg-surface-container-low p-6 space-y-8">
<div>
<label className="font-label text-[10px] uppercase font-bold text-on-surface-variant mb-3 block">Classification</label>
<select className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 font-body text-sm py-2 px-0 italic">
<option>General Correspondence</option>
<option>Technical Method</option>
<option>Exhibition Critique</option>
<option>Provenance Inquiry</option>
</select>
</div>
<div>
<label className="font-label text-[10px] uppercase font-bold text-on-surface-variant mb-3 block">Access Tier</label>
<div className="space-y-2">
<label className="flex items-center gap-2 text-sm cursor-pointer">
<input defaultChecked={true} className="text-primary focus:ring-0 border-outline" name="access" type="radio" />
<span>Public Archive</span>
</label>
<label className="flex items-center gap-2 text-sm cursor-pointer opacity-50">
<input className="text-primary focus:ring-0 border-outline" disabled={true} name="access" type="radio" />
<span>Fellows Only</span>
</label>
</div>
</div>
<div className="pt-8">
<div className="p-4 border border-dashed border-outline-variant text-center">
<Circle className="text-on-surface-variant block mb-2" />
<span className="font-label text-[9px] uppercase font-bold text-on-surface-variant">Attach Physical<br />Reference (Max 5MB)</span>
</div>
</div>
</div>

<div className="md:col-span-9 bg-surface-container-lowest">

<div className="ink-border-b p-8">
<label className="font-label text-[10px] uppercase font-bold text-on-surface-variant mb-4 block" htmlFor="title">Dispatch Title</label>
<input className="w-full bg-transparent border-0 focus:ring-0 font-headline text-3xl italic p-0 placeholder:text-surface-dim placeholder:italic" id="title" placeholder="Enter subject header..." type="text" />
</div>

<div className="p-8 min-h-[400px] ledger-line">
<label className="font-label text-[10px] uppercase font-bold text-on-surface-variant mb-4 block" htmlFor="content">Narrative Content</label>
<textarea className="w-full bg-transparent border-0 focus:ring-0 font-body text-lg leading-[32px] p-0 resize-none placeholder:text-surface-dim" id="content" placeholder="Commence documentation here..." rows={12}></textarea>
</div>

<div className="ink-border-t border-t border-on-background p-6 flex flex-col md:flex-row justify-between items-center bg-surface-container-low gap-4">
<div className="flex items-center gap-4">
<span className="flex items-center gap-1 text-[10px] font-bold uppercase text-on-surface-variant">
<Circle className="text-xs" />
                                Orthography Check
                            </span>
<span className="flex items-center gap-1 text-[10px] font-bold uppercase text-on-surface-variant">
<Circle className="text-xs" />
                                Autosaved 2m ago
                            </span>
</div>
<div className="flex gap-4 w-full md:w-auto">
<button className="flex-1 md:flex-none px-8 py-3 bg-transparent ink-border text-on-background hover:bg-surface-dim transition-colors font-label text-[11px] uppercase tracking-widest">
                                Save Draft
                            </button>
<button className="flex-1 md:flex-none px-12 py-3 bg-primary text-white hover:bg-[#A85A35] transition-colors font-label text-[11px] uppercase tracking-widest flex items-center justify-center gap-2">
<Circle className="text-sm" />
                                Log Entry
                            </button>
</div>
</div>
</div>
</div>

<div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
<div className="p-6 bg-surface-container-low border-l-4 border-primary">
<h4 className="font-label text-[11px] uppercase font-bold mb-2">Editorial Notice</h4>
<p className="font-body text-xs leading-relaxed text-tertiary italic">
                        "Each dispatch remains part of the permanent estate ledger. Ensure clarity of intent and historical accuracy before finalizing your log entry."
                    </p>
</div>
<div className="md:col-span-2 flex items-center justify-end gap-12 opacity-40 grayscale pointer-events-none">
<img alt="Ink Stamp" className="h-16 w-16 object-contain" data-alt="Vintage rubber ink stamp on parchment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2Lp84eKuJLPJOuet5LUanPN9UkCsowQCHNd254RdyrZ62sduikfypNEnbcL3uI34BTaEeJrMr_gU9RXUDOkBIcueIZhFp8pwEkYo6z0-hgBjIRrh777uaLmZIYn1g1f8WFTBc3KhK-xclKsnnnlHs_8uzM-zB6monVLi3uOwtbqNSdO9t39i_0LTAhFDz3oSUSRpeTcqG-ySIpv9REcDlabn2NsX56aiJRSyGg0u5_KeddLa1DwozhXvF528isWM5teRMNLTcv0JL" />
<img alt="Seal" className="h-16 w-16 object-contain" data-alt="Red wax seal with intricate coat of arms" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE7cVLnoAjBRZLN_vsnzZCdrKXjIM47Y9VI-uYv4YKaG8CT8w6pUKVH1mY87GlOjIZ_-JIvAcDy_ES_gYwAvMzL0waPAyeA8iwr9LwsV8R5FvTMNxSM6vnMZGBa1I5E_Wt6y16L8ikL4-KJfX1C4VCNdf1SRaOUon2mb-QMB0pvAOtR_Pc3rM_1gCHM4UjXXrfExt1LEDzNxs1_KBotcijKSznWdSisfENT6hDP_PMqnXaBF9RXqp2UGOs4GjL7z8LsB4B2-Xmk7Yn" />
</div>
</div>
</div>
</main>
</div>

<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#F4EFE6] border-t-2 border-[#3C2A21] flex justify-around p-4 z-50">
<BookOpen className="text-[#3C2A21]" />
<Scroll className="text-primary" />
<Circle className="text-[#3C2A21]" />
<UserCircle className="text-[#3C2A21]" />
</nav>

    </div>
  );
}