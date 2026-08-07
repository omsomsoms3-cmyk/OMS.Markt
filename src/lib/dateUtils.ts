// Helper functions for formatting publication dates and ordering listings by day

export function getListingDate(createdAt?: string, fallbackOffsetHours: number = 0): Date {
  if (createdAt) {
    const d = new Date(createdAt);
    if (!isNaN(d.getTime())) {
      return d;
    }
  }
  // Fallback to today minus offset hours
  const now = new Date();
  now.setHours(now.getHours() - fallbackOffsetHours);
  return now;
}

export function formatPublicationDate(
  createdAt?: string,
  language: string = 'ar',
  fallbackOffsetHours: number = 0
): { dateStr: string; badgeLabel: string; isToday: boolean } {
  const dateObj = getListingDate(createdAt, fallbackOffsetHours);
  const now = new Date();

  const isToday =
    dateObj.getDate() === now.getDate() &&
    dateObj.getMonth() === now.getMonth() &&
    dateObj.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear();

  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (language === 'ar') {
    if (isToday) {
      return {
        dateStr: `اليوم (${timeStr})`,
        badgeLabel: `منشور اليوم 📅 ${timeStr}`,
        isToday: true,
      };
    }
    if (isYesterday) {
      return {
        dateStr: `أمس (${timeStr})`,
        badgeLabel: `منشور أمس 🗓️ ${timeStr}`,
        isToday: false,
      };
    }
    const day = dateObj.getDate();
    const monthsAr = [
      'كانون الثاني',
      'شباط',
      'آذار',
      'نيسان',
      'أيار',
      'حزيران',
      'تموز',
      'آب',
      'أيلول',
      'تشرين الأول',
      'تشرين الثاني',
      'كانون الأول',
    ];
    const monthName = monthsAr[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return {
      dateStr: `${day} ${monthName} ${year}`,
      badgeLabel: `تاريخ النشر: ${day} ${monthName}`,
      isToday: false,
    };
  } else {
    if (isToday) {
      return {
        dateStr: `Today at ${timeStr}`,
        badgeLabel: `Posted Today 📅 ${timeStr}`,
        isToday: true,
      };
    }
    if (isYesterday) {
      return {
        dateStr: `Yesterday at ${timeStr}`,
        badgeLabel: `Posted Yesterday 🗓️ ${timeStr}`,
        isToday: false,
      };
    }
    return {
      dateStr: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      badgeLabel: `Published: ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      isToday: false,
    };
  }
}

export function sortListingsByDate<T extends { createdAt?: string }>(
  items: T[],
  direction: 'desc' | 'asc' = 'desc'
): T[] {
  return [...items].sort((a, b) => {
    const timeA = getListingDate(a.createdAt).getTime();
    const timeB = getListingDate(b.createdAt).getTime();
    return direction === 'desc' ? timeB - timeA : timeA - timeB;
  });
}
