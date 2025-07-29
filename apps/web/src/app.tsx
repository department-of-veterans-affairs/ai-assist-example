import {
  Alert,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@department-of-veterans-affairs/clinical-design-system';

import { RootLayout } from '@/components/layout/root-layout';

function App() {
  return (
    <RootLayout>
      <div className="padding-4 max-width-desktop margin-x-auto">
        {/* Page Header */}
        <h1 className="margin-bottom-4 font-heading-1 text-primary-darker">
          AI Assist Dashboard
        </h1>

        {/* Alert Example */}
        <Alert className="margin-bottom-3" status="info">
          Welcome to the VA Clinical AI Assistant. Select a patient to begin.
        </Alert>

        {/* Card Example with Components */}
        <Card className="margin-bottom-3">
          <CardHeader>
            <h2 className="margin-0 font-heading-3">Recent Patients</h2>
          </CardHeader>
          <CardBody>
            <div className="padding-2 border-base-lighter border-bottom">
              <p className="margin-0 font-bold">John Doe</p>
              <p className="margin-0 font-body-xs text-base-dark">
                Last visit: 3 days ago
              </p>
            </div>
            <div className="padding-2">
              <p className="margin-0 font-bold">Jane Smith</p>
              <p className="margin-0 font-body-xs text-base-dark">
                Last visit: 1 week ago
              </p>
            </div>
          </CardBody>
          <CardFooter>
            <Button type="button">View All Patients</Button>
          </CardFooter>
        </Card>

        {/* Action Buttons */}
        <div className="display-flex flex-gap-2 flex-justify-end">
          <Button secondary type="button">
            Settings
          </Button>
          <Button type="button">New Session</Button>
        </div>
      </div>
    </RootLayout>
  );
}

export default App;
