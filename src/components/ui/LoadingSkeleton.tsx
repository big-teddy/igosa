import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

/**
 * Base Skeleton Component
 * Shimmer animation for loading states
 */
export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-muted/50",
                className
            )}
            aria-busy="true"
            aria-live="polite"
        />
    );
}

/**
 * Product Card Skeleton
 */
export function ProductCardSkeleton() {
    return (
        <div className="flex flex-col space-y-3 p-4 border rounded-lg">
            <Skeleton className="h-48 w-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/4 mt-2" />
            </div>
        </div>
    );
}

/**
 * Chat Message Skeleton
 */
export function ChatMessageSkeleton() {
    return (
        <div className="flex gap-3 p-4">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
            </div>
        </div>
    );
}

/**
 * List Item Skeleton
 */
export function ListItemSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
        </div>
    );
}

/**
 * Profile Skeleton
 */
export function ProfileSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
            </div>
        </div>
    );
}

/**
 * Grid of Product Cards Skeleton
 */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}
