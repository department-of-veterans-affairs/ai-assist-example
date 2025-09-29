import FooterLogo from '../../assets/icons/va-footer-logo.svg';

export function Footer() {
  return (
    <footer className="w-full bg-primary-darker px-2 py-2 text-white">
      <div className="flex w-full items-center">
        <div className="flex items-center">
          <img
            alt="U.S. Department of Veterans Affairs"
            className="h-6"
            src={FooterLogo}
          />
        </div>
        <a
          className="ml-auto font-medium text-sm hover:underline"
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
