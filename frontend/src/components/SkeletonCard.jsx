// components/SkeletonCard.jsx
// Shimmer loading placeholders for menu items, orders, etc.
export function MenuItemSkeleton() {
  return (
    <div className="card overflow-hidden animate-fade-in">
      <div className="skeleton h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded-lg" />
        <div className="skeleton h-4 w-full rounded-lg" />
        <div className="skeleton h-4 w-2/3 rounded-lg" />
        <div className="flex items-center justify-between mt-4">
          <div className="skeleton h-6 w-20 rounded-lg" />
          <div className="skeleton h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="card p-5 space-y-3 animate-fade-in">
      <div className="flex justify-between">
        <div className="skeleton h-5 w-32 rounded-lg" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="skeleton h-4 w-48 rounded-lg" />
      <div className="skeleton h-4 w-24 rounded-lg" />
      <div className="flex gap-2 mt-2">
        <div className="skeleton h-9 w-28 rounded-xl" />
        <div className="skeleton h-9 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-11 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
