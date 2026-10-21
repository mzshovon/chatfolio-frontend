export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border-subtle">
      <div className="mx-auto flex max-w-[1240px] flex-wrap gap-x-5 gap-y-2 px-4 py-4 text-[13px] text-text-muted sm:px-6">
        <span className="mr-auto">&copy; 2026 Chatfolio</span>
        <a href="https://chatfolio.net" className="transition-colors hover:text-accent">About</a>
        <a href="https://chatfolio.net/privacy" className="transition-colors hover:text-accent">Privacy</a>
        <a href="mailto:hello@chatfolio.net" className="transition-colors hover:text-accent">Feedback</a>
      </div>
    </footer>
  );
}
