import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, UserPlus, MapPin, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('farmer');
  
  // General Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(17.3850); // Default Hyderabad
  const [longitude, setLongitude] = useState(78.4867);
  const [gpsStatus, setGpsStatus] = useState('Not Acquired');

  // Farmer Specific Fields
  const [farmName, setFarmName] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [experience, setExperience] = useState('');
  const [certifications, setCertifications] = useState('');
  const [bankDetails, setBankDetails] = useState('');

  // Buyer Specific Fields
  const [businessName, setBusinessName] = useState('');
  const [buyerType, setBuyerType] = useState('consumer');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const simulateGPS = () => {
    // Generate slight random variations around Andhra/Telangana coordinates
    const lat = 16.5 + (Math.random() - 0.5) * 1.5;
    const lng = 79.5 + (Math.random() - 0.5) * 1.5;
    setLatitude(Number(lat.toFixed(4)));
    setLongitude(Number(lng.toFixed(4)));
    setGpsStatus('GPS coordinates active');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setError('Please fill in all general credentials.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      name,
      email,
      phone,
      password,
      role,
      address,
      latitude,
      longitude,
      farmer: role === 'farmer' ? {
        farm_name: farmName || `${name}'s Farm`,
        farm_size: Number(farmSize) || 0.0,
        experience: Number(experience) || 0,
        certifications,
        bank_details: bankDetails
      } : null,
      buyer: role === 'buyer' ? {
        business_name: businessName || `${name} Store`,
        buyer_type: buyerType
      } : null
    };

    try {
      await authService.register(payload);
      alert('Registration successful! Redirecting to login page.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Registration failed. Check inputs or email collisions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full glass-panel border border-emerald-100 rounded-3xl overflow-hidden shadow-2xl p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-emerald-600 rounded-2xl text-white flex items-center justify-center shadow-md">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-emerald-950">Join AgriMarket</h2>
          <p className="text-xs text-emerald-800">
            Select your account type and fill in registration credentials.
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="flex border border-emerald-100 rounded-xl overflow-hidden bg-emerald-50/20 p-1">
          {['farmer', 'buyer', 'delivery'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 text-xs font-bold capitalize rounded-lg transition-all cursor-pointer ${
                role === r
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-950 hover:bg-emerald-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-2.5 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest border-b border-emerald-50 pb-1">
            General Details
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-emerald-950">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs focus:outline-none"
                placeholder="Rao Prasad"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-emerald-950">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs focus:outline-none"
                placeholder="rao@farm.com"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-emerald-950">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs focus:outline-none"
                placeholder="9876543210"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-emerald-950">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-emerald-950">Physical Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs focus:outline-none"
                placeholder="Guntur Market Yard, Andhra Pradesh"
              />
            </div>

            {/* GPS Simulation */}
            <div className="sm:col-span-2 flex items-center justify-between p-3 bg-emerald-50/30 rounded-xl border border-emerald-50">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <div className="text-left">
                  <span className="text-[10px] font-bold block text-emerald-900">Geographic Location</span>
                  <span className="text-[9px] text-emerald-600 font-semibold">{gpsStatus}: {latitude}, {longitude}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={simulateGPS}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs cursor-pointer"
              >
                Acquire GPS
              </button>
            </div>
          </div>

          {/* Farmer Specific Fields */}
          {role === 'farmer' && (
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest border-b border-emerald-50 pb-1">
                Farm Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-emerald-950">Farm / Co-Op Name</label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    placeholder="Prasad Mango Groves"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-emerald-950">Farm Size (Acres)</label>
                  <input
                    type="number"
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    placeholder="5.2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-emerald-950">Experience (Years)</label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    placeholder="15"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-emerald-950">Certifications</label>
                  <input
                    type="text"
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    placeholder="Organic Cert B-201"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-emerald-950">Bank Account Details (for Revenue Payouts)</label>
                  <input
                    type="text"
                    value={bankDetails}
                    onChange={(e) => setBankDetails(e.target.value)}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    placeholder="SBI Acc 123456789 - IFSC SBIN0001"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Buyer Specific Fields */}
          {role === 'buyer' && (
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest border-b border-emerald-50 pb-1">
                Business Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-emerald-950">Business / Store Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    placeholder="Organic Foods Corp"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-emerald-950">Buyer Classification</label>
                  <select
                    value={buyerType}
                    onChange={(e) => setBuyerType(e.target.value)}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2 text-xs focus:outline-none"
                  >
                    <option value="consumer">Direct Consumer</option>
                    <option value="retailer">Retailer / Local Shop</option>
                    <option value="restaurant">Restaurant / Hotel</option>
                    <option value="supermarket">Supermarket chain</option>
                    <option value="wholesaler">Bulk Wholesaler</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Processing Registration...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-emerald-50 text-xs text-emerald-900">
          <span>Already registered? </span>
          <Link to="/login" className="text-emerald-700 font-bold hover:underline">
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
