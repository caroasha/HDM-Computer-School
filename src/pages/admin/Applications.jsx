import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { AdmissionLetterModal } from '../../components/AdmissionLetterModal';
import { formatDate } from '../../utils/formatters';

export const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [letterModalOpen, setLetterModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingApp, setViewingApp] = useState(null);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/applications');
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Delete this application?')) {
      try {
        await api.delete(`/applications/${id}`);
        fetchApplications();
      } catch (err) {
        alert(err.response?.data?.message);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/applications/${id}`, { status: newStatus });
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  if (loading) return <div>Loading applications...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Applications</h1>
      <div className="card">
        {applications.length === 0 ? (
          <p>No applications yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Course</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app._id} className="border-t">
                    <td className="p-2">{formatDate(app.appliedDate)}</td>
                    <td className="p-2">{app.name}</td>
                    <td className="p-2">{app.course}</td>
                    <td className="p-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className="border rounded p-1 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => { setViewingApp(app); setViewModalOpen(true); }}
                        className="text-blue-600 mr-2"
                      >View</button>
                      <button
                        onClick={() => { setSelectedApp(app); setLetterModalOpen(true); }}
                        className="text-green-600 mr-2"
                      >Generate Letter</button>
                      <button
                        onClick={() => handleDelete(app._id)}
                        className="text-red-600"
                      >Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Application Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Application Details">
        {viewingApp && (
          <div>
            <p><strong>Name:</strong> {viewingApp.name}</p>
            <p><strong>Email:</strong> {viewingApp.email}</p>
            <p><strong>Phone:</strong> {viewingApp.phone}</p>
            <p><strong>Course:</strong> {viewingApp.course}</p>
            <p><strong>Message:</strong> {viewingApp.message || '—'}</p>
            <p><strong>Applied:</strong> {formatDate(viewingApp.appliedDate)}</p>
            <p><strong>Status:</strong> {viewingApp.status}</p>
          </div>
        )}
      </Modal>

      {/* Admission Letter Modal */}
      <AdmissionLetterModal
        isOpen={letterModalOpen}
        onClose={() => { setLetterModalOpen(false); setSelectedApp(null); fetchApplications(); }}
        application={selectedApp}
        onLetterGenerated={fetchApplications}
      />
    </div>
  );
};