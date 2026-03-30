import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';
import { Search, UserCircle, Trophy, BookOpen, TrendingUp, Minus, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import SharedNavbar from '../../components/Navigation/SharedNavbar';
export default function Archive() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--site-page-bg)] font-sans text-[var(--site-text)] selection:bg-[var(--site-selection)]">
        <style>{`
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }
        `}</style>

        <SharedNavbar />

        <div className="flex min-h-screen">
            {/* SideNavBar Navigation Shell */}
            <aside className="fixed left-0 top-[#72px] hidden h-[calc(100vh-72px)] w-64 flex-col border-r border-[#3C2A21] bg-[#FAF7F2] pt-12 lg:flex">
                <div className="px-6 mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <img className="w-10 h-10 object-cover grayscale border border-[#3C2A21]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNtM68J4thnsFiUg7OusBuJ2El7hmsRKfnsFNng8SJ1uA7CixmnjD4l_Bw1Cbw9LdJCRCTQhuYc0qUxwAZJFleqEUsLmXWVM2oVgsLeFR_V-fyoYojj07h4LoLPoUZ-jsj43s_QVUxE-_-7TlszRzj0SjfSR3eXd-X-KiA493zqnRkua0RQuqunzjrkDmybATn0h1A05zTDZK0y5H3CbxRDyFmhg4Q6R5mkjWK8Nq_-EB5Jz4GvYhRCK-9sjE0xHV0XWbeFYhHau7I" alt="Curator Profile Portrait" />
                        <div>
                            <p className="font-serif text-xl text-[#3C2A21]">The Registry</p>
                            <p className="font-sans uppercase tracking-widest text-[11px] font-semibold text-[#8E7D72]">Est. 1924</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 space-y-1">
                    <Link to="/rankings" onClick={() => setNextTransition('push')} className="flex items-center gap-3 py-3 font-sans uppercase tracking-widest text-[11px] font-semibold text-[#C36B42] bg-[#C36B42]/5 border-l-4 border-[#C36B42] pl-3 hover:translate-x-1 transition-transform duration-200">
                        <Trophy size={18} />
                        <span>Current Rankings</span>
                    </Link>
                    <Link to="/archive" className="flex items-center gap-3 py-3 font-sans uppercase tracking-widest text-[11px] font-semibold text-[#8E7D72] hover:text-[#3C2A21] pl-4 hover:translate-x-1 transition-transform duration-200">
                        <BookOpen size={18} />
                        <span>Historical Registry</span>
                    </Link>
                </nav>
                <div className="p-6">
                    <button className="w-full py-4 border-2 border-[#3C2A21] font-sans uppercase tracking-widest text-[11px] font-extrabold hover:bg-[#3C2A21] hover:text-[#F4EFE6] transition-all duration-300 active:scale-95">
                        Submit Entry
                    </button>
                </div>
            </aside>

            {/* Main Content Canvas */}
            <main className="flex-1 p-5 pb-24 sm:p-8 lg:ml-64 lg:p-12">
                {/* Hero Header Section */}
                <div className="mb-12 border-b border-[#3C2A21]/15 pb-8">
                    <p className="text-[11px] uppercase tracking-[0.3em] font-extrabold text-[#C36B42] mb-4">Volume IV • No. 12</p>
                    <h2 className="mb-6 font-serif text-[clamp(3rem,11vw,6rem)] leading-none tracking-tighter md:text-8xl">The Song Ranking Portal</h2>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <p className="max-w-xl font-serif text-xl italic text-[#8E7D72] leading-relaxed">
                            A definitive ledger of auditory excellence, chronicling the seasonal shifts in acoustic preference and compositional merit across the grand estate.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="text-right border-r border-[#3C2A21]/15 pr-6">
                                <p className="text-[10px] uppercase font-bold tracking-tighter text-[#8E7D72]">Updated</p>
                                <p className="font-label font-bold text-sm">OCT 24, 1924</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-bold tracking-tighter text-[#8E7D72]">Entries</p>
                                <p className="font-label font-bold text-sm">1,204 TOTAL</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Podium and Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: The Podium (Top 3) */}
                    <div className="lg:col-span-4 space-y-8">
                        <h3 className="font-label text-[11px] uppercase tracking-widest font-extrabold flex items-center gap-2">
                            <span className="w-8 h-px bg-[#3C2A21]"></span>
                            Top Honors
                        </h3>
                        {/* Rank 1 Card */}
                        <div className="relative bg-[#FAF7F2] border border-[#3C2A21] p-6 group">
                            <span className="absolute -top-4 -left-4 w-12 h-12 bg-[#C36B42] text-white flex items-center justify-center font-headline text-2xl italic font-bold">1</span>
                            <div className="aspect-square mb-6 overflow-hidden">
                                <img className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuANaJ5-9lmcNr3WwLm6kWqChtP1P5ju591qyNVpBDsOarzuUMTS_pyKJusT85TaVcRpBopM4gq-m9UcLZ8a-vAoveattcqINPt4hkmnu8PSq5I_-0kjIFMd9MD53K20KbQXCJLD-Rc05431uos4rd6pAyHOqMMSQUdirXFITNAt5N6PZrrEzFmd5BePol3IAmWUb1TRCpfd8Vw_v9apDexyEyyWVIevdve9FxP0A7SXMziXxGK8IdyDBzoW1w57pj7hjr8ejVbtuhuV" alt="Vinyl Record spinning on turntable" />
                            </div>
                            <h4 className="font-headline text-3xl mb-1">A Nocturne in C#</h4>
                            <p className="font-label text-[11px] uppercase tracking-widest text-[#8E7D72] mb-4">The Chamber Ensemble</p>
                            <div className="flex justify-between items-center pt-4 border-t border-[#3C2A21]/15">
                                <span className="text-[10px] font-bold uppercase tracking-tighter">Status: Gold Seal</span>
                                <span className="font-label font-extrabold text-[#C36B42]">84,201 PLAYS</span>
                            </div>
                        </div>

                        {/* Rank 2 Card */}
                        <div className="relative bg-[#FAF7F2] border border-[#3C2A21]/40 p-5 group">
                            <span className="absolute -top-3 -left-3 w-10 h-10 bg-[#3C2A21] text-[#F4EFE6] flex items-center justify-center font-headline text-xl italic font-bold">2</span>
                            <h4 className="font-headline text-2xl mb-1">Dusk Over the Terrace</h4>
                            <p className="font-label text-[11px] uppercase tracking-widest text-[#8E7D72] mb-3">Evelyn St. Claire</p>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                                <span className="text-[#8E7D72]">Archives</span>
                                <span className="text-[#3C2A21]">72,890 PLAYS</span>
                            </div>
                        </div>

                        {/* Rank 3 Card */}
                        <div className="relative bg-[#FAF7F2] border border-[#3C2A21]/40 p-5 group">
                            <span className="absolute -top-3 -left-3 w-10 h-10 bg-[#3C2A21]/60 text-[#F4EFE6] flex items-center justify-center font-headline text-xl italic font-bold">3</span>
                            <h4 className="font-headline text-2xl mb-1">Rhythm of the Loom</h4>
                            <p className="font-label text-[11px] uppercase tracking-widest text-[#8E7D72] mb-3">The Industrial Quartet</p>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                                <span className="text-[#8E7D72]">New Entry</span>
                                <span className="text-[#3C2A21]">68,412 PLAYS</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: The Ledger List */}
                    <div className="lg:col-span-8">
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="font-label text-[11px] uppercase tracking-widest font-extrabold">Registry Ledger</h3>
                            <div className="flex flex-wrap gap-4">
                                <button className="text-[10px] uppercase font-bold tracking-widest border-b border-[#C36B42] text-[#C36B42]">By Rank</button>
                                <button className="text-[10px] uppercase font-bold tracking-widest text-[#8E7D72] hover:text-[#3C2A21]">By Genre</button>
                                <button className="text-[10px] uppercase font-bold tracking-widest text-[#8E7D72] hover:text-[#3C2A21]">A-Z</button>
                            </div>
                        </div>

                        {/* Ledger Table */}
                        <div className="border-t-2 border-[#3C2A21]">
                            <div className="hidden grid-cols-12 bg-[#D1C7BC]/10 px-4 py-3 text-[10px] font-extrabold uppercase tracking-widest text-[#8E7D72] md:grid md:border-b md:border-[#3C2A21]">
                                <div className="col-span-1">No.</div>
                                <div className="col-span-5">Composition Title</div>
                                <div className="col-span-3">Orchestra / Artist</div>
                                <div className="col-span-2 text-right">Circulation</div>
                                <div className="col-span-1 text-right">Trend</div>
                            </div>
                            <div className="space-y-4 py-4 md:hidden">
                                {[ 
                                    { no: '04', title: 'Winter Whispers at Dawn', genre: 'Classical / Solo Piano', artist: 'Arthur Penhaligon', circ: '54,109', trend: 'Rising' },
                                    { no: '05', title: 'The Marble Hall Gala', genre: 'Orchestral / Waltz', artist: 'Vienna State Phil.', circ: '49,822', trend: 'Holding' },
                                    { no: '06', title: 'Starlight Promenade', genre: 'Jazz / Swing', artist: 'The Midnight Five', circ: '41,002', trend: 'Falling' },
                                    { no: '07', title: 'Echoes of the Great Lake', genre: 'Ambient / Nature', artist: 'Environmentalist Soc.', circ: '39,441', trend: 'Rising' },
                                    { no: '08', title: 'Copper Pipe Fugue', genre: 'Experimental', artist: 'The Foundry Duo', circ: '22,810', trend: 'Holding' }
                                ].map((row, i) => (
                                    <article key={`mobile-${i}`} className="border border-[#3C2A21]/15 bg-[#FAF7F2] p-5">
                                        <div className="mb-4 flex items-start justify-between gap-4">
                                            <div>
                                                <span className="font-label text-[10px] font-extrabold uppercase tracking-widest text-[#8E7D72]">No. {row.no}</span>
                                                <h4 className="mt-2 font-serif text-2xl leading-tight text-[#3C2A21]">{row.title}</h4>
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C36B42]">{row.trend}</span>
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8E7D72]">{row.genre}</p>
                                        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#3C2A21]/12 pt-4 text-sm">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8E7D72]">Artist</p>
                                                <p className="mt-2 font-semibold">{row.artist}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8E7D72]">Circulation</p>
                                                <p className="mt-2 font-semibold">{row.circ}</p>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                            
                            {[ 
                                { no: '04', title: 'Winter Whispers at Dawn', genre: 'Classical / Solo Piano', artist: 'Arthur Penhaligon', circ: '54,109', trendIcon: <TrendingUp size={18} className="text-green-700" /> },
                                { no: '05', title: 'The Marble Hall Gala', genre: 'Orchestral / Waltz', artist: 'Vienna State Phil.', circ: '49,822', trendIcon: <Minus size={18} className="text-[#8E7D72]" /> },
                                { no: '06', title: 'Starlight Promenade', genre: 'Jazz / Swing', artist: 'The Midnight Five', circ: '41,002', trendIcon: <TrendingDown size={18} className="text-red-700" /> },
                                { no: '07', title: 'Echoes of the Great Lake', genre: 'Ambient / Nature', artist: 'Environmentalist Soc.', circ: '39,441', trendIcon: <TrendingUp size={18} className="text-green-700" /> },
                                { no: '08', title: 'Copper Pipe Fugue', genre: 'Experimental', artist: 'The Foundry Duo', circ: '22,810', trendIcon: <Minus size={18} className="text-[#8E7D72]" /> }
                            ].map((row, i) => (
                                <div key={i} className="hidden grid-cols-12 border-b border-[#3C2A21]/15 px-4 py-4 transition-colors group cursor-pointer hover:bg-[#C36B42]/[0.03] md:grid">
                                    <div className="col-span-1 font-label font-extrabold text-sm self-center">{row.no}</div>
                                    <div className="col-span-5 flex flex-col justify-center">
                                        <span className="font-serif text-lg leading-tight group-hover:text-[#C36B42]">{row.title}</span>
                                        <span className="text-[9px] uppercase font-bold tracking-tighter text-[#8E7D72]">{row.genre}</span>
                                    </div>
                                    <div className="col-span-3 font-label text-[11px] font-bold self-center uppercase tracking-wider">{row.artist}</div>
                                    <div className="col-span-2 text-right font-label font-extrabold text-sm self-center">{row.circ}</div>
                                    <div className="col-span-1 text-right self-center">
                                        {row.trendIcon}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="font-serif italic text-[#8E7D72] text-sm">Displaying entries 1 through 8 of 1,204.</p>
                            <div className="flex gap-2">
                                <button className="w-10 h-10 border border-[#3C2A21] flex items-center justify-center hover:bg-[#C36B42] hover:text-white transition-colors">
                                    <ChevronLeft size={20} />
                                </button>
                                <button className="w-10 h-10 border border-[#3C2A21] bg-[#C36B42] text-white flex items-center justify-center font-label font-bold text-sm">1</button>
                                <button className="w-10 h-10 border border-[#3C2A21] flex items-center justify-center font-label font-bold text-sm hover:bg-[#C36B42] hover:text-white transition-colors">2</button>
                                <button className="w-10 h-10 border border-[#3C2A21] flex items-center justify-center hover:bg-[#C36B42] hover:text-white transition-colors">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
  );
}
