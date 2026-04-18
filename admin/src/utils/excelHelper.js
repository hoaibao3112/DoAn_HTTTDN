import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

// Helper to export nicely formatted Excel files in browser using SheetJS (xlsx)
// columns: [{ key: 'MaNV', header: 'Mã NV', width: 12, type: 'string'|'date'|'number'|'currency' }]
export function exportToExcel({ filename = 'export.xlsx', sheetName = 'Sheet1', columns = [], data = [] }) {
  // Map data to ordered rows based on columns
  const rows = data.map(row => {
    const out = {};
    columns.forEach(col => {
      let val = row[col.key];
      if (val == null) val = '';
      if (col.type === 'date' && val) {
        // normalize date string
        const d = new Date(val);
        if (!isNaN(d)) val = dayjs(d).format('DD/MM/YYYY HH:mm');
      }
      if ((col.type === 'currency' || col.type === 'number') && val !== '') {
        // keep numbers as numbers when possible
        const n = Number(val);
        if (!isNaN(n)) {
          // For currency we will format as string with thousand separators to ensure Excel shows nicely regardless of locale
          if (col.type === 'currency') val = n.toLocaleString('vi-VN');
          else val = n;
        }
      }
      out[col.header] = val;
    });
    return out;
  });

  const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Set column widths
  ws['!cols'] = columns.map(c => ({ wch: c.width || 15 }));

  // Bold header row - best-effort: write header cell styles if supported
  // Note: cell styling may be limited depending on SheetJS build. We still set header values explicitly.
  const headerRow = 0;
  columns.forEach((c, idx) => {
    const cellAddress = XLSX.utils.encode_cell({ c: idx, r: headerRow });
    const cell = ws[cellAddress];
    if (cell) {
      // Try to set style (may not be supported by some builds)
      cell.s = cell.s || {};
      cell.s.font = { bold: true };
    }
  });

  // Trigger download
  XLSX.writeFile(wb, filename);
}
