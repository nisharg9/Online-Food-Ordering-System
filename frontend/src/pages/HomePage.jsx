// pages/HomePage.jsx
// Landing page with hero, categories, featured items, and search
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Clock, Truck, Star, ChefHat, Leaf, Flame } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ItemModal from '../components/ItemModal';
import { MenuItemSkeleton } from '../components/SkeletonCard';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=500&q=80';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, featRes] = await Promise.all([
          api.get('/menu/categories'),
          api.get('/menu/featured'),
        ]);
        setCategories(catRes.data.data);
        setFeatured(featRes.data.data);
      } catch {
        toast.error('Failed to load menu. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/menu?search=${encodeURIComponent(search.trim())}`);
  };

  const handleQuickAdd = (e, item) => {
    e.stopPropagation();
    if (!item.in_stock) { toast.error(`${item.name} is out of stock.`); return; }
    addItem(item, 1);
    toast.success(`${item.name} added to cart! 🛒`);
  };

  return (
    <div className="animate-fade-in">
      {/* ─── Hero Section ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-pink min-h-[520px] flex items-center">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">🍔</div>
          <div className="absolute top-20 right-20 text-7xl">🍕</div>
          <div className="absolute bottom-10 left-1/4 text-6xl">🍜</div>
          <div className="absolute bottom-20 right-10 text-8xl">🍰</div>
        </div>

        <div className="section-container relative z-10 py-16">
          <div className="max-w-2xl">
            <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4 backdrop-blur-sm">
              🌸 Fresh • Fast • Delicious
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
              Satisfy Your <br />
              <span className="text-cream-50">Sweet & Savory</span> <br />
              Cravings
            </h1>
            <p className="text-white/85 text-lg mb-8 max-w-md leading-relaxed">
              Artisan burgers, fresh pizzas, Asian bowls, and dreamy desserts — delivered to your door in 30 minutes.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="hero-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for burgers, pizza..."
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white text-[#333333] placeholder-gray-400
                             font-medium focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                />
              </div>
              <button type="submit" id="hero-search-btn" className="bg-[#333333] text-white px-5 py-3.5 rounded-xl font-semibold
                       hover:bg-black transition-colors shadow-lg active:scale-95 flex items-center gap-2">
                <Search size={18} />
                <span className="hidden sm:block">Search</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── Value Props ─────────────────────────────────── */}
      <section className="py-8 bg-white border-b border-pink-50">
        <div className="section-container">
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Clock size={22} className="text-blush-500" />, label: '30 Min Delivery', sub: 'Fast & reliable' },
              { icon: <Star size={22} className="text-amber-400" />, label: 'Top Rated', sub: '4.8★ average' },
              { icon: <ChefHat size={22} className="text-blush-500" />, label: 'Fresh Daily', sub: 'Artisan quality' },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-blush-50 flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="font-bold text-sm text-[#333333]">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ──────────────────────────────────── */}
      <section className="py-12">
        <div className="section-container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#333333]">Browse Categories</h2>
            <button onClick={() => navigate('/menu')}
              className="flex items-center gap-1 text-blush-500 font-semibold text-sm hover:gap-2 transition-all">
              View All <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-24 w-28 rounded-2xl shrink-0" />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  id={`category-btn-${cat.slug}`}
                  onClick={() => navigate(`/menu?category=${cat.slug}`)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-pink-100
                             hover:border-blush-300 hover:bg-blush-50 transition-all duration-200 shadow-card
                             min-w-[100px] active:scale-95 group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-xs font-semibold text-[#333333] text-center leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Featured Items ───────────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="section-container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#333333]">✨ Chef's Picks</h2>
              <p className="text-gray-400 text-sm mt-1">Our most loved and highest-rated dishes</p>
            </div>
            <button onClick={() => navigate('/menu')}
              className="flex items-center gap-1 text-blush-500 font-semibold text-sm hover:gap-2 transition-all">
              See All <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => <MenuItemSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  onViewDetails={() => setSelectedItem(item)}
                  onQuickAdd={(e) => handleQuickAdd(e, item)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA Banner ──────────────────────────────────── */}
      <section className="py-16">
        <div className="section-container">
          <div className="bg-gradient-pink rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-4 left-4 text-5xl opacity-20">🍕</div>
            <div className="absolute bottom-4 right-4 text-6xl opacity-20">🍔</div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Hungry? Order Now!</h2>
              <p className="text-white/85 mb-6 text-lg">Free delivery on orders above $30. Limited time offer!</p>
              <button onClick={() => navigate('/menu')}
                id="cta-order-now"
                className="bg-white text-blush-500 font-bold px-8 py-3.5 rounded-xl hover:bg-cream-50
                           transition-colors shadow-lg active:scale-95">
                🛒 Explore Full Menu
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Item Modal */}
      {selectedItem && <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}

// ─── Food Card Component ──────────────────────────────────────────────────────
function FoodCard({ item, onViewDetails, onQuickAdd }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="card cursor-pointer overflow-hidden group"
      onClick={onViewDetails}
      role="button"
      tabIndex={0}
      id={`food-card-${item.id}`}
      onKeyDown={(e) => e.key === 'Enter' && onViewDetails()}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageError ? FALLBACK_IMAGE : item.image_url || FALLBACK_IMAGE}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {!item.in_stock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white/90 text-gray-700 font-bold text-sm px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          {item.is_veg ? (
            <span className="badge-veg bg-white/90 text-xs"><Leaf size={9} /> Veg</span>
          ) : (
            <span className="badge-nonveg bg-white/90 text-xs"><Flame size={9} /> Non-Veg</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-[#333333] leading-tight">{item.name}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold text-gray-600">{item.rating?.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-gray-400 text-xs line-clamp-2 mb-3 leading-relaxed">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-extrabold text-gradient-pink">${item.price.toFixed(2)}</span>
          <button
            id={`quick-add-${item.id}`}
            onClick={onQuickAdd}
            disabled={!item.in_stock}
            className="bg-blush-500 text-white text-sm font-semibold px-4 py-2 rounded-xl
                       hover:bg-blush-600 active:scale-95 transition-all disabled:opacity-50 shadow-pink"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
