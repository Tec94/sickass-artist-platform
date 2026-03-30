import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';

type CommunitySidebarActiveItem = 'all-threads' | 'new-post';

interface CommunitySidebarProps {
  activeItem?: CommunitySidebarActiveItem;
}

const sidebarSections = [
  { id: 'all-threads', label: 'All Threads', count: '1.2k' },
  { id: 'announcements', label: 'Announcements', count: '12' },
  { id: 'the-archives', label: 'The Archives', count: '840' },
  { id: 'upcoming-events', label: 'Upcoming Events', count: '56' },
  { id: 'general', label: 'General', count: '342' },
] as const;

export default function CommunitySidebar({
  activeItem = 'all-threads',
}: CommunitySidebarProps) {
  return (
    <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] min-h-[calc(100vh-72px)] w-[320px] shrink-0 flex-col overflow-y-auto border-r border-solid border-[#3C2A21] bg-[#F4EFE6] lg:flex">
      <div className="p-8 pb-4 border-b border-[#3C2A21]">
        <h1 className="font-serif text-4xl font-medium tracking-tight mb-2 text-[#3C2A21]">La Manada</h1>
        <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[#8E7D72]">Community Forum</p>
      </div>

      <nav className="flex flex-col py-6">
        {sidebarSections.map((section) => {
          const isActive = activeItem === section.id;

          return (
            <Link
              key={section.id}
              to="/community"
              aria-current={isActive ? 'page' : undefined}
              className={
                isActive
                  ? 'flex items-center justify-between px-8 py-3 bg-[#3C2A21]/5 text-[#C36B42] border-l-2 border-[#C36B42] group transition-colors'
                  : 'flex items-center justify-between px-8 py-3 text-[#8E7D72] hover:text-[#3C2A21] hover:bg-[#FAF7F2] border-l-2 border-transparent transition-colors group'
              }
            >
              <span className={isActive ? 'text-xs font-bold uppercase tracking-widest' : 'text-xs font-semibold uppercase tracking-widest'}>
                {section.label}
              </span>
              <span className={isActive ? 'text-[10px] font-bold text-[#8E7D72]' : 'text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity'}>
                {section.count}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-8 border-t border-[#3C2A21]">
        <Link
          to="/new-post"
          aria-current={activeItem === 'new-post' ? 'page' : undefined}
          onClick={() => setNextTransition('push')}
          className={
            activeItem === 'new-post'
              ? 'w-full flex justify-center items-center py-3 border border-[#3C2A21] bg-[#1F1C19] text-[#F4EFE6] text-xs font-bold uppercase tracking-widest rounded-sm transition-colors hover:border-[#C36B42] hover:bg-[#C36B42]'
              : 'w-full flex justify-center items-center py-3 border border-[#3C2A21] text-[#3C2A21] text-xs font-bold uppercase tracking-widest hover:bg-[#3C2A21] hover:text-[#F4EFE6] transition-all rounded-sm'
          }
        >
          NEW POST
        </Link>
      </div>
    </aside>
  );
}
