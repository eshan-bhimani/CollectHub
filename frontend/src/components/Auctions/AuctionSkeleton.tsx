export default function AuctionSkeleton() {
  return (
    <div className="premium-card rounded-2xl p-4 sm:p-5">
      <div className="flex gap-4">
        {/* Slab placeholder */}
        <div className="w-[100px] sm:w-[120px] flex-shrink-0">
          <div className="aspect-[2.5/3.5] rounded-lg skeleton" />
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          {/* Title */}
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded-md skeleton" />
            <div className="h-3 w-1/2 rounded-md skeleton" />
          </div>
          {/* Badge */}
          <div className="h-6 w-28 rounded-md skeleton" />
          {/* Price grid */}
          <div className="data-panel rounded-xl p-3">
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-2 w-8 rounded skeleton" />
                  <div className="h-4 w-14 rounded skeleton" />
                </div>
              ))}
            </div>
          </div>
          {/* Meta */}
          <div className="flex gap-2">
            <div className="h-5 w-18 rounded-md skeleton" />
            <div className="h-5 w-10 rounded-md skeleton" />
          </div>
        </div>
      </div>

      {/* Bid bar */}
      <div className="mt-4 flex gap-2">
        <div className="flex-1 h-10 rounded-xl skeleton" />
        <div className="w-18 h-10 rounded-xl skeleton" />
      </div>
    </div>
  );
}
