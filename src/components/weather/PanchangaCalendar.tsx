import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Moon,
  Sun,
  X,
  Sparkles,
  Droplets,
  Wind,
  Waves,
  ListFilter,
  Grid3X3,
  CalendarDays,
  Compass
} from 'lucide-react';
import {
  computeAstroSnapshot,
  WeatherState,
  getWmoInfo,
  getBengaliDate,
  getPanjikaEvents,
  toBengaliNumerals,
  BengaliDateInfo,
  PanjikaEvent
} from '../../services/weatherService';
import { LangId, TRANSLATIONS, TITHI_TRANSLATIONS, PAKSHA_TRANSLATIONS } from '../../services/weatherTranslations';

interface PanchangaCalendarProps {
  weatherState: WeatherState | null;
  lang: LangId;
}

const WEEKDAY_NAMES: Record<LangId, { short: string; full: string }[]> = {
  en: [
    { short: 'Mon', full: 'Monday' },
    { short: 'Tue', full: 'Tuesday' },
    { short: 'Wed', full: 'Wednesday' },
    { short: 'Thu', full: 'Thursday' },
    { short: 'Fri', full: 'Friday' },
    { short: 'Sat', full: 'Saturday' },
    { short: 'Sun', full: 'Sunday' }
  ],
  bn: [
    { short: 'সোম', full: 'সোমবার' },
    { short: 'মঙ্গল', full: 'মঙ্গলবার' },
    { short: 'বুধ', full: 'বুধবার' },
    { short: 'বৃহঃ', full: 'বৃহস্পতিবার' },
    { short: 'শুক্র', full: 'শুক্রবার' },
    { short: 'শনি', full: 'শনিবার' },
    { short: 'রবি', full: 'রবিবার' }
  ],
  hi: [
    { short: 'सोम', full: 'सोमवार' },
    { short: 'मंगल', full: 'मंगलवार' },
    { short: 'बुध', full: 'बुधवार' },
    { short: 'गुरु', full: 'गुरुवार' },
    { short: 'शुक्र', full: 'शुक्रवार' },
    { short: 'शनि', full: 'शनिवार' },
    { short: 'रवि', full: 'रविवार' }
  ]
};

export const PanchangaCalendar: React.FC<PanchangaCalendarProps> = ({ weatherState, lang }) => {
  const t = TRANSLATIONS[lang];
  const [calMonthOffset, setCalMonthOffset] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'linear' | 'grid'>('linear');
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const today = new Date();
  const targetMonth = useMemo(() => {
    return new Date(today.getFullYear(), today.getMonth() + calMonthOffset, 1);
  }, [calMonthOffset, today]);

  const year = targetMonth.getFullYear();
  const month = targetMonth.getMonth();

  // Compute Days for the Month
  const calendarData = useMemo(() => {
    const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ blank: true, key: `b-${i}` });
    }

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d, 12);
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeekIdx = (dateObj.getDay() + 6) % 7;

      const astro = computeAstroSnapshot(dateObj, weatherState?.loc.lat || 22.5, weatherState?.loc.lon || 88.3);
      const bnDate = getBengaliDate(dateObj);
      const panjikaEvents = getPanjikaEvents(dateObj, astro.tithiNumber, astro.paksha, bnDate);

      let fcItem = null;
      if (weatherState) {
        const fcIdx = weatherState.daily.time.indexOf(dateKey);
        if (fcIdx >= 0) {
          fcItem = {
            wCode: weatherState.daily.weather_code[fcIdx],
            maxTemp: Math.round(weatherState.daily.temperature_2m_max[fcIdx]),
            minTemp: Math.round(weatherState.daily.temperature_2m_min[fcIdx]),
            rainSum: weatherState.daily.precipitation_sum[fcIdx],
            sunrise: weatherState.daily.sunrise[fcIdx]?.slice(11, 16) || '05:42',
            sunset: weatherState.daily.sunset[fcIdx]?.slice(11, 16) || '17:51'
          };
        }
      }

      cells.push({
        blank: false,
        key: dateKey,
        dayNum: d,
        dayOfWeek: WEEKDAY_NAMES[lang][dayOfWeekIdx],
        dateObj,
        isToday: dateKey === todayStr,
        astro,
        bnDate,
        panjikaEvents,
        fcItem
      });
    }

    // Benchmark first day for header
    const firstDateObj = new Date(year, month, 1, 12);
    const firstBnDate = getBengaliDate(firstDateObj);

    return {
      monthLabel: targetMonth.toLocaleDateString(lang === 'bn' ? 'bn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN', {
        month: 'long',
        year: 'numeric'
      }),
      bengaliMonthHeader: `${firstBnDate.monthName} / ${firstBnDate.monthNameEn} (${firstBnDate.yearBn} বঙ্গাব্দ)`,
      seasonHeader: `${firstBnDate.seasonName} ঋতু`,
      cells
    };
  }, [year, month, targetMonth, weatherState, lang, today]);

  // Active / Selected Day Details
  const selectedCell = useMemo(() => {
    if (!selectedDayKey) return null;
    return calendarData.cells.find((c) => !c.blank && c.key === selectedDayKey);
  }, [selectedDayKey, calendarData]);

  // Non-blank days list for Linear Mode
  const activeDays = useMemo(() => {
    return calendarData.cells.filter((c) => !c.blank);
  }, [calendarData]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Calendar Header with Navigation & Dual Views */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-white/50 dark:border-white/10 shadow-lg backdrop-blur-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title & Bengali Month Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md">
            <CalendarDays size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-50">
                {calendarData.monthLabel}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                {calendarData.seasonHeader}
              </span>
            </div>
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
              বাংলা পঞ্জিকা: {calendarData.bengaliMonthHeader}
            </div>
          </div>
        </div>

        {/* View Switcher & Month Navigation Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Linear vs Grid toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('linear')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'linear'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
              }`}
              title="Linear Day Timeline View"
            >
              <ListFilter size={13} />
              <span>Linear Days</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
              }`}
              title="Month Grid View"
            >
              <Grid3X3 size={13} />
              <span>Grid View</span>
            </button>
          </div>

          {/* Month Pagers */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCalMonthOffset((prev) => prev - 1)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setCalMonthOffset(0)}
              className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 text-blue-600 dark:text-blue-300 text-xs font-bold transition-colors cursor-pointer border border-blue-200/60 dark:border-blue-800/60"
            >
              {t.calTodayBtn}
            </button>
            <button
              type="button"
              onClick={() => setCalMonthOffset((prev) => prev + 1)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: LINEAR DAYS MODE (Spacious, Uncluttered, Highly Detailed) */}
      {viewMode === 'linear' && (
        <div className="flex flex-col gap-3">
          {activeDays.map((cell) => {
            if (cell.blank) return null;
            const astro = cell.astro!;
            const bn = cell.bnDate!;
            const isSelected = selectedDayKey === cell.key;

            return (
              <div
                key={cell.key}
                onClick={() => setSelectedDayKey(cell.key)}
                className={`p-3.5 sm:p-4 rounded-3xl border transition-all cursor-pointer backdrop-blur-xl ${
                  cell.isToday
                    ? 'bg-blue-50/85 dark:bg-blue-950/70 border-blue-500/80 shadow-md ring-2 ring-blue-500/20'
                    : isSelected
                    ? 'bg-indigo-50/85 dark:bg-indigo-950/60 border-indigo-500 shadow-md'
                    : 'bg-white/80 dark:bg-slate-900/80 border-white/50 dark:border-white/10 shadow-xs hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Gregorian & Bengali Dates */}
                  <div className="flex items-center gap-3">
                    {/* Day Number Badge */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 font-mono shadow-xs ${
                        cell.isToday
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      <span className="text-base font-black leading-none">{cell.dayNum}</span>
                      <span className="text-[10px] font-bold opacity-80 mt-0.5">{cell.dayOfWeek.short}</span>
                    </div>

                    {/* Regional Date Details */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {cell.dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                          {bn.dayBn} {bn.monthName} ({bn.day} {bn.monthNameEn})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{cell.dayOfWeek.full}</span>
                        <span>•</span>
                        <span>{bn.seasonName} ঋতু</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {astro.paksha === 'Shukla' ? 'শুক্লপক্ষ' : 'কৃষ্ণপক্ষ'} {astro.tithiName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Moon Phase, Forecast & Festival Badges */}
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    {/* Festival Badges */}
                    {cell.panjikaEvents.map((ev, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-xs ${ev.color}`}
                      >
                        {ev.nameBn}
                      </span>
                    ))}

                    {/* Moon Phase Chip */}
                    <div className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700/60">
                      <span>{astro.moonIllumination >= 90 ? '🌕' : astro.moonIllumination <= 8 ? '🌑' : astro.paksha === 'Shukla' ? '🌓' : '🌗'}</span>
                      <span className="font-mono text-[11px]">{astro.moonIllumination}%</span>
                    </div>

                    {/* Forecast Weather (if within 10 days) */}
                    {cell.fcItem && (
                      <div className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5">
                        <span className="text-sm">{getWmoInfo(cell.fcItem.wCode).icon}</span>
                        <span className="font-mono">{cell.fcItem.maxTemp}° / {cell.fcItem.minTemp}°</span>
                        {cell.fcItem.rainSum > 0 && (
                          <span className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                            {cell.fcItem.rainSum.toFixed(1)}mm
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: MONTHLY GRID MODE (Airy, Non-Dense, Clean Layout) */}
      {viewMode === 'grid' && (
        <div className="p-3 sm:p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-white/50 dark:border-white/10 shadow-lg backdrop-blur-2xl">
          {/* Weekday Column Headers */}
          <div className="grid grid-cols-7 gap-2 text-center mb-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-800/70">
            {WEEKDAY_NAMES[lang].map((dName) => (
              <div key={dName.short} className="text-xs font-black text-slate-500 dark:text-slate-400">
                {dName.short}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
            {calendarData.cells.map((cell) => {
              if (cell.blank) {
                return <div key={cell.key} className="min-h-[75px] sm:min-h-[92px] rounded-2xl bg-slate-50/20 dark:bg-slate-800/10" />;
              }

              const astro = cell.astro!;
              const bn = cell.bnDate!;
              const isSelected = selectedDayKey === cell.key;
              const hasFestivals = cell.panjikaEvents.length > 0;

              return (
                <div
                  key={cell.key}
                  onClick={() => setSelectedDayKey(cell.key)}
                  className={`min-h-[75px] sm:min-h-[92px] p-2 sm:p-2.5 rounded-2xl border flex flex-col justify-between text-left cursor-pointer transition-all select-none ${
                    cell.isToday
                      ? 'border-blue-500 bg-blue-50/90 dark:bg-blue-950/70 ring-2 ring-blue-500/25 shadow-md'
                      : isSelected
                      ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 shadow-md'
                      : 'border-slate-200/70 dark:border-slate-800/80 bg-white/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:border-slate-300'
                  }`}
                >
                  {/* Top Row: Gregorian Day + Bengali Day + Moon Icon */}
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-sm sm:text-base font-black ${cell.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {cell.dayNum}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {bn.dayBn}
                      </span>
                    </div>

                    <span className="text-xs">
                      {astro.moonIllumination >= 90 ? '🌕' : astro.moonIllumination <= 8 ? '🌑' : astro.paksha === 'Shukla' ? '🌓' : '🌗'}
                    </span>
                  </div>

                  {/* Weather Forecast mini info */}
                  {cell.fcItem && (
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 my-0.5">
                      <span>{getWmoInfo(cell.fcItem.wCode).icon}</span>
                      <span className="font-mono text-[10px]">{cell.fcItem.maxTemp}°</span>
                    </div>
                  )}

                  {/* Bottom: Festival Dot / Mini Label */}
                  <div className="mt-auto">
                    {hasFestivals ? (
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                        <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 truncate">
                          {cell.panjikaEvents[0].nameBn.split(' ')[0]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] font-medium text-slate-500 truncate block">
                        {astro.tithiName.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Detailed Day Modal / Inspector */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white/95 dark:bg-slate-900/95 border border-white/50 dark:border-white/10 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 backdrop-blur-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-900 dark:text-slate-50">
                    {selectedCell.dateObj.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  {selectedCell.isToday && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white">
                      Today
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  বাংলা তারিখ: {selectedCell.bnDate?.formattedBn} ({selectedCell.bnDate?.seasonName} ঋতু)
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayKey(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Panjika Festivals on this date */}
            {selectedCell.panjikaEvents && selectedCell.panjikaEvents.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  উৎসব ও বিশেষ তিথি (Festivals & Events):
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedCell.panjikaEvents.map((ev, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border shadow-xs ${ev.color}`}
                    >
                      {ev.nameBn} ({ev.nameEn})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Astronomical Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 block mb-0.5">তিথি ও পক্ষ (Tithi & Paksha)</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                  {selectedCell.astro?.paksha === 'Shukla' ? 'শুক্ল' : 'কৃষ্ণ'} {selectedCell.astro?.tithiName}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Tithi {selectedCell.astro?.tithiNumber}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 block mb-0.5">চন্দ্রকলা (Moon Phase)</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{selectedCell.astro?.moonIllumination! >= 90 ? '🌕' : selectedCell.astro?.moonIllumination! <= 8 ? '🌑' : '🌓'}</span>
                  <span>{selectedCell.astro?.moonIllumination}% Illum</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {selectedCell.astro?.moonPhaseName}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 block mb-0.5">সূর্যোদয় ও সূর্যাস্ত (Sun Timings)</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                  {selectedCell.fcItem?.sunrise || '05:42'} AM – {selectedCell.fcItem?.sunset || '17:51'} PM
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Solar Noon ~11:46 AM
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 block mb-0.5">জোয়ার-ভাটা (Tidal Intensity)</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${selectedCell.astro?.tideStrength.cls}`}>
                  {selectedCell.astro?.tideStrength.label}
                </span>
              </div>
            </div>

            {/* Weather Forecast (if available) */}
            {selectedCell.fcItem && (
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getWmoInfo(selectedCell.fcItem.wCode).icon}</span>
                  <div>
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-100 block">
                      {getWmoInfo(selectedCell.fcItem.wCode).label}
                    </span>
                    <span className="text-[11px] text-blue-700 dark:text-blue-300">
                      High: {selectedCell.fcItem.maxTemp}°C · Low: {selectedCell.fcItem.minTemp}°C
                    </span>
                  </div>
                </div>
                {selectedCell.fcItem.rainSum > 0 && (
                  <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-1 rounded-xl">
                    🌧️ {selectedCell.fcItem.rainSum.toFixed(1)} mm
                  </span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedDayKey(null)}
              className="w-full py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
