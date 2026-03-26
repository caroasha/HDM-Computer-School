import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/Button';
import { FeeStructureModal } from '../../components/FeeStructureModal';
import { BrochureModal } from '../../components/BrochureModal';
import { useSettings } from '../../hooks/useSettings';
import { useAdminAuth } from '../../hooks/useAuth';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    employees: 0,
    inventoryValue: 0,
    feesCollected: 0,
    applications: 0,
    pendingApplications: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [brochureModalOpen, setBrochureModalOpen] = useState(false);
  const { settings } = useSettings();
  const { user } = useAdminAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [studentsRes, employeesRes, inventoryRes, feesRes, applicationsRes, transactionsRes] = await Promise.all([
          api.get('/students'),
          api.get('/employees'),
          api.get('/inventory'),
          api.get('/fees'),
          api.get('/applications'),
          api.get('/accounts/transactions')
        ]);

        const students = studentsRes.data;
        const employees = employeesRes.data;
        const inventory = inventoryRes.data;
        const fees = feesRes.data;
        const applications = applicationsRes.data;
        const transactions = transactionsRes.data;

        const inventoryValue = inventory.reduce((sum, i) => sum + (i.value || 0), 0);
        const feesCollected = fees.reduce((sum, f) => sum + f.amount, 0);
        const pendingApps = applications.filter(a => a.status === 'pending').length;

        setStats({
          students: students.length,
          employees: employees.length,
          inventoryValue,
          feesCollected,
          applications: applications.length,
          pendingApplications: pendingApps
        });
        setRecentApplications(applications.slice(0, 5));
        setRecentTransactions(transactions.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setBrochureModalOpen(true)}>
            📖 View Brochure
          </Button>
          <Button variant="secondary" onClick={() => setFeeModalOpen(true)}>
            💰 Fee Structure
          </Button>
        </div>
      </div>

      {/* Welcome Card */}
      <div className="card mb-6 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-primary">Welcome back, {user?.name}!</h2>
            <p className="text-gray-600 mt-1">{settings?.motto || 'Technology for Tomorrow'}</p>
          </div>
          <div className="text-right mt-2 sm:mt-0">
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards – Responsive, no truncation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="card text-center hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Total Students</p>
          <p className="text-xl sm:text-2xl font-bold text-primary break-words">{stats.students}</p>
          <Link to="/admin/students" className="text-xs text-blue-500 hover:underline inline-block">View all</Link>
        </div>
        <div className="card text-center hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Total Employees</p>
          <p className="text-xl sm:text-2xl font-bold text-primary break-words">{stats.employees}</p>
          <Link to="/admin/employees" className="text-xs text-blue-500 hover:underline inline-block">View all</Link>
        </div>
        <div className="card text-center hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Inventory Value</p>
          <p className="text-base sm:text-xl font-bold text-green-600 break-words">{formatCurrency(stats.inventoryValue)}</p>
          <Link to="/admin/inventory" className="text-xs text-blue-500 hover:underline inline-block">Manage</Link>
        </div>
        <div className="card text-center hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Fees Collected</p>
          <p className="text-base sm:text-xl font-bold text-green-600 break-words">{formatCurrency(stats.feesCollected)}</p>
          <Link to="/admin/fees" className="text-xs text-blue-500 hover:underline inline-block">View report</Link>
        </div>
        <div className="card text-center hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Total Applications</p>
          <p className="text-xl sm:text-2xl font-bold text-primary break-words">{stats.applications}</p>
          <Link to="/admin/applications" className="text-xs text-blue-500 hover:underline inline-block">Manage</Link>
        </div>
        <div className="card text-center hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600 break-words">{stats.pendingApplications}</p>
          <Link to="/admin/applications" className="text-xs text-blue-500 hover:underline inline-block">Review</Link>
        </div>
      </div>

      {/* Quick Actions & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/students" className="bg-blue-50 p-3 rounded-lg text-center hover:bg-blue-100 transition">
              <i className="fas fa-user-graduate text-blue-600 text-xl mb-1 block"></i>
              <span className="text-sm">Enroll Student</span>
            </Link>
            <Link to="/admin/employees" className="bg-green-50 p-3 rounded-lg text-center hover:bg-green-100 transition">
              <i className="fas fa-user-tie text-green-600 text-xl mb-1 block"></i>
              <span className="text-sm">Add Employee</span>
            </Link>
            <Link to="/admin/fees" className="bg-yellow-50 p-3 rounded-lg text-center hover:bg-yellow-100 transition">
              <i className="fas fa-money-bill-wave text-yellow-600 text-xl mb-1 block"></i>
              <span className="text-sm">Record Payment</span>
            </Link>
            <Link to="/admin/accounts" className="bg-purple-50 p-3 rounded-lg text-center hover:bg-purple-100 transition">
              <i className="fas fa-chart-line text-purple-600 text-xl mb-1 block"></i>
              <span className="text-sm">Add Expense</span>
            </Link>
            <Link to="/admin/inventory" className="bg-indigo-50 p-3 rounded-lg text-center hover:bg-indigo-100 transition">
              <i className="fas fa-boxes text-indigo-600 text-xl mb-1 block"></i>
              <span className="text-sm">Add Asset</span>
            </Link>
            <Link to="/admin/reports" className="bg-gray-50 p-3 rounded-lg text-center hover:bg-gray-100 transition">
              <i className="fas fa-file-alt text-gray-600 text-xl mb-1 block"></i>
              <span className="text-sm">Generate Report</span>
            </Link>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Recent Applications</h3>
            <Link to="/admin/applications" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {recentApplications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No applications yet.</p>
          ) : (
            <div className="space-y-2">
              {recentApplications.map(app => (
                <div key={app._id} className="flex justify-between items-center p-2 border-b">
                  <div>
                    <p className="font-medium">{app.name}</p>
                    <p className="text-xs text-gray-500">{app.course}</p>
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions – with horizontal scroll on small screens */}
      <div className="card mb-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <Link to="/admin/accounts" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        {recentTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions yet.</p>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Amount</th>
               </tr>
            </thead>
            <tbody>
              {recentTransactions.map(tx => (
                <tr key={tx._id} className="border-t">
                  <td className="p-2 text-sm">{new Date(tx.date).toLocaleDateString()} </td>
                  <td className="p-2">{tx.description} </td>
                  <td className="p-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tx.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.type === 'in' ? 'Income' : 'Expense'}
                    </span>
                   </td>
                  <td className={`p-2 font-semibold ${tx.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'in' ? '+' : '-'}{formatCurrency(tx.amount)}
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <FeeStructureModal isOpen={feeModalOpen} onClose={() => setFeeModalOpen(false)} />
      <BrochureModal isOpen={brochureModalOpen} onClose={() => setBrochureModalOpen(false)} />
    </div>
  );
};