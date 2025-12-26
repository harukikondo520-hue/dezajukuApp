interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded ${className}`}
      style={{
        animation: 'shimmer 2s ease-in-out infinite',
        backgroundSize: '200% 100%',
      }}
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="w-56 flex-shrink-0 bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
      <div className="pr-12 mb-2">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-6 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="w-full h-8 rounded-full" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="relative bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200/50">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-6 w-28" />
    </div>
  );
}

export function LargeStatCardSkeleton() {
  return (
    <div className="relative bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-6 mb-4 border border-slate-200/50">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-10 w-40 mb-2" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-3xl pt-4 pb-6 px-6 mb-6 border border-slate-100 shadow-sm">
      <div className="relative">
        <div className="h-56 sm:h-64 flex items-end justify-around gap-4 px-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <Skeleton
                className="w-full rounded-t-lg"
                style={{ height: `${Math.random() * 100 + 50}px` }}
              />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>
      <LargeStatCardSkeleton />
      <div className="grid grid-cols-2 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg">
      <div className="flex flex-col items-center">
        <Skeleton className="w-32 h-32 rounded-3xl mb-6" />
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32 mb-6" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ConversationListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-3 rounded-lg bg-slate-800">
          <div className="flex items-start gap-2">
            <Skeleton className="w-4 h-4 mt-0.5 bg-slate-700" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-1 bg-slate-700" />
              <Skeleton className="h-3 w-16 bg-slate-700" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className={`flex items-start gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
          <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
          <Skeleton 
            className={`h-16 rounded-2xl ${i % 2 === 0 ? 'rounded-tr-none' : 'rounded-tl-none'}`} 
            style={{ maxWidth: '75%' }}
          />
        </div>
      ))}
    </div>
  );
}

