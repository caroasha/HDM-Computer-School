import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PrintButton } from '../../components/PrintButton';
import { printContent } from '../../utils/print';
import { usePortalAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';

export const PortalPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = usePortalAuth();
  const { settings } = useSettings();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await api.get('/fees');
        const userPayments = data.filter(f => f.regNumber === user?.regNumber);
        setPayments(userPayments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchPayments();
  }, [user]);

  const printReceipt = (payment) => {
    const html = `
      <h2>OFFICIAL FEE RECEIPT</h2>
      <table style="width: 100%; margin: 20px 0;">
        <tr><td style="padding: 8px;"><strong>Receipt No:</strong></td><td>${payment._id}</td></tr>
        <tr><td style="padding: 8px;"><strong>Date:</strong></td><td>${formatDate(payment.date)}</td></tr>
        <tr><td style="padding: 8px;"><strong>Student Name:</strong></td><td>${payment.studentName}</td></tr>
        <tr><td style="padding: 8px;"><strong>Registration No:</strong></td><td>${payment.regNumber}</td></tr>
        <tr><td style="padding: 8px;"><strong>Amount Paid:</strong></td><td>${formatCurrency(payment.amount)}</td></tr>
        <tr><td style="padding: 8px;"><strong>Balance After:</strong></td><td>${formatCurrency(payment.balanceAfter)}</td></tr>
      </table>
    `;
    printContent(html, `Receipt_${payment._id}`, settings);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Payment History</h2>
        {payments.length === 0 ? (
          <p className="text-gray-500">No payments found.</p>
        ) : (
          <div className="space-y-3">
            {payments.map(p => (
              <div key={p._id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">{formatDate(p.date)}</p>
                  <p className="text-sm text-gray-500">Balance after: {formatCurrency(p.balanceAfter)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-green-600 font-bold">{formatCurrency(p.amount)}</span>
                  <PrintButton onClick={() => printReceipt(p)}>Receipt</PrintButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};