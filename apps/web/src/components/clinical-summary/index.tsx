import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import AttachmentsIcon from '@/assets/icons/attachments.svg';
import { ClinicalSummaryModal } from './clinical-summary-modal';

export function SummarySection() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="w-full border-b bg-white px-4 py-3">
      <div className="flex w-full items-center">
        <div className="flex flex-1 items-center gap-2">
          <img
            alt="Clinical Summary icon"
            className="size-4 flex-shrink-0"
            src={AttachmentsIcon}
          />
          <span className="font-semibold">Clinical Summary</span>
        </div>
        <button
          aria-label={expanded ? 'Collapse summary' : 'Expand summary'}
          className="ml-auto rounded-full p-1 transition hover:bg-base-lightest"
          onClick={() => setExpanded((prev) => !prev)}
          type="button"
        >
          {expanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="mt-3">
          <ClinicalSummaryModal />
        </div>
      )}
    </div>
  );
}
