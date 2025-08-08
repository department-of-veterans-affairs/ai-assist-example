import {
  ClinicianInitialsButton,
  Header as VACDSHeader,
} from '@department-of-veterans-affairs/clinical-design-system';
import { usePatientStore } from '@/stores';

export function Header() {
  const patient = usePatientStore((state) => state.patient);

  return (
    <VACDSHeader
      appName="VA | AI assist"
      patientContextProps={{
        firstName: patient?.firstName ?? '',
        lastName: patient?.lastName ?? '',
        ssn: patient?.ssn ?? '',
      }}
    >
      <ClinicianInitialsButton
        ariaLabel="User menu for VA.NPUser1@example.com"
        initials="VU"
      />
    </VACDSHeader>
  );
}
