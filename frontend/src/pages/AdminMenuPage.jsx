// pages/AdminMenuPage.jsx
// Admin menu management: listing, add item modal, edit item modal, delete item, toggle stock
import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Check, 
  X, 
  ArrowLeft,
  Leaf,
  Flame,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=200&q=80';

export default function AdminMenuPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null if adding
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_veg: false,
    in_stock: true,
    rating: 4.5,
    calories: '',
  });

  const toast = useToast();

  const loadData = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        api.get('/menu/items'),
        api.get('/menu/categories'),
      ]);
      setItems(itemsRes.data.data);
      setCategories(catsRes.data.data);
    } catch {
      toast.error('Failed to load menu data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || item.category_slug === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, selectedCategory]);

  // Toggle stock
  const handleToggleStock = async (item) => {
    try {
      const res = await api.patch(`/menu/items/${item.id}/stock`);
      const updatedStock = res.data.data.in_stock;

      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, in_stock: updatedStock } : i))
      );

      toast.success(
        `${item.name} is now ${updatedStock ? 'In Stock 🟢' : 'Out of Stock 🔴'}`
      );
    } catch {
      toast.error('Failed to update stock status.');
    }
  };

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: categories[0]?.id || '',
      image_url: '',
      is_veg: false,
      in_stock: true,
      rating: 4.5,
      calories: 350,
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id,
      image_url: item.image_url || '',
      is_veg: Boolean(item.is_veg),
      in_stock: Boolean(item.in_stock),
      rating: item.rating || 4.5,
      calories: item.calories || 0,
    });
    setIsModalOpen(true);
  };

  // Submit modal (create or edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.category_id) {
      toast.error('Name, price, and category are required.');
      return;
    }

    setModalSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        image_url: formData.image_url.trim() || null,
        is_veg: formData.is_veg,
        in_stock: formData.in_stock,
        rating: parseFloat(formData.rating) || 4.5,
        calories: parseInt(formData.calories) || 0,
      };

      if (editingItem) {
        const res = await api.put(`/menu/items/${editingItem.id}`, payload);
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? res.data.data : i))
        );
        toast.success(`Updated "${payload.name}" successfully! ✨`);
      } else {
        const res = await api.post('/menu/items', payload);
        setItems((prev) => [res.data.data, ...prev]);
        toast.success(`Added "${payload.name}" to the menu! 🎉`);
      }

      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save item.');
    } finally {
      setModalSubmitting(false);
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    try {
      await api.delete(`/menu/items/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Menu item deleted successfully.');
      setDeleteConfirmId(null);
    } catch {
      toast.error('Failed to delete item.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="section-container max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blush-500 transition-colors mb-2"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-[#333333]">🍔 Menu Management</h1>
            <p className="text-xs text-gray-400 mt-1">
              Add, update, or toggle stock availability for all {items.length} menu items
            </p>
          </div>

          <button
            id="admin-add-item-btn"
            onClick={handleOpenAdd}
            className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus size={18} />
            <span>Add New Item</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items by name or description..."
              className="input-field pl-9 py-2 text-sm"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field py-2 text-sm sm:w-56 cursor-pointer"
          >
            <option value="all">All Categories ({items.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Menu Items Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-pink-100 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-pink-50/40">
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Diet</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4 text-center">In Stock?</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50 text-sm">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-blush-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url || FALLBACK_IMAGE}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-pink-100"
                          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#333333] text-sm leading-tight truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs font-semibold text-gray-600">
                      {item.category_name}
                    </td>

                    <td className="py-3 px-4">
                      {item.is_veg ? (
                        <span className="badge-veg text-[10px]"><Leaf size={8} /> Veg</span>
                      ) : (
                        <span className="badge-nonveg text-[10px]"><Flame size={8} /> Non-Veg</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-bold text-gray-800">
                      ${item.price.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStock(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          item.in_stock
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {item.in_stock ? 'In Stock 🟢' : 'Out of Stock 🔴'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blush-600 hover:bg-blush-50 transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              No menu items match your search or filter criteria.
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="card p-6 max-w-sm w-full text-center animate-slide-up">
              <AlertCircle size={36} className="text-red-500 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-[#333333]">Delete Menu Item?</h3>
              <p className="text-xs text-gray-500 my-2">
                This item will be permanently removed from the menu. Past customer orders will retain this item name.
              </p>
              <div className="flex gap-2 justify-center mt-5">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit Item Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-slide-up my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-4">
                <h3 className="text-lg font-bold text-[#333333]">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Dish Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Truffle Mushroom Burger"
                    className="input-field text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-1">
                      Price ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="12.99"
                      className="input-field text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="input-field text-sm"
                      required
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Description
                  </label>
                  <textarea
                    rows="2"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Crispy artisan patty with caramelized onions, swiss cheese, and garlic aioli..."
                    className="input-field text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="input-field text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-1">
                      Calories (kcal)
                    </label>
                    <input
                      type="number"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      placeholder="450"
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] mb-1">
                      Initial Rating
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                </div>

                {/* Dietary and Stock Checkboxes */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.is_veg}
                      onChange={(e) => setFormData({ ...formData, is_veg: e.target.checked })}
                      className="w-4 h-4 rounded text-blush-500 focus:ring-blush-400"
                    />
                    <span>🌱 Pure Vegetarian</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.in_stock}
                      onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                      className="w-4 h-4 rounded text-blush-500 focus:ring-blush-400"
                    />
                    <span>🟢 In Stock</span>
                  </label>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-pink-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-outline text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSubmitting}
                    className="btn-primary text-xs py-2 px-6"
                  >
                    {modalSubmitting ? (
                      <LoadingSpinner size="sm" />
                    ) : editingItem ? (
                      'Save Changes'
                    ) : (
                      'Create Item'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
