import {
  Button,
  Icon,
} from '@department-of-veterans-affairs/clinical-design-system';
import clsx from 'clsx';

interface MessageFeedbackProps {
  messageId: string;
  className?: string;
  onCopy?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
}

export function MessageFeedback({
  messageId: _messageId,
  className,
  onCopy,
}: MessageFeedbackProps) {
  const handleCopy = () => {
    onCopy?.();
  };

  return (
    <div
      className={clsx(
        'display-flex padding-top-2 flex-align-center flex-justify-start',
        className
      )}
    >
      <span className="margin-right-1">
        <Button
          aria-label="Copy message"
          className="padding-1 text-base-dark"
          onClick={handleCopy}
          unstyled
        >
          <span className="padding-1 radius-md bg-primary-lighter">
            <Icon size={3} type="ContentCopy" />
          </span>
        </Button>
      </span>
    </div>
  );
}
