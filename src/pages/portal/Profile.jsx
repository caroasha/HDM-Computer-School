import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button } from '../../components/Button';
import { formatCurrency } from '../../utils/formatters';
import { FeeStructureModal } from '../../components/FeeStructureModal'; // <-- ADDED

export const PortalProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [feeModalOpen, setFeeModalOpen] = useState(false); // <-- ADDED

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/portal/profile');
        setProfile(data);
        setForm({ name: data.portalUser.name, email: data.portalUser.email });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      await api.put('/portal/profile', form);
      alert('Profile updated successfully');
      setEditMode(false);
      setProfile({ ...profile, portalUser: { ...profile.portalUser, ...form } });
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Error loading profile</div>;

  const { portalUser, userData } = profile;
  const isStudent = portalUser.role === 'student';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold mb-4">My Profile</h2>
          <Button variant="secondary" onClick={() => setFeeModalOpen(true)}>📄 Fee Structure</Button> {/* <-- ADDED */}
        </div>
        {!editMode ? (
          <>
            <div className="space-y-3">
              <p><strong>Name:</strong> {portalUser.name}</p>
              <p><strong>Email:</strong> {portalUser.email}</p>
              <p><strong>Registration No:</strong> {portalUser.regNumber}</p>
              <p><strong>Role:</strong> {portalUser.role}</p>
              {isStudent && (
                <>
                  <p><strong>Course:</strong> {userData.course}</p>
                  <p><strong>Enrollment:</strong> {new Date(userData.enrollmentDate).toLocaleDateString()}</p>
                  <p><strong>Completion:</strong> {new Date(userData.completionDate).toLocaleDateString()}</p>
                  <p><strong>Computer:</strong> {userData.computerAssigned || 'None'}</p>
                </>
              )}
              {!isStudent && (
                <>
                  <p><strong>Employee ID:</strong> {userData.empId}</p>
                  <p><strong>Duty:</strong> {userData.duty}</p>
                  <p><strong>Salary:</strong> {formatCurrency(userData.salary)}</p>
                </>
              )}
            </div>
            <Button onClick={() => setEditMode(true)} className="mt-4">Edit Profile</Button>
          </>
        ) : (
          <div>
            <div className="mb-4">
              <label className="block mb-1">Name</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Email</label>
              <input
                type="email"
                className="w-full border p-2 rounded"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdate}>Save</Button>
              <Button variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      {/* Fee Structure Modal */}
      <FeeStructureModal isOpen={feeModalOpen} onClose={() => setFeeModalOpen(false)} />
    </div>
  );
};