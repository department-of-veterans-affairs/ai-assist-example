import { Icon } from '@department-of-veterans-affairs/clinical-design-system';
import { useState } from 'react';
import AttachmentsIcon from '@/assets/icons/attachments.svg';
import LaunchIcon from '@/assets/icons/launch.svg';

export function SummarySection() {
  const [expanded, setExpanded] = useState(true);
  return (
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
          <div className="position-relative margin-bottom-1 padding-y-1 padding-x-2 display-flex radius-lg flex-align-start cursor-pointer gap-2 border-1px border-primary bg-white text-left hover:bg-base-lightest">
            <span className="line-height-3 flex-1 font-body-sm text-primary">
              Process the past 6 months of patient history + medical notes
            </span>
            <img
              alt="Launch"
              className="width-3 height-3 flex-shrink-0"
              src={LaunchIcon}
            />
          </div>
        </div>
      )}
    </div>
  );
}
