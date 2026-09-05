import { jsPDF } from 'jspdf';
import type { CartItem, CustomerDetails } from './data';

const COMPANY = {
  name: 'Vikas Pvt. Ltd.',
  tagline: 'Quality Goods · Trusted',
  address: 'Chinhat, Lucknow 22602',
  phone: '+1 (206) 555-0142',
  email: 'billing@vikas.example',
  website: 'www.vikas.example',
};

function rs(amount: number) {
  return `Rs. ${amount.toFixed(2)}`;
}

function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export interface InvoicePayload {
  customer: CustomerDetails;
  items: CartItem[];
  invoiceNumber: string;
  signatureDataUrl: string;
  notes?: string;
}

/** Build and download a one-page invoice PDF in the browser. */
export function downloadInvoicePdf(payload: InvoicePayload) {
  const { customer, items, invoiceNumber, signatureDataUrl, notes } = payload;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const left = 50;
  const right = pageW - 50;
  const contentW = right - left;

  // Top accent
  doc.setFillColor(26, 95, 74);
  doc.rect(0, 0, pageW, 8, 'F');

  // Company
  doc.setTextColor(26, 95, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(COMPANY.name, left, 36);

  doc.setTextColor(90, 107, 99);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(COMPANY.tagline, left, 52);

  doc.setTextColor(61, 79, 71);
  doc.setFontSize(8.5);
  doc.text(COMPANY.address, left, 68);
  doc.text(`${COMPANY.phone}  ·  ${COMPANY.email}`, left, 92);

  // Invoice header (right)
  doc.setTextColor(26, 95, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('INVOICE', right, 36, { align: 'right' });

  doc.setTextColor(61, 79, 71);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`No. ${invoiceNumber}`, right, 62, { align: 'right' });
  doc.text(`Date: ${formatDate()}`, right, 76, { align: 'right' });

  // Divider
  doc.setDrawColor(197, 212, 206);
  doc.setLineWidth(1);
  doc.line(left, 110, right, 110);

  // Bill to
  doc.setTextColor(26, 95, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('BILL TO', left, 130);

  doc.setTextColor(30, 42, 37);
  doc.setFontSize(12);
  doc.text(customer.name, left, 148);

  let billY = 164;
  doc.setTextColor(61, 79, 71);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

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
    const lines = doc.splitTextToSize(customer.address, 240);
    doc.text(lines, left, billY);
    billY += lines.length * 12 + 4;
  }

  // Table
  const tableTop = Math.max(billY + 16, 200);
  const colQty = left + 260;
  const colPrice = left + 330;
  const colAmount = right;

  doc.setFillColor(26, 95, 74);
  doc.rect(left, tableTop, contentW, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DESCRIPTION', left + 8, tableTop + 14);
  doc.text('QTY', colQty + 50, tableTop + 14, { align: 'right' });
  doc.text('PRICE', colPrice + 60, tableTop + 14, { align: 'right' });
  doc.text('AMOUNT', colAmount, tableTop + 14, { align: 'right' });

  let rowY = tableTop + 28;
  let subtotal = 0;
  const rows = items.slice(0, 12);

  rows.forEach((item, index) => {
    const amount = item.price * item.quantity;
    subtotal += amount;

    if (index % 2 === 0) {
      doc.setFillColor(240, 245, 242);
      doc.rect(left, rowY - 10, contentW, 22, 'F');
    }

    doc.setTextColor(30, 42, 37);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(item.name, left + 8, rowY + 4, { maxWidth: 240 });
    doc.text(String(item.quantity), colQty + 50, rowY + 4, { align: 'right' });
    doc.text(rs(item.price), colPrice + 60, rowY + 4, { align: 'right' });
    doc.text(rs(amount), colAmount, rowY + 4, { align: 'right' });
    rowY += 22;
  });

  const totalsX = left + 280;
  doc.setDrawColor(197, 212, 206);
  doc.line(totalsX, rowY + 4, right, rowY + 4);

  rowY += 20;
  doc.setTextColor(61, 79, 71);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Subtotal', totalsX, rowY);
  doc.text(rs(subtotal), colAmount, rowY, { align: 'right' });

  rowY += 18;
  doc.setTextColor(26, 95, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Total Due', totalsX, rowY);
  doc.text(rs(subtotal), colAmount, rowY, { align: 'right' });

  // Notes
  let notesY = rowY + 36;
  if (notes?.trim()) {
    doc.setTextColor(26, 95, 74);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('NOTES', left, notesY);
    notesY += 14;
    doc.setTextColor(61, 79, 71);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const noteLines = doc.splitTextToSize(notes, 260);
    doc.text(noteLines, left, notesY);
    notesY += noteLines.length * 11 + 8;
  }

  // Signature
  const sigBoxW = 180;
  const sigBoxX = right - sigBoxW;
  const sigY = Math.min(Math.max(notesY + 16, 560), pageH - 140);

  doc.setTextColor(26, 95, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('AUTHORIZED SIGNATURE', sigBoxX + sigBoxW / 2, sigY, {
    align: 'center',
  });

  try {
    doc.addImage(signatureDataUrl, 'PNG', sigBoxX + 15, sigY + 10, 150, 50);
  } catch {
    doc.setTextColor(153, 153, 153);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('(signature unavailable)', sigBoxX + sigBoxW / 2, sigY + 40, {
      align: 'center',
    });
  }

  doc.setDrawColor(26, 95, 74);
  doc.setLineWidth(0.8);
  doc.line(sigBoxX + 10, sigY + 70, sigBoxX + sigBoxW - 10, sigY + 70);

  doc.setTextColor(90, 107, 99);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(COMPANY.name, sigBoxX + sigBoxW / 2, sigY + 84, { align: 'center' });

  // Page-1 footer only
  doc.setTextColor(138, 154, 147);
  doc.setFontSize(7.5);
  doc.text(
    `Thank you for your business  ·  ${COMPANY.website}`,
    pageW / 2,
    pageH - 28,
    { align: 'center' }
  );

  doc.setFillColor(26, 95, 74);
  doc.rect(0, pageH - 9, pageW, 9, 'F');

  doc.save(`invoice-${invoiceNumber}.pdf`);
}