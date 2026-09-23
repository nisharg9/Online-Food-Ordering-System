// components/LoadingSpinner.jsx
// Reusable loading spinner with size and color options
export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div
      className={`${sizes[size]} rounded-full border-blush-200 border-t-blush-500 animate-spin ${className}`}
      role="status"
      aria-label="Loading..."
    />
  );
}

// Full-page loading overlay
export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-[#FFF5F7]/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl animate-bounce-soft">🍔</div>
        <LoadingSpinner size="lg" />
        <p className="text-blush-500 font-semibold animate-pulse">Loading BlushBites...</p>
      </div>
    </div>
  );
}

// Inline loading button content
export function ButtonSpinner() {
  return (
    <span className="flex items-center justify-center gap-2">
      <LoadingSpinner size="sm" />
      <span>Please wait...</span>
    </span>
  );
}
