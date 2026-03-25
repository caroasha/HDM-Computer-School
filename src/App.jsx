import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AdminAuthProvider, PortalAuthProvider, useAdminAuth, usePortalAuth } from './hooks/useAuth';
import { AdminLayout } from './layouts/AdminLayout';
import { PortalLayout } from './layouts/PortalLayout';
import { Landing } from './pages/landing/Landing';
import { Dashboard } from './pages/admin/Dashboard';
import { Students } from './pages/admin/Students';
import { Employees } from './pages/admin/Employees';
import { Fees } from './pages/admin/Fees';
import { Accounts } from './pages/admin/Accounts';
import { Inventory } from './pages/admin/Inventory';
import { Reports } from './pages/admin/Reports';
import { Settings } from './pages/admin/Settings';
import { PortalUsers } from './pages/admin/PortalUsers';
import { Applications } from './pages/admin/Applications'; // <-- ADDED
import { PortalLogin } from './pages/portal/Login';
import { PortalRegister } from './pages/portal/Register';
import { PortalDashboard } from './pages/portal/Dashboard';
import { PortalProfile } from './pages/portal/Profile';
import { PortalPayments } from './pages/portal/Payments';

// Admin protected route wrapper
const AdminRoute = ({ children }) => {
  const { user, loading } = useAdminAuth();
  if (loading) return <div className="text-center py-10">Loading...</div>;
  return user ? children : <Navigate to="/admin/login" />;
};

// Portal protected route wrapper
const PortalRoute = ({ children }) => {
  const { user, loading } = usePortalAuth();
  if (loading) return <div className="text-center py-10">Loading...</div>;
  return user ? children : <Navigate to="/portal/login" />;
};

// Admin login page
const AdminLogin = () => {
  const { login, user } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate('/admin');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (!result.success) setError(result.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-primary mb-6">Admin Login</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full btn-primary py-2">Login</button>
        </form>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <PortalAuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="employees" element={<Employees />} />
              <Route path="fees" element={<Fees />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="portal-users" element={<PortalUsers />} />
              <Route path="applications" element={<Applications />} /> {/* <-- ADDED */}
            </Route>

            {/* Portal routes */}
            <Route path="/portal/login" element={<PortalLogin />} />
            <Route path="/portal/register" element={<PortalRegister />} />
            <Route path="/portal" element={<PortalRoute><PortalLayout /></PortalRoute>}>
              <Route index element={<PortalDashboard />} />
              <Route path="dashboard" element={<PortalDashboard />} />
              <Route path="profile" element={<PortalProfile />} />
              <Route path="payments" element={<PortalPayments />} />
            </Route>
          </Routes>
        </PortalAuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;