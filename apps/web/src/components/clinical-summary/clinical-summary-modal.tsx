import {
  Modal,
  ModalFooter,
  type ModalRef,
  ModalToggleButton,
} from '@department-of-veterans-affairs/clinical-design-system';
import { useRef, useState } from 'react';
import copyIcon from '@/assets/icons/copy.svg';
import LaunchIcon from '@/assets/icons/launch.svg';
import printIcon from '@/assets/icons/print.svg';
import thumbsDownIcon from '@/assets/icons/thumbs-down.svg';
import thumbsUpIcon from '@/assets/icons/thumbs-up.svg';
import { LoadingIndicator } from '@/components/loading-indicator';
import { fetchApi } from '@/lib/api';
import { usePatientStore } from '@/stores';
import type { MedicationSummary as MedicationSummaryType } from '@/types/medication-summary';
import { MedicationSummary } from './medication-summary';

type SummaryEnvelope = {
  summary: MedicationSummaryType;
  timestamp: Date;
};

/**
 * Clinical Summary Modal with trigger button
 * Uses VACDS ref pattern - modal is always in DOM but hidden/shown via ref
 */
export function ClinicalSummaryModal() {
  const modalRef = useRef<ModalRef>(null);
  const [summary, setSummary] = useState<SummaryEnvelope | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const patient = usePatientStore((state) => state.patient);

  // Fetch data when modal opens for the first time
  const loadSummary = async () => {
    if (!patient?.dfn || hasLoaded) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = await fetchApi('summary/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dfn: patient.dfn }),
      });

      setSummary({
        summary: JSON.parse(await response.text()),
        timestamp: new Date(),
      });
      setHasLoaded(true);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (summary?.summary) {
      // todo: grab rendered content
      navigator.clipboard.writeText(JSON.stringify(summary.summary));
      console.log('Copied to clipboard');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFeedback = (isPositive: boolean) => {
    console.log(isPositive ? 'Positive feedback' : 'Negative feedback');
  };

  // Load data when modal opens
  const handleModalOpen = () => {
    loadSummary();
  };

  return (
    <>
      {/* Trigger Button - styled as a custom button */}
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
          alt="Launch"
          className="width-3 height-3 flex-shrink-0"
          src={LaunchIcon}
        />
      </button>

      {/* FIXME: Need to fix this in VACDS Modal Style override for modal width */}
      <style>{`
        #clinical-summary-modal .usa-modal__main {
          max-width: 70rem;
        }
      `}</style>

      {/* Modal - always in DOM, controlled via ref */}
      <Modal
        aria-describedby="clinical-summary-description"
        aria-labelledby="clinical-summary-heading"
        id="clinical-summary-modal"
        isLarge
        ref={modalRef}
      >
        <div className="display-flex height-full flex-column">
          {/* Modal Header - larger font to match Figma */}
          <div className="padding-3 border-base-light border-bottom-1px">
            <h2
              className="margin-0 font-heading-xl"
              id="clinical-summary-heading"
            >
              Patient Medication Summary
            </h2>
            <div>Grouped by Problem with relevant Vitals and Labs</div>
          </div>

          {/* Patient Info Section - adjusted formatting */}
          {patient && (
            <div className="padding-3 border-base-light border-bottom-1px">
              <div className="margin-bottom-05">
                <strong className="font-body-md">Patient:</strong>{' '}
                <span className="font-body-md">
                  {patient.lastName?.toUpperCase()}, {patient.firstName} (DFN{' '}
                  {patient.dfn}, DOB {patient.dob || 'Unknown'})
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
              {isLoading && (
                <div className="padding-5 text-center">
                  <LoadingIndicator />
                </div>
              )}

              {!isLoading && summary?.summary && (
                <div className="line-height-body-3 font-body-md text-base-darker`">
                  <MedicationSummary summary={summary.summary} />
                </div>
              )}

              {!(isLoading || summary?.summary || hasLoaded) && (
                <div className="padding-5 text-center text-base">
                  Click to load patient summary
                </div>
              )}
            </div>
          </div>

          {/* Footer with Actions */}
          <ModalFooter>
            <div className="width-full display-flex flex-align-center flex-justify-space-between">
              <div className="display-flex flex-align-center gap-2">
                {/* Close Button using ModalToggleButton */}
                <ModalToggleButton
                  className="usa-button"
                  closer
                  modalRef={modalRef}
                >
                  Close
                </ModalToggleButton>

                {/* Action Icons */}
                <button
                  aria-label="Copy to clipboard"
                  className="padding-05 cursor-pointer border-0 bg-transparent"
                  onClick={handleCopy}
                  type="button"
                >
                  <img alt="" height="20" src={copyIcon} width="20" />
                </button>

                <button
                  aria-label="Print"
                  className="padding-05 cursor-pointer border-0 bg-transparent"
                  onClick={handlePrint}
                  type="button"
                >
                  <img alt="" height="20" src={printIcon} width="20" />
                </button>

                <button
                  aria-label="Good response"
                  className="padding-05 cursor-pointer border-0 bg-transparent"
                  onClick={() => handleFeedback(true)}
                  type="button"
                >
                  <img alt="" height="20" src={thumbsUpIcon} width="20" />
                </button>

                <button
                  aria-label="Bad response"
                  className="padding-05 cursor-pointer border-0 bg-transparent"
                  onClick={() => handleFeedback(false)}
                  type="button"
                >
                  <img alt="" height="20" src={thumbsDownIcon} width="20" />
                </button>
              </div>

              {/* Disclaimer */}
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
