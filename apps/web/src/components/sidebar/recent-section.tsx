import { PatientItem } from './patient-item';

// Mock data - in a real app, this would come from props or a data store
const recentPatients = [
  { id: 1, name: 'John Doe', lastVisit: 'Last visit: 3 days ago' },
  { id: 2, name: 'Jane Smith', lastVisit: 'Last visit: 1 week ago' },
  { id: 3, name: 'Robert Johnson', lastVisit: 'Last visit: 2 weeks ago' },
];

export function RecentSection() {
  return (
    <div className="padding-3 border-base-lighter border-bottom">
      <h2 className="margin-0 margin-bottom-2 font-heading-sm text-base-darker">
        Recent
      </h2>
      <div className="margin-bottom-2">
        {recentPatients.map((patient) => (
          <PatientItem
            key={patient.id}
            lastVisit={patient.lastVisit}
            name={patient.name}
          />
        ))}
      </div>
    </div>
  );
}
