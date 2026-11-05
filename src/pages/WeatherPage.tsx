import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Compass,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sun,
  Moon,
  CloudRain,
  Sparkles,
  Layers,
  Calendar as CalendarIcon,
  Tractor,
  ChevronLeft,
  Info,
  Waves,
  RefreshCw,
  CheckCircle2,
  X,
  Thermometer,
  Cloud,
  Sunrise,
  Sunset,
  ShieldAlert,
  Bike,
  Footprints,
  HeartPulse,
  Shirt
} from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import {
  LocationData,
  WeatherState,
  fetchFullWeather,
  resolveLocation,
  reverseGeocode,
  getWmoInfo,
  calculateHumidex,
  getHumidexCategory,
  getBeaufortScale,
  getImdRainCategory,
  getLocalizedImdDetails,
  generateSkySentence,
  computeAstroSnapshot,
  cacheWeatherData,
  getCachedWeatherData,
  searchLocationSuggestions,
  formatNumByLang
} from '../services/weatherService';
import {
  LangId,
  TRANSLATIONS,
  translateWeatherCondition,
  TITHI_TRANSLATIONS,
  PAKSHA_TRANSLATIONS
} from '../services/weatherTranslations';
import { WeatherAnimations } from '../components/weather/WeatherAnimations';
import { SunMoonView } from '../components/weather/SunMoonView';
import { Celestial3DView } from '../components/weather/Celestial3DView';
import { PanchangaCalendar } from '../components/weather/PanchangaCalendar';
import { WeatherMap } from '../components/weather/WeatherMap';
import { FarmPlanner } from '../components/weather/FarmPlanner';

type TabId = 'today' | 'forecast' | 'map' | 'sky' | 'farm' | 'calendar';

export default function WeatherPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Language State
  const [lang, setLang] = useState<LangId>(() => {
    return (localStorage.getItem('aakash_lang') as LangId) || 'en';
  });

  const handleSetLang = (l: LangId) => {
    setLang(l);
    localStorage.setItem('aakash_lang', l);
  };

  const t = TRANSLATIONS[lang];
  const fn = useCallback((v: number | string) => formatNumByLang(v, lang), [lang]);

  // Navigation & Data States
  const [queryInput, setQueryInput] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [weatherState, setWeatherState] = useState<WeatherState | null>(null);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Search Autocomplete State
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchDebounceRef = useRef<number | null>(null);

  // Sky Tab sub-view: 3D Simulator vs 2D Sun Track
  const [skySubView, setSkySubView] = useState<'3d' | '2d'>('3d');

  // Info Modal
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Load weather for a location data object
  const loadWeatherForLocation = useCallback(
    async (loc: LocationData) => {
      setErrorMsg(null);
      setSuggestions([]);
      setIsSearchFocused(false);

      // 1. Instant cache check to avoid blocking UI
      const cached = getCachedWeatherData(loc.lat, loc.lon, true);
      if (cached) {
        setWeatherState(cached.state);
        setLoading(false);
      } else {
        setLoading(true);
      }

      try {
        const data = await fetchFullWeather(loc.lat, loc.lon);
        const fullState: WeatherState = {
          loc,
          ...data,
          fetchedAt: new Date()
        };
        setWeatherState(fullState);
        cacheWeatherData(loc, fullState);
        localStorage.setItem('aakash_last_place', JSON.stringify(loc));
      } catch (err) {
        console.error(err);
        if (!cached) setErrorMsg(t.fetchFailed);
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  // Load weather for a query (name or 6-digit PIN)
  const handleSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) return;
      setLoading(true);
      setErrorMsg(null);
      setSuggestions([]);
      try {
        const loc = await resolveLocation(q.trim());
        if (!loc) {
          setErrorMsg(t.locationNotFound);
          setLoading(false);
          return;
        }
        await loadWeatherForLocation(loc);
      } catch (err) {
        console.error(err);
        setErrorMsg(t.fetchFailed);
        setLoading(false);
      }
    },
    [loadWeatherForLocation, t]
  );

  // Handle Autocomplete debouncing
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!queryInput.trim() || queryInput.length < 2) {
      setSuggestions([]);
      return;
    }

    searchDebounceRef.current = window.setTimeout(async () => {
      const results = await searchLocationSuggestions(queryInput);
      setSuggestions(results);
    }, 180);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [queryInput]);

  // GPS geolocation handler
  const handleGpsLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const loc = await reverseGeocode(lat, lon);
          await loadWeatherForLocation(loc);
        } catch {
          setErrorMsg(t.fetchFailed);
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setErrorMsg(t.locationNotFound);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [loadWeatherForLocation, t]);

  // Initial Boot
  useEffect(() => {
    const boot = async () => {
      let loc: LocationData = {
        name: 'Kolkata (700001)',
        lat: 22.5726,
        lon: 88.3639,
        region: 'Kolkata, West Bengal',
        precision: 'P1'
      };

      try {
        const saved = localStorage.getItem('aakash_last_place');
        if (saved) loc = JSON.parse(saved);
      } catch {}

      const cached = getCachedWeatherData(loc.lat, loc.lon, true);
      if (cached) {
        setWeatherState(cached.state);
        setLoading(false);
      }

      try {
        const data = await fetchFullWeather(loc.lat, loc.lon);
        const fullState: WeatherState = {
          loc,
          ...data,
          fetchedAt: new Date()
        };
        setWeatherState(fullState);
        cacheWeatherData(loc, fullState);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, []);

  // Weather-Adaptive Dynamic Background Style
  const weatherBackgroundStyle = useMemo(() => {
    if (!weatherState) {
      return theme === 'light'
        ? { backgroundImage: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 45%, #38bdf8 100%)' }
        : { backgroundImage: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)' };
    }
    const w = weatherState.current.weather_code;
    const isDay = weatherState.current.is_day === 1;

    if (theme === 'light') {
      if (w === 0 || w === 1) {
        return isDay
          ? { backgroundImage: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 45%, #38bdf8 100%)' }
          : { backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #60a5fa 100%)' };
      }
      if (w === 2 || w === 3) {
        return { backgroundImage: 'linear-gradient(135deg, #334155 0%, #3b82f6 55%, #93c5fd 100%)' };
      }
      if ((w >= 51 && w <= 67) || (w >= 80 && w <= 82)) {
        return { backgroundImage: 'linear-gradient(135deg, #1e40af 0%, #2563eb 55%, #60a5fa 100%)' };
      }
      return { backgroundImage: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)' };
    } else {
      if (w === 0 || w === 1) {
        return isDay
          ? { backgroundImage: 'linear-gradient(135deg, #082f49 0%, #0369a1 55%, #0284c7 100%)' }
          : { backgroundImage: 'linear-gradient(140deg, #030712 0%, #0f172a 50%, #1e1b4b 100%)' };
      }
      return { backgroundImage: 'linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e293b 100%)' };
    }
  }, [weatherState, theme]);

  // Astro snapshot with actual sunrise/sunset passed for exact Solar Noon & Day Length
  const astroSnapshot = useMemo(() => {
    if (!weatherState) return null;
    return computeAstroSnapshot(
      new Date(),
      weatherState.loc.lat,
      weatherState.loc.lon,
      weatherState.daily.sunrise?.[0],
      weatherState.daily.sunset?.[0]
    );
  }, [weatherState]);

  // Current hour index in hourly arrays
  const currentHourIdx = useMemo(() => {
    if (!weatherState) return 0;
    const nowIso = weatherState.current.time.slice(0, 13) + ':00';
    const idx = weatherState.hourly.time.findIndex((timeStr) => timeStr >= nowIso);
    return idx < 0 ? 0 : idx;
  }, [weatherState]);

  // Memoized 25-hour slices for WeatherMap so it never re-renders unnecessarily
  const mapSlices = useMemo(() => {
    if (!weatherState) {
      return { times: [], rain: [], wind: [], cloud: [], temp: [] };
    }
    return {
      times: weatherState.hourly.time.slice(currentHourIdx, currentHourIdx + 25),
      rain: weatherState.hourly.precipitation.slice(currentHourIdx, currentHourIdx + 25),
      wind: weatherState.hourly.wind_speed_10m.slice(currentHourIdx, currentHourIdx + 25),
      cloud: weatherState.hourly.cloud_cover.slice(currentHourIdx, currentHourIdx + 25),
      temp: weatherState.hourly.temperature_2m.slice(currentHourIdx, currentHourIdx + 25)
    };
  }, [weatherState, currentHourIdx]);

  // Dew point & Visibility now
  const currentDewPoint = useMemo(() => {
    if (!weatherState) return 20;
    return Math.round(weatherState.hourly.dew_point_2m[currentHourIdx] ?? 20);
  }, [weatherState, currentHourIdx]);

  const currentVisibilityKm = useMemo(() => {
    if (!weatherState) return 10;
    const visM = weatherState.hourly.visibility?.[currentHourIdx] ?? 10000;
    return (visM / 1000).toFixed(1);
  }, [weatherState, currentHourIdx]);

  // Humidex
  const humidexVal = useMemo(() => {
    if (!weatherState) return null;
    const dew = weatherState.hourly.dew_point_2m[currentHourIdx];
    return calculateHumidex(weatherState.current.temperature_2m, dew);
  }, [weatherState, currentHourIdx]);

  const humidexCat = useMemo(() => getHumidexCategory(humidexVal, lang), [humidexVal, lang]);

  // Beaufort
  const beaufort = useMemo(() => {
    if (!weatherState) return { scale: 0, description: 'Calm' };
    return getBeaufortScale(weatherState.current.wind_speed_10m, lang);
  }, [weatherState, lang]);

  // IMD Rain & Localized IMD Station Details
  const todayRainMm = weatherState?.daily.precipitation_sum[0] || 0;
  const todayPopMax = weatherState?.daily.precipitation_probability_max?.[0] || 0;
  const imdRain = useMemo(() => getImdRainCategory(todayRainMm, lang), [todayRainMm, lang]);

  const localizedImd = useMemo(() => {
    if (!weatherState) return null;
    return getLocalizedImdDetails(
      weatherState.current.temperature_2m,
      todayRainMm,
      weatherState.current.wind_speed_10m,
      lang
    );
  }, [weatherState, todayRainMm, lang]);

  // Localized Natural Sky Sentence
  const skySentence = useMemo(() => {
    if (!weatherState || !astroSnapshot) return '';
    const rainNext6h = weatherState.hourly.precipitation
      .slice(currentHourIdx, currentHourIdx + 6)
      .reduce((a, b) => a + (b || 0), 0);
    return generateSkySentence(
      weatherState.current.temperature_2m,
      weatherState.current.apparent_temperature,
      weatherState.current.weather_code,
      rainNext6h,
      weatherState.current.wind_gusts_10m,
      astroSnapshot.sunAltitude,
      lang
    );
  }, [weatherState, currentHourIdx, astroSnapshot, lang]);

  // Translated Condition label
  const currentConditionLabel = useMemo(() => {
    if (!weatherState) return '';
    return translateWeatherCondition(weatherState.current.weather_code, lang);
  }, [weatherState, lang]);

  // Lifestyle Outdoor Decision Cards (Localized in en / bn / hi)
  const lifestyleCards = useMemo(() => {
    if (!weatherState) return [];
    const temp = weatherState.current.temperature_2m;
    const rain = weatherState.current.precipitation || 0;
    const wind = weatherState.current.wind_speed_10m || 0;
    const hum = weatherState.current.relative_humidity_2m || 60;
    const aqi = weatherState.air?.us_aqi || 55;

    // 1. Two-wheeler riders
    const riderRisk = rain > 1.5 || wind > 35;
    const riderCaution = rain > 0.1 || wind > 22;
    // 2. Walking & outdoor chores
    const walkRisk = rain > 1.0 || temp >= 39 || aqi > 160;
    const walkCaution = temp >= 35 || aqi > 110;
    // 3. Elderly & sensitive groups
    const elderRisk = temp >= 38 || temp <= 11 || aqi > 140;
    const elderCaution = temp >= 35 || aqi > 95;
    // 4. Outdoor clothes drying
    const dryBad = rain > 0.1 || hum > 85;
    const drySlow = hum > 72 || weatherState.current.cloud_cover > 75;

    return [
      {
        title: t.riderTitle,
        icon: Bike,
        status: riderRisk ? t.statusAvoid : riderCaution ? t.statusCaution : t.statusFavourable,
        cls: riderRisk
          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
          : riderCaution
          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
      },
      {
        title: t.walkingTitle,
        icon: Footprints,
        status: walkRisk ? t.statusAvoid : walkCaution ? t.statusCaution : t.statusFavourable,
        cls: walkRisk
          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
          : walkCaution
          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
      },
      {
        title: t.elderlyTitle,
        icon: HeartPulse,
        status: elderRisk ? t.statusAvoid : elderCaution ? t.statusCaution : t.statusFavourable,
        cls: elderRisk
          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
          : elderCaution
          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
      },
      {
        title: t.dryingTitle,
        icon: Shirt,
        status: dryBad ? t.statusNotNow : drySlow ? t.statusSlow : t.statusGood,
        cls: dryBad
          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
          : drySlow
          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
      }
    ];
  }, [weatherState, t]);

  // Format sunrise & sunset times cleanly
  const formatTimeIso = (iso?: string) => {
    if (!iso) return '--:--';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso.slice(11, 16);
    const str = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return fn(str);
  };

  return (
    <div
      style={weatherBackgroundStyle}
      className="min-h-screen w-full flex flex-col font-sans select-none text-slate-800 dark:text-slate-100 pb-24 md:pb-8 relative overflow-x-hidden"
    >
      {/* Hardware-Accelerated Atmospheric Animation (Zero Blur Filter Lag) */}
      {weatherState && (
        <WeatherAnimations
          weatherCode={weatherState.current.weather_code}
          isDay={weatherState.current.is_day}
          precipitation={weatherState.current.precipitation}
          enabled={animationsEnabled}
        />
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 border-b border-white/40 dark:border-white/10 px-3 py-2 sm:px-6 shadow-md flex flex-col gap-2">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-2 sm:gap-3">
          {/* Logo & Back button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title={t.returnToHub}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1">
              <span className="text-xl">⛅</span>
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {t.appName}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 hidden sm:inline">
                {t.badge}
              </span>
            </div>
          </div>

          {/* Search Bar with Instant Autocomplete Dropdown */}
          <div className="relative flex items-center gap-1 sm:gap-1.5 flex-1 max-w-sm sm:max-w-md mx-1">
            <div className="flex items-center flex-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-1 sm:py-1.5 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(queryInput);
                    setIsSearchFocused(false);
                  }
                }}
                className="bg-transparent border-none outline-none pl-1.5 text-xs sm:text-sm w-full text-slate-900 dark:text-slate-100 placeholder-slate-400 truncate"
              />
              {queryInput && (
                <button
                  type="button"
                  onClick={() => {
                    setQueryInput('');
                    setSuggestions([]);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleSearch(queryInput)}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 shadow-xs transition-colors cursor-pointer"
            >
              {t.searchBtn}
            </button>
            <button
              type="button"
              onClick={handleGpsLocation}
              className="p-1.5 sm:p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors shrink-0 cursor-pointer"
              title={t.gpsBtnTitle}
            >
              <Compass size={15} />
            </button>

            {/* Suggestions Dropdown */}
            {isSearchFocused && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-10 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onMouseDown={() => {
                      setQueryInput(s.name);
                      loadWeatherForLocation(s);
                    }}
                    className="p-2.5 hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs cursor-pointer border-b border-slate-100 dark:border-slate-800/50 last:border-none"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-blue-500 shrink-0" />
                      <span className="font-bold text-slate-800 dark:text-slate-100">{s.name}</span>
                      <span className="text-[11px] text-slate-400 truncate">({s.region})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle, Animation Toggle & Multilingual Selector */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setAnimationsEnabled((v) => !v)}
              className={`px-2 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer hidden lg:inline-flex items-center gap-1 ${
                animationsEnabled
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
              }`}
              title={t.animationToggle}
            >
              <Sparkles size={13} />
              <span>{t.animationToggle}</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              title={t.toggleThemeTitle}
            >
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-700" />}
            </button>

            <select
              value={lang}
              onChange={(e) => handleSetLang(e.target.value as LangId)}
              className="text-xs font-bold py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
              title={t.languageTitle}
            >
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
              <option value="hi">हिन्दी</option>
            </select>

            <button
              type="button"
              onClick={() => setIsInfoOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer hidden sm:inline"
              title={t.infoTitle}
            >
              <Info size={16} />
            </button>
          </div>
        </div>

        {/* Quick Search Chips Bar */}
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800 gap-2">
          {weatherState ? (
            <div className="flex items-center gap-1.5 truncate">
              <MapPin size={13} className="text-rose-500 shrink-0" />
              <span className="font-black text-slate-900 dark:text-white truncate">{weatherState.loc.name}</span>
              <span className="truncate hidden sm:inline text-slate-500 dark:text-slate-400">({weatherState.loc.region})</span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {['Kolkata', 'Bishnupur', 'New Delhi', 'Mumbai', 'Bengaluru', 'Patna'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleSearch(city)}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0 border border-slate-200/70 dark:border-slate-700"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="max-w-6xl w-full mx-auto p-3 sm:p-6 flex-1 flex flex-col gap-4 relative z-10">
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500 text-white font-medium text-xs flex items-center justify-between shadow-lg">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="p-1 hover:bg-rose-600 rounded-lg text-white font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {loading && (
          <div className="p-8 sm:p-12 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-white/50 dark:border-white/10 shadow-xl flex flex-col items-center justify-center gap-3">
            <RefreshCw size={28} className="text-blue-600 dark:text-blue-400 animate-spin" />
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{t.retrievingData}</span>
          </div>
        )}

        {!loading && weatherState && (
          <>
            {/* Desktop & Tablet Tabs Header (Localized) */}
            <div className="hidden md:flex items-center justify-between border-b border-white/30 dark:border-white/10 pb-2">
              <div className="flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 p-1 rounded-2xl border border-white/50 dark:border-white/10 shadow-md">
                {(
                  [
                    { id: 'today', label: t.tabToday, icon: Sun },
                    { id: 'forecast', label: t.tabForecast, icon: CloudRain },
                    { id: 'map', label: t.tabMap, icon: Layers },
                    { id: 'sky', label: t.tabSky, icon: Sparkles },
                    { id: 'farm', label: t.tabFarm, icon: Tractor },
                    { id: 'calendar', label: t.tabCalendar, icon: CalendarIcon }
                  ] as const
                ).map((tItem) => {
                  const Icon = tItem.icon;
                  const isActive = activeTab === tItem.id;
                  return (
                    <button
                      key={tItem.id}
                      type="button"
                      onClick={() => setActiveTab(tItem.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tItem.label}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-[11px] font-bold text-white/90 dark:text-slate-300 px-3 py-1 rounded-full bg-black/20">
                {t.gridResolution}
              </span>
            </div>

            {/* TAB 1: TODAY */}
            {activeTab === 'today' && (
              <div className="flex flex-col gap-4">
                {/* Hero Weather Card */}
                <div className="p-4 sm:p-6 rounded-3xl bg-white/92 dark:bg-slate-900/92 border border-white/60 dark:border-white/10 shadow-xl">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{t.currentConditions}</span>
                      </div>
                      <div className="flex items-baseline gap-3 mt-1 flex-wrap">
                        <span className="text-5xl sm:text-7xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                          {fn(Math.round(weatherState.current.temperature_2m))}°
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span>{getWmoInfo(weatherState.current.weather_code, weatherState.current.is_day).icon}</span>
                            <span>{currentConditionLabel}</span>
                          </span>
                          <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                              {t.feelsLike} {fn(Math.round(weatherState.current.apparent_temperature))}°C · {t.humidex}{' '}
                              {humidexVal !== null ? fn(humidexVal) : '--'}°C
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${humidexCat.bg} ${humidexCat.color}`}>
                              {humidexCat.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="mt-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium max-w-2xl leading-relaxed">
                        {skySentence}
                      </p>
                    </div>

                    {/* 8-Metric Ground Conditions Bento Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0 lg:w-[460px]">
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 flex flex-col">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <Droplets size={12} className="text-blue-500" /> {t.humidity}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {fn(Math.round(weatherState.current.relative_humidity_2m))}%
                        </span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 flex flex-col">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <Wind size={12} className="text-teal-500" /> {t.windSpeed}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {fn(Math.round(weatherState.current.wind_speed_10m))} km/h
                        </span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 flex flex-col">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <Wind size={12} className="text-indigo-500" /> {t.windGusts}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {fn(Math.round(weatherState.current.wind_gusts_10m))} km/h
                        </span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 flex flex-col">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <Thermometer size={12} className="text-sky-500" /> {t.dewPoint}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {fn(currentDewPoint)}°C
                        </span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 flex flex-col">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <Gauge size={12} className="text-purple-500" /> {t.pressure}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {fn(Math.round(weatherState.current.pressure_msl))} hPa
                        </span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 flex flex-col">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <Sun size={12} className="text-amber-500" /> {t.uvIndex}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {fn(weatherState.daily.uv_index_max[0] || 0)}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 flex flex-col">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <Eye size={12} className="text-emerald-500" /> {t.visibility}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {fn(currentVisibilityKm)} km
                        </span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 flex flex-col">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <Cloud size={12} className="text-slate-500" /> {t.cloudCover}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {fn(Math.round(weatherState.current.cloud_cover))}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Astronomy & Daylight Summary Strip on Today Tab */}
                  {astroSnapshot && (
                    <div className="mt-4 pt-3.5 border-t border-slate-200/70 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Sunrise size={16} className="text-amber-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">{t.sunrise}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formatTimeIso(weatherState.daily.sunrise?.[0])}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sunset size={16} className="text-orange-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">{t.sunset}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formatTimeIso(weatherState.daily.sunset?.[0])}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun size={16} className="text-yellow-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">{t.solarNoon}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{fn(astroSnapshot.solarNoon)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-blue-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">{t.dayLength}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{fn(astroSnapshot.dayLengthHours)} hrs</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                        <Moon size={16} className="text-indigo-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">{t.tithiLabel}</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {TITHI_TRANSLATIONS[astroSnapshot.tithiName]?.[lang] || astroSnapshot.tithiName} (
                            {PAKSHA_TRANSLATIONS[astroSnapshot.paksha]?.[lang]})
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 2: Air Quality (AQI) + Beaufort Wind & 24h Rain */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Air Quality (CAMS) Card */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-white/92 dark:bg-slate-900/92 border border-white/60 dark:border-white/10 shadow-lg flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <ShieldAlert size={16} className="text-emerald-500" />
                          <span>{t.airQualityTitle}</span>
                        </h3>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{t.aqiSource}</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black ${
                          (weatherState.air?.us_aqi || 55) <= 50
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : (weatherState.air?.us_aqi || 55) <= 100
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        AQI {fn(weatherState.air?.us_aqi ?? 62)}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block">{t.pm25}</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {fn((weatherState.air?.pm2_5 ?? 24.5).toFixed(1))}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block">{t.pm10}</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {fn((weatherState.air?.pm10 ?? 54.0).toFixed(1))}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block">O₃</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {fn((weatherState.air?.ozone ?? 38.0).toFixed(0))}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block">NO₂</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {fn((weatherState.air?.nitrogen_dioxide ?? 14.2).toFixed(1))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Beaufort Wind Scale & Rainfall Today Card */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-white/92 dark:bg-slate-900/92 border border-white/60 dark:border-white/10 shadow-lg grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase">{t.beaufortScaleTitle}</span>
                        <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                          Bft {fn(beaufort.scale)} · {beaufort.description}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">{t.beaufortNote}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">{t.rainfallToday}</span>
                        <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                          {fn(todayRainMm.toFixed(1))} mm · {fn(todayPopMax)}%
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg self-start mt-2 ${imdRain.badgeCls}`}>
                        {imdRain.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Everyday Outdoor Decisions & Lifestyle Card */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white/92 dark:bg-slate-900/92 border border-white/60 dark:border-white/10 shadow-lg flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{t.lifestyleTitle}</h3>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{t.lifestyleSubtitle}</span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {lifestyleCards.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <Icon size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{item.title}</span>
                          </div>
                          <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border self-start ${item.cls}`}>
                            {item.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Coastal Marine Card (When Coastal Data Present) */}
                {weatherState.marine?.coastal && (
                  <div className="p-4 rounded-3xl bg-white/92 dark:bg-slate-900/92 border border-white/60 dark:border-white/10 shadow-lg flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                        <Waves size={18} />
                      </div>
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{t.coastalTitle}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 mr-1.5">{t.waveHeight}:</span>
                        <span className="font-black text-slate-900 dark:text-white">{fn(weatherState.marine.wave_height ?? 1.1)} m</span>
                      </div>
                      <div>
                        <span className="text-slate-400 mr-1.5">{t.seaTemp}:</span>
                        <span className="font-black text-slate-900 dark:text-white">
                          {fn(weatherState.marine.sea_surface_temperature ?? 28)}°C
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* IMD Ground Station Card (Fully Localized) */}
                {weatherState.imd && localizedImd && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-white/92 dark:bg-slate-900/92 border border-white/60 dark:border-white/10 shadow-lg flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                            <span>{weatherState.imd.stationName}</span>
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                            {weatherState.imd.source}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 self-start sm:self-auto">
                        ঋতু: {weatherState.imd.bengaliSeason}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-slate-500 block mb-0.5">{t.imdCategoryNote}</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{localizedImd.rainfallCategory}</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-slate-500 block mb-0.5">Heatwave Status</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block">{localizedImd.heatAlertText}</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-slate-500 block mb-0.5">Monsoon Phase</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{localizedImd.monsoonStatus}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 font-medium">
                      <b>IMD Advisory:</b> {localizedImd.advisory}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FORECAST */}
            {activeTab === 'forecast' && (
              <div className="flex flex-col gap-4">
                {/* 48-Hour Scrollable Hourly Cards */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white/92 dark:bg-slate-900/92 border border-white/60 dark:border-white/10 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">{t.next48Hours}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{t.scrollNotice}</span>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {weatherState.hourly.time.slice(currentHourIdx, currentHourIdx + 48).map((timeStr, idx) => {
                      const actualIdx = currentHourIdx + idx;
                      const date = new Date(timeStr);
                      const hourNum = date.getHours();
                      const isHourDay = hourNum >= 6 && hourNum < 18 ? 1 : 0;
                      const hourStr = date.toLocaleTimeString(lang === 'bn' ? 'bn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN', {
                        hour: 'numeric',
                        hour12: true
                      });
                      const wCode = weatherState.hourly.weather_code[actualIdx];
                      const temp = Math.round(weatherState.hourly.temperature_2m[actualIdx]);
                      const pop = weatherState.hourly.precipitation_probability[actualIdx] || 0;
                      const isNow = idx === 0;

                      return (
                        <div
                          key={timeStr}
                          className={`min-w-[85px] p-3 rounded-2xl border flex flex-col items-center justify-between text-center shrink-0 ${
                            isNow
                              ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/50'
                          }`}
                        >
                          <span className={`text-[11px] font-bold ${isNow ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                            {isNow ? t.todayLabel : hourStr}
                          </span>
                          <span className="text-xl my-1.5">{getWmoInfo(wCode, isHourDay).icon}</span>
                          <span className={`text-base font-black ${isNow ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                            {fn(temp)}°
                          </span>
                          {pop > 0 && (
                            <span className={`text-[10px] font-bold mt-1 ${isNow ? 'text-blue-200' : 'text-blue-600 dark:text-blue-400'}`}>
                              💧 {fn(pop)}%
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 10-Day Extended Daily Forecast */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white/92 dark:bg-slate-900/92 border border-white/60 dark:border-white/10 shadow-lg flex flex-col gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{t.extended10Day}</span>

                  {weatherState.daily.time.map((dStr, idx) => {
                    const date = new Date(dStr);
                    const isToday = idx === 0;
                    const isTomorrow = idx === 1;
                    const dayLabel = isToday
                      ? t.todayLabel
                      : isTomorrow
                      ? t.tomorrowLabel
                      : date.toLocaleDateString(lang === 'bn' ? 'bn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        });
                    const wCode = weatherState.daily.weather_code[idx];
                    const maxT = Math.round(weatherState.daily.temperature_2m_max[idx]);
                    const minT = Math.round(weatherState.daily.temperature_2m_min[idx]);
                    const pop = weatherState.daily.precipitation_probability_max[idx] || 0;
                    const rain = weatherState.daily.precipitation_sum[idx] || 0;

                    return (
                      <div
                        key={dStr}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 w-40 sm:w-52">
                          <span className="text-xl shrink-0">{getWmoInfo(wCode, 1).icon}</span>
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">{dayLabel}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                              {translateWeatherCondition(wCode, lang)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-1 max-w-xs justify-center">
                          {pop > 0 && (
                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 font-mono">
                              💧 {fn(pop)}% {rain > 0 ? `(${fn(rain.toFixed(1))}mm)` : ''}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                          <span className="font-black text-slate-900 dark:text-slate-100">{fn(maxT)}°</span>
                          <span className="text-slate-400">/</span>
                          <span className="font-semibold text-slate-500 dark:text-slate-400">{fn(minT)}°</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: MAP */}
            {activeTab === 'map' && (
              <div className="flex flex-col gap-4">
                <WeatherMap
                  lat={weatherState.loc.lat}
                  lon={weatherState.loc.lon}
                  placeName={weatherState.loc.name}
                  windSpeed={weatherState.current.wind_speed_10m}
                  cloudCover={weatherState.current.cloud_cover}
                  rainNow={weatherState.current.precipitation}
                  hourlyTimes={mapSlices.times}
                  hourlyRain={mapSlices.rain}
                  hourlyWind={mapSlices.wind}
                  hourlyCloud={mapSlices.cloud}
                  hourlyTemp={mapSlices.temp}
                  lang={lang}
                />
              </div>
            )}

            {/* TAB 4: 3D SKY SIMULATOR & CELESTIAL TRACK */}
            {activeTab === 'sky' && astroSnapshot && (
              <div className="flex flex-col gap-4">
                <div className="p-2 sm:p-2.5 rounded-2xl bg-white/92 dark:bg-slate-900/92 border border-white/50 dark:border-white/10 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Sparkles size={16} className="text-amber-500" />
                    <span>{t.skyTitle}</span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSkySubView('3d')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        skySubView === '3d' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      3D Simulator
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkySubView('2d')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        skySubView === '2d' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      2D Sun Track
                    </button>
                  </div>
                </div>

                {skySubView === '3d' ? (
                  <Celestial3DView
                    lat={weatherState.loc.lat}
                    lon={weatherState.loc.lon}
                    placeName={weatherState.loc.name}
                    lang={lang}
                  />
                ) : (
                  <SunMoonView
                    lat={weatherState.loc.lat}
                    lon={weatherState.loc.lon}
                    placeName={weatherState.loc.name}
                    astro={astroSnapshot}
                    sunriseTime={weatherState.daily.sunrise[0]}
                    sunsetTime={weatherState.daily.sunset[0]}
                    lang={lang}
                  />
                )}
              </div>
            )}

            {/* TAB 5: FARM & AGRICULTURE PLANNER */}
            {activeTab === 'farm' && (
              <div className="flex flex-col gap-4">
                <FarmPlanner weatherState={weatherState} lang={lang} />
              </div>
            )}

            {/* TAB 6: CALENDAR (PANCHANGA & REGIONAL BENGALI CALENDAR) */}
            {activeTab === 'calendar' && (
              <div className="flex flex-col gap-4">
                <PanchangaCalendar weatherState={weatherState} lang={lang} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile Touch Bottom Bar (Localized) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 py-1.5 px-1 flex items-center justify-around shadow-2xl">
        {(
          [
            { id: 'today', label: t.tabToday, icon: Sun },
            { id: 'forecast', label: t.tabForecast, icon: CloudRain },
            { id: 'map', label: t.tabMap, icon: Layers },
            { id: 'sky', label: t.tabSky, icon: Sparkles },
            { id: 'farm', label: t.tabFarm, icon: Tractor },
            { id: 'calendar', label: t.tabCalendar, icon: CalendarIcon }
          ] as const
        ).map((tItem) => {
          const Icon = tItem.icon;
          const isActive = activeTab === tItem.id;
          return (
            <button
              key={tItem.id}
              type="button"
              onClick={() => setActiveTab(tItem.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-colors min-w-[48px] cursor-pointer ${
                isActive ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-600 dark:text-slate-400 font-semibold'
              }`}
            >
              <Icon size={19} />
              <span className="text-[10px] mt-0.5 truncate max-w-[56px]">{tItem.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Info Modal */}
      {isInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>⛅</span>
                <span>{t.infoTitle}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsInfoOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <b>Aakash</b> combines real-time Open-Meteo numerical weather prediction (~11km resolution), CAMS air quality models, RainViewer radar, and IMD (India Meteorological Department) station thresholds with high-precision astronomical solar/lunar ephemeris and Surya Siddhanta Panjika calculations.
            </p>
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-xs text-blue-900 dark:text-blue-200 font-medium">
              {t.emergencyHelplines} <b>{t.imdMausam}</b> · <b>{t.ndmaSachet}</b> · <b>{t.emergencyNum}</b>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
