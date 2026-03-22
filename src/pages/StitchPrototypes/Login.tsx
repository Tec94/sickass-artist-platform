import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';

export default function Login() {
  return (
    <div className="font-body selection:bg-[#C36B42]/20 min-h-screen flex items-center justify-center p-6 bg-[#F4EFE6] text-[#3C2A21]">
      <style>{`
        .vellum-surface { background-color: #FAF7F2; }
        .ink-border { border: 1px solid #3C2A21; }
        .ink-rule { border-bottom: 1px solid #3C2A21; }
        .ink-rule-soft { border-bottom: 1px solid rgba(60, 42, 33, 0.15); }
      `}</style>
      
      <main className="w-full max-w-lg flex flex-col gap-12 z-10">
        {/* Brand Header */}
        <header className="text-center">
          <h1 className="font-headline italic text-4xl tracking-tight text-[#3C2A21]">
            THE ARCHIVE
          </h1>
          <div className="mt-4 flex justify-center">
            <div className="w-12 h-[1px] bg-[#3C2A21]/30"></div>
          </div>
        </header>
        
        {/* Login Card */}
        <section className="vellum-surface ink-border p-10 md:p-14 relative overflow-hidden">
          {/* Architectural Line Detail */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[#3C2A21]"></div>
          
          <div className="flex flex-col gap-8">
            <div className="space-y-2">
              <h2 className="font-headline text-3xl md:text-4xl tracking-tight text-[#3C2A21] uppercase">
                ARCHIVAL ACCESS
              </h2>
              <p className="font-label text-[11px] font-semibold tracking-[0.2em] text-[#8E7D72] uppercase">
                Enter your credentials to proceed.
              </p>
            </div>
            
            <form className="flex flex-col gap-10" onSubmit={(e) => { e.preventDefault(); setNextTransition('push'); window.location.href='/proto/directory'; }}>
              <div className="space-y-8">
                {/* Email Field */}
                <div className="flex flex-col gap-2 group">
                  <label className="font-label text-[10px] font-bold tracking-widest text-[#3C2A21] uppercase" htmlFor="email">
                    Registered Email
                  </label>
                  <input className="bg-transparent border-0 border-b border-[#3C2A21]/20 focus:border-[#3C2A21] focus:ring-0 px-0 py-2 text-[#3C2A21] placeholder:text-[#8E7D72]/40 font-body transition-colors" id="email" name="email" placeholder="name@institution.org" required type="email" />
                </div>
                
                {/* Password Field */}
                <div className="flex flex-col gap-2 group">
                  <label className="font-label text-[10px] font-bold tracking-widest text-[#3C2A21] uppercase" htmlFor="password">
                    Security Key
                  </label>
                  <input className="bg-transparent border-0 border-b border-[#3C2A21]/20 focus:border-[#3C2A21] focus:ring-0 px-0 py-2 text-[#3C2A21] placeholder:text-[#8E7D72]/40 font-body transition-colors" id="password" name="password" placeholder="••••••••••••" required type="password" />
                </div>
              </div>
              
              <div className="flex flex-col gap-6">
                <button className="bg-[#3C2A21] text-[#F4EFE6] px-8 py-4 font-label text-[11px] font-extrabold tracking-[0.3em] uppercase hover:bg-[#C36B42] transition-colors duration-300 flex items-center justify-center gap-3 group" type="submit">
                  AUTHORIZE ENTRY
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                </button>
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t border-[#3C2A21]/10 pt-6">
                  <Link className="font-label text-[10px] font-bold tracking-wider text-[#8E7D72] hover:text-[#3C2A21] transition-colors uppercase decoration-[#8E7D72]/30 underline-offset-4 underline" to="#">
                    Forgot credentials?
                  </Link>
                  <Link className="font-label text-[10px] font-bold tracking-wider text-[#C36B42] hover:underline underline-offset-4 uppercase" to="/proto/directory">
                    Create new dossier
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </section>
        
        {/* Institutional Footer */}
        <footer className="flex flex-col items-center gap-4 opacity-60">
          <div className="flex items-center gap-6">
            <span className="font-label text-[9px] font-bold tracking-[0.2em] uppercase text-[#3C2A21]">Registry v.4.0.2</span>
            <span className="w-[1px] h-3 bg-[#3C2A21]/20"></span>
            <span className="font-label text-[9px] font-bold tracking-[0.2em] uppercase text-[#3C2A21]">End-to-End Encryption</span>
          </div>
          <p className="font-label text-[10px] tracking-tight text-[#8E7D72] text-center">
            © 2024 ARCHIVAL REGISTRY SYSTEM. ALL RIGHTS RESERVED.
          </p>
        </footer>
      </main>
      
      {/* Visual Texture Overlay (Simulated) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAWxWLm5d4zcV5EZqL9EvEylRTwghzaZnEMB7jBl-0GIcmyEiy5FdKFww7NjgQz_zMkb7VP1Hqnw1Q5w1jrQXO36Cnz9Ud1Zcvk7FuoSmlEeLP2WCMr-063_Kh1hzNY1T95gr95IiQn0FJ5Loa-86ZmKFf26x6G8jcBU9sPcloqcO5XVI1y4_a7WK-6skhTRb525fz0m4FNkCfaX2MKnhG9p1R4RWCFu1pcfkUCOheDFTq8MR6YH49bP093fa-aJlnKkA0lTYIRbYc5')" }}></div>
    </div>
  );
}
