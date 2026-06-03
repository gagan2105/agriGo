import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft, CreditCard, Home, CheckCircle2 } from 'lucide-react';
import { removeFromCart, updateQuantity, clearCart } from '../services/store';
import { orderService, paymentService } from '../services/api';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [address, setAddress] = useState(user.address || '');
  const [method, setMethod] = useState('upi'); // 'upi' or 'cash_on_delivery'
  const [loading, setLoading] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.crop.price_per_unit * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 150 : 0; // Flat dispatch rate
  const total = subtotal + deliveryFee;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (!address.trim()) {
      alert('Please fill in a delivery delivery address.');
      return;
    }

    setLoading(true);
    try {
      // 1. Post Order
      const orderPayload = {
        items: cartItems.map((item) => ({
          crop_id: item.crop.id,
          quantity: item.quantity,
        })),
        method: method,
      };

      const orderRes = await orderService.createOrder(orderPayload);
      const newOrder = orderRes.data;

      // 2. Trigger Payment Gateway simulation if UPI
      if (method === 'upi') {
        await paymentService.createPayment({
          order_id: newOrder.id,
          payment_method: 'upi',
        });
      }

      // 3. Reset Cart
      dispatch(clearCart());
      alert('Purchase order placed successfully! Direct dispatch assigned.');
      navigate('/buyer-dashboard');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to complete order. Inventory may have changed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
      <div className="flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-emerald-800" />
        <h2 className="text-2xl font-black text-emerald-950">Shopping Cart</h2>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Item details list (Col 8) */}
          <div className="lg:col-span-7 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.crop.id}
                className="bg-white border border-emerald-50 rounded-2xl p-4 flex items-center gap-4 justify-between shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-emerald-50 border border-emerald-50 shrink-0">
                    <img
                      src={item.crop.image_url || 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=150&q=80'}
                      alt={item.crop.crop_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm text-emerald-950 capitalize">{item.crop.crop_name}</h4>
                    <span className="text-xs text-emerald-600 block">₹{item.crop.price_per_unit}/{item.crop.unit}</span>
                    <button
                      onClick={() => dispatch(removeFromCart(item.crop.id))}
                      className="mt-1 flex items-center gap-1 text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Quantity input */}
                  <div className="flex items-center border border-emerald-200 rounded-lg overflow-hidden h-8 bg-emerald-50/50">
                    <button
                      onClick={() => dispatch(updateQuantity({ cropId: item.crop.id, quantity: Math.max(1, item.quantity - 1) }))}
                      className="px-2 hover:bg-emerald-100 font-bold text-emerald-900 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 font-bold text-xs text-emerald-950">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ cropId: item.crop.id, quantity: Math.min(item.crop.quantity, item.quantity + 1) }))}
                      className="px-2 hover:bg-emerald-100 font-bold text-emerald-900 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  
                  <span className="font-extrabold text-sm text-emerald-950 w-20 text-right">
                    ₹{(item.crop.price_per_unit * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}

            <button
              onClick={() => navigate('/marketplace')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </button>
          </div>

          {/* Checkout billing details panel (Col 5) */}
          <div className="lg:col-span-5 bg-white border border-emerald-50 rounded-3xl p-6 sm:p-8 shadow-sm h-fit space-y-6">
            <h3 className="text-base font-black text-emerald-950 pb-2 border-b border-emerald-50">
              Billing Summary
            </h3>

            <div className="space-y-2 text-xs text-emerald-900">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Direct Farmer Delivery Dispatch</span>
                <span className="font-bold">₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-950 font-black border-t border-emerald-50 pt-2.5 text-sm">
                <span>Total Due</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Form fields */}
            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-emerald-700" />
                  Delivery Destination Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, Zipcode"
                  className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2.5 text-xs text-emerald-950 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                  Payment Option
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod('upi')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      method === 'upi'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-emerald-50/50 border-emerald-100 text-emerald-950 hover:bg-emerald-50'
                    }`}
                  >
                    UPI Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('cash_on_delivery')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      method === 'cash_on_delivery'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-emerald-50/50 border-emerald-100 text-emerald-950 hover:bg-emerald-50'
                    }`}
                  >
                    Cash on Delivery
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Processing Transaction...' : 'Place Direct Order'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-emerald-50 rounded-3xl space-y-4 max-w-xl mx-auto">
          <ShoppingCart className="w-12 h-12 text-emerald-300 mx-auto" />
          <h4 className="font-bold text-lg text-emerald-950">Your cart is empty</h4>
          <p className="text-xs text-emerald-900/60 max-w-xs mx-auto">
            Browse our AgriMarket catalog to add organic crops directly from nearby farms.
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            Go to Marketplace
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
