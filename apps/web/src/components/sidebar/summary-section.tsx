import {
  Icon,
  type ModalRef,
} from '@department-of-veterans-affairs/clinical-design-system';
import { useRef, useState } from 'react';
import AttachmentsIcon from '@/assets/icons/attachments.svg';
import LaunchIcon from '@/assets/icons/launch.svg';
import { ClinicalSummaryModal } from '@/components/clinical-summary/modal';
import { usePatientStore } from '@/stores';

export function SummarySection() {
  const [expanded, setExpanded] = useState(true);
  const modalRef = useRef<ModalRef>(null);
  const patient = usePatientStore((state) => state.patient);

  const handleProcessHistory = async () => {
    // TODO: Implement API call to process patient history
    // This would typically fetch and process 6 months of patient data
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulated delay
    // biome-ignore lint/suspicious/noConsole: Development debugging
    console.log('Processing patient history for:', patient);
  };

  const openModal = () => {
    modalRef.current?.toggleModal(undefined, true);
  };

  return (
    <>
      <div className="padding-2 width-full border-base-lighter border-bottom ">
        <div className="padding-bottom-2 display-flex width-full flex-align-center">
          <div className="display-flex flex-1 flex-align-center gap-2">
            <img
              alt="Clinical Summary icon"
              className="width-4 height-4 flex-shrink-0"
              src={AttachmentsIcon}
            />
            <span className="padding-left-1 font-body-lg text-bold">
              Clinical Summary
            </span>
          </div>
          <Icon
            className="margin-left-auto cursor-pointer text-base-dark transition-transform"
            onClick={() => setExpanded(!expanded)}
            size={3}
            type={expanded ? 'ExpandLess' : 'ExpandMore'}
          />
        </div>

        {expanded && (
          <div className="padding-left-5 padding-right-2 padding-bottom-2">
            <button
              className="position-relative margin-bottom-1 padding-y-1 padding-x-2 display-flex radius-lg width-full flex-align-start cursor-pointer gap-2 border-1px border-primary bg-white text-left hover:bg-base-lightest"
              onClick={openModal}
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
          </div>
        )}
      </div>

      <ClinicalSummaryModal onProcess={handleProcessHistory} ref={modalRef} />
    </>
  );
}
