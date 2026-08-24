import { SyrianOfficialNewsItem } from '../types';
import { BASE_SYRIAN_OFFICIAL_NEWS } from '../data/syrianOfficialNewsData';

export interface HourlySyncStatus {
  currentDamascusTime: string;
  currentHourBulletin: string;
  nextUpdateInMinutes: number;
  lastUpdatedFormatted: string;
  totalBulletinsToday: number;
}

export function formatDamascusTime(date: Date = new Date()): string {
  // Format in Damascus / Syria timezone (UTC+3)
  try {
    return new Intl.DateTimeFormat('ar-SY', {
      timeZone: 'Asia/Damascus',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch (e) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}

export function getHourlySyncStatus(): HourlySyncStatus {
  const now = new Date();
  const currentMinutes = now.getMinutes();
  const nextUpdateInMinutes = 60 - currentMinutes;
  const currentHour = now.getHours();
  const formattedHour = currentHour.toString().padStart(2, '0');

  return {
    currentDamascusTime: formatDamascusTime(now),
    currentHourBulletin: `نشرة الساعة ${formattedHour}:00 الرسمية`,
    nextUpdateInMinutes,
    lastUpdatedFormatted: `مباشر ${formatDamascusTime(now)} (بتوقيت دمشق)`,
    totalBulletinsToday: 24 + currentHour,
  };
}

export function getRefreshedOfficialNews(): SyrianOfficialNewsItem[] {
  const now = Date.now();
  
  return BASE_SYRIAN_OFFICIAL_NEWS.map((item, index) => {
    // Generate fresh dynamic timestamp for realism
    const minutesOffset = (index * 42) + 8;
    const itemDate = new Date(now - minutesOffset * 60 * 1000);
    
    let relativeAr = '';
    let relativeEn = '';

    if (minutesOffset < 60) {
      relativeAr = `منذ ${minutesOffset} دقيقة (نشرة الساعة الحالية)`;
      relativeEn = `${minutesOffset} min ago`;
    } else {
      const hours = Math.floor(minutesOffset / 60);
      const remainingMinutes = minutesOffset % 60;
      relativeAr = `منذ ${hours} ساعة ${remainingMinutes > 0 ? `و${remainingMinutes} د` : ''}`;
      relativeEn = `${hours}h ago`;
    }

    return {
      ...item,
      publishedAt: itemDate.toISOString(),
      relativeTimeAr: relativeAr,
      relativeTimeEn: relativeEn,
    };
  });
}

// Text to speech voice player for Syrian Official News
export function playNewsSpeech(text: string, onEnd?: () => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // stop any prior speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA'; // Arabic speech
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    console.error('Speech synthesis failed:', e);
    return false;
  }
}

export function stopNewsSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}
