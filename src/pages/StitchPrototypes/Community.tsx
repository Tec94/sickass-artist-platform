import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';
import { Search, Pin, ArrowDown } from 'lucide-react';
import SharedNavbar from '../../components/Navigation/SharedNavbar';
import CommunitySidebar from './CommunitySidebar';
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
        <main className="flex w-full max-w-[1440px] flex-1 flex-col lg:flex-row mx-auto">
            <CommunitySidebar activeItem="all-threads" />

            {/* Thread List (Right) */}
            <section className="flex-1 flex flex-col bg-[#FAF7F2] min-h-[calc(100vh-72px)]">
                <div data-testid="community-mobile-categories" className="overflow-x-auto border-b border-[#3C2A21]/12 bg-[#F4EFE6] px-4 py-3 lg:hidden">
                    <div className="flex min-w-max gap-3">
                        {[
                            'All Threads',
                            'Announcements',
                            'The Archives',
                            'Upcoming Events',
                            'General',
                        ].map((label, index) => (
                            <button
                                key={label}
                                type="button"
                                className={`border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.15em] ${
                                    index === 0
                                        ? 'border-[#1C1B1A] bg-[#1C1B1A] text-[#F4EFE6]'
                                        : 'border-[#3C2A21]/15 bg-[#FAF7F2] text-[#3C2A21]'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                {/* List Header/Filters */}
                <div className="sticky top-[72px] z-40 flex flex-col gap-4 border-b border-[#3C2A21] bg-[#F4EFE6] px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-6">
                    <div className="flex items-center gap-6">
                        <button className="text-xs font-bold text-[#3C2A21] uppercase tracking-[0.15em] border-b border-[#3C2A21] pb-1">Latest</button>
                        <button className="text-xs font-semibold text-[#8E7D72] hover:text-[#3C2A21] uppercase tracking-[0.15em] transition-colors pb-1">Top</button>
                    </div>
                    <div className="relative w-full lg:w-auto">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E7D72]" />
                        <input className="w-full bg-transparent border-b border-[#8E7D72]/30 py-2 pl-9 pr-4 text-[10px] font-bold text-[#3C2A21] placeholder:text-[#8E7D72] uppercase tracking-[0.15em] transition-colors focus:border-[#3C2A21] focus:outline-none lg:w-64" placeholder="SEARCH ARCHIVES..." type="text"/>
                    </div>
                </div>

                {/* Threads Container */}
                <div className="flex flex-col">
                    {/* Pinned Thread 1 */}
                    <Link to="/new-post" onClick={() => setNextTransition('push')} className="group relative flex cursor-pointer flex-col gap-4 border-b border-[#3C2A21]/15 bg-[#FAF7F2] px-4 py-6 transition-colors hover:bg-[#F4EFE6] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-8">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C36B42]"></div>
                        <div className="flex flex-col gap-2 max-w-3xl">
                            <div className="flex items-center gap-3 mb-1">
                                <Pin size={14} className="text-[#C36B42] fill-current" />
                                <span className="text-[10px] text-[#C36B42] font-bold uppercase tracking-widest">Announcement</span>
                            </div>
                            <h2 className="font-serif text-3xl font-medium text-[#3C2A21] group-hover:text-[#C36B42] transition-colors">Welcome to La Manada — Community Guidelines</h2>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-[10px] font-bold text-[#C36B42] uppercase tracking-widest">By ROA Team</span>
                                <span className="w-1 h-1 bg-[#8E7D72] rounded-full"></span>
                                <span className="text-[10px] font-bold text-[#8E7D72] uppercase tracking-widest">Oct 12, 2023</span>
                            </div>
                        </div>
                        <div className="flex flex-row items-center justify-between gap-4 shrink-0 lg:flex-col lg:items-end lg:gap-1">
                            <span className="font-serif text-2xl text-[#3C2A21]">142</span>
                            <span className="text-[10px] text-[#8E7D72] font-bold uppercase tracking-widest">Replies</span>
                        </div>
                    </Link>

                    {/* Regular Thread */}
                    <Link to="/new-post" onClick={() => setNextTransition('push')} className="group relative flex cursor-pointer flex-col gap-4 border-b border-[#3C2A21]/15 bg-[#FAF7F2] px-4 py-6 transition-colors hover:bg-[#F4EFE6] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-8">
                        <div className="flex flex-col gap-2 max-w-3xl">
                            <h2 className="font-serif text-3xl font-medium text-[#3C2A21] group-hover:text-[#C36B42] transition-colors">Predictions for Private Suite Vol. 4?</h2>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-[10px] font-bold text-[#C36B42] uppercase tracking-widest">By LoboPR_99</span>
                                <span className="w-1 h-1 bg-[#8E7D72] rounded-full"></span>
                                <span className="text-[10px] font-bold text-[#8E7D72] uppercase tracking-widest">2 hours ago</span>
                            </div>
                        </div>
                        <div className="flex flex-row items-center justify-between gap-4 shrink-0 lg:flex-col lg:items-end lg:gap-1">
                            <span className="font-serif text-2xl text-[#3C2A21]">42</span>
                            <span className="text-[10px] text-[#8E7D72] font-bold uppercase tracking-widest">Replies</span>
                        </div>
                    </Link>
                </div>

                {/* Pagination/Load More */}
                <div className="flex justify-center items-center py-12 bg-[#FAF7F2] border-t border-[#3C2A21]/15">
                    <button className="flex items-center gap-3 text-[11px] font-bold text-[#3C2A21] uppercase tracking-[0.15em] hover:text-[#C36B42] transition-colors group">
                        <span>Load More</span>
                        <ArrowDown size={14} className="group-hover:translate-y-1 transition-transform" />
                    </button>
                </div>
            </section>
        </main>
    </div>
  );
}
