import { Button } from '@department-of-veterans-affairs/clinical-design-system';

const summaryActions = [
  'Patient Overview',
  'Medical History',
  'Lab Results',
  'Medications',
  'Care Plan',
  'Export Report',
];

export function SummarySection() {
  return (
    <div className="padding-3">
      <h2 className="margin-0 margin-bottom-3 font-heading-sm text-base-darker">
        Summary
      </h2>
      <div className="display-flex flex-column">
        {summaryActions.map((action) => (
          <Button
            className="margin-bottom-1"
            key={action}
            size="compact"
            type="button"
          >
            {action}
          </Button>
        ))}
      </div>
    </div>
  );
}
