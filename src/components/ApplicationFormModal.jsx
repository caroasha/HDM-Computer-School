import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { Modal } from './Modal';
import { Button } from './Button';
import api from '../services/api';

export const ApplicationFormModal = ({ isOpen, onClose }) => {
  const { settings } = useSettings();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/applications', form);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setForm({ name: '', email: '', phone: '', course: '', message: '' });
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply Now">
      {submitted ? (
        <div className="text-center py-8">
          <p className="text-green-600 text-lg">Application submitted successfully!</p>
          <p>We will contact you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              required
              className="w-full border p-2 rounded"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border p-2 rounded"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Phone *</label>
            <input
              type="tel"
              name="phone"
              required
              className="w-full border p-2 rounded"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Select Course *</label>
            <select
              name="course"
              required
              className="w-full border p-2 rounded"
              value={form.course}
              onChange={handleChange}
            >
              <option value="">-- Select --</option>
              {settings?.courses?.map((c, i) => (
                <option key={i} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Message (optional)</label>
            <textarea
              name="message"
              rows="3"
              className="w-full border p-2 rounded"
              value={form.message}
              onChange={handleChange}
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      )}
    </Modal>
  );
};