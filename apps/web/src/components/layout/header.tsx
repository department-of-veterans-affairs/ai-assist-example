import {
  ClinicianInitialsButton,
  Header as VACDSHeader,
} from '@department-of-veterans-affairs/clinical-design-system';
import { useLayoutStore } from '@/stores/layout-store';

export function Header() {
  const leftCollapsed = useLayoutStore((state) => state.leftCollapsed);

  return (
    <VACDSHeader appName={leftCollapsed ? 'VA | AI assist' : ''}>
      <div className="display-flex flex-align-center">
        <ClinicianInitialsButton
          ariaLabel="User menu for VA.NPUser1@example.com"
          initials="VU"
        />
      </div>
    </VACDSHeader>
  );
}
