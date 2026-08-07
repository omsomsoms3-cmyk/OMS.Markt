import { ItemRating } from '../types';

const STORAGE_KEY = 'oms_item_ratings_v1';

export const initialRatings: ItemRating[] = [
  {
    id: 'rat-1',
    itemId: 'item-1',
    itemTitle: 'طقم أدوات صيانة ومفك كهربائي Bosch ألماني جديد',
    itemCategory: 'tools',
    rating: 5,
    comment: 'ممتازة جداً وأصلية 100%. جربت المفك الكهربائي عزمة قوي والبطارية تدوم لساعات طويلة.',
    authorName: 'المهندس طارق',
    authorRole: 'buyer',
    createdAt: 'منذ يومين'
  },
  {
    id: 'rat-2',
    itemId: 'item-1',
    itemTitle: 'طقم أدوات صيانة ومفك كهربائي Bosch ألماني جديد',
    itemCategory: 'tools',
    rating: 5,
    comment: 'تم الشراء والتسليم يداً بيد. تعامل راقي والقطع الملحقة كاملة دون أي نقص.',
    authorName: 'سامر الحمصي',
    authorRole: 'customer',
    createdAt: 'منذ 4 أيام'
  },
  {
    id: 'rat-3',
    itemId: 'item-video-1',
    itemTitle: 'فيديو معاينة: دريلة ومعدات Bosch الاحترافية بالفيديو 🎥',
    itemCategory: 'tools',
    rating: 5,
    comment: 'شاهدت المعاينة بالفيديو وكانت واضحة جداً. المعدات خامة ممتازة وتستحق السعر.',
    authorName: 'أبو العبد (فني كهرباء)',
    authorRole: 'visitor',
    createdAt: 'منذ أسبوع'
  },
  {
    id: 'rat-4',
    itemId: 'item-2',
    itemTitle: 'مولدة كهرباء 5500 واط مستعملة نظيفة جداً مع بطارية',
    itemCategory: 'tools',
    rating: 4,
    comment: 'المولدة تعمل بProfile جبار وتشغل المكيف والأجهزة المنزلية بكل سهولة.',
    authorName: 'خالد دمشق',
    authorRole: 'buyer',
    createdAt: 'منذ أسبوعين'
  },
  {
    id: 'rat-5',
    itemId: 'item-intl-2',
    itemTitle: '🇸🇦 شاشات ومعدات إلكترونية ومحطات طاقة شمسية',
    itemCategory: 'electronics',
    rating: 5,
    comment: 'وصلت محطة الطاقة الشمسية من الرياض بدبي ودون أي خدش. تقييمي 5 نجوم.',
    authorName: 'أبو فهد السعودي',
    authorRole: 'buyer',
    createdAt: 'منذ 3 أيام'
  }
];

export const getStoredRatings = (): ItemRating[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRatings));
      return initialRatings;
    }
    return JSON.parse(data);
  } catch (e) {
    return initialRatings;
  }
};

export const saveRatings = (ratings: ItemRating[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
  } catch (e) {
    console.error('Error saving ratings:', e);
  }
};

export const getItemRatings = (itemId: string): ItemRating[] => {
  const all = getStoredRatings();
  return all.filter((r) => r.itemId === itemId);
};

export const getItemAverageRating = (itemId: string): { average: number; count: number } => {
  const list = getItemRatings(itemId);
  if (list.length === 0) {
    return { average: 5.0, count: 0 }; // Default base or 0
  }
  const sum = list.reduce((acc, curr) => acc + curr.rating, 0);
  const avg = Number((sum / list.length).toFixed(1));
  return { average: avg, count: list.length };
};
