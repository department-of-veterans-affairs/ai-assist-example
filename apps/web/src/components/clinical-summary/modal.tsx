import {
  Button,
  Modal,
  type ModalRef,
} from '@department-of-veterans-affairs/clinical-design-system';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import copyIcon from '@/assets/icons/copy.svg';
import printIcon from '@/assets/icons/print.svg';
import thumbsDownIcon from '@/assets/icons/thumbs-down.svg';
import thumbsUpIcon from '@/assets/icons/thumbs-up.svg';
import { usePatientStore } from '@/stores';
import { LoadingIndicator } from '../loading-indicator';

interface ClinicalSummaryModalProps {
  onProcess: () => Promise<void>;
  ref: React.Ref<ModalRef>;
}

export const ClinicalSummaryModal = ({
  onProcess,
  ref,
}: ClinicalSummaryModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const modalRef = useRef<ModalRef>(null);
  const patient = usePatientStore((state) => state.patient);
  const hasPatient = usePatientStore((state) => !!state.patient);

  useImperativeHandle(ref, () => ({
    modalId: 'clinical-summary-modal',
    modalIsOpen: modalRef.current?.modalIsOpen ?? false,
    toggleModal: (event, open) => {
      return modalRef.current?.toggleModal(event, open) ?? false;
    },
  }));

  useEffect(() => {
    const processPatient = async () => {
      if (!isProcessing) {
        setIsProcessing(true);
        try {
          await onProcess();
        } catch (error) {
          // biome-ignore lint/suspicious/noConsole: Error logging needed
          console.error('Error processing:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    !hasPatient && processPatient();
  }, [isProcessing, onProcess, hasPatient]);

  function handleClose() {
    modalRef.current?.toggleModal(undefined, false);
  }

  return (
    <Modal
      aria-describedby="clinical-summary-modal-description"
      aria-labelledby="clinical-summary-modal-heading"
      className="width-full"
      forceAction={isProcessing}
      id="clinical-summary-modal"
      isInitiallyOpen={false}
      isLarge
      ref={modalRef}
    >
      <div className="display-flex height-full flex-column">
        {/* Header with close button */}
        <div className="display-flex flex-align-start flex-justify border-base-light">
          <h2
            className="margin-0 text-bold text-primary-darker"
            id="clinical-summary-modal-heading"
          >
            Process the past 6 months of patient history + medical notes
          </h2>
        </div>

        {/* Patient info header */}
        <div className="display-flex flex-column border-base-light border-bottom-1px">
          <div
            className="font-body-sm text-base-dark"
            id="clinical-summary-modal-description"
          >
            {patient ? (
              <>
                <span className="text-bold">Patient: </span>
                <span>
                  {patient.firstName && patient.lastName
                    ? `${patient.firstName} ${patient.lastName}`
                    : 'Unknown'}
                  (DFN {patient.dfn}, DOB {patient.dob || 'Unknown'})
                </span>
                <br />
                <span className="text-bold">
                  Patient History: March - May, 2025
                </span>
              </>
            ) : (
              <span>
                No patient selected. Please select a patient to process their
                history.
              </span>
            )}
          </div>
        </div>

        {/* Content area */}
        <div
          className="margin-top-1 margin-bottom-1 flex-1 overflow-y-auto text-base"
          style={{ maxHeight: '40vh' }}
        >
          {(() => {
            if (isProcessing) {
              return <LoadingIndicator />;
            }
            if (patient) {
              return (
                <div className="line-height-body-3 font-body-md">
                  <p className="margin-bottom-3">
                    Mr. Anderson's care over the past six months has focused on
                    the initial diagnosis and management of Hypertension and
                    Type 2 Diabetes. His visits were centered on establishing a
                    medication regimen, monitoring key health metrics, and
                    providing education on lifestyle modifications.
                  </p>

                  <p className="margin-bottom-2">
                    <strong>January:</strong> During his annual physical, Mr.
                    Anderson's blood pressure was elevated at 155/92 mmHg, and
                    routine blood work revealed a high A1c of 7.2%. Given these
                    results, we initiated a new care plan. He was prescribed
                    Lisinopril for his blood pressure and Metformin to manage
                    his blood sugar. We also provided a referral to a VA
                    nutritionist and an educational packet on managing newly
                    diagnosed conditions. The importance of daily monitoring was
                    stressed, and he was given a home blood pressure cuff.
                  </p>

                  <p className="margin-bottom-2">
                    <strong>February:</strong> A follow-up telehealth call was
                    scheduled to check on his progress. Mr. Anderson reported
                    some mild dizziness in the first week, which he said had
                    since resolved. He confirmed he was taking his medications
                    as prescribed and was beginning to track his blood pressure
                    readings at home. We encouraged him to continue with the new
                    habits and noted the need for consistency.
                  </p>

                  <p className="margin-bottom-2">
                    <strong>May:</strong> Mr. Anderson's follow-up lab results
                    were reviewed during a visit. His A1c had improved to 6.7%,
                    and his in-office blood pressure was 138/85 mmHg. We
                    discussed the positive impact of his efforts and provided
                    additional resources on exercise programs available through
                    the VA. We also adjusted his Lisinopril dosage slightly to
                    help him reach his target blood pressure goals.
                  </p>

                  <p className="margin-bottom-2">
                    <strong>June:</strong> The final visit of this period was a
                    check-in to confirm Mr. Anderson's new medication dosage was
                    not causing any side effects. He reported no issues and
                    expressed confidence in his ability to manage his
                    conditions. We reviewed his progress and scheduled his next
                    full check-up for a quarter from now.
                  </p>

                  <p>
                    Mr. Anderson has demonstrated excellent adherence to his
                    treatment plan, with significant progress in managing his
                    newly diagnosed conditions.
                  </p>
                </div>
              );
            }
            return (
              <div className="padding-y-5 text-center text-base">
                Please select a patient to view their history.
              </div>
            );
          })()}
        </div>

        {/* Action buttons */}
        {!isProcessing && patient && (
          <div className="display-flex flex-align-center flex-row border-base-light">
            <button
              aria-label="Copy to clipboard"
              className="display-flex padding-1 margin-right-2 radius-md flex-align-center flex-justify-center cursor-pointer border-0 bg-primary-lighter hover:bg-primary-light"
              onClick={() => {
                // biome-ignore lint/suspicious/noConsole: Placeholder for copy functionality
                console.log('Copy to clipboard');
              }}
              type="button"
            >
              <img alt="" height="20" src={copyIcon} width="20" />
            </button>

            <button
              aria-label="Print"
              className="display-flex padding-1 margin-right-3 radius-md flex-align-center flex-justify-center cursor-pointer border-0 bg-primary-lighter hover:bg-primary-light"
              onClick={() => {
                // biome-ignore lint/suspicious/noConsole: Placeholder for print functionality
                console.log('Print');
              }}
              type="button"
            >
              <img alt="" height="20" src={printIcon} width="20" />
            </button>

            <div className="display-flex">
              <button
                aria-label="Good response"
                className="display-flex padding-1 radius-left-md radius-right-0 flex-align-center flex-justify-center cursor-pointer border-0 bg-primary-lighter hover:bg-primary-light"
                onClick={() => {
                  // biome-ignore lint/suspicious/noConsole: Placeholder for feedback
                  console.log('Good response');
                }}
                type="button"
              >
                <img alt="" height="20" src={thumbsUpIcon} width="20" />
              </button>

              <button
                aria-label="Bad response"
                className="display-flex padding-1 radius-left-0 radius-right-md flex-align-center flex-justify-center cursor-pointer border-0 border-left-1px border-primary bg-primary-lighter hover:bg-primary-light"
                onClick={() => {
                  // biome-ignore lint/suspicious/noConsole: Placeholder for feedback
                  console.log('Bad response');
                }}
                type="button"
              >
                <img alt="" height="20" src={thumbsDownIcon} width="20" />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="margin-top-2 display-flex position-relative padding-y-2 flex-align-center">
          <Button onClick={handleClose}>Close</Button>
          <p
            className="margin-0 position-absolute right-0 left-0 text-center font-body-xs text-base"
            style={{ pointerEvents: 'none' }}
          >
            AI-generated content may be incorrect
          </p>
        </div>
      </div>
    </Modal>
  );
};

ClinicalSummaryModal.displayName = 'ClinicalSummaryModal';
