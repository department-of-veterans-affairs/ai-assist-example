import {
  Copy,
  Loader2,
  Printer,
  RefreshCw,
  SquareArrowOutUpRight,
} from 'lucide-react';
import type { RefObject } from 'react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useMedicationSummary } from '@/components/clinical-summary/use-medication-summary';
import { LoadingIndicator } from '@/components/loading-indicator';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { usePatientStore } from '@/stores';
import type { Patient } from '@/stores/patient-store';
import type { MedicationSummary as MedicationSummaryType } from '@/types/medication-summary';
import { MedicationSummary } from './medication-summary';

type SummaryEnvelope = {
  summary: MedicationSummaryType;
  timestamp: Date;
};

type SummaryState = SummaryEnvelope | null;

function SummaryPatientHeader({
  patient,
  summary,
}: {
  patient: Patient | null;
  summary: SummaryState;
}) {
  if (!patient) {
    return null;
  }

  return (
    <div className="border-base-light border-b px-6 py-6 text-base-dark text-sm print:hidden">
      <div className="mb-1 font-semibold text-base-dark text-xs uppercase tracking-wide">
        Patient
      </div>
      <div className="font-semibold text-base text-base-darker">
        <span className="font-normal">
          {patient.lastName?.toUpperCase()}, {patient.firstName} (ICN{' '}
          {patient.icn}, DOB {patient.dob || 'Unknown'})
        </span>
      </div>
      <div className="mt-2 text-base text-xs">
        <span className="font-semibold text-base-dark uppercase tracking-wide">
          Generated:
        </span>{' '}
        <span>
          {summary?.timestamp ? summary.timestamp.toLocaleString() : ''}
        </span>
      </div>
    </div>
  );
}

interface SummaryContentProps {
  loading: boolean;
  isError: boolean;
  error: Error | null | undefined;
  summary: SummaryState;
  patient: Patient | null;
  contentRef: RefObject<HTMLDivElement | null>;
}

function SummaryContent({
  loading,
  isError,
  error,
  summary,
  patient,
  contentRef,
}: SummaryContentProps) {
  if (loading) {
    return (
      <div className="screen-only py-10 text-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-10 text-center text-base-darker">
        <div className="screen-only">
          {error instanceof Error
            ? error.message
            : 'Failed to retrieve patient summary.'}
        </div>
        <div className="print-only">
          <p>
            <strong>Error:</strong> Unable to generate medication summary at
            this time.
          </p>
          <p>Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  if (!summary?.summary) {
    return (
      <div className="screen-only py-10 text-center text-base">
        Click to load patient summary
      </div>
    );
  }

  return (
    <div id="clinical-summary-print-content" ref={contentRef}>
      {patient && (
        <div className="print-only mb-6">
          <h1 className="mb-2 font-semibold text-2xl text-base-darker">
            Patient Medication Summary
          </h1>
          <div className="text-base">
            Grouped by problem with relevant vitals and labs
          </div>
          <div className="mt-4 space-y-2 text-base">
            <div>
              <strong>Patient:</strong> {patient.lastName?.toUpperCase()},{' '}
              {patient.firstName} (ICN {patient.icn}, DOB{' '}
              {patient.dob || 'Unknown'})
            </div>
            <div>
              <strong>Generated:</strong> {new Date().toLocaleString()}
            </div>
          </div>
          <hr className="my-6" />
        </div>
      )}

      <div className="text-base text-base-darker leading-relaxed">
        <MedicationSummary summary={summary.summary} />
      </div>
    </div>
  );
}

export function ClinicalSummaryModal() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [amOpen, setAmOpen] = useState(false);
  const patient = usePatientStore((state) => state.patient);

  const {
    data,
    dataUpdatedAt,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useMedicationSummary({ patient, enabled: amOpen });

  const summary: SummaryState = data
    ? {
        summary: data,
        timestamp: dataUpdatedAt ? new Date(dataUpdatedAt) : new Date(),
      }
    : null;

  const handleCopy = () => {
    if (!summary?.summary) {
      return;
    }

    navigator.clipboard
      .writeText(JSON.stringify(summary.summary))
      .catch((copyError) =>
        console.error('Failed to copy summary:', copyError)
      );
  };

  const handlePrint = useReactToPrint({
    contentRef,
  });

  const regenerateReport = () => {
    refetch({ throwOnError: false }).catch((refetchError) => {
      console.error('Failed to regenerate summary:', refetchError);
    });
  };

  const loading = isLoading || isFetching;

  return (
    <Dialog onOpenChange={setAmOpen} open={amOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" size="sm" variant="outline">
          <span className="flex-1">
            Generate Patient Medication-Problem Summary
          </span>
          <SquareArrowOutUpRight
            aria-hidden="true"
            className="h-2 w-2 flex-shrink-0"
          />
        </Button>
      </DialogTrigger>

      <style>{`
        @media print {
          .dialog-overlay,
          .dialog-close,
          .dialog-footer,
          header,
          footer,
          nav,
          aside,
          button:not(.print-allowed) {
            display: none !important;
          }

          .dialog-content {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }

          #clinical-summary-print-content {
            padding: 20px !important;
            font-size: 12pt !important;
            color: black !important;
          }

          #clinical-summary-print-content h1 {
            font-size: 18pt !important;
            margin-bottom: 10px !important;
          }

          .overflow-y-auto {
            overflow: visible !important;
            max-height: none !important;
          }

          .problem-group {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <DialogContent className="dialog-content flex h-[70vh] max-w-5xl flex-col overflow-hidden rounded-lg border border-base-light bg-white shadow-3">
        <DialogHeader className="border-base-light border-b px-6 py-6">
          <DialogTitle className="font-semibold text-base-darker text-xl">
            Patient Medication Summary
          </DialogTitle>
          <DialogDescription className="text-base text-base">
            Grouped by problem with relevant vitals and labs.
          </DialogDescription>
        </DialogHeader>

        <SummaryPatientHeader patient={patient} summary={summary} />

        <div
          className="flex-1 overflow-y-auto px-6 py-4"
          id="clinical-summary-description"
        >
          <SummaryContent
            contentRef={contentRef}
            error={error}
            isError={isError}
            loading={loading}
            patient={patient}
            summary={summary}
          />
        </div>

        <DialogFooter className="dialog-footer border-base-light border-t bg-base-lightest/40 px-6 py-4">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <DialogClose asChild>
                <Button onClick={() => setAmOpen(false)} size="sm">
                  Close
                </Button>
              </DialogClose>

              <Button
                aria-label="Regenerate report"
                className="h-9 w-9 rounded-md text-base-dark hover:bg-primary-lighter hover:text-primary"
                onClick={regenerateReport}
                size="icon"
                type="button"
                variant="ghost"
              >
                <RefreshCw aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">Regenerate</span>
              </Button>

              <Button
                aria-label="Copy summary"
                className="h-9 w-9 rounded-md text-base-dark hover:bg-primary-lighter hover:text-primary"
                disabled={!summary}
                onClick={handleCopy}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Copy aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">Copy summary</span>
              </Button>

              <Button
                aria-label="Print summary"
                className="print-allowed h-9 w-9 rounded-md text-base-dark hover:bg-primary-lighter hover:text-primary"
                onClick={handlePrint}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Printer aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">Print summary</span>
              </Button>

              {loading && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
            </div>

            <span className="text-base text-xs uppercase tracking-wide">
              AI-generated content may be incorrect
            </span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
