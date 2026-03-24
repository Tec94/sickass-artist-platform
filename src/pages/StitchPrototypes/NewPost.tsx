import { Link } from 'react-router-dom';
import { ArrowLeft, UserCircle, BookOpen, Circle, Paperclip, SquarePen } from 'lucide-react';
import { setNextTransition } from '../../components/Effects/PageTransition';
import SharedNavbar from '../../components/Navigation/SharedNavbar';
import CommunitySidebar from './CommunitySidebar';

export default function NewPost() {
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
      .new-post-scroll::-webkit-scrollbar { width: 6px; }
      .new-post-scroll::-webkit-scrollbar-track { background: transparent; }
      .new-post-scroll::-webkit-scrollbar-thumb { background: rgba(142, 125, 114, 0.7); }
    `}</style>
      

<SharedNavbar />

<div className="flex h-[calc(100vh-72px)] w-full max-w-[1600px] mx-auto overflow-hidden">
<CommunitySidebar activeItem="new-post" />

<main className="new-post-scroll flex-1 w-full min-h-0 overflow-y-auto">
<div className="sticky top-0 z-20 border-b border-[#3C2A21]/10 bg-[#F4EFE6]/95 backdrop-blur-sm">
<div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-8 py-4 md:px-12">
<Link
to="/community"
aria-label="Return to the community page"
onClick={() => setNextTransition('push-back')}
className="inline-flex items-center gap-2 border border-[#3C2A21] bg-[#FAF7F2] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#3C2A21] transition-colors hover:border-[#C36B42] hover:text-[#C36B42]"
>
<ArrowLeft size={14} />
<span>Return to Community</span>
</Link>
<span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-[#8E7D72] md:block">Draft auto-saves while you write</span>
</div>
</div>

<div className="max-w-5xl mx-auto p-8 pb-28 md:p-12 md:pb-12">

<div className="grid grid-cols-1 md:grid-cols-12 ink-border">

<div className="md:col-span-3 ink-border-r bg-surface-container-low p-6 space-y-8">
<div>
<label className="font-label text-[10px] uppercase font-bold text-on-surface-variant mb-3 block">Category</label>
<select className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 font-body text-sm py-2 px-0 italic">
<option>All Threads</option>
<option>Announcements</option>
<option>The Archives</option>
<option>Upcoming Events</option>
<option>General</option>
</select>
</div>
<div>
<label className="font-label text-[10px] uppercase font-bold text-on-surface-variant mb-3 block">Visibility</label>
<div className="space-y-2">
<label className="flex items-center gap-2 text-sm cursor-pointer">
<input defaultChecked={true} className="accent-[#C36B42] focus:ring-0 border-outline" name="access" type="radio" />
<span>Open to all members</span>
</label>
<label className="flex items-center gap-2 text-sm cursor-pointer opacity-50">
<input className="accent-[#C36B42] focus:ring-0 border-outline" disabled={true} name="access" type="radio" />
<span>Mods only</span>
</label>
</div>
</div>
<div className="pt-8">
<div className="p-4 border border-dashed border-outline-variant text-center">
<Paperclip className="text-on-surface-variant block mb-2 mx-auto" />
<span className="font-label text-[9px] uppercase font-bold text-on-surface-variant">Attach Image<br />or Reference (Max 5MB)</span>
</div>
</div>
</div>

<div className="md:col-span-9 bg-surface-container-lowest">

<div className="ink-border-b p-8">
<label className="font-label text-[10px] uppercase font-bold text-on-surface-variant mb-4 block" htmlFor="title">Post Title</label>
<input className="w-full bg-transparent border-0 focus:ring-0 font-headline text-3xl italic p-0 placeholder:text-surface-dim placeholder:italic" id="title" placeholder="What is the headline?" type="text" />
</div>

<div className="p-8 min-h-[400px] ledger-line">
<label className="font-label text-[10px] uppercase font-bold text-on-surface-variant mb-4 block" htmlFor="content">Message</label>
<textarea className="w-full bg-transparent border-0 focus:ring-0 font-body text-lg leading-[32px] p-0 resize-none placeholder:text-surface-dim" id="content" placeholder="Share your update with the community..." rows={12}></textarea>
</div>

<div className="ink-border-t border-t border-on-background p-6 flex flex-col md:flex-row justify-between items-center bg-surface-container-low gap-4">
<div className="flex items-center gap-4">
<span className="flex items-center gap-1 text-[10px] font-bold uppercase text-on-surface-variant">
<Circle className="text-xs" />
                                Draft check
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
<button className="flex-1 md:flex-none border border-[#3C2A21] bg-[#1F1C19] px-12 py-3 text-[#F4EFE6] transition-colors hover:border-[#C36B42] hover:bg-[#C36B42] font-label text-[11px] uppercase tracking-widest flex items-center justify-center gap-2">
<SquarePen className="text-sm" />
                                Publish Post
                            </button>
</div>
</div>
</div>
</div>

<div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
<div className="p-6 bg-surface-container-low border-l-4 border-primary">
<h4 className="font-label text-[11px] uppercase font-bold mb-2">Editorial Notice</h4>
<p className="font-body text-xs leading-relaxed text-tertiary italic">
                        "Posts become part of the permanent community archive. Make the subject line clear and keep the body easy to scan before you publish."
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
<SquarePen className="text-[#C36B42]" />
<Circle className="text-[#3C2A21]" />
<UserCircle className="text-[#3C2A21]" />
</nav>

    </div>
  );
}
