import { Button } from '@department-of-veterans-affairs/clinical-design-system';
import { ExampleCard } from './components/ui/example-card';

function App() {
  return (
    <div className="margin-4 padding-3 bg-white">
      <h1 className="margin-bottom-3 font-sans-3xl text-ink">AI Assist</h1>

      <div className="margin-bottom-4">
        <Button type="button">VACDS Button Component</Button>
      </div>

      <ExampleCard title="VACDS Integration Complete">
        <p className="margin-bottom-2">
          This demonstrates the proper VACDS integration:
        </p>
        <ul className="usa-list">
          <li className="margin-bottom-1">
            <strong>✅ VACDS React Components:</strong> Full component library
            with built-in styling
          </li>
          <li className="margin-bottom-1">
            <strong>✅ VACDS Utility Classes:</strong> Spacing, typography, and
            layout utilities
          </li>
          <li className="margin-bottom-1">
            <strong>✅ VACDS Color System:</strong> Using design system colors
            (bg-*, text-*, border-*)
          </li>
          <li>
            <strong>✅ CSS Modules:</strong> For custom component layouts
            combined with VACDS utilities
          </li>
        </ul>
      </ExampleCard>

      <ExampleCard title="Design System Benefits">
        <p className="text-base-dark">
          No arbitrary values - only VA-approved colors, spacing, and typography
          for consistent, accessible design.
        </p>
      </ExampleCard>
    </div>
  );
}

export default App;
