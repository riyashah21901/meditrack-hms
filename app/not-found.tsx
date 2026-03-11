export default function NotFound() {
  return (
    <html>
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
          <h1 className="mb-2 text-4xl font-bold">Page not found</h1>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </main>
      </body>
    </html>
  );
}
