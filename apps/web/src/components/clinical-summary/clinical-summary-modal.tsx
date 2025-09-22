import {
  Modal,
  ModalFooter,
  type ModalRef,
  ModalToggleButton,
} from '@department-of-veterans-affairs/clinical-design-system';
import { useRef, useState } from 'react';
import regenerateIcon from '@/assets/icons/autorenew.svg';
import copyIcon from '@/assets/icons/copy.svg';
import LaunchIcon from '@/assets/icons/launch.svg';
import printIcon from '@/assets/icons/print.svg';
import thumbsDownIcon from '@/assets/icons/thumbs-down.svg';
import thumbsUpIcon from '@/assets/icons/thumbs-up.svg';
import { useMedicationSummary } from '@/components/clinical-summary/use-medication-summary';
import { LoadingIndicator } from '@/components/loading-indicator';
import { usePatientStore } from '@/stores';
import type { MedicationSummary as MedicationSummaryType } from '@/types/medication-summary';
import { MedicationSummary } from './medication-summary';

type SummaryEnvelope = {
  summary: MedicationSummaryType;
  timestamp: Date;
};

type SummaryState = SummaryEnvelope | null;

const MODAL_ID = 'clinical-summary-modal';

export function ClinicalSummaryModal() {
  const modalRef = useRef<ModalRef>(null);
  const [amOpen, setAmOpen] = useState(false);
  const patient = usePatientStore((state) => state.patient);

  const {
    data,
    dataUpdatedAt,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useMedicationSummary({ patient, enabled: amOpen });

  const summary: SummaryState = data
    ? {
        summary: data,
        timestamp: dataUpdatedAt ? new Date(dataUpdatedAt) : new Date(),
      }
    : null;

  const handleCopy = () => {
    if (!summary?.summary) {
      return;
    }

    navigator.clipboard
      .writeText(JSON.stringify(summary.summary))
      .catch((copyError) =>
        console.error('Failed to copy summary:', copyError)
      );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFeedback = (isPositive: boolean) => {
    console.log(isPositive ? 'Positive feedback' : 'Negative feedback');
  };

  const handleModalOpen = () => {
    setAmOpen(true);
  };

  const regenerateReport = () => {
    refetch({ throwOnError: false }).catch((refetchError) => {
      console.error('Failed to regenerate summary:', refetchError);
    });
  };

  const loading = isLoading || isFetching;

  return (
    <>
      <button
        className="position-relative margin-bottom-1 padding-y-1 padding-x-2 display-flex radius-md width-full flex-align-center cursor-pointer gap-2 border-1px border-primary bg-white text-left hover:bg-base-lightest"
        onClick={() => {
          handleModalOpen();
          modalRef.current?.toggleModal?.(undefined, true);
        }}
        type="button"
      >
        <span className="line-height-3 flex-1 font-body-sm text-primary">
          Generate Patient Medication-Problem Summary
        </span>
        <img
          alt=""
          aria-hidden="true"
          className="width-3 height-3 flex-shrink-0"
          src={LaunchIcon}
        />
      </button>

      <style>{`
        #${MODAL_ID} .usa-modal__main {
          max-width: 70rem;
        }
      `}</style>

      <Modal
        aria-describedby="clinical-summary-description"
        aria-labelledby="clinical-summary-heading"
        id={MODAL_ID}
        isLarge
        ref={modalRef}
      >
        <div
          className="display-flex height-full maxh flex-column"
          style={{ maxHeight: '70vh' }}
        >
          <div className="padding-3 border-base-light border-bottom-1px">
            <h2
              className="margin-0 font-heading-xl"
              id="clinical-summary-heading"
            >
              Patient Medication Summary
            </h2>
            <div>Grouped by Problem with relevant Vitals and Labs</div>
          </div>

          {patient && (
            <div className="padding-3 border-base-light border-bottom-1px">
              <div className="margin-bottom-05">
                <strong className="font-body-md">Patient:</strong>{' '}
                <span className="font-body-md">
                  {patient.lastName?.toUpperCase()}, {patient.firstName} (ICN{' '}
                  {patient.icn}, DOB {patient.dob || 'Unknown'})
                </span>
              </div>
              <span className="text-bold">
                Generated:{' '}
                {summary?.timestamp ? summary.timestamp.toLocaleString() : ''}
              </span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <div className="padding-3" id="clinical-summary-description">
              {loading && (
                <div className="padding-5 text-center">
                  <LoadingIndicator />
                </div>
              )}

              {!loading && isError && (
                <div className="padding-5 text-center text-secondary-dark">
                  {error instanceof Error
                    ? error.message
                    : 'Failed to retrieve patient summary.'}
                </div>
              )}

              {!loading && summary?.summary && (
                <div className="line-height-body-3 font-body-md text-base-darker">
                  <MedicationSummary summary={summary.summary} />
                </div>
              )}

              {!(loading || isError || summary?.summary) && (
                <div className="padding-5 text-center text-base">
                  Click to load patient summary
                </div>
              )}
            </div>
          </div>

          <ModalFooter>
            <div className="width-full display-flex flex-align-center flex-justify-space-between">
              <div className="display-flex flex-align-center gap-2">
                <ModalToggleButton
                  className="usa-button"
                  closer
                  modalRef={modalRef}
                  onClick={() => setAmOpen(false)}
                >
                  Close
                </ModalToggleButton>

                <button
                  aria-label="Regenerate Report"
                  className="padding-05 cursor-pointer border-0 bg-transparent"
                  onClick={regenerateReport}
                  type="button"
                >
                  <img
                    alt=""
                    aria-hidden="true"
                    height="20"
                    src={regenerateIcon}
                    width="20"
                  />
                </button>

                <button
                  aria-label="Copy to clipboard"
                  className="padding-05 cursor-pointer border-0 bg-transparent"
                  disabled={!summary}
                  onClick={handleCopy}
                  type="button"
                >
                  <img
                    alt=""
                    aria-hidden="true"
                    height="20"
                    src={copyIcon}
                    width="20"
                  />
                </button>

                <button
                  aria-label="Print"
                  className="padding-05 cursor-pointer border-0 bg-transparent"
                  onClick={handlePrint}
                  type="button"
                >
                  <img
                    alt=""
                    aria-hidden="true"
                    height="20"
                    src={printIcon}
                    width="20"
                  />
                </button>

                <button
                  aria-label="Good response"
                  className="padding-05 cursor-pointer border-0 bg-transparent"
                  onClick={() => handleFeedback(true)}
                  type="button"
                >
                  <img
                    alt=""
                    aria-hidden="true"
                    height="20"
                    src={thumbsUpIcon}
                    width="20"
                  />
                </button>

                <button
                  aria-label="Bad response"
                  className="padding-05 cursor-pointer border-0 bg-transparent"
                  onClick={() => handleFeedback(false)}
                  type="button"
                >
                  <img
                    alt=""
                    aria-hidden="true"
                    height="20"
                    src={thumbsDownIcon}
                    width="20"
                  />
                </button>
              </div>

              <span className="font-body-xs text-base">
                AI-generated content may be incorrect
              </span>
            </div>
          </ModalFooter>
        </div>
      </Modal>
    </>
  );
}
