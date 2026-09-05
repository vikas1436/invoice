const PDFDocument = require('pdfkit');

const COMPANY = {
  name: 'Vikas Pvt. Ltd.',
  tagline: 'Quality Goods · Trusted Trade',
  address: '1847 Harbor Avenue, Suite 200',
  city: 'Seattle, WA 98101',
  phone: '+1 (206) 555-0142',
  email: 'billing@vikaspvtldt.example',
  website: 'www.vikaspvtldt.example',
};

function formatCurrency(amount) {
  return `Rs. ${Number(amount).toFixed(2)}`;
}

function formatDate(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Build a one-page invoice PDF and return it as a Buffer.
 */
function generateInvoicePdf(payload) {
  const { customer, items, invoiceNumber, invoiceDate, signatureDataUrl, notes } =
    payload;

  return new Promise((resolve, reject) => {
    try {
      if (!customer?.name || !Array.isArray(items) || items.length === 0) {
        const err = new Error(
          'Customer name and at least one product are required.'
        );
        err.status = 400;
        reject(err);
        return;
      }

      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Invoice ${invoiceNumber || 'INV'}`,
          Author: COMPANY.name,
        },
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const left = 50;
      const right = pageWidth - 50;
      const contentWidth = right - left;

      doc.rect(0, 0, pageWidth, 8).fill('#1a5f4a');

      doc
        .fillColor('#1a5f4a')
        .font('Helvetica-Bold')
        .fontSize(22)
        .text(COMPANY.name, left, 28, { width: contentWidth * 0.55 });

      doc
        .fillColor('#5a6b63')
        .font('Helvetica')
        .fontSize(9)
        .text(COMPANY.tagline, left, 54);

      doc
        .fillColor('#3d4f47')
        .fontSize(8.5)
        .text(COMPANY.address, left, 70)
        .text(COMPANY.city)
        .text(`${COMPANY.phone}  ·  ${COMPANY.email}`);

      const metaX = left + contentWidth * 0.55;
      doc
        .fillColor('#1a5f4a')
        .font('Helvetica-Bold')
        .fontSize(28)
        .text('INVOICE', metaX, 28, {
          width: contentWidth * 0.45,
          align: 'right',
        });

      doc
        .fillColor('#3d4f47')
        .font('Helvetica')
        .fontSize(9)
        .text(`No. ${invoiceNumber || 'INV-0001'}`, metaX, 62, {
          width: contentWidth * 0.45,
          align: 'right',
        })
        .text(`Date: ${formatDate(invoiceDate)}`, metaX, 76, {
          width: contentWidth * 0.45,
          align: 'right',
        });

      doc
        .moveTo(left, 118)
        .lineTo(right, 118)
        .strokeColor('#c5d4ce')
        .lineWidth(1)
        .stroke();

      doc
        .fillColor('#1a5f4a')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('BILL TO', left, 132);

      doc
        .fillColor('#1e2a25')
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(customer.name, left, 148);

      let billY = 166;
      doc.fillColor('#3d4f47').font('Helvetica').fontSize(9);

      if (customer.company) {
        doc.text(customer.company, left, billY);
        billY += 13;
      }
      if (customer.email) {
        doc.text(customer.email, left, billY);
        billY += 13;
      }
      if (customer.phone) {
        doc.text(customer.phone, left, billY);
        billY += 13;
      }
      if (customer.address) {
        doc.text(customer.address, left, billY, { width: 240 });
        billY += doc.heightOfString(customer.address, { width: 240 }) + 4;
      }

      const tableTop = Math.max(billY + 16, 210);
      const colDesc = left;
      const colQty = left + 260;
      const colPrice = left + 330;
      const colAmount = left + 410;

      doc.rect(left, tableTop, contentWidth, 22).fill('#1a5f4a');

      doc
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('DESCRIPTION', colDesc + 8, tableTop + 7)
        .text('QTY', colQty, tableTop + 7, { width: 50, align: 'right' })
        .text('PRICE', colPrice, tableTop + 7, { width: 60, align: 'right' })
        .text('AMOUNT', colAmount, tableTop + 7, {
          width: 70,
          align: 'right',
        });

      let rowY = tableTop + 28;
      let subtotal = 0;
      const maxRows = 12;

      items.slice(0, maxRows).forEach((item, index) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const amount = qty * price;
        subtotal += amount;

        if (index % 2 === 0) {
          doc.rect(left, rowY - 4, contentWidth, 22).fill('#f0f5f2');
        }

        doc
          .fillColor('#1e2a25')
          .font('Helvetica')
          .fontSize(9)
          .text(item.name || 'Item', colDesc + 8, rowY, { width: 240 })
          .text(String(qty), colQty, rowY, { width: 50, align: 'right' })
          .text(formatCurrency(price), colPrice, rowY, {
            width: 60,
            align: 'right',
          })
          .text(formatCurrency(amount), colAmount, rowY, {
            width: 70,
            align: 'right',
          });

        rowY += 22;
      });

      const total = subtotal;
      const totalsX = left + 280;

      doc
        .moveTo(totalsX, rowY + 8)
        .lineTo(right, rowY + 8)
        .strokeColor('#c5d4ce')
        .stroke();

      rowY += 18;
      doc
        .fillColor('#3d4f47')
        .font('Helvetica')
        .fontSize(9)
        .text('Subtotal', totalsX, rowY)
        .text(formatCurrency(subtotal), colAmount, rowY, {
          width: 70,
          align: 'right',
        });

      rowY += 18;
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#1a5f4a')
        .text('Total Due', totalsX, rowY)
        .text(formatCurrency(total), colAmount, rowY, {
          width: 70,
          align: 'right',
        });

      let notesY = rowY + 40;
      if (notes) {
        doc
          .fillColor('#1a5f4a')
          .font('Helvetica-Bold')
          .fontSize(9)
          .text('NOTES', left, notesY);
        notesY += 14;
        doc
          .fillColor('#3d4f47')
          .font('Helvetica')
          .fontSize(8.5)
          .text(notes, left, notesY, { width: 260 });
        notesY += doc.heightOfString(notes, { width: 260 }) + 10;
      }

      const pageHeight = doc.page.height;
      const footerReserve = 48;
      const sigY = Math.min(
        Math.max(notesY + 20, 560),
        pageHeight - footerReserve - 110
      );
      const sigBoxWidth = 180;
      const sigBoxX = right - sigBoxWidth;

      doc
        .fillColor('#1a5f4a')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('AUTHORIZED SIGNATURE', sigBoxX, sigY, {
          width: sigBoxWidth,
          align: 'center',
          lineBreak: false,
        });

      if (signatureDataUrl && signatureDataUrl.startsWith('data:image')) {
        try {
          const base64 = signatureDataUrl.split(',')[1];
          const imgBuffer = Buffer.from(base64, 'base64');
          doc.image(imgBuffer, sigBoxX + 15, sigY + 16, {
            fit: [150, 55],
            align: 'center',
          });
        } catch {
          doc
            .fillColor('#999')
            .font('Helvetica-Oblique')
            .fontSize(8)
            .text('(signature unavailable)', sigBoxX, sigY + 35, {
              width: sigBoxWidth,
              align: 'center',
              lineBreak: false,
            });
        }
      } else {
        doc
          .fillColor('#999')
          .font('Helvetica-Oblique')
          .fontSize(8)
          .text('(no signature on file)', sigBoxX, sigY + 35, {
            width: sigBoxWidth,
            align: 'center',
            lineBreak: false,
          });
      }

      doc
        .moveTo(sigBoxX + 10, sigY + 78)
        .lineTo(sigBoxX + sigBoxWidth - 10, sigY + 78)
        .strokeColor('#1a5f4a')
        .lineWidth(0.8)
        .stroke();

      doc
        .fillColor('#5a6b63')
        .font('Helvetica')
        .fontSize(8)
        .text(COMPANY.name, sigBoxX, sigY + 84, {
          width: sigBoxWidth,
          align: 'center',
          lineBreak: false,
        });

      const prevBottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;

      doc
        .fillColor('#8a9a93')
        .font('Helvetica')
        .fontSize(7.5)
        .text(
          `Thank you for your business  ·  ${COMPANY.website}`,
          left,
          pageHeight - 28,
          { width: contentWidth, align: 'center', lineBreak: false }
        );

      doc.rect(0, pageHeight - 9, pageWidth, 9).fill('#1a5f4a');
      doc.page.margins.bottom = prevBottom;

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateInvoicePdf, COMPANY };
