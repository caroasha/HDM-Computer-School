import { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PrintButton } from '../../components/PrintButton';
import { printContent } from '../../utils/print';
import { usePortalAuth } from '../../hooks/useAuth';

export const PortalPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = usePortalAuth();

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
    const now = new Date();
    const html = `
      <h1>HDM Computer School</h1>
      <h2>Payment Receipt</h2>
      <p><strong>Receipt No:</strong> ${payment._id}</p>
      <p><strong>Date:</strong> ${formatDate(payment.date)}</p>
      <p><strong>Amount:</strong> ${formatCurrency(payment.amount)}</p>
      <p><strong>Balance After:</strong> ${formatCurrency(payment.balanceAfter)}</p>
      <div class="footer">
        <p>Printed: ${now.toLocaleString()}</p>
        <p>Thank you for your patronage. Visit again!</p>
      </div>
    `;
    printContent(html, `Receipt_${payment._id}`);
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