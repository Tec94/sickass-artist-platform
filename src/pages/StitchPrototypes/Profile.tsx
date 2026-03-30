import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';
import { useAppAppearance, type AppAppearance } from '../../contexts/AppAppearanceContext';
import { ArrowLeft, X, CheckCircle, Gift, Ticket, Moon, Sun, Globe, User, Flame, Award } from 'lucide-react';

export default function Profile() {
  const { appearance, setAppearance } = useAppAppearance();
  const [activeTab, setActiveTab] = useState<'quests' | 'redeem' | 'settings'>('quests');
  const [draftAppearance, setDraftAppearance] = useState<AppAppearance>(appearance);

  useEffect(() => {
    // Ensure the panel is visible on load for this dedicated profile page
    document.body.classList.add('panel-open');
    return () => document.body.classList.remove('panel-open');
  }, []);

  useEffect(() => {
    setDraftAppearance(appearance);
  }, [appearance]);

  const handleSaveChanges = () => {
    setAppearance(draftAppearance);
  };

  return (
    <div
      className="profile-shell min-h-[100dvh] w-full overflow-y-auto bg-[var(--profile-page-bg)] font-sans text-[var(--profile-text)] antialiased lg:h-screen lg:overflow-hidden"
      style={{ colorScheme: appearance }}
    >
      <style>{`
        .profile-shell {
          --profile-page-bg: var(--site-page-bg);
          --profile-panel-bg: var(--site-surface);
          --profile-surface-bg: var(--site-surface-alt);
          --profile-surface-alt: color-mix(in srgb, var(--site-surface) 78%, var(--site-page-bg));
          --profile-surface-muted: color-mix(in srgb, var(--site-surface) 84%, var(--site-page-bg));
          --profile-text: var(--site-text);
          --profile-muted: var(--site-text-muted);
          --profile-muted-strong: var(--site-text-subtle);
          --profile-border: var(--site-border-strong);
          --profile-border-soft: var(--site-border-soft);
          --profile-border-muted: var(--site-border-muted);
          --profile-accent: var(--site-accent);
          --profile-accent-soft: var(--site-accent-soft);
          --profile-accent-strong: color-mix(in srgb, var(--site-accent) 24%, transparent);
          --profile-panel-shadow: var(--site-panel-shadow-strong);
          --profile-nav-shadow: var(--site-navbar-shadow);
          --profile-hero-scrim: var(--site-profile-hero-scrim);
          --profile-hero-edge: var(--site-profile-hero-edge);
          --profile-hero-card-bg: var(--site-profile-hero-card-bg);
          --profile-hero-card-border: var(--site-profile-hero-card-border);
          --profile-hero-card-text: var(--site-profile-hero-card-text);
          --profile-primary-button-bg: var(--site-button-solid);
          --profile-primary-button-hover: var(--site-accent);
          --profile-primary-button-text: var(--site-button-solid-text);
          --profile-progress-track: color-mix(in srgb, var(--site-text) 12%, transparent);
          --profile-progress-fill: var(--site-accent);
          --profile-disabled-bg: var(--site-surface-alt);
          --profile-disabled-text: var(--site-text-muted);
          --profile-input-line: color-mix(in srgb, var(--site-text) 30%, transparent);
          --profile-scroll-track: var(--site-scroll-track);
          --profile-scroll-thumb: var(--site-scroll-thumb);
          --profile-scroll-thumb-hover: var(--site-scroll-thumb-hover);
        }

        body {
          font-family: inherit;
          background-color: var(--profile-page-bg);
          color: var(--profile-text);
          margin: 0;
          overflow: hidden;
        }

        .utility-panel {
          transform: translatex(100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 40;
          box-shadow: var(--profile-panel-shadow);
        }

        .panel-open .utility-panel {
          transform: translatex(0);
        }

        .profile-theme-toggle {
          border-color: var(--profile-border-muted);
          background: var(--profile-panel-bg);
          color: var(--profile-text);
        }

        .profile-theme-toggle:hover {
          border-color: var(--profile-accent);
          background: var(--profile-surface-bg);
        }

        .profile-theme-toggle[data-active='true'] {
          border-width: 2px;
          border-color: var(--profile-accent);
          background: var(--profile-accent-soft);
          box-shadow: inset 0 0 0 1px var(--profile-accent-strong);
        }

        @media (max-width: 1023px) {
          .utility-panel {
            transform: none;
            box-shadow: none;
          }
        }

        .utility-panel::-webkit-scrollbar {
          width: 6px;
        }

        .utility-panel::-webkit-scrollbar-track {
          background: var(--profile-scroll-track);
        }

        .utility-panel::-webkit-scrollbar-thumb {
          background: var(--profile-scroll-thumb);
          border-radius: 2px;
        }

        .utility-panel::-webkit-scrollbar-thumb:hover {
          background: var(--profile-scroll-thumb-hover);
        }
      `}</style>

<div className="absolute inset-0 hidden pr-[400px] lg:block">
<div className="relative h-full w-full overflow-hidden">
<img alt="" aria-hidden="true" className="h-full w-full object-cover object-center" src="/dashboard/signal-card-placeholder-1.webp" />
<div className="absolute inset-0" style={{ backgroundImage: 'var(--profile-hero-scrim)' }} />
<div className="absolute inset-y-0 right-0 w-40" style={{ backgroundImage: 'var(--profile-hero-edge)' }} />
<div className="absolute bottom-10 left-10 max-w-[560px] border p-8 text-[var(--profile-hero-card-text)] shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur-md" style={{ borderColor: 'var(--profile-hero-card-border)', backgroundColor: 'var(--profile-hero-card-bg)' }}>
<p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[var(--profile-accent)]">Night Index</p>
<h2 className="mt-4 font-display text-5xl leading-[1.02] tracking-[0.04em]">A private room for quests, rewards, and status.</h2>

</div>
</div>
</div>
      
<div className="fixed left-4 top-4 z-20 flex flex-col gap-4 lg:left-8 lg:top-8">
<Link aria-label="Back to Dashboard" className="nav-fab group flex h-12 w-12 cursor-pointer items-center justify-center border border-[color:var(--profile-border-soft)] bg-[var(--profile-panel-bg)] shadow-[var(--profile-nav-shadow)] transition-all hover:border-[color:var(--profile-accent)] hover:bg-[var(--profile-surface-bg)]" to="/dashboard">
<ArrowLeft className="text-[var(--profile-text)] transition-colors duration-200 group-hover:text-[var(--profile-accent)]" />
</Link>
</div>

<aside className="utility-panel relative z-30 flex min-h-[100dvh] w-full flex-col overflow-y-auto border-t border-[var(--profile-border)] bg-[var(--profile-panel-bg)] backdrop-blur-md lg:fixed lg:top-0 lg:right-0 lg:h-screen lg:w-[400px] lg:border-t-0 lg:border-l">

<header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--profile-border)] bg-[var(--profile-panel-bg)] px-5 py-5 sm:px-6 sm:py-6">
<div>
<h1 className="font-display text-2xl font-semibold uppercase tracking-tight text-[var(--profile-text)]">Profile</h1>
<p className="mt-1 text-xs font-medium uppercase tracking-widest text-[var(--profile-muted)]">Your Account</p>
</div>

<button aria-label="Close Panel" className="nav-fab flex h-10 w-10 items-center justify-center border border-transparent transition-all hover:border-[color:var(--profile-border-soft)] hover:bg-[var(--profile-surface-bg)]" onClick={() => { setNextTransition('push-back'); window.location.href = '/dashboard'; }}>
<X className="text-[var(--profile-text)]" />
</button>
</header>

<div className="flex-1 flex flex-col">

<section className="flex items-start gap-4 border-b border-[var(--profile-border)] p-5 sm:p-6">
<div className="h-16 w-16 flex-shrink-0 overflow-hidden border border-[color:var(--profile-border-soft)] bg-[var(--profile-surface-bg)]">
<img alt="User Avatar" className="w-full h-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFtvjfctxDOknYmYqKnGkq0OSJCzVotNPCyRW1GdCscM0JKpBKLXZnsnlrseXm8ZgSuUKHkeCUZjfHOMVskOZI5_b6cp28ZD6VXEUGUlLjMhzuzovQqhiEIDa7Uxsxb-aBPUuFWeWlaeLGnYWJNrnFZneYixa_T2bYb4um82sME2SFjhUvjyQnubPsfheiYu9VGWGBzFJysGzFR1PTbDCVlTJboPS8Vn9fyGq2oGQR5IiOEHnQMMtYeEgGmgfsw3aqVYV8M3onjTjz" />
</div>
<div className="flex flex-col justify-center w-full">
<div className="flex justify-between items-center w-full">
<h2 className="font-display text-lg font-semibold leading-tight text-[var(--profile-text)]">LOBO_09</h2>
<div className="flex items-center gap-1 text-[var(--profile-accent)]">
<span className="font-mono text-xs font-bold">14,250 PTS</span>
</div>
</div>
<div className="mt-2 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-[var(--profile-muted)]">
<span>Joined '22</span>
<span className="h-1 w-1 rounded-full bg-[var(--profile-text)]"></span>
<span>Rank: Cachorro</span>
</div>
</div>
</section>

<nav className="sticky top-[89px] z-30 flex border-b border-[var(--profile-border)] bg-[var(--profile-panel-bg)]">
<button onClick={() => setActiveTab('quests')} className={`relative flex-1 border-b-2 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'quests' ? 'border-[var(--profile-accent)] text-[var(--profile-accent)]' : 'border-transparent text-[var(--profile-muted)] hover:text-[var(--profile-text)]'}`}>
                    Quests
                </button>
<button onClick={() => setActiveTab('redeem')} className={`relative flex-1 border-b-2 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'redeem' ? 'border-[var(--profile-accent)] text-[var(--profile-accent)]' : 'border-transparent text-[var(--profile-muted)] hover:text-[var(--profile-text)]'}`}>
                    Redeem
                </button>
<button onClick={() => setActiveTab('settings')} className={`relative flex-1 border-b-2 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'border-[var(--profile-accent)] text-[var(--profile-accent)]' : 'border-transparent text-[var(--profile-muted)] hover:text-[var(--profile-text)]'}`}>
                    Settings
                </button>
</nav>

<section className="flex-1 p-5 flex flex-col gap-8 sm:p-6">

{activeTab === 'quests' && (
  <div className="space-y-6 animate-fade-in">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--profile-text)]"><Flame size={14}/> Daily Quests</h3>
        <span className="text-xs font-medium text-[var(--profile-muted)]">1/3 Completed</span>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border border-[var(--profile-border-muted)] bg-[var(--profile-surface-bg)] p-4">
          <div className="flex items-center gap-3 opacity-50">
            <CheckCircle className="text-[var(--profile-accent)]" size={20} />
            <span className="text-sm font-medium line-through">Check today's updates</span>
          </div>
          <span className="text-xs font-mono font-bold text-[var(--profile-muted)]">+50 PTS</span>
        </div>
        <div className="group flex cursor-pointer items-center justify-between border border-[color:var(--profile-border-soft)] bg-[var(--profile-panel-bg)] p-4 transition-colors hover:border-[color:var(--profile-accent)] hover:bg-[var(--profile-surface-bg)]">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-[var(--profile-border-muted)] transition-colors group-hover:border-[var(--profile-accent)]"></div>
            <span className="text-sm font-medium">Rank 3 songs in the charts</span>
          </div>
          <span className="text-xs font-mono font-bold text-[var(--profile-accent)]">+150 PTS</span>
        </div>
        <div className="group flex cursor-pointer items-center justify-between border border-[color:var(--profile-border-soft)] bg-[var(--profile-panel-bg)] p-4 transition-colors hover:border-[color:var(--profile-accent)] hover:bg-[var(--profile-surface-bg)]">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-[var(--profile-border-muted)] transition-colors group-hover:border-[var(--profile-accent)]"></div>
            <span className="text-sm font-medium">RSVP to an upcoming show</span>
          </div>
          <span className="text-xs font-mono font-bold text-[var(--profile-accent)]">+250 PTS</span>
        </div>
      </div>
    </div>
    
    <div className="mt-8 space-y-4 border-t border-[color:var(--profile-border-soft)] pt-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--profile-text)]"><Award size={14}/> Milestones</h3>
      </div>
      <div className="border border-[var(--profile-border)] bg-[var(--profile-primary-button-bg)] p-4 text-[var(--profile-primary-button-text)] shadow-[0_12px_24px_rgba(0,0,0,0.14)]">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-70 block mb-1">Current Goal</span>
            <span className="text-sm font-medium">Next Rank</span>
          </div>
          <span className="font-mono text-sm">72%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--profile-progress-track)]">
          <div className="h-full w-[65%] bg-[var(--profile-progress-fill)]"></div>
        </div>
      </div>
    </div>
  </div>
)}

{activeTab === 'redeem' && (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between border border-[color:var(--profile-accent-strong)] bg-[var(--profile-accent-soft)] p-4">
      <span className="text-xs font-bold uppercase tracking-widest text-[var(--profile-accent)]">Available Balance</span>
      <div className="flex items-center gap-1 text-[var(--profile-accent)]">
        <span className="font-mono text-xl font-bold">14,250 PTS</span>
      </div>
    </div>
    
    <div className="space-y-4">
      <h3 className="mt-8 text-xs font-bold uppercase tracking-widest text-[var(--profile-text)]">Rewards</h3>
      <div className="grid grid-cols-1 gap-3">
        <div className="group flex flex-col gap-4 border border-[color:var(--profile-border-soft)] bg-[var(--profile-panel-bg)] p-4 transition-colors hover:border-[color:var(--profile-accent)] hover:bg-[var(--profile-surface-bg)]">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              <div className="flex h-10 w-10 items-center justify-center border border-[color:var(--profile-border-soft)] bg-[var(--profile-surface-bg)] transition-colors group-hover:bg-[var(--profile-primary-button-bg)] group-hover:text-[var(--profile-primary-button-text)]">
                <Ticket size={20} />
              </div>
              <div>
                <span className="text-sm font-bold block">10% Off Store</span>
                <span className="mt-0.5 block text-xs text-[var(--profile-muted)]">Single use discount code</span>
              </div>
            </div>
            <span className="border border-[color:var(--profile-border-soft)] bg-[var(--profile-surface-bg)] px-2 py-1 font-mono text-sm font-bold shadow-sm">-1,500</span>
          </div>
          <button className="w-full bg-[var(--profile-primary-button-bg)] py-2 text-xs font-bold uppercase tracking-widest text-[var(--profile-primary-button-text)] transition-colors hover:bg-[var(--profile-primary-button-hover)]">
            Redeem Reward
          </button>
        </div>
        
        <div className="group flex flex-col gap-4 border border-[color:var(--profile-border-soft)] bg-[var(--profile-panel-bg)] p-4 transition-colors hover:border-[color:var(--profile-accent)] hover:bg-[var(--profile-surface-bg)]">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              <div className="flex h-10 w-10 items-center justify-center border border-[color:var(--profile-border-soft)] bg-[var(--profile-surface-bg)] transition-colors group-hover:bg-[var(--profile-primary-button-bg)] group-hover:text-[var(--profile-primary-button-text)]">
                <Gift size={20} />
              </div>
              <div>
                <span className="text-sm font-bold block">Priority Access Code</span>
                <span className="mt-0.5 block text-xs text-[var(--profile-muted)]">For the upcoming merch drop</span>
              </div>
            </div>
            <span className="border border-[color:var(--profile-border-soft)] bg-[var(--profile-surface-bg)] px-2 py-1 font-mono text-sm font-bold shadow-sm">-3,000</span>
          </div>
          <button className="w-full bg-[var(--profile-primary-button-bg)] py-2 text-xs font-bold uppercase tracking-widest text-[var(--profile-primary-button-text)] transition-colors hover:bg-[var(--profile-primary-button-hover)]">
            Redeem Reward
          </button>
        </div>
        
        <div className="flex cursor-not-allowed flex-col gap-4 border border-[var(--profile-border-muted)] bg-[var(--profile-disabled-bg)] p-4 opacity-60">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              <div className="flex h-10 w-10 items-center justify-center bg-[var(--profile-accent-soft)]">
                <Award size={20} className="text-[var(--profile-muted)]" />
              </div>
              <div>
                <span className="text-sm font-bold block">Exclusive Digital Collectible</span>
                <span className="mt-0.5 block text-xs text-[var(--profile-muted)]">Avatar cosmetic (Req. Lobo Rank)</span>
              </div>
            </div>
            <span className="font-mono text-sm font-bold px-2 py-1">-5,000</span>
          </div>
          <div className="w-full border border-[var(--profile-border-muted)] py-2 text-center text-xs font-bold uppercase tracking-widest">
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
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--profile-text)]"><User size={14}/> Display Name</h3>
      <div className="border-b border-[color:var(--profile-input-line)] pb-2 transition-colors focus-within:border-[var(--profile-accent)]">
        <label className="mb-2 block font-label text-xs tracking-widest opacity-50">Username</label>
        <input className="w-full border-none bg-transparent p-0 text-lg font-medium text-[var(--profile-text)] caret-[var(--profile-accent)] focus:ring-0" defaultValue="LOBO_09" type="text" />
      </div>
    </div>
    
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--profile-text)]"><Globe size={14}/> Language</h3>
      <div className="flex flex-col overflow-hidden border border-[color:var(--profile-border-soft)]">
        <label className="group flex cursor-pointer items-center justify-between border-b border-[color:var(--profile-border-soft)] bg-[var(--profile-surface-bg)] p-3">
          <span className="text-sm font-medium">English (US)</span>
          <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--profile-accent)]">
            <div className="h-2 w-2 rounded-full bg-[var(--profile-accent)]"></div>
          </div>
        </label>
        <label className="group flex cursor-pointer items-center justify-between border-b border-[color:var(--profile-border-soft)] p-3 transition-colors hover:bg-[var(--profile-surface-bg)]">
          <span className="text-sm font-medium text-[var(--profile-muted)] group-hover:text-[var(--profile-text)]">Español</span>
          <div className="h-4 w-4 rounded-full border-2 border-[var(--profile-border-muted)] group-hover:border-[var(--profile-text)]"></div>
        </label>
        <label className="group flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-[var(--profile-surface-bg)]">
          <span className="text-sm font-medium text-[var(--profile-muted)] group-hover:text-[var(--profile-text)]">Português</span>
          <div className="h-4 w-4 rounded-full border-2 border-[var(--profile-border-muted)] group-hover:border-[var(--profile-text)]"></div>
        </label>
      </div>
    </div>
    
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--profile-text)]"><Moon size={14}/> Appearance</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          aria-pressed={draftAppearance === 'dark'}
          data-active={draftAppearance === 'dark'}
          onClick={() => setDraftAppearance('dark')}
          className="profile-theme-toggle flex flex-col items-center gap-3 border p-4 transition-colors"
        >
          <Moon size={24} className="text-[var(--profile-accent)]" />
          <span className="text-xs font-bold uppercase tracking-widest">Dark Mode</span>
        </button>
        <button
          type="button"
          aria-pressed={draftAppearance === 'light'}
          data-active={draftAppearance === 'light'}
          onClick={() => setDraftAppearance('light')}
          className="profile-theme-toggle flex flex-col items-center gap-3 border p-4 transition-colors"
        >
          <Sun size={24} className="text-[var(--profile-accent)]" />
          <span className="text-xs font-bold uppercase tracking-widest">Light Mode</span>
        </button>
      </div>
    </div>
  </div>
)}

</section>

{activeTab === 'settings' && (
  <footer className="sticky bottom-0 z-40 border-t border-[var(--profile-border)] bg-[var(--profile-panel-bg)] p-6">
    <button
      type="button"
      onClick={handleSaveChanges}
      className="flex w-full items-center justify-center gap-2 bg-[var(--profile-primary-button-bg)] py-4 text-xs font-bold uppercase tracking-widest text-[var(--profile-primary-button-text)] transition-colors hover:bg-[var(--profile-primary-button-hover)]"
    >
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
