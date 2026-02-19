
import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useTranslation } from '../../hooks/useTranslation';

interface ProfilePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

export const ProfilePopover: React.FC<ProfilePopoverProps> = ({ isOpen, onClose, triggerRef }) => {
  const { userProfile, signOut } = useUser();
  const { t } = useTranslation();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 mt-2 w-64 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/70 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.55)] overflow-hidden animate-fade-in z-50 origin-top-right"
      style={{ top: '100%' }}
    >
      <div className="p-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
            {userProfile?.avatar ? (
              <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-sm font-bold">
                {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-white truncate max-w-[140px]">{userProfile?.displayName || 'User'}</p>
            <p className="text-xs text-zinc-500 truncate max-w-[140px]">{userProfile?.email || ''}</p>
          </div>
        </div>
        
        {/* Account Level / Quest Status Placeholder */}
        <div className="mt-3 bg-zinc-900/50 rounded-lg p-2 flex items-center justify-between border border-zinc-800/50">
           <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Level</span>
              <span className="text-sm font-bold text-white">12</span>
           </div>
           <div className="h-4 w-px bg-zinc-800 mx-2"></div>
           <div className="flex items-center gap-2">
              <iconify-icon icon="solar:crown-star-bold" class="text-amber-500" width="14"></iconify-icon>
              <span className="text-xs text-white timeout">Premium</span>
           </div>
        </div>
      </div>

      <div className="py-1">
        <Link
          to="/profile"
          className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors flex items-center gap-2"
          onClick={onClose}
        >
          <iconify-icon icon="solar:user-circle-linear" width="16"></iconify-icon>
          {t('nav.profile')}
        </Link>
        <Link
            to="/quests"
            className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors flex items-center gap-2"
            onClick={onClose}
        >
             <iconify-icon icon="solar:flag-2-linear" width="16"></iconify-icon>
             {t('nav.quests')}
        </Link>
        <Link
          to="/store/orders"
          className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors flex items-center gap-2"
          onClick={onClose}
        >
          <iconify-icon icon="solar:box-linear" width="16"></iconify-icon>
          {t('store.orders')}
        </Link>
        <div className="border-t border-zinc-800/60 my-1"></div>
        <button
          onClick={() => {
            onClose();
            signOut();
          }}
          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
        >
          <iconify-icon icon="solar:logout-2-linear" width="16"></iconify-icon>
          {t('auth.signOut')}
        </button>
      </div>
    </div>
  );
};
