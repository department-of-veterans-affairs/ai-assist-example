import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    <div className={cn('flex items-center justify-start pt-2', className)}>
      <Button
        aria-label="Copy message"
        onClick={handleCopy}
        size="icon"
        variant="ghost"
      >
        <Copy className="size-4" />
      </Button>
    </div>
  );
}
