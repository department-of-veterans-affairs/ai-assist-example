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
        'flex shrink-0 flex-col border-base-lighter border-l bg-white transition-all duration-300',
        leftCollapsed ? 'w-14 items-center' : 'w-[30rem]'
      )}
    >
      {/* Header with toggle */}
      {!leftCollapsed && (
        <div className="flex items-center justify-end">
          <Button
            aria-label={leftCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="h-9 w-9 rounded-full text-base-dark hover:bg-primary-lighter hover:text-primary"
            onClick={toggleLeftSidebar}
            size="icon"
            type="button"
            variant="ghost"
          >
            <img alt="Close" className="h-4 w-4" src={Close} />
          </Button>
        </div>
      )}

      {/* Collapsed state - show only three icons */}
      {leftCollapsed && (
        <div className="flex flex-col items-center">
          <div>
            <Button
              aria-label="Expand sidebar"
              className="text-base-dark hover:text-primary"
              onClick={toggleLeftSidebar}
              size="icon"
              type="button"
              variant="ghost"
            >
              <img
                alt="Expand"
                className="h-4 w-4 text-primary"
                src={FirstPage}
              />
            </Button>
          </div>
          <div>
            <Button
              aria-label="Attachments"
              className="text-base-dark hover:text-primary"
              onClick={toggleLeftSidebar}
              size="icon"
              type="button"
              variant="ghost"
            >
              <img
                alt="Attachments"
                className="h-4 w-4"
                src={AttachmentsIcon}
              />
            </Button>
          </div>
          <div>
            <Button
              aria-label="History"
              className="text-base-dark hover:text-primary"
              onClick={toggleLeftSidebar}
              size="icon"
              type="button"
              variant="ghost"
            >
              <img alt="History" className="h-4 w-4" src={HistoryIcon} />
            </Button>
          </div>
        </div>
      )}

      {/* Only show children (SummarySection) when sidebar is expanded */}
      {!leftCollapsed && children}
    </aside>
  );
}
