import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Building2, Home, Maximize2, ShieldCheck, ChevronDown, RotateCcw } from 'lucide-react';

interface SmartRealEstateSpecsFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedRooms: string;
  onSelectRooms: (rooms: string) => void;
  selectedSpaceRange: string;
  onSelectSpaceRange: (range: string) => void;
  selectedCladding: string;
  onSelectCladding: (cladding: string) => void;
  onResetSpecs: () => void;
}

export const SmartRealEstateSpecsFilter: React.FC<SmartRealEstateSpecsFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedRooms,
  onSelectRooms,
  selectedSpaceRange,
  onSelectSpaceRange,
  selectedCladding,
  onSelectCladding,
  onResetSpecs,
}) => {
  const { language } = useLanguage();

  const hasActiveSpecs =
    selectedCategory !== 'all' ||
    selectedRooms !== 'all' ||
    selectedSpaceRange !== 'all' ||
    selectedCladding !== 'all';

  return (
    <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-3">
      <div className="flex items-center justify-between text-xs">
        <label className="font-bold text-indigo-400 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>{language === 'ar' ? 'مواصفات وتصنيف العقار (Smart Real Estate 🏠)' : 'Smart Property Specs 🏠'}</span>
        </label>
        {hasActiveSpecs && (
          <button
            type="button"
            onClick={onResetSpecs}
            className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{language === 'ar' ? 'مسح مواصفات العقار' : 'Clear Specs'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Category Type */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-semibold block">
            {language === 'ar' ? 'نوع العقار:' : 'Property Type:'}
          </label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer pr-7"
            >
              <option value="all">{language === 'ar' ? 'جميع أنواع العقارات' : 'All Types'}</option>
              <option value="apartment">{language === 'ar' ? 'شقة سكنية 🏢' : 'Apartment 🏢'}</option>
              <option value="house">{language === 'ar' ? 'فيلا / منزل مستقل 🏡' : 'Villa / House 🏡'}</option>
              <option value="shop">{language === 'ar' ? 'محل تجاري / مكتب 🏪' : 'Commercial Shop 🏪'}</option>
              <option value="land">{language === 'ar' ? 'أرض زراعية / بناء 🏞️' : 'Land Plot 🏞️'}</option>
              <option value="farm">{language === 'ar' ? 'مزرعة واستراحة 🌴' : 'Farm / Ranch 🌴'}</option>
              <option value="chalet">{language === 'ar' ? 'شاليه ساحلي / مصيف 🏖️' : 'Coastal Chalet 🏖️'}</option>
              <option value="furnished_room">{language === 'ar' ? 'غرفة مفروشة / طلاب 🛏️' : 'Furnished Room 🛏️'}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute inset-y-0 left-2 my-auto pointer-events-none" />
          </div>
        </div>

        {/* Number of Rooms */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-semibold block">
            {language === 'ar' ? 'عدد الغرف:' : 'Rooms Count:'}
          </label>
          <div className="relative">
            <select
              value={selectedRooms}
              onChange={(e) => onSelectRooms(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer pr-7"
            >
              <option value="all">{language === 'ar' ? 'أي عدد من الغرف' : 'Any Rooms'}</option>
              <option value="1">{language === 'ar' ? 'غرفة واحدة (استديو)' : '1 Room (Studio)'}</option>
              <option value="2">{language === 'ar' ? 'غرفتان وصالون (2+1)' : '2 Rooms (2+1)'}</option>
              <option value="3">{language === 'ar' ? '3 غرف وصالون (3+1)' : '3 Rooms (3+1)'}</option>
              <option value="4_plus">{language === 'ar' ? '4 غرف أو أكثر (كبير)' : '4+ Rooms (Large)'}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute inset-y-0 left-2 my-auto pointer-events-none" />
          </div>
        </div>

        {/* Space Range (m²) */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-semibold block">
            {language === 'ar' ? 'المساحة الإجمالية (م²):' : 'Space Area (m²):'}
          </label>
          <div className="relative">
            <select
              value={selectedSpaceRange}
              onChange={(e) => onSelectSpaceRange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer pr-7"
            >
              <option value="all">{language === 'ar' ? 'جميع المساحات' : 'All Areas'}</option>
              <option value="under_80">{language === 'ar' ? 'أقل من 80 م² (صغير)' : 'Under 80 m²'}</option>
              <option value="80_150">{language === 'ar' ? '80 - 150 م² (متوسط)' : '80 - 150 m²'}</option>
              <option value="150_300">{language === 'ar' ? '150 - 300 م² (واسع)' : '150 - 300 m²'}</option>
              <option value="over_300">{language === 'ar' ? 'أكثر من 300 م² (كبير/فيلا)' : 'Over 300 m²'}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute inset-y-0 left-2 my-auto pointer-events-none" />
          </div>
        </div>

        {/* Cladding / Finishing Status */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-semibold block">
            {language === 'ar' ? 'حالة الإكساء:' : 'Cladding Status:'}
          </label>
          <div className="relative">
            <select
              value={selectedCladding}
              onChange={(e) => onSelectCladding(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer pr-7"
            >
              <option value="all">{language === 'ar' ? 'جميع حالات الإكساء' : 'All Cladding Types'}</option>
              <option value="super_deluxe">{language === 'ar' ? 'سوبر ديلوكس ✨' : 'Super Deluxe ✨'}</option>
              <option value="deluxe">{language === 'ar' ? 'ديلوكس 🌟' : 'Deluxe 🌟'}</option>
              <option value="good">{language === 'ar' ? 'إكساء جيد / عادي 🏠' : 'Good Finishing 🏠'}</option>
              <option value="raw">{language === 'ar' ? 'على العظم / بدون إكساء 🧱' : 'Unfinished / Raw 🧱'}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute inset-y-0 left-2 my-auto pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
