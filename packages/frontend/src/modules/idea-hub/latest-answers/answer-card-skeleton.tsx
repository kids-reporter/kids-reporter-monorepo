function AnswerCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-[52px] shrink-0 animate-pulse rounded-full bg-neutral-200" />
          <div className="flex flex-col gap-1">
            <div className="h-5 w-20 animate-pulse rounded bg-neutral-200" />
            <div className="h-4 w-14 animate-pulse rounded bg-neutral-200" />
          </div>
        </div>
        <div className="flex w-14 items-center gap-1">
          <div className="size-6 animate-pulse rounded bg-neutral-200" />
          <div className="h-5 w-7 animate-pulse rounded bg-neutral-200" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="h-6 w-full animate-pulse rounded bg-neutral-200" />
        <div className="h-6 w-4/5 animate-pulse rounded bg-neutral-200" />
        <div className="h-6 w-3/5 animate-pulse rounded bg-neutral-200" />
      </div>
    </div>
  )
}

export default AnswerCardSkeleton
