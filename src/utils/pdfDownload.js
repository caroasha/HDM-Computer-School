import html2pdf from 'html2pdf.js';

export const downloadHTMLAsPDF = async (htmlContent, filename = 'document.pdf') => {
  // Create a temporary container
  const container = document.createElement('div');
  container.id = 'temp-pdf-container';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '800px';
  container.style.backgroundColor = 'white';
  container.style.padding = '20px';
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  // Wait for images to load
  const images = container.querySelectorAll('img');
  await Promise.all(Array.from(images).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  }));

  const opt = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      letterRendering: true,
      useCORS: true,
      logging: false
    },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(container).save();
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Failed to generate PDF. Please try again.');
  } finally {
    document.body.removeChild(container);
  }
};