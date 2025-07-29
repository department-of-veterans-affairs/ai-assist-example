export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="padding-3 bg-base-darker text-white">
      <div className="max-width-desktop margin-x-auto display-flex flex-align-center flex-justify-between">
        <p className="margin-0 font-body-xs">
          © {currentYear} Department of Veterans Affairs
        </p>
        <p className="margin-0 font-body-xs">
          AI Assist v0.1.0 - Clinical Decision Support Tool
        </p>
      </div>
    </footer>
  );
}
