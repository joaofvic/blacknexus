import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton h-4 w-full", className)} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return <Skeleton className={cn("h-24 w-full rounded-xl", className)} />;
}
