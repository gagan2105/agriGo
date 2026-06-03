import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, LogOut, ShoppingCart, MessageSquare, Menu, X, User } from 'lucide-react';
import { authService } from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  useEffect(() => {
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [token, storedUser, location]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-emerald-700 text-white shadow-sm'
        : 'text-emerald-950 hover:bg-emerald-50 hover:text-emerald-800'
    }`;

  return (
    <nav className="glass-panel sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-emerald-600 p-2 rounded-lg text-white shadow-md">
                <Leaf className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-emerald-900">
                AgriMarket
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/" className={linkClass('/')}>Home</Link>
            
            {user && (
              <>
                {user.role === 'farmer' && (
                  <>
                    <Link to="/farmer-dashboard" className={linkClass('/farmer-dashboard')}>Dashboard</Link>
                    <Link to="/chat" className={linkClass('/chat')}>Chats</Link>
                  </>
                )}
                {user.role === 'buyer' && (
                  <>
                    <Link to="/marketplace" className={linkClass('/marketplace')}>Marketplace</Link>
                    <Link to="/cart" className={linkClass('/cart')}>Cart</Link>
                    <Link to="/buyer-dashboard" className={linkClass('/buyer-dashboard')}>My Orders</Link>
                    <Link to="/chat" className={linkClass('/chat')}>Chats</Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin-dashboard" className={linkClass('/admin-dashboard')}>Admin Panel</Link>
                  </>
                )}
                {user.role === 'delivery' && (
                  <>
                    <Link to="/delivery-dashboard" className={linkClass('/delivery-dashboard')}>Shipments</Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right Profile / Authentication Button */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                  <User className="h-4 w-4 text-emerald-700" />
                  <span className="text-sm font-semibold text-emerald-800 capitalize">
                    {user.name} ({user.role})
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-md text-sm font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-emerald-800 hover:text-emerald-950 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-emerald-900 hover:text-emerald-700 p-2 rounded-md transition-colors focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-white border-t border-emerald-50 space-y-1 shadow-inner">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-emerald-900 hover:bg-emerald-50"
          >
            Home
          </Link>
          {user ? (
            <>
              {user.role === 'farmer' && (
                <>
                  <Link
                    to="/farmer-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-emerald-900 hover:bg-emerald-50"
                  >
                    Farmer Dashboard
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-emerald-900 hover:bg-emerald-50"
                  >
                    Chats
                  </Link>
                </>
              )}
              {user.role === 'buyer' && (
                <>
                  <Link
                    to="/marketplace"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-emerald-900 hover:bg-emerald-50"
                  >
                    Marketplace
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-emerald-900 hover:bg-emerald-50"
                  >
                    Cart
                  </Link>
                  <Link
                    to="/buyer-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-emerald-900 hover:bg-emerald-50"
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-emerald-900 hover:bg-emerald-50"
                  >
                    Chats
                  </Link>
                </>
              )}
              {user.role === 'admin' && (
                <Link
                  to="/admin-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-emerald-900 hover:bg-emerald-50"
                >
                  Admin Panel
                </Link>
              )}
              {user.role === 'delivery' && (
                <Link
                  to="/delivery-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-emerald-900 hover:bg-emerald-50"
                >
                  Shipments
                </Link>
              )}
              <div className="pt-4 border-t border-emerald-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-800 capitalize">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-md text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="pt-4 border-t border-emerald-100 flex space-x-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center px-4 py-2 border border-emerald-600 rounded-md text-emerald-800 text-sm font-medium hover:bg-emerald-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center px-4 py-2 bg-emerald-600 rounded-md text-white text-sm font-medium hover:bg-emerald-700 shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
