"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="max-w-md text-center">
            <h1 className="text-xl text-foreground">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You can try refreshing or head back home.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => reset()}
                className="border border-gold/60 px-6 py-3 text-xs tracking-[0.25em] uppercase text-gold hover:bg-gold hover:text-primary-foreground transition-colors"
              >
                Try again
              </button>
              <a
                href="/"
                className="border border-border px-6 py-3 text-xs tracking-[0.25em] uppercase text-foreground hover:border-gold transition-colors"
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
