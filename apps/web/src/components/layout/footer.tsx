export function Footer() {
  return (
    <footer className="padding-3 width-full bg-primary-darker">
      <div className="display-flex width-full flex-align-center">
        <div className="display-flex flex-align-center">
          <img
            alt="U.S. Department of Veterans Affairs"
            className="height-6"
            src="/images/va-footer-logo.svg"
          />
        </div>
        <a
          className="margin-left-auto font-body-sm text-decoration-none text-white hover:text-underline"
          href="https://dvagov.sharepoint.com/sites/oitchiefaiofficerteam/SitePages/AI-Policy.aspx"
          rel="noopener noreferrer"
          target="_blank"
        >
          VA AI policy
        </a>
      </div>
    </footer>
  );
}
