/**
 * Helper to export data tables to Excel-compatible CSV or Excel XML format with Arabic UTF-8 BOM
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  // Add UTF-8 BOM for Arabic text to render properly in Excel
  const BOM = '\uFEFF';
  const csvContent =
    BOM +
    [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const str = cell !== undefined && cell !== null ? String(cell) : '';
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Trigger clean browser print dialog with styling for reports
 */
export function printReport(title: string, printableElementId?: string) {
  const originalTitle = document.title;
  document.title = title;
  window.print();
  document.title = originalTitle;
}
