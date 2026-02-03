import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 py-12 mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto px-4 text-center">
         <h2 className="text-2xl font-display font-bold text-white mb-4 tracking-widest">ROA <span className="text-red-600">.</span></h2>
         <p className="text-zinc-500 text-sm mb-8">{t('footer.tagline')}</p>
         <div className="flex justify-center gap-8 text-zinc-500">
            <a href="https://www.instagram.com/roapr__/" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-all hover:scale-110">
              <iconify-icon icon="simple-icons:instagram" width="20" height="20"></iconify-icon>
            </a>
            <a href="https://open.spotify.com/album/1XSQ56Y0zCG0Aht3EvSHj4?si=6e0a5XxuQR6ydZezyn3k8w" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-all hover:scale-110">
              <iconify-icon icon="simple-icons:spotify" width="20" height="20"></iconify-icon>
            </a>
            <a href="https://music.youtube.com/playlist?list=OLAK5uy_kDqvpb9zlGREuHwo-__LStv87kkrv1pW8&src=Linkfire&lId=13dd03a4-c1a8-4efe-8466-bedcc796b0d7&cId=d3d58fd7-4c47-11e6-9fd0-066c3e7a8751&utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnsL_54OOOH8lLqTUOzMUS3oNhI3kck3vIK0SdEnxu7jdSYla4snbqYqnzRJg_aem_TT6QXfGMkEXMI3KQWWVJyA" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-all hover:scale-110">
              <iconify-icon icon="simple-icons:youtubemusic" width="20" height="20"></iconify-icon>
            </a>
            <a href="https://allmylinks.com/" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-all hover:scale-110">
              <iconify-icon icon="solar:link-linear" width="20" height="20"></iconify-icon>
            </a>
         </div>
         <p className="mt-8 text-zinc-700 text-xs">{t('footer.copyright')}</p>
      </div>
    </footer>
  );
};

export default Footer;
