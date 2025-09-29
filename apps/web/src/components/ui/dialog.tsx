import {
  Close,
  Content,
  Description,
  Overlay,
  Portal,
  Root,
  Title,
  Trigger,
} from '@radix-ui/react-dialog';
import type {
  ComponentPropsWithoutRef,
  ElementRef,
  HTMLAttributes,
} from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Dialog = Root;

const DialogTrigger = Trigger;

const DialogPortal = Portal;

const DialogOverlay = forwardRef<
  ElementRef<typeof Overlay>,
  ComponentPropsWithoutRef<typeof Overlay>
>(({ className, ...props }, ref) => (
  <Overlay
    className={cn(
      'dialog-overlay data-[state=closed]:fade-out data-[state=open]:fade-in fixed inset-0 z-40 bg-base-darkest/40 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in',
      className
    )}
    ref={ref}
    {...props}
  />
));
DialogOverlay.displayName = Overlay.displayName;

const DialogContent = forwardRef<
  ElementRef<typeof Content>,
  ComponentPropsWithoutRef<typeof Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <Content
      className={cn(
        'dialog-content -translate-x-1/2 -translate-y-1/2 data-[state=open]:fade-in data-[state=open]:zoom-in data-[state=closed]:zoom-out fixed top-1/2 left-1/2 z-50 flex w-full max-w-3xl flex-col overflow-hidden rounded-lg border bg-white shadow-lg outline-none data-[state=closed]:animate-out data-[state=open]:animate-in',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </Content>
  </DialogPortal>
));
DialogContent.displayName = Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('border-b px-6 py-4 text-left', className)} {...props} />
);

const DialogTitle = forwardRef<
  ElementRef<typeof Title>,
  ComponentPropsWithoutRef<typeof Title>
>(({ className, ...props }, ref) => (
  <Title
    className={cn('font-semibold text-xl', className)}
    ref={ref}
    {...props}
  />
));
DialogTitle.displayName = Title.displayName;

const DialogDescription = forwardRef<
  ElementRef<typeof Description>,
  ComponentPropsWithoutRef<typeof Description>
>(({ className, ...props }, ref) => (
  <Description
    className={cn('text-base-dark', className)}
    ref={ref}
    {...props}
  />
));
DialogDescription.displayName = Description.displayName;

const DialogClose = Close;

const DialogFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4',
      className
    )}
    {...props}
  />
);

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
};
