import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';
import { Circle } from 'lucide-react';
import SharedNavbar from '../../components/Navigation/SharedNavbar';
export default function Rankings() {
  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#3C2A21] w-full font-sans">
      <style>{`
        body {
            background-color: theme('colors.parchment');
            color: theme('colors.ink');
            font-family: theme('fontFamily.sans');
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .border-structural {
            border-color: theme('colors.ink');
            border-width: 1px;
            border-style: solid;
        }

        .border-structural-b {
            border-bottom-color: theme('colors.ink');
            border-bottom-width: 1px;
            border-bottom-style: solid;
        }
        
        .border-structural-r {
            border-right-color: theme('colors.ink');
            border-right-width: 1px;
            border-right-style: solid;
        }

        .border-structural-t {
            border-top-color: theme('colors.ink');
            border-top-width: 1px;
            border-top-style: solid;
        }



        .nav-link {
            position: relative;
            text-transform: uppercase;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.05em;
            color: theme('colors.ink');
            transition: color 0.2s ease;
        }

        .nav-link:hover {
            color: theme('colors.muted');
        }

        .nav-link.active::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 0;
            width: 100%;
            height: 1px;
            background-color: theme('colors.ink');
        }

        /* Hide scrollbar for clean editorial look */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
    `}</style>
      

<SharedNavbar />

<main className="flex-1 flex overflow-hidden bg-parchment">

<section className="w-2/5 border-structural-r flex flex-col bg-parchment relative z-10">

<div className="p-8 pb-4">
<h1 className="font-serif text-5xl font-medium leading-none mb-2" >The Archive</h1>
<p className="text-sm text-muted uppercase tracking-widest font-semibold" >Historical Registry &amp; Top Collectors</p>
</div>

<div className="flex-1 flex flex-col justify-start px-8 py-8 gap-6 overflow-y-auto no-scrollbar">

<div className="bg-vellum border-structural p-6 flex items-center gap-6 relative group transition-colors duration-300 hover:bg-parchment">
<div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
<div className="font-serif text-6xl text-ink w-16 text-center leading-none" >I</div>
<div className="h-20 w-20 rounded-none border-structural overflow-hidden shrink-0">
<img alt="Avatar Rank 1" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="Portrait of a man with serious expression" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3YllumrAgf8dhrK3btWG8RzFH69v1BlDxAAsxe0T92vNvWEwTfepT6uJQq_15Ib1oMgIWX6SG1zjdVP-_2PHhqii4RfUxEn5iMOHYt4ATu55UIMzB1G_c_HyI5yDBdUOPCJ3clmFM381xb0fvkXuq2R_R0X-IcUw2eeV-M_ZzxnBoDfN8RMkVhPa4-vgQKFP2WWOtKfCvczWug6ZktwuOVhwJi2eNt8DYPTk4kY4_fNqRZ66q81lgy5LcEuEHmkIt1FV0rr7dmC6v"  />
</div>
<div className="flex-1">
<h2 className="font-serif text-3xl font-medium mb-1" >Aurelius</h2>
<div className="flex items-center gap-3">
<span className="text-xs font-bold uppercase tracking-widest text-primary" >Grandmaster</span>
<span className="text-sm text-muted flex items-center gap-1" >
<Circle className="text-[14px]" />
                                142,500
                            </span>
</div>
</div>
</div>

<div className="bg-vellum border-structural p-5 flex items-center gap-5 relative group transition-colors duration-300 hover:bg-parchment ml-4">
<div className="font-serif text-5xl text-muted w-12 text-center leading-none group-hover:text-ink transition-colors" >II</div>
<div className="h-16 w-16 rounded-none border-structural overflow-hidden shrink-0">
<img alt="Avatar Rank 2" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="Portrait of a woman looking slightly away" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDv-wWHk6MMx3OdsljChkG1LxVaJKYeGrZXWtWk--LboIOkL4EwW-N-bVkbTWkcOx8Ve8yKEiUntYIW6mCiB9PTxWe-HzkdwxrsoaOHWc41Scj2KZ1VfKR8GJyn1M7yeppZYma-6dsZUSJuHRc8Sjm4T03viPNMXrToJAcOxQuCmeV5wNFx4x92eZ39STJX4zApAPlZa2ZcRCCrFPqV91UOpbasYEzPG4uM9re7o6UuNs9PtgnHmiZRZIsiaUkvmFWHSO0jjoyF0Mvi"  />
</div>
<div className="flex-1">
<h2 className="font-serif text-2xl font-medium mb-1" >Seraphina</h2>
<div className="flex items-center gap-3">
<span className="text-xs font-bold uppercase tracking-widest text-ink" >Curator</span>
<span className="text-sm text-muted flex items-center gap-1" >
<Circle className="text-[14px]" />
                                128,400
                            </span>
</div>
</div>
</div>

<div className="bg-vellum border-structural p-4 flex items-center gap-4 relative group transition-colors duration-300 hover:bg-parchment ml-8">
<div className="font-serif text-4xl text-muted w-10 text-center leading-none group-hover:text-ink transition-colors" >III</div>
<div className="h-12 w-12 rounded-none border-structural overflow-hidden shrink-0">
<img alt="Avatar Rank 3" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" data-alt="Portrait of a man with light stubble" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1vyU5i6mbAnNQhCWuzeym9v5a1PRwQVv_WTiU8CMABCDKIABwqI80ZEvAbtYLuvYEvFg0f2fpavFVjlHYxGMRsBTlCMOhrb5SouINay2ojh98rj3FaiQTcKuIHFrNPvb6zX-UdkL0xxqVyBw5O0HfLN18ihYC034n7Ao2YK8gwAys7xsy2RH5cqq8fAq1uvqIcFv0_E2BAYmF3QiUIftzpd98t0UX4wkl5ZZ4a8TkngaoiSoTFGoROqkhXBwZOcQ-CvJJl4tNpsSO"  />
</div>
<div className="flex-1">
<h2 className="font-serif text-xl font-medium mb-0.5" >Cassius</h2>
<div className="flex items-center gap-3">
<span className="text-[10px] font-bold uppercase tracking-widest text-ink" >Archivist</span>
<span className="text-xs text-muted flex items-center gap-1" >
<Circle className="text-[12px]" />
                                115,200
                            </span>
</div>
</div>
</div>
</div>
</section>

<section className="w-3/5 bg-vellum flex flex-col relative">

<div className="h-12 border-structural-b flex items-center px-8 bg-parchment sticky top-0 z-20">
<div className="w-16 text-xs font-bold uppercase tracking-widest text-muted" >Rank</div>
<div className="flex-1 text-xs font-bold uppercase tracking-widest text-muted" >Collector</div>
<div className="w-32 text-xs font-bold uppercase tracking-widest text-muted text-right" >Score</div>
<div className="w-32 text-xs font-bold uppercase tracking-widest text-muted text-right" >Status</div>
</div>

<div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
<div className="flex flex-col flex-1">

<div className="h-14 border-structural-b flex items-center px-8 hover:bg-parchment transition-colors cursor-pointer group">
<div className="w-16 text-sm font-semibold text-muted group-hover:text-ink" >04</div>
<div className="flex-1 flex items-center gap-3">
<div className="h-6 w-6 rounded-full border-structural overflow-hidden bg-parchment">
<img alt="Avatar" className="w-full h-full object-cover grayscale opacity-70" data-alt="Small grayscale user avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAZfH1ieefxAcavKum3sca_k54PAHj33LeEJhWB_0DKIT_KmsXGjaNgzhbWQGBaguIE9EGM6Rn7q_Qv7Bqg2BEdHQ8IgMEIxIyGbgmaSdXo4unQuQBwShVxsJaEhvziOhwirkaimnrAYNRiZ5g1NFKHH5WUYpdO4sySW8MdezGb0EkYj4WBHmNFtzVkNha9GAFzNAiyjwBlLe-XuldSH5kAkc8YwEg7crRFOg-nhfxOmHOdvIWqyw8DVCjUCDpJDB_Tqaua-CYO1Zg"  />
</div>
<span className="text-sm font-medium text-ink" >Valerius</span>
</div>
<div className="w-32 text-sm text-right text-muted font-mono" >98,450</div>
<div className="w-32 text-right">
<span className="text-[10px] uppercase tracking-wider text-accent border border-accent px-2 py-0.5" >Active</span>
</div>
</div>

<div className="h-14 border-structural-b flex items-center px-8 hover:bg-parchment transition-colors cursor-pointer group">
<div className="w-16 text-sm font-semibold text-muted group-hover:text-ink" >05</div>
<div className="flex-1 flex items-center gap-3">
<div className="h-6 w-6 rounded-full border-structural overflow-hidden bg-parchment">
<img alt="Avatar" className="w-full h-full object-cover grayscale opacity-70" data-alt="Small grayscale user avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2wWSQCJPs-5Udbpjd9YKAQkzQr8vQ0psMkbMzpHdFJ78T8a4drJLwwthVCySFmnUYvj27qRIMu0Ht_pOFFteaJCDWqYV-EPVtvw4WBJBTMZ8zrYQTf4vEBDKYI1Wzag5sdgsbwQixjV81hZeH6s7sTJMGp_ATtv9bOsFwSiCyM-518CZ8xQwkLfkw8Eq8sde8v4yUjURmSCtMR5tGP4zlXHwK1BBQYTcTiUfr74X4j-t4IGyzcP1JdDfDVBln7KqOr8GjxoPwILLt"  />
</div>
<span className="text-sm font-medium text-ink" >Octavia</span>
</div>
<div className="w-32 text-sm text-right text-muted font-mono" >95,120</div>
<div className="w-32 text-right">
<span className="text-[10px] uppercase tracking-wider text-accent border border-accent px-2 py-0.5" >Active</span>
</div>
</div>

<div className="h-14 border-structural-b flex items-center px-8 hover:bg-parchment transition-colors cursor-pointer group">
<div className="w-16 text-sm font-semibold text-muted group-hover:text-ink" >06</div>
<div className="flex-1 flex items-center gap-3">
<div className="h-6 w-6 rounded-full border-structural overflow-hidden bg-parchment"></div>
<span className="text-sm font-medium text-ink" >Lucius_V</span>
</div>
<div className="w-32 text-sm text-right text-muted font-mono" >91,005</div>
<div className="w-32 text-right">
<span className="text-[10px] uppercase tracking-wider text-muted border border-muted px-2 py-0.5 opacity-50" >Dormant</span>
</div>
</div>

<div className="h-14 border-structural-b flex items-center px-8 hover:bg-parchment transition-colors cursor-pointer group">
<div className="w-16 text-sm font-semibold text-muted group-hover:text-ink" >07</div>
<div className="flex-1 flex items-center gap-3">
<div className="h-6 w-6 rounded-full border-structural overflow-hidden bg-parchment">
<img alt="Avatar" className="w-full h-full object-cover grayscale opacity-70" data-alt="Small grayscale user avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFr00LvbjEKynaBplJfDWqBjsRNOiS88-P7mOPzcKDq_dpdIKReheAUI42tuD83BIOE90bpWpfXoI6lw3xfQ1_SDWusuQVIfpOvSvSyIauZWzhFjQA3H93Jq7KacxYZzxycEOQa3Ytot8Q5rFtWtKff3gpAke0_nIDo3QxvYq7xfThQ-AvsuSyAu8yZsuZxZZ9IVRyjY1klGVVgcOPVv53kb6pQxoarz8njrxq5cBlePTLu2XZmKXrP88OzPMzBA3DxMm4ckYvQ_qV"  />
</div>
<span className="text-sm font-medium text-ink" >Helena</span>
</div>
<div className="w-32 text-sm text-right text-muted font-mono" >88,740</div>
<div className="w-32 text-right">
<span className="text-[10px] uppercase tracking-wider text-accent border border-accent px-2 py-0.5" >Active</span>
</div>
</div>

<div className="h-14 border-structural-b flex items-center px-8 hover:bg-parchment transition-colors cursor-pointer group bg-primary/5">
<div className="w-16 text-sm font-semibold text-primary" >08</div>
<div className="flex-1 flex items-center gap-3">
<div className="h-6 w-6 rounded-full border-primary border overflow-hidden bg-parchment">
<img alt="Current User Avatar" className="w-full h-full object-cover" data-alt="Current user avatar portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDW1X0nkps6fvGg-cbp7Uh42JWnoCwYIyab5QSsCDXjaN5PwfwAAGkuf-cEHBgT1bJInH6yeMPwhelgFDxAlbpKmJ_h3IdbG9FsMIKAg1w8YZkSomf1P82HTk3_W5fT-UqVW8m1S-pkfxyHIk3QcXYTEXVCMXcgR6Z54nvfUpp2obWDoCDOfGQ4R60C5Yxoaoh1Vm99_Eq49Iy8DLQpgf_g857Tcyx0VSBYe9xKa0Bf73pBKQdSimP56VDw7QuckyDvz_bLOSWxJet"  />
</div>
<span className="text-sm font-bold text-ink" >You (Observer)</span>
</div>
<div className="w-32 text-sm text-right text-primary font-mono font-bold" >85,200</div>
<div className="w-32 text-right">
<span className="text-[10px] uppercase tracking-wider text-primary border border-primary px-2 py-0.5" >Active</span>
</div>
</div>

<div className="h-14 border-structural-b flex items-center px-8 opacity-50">
<div className="w-16 text-sm font-semibold text-muted" >09</div>
<div className="flex-1 flex items-center gap-3">
<div className="h-6 w-6 rounded-full border-structural bg-parchment animate-pulse"></div>
<div className="h-4 w-24 bg-parchment border-structural animate-pulse"></div>
</div>
<div className="w-32 flex justify-end">
<div className="h-4 w-16 bg-parchment border-structural animate-pulse"></div>
</div>
<div className="w-32 flex justify-end">
<div className="h-4 w-12 bg-parchment border-structural animate-pulse"></div>
</div>
</div>
<div className="h-14 border-structural-b flex items-center px-8 opacity-40">
<div className="w-16 text-sm font-semibold text-muted" >10</div>
<div className="flex-1 flex items-center gap-3">
<div className="h-6 w-6 rounded-full border-structural bg-parchment animate-pulse"></div>
<div className="h-4 w-20 bg-parchment border-structural animate-pulse"></div>
</div>
<div className="w-32 flex justify-end">
<div className="h-4 w-16 bg-parchment border-structural animate-pulse"></div>
</div>
<div className="w-32 flex justify-end">
<div className="h-4 w-12 bg-parchment border-structural animate-pulse"></div>
</div>
</div>
<div className="h-14 border-structural-b flex items-center px-8 opacity-30">
<div className="w-16 text-sm font-semibold text-muted" >11</div>
<div className="flex-1 flex items-center gap-3">
<div className="h-6 w-6 rounded-full border-structural bg-parchment animate-pulse"></div>
<div className="h-4 w-28 bg-parchment border-structural animate-pulse"></div>
</div>
<div className="w-32 flex justify-end">
<div className="h-4 w-16 bg-parchment border-structural animate-pulse"></div>
</div>
<div className="w-32 flex justify-end">
<div className="h-4 w-12 bg-parchment border-structural animate-pulse"></div>
</div>
</div>
<div className="p-8 text-center mt-auto flex flex-col items-center gap-8 border-t border-structural">
<span className="text-xs text-muted uppercase tracking-widest font-semibold flex items-center justify-center gap-2 cursor-pointer hover:text-ink transition-colors" >
<Circle className="text-[16px]" />
                            Load Remaining Archives
                        </span>
                        
<Link to="/proto/ranking-submission" className="bg-ink text-vellum px-12 py-4 font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-primary transition-colors flex items-center gap-3">
    Submit Your Rankings
</Link>
</div>
</div>
</div>
<img alt="Large Seal Graphic" className="absolute w-full h-[150%] object-contain opacity-5 grayscale -rotate-12 pointer-events-none z-0 left-20 -top-20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE7cVLnoAjBRZLN_vsnzZCdrKXjIM47Y9VI-uYv4YKaG8CT8w6pUKVH1mY87GlOjIZ_-JIvAcDy_ES_gYwAvMzL0waPAyeA8iwr9LwsV8R5FvTMNxSM6vnMZGBa1I5E_Wt6y16L8ikL4-KJfX1C4VCNdf1SRaOUon2mb-QMB0pvAOtR_Pc3rM_1gCHM4UjXXrfExt1LEDzNxs1_KBotcijKSznWdSisfENT6hDP_PMqnXaBF9RXqp2UGOs4GjL7z8LsB4B2-Xmk7Yn" />
</section>

</main>

    </div>
  );
}