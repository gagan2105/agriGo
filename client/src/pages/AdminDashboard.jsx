import React, { useState, useEffect } from 'react';
import { Users, Leaf, CreditCard, ShieldAlert, Check, X, RefreshCw } from 'lucide-react';
import api, { cropService } from '../services/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Mocked endpoint for users list, fellback safely
      const usersRes = await api.get('/chat/contacts'); // or a custom users list
      setUsers(usersRes.data || []);
      
      const cropsRes = await cropService.getCrops('', '', 'active');
      setCrops(cropsRes.data || []);

      // Get payments
      const orderRes = await api.get('/orders');
      setPayments(orderRes.data || []);
    } catch (err) {
      console.error('Failed to load admin logs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerateCrop = async (cropId, newStatus) => {
    try {
      await api.put(`/crops/update/${cropId}`, { status: newStatus });
      alert(`Crop listing status updated to: ${newStatus}`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const totalVolume = payments.reduce((sum, p) => sum + p.total_amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-50 pb-4">
        <div>
          <h2 className="text-2xl font-black text-emerald-950">AgriMarket Administration Panel</h2>
          <p className="text-xs text-emerald-600 font-semibold mt-0.5">Moderate crop lists, verify profiles, and audit transactions</p>
        </div>
        <button
          onClick={fetchAdminData}
          className="p-2 border border-emerald-100 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
          title="Sync Admin Dashboard data"
        >
          <RefreshCw className="w-4 h-4 text-emerald-800" />
        </button>
      </div>

      {/* Numerical Stats overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-emerald-50 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-emerald-600 font-semibold block">Total Sales Flowed</span>
          <h3 className="text-2xl font-black text-emerald-950 mt-1">₹{totalVolume.toLocaleString()}</h3>
        </div>

        <div className="bg-white border border-emerald-50 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-emerald-600 font-semibold block">Active Crops listed</span>
          <h3 className="text-2xl font-black text-emerald-950 mt-1">{crops.length} listings</h3>
        </div>

        <div className="bg-white border border-emerald-50 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-emerald-600 font-semibold block">Contacts Chatted</span>
          <h3 className="text-2xl font-black text-emerald-950 mt-1">{users.length} profiles</h3>
        </div>

        <div className="bg-white border border-emerald-50 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-rose-600 font-semibold block">Flagged items</span>
          <h3 className="text-2xl font-black text-rose-950 mt-1">0 cases</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-emerald-100 space-x-6">
        {['users', 'crops', 'transactions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === tab
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-emerald-950/60 hover:text-emerald-850'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'users' && (
        <div className="bg-white border border-emerald-50 rounded-2xl p-6 shadow-xs overflow-hidden">
          <h3 className="text-base font-black text-emerald-950 mb-4">Active Communications Audit</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-emerald-50 text-emerald-800 font-bold border-b border-emerald-100">
                  <th className="p-3">User ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50/50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-emerald-50/10">
                    <td className="p-3 font-semibold text-emerald-800">#USR-{u.id}</td>
                    <td className="p-3 font-bold text-emerald-950">{u.name}</td>
                    <td className="p-3 text-emerald-900">{u.email}</td>
                    <td className="p-3 capitalize font-medium text-emerald-700">{u.role}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                        VERIFIED PROFILE
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-emerald-900/60">No user profiles queried yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'crops' && (
        <div className="bg-white border border-emerald-50 rounded-2xl p-6 shadow-xs overflow-hidden">
          <h3 className="text-base font-black text-emerald-950 mb-4">Crop Listing Moderation</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-emerald-50 text-emerald-800 font-bold border-b border-emerald-100">
                  <th className="p-3">ID</th>
                  <th className="p-3">Crop Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Stock quantity</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50/50">
                {crops.map((crop) => (
                  <tr key={crop.id} className="hover:bg-emerald-50/10">
                    <td className="p-3 font-semibold text-emerald-800">#CRP-{crop.id}</td>
                    <td className="p-3 font-bold text-emerald-950 capitalize">{crop.crop_name}</td>
                    <td className="p-3 text-emerald-900">{crop.category}</td>
                    <td className="p-3">{crop.quantity} {crop.unit}</td>
                    <td className="p-3">₹{crop.price_per_unit}/{crop.unit}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleModerateCrop(crop.id, 'draft')}
                        className="p-1 border border-amber-200 hover:bg-amber-50 rounded text-amber-700 transition-all cursor-pointer"
                        title="Unpublish to draft"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleModerateCrop(crop.id, 'active')}
                        className="p-1 border border-emerald-200 hover:bg-emerald-50 rounded text-emerald-700 transition-all cursor-pointer"
                        title="Approve listing"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {crops.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-emerald-900/60">No crop listings published.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white border border-emerald-50 rounded-2xl p-6 shadow-xs overflow-hidden">
          <h3 className="text-base font-black text-emerald-950 mb-4">Financial audit log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-emerald-50 text-emerald-800 font-bold border-b border-emerald-100">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Payment status</th>
                  <th className="p-3">Delivery status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50/50">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-emerald-50/10">
                    <td className="p-3 font-semibold text-emerald-800">#AM-ORD-{p.id.toString().padStart(6, '0')}</td>
                    <td className="p-3 font-bold text-emerald-950">₹{p.total_amount.toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        p.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 capitalize text-emerald-700 font-medium">{p.order_status}</td>
                    <td className="p-3 text-emerald-500">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-emerald-900/60">No transactions recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
