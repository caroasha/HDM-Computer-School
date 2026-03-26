import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { PrintButton } from '../../components/PrintButton';
import { printContent } from '../../utils/print';

export const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ 
    name: '', age: '', gender: '', phone: '', idNumber: '', 
    duty: '', salary: '', paymentMethod: 'bank', paymentOption: 'Monthly', 
    bankAccount: '', bankBranch: '', mpesaNumber: '' 
  });
  const [editing, setEditing] = useState(null);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees');
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/employees/${editing._id}`, form);
        alert('Employee updated successfully');
      } else {
        const response = await api.post('/employees', form);
        alert(`Employee created successfully!\nEmployee ID: ${response.data.empId}`);
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ 
        name: '', age: '', gender: '', phone: '', idNumber: '', 
        duty: '', salary: '', paymentMethod: 'bank', paymentOption: 'Monthly', 
        bankAccount: '', bankBranch: '', mpesaNumber: '' 
      });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving employee');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees();
      } catch (err) {
        alert(err.response?.data?.message);
      }
    }
  };

  const handlePaySalary = async (id) => {
    if (confirm('Record salary payment?')) {
      try {
        await api.post(`/employees/${id}/pay`);
        alert('Salary payment recorded successfully');
      } catch (err) {
        alert(err.response?.data?.message);
      }
    }
  };

  const openEdit = (emp) => {
    setEditing(emp);
    setForm({
      name: emp.name,
      age: emp.age,
      gender: emp.gender,
      phone: emp.phone,
      idNumber: emp.idNumber,
      duty: emp.duty,
      salary: emp.salary,
      paymentMethod: emp.paymentMethod,
      paymentOption: emp.paymentOption,
      bankAccount: emp.bankAccount || '',
      bankBranch: emp.bankBranch || '',
      mpesaNumber: emp.mpesaNumber || '',
    });
    setModalOpen(true);
  };

  const printList = () => {
    const rows = employees.map(e => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${e.empId}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${e.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${e.duty}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(e.salary)}</td>
       </tr>
    `).join('');

    const html = `
      <h2>OFFICIAL EMPLOYEE LIST</h2>
      <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Total Employees:</strong> ${employees.length}</p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background:#f2f2f2;">
            <th style="padding: 8px; border: 1px solid #ddd;">Employee ID</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Name</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Duty/Role</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Salary</th>
           </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    printContent(html, 'Employee_List', null);
  };

  if (loading) return <div className="text-center py-10">Loading employees...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <div className="flex gap-2">
          <Button onClick={() => { 
            setEditing(null); 
            setForm({ 
              name: '', age: '', gender: '', phone: '', idNumber: '', 
              duty: '', salary: '', paymentMethod: 'bank', paymentOption: 'Monthly', 
              bankAccount: '', bankBranch: '', mpesaNumber: '' 
            }); 
            setModalOpen(true); 
          }}>➕ Add Employee</Button>
          <PrintButton onClick={printList}>Print List</PrintButton>
        </div>
      </div>
      
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Employee ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Duty/Role</th>
                <th className="p-3 text-left">Salary</th>
                <th className="p-3 text-left">Payment Method</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(e => (
                <tr key={e._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{e.empId}</td>
                  <td className="p-3">{e.name}</td>
                  <td className="p-3">{e.duty}</td>
                  <td className="p-3 text-green-600 font-semibold">{formatCurrency(e.salary)}</td>
                  <td className="p-3 capitalize">{e.paymentMethod}</td>
                  <td className="p-3">
                    <button onClick={() => openEdit(e)} className="text-blue-600 mr-2 hover:underline">Edit</button>
                    <button onClick={() => handlePaySalary(e._id)} className="text-green-600 mr-2 hover:underline">Pay</button>
                    <button onClick={() => handleDelete(e._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {employees.length === 0 && <p className="text-center text-gray-500 py-8">No employees found. Click "Add Employee" to get started.</p>}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Employee' : 'Add New Employee'}>
        <form onSubmit={handleSubmit}>
          <div className="mb-2 text-xs text-gray-500">
            {!editing && <p>Employee ID will be auto-generated (EM-001, EM-002, etc.)</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input type="text" className="w-full border p-2 rounded" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Age *</label>
              <input type="number" className="w-full border p-2 rounded" value={form.age} onChange={e => setForm({...form, age: e.target.value})} required />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Gender *</label>
              <select className="w-full border p-2 rounded" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} required>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input type="tel" className="w-full border p-2 rounded" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">ID Number *</label>
              <input type="text" className="w-full border p-2 rounded" value={form.idNumber} onChange={e => setForm({...form, idNumber: e.target.value})} required />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Duty/Role *</label>
              <input type="text" className="w-full border p-2 rounded" value={form.duty} onChange={e => setForm({...form, duty: e.target.value})} required />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Salary (KES) *</label>
              <input type="number" step="any" className="w-full border p-2 rounded" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} required />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <select className="w-full border p-2 rounded" value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})}>
                <option value="bank">Bank Transfer</option>
                <option value="mpesa">M-PESA</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Payment Option</label>
              <select className="w-full border p-2 rounded" value={form.paymentOption} onChange={e => setForm({...form, paymentOption: e.target.value})}>
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Fortnightly">Fortnightly</option>
              </select>
            </div>
            
            {form.paymentMethod === 'bank' && (
              <>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Bank Account</label>
                  <input type="text" className="w-full border p-2 rounded" value={form.bankAccount} onChange={e => setForm({...form, bankAccount: e.target.value})} />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Bank Branch</label>
                  <input type="text" className="w-full border p-2 rounded" value={form.bankBranch} onChange={e => setForm({...form, bankBranch: e.target.value})} />
                </div>
              </>
            )}
            
            {form.paymentMethod === 'mpesa' && (
              <div className="mb-2 col-span-2">
                <label className="block text-sm font-medium mb-1">M-PESA Number</label>
                <input type="text" className="w-full border p-2 rounded" value={form.mpesaNumber} onChange={e => setForm({...form, mpesaNumber: e.target.value})} />
              </div>
            )}
          </div>
          <div className="mt-4">
            <Button type="submit" className="w-full">{editing ? 'Update Employee' : 'Add Employee'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};