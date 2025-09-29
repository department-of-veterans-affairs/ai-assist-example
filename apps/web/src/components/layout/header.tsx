import { UserAvatar } from '@/components/auth/user-avatar';
import { PatientContextHeader } from '@/components/patient/patient-context-header';

function VAHeader() {
  return (
    <header className="w-full bg-primary-darker px-4 py-2 text-white">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg uppercase tracking-wide">VA</span>
          <span className="px-2">|</span>
          <span className="font-light text-lg">AI assist</span>
        </div>
        <UserAvatar />
      </div>
    </header>
  );
}

export function Header() {
  return (
    <>
      <VAHeader />
      <PatientContextHeader />
    </>
  );
}
