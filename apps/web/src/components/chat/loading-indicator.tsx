export function LoadingIndicator() {
  return (
    <div className="display-flex flex-justify-start">
      <div className="padding-3 radius-md max-width-tablet bg-base-lightest text-base-darkest">
        <div className="font-body-md">
          <span className="text-base">Thinking...</span>
        </div>
      </div>
    </div>
  );
}
