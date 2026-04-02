// © 2026 DoctoPal — All Rights Reserved
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center p-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-icon.svg" alt="DoctoPal" className="h-12 w-12 opacity-50" />
      <h1 className="text-5xl font-bold" style={{ color: "var(--brand, #059669)" }}>404</h1>
      <h2 className="text-xl font-semibold">This page took a different path.</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm text-white font-semibold transition-colors shadow-lg"
        style={{ backgroundColor: "var(--brand, #059669)" }}
      >
        Go Home
      </Link>
    </div>
  )
}
