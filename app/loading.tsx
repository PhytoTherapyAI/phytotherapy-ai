// © 2026 DoctoPal — All Rights Reserved
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-icon.svg"
        alt="DoctoPal"
        className="h-12 w-12 animate-pulse"
      />
      <p className="text-xs text-muted-foreground">Loading your health companion...</p>
      <div className="h-1 w-24 rounded-full bg-muted overflow-hidden">
        <div className="h-full w-1/2 rounded-full bg-primary"
          style={{ animation: "shimmer 1.5s ease-in-out infinite" }}
        />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  )
}
