import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export const PortalRegister = () => {
  const [form, setForm] = useState({ regNumber: '', name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/portal/register', form);
      setSuccess('Registration successful! Please login.');
      setTimeout(() => navigate('/portal/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-primary mb-6">Portal Registration</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4"><label>Registration Number *</label><input type="text" className="w-full p-2 border rounded-full" value={form.regNumber} onChange={e => setForm({...form, regNumber: e.target.value})} required /></div>
          <div className="mb-4"><label>Full Name *</label><input type="text" className="w-full p-2 border rounded-full" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div className="mb-4"><label>Email *</label><input type="email" className="w-full p-2 border rounded-full" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
          <div className="mb-6"><label>Password *</label><input type="password" className="w-full p-2 border rounded-full" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /></div>
          <button type="submit" className="w-full btn-primary py-2">Register</button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-4">Already have an account? <Link to="/portal/login" className="text-primary">Login</Link></p>
      </div>
    </div>
  );
};