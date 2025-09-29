import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <div className="mb-6 rounded-lg border bg-base-lightest p-6 shadow-sm">
      {status === 'success' && (
        <Alert className="mb-4" slim variant="success">
          Patient context updated successfully
        </Alert>
      )}

      {status === 'error' && (
        <Alert className="mb-4" slim variant="error">
          Unable to update patient context.
        </Alert>
      )}

      <h3 className="mb-2 font-semibold text-lg">Update Patient Context</h3>

      <p className="mb-4 text-base-dark text-sm">
        Use this to update the patient context across all CDS-enabled
        applications.
      </p>

      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <Label htmlFor="patient-icn">Patient ICN</Label>
          <Input
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
          disabled={!(icn.trim() && patient)}
          onClick={handleUpdatePatient}
        >
          Update Patient
        </Button>
      </div>
    </div>
  );
}
