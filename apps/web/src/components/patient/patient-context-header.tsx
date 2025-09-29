import { usePatientStore } from '@/stores';
import { formatSSN } from '@/utils/text';

export function PatientContextHeader() {
  const patient = usePatientStore((state) => state.patient);
  // const [showSelector, setShowSelector] = useState(false);

  if (!patient) {
    return null;
  }

  return (
    <div className="relative border-b shadow-md">
      <div className="px-4 py-2">
        <div className="flex max-w-3xl flex-col overflow-hidden">
          <h2 className="truncate font-semibold text-lg">
            {patient.lastName}, {patient.firstName}
          </h2>

          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-primary-darker text-xs">
            {patient.dob && <span>DOB: {patient.dob}</span>}
            {patient.ssn && (
              <>
                <span className="px-1 font-semibold">•</span>
                <span>SSN: {formatSSN(patient.ssn)}</span>
              </>
            )}
            {patient.mrn && (
              <>
                <span className="px-1 font-semibold">•</span>
                <span>{patient.mrn}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
