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

        /* Print styles */
        @media print {
          /* Hide UI elements */
          .usa-modal__overlay,
          .usa-modal__close,
          .usa-modal__footer,
          header,
          footer,
          nav,
          aside,
          button {
            display: none !important;
          }

          /* Hide screen-only content */
          .screen-only {
            display: none !important;
          }

          /* Show print-only content */
          .print-only {
            display: block !important;
            margin-bottom: 20px !important;
          }

          .print-only h1 {
            font-size: 18pt !important;
            margin: 0 0 10px 0 !important;
            color: black !important;
          }

          .print-only hr {
            border: 1px solid #000 !important;
            margin: 20px 0 !important;
          }

          .print-only strong {
            font-weight: bold !important;
          }

          .print-only p {
            margin: 10px 0 !important;
          }

          /* Reset modal positioning for print */
          #${MODAL_ID} {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          #${MODAL_ID} .usa-modal__content {
            position: static !important;
            max-height: none !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }

          #${MODAL_ID} .usa-modal__main {
            max-width: 100% !important;
            padding: 0 !important;
          }

          /* Style the print content */
          #clinical-summary-print-content {
            padding: 20px !important;
            font-size: 12pt !important;
            color: black !important;
          }

          #clinical-summary-print-content h1 {
            font-size: 18pt !important;
            margin-bottom: 10px !important;
          }

          /* Ensure overflow content is visible */
          .overflow-y-auto {
            overflow: visible !important;
            max-height: none !important;
          }

          /* Page break control */
          .problem-group {
            page-break-inside: avoid;
          }
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
          <div className="padding-3 screen-only border-base-light border-bottom-1px">
            <h2
              className="margin-0 font-heading-xl"
              id="clinical-summary-heading"
            >
              Patient Medication Summary
            </h2>
            <div>Grouped by Problem with relevant Vitals and Labs</div>
          </div>

          {patient && (
            <div className="padding-3 screen-only border-base-light border-bottom-1px">
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
              {/* Wrapper for print content */}
              <div id="clinical-summary-print-content">
                {/* Print header - always visible during print if patient data exists */}
                {patient && (
                  <div className="print-only">
                    <h1>Patient Medication Summary</h1>
                    <div>Grouped by Problem with relevant Vitals and Labs</div>
                    <div className="margin-top-2">
                      <div>
                        <strong>Patient:</strong>{' '}
                        {patient.lastName?.toUpperCase()}, {patient.firstName}{' '}
                        (ICN {patient.icn}, DOB {patient.dob || 'Unknown'})
                      </div>
                      <div>
                        <strong>Generated:</strong>{' '}
                        {new Date().toLocaleString()}
                      </div>
                    </div>
                    <hr className="margin-y-3" />
                  </div>
                )}

                {loading && (
                  <div className="padding-5 screen-only text-center">
                    <LoadingIndicator />
                  </div>
                )}

                {!loading && isError && (
                  <div className="padding-5 text-center text-secondary-dark">
                    <div className="screen-only">
                      {error instanceof Error
                        ? error.message
                        : 'Failed to retrieve patient summary.'}
                    </div>
                    <div className="print-only">
                      <p>
                        <strong>Error:</strong> Unable to generate medication
                        summary at this time.
                      </p>
                      <p>
                        Please try again later or contact support if the issue
                        persists.
                      </p>
                    </div>
                  </div>
                )}

                {!loading && summary?.summary && (
                  <div className="line-height-body-3 font-body-md text-base-darker">
                    <MedicationSummary summary={summary.summary} />
                  </div>
                )}

                {!(loading || isError || summary?.summary) && (
                  <div className="padding-5 screen-only text-center text-base">
                    Click to load patient summary
                  </div>
                )}
              </div>
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
