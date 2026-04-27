const Skeleton = ({ className }) => {
  return (
    <div className={`bg-slate-200 animate-pulse rounded-2xl ${className}`}></div>
  )
}

export const VoucherSkeleton = () => {
  return (
    <div className="bg-white rounded-[40px] p-8 border-2 border-slate-50 flex flex-col min-h-[450px]">
      <div className="mb-8">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="mt-auto border-t-2 border-slate-50 pt-8 mb-8">
        <Skeleton className="h-12 w-2/3" />
      </div>
      <Skeleton className="h-16 w-full rounded-3xl" />
    </div>
  )
}

export const StatSkeleton = () => {
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
      <div className="flex justify-between items-start mb-8">
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-10 w-3/4 mb-4" />
      <Skeleton className="h-6 w-1/3 rounded-lg" />
    </div>
  )
}

export default Skeleton
