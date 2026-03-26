import { useState } from 'react';
import api from '../../services/api';
import { formatCurrency, formatShortDate } from '../../utils/formatters';
import { Button } from '../../components/Button';
import { printContent } from '../../utils/print';
import { useSettings } from '../../hooks/useSettings';

export const Reports = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reportType, setReportType] = useState('overview'); // overview, students, employees, fees, inventory, accounts, finance
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [overviewData, setOverviewData] = useState(null);
  const { settings } = useSettings();

  const generateReport = async () => {
    setLoading(true);
    try {
      if (reportType === 'overview') {
        // Fetch all data for HDM Overview
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

        const totalFeesCollected = fees.reduce((sum, f) => sum + f.amount, 0);
        const totalInventoryValue = inventory.reduce((sum, i) => sum + i.value, 0);
        const totalIncome = transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);
        const netBalance = totalIncome - totalExpense;
        const pendingApplications = applications.filter(a => a.status === 'pending').length;
        const acceptedApplications = applications.filter(a => a.status === 'accepted').length;
        const rejectedApplications = applications.filter(a => a.status === 'rejected').length;

        setOverviewData({
          students: students.length,
          employees: employees.length,
          inventoryItems: inventory.length,
          inventoryValue: totalInventoryValue,
          feesCollected: totalFeesCollected,
          applications: applications.length,
          pendingApplications,
          acceptedApplications,
          rejectedApplications,
          totalIncome,
          totalExpense,
          netBalance,
          courses: settings?.courses || [],
          feeStructure: settings?.courses || []
        });
        setData(null);
      } 
      else if (reportType === 'students') {
        const res = await api.get('/students');
        setData(res.data);
        setOverviewData(null);
      } 
      else if (reportType === 'employees') {
        const res = await api.get('/employees');
        setData(res.data);
        setOverviewData(null);
      } 
      else if (reportType === 'fees') {
        const res = await api.get('/fees');
        setData(res.data);
        setOverviewData(null);
      } 
      else if (reportType === 'inventory') {
        const res = await api.get('/inventory');
        setData(res.data);
        setOverviewData(null);
      } 
      else if (reportType === 'accounts') {
        const res = await api.get('/accounts/transactions');
        setData(res.data);
        setOverviewData(null);
      }
      else if (reportType === 'finance') {
        if (!fromDate || !toDate) {
          alert('Please select both dates');
          setLoading(false);
          return;
        }
        const res = await api.get('/accounts/transactions');
        const filtered = res.data.filter(t => new Date(t.date) >= new Date(fromDate) && new Date(t.date) <= new Date(toDate));
        setData(filtered);
        setOverviewData(null);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    if (!data && !overviewData) return;

    let html = '';

    // HDM OVERVIEW REPORT
    if (reportType === 'overview' && overviewData) {
      const coursesTable = overviewData.courses.map(c => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${c.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${c.durationMonths} months</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(c.totalFee)}</td>
        </tr>
      `).join('');

      html = `
        <h2>HDM OVERVIEW REPORT</h2>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <hr/>
        <h3>School Summary</h3>
        <table style="width: 100%; margin: 15px 0;">
           <tr><td style="padding: 6px;"><strong>Total Students:</strong></td><td>${overviewData.students}</td></tr>
           <tr><td style="padding: 6px;"><strong>Total Employees:</strong></td><td>${overviewData.employees}</td></tr>
           <tr><td style="padding: 6px;"><strong>Inventory Items:</strong></td><td>${overviewData.inventoryItems}</td></tr>
           <tr><td style="padding: 6px;"><strong>Inventory Value:</strong></td><td>${formatCurrency(overviewData.inventoryValue)}</td></tr>
           <tr><td style="padding: 6px;"><strong>Total Fees Collected:</strong></td><td>${formatCurrency(overviewData.feesCollected)}</td></tr>
           <tr><td style="padding: 6px;"><strong>Total Income (Accounts):</strong></td><td>${formatCurrency(overviewData.totalIncome)}</td></tr>
           <tr><td style="padding: 6px;"><strong>Total Expenses:</strong></td><td>${formatCurrency(overviewData.totalExpense)}</td></tr>
           <tr><td style="padding: 6px;"><strong>Net Balance:</strong></td><td>${formatCurrency(overviewData.netBalance)}</td></tr>
        </table>

        <h3>Applications Summary</h3>
        <table style="width: 100%; margin: 15px 0;">
           <tr><td style="padding: 6px;"><strong>Total Applications:</strong></td><td>${overviewData.applications}</td></tr>
           <tr><td style="padding: 6px;"><strong>Pending:</strong></td><td>${overviewData.pendingApplications}</td></tr>
           <tr><td style="padding: 6px;"><strong>Accepted:</strong></td><td>${overviewData.acceptedApplications}</td></tr>
           <tr><td style="padding: 6px;"><strong>Rejected:</strong></td><td>${overviewData.rejectedApplications}</td></tr>
        </table>

        <h3>Courses Offered</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background:#f2f2f2;">
              <th style="padding: 8px; border: 1px solid #ddd;">Course Name</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Duration</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Total Fee</th>
            </tr>
          </thead>
          <tbody>${coursesTable}</tbody>
        </table>
      `;
    }
    // STUDENTS REPORT
    else if (reportType === 'students') {
      const rows = data.map(s => {
        const totalFee = settings?.courses?.find(c => c.name === s.course)?.totalFee || 0;
        const balance = totalFee - s.feesPaid;
        return `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${s.regNumber}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${s.name}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${s.course}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(s.feesPaid)}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(balance)}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${s.computerAssigned || '-'}</td>
          </tr>
        `;
      }).join('');
      html = `
        <h2>OFFICIAL STUDENT REPORT</h2>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Students:</strong> ${data.length}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background:#f2f2f2;">
              <th style="padding: 8px; border: 1px solid #ddd;">Reg No</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Name</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Course</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Fees Paid</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Balance</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Computer</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    }
    // EMPLOYEES REPORT
    else if (reportType === 'employees') {
      const rows = data.map(e => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${e.empId}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${e.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${e.duty}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(e.salary)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${e.paymentMethod}</td>
        </tr>
      `).join('');
      html = `
        <h2>OFFICIAL EMPLOYEE REPORT</h2>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Employees:</strong> ${data.length}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background:#f2f2f2;">
              <th style="padding: 8px; border: 1px solid #ddd;">Employee ID</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Name</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Duty</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Salary</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Payment Method</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    }
    // FEES REPORT
    else if (reportType === 'fees') {
      const rows = data.map(f => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatShortDate(f.date)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${f.studentName}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${f.regNumber}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(f.amount)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(f.balanceAfter)}</td>
        </tr>
      `).join('');
      html = `
        <h2>OFFICIAL FEES REPORT</h2>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Payments:</strong> ${data.length}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background:#f2f2f2;">
              <th style="padding: 8px; border: 1px solid #ddd;">Date</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Student</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Reg No</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Amount Paid</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Balance After</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    }
    // INVENTORY REPORT
    else if (reportType === 'inventory') {
      const totalValue = data.reduce((sum, i) => sum + i.value, 0);
      const rows = data.map(i => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${i.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${i.type}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(i.value)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${i.status}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${i.assignedTo ? (i.assignedModel === 'Student' ? 'Student' : 'Employee') : '-'}</td>
        </tr>
      `).join('');
      html = `
        <h2>OFFICIAL INVENTORY REPORT</h2>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Items:</strong> ${data.length}</p>
        <p><strong>Total Value:</strong> ${formatCurrency(totalValue)}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background:#f2f2f2;">
              <th style="padding: 8px; border: 1px solid #ddd;">Name</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Type</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Value</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Status</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Assigned To</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    }
    // ACCOUNTS / TRANSACTIONS REPORT
    else if (reportType === 'accounts') {
      const totalIn = data.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0);
      const totalOut = data.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0);
      const net = totalIn - totalOut;
      const rows = data.map(t => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatShortDate(t.date)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${t.description}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${t.type === 'in' ? 'Income' : 'Expense'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(t.amount)}</td>
        </tr>
      `).join('');
      html = `
        <h2>OFFICIAL ACCOUNTS REPORT</h2>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <h3>Summary</h3>
        <p><strong>Total Income:</strong> ${formatCurrency(totalIn)}</p>
        <p><strong>Total Expenses:</strong> ${formatCurrency(totalOut)}</p>
        <p><strong>Net Balance:</strong> ${formatCurrency(net)}</p>
        <h3>Transaction Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background:#f2f2f2;">
              <th style="padding: 8px; border: 1px solid #ddd;">Date</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Description</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Type</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Amount</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    }
    // FINANCE REPORT (date‑filtered transactions)
    else if (reportType === 'finance') {
      const totalIn = data.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0);
      const totalOut = data.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0);
      const net = totalIn - totalOut;
      const rows = data.map(t => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatShortDate(t.date)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${t.description}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${t.type === 'in' ? 'Income' : 'Expense'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(t.amount)}</td>
        </tr>
      `).join('');
      html = `
        <h2>OFFICIAL FINANCIAL REPORT</h2>
        <p><strong>Period:</strong> ${fromDate} – ${toDate}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <h3>Summary</h3>
        <p><strong>Total Income:</strong> ${formatCurrency(totalIn)}</p>
        <p><strong>Total Expenses:</strong> ${formatCurrency(totalOut)}</p>
        <p><strong>Net Balance:</strong> ${formatCurrency(net)}</p>
        <h3>Transaction Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background:#f2f2f2;">
              <th style="padding: 8px; border: 1px solid #ddd;">Date</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Description</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Type</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Amount</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    }

    printContent(html, `${reportType.toUpperCase()}_Report`, settings);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block mb-1">Report Type</label>
            <select
              className="w-full border p-2 rounded"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <optgroup label="HDM Overview">
                <option value="overview">📊 HDM Overview (All Modules)</option>
              </optgroup>
              <optgroup label="General Reports">
                <option value="students">👨‍🎓 Students</option>
                <option value="employees">👔 Employees</option>
                <option value="fees">💰 Fees</option>
                <option value="inventory">📦 Inventory</option>
                <option value="accounts">💵 Accounts (All Transactions)</option>
                <option value="finance">📈 Finance (Date Range)</option>
              </optgroup>
            </select>
          </div>
          {reportType === 'finance' && (
            <>
              <div>
                <label className="block mb-1">From Date</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1">To Date</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </>
          )}
          <div className="flex gap-2">
            <Button onClick={generateReport} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
            {(data || overviewData) && (
              <Button variant="secondary" onClick={printReport}>
                🖨️ Print Report
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      {(data || overviewData) && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-96 text-sm">
            {reportType === 'overview' && overviewData && `
HDM OVERVIEW
Total Students: ${overviewData.students}
Total Employees: ${overviewData.employees}
Inventory Items: ${overviewData.inventoryItems}
Inventory Value: ${formatCurrency(overviewData.inventoryValue)}
Fees Collected: ${formatCurrency(overviewData.feesCollected)}
Total Income: ${formatCurrency(overviewData.totalIncome)}
Total Expenses: ${formatCurrency(overviewData.totalExpense)}
Net Balance: ${formatCurrency(overviewData.netBalance)}
Applications: ${overviewData.applications} (Pending: ${overviewData.pendingApplications}, Accepted: ${overviewData.acceptedApplications}, Rejected: ${overviewData.rejectedApplications})
Courses: ${overviewData.courses.map(c => c.name).join(', ')}
            `}
            {reportType === 'students' && data && data.map(s => `${s.regNumber} | ${s.name} | ${s.course} | Paid: ${formatCurrency(s.feesPaid)} | Balance: ${formatCurrency((settings?.courses?.find(c => c.name === s.course)?.totalFee || 0) - s.feesPaid)}`).join('\n')}
            {reportType === 'employees' && data && data.map(e => `${e.empId} | ${e.name} | ${e.duty} | ${formatCurrency(e.salary)}`).join('\n')}
            {reportType === 'fees' && data && data.map(f => `${formatShortDate(f.date)} | ${f.studentName} | ${f.regNumber} | ${formatCurrency(f.amount)} | Balance: ${formatCurrency(f.balanceAfter)}`).join('\n')}
            {reportType === 'inventory' && data && data.map(i => `${i.name} | ${i.type} | ${formatCurrency(i.value)} | ${i.status}`).join('\n')}
            {reportType === 'accounts' && data && data.map(t => `${formatShortDate(t.date)} | ${t.description} | ${t.type === 'in' ? 'Income' : 'Expense'} | ${formatCurrency(t.amount)}`).join('\n')}
            {reportType === 'finance' && data && data.map(t => `${formatShortDate(t.date)} | ${t.description} | ${t.type === 'in' ? 'Income' : 'Expense'} | ${formatCurrency(t.amount)}`).join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
};