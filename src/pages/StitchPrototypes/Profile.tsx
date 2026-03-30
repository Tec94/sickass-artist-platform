import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';
import { ArrowLeft, X, CheckCircle, Gift, Ticket, Zap, Moon, Globe, User, Check, Flame, Award } from 'lucide-react';

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'quests' | 'redeem' | 'settings'>('quests');
  
  useEffect(() => {
    // Ensure the panel is visible on load for this dedicated profile page
    document.body.classList.add('panel-open');
    return () => document.body.classList.remove('panel-open');
  }, []);

  return (
    <div className="min-h-[100dvh] w-full overflow-y-auto bg-[#F4EFE6] font-sans text-[#3C2A21] antialiased lg:h-screen lg:overflow-hidden">
      <style>{`body {
    font-family: inherit;
    background-color: #F4EFE6;
    color: #3C2A21;
    margin: 0;
    overflow: hidden;
    }
.utility-panel {
    transform: translatex(100%);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 40;
    box-shadow: -28px 0 80px rgba(60, 42, 33, 0.12);
    }
.panel-open .utility-panel {
    transform: translatex(0)
    }
@media (max-width: 1023px) {
.utility-panel {
    transform: none;
    box-shadow: none;
    }
}
/* Strict 1px borders */
.border-ink {
    border-color: #3C2A21
    }
.utility-panel::-webkit-scrollbar {
    width: 6px
    }
.utility-panel::-webkit-scrollbar-track {
    background: #F4EFE6
    }
.utility-panel::-webkit-scrollbar-thumb {
    background: #D1C7BC;
    border-radius: 2px
    }
.utility-panel::-webkit-scrollbar-thumb:hover {
    background: #C36B42
    }`}</style>

<div className="absolute inset-0 hidden pr-[400px] lg:block">
<div className="relative h-full w-full overflow-hidden">
<img alt="" aria-hidden="true" className="h-full w-full object-cover object-center" src="/dashboard/signal-card-placeholder-1.webp" />
<div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(250,247,242,0.18),transparent_30%),linear-gradient(115deg,rgba(60,42,33,0.68),rgba(60,42,33,0.36)_34%,rgba(60,42,33,0.12)_64%,rgba(244,239,230,0.88))]" />
<div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-[#F4EFE6] via-[#F4EFE6]/60 to-transparent" />
<div className="absolute bottom-10 left-10 max-w-[560px] border border-[#D1C7BC]/40 bg-[rgba(60,42,33,0.26)] p-8 text-[#FAF7F2] shadow-[0_24px_60px_rgba(60,42,33,0.22)] backdrop-blur-md">
<p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#C36B42]">Night Index</p>
<h2 className="mt-4 font-display text-5xl leading-[1.02] tracking-[0.04em]">A private room for quests, rewards, and status.</h2>

</div>
</div>
</div>
      
<div className="fixed left-4 top-4 z-20 flex flex-col gap-4 lg:left-8 lg:top-8">
<Link aria-label="Back to Dashboard" className="nav-fab flex h-12 w-12 cursor-pointer items-center justify-center border border-[#3C2A21]/18 bg-[#FAF7F2] shadow-[0_12px_24px_rgba(60,42,33,0.08)] transition-all hover:border-[#C36B42] hover:bg-[#F4EFE6] group" to="/dashboard">
<ArrowLeft className="text-[#3C2A21] transition-colors duration-200 group-hover:text-[#C36B42]" />
</Link>
</div>

<aside className="utility-panel relative z-30 flex min-h-[100dvh] w-full flex-col overflow-y-auto border-t border-[#3C2A21] bg-[#FAF7F2] backdrop-blur-md lg:fixed lg:top-0 lg:right-0 lg:h-screen lg:w-[400px] lg:border-t-0 lg:border-l">

<header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#3C2A21] bg-[#FAF7F2] px-5 py-5 sm:px-6 sm:py-6">
<div>
<h1 className="font-display text-2xl font-semibold uppercase tracking-tight text-[#3C2A21]">Profile</h1>
<p className="mt-1 text-xs font-medium uppercase tracking-widest text-[#8E7D72]">Your Account</p>
</div>

<button aria-label="Close Panel" className="nav-fab flex h-10 w-10 items-center justify-center border border-transparent transition-all hover:border-[#3C2A21]/18 hover:bg-[#F4EFE6]" onClick={() => { setNextTransition('push-back'); window.location.href = '/dashboard'; }}>
<X className="text-[#3C2A21]" />
</button>
</header>

<div className="flex-1 flex flex-col">

<section className="flex items-start gap-4 border-b border-[#3C2A21] p-5 sm:p-6">
<div className="h-16 w-16 flex-shrink-0 overflow-hidden border border-[#3C2A21]/12 bg-[#F4EFE6]">
<img alt="User Avatar" className="w-full h-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFtvjfctxDOknYmYqKnGkq0OSJCzVotNPCyRW1GdCscM0JKpBKLXZnsnlrseXm8ZgSuUKHkeCUZjfHOMVskOZI5_b6cp28ZD6VXEUGUlLjMhzuzovQqhiEIDa7Uxsxb-aBPUuFWeWlaeLGnYWJNrnFZneYixa_T2bYb4um82sME2SFjhUvjyQnubPsfheiYu9VGWGBzFJysGzFR1PTbDCVlTJboPS8Vn9fyGq2oGQR5IiOEHnQMMtYeEgGmgfsw3aqVYV8M3onjTjz" />
</div>
<div className="flex flex-col justify-center w-full">
<div className="flex justify-between items-center w-full">
<h2 className="font-display text-lg font-semibold leading-tight text-[#3C2A21]">LOBO_09</h2>
<div className="flex items-center gap-1 text-[#C36B42]">
<span className="font-mono text-xs font-bold">14,250 PTS</span>
</div>
</div>
<div className="mt-2 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-[#8E7D72]">
<span>Joined '22</span>
<span className="h-1 w-1 rounded-full bg-[#3C2A21]"></span>
<span>Rank: Cachorro</span>
</div>
</div>
</section>

<nav className="sticky top-[89px] z-30 flex border-b border-[#3C2A21] bg-[#FAF7F2]">
<button onClick={() => setActiveTab('quests')} className={`relative flex-1 border-b-2 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'quests' ? 'border-[#C36B42] text-[#C36B42]' : 'border-transparent text-[#8E7D72] hover:text-[#3C2A21]'}`}>
                    Quests
                </button>
<button onClick={() => setActiveTab('redeem')} className={`relative flex-1 border-b-2 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'redeem' ? 'border-[#C36B42] text-[#C36B42]' : 'border-transparent text-[#8E7D72] hover:text-[#3C2A21]'}`}>
                    Redeem
                </button>
<button onClick={() => setActiveTab('settings')} className={`relative flex-1 border-b-2 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'border-[#C36B42] text-[#C36B42]' : 'border-transparent text-[#8E7D72] hover:text-[#3C2A21]'}`}>
                    Settings
                </button>
</nav>

<section className="flex-1 p-5 flex flex-col gap-8 sm:p-6">

{activeTab === 'quests' && (
  <div className="space-y-6 animate-fade-in">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#3C2A21]"><Flame size={14}/> Daily Quests</h3>
        <span className="text-xs font-medium text-[#8E7D72]">1/3 Completed</span>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border border-[#D1C7BC] bg-[#F4EFE6] p-4">
          <div className="flex items-center gap-3 opacity-50">
            <CheckCircle className="text-[#C36B42]" size={20} />
            <span className="text-sm font-medium line-through">Check today's updates</span>
          </div>
          <span className="text-xs font-mono font-bold text-[#8E7D72]">+50 PTS</span>
        </div>
        <div className="group flex cursor-pointer items-center justify-between border border-[#3C2A21]/14 bg-[#FAF7F2] p-4 transition-colors hover:border-[#C36B42] hover:bg-[#F4EFE6]">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-[#D1C7BC] transition-colors group-hover:border-[#C36B42]"></div>
            <span className="text-sm font-medium">Rank 3 songs in the charts</span>
          </div>
          <span className="text-xs font-mono font-bold text-[#C36B42]">+150 PTS</span>
        </div>
        <div className="group flex cursor-pointer items-center justify-between border border-[#3C2A21]/14 bg-[#FAF7F2] p-4 transition-colors hover:border-[#C36B42] hover:bg-[#F4EFE6]">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-[#D1C7BC] transition-colors group-hover:border-[#C36B42]"></div>
            <span className="text-sm font-medium">RSVP to an upcoming show</span>
          </div>
          <span className="text-xs font-mono font-bold text-[#C36B42]">+250 PTS</span>
        </div>
      </div>
    </div>
    
    <div className="mt-8 space-y-4 border-t border-[#3C2A21]/12 pt-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#3C2A21]"><Award size={14}/> Milestones</h3>
      </div>
      <div className="border border-[#3C2A21] bg-[#3C2A21] p-4 text-[#FAF7F2] shadow-[0_12px_24px_rgba(60,42,33,0.14)]">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-70 block mb-1">Current Goal</span>
            <span className="text-sm font-medium">Next Rank</span>
          </div>
          <span className="font-mono text-sm">72%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-[#FAF7F2]/16">
          <div className="h-full w-[65%] bg-[#C36B42]"></div>
        </div>
      </div>
    </div>
  </div>
)}

{activeTab === 'redeem' && (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between border border-[#C36B42]/20 bg-[#C36B42]/8 p-4">
      <span className="text-xs font-bold uppercase tracking-widest text-[#C36B42]">Available Balance</span>
      <div className="flex items-center gap-1 text-[#C36B42]">
        <span className="font-mono text-xl font-bold">14,250 PTS</span>
      </div>
    </div>
    
    <div className="space-y-4">
      <h3 className="mt-8 text-xs font-bold uppercase tracking-widest text-[#3C2A21]">Rewards</h3>
      <div className="grid grid-cols-1 gap-3">
        <div className="group flex flex-col gap-4 border border-[#3C2A21]/14 bg-[#FAF7F2] p-4 transition-colors hover:border-[#C36B42] hover:bg-[#F4EFE6]">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              <div className="flex h-10 w-10 items-center justify-center border border-[#3C2A21]/10 bg-[#F4EFE6] transition-colors group-hover:bg-[#3C2A21] group-hover:text-[#FAF7F2]">
                <Ticket size={20} />
              </div>
              <div>
                <span className="text-sm font-bold block">10% Off Store</span>
                <span className="mt-0.5 block text-xs text-[#8E7D72]">Single use discount code</span>
              </div>
            </div>
            <span className="border border-[#3C2A21]/10 bg-[#F4EFE6] px-2 py-1 font-mono text-sm font-bold shadow-sm">-1,500</span>
          </div>
          <button className="w-full bg-[#3C2A21] py-2 text-xs font-bold uppercase tracking-widest text-[#FAF7F2] transition-colors hover:bg-[#C36B42]">
            Redeem Reward
          </button>
        </div>
        
        <div className="group flex flex-col gap-4 border border-[#3C2A21]/14 bg-[#FAF7F2] p-4 transition-colors hover:border-[#C36B42] hover:bg-[#F4EFE6]">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              <div className="flex h-10 w-10 items-center justify-center border border-[#3C2A21]/10 bg-[#F4EFE6] transition-colors group-hover:bg-[#3C2A21] group-hover:text-[#FAF7F2]">
                <Gift size={20} />
              </div>
              <div>
                <span className="text-sm font-bold block">Priority Access Code</span>
                <span className="mt-0.5 block text-xs text-[#8E7D72]">For the upcoming merch drop</span>
              </div>
            </div>
            <span className="border border-[#3C2A21]/10 bg-[#F4EFE6] px-2 py-1 font-mono text-sm font-bold shadow-sm">-3,000</span>
          </div>
          <button className="w-full bg-[#3C2A21] py-2 text-xs font-bold uppercase tracking-widest text-[#FAF7F2] transition-colors hover:bg-[#C36B42]">
            Redeem Reward
          </button>
        </div>
        
        <div className="flex cursor-not-allowed flex-col gap-4 border border-[#D1C7BC] bg-[#F4EFE6] p-4 opacity-60">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              <div className="flex h-10 w-10 items-center justify-center bg-[#3C2A21]/8">
                <Award size={20} className="text-[#8E7D72]" />
              </div>
              <div>
                <span className="text-sm font-bold block">Exclusive Digital Collectible</span>
                <span className="mt-0.5 block text-xs text-[#8E7D72]">Avatar cosmetic (Req. Lobo Rank)</span>
              </div>
            </div>
            <span className="font-mono text-sm font-bold px-2 py-1">-5,000</span>
          </div>
          <div className="w-full border border-[#D1C7BC] py-2 text-center text-xs font-bold uppercase tracking-widest">
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
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#3C2A21]"><User size={14}/> Display Name</h3>
      <div className="border-b border-[#3C2A21]/30 pb-2 transition-colors focus-within:border-[#C36B42]">
        <label className="mb-2 block font-label text-xs tracking-widest opacity-50">Username</label>
        <input className="w-full border-none bg-transparent p-0 text-lg font-medium text-[#3C2A21] focus:ring-0" defaultValue="LOBO_09" type="text" />
      </div>
    </div>
    
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#3C2A21]"><Globe size={14}/> Language</h3>
      <div className="flex flex-col overflow-hidden border border-[#3C2A21]/14">
        <label className="group flex cursor-pointer items-center justify-between border-b border-[#3C2A21]/10 bg-[#F4EFE6] p-3">
          <span className="text-sm font-medium">English (US)</span>
          <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#C36B42]">
            <div className="h-2 w-2 rounded-full bg-[#C36B42]"></div>
          </div>
        </label>
        <label className="group flex cursor-pointer items-center justify-between border-b border-[#3C2A21]/10 p-3 transition-colors hover:bg-[#F4EFE6]">
          <span className="text-sm font-medium text-[#8E7D72] group-hover:text-[#3C2A21]">Español</span>
          <div className="h-4 w-4 rounded-full border-2 border-[#D1C7BC] group-hover:border-[#3C2A21]"></div>
        </label>
        <label className="group flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-[#F4EFE6]">
          <span className="text-sm font-medium text-[#8E7D72] group-hover:text-[#3C2A21]">Português</span>
          <div className="h-4 w-4 rounded-full border-2 border-[#D1C7BC] group-hover:border-[#3C2A21]"></div>
        </label>
      </div>
    </div>
    
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#3C2A21]"><Moon size={14}/> Appearance</h3>
      <div className="grid grid-cols-2 gap-3">
        <button className="flex flex-col items-center gap-3 border border-[#D1C7BC] bg-[#FAF7F2] p-4 transition-colors hover:border-[#C36B42] hover:bg-[#F4EFE6]">
          <Moon size={24} className="text-[#3C2A21]" />
          <span className="text-xs font-bold uppercase tracking-widest">Dark Mode</span>
        </button>
        <button className="flex flex-col items-center gap-3 border-2 border-[#C36B42] bg-[#C36B42]/8 p-4">
          <Check size={24} className="text-[#C36B42]" />
          <span className="text-xs font-bold uppercase tracking-widest">Light Mode</span>
        </button>
      </div>
    </div>
  </div>
)}

</section>

{activeTab === 'settings' && (
  <footer className="sticky bottom-0 z-40 border-t border-[#3C2A21] bg-[#FAF7F2] p-6">
    <button className="flex w-full items-center justify-center gap-2 bg-[#3C2A21] py-4 text-xs font-bold uppercase tracking-widest text-[#FAF7F2] transition-colors hover:bg-[#C36B42]">
    <CheckCircle size={16} />
                        Save Changes
                    </button>
  </footer>
)}
</div>
</aside>

    </div>
  );
}
