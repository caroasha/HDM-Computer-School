import { Outlet, Link, NavLink } from 'react-router-dom';
import { usePortalAuth } from '../hooks/useAuth';

export const PortalLayout = () => {
  const { user, logout } = usePortalAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">HDM Student Portal</h1>
          {user && (
            <nav className="flex items-center gap-6">
              <NavLink to="/portal/dashboard" className={({ isActive }) => `text-gray-700 hover:text-primary ${isActive ? 'font-semibold text-primary' : ''}`}>Dashboard</NavLink>
              <NavLink to="/portal/profile" className={({ isActive }) => `text-gray-700 hover:text-primary ${isActive ? 'font-semibold text-primary' : ''}`}>Profile</NavLink>
              {user.role === 'student' && (
                <NavLink to="/portal/payments" className={({ isActive }) => `text-gray-700 hover:text-primary ${isActive ? 'font-semibold text-primary' : ''}`}>Payments</NavLink>
              )}
              <button onClick={logout} className="text-red-600 hover:text-red-800">Logout</button>
            </nav>
          )}
        </div>
      </header>
      <div className="container mx-auto px-6 py-8">
        <Outlet />
      </div>
    </div>
  );
};