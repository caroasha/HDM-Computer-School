import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';

export const AdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, logout } = useAdminAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: '📊' },
    { to: '/admin/students', label: 'Students', icon: '👨‍🎓' },
    { to: '/admin/employees', label: 'Employees', icon: '👔' },
    { to: '/admin/fees', label: 'Fees', icon: '💰' },
    { to: '/admin/accounts', label: 'Accounts', icon: '💵' },
    { to: '/admin/inventory', label: 'Inventory', icon: '📦' },
    { to: '/admin/reports', label: 'Reports', icon: '📈' },
    { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
    { to: '/admin/portal-users', label: 'Portal Users', icon: '👥' },
    { to: '/admin/applications', label: 'Applications', icon: '📋' }, // <-- ADDED
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-primary">{settings?.schoolName || 'HDM School'}</h1>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <span>👤 {user?.name}</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{user?.role}</span>
            </div>
            <button onClick={handleLogout} className="w-full btn-secondary text-sm">Logout</button>
          </div>
        </div>
      </aside>

      <button className="fixed top-4 left-4 z-40 md:hidden bg-white p-2 rounded shadow" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>

      <main className="flex-1 ml-0 md:ml-64 overflow-auto">
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
            <div className="text-right">
              <p className="text-lg font-medium text-primary">{currentTime.toLocaleTimeString()}</p>
              <p className="text-sm text-gray-500">{currentTime.toLocaleDateString()}</p>
            </div>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};