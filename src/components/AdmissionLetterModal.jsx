import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { printContent } from '../utils/print';
import api from '../services/api';
import { useSettings } from '../hooks/useSettings';

export const AdmissionLetterModal = ({ isOpen, onClose, application, onLetterGenerated }) => {
  const { settings } = useSettings();
  const [editableMessage, setEditableMessage] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (application && settings) {
      const defaultMessage = `We are pleased to offer you admission to the ${application.course} course at ${settings.schoolName || 'HDM Computer School'}. Your application has been accepted and we look forward to having you join our institution. Please report to the admissions office on ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} to complete your registration.`;
      setEditableMessage(defaultMessage);
    }
  }, [application, settings]);

  const getLetterHTML = () => {
    if (!application || !settings) return '';

    const now = new Date();
    const refNo = `ADM/${application.course.substring(0, 3).toUpperCase()}/${application._id.slice(-6)}`;

    return `
      <h2>ADMISSION LETTER</h2>
      
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse; background: #f9f9f9;">
         <tr style="border: 1px solid #eee;">
          <td style="width: 120px; padding: 12px; font-weight: 600; background: #f5f5f5; border: 1px solid #eee;"><strong>Date:</strong></td>
          <td style="padding: 12px; border: 1px solid #eee;">${now.toLocaleDateString()}</td>
         </tr>
         <tr style="border: 1px solid #eee;">
          <td style="padding: 12px; font-weight: 600; background: #f5f5f5; border: 1px solid #eee;"><strong>Ref No:</strong></td>
          <td style="padding: 12px; border: 1px solid #eee;">${refNo}</td>
         </tr>
         <tr style="border: 1px solid #eee;">
          <td style="padding: 12px; font-weight: 600; background: #f5f5f5; border: 1px solid #eee;"><strong>To:</strong></td>
          <td style="padding: 12px; border: 1px solid #eee;">${application.name}</td>
         </tr>
         <tr style="border: 1px solid #eee;">
          <td style="padding: 12px; font-weight: 600; background: #f5f5f5; border: 1px solid #eee;"><strong>Contact:</strong></td>
          <td style="padding: 12px; border: 1px solid #eee;">${application.email} | ${application.phone}</td>
         </tr>
       </table>
      
      <p style="margin: 20px 0; font-size: 16px;">Dear ${application.name},</p>
      
      <div style="margin: 20px 0; line-height: 1.8; font-size: 16px;">
        ${editableMessage.replace(/\n/g, '<br/>')}
      </div>
      
      <p style="margin: 20px 0; font-size: 16px;">We look forward to welcoming you to ${settings.schoolName || 'HDM Computer School'}.</p>
      
      <div style="margin-top: 60px; text-align: right;">
        <p>Yours sincerely,</p>
        <div style="margin-top: 40px;">
          <p><strong>Admissions Office</strong></p>
        </div>
      </div>
    `;
  };

  const downloadPDF = () => {
    const html = getLetterHTML();
    printContent(html, `Admission_Letter_${application.name.replace(/\s/g, '_')}`, settings);
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Admission Letter - ${application.name}`,
          text: `Admission letter for ${application.name} - ${application.course}`,
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

  const markGenerated = async () => {
    setGenerating(true);
    try {
      await api.put(`/applications/${application._id}`, { status: 'accepted' });
      if (onLetterGenerated) onLetterGenerated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setGenerating(false);
    }
  };

  if (!application) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Admission Letter" size="xl">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Message (editable)</label>
        <textarea
          rows="6"
          className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-primary text-base"
          value={editableMessage}
          onChange={(e) => setEditableMessage(e.target.value)}
          placeholder="Enter the admission letter message..."
        />
        <p className="text-xs text-gray-500 mt-1">You can customize the message before generating the PDF.</p>
      </div>
      
      {/* Preview Section - Wider and Scrollable */}
      <div className="border p-6 mb-4 max-h-[500px] overflow-auto bg-gray-50 rounded-lg">
        <div className="min-w-[700px]">
          <div dangerouslySetInnerHTML={{ __html: getLetterHTML() }} />
        </div>
      </div>
      
      <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-4 border-t">
        <Button variant="secondary" onClick={downloadPDF}>
          📄 Download / Print PDF
        </Button>
        <Button variant="secondary" onClick={share}>
          📤 Share
        </Button>
        <Button onClick={markGenerated} disabled={generating}>
          {generating ? 'Saving...' : '✓ Mark as Generated & Close'}
        </Button>
      </div>
    </Modal>
  );
};