import React, { useState, useEffect } from 'react';
import { Truck, MapPin, CheckCircle, Navigation, RefreshCw } from 'lucide-react';
import api from '../services/api';

const DeliveryDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/deliveries');
      setDeliveries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/deliveries/${id}`, {
        driver_id: user.id,
        delivery_status: status,
      });
      alert(`Delivery assignment status updated to: ${status}`);
      fetchDeliveries();
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const statusColors = {
    assigned: 'bg-blue-50 text-blue-700 border-blue-200',
    picked_up: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-50 pb-4">
        <div>
          <h2 className="text-2xl font-black text-emerald-950">Logistics Matching Dispatch</h2>
          <p className="text-xs text-emerald-600 font-semibold mt-0.5">Assigned driver routes and cargo tracking</p>
        </div>
        <button
          onClick={fetchDeliveries}
          className="p-2 border border-emerald-100 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
          title="Sync logistics dispatch"
        >
          <RefreshCw className="w-4 h-4 text-emerald-800" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white border border-emerald-50 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      ) : deliveries.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Dispatch Queue list */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-emerald-950">Delivery Queue</h3>
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="bg-white border border-emerald-50 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-950">Cargo #AM-SHP-{delivery.id}</h4>
                    <span className="text-[10px] text-emerald-500">Order Ref: #AM-ORD-{delivery.order_id}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded border ${statusColors[delivery.delivery_status]}`}>
                    {delivery.delivery_status.toUpperCase()}
                  </span>
                </div>

                {/* Route detail */}
                <div className="space-y-1.5 text-xs text-emerald-900 border-t border-b border-emerald-50/50 py-3">
                  <div className="flex items-center gap-1 text-emerald-700">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-bold">Route Path:</span>
                    <span>{delivery.route}</span>
                  </div>
                </div>

                {/* Driver status modifications */}
                <div className="flex gap-2">
                  {delivery.delivery_status === 'assigned' && (
                    <button
                      onClick={() => handleUpdateStatus(delivery.id, 'picked_up')}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      Mark Picked Up
                    </button>
                  )}

                  {delivery.delivery_status === 'picked_up' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(delivery.id, 'delivered')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        Mark Delivered
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(delivery.id, 'failed')}
                        className="py-2 px-4 border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Fail
                      </button>
                    </>
                  )}

                  {delivery.delivery_status === 'delivered' && (
                    <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Shipment Delivered successfully
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Route Mapping Simulator Panel */}
          <div className="bg-emerald-950 text-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-md h-fit">
            <h3 className="text-base font-black flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-400" />
              Live Route Simulator
            </h3>
            <p className="text-xs text-emerald-200 leading-relaxed font-light">
              We calculate distances directly between Farmer crop latitude/longitude and Buyer locations. Drivers bypass warehouse nodes to ensure next-day delivery.
            </p>
            
            <div className="border border-emerald-800 rounded-2xl p-4 bg-emerald-900/40 text-left space-y-6">
              <div className="relative pl-6 space-y-6">
                {/* Vertical connecting line */}
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-emerald-700" />
                
                <div className="relative">
                  <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-emerald-400 border border-emerald-950" />
                  <span className="text-[10px] text-emerald-300 font-bold">START</span>
                  <h4 className="text-xs font-extrabold mt-0.5">Farmer Co-Op Gate</h4>
                  <span className="text-[9px] text-emerald-200/60 block">Verifying cargo load list...</span>
                </div>

                <div className="relative">
                  <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-amber-400 border border-emerald-950" />
                  <span className="text-[10px] text-amber-300 font-bold">TRANSIT</span>
                  <h4 className="text-xs font-extrabold mt-0.5">Haversine GPS Path</h4>
                  <span className="text-[9px] text-emerald-200/60 block">Bypassing local commission brokers (Zero stops)</span>
                </div>

                <div className="relative">
                  <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-blue-400 border border-emerald-950" />
                  <span className="text-[10px] text-blue-300 font-bold">DESTINATION</span>
                  <h4 className="text-xs font-extrabold mt-0.5">Buyer Storefront / Warehouse</h4>
                  <span className="text-[9px] text-emerald-200/60 block">Simulating final drop-off verification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-emerald-50 rounded-3xl space-y-4 max-w-xl mx-auto">
          <Truck className="w-12 h-12 text-emerald-300 mx-auto" />
          <h4 className="font-bold text-lg text-emerald-950">No assigned shipments</h4>
          <p className="text-xs text-emerald-900/60 max-w-xs mx-auto">
            You do not have any delivery assignments. Unassigned orders placed by buyers will show up here.
          </p>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
