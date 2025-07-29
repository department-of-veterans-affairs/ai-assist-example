interface PatientItemProps {
  name: string;
  lastVisit: string;
}

export function PatientItem({ name, lastVisit }: PatientItemProps) {
  return (
    <div className="padding-y-1 padding-x-2 radius-md margin-bottom-1 cursor-pointer hover:bg-base-lighter">
      <p className="margin-0 font-body-sm font-bold text-base-dark">{name}</p>
      <p className="margin-0 font-body-xs text-base">{lastVisit}</p>
    </div>
  );
}
