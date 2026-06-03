import React from 'react';
import { Package, Truck, CheckCircle2, Clock, XCircle, CreditCard } from 'lucide-react';

const OrderCard = ({ order, user, onUpdateStatus }) => {
  const isFarmer = user?.role === 'farmer';
  const isBuyer = user?.role === 'buyer';

  const statusIcons = {
    pending: <Clock className="w-5 h-5 text-amber-600" />,
    accepted: <Package className="w-5 h-5 text-blue-600" />,
    shipped: <Truck className="w-5 h-5 text-indigo-600" />,
    delivered: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    cancelled: <XCircle className="w-5 h-5 text-rose-600" />,
  };

  const statusColors = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    accepted: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const currentStatus = order.order_status || 'pending';
  const displayStatus = currentStatus.toUpperCase();

  // Delivery progress bar helper
  const stages = ['pending', 'accepted', 'shipped', 'delivered'];
  const currentStageIndex = stages.indexOf(currentStatus);

  return (
    <div className="bg-white rounded-2xl border border-emerald-50 shadow-sm p-6 space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-50">
        <div>
          <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Order Reference</span>
          <h4 className="text-sm font-black text-emerald-950">#AM-ORD-{order.id.toString().padStart(6, '0')}</h4>
          <span className="text-xs text-emerald-500">Placed on {new Date(order.created_at).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${statusColors[currentStatus]}`}>
            {statusIcons[currentStatus]}
            {displayStatus}
          </span>
          
          <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
            order.payment_status === 'paid' 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
              : 'bg-amber-100 text-amber-800 border-amber-200'
          }`}>
            {order.payment_status === 'paid' ? 'PAID' : 'UNPAID'}
          </span>
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Items Ordered</span>
        {order.items?.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm py-1.5 bg-emerald-50/20 px-3 rounded-lg border border-emerald-50/50">
            <div className="flex flex-col">
              <span className="font-semibold text-emerald-950 capitalize">
                {item.crop?.crop_name || 'Crop Listing'}
              </span>
              <span className="text-xs text-emerald-600">
                Quantity: {item.quantity} {item.crop?.unit || 'kg'}
              </span>
            </div>
            <span className="font-bold text-emerald-900">
              ₹{(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Delivery Progress Bar */}
      {currentStatus !== 'cancelled' && (
        <div className="py-4">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-600 mb-2">
            <span>Placed</span>
            <span>Accepted</span>
            <span>Shipped</span>
            <span>Delivered</span>
          </div>
          <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden flex">
            {stages.map((stage, idx) => (
              <div
                key={stage}
                className={`h-full flex-1 border-r border-white last:border-r-0 transition-all ${
                  idx <= currentStageIndex ? 'bg-emerald-600' : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer / Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-emerald-50">
        <div>
          <span className="text-xs text-emerald-600 block">Total Due</span>
          <span className="text-lg font-black text-emerald-900">₹{order.total_amount.toFixed(2)}</span>
        </div>

        {/* Farmer Specific Actions */}
        {isFarmer && currentStatus === 'pending' && (
          <button
            onClick={() => onUpdateStatus(order.id, { order_status: 'accepted' })}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            Accept Order
          </button>
        )}

        {isFarmer && currentStatus === 'accepted' && (
          <button
            onClick={() => onUpdateStatus(order.id, { order_status: 'shipped' })}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            Dispatch (Ship)
          </button>
        )}

        {/* Buyer Specific Actions */}
        {isBuyer && currentStatus === 'pending' && (
          <button
            onClick={() => onUpdateStatus(order.id, { order_status: 'cancelled' })}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
