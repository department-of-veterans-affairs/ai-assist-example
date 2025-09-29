import type {
  LabVital,
  Medication,
  MedicationSummary as MedicationSummaryType,
  ProblemGroup,
} from '@/types/medication-summary';

interface AssessmentProps {
  reasoning: string;
  match: string;
}

function Assessment({ reasoning, match }: AssessmentProps) {
  return (
    <div className="mt-4 text-base text-base-darker">
      <div>
        <div className="font-semibold">Problem list match: {match}</div>
        {reasoning && (
          <div className="mt-1 ml-4 space-y-1 text-sm">
            <div className="font-semibold">Reasoning:</div>
            <div className="ml-2 text-base">{reasoning}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function med_detail_row(med: Medication) {
  const details = [
    ...(med.provider_name ? [`Provider: ${med.provider_name}`] : []),
    ...(med.ordered_date
      ? [`Ordered: ${new Date(med.ordered_date).toLocaleDateString()}`]
      : []),
    ...(med.last_filled
      ? [`Last Filled: ${new Date(med.last_filled).toLocaleDateString()}`]
      : []),
    ...(med.fills_remaining ? [`Fills Remaining: ${med.fills_remaining}`] : []),
  ];
  return details.length > 0 ? details.join('; ') : null;
}

function RegimenSection({ medications }: { medications: Medication[] }) {
  const medRows = medications.map((med) => {
    const medDetail = med_detail_row(med);
    return (
      <div className="ml-6 text-base" key={med.name}>
        {med.name || 'None'} {med.status && `(${med.status}) `}|{' '}
        {med.dose || 'None'} | {med.route || 'None'} | {med.sig || 'None'}
        {medDetail && <div className="ml-4 text-base text-sm">{medDetail}</div>}
      </div>
    );
  });
  return (
    <div>
      <div className="mt-4 font-semibold text-base text-base-darker">
        Regimen:
      </div>
      {medRows}
    </div>
  );
}

function VitalsLabsSection({
  vitals,
  labs,
}: {
  vitals: LabVital[];
  labs: LabVital[];
}) {
  return (
    <div>
      <div className="mt-4 font-semibold text-base text-base-darker">
        Relevant Labs and Vitals:
      </div>
      <div className="ml-6 space-y-3 text-base text-base-darker">
        {vitals.length > 0 || labs.length > 0 ? (
          <div>
            {[...labs, ...vitals].map((lab_or_vital) => (
              <div key={lab_or_vital.name}>
                {lab_or_vital.values.map((value, index) => (
                  <div
                    key={`${lab_or_vital.name}_${value.date}_${index}`}
                  >{`${lab_or_vital.name.toLocaleUpperCase()}: ${value.value} (${new Date(value.date).toLocaleDateString()})`}</div>
                ))}
                <div className="mb-2">
                  {lab_or_vital.values.length > 1 && (
                    <div className="ml-4 text-base text-sm">
                      {`Trend: ${lab_or_vital.trend}`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>None Identified</div>
        )}
      </div>
    </div>
  );
}

interface ProblemProps {
  group: ProblemGroup;
  index: number;
}

export function Problem({ index, group }: ProblemProps) {
  const divider = '='.repeat(
    group.treatment_indication.length + `${index}.  `.length + 2
  );
  return (
    <>
      <div>
        {divider}
        <div key={group.group_number}>
          {index}. {group.treatment_indication}
        </div>
        {divider}
      </div>
      {group.medications.length > 0 && (
        <RegimenSection medications={group.medications} />
      )}
      <VitalsLabsSection
        labs={group.relevant_labs}
        vitals={group.relevant_vitals}
      />
      <Assessment
        match={group.problem_list_match_type}
        reasoning={group.reasoning}
      />
    </>
  );
}

interface MedicationSummaryProps {
  summary: MedicationSummaryType;
}

export function MedicationSummary({
  summary: { groups },
}: MedicationSummaryProps) {
  return (
    <div>
      {groups.map((group) => (
        <div className="problem-group mb-6" key={group.group_number}>
          <Problem group={group} index={group.group_number} />
        </div>
      ))}
    </div>
  );
}
