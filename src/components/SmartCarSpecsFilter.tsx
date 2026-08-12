import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Car, Fuel, Gauge, Calendar, ChevronDown, RotateCcw } from 'lucide-react';

interface SmartCarSpecsFilterProps {
  selectedMake: string;
  onSelectMake: (make: string) => void;
  selectedYearRange: string;
  onSelectYearRange: (range: string) => void;
  selectedTransmission: string;
  onSelectTransmission: (trans: string) => void;
  selectedFuelType: string;
  onSelectFuelType: (fuel: string) => void;
  onResetSpecs: () => void;
}

export const CAR_BRANDS = [
  { id: 'all', nameAr: 'جميع الماركات والشركات', nameEn: 'All Makes' },
  { id: 'kia', nameAr: 'كيا (Kia)', nameEn: 'Kia' },
  { id: 'hyundai', nameAr: 'هونداي (Hyundai)', nameEn: 'Hyundai' },
  { id: 'toyota', nameAr: 'تويوتا (Toyota)', nameEn: 'Toyota' },
  { id: 'mercedes', nameAr: 'مرسيدس (Mercedes-Benz)', nameEn: 'Mercedes-Benz' },
  { id: 'bmw', nameAr: 'بي إم دبليو (BMW)', nameEn: 'BMW' },
  { id: 'nissan', nameAr: 'نيسان (Nissan)', nameEn: 'Nissan' },
  { id: 'mazda', nameAr: 'مازدا (Mazda)', nameEn: 'Mazda' },
  { id: 'chevrolet', nameAr: 'شفروليه (Chevrolet)', nameEn: 'Chevrolet' },
  { id: 'audi', nameAr: 'أودي (Audi)', nameEn: 'Audi' },
  { id: 'volkswagen', nameAr: 'فولكسفاغن (Volkswagen)', nameEn: 'Volkswagen' },
  { id: 'chery', nameAr: 'شيري / سيارات صينية', nameEn: 'Chery / Chinese Cars' },
];

export const SmartCarSpecsFilter: React.FC<SmartCarSpecsFilterProps> = ({
  selectedMake,
  onSelectMake,
  selectedYearRange,
  onSelectYearRange,
  selectedTransmission,
  onSelectTransmission,
  selectedFuelType,
  onSelectFuelType,
  onResetSpecs,
}) => {
  const { language } = useLanguage();

  const hasActiveSpecs =
    selectedMake !== 'all' ||
    selectedYearRange !== 'all' ||
    selectedTransmission !== 'all' ||
    selectedFuelType !== 'all';

  return (
    <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-3">
      <div className="flex items-center justify-between text-xs">
        <label className="font-bold text-cyan-400 flex items-center gap-1.5">
          <Car className="w-4 h-4 text-cyan-400" />
          <span>{language === 'ar' ? 'مواصفات وتفاصيل السيارة (Smart Specs 🚘)' : 'Smart Vehicle Specs 🚘'}</span>
        </label>
        {hasActiveSpecs && (
          <button
            type="button"
            onClick={onResetSpecs}
            className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{language === 'ar' ? 'مسح مواصفات السيارة' : 'Clear Specs'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Car Make / Brand */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-semibold block">
            {language === 'ar' ? 'الماركة / الشركة:' : 'Make / Brand:'}
          </label>
          <div className="relative">
            <select
              value={selectedMake}
              onChange={(e) => onSelectMake(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer pr-7"
            >
              {CAR_BRANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {language === 'ar' ? b.nameAr : b.nameEn}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute inset-y-0 left-2 my-auto pointer-events-none" />
          </div>
        </div>

        {/* Year of Manufacture */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-semibold block">
            {language === 'ar' ? 'سنة الصنع:' : 'Model Year:'}
          </label>
          <div className="relative">
            <select
              value={selectedYearRange}
              onChange={(e) => onSelectYearRange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer pr-7"
            >
              <option value="all">{language === 'ar' ? 'جميع السنوات' : 'All Years'}</option>
              <option value="2024_2026">2024 - 2026 (حديث جداً ✨)</option>
              <option value="2020_2023">2020 - 2023</option>
              <option value="2015_2019">2015 - 2019</option>
              <option value="2010_2014">2010 - 2014</option>
              <option value="under_2010">قبل 2010 (كلاسيكي)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute inset-y-0 left-2 my-auto pointer-events-none" />
          </div>
        </div>

        {/* Transmission / Gearbox */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-semibold block">
            {language === 'ar' ? 'نوع القير (الناقل):' : 'Transmission:'}
          </label>
          <div className="relative">
            <select
              value={selectedTransmission}
              onChange={(e) => onSelectTransmission(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer pr-7"
            >
              <option value="all">{language === 'ar' ? 'الكل (أوتوماتيك وعادي)' : 'All Gear Types'}</option>
              <option value="automatic">{language === 'ar' ? 'أوتوماتيك ⚡️' : 'Automatic ⚡️'}</option>
              <option value="manual">{language === 'ar' ? 'عادي / مانيوال 🕹️' : 'Manual 🕹️'}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute inset-y-0 left-2 my-auto pointer-events-none" />
          </div>
        </div>

        {/* Fuel Type */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-semibold block">
            {language === 'ar' ? 'نوع الوقود / المحرك:' : 'Fuel Type:'}
          </label>
          <div className="relative">
            <select
              value={selectedFuelType}
              onChange={(e) => onSelectFuelType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer pr-7"
            >
              <option value="all">{language === 'ar' ? 'جميع أنواع المحركات' : 'All Fuel Types'}</option>
              <option value="petrol">{language === 'ar' ? 'بنزين ⛽️' : 'Gasoline ⛽️'}</option>
              <option value="diesel">{language === 'ar' ? 'مازوت / ديزل 🚛' : 'Diesel 🚛'}</option>
              <option value="hybrid">{language === 'ar' ? 'هايبرد / هجين 🔋' : 'Hybrid 🔋'}</option>
              <option value="electric">{language === 'ar' ? 'كهربائي بالكامل ⚡️' : 'Electric ⚡️'}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute inset-y-0 left-2 my-auto pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
