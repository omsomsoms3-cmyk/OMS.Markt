export type TabType = 'embed' | 'currency' | 'realestate' | 'cars' | 'taxidelivery' | 'jobs' | 'ledger' | 'messages' | 'saved';

export interface SavedListingItem {
  id: string;
  itemType: 'car' | 'realestate' | 'job' | 'taxi';
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
  updatedAt: string;
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
  category?: 'car' | 'tools' | 'electronics' | 'appliances' | 'furniture' | 'realestate' | 'service';
  condition?: 'new' | 'used';
  make?: string;
  model?: string;
  year?: number;
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



