import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Globe, ChevronDown, Check } from 'lucide-react';
import { INTERNATIONAL_COUNTRIES } from '../lib/locations';

interface SmartLocationFilterProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
  selectedArea?: string;
  onSelectArea?: (area: string) => void;
}

// Popular Neighborhoods Map by City
export const SYRIAN_CITY_AREAS: Record<string, string[]> = {
  'دمشق': ['الكل في دمشق', 'المزة', 'كفرسوسة', 'الشعلان', 'الميدان', 'المالكي', 'أبو رمانة', 'دمر المشروع', 'قدسيا', 'الصالحية', 'باب توما', 'البرامكة', 'القنوات', 'الزهراء'],
  'ريف دمشق': ['الكل في ريف دمشق', 'جرمانا', 'صحنايا', 'أشرفية صحنايا', 'قدسيا الهامة', 'يعفور', 'الص بورة', 'جديدة عرطوز', 'التل', 'دوما', 'القطيفة', 'الزبداني'],
  'حلب': ['الكل في حلب', 'الجميلية', 'الفرقان', 'العزيزية', 'الشهباء', 'المحافظة', 'حلب الجديدة', 'السريان الجديدة', 'الزهراء', 'صلاح الدين'],
  'حمص': ['الكل في حمص', 'الإنشاءات', 'الحمراء', 'وادي الذهب', 'عكرمة', 'المحطة', 'حي الزهراء', 'الدبلان', 'الغوطة'],
  'اللاذقية': ['الكل في اللاذقية', 'الزراعة', 'المشروع السابع', 'الأوقاف', 'الصليبة', 'الشاطئ الأزرق', 'الكورنيش', 'سقوبين'],
  'طرطوس': ['الكل في طرطوس', 'الكورنيش البحري', 'المشروع السادس', 'الحمرات', 'الرمل', 'حي الثورة', 'مشتى الحلو', 'بانياس'],
  'حماة': ['الكل في حماة', 'الحاضر', 'عاصي', 'الشريعة', 'طريق حلب', 'القصور', 'البعث', 'الصابونية'],
  'إدلب': ['الكل في إدلب', 'وسط المدينة', 'الضبيط', 'الجامعة', 'سرمدا', 'الدانا', 'أطمة'],
  'درعا': ['الكل في درعا', 'درعا المحطة', 'درعا البلد', 'الصنمين', 'إزرع'],
  'السويداء': ['الكل في السويداء', 'وسط المدينة', 'المحوري', 'القلعة', 'شهبا'],
  'الحسكة': ['الكل في الحسكة', 'القامشلي', 'الحسكة المدينة', 'عامودا', 'المالكية'],
  'دير الزور': ['الكل في دير الزور', 'حي القصور', 'حي الجورة', 'الميادين', 'البوكيمال'],
  'الرقة': ['الكل في الرقة', 'وسط المدينة', 'حي الثورة', 'الطبقة'],
};

export const SmartLocationFilter: React.FC<SmartLocationFilterProps> = ({
  selectedCity,
  onSelectCity,
  selectedArea = '',
  onSelectArea,
}) => {
  const { language } = useLanguage();

  // Extract pure city name without country prefix if present
  const getCleanCityName = (fullStr: string) => {
    if (!fullStr || fullStr === 'all') return 'all';
    if (fullStr.includes(' - ')) {
      return fullStr.split(' - ')[1].trim();
    }
    return fullStr.trim();
  };

  const currentCleanCity = getCleanCityName(selectedCity);
  const availableAreas = SYRIAN_CITY_AREAS[currentCleanCity] || [];

  return (
    <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-3">
      <div className="flex items-center justify-between text-xs">
        <label className="font-bold text-emerald-400 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>{language === 'ar' ? 'تحديد الموقع الجغرافي والمدينة 🌍' : 'Select Location & City 🌍'}</span>
        </label>
        {selectedCity !== 'all' && (
          <button
            type="button"
            onClick={() => {
              onSelectCity('all');
              if (onSelectArea) onSelectArea('');
            }}
            className="text-[11px] text-slate-400 hover:text-amber-400 underline font-medium"
          >
            {language === 'ar' ? 'إظهار كل المدن' : 'Show All Cities'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* City Select */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-semibold block">
            {language === 'ar' ? 'المحافظة / المدينة الرئيسية:' : 'Main City / Governorate:'}
          </label>
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => {
                onSelectCity(e.target.value);
                if (onSelectArea) onSelectArea('');
              }}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer pr-8"
            >
              <option value="all">🇸🇾 {language === 'ar' ? 'جميع المحافظات السورية والدول' : 'All Governorates & Countries'}</option>

              <optgroup label="🇸🇾 المحافظات السورية">
                <option value="دمشق">🇸🇾 دمشق</option>
                <option value="ريف دمشق">🇸🇾 ريف دمشق</option>
                <option value="حلب">🇸🇾 حلب</option>
                <option value="حمص">🇸🇾 حمص</option>
                <option value="اللاذقية">🇸🇾 اللاذقية</option>
                <option value="طرطوس">🇸🇾 طرطوس</option>
                <option value="حماة">🇸🇾 حماة</option>
                <option value="إدلب">🇸🇾 إدلب</option>
                <option value="درعا">🇸🇾 درعا</option>
                <option value="السويداء">🇸🇾 السويداء</option>
                <option value="الحسكة">🇸🇾 الحسكة</option>
                <option value="دير الزور">🇸🇾 دير الزور</option>
                <option value="الرقة">🇸🇾 الرقة</option>
              </optgroup>

              {INTERNATIONAL_COUNTRIES.map((c) => (
                <optgroup key={c.code} label={`${c.flag} ${language === 'ar' ? c.nameAr : c.nameEn}`}>
                  <option value={c.nameAr}>{c.flag} {c.nameAr} (كل المدن)</option>
                  {c.cities.map((ci) => (
                    <option key={ci.nameAr} value={`${c.nameAr} - ${ci.nameAr}`}>
                      {c.flag} {ci.nameAr}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute inset-y-0 left-2.5 my-auto pointer-events-none" />
          </div>
        </div>

        {/* Neighborhood / Area Select (If available) */}
        {availableAreas.length > 0 && onSelectArea && (
          <div className="space-y-1 animate-fadeIn">
            <label className="text-[10px] text-slate-400 font-semibold block">
              {language === 'ar' ? `المنطقة / الحي بـ (${currentCleanCity}):` : `District in (${currentCleanCity}):`}
            </label>
            <div className="relative">
              <select
                value={selectedArea}
                onChange={(e) => onSelectArea(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer pr-8"
              >
                <option value="">{language === 'ar' ? 'جميع أحياء المنطقة' : 'All Districts'}</option>
                {availableAreas.map((area, idx) => (
                  <option key={idx} value={area.startsWith('الكل') ? '' : area}>
                    📍 {area}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute inset-y-0 left-2.5 my-auto pointer-events-none" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
