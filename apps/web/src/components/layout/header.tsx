import { PatientContextHeader } from '@/components/patient/patient-context-header';

function VAHeader() {
  const userInitials = 'VU'; // TODO: Get from user store/context
  const userEmail = 'VA.NPUser1@example.com'; // TODO: Get from user store/context

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

        {/* User Avatar Circle */}
        <div className="display-flex height-full margin-left-auto flex-align-center">
          <button
            aria-label={`User menu for ${userEmail}`}
            className="width-5 height-5 minw-5 minh-5 radius-pill display-flex flex-align-center flex-justify-center cursor-pointer border-0 bg-white font-body-sm text-bold text-primary-darker hover:opacity-90"
            onClick={() => {
              // TODO: Implement user menu dropdown
            }}
            type="button"
          >
            {userInitials}
          </button>
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
