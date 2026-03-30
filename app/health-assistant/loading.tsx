import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      {/* Message bubbles */}
      <div className="flex-1 overflow-hidden px-4 py-6 space-y-6">
        {/* Left bubble */}
        <div className="flex items-end gap-2 max-w-[70%]">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
        </div>

        {/* Right bubble */}
        <div className="flex items-end gap-2 max-w-[70%] ml-auto flex-row-reverse">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="space-y-1.5 items-end flex flex-col">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
        </div>

        {/* Left bubble (longer) */}
        <div className="flex items-end gap-2 max-w-[70%]">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
        </div>
      </div>
    </div>
  );
}
