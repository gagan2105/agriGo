import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Mail, Lock } from 'lucide-react';
import { authService } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Authenticate and fetch token
      const loginResp = await authService.login(email, password);
      const { access_token } = loginResp.data;
      localStorage.setItem('token', access_token);

      // 2. Fetch authenticated user profile details
      const userResp = await authService.getMe();
      const user = userResp.data;
      localStorage.setItem('user', JSON.stringify(user));

      // 3. Redirect based on user authorization role
      if (user.role === 'farmer') {
        navigate('/farmer-dashboard');
      } else if (user.role === 'buyer') {
        navigate('/marketplace');
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'delivery') {
        navigate('/delivery-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 'Incorrect email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-panel border border-emerald-100 rounded-3xl overflow-hidden shadow-2xl p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-emerald-600 rounded-2xl text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-emerald-950">Welcome Back</h2>
          <p className="text-xs text-emerald-800">
            Sign in to access direct farmer-to-buyer tools.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-2.5 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-950 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3 text-xs text-emerald-950 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              placeholder="farmer@agrimarket.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-950 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3 text-xs text-emerald-950 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-emerald-50 text-xs text-emerald-900">
          <span>New to AgriMarket? </span>
          <Link to="/register" className="text-emerald-700 font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
