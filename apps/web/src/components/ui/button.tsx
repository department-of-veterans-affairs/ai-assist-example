import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white hover:bg-primary-dark active:bg-primary-darker',
        outline:
          'border border-primary bg-white text-primary hover:bg-primary-lightest active:bg-primary-lighter',
        ghost: 'text-base-dark hover:bg-base-lightest active:bg-base-lighter',
        link: 'text-primary underline-offset-4 hover:underline',
        secondary:
          'border border-base-light bg-white text-base-darker hover:bg-base-lightest active:bg-base-lighter',
      },
      size: {
        default: 'h-10 px-4 text-base' /* 40px height */,
        sm: 'h-8 px-3 text-sm' /* 32px height */,
        lg: 'h-11 px-6 text-lg' /* 44px height */,
        icon: 'size-10 p-2' /* 40px square, 8px padding */,
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
