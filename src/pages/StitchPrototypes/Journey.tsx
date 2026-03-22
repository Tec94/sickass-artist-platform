import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';
import { ArrowLeft, Circle, Menu } from 'lucide-react';
import SharedNavbar from '../../components/Navigation/SharedNavbar';

export default function Journey() {
  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#3C2A21] w-full font-sans">
        <style>{`body {
    background-color: #F4F0EB;
    color: #1C1B1A;
    font-family: "Manrope", sans-serif;
    margin: 0;
    padding: 0;
    overflow: hidden;
    /* Prevent scrolling on the main view */
    }
h1, h2, h3, h4, h5, h6, .font-serif {
    font-family: "Cormorant Garamond", serif;
    letter-spacing: -0.02em
    }
.structural-border {
    border: 1px solid #1C1B1A
    }
.structural-border-b {
    border-bottom: 1px solid #1C1B1A
    }
.structural-border-r {
    border-right: 1px solid #1C1B1A
    }
.structural-border-t {
    border-top: 1px solid #1C1B1A
    }
/* Map specific styles */
.map-container {
    position: absolute;
    top: 72px;
    left: 0;
    width: 100vw;
    height: calc(100vh - 72px);
    z-index: 0;
    background-image: url(https://lh3.googleusercontent.com/aida-public/AB6AXuA10V_wL-Q7TGSlNaXluQqdwGlrGLm1dqTXytZyuOOdfbVVG5dLeXaQHG5utD5RUzF1Kym8fZgx4CoTRvRFVEJCwCDNBbKtx2O7E0bgl2HlNhWUzfr1_c2KpQGf0ttJPz6duiVQ87lUA2Ub3PP7i_8wYCt14SoMsHqRrPwsxBFi59NGQDl5JbCQ1A6VgVd9fXQpAWMY1VeZ9Vkb-oMBWfpL4tBfjvEoIGyUjENXrh8gZOeEXsUOI80LL-q46bROr65BNr8PN0Z_QKTq);
    background-size: cover;
    background-position: center
    }
.map-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, rgba(244, 240, 235, 0.9) 0%, rgba(244, 240, 235, 0.4) 40%, transparent 100%);
    z-index: 1
    }
/* Waypoint Animation */
@keyframes pulse {
    0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(15, 131, 189, 0.7);
        } 70% {
        transform: scale(1);
        box-shadow: 0 0 0 10px rgba(15, 131, 189, 0);
        } 100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(15, 131, 189, 0);
        }
    }
.waypoint {
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: transparent;
    border: 2px solid #1C1B1A;
    z-index: 10;
    cursor: pointer;
    transition: all 0.3s ease
    }
.waypoint:hover {
    background-color: #1C1B1A
    }
.waypoint.active {
    border-color: #0f83bd;
    animation: pulse 2s infinite;
    background-color: #FCFBF9
    }
.waypoint-label {
    position: absolute;
    top: 24px;
    left: 50%;
    transform: translatex(-50%);
    white-space: nowrap;
    font-family: "Manrope", sans-serif;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #1C1B1A;
    background-color: #FCFBF9;
    padding: 2px 6px;
    border: 1px solid #1C1B1A;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none
    }
.waypoint:hover .waypoint-label, .waypoint.active .waypoint-label {
    opacity: 1
    }
/* Layout */
.ui-layer {
    position: absolute;
    top: 72px;
    left: 0;
    z-index: 20;
    display: flex;
    width: 100vw;
    height: calc(100vh - 72px);
    pointer-events: none;
    /* Let clicks pass through to map where there's no UI */
    }
.interactive-ui {
    pointer-events: auto;
    /* Re-enable clicks for UI elements */
    }
.ledger-panel {
    width: 400px;
    height: calc(100vh - 72px);
    background-color: #FCFBF9;
    /* Vellum */
    border-right: 1px solid #1C1B1A;
    display: flex;
    flex-direction: column;
    overflow-y: auto
    }
/* Custom Scrollbar for Ledger */
.ledger-panel::-webkit-scrollbar {
    width: 4px
    }
.ledger-panel::-webkit-scrollbar-track {
    background: #FCFBF9
    }
.ledger-panel::-webkit-scrollbar-thumb {
    background: #1C1B1A
    }`}</style>
      
<div className="absolute top-0 left-0 w-full z-50">
  <SharedNavbar />
</div>
      

<div className="map-container" data-alt="Abstract spatial map with topographical lines and subtle textures">
<div className="map-overlay"></div>

<div className="waypoint" >
<div className="waypoint-label">The Archive</div>
</div>
<div className="waypoint active" >
<div className="waypoint-label">Midnight Release</div>
</div>
<div className="waypoint" >
<div className="waypoint-label">Hidden Track</div>
</div>
<div className="waypoint" >
<div className="waypoint-label">Pop-up Gallery</div>
</div>
<div className="waypoint" >
<div className="waypoint-label">Final Coordinate</div>
</div>
</div>

<div className="ui-layer">

<div className="ledger-panel interactive-ui flex-shrink-0">

<div className="h-[72px] flex items-center px-6 structural-border-b bg-vellum">
<Link className="flex items-center gap-2 text-ink hover:text-primary transition-colors" to="/proto/directory">
<ArrowLeft />
<span className="text-[12px] font-medium uppercase tracking-[0.05em]">Return</span>
</Link>
</div>

<div className="p-8 flex-1">
<div className="mb-10">
<h2 className="text-4xl font-serif text-ink mb-2">The Journey</h2>
<p className="text-[12px] font-medium uppercase tracking-[0.05em] text-muted">Outergrounds / Global Quests</p>
</div>
<div className="mb-8">
<div className="flex justify-between items-end mb-4">
<span className="text-[12px] font-medium uppercase tracking-[0.05em] text-ink">Completion</span>
<span className="text-[12px] font-bold text-ink">24%</span>
</div>
<div className="h-[1px] w-full bg-muted/30 relative">
<div className="absolute top-0 left-0 h-full w-[24%] bg-primary"></div>
</div>
</div>

<div className="flex flex-col">

<div className="py-6 structural-border-b group cursor-pointer">
<div className="flex items-start gap-4">
<div className="mt-1 flex-shrink-0 size-6 flex items-center justify-center rounded-full border border-primary text-primary bg-primary/10">
<Circle />
</div>
<div className="flex-1">
<div className="flex justify-between items-baseline mb-1">
<h3 className="text-lg font-serif text-ink">Midnight Release</h3>
<span className="text-[10px] font-bold uppercase tracking-[0.05em] text-primary">Active</span>
</div>
<p className="text-sm text-ink/80 leading-[1.6] mb-3">Locate the hidden coordinates broadcasted during the latest transmission to unlock the exclusive audio stems.</p>
<div className="flex items-center gap-2">
<span className="text-[10px] font-medium uppercase tracking-[0.05em] text-muted">Reward:</span>
<span className="text-[12px] text-ink font-medium">Digital Artifact #04</span>
</div>
</div>
</div>
</div>

<div className="py-6 structural-border-b group cursor-pointer bg-vellum hover:bg-parchment transition-colors">
<div className="flex items-start gap-4">
<div className="mt-1 flex-shrink-0 size-6 flex items-center justify-center text-accent">
<Circle />
</div>
<div className="flex-1">
<div className="flex justify-between items-baseline mb-1">
<h3 className="text-lg font-serif text-ink line-through decoration-muted/50">The First Echo</h3>
<span className="text-[10px] font-bold uppercase tracking-[0.05em] text-accent">Complete</span>
</div>
<p className="text-sm text-muted leading-[1.6]">Attended the digital vernissage and secured the foundation token.</p>
</div>
</div>
</div>

<div className="py-6 structural-border-b group cursor-not-allowed opacity-60">
<div className="flex items-start gap-4">
<div className="mt-1 flex-shrink-0 size-6 flex items-center justify-center text-muted">
<Circle />
</div>
<div className="flex-1">
<div className="flex justify-between items-baseline mb-1">
<h3 className="text-lg font-serif text-muted">Pop-up Gallery</h3>
<span className="text-[10px] font-bold uppercase tracking-[0.05em] text-muted">Locked</span>
</div>
<p className="text-sm text-muted leading-[1.6]">Requires completion of the Midnight Release to reveal physical location.</p>
</div>
</div>
</div>

<div className="py-6 structural-border-b group cursor-not-allowed opacity-60">
<div className="flex items-start gap-4">
<div className="mt-1 flex-shrink-0 size-6 flex items-center justify-center text-muted">
<Circle />
</div>
<div className="flex-1">
<div className="flex justify-between items-baseline mb-1">
<h3 className="text-lg font-serif text-muted">Final Coordinate</h3>
<span className="text-[10px] font-bold uppercase tracking-[0.05em] text-muted">Classified</span>
</div>
<p className="text-sm text-muted leading-[1.6]">Details withheld. Maintain observation of the primary frequency.</p>
</div>
</div>
</div>
</div>
</div>

<div className="p-6 structural-border-t bg-vellum mt-auto">
<button className="w-full py-3 bg-ink text-parchment text-[13px] font-semibold uppercase tracking-widest hover:bg-primary transition-colors">
                    Sync Progress
                </button>
</div>
</div>

<div className="flex-1 relative">
<div className="absolute top-6 right-6 flex items-center gap-6 interactive-ui">
<Link className="text-[12px] font-medium uppercase tracking-[0.05em] text-ink hover:text-primary bg-vellum/80 backdrop-blur-sm px-4 py-2 border border-ink shadow-sm transition-all" to="/proto/directory">
                    Dashboard
                </Link>
<Link className="text-[12px] font-medium uppercase tracking-[0.05em] text-ink hover:text-primary bg-vellum/80 backdrop-blur-sm px-4 py-2 border border-ink shadow-sm transition-all" to="/proto/directory">
                    Store
                </Link>
<button className="size-10 flex items-center justify-center bg-vellum border border-ink hover:bg-ink hover:text-vellum transition-colors shadow-sm">
<Menu />
</button>
</div>

<div className="absolute bottom-6 right-6 flex flex-col gap-2 interactive-ui">
<button className="size-10 bg-vellum border border-ink flex items-center justify-center hover:bg-parchment transition-colors shadow-sm">
<Circle />
</button>
<button className="size-10 bg-vellum border border-ink flex items-center justify-center hover:bg-parchment transition-colors shadow-sm">
<Circle />
</button>
<button className="size-10 bg-vellum border border-ink flex items-center justify-center hover:bg-parchment transition-colors shadow-sm mt-2">
<Circle />
</button>
</div>
</div>
</div>

    </div>
  );
}