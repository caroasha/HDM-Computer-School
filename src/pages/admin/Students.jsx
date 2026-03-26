import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatCurrency, formatShortDate } from '../../utils/formatters';
import { useSettings } from '../../hooks/useSettings';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { PrintButton } from '../../components/PrintButton';
import { printContent } from '../../utils/print';

export const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ 
    name: '', age: '', gender: '', phone: '', idNumber: '', 
    enrollmentDate: '', completionDate: '', computerAssigned: '', 
    feesPaid: 0, course: '' 
  });
  const [availableComputers, setAvailableComputers] = useState([]);
  const [editing, setEditing] = useState(null);
  const { settings } = useSettings();

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/students');
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableComputers = async () => {
    try {
      const { data } = await api.get('/inventory/available-computers');
      setAvailableComputers(data.available);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchAvailableComputers();
  }, []);

  const addMonths = (dateStr, months) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  const getCourseDuration = (courseName) => {
    const course = settings?.courses?.find(c => c.name === courseName);
    return course?.durationMonths || 3;
  };

  useEffect(() => {
    if (form.enrollmentDate && form.course) {
      const duration = getCourseDuration(form.course);
      const completion = addMonths(form.enrollmentDate, duration);
      setForm(prev => ({ ...prev, completionDate: completion }));
    }
  }, [form.enrollmentDate, form.course]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.age || !form.gender || !form.phone || !form.idNumber || !form.enrollmentDate || !form.course) {
      alert('Please fill all required fields');
      return;
    }
    try {
      if (editing) {
        await api.put(`/students/${editing._id}`, form);
      } else {
        await api.post('/students', form);
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ 
        name: '', age: '', gender: '', phone: '', idNumber: '', 
        enrollmentDate: '', completionDate: '', computerAssigned: '', 
        feesPaid: 0, course: '' 
      });
      fetchStudents();
      fetchAvailableComputers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving student');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this student?')) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
        fetchAvailableComputers();
      } catch (err) {
        alert(err.response?.data?.message);
      }
    }
  };

  const openEdit = (student) => {
    setEditing(student);
    setForm({
      name: student.name,
      age: student.age,
      gender: student.gender,
      phone: student.phone,
      idNumber: student.idNumber,
      enrollmentDate: student.enrollmentDate?.slice(0, 10) || '',
      completionDate: student.completionDate?.slice(0, 10) || '',
      computerAssigned: student.computerAssigned || '',
      feesPaid: student.feesPaid || 0,
      course: student.course || '',
    });
    setModalOpen(true);
  };

  const printList = () => {
    const rows = students.map(s => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${s.regNumber}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${s.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${s.course}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(s.feesPaid)}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${s.computerAssigned || '-'}</td>
       </tr>
    `).join('');

    const html = `
      <h2>OFFICIAL STUDENT LIST</h2>
      <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Total Students:</strong> ${students.length}</p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background:#f2f2f2;">
            <th style="padding: 8px; border: 1px solid #ddd;">Reg No</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Name</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Course</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Fees Paid</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Computer</th>
           </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    printContent(html, 'Student_List', settings);
  };

  if (loading) return <div className="text-center py-10">Loading students...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <div className="flex gap-2">
          <Button onClick={() => { 
            setEditing(null); 
            setForm({ 
              name: '', age: '', gender: '', phone: '', idNumber: '', 
              enrollmentDate: '', completionDate: '', computerAssigned: '', 
              feesPaid: 0, course: '' 
            }); 
            setModalOpen(true); 
          }}>➕ Enroll</Button>
          <PrintButton onClick={printList}>Print List</PrintButton>
        </div>
      </div>
      
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Reg No</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Course</th>
                <th className="p-2 text-left">Fees Paid</th>
                <th className="p-2 text-left">Computer</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id} className="border-t">
                  <td className="p-2">{s.regNumber}</td>
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.course}</td>
                  <td className="p-2">{formatCurrency(s.feesPaid)}</td>
                  <td className="p-2">{s.computerAssigned || '-'}</td>
                  <td className="p-2">
                    <button onClick={() => openEdit(s)} className="text-blue-600 mr-2">Edit</button>
                    <button onClick={() => handleDelete(s._id)} className="text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Student' : 'Enroll Student'}>
        <form onSubmit={handleSubmit}>
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
              <label className="block text-sm font-medium mb-1">Enrollment Date *</label>
              <input type="date" className="w-full border p-2 rounded" value={form.enrollmentDate} onChange={e => setForm({...form, enrollmentDate: e.target.value})} required />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Course *</label>
              <select className="w-full border p-2 rounded" value={form.course} onChange={e => setForm({...form, course: e.target.value})} required>
                <option value="">Select course</option>
                {(settings?.courses || []).map((c, i) => (
                  <option key={i} value={c.name}>{c.name} ({c.durationMonths} months - {formatCurrency(c.totalFee)})</option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Completion Date</label>
              <input type="date" className="w-full border p-2 rounded bg-gray-100" value={form.completionDate} readOnly />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Computer</label>
              <select className="w-full border p-2 rounded" value={form.computerAssigned} onChange={e => setForm({...form, computerAssigned: e.target.value})}>
                <option value="">None</option>
                {availableComputers.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="mb-4 col-span-2">
              <label className="block text-sm font-medium mb-1">Fees Paid (KES)</label>
              <input type="number" className="w-full border p-2 rounded" value={form.feesPaid} onChange={e => setForm({...form, feesPaid: parseFloat(e.target.value) || 0})} />
            </div>
          </div>
          <Button type="submit" className="w-full">{editing ? 'Update Student' : 'Enroll Student'}</Button>
        </form>
      </Modal>
    </div>
  );
};