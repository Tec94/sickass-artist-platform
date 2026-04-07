import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';
import { ArrowRight } from 'lucide-react';
import SharedNavbar from '../../components/Navigation/SharedNavbar';
import {
  formatPrototypePrice,
  getPrototypeStoreProducts,
} from '../../features/store/prototypeStoreCatalog';

const featuredDrops = getPrototypeStoreProducts('all', 'latest')
  .filter((product) => product.availability === 'available')
  .slice(0, 2)
  .map((product) => ({
    ...product,
    displayImage:
      product.gallery.find((image) => image.startsWith('/')) ||
      (product.primaryImage.startsWith('/') ? product.primaryImage : '/images/placeholder.jpg'),
  }));

const handleFeaturedDropImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const target = event.currentTarget;
  if (target.dataset.fallbackApplied === 'true') return;
  target.dataset.fallbackApplied = 'true';
  target.src = '/images/placeholder.jpg';
};

const formatFeaturedDropPrice = (priceCents: number) =>
  formatPrototypePrice(priceCents).replace('.00', '');

export default function Dashboard() {
  return (
    <div className="flex min-h-[100dvh] flex-col overflow-x-hidden bg-[var(--site-page-bg)] font-sans text-[var(--site-text)] antialiased">
      <style>{`
        .border-ink { border-color: #3C2A21; }
        .border-ink-soft { border-color: rgba(60, 42, 33, 0.15); }
        .border-b-1 { border-bottom-width: 1px; }
        .border-r-1 { border-right-width: 1px; }
        .text-xs-wide {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            font-weight: 600;
        }
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #F4EFE6;
        }
        ::-webkit-scrollbar-thumb {
            background: #D1C7BC;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #C36B42;
        }
      `}</style>
      <SharedNavbar />

      <main
        data-testid="dashboard-shell"
        className="relative flex min-h-[calc(100dvh-72px)] flex-1 flex-col overflow-x-hidden lg:flex-row"
      >
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[62%] z-20 hidden w-px bg-[#3C2A21] lg:block" />
        <div data-testid="dashboard-primary-column" className="flex w-full flex-col lg:w-[62%]">
          <div className="p-4 pb-4 sm:p-6 sm:pb-4 lg:p-8 lg:pb-4">
            <div
              data-testid="dashboard-hero"
              className="relative flex min-h-[420px] w-full items-end overflow-hidden rounded-sm bg-cover bg-center p-6 py-6 shadow-md sm:min-h-[520px] sm:p-8 lg:min-h-[clamp(420px,55vh,640px)] lg:p-10 lg:py-8"
              style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB86GbIO7WgW0L69jtt82aIUOmNarBlGkzBUM3huKDkF0mfNpoIFWmf5OxHUsnWdEO-IkcX4_vOfGShwdFyYcKVegTinoJzQooaQQtxdzbpCV1QlXUGudVo1xQeLL7S1wLEdTj6JY8_3e7e1_BcmReZ0CdymYgjwGp-9McbjNAsc3RYaIN__mwJIpBf2r0ffAuGaJh0NA5dlreRmv2-OBxIvVUCcCvpiN7FCIMsI5p65oAATzGQVZYHnjRzs8VmJp0qM7L_AuwNRGu9')"}}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#3C2A21]/80 via-[#3C2A21]/30 to-transparent"></div>
              <div className="relative z-10 w-full">
                <span className="text-[#FAF7F2]/80 text-xs-wide block mb-4 border-b border-[#FAF7F2]/30 pb-2 inline-block">Private Suite Vol. 3</span>
                <h2 className="font-serif text-[clamp(3.2rem,12vw,4.8rem)] text-[#FAF7F2] leading-none font-medium mb-4 lg:text-[72px]">LATEST DROP</h2>
                <p className="mb-3 font-serif text-xl italic text-[#FAF7F2] opacity-90 sm:text-2xl">"Every night has a room. This one is yours."</p>
                <p className="max-w-lg font-sans text-sm text-[#FAF7F2]/80 sm:text-base">The new collection just dropped. Explore the merch, listen to the latest tracks, and check upcoming tour dates.</p>
                <Link to="/new-post" onClick={() => setNextTransition('push')} className="mt-8 inline-flex w-full items-center justify-center rounded-sm border border-[#FAF7F2] px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider text-[#FAF7F2] transition-all hover:bg-[#FAF7F2] hover:text-[#3C2A21] sm:w-auto sm:px-8">
                  Explore Now
                </Link>
              </div>
            </div>
          </div>
          <div
            data-testid="dashboard-lower-grid"
            className="grid grid-cols-1 gap-8 px-4 pb-8 sm:px-6 lg:grid-cols-2 lg:px-8"
          >
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-[#3C2A21]/20 pb-2">
                <h3 className="text-xs-wide text-[#3C2A21]">Pack Activity</h3>
                <Link to="/new-post" onClick={() => setNextTransition('push')} className="text-[10px] uppercase font-bold text-[#C36B42] hover:text-[#3C2A21] transition-colors">Forum</Link>
              </div>
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-[#FAF7F2] border border-[#3C2A21]/10 rounded-sm hover:border-[#C36B42]/50 transition-all cursor-pointer group">
                  <span className="text-[10px] text-[#8E7D72] font-bold block mb-1">DISCUSSION / 128 REPLIES</span>
                  <h4 className="font-serif text-lg leading-tight mb-2 group-hover:text-[#C36B42] transition-colors">Who else is going to the Miami show?</h4>
                  <p className="text-xs text-[#3C2A21]/70 line-clamp-2">Already got my tickets for the Kaseya Center. Anyone from the pack going? Trying to set up a meetup before the doors open...</p>
                </div>
              </div>
            </section>
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-[#3C2A21]/20 pb-2">
                <h3 className="text-xs-wide text-[#3C2A21]">New Drops</h3>
                <Link to="/store" onClick={() => setNextTransition('push')} className="text-[10px] uppercase font-bold text-[#C36B42] hover:text-[#3C2A21] transition-colors">Full Store</Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {featuredDrops.map((product) => (
                  <Link
                    key={product.slug}
                    to={`/store/product/${product.slug}`}
                    onClick={() => setNextTransition('push')}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-square bg-[#FAF7F2] border border-[#3C2A21]/10 mb-3 overflow-hidden shadow-[0_8px_24px_rgba(60,42,33,0.08)]">
                      <img
                        alt={product.alt}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-95 group-hover:opacity-100"
                        loading="lazy"
                        onError={handleFeaturedDropImageError}
                        src={product.displayImage}
                      />
                    </div>
                    <h4 className="font-serif text-base text-[#3C2A21] group-hover:text-[#C36B42] transition-colors">{product.name}</h4>
                    <span className="text-xs text-[#8E7D72] font-medium">
                      {formatFeaturedDropPrice(product.priceCents)} / {(product.badge ?? 'Featured').toUpperCase()}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
        <div
          data-testid="dashboard-secondary-column"
          className="flex w-full flex-col border-t border-[#3C2A21]/12 bg-[#F4EFE6] lg:h-full lg:w-[38%] lg:border-t-0"
        >
          <div className="border-b border-ink bg-[#FAF7F2] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <h3 className="text-xs-wide text-[#8E7D72] mb-6">Your Status</h3>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-serif text-3xl text-[#3C2A21] mb-1">Pack Member #4,102</h4>
                <span className="text-xs-wide text-[#C36B42]">Lobo Tier</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#8E7D72] font-bold block tracking-widest">CURRENT RANK</span>
                <span className="font-serif text-4xl text-[#3C2A21]">XII</span>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex justify-between text-[10px] font-bold uppercase mb-2 tracking-widest">
                <span className="text-[#8E7D72]">Quest Progress</span>
                <span className="text-[#3C2A21]">72%</span>
              </div>
              <div className="w-full h-[2px] bg-[#3C2A21]/10">
                <div className="bg-[#C36B42] h-full transition-all duration-1000" style={{width: '72%'}}></div>
              </div>
            </div>
          </div>
          <div className="border-b-1 border-ink-soft flex items-center justify-between bg-[#F4EFE6] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            <h3 className="font-serif text-2xl text-[#3C2A21] font-medium">Updates</h3>
            <span className="text-xs-wide text-[#8E7D72]">2026</span>
          </div>
          <div className="flex flex-col bg-[#F4EFE6] px-0 py-0 lg:flex-1 lg:overflow-y-auto">
            <Link to="/new-post" onClick={() => setNextTransition('push')} className="dispatch-link group flex flex-col gap-1 border-b border-[#3C2A21]/10 px-4 py-6 sm:px-6 lg:px-8">
              <span className="text-xs-wide text-[#8E7D72] group-hover:text-[#C36B42] transition-colors">20 MAR 2026</span>
              <h4 className="font-serif text-xl text-[#3C2A21] group-hover:text-[#C36B42] transition-colors">New merch just dropped — Private Suite Vol. 3 collection</h4>
            </Link>
          </div>
          <div className="border-t-1 border-ink-soft flex justify-center bg-[#FAF7F2] px-4 py-6 sm:px-6 lg:px-8">
            <Link to="/archive" onClick={() => setNextTransition('push')} className="flex items-center gap-2 text-xs-wide text-[#3C2A21] transition-all hover:text-[#C36B42]">
                            View All Updates
                            <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
