import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn("card p-5", className)}
      aria-busy="true"
      aria-label="Carregant..."
    >
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 rounded-md animate-shimmer opacity-60" />
        <div className="h-5 w-14 rounded-full animate-shimmer opacity-60" />
      </div>
      <div className="mt-5 h-7 w-24 rounded-md animate-shimmer opacity-60" />
      <div className="mt-2 h-3 w-36 rounded-md animate-shimmer opacity-60" />
      <div className="mt-5 h-1.5 w-full rounded-full animate-shimmer opacity-60" />
    </div>
  );
}
