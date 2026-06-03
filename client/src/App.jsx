import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './services/store';

// Component imports
import Navbar from './components/Navbar';
import AIChatbot from './components/AIChatbot';

// Page imports
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Marketplace from './pages/Marketplace';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import Chat from './pages/Chat';

// Protected Route Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not authorized, redirect to home page
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const location = useLocation();
  const isDashboardRoute =
    location.pathname.startsWith('/farmer-dashboard') ||
    location.pathname.startsWith('/admin-dashboard') ||
    location.pathname.startsWith('/delivery-dashboard');

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9f6]">
      {/* Shared Header Navigation */}
      {!isDashboardRoute && <Navbar />}
      
      {/* Main Views */}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Farmer Portal Pages */}
          <Route
            path="/farmer-dashboard"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Buyer Portal Pages */}
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <Marketplace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer-dashboard"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Portal Page */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Delivery Portal Page */}
          <Route
            path="/delivery-dashboard"
            element={
              <ProtectedRoute allowedRoles={['delivery']}>
                <DeliveryDashboard />
              </ProtectedRoute>
            }
          />

          {/* Shared Protected Pages */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute allowedRoles={['farmer', 'buyer', 'admin', 'delivery']}>
                <Chat />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      {!isDashboardRoute && (
        <footer className="bg-emerald-950 text-white border-t border-emerald-900 py-6 text-center text-xs shadow-inner">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="font-semibold">🌾 AntiGravity AgriMarket — Eliminating Broker Commission Exploitations</p>
            <p className="text-emerald-400/70 font-light">© 2026 AgriMarket Platforms. Production Ready and Fully Scale Secured.</p>
          </div>
        </footer>
      )}

      {/* Floating AI Assistant Chatbot */}
      <AIChatbot />
    </div>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
};

export default App;
