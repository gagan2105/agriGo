import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Search, SlidersHorizontal, Sparkles, ShoppingBag } from 'lucide-react';
import { cropService, aiService } from '../services/api';
import { addToCart } from '../services/store';
import ProductCard from '../components/ProductCard';

const Marketplace = () => {
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [crops, setCrops] = useState([]);
  const [recommendedCrops, setRecommendedCrops] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices'];

  useEffect(() => {
    fetchCrops();
    fetchRecommendations();
  }, [search, category]);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const res = await cropService.getCrops(search, category === 'All' ? '' : category);
      setCrops(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      if (user.role === 'buyer') {
        const res = await aiService.recommendCrops();
        setRecommendedCrops(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch AI crop recommendations', err);
    }
  };

  const handleAddToCart = (crop, qty) => {
    dispatch(addToCart({ crop, quantity: qty }));
    alert(`Added ${qty} ${crop.unit} of ${crop.crop_name} to your shopping cart.`);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-emerald-50 rounded-3xl p-6 shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3 h-4 w-4 text-emerald-800" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organic crops (e.g. Tomatoes)..."
            className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl pl-11 pr-4 py-2.5 text-xs text-emerald-950 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        {/* Categories Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <SlidersHorizontal className="w-4 h-4 text-emerald-800 hidden sm:block shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === 'All' ? '' : cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                (category === cat || (cat === 'All' && !category))
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50/40 text-emerald-950 hover:bg-emerald-50 border border-emerald-100/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* AI Recommendations Panel (For Buyer portal customization) */}
      {user.role === 'buyer' && recommendedCrops.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 text-white space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/10 rounded-full blur-3xl" />
          
          <div className="flex items-center gap-2 relative z-10">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-black tracking-tight">AI Recommended for You</h3>
            <span className="text-[9px] bg-emerald-800 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-700">
              Collaborative Filtering active
            </span>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            {recommendedCrops.map((crop) => (
              <div key={crop.id} className="bg-emerald-900/60 border border-emerald-800 rounded-2xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform">
                <div>
                  <span className="text-[10px] text-emerald-300 font-bold capitalize">{crop.category}</span>
                  <h4 className="font-extrabold text-sm capitalize mt-1">{crop.crop_name}</h4>
                  <span className="block text-xs text-emerald-200 mt-0.5">₹{crop.price_per_unit}/{crop.unit}</span>
                </div>
                <button
                  onClick={() => handleAddToCart(crop, 1)}
                  className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Quick Buy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Marketplace Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold text-emerald-950">Active Crops Catalogue</h2>
        
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-emerald-50 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : crops.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => (
              <ProductCard
                key={crop.id}
                crop={crop}
                user={user}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-emerald-50 rounded-3xl space-y-4">
            <ShoppingBag className="w-12 h-12 text-emerald-300 mx-auto" />
            <h4 className="font-bold text-lg text-emerald-950">No crops matching criteria</h4>
            <p className="text-xs text-emerald-900/60 max-w-xs mx-auto">
              Try adjusting your query string filters or clearing category tabs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
