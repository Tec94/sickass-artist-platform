import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 py-12 mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto px-4 text-center">
         <h2 className="text-2xl font-display font-bold text-white mb-4 tracking-widest">ROA WOLF <span className="text-red-600">.</span></h2>
         <p className="text-zinc-500 text-sm mb-8">{t('footer.tagline')}</p>
         <div className="flex justify-center gap-8 text-zinc-500">
            <a href="https://www.instagram.com/roapr__/" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-all hover:scale-110">
              <iconify-icon icon="simple-icons:instagram" width="20" height="20"></iconify-icon>
            </a>
            <a href="#" className="hover:text-red-500 transition-all hover:scale-110">
              <iconify-icon icon="simple-icons:x" width="20" height="20"></iconify-icon>
            </a>
            <a href="#" className="hover:text-red-500 transition-all hover:scale-110">
              <iconify-icon icon="simple-icons:discord" width="20" height="20"></iconify-icon>
            </a>
            <a href="#" className="hover:text-red-500 transition-all hover:scale-110">
              <iconify-icon icon="simple-icons:spotify" width="20" height="20"></iconify-icon>
            </a>
         </div>
         <p className="mt-8 text-zinc-700 text-xs">{t('footer.rights')}</p>
      </div>
    </footer>
  );
};

export default Footer;
