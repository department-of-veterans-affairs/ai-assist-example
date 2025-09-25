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

      <span className="padding-1 radius-md display-flex bg-primary-lighter">
        <Button
          aria-label="This answer is helpful"
          className="padding-2 text-base-dark"
          onClick={handleThumbsUp}
          unstyled
        >
          <span className="margin-x-1">
            <Icon size={3} type="ThumbUpAlt" />
          </span>
        </Button>
        <Button
          aria-label="This answer is not helpful"
          className="padding-2 margin-left-2 text-base-dark"
          onClick={handleThumbsDown}
          unstyled
        >
          <span className="margin-x-1">
            <Icon size={3} type="ThumbDownAlt" />
          </span>
        </Button>
      </span>
    </div>
  );
}
