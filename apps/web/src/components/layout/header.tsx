import { UserAvatar } from '@/components/auth/user-avatar';
import { PatientContextHeader } from '@/components/patient/patient-context-header';

function VAHeader() {
  return (
    <header className="w-full bg-primary-darker px-4 py-2">
      <div className="flex w-full items-center justify-between">
        {/* App Title */}
        <div className="flex items-center gap-2 text-white">
          <span className="font-semibold text-lg uppercase tracking-wide">
            VA
          </span>
          <span className="px-2 text-lg">|</span>
          <span className="font-light text-lg">AI assist</span>
        </div>

        {/* User Avatar */}
        <div className="flex items-center">
          <UserAvatar />
        </div>
      </div>
    </header>
  );
}

// PatientContextHeader moved to @/components/patient/header

export function Header() {
  return (
    <>
      <VAHeader />
      <PatientContextHeader />
    </>
  );
}
