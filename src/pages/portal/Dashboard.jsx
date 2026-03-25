import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatCurrency, formatDate, formatShortDate } from '../../utils/formatters';
import { Button } from '../../components/Button';
import { PrintButton } from '../../components/PrintButton';
import { printContent } from '../../utils/print';
import { usePortalAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import { FeeStructureModal } from '../../components/FeeStructureModal';

export const PortalDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const { user, logout } = usePortalAuth();
  const { settings } = useSettings();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('portal_token');
        if (!token) {
          setError('No authentication token found. Please login again.');
          setLoading(false);
          return;
        }

        const { data } = await api.get('/portal/profile');
        setProfile(data);
        if (data.portalUser.role === 'student' && data.feeSummary) {
          setFees(data.feeSummary.payments || []);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          setError('Session expired. Please login again.');
          localStorage.removeItem('portal_token');
          localStorage.removeItem('portal_user');
          setTimeout(() => logout(), 2000);
        } else {
          setError(err.response?.data?.message || 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [logout]);

  const printReceipt = (fee) => {
    const now = new Date();
    const schoolName = settings?.schoolName || 'HDM Computer School';
    const motto = settings?.motto || 'Technology for Tomorrow';
    const address = settings?.address || '';
    const phone = settings?.phone || '';
    const email = settings?.email || '';

    const html = `
      <div style="max-width: 600px; margin: 0 auto;">
        <h1>${schoolName}</h1>
        <p style="text-align: center; font-style: italic;">${motto}</p>
        <p style="text-align: center;">${address}</p>
        <p style="text-align: center;">📞 ${phone} | ✉️ ${email}</p>
        <hr/>
        <h2>OFFICIAL FEE RECEIPT</h2>
        
        <table style="width: 100%; margin: 20px 0;">
          <tr><td><strong>Receipt No:</strong></td><td>${fee.id || fee._id}</td></tr>
          <tr><td><strong>Date:</strong></td><td>${formatDate(fee.date)}</td></tr>
          <tr><td><strong>Student:</strong></td><td>${profile?.userData?.name} (${profile?.portalUser?.regNumber})</td></tr>
          <tr><td><strong>Amount Paid:</strong></td><td style="font-size: 18px; font-weight: bold; color: #2ecc71;">${formatCurrency(fee.amount)}</td></tr>
          <tr><td><strong>Balance After:</strong></td><td>${formatCurrency(fee.balanceAfter)}</td></tr>
          ${fee.notes ? `<tr><td><strong>Notes:</strong></td><td>${fee.notes}</td></tr>` : ''}
        </table>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #2f86eb; text-align: center; font-size: 12px; color: #666;">
          <p><strong>${schoolName}</strong> | ${address}</p>
          <p>Printed: ${now.toLocaleString()}</p>
          <p>${motto}</p>
        </div>
      </div>
    `;
    printContent(html, `Receipt_${fee.id || fee._id}`, settings);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-center py-10"><div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div><button onClick={() => window.location.href = '/portal/login'} className="btn-primary mt-4">Go to Login</button></div>;
  if (!profile) return <div>No profile data</div>;

  const { portalUser, userData, feeSummary } = profile;
  const isStudent = portalUser.role === 'student';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-end mb-4">
        <Button variant="secondary" onClick={() => setFeeModalOpen(true)}>💰 View Fee Structure</Button>
      </div>

      <div className="card mb-6">
        <h2 className="text-2xl font-bold mb-4">Welcome, {portalUser.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Registration No:</strong> {portalUser.regNumber}</p>
            <p><strong>Role:</strong> <span className="capitalize">{portalUser.role}</span></p>
            <p><strong>Email:</strong> {portalUser.email}</p>
          </div>
          {isStudent && userData && (
            <div>
              <p><strong>Course:</strong> {userData.course}</p>
              <p><strong>Enrollment Date:</strong> {formatShortDate(userData.enrollmentDate)}</p>
              <p><strong>Completion Date:</strong> {formatShortDate(userData.completionDate)}</p>
              <p><strong>Computer Assigned:</strong> {userData.computerAssigned || 'None'}</p>
            </div>
          )}
          {!isStudent && userData && (
            <div>
              <p><strong>Employee ID:</strong> {userData.empId}</p>
              <p><strong>Duty:</strong> {userData.duty}</p>
              <p><strong>Salary:</strong> {formatCurrency(userData.salary)}</p>
            </div>
          )}
        </div>
      </div>

      {isStudent && feeSummary && (
        <div className="card mb-6">
          <h3 className="text-xl font-semibold mb-2">Fee Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Total Course Fee</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(feeSummary.totalFee)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Amount Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(feeSummary.totalPaid)}</p>
            </div>
            <div className={`p-4 rounded-lg ${feeSummary.balance >= 0 ? 'bg-yellow-50' : 'bg-red-50'}`}>
              <p className="text-gray-600 text-sm">Outstanding Balance</p>
              <p className={`text-2xl font-bold ${feeSummary.balance >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(feeSummary.balance))}
                {feeSummary.balance < 0 && <span className="text-sm ml-1">(Overpaid)</span>}
              </p>
            </div>
          </div>
          {feeSummary.balance > 0 && <div className="mt-4 p-3 bg-yellow-100 rounded-lg text-sm text-yellow-800">⚠️ Outstanding balance: {formatCurrency(feeSummary.balance)}. Please complete your payment.</div>}
          {feeSummary.balance === 0 && <div className="mt-4 p-3 bg-green-100 rounded-lg text-sm text-green-800">✅ Fully paid! Thank you.</div>}
        </div>
      )}

      {isStudent && fees.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Payment History</h3>
          <div className="space-y-2">
            {fees.map((fee, idx) => (
              <div key={fee.id || fee._id || idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{formatDate(fee.date)}</p>
                  <p className="text-sm text-gray-500">Balance after: {formatCurrency(fee.balanceAfter)}</p>
                  {fee.notes && <p className="text-xs text-gray-400">{fee.notes}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-green-600 font-bold">{formatCurrency(fee.amount)}</span>
                  <PrintButton onClick={() => printReceipt(fee)}>Receipt</PrintButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isStudent && fees.length === 0 && (
        <div className="card">
          <p className="text-gray-500 text-center py-4">No payment history found.</p>
          {feeSummary?.balance > 0 && <p className="text-center text-sm text-gray-500">Please visit the admin office to make your payment.</p>}
        </div>
      )}

      <FeeStructureModal isOpen={feeModalOpen} onClose={() => setFeeModalOpen(false)} />
    </div>
  );
};