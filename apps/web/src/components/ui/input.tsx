import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', leadingIcon, ...props }, ref) => {
    return (
      <div className={cn('relative flex items-center', leadingIcon && 'gap-2')}>
        {leadingIcon ? (
          <span className="pointer-events-none pl-3">{leadingIcon}</span>
        ) : null}
        <input
          className={cn(
            'flex h-10 w-full rounded border bg-white px-3 py-2 shadow-sm transition placeholder:text-base-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50',
            leadingIcon && 'pl-10',
            className
          )}
          ref={ref}
          type={type}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
