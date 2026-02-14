export default function LoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
        >
          <div className="flex flex-col gap-2">
            <div className="h-4 w-36 animate-pulse rounded bg-border" />
            <div className="flex items-center gap-2">
              <div className="h-5 w-20 animate-pulse rounded-full bg-border" />
              <div className="h-3 w-14 animate-pulse rounded bg-border" />
            </div>
          </div>
          <div className="flex gap-1">
            <div className="h-7 w-7 animate-pulse rounded-md bg-border" />
            <div className="h-7 w-7 animate-pulse rounded-md bg-border" />
          </div>
        </div>
      ))}
    </div>
  );
}
