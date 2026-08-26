export type TabType = 'embed' | 'currency' | 'phones' | 'news' | 'realestate' | 'cars' | 'taxidelivery' | 'jobs' | 'ledger' | 'messages' | 'saved';

export type PhoneBrand = 'Apple' | 'Samsung' | 'Xiaomi' | 'Infinix' | 'Tecno' | 'Realme' | 'Huawei' | 'Honor' | 'Google' | 'OnePlus' | 'Nokia' | 'Other';

export interface MobilePhoneItem {
  id: string;
  brand: PhoneBrand;
  modelNameAr: string;
  modelNameEn: string;
  storage: string;
  ram: string;
  colorAr: string;
  image: string;
  priceUSD: number; // Raw USD Price in international market
  priceWithoutCustomsSYP: number; // Syrian Pounds price without customs
  customsTaxSYP: number; // Syrian Customs Fee (رسم الجمركة السورية والتصريح)
  customsTaxUSD: number;
  totalWithCustomsSYP: number; // Full official price with customs and registered warranty
  isOfficialCustoms: boolean; // Has official Syrian registration
  warrantyAr: string; // e.g. "كفالة إيماتيل 12 شهر", "كفالة المتكاملة", "ضمان معتمد"
  network: '5G' | '4G' | '3G';
  screen: string;
  battery: string;
  camera: string;
  processor: string;
  change24h: number;
  minuteTrend: 'up' | 'down' | 'stable';
  isBestSeller?: boolean;
  isNewRelease?: boolean;
  releaseYear: number;
  popularInCities: string[];
  lastUpdatedMinute: string;
  officialDistributor?: string;
  customsTier: 'الشريحة الأولى (اقتصادي)' | 'الشريحة الثانية (متوسط)' | 'الشريحة الثالثة (فوق متوسط)' | 'الشريحة الرابعة (فلاقشيب وفائق)';
}

export interface TechProductItem {
  id: string;
  category: 'tablet' | 'laptop' | 'smartwatch' | 'power_solar' | 'accessories';
  categoryAr: string;
  nameAr: string;
  nameEn: string;
  brand: string;
  image: string;
  priceUSD: number;
  priceSYP: number;
  change24h: number;
  minuteTrend: 'up' | 'down' | 'stable';
  specsAr: string;
  warrantyAr: string;
  isPopularInSyria: boolean;
  lastUpdatedMinute: string;
}

export interface SyrianOfficialNewsItem {
  id: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  contentAr: string;
  contentEn: string;
  category: 'local' | 'economy' | 'services' | 'official_statements' | 'culture' | 'sports';
  categoryAr: string;
  categoryEn: string;
  governorate: string;
  source: 'الوكالة العربية السورية للأنباء - سانا (SANA)';
  bulletinNumber: string;
  publishedAt: string;
  relativeTimeAr: string;
  relativeTimeEn: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  image: string;
  tags: string[];
  officialSourceUrl: string;
  viewsCount: number;
}

export interface SavedListingItem {
  id: string;
  itemType: 'car' | 'realestate' | 'news' | 'job' | 'taxi' | 'phone' | 'goods' | 'general';
  title: string;
  subtitle: string;
  city: string;
  priceSYP?: number;
  priceUSD?: number;
  image?: string;
  phone: string;
  savedAt: string;
  originalData: any;
  confirmed?: boolean;
  confirmedAt?: string;
  confirmationNotes?: string;
}

export interface CurrencyRate {
  city: string;
  buy: number;
  sell: number;
  change: number;
  updatedAt: string;
}

export interface GoldRate {
  karat: string;
  priceSYP: number;
  priceUSD?: number;
  change24h?: number;
  updatedAt: string;
  badge?: string;
  description?: string;
}

export interface SyrianGoodItem {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'food_pantry' | 'produce' | 'dairy_poultry' | 'household' | 'beverages' | 'sweets_traditional' | 'crafts_syrian';
  categoryAr: string;
  categoryEn: string;
  unit: string;
  unitEn: string;
  priceSYP: number;
  priceUSD: number;
  marketAverageSYP: number;
  minPriceSYP: number;
  maxPriceSYP: number;
  change24h: number;
  isSyrianMade: boolean;
  famousOrigin?: string;
  verifiedOnlineSource: string;
  lastUpdated: string;
  image: string;
  descriptionAr: string;
  descriptionEn: string;
  popularBrands?: string[];
}

export interface RealEstateListing {
  id: string;
  title: string;
  type: 'sale' | 'rent';
  category: 'apartment' | 'house' | 'shop' | 'land' | 'hotel' | 'furnished_room' | 'farm' | 'chalet';
  city: string;
  area: string;
  priceSYP: number;
  priceUSD: number;
  period?: 'monthly' | 'yearly';
  rooms?: number;
  spaceSqM: number;
  images: string[];
  phone: string;
  sellerName: string;
  featured?: boolean;
  createdAt?: string;
  dailyIndex?: number;
}

export interface CarListing {
  id: string;
  title: string;
  category?: 'mobile' | 'phones' | 'car' | 'tools' | 'electronics' | 'appliances' | 'furniture' | 'realestate' | 'service' | 'other' | string;
  condition?: 'new' | 'used' | 'certified' | string;
  make?: string;
  model?: string;
  year?: number;
  storage?: string;
  ram?: string;
  batteryHealth?: number;
  customsStatus?: 'official' | 'uncustoms' | string;
  priceUSD: number;
  priceSYP: number;
  type: 'sale' | 'rent';
  mileage?: number;
  city: string;
  image: string;
  images?: string[];
  video?: string;
  mediaType?: 'image' | 'video';
  phone: string;
  featured?: boolean;
  featuredPlan?: 'standard' | 'golden' | 'vip';
  createdAt?: string;
  dailyIndex?: number;
}

export interface TaxiDeliveryOrder {
  id: string;
  type: 'taxi' | 'delivery';
  fromCity: string;
  fromArea: string;
  toArea: string;
  customerName: string;
  phone: string;
  status: 'pending' | 'accepted' | 'completed';
  estimatedCostSYP: number;
  notes: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  clientName: string;
  type: 'credit' | 'debit'; // له / عليه
  amountSYP: number;
  amountUSD?: number;
  note: string;
  date: string;
  status: 'pending' | 'paid';
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  avatar?: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  city: string;
  category: 'tech' | 'sales' | 'accounting' | 'education' | 'medical' | 'crafts' | 'other';
  jobType: 'full-time' | 'part-time' | 'freelance' | 'remote';
  salaryUSD?: number;
  salarySYP: number;
  experienceYears?: number;
  description: string;
  requirements?: string[];
  phone: string;
  whatsapp?: string;
  email?: string;
  createdAt: string;
  featured?: boolean;
}

export type ReportReason = 'spam' | 'fake' | 'inappropriate' | 'scam' | 'wrong_price' | 'other';

export interface PostReport {
  id: string;
  postId: string;
  postTitle: string;
  postCategory: string; // e.g., 'عقارات', 'سيارات / سوق', 'وظائف', 'تكسي وتوصيل'
  reason: ReportReason;
  reasonText?: string;
  reporterName?: string;
  reporterPhone?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface AutoAlert {
  id: string;
  postId: string;
  postTitle: string;
  postCategory: string;
  reportCount: number;
  timestamp: string;
  read: boolean;
}

export interface RateAlert {
  id: string;
  city: string;
  targetRate: number;
  rateType: 'buy' | 'sell';
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: string;
  triggeredCount?: number;
  lastTriggeredAt?: string;
  note?: string;
}

export interface ItemRating {
  id: string;
  itemId: string;
  itemTitle: string;
  itemCategory?: string;
  rating: number; // 1 to 5 stars
  comment: string;
  authorName: string;
  authorRole: 'customer' | 'visitor' | 'buyer';
  createdAt: string;
}



