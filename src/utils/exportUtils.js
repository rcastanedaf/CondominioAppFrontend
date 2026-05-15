import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = { header: [30, 80, 160], alt: [245, 248, 255] };

/**
 * Exporta un arreglo de objetos a Excel
 * @param {Object[]} data  - Datos planos (array de objetos)
 * @param {string}   sheet - Nombre de la hoja
 * @param {string}   file  - Nombre del archivo (sin extensión)
 */
export const exportExcel = (data, sheet, file) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheet);
    XLSX.writeFile(wb, `${file}.xlsx`);
};

/**
 * Exporta a PDF con tabla profesional
 * @param {string[]}  columns - Encabezados de columnas
 * @param {any[][]}   rows    - Filas de datos (array de arrays)
 * @param {string}    title   - Título del reporte
 * @param {string}    file    - Nombre del archivo (sin extensión)
 */
export const exportPDF = (columns, rows, title, file) => {
    const doc = new jsPDF({ orientation: rows[0]?.length > 5 ? 'landscape' : 'portrait' });

    // Logo / Encabezado
    doc.setFillColor(...COLORS.header);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CondominioApp', 14, 13);
    doc.setFontSize(10);
    doc.text(title, 14, 19);

    doc.setTextColor(100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const now = new Date().toLocaleString('es-GT');
    doc.text(`Generado: ${now}`, doc.internal.pageSize.width - 14, 26, { align: 'right' });

    autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 28,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: COLORS.header, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: COLORS.alt },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.1,
    });

    doc.save(`${file}.pdf`);
};

/** Formatea número como moneda GTQ */
export const fmtQ = (n) =>
    `Q ${Number(n ?? 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`;

/** Formatea fecha corta */
export const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('es-GT') : '—';