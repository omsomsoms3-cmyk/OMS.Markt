import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { DollarSign, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface PriceRangeSliderProps {
  minVal: number;
  maxVal: number;
  minLimit?: number;
  maxLimit?: number;
  step?: number;
  currencySymbol?: string;
  onChange: (min: number, max: number) => void;
  presetRanges?: { labelAr: string; labelEn: string; min: number; max: number }[];
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  minVal,
  maxVal,
  minLimit = 0,
  maxLimit = 50000,
  step = 100,
  currencySymbol = '$',
  onChange,
  presetRanges,
}) => {
  const { language } = useLanguage();
  const [minPriceInput, setMinPriceInput] = useState<number>(minVal);
  const [maxPriceInput, setMaxPriceInput] = useState<number>(maxVal);

  useEffect(() => {
    setMinPriceInput(minVal);
  }, [minVal]);

  useEffect(() => {
    setMaxPriceInput(maxVal);
  }, [maxVal]);

  const handleMinSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxPriceInput - step);
    setMinPriceInput(val);
    onChange(val, maxPriceInput);
  };

  const handleMaxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minPriceInput + step);
    setMaxPriceInput(val);
    onChange(minPriceInput, val);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? minLimit : Number(e.target.value);
    setMinPriceInput(val);
    if (val <= maxPriceInput) {
      onChange(val, maxPriceInput);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? maxLimit : Number(e.target.value);
    setMaxPriceInput(val);
    if (val >= minPriceInput) {
      onChange(minPriceInput, val);
    }
  };

  const handleReset = () => {
    setMinPriceInput(minLimit);
    setMaxPriceInput(maxLimit);
    onChange(minLimit, maxLimit);
  };

  // Percentage calculations for track highlight
  const minPercent = Math.max(0, Math.min(100, ((minPriceInput - minLimit) / (maxLimit - minLimit)) * 100));
  const maxPercent = Math.max(0, Math.min(100, ((maxPriceInput - minLimit) / (maxLimit - minLimit)) * 100));

  return (
    <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-3 shadow-inner">
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-amber-400">
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <span>{language === 'ar' ? 'نطاق السعر السريع (Slider 🎚️)' : 'Price Range Slider 🎚️'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md dir-ltr">
            {currencySymbol}{minPriceInput.toLocaleString()} - {maxPriceInput >= maxLimit ? `${currencySymbol}${maxLimit.toLocaleString()}+` : `${currencySymbol}${maxPriceInput.toLocaleString()}`}
          </span>
          <button
            type="button"
            onClick={handleReset}
            title={language === 'ar' ? 'إعادة ضبط النطاق' : 'Reset Price'}
            className="p-1 text-slate-400 hover:text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Slider Graphic Track */}
      <div className="relative py-2 px-1">
        {/* Background Track */}
        <div className="h-2 w-full bg-slate-800 rounded-full relative overflow-hidden">
          {/* Active Highlight Range */}
          <div
            className="absolute h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`,
            }}
          />
        </div>

        {/* Dual Input Range Control */}
        <div className="relative -mt-3.5">
          <input
            type="range"
            min={minLimit}
            max={maxLimit}
            step={step}
            value={minPriceInput}
            onChange={handleMinSlider}
            className="absolute w-full appearance-none bg-transparent pointer-events-auto cursor-pointer z-20 accent-amber-500 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:shadow-lg"
          />
          <input
            type="range"
            min={minLimit}
            max={maxLimit}
            step={step}
            value={maxPriceInput}
            onChange={handleMaxSlider}
            className="absolute w-full appearance-none bg-transparent pointer-events-auto cursor-pointer z-20 accent-emerald-400 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:shadow-lg"
          />
        </div>
      </div>

      {/* Manual Input Boxes */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-medium block">
            {language === 'ar' ? 'الحد الأدنى ($ USD)' : 'Min Price ($)'}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-2 flex items-center text-slate-500 text-xs font-mono">$</span>
            <input
              type="number"
              min={minLimit}
              max={maxLimit}
              value={minPriceInput === minLimit ? '' : minPriceInput}
              onChange={handleMinInputChange}
              placeholder={`${minLimit}`}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-6 pr-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-medium block">
            {language === 'ar' ? 'الحد الأعلى ($ USD)' : 'Max Price ($)'}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-2 flex items-center text-slate-500 text-xs font-mono">$</span>
            <input
              type="number"
              min={minLimit}
              max={maxLimit}
              value={maxPriceInput === maxLimit ? '' : maxPriceInput}
              onChange={handleMaxInputChange}
              placeholder={`${maxLimit}+`}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-6 pr-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Preset range quick chips if provided */}
      {presetRanges && presetRanges.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {presetRanges.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setMinPriceInput(preset.min);
                setMaxPriceInput(preset.max);
                onChange(preset.min, preset.max);
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                minPriceInput === preset.min && maxPriceInput === preset.max
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {language === 'ar' ? preset.labelAr : preset.labelEn}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
