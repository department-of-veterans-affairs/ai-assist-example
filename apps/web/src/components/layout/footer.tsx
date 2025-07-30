export function Footer() {
  return (
    <footer className="padding-3 bg-primary-darker">
      <div className="max-width-desktop margin-x-auto">
        {/* biome-ignore lint/performance/noImgElement: Vite project, not Next.js */}
        <img
          alt="U.S. Department of Veterans Affairs"
          className="height-6"
          src="/images/va-footer-logo.svg"
        />
      </div>
    </footer>
  );
}
