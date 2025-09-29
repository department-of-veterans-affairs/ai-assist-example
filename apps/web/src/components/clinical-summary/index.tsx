import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import AttachmentsIcon from '@/assets/icons/attachments.svg';
import { ClinicalSummaryModal } from './clinical-summary-modal';

export function SummarySection() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="w-full border-base-lighter border-b bg-white px-2">
      <div className="flex w-full items-center pb-3">
        <div className="flex flex-1 items-center gap-2">
          <img
            alt="Clinical Summary icon"
            className="h-4 w-4 flex-shrink-0"
            src={AttachmentsIcon}
          />
          <span className="pl-2 font-semibold ">Clinical Summary</span>
        </div>
        <button
          aria-label={expanded ? 'Collapse summary' : 'Expand summary'}
          className="ml-auto rounded-full p-1 text-base-dark transition hover:bg-base-lightest"
          onClick={() => setExpanded((prev) => !prev)}
          type="button"
        >
          {expanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="pr-2 pb-3 pl-4">
          <ClinicalSummaryModal />
        </div>
      )}
    </div>
  );
}
