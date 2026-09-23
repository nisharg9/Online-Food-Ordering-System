// pages/MenuPage.jsx
// Full menu page with category filter, veg/non-veg toggle, search, and sorting
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, Leaf, Flame, X } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ItemModal from '../components/ItemModal';
import { MenuItemSkeleton } from '../components/SkeletonCard';
import { EmptySearch } from '../components/EmptyState';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=500&q=80';

const SORT_OPTIONS = [
  { value: 'default', label: 'Default (Newest)' },
  { value: 'rating', label: '⭐ Top Rated' },
  { value: 'price_asc', label: '💰 Price: Low to High' },
  { value: 'price_desc', label: '💸 Price: High to Low' },
];

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state (sync from URL params)
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [vegFilter, setVegFilter] = useState('all'); // 'all' | 'veg' | 'nonveg'
  const [sortBy, setSortBy] = useState('default');

  const { addItem } = useCart();
  const toast = useToast();

  // Fetch categories once
  useEffect(() => {
    api.get('/menu/categories').then((res) => setCategories(res.data.data)).catch(() => {});
  }, []);

  // Fetch items whenever filters change
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.set('category', activeCategory);
      if (search) params.set('search', search);
      if (vegFilter === 'veg') params.set('isVeg', 'true');
      if (vegFilter === 'nonveg') params.set('isVeg', 'false');
      if (sortBy !== 'default') params.set('sortBy', sortBy);

      const res = await api.get(`/menu/items?${params}`);
      setItems(res.data.data);
    } catch {
      toast.error('Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search, vegFilter, sortBy]);

  useEffect(() => {
    const timer = setTimeout(fetchItems, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchItems]);

  const handleQuickAdd = (e, item) => {
    e.stopPropagation();
    if (!item.in_stock) { toast.error('This item is out of stock.'); return; }
    addItem(item, 1);
    toast.success(`${item.name} added! 🛒`);
  };

  const clearFilters = () => {
    setSearch('');
    setActiveCategory('all');
    setVegFilter('all');
    setSortBy('default');
  };

  const hasActiveFilters = search || activeCategory !== 'all' || vegFilter !== 'all' || sortBy !== 'default';

  return (
    <div className="min-h-screen py-6 animate-fade-in">
      <div className="section-container">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-[#333333]">🍽️ Our Menu</h1>
          <p className="text-gray-400 mt-1">
            {loading ? 'Loading...' : `${items.length} delicious ${items.length === 1 ? 'item' : 'items'} found`}
          </p>
        </div>

        {/* Search + Sort Bar */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="menu-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="input-field pl-10"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
          <button
            id="menu-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
              showFilters ? 'border-blush-500 bg-blush-50 text-blush-500' : 'border-pink-100 text-gray-600 hover:border-blush-300'
            }`}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:block">Filters</span>
          </button>
          <select
            id="menu-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field w-auto text-sm hidden sm:block cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-4 mb-4 border border-pink-100 shadow-card animate-slide-up">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-semibold text-gray-700 mr-2">Dietary:</span>
              {[
                { value: 'all', label: '🍽️ All' },
                { value: 'veg', label: <><Leaf size={12} /> Pure Veg</> },
                { value: 'nonveg', label: <><Flame size={12} /> Non-Veg</> },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  id={`veg-filter-${value}`}
                  onClick={() => setVegFilter(value)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    vegFilter === value
                      ? 'bg-blush-500 text-white shadow-pink'
                      : 'bg-pink-50 text-gray-600 hover:bg-blush-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* Mobile sort */}
            <div className="mt-3 sm:hidden">
              <span className="text-sm font-semibold text-gray-700">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field mt-2 text-sm"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Category Chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <CategoryChip
            label="🍽️ All"
            active={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          />
          {categories.map((cat) => (
            <CategoryChip
              key={cat.id}
              label={`${cat.icon} ${cat.name}`}
              active={activeCategory === cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
            />
          ))}
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-gray-500">Active filters:</span>
            {search && <FilterTag label={`"${search}"`} onRemove={() => setSearch('')} />}
            {activeCategory !== 'all' && (
              <FilterTag label={activeCategory} onRemove={() => setActiveCategory('all')} />
            )}
            {vegFilter !== 'all' && (
              <FilterTag label={vegFilter === 'veg' ? '🌿 Veg' : '🥩 Non-Veg'} onRemove={() => setVegFilter('all')} />
            )}
            <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-600 font-medium">
              Clear all
            </button>
          </div>
        )}

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <MenuItemSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <EmptySearch query={search} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onViewDetails={() => setSelectedItem(item)}
                onQuickAdd={(e) => handleQuickAdd(e, item)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedItem && <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}

function CategoryChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
        active
          ? 'bg-blush-500 text-white shadow-pink'
          : 'bg-white border border-pink-100 text-gray-600 hover:border-blush-300 hover:text-blush-500'
      }`}
    >
      {label}
    </button>
  );
}

function FilterTag({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1 bg-blush-50 text-blush-600 text-xs font-semibold px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-blush-800">
        <X size={10} />
      </button>
    </span>
  );
}

function MenuCard({ item, onViewDetails, onQuickAdd }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="card cursor-pointer overflow-hidden group animate-fade-in"
      onClick={onViewDetails}
      role="button"
      tabIndex={0}
      id={`menu-card-${item.id}`}
      onKeyDown={(e) => e.key === 'Enter' && onViewDetails()}
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={imageError ? FALLBACK_IMAGE : item.image_url || FALLBACK_IMAGE}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        {!item.in_stock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white/90 text-gray-700 font-bold text-xs px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          {item.is_veg ? (
            <span className="badge-veg bg-white/90 text-[10px]"><Leaf size={8} /> Veg</span>
          ) : (
            <span className="badge-nonveg bg-white/90 text-[10px]"><Flame size={8} /> Non-Veg</span>
          )}
        </div>
        <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-0.5 flex items-center gap-1">
          <Star size={10} className="text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-bold">{item.rating?.toFixed(1)}</span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-[10px] text-blush-400 font-semibold uppercase tracking-wider mb-1">{item.category_name}</p>
        <h3 className="font-bold text-sm text-[#333333] line-clamp-1">{item.name}</h3>
        <p className="text-gray-400 text-[11px] line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-extrabold text-gradient-pink">${item.price.toFixed(2)}</span>
          <button
            id={`menu-add-${item.id}`}
            onClick={onQuickAdd}
            disabled={!item.in_stock}
            className="bg-blush-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg
                       hover:bg-blush-600 active:scale-95 transition-all disabled:opacity-50 shadow-pink"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
