import React, { useState } from 'react';
import { ShoppingCart, Edit2, Trash2, MapPin, AlertCircle, Sparkles } from 'lucide-react';

const ProductCard = ({ crop, user, onAddToCart, onEdit, onDelete, onEmergencySale }) => {
  const [qty, setQty] = useState(1);
  const isFarmer = user?.role === 'farmer' && crop.farmer_id === user.farmer_profile?.id;
  const isBuyer = user?.role === 'buyer';

  // Category specific styling
  const categoryColors = {
    Vegetables: 'bg-green-100 text-green-800 border-green-200',
    Fruits: 'bg-amber-100 text-amber-800 border-amber-200',
    Grains: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Pulses: 'bg-orange-100 text-orange-800 border-orange-200',
    Spices: 'bg-red-100 text-red-800 border-red-200',
    Other: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const badgeColor = categoryColors[crop.category] || categoryColors.Other;

  // Placeholder images
  const defaultImages = {
    Tomatoes: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=400&q=80',
    Rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    Wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80',
    Onions: 'https://images.unsplash.com/photo-1508747703725-719ae25b3e14?auto=format&fit=crop&w=400&q=80',
    Potatoes: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80',
    Mangoes: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=400&q=80',
  };

  const imageSrc = crop.image_url || defaultImages[crop.crop_name] || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-emerald-50 shadow-sm hover-lift relative flex flex-col h-full">
      {/* Crop Status / Emergency Tag */}
      {crop.status === 'emergency_sale' && (
        <span className="absolute top-3 left-3 z-10 flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-md">
          <AlertCircle className="w-3.5 h-3.5" />
          Emergency Auction!
        </span>
      )}
      
      {crop.status === 'sold_out' && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-xs z-10 flex items-center justify-center">
          <span className="px-4 py-2 bg-emerald-950 text-white font-extrabold rounded-lg shadow-lg">
            SOLD OUT
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 bg-emerald-50">
        <img
          src={imageSrc}
          alt={crop.crop_name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <span className={`absolute bottom-3 right-3 px-2.5 py-1 text-xs font-bold rounded-md border ${badgeColor} shadow-sm`}>
          {crop.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-emerald-950 capitalize">{crop.crop_name}</h3>
          <span className="text-xl font-black text-emerald-800">
            ₹{crop.price_per_unit}<span className="text-xs font-medium text-emerald-600">/{crop.unit}</span>
          </span>
        </div>

        <div className="mt-2 space-y-1.5 text-xs text-emerald-900 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold">Stock:</span>
            <span>{crop.quantity} {crop.unit} available</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700">
            <MapPin className="w-3.5 h-3.5" />
            <span>Direct from farm (Nearby)</span>
          </div>
        </div>

        {/* User Interaction Controls */}
        <div className="mt-5 pt-4 border-t border-emerald-50">
          {isBuyer && (
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-emerald-200 rounded-lg overflow-hidden h-10 bg-emerald-50/50">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-2.5 hover:bg-emerald-100 font-bold h-full text-emerald-900 cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Math.min(crop.quantity, parseInt(e.target.value) || 1)))}
                  className="w-10 text-center font-bold text-sm bg-transparent border-none text-emerald-950 focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setQty(Math.min(crop.quantity, qty + 1))}
                  className="px-2.5 hover:bg-emerald-100 font-bold h-full text-emerald-900 cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => onAddToCart(crop, qty)}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm h-10 shadow-sm transition-all cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy Direct
              </button>
            </div>
          )}

          {isFarmer && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(crop)}
                className="flex-1 flex items-center justify-center gap-1 border border-emerald-600 hover:bg-emerald-50 text-emerald-700 rounded-lg font-semibold text-xs h-9 transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
              
              <button
                onClick={() => onEmergencySale(crop)}
                className="flex-1 flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-xs h-9 transition-all cursor-pointer"
                title="Sell crop quickly by listing it in emergency discount mode"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Fire Sale
              </button>

              <button
                onClick={() => onDelete(crop.id)}
                className="p-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg transition-all cursor-pointer"
                title="Delete listing"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
