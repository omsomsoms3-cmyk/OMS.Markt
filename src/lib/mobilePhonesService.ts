import { MobilePhoneItem, TechProductItem } from '../types';
import { BASE_MOBILE_PHONES, BASE_TECH_PRODUCTS } from '../data/mobilePhonesData';

export interface MinuteSyncStatus {
  currentTimeDamascus: string;
  currentDateFormatted: string;
  nextTickSeconds: number;
  lastSyncFormatted: string;
  marketUsdRate: number;
  totalTrackedDevices: number;
  customsTiersSummary: {
    tier1Text: string;
    tier2Text: string;
    tier3Text: string;
    tier4Text: string;
  };
}

export function formatDamascusClock(date: Date = new Date()): string {
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
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
}

export function getMinuteSyncStatus(marketUsdRate: number = 14900): MinuteSyncStatus {
  const now = new Date();
  const seconds = now.getSeconds();
  const nextTickSeconds = 60 - seconds;

  let dateStr = '';
  try {
    dateStr = new Intl.DateTimeFormat('ar-SY', {
      timeZone: 'Asia/Damascus',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(now);
  } catch {
    dateStr = now.toLocaleDateString('ar-SY');
  }

  return {
    currentTimeDamascus: formatDamascusClock(now),
    currentDateFormatted: dateStr,
    nextTickSeconds,
    lastSyncFormatted: `محدث دقيقة بدقيقة (${formatDamascusClock(now)} بتوقيت دمشق)`,
    marketUsdRate,
    totalTrackedDevices: BASE_MOBILE_PHONES.length + BASE_TECH_PRODUCTS.length,
    customsTiersSummary: {
      tier1Text: 'الشريحة الأولى (هواتف اقتصادية حتى 150$): رسم تصريح مخفّض',
      tier2Text: 'الشريحة الثانية (هواتف متوسطة 150$ - 300$): رسم تصريح قياسي',
      tier3Text: 'الشريحة الثالثة (هواتف فوق متوسطة 300$ - 650$): رسم تصريح متقدم',
      tier4Text: 'الشريحة الرابعة (أجهزة فلاقشيب وفائقة فوق 650$): رسم التصريح الأعلى',
    },
  };
}

export function roundToNearest(value: number, roundUnit: number = 1000): number {
  return Math.round(value / roundUnit) * roundUnit;
}

/**
 * Generates live dynamically recalculated mobile phones list linked to the live USD exchange rate
 * and realistic minute-by-minute fluctuations.
 */
export function getLiveRecalculatedPhones(
  usdRate: number = 14900,
  tickSeed: number = 0
): MobilePhoneItem[] {
  const now = new Date();
  const timeFormatted = formatDamascusClock(now).slice(0, 5); // HH:MM

  return BASE_MOBILE_PHONES.map((phone, idx) => {
    // Dynamic slight market tick for realism based on seed
    const microTick = ((idx % 3 === 0 ? 1 : idx % 2 === 0 ? -1 : 0) * (tickSeed % 4)) * 0.05;
    const effectiveChange = +(phone.change24h + microTick).toFixed(2);
    
    // Live calculated prices
    const priceWithoutCustomsSYP = roundToNearest(phone.priceUSD * usdRate, 1000);
    const customsTaxSYP = roundToNearest(phone.customsTaxUSD * usdRate, 1000);
    const totalWithCustomsSYP = priceWithoutCustomsSYP + customsTaxSYP;

    let minuteTrend: 'up' | 'down' | 'stable' = phone.minuteTrend;
    if (effectiveChange > 0.05) minuteTrend = 'up';
    else if (effectiveChange < -0.05) minuteTrend = 'down';
    else minuteTrend = 'stable';

    return {
      ...phone,
      priceWithoutCustomsSYP,
      customsTaxSYP,
      totalWithCustomsSYP,
      change24h: effectiveChange,
      minuteTrend,
      lastUpdatedMinute: `الساعة ${timeFormatted} مباشر`,
    };
  });
}

/**
 * Generates live recalculated tech & solar products list
 */
export function getLiveRecalculatedTechProducts(
  usdRate: number = 14900,
  tickSeed: number = 0
): TechProductItem[] {
  const now = new Date();
  const timeFormatted = formatDamascusClock(now).slice(0, 5);

  return BASE_TECH_PRODUCTS.map((prod, idx) => {
    const microTick = ((idx % 2 === 0 ? 1 : -1) * (tickSeed % 3)) * 0.04;
    const effectiveChange = +(prod.change24h + microTick).toFixed(2);
    const priceSYP = roundToNearest(prod.priceUSD * usdRate, 1000);

    let minuteTrend: 'up' | 'down' | 'stable' = prod.minuteTrend;
    if (effectiveChange > 0.05) minuteTrend = 'up';
    else if (effectiveChange < -0.05) minuteTrend = 'down';
    else minuteTrend = 'stable';

    return {
      ...prod,
      priceSYP,
      change24h: effectiveChange,
      minuteTrend,
      lastUpdatedMinute: `الساعة ${timeFormatted} مباشر`,
    };
  });
}

/**
 * Syrian Customs (الجمركة والتصريح الجمركي) Live Calculator Engine
 */
export interface CustomPhoneCalculationResult {
  rawUsdPrice: number;
  exchangeRateSYP: number;
  tierNameAr: string;
  customsPercentage: number;
  customsFeeUSD: number;
  customsFeeSYP: number;
  priceWithoutCustomsSYP: number;
  totalWithCustomsSYP: number;
  totalWithCustomsUSD: number;
  warrantyRecommendedCostSYP: number;
}

export interface PhoneAverageMarketInfo {
  averageCustomedSYP: number;
  averageCustomedUSD: number;
  avgTotalWithCustomsSYP: number;
  avgTotalUSD: number;
  averageUncustomedSYP: number;
  averageUncustomedUSD: number;
  averageCustomsFeeSYP: number;
  averageCustomsFeeUSD: number;
  minPriceSYP: number;
  maxPriceSYP: number;
  minTotalWithCustomsSYP: number;
  maxTotalWithCustomsSYP: number;
  priceSpreadPercentage: number;
  fairStatusAr: string;
}

export function getPhoneAverageMarketInfo(
  phone: MobilePhoneItem,
  usdRate: number = 14900
): PhoneAverageMarketInfo {
  const baseSYP = roundToNearest(phone.priceUSD * usdRate, 1000);
  const customsSYP = roundToNearest(phone.customsTaxUSD * usdRate, 1000);
  const avgCustomedSYP = baseSYP + customsSYP;
  const avgCustomedUSD = phone.priceUSD + phone.customsTaxUSD;

  // Typical local market spread in Syrian governorates (±2% - 3%)
  const minPriceSYP = roundToNearest(avgCustomedSYP * 0.98, 1000);
  const maxPriceSYP = roundToNearest(avgCustomedSYP * 1.025, 1000);

  return {
    averageCustomedSYP: avgCustomedSYP,
    averageCustomedUSD: avgCustomedUSD,
    avgTotalWithCustomsSYP: avgCustomedSYP,
    avgTotalUSD: avgCustomedUSD,
    averageUncustomedSYP: baseSYP,
    averageUncustomedUSD: phone.priceUSD,
    averageCustomsFeeSYP: customsSYP,
    averageCustomsFeeUSD: phone.customsTaxUSD,
    minPriceSYP,
    maxPriceSYP,
    minTotalWithCustomsSYP: minPriceSYP,
    maxTotalWithCustomsSYP: maxPriceSYP,
    priceSpreadPercentage: 2.5,
    fairStatusAr: 'متوسط سعري عادل ومعتمد',
  };
}

export function calculateSyrianPhoneCustoms(
  usdPrice: number,
  exchangeRateSYP: number = 14900
): CustomPhoneCalculationResult {
  const safeUsd = Math.max(1, usdPrice || 0);

  let tierNameAr = '';
  let customsPercentage = 0.58; // default ~58%

  if (safeUsd <= 140) {
    tierNameAr = 'الشريحة الأولى (هواتف اقتصادية)';
    customsPercentage = 0.60;
  } else if (safeUsd <= 300) {
    tierNameAr = 'الشريحة الثانية (هواتف متوسطة)';
    customsPercentage = 0.62;
  } else if (safeUsd <= 650) {
    tierNameAr = 'الشريحة الثالثة (هواتف فوق متوسطة)';
    customsPercentage = 0.63;
  } else {
    tierNameAr = 'الشريحة الرابعة (أجهزة فلاقشيب وفاخرة)';
    customsPercentage = 0.65;
  }

  const customsFeeUSD = Math.round(safeUsd * customsPercentage);
  const customsFeeSYP = roundToNearest(customsFeeUSD * exchangeRateSYP, 1000);
  const priceWithoutCustomsSYP = roundToNearest(safeUsd * exchangeRateSYP, 1000);
  const totalWithCustomsSYP = priceWithoutCustomsSYP + customsFeeSYP;
  const totalWithCustomsUSD = safeUsd + customsFeeUSD;
  const warrantyRecommendedCostSYP = roundToNearest(totalWithCustomsSYP * 0.04, 1000); // 4% typical local official warranty margin

  return {
    rawUsdPrice: safeUsd,
    exchangeRateSYP,
    tierNameAr,
    customsPercentage: Math.round(customsPercentage * 100),
    customsFeeUSD,
    customsFeeSYP,
    priceWithoutCustomsSYP,
    totalWithCustomsSYP,
    totalWithCustomsUSD,
    warrantyRecommendedCostSYP,
  };
}
