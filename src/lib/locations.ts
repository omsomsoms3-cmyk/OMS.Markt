// International Locations and Helper Utils for OMS App

export interface CountryLocation {
  code: string;
  nameAr: string;
  nameEn: string;
  flag: string;
  cities: { nameAr: string; nameEn: string }[];
}

export const INTERNATIONAL_COUNTRIES: CountryLocation[] = [
  {
    code: 'SY',
    nameAr: 'سوريا',
    nameEn: 'Syria',
    flag: '🇸🇾',
    cities: [
      { nameAr: 'دمشق', nameEn: 'Damascus' },
      { nameAr: 'ريف دمشق', nameEn: 'Rural Damascus' },
      { nameAr: 'حلب', nameEn: 'Aleppo' },
      { nameAr: 'حمص', nameEn: 'Homs' },
      { nameAr: 'اللاذقية', nameEn: 'Lattakia' },
      { nameAr: 'طرطوس', nameEn: 'Tartous' },
      { nameAr: 'حماة', nameEn: 'Hama' },
      { nameAr: 'درعا', nameEn: 'Daraa' },
      { nameAr: 'السويداء', nameEn: 'Suwayda' },
      { nameAr: 'إدلب', nameEn: 'Idlib' },
      { nameAr: 'دير الزور', nameEn: 'Deir ez-Zor' },
    ],
  },
  {
    code: 'SA',
    nameAr: 'السعودية',
    nameEn: 'Saudi Arabia',
    flag: '🇸🇦',
    cities: [
      { nameAr: 'الرياض', nameEn: 'Riyadh' },
      { nameAr: 'جدة', nameEn: 'Jeddah' },
      { nameAr: 'الدمام', nameEn: 'Dammam' },
      { nameAr: 'مكة المكرمة', nameEn: 'Makkah' },
      { nameAr: 'المدينة المنورة', nameEn: 'Madinah' },
    ],
  },
  {
    code: 'AE',
    nameAr: 'الإمارات',
    nameEn: 'UAE',
    flag: '🇦🇪',
    cities: [
      { nameAr: 'دبي', nameEn: 'Dubai' },
      { nameAr: 'أبو ظبي', nameEn: 'Abu Dhabi' },
      { nameAr: 'الشارقة', nameEn: 'Sharjah' },
      { nameAr: 'عجمان', nameEn: 'Ajman' },
    ],
  },
  {
    code: 'DE',
    nameAr: 'ألمانيا',
    nameEn: 'Germany',
    flag: '🇩🇪',
    cities: [
      { nameAr: 'برلين', nameEn: 'Berlin' },
      { nameAr: 'ميونخ', nameEn: 'Munich' },
      { nameAr: 'فرانكفورت', nameEn: 'Frankfurt' },
      { nameAr: 'هامبورغ', nameEn: 'Hamburg' },
    ],
  },
  {
    code: 'TR',
    nameAr: 'تركيا',
    nameEn: 'Turkey',
    flag: '🇹🇷',
    cities: [
      { nameAr: 'إسطنبول', nameEn: 'Istanbul' },
      { nameAr: 'غازي عنتاب', nameEn: 'Gaziantep' },
      { nameAr: 'أنقرة', nameEn: 'Ankara' },
      { nameAr: 'إزمير', nameEn: 'Izmir' },
    ],
  },
  {
    code: 'QA',
    nameAr: 'قطر',
    nameEn: 'Qatar',
    flag: '🇶🇦',
    cities: [
      { nameAr: 'الدوحة', nameEn: 'Doha' },
      { nameAr: 'الريان', nameEn: 'Al Rayyan' },
    ],
  },
  {
    code: 'KW',
    nameAr: 'الكويت',
    nameEn: 'Kuwait',
    flag: '🇰🇼',
    cities: [
      { nameAr: 'الكويت العاصمة', nameEn: 'Kuwait City' },
      { nameAr: 'حولي', nameEn: 'Hawalli' },
    ],
  },
  {
    code: 'JO',
    nameAr: 'الأردن',
    nameEn: 'Jordan',
    flag: '🇯🇴',
    cities: [
      { nameAr: 'عمان', nameEn: 'Amman' },
      { nameAr: 'إربد', nameEn: 'Irbid' },
    ],
  },
  {
    code: 'EG',
    nameAr: 'مصر',
    nameEn: 'Egypt',
    flag: '🇪🇬',
    cities: [
      { nameAr: 'القاهرة', nameEn: 'Cairo' },
      { nameAr: 'الإسكندرية', nameEn: 'Alexandria' },
    ],
  },
  {
    code: 'OTHER',
    nameAr: 'دول أخرى / دولي',
    nameEn: 'Other / International',
    flag: '🌍',
    cities: [
      { nameAr: 'مغتربين / دولي', nameEn: 'International / Expats' },
    ],
  },
];

// Flat list of all cities for dropdowns with flag indicators
export const ALL_LOCATION_OPTIONS = INTERNATIONAL_COUNTRIES.flatMap((country) =>
  country.cities.map((city) => ({
    value: `${country.nameAr} - ${city.nameAr}`,
    cityAr: city.nameAr,
    countryAr: country.nameAr,
    countryCode: country.code,
    flag: country.flag,
    labelAr: `${country.flag} ${country.nameAr} - ${city.nameAr}`,
    labelEn: `${country.flag} ${country.nameEn} - ${city.nameEn}`,
  }))
);
