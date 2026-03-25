import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { Modal } from './Modal';
import { Button } from './Button';
import { formatCurrency } from '../utils/formatters';
import { printContent } from '../utils/print';

export const BrochureModal = ({ isOpen, onClose }) => {
  const { settings, loading } = useSettings();
  const courses = settings?.courses || [];

  const getHTMLContent = () => {
    const now = new Date();
    
    const coursesHtml = courses.map(c => `
      <div style="margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
        <h3 style="color: #2f86eb; margin-bottom: 8px;">${c.name}</h3>
        <p><strong>Duration:</strong> ${c.durationMonths} months</p>
        <p><strong>Total Fee:</strong> ${formatCurrency(c.totalFee)}</p>
      </div>
    `).join('');

    return `
      <h2>OUR COURSES</h2>
      <p>Join us today and start your journey to success!</p>
      ${coursesHtml}
      <p style="margin-top: 20px;"><strong>Contact us for more information:</strong></p>
      <p>📞 ${settings?.phone || '+254 700 123 456'} | ✉️ ${settings?.email || 'info@hdmcomputerschool.ac.ke'}</p>
    `;
  };

  const downloadPDF = () => {
    const html = getHTMLContent();
    printContent(html, `${settings?.schoolName || 'School'}_Brochure`, settings);
  };

  if (loading) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="School Brochure">
      <div className="max-h-96 overflow-auto">
        {courses.length === 0 ? (
          <p className="text-gray-500">No courses available.</p>
        ) : (
          <div className="space-y-4">
            {courses.map((c, i) => (
              <div key={i} className="border-b pb-3">
                <h3 className="text-lg font-semibold text-primary">{c.name}</h3>
                <p className="text-gray-600">{c.durationMonths} months · {formatCurrency(c.totalFee)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="secondary" onClick={downloadPDF}>Download / Print PDF</Button>
      </div>
    </Modal>
  );
};