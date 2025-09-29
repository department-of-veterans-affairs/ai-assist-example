import { usePatientStore } from '@/stores';
import { formatSSN } from '@/utils/text';

export function PatientContextHeader() {
  const patient = usePatientStore((state) => state.patient);
  // const [showSelector, setShowSelector] = useState(false);

  if (!patient) {
    return null;
  }

  return (
    <div className="relative z-50 border-base-lighter border-b bg-base-lightest shadow-2">
      <div className="px-2 py-2">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-1 items-start overflow-hidden pl-2">
            {/* <button
              aria-label="Toggle patient selector"
              className="mr-2 p-0 text-base-dark text-base-dark"
              // onClick={() => setShowSelector(!showSelector)}
              type="button"
            >
              <img alt="" className="h-4 w-4" src={VertIcon} />
            </button> */}
            <div className="flex max-w-3xl flex-1 flex-col overflow-hidden">
              <h2 className="truncate font-semibold text-lg text-primary-darker text-primary-darker">
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
      </div>

      {/* {showSelector && <PatientSelector />} */}
    </div>
  );
}
