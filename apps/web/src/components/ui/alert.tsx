import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'error' | 'success' | 'warning';
  slim?: boolean;
}

const VARIANT_STYLES: Record<NonNullable<AlertProps['variant']>, string> = {
  info: 'border-l-info bg-info-lighter text-info-dark',
  error: 'border-l-error bg-error-lighter text-error-dark',
  success: 'border-l-success bg-success-lighter text-success-dark',
  warning: 'border-l-warning bg-warning-lighter text-warning-dark',
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', slim = false, children, ...props }, ref) => {
    return (
      <div
        aria-live="polite"
        className={cn(
          'rounded border-l-4 px-4',
          slim ? 'py-2' : 'py-3',
          VARIANT_STYLES[variant],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Alert.displayName = 'Alert';
