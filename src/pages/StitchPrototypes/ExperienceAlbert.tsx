import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';
import { Search, UserCircle, Circle } from 'lucide-react';
import SharedNavbar from '../../components/Navigation/SharedNavbar';

export default function ExperienceAlbert() {
  return (
    <div className="h-full overflow-y-auto bg-[#F4EFE6] text-[#3C2A21] w-full font-sans">
      <style>{`
        .material-symbols-outlined {
            font-variation-settings: "FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24;
            vertical-align: middle;
        }
        body {
            background-color: #F4F0EB;
            color: #1C1B1A;
            -webkit-font-smoothing: antialiased;
        }
        .parchment-texture {
            background-image: url(https://lh3.googleusercontent.com/aida-public/AB6AXuDHVG6jgt_VUx6Tt9Lzl0BAmeODp-Ul6agYL2NuYP4IGi_OYh_lcEvTAsFLt9VLDYK7ezIOzqOR1WFpZBa0G6_ZVoQmCEr42FFhIr2KKpTVKmaL__Z9E7tPV5Oay0fZQ5FqDroWmJXxUwZnlhCdISYLKEKRv3ktpYPW_WfSwGzeJ-VabgIT6hcasm6jLaccUz6aCGt_QAxEyMCIeYAmkODAXW5W81pCQsWS8GRNMfAjZTCL-UhTuJcvD5qTF3wTfpJuOu9sEZEtX9l5);
        }
        .twin-lines {
            display: flex;
            gap: 4px;
        }
        .twin-lines span {
            width: 2px;
            height: 24px;
            background-color: currentColor;
            opacity: 0.3;
        }
    `}</style>
      
<SharedNavbar />
<main className="min-h-screen">
<section className="relative w-full h-[600px] overflow-hidden border-b border-outline">
<img alt="Royal Albert Hall" className="w-full h-full object-cover grayscale contrast-125 brightness-75" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8BreJDDMzM9Y7d6qLFVSdtmTMnOJf5jmozRCrfDqeBjTHQZaFvVE-9Uq0qMTqTqmB2uA00w1WzCWeAVB2SXI2ZuKli138TErVcfqQcDM6WTkO-sY3BPvdMQatJvACBz8tI6ehZUpKTOMVqi_OC-FKoFHUEC6E2S7kXaHfW6zJAslC3N8mJbzFJj7HnuJyKFqe6NtXbp_0ECKtkaRpsNwAw_Zd2HDkzAvOVNadK01qh6v5ZcRwdl79iKQs25TyE4BJ-Nnlsj1yLOH1" />
<div className="absolute inset-0 bg-gradient-to-t from-[#1C1B1A]/90 via-[#1C1B1A]/30 to-transparent"></div>
<div className="absolute bottom-12 left-6 right-6 md:left-12 max-w-4xl font-display">
<h1 className="text-6xl md:text-9xl text-[#F4EFE6] leading-none tracking-tighter uppercase drop-shadow-md">THE ROYAL ALBERT HALL EXHIBITION</h1>
<p className="font-headline italic text-xl md:text-3xl text-[#F4EFE6]/90 mt-4 border-l-2 border-[#C36B42] pl-6 max-w-2xl drop-shadow">A Retrospective of Architectural Sovereignty and Performance History.</p>
</div>
</section>
<section className="max-w-7xl mx-auto p-6 md:p-12">
<div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">

<div className="md:col-span-12 lg:col-span-8 p-8 md:p-12 border border-outline-variant parchment-texture bg-surface-container-lowest">
<div className="flex items-center justify-between mb-8">
<h2 className="font-headline text-4xl">The Genesis of Obsidian</h2>
<div className="twin-lines text-primary"><span></span><span></span></div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<div className="space-y-6">
<p className="text-lg leading-relaxed">
                            ROA's vision for the Obsidian collection is anchored in a specific emotional register: romantic but dangerous, intimate but exclusive. This retrospective serves as a diegetic device, granting access to the Private Suite OS—a sanctum where the architecture of the past meets the nocturnal energy of the future.
                        </p>
</div>
<div className="flex flex-col justify-end space-y-8 md:pl-8 md:border-l border-outline-variant">
<div className="overflow-hidden">
<span className="font-label text-xs tracking-widest uppercase opacity-60 block mb-2">Duration</span>
<p className="font-headline text-3xl italic break-words">Sept 14 — Nov 22</p>
</div>
<div className="overflow-hidden">
<span className="font-label text-xs tracking-widest uppercase opacity-60 block mb-2">Location</span>
<p className="font-headline text-3xl italic break-words">South Kensington, London</p>
</div>
</div>
</div>
</div>
<div className="md:col-span-12 lg:col-span-4 p-8 border border-outline-variant parchment-texture bg-surface-container-low/30">
<h4 className="font-label text-[0.6875rem] uppercase tracking-widest mb-6 opacity-70">Map Reference</h4>
<div className="aspect-video lg:aspect-square bg-surface-container-highest relative group overflow-hidden border border-outline/10">
<img alt="Map location" className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-80 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4t8-y4DkaWzKDFagRLZaVSFB9m5AiQAjTusk_3v4LAEJbhnynl7raVzxRPn4KddJBHZoGetGTGbX26Qun7W9XZrknMRxTDy73xqpdP5cY1zjVTDaP85al0I5zWm59ju0bnO-HBGees1a1qXSK1rIPYBh5UQv3SprQyEEx16vBB7t0q2uVK7AXACYVd1cXgInXM-suZP08Lr9YqAH5eKb0uETCt8w0hACZxdntvE8YPTqPAgcfEl0sD4UPEM3hJbp0qF9JArMGZco1" />
<div className="absolute inset-0 flex items-center justify-center">
<Circle className="text-primary text-5xl" />
</div>
</div>
<div className="mt-6">
<p className="font-headline italic text-lg opacity-80">South Kensington, London SW7 2AP</p>
</div>
</div>

<div className="md:col-span-12 lg:col-span-5 border border-outline p-8 md:p-12 bg-background relative overflow-hidden flex flex-col">
<div className="relative z-10">
<h2 className="font-display text-5xl mb-6 tracking-tighter">BUY TICKETS</h2>

<div className="space-y-4 mb-10">
<div className="space-y-1">
<div className="flex justify-between font-label text-[0.6rem] uppercase tracking-widest opacity-70">
<span>General Admission</span>
<span>85% SOLD</span>
</div>
<div className="h-1 bg-outline/10 w-full overflow-hidden">
<div className="h-full bg-primary" ></div>
</div>
</div>
<div className="space-y-1">
<div className="flex justify-between font-label text-[0.6rem] uppercase tracking-widest opacity-70">
<span>VIP Suite</span>
<span>92% SOLD</span>
</div>
<div className="h-1 bg-outline/10 w-full overflow-hidden">
<div className="h-full bg-primary" ></div>
</div>
</div>
<div className="space-y-1 opacity-40">
<div className="flex justify-between font-label text-[0.6rem] uppercase tracking-widest">
<span>Executive Tier</span>
<span>SOLD OUT</span>
</div>
<div className="h-1 bg-outline/20 w-full">
<div className="h-full bg-outline w-full"></div>
</div>
</div>
</div>
<form className="space-y-6">
<div className="border-b border-outline/30 focus-within:border-primary transition-colors py-2">
<label className="font-label text-[0.6rem] uppercase tracking-widest opacity-50">Attendee Identity</label>
<input className="w-full bg-transparent border-none focus:ring-0 p-0 font-headline italic text-xl" placeholder="Full Name" type="text" />
</div>
<div className="border-b border-outline/30 focus-within:border-primary transition-colors py-2">
<label className="font-label text-[0.6rem] uppercase tracking-widest opacity-50">Contact Registry</label>
<input className="w-full bg-transparent border-none focus:ring-0 p-0 font-headline italic text-xl" placeholder="email@domain.com" type="email" />
</div>
<div className="border-b border-outline/30 focus-within:border-primary transition-colors py-2">
<label className="font-label text-[0.6rem] uppercase tracking-widest opacity-50">Tier Selection</label>
<select className="w-full bg-transparent border-none focus:ring-0 p-0 font-headline italic text-xl appearance-none cursor-pointer">
<option>General Admission</option>
<option>VIP Suite</option>
<option disabled={true}>Executive Tier (Sold Out)</option>
</select>
</div>
<Link to="/proto/access-tiers-albert" className="w-full bg-primary text-white py-5 font-display text-lg tracking-[0.2em] hover:bg-on-surface transition-colors duration-300 active:scale-95 text-center flex items-center justify-center">
                            COMPLETE PURCHASE
                        </Link>
</form>
</div>
<span className="absolute -bottom-10 -right-10 font-display text-[12rem] opacity-[0.03] select-none pointer-events-none">ENTRY</span>
</div>

<div className="md:col-span-12 lg:col-span-7 p-8 md:p-12 border border-outline-variant parchment-texture bg-surface-container-low/20">
<div className="flex items-center justify-between mb-12">
<h3 className="font-headline text-4xl">Event Rules &amp; Protocol</h3>
<div className="twin-lines text-primary"><span></span><span></span></div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-12">
<div className="flex gap-8 items-start">
<span className="font-display text-5xl text-primary leading-none">01</span>
<div>
<h4 className="font-bold uppercase tracking-widest text-sm mb-3">Dress Code: Nocturnal Formal</h4>
<p className="text-base leading-relaxed text-on-surface/80 font-body">Attendees are requested to adhere to a dark palette (Obsidian, Onyx, Charcoal). This is a strictly visual requirement to maintain the integrity of the immersive environment.</p>
</div>
</div>
<div className="flex gap-8 items-start">
<span className="font-display text-5xl text-primary leading-none">02</span>
<div>
<h4 className="font-bold uppercase tracking-widest text-sm mb-3">Silent Observation</h4>
<p className="text-base leading-relaxed text-on-surface/80 font-body">The exhibition functions as a contemplative ritual. Conversation should be kept to a hushed minimum within the central void and resonance chambers.</p>
</div>
</div>
<div className="flex gap-8 items-start">
<span className="font-display text-5xl text-primary leading-none">03</span>
<div>
<h4 className="font-bold uppercase tracking-widest text-sm mb-3">Analog Exclusivity</h4>
<p className="text-base leading-relaxed text-on-surface/80 font-body">Digital capture devices are prohibited within the private suites. Experience the archive through the lens of memory rather than the sensor of a machine.</p>
</div>
</div>
</div>
</div>
</div>
</section>
</main>
<footer className="bg-[#F4F0EB] border-t border-[#1C1B1A]/20">
<div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 max-w-7xl mx-auto">
<span className="font-['Manrope'] text-[0.6875rem] uppercase tracking-widest opacity-70 mb-4 md:mb-0">
            © 2024 THE ESTATE DIRECTORY × PRIVATE SUITE OS. ALL RIGHTS RESERVED.
        </span>
<div className="flex flex-wrap justify-center gap-8">
<Link className="font-['Manrope'] text-[0.6875rem] uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity duration-300" to="/proto/directory">Terms of Access</Link>
<Link className="font-['Manrope'] text-[0.6875rem] uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity duration-300" to="/proto/directory">Privacy Protocol</Link>
<Link className="font-['Manrope'] text-[0.6875rem] uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity duration-300" to="/proto/directory">Institutional Contact</Link>
</div>
</div>
</footer>

    </div>
  );
}