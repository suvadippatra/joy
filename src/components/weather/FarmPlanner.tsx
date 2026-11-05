import React, { useState, useMemo } from 'react';
import {
  Tractor,
  Droplets,
  Wind,
  Sun,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { WeatherState, calculateHumidex } from '../../services/weatherService';
import { LangId, TRANSLATIONS } from '../../services/weatherTranslations';

interface FarmPlannerProps {
  weatherState: WeatherState;
  lang: LangId;
}

type CropType = 'paddy' | 'vegetables' | 'wheat' | 'jute' | 'pulses';

const CROP_PROFILES: Record<CropType, { nameEn: string; nameBn: string; nameHi: string; icon: string; waterNeed: string }> = {
  paddy: { nameEn: 'Paddy / Rice', nameBn: 'ধান (Paddy)', nameHi: 'धान (Rice)', icon: '🌾', waterNeed: 'High (6-8 mm/day)' },
  vegetables: { nameEn: 'Vegetables & Potato', nameBn: 'সবজি ও আলু', nameHi: 'सब्जियां व आलू', icon: '🥔', waterNeed: 'Moderate (4-5 mm/day)' },
  wheat: { nameEn: 'Wheat & Mustard', nameBn: 'গম ও সরিষা', nameHi: 'गेहूं व सरसों', icon: '🌱', waterNeed: 'Moderate (3-4 mm/day)' },
  jute: { nameEn: 'Jute & Cotton', nameBn: 'পাট ও তুলা', nameHi: 'जूट व कपास', icon: '🌿', waterNeed: 'High (5-7 mm/day)' },
  pulses: { nameEn: 'Pulses & Oilseeds', nameBn: 'ডাল ও তৈলবীজ', nameHi: 'दालें व तिलहन', icon: '🫘', waterNeed: 'Low (2-3 mm/day)' }
};

export const FarmPlanner: React.FC<FarmPlannerProps> = ({ weatherState, lang }) => {
  const t = TRANSLATIONS[lang];
  const [selectedCrop, setSelectedCrop] = useState<CropType>('paddy');
  const [fieldHourOffset, setFieldHourOffset] = useState<number>(0);

  const currentHourIdx = useMemo(() => {
    const nowIso = weatherState.current.time.slice(0, 13) + ':00';
    const idx = weatherState.hourly.time.findIndex((timeStr) => timeStr >= nowIso);
    return idx < 0 ? 0 : idx;
  }, [weatherState]);

  const targetHourIdx = useMemo(() => {
    return Math.min(weatherState.hourly.time.length - 1, currentHourIdx + fieldHourOffset);
  }, [currentHourIdx, fieldHourOffset, weatherState]);

  // Hourly conditions for slider
  const hData = useMemo(() => {
    const h = weatherState.hourly;
    const i = targetHourIdx;
    const rain = h.precipitation[i] || 0;
    const pop = h.precipitation_probability[i] || 0;
    const wind = h.wind_speed_10m[i] || 0;
    const gust = h.wind_gusts_10m[i] || 0;
    const temp = Math.round(h.temperature_2m[i] || 0);
    const humidity = Math.round(h.relative_humidity_2m[i] || 0);
    const dew = h.dew_point_2m[i] || 0;
    const hx = calculateHumidex(temp, dew);

    // Activity Suitability Logic
    const isSprayOptimal = wind < 14 && gust < 22 && rain === 0 && pop < 25 && humidity < 85;
    const isSprayAvoid = rain > 0.2 || pop >= 45 || gust >= 28;

    const isLabourGood = (hx ? hx < 38 : temp < 36) && rain < 1 && pop < 50;
    const isFertilizerGood = rain < 4 && pop < 40 && humidity > 40;

    return {
      time: new Date(h.time[i] || ''),
      temp,
      humidity,
      wind: Math.round(wind),
      gust: Math.round(gust),
      rain,
      pop,
      humidex: hx,
      isSprayOptimal,
      isSprayAvoid,
      isLabourGood,
      isFertilizerGood
    };
  }, [targetHourIdx, weatherState]);

  // Pest & Disease Risk Assessment based on current ambient microclimate
  const pestRisk = useMemo(() => {
    const c = weatherState.current;
    const temp = c.temperature_2m;
    const hum = c.relative_humidity_2m;
    const rainSum = weatherState.daily.precipitation_sum[0] || 0;

    const risks = [];

    // Fungal Blight / Blast Risk (Warm + Very Humid)
    if (hum >= 80 && temp >= 22 && temp <= 32) {
      risks.push({
        name: lang === 'bn' ? 'ব্লাস্ট ও ছত্রাকজনিত ধসা রোগ (Blast / Blight)' : 'Fungal Blight & Blast Risk',
        level: 'High',
        cls: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
        advice: lang === 'bn' ? 'উচ্চ আর্দ্রতার কারণে ধসা রোগের ঝুঁকি। পরিষ্কার আবহাওয়ায় প্রতিষেধক স্প্রে করুন।' : 'High humidity promotes fungal proliferation. Apply prophylactic bio-fungicide when winds are calm.'
      });
    }

    // Lodging / Stem Break Risk (Strong Winds)
    if (c.wind_gusts_10m >= 35) {
      risks.push({
        name: lang === 'bn' ? 'ঝড়ো হাওয়ায় গাছ ভেঙে পড়ার ঝুঁকি (Lodging)' : 'Crop Lodging & Wind Damage Risk',
        level: 'Moderate',
        cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        advice: lang === 'bn' ? 'দমকা হাওয়ার সম্ভাবনা। লম্বা ফসলের জমিতে সেচ বন্ধ রাখুন।' : 'Strong gusts expected. Drain excess field water to prevent root loosening.'
      });
    }

    // Waterlogging / Root Rot (Heavy Rain)
    if (rainSum >= 30) {
      risks.push({
        name: lang === 'bn' ? 'জলাবদ্ধতা ও শিকড় পচা রোগ (Waterlogging)' : 'Waterlogging & Root Rot Risk',
        level: 'High',
        cls: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
        advice: lang === 'bn' ? 'জমির জল নিকাশী নালা অবিলম্বে পরিষ্কার করুন।' : 'Clear drainage channels to prevent standing water in root zones.'
      });
    }

    if (risks.length === 0) {
      risks.push({
        name: lang === 'bn' ? 'স্বাভাবিক পরিস্থিতি (স্বল্প ঝুঁকি)' : 'Low Disease Risk (Favourable)',
        level: 'Low',
        cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        advice: lang === 'bn' ? 'আবহাওয়া ফসলের জন্য অনুকূল। স্বাভাবিক পরিচর্যা চালিয়ে যান।' : 'Optimal growing conditions. Proceed with regular crop management.'
      });
    }

    return risks;
  }, [weatherState, lang]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Farm Planner Header & Crop Profile Selector */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-white/50 dark:border-white/10 shadow-lg backdrop-blur-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
            <Tractor size={22} />
          </div>
          <div>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-50 block">
              {lang === 'bn' ? 'কৃষি ও খামার পরিকল্পনা (Farm Planner)' : 'Agricultural & Farm Operations Planner'}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {CROP_PROFILES[selectedCrop].nameBn} · জলীয় চাহিদা: {CROP_PROFILES[selectedCrop].waterNeed}
            </span>
          </div>
        </div>

        {/* Crop Profile Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {(Object.keys(CROP_PROFILES) as CropType[]).map((cropKey) => {
            const crop = CROP_PROFILES[cropKey];
            const isSelected = selectedCrop === cropKey;
            return (
              <button
                key={cropKey}
                type="button"
                onClick={() => setSelectedCrop(cropKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>{crop.icon}</span>
                <span>{lang === 'bn' ? crop.nameBn.split(' ')[0] : crop.nameEn.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 48-Hour Field Operations Hour Scrubber */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-white/50 dark:border-white/10 shadow-lg backdrop-blur-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              {lang === 'bn' ? '৪৮ ঘণ্টার মাঠভিত্তিক কাজ ও স্প্রে সময়সূচী' : '48-Hour Field Activity & Spray Windows'}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200/50">
            {fieldHourOffset === 0 ? 'Now' : `+${fieldHourOffset}h`} ({hData.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
          </span>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="0"
          max="47"
          value={fieldHourOffset}
          onChange={(e) => setFieldHourOffset(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />

        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>Current Hour</span>
          <span>+12h</span>
          <span>+24h</span>
          <span>+36h</span>
          <span>+48h</span>
        </div>

        {/* Real-time Field Action Status Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-1">
          {/* Foliar Spraying */}
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-white/40 dark:border-slate-700/50 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">কীটনাশক স্প্রে (Spraying)</span>
            <div className="flex items-center gap-1.5">
              {hData.isSprayOptimal ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} /> {t.sprayOk}
                </span>
              ) : hData.isSprayAvoid ? (
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <XCircle size={13} /> {t.sprayAvoid}
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  <AlertTriangle size={13} /> {t.statusCaution}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              Wind {hData.wind} km/h · Rain {hData.pop}%
            </span>
          </div>

          {/* Fertilizer Application */}
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-white/40 dark:border-slate-700/50 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">সার প্রয়োগ (Fertilizer)</span>
            <div className="flex items-center gap-1.5">
              {hData.isFertilizerGood ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Favourable
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <XCircle size={13} /> Avoid Washout
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              Moisture adequate
            </span>
          </div>

          {/* Field Labour & Tillage */}
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-white/40 dark:border-slate-700/50 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">মাঠের কাজ ও চাষ (Labour)</span>
            <div className="flex items-center gap-1.5">
              {hData.isLabourGood ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} /> {t.labourGood}
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  <AlertTriangle size={13} /> {t.labourAvoid}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              Temp {hData.temp}°C
            </span>
          </div>

          {/* Irrigation Window */}
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-white/40 dark:border-slate-700/50 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">সেচ পরিকল্পনা (Irrigation)</span>
            <div className="flex items-center gap-1.5">
              {hData.rain > 0 ? (
                <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                  <Droplets size={13} /> Rain Occurring
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Safe to Irrigate
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              {hData.rain.toFixed(1)} mm rain forecast
            </span>
          </div>
        </div>
      </div>

      {/* Disease & Pest Risk Monitor */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-white/50 dark:border-white/10 shadow-lg backdrop-blur-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-500" />
            <span>{lang === 'bn' ? 'ফসল সুরক্ষা ও রোগবালাই সতর্কতা' : 'Pest & Fungal Disease Risk Monitor'}</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            RH: {weatherState.current.relative_humidity_2m}% · Temp: {Math.round(weatherState.current.temperature_2m)}°C
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {pestRisk.map((risk, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${risk.cls}`}
            >
              <div>
                <span className="font-bold text-xs block">{risk.name}</span>
                <span className="text-[11px] opacity-90">{risk.advice}</span>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border self-start sm:self-auto">
                {risk.level} Risk
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day FAO-56 Crop Water Balance Outlook Table */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-white/50 dark:border-white/10 shadow-lg backdrop-blur-2xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
            {lang === 'bn' ? '৭ দিনের জলীয় ভারসাম্য ও সেচ নির্দেশিকা (FAO-56 ET0)' : '7-Day Crop Water Balance (FAO-56 ET0 Matrix)'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Penman-Monteith Standard</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-slate-800 text-slate-400 font-bold">
                <th className="py-2.5 pr-3">Date</th>
                <th className="py-2.5 px-3">Spraying</th>
                <th className="py-2.5 px-3">Field Labour</th>
                <th className="py-2.5 px-3">Rainfall</th>
                <th className="py-2.5 pl-3">Water Balance (Deficit / Surplus)</th>
              </tr>
            </thead>
            <tbody>
              {weatherState.daily.time.slice(0, 7).map((dStr, idx) => {
                const date = new Date(dStr);
                const dayLabel = idx === 0 ? 'Today' : date.toLocaleDateString(lang === 'bn' ? 'bn-IN' : 'en-IN', { weekday: 'short', day: 'numeric' });
                const windMax = weatherState.daily.wind_speed_10m_max[idx];
                const gustMax = weatherState.daily.wind_gusts_10m_max[idx];
                const rainPop = weatherState.daily.precipitation_probability_max[idx];
                const rainSum = weatherState.daily.precipitation_sum[idx];
                const et0 = weatherState.daily.et0_fao_evapotranspiration[idx] || 0;
                const balance = rainSum - et0;

                const sprayOk = windMax < 15 && gustMax < 25 && rainPop < 30;
                const labourOk = rainSum < 2 && rainPop < 50;

                return (
                  <tr key={dStr} className="border-b border-slate-100 dark:border-slate-800/60 font-medium">
                    <td className="py-2.5 pr-3 font-bold text-slate-900 dark:text-slate-100">{dayLabel}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${sprayOk ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'}`}>
                        {sprayOk ? 'Optimal' : 'Avoid'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${labourOk ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'}`}>
                        {labourOk ? 'Good' : 'Rest'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {rainSum > 0 ? `${rainSum.toFixed(1)} mm` : '0.0 mm'}
                    </td>
                    <td className="py-2.5 pl-3">
                      <span className={`font-mono font-bold ${balance < -3 ? 'text-amber-600' : balance > 5 ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {balance > 0 ? `+${balance.toFixed(1)} mm (Surplus)` : `${balance.toFixed(1)} mm (Deficit)`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
