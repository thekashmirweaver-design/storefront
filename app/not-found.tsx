import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl text-gold">404</h1>
        <h2 className="mt-4 text-xl text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for has been moved or no longer exists.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-gold/60 px-6 py-3 text-xs tracking-[0.25em] uppercase text-gold hover:bg-gold hover:text-primary-foreground transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
