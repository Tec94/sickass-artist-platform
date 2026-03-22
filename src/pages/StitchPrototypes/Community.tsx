import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';
import { Search, User, ShoppingBag, Pin, ArrowDown } from 'lucide-react';
import SharedNavbar from '../../components/Navigation/SharedNavbar';
export default function Community() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-sans antialiased selection:bg-[#C36B42] selection:text-[#F4EFE6] bg-[#F4EFE6] text-[#3C2A21]">
        <style>{`
            .material-symbols-outlined {
                font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                vertical-align: middle;
            }
            .structural-border { border-color: #3C2A21; }
            ::-webkit-scrollbar { width: 4px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: #8E7D72; }
        `}</style>
        
        <SharedNavbar />

        {/* Main Layout: Sidebar + Content */}
        <main className="flex flex-1 w-full max-w-[1440px] mx-auto">
            {/* Directory Sidebar (Left) */}
            <aside className="w-[320px] shrink-0 border-r border-solid border-[#3C2A21] flex flex-col min-h-[calc(100vh-72px)] bg-[#F4EFE6] sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
                <div className="p-8 pb-4 border-b border-[#3C2A21]">
                    <h1 className="font-serif text-4xl font-medium tracking-tight mb-2 text-[#3C2A21]">The Salon</h1>
                    <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[#8E7D72]">Directory of Discourse</p>
                </div>
                <nav className="flex flex-col py-6">
                    <Link to="/proto/community" className="flex items-center justify-between px-8 py-3 bg-[#3C2A21]/5 text-[#C36B42] border-l-2 border-[#C36B42] group transition-colors">
                        <span className="text-xs font-bold uppercase tracking-widest">All Threads</span>
                        <span className="text-[10px] font-bold text-[#8E7D72]">1.2k</span>
                    </Link>
                    <Link to="/proto/community" className="flex items-center justify-between px-8 py-3 text-[#8E7D72] hover:text-[#3C2A21] hover:bg-[#FAF7F2] border-l-2 border-transparent transition-colors group">
                        <span className="text-xs font-semibold uppercase tracking-widest">Announcements</span>
                        <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">12</span>
                    </Link>
                    <Link to="/proto/community" className="flex items-center justify-between px-8 py-3 text-[#8E7D72] hover:text-[#3C2A21] hover:bg-[#FAF7F2] border-l-2 border-transparent transition-colors group">
                        <span className="text-xs font-semibold uppercase tracking-widest">The Archives</span>
                        <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">840</span>
                    </Link>
                    <Link to="/proto/community" className="flex items-center justify-between px-8 py-3 text-[#8E7D72] hover:text-[#3C2A21] hover:bg-[#FAF7F2] border-l-2 border-transparent transition-colors group">
                        <span className="text-xs font-semibold uppercase tracking-widest">Upcoming Events</span>
                        <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">56</span>
                    </Link>
                    <Link to="/proto/community" className="flex items-center justify-between px-8 py-3 text-[#8E7D72] hover:text-[#3C2A21] hover:bg-[#FAF7F2] border-l-2 border-transparent transition-colors group">
                        <span className="text-xs font-semibold uppercase tracking-widest">General</span>
                        <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">342</span>
                    </Link>
                </nav>
                <div className="mt-auto p-8 border-t border-[#3C2A21]">
                    <Link to="/proto/salon" onClick={() => setNextTransition('push')} className="w-full flex justify-center items-center py-3 border border-[#3C2A21] text-[#3C2A21] text-xs font-bold uppercase tracking-widest hover:bg-[#3C2A21] hover:text-[#F4EFE6] transition-all rounded-sm">NEW DISPATCH</Link>
                </div>
            </aside>

            {/* Thread List (Right) */}
            <section className="flex-1 flex flex-col bg-[#FAF7F2] min-h-[calc(100vh-72px)]">
                {/* List Header/Filters */}
                <div className="flex items-center justify-between px-10 py-6 border-b border-[#3C2A21] bg-[#F4EFE6] sticky top-[72px] z-40">
                    <div className="flex items-center gap-6">
                        <button className="text-xs font-bold text-[#3C2A21] uppercase tracking-[0.15em] border-b border-[#3C2A21] pb-1">Latest</button>
                        <button className="text-xs font-semibold text-[#8E7D72] hover:text-[#3C2A21] uppercase tracking-[0.15em] transition-colors pb-1">Top</button>
                    </div>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E7D72]" />
                        <input className="w-64 bg-transparent border-b border-[#8E7D72]/30 py-2 pl-9 pr-4 text-[10px] font-bold text-[#3C2A21] placeholder:text-[#8E7D72] uppercase tracking-[0.15em] focus:outline-none focus:border-[#3C2A21] transition-colors" placeholder="SEARCH ARCHIVES..." type="text"/>
                    </div>
                </div>

                {/* Threads Container */}
                <div className="flex flex-col">
                    {/* Pinned Thread 1 */}
                    <Link to="/proto/salon" onClick={() => setNextTransition('push')} className="group relative flex items-center justify-between px-10 py-8 border-b border-[#3C2A21]/15 bg-[#FAF7F2] hover:bg-[#F4EFE6] transition-colors cursor-pointer">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C36B42]"></div>
                        <div className="flex flex-col gap-2 max-w-3xl">
                            <div className="flex items-center gap-3 mb-1">
                                <Pin size={14} className="text-[#C36B42] fill-current" />
                                <span className="text-[10px] text-[#C36B42] font-bold uppercase tracking-widest">Announcement</span>
                            </div>
                            <h2 className="font-serif text-3xl font-medium text-[#3C2A21] group-hover:text-[#C36B42] transition-colors">Welcome to The Salon - Read First</h2>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-[10px] font-bold text-[#C36B42] uppercase tracking-widest">By Curator</span>
                                <span className="w-1 h-1 bg-[#8E7D72] rounded-full"></span>
                                <span className="text-[10px] font-bold text-[#8E7D72] uppercase tracking-widest">Oct 12, 2023</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="font-serif text-2xl text-[#3C2A21]">142</span>
                            <span className="text-[10px] text-[#8E7D72] font-bold uppercase tracking-widest">Replies</span>
                        </div>
                    </Link>

                    {/* Regular Thread */}
                    <Link to="/proto/salon" onClick={() => setNextTransition('push')} className="group relative flex items-center justify-between px-10 py-8 border-b border-[#3C2A21]/15 bg-[#FAF7F2] hover:bg-[#F4EFE6] transition-colors cursor-pointer">
                        <div className="flex flex-col gap-2 max-w-3xl">
                            <h2 className="font-serif text-3xl font-medium text-[#3C2A21] group-hover:text-[#C36B42] transition-colors">Theories on the next era's aesthetic</h2>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-[10px] font-bold text-[#C36B42] uppercase tracking-widest">By ArtCollector99</span>
                                <span className="w-1 h-1 bg-[#8E7D72] rounded-full"></span>
                                <span className="text-[10px] font-bold text-[#8E7D72] uppercase tracking-widest">2 hours ago</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="font-serif text-2xl text-[#3C2A21]">42</span>
                            <span className="text-[10px] text-[#8E7D72] font-bold uppercase tracking-widest">Replies</span>
                        </div>
                    </Link>
                </div>

                {/* Pagination/Load More */}
                <div className="flex justify-center items-center py-12 bg-[#FAF7F2] border-t border-[#3C2A21]/15">
                    <button className="flex items-center gap-3 text-[11px] font-bold text-[#3C2A21] uppercase tracking-[0.15em] hover:text-[#C36B42] transition-colors group">
                        <span>Load Historical Records</span>
                        <ArrowDown size={14} className="group-hover:translate-y-1 transition-transform" />
                    </button>
                </div>
            </section>
        </main>
    </div>
  );
}
