import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { PrintButton } from '../../components/PrintButton';
import { printContent } from '../../utils/print';
import { useSettings } from '../../hooks/useSettings';

export const Fees = () => {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  const fetchData = async () => {
    try {
      const [studentsRes, feesRes] = await Promise.all([api.get('/students'), api.get('/fees')]);
      setStudents(studentsRes.data);
      setFees(feesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !amount || amount <= 0) {
      alert('Please select a student and enter a valid amount');
      return;
    }
    try {
      await api.post('/fees', { regNumber: selectedStudent.regNumber, amount: parseFloat(amount) });
      setModalOpen(false);
      setSelectedStudent(null);
      setAmount('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

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
          <tr><td><strong>Receipt No:</strong></td><td>${fee._id}</td></tr>
          <tr><td><strong>Date:</strong></td><td>${formatDate(fee.date)}</td></tr>
          <tr><td><strong>Student Name:</strong></td><td>${fee.studentName}</td></tr>
          <tr><td><strong>Registration No:</strong></td><td>${fee.regNumber}</td></tr>
          <tr><td><strong>Amount Paid:</strong></td><td style="font-size: 18px; font-weight: bold; color: #2ecc71;">${formatCurrency(fee.amount)}</td></tr>
          <tr><td><strong>Balance After:</strong></td><td>${formatCurrency(fee.balanceAfter)}</td></tr>
        </table>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #2f86eb; text-align: center; font-size: 12px; color: #666;">
          <p><strong>${schoolName}</strong> | ${address}</p>
          <p>Printed: ${now.toLocaleString()}</p>
          <p>${motto}</p>
        </div>
      </div>
    `;
    printContent(html, `Receipt_${fee._id}`, settings);
  };

  const printFeesReport = () => {
    const now = new Date();
    const schoolName = settings?.schoolName || 'HDM Computer School';
    const motto = settings?.motto || 'Technology for Tomorrow';
    const address = settings?.address || '';
    const phone = settings?.phone || '';
    const email = settings?.email || '';

    let rows = '';
    students.forEach(s => {
      const totalFee = settings?.courses?.find(c => c.name === s.course)?.totalFee || 0;
      const balance = totalFee - (s.feesPaid || 0);
      rows += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${s.regNumber}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${s.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${s.course}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(s.feesPaid || 0)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(balance)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${balance <= 0 ? 'Paid' : 'Pending'}</td>
        </tr>
      `;
    });

    const html = `
      <div style="max-width: 800px; margin: 0 auto;">
        <h1>${schoolName}</h1>
        <p style="text-align: center; font-style: italic;">${motto}</p>
        <p style="text-align: center;">${address}</p>
        <p style="text-align: center;">📞 ${phone} | ✉️ ${email}</p>
        <hr/>
        <h2>OFFICIAL FEES REPORT</h2>
        <p><strong>Generated:</strong> ${now.toLocaleString()}</p>
        <p><strong>Total Students:</strong> ${students.length}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background:#f2f2f2;">
              <th style="padding: 10px; border: 1px solid #ddd;">Reg No</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Student Name</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Course</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Amount Paid</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Balance</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top: 40px; text-align: center; font-size: 12px;">
          <p>${schoolName} | ${address}</p>
          <p>Printed: ${now.toLocaleString()}</p>
          <p>${motto}</p>
        </div>
      </div>
    `;
    printContent(html, 'Fees_Report', settings);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fees Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setModalOpen(true)}>➕ Record Payment</Button>
          <PrintButton onClick={printFeesReport}>Print Report</PrintButton>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
        {fees.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No payments recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {fees.slice(0, 10).map(f => (
              <div key={f._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{formatDate(f.date)}</p>
                  <p className="text-sm text-gray-600">{f.studentName} ({f.regNumber})</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-green-600 font-bold">{formatCurrency(f.amount)}</span>
                  <PrintButton onClick={() => printReceipt(f)}>Print Receipt</PrintButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Fee Payment">
        <form onSubmit={handlePayment}>
          <div className="mb-4">
            <label className="block mb-1">Select Student</label>
            <select className="w-full border p-2 rounded" value={selectedStudent?.regNumber || ''} onChange={e => setSelectedStudent(students.find(s => s.regNumber === e.target.value))} required>
              <option value="">Choose student...</option>
              {students.map(s => (
                <option key={s._id} value={s.regNumber}>{s.regNumber} – {s.name} ({s.course})</option>
              ))}
            </select>
          </div>
          {selectedStudent && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p><strong>Course:</strong> {selectedStudent.course}</p>
              <p><strong>Total Fee:</strong> {formatCurrency(settings?.courses?.find(c => c.name === selectedStudent.course)?.totalFee || 0)}</p>
              <p><strong>Amount Paid:</strong> {formatCurrency(selectedStudent.feesPaid)}</p>
              <p><strong>Balance:</strong> {formatCurrency((settings?.courses?.find(c => c.name === selectedStudent.course)?.totalFee || 0) - selectedStudent.feesPaid)}</p>
            </div>
          )}
          <div className="mb-6">
            <label className="block mb-1">Amount (KES)</label>
            <input type="number" step="any" className="w-full border p-2 rounded" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter payment amount" required />
          </div>
          <Button type="submit" className="w-full">Record Payment</Button>
        </form>
      </Modal>
    </div>
  );
};