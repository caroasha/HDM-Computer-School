import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatCurrency, formatShortDate } from '../../utils/formatters';
import { useSettings } from '../../hooks/useSettings';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { PrintButton } from '../../components/PrintButton';
import { printContent } from '../../utils/print';

// Helper function to add months to a date
const addMonths = (dateStr, months) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
};

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

  // Get course duration when course changes
  const getCourseDuration = (courseName) => {
    const course = settings?.courses?.find(c => c.name === courseName);
    return course?.durationMonths || 3; // default to 3 months
  };

  // Auto-calculate completion date when enrollment date or course changes
  useEffect(() => {
    if (form.enrollmentDate && form.course) {
      const duration = getCourseDuration(form.course);
      const completion = addMonths(form.enrollmentDate, duration);
      setForm(prev => ({ ...prev, completionDate: completion }));
    }
  }, [form.enrollmentDate, form.course]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.name || !form.age || !form.gender || !form.phone || !form.idNumber || !form.enrollmentDate || !form.course) {
      alert('Please fill all required fields');
      return;
    }
    
    // Ensure completion date is set
    if (!form.completionDate) {
      alert('Please select a course first to auto-calculate completion date');
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
    const tableRows = students.map(s => `
      <tr>
        <td>${s.regNumber}</td>
        <td>${s.name}</td>
        <td>${s.age}</td>
        <td>${s.gender}</td>
        <td>${s.phone}</td>
        <td>${s.computerAssigned || '-'}</td>
        <td>${formatCurrency(s.feesPaid)}</td>
      </tr>
    `).join('');
    const html = `
      <h1>Student List</h1>
      <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse;">
        <thead>
          <tr><th>Reg No</th><th>Name</th><th>Age</th><th>Gender</th><th>Phone</th><th>Computer</th><th>Fees Paid</th></tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;
    printContent(html, 'Student_List');
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
                    <button onClick={() => openEdit(s)} className="text-blue-600 mr-2 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(s._id)} className="text-red-600 hover:underline">Delete</button>
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
              <input 
                type="text" 
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                required 
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Age *</label>
              <input 
                type="number" 
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary" 
                value={form.age} 
                onChange={e => setForm({...form, age: e.target.value})} 
                required 
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Gender *</label>
              <select 
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary" 
                value={form.gender} 
                onChange={e => setForm({...form, gender: e.target.value})} 
                required
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input 
                type="tel" 
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary" 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})} 
                required 
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">ID Number *</label>
              <input 
                type="text" 
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary" 
                value={form.idNumber} 
                onChange={e => setForm({...form, idNumber: e.target.value})} 
                required 
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Enrollment Date *</label>
              <input 
                type="date" 
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary" 
                value={form.enrollmentDate} 
                onChange={e => setForm({...form, enrollmentDate: e.target.value})} 
                required 
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Course *</label>
              <select 
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary" 
                value={form.course} 
                onChange={e => setForm({...form, course: e.target.value})} 
                required
              >
                <option value="">Select course</option>
                {(settings?.courses || []).map((c, i) => (
                  <option key={i} value={c.name}>
                    {c.name} ({c.durationMonths} months - {formatCurrency(c.totalFee)})
                  </option>
                ))}
              </select>
              {form.course && (
                <p className="text-xs text-green-600 mt-1">
                  Completion date will be auto-calculated: {form.completionDate || 'Select enrollment date first'}
                </p>
              )}
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Completion Date</label>
              <input 
                type="date" 
                className="w-full border p-2 rounded bg-gray-100" 
                value={form.completionDate} 
                readOnly 
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Computer</label>
              <select 
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary" 
                value={form.computerAssigned} 
                onChange={e => setForm({...form, computerAssigned: e.target.value})}
              >
                <option value="">None</option>
                {availableComputers.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="mb-4 col-span-2">
              <label className="block text-sm font-medium mb-1">Fees Paid (KES)</label>
              <input 
                type="number" 
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary" 
                value={form.feesPaid} 
                onChange={e => setForm({...form, feesPaid: parseFloat(e.target.value) || 0})} 
              />
              {form.course && (
                <p className="text-xs text-gray-500 mt-1">
                  Total fee: {formatCurrency(settings?.courses?.find(c => c.name === form.course)?.totalFee || 0)}
                </p>
              )}
            </div>
          </div>
          <Button type="submit" className="w-full">{editing ? 'Update Student' : 'Enroll Student'}</Button>
        </form>
      </Modal>
    </div>
  );
};