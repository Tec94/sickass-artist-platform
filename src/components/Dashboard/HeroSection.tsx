import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

export const HeroSection = () => {
  const { t } = useTranslation()
  const [currentSlide, setCurrentSlide] = React.useState(0)

  const slides = [
    { type: 'video', src: '/images/bg_video.mp4' },
    { type: 'image', src: '/images/bg1.jpg' },
    { type: 'image', src: '/images/bg2.jpg' },
    { type: 'image', src: '/images/bg3.jpg' },
  ]

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="animate-fade-in mb-8 rounded-xl border border-white/5 overflow-hidden bg-zinc-950 shadow-2xl">
      {/* Hero Section - Premio Lo Nuestro Style */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Carousel Background */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {slide.type === 'video' ? (
              <div className="w-full h-full relative overflow-hidden bg-zinc-950">
                {/* Blurred Background Layer */}
                <video
                  src={slide.src}
                  className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-40 scale-110"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                
                {/* Foreground Container with Premium Styling */}
                <div className="absolute inset-0 z-10 flex items-center justify-end pr-8 lg:pr-32 py-8 lg:py-12 pointer-events-none">
                  <div className="relative h-full w-auto max-w-[65vw] group">
                    {/* Backlight Glow */}
                    <div className="absolute inset-0 bg-amber-500/20 blur-[60px] rounded-full scale-75 translate-y-4"></div>
                    
                    {/* Main Content with Blending Mask */}
                    <video
                      src={slide.src}
                      className="relative h-full w-auto object-contain drop-shadow-2xl"
                      style={{ 
                        maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                        maskComposite: 'intersect',
                        WebkitMaskComposite: 'source-in' // For better browser support
                      }}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full relative overflow-hidden bg-zinc-950">
                 {/* Blurred Background Layer */}
                <div 
                    className="absolute inset-0 bg-cover bg-center blur-3xl opacity-50 scale-110"
                    style={{ backgroundImage: `url('${slide.src}')` }}
                />
                
                {/* Foreground Container with Premium Styling */}
                <div className="absolute inset-0 z-10 flex items-center justify-end pr-8 lg:pr-32 py-8 lg:py-12 pointer-events-none">
                  <div className="relative h-full w-auto max-w-[65vw]">
                     {/* Backlight Glow */}
                    <div className="absolute inset-0 bg-amber-500/20 blur-[60px] rounded-full scale-75 translate-y-4"></div>

                    {/* Main Content with Blending Mask */}
                    <img
                      src={slide.src}
                      alt="Hero Background"
                      className="relative h-full w-auto object-contain drop-shadow-2xl"
                      style={{ 
                        maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                        maskComposite: 'intersect',
                        WebkitMaskComposite: 'source-in'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
          </div>
        ))}
        
        {/* Animated Particles/Overlay effect for "Gold Dust" feel */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

        <div className="relative z-10 w-full h-full flex flex-col justify-center items-start text-left px-8 md:px-20 lg:px-32">
          
          {/* Top Badge */}
          <div className="flex items-center gap-2 text-amber-400 font-bold tracking-[0.2em] text-sm uppercase mb-6 animate-pulse bg-black/40 px-4 py-1 rounded-full backdrop-blur-sm border border-amber-500/20">
            <iconify-icon icon="solar:cup-star-bold" width="16" height="16"></iconify-icon> 38ª Entrega
          </div>

          {/* Main Title Stack */}
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white/90 uppercase tracking-widest mb-2 drop-shadow-lg" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
            Nominado
          </h2>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-500 to-amber-700 tracking-tighter mb-8 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] leading-[0.9]">
            PREMIO <br/> LO NUESTRO
          </h1>

          {/* Artist Name & CTA */}
          <div className="flex flex-col items-start gap-8">
            <h3 className="text-3xl font-display font-bold text-white tracking-[0.5em] border-b-2 border-amber-500 pb-2 drop-shadow-lg" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              ROA
            </h3>
            
            <a 
              href="https://premiolonuestro.com/" 
              target="_blank" 
              rel="noreferrer"
              className="group relative px-12 py-5 bg-gradient-to-r from-amber-600 to-red-600 text-white font-display font-bold text-xl uppercase tracking-widest hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(220,38,38,0.4)]"
            >
              ¡Vota Ya!
              <span className="absolute inset-0 border-2 border-white/20 group-hover:border-white/50 transition-colors"></span>
            </a>
          </div>

        </div>
      </section>

      {/* Social Bar - Instagram Integration Style */}
      <div className="bg-zinc-950/90 backdrop-blur-xl py-4 border-t border-white/5 relative z-20">
        <div className="max-w-7xl mx-auto px-4 flex justify-center md:justify-between items-center">
          <div className="hidden md:flex items-center gap-2 text-zinc-400 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            LATEST UPDATES
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-zinc-500 text-xs font-bold uppercase tracking-widest">
            <a href="https://www.instagram.com/roawolf/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
              <iconify-icon icon="mdi:instagram" width="16" height="16"></iconify-icon> @ROAWOLF
            </a>
            <a href="https://roa.lnk.to/PSV4" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Roa</a>
            <a href="https://open.spotify.com/album/1XSQ56Y0zCG0Aht3EvSHj4?si=6e0a5XxuQR6ydZezyn3k8w" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Spotify</a>
            <a href="https://music.youtube.com/playlist?list=OLAK5uy_kDqvpb9zlGREuHwo-__LStv87kkrv1pW8&src=Linkfire&lId=13dd03a4-c1a8-4efe-8466-bedcc796b0d7&cId=d3d58fd7-4c47-11e6-9fd0-066c3e7a8751&utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnsL_54OOOH8lLqTUOzMUS3oNhI3kck3vIK0SdEnxu7jdSYla4snbqYqnzRJg_aem_TT6QXfGMkEXMI3KQWWVJyA" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Youtube Music</a>
          </div>
        </div>
      </div>
    </div>
  );
};