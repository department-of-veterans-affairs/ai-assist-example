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
  onThumbsUp,
  onThumbsDown,
}: MessageFeedbackProps) {
  const handleCopy = () => {
    onCopy?.();
  };

  const handleThumbsUp = () => {
    onThumbsUp?.();
  };

  const handleThumbsDown = () => {
    onThumbsDown?.();
  };

  return (
    <div
      className={clsx(
        'display-flex padding-top-2 flex-align-center flex-justify-end',
        className
      )}
    >
      <Button
        aria-label="Copy message"
        className="padding-1 text-base-dark"
        onClick={handleCopy}
        unstyled
      >
        <Icon size={3} type="ContentCopy" />
      </Button>
      <span className="margin-x-3 font-body-sm text-base">
        Is this answer helpful?
      </span>
      <Button
        aria-label="This answer is helpful"
        className="padding-1 text-base-dark"
        onClick={handleThumbsUp}
        unstyled
      >
        <Icon size={3} type="ThumbUpAlt" />
      </Button>
      <Button
        aria-label="This answer is not helpful"
        className="padding-1 margin-left-2 text-base-dark"
        onClick={handleThumbsDown}
        unstyled
      >
        <Icon size={3} type="ThumbDownAlt" />
      </Button>
    </div>
  );
}
