import { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { Modal } from './Modal';
import { Button } from './Button';
import { formatCurrency } from '../utils/formatters';
import { printContent } from '../utils/print';

export const FeeStructureModal = ({ isOpen, onClose }) => {
  const { settings, loading } = useSettings();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (settings?.courses) setCourses(settings.courses);
  }, [settings]);

  const getHTMLContent = () => {
    const tableRows = courses.map(c => `
      <tr>
        <td>${c.name}</td>
        <td>${c.durationMonths} months</td>
        <td>${formatCurrency(c.totalFee)}</td>
      </tr>
    `).join('');

    const now = new Date();

    return `
      <h2>FEE STRUCTURE</h2>
      <p>Effective from: ${now.toLocaleDateString()}</p>
      <table>
        <thead>
          <tr>
            <th>Course</th>
            <th>Duration</th>
            <th>Total Fee (KES)</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      <p style="margin-top: 20px;"><strong>Note:</strong> Fees are payable in installments as per the payment schedule.</p>
    `;
  };

  const downloadPDF = () => {
    const html = getHTMLContent();
    printContent(html, `${settings?.schoolName || 'School'}_Fee_Structure`, settings);
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${settings?.schoolName || 'HDM School'} Fee Structure`,
          text: 'Check out our course fees!',
          url: window.location.href
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          await navigator.clipboard.writeText(window.location.href);
          alert('Link copied to clipboard!');
        }
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fee Structure">
      <div className="max-h-96 overflow-auto">
        {courses.length === 0 ? (
          <p className="text-gray-500">No courses configured yet.</p>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Course</th>
                <th className="p-2 text-left">Duration</th>
                <th className="p-2 text-left">Fee (KES)</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.durationMonths} months</td>
                  <td className="p-2">{formatCurrency(c.totalFee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="secondary" onClick={downloadPDF}>Download / Print PDF</Button>
        <Button onClick={share}>Share</Button>
      </div>
    </Modal>
  );
};