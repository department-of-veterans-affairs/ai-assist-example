export function LoadingIndicator() {
  return (
    <div className="flex items-center border-base-light border-l-4 px-6 py-6 text-base-darker">
      <div className="relative h-10 w-10">
        {/* Background circle */}
        <div className="absolute inset-0 rounded-full border-2 border-base-lightest" />

        {/* Spinning progress circle - using CSS animation */}
        <div className="absolute inset-0">
          <svg
            aria-hidden="true"
            className="h-full w-full animate-spin"
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

      <span className="ml-6 font-medium text-base-dark text-sm">
        Working on summary...
      </span>
    </div>
  );
}
