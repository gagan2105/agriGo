import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Plus, Sparkles, TrendingUp, AlertTriangle, MessageSquare, ShieldAlert, BarChart, Menu, X, LogOut, User } from 'lucide-react';
import { cropService, orderService, aiService, authService } from '../services/api';
import ProductCard from '../components/ProductCard';
import OrderCard from '../components/OrderCard';

const FarmerDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Crop Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [name, setName] = useState('tomatoes');
  const [category, setCategory] = useState('Vegetables');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  
  // AI Assistants States
  const [aiPriceLoading, setAiPriceLoading] = useState(false);
  const [aiPriceSuggestion, setAiPriceSuggestion] = useState(null);
  const [aiDiseaseLoading, setAiDiseaseLoading] = useState(false);
  const [diseaseDiagnosis, setDiseaseDiagnosis] = useState(null);
  const [diagnosticUrl, setDiagnosticUrl] = useState('');

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchFarmerData();
  }, []);

  const fetchFarmerData = async () => {
    try {
      // Fetch crops listed
      const cropRes = await cropService.getCrops();
      // Filter for farmer owned crops
      const farmerCrops = cropRes.data.filter(c => c.farmer_id === user.farmer_profile?.id);
      setCrops(farmerCrops);

      // Fetch orders
      const orderRes = await orderService.getOrders();
      setOrders(orderRes.data);
    } catch (err) {
      console.error('Failed to load farmer dashboard assets', err);
    }
  };

  // 1. AI Suggested Price Helper
  const triggerAiPriceSuggestion = async () => {
    if (!price) {
      alert('Please enter a base market price first to run comparison.');
      return;
    }
    setAiPriceLoading(true);
    setAiPriceSuggestion(null);
    try {
      const res = await aiService.predictPrice({
        crop_name: name,
        market_price: Number(price),
        season: 'monsoon',
        demand: 'high',
        rainfall: 220
      });
      setAiPriceSuggestion(res.data);
      // Automatically fill the price field with the recommendation
      setPrice(res.data.recommended_price);
    } catch (err) {
      console.error(err);
      // Client-side fallback
      const fallback = {
        recommended_price: Number(price) * 1.12,
        reasoning: "Middlemen eliminated. Direct AgriMarket logistics adds a 12% premium profit return."
      };
      setAiPriceSuggestion(fallback);
      setPrice(fallback.recommended_price);
    } finally {
      setAiPriceLoading(false);
    }
  };

  // 2. AI Crop Disease Detector helper
  const triggerAiDiseaseDetection = async () => {
    if (!diagnosticUrl) {
      alert('Please enter an image URL to inspect (try typing "tomato blight" for test).');
      return;
    }
    setAiDiseaseLoading(true);
    setDiseaseDiagnosis(null);
    try {
      const res = await aiService.detectDisease({
        image_url: diagnosticUrl
      });
      setDiseaseDiagnosis(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiDiseaseLoading(false);
    }
  };

  const handleAddOrEditCrop = async (e) => {
    e.preventDefault();
    if (!quantity || !price) return;

    const payload = {
      crop_name: name,
      category,
      quantity: Number(quantity),
      unit,
      price_per_unit: Number(price),
      image_url: image || diagnosticUrl || null,
      status: 'active'
    };

    try {
      if (editingCrop) {
        await cropService.updateCrop(editingCrop.id, payload);
      } else {
        await cropService.createCrop(payload);
      }
      setShowAddForm(false);
      setEditingCrop(null);
      resetForm();
      fetchFarmerData();
    } catch (err) {
      console.error(err);
      alert('Failed to save crop listing.');
    }
  };

  const handleEmergencySale = async (crop) => {
    try {
      // Toggle crop to emergency sale mode (discounts price by 25% and labels it)
      const discountedPrice = Math.round(crop.price_per_unit * 0.75);
      await cropService.updateCrop(crop.id, {
        status: 'emergency_sale',
        price_per_unit: discountedPrice
      });
      fetchFarmerData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCrop = async (id) => {
    if (!window.confirm('Are you sure you want to delete this crop listing?')) return;
    try {
      await cropService.deleteCrop(id);
      fetchFarmerData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, statusPayload) => {
    try {
      await orderService.updateOrderStatus(orderId, statusPayload);
      fetchFarmerData();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (crop) => {
    setEditingCrop(crop);
    setName(crop.crop_name);
    setCategory(crop.category);
    setQuantity(crop.quantity);
    setUnit(crop.unit);
    setPrice(crop.price_per_unit);
    setImage(crop.image_url || '');
    setShowAddForm(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File is too large. Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName('tomatoes');
    setCategory('Vegetables');
    setQuantity('');
    setUnit('kg');
    setPrice('');
    setImage('');
    setDiagnosticUrl('');
    setAiPriceSuggestion(null);
    setDiseaseDiagnosis(null);
  };

  // Analytics Helpers
  const totalRevenue = orders
    .filter(o => o.payment_status === 'paid' || o.order_status === 'delivered')
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="flex h-screen bg-[#f4f7f4] overflow-hidden w-full">
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0f1d0e] text-white border-r border-emerald-900/40 transform transition-transform duration-300 flex flex-col justify-between ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between pb-6 border-b border-emerald-900/40">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg text-white shadow-md">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-base font-black tracking-tight text-white">
                AgriMarket
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="sm:hidden text-emerald-350 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="mt-8 space-y-6">
            <div>
              <span className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest block px-3">
                Management
              </span>
              <div className="mt-3 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('inventory');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'inventory'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-emerald-250/70 hover:bg-emerald-900/30 hover:text-white'
                  }`}
                >
                  <Leaf className="w-4 h-4" />
                  My Inventory
                </button>
                <button
                  onClick={() => {
                    setActiveTab('orders');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-emerald-250/70 hover:bg-emerald-900/30 hover:text-white'
                  }`}
                >
                  <BarChart className="w-4 h-4" />
                  Purchases & Orders
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest block px-3">
                AI Engine
              </span>
              <div className="mt-3 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('ai-diagnostics');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'ai-diagnostics'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-emerald-250/70 hover:bg-emerald-900/30 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Leaf Scanner
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar Profile & Logout */}
        <div className="p-6 border-t border-emerald-900/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-sm text-white shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-bold text-white truncate capitalize">{user.name}</span>
              <span className="block text-[9px] text-emerald-500/80 uppercase font-semibold">Farmer Portal</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-900/30 hover:bg-rose-900/20 text-emerald-300 hover:text-rose-400 rounded-xl text-xs font-semibold border border-emerald-800/40 hover:border-rose-900/30 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 overflow-y-auto sm:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 bg-white border-b border-emerald-100/50 px-6 sm:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="sm:hidden p-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-50 text-emerald-950 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base font-extrabold text-emerald-950 capitalize">
              {activeTab === 'ai-diagnostics' ? 'AI Disease Scanner' : activeTab === 'inventory' ? 'Listed Crop Inventory' : 'Incoming Purchases'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
            >
              Home Website
            </Link>
          </div>
        </header>

        {/* Page Canvas */}
        <main className="p-6 sm:p-8 space-y-8 flex-1">
          {/* Upper Dashboard stats summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white border border-emerald-50 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-emerald-600">Total Earnings</span>
              <h3 className="text-2xl font-black text-emerald-950 mt-2">₹{totalRevenue.toLocaleString()}</h3>
              <span className="text-[10px] text-emerald-500 mt-1 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                100% Direct Payouts
              </span>
            </div>

            <div className="bg-white border border-emerald-50 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-emerald-600">Active Listings</span>
              <h3 className="text-2xl font-black text-emerald-950 mt-2">{crops.length} Crops</h3>
              <span className="text-[10px] text-emerald-500 mt-1 font-semibold">Ready for dispatch</span>
            </div>

            <div className="bg-white border border-emerald-50 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-emerald-600">Orders Received</span>
              <h3 className="text-2xl font-black text-emerald-950 mt-2">{orders.length}</h3>
              <span className="text-[10px] text-emerald-500 mt-1 font-semibold">Total transactions</span>
            </div>

            <div className="bg-white border border-emerald-50 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-emerald-600">Farmer Rating</span>
              <h3 className="text-2xl font-black text-emerald-950 mt-2">4.8 ⭐</h3>
              <span className="text-[10px] text-emerald-500 mt-1 font-semibold">Highly Trusted Farmer</span>
            </div>
          </div>

          {/* Active Tab contents */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-emerald-950">Crop Catalogue</h3>
                <button
                  onClick={() => {
                    resetForm();
                    setEditingCrop(null);
                    setShowAddForm(!showAddForm);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {showAddForm ? 'Close Editor' : 'List New Crop'}
                </button>
              </div>

              {/* Form Modal / Drawer */}
              {showAddForm && (
                <div className="bg-white border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-md max-w-2xl animate-in fade-in slide-in-from-top-5">
                  <h3 className="text-lg font-black text-emerald-950 mb-4">
                    {editingCrop ? 'Modify Crop Listing' : 'Publish New Crop Listing'}
                  </h3>
                  
                  <form onSubmit={handleAddOrEditCrop} className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-emerald-950">Crop Name</label>
                      <select
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs text-emerald-950 focus:outline-none"
                      >
                        <option value="tomatoes">Tomatoes</option>
                        <option value="rice">Rice (Paddy)</option>
                        <option value="wheat">Wheat</option>
                        <option value="onions">Onions</option>
                        <option value="potatoes">Potatoes</option>
                        <option value="mangoes">Mangoes</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-emerald-950">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs text-emerald-950 focus:outline-none"
                      >
                        <option value="Vegetables">Vegetables</option>
                        <option value="Fruits">Fruits</option>
                        <option value="Grains">Grains (Cereal)</option>
                        <option value="Pulses">Pulses</option>
                        <option value="Spices">Spices</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-emerald-950">Listing Quantity</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder="100"
                          className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs focus:outline-none"
                          required
                        />
                        <select
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          className="bg-emerald-50/50 border border-emerald-100 rounded-xl px-2 text-xs focus:outline-none"
                        >
                          <option value="kg">kg</option>
                          <option value="tons">tons</option>
                          <option value="quintal">quintal</option>
                          <option value="crates">crates</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-emerald-950">Price per Unit (₹)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="20"
                          className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs focus:outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={triggerAiPriceSuggestion}
                          disabled={aiPriceLoading}
                          className="px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[10px] font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          AI Pricing
                        </button>
                      </div>
                    </div>

                    {/* AI pricing notification */}
                    {aiPriceSuggestion && (
                      <div className="sm:col-span-2 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-[11px] leading-relaxed text-emerald-800 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
                        <div>
                          <span className="font-extrabold block text-emerald-950">AI Recommended Listing Price: ₹{aiPriceSuggestion.recommended_price}/kg</span>
                          <span className="block mt-0.5">{aiPriceSuggestion.reasoning}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold text-emerald-950">Crop Image</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Local File Upload Container */}
                        <div className="relative border-2 border-dashed border-emerald-250 hover:border-emerald-550 rounded-2xl p-4 flex flex-col items-center justify-center bg-emerald-50/20 transition-all cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Plus className="w-6 h-6 text-emerald-600 mb-1" />
                          <span className="text-[11px] font-semibold text-emerald-800">Upload Image File</span>
                          <span className="text-[9px] text-emerald-900/50 mt-0.5">JPG, PNG up to 2MB</span>
                        </div>

                        {/* Image Preview */}
                        <div className="flex flex-col justify-between border border-emerald-100 rounded-2xl p-3 bg-white">
                          {image ? (
                            <div className="relative h-24 rounded-lg overflow-hidden border border-emerald-50 bg-emerald-50/30 flex items-center justify-center">
                              <img
                                src={image}
                                alt="Crop Preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setImage('')}
                                className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all text-[9px] font-bold cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-24 text-center border border-dashed border-emerald-100/50 rounded-lg bg-emerald-50/10">
                              <span className="text-[10px] text-emerald-900/50 font-medium">No preview available</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] text-emerald-900/60 flex items-center gap-1.5 justify-end">
                        <span>Or paste image URL:</span>
                        <input
                          type="text"
                          value={image && image.startsWith('data:') ? '' : image}
                          onChange={(e) => setImage(e.target.value)}
                          placeholder="https://images.unsplash.com/example"
                          className="bg-emerald-50/50 border border-emerald-100 rounded-lg px-2 py-1 text-[10px] focus:outline-none w-48 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="sm:col-span-2 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      {editingCrop ? 'Update Listing' : 'Publish Listing'}
                    </button>
                  </form>
                </div>
              )}

              {/* Cards List */}
              {crops.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {crops.map((crop) => (
                    <ProductCard
                      key={crop.id}
                      crop={crop}
                      user={user}
                      onEdit={startEdit}
                      onDelete={handleDeleteCrop}
                      onEmergencySale={handleEmergencySale}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white border border-emerald-50 rounded-3xl space-y-4">
                  <Leaf className="w-12 h-12 text-emerald-300 mx-auto" />
                  <h4 className="font-bold text-lg text-emerald-950">No crops listed yet</h4>
                  <p className="text-xs text-emerald-900/60 max-w-xs mx-auto">
                    Get started by listing your organic harvest for direct buyer purchases.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              {orders.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {orders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      user={user}
                      onUpdateStatus={handleUpdateOrderStatus}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white border border-emerald-50 rounded-3xl space-y-4">
                  <BarChart className="w-12 h-12 text-emerald-300 mx-auto" />
                  <h4 className="font-bold text-lg text-emerald-950">No orders received</h4>
                  <p className="text-xs text-emerald-900/60 max-w-xs mx-auto">
                    Crops listed in active status will trigger purchasing transactions from registered buyers.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai-diagnostics' && (
            <div className="space-y-6">
              <div className="max-w-2xl bg-white border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-emerald-700" />
                    AI Crop Disease Diagnostics
                  </h3>
                  <p className="text-xs text-emerald-900/60 mt-1 leading-relaxed">
                    Scan your crop leaves using convolutional visual networks. Upload an image to analyze symptoms, discover remedies, and view specific fertilizer schedules.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-emerald-950">Crop Leaf Image</label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Local Leaf File Upload */}
                      <div className="relative border-2 border-dashed border-emerald-250 hover:border-emerald-550 rounded-2xl p-4 flex flex-col items-center justify-center bg-emerald-50/20 transition-all cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                alert('File is too large. Please select an image under 2MB.');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setDiagnosticUrl(reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Plus className="w-6 h-6 text-emerald-600 mb-1" />
                        <span className="text-[11px] font-semibold text-emerald-800">Upload Leaf Image File</span>
                        <span className="text-[9px] text-emerald-900/50 mt-0.5">JPG, PNG up to 2MB</span>
                      </div>

                      {/* Leaf Image Scan Preview / Control */}
                      <div className="flex flex-col justify-between border border-emerald-100 rounded-2xl p-3 bg-white">
                        {diagnosticUrl ? (
                          <div className="relative h-24 rounded-lg overflow-hidden border border-emerald-50 bg-emerald-50/30 flex items-center justify-center">
                            <img
                              src={diagnosticUrl}
                              alt="Leaf Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setDiagnosticUrl('')}
                              className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all text-[9px] font-bold cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-24 text-center border border-dashed border-emerald-100/50 rounded-lg bg-emerald-50/10">
                            <span className="text-[10px] text-emerald-900/50 font-medium">No preview available</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex gap-2 items-center">
                      <input
                        type="text"
                        value={diagnosticUrl && diagnosticUrl.startsWith('data:') ? '' : diagnosticUrl}
                        onChange={(e) => setDiagnosticUrl(e.target.value)}
                        placeholder="Or paste 'tomato blight' or 'rust' image URL"
                        className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs focus:outline-none"
                      />
                      <button
                        onClick={triggerAiDiseaseDetection}
                        disabled={aiDiseaseLoading || !diagnosticUrl}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer h-9 flex items-center justify-center shrink-0"
                      >
                        {aiDiseaseLoading ? 'Analyzing...' : 'Scan Image'}
                      </button>
                    </div>
                  </div>

                  {/* Diagnosis outcome display */}
                  {diseaseDiagnosis && (
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-600">Scan Diagnosis</span>
                          <h4 className="font-extrabold text-base text-emerald-950 mt-0.5">
                            {diseaseDiagnosis.disease_name}
                          </h4>
                        </div>
                        <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
                          {(diseaseDiagnosis.confidence_score * 100).toFixed(0)}% Match
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-emerald-700" />
                            Remedy / Application Guide
                          </span>
                          <p className="text-emerald-900 leading-relaxed font-light pl-5">
                            {diseaseDiagnosis.remedy}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                            <Leaf className="w-4 h-4 text-emerald-700" />
                            Recommended Soil Fertilizers
                          </span>
                          <ul className="list-disc pl-9 text-emerald-900 leading-relaxed font-light">
                            {diseaseDiagnosis.fertilizers?.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FarmerDashboard;
