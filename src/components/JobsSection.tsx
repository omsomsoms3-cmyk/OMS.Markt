import React, { useState, useEffect } from 'react';
import { JobListing } from '../types';
import { initialJobListings } from '../data/mockData';
import { subscribeToJobListings, saveJobToFirestore } from '../lib/listingsService';
import { Briefcase, Plus, Phone, MapPin, Building2, DollarSign, Clock, Filter, ArrowUpDown, Share2, CheckCircle2, MessageSquare, Send, X, RefreshCw, UserCheck, Sparkles, Award, Flag, Trash2, Bookmark, BookmarkCheck, Globe, QrCode } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ShareAppModal } from './ShareAppModal';
import { ReportModal } from './ReportModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { shareListingItem } from '../lib/share';
import { useBookmarks } from '../context/BookmarkContext';
import { INTERNATIONAL_COUNTRIES } from '../lib/locations';
import { ListingFilterChips, PricePresetOption } from './ListingFilterChips';
import { useReports } from '../context/ReportContext';
import { QuickShareButtons } from './QuickShareButtons';

interface JobsSectionProps {
  searchQuery?: string;
}

export const JobsSection: React.FC<JobsSectionProps> = ({ searchQuery = '' }) => {
  const { language } = useLanguage();
  const { isPostDeleted } = useReports();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [jobs, setJobs] = useState<JobListing[]>(initialJobListings);

  useEffect(() => {
    const unsubscribe = subscribeToJobListings((remoteJobs) => {
      if (remoteJobs && remoteJobs.length > 0) {
        setJobs(remoteJobs);
      }
    });
    return () => unsubscribe();
  }, []);

  // Filter & Sort state
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [minSalaryUSD, setMinSalaryUSD] = useState<string>('');
  const [maxSalaryUSD, setMaxSalaryUSD] = useState<string>('');
  const [selectedSalaryPreset, setSelectedSalaryPreset] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'salary_desc' | 'salary_asc'>('newest');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState<boolean>(false);

  const jobSalaryPresets: PricePresetOption[] = [
    { id: 'all', labelAr: 'الكل 💼', labelEn: 'All Salaries' },
    { id: 'entry', labelAr: 'أقل من $300', labelEn: 'Under $300', maxPrice: 300 },
    { id: 'mid', labelAr: '$300 - $800', labelEn: '$300 - $800', minPrice: 300, maxPrice: 800 },
    { id: 'senior', labelAr: '$800 - $1,500', labelEn: '$800 - $1,500', minPrice: 800, maxPrice: 1500 },
    { id: 'high', labelAr: 'أكثر من $1,500 🚀', labelEn: 'Over $1,500 🚀', minPrice: 1500 },
  ];

  const handleSelectSalaryPreset = (presetId: string, min?: number, max?: number) => {
    setSelectedSalaryPreset(presetId);
    setMinSalaryUSD(min !== undefined ? min.toString() : '');
    setMaxSalaryUSD(max !== undefined ? max.toString() : '');
  };

  // Modals state
  const [showAddJobModal, setShowAddJobModal] = useState<boolean>(false);
  const [shareJob, setShareJob] = useState<JobListing | null>(null);
  const [reportJob, setReportJob] = useState<JobListing | null>(null);
  const [deleteJob, setDeleteJob] = useState<JobListing | null>(null);
  const [appliedSuccessJob, setAppliedSuccessJob] = useState<string | null>(null);

  // New Job Form fields
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newCity, setNewCity] = useState('سوريا - دمشق');
  const [newCategory, setNewCategory] = useState<JobListing['category']>('tech');
  const [newJobType, setNewJobType] = useState<JobListing['jobType']>('full-time');
  const [newSalarySYP, setNewSalarySYP] = useState('');
  const [newSalaryUSD, setNewSalaryUSD] = useState('');
  const [newExpYears, setNewExpYears] = useState('2');
  const [newDescription, setNewDescription] = useState('');
  const [newRequirements, setNewRequirements] = useState('');
  const [newPhone, setNewPhone] = useState('0999888777');
  const [newEmail, setNewEmail] = useState('');

  const citiesList = ['all', 'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'اللاذقية', 'طرطوس', 'حماة'];

  const handleShareJob = async (job: JobListing) => {
    const res = await shareListingItem({
      title: `${job.title} - ${job.company}`,
      text: `${language === 'ar' ? 'فرصة عمل OMS' : 'OMS Job Opportunity'}: ${job.title} في ${job.company} (${job.city}) | الراتب: ${job.salarySYP.toLocaleString()} ل.س`,
      url: `${window.location.origin}${window.location.pathname}?tab=jobs&id=${job.id}`,
    });
    if (res.success && res.method === 'clipboard') {
      alert(language === 'ar' ? 'تم نسخ تفاصيل ورابط فرصة العمل بنجاح (Web Share) 📋' : 'Job offer details and link copied to clipboard!');
    }
  };

  const handleToggleJobBookmark = (job: JobListing) => {
    toggleBookmark({
      id: job.id,
      itemType: 'job',
      title: job.title,
      subtitle: `${job.company} • ${job.city} • ${job.jobType}`,
      city: job.city,
      priceSYP: job.salarySYP,
      priceUSD: job.salaryUSD,
      phone: job.phone,
      savedAt: new Date().toISOString(),
      originalData: job,
    });
  };

  const resetFilters = () => {
    setFilterCategory('all');
    setFilterType('all');
    setFilterCity('all');
    setMinSalaryUSD('');
    setMaxSalaryUSD('');
    setSelectedSalaryPreset('all');
    setDateFilter('all');
    setSortOption('newest');
  };

  const activeFiltersCount =
    (filterCategory !== 'all' ? 1 : 0) +
    (filterType !== 'all' ? 1 : 0) +
    (filterCity !== 'all' ? 1 : 0) +
    (selectedSalaryPreset !== 'all' || minSalaryUSD || maxSalaryUSD ? 1 : 0) +
    (dateFilter !== 'all' ? 1 : 0);

  const filteredJobs = jobs
    .filter((job) => {
      if (isPostDeleted(job.id)) return false;
      if (filterCategory !== 'all' && job.category !== filterCategory) return false;
      if (filterType !== 'all' && job.jobType !== filterType) return false;
      if (filterCity !== 'all') {
        const itemCity = job.city.toLowerCase();
        const targetCity = filterCity.toLowerCase();
        const matchesLocation = itemCity.includes(targetCity) || targetCity.includes(itemCity);
        if (!matchesLocation) return false;
      }

      const minS = minSalaryUSD ? parseFloat(minSalaryUSD) : 0;
      const maxS = maxSalaryUSD ? parseFloat(maxSalaryUSD) : Infinity;
      const salary = job.salaryUSD || 0;
      if (salary < minS || salary > maxS) return false;

      if (dateFilter !== 'all') {
        if (job.createdAt) {
          const postTime = new Date(job.createdAt).getTime();
          if (!isNaN(postTime)) {
            const diffHours = (Date.now() - postTime) / (1000 * 60 * 60);
            if (dateFilter === 'today' && diffHours > 24) return false;
            if (dateFilter === 'week' && diffHours > 24 * 7) return false;
            if (dateFilter === 'month' && diffHours > 24 * 30) return false;
          }
        }
      }

      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matches =
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.city.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.phone.includes(query);
        if (!matches) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOption === 'salary_desc') return (b.salaryUSD || 0) - (a.salaryUSD || 0);
      if (sortOption === 'salary_asc') return (a.salaryUSD || 0) - (b.salaryUSD || 0);
      return b.id.localeCompare(a.id);
    });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    const reqArray = newRequirements
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const newJob: JobListing = {
      id: `job-${Date.now()}`,
      title: newTitle,
      company: newCompany,
      city: newCity,
      category: newCategory,
      jobType: newJobType,
      salarySYP: newSalarySYP ? parseInt(newSalarySYP) : 4000000,
      salaryUSD: newSalaryUSD ? parseInt(newSalaryUSD) : 250,
      experienceYears: parseInt(newExpYears) || 1,
      description: newDescription || 'مطلوب للمشاركة والعمل في الفريق.',
      requirements: reqArray.length ? reqArray : ['الالتزام وأخلاقيات العمل', 'الخبرة والموثوقية'],
      phone: newPhone,
      email: newEmail,
      createdAt: 'الآن',
      featured: true
    };

    setJobs([newJob, ...jobs]);
    saveJobToFirestore(newJob);
    setShowAddJobModal(false);

    // Reset Form
    setNewTitle('');
    setNewCompany('');
    setNewDescription('');
    setNewRequirements('');
  };

  const handleQuickApply = (jobId: string) => {
    setAppliedSuccessJob(jobId);
    setTimeout(() => {
      setAppliedSuccessJob(null);
    }, 3500);
  };

  const getJobTypeLabel = (type: JobListing['jobType']) => {
    switch (type) {
      case 'full-time': return language === 'ar' ? 'دوام كامل' : 'Full-time';
      case 'part-time': return language === 'ar' ? 'دوام جزئي' : 'Part-time';
      case 'remote': return language === 'ar' ? 'عن بُعد' : 'Remote';
      case 'freelance': return language === 'ar' ? 'عمل حر / مشروع' : 'Freelance';
      default: return type;
    }
  };

  const getCategoryLabel = (cat: JobListing['category']) => {
    switch (cat) {
      case 'tech': return language === 'ar' ? 'تكنولوجيا وبرمجيات' : 'Tech & IT';
      case 'sales': return language === 'ar' ? 'مبيعات وتسويق' : 'Sales & Marketing';
      case 'accounting': return language === 'ar' ? 'محاسبة ومالية' : 'Accounting & Finance';
      case 'education': return language === 'ar' ? 'تعليم وتدريب' : 'Education';
      case 'medical': return language === 'ar' ? 'صحة وطب' : 'Medical & Health';
      case 'crafts': return language === 'ar' ? 'مهن وحرف صناعية' : 'Trades & Crafts';
      default: return language === 'ar' ? 'وظائف متنوعة' : 'Other Jobs';
    }
  };

  return (
    <div className="p-4 max-w-7xl w-full mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-800/40 p-5 sm:p-6 rounded-3xl shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'ar' ? 'سوق التوظيف السوري المباشر' : 'Syrian Direct Jobs Portal'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-blue-400" />
              <span>{language === 'ar' ? 'فرص العمل والوظائف الشاغرة' : 'Job Opportunities & Vacancies'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {language === 'ar' ? 'تصفّح أحدث الوظائف الشاغرة في المحافظات السورية أو أضف إعلان توظيف لشركتك مباشرةً' : 'Explore latest open jobs in Syria or post your company job vacancy directly.'}
            </p>
          </div>

          <button
            onClick={() => setShowAddJobModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إضافة فرصة عمل' : 'Post a Job Vacancy'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-md">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {language === 'ar' ? `جميع التخصصات (${jobs.length})` : `All (${jobs.length})`}
          </button>

          <button
            onClick={() => setFilterCategory('tech')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === 'tech'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            💻 {language === 'ar' ? 'تكنولوجيا وبرمجة' : 'Tech & Software'}
          </button>

          <button
            onClick={() => setFilterCategory('accounting')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === 'accounting'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            📊 {language === 'ar' ? 'محاسبة ومالية' : 'Accounting'}
          </button>

          <button
            onClick={() => setFilterCategory('sales')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === 'sales'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            🛍️ {language === 'ar' ? 'مبيعات وتسويق' : 'Sales'}
          </button>

          <button
            onClick={() => setFilterCategory('education')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === 'education'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            🎓 {language === 'ar' ? 'تعليم وتدريب' : 'Education'}
          </button>
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="newest" className="bg-slate-900">{language === 'ar' ? 'الأحدث أولاً 📅' : 'Newest First'}</option>
              <option value="salary_desc" className="bg-slate-900">{language === 'ar' ? 'الراتب: الأعلى أولاً 💎' : 'Salary: High to Low'}</option>
              <option value="salary_asc" className="bg-slate-900">{language === 'ar' ? 'الراتب: الأقل أولاً 💵' : 'Salary: Low to High'}</option>
            </select>
          </div>

          <button
            onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              showFiltersDrawer || activeFiltersCount > 0
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تصفية' : 'Filters'}</span>
            {activeFiltersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Chips Bar (Salary range, Location, Date recency) */}
      <ListingFilterChips
        selectedCity={filterCity}
        onSelectCity={(city) => setFilterCity(city)}
        selectedPricePreset={selectedSalaryPreset}
        pricePresets={jobSalaryPresets}
        onSelectPricePreset={handleSelectSalaryPreset}
        selectedDateFilter={dateFilter}
        onSelectDateFilter={(d) => setDateFilter(d)}
        onResetAll={resetFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Advanced Filter Drawer */}
      {showFiltersDrawer && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 animate-fadeIn shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Filter className="w-4 h-4" />
              <span>{language === 'ar' ? 'تحديـد موقع ونمط الوظيفة' : 'Specify Job Location & Contract Type'}</span>
            </span>
            <button
              onClick={resetFilters}
              className="text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors text-[11px]"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{language === 'ar' ? 'إعادة ضبط' : 'Reset Filters'}</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {/* Filter City */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-400" />
                <span>{language === 'ar' ? 'الدولة والمدينة (فرص محلية ودولية 🌍)' : 'Country & City (Local & Global Jobs 🌍)'}</span>
              </label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="all">{language === 'ar' ? 'جميع البلدان والفرص الدولية 🌍' : 'All Countries & International Opportunities'}</option>
                {INTERNATIONAL_COUNTRIES.map((c) => (
                  <optgroup key={c.code} label={`${c.flag} ${language === 'ar' ? c.nameAr : c.nameEn}`}>
                    <option value={c.nameAr}>{c.flag} كل {c.nameAr}</option>
                    {c.cities.map((ci) => (
                      <option key={ci.nameAr} value={ci.nameAr}>
                        {c.flag} {ci.nameAr}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Filter Contract Type */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{language === 'ar' ? 'طبيعة الدوام' : 'Work Type'}</span>
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">{language === 'ar' ? 'جميع أنواع الدوام' : 'All Work Types'}</option>
                <option value="full-time">{language === 'ar' ? 'دوام كامل' : 'Full-Time'}</option>
                <option value="part-time">{language === 'ar' ? 'دوام جزئي' : 'Part-Time'}</option>
                <option value="remote">{language === 'ar' ? 'عن بُعد (Remote)' : 'Remote'}</option>
                <option value="freelance">{language === 'ar' ? 'عمل حر / مشاريع' : 'Freelance'}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Jobs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-400 font-bold text-sm">
              {language === 'ar' ? 'لا توجد فرص عمل تطابق معايير البحث الحالية' : 'No job opportunities match your criteria'}
            </p>
            <button
              onClick={resetFilters}
              className="text-xs text-blue-400 hover:underline font-bold"
            >
              {language === 'ar' ? 'إلغاء التصفية وعرض كل الوظائف' : 'Clear filters'}
            </button>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 space-y-4 transition-all duration-200 hover:border-emerald-500/50 flex flex-col justify-between relative overflow-hidden shadow-md hover:shadow-xl ${
                job.featured
                  ? 'border-emerald-500/40 dark:border-blue-500/40 shadow-emerald-500/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {job.featured && (
                <div className="absolute top-0 left-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black px-3 py-1 rounded-br-2xl shadow">
                  ⭐ {language === 'ar' ? 'وظيفة موثوقة ومميزة' : 'Featured Job'}
                </div>
              )}

              {/* Job Header */}
              <div className="space-y-2 pt-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold rounded-lg">
                      {getCategoryLabel(job.category)}
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                      {job.title}
                    </h3>
                  </div>

                  {/* Quick Bookmark Button Header */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleJobBookmark(job);
                    }}
                    title={
                      isBookmarked(job.id)
                        ? (language === 'ar' ? 'الوظيفة محفوظة في المفضلة المحلية 🔖' : 'Saved in local bookmarks 🔖')
                        : (language === 'ar' ? 'حفظ سريع في المفضلة 🔖' : 'Quick Bookmark 🔖')
                    }
                    className={`p-2 rounded-xl border transition-all active:scale-90 shadow-md cursor-pointer shrink-0 flex items-center gap-1 ${
                      isBookmarked(job.id)
                        ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50 shadow-amber-500/30'
                        : 'bg-slate-100 hover:bg-amber-500 dark:bg-slate-950/80 hover:text-slate-950 text-amber-600 dark:text-amber-400 border-slate-200 dark:border-slate-700/80'
                    }`}
                  >
                    {isBookmarked(job.id) ? (
                      <BookmarkCheck className="w-4 h-4 fill-slate-950 text-slate-950" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-1 text-slate-800 dark:text-slate-300 font-bold">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-blue-400" />
                    <span>{job.company}</span>
                  </span>

                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{job.city}</span>
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{getJobTypeLabel(job.jobType)}</span>
                  </span>
                </div>
              </div>

              {/* Salary & Details */}
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'الراتب المقترح:' : 'Salary Offer:'}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-emerald-400 font-black text-sm">
                      {job.salarySYP.toLocaleString()} ل.س
                    </span>
                    {job.salaryUSD && (
                      <span className="text-[11px] text-amber-400 font-mono font-bold">
                        (${job.salaryUSD})
                      </span>
                    )}
                  </div>
                </div>

                {job.experienceYears && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'الخبرة المطلوبة:' : 'Experience:'}</span>
                    <span className="font-bold text-slate-200">
                      {job.experienceYears} {language === 'ar' ? 'سنوات' : 'years'}
                    </span>
                  </div>
                )}
              </div>

              {/* Description & Requirements */}
              <div className="space-y-2 text-xs">
                <p className="text-slate-300 leading-relaxed line-clamp-2">
                  {job.description}
                </p>

                {job.requirements && job.requirements.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">
                      {language === 'ar' ? 'الشروط والمتطلبات:' : 'Requirements:'}
                    </span>
                    <ul className="space-y-1">
                      {job.requirements.slice(0, 2).map((req, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" />
                          <span className="truncate">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${job.phone}`}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'ar' ? 'اتصال' : 'Call'}</span>
                  </a>

                  {job.whatsapp && (
                    <a
                      href={`https://wa.me/${job.whatsapp}?text=${encodeURIComponent(`مرحباً، يرغب بالتقديم على وظيفة: ${job.title}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      <span>واتساب</span>
                    </a>
                  )}

                  <button
                    onClick={() => handleToggleJobBookmark(job)}
                    title={isBookmarked(job.id) ? (language === 'ar' ? 'محفوظ في المفضلة' : 'Saved') : (language === 'ar' ? 'حفظ الوظيفة' : 'Bookmark Job')}
                    className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
                      isBookmarked(job.id)
                        ? 'bg-amber-500 text-slate-950 border border-amber-400 shadow-md shadow-amber-500/30'
                        : 'bg-slate-800 hover:bg-amber-500/20 text-amber-400 border border-slate-700'
                    }`}
                  >
                    {isBookmarked(job.id) ? <BookmarkCheck className="w-4 h-4 text-slate-950" /> : <Bookmark className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setShareJob(job)}
                    title={language === 'ar' ? 'رمز QR ومشاركة الفرصة' : 'QR Code & Share Job'}
                    className="p-2 bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/40 rounded-xl transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <Share2 className="w-3.5 h-3.5 opacity-80" />
                  </button>

                  <button
                    onClick={() => setReportJob(job)}
                    title={language === 'ar' ? 'إبلاغ عن هذا المنشور' : 'Report Post'}
                    className="p-2 bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/40 rounded-xl transition-all active:scale-95"
                  >
                    <Flag className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteJob(job)}
                    title={language === 'ar' ? 'حذف الوظيفة' : 'Delete Job'}
                    className="p-2 bg-slate-800 hover:bg-rose-900/80 text-rose-400 border border-slate-700 hover:border-rose-500/50 rounded-xl transition-all active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleQuickApply(job.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 ${
                    appliedSuccessJob === job.id
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                  }`}
                >
                  {appliedSuccessJob === job.id ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{language === 'ar' ? 'تم إرسال طلبك!' : 'Applied!'}</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>{language === 'ar' ? 'تقديم سريع' : 'Quick Apply'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Social Share Buttons (WhatsApp / Telegram) */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                <span className="text-[10px] font-bold text-slate-400">
                  {language === 'ar' ? 'نشر الوظيفة:' : 'Share Job:'}
                </span>
                <QuickShareButtons
                  title={job.title}
                  text={`${job.company} - ${job.city} | ${job.salarySYP.toLocaleString()} ل.س`}
                  url={`${window.location.origin}${window.location.pathname}?tab=jobs&id=${job.id}`}
                />
              </div>
            </div>
          ))
        )}

      </div>

      {/* Share Job Modal */}
      <ShareAppModal
        isOpen={!!shareJob}
        onClose={() => setShareJob(null)}
        title={shareJob ? `${shareJob.title} - ${shareJob.company}` : ''}
        description={shareJob ? `فرصة عمل شاغرة في ${shareJob.city} لدى (${shareJob.company}): براتب ${shareJob.salarySYP.toLocaleString()} ل.س. يمكنك التواصل معهم مباشرةً عبر منصة OMS.` : ''}
      />

      {/* Report Job Modal */}
      <ReportModal
        isOpen={!!reportJob}
        onClose={() => setReportJob(null)}
        postId={reportJob?.id || ''}
        postTitle={reportJob?.title || ''}
        postCategory="وظائف وفرص عمل"
      />

      {/* Add New Job Modal */}
      {showAddJobModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-5 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-blue-500/20 border border-blue-500/40 rounded-xl flex items-center justify-center text-blue-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {language === 'ar' ? 'نشر إعلان فرصة عمل جديدة 📢' : 'Post New Job Vacancy 📢'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {language === 'ar' ? 'أضف تفاصيل الوظيفة ورقم التواصل للراغبين بالعمل' : 'Add job details and contact information'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddJobModal(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-300 font-bold">
                  {language === 'ar' ? 'المسمى الوظيفي' : 'Job Title'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: محاسب، مبرمج واجهات، موظف مبيعات"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">
                    {language === 'ar' ? 'اسم الشركة / الجهة' : 'Company Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: شركة النور"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">
                    {language === 'ar' ? 'الدولة والمدينة (محلية ودولية 🌍)' : 'Country & City (Local & International 🌍)'}
                  </label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    {INTERNATIONAL_COUNTRIES.map((c) => (
                      <optgroup key={c.code} label={`${c.flag} ${language === 'ar' ? c.nameAr : c.nameEn}`}>
                        {c.cities.map((ci) => {
                          const val = `${c.nameAr} - ${ci.nameAr}`;
                          return (
                            <option key={ci.nameAr} value={val}>
                              {c.flag} {c.nameAr} - {ci.nameAr}
                            </option>
                          );
                        })}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">
                    {language === 'ar' ? 'التخصص' : 'Category'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="tech">تكنولوجيا وبرمجة</option>
                    <option value="sales">مبيعات وتسويق</option>
                    <option value="accounting">محاسبة ومالية</option>
                    <option value="education">تعليم وتدريب</option>
                    <option value="medical">صحة وطب</option>
                    <option value="crafts">مهن وحرف صناعية</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">
                    {language === 'ar' ? 'طبيعة الدوام' : 'Job Type'}
                  </label>
                  <select
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="full-time">دوام كامل</option>
                    <option value="part-time">دوام جزئي</option>
                    <option value="remote">عن بُعد (Remote)</option>
                    <option value="freelance">مشروع / عمل حر</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">
                    {language === 'ar' ? 'الراتب التقديري (ل.س)' : 'Salary (SYP)'}
                  </label>
                  <input
                    type="number"
                    placeholder="4000000"
                    value={newSalarySYP}
                    onChange={(e) => setNewSalarySYP(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">
                    {language === 'ar' ? 'الراتب بالدولار ($)' : 'Salary ($)'}
                  </label>
                  <input
                    type="number"
                    placeholder="250"
                    value={newSalaryUSD}
                    onChange={(e) => setNewSalaryUSD(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-bold">
                  {language === 'ar' ? 'الوصف الوظيفي' : 'Job Description'}
                </label>
                <textarea
                  rows={2}
                  placeholder="اكتب وصفاً مختصراً عن مهام الوظيفة..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-bold">
                  {language === 'ar' ? 'الشروط (كل شرط في سطر مفصل)' : 'Requirements'}
                </label>
                <textarea
                  rows={2}
                  placeholder="الخبرة المطلوب&#10;الشهادة الدراسية"
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">
                    {language === 'ar' ? 'رقم الهاتف للتواصل' : 'Phone Number'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0944111222"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">
                    {language === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email'}
                  </label>
                  <input
                    type="email"
                    placeholder="jobs@company.sy"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all mt-2"
              >
                {language === 'ar' ? 'نشر الإعلان الآن 🚀' : 'Publish Job Now 🚀'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Job Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteJob}
        onClose={() => setDeleteJob(null)}
        onConfirm={() => {
          if (deleteJob) {
            setJobs((prev) => prev.filter((j) => j.id !== deleteJob.id));
            setDeleteJob(null);
          }
        }}
        title={language === 'ar' ? 'تأكيد حذف الإعلان الوظيفي' : 'Confirm Job Deletion'}
        message={
          language === 'ar'
            ? 'هل أنت متأكد من رغبتك في حذف فرصة العمل هذه بشكل نهائي؟ لن يتمكن المتقدمون من التقديم عليها بعد الحذف.'
            : 'Are you sure you want to permanently delete this job posting?'
        }
        itemName={deleteJob ? `${deleteJob.title} - ${deleteJob.company}` : ''}
        confirmText={language === 'ar' ? 'نعم، احذف الوظيفة' : 'Yes, Delete Job'}
      />
    </div>
  );
};
