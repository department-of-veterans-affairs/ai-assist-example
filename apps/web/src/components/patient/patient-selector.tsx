import {
  Alert,
  Button,
  TextInput,
} from '@department-of-veterans-affairs/clinical-design-system';
import { useState } from 'react';
import { usePatientStore } from '@/stores/patient-store';

export function PatientSelector() {
  const [icn, setIcn] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const patient = usePatientStore((state) => state.patient);
  const setPatient = usePatientStore((state) => state.setPatient);

  const handleUpdatePatient = () => {
    const trimmedIcn = icn.trim();
    if (!trimmedIcn) {
      return;
    }

    if (!patient) {
      setStatus('error');
      return;
    }

    setPatient({
      ...patient,
      icn: trimmedIcn,
      dfn: trimmedIcn,
    });

    setStatus('success');
  };

  return (
    <div className="margin-bottom-4 padding-3 border-1px border-base-lighter bg-base-lightest">
      {status === 'success' && (
        <Alert className="margin-bottom-2" slim type="success">
          Patient context updated successfully
        </Alert>
      )}

      {status === 'error' && (
        <Alert className="margin-bottom-2" slim type="error">
          Unable to update patient context.
        </Alert>
      )}

      <h3 className="margin-top-0 margin-bottom-2 font-body-lg text-bold">
        Update Patient Context
      </h3>

      <p className="margin-bottom-2 font-body-sm text-base">
        Use this to update the patient context across all CDS-enabled
        applications
      </p>

      <div className="display-flex flex-align-end gap-2">
        <div className="flex-1">
          <label
            className="usa-label font-body-xs text-bold"
            htmlFor="patient-icn"
          >
            Patient ICN:
          </label>
          <TextInput
            className="maxw-none"
            id="patient-icn"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setStatus('idle');
              setIcn(event.target.value);
            }}
            placeholder="Enter patient ICN"
            value={icn}
          />
        </div>
        <Button
          className="margin-bottom-0"
          disabled={!(icn.trim() && patient)}
          onClick={handleUpdatePatient}
        >
          Update Patient
        </Button>
      </div>
    </div>
  );
}
