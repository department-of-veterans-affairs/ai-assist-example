export function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-md bg-base-lightest px-3 py-2 shadow-1">
        <span className="font-medium text-base-dark text-sm">Thinking...</span>
      </div>
    </div>
  );
}
