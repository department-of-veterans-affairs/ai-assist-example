import { Button } from '@department-of-veterans-affairs/clinical-design-system';
import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import AttachmentsIcon from '@/assets/icons/attachments.svg';
import Close from '@/assets/icons/close.svg';
import FirstPage from '@/assets/icons/first_page.svg';
import HistoryIcon from '@/assets/icons/history.svg';
import { useLayoutStore } from '@/stores/layout-store';

type SidebarProps = PropsWithChildren;

export function Sidebar({ children }: SidebarProps) {
  const leftCollapsed = useLayoutStore((state) => state.leftCollapsed);
  const toggleLeftSidebar = useLayoutStore((state) => state.toggleLeftSidebar);

  return (
    <aside
      className={clsx(
        'display-flex flex-column flex-shrink-0 border-base-lighter border-left bg-white transition-all',
        leftCollapsed ? 'width-8' : 'width-mobile-lg'
      )}
    >
      {/* Header with toggle */}
      {!leftCollapsed && (
        <div className="padding-top-3 padding-left-2 display-flex flex-align-center flex-justify-space-between">
          <Button
            aria-label={leftCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="padding-1 display-flex flex-align-center text-base-dark hover:text-primary"
            onClick={toggleLeftSidebar}
            type="button"
            unstyled
          >
            <img alt="Close" className="width-4 height-4" src={Close} />
          </Button>
        </div>
      )}

      {/* Collapsed state - show only three icons */}
      {leftCollapsed && (
        <div className="display-flex padding-y-3 flex-align-center flex-column">
          <div className="margin-bottom-2">
            <Button
              aria-label="Expand sidebar"
              className="padding-1 hover:opacity-70"
              onClick={toggleLeftSidebar}
              type="button"
              unstyled
            >
              <img alt="Expand" className="width-4 height-4" src={FirstPage} />
            </Button>
          </div>
          <div className="margin-bottom-2">
            <Button
              aria-label="Attachments"
              className="padding-1 hover:opacity-70"
              onClick={toggleLeftSidebar}
              type="button"
              unstyled
            >
              <img
                alt="Attachments"
                className="width-4 height-4"
                src={AttachmentsIcon}
              />
            </Button>
          </div>
          <div>
            <Button
              aria-label="History"
              className="padding-1 hover:opacity-70"
              onClick={toggleLeftSidebar}
              type="button"
              unstyled
            >
              <img
                alt="History"
                className="width-4 height-4"
                src={HistoryIcon}
              />
            </Button>
          </div>
        </div>
      )}

      {children}
    </aside>
  );
}
