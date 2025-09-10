export function LoadingIndicator() {
  return (
    <div className="display-flex margin-top-1 margin-bottom-1 padding-y-3 padding-x-3 flex-align-center border-base-light border-left-2px">
      <div className="position-relative width-5 height-5">
        {/* Background circle */}
        <div className="position-absolute width-full height-full radius-pill top-0 left-0 border-2px border-base-lightest" />

        {/* Spinning progress circle - using CSS animation */}
        <div className="position-absolute width-full height-full top-0 left-0">
          <svg
            aria-hidden="true"
            className="width-full height-full animate-spin"
            viewBox="0 0 40 40"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Loading</title>
            <circle
              cx="20"
              cy="20"
              fill="none"
              r="18"
              stroke="#005EA2"
              strokeDasharray="56.5 56.5"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      <span className="margin-left-3 font-body-sm text-base-dark">
        Working on summary...
      </span>
    </div>
  );
}
