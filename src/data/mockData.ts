import { CurrencyRate, GoldRate, RealEstateListing, CarListing, TaxiDeliveryOrder, LedgerEntry, Message, JobListing } from '../types';

export const initialCurrencyRates: CurrencyRate[] = [
  { city: 'دمشق (USD)', buy: 14800, sell: 14950, change: 0.35, updatedAt: 'منذ 5 دقائق' },
  { city: 'حلب (USD)', buy: 14850, sell: 15000, change: 0.20, updatedAt: 'منذ 8 دقائق' },
  { city: 'إدلب (USD)', buy: 15100, sell: 15250, change: -0.15, updatedAt: 'منذ 3 دقائق' },
  { city: 'اليورو (EUR)', buy: 16100, sell: 16300, change: 0.10, updatedAt: 'منذ 12 دقيقة' },
  { city: 'الريال السعودي (SAR)', buy: 3940, sell: 3990, change: 0.05, updatedAt: 'منذ 15 دقيقة' },
  { city: 'الليرة التركية (TRY)', buy: 360, sell: 375, change: -0.50, updatedAt: 'منذ 10 دقائق' },
];

export const initialGoldRates: GoldRate[] = [
  { karat: 'غرام عيار 21', priceSYP: 1045000, updatedAt: 'منذ 10 دقائق' },
  { karat: 'غرام عيار 18', priceSYP: 895000, updatedAt: 'منذ 10 دقائق' },
  { karat: 'الليرة الذهبية السورية', priceSYP: 8650000, updatedAt: 'منذ 10 دقائق' },
  { karat: 'الأونصة العالمية ($)', priceSYP: 2420, updatedAt: 'منذ 2 دقيقة' },
];

export const initialRealEstateListings: RealEstateListing[] = [
  {
    id: 're-1',
    title: 'شقة سكنية مخدمة بالكامل في المزة',
    type: 'rent',
    category: 'apartment',
    city: 'سوريا - دمشق',
    area: 'المزة فيلات غربية',
    priceSYP: 4500000,
    priceUSD: 300,
    period: 'monthly',
    rooms: 3,
    spaceSqM: 135,
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'],
    phone: '+963944123456',
    sellerName: 'مكتب المزة العقاري',
    featured: true
  },
  {
    id: 're-intl-1',
    title: '🇸🇦 شقة فاخرة 4 غرف للبيع في الرياض (حي النرجس)',
    type: 'sale',
    category: 'apartment',
    city: 'السعودية - الرياض',
    area: 'حي النرجس',
    priceSYP: 10500000000,
    priceUSD: 195000,
    rooms: 4,
    spaceSqM: 210,
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
    phone: '+966501234567',
    sellerName: 'مجموعة الرياض العقارية',
    featured: true
  },
  {
    id: 're-intl-2',
    title: '🇩🇪 شقة تمليك استثمارية في وسط برلين (Charlottenburg)',
    type: 'sale',
    category: 'apartment',
    city: 'ألمانيا - برلين',
    area: 'شارلوتنبرغ',
    priceSYP: 18000000000,
    priceUSD: 340000,
    rooms: 3,
    spaceSqM: 95,
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
    phone: '+4915123456789',
    sellerName: 'Euro-Syrian Property Experts',
    featured: true
  },
  {
    id: 're-2',
    title: 'محل تجاري للبيع موقع استثماري ممتاز',
    type: 'sale',
    category: 'shop',
    city: 'سوريا - حلب',
    area: 'الجميلية',
    priceSYP: 850000000,
    priceUSD: 57000,
    spaceSqM: 45,
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'],
    phone: '+963933987654',
    sellerName: 'أبو أحمد العقارات',
    featured: false
  },
  {
    id: 're-3',
    title: 'فيلا سوبر ديلوكس مع حديقة ومسبح',
    type: 'sale',
    category: 'house',
    city: 'سوريا - ريف دمشق',
    area: 'يعفور',
    priceSYP: 4200000000,
    priceUSD: 280000,
    rooms: 6,
    spaceSqM: 650,
    images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'],
    phone: '+963999112233',
    sellerName: 'المجموعة الذهبية',
    featured: false
  },
  {
    id: 're-4',
    title: 'شقة مفروشة للايجار اليومي أو الشهري',
    type: 'rent',
    category: 'apartment',
    city: 'سوريا - اللاذقية',
    area: 'الشارع الغربي',
    priceSYP: 3000000,
    priceUSD: 200,
    period: 'monthly',
    rooms: 2,
    spaceSqM: 90,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
    phone: '+963988776655',
    sellerName: 'شقق الساحل',
    featured: false
  },
  {
    id: 're-hotel-1',
    title: '🏨 حجز جناح وفندقة فاخرة - فندق رويال دمشق (حجز يومي/أسبوعي)',
    type: 'rent',
    category: 'hotel',
    city: 'سوريا - دمشق',
    area: 'أبو رمانة / شارع الثورة',
    priceSYP: 672000,
    priceUSD: 45,
    period: 'monthly',
    rooms: 1,
    spaceSqM: 45,
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'],
    phone: '+963944111222',
    sellerName: 'إدارة فندق رويال دمشق',
    featured: true
  },
  {
    id: 're-room-1',
    title: '🛋️ حجز غرفة مفروشة سوبر ديلوكس (للطلاب والموظفين والزوار)',
    type: 'rent',
    category: 'furnished_room',
    city: 'سوريا - اللاذقية',
    area: 'مشروع الصليبة / الساحل',
    priceSYP: 224000,
    priceUSD: 15,
    period: 'monthly',
    rooms: 1,
    spaceSqM: 32,
    images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'],
    phone: '+963933445566',
    sellerName: 'غرف وأجنحة الشاطئ المفروشة',
    featured: true
  },
  {
    id: 're-farm-1',
    title: '🏡 حجز مزرعة وشاليه مع مسبح خاص وحديقة (للعائلات والمناسبات)',
    type: 'rent',
    category: 'farm',
    city: 'سوريا - ريف دمشق',
    area: 'يعفور / صحنايا',
    priceSYP: 897000,
    priceUSD: 60,
    period: 'monthly',
    rooms: 3,
    spaceSqM: 850,
    images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'],
    phone: '+963999887766',
    sellerName: 'منتجع ومزارع النخيل VIP',
    featured: true
  }
];

export const initialCarListings: CarListing[] = [
  {
    id: 'item-intl-1',
    title: '🇦🇪 مرسيدس G-Class 2023 خالية تماماً (متاحة للشحن السريع إلى سوريا ودول الخليج)',
    category: 'car',
    condition: 'new',
    make: 'Mercedes-Benz',
    model: 'G-Class G63',
    year: 2023,
    priceUSD: 185000,
    priceSYP: 2775000000,
    type: 'sale',
    city: 'الإمارات - دبي',
    image: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=800&q=80',
    phone: '+971509988776',
    featured: true,
    featuredPlan: 'vip'
  },
  {
    id: 'item-video-1',
    title: 'فيديو معاينة: دريلة ومعدات Bosch الاحترافية بالفيديو 🎥',
    category: 'tools',
    condition: 'new',
    priceUSD: 185,
    priceSYP: 2775000,
    type: 'sale',
    city: 'سوريا - دمشق',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-carpenter-working-with-wood-41484-large.mp4',
    mediaType: 'video',
    phone: '+963944001122',
    featured: true,
    featuredPlan: 'golden'
  },
  {
    id: 'item-intl-2',
    title: '🇸🇦 شاشات ومعدات إلكترونية ومحطات طاقة شمسية شحن دولي من الرياض',
    category: 'electronics',
    condition: 'new',
    priceUSD: 650,
    priceSYP: 9750000,
    type: 'sale',
    city: 'السعودية - الرياض',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
    phone: '+966554433221',
    featured: true
  },
  {
    id: 'item-1',
    title: 'طقم أدوات صيانة ومفك كهربائي Bosch ألماني جديد',
    category: 'tools',
    condition: 'new',
    priceUSD: 140,
    priceSYP: 2100000,
    type: 'sale',
    city: 'سوريا - دمشق',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    phone: '+963944001122'
  },
  {
    id: 'item-2',
    title: 'مولدة كهرباء 5500 واط مستعملة نظيفة جداً مع بطارية',
    category: 'tools',
    condition: 'used',
    priceUSD: 320,
    priceSYP: 4750000,
    type: 'sale',
    city: 'سوريا - حلب',
    image: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
    phone: '+963955334455'
  },
  {
    id: 'car-1',
    title: 'كيا سيراتو موديل 2012 خالية من الداخل',
    category: 'car',
    condition: 'used',
    make: 'Kia',
    model: 'Cerato',
    year: 2012,
    priceUSD: 8500,
    priceSYP: 126500000,
    type: 'sale',
    mileage: 120000,
    city: 'سوريا - دمشق',
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
    phone: '+963944001122'
  }
];

export const initialTaxiOrders: TaxiDeliveryOrder[] = [
  {
    id: 'ord-intl-1',
    type: 'delivery',
    fromCity: 'السعودية - الرياض',
    fromArea: 'حي البطحاء (مكتب الشحن)',
    toArea: 'سوريا - دمشق (المرجة)',
    customerName: 'أبو فهد (شحن دولي)',
    phone: '+966508877665',
    status: 'pending',
    estimatedCostSYP: 450000,
    notes: '📦 شحن طرد هدايا وملابس من السعودية إلى دمشق وسوريا',
    createdAt: 'منذ 10 دقائق'
  },
  {
    id: 'ord-101',
    type: 'taxi',
    fromCity: 'سوريا - دمشق',
    fromArea: 'البرامكة',
    toArea: 'جرمانا',
    customerName: 'أبو محمد',
    phone: '+963933111222',
    status: 'accepted',
    estimatedCostSYP: 25000,
    notes: 'تكسي حديث مع مكيف',
    createdAt: '14:30'
  },
  {
    id: 'ord-102',
    type: 'delivery',
    fromCity: 'سوريا - دمشق',
    fromArea: 'الشعلان',
    toArea: 'الميدان',
    customerName: 'سارة',
    phone: '+963944555666',
    status: 'pending',
    estimatedCostSYP: 18000,
    notes: 'توصيل طرد حلويات وشوكولا',
    createdAt: '14:45'
  }
];

export const initialLedgerEntries: LedgerEntry[] = [
  {
    id: 'led-1',
    clientName: 'مكتب الأمل للتجارة',
    type: 'debit', // عليه
    amountSYP: 1500000,
    amountUSD: 100,
    note: 'دفعة ثمن بضاعة - متسحقة بنهاية الشهر',
    date: '2026-08-01',
    status: 'pending'
  },
  {
    id: 'led-2',
    clientName: 'خالد المحمود',
    type: 'credit', // له
    amountSYP: 450000,
    amountUSD: 30,
    note: 'أجور نقل وتوصيل طلبات',
    date: '2026-08-02',
    status: 'paid'
  }
];

export const initialMessages: Message[] = [
  {
    id: 'msg-1',
    sender: 'خدمة العملاء OMS',
    text: 'أهلاً بك في منصة OMS الأسواق السورية! كيف يمكننا مساعدتك اليوم؟',
    timestamp: '12:00 م',
    isMe: false,
    avatar: 'OMS'
  },
  {
    id: 'msg-2',
    sender: 'أنت',
    text: 'أرغب بمتابعة أسعار الصرف الحية وإضافة إعلان عقاري.',
    timestamp: '12:02 م',
    isMe: true
  },
  {
    id: 'msg-3',
    sender: 'خدمة العملاء OMS',
    text: 'تم تفعيل حسابك بنجاح. يمكنك استخدام قسم العقارات وقسم الصرف والخدمات المباشرة.',
    timestamp: '12:03 م',
    isMe: false,
    avatar: 'OMS'
  }
];

export const initialJobListings: JobListing[] = [
  {
    id: 'job-intl-1',
    title: '🇩🇪 Senior Full-Stack Developer (Remote / Berlin)',
    company: 'Syrian Tech Expats Network GMBH',
    city: 'ألمانيا - برلين',
    category: 'tech',
    jobType: 'remote',
    salaryUSD: 3800,
    salarySYP: 57000000,
    experienceYears: 4,
    description: 'مطلوب مبرمج سوري أو عربي مقيم في ألمانيا أو يعمل عن بُعد لتطوير أنظمة سحابية وتطبيقات جوال.',
    requirements: ['Fluent English or German', 'React, Node.js, Cloud Run', 'Remote Work Discipline'],
    phone: '+491761234567',
    whatsapp: '491761234567',
    email: 'careers@expats-tech.de',
    createdAt: 'منذ ساعة',
    featured: true
  },
  {
    id: 'job-intl-2',
    title: '🇸🇦 مدير مبيعات وتصدير إقليمي (الرياض)',
    company: 'مجموعة الخليج والشام للاستثمار',
    city: 'السعودية - الرياض',
    category: 'sales',
    jobType: 'full-time',
    salaryUSD: 2400,
    salarySYP: 36000000,
    experienceYears: 5,
    description: 'إدارة شبكة الموزعين والمبيعات الميدانية بين السعودية ودول الشرق الأوسط.',
    requirements: ['خبرة 5 سنوات بمبيعات التجزئة والجملة', 'رخصة قيادة سارية بالسعودية', 'مهارات تفاوض وتواصل عالية'],
    phone: '+966541122334',
    whatsapp: '966541122334',
    createdAt: 'منذ 3 ساعات',
    featured: true
  },
  {
    id: 'job-1',
    title: 'مهندس برمجيات وتطبيقات React / Node.js',
    company: 'شركة الشام للتكنولوجيا والمعلومات',
    city: 'سوريا - دمشق',
    category: 'tech',
    jobType: 'full-time',
    salaryUSD: 600,
    salarySYP: 9000000,
    experienceYears: 3,
    description: 'مطلوب مبرمج واجهات وتطبيقات ذو خبرة في React وTypeScript لبناء منصات تجارة إلكترونية وأنظمة دفع.',
    requirements: ['خبرة 3 سنوات على الأقل في React/Next.js', 'إتقان TypeScript وTailwind CSS', 'معرفة بـ REST APIs وNode.js'],
    phone: '+963944111222',
    whatsapp: '963944111222',
    email: 'jobs@sham-tech.sy',
    createdAt: 'منذ ساعتين',
    featured: true
  },
  {
    id: 'job-2',
    title: 'محاسب قانوني ومدقق مالي',
    company: 'مؤسسة البركة التجارية',
    city: 'سوريا - حلب',
    category: 'accounting',
    jobType: 'full-time',
    salaryUSD: 350,
    salarySYP: 5200000,
    experienceYears: 2,
    description: 'إعداد الحسابات الختامية والميزانيات وإدارة دفتر التجارة والعملات المزدوجة.',
    requirements: ['إجازة في الاقتصاد والعلوم المالية', 'خبرة في البرامج المحاسبية (التعليم، الأمين)', 'دقة في العمل وإعداد التقارير'],
    phone: '+963933444555',
    whatsapp: '963933444555',
    createdAt: 'منذ 5 ساعات',
    featured: false
  }
];

