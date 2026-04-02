// © 2026 Doctopal — All Rights Reserved
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center p-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-icon.svg" alt="Doctopal" className="h-14 w-14 rounded-xl opacity-50" />
      <h1 className="text-5xl font-bold text-primary">404</h1>
      <h2 className="text-xl font-semibold">
        Oops, this page took a different path
      </h2>
      <p className="text-sm text-muted-foreground max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
      >
        Go Home
      </Link>
    </div>
  )
}
