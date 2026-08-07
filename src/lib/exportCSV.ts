import { SavedListingItem } from '../types';
import { UserActivityLog } from './activityLogs';

export function downloadCSV(filename: string, headers: string[], rows: (string | number | boolean)[][]): void {
  // UTF-8 BOM for Arabic text support in Excel and Google Sheets
  const BOM = '\uFEFF';

  const csvContent = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          if (cell === null || cell === undefined) return '""';
          const strCell = String(cell);
          return `"${strCell.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportBookmarksToCSV(bookmarks: SavedListingItem[]): void {
  const headers = [
    'المعرّف (ID)',
    'عنوان الإعلان (Title)',
    'العنوان الفرعي (Subtitle)',
    'نوع القسم (Type)',
    'المدينة (City)',
    'السعر بالدولار ($USD)',
    'السعر بالليرة (SYP)',
    'حالة التأكيد (Status)',
    'تاريخ التأكيد (Confirmed Date)',
    'الملاحظات (Notes)',
  ];

  const rows = bookmarks.map((b) => [
    b.id,
    b.title,
    b.subtitle || '',
    b.itemType || 'general',
    b.city || '',
    b.priceUSD ? `$${b.priceUSD}` : '',
    b.priceSYP ? `${b.priceSYP} ل.س` : '',
    b.confirmed ? 'مؤكد ✅' : 'قيد الانتظار ⏳',
    b.confirmedAt || '',
    b.confirmationNotes || '',
  ]);

  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSV(`OMS_Saved_Listings_${dateStr}.csv`, headers, rows);
}

export function exportActivityLogsToCSV(logs: UserActivityLog[]): void {
  const headers = [
    'المعرّف (Log ID)',
    'النشاط (Action)',
    'التفاصيل (Details)',
    'البريد الإلكتروني (User Email)',
    'تاريخ ووقت النشاط (Timestamp)',
  ];

  const rows = logs.map((l) => [
    l.id || '',
    l.action,
    l.details,
    l.userEmail || 'omsomsoms3@gmail.com',
    l.createdAt,
  ]);

  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCSV(`OMS_Activity_Logs_${dateStr}.csv`, headers, rows);
}
