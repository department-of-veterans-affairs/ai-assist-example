import {
  Button,
  Icon,
} from '@department-of-veterans-affairs/clinical-design-system';
import clsx from 'clsx';
import { useLayoutStore } from '@/stores/layout-store';
import { RecentSection } from './recent-section';
import { SummarySection } from './summary-section';

export function Sidebar() {
  const leftCollapsed = useLayoutStore((state) => state.leftCollapsed);
  const toggleLeftSidebar = useLayoutStore((state) => state.toggleLeftSidebar);

  return (
    <aside
      className={clsx(
        'display-flex flex-column border-base-lighter border-right bg-base-lightest transition-all',
        leftCollapsed ? 'width-6' : 'width-mobile'
      )}
    >
      {/* Header with app name and toggle */}
      <div
        className={clsx(
          'padding-2 display-flex flex-align-center border-base-lighter border-bottom',
          leftCollapsed ? 'flex-justify-center' : 'flex-justify-space-between'
        )}
      >
        {!leftCollapsed && (
          <div className="flex-1">
            <div className="font-body-lg font-family-sans text-base-darkest text-bold">
              VA | AI assist
            </div>
          </div>
        )}
        <div className={clsx(!leftCollapsed && 'margin-left-2')}>
          <Button
            aria-label={leftCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="padding-1 display-flex flex-align-center text-base-dark hover:text-primary"
            onClick={toggleLeftSidebar}
            type="button"
            unstyled
          >
            <Icon className="text-base-dark" size={4} type="Menu" />
          </Button>
        </div>
      </div>

      {/* Collapsed icons */}
      {leftCollapsed && (
        <div className="display-flex padding-y-3 flex-align-center flex-column">
          <Button
            aria-label="Recent patients"
            className="padding-2 margin-bottom-3 display-flex flex-align-center text-base-dark hover:text-primary"
            onClick={toggleLeftSidebar}
            type="button"
            unstyled
          >
            <Icon size={4} type="History" />
          </Button>
          <Button
            aria-label="Summary"
            className="padding-2 display-flex flex-align-center text-base-dark hover:text-primary"
            onClick={toggleLeftSidebar}
            type="button"
            unstyled
          >
            <Icon size={4} type="List" />
          </Button>
        </div>
      )}

      {/* Sidebar content */}
      {!leftCollapsed && (
        <div className="flex-1 overflow-y-auto">
          <RecentSection />
          <SummarySection />
        </div>
      )}
    </aside>
  );
}
