import { UserAvatar } from '@/components/auth/user-avatar';
import { PatientContextHeader } from '@/components/patient/patient-context-header';

function VAHeader() {
  return (
    <header className="padding-x-2 padding-y-1 width-full display-block bg-primary-darker">
      <div className="display-flex width-full minw-5 flex-align-center flex-justify-space-between">
        {/* App Title */}
        <div className="display-flex height-full flex-align-center">
          <span className="margin-0 display-flex flex-align-center font-body-lg text-semibold text-white">
            VA
          </span>
          <span className="margin-0 padding-left-1 padding-right-1 display-flex flex-align-center font-body-lg text-white">
            |
          </span>
          <span className="margin-0 display-flex flex-align-center font-body-lg text-light text-white">
            AI assist
          </span>
        </div>

        {/* User Avatar */}
        <div className="display-flex height-full margin-left-auto flex-align-center">
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
