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
  Heart,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  Clock,
  Waves,
  RefreshCw,
  CheckCircle2,
  X
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
  getBeaufortScale,
  getImdRainCategory,
  generateSkySentence,
  computeAstroSnapshot,
  cacheWeatherData,
  getCachedWeatherData,
  searchLocationSuggestions,
  KNOWN_INDIAN_LOCATIONS
} from '../services/weatherService';
import { LangId, TRANSLATIONS, translateWeatherCondition } from '../services/weatherTranslations';
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
  const loadWeatherForLocation = useCallback(async (loc: LocationData) => {
    setLoading(true);
    setErrorMsg(null);
    setSuggestions([]);
    setIsSearchFocused(false);

    try {
      // 1. Check instant cache
      const cached = getCachedWeatherData(loc.lat, loc.lon, false);
      if (cached) {
        setWeatherState(cached.state);
        setLoading(false);
      }

      // 2. Fetch fresh weather
      const data = await fetchFullWeather(loc.lat, loc.lon);
      const fullState: WeatherState = {
        loc,
        ...data,
        fetchedAt: new Date()
      };
      setWeatherState(fullState);
      cacheWeatherData(loc, fullState);
      localStorage.setItem('aakash_last_place', JSON.stringify(loc));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(t.fetchFailed);
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Load weather for a query (name or 6-digit PIN)
  const handleSearch = useCallback(async (q: string) => {
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
    } catch (err: any) {
      console.error(err);
      setErrorMsg(t.fetchFailed);
      setLoading(false);
    }
  }, [loadWeatherForLocation, t]);

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
    }, 200);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [queryInput]);

  // GPS geolocation handler with cache
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
        setErrorMsg('GPS location access denied or unavailable. Please search by name or 6-digit PIN.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [loadWeatherForLocation, t]);

  // Initial Boot: Load last place or default (Kolkata) with local cache
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
        if (saved) {
          loc = JSON.parse(saved);
        }
      } catch {}

      // Instant cache retrieval to prevent lag on initial load
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

  // Weather-Adaptive Dynamic Background Style (Luminous in Light Mode, Never Pitch Black!)
  const weatherBackgroundStyle = useMemo(() => {
    if (!weatherState) {
      return theme === 'light'
        ? {
            backgroundImage: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 35%, #38bdf8 70%, #60a5fa 100%)',
            backgroundSize: '200% 200%'
          }
        : {
            backgroundImage: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)',
            backgroundSize: '200% 200%'
          };
    }
    const w = weatherState.current.weather_code;
    const isDay = weatherState.current.is_day === 1;

    if (theme === 'light') {
      // Light Mode: ALWAYS luminous and atmospheric, NEVER pitch black!
      if (w === 0 || w === 1) {
        return isDay
          ? {
              backgroundImage: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 35%, #38bdf8 70%, #60a5fa 100%)',
              backgroundSize: '200% 200%'
            }
          : {
              // Nighttime in light mode: fresh soft twilight sky blue
              backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 40%, #60a5fa 75%, #93c5fd 100%)',
              backgroundSize: '200% 200%'
            };
      }
      if (w === 2 || w === 3) {
        return {
          backgroundImage: 'linear-gradient(135deg, #475569 0%, #60a5fa 40%, #93c5fd 75%, #e2e8f0 100%)',
          backgroundSize: '200% 200%'
        };
      }
      if ((w >= 51 && w <= 67) || (w >= 80 && w <= 82)) {
        return {
          backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 45%, #60a5fa 75%, #93c5fd 100%)',
          backgroundSize: '200% 200%'
        };
      }
      if (w >= 95 && w <= 99) {
        return {
          backgroundImage: 'linear-gradient(135deg, #312e81 0%, #2563eb 50%, #60a5fa 100%)',
          backgroundSize: '200% 200%'
        };
      }
      return {
        backgroundImage: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 50%, #60a5fa 100%)',
        backgroundSize: '200% 200%'
      };
    } else {
      // Dark Mode: Deep cosmic night
      if (w === 0 || w === 1) {
        return isDay
          ? {
              backgroundImage: 'linear-gradient(135deg, #082f49 0%, #0369a1 45%, #0c4a6e 80%, #0284c7 100%)',
              backgroundSize: '200% 200%'
            }
          : {
              backgroundImage: 'linear-gradient(140deg, #030712 0%, #0f172a 40%, #1e1b4b 75%, #312e81 100%)',
              backgroundSize: '200% 200%'
            };
      }
      if (w === 2 || w === 3) {
        return {
          backgroundImage: 'linear-gradient(135deg, #020617 0%, #0f172a 45%, #1e293b 85%, #334155 100%)',
          backgroundSize: '200% 200%'
        };
      }
      if ((w >= 51 && w <= 67) || (w >= 80 && w <= 82)) {
        return {
          backgroundImage: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 85%, #172554 100%)',
          backgroundSize: '200% 200%'
        };
      }
      return {
        backgroundImage: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)',
        backgroundSize: '200% 200%'
      };
    }
  }, [weatherState, theme]);

  // Astro snapshot for current location and time
  const astroSnapshot = useMemo(() => {
    if (!weatherState) return null;
    return computeAstroSnapshot(new Date(), weatherState.loc.lat, weatherState.loc.lon);
  }, [weatherState]);

  // Current hour index in hourly arrays
  const currentHourIdx = useMemo(() => {
    if (!weatherState) return 0;
    const nowIso = weatherState.current.time.slice(0, 13) + ':00';
    const idx = weatherState.hourly.time.findIndex((timeStr) => timeStr >= nowIso);
    return idx < 0 ? 0 : idx;
  }, [weatherState]);

  // Humidex
  const humidexVal = useMemo(() => {
    if (!weatherState) return null;
    const dew = weatherState.hourly.dew_point_2m[currentHourIdx];
    return calculateHumidex(weatherState.current.temperature_2m, dew);
  }, [weatherState, currentHourIdx]);

  // Beaufort
  const beaufort = useMemo(() => {
    if (!weatherState) return { scale: 0, description: 'Calm' };
    return getBeaufortScale(weatherState.current.wind_speed_10m);
  }, [weatherState]);

  // IMD Rain
  const imdRain = useMemo(() => {
    if (!weatherState) return { label: 'No Rain', badgeCls: '' };
    const todayRain = weatherState.daily.precipitation_sum[0] || 0;
    return getImdRainCategory(todayRain);
  }, [weatherState]);

  // Natural Sky Sentence
  const skySentence = useMemo(() => {
    if (!weatherState || !astroSnapshot) return '';
    const rainNext6h = weatherState.hourly.precipitation.slice(currentHourIdx, currentHourIdx + 6).reduce((a, b) => a + (b || 0), 0);
    return generateSkySentence(
      weatherState.current.temperature_2m,
      weatherState.current.apparent_temperature,
      weatherState.current.weather_code,
      rainNext6h,
      weatherState.current.wind_gusts_10m,
      astroSnapshot.sunAltitude
    );
  }, [weatherState, currentHourIdx, astroSnapshot]);

  // Translated Condition label
  const currentConditionLabel = useMemo(() => {
    if (!weatherState) return '';
    return translateWeatherCondition(weatherState.current.weather_code, lang);
  }, [weatherState, lang]);

  return (
    <div
      style={weatherBackgroundStyle}
      className="min-h-screen w-full flex flex-col font-sans select-none text-slate-800 dark:text-slate-100 transition-all duration-700 pb-24 md:pb-8 relative overflow-x-hidden"
    >
      {/* Living Atmospheric Animation (Drifting Clouds, Sunlight Shimmer, Rain) */}
      {weatherState && (
        <WeatherAnimations
          weatherCode={weatherState.current.weather_code}
          isDay={weatherState.current.is_day}
          precipitation={weatherState.current.precipitation}
          enabled={animationsEnabled}
        />
      )}

      {/* Top Header Bar with Enhanced Autocomplete Search */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-white/40 dark:border-white/10 px-3 py-2 sm:px-6 shadow-lg flex flex-col gap-2">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-2 sm:gap-3">
          {/* Logo & Back button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-1.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title={t.returnToHub}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1">
              <span className="text-xl">⛅</span>
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {t.appName}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 hidden sm:inline">
                {t.badge}
              </span>
            </div>
          </div>

          {/* Search Bar with Instant Autocomplete Dropdown */}
          <div className="relative flex items-center gap-1 sm:gap-1.5 flex-1 max-w-sm sm:max-w-md mx-1">
            <div className="flex items-center flex-1 bg-white/70 dark:bg-slate-800/70 rounded-full border border-white/60 dark:border-slate-700/60 px-2.5 py-1 sm:py-1.5 focus-within:ring-2 focus-within:ring-blue-500 transition-all backdrop-blur-md">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search city or PIN..."
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
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 shadow-md transition-colors cursor-pointer"
            >
              {t.searchBtn}
            </button>
            <button
              type="button"
              onClick={handleGpsLocation}
              className="p-1.5 sm:p-2 rounded-full bg-white/70 dark:bg-slate-800/70 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-white/60 dark:border-slate-700 transition-colors shrink-0 cursor-pointer backdrop-blur-md"
              title={t.gpsBtnTitle}
            >
              <Compass size={15} />
            </button>

            {/* Suggestions Dropdown */}
            {isSearchFocused && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-10 mt-1 bg-white/95 dark:bg-slate-900/95 border border-white/50 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onMouseDown={() => {
                      setQueryInput(s.name);
                      loadWeatherForLocation(s);
                    }}
                    className="p-2.5 hover:bg-blue-50/80 dark:hover:bg-slate-800/80 flex items-center justify-between text-xs cursor-pointer border-b border-slate-100 dark:border-slate-800/50 last:border-none"
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

          {/* Theme Toggle & Multilingual Selector */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 sm:p-2 rounded-xl bg-white/70 dark:bg-slate-800/70 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-white/60 dark:border-slate-700/60 backdrop-blur-md"
              title={t.toggleThemeTitle}
            >
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-700" />}
            </button>

            <select
              value={lang}
              onChange={(e) => handleSetLang(e.target.value as LangId)}
              className="text-xs font-bold py-1.5 px-2 rounded-xl bg-white/70 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 border border-white/60 dark:border-slate-700 outline-none cursor-pointer backdrop-blur-md"
              title={t.languageTitle}
            >
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
              <option value="hi">हिन्दी</option>
            </select>

            <button
              type="button"
              onClick={() => setIsInfoOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer hidden sm:inline"
              title={t.infoTitle}
            >
              <Info size={16} />
            </button>
          </div>
        </div>

        {/* Quick Search Chips Bar (Short & Instant) */}
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between text-xs pt-1 border-t border-white/40 dark:border-white/10 gap-2">
          {weatherState ? (
            <div className="flex items-center gap-1.5 truncate">
              <MapPin size={13} className="text-rose-500 shrink-0" />
              <span className="font-black text-slate-900 dark:text-white truncate">{weatherState.loc.name}</span>
              <span className="truncate hidden sm:inline text-slate-600 dark:text-slate-300">({weatherState.loc.region})</span>
            </div>
          ) : <div />}

          {/* Quick-Pick Popular City Chips */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {['Kolkata', 'Bishnupur', 'New Delhi', 'Mumbai', 'Bengaluru', 'Patna'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleSearch(city)}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/60 dark:bg-slate-800/60 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0 border border-white/40 dark:border-slate-700/50"
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
          <div className="p-3.5 rounded-2xl bg-rose-500/90 text-white font-medium text-xs flex items-center justify-between shadow-lg backdrop-blur-md">
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
          <div className="p-8 sm:p-12 rounded-3xl bg-white/75 dark:bg-slate-900/75 border border-white/40 dark:border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col items-center justify-center gap-3">
            <RefreshCw size={28} className="text-blue-600 dark:text-blue-400 animate-spin" />
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">
              Loading authentic observation data...
            </span>
          </div>
        )}

        {!loading && weatherState && (
          <>
            {/* Desktop & Tablet Tabs Header with Short Names */}
            <div className="hidden md:flex items-center justify-between border-b border-white/40 dark:border-white/10 pb-2">
              <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 p-1 rounded-2xl border border-white/50 dark:border-white/10 backdrop-blur-2xl shadow-lg">
                {(
                  [
                    { id: 'today', label: 'Today', icon: Sun },
                    { id: 'forecast', label: 'Forecast', icon: CloudRain },
                    { id: 'map', label: 'Map', icon: Layers },
                    { id: 'sky', label: '3D Sky', icon: Sparkles },
                    { id: 'farm', label: 'Farm', icon: Tractor },
                    { id: 'calendar', label: 'Calendar', icon: CalendarIcon }
                  ] as const
                ).map((tItem) => {
                  const Icon = tItem.icon;
                  const isActive = activeTab === tItem.id;
                  return (
                    <button
                      key={tItem.id}
                      type="button"
                      onClick={() => setActiveTab(tItem.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tItem.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB 1: TODAY */}
            {activeTab === 'today' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                {/* Hero Liquid Glass Weather Card */}
                <div className="p-4 sm:p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-white/50 dark:border-white/10 shadow-[0_12px_40px_0_rgba(0,0,0,0.18)] relative overflow-hidden backdrop-blur-2xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Now</span>
                      </div>
                      <div className="flex items-baseline gap-3 mt-1">
                        <span className="text-5xl sm:text-7xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                          {Math.round(weatherState.current.temperature_2m)}°
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span>{getWmoInfo(weatherState.current.weather_code).icon}</span>
                            <span>{currentConditionLabel}</span>
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                            {t.feelsLike} {Math.round(weatherState.current.apparent_temperature)}°C · {t.humidex} {humidexVal ?? '--'}°C
                          </span>
                        </div>
                      </div>

                      <p className="mt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium max-w-2xl leading-relaxed">
                        {skySentence}
                      </p>
                    </div>

                    {/* Quick Metrics Bento Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
                      <div className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/40 dark:border-slate-700/50 flex flex-col shadow-xs">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <Droplets size={12} className="text-blue-500" /> Humidity
                        </span>
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {Math.round(weatherState.current.relative_humidity_2m)}%
                        </span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/40 dark:border-slate-700/50 flex flex-col shadow-xs">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <Wind size={12} className="text-teal-500" /> Wind
                        </span>
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {Math.round(weatherState.current.wind_speed_10m)} km/h
                        </span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/40 dark:border-slate-700/50 flex flex-col shadow-xs">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <Gauge size={12} className="text-purple-500" /> Pressure
                        </span>
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {Math.round(weatherState.current.pressure_msl)} hPa
                        </span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/40 dark:border-slate-700/50 flex flex-col shadow-xs">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <Eye size={12} className="text-amber-500" /> UV Index
                        </span>
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {weatherState.daily.uv_index_max[0] || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* IMD Ground Station Card */}
                {weatherState.imd && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-white/50 dark:border-white/10 shadow-lg backdrop-blur-2xl flex flex-col gap-3">
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
                            Observation source: {weatherState.imd.source}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 self-start sm:self-auto">
                        ঋতু: {weatherState.imd.bengaliSeason}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-slate-500 block mb-0.5">Rainfall Category</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          {weatherState.imd.rainfallCategory}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-slate-500 block mb-0.5">Heatwave Level</span>
                        <span className="font-bold text-emerald-600 block">
                          {weatherState.imd.heatAlertText}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-slate-500 block mb-0.5">Monsoon Phase</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          {weatherState.imd.monsoonStatus}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 font-medium">
                      <b>IMD Advisory:</b> {weatherState.imd.districtAdvisory}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FORECAST (Short mobile-friendly titles) */}
            {activeTab === 'forecast' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                {/* 48-Hour Scrollable Hourly Cards */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-white/50 dark:border-white/10 shadow-lg backdrop-blur-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                      48h Timeline
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Scroll &rarr;
                    </span>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {weatherState.hourly.time.slice(currentHourIdx, currentHourIdx + 48).map((timeStr, idx) => {
                      const actualIdx = currentHourIdx + idx;
                      const date = new Date(timeStr);
                      const hourStr = date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
                      const wCode = weatherState.hourly.weather_code[actualIdx];
                      const temp = Math.round(weatherState.hourly.temperature_2m[actualIdx]);
                      const pop = weatherState.hourly.precipitation_probability[actualIdx] || 0;
                      const isNow = idx === 0;

                      return (
                        <div
                          key={timeStr}
                          className={`min-w-[85px] p-3 rounded-2xl border flex flex-col items-center justify-between text-center shrink-0 transition-all ${
                            isNow
                              ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-500/30'
                              : 'bg-white/60 dark:bg-slate-800/40 border-white/40 dark:border-slate-700/50 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                          }`}
                        >
                          <span className={`text-[11px] font-bold ${isNow ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                            {isNow ? 'Now' : hourStr}
                          </span>
                          <span className="text-xl my-1.5">{getWmoInfo(wCode).icon}</span>
                          <span className={`text-base font-black ${isNow ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                            {temp}°
                          </span>
                          {pop > 0 && (
                            <span className={`text-[10px] font-bold mt-1 ${isNow ? 'text-blue-200' : 'text-blue-600 dark:text-blue-400'}`}>
                              💧 {pop}%
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 10-Day Extended Daily Forecast */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-white/50 dark:border-white/10 shadow-lg backdrop-blur-2xl flex flex-col gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                    10-Day Forecast
                  </span>

                  {weatherState.daily.time.map((dStr, idx) => {
                    const date = new Date(dStr);
                    const isToday = idx === 0;
                    const isTomorrow = idx === 1;
                    const dayLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : date.toLocaleDateString(lang === 'bn' ? 'bn-IN' : 'en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
                    const wCode = weatherState.daily.weather_code[idx];
                    const maxT = Math.round(weatherState.daily.temperature_2m_max[idx]);
                    const minT = Math.round(weatherState.daily.temperature_2m_min[idx]);
                    const pop = weatherState.daily.precipitation_probability_max[idx] || 0;
                    const rain = weatherState.daily.precipitation_sum[idx] || 0;

                    return (
                      <div
                        key={dStr}
                        className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-white/40 dark:border-slate-700/50 flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-center gap-2.5 w-36 sm:w-48">
                          <span className="text-xl shrink-0">{getWmoInfo(wCode).icon}</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {dayLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-1 max-w-xs justify-center">
                          {pop > 0 && (
                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 font-mono">
                              💧 {pop}% {rain > 0 ? `(${rain.toFixed(1)}mm)` : ''}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                          <span className="font-black text-slate-900 dark:text-slate-100">{maxT}°</span>
                          <span className="text-slate-400">/</span>
                          <span className="font-semibold text-slate-500 dark:text-slate-400">{minT}°</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: MAP (100% Free OpenStreetMap & Esri Tiles) */}
            {activeTab === 'map' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                <WeatherMap
                  lat={weatherState.loc.lat}
                  lon={weatherState.loc.lon}
                  placeName={weatherState.loc.name}
                  windSpeed={weatherState.current.wind_speed_10m}
                  cloudCover={weatherState.current.cloud_cover}
                  rainNow={weatherState.current.precipitation}
                  hourlyTimes={weatherState.hourly.time.slice(currentHourIdx, currentHourIdx + 25)}
                  hourlyRain={weatherState.hourly.precipitation.slice(currentHourIdx, currentHourIdx + 25)}
                  hourlyWind={weatherState.hourly.wind_speed_10m.slice(currentHourIdx, currentHourIdx + 25)}
                  hourlyCloud={weatherState.hourly.cloud_cover.slice(currentHourIdx, currentHourIdx + 25)}
                  hourlyTemp={weatherState.hourly.temperature_2m.slice(currentHourIdx, currentHourIdx + 25)}
                  lang={lang}
                />
              </div>
            )}

            {/* TAB 4: 3D SKY SIMULATOR & CELESTIAL TRACK */}
            {activeTab === 'sky' && astroSnapshot && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                <div className="p-2 sm:p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-white/50 dark:border-white/10 shadow-md backdrop-blur-2xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Sparkles size={16} className="text-amber-500" />
                    <span>Astronomy</span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSkySubView('3d')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        skySubView === '3d'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-white'
                      }`}
                    >
                      3D Simulator
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkySubView('2d')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        skySubView === '2d'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-white'
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
              <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                <FarmPlanner weatherState={weatherState} lang={lang} />
              </div>
            )}

            {/* TAB 6: CALENDAR (PANCHANGA & REGIONAL BENGALI CALENDAR) */}
            {activeTab === 'calendar' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                <PanchangaCalendar weatherState={weatherState} lang={lang} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile Touch Bottom Bar with Concise Short Names */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border-t border-white/40 dark:border-white/10 py-1.5 px-1 flex items-center justify-around shadow-2xl">
        {(
          [
            { id: 'today', label: 'Now', icon: Sun },
            { id: 'forecast', label: 'Forecast', icon: CloudRain },
            { id: 'map', label: 'Map', icon: Layers },
            { id: 'sky', label: '3D Sky', icon: Sparkles },
            { id: 'farm', label: 'Farm', icon: Tractor },
            { id: 'calendar', label: 'Cal', icon: CalendarIcon }
          ] as const
        ).map((tItem) => {
          const Icon = tItem.icon;
          const isActive = activeTab === tItem.id;
          return (
            <button
              key={tItem.id}
              type="button"
              onClick={() => setActiveTab(tItem.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all min-w-[48px] cursor-pointer ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-black scale-105'
                  : 'text-slate-600 dark:text-slate-400 font-semibold'
              }`}
            >
              <Icon size={19} />
              <span className="text-[10px] mt-0.5">{tItem.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Info Modal */}
      {isInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white/95 dark:bg-slate-900/95 border border-white/50 dark:border-white/10 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-3">
              <span className="text-base font-black text-slate-900 dark:text-slate-100">
                About AAKASH Weather
              </span>
              <button
                type="button"
                onClick={() => setIsInfoOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-col gap-2 leading-relaxed">
              <p>
                <b>Authentic IMD Data:</b> Ground station observations from India Meteorological Department (mausam.imd.gov.in).
              </p>
              <p>
                <b>100% Free Open Maps:</b> OpenStreetMap and Esri World imagery with zero API keys.
              </p>
              <p>
                <b>3D Celestial Simulator:</b> Real-time astronomical model showing actual planetary positions and Moon shadows on Earth.
              </p>
              <p>
                <b>Enhanced Farm Planner:</b> Crop-specific spray windows, disease alerts, and FAO-56 water balance matrix.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsInfoOpen(false)}
              className="w-full py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer mt-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
