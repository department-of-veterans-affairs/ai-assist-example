import { useUpdatePatient } from '@department-of-veterans-affairs/cds-patient-context-lib';
import {
  Alert,
  Button,
  TextInput,
} from '@department-of-veterans-affairs/clinical-design-system';
import { useState } from 'react';
import { getEnvVar } from '@/utils/helpers';

export function PatientSelector() {
  const [icn, setIcn] = useState('');
  const smartContainerUrl = getEnvVar('VITE_SMART_CONTAINER_URL');
  const { updatePatient, errorMessage, isLoading, isSuccess } =
    useUpdatePatient(smartContainerUrl);

  const handleUpdatePatient = () => {
    if (icn.trim()) {
      updatePatient(icn.trim());
    }
  };

  return (
    <div className="margin-bottom-4 padding-3 border-1px border-base-lighter bg-base-lightest">
      {isSuccess && (
        <Alert className="margin-bottom-2" slim type="success">
          Patient context updated successfully
        </Alert>
      )}

      {errorMessage && (
        <Alert className="margin-bottom-2" slim type="error">
          {errorMessage.message}
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
            disabled={isLoading}
            id="patient-icn"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setIcn(event.target.value)
            }
            placeholder="Enter patient ICN"
            value={icn}
          />
        </div>
        <Button
          className="margin-bottom-0"
          disabled={isLoading || !icn.trim()}
          onClick={handleUpdatePatient}
        >
          {isLoading ? 'Updating...' : 'Update Patient'}
        </Button>
      </div>
    </div>
  );
}
