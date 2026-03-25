import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePortalAuth } from '../../hooks/useAuth';

export const PortalLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = usePortalAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/portal/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-primary mb-6">Student / Staff Login</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4"><label>Email</label><input type="email" className="w-full p-2 border rounded-full" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="mb-6"><label>Password</label><input type="password" className="w-full p-2 border rounded-full" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <button type="submit" className="w-full btn-primary py-2">Login</button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-4">Don't have an account? <Link to="/portal/register" className="text-primary">Register</Link></p>
      </div>
    </div>
  );
};