// components/EmptyState.jsx
// Friendly empty state illustrations with message and optional action
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="text-7xl mb-4 animate-bounce-soft">{icon || '🍽️'}</div>
      <h3 className="text-xl font-bold text-[#333333] mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary"
          id={`empty-state-${title?.replace(/\s+/g, '-').toLowerCase()}`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Pre-configured empty states
export function EmptyCart({ onBrowse }) {
  return (
    <EmptyState
      icon="🛒"
      title="Your cart is empty!"
      description="Looks like you haven't added anything yet. Browse our delicious menu and find your favorites!"
      action={{ label: '🍕 Browse Menu', onClick: onBrowse }}
    />
  );
}

export function EmptyOrders({ onBrowse }) {
  return (
    <EmptyState
      icon="📦"
      title="No orders yet!"
      description="You haven't placed any orders yet. Your order history will appear here once you make your first order."
      action={{ label: '🍔 Order Now', onClick: onBrowse }}
    />
  );
}

export function EmptySearch({ query }) {
  return (
    <EmptyState
      icon="🔍"
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try a different keyword or browse by category.`}
    />
  );
}

export function EmptyAdminOrders() {
  return (
    <EmptyState
      icon="📋"
      title="No orders yet"
      description="Orders will appear here once customers start placing them. Make sure your menu is ready!"
    />
  );
}
