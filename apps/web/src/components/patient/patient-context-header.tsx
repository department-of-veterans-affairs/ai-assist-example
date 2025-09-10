import { useState } from 'react';
import VertIcon from '@/assets/icons/vert.svg';
import { usePatientStore } from '@/stores';
import { formatSSN } from '@/utils/text';
import { PatientSelector } from './patient-selector';

export function PatientContextHeader() {
  const patient = usePatientStore((state) => state.patient);
  const [showSelector, setShowSelector] = useState(false);

  if (!patient) {
    return (
      <div className="padding-x-2 padding-y-2">
        <PatientSelector />
      </div>
    );
  }

  return (
    <div className="position-relative z-index-100 border-gray-30 bg-base-lightest shadow-2">
      <div className="padding-x-2 padding-y-2">
        <div className="display-flex width-full flex-align-center flex-justify-space-between">
          <div className="display-flex minw-0 flex-1 flex-align-start overflow-hidden">
            <button
              aria-label="Toggle patient selector"
              className="padding-0 margin-right-1 cursor-pointer border-0 bg-transparent"
              onClick={() => setShowSelector(!showSelector)}
              type="button"
            >
              <img
                alt=""
                className="width-3 height-3 flex-shrink-0"
                src={VertIcon}
              />
            </button>
            <div className="display-flex minw-0 maxw-tablet flex-1 flex-column overflow-hidden">
              <h2 className="margin-0 font-body-md font-heading-lg text-bold text-primary-darker text-truncate">
                {patient.lastName}, {patient.firstName}
              </h2>

              <div className="display-flex margin-top-05 flex-align-center gap-2 font-body-xs text-primary-darker">
                {patient.dob && <span>DOB: {patient.dob}</span>}
                {patient.ssn && (
                  <>
                    <span className="padding-left-05 padding-right-05 text-bold">
                      •
                    </span>
                    <span>SSN: {formatSSN(patient.ssn)}</span>
                  </>
                )}
                {patient.mrn && (
                  <>
                    <span className="padding-left-05 padding-right-05 text-bold">
                      •
                    </span>
                    <span>{patient.mrn}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* TODO: Implement patient change functionality */}
          {/* <button
          className="display-flex margin-right-4 padding-1 flex-align-center flex-shrink-0 cursor-pointer gap-1 border-0 bg-transparent font-body-sm text-bold text-primary hover:opacity-70 active:opacity-50"
          onClick={() => {
            // TODO: Implement patient change functionality
          }}
          type="button"
        >
          <img
            alt="Back"
            className="width-2 height-2 margin-right-05"
            src={ArrowBackIcon}
          />
          <span>Change Patient</span>
        </button> */}
        </div>
      </div>

      {showSelector && <PatientSelector />}
    </div>
  );
}
