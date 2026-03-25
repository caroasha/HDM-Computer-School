export const printContent = (contentHtml, title = 'Print', settings = null) => {
  const printWindow = window.open('', '_blank');
  
  const schoolName = settings?.schoolName || 'HDM Computer School';
  const motto = settings?.motto || 'Technology for Tomorrow';
  const address = settings?.address || '';
  const phone = settings?.phone || '';
  const email = settings?.email || '';
  const stampImage = settings?.stampImage || '';
  const now = new Date();

  // Generate stamp HTML
  let stampHtml = '';
  if (stampImage && stampImage.trim() !== '') {
    stampHtml = `
      <div class="stamp">
        <img src="${stampImage}" alt="Official Stamp" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'stamp-placeholder\\'>[Official Stamp]</div>'" />
      </div>
    `;
  } else {
    stampHtml = `<div class="stamp-placeholder">[Official Stamp]</div>`;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body { 
          font-family: 'Segoe UI', 'Times New Roman', Arial, sans-serif;
          background: white;
          margin: 0;
          padding: 0;
          line-height: 1.5;
        }
        
        /* Page container */
        .page {
          position: relative;
          min-height: 100vh;
          page-break-after: auto;
        }
        
        /* Main content container - WIDER! */
        .container {
          max-width: 1000px;
          width: 90%;
          margin: 0 auto;
          padding: 40px;
          position: relative;
        }
        
        /* Footer wrapper */
        .footer-wrapper {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #2f86eb;
          text-align: center;
          font-size: 11px;
          color: #666;
          page-break-before: avoid;
        }
        
        /* Stamp positioning */
        .stamp, .stamp-placeholder {
          text-align: right;
          margin-top: 40px;
        }
        .stamp img {
          max-width: 120px;
          height: auto;
          border: none;
        }
        .stamp-placeholder {
          height: 80px;
          border-top: 1px dashed #999;
          text-align: center;
          padding-top: 20px;
          color: #999;
        }
        
        /* Headers and titles */
        h1 { 
          color: #0a2a44; 
          text-align: center; 
          border-bottom: 3px solid #2f86eb; 
          padding-bottom: 10px;
          margin-bottom: 20px;
          font-size: 28px;
        }
        h2 { 
          color: #0a2a44; 
          text-align: center;
          margin: 20px 0;
          font-size: 24px;
        }
        .motto {
          text-align: center;
          font-style: italic;
          margin: 5px 0;
          color: #2f86eb;
          font-size: 16px;
        }
        .address, .contact {
          text-align: center;
          margin: 5px 0;
          font-size: 14px;
        }
        hr {
          margin: 20px 0;
          border: none;
          border-top: 1px solid #ddd;
        }
        
        /* Tables - Wider and better spacing */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          page-break-inside: avoid;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
          vertical-align: top;
        }
        th {
          background-color: #f2f2f2;
          font-weight: 600;
        }
        
        /* Info table for admission letter */
        .info-table {
          width: 100%;
          margin: 20px 0;
          background: #f9f9f9;
        }
        .info-table td {
          padding: 10px 12px;
          border: 1px solid #eee;
        }
        .info-table td:first-child {
          width: 120px;
          font-weight: 600;
          background: #f5f5f5;
        }
        
        /* Content area */
        .content-area {
          margin: 20px 0;
          line-height: 1.6;
          font-size: 16px;
        }
        
        /* Signature section */
        .signature {
          margin-top: 60px;
          text-align: right;
        }
        
        /* Page break controls */
        .page-break-before {
          page-break-before: always;
        }
        .keep-together {
          page-break-inside: avoid;
        }
        
        /* Watermark only on print */
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .container {
            width: 100%;
            padding: 0.5in;
            max-width: none;
          }
          .watermark {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
          }
          .watermark::after {
            content: "${schoolName}";
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-25deg);
            font-size: 48px;
            font-weight: 800;
            color: rgba(0,0,0,0.05);
            white-space: nowrap;
            letter-spacing: 4px;
          }
          .footer-wrapper {
            position: relative;
            bottom: auto;
            margin-top: 40px;
          }
          .info-table td {
            padding: 8px 10px;
          }
        }
        
        /* Mobile styles */
        @media (max-width: 768px) {
          .container {
            width: 95%;
            padding: 20px;
          }
          h1 { font-size: 24px; }
          h2 { font-size: 20px; }
          th, td { padding: 8px; font-size: 13px; }
          .stamp img { max-width: 80px; }
          .info-table td:first-child {
            width: 100px;
          }
        }
        
        @media (max-width: 480px) {
          .container {
            padding: 15px;
          }
          .info-table td {
            display: block;
            width: 100%;
          }
          .info-table td:first-child {
            width: 100%;
            background: #f0f0f0;
          }
        }
      </style>
    </head>
    <body>
      <div class="watermark"></div>
      <div class="page">
        <div class="container">
          <h1>${schoolName}</h1>
          <div class="motto">${motto}</div>
          <div class="address">${address}</div>
          <div class="contact">📞 ${phone} | ✉️ ${email}</div>
          <hr/>
          ${contentHtml}
          ${stampHtml}
          <div class="footer-wrapper">
            <p><strong>${schoolName}</strong> | ${address}</p>
            <p>Printed: ${now.toLocaleString()}</p>
            <p>${motto}</p>
          </div>
        </div>
      </div>
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
            window.onafterprint = () => window.close();
          }, 500);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};