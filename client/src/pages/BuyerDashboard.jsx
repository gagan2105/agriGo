import React, { useState, useEffect } from 'react';
import { ShoppingBag, HelpCircle, RefreshCw } from 'lucide-react';
import { orderService } from '../services/api';
import OrderCard from '../components/OrderCard';

const BuyerDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBuyerOrders();
  }, []);

  const fetchBuyerOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrders();
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, statusPayload) => {
    try {
      await orderService.updateOrderStatus(orderId, statusPayload);
      fetchBuyerOrders();
    } catch (err) {
      console.error(err);
      alert('Failed to update order.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
      <div className="flex items-center justify-between border-b border-emerald-50 pb-4">
        <div>
          <h2 className="text-2xl font-black text-emerald-950">My Purchase Orders</h2>
          <p className="text-xs text-emerald-600 font-semibold mt-0.5">Track direct shipments and billing statuses</p>
        </div>
        <button
          onClick={fetchBuyerOrders}
          className="p-2 border border-emerald-100 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
          title="Refresh orders list"
        >
          <RefreshCw className="w-4 h-4 text-emerald-800" />
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white border border-emerald-50 rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              user={user}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-emerald-50 rounded-3xl space-y-4 max-w-xl mx-auto">
          <ShoppingBag className="w-12 h-12 text-emerald-300 mx-auto" />
          <h4 className="font-bold text-lg text-emerald-950">No purchase orders placed</h4>
          <p className="text-xs text-emerald-900/60 max-w-xs mx-auto">
            You haven't purchased any farm crops yet. Go to the marketplace to place your first direct order.
          </p>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
