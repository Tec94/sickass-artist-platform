import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import RelicAssemblyScroll from '../components/Landing/RelicAssemblyScroll';

export function PrivateSuite() {
  const pageRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);

  // Find the App's actual scroll container on mount
  useEffect(() => {
    const el = document.querySelector('[data-scroll-container]') as HTMLElement | null;
    if (el) {
      (scrollContainerRef as React.MutableRefObject<HTMLElement | null>).current = el;
    }
  }, []);

  // Track how far pageRef has scrolled inside the App's scroll container
  const { scrollYProgress } = useScroll({
    target: pageRef,
    container: scrollContainerRef as React.RefObject<HTMLElement>,
    offset: ['start start', 'end end'],
  });

  // --- Text overlay transforms (threshold-based snap transitions) ---
  // Text 1: visible immediately, snaps off at ~5%
  const opacity1 = useTransform(scrollYProgress, [0, 0.04, 0.05], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.05], [0, -20]);

  // Text 2: snaps on at 25%, snaps off at 30%
  const opacity2 = useTransform(scrollYProgress, [0.245, 0.255, 0.295, 0.305], [0, 1, 1, 0]);
  const x2 = useTransform(scrollYProgress, [0.245, 0.26], [-30, 0]);

  // Text 3: snaps on at 50%, snaps off at 55%
  const opacity3 = useTransform(scrollYProgress, [0.495, 0.505, 0.545, 0.555], [0, 1, 1, 0]);
  const x3 = useTransform(scrollYProgress, [0.495, 0.51], [30, 0]);

  // Text 4 (CTA): snaps on at 75%, stays visible
  const opacity4 = useTransform(scrollYProgress, [0.745, 0.755, 0.85], [0, 1, 1]);
  const scale4 = useTransform(scrollYProgress, [0.745, 0.76], [0.95, 1]);

  // Frame scroll: map the first ~85% of page scroll to full frame range
  // (extended to match the wider text spacing)
  const frameScrollProgress = useTransform(scrollYProgress, [0, 0.85], [0, 1]);

  // Hide text overlays once we're past the frame section
  const overlayOpacity = useTransform(scrollYProgress, [0.86, 0.88], [1, 0]);
  // Completely remove overlay from event pipeline when invisible
  const overlayVisibility = useTransform(scrollYProgress, (v) =>
    v > 0.89 ? 'hidden' as const : 'visible' as const
  );

  return (
    <div
      ref={pageRef}
      className="relative bg-[#050505] text-white font-display selection:bg-red-900/30 selection:text-red-100"
    >
      {/* ═══════════════════════════════════════════════════════ */}
      {/* SECTION 1: Frame Scroll Sequence                       */}
      {/* The 400vh div creates scroll distance for the frames.  */}
      {/* The sticky container pins the canvas during scrolling. */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="relative" style={{ height: '400vh' }}>
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-[#050505]">
          <RelicAssemblyScroll scrollYProgress={frameScrollProgress} />
        </div>
      </div>

      {/* ─── Fixed Text Overlays ─── */}
      <motion.div
        style={{ opacity: overlayOpacity, visibility: overlayVisibility, pointerEvents: 'none' }}
        className="fixed inset-0 z-40 flex flex-col justify-center items-center p-6 md:p-12"
      >
        {/* Section 1: Intro Title */}
        <motion.div
          style={{ opacity: opacity1, y: y1 }}
          className="absolute inset-0 flex items-center justify-center text-center"
        >
          <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            PRIVATE SUITE.
          </h1>
        </motion.div>

        {/* Section 2: Relics Return */}
        <motion.div
          style={{ opacity: opacity2, x: x2 }}
          className="absolute inset-0 flex items-center justify-start px-[10%] md:px-[15%]"
        >
          <div className="max-w-md space-y-4">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white/90">THE RELICS RETURN.</h2>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed font-light">
              Armor forged in silence. <br />A legacy reassembled piece by piece.
            </p>
            <div className="h-px w-24 bg-gradient-to-r from-red-800 to-transparent opacity-50" />
          </div>
        </motion.div>

        {/* Section 3: Steel, Sin, Grace */}
        <motion.div
          style={{ opacity: opacity3, x: x3 }}
          className="absolute inset-0 flex items-center justify-end px-[10%] md:px-[15%] text-right"
        >
          <div className="max-w-md space-y-4 flex flex-col items-end">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white/90">STEEL, SIN, AND GRACE.</h2>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed font-light">
              From the shadows of the old world <br />into the neon glare of the new.
            </p>
            <div className="h-px w-24 bg-gradient-to-l from-blue-900 to-transparent opacity-50" />
          </div>
        </motion.div>

        {/* Section 4: CTA — wrapper stays pointer-events-none, only links are clickable */}
        <motion.div
          style={{ opacity: opacity4, scale: scale4 }}
          className="absolute inset-0 flex flex-col items-center justify-center space-y-8"
        >
          <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white/95 drop-shadow-[0_0_30px_rgba(255,255,255,0.15)] text-center">
            LISTEN NOW.
          </h2>
          <div className="flex flex-col md:flex-row gap-6 mt-8" style={{ pointerEvents: 'auto' }}>
            <a href="#" className="group relative px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 font-medium tracking-wide text-sm md:text-base flex items-center gap-3">
                <SpotifyIcon className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                SPOTIFY
              </span>
            </a>
            <a href="#" className="group relative px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 font-medium tracking-wide text-sm md:text-base flex items-center gap-3">
                <AppleMusicIcon className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                APPLE MUSIC
              </span>
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SECTION 2: Below-Fold Content                          */}
      {/* ═══════════════════════════════════════════════════════ */}
      <BelowFoldContent />
    </div>
  );
}

// ─── Below-Fold Content ──────────────────────────────────────────────
function BelowFoldContent() {
  const dashboardData = useQuery(api.dashboard.getDashboardData);
  const nextEvent = dashboardData?.upcomingEvents?.[0];
  const topProduct = dashboardData?.topMerch?.[0];
  const forumPosts = dashboardData?.trendingForum || [];

  return (
    <div className="relative z-30 bg-[#050505]">
      {/* Gradient transition */}
      <div className="h-32 bg-gradient-to-b from-transparent to-[#050505] -mt-32 relative z-10" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-12 pb-24">

        {/* Divider */}
        <div className="flex items-center gap-6 mb-20">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <h2 className="text-xs uppercase tracking-[0.4em] text-white/30 font-bold whitespace-nowrap">The Realm Awaits</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Widget Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Next Event */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.3 }}
            className="bg-zinc-900/60 border border-zinc-800/50 backdrop-blur-sm p-6 flex flex-col group hover:border-amber-500/30 transition-all duration-500 rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                Next Stage Call
              </h3>
              <Link to="/events" className="text-[10px] text-zinc-500 hover:text-white uppercase tracking-wider transition-colors">View All</Link>
            </div>
            {nextEvent ? (
              <>
                <div className="relative aspect-video bg-zinc-800/50 mb-4 overflow-hidden rounded">
                  {nextEvent.imageUrl ? (
                    <img src={nextEvent.imageUrl} alt="Event" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600">No Image</div>
                  )}
                  <div className="absolute top-2 right-2 bg-amber-500 text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wider">Upcoming</div>
                </div>
                <h4 className="text-white font-bold text-lg mb-1">{nextEvent.title}</h4>
                <p className="text-zinc-500 text-sm mb-4">{new Date(nextEvent.startAtUtc).toLocaleDateString()} • {nextEvent.city}</p>
                <Link to={`/events/${nextEvent._id}`} className="mt-auto w-full border border-zinc-700/50 text-zinc-300 py-2.5 text-center text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300 rounded">
                  Details
                </Link>
              </>
            ) : (
              <div className="text-zinc-600 text-sm py-10 text-center italic">No upcoming events</div>
            )}
          </motion.div>

          {/* Trending Merch */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true, amount: 0.3 }}
            className="bg-zinc-900/60 border border-zinc-800/50 backdrop-blur-sm p-6 flex flex-col group hover:border-red-600/30 transition-all duration-500 rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                Hot Drop
              </h3>
              <Link to="/store" className="text-[10px] text-zinc-500 hover:text-white uppercase tracking-wider transition-colors">Shop All</Link>
            </div>
            {topProduct ? (
              <div className="flex gap-4 items-center">
                <div className="w-24 h-32 bg-zinc-800/50 shrink-0 overflow-hidden rounded">
                  {topProduct.image ? (
                    <img src={topProduct.image} alt="Product" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-zinc-800" />
                  )}
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">{topProduct.name}</h4>
                  <p className="text-red-500 font-bold mb-2">${(topProduct.price / 100).toFixed(2)}</p>
                  <div className="text-[10px] text-zinc-500 mb-3 uppercase tracking-wider">Limited Stock</div>
                  <Link to={`/store/product/${topProduct._id}`} className="text-xs font-bold uppercase text-white border-b border-red-600 pb-1 hover:text-red-500 transition-colors">Buy Now</Link>
                </div>
              </div>
            ) : (
              <div className="text-zinc-600 text-sm py-10 text-center italic">No trending merch</div>
            )}
          </motion.div>

          {/* Community Buzz */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true, amount: 0.3 }}
            className="bg-zinc-900/60 border border-zinc-800/50 backdrop-blur-sm p-6 flex flex-col group hover:border-blue-500/30 transition-all duration-500 rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                Wolfpack Chatter
              </h3>
              <Link to="/forum" className="text-[10px] text-zinc-500 hover:text-white uppercase tracking-wider transition-colors">Join</Link>
            </div>
            <div className="space-y-4">
              {forumPosts.slice(0, 3).map(post => (
                <Link key={post._id} to={`/forum/thread/${post._id}`} className="block group/post">
                  <div className="text-sm font-bold text-zinc-300 group-hover/post:text-blue-400 transition-colors line-clamp-1">{post.title}</div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-600 mt-1">
                    <span>{post.replyCount || 0} replies</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
              {forumPosts.length === 0 && (
                <div className="text-zinc-600 text-sm text-center italic">No active discussions</div>
              )}
            </div>
            <Link to="/forum" className="mt-auto flex items-center gap-2 text-xs text-zinc-500 hover:text-white pt-4 transition-colors">View All Threads →</Link>
          </motion.div>
        </div>

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Events', href: '/events', accent: 'border-amber-500/30' },
            { label: 'Store', href: '/store', accent: 'border-red-500/30' },
            { label: 'Gallery', href: '/gallery', accent: 'border-blue-500/30' },
            { label: 'Ranking', href: '/ranking', accent: 'border-emerald-500/30' },
          ].map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`group bg-zinc-900/40 border border-zinc-800/40 rounded-lg p-6 text-center hover:${item.accent} transition-all duration-500`}
            >
              <span className="text-sm font-bold uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </motion.div>

        {/* Footer */}
        <div className="mt-32 pb-20 text-center">
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
          <p className="text-[10px] text-zinc-700 uppercase tracking-[0.5em]">Private Suite © 2026</p>
        </div>
      </div>
    </div>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────
function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.2-1.32 9.6-0.66 13.38 1.68.48.3.6.84.36 1.141zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.38 4.14-1.26 11.28-.96 15.72 1.62.54.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.299z" />
    </svg>
  );
}

function AppleMusicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M15.548 10.978c-.287.164-.627.164-.913 0l-2.072-1.196a.912.912 0 0 1-.456-.79V6.6a.914.914 0 0 1 1.37-.791l2.071 1.196c.287.164.456.468.456.79v2.392a.916.916 0 0 1-.456.791zm-4.184-1.196-2.072 1.196a.914.914 0 0 0-.456.791v2.392c0 .322.17.627.456.791l2.072 1.196c.287.164.627.164.913 0l2.072-1.196a.912.912 0 0 0 .456-.79V10.98a.914.914 0 0 0-1.37-.791l-2.071 1.196zm2.092 6.38a.914.914 0 0 0 .456.791l2.072 1.196c.287.164.627.164.913 0l2.072-1.196a.912.912 0 0 0 .456-.79v-2.392a.914.914 0 0 0-1.37-.791l-2.071 1.196c-.287.164-.456.468-.456.79v2.392zm-2.092-8.773a.914.914 0 0 0 .456.791l2.072 1.196c.287.164.627.164.913 0l2.072-1.196a.912.912 0 0 0 .456-.79V4.208a.914.914 0 0 0-1.37-.791l-2.071 1.196c-.287.164-.456.468-.456.79v2.392zM12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12z" />
    </svg>
  );
}
