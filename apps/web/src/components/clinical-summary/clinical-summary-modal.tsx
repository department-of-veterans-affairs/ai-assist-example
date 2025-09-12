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
import { usePatientStore } from '@/stores';

/**
 * Clinical Summary Modal with trigger button
 * Uses VACDS ref pattern - modal is always in DOM but hidden/shown via ref
 */
export function ClinicalSummaryModal() {
  const modalRef = useRef<ModalRef>(null);
  const [summaryContent, setSummaryContent] = useState<string>('');
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

      // Mock summary content
      const mockSummary = `Mr. Anderson's care over the past six months has focused on the initial diagnosis and management of Hypertension and Type 2 Diabetes. His visits were centered on establishing a medication regimen, monitoring key health metrics, and providing education on lifestyle modifications.

January: During his annual physical, Mr. Anderson's blood pressure was elevated at 155/92 mmHg, and routine blood work revealed a high A1c of 7.2%. Given these results, we initiated a new care plan. He was prescribed Lisinopril for his blood pressure and Metformin to manage his blood sugar. We also provided a referral to a VA nutritionist and an educational packet on managing newly diagnosed conditions. The importance of daily monitoring was stressed, and he was given a home blood pressure cuff.

February: A follow-up telehealth call was scheduled to check on his progress. Mr. Anderson reported some mild dizziness in the first week, which he said had since resolved. He confirmed he was taking his medications as prescribed and was beginning to track his blood pressure readings at home. We encouraged him to continue with the new habits and noted the need for consistency.

May: Mr. Anderson's follow-up lab results were reviewed during a visit. His A1c had improved to 6.7%, and his in-office blood pressure was 138/85 mmHg. We discussed the positive impact of his efforts and provided additional resources on exercise programs available through the VA. We also adjusted his Lisinopril dosage slightly to help him reach his target blood pressure goals.

June: The final visit of this period was a check-in to confirm Mr. Anderson's new medication dosage was not causing any side effects. He reported no issues and expressed confidence in his ability to manage his conditions. We reviewed his progress and scheduled his next full check-up for a quarter from now.

Mr. Anderson has demonstrated excellent adherence to his treatment plan, with significant progress in managing his newly diagnosed conditions.`;

      setSummaryContent(mockSummary);
      setHasLoaded(true);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Error logging
      console.error('Failed to fetch summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (summaryContent) {
      navigator.clipboard.writeText(summaryContent);
      // biome-ignore lint/suspicious/noConsole: User feedback
      console.log('Copied to clipboard');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFeedback = (isPositive: boolean) => {
    // biome-ignore lint/suspicious/noConsole: Placeholder for feedback
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
          Process the past 6 months of patient history + medical notes
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
            <h1
              className="margin-0 font-heading-xl"
              id="clinical-summary-heading"
            >
              Process the past 6 months of patient history + medical notes
            </h1>
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
              <div>
                <strong className="font-body-md">Patient History:</strong>{' '}
                <span className="font-body-md">March - May, 2025</span>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <div className="padding-3" id="clinical-summary-description">
              {isLoading && (
                <div className="padding-5 text-center">
                  <LoadingIndicator />
                </div>
              )}

              {!isLoading && summaryContent && (
                <div className="line-height-body-3 font-body-md text-base-darker">
                  {/* The summary content should go here */}
                  {summaryContent}
                </div>
              )}

              {!(isLoading || summaryContent || hasLoaded) && (
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
