import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

export { Skeleton }

export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

export function PropertyDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-1/2" />
      <div className="flex gap-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="aspect-video rounded-lg" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function ChatConversationSkeleton() {
  return (
    <div className="flex flex-col h-screen">
      <div className="bg-black p-4 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
          >
            <Skeleton className={cn("h-16", i % 2 === 0 ? "w-48" : "w-32")} />
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function ChatListSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-24">
      <Skeleton className="h-8 w-32 mb-6" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-12" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function PropertyListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function TourListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Skeleton className="h-16 w-20 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <div className="flex gap-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function PaymentListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
