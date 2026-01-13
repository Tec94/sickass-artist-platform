import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 py-12 mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto px-4 text-center">
         <h2 className="text-2xl font-display font-bold text-white mb-4">ROA WOLVES</h2>
         <p className="text-zinc-500 text-sm mb-8">Premium athletic wear for the modern competitor.</p>
         <div className="flex justify-center gap-6 text-zinc-400 text-xs uppercase tracking-widest">
           <a href="#" className="hover:text-red-500 transition-colors">Instagram</a>
           <a href="#" className="hover:text-red-500 transition-colors">Twitter</a>
           <a href="#" className="hover:text-red-500 transition-colors">Discord</a>
         </div>
         <p className="mt-8 text-zinc-700 text-xs">© 2024 ROA WOLVES. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
