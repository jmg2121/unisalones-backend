// src/utils/reportGenerator.js
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { PassThrough } = require('stream');

function generatePDF({ title = 'Reporte de Uso', rangeLabel, data }) {
  const doc = new PDFDocument({ margin: 40 });
  const stream = new PassThrough();
  doc.pipe(stream);

  doc.fontSize(16).text(title, { align: 'center' });
  if (rangeLabel) doc.moveDown(0.5).fontSize(10).text(rangeLabel, { align: 'center' });
  doc.moveDown();

  data.days.forEach((d, idx) => {
    doc.fontSize(12).text(`Día: ${d.day}`, { underline: true });
    doc.moveDown(0.3);
    // Encabezados de tabla
    doc.fontSize(10).text('Espacio | Reservas | Horas | Estados', { continued: false });
    d.spaces.forEach((s) => {
      const estados = Object.entries(s.statusBreakdown)
        .map(([k, v]) => `${k}:${v}`)
        .join(', ');
      doc.text(`${s.spaceName} | ${s.reservationsCount} | ${s.totalHours} | ${estados}`);
    });
    doc.moveDown();
    doc.text(`Totales: reservas=${d.totals.reservationsCount}, horas=${d.totals.totalHours}, espacios=${d.totals.spacesUsed}`);
    if (idx < data.days.length - 1) doc.addPage();
  });

  doc.end();
  return stream;
}

async function generateXLSX({ title = 'Reporte de Uso', rangeLabel, data }) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Unisalones';
  const ws = wb.addWorksheet('Uso');

  ws.addRow([title]);
  ws.addRow([rangeLabel || '']);
  ws.addRow([]);

  ws.addRow(['Día', 'Espacio', 'Reservas', 'Horas Totales', 'Estados']);
  ws.getRow(4).font = { bold: true };

  data.days.forEach((d) => {
    d.spaces.forEach((s) => {
      const estados = Object.entries(s.statusBreakdown)
        .map(([k, v]) => `${k}:${v}`)
        .join(', ');
      ws.addRow([d.day, s.spaceName, s.reservationsCount, s.totalHours, estados]);
    });
    ws.addRow([d.day, 'Totales Día', d.totals.reservationsCount, d.totals.totalHours, `Espacios:${d.totals.spacesUsed}`]);
    ws.addRow([]);
  });

  // Ajuste de columnas
  ws.columns.forEach((c) => (c.width = 22));

  return wb.xlsx.writeBuffer();
}

module.exports = {
  generatePDF,
  generateXLSX,
};
