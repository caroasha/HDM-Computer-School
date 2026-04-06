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
  const [stampLoaded, setStampLoaded] = useState(false);
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

  // Preload stamp image when settings are available
  useEffect(() => {
    if (settings?.stampImage) {
      const img = new Image();
      img.onload = () => setStampLoaded(true);
      img.onerror = () => setStampLoaded(true); // fallback even if error
      img.src = settings.stampImage;
    } else {
      setStampLoaded(true);
    }
  }, [settings]);

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

    // Add cache-busting query parameter to stamp image URL
    const stampUrl = stampImage ? `${stampImage}?t=${Date.now()}` : '';

    const html = `
      <div style="
        position: relative;
        text-align: center;
        border: 12px double #2f86eb;
        padding: 5vh 5vw;
        background: #fffcf5;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
        font-family: 'Georgia', 'Times New Roman', serif;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-sizing: border-box;
      ">
        <!-- Slanted Watermark -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-25deg);
          opacity: 0.08;
          font-size: 8vw;
          font-weight: bold;
          white-space: nowrap;
          pointer-events: none;
          color: #000;
        ">${schoolName}</div>
        
        <!-- Serial Number -->
        <div style="position: absolute; top: 2vh; left: 2vw; font-size: 1.2vh; color: #999;">${serialNumber}</div>
        
        <!-- Header -->
        <div>
          <h1 style="font-size: 5vh; margin-bottom: 1vh; color: #2f86eb;">${schoolName}</h1>
          <p style="font-size: 1.8vh; font-style: italic;">${motto}</p>
          <hr style="width: 10vw; border: 1px solid #2f86eb; margin: 1vh auto;">
        </div>
        
        <!-- Main Content -->
        <div>
          <h2 style="font-size: 3.5vh; letter-spacing: 2px; margin-bottom: 2vh;">CERTIFICATE OF COMPLETION</h2>
          <p style="font-size: 2vh;">This is to certify that</p>
          <p style="font-size: 4vh; font-weight: bold; margin: 2vh 0; text-transform: uppercase;">${selectedStudent.name}</p>
          <p style="font-size: 2vh;">has successfully completed the course</p>
          <p style="font-size: 3vh; font-weight: bold; margin: 2vh 0;">${selectedStudent.course}</p>
          <p style="font-size: 2vh;">with effect from ${formattedCompletion}</p>
          <p style="font-size: 2vh; margin-top: 2vh;">In witness whereof, we have hereunto set our hand and seal this ${now.toLocaleDateString()}.</p>
        </div>
        
        <!-- Signatures -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 5vh;">
          <div style="text-align: center; width: 20%;">
            <div style="border-top: 1px solid #000; width: 100%; margin: 0 auto;"></div>
            <p style="margin-top: 1vh; font-size: 1.5vh;">Student Signature</p>
          </div>
          <div style="text-align: center;">
            ${stampUrl ? `<img src="${stampUrl}" style="width: 8vh; height: auto; margin-bottom: 1vh;" />` : '<div style="width: 8vh; height: 7vh; border-top: 1px dashed #999; margin-bottom: 1vh;"></div>'}
            <p style="font-size: 1.5vh;">Official Stamp</p>
          </div>
          <div style="text-align: center; width: 20%;">
            <div style="border-top: 1px solid #000; width: 100%; margin: 0 auto;"></div>
            <p style="margin-top: 1vh; font-size: 1.5vh;">Principal / Director</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 3vh; font-size: 1.5vh; text-align: center; color: #666;">
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