export const printContent = (contentHtml, title = 'Print', settings = null) => {
  const printWindow = window.open('', '_blank');

  const schoolName = settings?.schoolName || settings?.businessName || 'HDM Computer School';
  const motto = settings?.motto || 'Technology for Tomorrow';
  const address = settings?.address || '';
  const phone = settings?.phone || '';
  const email = settings?.email || '';
  const stampImage = settings?.stampImage || '';
  const now = new Date();

  const stampHtml = stampImage && stampImage.trim()
    ? `<div class="stamp"><img src="${stampImage}" alt="Official Stamp" style="max-width: 100px; height: auto;" /></div>`
    : '<div class="stamp-placeholder">[Official Stamp]</div>';

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
        }
        /* Main container – kept together on one page if possible */
        .print-container {
          max-width: 750px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          page-break-inside: avoid;
          page-break-after: avoid;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print-container {
            padding: 0.25in;
            page-break-inside: avoid;
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
            font-size: 42px;
            font-weight: 800;
            color: rgba(0,0,0,0.05);
            white-space: nowrap;
            letter-spacing: 4px;
          }
        }
        h1 {
          color: #0a2a44;
          text-align: center;
          border-bottom: 2px solid #2f86eb;
          padding-bottom: 8px;
          margin-bottom: 15px;
          font-size: 20px;
        }
        h2 {
          color: #0a2a44;
          text-align: center;
          margin: 12px 0;
          font-size: 18px;
        }
        .motto {
          text-align: center;
          font-style: italic;
          margin: 4px 0;
          color: #2f86eb;
          font-size: 12px;
        }
        .address, .contact {
          text-align: center;
          margin: 4px 0;
          font-size: 12px;
        }
        hr {
          margin: 12px 0;
          border: none;
          border-top: 1px solid #ddd;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 6px 8px;
          text-align: left;
          vertical-align: top;
          font-size: 12px;
        }
        th {
          background-color: #f2f2f2;
        }
        .signature {
          margin-top: 40px;
          text-align: right;
        }
        .stamp, .stamp-placeholder {
          text-align: right;
          margin-top: 20px;
        }
        .stamp img {
          max-width: 100px;
          height: auto;
        }
        .stamp-placeholder {
          height: 60px;
          border-top: 1px dashed #999;
          text-align: center;
          padding-top: 12px;
          color: #999;
          font-size: 11px;
        }
        .footer {
          margin-top: 20px;
          padding-top: 12px;
          border-top: 1px solid #2f86eb;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        @media (max-width: 600px) {
          .print-container { padding: 15px; }
          h1 { font-size: 18px; }
          h2 { font-size: 16px; }
          th, td { padding: 4px; font-size: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="watermark"></div>
      <div class="print-container">
        <h1>${schoolName}</h1>
        ${motto ? `<div class="motto">${motto}</div>` : ''}
        <div class="address">${address}</div>
        <div class="contact">📞 ${phone} | ✉️ ${email}</div>
        <hr/>
        ${contentHtml}
        ${stampHtml}
        <div class="footer">
          <p><strong>${schoolName}</strong> | ${address}</p>
          <p>Printed: ${now.toLocaleString()}</p>
          <p>${motto || (settings?.receiptFooterText || 'Thank you for your patronage. Visit again!')}</p>
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