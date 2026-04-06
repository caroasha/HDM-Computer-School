import { useState, useEffect } from 'react';
import api from '../services/api';
import { useSettings } from '../hooks/useSettings';
import { Modal } from './Modal';
import { Button } from './Button';
import { printContent } from '../utils/print';
import { formatShortDate } from '../utils/formatters';

export const CertificateModal = ({ isOpen, onClose }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [serialNumber, setSerialNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await api.get('/students');
        setStudents(data);
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) fetchStudents();
  }, [isOpen]);

  const fetchOrGenerateNumber = async (studentId) => {
    try {
      const { data } = await api.get(`/certificates/next-number/${studentId}`);
      setSerialNumber(data.serialNumber);
    } catch (err) {
      console.error('Error generating certificate number:', err);
      alert('Failed to generate certificate number');
    }
  };

  const handleStudentSelect = (studentId) => {
    const student = students.find(s => s._id === studentId);
    setSelectedStudent(student);
    if (student) {
      fetchOrGenerateNumber(student._id);
    }
  };

  const printCertificate = () => {
    if (!selectedStudent || !serialNumber) return;
    setPrinting(true);

    const schoolName = settings?.schoolName || 'HDM Computer School';
    const motto = settings?.motto || 'Technology for Tomorrow';
    const address = settings?.address || '';
    const phone = settings?.phone || '';
    const email = settings?.email || '';
    const stampImage = settings?.stampImage || '';
    const now = new Date();
    const completionDate = selectedStudent.completionDate ? new Date(selectedStudent.completionDate) : null;
    const formattedCompletion = completionDate ? formatShortDate(completionDate) : 'N/A';

    const html = `
      <div style="position: relative; text-align: center; border: 12px double #2f86eb; padding: 30px 20px; background: #fffcf5; box-shadow: 0 0 20px rgba(0,0,0,0.1); font-family: 'Georgia', 'Times New Roman', serif; max-width: 800px; margin: 0 auto;">
        <!-- Watermark -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.08; font-size: 60px; font-weight: bold; white-space: nowrap; pointer-events: none;">${schoolName}</div>
        <div style="position: absolute; top: 20px; left: 20px; font-size: 12px; color: #999;">${serialNumber}</div>
        <div style="margin-bottom: 20px;">
          <h1 style="font-size: 42px; margin-bottom: 8px; color: #2f86eb;">${schoolName}</h1>
          <p style="font-size: 16px; font-style: italic;">${motto}</p>
          <hr style="width: 80px; border: 1px solid #2f86eb; margin: 8px auto;">
        </div>
        <div style="margin: 30px 0;">
          <h2 style="font-size: 28px; letter-spacing: 2px; margin-bottom: 15px;">CERTIFICATE OF COMPLETION</h2>
          <p style="font-size: 18px;">This is to certify that</p>
          <p style="font-size: 32px; font-weight: bold; margin: 15px 0; text-transform: uppercase;">${selectedStudent.name}</p>
          <p style="font-size: 18px;">has successfully completed the course</p>
          <p style="font-size: 24px; font-weight: bold; margin: 15px 0;">${selectedStudent.course}</p>
          <p style="font-size: 16px;">with effect from ${formattedCompletion}</p>
          <p style="font-size: 16px; margin-top: 15px;">In witness whereof, we have hereunto set our hand and seal this ${now.toLocaleDateString()}.</p>
        </div>
        <div style="margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div style="text-align: center; width: 180px;">
            <div style="border-top: 1px solid #000; width: 160px; margin: 0 auto;"></div>
            <p style="margin-top: 8px;">Student Signature</p>
          </div>
          <div style="text-align: center;">
            ${stampImage ? `<img src="${stampImage}" style="width: 90px; height: auto; margin-bottom: 10px;" />` : '<div style="width: 90px; height: 70px; border-top: 1px dashed #999; margin-bottom: 10px;"></div>'}
            <p>Official Stamp</p>
          </div>
          <div style="text-align: center; width: 180px;">
            <div style="border-top: 1px solid #000; width: 160px; margin: 0 auto;"></div>
            <p style="margin-top: 8px;">Principal / Director</p>
          </div>
        </div>
        <div style="margin-top: 30px; font-size: 10px; text-align: center; color: #666;">
          <p>${schoolName} | ${address} | 📞 ${phone} | ✉️ ${email}</p>
          <p>Issued: ${now.toLocaleString()}</p>
        </div>
      </div>
    `;
    printContent(html, `Certificate_${selectedStudent.regNumber}`, settings, true);
    setPrinting(false);
    onClose();
  };

  if (loading) return <Modal isOpen={isOpen} onClose={onClose} title="Print Certificate"><div>Loading students...</div></Modal>;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Print Certificate">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select Student</label>
        <select
          className="w-full border p-2 rounded"
          value={selectedStudent?._id || ''}
          onChange={(e) => handleStudentSelect(e.target.value)}
        >
          <option value="">-- Select a student --</option>
          {students.map(s => (
            <option key={s._id} value={s._id}>{s.name} ({s.regNumber}) – {s.course}</option>
          ))}
        </select>
      </div>
      {selectedStudent && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p><strong>Student:</strong> {selectedStudent.name}</p>
          <p><strong>Course:</strong> {selectedStudent.course}</p>
          <p><strong>Completion Date:</strong> {selectedStudent.completionDate ? formatShortDate(selectedStudent.completionDate) : 'Not set'}</p>
          {serialNumber && <p><strong>Certificate Number:</strong> {serialNumber}</p>}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={printCertificate} disabled={!selectedStudent || !serialNumber || printing}>
          {printing ? 'Printing...' : 'Print Certificate'}
        </Button>
      </div>
    </Modal>
  );
};