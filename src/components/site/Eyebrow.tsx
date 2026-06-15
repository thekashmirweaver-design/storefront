export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="eyebrow">{children}</span>
      <span className="h-px w-12 bg-gold/50" />
    </div>
  );
}

export function DiamondDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="h-px w-16 bg-gold/40" />
      <svg width="10" height="10" viewBox="0 0 10 10" className="text-gold">
        <path d="M5 0L10 5L5 10L0 5Z" fill="currentColor" />
      </svg>
      <span className="h-px w-16 bg-gold/40" />
    </div>
  );
}
