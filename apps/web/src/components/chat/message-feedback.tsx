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
    <div className={cn('flex items-center justify-start pt-4', className)}>
      <Button
        aria-label="Copy message"
        className="text-primary hover:text-primary-dark"
        onClick={handleCopy}
        size="icon"
        variant="ghost"
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
}
