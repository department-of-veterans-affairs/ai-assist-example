import type { PropsWithChildren } from 'react';
import AttachmentsIcon from '@/assets/icons/attachments.svg';
import Close from '@/assets/icons/close.svg';
import FirstPage from '@/assets/icons/first_page.svg';
import HistoryIcon from '@/assets/icons/history.svg';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLayoutStore } from '@/stores/layout-store';

type SidebarProps = PropsWithChildren;

export function Sidebar({ children }: SidebarProps) {
  const leftCollapsed = useLayoutStore((state) => state.leftCollapsed);
  const toggleLeftSidebar = useLayoutStore((state) => state.toggleLeftSidebar);

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col border-l bg-white transition-all duration-300',
        leftCollapsed ? 'w-14 items-center' : 'w-auto'
      )}
    >
      {!leftCollapsed && (
        <div className="flex items-center justify-end p-2">
          <Button
            aria-label="Collapse sidebar"
            className="rounded-full"
            onClick={toggleLeftSidebar}
            size="icon"
            type="button"
            variant="ghost"
          >
            <img alt="Close" className="size-4" src={Close} />
          </Button>
        </div>
      )}

      {leftCollapsed && (
        <div className="flex flex-col items-center gap-1 py-2">
          <Button
            aria-label="Expand sidebar"
            className="size-10"
            onClick={toggleLeftSidebar}
            size="icon"
            type="button"
            variant="ghost"
          >
            <img alt="Expand" src={FirstPage} />
          </Button>
          <Button
            aria-label="Attachments"
            className="size-10"
            onClick={toggleLeftSidebar}
            size="icon"
            type="button"
            variant="ghost"
          >
            <img alt="Attachments" src={AttachmentsIcon} />
          </Button>
          <Button
            aria-label="History"
            className="size-10"
            onClick={toggleLeftSidebar}
            size="icon"
            type="button"
            variant="ghost"
          >
            <img alt="History" src={HistoryIcon} />
          </Button>
        </div>
      )}

      {!leftCollapsed && children}
    </aside>
  );
}
