export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold tracking-wide text-text-secondary uppercase">
      {children}
    </div>
  );
}
