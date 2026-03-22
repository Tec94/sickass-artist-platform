import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';
import { ArrowLeft, X, CheckCircle, Gift, Ticket, Zap, Moon, Globe, User, Check, Flame, Award } from 'lucide-react';

export default function Identity() {
  const [activeTab, setActiveTab] = useState<'quests' | 'redeem' | 'settings'>('quests');
  
  useEffect(() => {
    // Ensure the panel is visible on load for this dedicated identity page
    document.body.classList.add('panel-open');
    return () => document.body.classList.remove('panel-open');
  }, []);

  return (
    <div className="min-h-screen w-full font-sans bg-vellum">
      <style>{`body {
    font-family: inherit;
    background-color: #F4EFE6;
    color: #1C1B1A;
    margin: 0;
    overflow: hidden;
    }
.utility-panel {
    transform: translatex(100%);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 40;
    }
.panel-open .utility-panel {
    transform: translatex(0)
    }
/* Strict 1px borders */
.border-ink {
    border-color: #1C1B1A
    }
/* Custom Scrollbar for Panel */
.utility-panel::-webkit-scrollbar {
    width: 4px
    }
.utility-panel::-webkit-scrollbar-track {
    background: transparent
    }
.utility-panel::-webkit-scrollbar-thumb {
    background: #8E8982;
    border-radius: 2px
    }
.nav-fab:hover .material-symbols-outlined {
    font-variation-settings: "FILL" 1;
    color: #0f83bd
    }`}</style>
      
<div className="fixed top-8 left-8 z-20 flex flex-col gap-4">
<Link aria-label="Back to Dashboard" className="nav-fab flex items-center justify-center w-12 h-12 bg-vellum border border-ink rounded-sm shadow-sm transition-all hover:border-primary group cursor-pointer" to="/proto/directory">
<ArrowLeft className="text-ink group-hover:text-primary transition-colors duration-200" />
</Link>
</div>

<aside className="utility-panel fixed top-0 right-0 w-[400px] h-screen bg-vellum border-l border-ink z-30 flex flex-col overflow-y-auto backdrop-blur-md shadow-2xl">

<header className="sticky top-0 bg-vellum z-40 flex items-center justify-between px-6 py-6 border-b border-ink">
<div>
<h1 className="font-display font-semibold text-2xl tracking-tight text-ink uppercase">Identity</h1>
<p className="text-xs font-medium text-muted tracking-widest uppercase mt-1">Configure Archive</p>
</div>

<button aria-label="Close Panel" className="nav-fab w-10 h-10 flex items-center justify-center border border-transparent hover:border-ink rounded-sm transition-all" onClick={() => { setNextTransition('push-back'); window.location.href = '/proto/directory'; }}>
<X className="text-ink" />
</button>
</header>

<div className="flex-1 flex flex-col">

<section className="p-6 border-b border-ink flex items-start gap-4">
<div className="w-16 h-16 bg-background-light border border-ink rounded-sm overflow-hidden flex-shrink-0">
<img alt="User Avatar" className="w-full h-full object-cover grayscale" data-alt="Black and white portrait of the user avatar." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFtvjfctxDOknYmYqKnGkq0OSJCzVotNPCyRW1GdCscM0JKpBKLXZnsnlrseXm8ZgSuUKHkeCUZjfHOMVskOZI5_b6cp28ZD6VXEUGUlLjMhzuzovQqhiEIDa7Uxsxb-aBPUuFWeWlaeLGnYWJNrnFZneYixa_T2bYb4um82sME2SFjhUvjyQnubPsfheiYu9VGWGBzFJysGzFR1PTbDCVlTJboPS8Vn9fyGq2oGQR5IiOEHnQMMtYeEgGmgfsw3aqVYV8M3onjTjz" />
</div>
<div className="flex flex-col justify-center w-full">
<div className="flex justify-between items-center w-full">
<h2 className="font-display font-semibold text-lg leading-tight">ARCHIVIST_09</h2>
<div className="flex items-center gap-1 text-[#C36B42]">
<Zap size={14} fill="currentColor" />
<span className="font-mono text-xs font-bold">14,250</span>
</div>
</div>
<div className="flex items-center gap-3 mt-2 text-xs font-medium uppercase tracking-wider text-muted">
<span>Joined '22</span>
<span className="w-1 h-1 bg-ink rounded-full"></span>
<span>Rank: Initiate</span>
</div>
</div>
</section>

<nav className="flex border-b border-ink sticky top-[89px] bg-vellum z-30">
<button onClick={() => setActiveTab('quests')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'quests' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-ink border-b-2 border-transparent'}`}>
                    Quests
                </button>
<button onClick={() => setActiveTab('redeem')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'redeem' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-ink border-b-2 border-transparent'}`}>
                    Redeem
                </button>
<button onClick={() => setActiveTab('settings')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'settings' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-ink border-b-2 border-transparent'}`}>
                    Settings
                </button>
</nav>

<section className="flex-1 p-6 flex flex-col gap-8">

{activeTab === 'quests' && (
  <div className="space-y-6 animate-fade-in">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-ink flex items-center gap-2"><Flame size={14}/> Daily Directives</h3>
        <span className="text-xs font-medium text-muted">1/3 Completed</span>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between p-4 border border-ink/20 rounded-sm bg-background-light/50">
          <div className="flex items-center gap-3 opacity-50">
            <CheckCircle className="text-primary" size={20} />
            <span className="text-sm font-medium line-through">Check the daily dispatch</span>
          </div>
          <span className="text-xs font-mono font-bold text-muted">+50 PTS</span>
        </div>
        <div className="flex items-center justify-between p-4 border border-ink rounded-sm bg-vellum cursor-pointer hover:border-primary transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-ink/30 group-hover:border-primary transition-colors"></div>
            <span className="text-sm font-medium">Rank 3 songs in the charts</span>
          </div>
          <span className="text-xs font-mono font-bold text-primary">+150 PTS</span>
        </div>
        <div className="flex items-center justify-between p-4 border border-ink rounded-sm bg-vellum cursor-pointer hover:border-primary transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-ink/30 group-hover:border-primary transition-colors"></div>
            <span className="text-sm font-medium">RSVP to an upcoming event</span>
          </div>
          <span className="text-xs font-mono font-bold text-primary">+250 PTS</span>
        </div>
      </div>
    </div>
    
    <div className="space-y-4 mt-8 pt-6 border-t border-ink/20">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-ink flex items-center gap-2"><Award size={14}/> Milestones</h3>
      </div>
      <div className="p-4 border border-ink rounded-sm bg-ink text-vellum">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-70 block mb-1">Current Goal</span>
            <span className="text-sm font-medium">Curator Rank Achieved</span>
          </div>
          <span className="font-mono text-sm">65%</span>
        </div>
        <div className="w-full h-1 bg-vellum/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-[65%]"></div>
        </div>
      </div>
    </div>
  </div>
)}

{activeTab === 'redeem' && (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between bg-primary/10 p-4 border border-primary/20 rounded-sm">
      <span className="text-xs font-bold uppercase tracking-widest text-primary">Available Balance</span>
      <div className="flex items-center gap-1 text-primary">
        <Zap size={18} fill="currentColor" />
        <span className="font-mono text-xl font-bold">14,250</span>
      </div>
    </div>
    
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-ink mt-8">Rewards Catalog</h3>
      <div className="grid grid-cols-1 gap-3">
        <div className="p-4 border border-ink rounded-sm bg-vellum group hover:border-[#1C1B1A]/50 transition-colors flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-background-light rounded-sm flex items-center justify-center border border-ink/10 group-hover:bg-ink group-hover:text-vellum transition-colors">
                <Ticket size={20} />
              </div>
              <div>
                <span className="text-sm font-bold block">10% Off Boutique</span>
                <span className="text-xs text-muted block mt-0.5">Single use discount code</span>
              </div>
            </div>
            <span className="font-mono text-sm font-bold bg-background-light px-2 py-1 border border-ink/10 rounded-sm shadow-sm">-1,500</span>
          </div>
          <button className="w-full py-2 bg-ink text-vellum text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-primary transition-colors">
            Redeem Reward
          </button>
        </div>
        
        <div className="p-4 border border-ink rounded-sm bg-vellum group hover:border-[#1C1B1A]/50 transition-colors flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-background-light rounded-sm flex items-center justify-center border border-ink/10 group-hover:bg-ink group-hover:text-vellum transition-colors">
                <Gift size={20} />
              </div>
              <div>
                <span className="text-sm font-bold block">Priority Access Code</span>
                <span className="text-xs text-muted block mt-0.5">For the upcoming merch drop</span>
              </div>
            </div>
            <span className="font-mono text-sm font-bold bg-background-light px-2 py-1 border border-ink/10 rounded-sm shadow-sm">-3,000</span>
          </div>
          <button className="w-full py-2 bg-ink text-vellum text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-primary transition-colors">
            Redeem Reward
          </button>
        </div>
        
        <div className="p-4 border border-ink/20 opacity-60 rounded-sm bg-background-light flex flex-col gap-4 cursor-not-allowed">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-ink/10 rounded-sm flex items-center justify-center">
                <Award size={20} className="text-muted" />
              </div>
              <div>
                <span className="text-sm font-bold block">Exclusive Digital Garment</span>
                <span className="text-xs text-muted block mt-0.5">Avatar cosmetic (Req. Curator Rank)</span>
              </div>
            </div>
            <span className="font-mono text-sm font-bold px-2 py-1">-5,000</span>
          </div>
          <div className="w-full py-2 text-center text-xs font-bold uppercase tracking-widest border border-ink/20 rounded-sm">
            Locked
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{activeTab === 'settings' && (
  <div className="space-y-8 animate-fade-in">
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-ink flex items-center gap-2"><User size={14}/> Profile Label</h3>
      <div className="border-b border-ink/30 focus-within:border-primary transition-colors pb-2">
        <label className="font-label text-xs tracking-widest opacity-50 block mb-2">Identifier</label>
        <input className="w-full bg-transparent border-none focus:ring-0 p-0 font-medium text-lg text-ink" defaultValue="ARCHIVIST_09" type="text" />
      </div>
    </div>
    
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-ink flex items-center gap-2"><Globe size={14}/> Language Protocol</h3>
      <div className="border border-ink/20 rounded-sm overflow-hidden flex flex-col">
        <label className="flex items-center justify-between p-3 border-b border-ink/10 bg-background-light cursor-pointer group">
          <span className="text-sm font-medium">English (UK)</span>
          <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
          </div>
        </label>
        <label className="flex items-center justify-between p-3 border-b border-ink/10 hover:bg-background-light/50 transition-colors cursor-pointer group">
          <span className="text-sm font-medium text-muted group-hover:text-ink">Français</span>
          <div className="w-4 h-4 rounded-full border-2 border-ink/20 group-hover:border-ink"></div>
        </label>
        <label className="flex items-center justify-between p-3 hover:bg-background-light/50 transition-colors cursor-pointer group">
          <span className="text-sm font-medium text-muted group-hover:text-ink">日本語</span>
          <div className="w-4 h-4 rounded-full border-2 border-ink/20 group-hover:border-ink"></div>
        </label>
      </div>
    </div>
    
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-ink flex items-center gap-2"><Moon size={14}/> Viewport Optics</h3>
      <div className="grid grid-cols-2 gap-3">
        <button className="p-4 border border-ink/20 rounded-sm flex flex-col items-center gap-3 hover:border-primary transition-colors">
          <Moon size={24} className="text-ink" />
          <span className="text-xs font-bold uppercase tracking-widest">Dark Mode</span>
        </button>
        <button className="p-4 border-2 border-primary rounded-sm flex flex-col items-center gap-3 bg-primary/5">
          <Check size={24} className="text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest">Light Mode</span>
        </button>
      </div>
    </div>
  </div>
)}

</section>

{activeTab === 'settings' && (
  <footer className="p-6 border-t border-ink sticky bottom-0 bg-vellum z-40">
    <button className="w-full py-4 bg-[#A62B3A] text-[#F4EFE6] font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-[#8A2330] transition-colors flex items-center justify-center gap-2">
    <CheckCircle size={16} />
                        Apply Configurations
                    </button>
  </footer>
)}
</div>
</aside>

    </div>
  );
}