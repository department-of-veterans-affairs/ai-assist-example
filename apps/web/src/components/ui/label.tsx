import type { LabelHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type LabelProps = Omit<LabelHTMLAttributes<HTMLLabelElement>, 'htmlFor'> & {
  htmlFor: string;
};

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, htmlFor, ...props }, ref) => (
    <label
      className={cn(
        'font-semibold text-base-darker text-xs uppercase tracking-wide',
        className
      )}
      htmlFor={htmlFor}
      ref={ref}
      {...props}
    >
      {children}
    </label>
  )
);
Label.displayName = 'Label';

export { Label };
